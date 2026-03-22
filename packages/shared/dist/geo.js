"use strict";
/**
 * Property map coordinates: validate ranges, fix common mistakes (wrapped longitude, swapped lat/lng).
 * Longitude must lie on the sphere: (-180, 180]; latitude [-90, 90].
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeLongitude = normalizeLongitude;
exports.maybeSwapLatLng = maybeSwapLatLng;
exports.isValidLatLng = isValidLatLng;
exports.coerceOptionalLatLng = coerceOptionalLatLng;
function normalizeLongitude(lng) {
    if (!Number.isFinite(lng))
        return NaN;
    return ((((lng + 180) % 360) + 360) % 360) - 180;
}
/** If |lat| > 90 and |lng| ≤ 90, treat as swapped (common copy-paste error). */
function maybeSwapLatLng(lat, lng) {
    if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) {
        return [lng, lat];
    }
    return [lat, lng];
}
function isEmptyCoord(v) {
    if (v == null)
        return true;
    if (typeof v === 'string' && v.trim() === '')
        return true;
    return false;
}
function isValidLatLng(lat, lng) {
    return (Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180);
}
/**
 * When both omitted → ok, no coords.
 * When one omitted → error (caller should merge from existing row before calling).
 */
function coerceOptionalLatLng(latIn, lngIn) {
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
    if (lat !== latN || lng !== lngN)
        adjusted = true;
    const lngWrapped = normalizeLongitude(lng);
    if (lngWrapped !== lng)
        adjusted = true;
    lng = lngWrapped;
    if (lat < -90 || lat > 90) {
        return {
            ok: false,
            error: 'Latitude must be between -90° and 90°. If you pasted coordinates, check that latitude and longitude are not swapped.',
        };
    }
    return { ok: true, coords: { latitude: lat, longitude: lng }, adjusted };
}
