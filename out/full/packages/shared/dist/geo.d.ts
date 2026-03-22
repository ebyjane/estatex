/**
 * Property map coordinates: validate ranges, fix common mistakes (wrapped longitude, swapped lat/lng).
 * Longitude must lie on the sphere: (-180, 180]; latitude [-90, 90].
 */
export declare function normalizeLongitude(lng: number): number;
/** If |lat| > 90 and |lng| ≤ 90, treat as swapped (common copy-paste error). */
export declare function maybeSwapLatLng(lat: number, lng: number): [number, number];
export declare function isValidLatLng(lat: number, lng: number): boolean;
export type CoerceOptionalLatLngResult = {
    ok: true;
    coords?: {
        latitude: number;
        longitude: number;
    };
    adjusted: boolean;
} | {
    ok: false;
    error: string;
};
/**
 * When both omitted → ok, no coords.
 * When one omitted → error (caller should merge from existing row before calling).
 */
export declare function coerceOptionalLatLng(latIn: unknown, lngIn: unknown): CoerceOptionalLatLngResult;
