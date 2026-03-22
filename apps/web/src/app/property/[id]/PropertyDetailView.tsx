'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { fetchApi } from '@/lib/api';
import { absoluteListingImageUrl } from '@/lib/listing-image-url';
import { resolveListingThumbnailUrl } from '@real-estate/shared';
import { MediaCarousel } from '@/components/property/MediaCarousel';
import { PropertyVideoSection } from '@/components/property/PropertyVideoSection';
import { useDisplayPrice } from '@/hooks/useDisplayPrice';
import { Building2, Shield, ShieldCheck, AlertTriangle, Flag, Pencil } from 'lucide-react';

const TrendLineChart = dynamic(
  () => import('./PropertyDetailCharts').then((m) => m.TrendLineChart),
  { ssr: false, loading: () => <div className="h-56 animate-pulse rounded-lg bg-white/5" /> },
);

const ProjectionAreaChart = dynamic(
  () => import('./PropertyDetailCharts').then((m) => m.ProjectionAreaChart),
  { ssr: false, loading: () => <div className="h-64 animate-pulse rounded-lg bg-white/5" /> },
);

interface Property {
  id: string;
  title: string;
  description?: string;
  price: number;
  currencyCode: string;
  propertyType?: string;
  listingType: string;
  bedrooms?: number;
  bathrooms?: number;
  areaSqft?: number;
  city?: string;
  state?: string;
  countryId?: string;
  aiValueScore?: number;
  aiCategory?: string;
  rentalYield?: number;
  cagr5y?: number;
  riskScore?: number;
  images?: { url: string }[];
  videoUrl?: string | null;
  videoUrls?: string[] | null;
  trustScore?: number;
  trustBreakdown?: {
    verifiedListing: boolean;
    ownerAuthenticated: boolean;
    dataCompletenessPct: number;
    fraudReview: boolean;
  };
  isVerified?: boolean;
  fraudFlag?: boolean;
  listingExpiresAt?: string;
  reportCount?: number;
}

