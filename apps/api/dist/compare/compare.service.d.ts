import { Repository } from 'typeorm';
import { PropertyEntity } from '../entities/property.entity';
import { FxService } from '../fx/fx.service';
export declare class CompareService {
    private repo;
    private fx;
    constructor(repo: Repository<PropertyEntity>, fx: FxService);
    compare(propertyIds: string[], targetCurrency?: string): Promise<{
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
