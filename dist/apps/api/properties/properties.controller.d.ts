import { JwtService } from '@nestjs/jwt';
import { AiService } from './ai.service';
import { PropertiesService } from './properties.service';
export declare class PropertiesController {
    private service;
    private ai;
    private jwt;
    constructor(service: PropertiesService, ai: AiService, jwt: JwtService);
    stats(): Promise<{
        total: number;
        avgYield: number;
        undervalued: number;
    }>;
    localityInsights(city: string, countryCode?: string): Promise<{
        city: string;
        listings: number;
        avgPrice: number;
        avgYield: number;
        avgAiScore: number;
        avgTrustScore: number;
        note?: undefined;
    } | {
        city: string;
        listings: number;
        avgPrice: number;
        avgYield: number;
        avgAiScore: number;
        avgTrustScore: number;
        note: string;
    }>;
    priceTrends(city: string, countryCode?: string): Promise<{
        city: string;
        points: {
            label: string;
            avgAsk: number;
        }[];
        disclaimer: string;
    }>;
    list(countryId?: string, countryCode?: string, type?: string, listingType?: string, minPrice?: string, maxPrice?: string, minBedrooms?: string, maxBedrooms?: string, city?: string, minLat?: string, maxLat?: string, minLng?: string, maxLng?: string, limit?: string, page?: string, offset?: string, flat?: string, format?: string): Promise<(import("../entities").PropertyEntity & {
        trustBreakdown: import("./property-public.util").TrustBreakdown;
        trustScore: number;
        dataCompleteness: number;
    })[] | {
        data: (import("../entities").PropertyEntity & {
            trustBreakdown: import("./property-public.util").TrustBreakdown;
            trustScore: number;
            dataCompleteness: number;
        })[];
        items: (import("../entities").PropertyEntity & {
            trustBreakdown: import("./property-public.util").TrustBreakdown;
            trustScore: number;
            dataCompleteness: number;
        })[];
        page: number;
        hasMore: boolean;
        total: number;
    } | {
        success: boolean;
        data: never[];
        items: never[];
        page: number;
        hasMore: boolean;
        total: number;
        message: string;
    }>;
    submitListing(body: Record<string, unknown>, auth?: string): Promise<(import("../entities").PropertyEntity & {
        trustBreakdown: import("./property-public.util").TrustBreakdown;
        trustScore: number;
        dataCompleteness: number;
    }) | null>;
    canEdit(id: string, user: {
        id: string;
        role: string;
    }): Promise<{
        canEdit: boolean;
    }>;
    forEdit(id: string, user: {
        id: string;
        role: string;
    }): Promise<import("../entities").PropertyEntity & {
        trustBreakdown: import("./property-public.util").TrustBreakdown;
        trustScore: number;
        dataCompleteness: number;
    } & {
        countryCode: string;
    }>;
    one(id: string): Promise<(import("../entities").PropertyEntity & {
        trustBreakdown: import("./property-public.util").TrustBreakdown;
        trustScore: number;
        dataCompleteness: number;
    }) | null>;
    create(dto: Record<string, unknown>, user: {
        id: string;
    }): Promise<import("../entities").PropertyEntity>;
    patch(id: string, dto: Record<string, unknown>, user: {
        id: string;
        role: string;
    }): Promise<(import("../entities").PropertyEntity & {
        trustBreakdown: import("./property-public.util").TrustBreakdown;
        trustScore: number;
        dataCompleteness: number;
    }) | null>;
    report(id: string, body: {
        reason?: string;
    }): Promise<{
        ok: boolean;
        reportCount: number;
        fraudFlag: boolean;
    }>;
    aiDescription(id: string): Promise<{
        description: string;
    }>;
    aiValuate(id: string): Promise<{
        valueScore: number;
        rentalYield: number;
        cagr5y: number;
        riskScore: number;
    } | null>;
}
