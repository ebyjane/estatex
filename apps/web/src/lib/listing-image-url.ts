import { pickListingThumbForProperty, resolveListingThumbnailUrl } from '@real-estate/shared';
import { getApiOrigin } from '@/lib/api-config';

/** Turn `/uploads/...` (API static files) into an absolute URL the browser can load. */
export function absoluteListingImageUrl(raw: string | undefined | null): string | undefined {
  if (!raw?.trim()) return undefined;
  const u = raw.trim();
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  if (u.startsWith('/')) return `${getApiOrigin()}${u}`;
  return u;
}

function isUserUploadedImage(url: string): boolean {
  const u = url.trim().toLowerCase();
  return u.includes('/uploads/') || u.startsWith('/uploads');
}

/**
 * Card hero: user uploads keep their URL; otherwise remap any Unsplash not in the curated pool
 * (cars, bad seeds) and use a deterministic residential thumb per row + slot.
 */
export function cardListingImageUrl(propertyId: string, raw?: string | null, cardIndex = 0): string {
  const r = raw?.trim();
  if (r && isUserUploadedImage(r)) {
    return absoluteListingImageUrl(r) ?? r;
  }
  if (r) {
    const abs = r.startsWith('/') ? absoluteListingImageUrl(r) ?? r : r;
    return resolveListingThumbnailUrl(propertyId, abs, cardIndex);
  }
  return pickListingThumbForProperty(propertyId, cardIndex);
}
