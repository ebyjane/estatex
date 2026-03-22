const DEFAULT_API_ORIGIN = 'http://localhost:8000';

/**
 * Raw value from Vercel / .env.local. May be:
 * - API origin only: `https://api.example.com` or `http://localhost:8000`
 * - Full Nest prefix (back-compat): `https://api.example.com/api/v1`
 */
const RAW_NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL?.trim();

function resolveApiUrls(raw: string | undefined): { apiBaseUrl: string; apiV1Url: string } {
  if (!raw) {
    return {
      apiBaseUrl: DEFAULT_API_ORIGIN,
      apiV1Url: `${DEFAULT_API_ORIGIN}/api/v1`,
    };
  }
  const normalized = raw.replace(/\/$/, '');
  if (/\/api\/v1$/i.test(normalized)) {
    const origin = normalized.replace(/\/api\/v1$/i, '').replace(/\/$/, '') || DEFAULT_API_ORIGIN;
    return { apiBaseUrl: origin, apiV1Url: normalized };
  }
  return {
    apiBaseUrl: normalized,
    apiV1Url: `${normalized}/api/v1`,
  };
}

const { apiBaseUrl, apiV1Url } = resolveApiUrls(RAW_NEXT_PUBLIC_API_URL);

/** Public API origin (no `/api/v1`). */
export const API_BASE_URL = apiBaseUrl;

/** Nest global prefix: `{API_BASE_URL}/api/v1` */
export const API_V1_BASE = apiV1Url;

/**
 * Production must not point at a loopback API. For local `next build` with a localhost API in
 * `.env.local`, set `NEXT_PUBLIC_ALLOW_LOCALHOST_API=1` (do not set this on Vercel production).
 */
const allowLocalhostApi =
  process.env.NEXT_PUBLIC_ALLOW_LOCALHOST_API === '1' ||
  process.env.NEXT_PUBLIC_ALLOW_LOCALHOST_API === 'true';

if (
  process.env.NODE_ENV === 'production' &&
  !allowLocalhostApi &&
  (API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1'))
) {
  throw new Error('❌ Localhost API is not allowed in production');
}

export function getApiOrigin(): string {
  return API_BASE_URL;
}
