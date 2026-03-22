/**
 * Curated Indian + residential Unsplash thumbnails for listing cards and remapping bad seed URLs.
 * `resolveListingThumbnailUrl` maps legacy/automotive/irrelevant Unsplash links to this pool without re-seeding.
 */
/**
 * Allowlisted Unsplash photo paths only. Anything else under `images.unsplash.com` is replaced
 * with a deterministic pick from this pool (fixes cars, offices, wrong crops in old DB rows).
 */
export declare const INDIA_LISTING_THUMB_POOL: readonly string[];
export declare function hash32(s: string): number;
/**
 * Stable Unsplash thumb per listing. `variant` is usually the grid row index so nearby listings
 * don’t collide on `hash(id) % pool.length` the same way.
 */
export declare function pickListingThumbForProperty(propertyId: string, variant?: number): string;
export declare function pickThumbUrlsForRentRow(rowIndex: number, count: number): string[];
/**
 * Resolves a stored image URL for display: user uploads pass through; any Unsplash URL whose
 * pathname is not in `INDIA_LISTING_THUMB_POOL` is replaced with a stable residential thumb
 * (covers cars, roads, offices, and deprecated seed photos in existing databases).
 */
export declare function resolveListingThumbnailUrl(propertyId: string, url: string | null | undefined, variant?: number): string;
