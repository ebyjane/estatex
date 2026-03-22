import type { ListingProperty } from '@/components/property/PropertyListingBlocks';

/**
 * Accepts API responses as a bare array, { items }, { data }, or { results }.
 * Safe for upgrades when response shape changes.
 */
export function normalizePropertiesResponse(data: unknown): unknown[] {
  if (data == null) return [];
  if (Array.isArray(data)) return data;
  if (typeof data !== 'object') return [];
  const o = data as Record<string, unknown>;
  const candidates = [o.items, o.data, o.results, o.properties];
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }
  return [];
}

/** Paginated `GET /properties` — tolerates legacy `{ items, total }` and new `{ data, page, hasMore }`. */
export function parsePropertiesPageResponse(data: unknown): {
  items: unknown[];
  page: number;
  hasMore: boolean;
  total?: number;
} {
  const items = normalizePropertiesResponse(data);
  if (data == null || typeof data !== 'object') {
    return { items, page: 1, hasMore: false };
  }
  const o = data as Record<string, unknown>;
  const page = typeof o.page === 'number' && Number.isFinite(o.page) ? o.page : 1;
  const total = typeof o.total === 'number' && Number.isFinite(o.total) ? o.total : undefined;
  const hasMore =
    typeof o.hasMore === 'boolean' ? o.hasMore : items.length >= 20;
  return { items, page, hasMore, total };
}

let _mockId = 0;
function nextFallbackId() {
  _mockId += 1;
  return `parsed-${Date.now()}-${_mockId}`;
}

/** Defensive mapping — survives partial / renamed API fields. */
export function mapUnknownToListingProperty(raw: unknown): ListingProperty {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const imgs = o.images;
  const images = Array.isArray(imgs)
    ? imgs
        .map((x) =>
          x && typeof x === 'object' && 'url' in (x as object)
            ? { url: String((x as { url: unknown }).url) }
            : null,
        )
        .filter(Boolean)
    : undefined;
  return {
    id: o.id != null ? String(o.id) : nextFallbackId(),
    title: o.title != null ? String(o.title) : 'Property',
    price: Number(o.price) || 0,
    currencyCode: o.currencyCode != null ? String(o.currencyCode) : 'USD',
    propertyType: o.propertyType != null ? String(o.propertyType) : undefined,
    city: o.city != null ? String(o.city) : undefined,
    latitude: o.latitude != null ? Number(o.latitude) : undefined,
    longitude: o.longitude != null ? Number(o.longitude) : undefined,
    aiValueScore: o.aiValueScore != null ? Number(o.aiValueScore) : undefined,
    aiCategory: o.aiCategory != null ? String(o.aiCategory) : undefined,
    rentalYield: o.rentalYield != null ? Number(o.rentalYield) : undefined,
    cagr5y: o.cagr5y != null ? Number(o.cagr5y) : undefined,
    riskScore: o.riskScore != null ? Number(o.riskScore) : undefined,
    trustScore: o.trustScore != null ? Number(o.trustScore) : undefined,
    isVerified: o.isVerified === true,
    fraudFlag: o.fraudFlag === true,
    aiRecommended: o.aiRecommended === true,
    isFeatured: o.isFeatured === true,
    listingType: o.listingType != null ? String(o.listingType) : undefined,
    images: images as { url: string }[] | undefined,
  };
}
