'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import { mapUnknownToListingProperty, parsePropertiesPageResponse } from '@/utils/parsePropertiesApi';
import { cardListingImageUrl } from '@/lib/listing-image-url';
import { PropertyCardWithPrice } from '@/components/property/PropertyCardWithPrice';

export function ListingHubClient({
  city,
  listingType,
  minBedrooms,
  maxBedrooms,
  countryCode = 'IND',
}: {
  city: string;
  listingType?: 'sale' | 'rent';
  minBedrooms?: number;
  maxBedrooms?: number;
  countryCode?: string;
}) {
  const [items, setItems] = useState<ReturnType<typeof mapUnknownToListingProperty>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('limit', '60');
    params.set('page', '1');
    params.set('countryCode', countryCode);
    params.set('city', city);
    if (listingType) params.set('listingType', listingType);
    if (minBedrooms != null) params.set('minBedrooms', String(minBedrooms));
    if (maxBedrooms != null) params.set('maxBedrooms', String(maxBedrooms));
    setLoading(true);
    fetchApi<unknown>(`/properties?${params}`)
      .then((r) =>
        setItems(
          parsePropertiesPageResponse(r).items.map(mapUnknownToListingProperty).sort((a, b) => {
            return Number(!!b.isFeatured) - Number(!!a.isFeatured);
          }),
        ),
      )
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [city, listingType, minBedrooms, maxBedrooms, countryCode]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center text-slate-400">
        <p>No listings match this hub yet.</p>
        <Link href="/properties" className="mt-4 inline-block text-cyan-400 hover:underline">
          Browse all properties →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map((p, idx) => (
        <PropertyCardWithPrice
          key={p.id}
          id={p.id}
          title={p.title}
          city={p.city}
          price={Number(p.price)}
          currencyCode={p.currencyCode}
          aiValueScore={p.aiValueScore != null ? Number(p.aiValueScore) : undefined}
          aiCategory={
            p.aiCategory as 'UNDERVALUED' | 'GOOD' | 'FAIR' | 'PREMIUM' | 'HIGH_RISK' | undefined
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
          featured={p.isFeatured === true}
          listingType={p.listingType}
        />
      ))}
    </div>
  );
}
