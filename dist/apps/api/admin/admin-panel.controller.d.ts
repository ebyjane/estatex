import { PropertiesService } from '../properties/properties.service';
import { AdminPanelService } from './admin-panel.service';
export declare class AdminPanelController {
    private readonly panel;
    private readonly properties;
    private readonly log;
    constructor(panel: AdminPanelService, properties: PropertiesService);
    overview(): Promise<{
        totalProperties: number;
        activeListings: number;
        pendingListings: number;
        activeUsers: number;
        totalLeads: number;
        totalInvestments: number;
        revenue: number;
        revenueNote: string;
        avgYield: number;
        undervaluedListings: number;
        charts: {
            listingsGrowth: {
                date: string;
                count: number;
            }[];
            cityDistribution: {
                city: string;
                count: number;
            }[];
            listingTypeSplit: {
                type: string;
                count: number;
            }[];
        };
    } | {
        success: boolean;
        message: string;
        totalProperties: number;
        activeListings: number;
        pendingListings: number;
        activeUsers: number;
        totalLeads: number;
        totalInvestments: number;
        revenue: number;
        revenueNote: string;
        avgYield: number;
        undervaluedListings: number;
        charts: {
            listingsGrowth: {
                date: string;
                count: number;
            }[];
            cityDistribution: {
                city: string;
                count: number;
            }[];
            listingTypeSplit: {
                type: string;
                count: number;
            }[];
        };
    }>;
    ingestionLogs(): {
        data: {
            at: string;
            action: string;
            detail: string;
        }[];
    };
    logIngestion(body: {
        action: string;
        detail?: string;
    }): {
        ok: boolean;
    };
    listProperties(page?: string, limit?: string, city?: string, minPrice?: string, maxPrice?: string, minAi?: string, listingType?: string, status?: string): Promise<{
        data: {
            id: string;
            title: string;
            city: string;
            price: number;
            currencyCode: string;
            listingType: string;
            propertyType: string;
            aiValueScore: number;
            status: string;
            isFeatured: boolean;
            isVerified: boolean;
            createdAt: Date;
        }[];
        page: number;
        total: number;
        hasMore: boolean;
    } | {
        success: boolean;
        message: string;
        data: never[];
        page: number;
        total: number;
        hasMore: boolean;
    }>;
    getProperty(id: string): Promise<import("../entities").PropertyEntity>;
    patchProperty(id: string, body: {
        status?: string;
        isFeatured?: boolean;
        isVerified?: boolean;
        rejectReason?: string | null;
        title?: string;
        price?: number;
    }): Promise<import("../entities").PropertyEntity>;
    deleteProperty(id: string): Promise<{
        ok: boolean;
    }>;
    listUsers(page?: string, limit?: string): Promise<{
        data: import("../entities").UserEntity[];
        page: number;
        total: number;
        hasMore: boolean;
    }>;
    patchUser(id: string, body: {
        role?: string;
        accountStatus?: 'active' | 'blocked';
    }): Promise<import("../entities").UserEntity | null>;
    listLeads(page?: string, limit?: string): Promise<{
        data: import("../entities").LeadEntity[];
        page: number;
        total: number;
        hasMore: boolean;
    }>;
    patchLead(id: string, body: {
        status?: string;
    }): Promise<import("../entities").LeadEntity | null>;
    listSeo(): Promise<import("../entities").SeoPageEntity[]>;
    upsertSeo(body: {
        id?: string;
        pagePath: string;
        metaTitle: string;
        metaDescription: string;
        keywords?: string;
        canonicalUrl?: string;
        ogTitle?: string;
        ogDescription?: string;
        jsonLd?: string | null;
    }): Promise<import("../entities").SeoPageEntity | null>;
    deleteSeo(id: string): Promise<{
        ok: boolean;
    }>;
    getSettings(): Promise<import("../entities").AppSettingsEntity>;
    patchSettings(body: {
        defaultCurrency?: string;
        fxOverrides?: Record<string, number>;
        aiWeights?: {
            yieldWeight?: number;
            growthWeight?: number;
            riskWeight?: number;
        };
    }): Promise<import("../entities").AppSettingsEntity>;
    submitListing(body: Record<string, unknown>): Promise<(import("../entities").PropertyEntity & {
        trustBreakdown: import("../properties/property-public.util").TrustBreakdown;
        trustScore: number;
        dataCompleteness: number;
    }) | null>;
}
