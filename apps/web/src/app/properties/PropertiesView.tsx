'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { fetchApi } from '@/lib/api';
import { AISearch } from '@/components/AISearch';
import {
  DebugPanel,
  EmptyState,
  ErrorState,
  PropertyGrid,
  SkeletonGrid,
  SkeletonGridMore,
  type ListingProperty,
} from '@/components/property/PropertyListingBlocks';
import {
  mapUnknownToListingProperty,
  parsePropertiesPageResponse,
} from '@/utils/parsePropertiesApi';
import { MOCK_PROPERTIES } from '@/utils/mockProperties';
import { PropertyMap } from '@/components/property/PropertyMap';
import { Grid3X3, Map, MapPin, RefreshCw, SlidersHorizontal, X } from 'lucide-react';

const PriceTrendChart = dynamic(
  () => import('./PriceTrendChart').then((m) => m.PriceTrendChart),
  {
    ssr: false,
    loading: () => <div className="mt-2 h-48 animate-pulse rounded-lg bg-white/5" />,
  },
);

/** URL uses country codes (IND/UAE/USA) or `all`; UUIDs still work via countryId query on the API. */
const COUNTRY_OPTIONS: { code: string; label: string }[] = [
  { code: 'IND', label: 'India (INR)' },
  { code: 'UAE', label: 'UAE (AED)' },
  { code: 'USA', label: 'USA (USD)' },
  { code: 'all', label: 'All' },
];

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type CountryFilter =
  | { kind: 'all' }
  | { kind: 'code'; code: string }
  | { kind: 'id'; id: string };

function parseCountryFilter(raw: string | null): CountryFilter {
  if (!raw) return { kind: 'code', code: 'IND' };
  if (raw === 'all') return { kind: 'all' };
  if (UUID_RE.test(raw)) return { kind: 'id', id: raw };
  return { kind: 'code', code: raw.toUpperCase() };
}

function filterToQueryParam(f: CountryFilter): string {
  if (f.kind === 'all') return 'all';
  if (f.kind === 'id') return f.id;
  return f.code;
}

function MapLoadingSkeleton() {
  return (
    <div className="w-full h-[500px] rounded-2xl animate-pulse bg-white/5 flex items-center justify-center">
      <div className="text-slate-500">Loading map...</div>
    </div>
  );
}

const FILTER_KEYS = [
  'minPrice',
  'maxPrice',
  'minBedrooms',
  'maxBedrooms',
  'city',
  'minLat',
  'maxLat',
  'minLng',
  'maxLng',
  'listingType',
] as const;

/** Grid: server-backed pages for infinite scroll */
const GRID_PAGE_SIZE = 20;
/** Map: single request cap (markers); keeps payload bounded */
const MAP_LIST_LIMIT = 400;

function hasStrictFilters(sp: ReturnType<typeof useSearchParams> | null): boolean {
  if (!sp) return false;
  return FILTER_KEYS.some((k) => !!sp.get(k)?.trim());
}

function buildListingParams(
  countryFilter: CountryFilter,
  sp: ReturnType<typeof useSearchParams> | null,
  relaxed: boolean,
  page: number,
  pageSize: number,
): URLSearchParams {
  const params = new URLSearchParams();
  params.set('limit', String(pageSize));
  params.set('page', String(page));
  if (countryFilter.kind === 'id') params.set('countryId', countryFilter.id);
  else if (countryFilter.kind === 'code') params.set('countryCode', countryFilter.code);
  if (!relaxed && sp) {
    for (const k of FILTER_KEYS) {
      const v = sp.get(k)?.trim();
      if (v) params.set(k, v);
    }
  }
  return params;
}

async function fetchPropertiesPayload(query: string): Promise<unknown> {
  return fetchApi<unknown>(`/properties?${query}`);
}

