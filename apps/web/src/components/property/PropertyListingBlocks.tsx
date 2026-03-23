'use client';

import { cardListingImageUrl } from '@/lib/listing-image-url';
import { PropertyCardWithPrice } from '@/components/property/PropertyCardWithPrice';

export interface ListingProperty {
  id: string;
  title: string;
  price: number;
  currencyCode: string;
  propertyType?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  aiValueScore?: number;
  aiCategory?: string;
  rentalYield?: number;
  cagr5y?: number;
  riskScore?: number;
  images?: { url: string }[];
  aiRecommended?: boolean;
  trustScore?: number;
  isVerified?: boolean;
  fraudFlag?: boolean;
  isFeatured?: boolean;
  listingType?: string;
}

export function SkeletonGridMore() {
  return (
    <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3" aria-hidden>
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="h-48 animate-pulse bg-white/10" />
          <div className="p-5 space-y-3">
            <div className="h-4 w-3/4 animate-pulse bg-white/10 rounded" />
            <div className="h-3 w-1/2 animate-pulse bg-white/10 rounded" />
            <div className="h-6 w-1/3 animate-pulse bg-white/10 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonGrid() {
  return (
    <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="h-48 animate-pulse bg-white/10" />
          <div className="p-5 space-y-3">
            <div className="h-4 w-3/4 animate-pulse bg-white/10 rounded" />
            <div className="h-3 w-1/2 animate-pulse bg-white/10 rounded" />
            <div className="h-6 w-1/3 animate-pulse bg-white/10 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
  usingMock,
}: {
  message: string;
  onRetry?: () => void;
  usingMock?: boolean;
}) {
  return (
    <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-950/30 px-4 py-3 text-sm text-amber-100">
      <p>{message}</p>
      {usingMock && (
        <p className="mt-2 text-xs text-amber-200/80">Showing sample listings so you can keep exploring the UI.</p>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-200 hover:bg-amber-500/30"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-12 text-center space-y-4">
      <p className="text-slate-400">No listings match your filters right now.</p>
      {children}
    </div>
  );
}

export function DebugPanel({ count, source }: { count: number; source: string }) {
  if (process.env.NODE_ENV === 'production') return null;
  return (
    <div className="mt-4 rounded-lg border border-dashed border-slate-600 bg-slate-900/80 px-3 py-2 font-mono text-xs text-slate-400">
      <div>Total properties (displayed): {count}</div>
      <div>Source: {source}</div>
    </div>
  );
}

export function PropertyGrid({
  properties,
  staggerFromIndex,
}: {
  properties: ListingProperty[];
  /** If set, cards at or after this index play a short staggered fade-in (infinite-scroll batches). */
  staggerFromIndex?: number;
}) {
  const seen = new Set<string>();
  const unique: ListingProperty[] = [];
  for (const p of properties) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    unique.push(p);
  }
  const ordered = [...unique].sort((a, b) => Number(!!b.isFeatured) - Number(!!a.isFeatured));
  return (
    <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {ordered.map((p, idx) => (
        <div
          key={p.id}
          className={
            staggerFromIndex != null && idx >= staggerFromIndex
              ? 'animate-fade-in motion-reduce:animate-none motion-reduce:opacity-100'
              : undefined
          }
          style={
            staggerFromIndex != null && idx >= staggerFromIndex
              ? { animationDelay: `${Math.min((idx - staggerFromIndex) * 40, 480)}ms`, animationFillMode: 'both' }
              : undefined
          }
        >
          <PropertyCardWithPrice
            id={p.id}
            title={p.title}
            city={p.city}
            price={Number(p.price)}
            currencyCode={p.currencyCode}
            aiValueScore={p.aiValueScore != null ? Number(p.aiValueScore) : undefined}
            aiCategory={
              p.aiCategory as
                | 'UNDERVALUED'
                | 'GOOD'
                | 'FAIR'
                | 'PREMIUM'
                | 'HIGH_RISK'
                | undefined
            }
            rentalYield={p.rentalYield != null ? Number(p.rentalYield) : undefined}
            cagr5y={p.cagr5y != null ? Number(p.cagr5y) : undefined}
            riskScore={p.riskScore != null ? Number(p.riskScore) : undefined}
            trustScore={p.trustScore != null ? Number(p.trustScore) : undefined}
            verified={p.isVerified === true}
            fraudFlag={p.fraudFlag === true}
            imageUrl={cardListingImageUrl(p.id, p.images?.[0]?.url, idx)}
            propertyType={p.propertyType}
            priority={idx < 4}
            aiRecommended={p.aiRecommended === true}
            featured={p.isFeatured === true}
            listingType={p.listingType}
          />
        </div>
      ))}
    </div>
  );
}
