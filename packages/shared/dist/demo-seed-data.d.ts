/** Pure data + generators for CLI seed and API demo-seed (no DB imports). */
export declare const DEMO_COUNTRIES: readonly [{
    readonly code: "IND";
    readonly name: "India";
    readonly currencyCode: "INR";
    readonly region: "APAC";
}, {
    readonly code: "UAE";
    readonly name: "United Arab Emirates";
    readonly currencyCode: "AED";
    readonly region: "GCC";
}, {
    readonly code: "USA";
    readonly name: "United States";
    readonly currencyCode: "USD";
    readonly region: "NA";
}, {
    readonly code: "GBR";
    readonly name: "United Kingdom";
    readonly currencyCode: "GBP";
    readonly region: "EU";
}, {
    readonly code: "SAU";
    readonly name: "Saudi Arabia";
    readonly currencyCode: "SAR";
    readonly region: "GCC";
}];
/** Public sample MP4 for demo listings (rights: W3Schools sample). */
export declare const SAMPLE_VIDEO_MP4 = "https://www.w3schools.com/html/mov_bbb.mp4";
export declare function pickListingImageUrl(propertyType: string, index: number): string;
export interface DemoPropertySeedRow {
    countryCode: 'IND' | 'UAE' | 'USA';
    title: string;
    description: string;
    city: string;
    state?: string;
    addressLine1: string;
    latitude: number;
    longitude: number;
    price: number;
    currencyCode: string;
    bedrooms: number;
    bathrooms: number;
    areaSqft: number;
    propertyType: string;
    rentalEstimate: number;
    isFeatured: boolean;
    imageUrl: string;
    rentalYieldPct: number;
    aiScore: number;
    aiCategory: string;
    growthProjection5yr: number;
    cagr5y: number;
    riskScore: number;
    videoUrl?: string | null;
}
/** India + Dubai + Texas distribution (default 500). */
export declare function buildDemoPropertyRows(counts?: {
    india?: number;
    dubai?: number;
    texas?: number;
}): DemoPropertySeedRow[];
