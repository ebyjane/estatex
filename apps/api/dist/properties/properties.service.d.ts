import { Repository } from 'typeorm';
import { PropertyEntity } from '../entities/property.entity';
import { CountryEntity } from '../entities/country.entity';
import { PropertyImageEntity } from '../entities/property-image.entity';
import { UserEntity } from '../entities/user.entity';
import { AiScoreService } from '../ai/ai-score.service';
export declare class PropertiesService {
    private repo;
    private countries;
    private images;
    private users;
    private aiScore;
    private readonly log;
    constructor(repo: Repository<PropertyEntity>, countries: Repository<CountryEntity>, images: Repository<PropertyImageEntity>, users: Repository<UserEntity>, aiScore: AiScoreService);
    findAll(filters: {
        countryId?: string;
        countryCode?: string;
        type?: string;
        listingType?: string;
        minPrice?: number;
        maxPrice?: number;
        minBedrooms?: number;
        maxBedrooms?: number;
        city?: string;
        minLat?: number;
        maxLat?: number;
        minLng?: number;
        maxLng?: number;
        currency?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        data: (PropertyEntity & {
            trustBreakdown: import("./property-public.util").TrustBreakdown;
            trustScore: number;
            dataCompleteness: number;
        })[];
        items: (PropertyEntity & {
            trustBreakdown: import("./property-public.util").TrustBreakdown;
            trustScore: number;
            dataCompleteness: number;
        })[];
        page: number;
        hasMore: boolean;
        total: number;
    }>;
    findOne(id: string): Promise<(PropertyEntity & {
        trustBreakdown: import("./property-public.util").TrustBreakdown;
        trustScore: number;
        dataCompleteness: number;
    }) | null>;
    findOnePublic(id: string): Promise<(PropertyEntity & {
        trustBreakdown: import("./property-public.util").TrustBreakdown;
        trustScore: number;
        dataCompleteness: number;
    }) | null>;
    submitPublicListing(dto: Record<string, unknown>, options?: {
        maxImages?: number;
        allowMultiVideo?: boolean;
        ownerUserId?: string;
    }): Promise<(PropertyEntity & {
        trustBreakdown: import("./property-public.util").TrustBreakdown;
        trustScore: number;
        dataCompleteness: number;
    }) | null>;
    canEditProperty(id: string, user: {
        id: string;
        role: string;
    }): Promise<{
        canEdit: boolean;
    }>;
    findOneForEdit(id: string, user: {
        id: string;
        role: string;
    }): Promise<PropertyEntity & {
        trustBreakdown: import("./property-public.util").TrustBreakdown;
        trustScore: number;
        dataCompleteness: number;
    } & {
        countryCode: string;
    }>;
    updateWithAuth(id: string, dto: Record<string, unknown>, user: {
        id: string;
        role: string;
    }): Promise<(PropertyEntity & {
        trustBreakdown: import("./property-public.util").TrustBreakdown;
        trustScore: number;
        dataCompleteness: number;
    }) | null>;
    create(dto: Partial<PropertyEntity>, userId?: string): Promise<PropertyEntity>;
    patchRaw(id: string, dto: Partial<PropertyEntity>): Promise<(PropertyEntity & {
        trustBreakdown: import("./property-public.util").TrustBreakdown;
        trustScore: number;
        dataCompleteness: number;
    }) | null>;
    getStats(): Promise<{
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
    addReport(id: string, _reason?: string): Promise<{
        ok: boolean;
        reportCount: number;
        fraudFlag: boolean;
    }>;
}
