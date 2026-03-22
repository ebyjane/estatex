import { Repository } from 'typeorm';
import { PropertyEntity } from '../entities/property.entity';
import { CountryEntity } from '../entities/country.entity';
export interface AiSearchFilters {
    bedroomsMin?: number;
    cityPattern?: string;
    textPlace?: string;
    maxPrice?: number;
    propertyType?: string;
    sortByYield?: boolean;
}
export declare class AiSearchService {
    private readonly repo;
    private readonly countries;
    constructor(repo: Repository<PropertyEntity>, countries: Repository<CountryEntity>);
    parseQuery(q: string): AiSearchFilters;
    private applyPlaceNeedle;
    search(rawQuery: string, opts?: {
        countryCode?: string;
        countryId?: string;
        placeScope?: 'any' | 'city' | 'address';
        explicitCity?: string;
        explicitAddress?: string;
    }): Promise<{
        items: (PropertyEntity & {
            aiRecommended?: boolean;
        })[];
        total: number;
        parsed: AiSearchFilters;
    }>;
    sampleVideoUrl(): string;
}
