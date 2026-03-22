/**
 * Pure generator for India-wide RENT listings (no DB).
 * Used by CLI `scripts/generateIndiaRentData.ts` and API `DemoSeedService.runIndiaRent5000`.
 */
export declare const INDIA_RENT_TOTAL_DEFAULT = 5000;
export type Furnishing = 'Semi-furnished' | 'Fully furnished' | 'Unfurnished';
export interface IndiaRentSeedRow {
    title: string;
    description: string;
    city: string;
    state: string;
    locality: string;
    addressLine1: string;
    latitude: number;
    longitude: number;
    /** Monthly rent (INR) */
    price: number;
    currencyCode: 'INR';
    bedrooms: number;
    bathrooms: number;
    areaSqft: number;
    propertyType: string;
    furnishing: Furnishing;
    rentalYield: number;
    growthProjection5yr: number;
    riskScore: number;
    aiValueScore: number;
    aiCategory: 'UNDERVALUED' | 'FAIR' | 'GOOD';
    cagr5y: number;
    rentalEstimate: number;
    imageUrls: string[];
}
export declare function buildIndiaRentRows(count?: number): IndiaRentSeedRow[];
