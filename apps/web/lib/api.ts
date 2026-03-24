/**
 * Single source of truth for the public API base URL (inlined at build from NEXT_PUBLIC_*).
 * All client fetches should use `API_V1_BASE` / `fetchApi` from `src/lib/api.ts` — do not hardcode hosts.
 *
 * - Source: NEXT_PUBLIC_API_URL
 * - Local fallback: Nest on port 8000 when env is unset
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL;
export const API_BASE_URL = API_URL || 'http://localhost:8000';

function resolveApiV1Base(baseUrl: string): string {
  const base = baseUrl.replace(/\/$/, '');
  if (/\/api\/v1$/i.test(base)) return base;
  if (/^https?:\/\//i.test(base)) {
    return `${base}/api/v1`;
  }
  return `${base}/v1`;
}

/** Nest JSON routes: `${API_V1_BASE}/properties`, `${API_V1_BASE}/admin/overview`, etc. */
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
