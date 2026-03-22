"use strict";
/**
 * Curated Indian + residential Unsplash thumbnails for listing cards and remapping bad seed URLs.
 * `resolveListingThumbnailUrl` maps legacy/automotive/irrelevant Unsplash links to this pool without re-seeding.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.INDIA_LISTING_THUMB_POOL = void 0;
exports.hash32 = hash32;
exports.pickListingThumbForProperty = pickListingThumbForProperty;
exports.pickThumbUrlsForRentRow = pickThumbUrlsForRentRow;
exports.resolveListingThumbnailUrl = resolveListingThumbnailUrl;
const Q = 'w=800&h=600&fit=crop&q=80';
/**
 * Allowlisted Unsplash photo paths only. Anything else under `images.unsplash.com` is replaced
 * with a deterministic pick from this pool (fixes cars, offices, wrong crops in old DB rows).
 */
exports.INDIA_LISTING_THUMB_POOL = [
    // India — apartments & heritage (exteriors)
    `https://images.unsplash.com/photo-1764996915324-91919cee14d3?${Q}`,
    `https://images.unsplash.com/photo-1630986431773-170e9215b8b3?${Q}`,
    `https://images.unsplash.com/photo-1594146032116-80033545b0b8?${Q}`,
    // Modern homes & apartments (interiors / exteriors — residential stock)
    `https://images.unsplash.com/photo-1484154218962-a197022b5858?${Q}`,
    `https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?${Q}`,
    `https://images.unsplash.com/photo-1567767292273-a6f9303b0ff4?${Q}`,
    `https://images.unsplash.com/photo-1564013799919-ab600027ffc6?${Q}`,
    `https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?${Q}`,
    `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?${Q}`,
    `https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?${Q}`,
    `https://images.unsplash.com/photo-1600573472550-8090b5e0965e?${Q}`,
    `https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?${Q}`,
    `https://images.unsplash.com/photo-1600585154526-990dced4db0d?${Q}`,
    `https://images.unsplash.com/photo-1605276374104-dee2a0ed3c14?${Q}`,
    `https://images.unsplash.com/photo-1600585154084-4e5aa7ae0d7a?${Q}`,
    `https://images.unsplash.com/photo-1600607687644-c7171b42498b?${Q}`,
    `https://images.unsplash.com/photo-1600210492496-724fe5c67fb0?${Q}`,
    `https://images.unsplash.com/photo-1600585152915-d0bec9a28cbd?${Q}`,
    `https://images.unsplash.com/photo-1600566752355-35792bed156a?${Q}`,
    `https://images.unsplash.com/photo-1600573472592-401b3a8045f1?${Q}`,
    `https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?${Q}`,
    `https://images.unsplash.com/photo-1600047509767-864f56c4e0f8?${Q}`,
    `https://images.unsplash.com/photo-1580587771525-78b9dba3b914?${Q}`,
    `https://images.unsplash.com/photo-1560518883-ce09059eeffa?${Q}`,
    `https://images.unsplash.com/photo-1600607688969-a5bfcd7e430f?${Q}`,
    `https://images.unsplash.com/photo-1600047509359-2e4b204f9b61?${Q}`,
    `https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?${Q}`,
    `https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?${Q}`,
    `https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?${Q}`,
    `https://images.unsplash.com/photo-1600047508806-3eaf3a1f4f0b?${Q}`,
    `https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?${Q}`,
    `https://images.unsplash.com/photo-1613490493576-6eaa921f6746?${Q}`,
    `https://images.unsplash.com/photo-1600047509807-ba8f99d2cd6a?${Q}`,
];
function poolPathSet(pool) {
    const s = new Set();
    for (const raw of pool) {
        try {
            s.add(new URL(raw).pathname.toLowerCase());
        }
        catch {
            /* ignore */
        }
    }
    return s;
}
const POOL_PATHS = poolPathSet(exports.INDIA_LISTING_THUMB_POOL);
/** Explicit legacy IDs (automotive, old two-photo seed, etc.) — also not in pool, but listed for clarity. */
const LEGACY_REMAP_PHOTO_IDS = [
    'photo-1560184897-ae75f418493e',
    'photo-1502005229762-cf1b2da7c5d6',
    'photo-1522708323590-d24dbb6b0267',
];
function hash32(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++)
        h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
    return Math.abs(h);
}
/**
 * Stable Unsplash thumb per listing. `variant` is usually the grid row index so nearby listings
 * don’t collide on `hash(id) % pool.length` the same way.
 */
function pickListingThumbForProperty(propertyId, variant = 0) {
    const pool = exports.INDIA_LISTING_THUMB_POOL;
    if (!pool.length)
        return '';
    const idx = hash32(`${propertyId}:${variant}`) % pool.length;
    return pool[idx];
}
function pickThumbUrlsForRentRow(rowIndex, count) {
    const pool = exports.INDIA_LISTING_THUMB_POOL;
    if (pool.length === 0)
        return [];
    const urls = [];
    const base = (rowIndex * 17) % pool.length;
    for (let i = 0; i < count; i++) {
        urls.push(pool[(base + i * 37) % pool.length]);
    }
    return urls;
}
/**
 * Resolves a stored image URL for display: user uploads pass through; any Unsplash URL whose
 * pathname is not in `INDIA_LISTING_THUMB_POOL` is replaced with a stable residential thumb
 * (covers cars, roads, offices, and deprecated seed photos in existing databases).
 */
function resolveListingThumbnailUrl(propertyId, url, variant = 0) {
    if (!url?.trim())
        return pickListingThumbForProperty(propertyId, variant);
    const u = url.trim();
    const lower = u.toLowerCase();
    if (lower.includes('/uploads/') || lower.startsWith('/uploads'))
        return u;
    if (LEGACY_REMAP_PHOTO_IDS.some((id) => u.includes(id))) {
        return pickListingThumbForProperty(propertyId, variant);
    }
    let unsplashPath = null;
    try {
        const parsed = new URL(u);
        if (parsed.hostname.includes('unsplash.com'))
            unsplashPath = parsed.pathname.toLowerCase();
    }
    catch {
        return u;
    }
    if (unsplashPath) {
        if (POOL_PATHS.has(unsplashPath))
            return u;
        return pickListingThumbForProperty(propertyId, variant);
    }
    return u;
}
