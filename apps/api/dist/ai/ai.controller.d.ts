import { AiSearchService } from './ai-search.service';
declare class AiSearchDto {
    query?: string;
    countryCode?: string;
    countryId?: string;
    placeScope?: 'any' | 'city' | 'address';
    explicitCity?: string;
    explicitAddress?: string;
}
export declare class AiController {
    private readonly searchSvc;
    constructor(searchSvc: AiSearchService);
    search(body: AiSearchDto): Promise<{
        items: (import("../entities").PropertyEntity & {
            aiRecommended?: boolean;
        })[];
        total: number;
        parsed: import("./ai-search.service").AiSearchFilters;
    }>;
}
export {};
