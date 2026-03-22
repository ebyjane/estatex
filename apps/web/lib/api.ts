/**
 * Single source of truth for public API base URL (inlined at build from NEXT_PUBLIC_*).
 * - Vercel: set NEXT_PUBLIC_API_URL=/api (same-origin; add rewrites to your Nest API).
 * - Local dev: omit env or set NEXT_PUBLIC_API_URL=http://localhost:8000
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : '/api');

function resolveApiV1Base(baseUrl: string): string {
  const base = baseUrl.replace(/\/$/, '');
  if (/\/api\/v1$/i.test(base)) return base;
  if (/^https?:\/\//i.test(base)) {
    return `${base}/api/v1`;
  }
  return `${base}/v1`;
}

/** Nest global prefix for JSON routes (`/api/v1` on absolute origins, `/api/v1` when base is `/api`). */
export const API_V1_BASE = resolveApiV1Base(API_BASE_URL);

/** Origin for resolving relative `/uploads/...` paths to absolute URLs (browser / SSR). */
export function getApiOrigin(): string {
  const b = API_BASE_URL.replace(/\/$/, '');
  if (/^https?:\/\//i.test(b)) {
    try {
      return new URL(b).origin;
    } catch {
      return '';
    }
  }
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}