export function PropertyDetailView() {
  const params = useParams();
  const raw = params?.id;
  const id = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : '';
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const [trendPoints, setTrendPoints] = useState<{ label: string; avgAsk: number }[]>([]);

  const displayPrice = useDisplayPrice(
    property ? Number(property.price) : 0,
    property?.currencyCode || 'USD',
  );

  useEffect(() => {
    if (!id) return;
    fetchApi<Property>(`/properties/${id}`)
      .then(setProperty)
      .catch(() => setProperty(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    void fetchApi<{ canEdit: boolean }>(`/properties/${id}/can-edit`)
      .then((r) => setCanEdit(!!r.canEdit))
      .catch(() => setCanEdit(false));
  }, [id]);

  useEffect(() => {
    const c = property?.city?.trim();
    if (!c) {
      setTrendPoints([]);
      return;
    }
    void fetchApi<{ points: { label: string; avgAsk: number }[] }>(
      `/properties/insights/price-trends?${new URLSearchParams({ city: c })}`,
    )
      .then((r) => setTrendPoints(r.points ?? []))
      .catch(() => setTrendPoints([]));
  }, [property?.city]);

  const handleReport = useCallback(async () => {
    if (!id) return;
    try {
      await fetchApi(`/properties/${id}/report`, { method: 'POST', body: '{}' });
      toast.success('Report received — we review flagged listings.');
    } catch {
      toast.error('Could not submit report');
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-slate-500">Property not found</p>
        <Link href="/properties" className="text-cyan-400 hover:underline">
          ← Back to listings
        </Link>
      </div>
    );
  }

  const jsonLdProperty = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: property.currencyCode,
    },
    address: property.city
      ? { '@type': 'PostalAddress', addressLocality: property.city }
      : undefined,
  };

  const projectionData =
    property?.cagr5y && property && !displayPrice.loading
      ? [0, 1, 2, 3, 4, 5].map((y) => {
          const factor = Math.pow(1 + Number(property.cagr5y) / 100, y);
          return {
            year: `Y${y}`,
            value: Math.round(displayPrice.value * factor),
          };
        })
      : [];

  const galleryImages = (property.images ?? [])
    .filter((img): img is { url: string } => img != null && typeof img === 'object' && typeof img.url === 'string')
    .map((img, i) => {
      const abs = absoluteListingImageUrl(img.url) ?? img.url;
      return { url: resolveListingThumbnailUrl(property.id, abs, i) };
    });

  const videoUrlsResolved = (() => {
    const fromArr = (property.videoUrls ?? [])
      .filter((v): v is string => v != null && String(v).trim() !== '')
      .map((v) => String(v).trim());
    const raw = fromArr.length ? fromArr : property.videoUrl ? [String(property.videoUrl).trim()] : [];
    return raw.map((u) => absoluteListingImageUrl(u) ?? u).filter(Boolean);
  })();

  const videoPosterUrl = galleryImages[0]?.url;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProperty) }}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/properties" className="text-sm text-slate-500 hover:text-cyan-400">
          ← Back to listings
        </Link>
        {canEdit && (
          <Link
            href={`/post-property?edit=${property.id}`}
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 hover:bg-cyan-500/20"
          >
            <Pencil className="h-4 w-4" />
            Edit listing
          </Link>
        )}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <MediaCarousel images={galleryImages} title={property.title} propertyId={property.id} />

          <PropertyVideoSection videoUrls={videoUrlsResolved} posterUrl={videoPosterUrl} />

          <div className="rounded-2xl border border-white/10 bg-slate-950/40 backdrop-blur-lg p-6 md:p-8">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl">{property.title}</h1>
            <p className="mt-3 text-sm text-slate-400">
              {[property.propertyType, property.listingType, property.city].filter(Boolean).join(' • ').toLowerCase()}
            </p>
            {property.listingExpiresAt && (
              <p className="mt-3 text-sm font-medium text-yellow-400">
                Listing renewal due: {new Date(property.listingExpiresAt).toLocaleDateString()} (30-day freshness
                policy)
              </p>
            )}
            {property.trustBreakdown && (
              <div className="mt-4 flex flex-col gap-1 text-sm text-slate-400 sm:flex-row sm:items-start sm:justify-between">
                <p>
                  Verified: {property.trustBreakdown.verifiedListing ? 'Yes' : 'No'} · Owner check:{' '}
                  {property.trustBreakdown.ownerAuthenticated ? 'Yes' : 'No'}
                </p>
                <p className="sm:text-right">Profile completeness: {property.trustBreakdown.dataCompletenessPct}%</p>
              </div>
            )}
            <div className="mt-6 flex gap-3">
              <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" aria-hidden />
              <div className="min-w-0 flex-1">
                {property.description?.trim() ? (
                  <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-400">{property.description}</p>
                ) : (
                  <p className="text-slate-500">No description provided.</p>
                )}
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {property.bedrooms != null && (
                <span className="rounded-md bg-slate-800/90 px-3 py-1.5 text-sm text-slate-300">{property.bedrooms} bed</span>
              )}
              {property.bathrooms != null && (
                <span className="rounded-md bg-slate-800/90 px-3 py-1.5 text-sm text-slate-300">{property.bathrooms} bath</span>
              )}
              {property.areaSqft != null && (
                <span className="rounded-md bg-slate-800/90 px-3 py-1.5 text-sm text-slate-300">
                  {Number(property.areaSqft).toLocaleString()} sqft
                </span>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
              {property.aiValueScore != null && (
                <span
                  className="rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 px-2.5 py-1 text-xs font-bold text-white shadow-brand"
                  title="EstateX Score — yield, growth, risk vs regional baseline"
                >
                  EstateX {property.aiValueScore}
                </span>
              )}
              {property.trustScore != null && (
                <span className="flex items-center gap-1 rounded-lg bg-amber-500/95 px-2.5 py-1 text-xs font-bold text-slate-950">
                  <Shield className="h-3.5 w-3.5" />
                  Trust {Math.round(property.trustScore)}
                </span>
              )}
              {property.isVerified && (
                <span className="flex items-center gap-1 rounded-lg bg-emerald-600/90 px-2 py-1 text-xs font-semibold text-white">
                  <ShieldCheck className="h-3 w-3" />
                  Verified listing
                </span>
              )}
              {property.fraudFlag && (
                <span className="flex items-center gap-1 rounded-lg bg-red-600/90 px-2 py-1 text-xs font-bold text-white">
                  <AlertTriangle className="h-3 w-3" />
                  Under fraud review
                </span>
              )}
              {property.aiCategory && (
                <span className="rounded-lg border border-white/15 px-2.5 py-1 text-xs text-slate-300">
                  {property.aiCategory}
                </span>
              )}
            </div>
          </div>

          {trendPoints.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-6">
              <h2 className="font-semibold text-white mb-1">Local price trend (indicative)</h2>
              <p className="mb-4 text-xs text-slate-500">
                Demo curve from listing averages — not a substitute for registered comps.
              </p>
              <TrendLineChart data={trendPoints} />
            </div>
          )}

          {projectionData.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-6">
              <h2 className="font-semibold text-white mb-1">5-Year Projection</h2>
              <p className="mb-4 text-xs text-slate-500">
                Values in {displayPrice.currency} (from your display currency setting)
              </p>
              <ProjectionAreaChart data={projectionData} currency={String(displayPrice.currency)} />
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-6">
            <h2 className="font-semibold text-white mb-4">Multi-Currency Pricing</h2>
            {displayPrice.loading ? (
              <div className="h-9 w-48 animate-pulse rounded-lg bg-white/10" />
            ) : (
              <p className="text-2xl font-bold text-cyan-400">
                {displayPrice.currency} {displayPrice.value.toLocaleString()}
              </p>
            )}
            <p className="mt-1 text-slate-500 text-sm">
              Listed: {property.currencyCode} {Number(property.price).toLocaleString()}
            </p>
            <Link
              href={`/compare?ids=${property.id}`}
              className="mt-4 block text-center rounded-xl border border-cyan-500/50 px-4 py-3 text-cyan-400 hover:bg-cyan-500/10 transition"
            >
              Add to Compare
            </Link>
            <button
              type="button"
              className="mt-3 w-full btn-primary px-4 py-3 text-sm"
            >
              Get AI Report ($29)
            </button>
            <button
              type="button"
              onClick={() => void handleReport()}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/10"
            >
              <Flag className="h-4 w-4 text-amber-400" />
              Report listing
            </button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-6">
            <h2 className="font-semibold text-white mb-4">Investment Metrics</h2>
            <div className="space-y-3">
              {property.aiValueScore != null && (
                <div className="flex justify-between">
                  <span className="text-slate-500">EstateX Score</span>
                  <span className="font-mono text-cyan-400">{property.aiValueScore}/100</span>
                </div>
              )}
              {property.rentalYield != null && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Rental Yield</span>
                  <span className="font-mono text-white">{Number(property.rentalYield).toFixed(1)}%</span>
                </div>
              )}
              {property.cagr5y != null && (
                <div className="flex justify-between">
                  <span className="text-slate-500">5Y CAGR</span>
                  <span className="font-mono text-emerald-400">{Number(property.cagr5y).toFixed(1)}%</span>
                </div>
              )}
              {property.riskScore != null && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Risk Score</span>
                  <span className="font-mono text-white">{Number(property.riskScore).toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