export function PropertiesView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams?.get('view') || 'grid';
  const countryParam = searchParams?.get('country') ?? null;
  const countryFilter = useMemo(() => parseCountryFilter(countryParam), [countryParam]);
  const listingFilterKey = useMemo(() => {
    if (countryFilter.kind === 'all') return 'all';
    if (countryFilter.kind === 'id') return `id:${countryFilter.id}`;
    return `code:${countryFilter.code}`;
  }, [countryFilter]);

  const [properties, setProperties] = useState<ListingProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [staggerFromIndex, setStaggerFromIndex] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [relaxedMatch, setRelaxedMatch] = useState(false);
  const [reloadNonce, setReloadNonce] = useState(0);
  const [aiOverride, setAiOverride] = useState<{ items: ListingProperty[]; label: string } | null>(null);

  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;
  const countryFilterRef = useRef(countryFilter);
  countryFilterRef.current = countryFilter;
  const propertiesRef = useRef<ListingProperty[]>([]);
  propertiesRef.current = properties;
  const relaxedModeRef = useRef(false);
  const nextPageRef = useRef(2);
  const hasMoreRef = useRef(true);
  const loadingRef = useRef(false);
  const loadingMoreRef = useRef(false);
  const loadMoreRef = useRef<() => void>(() => {});
  const scrollSentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);
  useEffect(() => {
    loadingMoreRef.current = loadingMore;
  }, [loadingMore]);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [seedBusy, setSeedBusy] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);
  const [seedError, setSeedError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [insight, setInsight] = useState<{
    listings: number;
    avgPrice: number;
    avgYield: number;
    avgAiScore: number;
    avgTrustScore: number;
  } | null>(null);
  const [trendPoints, setTrendPoints] = useState<{ label: string; avgAsk: number }[]>([]);

  const countryQuery = filterToQueryParam(countryFilter);
  const cityFilter = searchParams?.get('city')?.trim() ?? '';

  const filterSig = useMemo(() => {
    const sp = searchParams;
    const o: Record<string, string> = {};
    for (const k of FILTER_KEYS) {
      const v = sp?.get(k);
      if (v) o[k] = v;
    }
    return JSON.stringify(o);
  }, [searchParams]);

  const fetchKey = useMemo(
    () => `${listingFilterKey}|${filterSig}|${reloadNonce}`,
    [listingFilterKey, filterSig, reloadNonce],
  );

  useEffect(() => {
    setAiOverride(null);
  }, [countryParam]);

  useEffect(() => {
    if (aiOverride) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    relaxedModeRef.current = false;
    nextPageRef.current = 2;
    setHasMore(true);
    setStaggerFromIndex(undefined);

    (async () => {
      setLoading(true);
      setError(null);
      setRelaxedMatch(false);
      setUsingMockData(false);
      setProperties([]);

      const sp = searchParamsRef.current;
      const cf = countryFilterRef.current;
      const pageSize = view === 'map' ? MAP_LIST_LIMIT : GRID_PAGE_SIZE;

      try {
        const strictQ = buildListingParams(cf, sp, false, 1, pageSize).toString();
        if (process.env.NODE_ENV === 'development') {
          console.log('[properties] fetching:', strictQ);
        }
        let raw = await fetchPropertiesPayload(strictQ);
        if (cancelled) return;
        let parsed = parsePropertiesPageResponse(raw);
        let list = parsed.items.map(mapUnknownToListingProperty);

        if (list.length === 0 && hasStrictFilters(sp)) {
          const looseQ = buildListingParams(cf, sp, true, 1, pageSize).toString();
          raw = await fetchPropertiesPayload(looseQ);
          if (cancelled) return;
          parsed = parsePropertiesPageResponse(raw);
          list = parsed.items.map(mapUnknownToListingProperty);
          if (list.length > 0) {
            setRelaxedMatch(true);
            relaxedModeRef.current = true;
          }
        }

        if (process.env.NODE_ENV === 'development') {
          console.log('API DATA (normalized count):', list.length, 'hasMore:', parsed.hasMore);
        }
        setProperties(list);
        if (view === 'map') {
          setHasMore(false);
        } else {
          setHasMore(parsed.hasMore);
        }
        nextPageRef.current = 2;
      } catch (err) {
        if (cancelled) return;
        console.error('Fetch error:', err);
        setError('Failed to load properties');
        setProperties([...MOCK_PROPERTIES] as unknown as ListingProperty[]);
        setUsingMockData(true);
        setHasMore(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchKey, view, aiOverride]);

  const loadMore = useCallback(async () => {
    if (view !== 'grid' || aiOverride) return;
    if (!hasMoreRef.current || loadingMoreRef.current || loadingRef.current) return;

    const sp = searchParamsRef.current;
    const cf = countryFilterRef.current;
    const pageNum = nextPageRef.current;
    const startIdx = propertiesRef.current.length;

    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const q = buildListingParams(cf, sp, relaxedModeRef.current, pageNum, GRID_PAGE_SIZE).toString();
      const raw = await fetchPropertiesPayload(q);
      const parsed = parsePropertiesPageResponse(raw);
      const batch = parsed.items.map(mapUnknownToListingProperty);
      setStaggerFromIndex(startIdx);
      setProperties((prev) => {
        const existing = new Set(prev.map((p) => p.id));
        const appended = batch.filter((p) => !existing.has(p.id));
        return appended.length === 0 ? prev : [...prev, ...appended];
      });
      setHasMore(parsed.hasMore);
      nextPageRef.current = pageNum + 1;
    } catch (e) {
      console.error(e);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [view, aiOverride]);

  useEffect(() => {
    loadMoreRef.current = () => {
      void loadMore();
    };
  }, [loadMore]);

  useEffect(() => {
    if (view !== 'grid' || aiOverride || usingMockData) return;
    const el = scrollSentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMoreRef.current();
      },
      { root: null, rootMargin: '400px', threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [fetchKey, view, aiOverride, usingMockData, properties.length, loading]);

  const insightCountryCode = countryFilter.kind === 'code' ? countryFilter.code : '';

  useEffect(() => {
    if (!cityFilter) {
      setInsight(null);
      setTrendPoints([]);
      return;
    }
    const q = new URLSearchParams({ city: cityFilter });
    if (insightCountryCode) q.set('countryCode', insightCountryCode);
    void fetchApi<{
      listings: number;
      avgPrice: number;
      avgYield: number;
      avgAiScore: number;
      avgTrustScore: number;
    }>(`/properties/insights/locality?${q}`)
      .then((r) =>
        setInsight({
          listings: r.listings,
          avgPrice: r.avgPrice,
          avgYield: r.avgYield,
          avgAiScore: r.avgAiScore,
          avgTrustScore: r.avgTrustScore,
        }),
      )
      .catch(() => setInsight(null));
    void fetchApi<{ points: { label: string; avgAsk: number }[] }>(
      `/properties/insights/price-trends?${q}`,
    )
      .then((r) => setTrendPoints(r.points ?? []))
      .catch(() => setTrendPoints([]));
  }, [cityFilter, listingFilterKey, insightCountryCode]);

  const handleGenerateDemo = async () => {
    setSeedBusy(true);
    setSeedError(null);
    setSeedMessage(null);
    try {
      const res = await fetchApi<{ message?: string; properties?: number }>('/admin/seed', {
        method: 'POST',
        body: JSON.stringify({ mode: 'indiaRent' }),
      });
      setSeedMessage(res.message ?? 'India rent data ready.');
      setReloadNonce((n) => n + 1);
    } catch {
      setSeedError(
        'Could not generate data. Ensure the API is running and NEXT_PUBLIC_API_URL is correct, then try again or run npm run seed:data from the project root.',
      );
    } finally {
      setSeedBusy(false);
    }
  };

  const handleMarkerClick = useCallback((property: { id: string }) => {
    setHighlightedId(property.id);
  }, []);

  const applyAdvancedFilters = (form: FormData) => {
    const next = new URLSearchParams(searchParams?.toString() ?? '');
    for (const k of FILTER_KEYS) next.delete(k);
    for (const k of FILTER_KEYS) {
      const v = (form.get(k) as string)?.trim();
      if (v) next.set(k, v);
    }
    next.set('country', countryQuery);
    next.set('view', view);
    router.push(`/properties?${next.toString()}`);
  };

  const clearMapBounds = () => {
    const next = new URLSearchParams(searchParams?.toString() ?? '');
    next.delete('minLat');
    next.delete('maxLat');
    next.delete('minLng');
    next.delete('maxLng');
    next.set('country', countryQuery);
    next.set('view', view);
    router.push(`/properties?${next.toString()}`);
  };

  const fetchProperties = useCallback(() => {
    setReloadNonce((n) => n + 1);
  }, []);

  const listItems = aiOverride?.items ?? properties;
  const mapProperties = listItems;

  const debugSource = aiOverride
    ? 'ai-search'
    : usingMockData
      ? 'mock-fallback'
      : relaxedMatch
        ? 'api (relaxed filters)'
        : 'api';

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Global Properties</h1>
          <p className="mt-2 text-slate-500">AI-scored investment listings</p>
          <AISearch
            countryCode={countryFilter.kind === 'code' ? countryFilter.code : undefined}
            countryId={countryFilter.kind === 'id' ? countryFilter.id : undefined}
            onResults={(items, meta) => {
              setAiOverride({
                items: items.map((x) => mapUnknownToListingProperty(x)),
                label: (meta as { query?: string }).query ?? 'search',
              });
            }}
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={fetchProperties}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Reload data
            </button>
          </div>
          <DebugPanel count={listItems.length} source={debugSource} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            {COUNTRY_OPTIONS.map((opt) => {
              const active =
                (opt.code === 'all' && countryFilter.kind === 'all') ||
                (countryFilter.kind === 'code' && countryFilter.code === opt.code);
              return (
                <a
                  key={opt.code}
                  href={
                    opt.code === 'all'
                      ? `/properties?country=all&view=${view}`
                      : `/properties?country=${opt.code}&view=${view}`
                  }
                  className={`px-3 py-2 rounded-lg border text-sm transition ${
                    active
                      ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                      : 'border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </a>
              );
            })}
          </div>
          <a
            href={`/properties?country=${countryQuery}&view=grid`}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
              view !== 'map'
                ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                : 'border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Grid3X3 className="h-4 w-4" />
            Grid View
          </a>
          <a
            href={`/properties?country=${countryQuery}&view=map`}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
              view === 'map'
                ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                : 'border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Map className="h-4 w-4" />
            Map View
          </a>
          {view === 'map' && listItems.length > 0 && (
            <button
              type="button"
              onClick={() => setShowHeatmap((v) => !v)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                showHeatmap
                  ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                  : 'border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <MapPin className="h-4 w-4" />
              Heatmap
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition z-10 relative ${
              showFilters
                ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                : 'border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        </div>
      </div>

      {error && (
        <ErrorState message={error} usingMock={usingMockData} onRetry={fetchProperties} />
      )}

      {relaxedMatch && !aiOverride && (
        <div className="mt-4 rounded-lg border border-cyan-500/25 bg-cyan-950/30 px-4 py-3 text-sm text-cyan-100">
          No exact match. Showing nearby results (relaxed filters).
        </div>
      )}

      {showFilters && (
        <form
          className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4 z-10 relative"
          onSubmit={(e) => {
            e.preventDefault();
            applyAdvancedFilters(new FormData(e.currentTarget));
          }}
        >
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs text-slate-500 mb-1">City / locality</label>
              <input
                name="city"
                defaultValue={searchParams?.get('city') ?? ''}
                placeholder="e.g. Mumbai"
                className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white w-40"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Min price</label>
              <input
                name="minPrice"
                type="number"
                defaultValue={searchParams?.get('minPrice') ?? ''}
                className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white w-32"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Max price</label>
              <input
                name="maxPrice"
                type="number"
                defaultValue={searchParams?.get('maxPrice') ?? ''}
                className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white w-32"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">BHK min</label>
              <input
                name="minBedrooms"
                type="number"
                min={0}
                defaultValue={searchParams?.get('minBedrooms') ?? ''}
                className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white w-24"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">BHK max</label>
              <input
                name="maxBedrooms"
                type="number"
                min={0}
                defaultValue={searchParams?.get('maxBedrooms') ?? ''}
                className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white w-24"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Listing</label>
              <select
                name="listingType"
                defaultValue={searchParams?.get('listingType') ?? ''}
                className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white"
              >
                <option value="">Buy + Rent</option>
                <option value="sale">Buy only</option>
                <option value="rent">Rent only</option>
              </select>
            </div>
            <button
              type="submit"
              className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-400"
            >
              Apply filters
            </button>
          </div>
          {(searchParams?.get('minLat') || searchParams?.get('maxLat')) && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Map area filter active</span>
              <button
                type="button"
                onClick={clearMapBounds}
                className="inline-flex items-center gap-1 text-cyan-400 hover:underline"
              >
                <X className="h-3 w-3" /> Clear map bounds
              </button>
            </div>
          )}
        </form>
      )}

      {cityFilter && insight && (
        <div className="mt-6 grid gap-4 lg:grid-cols-2 z-10 relative">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-5">
            <h3 className="text-sm font-semibold text-emerald-300">Locality insights — {cityFilter}</h3>
            <p className="mt-1 text-xs text-slate-500">Aggregated from EstateX listings only (not scraped portals).</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-slate-500">Active listings</dt>
                <dd className="font-mono text-white">{insight.listings}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Avg ask</dt>
                <dd className="font-mono text-cyan-400">{Math.round(insight.avgPrice).toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Avg rental yield</dt>
                <dd className="font-mono text-emerald-400">{insight.avgYield.toFixed(2)}%</dd>
              </div>
              <div>
                <dt className="text-slate-500">Avg AI score</dt>
                <dd className="font-mono text-violet-300">{insight.avgAiScore.toFixed(0)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Avg trust score</dt>
                <dd className="font-mono text-amber-300">{insight.avgTrustScore.toFixed(0)}</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-sm font-semibold text-white">Price trend (indicative)</h3>
            <p className="mt-1 text-xs text-slate-500">Demo curve from current averages — not transaction history.</p>
            <PriceTrendChart data={trendPoints} />
          </div>
        </div>
      )}

      {aiOverride && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-violet-500/25 bg-violet-950/40 px-4 py-3 text-sm text-violet-200">
          <span>
            Showing AI results for &ldquo;{aiOverride.label}&rdquo; ({aiOverride.items.length} listings)
          </span>
          <button
            type="button"
            onClick={() => setAiOverride(null)}
            className="rounded-lg border border-violet-400/40 px-3 py-1 text-xs font-medium hover:bg-violet-500/20"
          >
            Clear AI filter
          </button>
        </div>
      )}

      {loading && !aiOverride && view === 'grid' && <SkeletonGrid />}

      {loading && !aiOverride && view === 'map' && (
        <div className="mt-8">
          <MapLoadingSkeleton />
        </div>
      )}

      {!loading && view === 'map' && (
        <div className="mt-8 relative">
          <div className="rounded-2xl border border-white/10 overflow-hidden">
            <PropertyMap
              properties={mapProperties}
              onMarkerClick={handleMarkerClick}
              highlightedId={highlightedId ?? undefined}
              showHeatmap={showHeatmap}
              enableDrawFilter
              onDrawBounds={(b) => {
                const next = new URLSearchParams(searchParams?.toString() ?? '');
                next.set('minLat', String(b.south));
                next.set('maxLat', String(b.north));
                next.set('minLng', String(b.west));
                next.set('maxLng', String(b.east));
                next.set('country', countryQuery);
                next.set('view', 'map');
                router.push(`/properties?${next.toString()}`);
              }}
            />
          </div>
          {listItems.length > 0 && (
            <div className="absolute bottom-6 left-6 right-6 z-20 md:right-auto md:w-80 max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-lg p-3 space-y-2 shadow-xl">
              <p className="text-xs text-slate-500 font-medium">Click marker to highlight</p>
              {listItems.slice(0, 8).map((p) => (
                <a
                  key={p.id}
                  href={`/property/${p.id}`}
                  className={`block p-2 rounded-lg transition ${
                    highlightedId === p.id ? 'bg-cyan-500/20 border border-cyan-500/50' : 'hover:bg-white/5'
                  }`}
                  onMouseEnter={() => setHighlightedId(p.id)}
                  onMouseLeave={() => setHighlightedId(null)}
                >
                  <p className="text-sm font-medium text-white truncate">{p.title}</p>
                  <p className="text-xs text-slate-500">{p.city}</p>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {!loading && view !== 'map' && !aiOverride && properties.length === 0 && !usingMockData && (
        <EmptyState>
          <p className="text-sm text-slate-500">
            Try clearing filters or &ldquo;Reload data&rdquo;. Load ~5,000 India rent listings via the API (needs server running).
          </p>
          {seedError && <p className="text-sm text-red-400 max-w-lg mx-auto">{seedError}</p>}
          {seedMessage && <p className="text-sm text-emerald-400 max-w-lg mx-auto">{seedMessage}</p>}
          <button
            type="button"
            onClick={() => void handleGenerateDemo()}
            disabled={seedBusy}
            className="rounded-xl bg-cyan-500 px-6 py-3 font-medium text-slate-950 hover:bg-cyan-400 disabled:opacity-50 transition"
          >
            {seedBusy ? 'Loading…' : 'Load 5K India rent (API)'}
          </button>
          <p className="text-xs text-slate-600">
            CLI (SQLite): <code className="text-slate-500">npm run seed:india-rent</code> · Full demo reset:{' '}
            <code className="text-slate-500">POST /admin/seed</code> with <code className="text-slate-500">{'{}'}</code>
          </p>
        </EmptyState>
      )}

      {!loading && view !== 'map' && aiOverride && listItems.length === 0 && (
        <div className="mt-8 rounded-xl border border-violet-500/20 bg-violet-950/20 px-4 py-6 text-center text-sm text-violet-200">
          No listings matched that AI search. Try different wording or{' '}
          <button type="button" onClick={() => setAiOverride(null)} className="text-cyan-400 underline">
            clear AI filter
          </button>
          .
        </div>
      )}

      {!loading && view !== 'map' && listItems.length > 0 && (
        <>
          <PropertyGrid
            properties={listItems}
            staggerFromIndex={aiOverride ? undefined : staggerFromIndex}
          />
          {view === 'grid' && !aiOverride && !usingMockData && (
            <>
              <div ref={scrollSentinelRef} className="h-12 w-full shrink-0" aria-hidden />
              {loadingMore && (
                <div className="space-y-3">
                  <p className="text-center text-sm text-slate-400 motion-safe:animate-pulse">
                    Loading more properties…
                  </p>
                  <SkeletonGridMore />
                </div>
              )}
              {hasMore && !loadingMore && (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => void loadMore()}
                    className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-6 py-2.5 text-sm font-medium text-cyan-200 hover:bg-cyan-500/20"
                  >
                    Load more
                  </button>
                </div>
              )}
              {!hasMore && properties.length > 0 && (
                <p className="mt-8 text-center text-sm text-slate-600">You&apos;ve reached the end of the list.</p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
