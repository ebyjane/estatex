/**
 * Client-safe copy of `packages/shared/src/geo.ts` — keep logic in sync with the API package.
 * Imported here so Next.js client bundles do not rely on @real-estate/shared CJS interop (avoids runtime "is not a function" errors).
 */

export function normalizeLongitude(lng: number): number {
  if (!Number.isFinite(lng)) return NaN;
  return ((((lng + 180) % 360) + 360) % 360) - 180;
}

export function maybeSwapLatLng(lat: number, lng: number): [number, number] {
  if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) {
    return [lng, lat];
  }
  return [lat, lng];
}

function isEmptyCoord(v: unknown): boolean {
  if (v == null) return true;
  if (typeof v === 'string' && v.trim() === '') return true;
  return false;
}

export function isValidLatLng(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

export type CoerceOptionalLatLngResult =
  | { ok: true; coords?: { latitude: number; longitude: number }; adjusted: boolean }
  | { ok: false; error: string };

export function coerceOptionalLatLng(latIn: unknown, lngIn: unknown): CoerceOptionalLatLngResult {
  if (isEmptyCoord(latIn) && isEmptyCoord(lngIn)) {
    return { ok: true, adjusted: false };
  }
  if (isEmptyCoord(latIn) !== isEmptyCoord(lngIn)) {
    return {
      ok: false,
      error: 'Provide both latitude and longitude, or leave both empty.',
    };
  }

  const latN = Number(latIn);
  const lngN = Number(lngIn);
  if (!Number.isFinite(latN) || !Number.isFinite(lngN)) {
    return { ok: false, error: 'Latitude and longitude must be valid numbers.' };
  }

  let adjusted = false;
  let [lat, lng] = maybeSwapLatLng(latN, lngN);
  if (lat !== latN || lng !== lngN) adjusted = true;

  const lngWrapped = normalizeLongitude(lng);
  if (lngWrapped !== lng) adjusted = true;
  lng = lngWrapped;

  if (lat < -90 || lat > 90) {
    return {
      ok: false,
      error:
        'Latitude must be between -90° and 90°. If you pasted coordinates, check that latitude and longitude are not swapped.',
    };
  }

  return { ok: true, coords: { latitude: lat, longitude: lng }, adjusted };
}
