import { CompareService } from './compare.service';
export declare class CompareController {
    private compareService;
    constructor(compareService: CompareService);
    getCompare(ids: string, currency?: string): Promise<{
        properties: never[];
        comparisons: never[];
    } | {
        properties: {
            id: string;
            title: string;
            price: number;
            currencyCode: string;
            priceInTarget: number;
            targetCurrency: string;
            aiValueScore: number;
            rentalYield: number | null;
            cagr5y: number | null;
            riskScore: number | null;
            city: string;
            propertyType: string;
        }[];
        comparisons?: undefined;
    }>;
}
