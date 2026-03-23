import { Repository } from 'typeorm';
import { PropertyEntity } from '../entities/property.entity';
import { UserEntity } from '../entities/user.entity';
import { LeadEntity } from '../entities/lead.entity';
import { SeoPageEntity } from '../entities/seo-page.entity';
import { AppSettingsEntity } from '../entities/app-settings.entity';
import { PropertyImageEntity } from '../entities/property-image.entity';
import { InvestmentEntity } from '../entities/investment.entity';
import { DemoSeedService } from './demo-seed.service';
export declare class AdminPanelService {
    private readonly demoSeed;
    private readonly props;
    private readonly users;
    private readonly leads;
    private readonly seo;
    private readonly settingsRepo;
    private readonly images;
    private readonly investments;
    private readonly log;
    private ingestionLog;
    constructor(demoSeed: DemoSeedService, props: Repository<PropertyEntity>, users: Repository<UserEntity>, leads: Repository<LeadEntity>, seo: Repository<SeoPageEntity>, settingsRepo: Repository<AppSettingsEntity>, images: Repository<PropertyImageEntity>, investments: Repository<InvestmentEntity>);
    private safeEnsureDemoCatalog;
    private safeExec;
    pushIngestion(action: string, detail: string): void;
    getIngestionLogs(): {
        at: string;
        action: string;
        detail: string;
    }[];
    ensureSettingsRow(): Promise<AppSettingsEntity>;
    fallbackOverviewResponse(): {
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
    };
    fallbackPropertiesList(page?: number): {
        data: never[];
        page: number;
        total: number;
        hasMore: boolean;
    };
    private emptyOverview;
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
    }>;
    private buildAdminPropertyWhere;
    private mapPropertyAdminRow;
    listProperties(q: {
        page?: number;
        limit?: number;
        city?: string;
        minPrice?: number;
        maxPrice?: number;
        minAi?: number;
        listingType?: string;
        status?: string;
    }): Promise<{
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
    }>;
    getPropertyAdmin(id: string): Promise<PropertyEntity>;
    patchProperty(id: string, body: {
        status?: string;
        isFeatured?: boolean;
        isVerified?: boolean;
        rejectReason?: string | null;
        title?: string;
        price?: number;
    }): Promise<PropertyEntity>;
    deleteProperty(id: string): Promise<{
        ok: boolean;
    }>;
    listUsers(page?: number, limit?: number): Promise<{
        data: UserEntity[];
        page: number;
        total: number;
        hasMore: boolean;
    }>;
    patchUser(id: string, body: {
        role?: string;
        accountStatus?: 'active' | 'blocked';
    }): Promise<UserEntity | null>;
    listLeads(page?: number, limit?: number): Promise<{
        data: LeadEntity[];
        page: number;
        total: number;
        hasMore: boolean;
    }>;
    patchLead(id: string, body: {
        status?: string;
    }): Promise<LeadEntity | null>;
    listSeo(): Promise<SeoPageEntity[]>;
    buildDefaultJsonLd(meta: {
        metaTitle: string;
        metaDescription: string;
        canonicalUrl?: string | null;
        pagePath: string;
    }): string;
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
    }): Promise<SeoPageEntity | null>;
    deleteSeo(id: string): Promise<{
        ok: boolean;
    }>;
    getSettings(): Promise<AppSettingsEntity>;
    patchSettings(body: {
        defaultCurrency?: string;
        fxOverrides?: Record<string, number>;
        aiWeights?: {
            yieldWeight?: number;
            growthWeight?: number;
            riskWeight?: number;
        };
    }): Promise<AppSettingsEntity>;
}
