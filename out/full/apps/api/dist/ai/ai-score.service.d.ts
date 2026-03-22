import { type AIScoreResult } from '@real-estate/shared';
export declare class AiScoreService {
    computeScore(params: {
        rentalYield: number;
        regionalAvgYield: number;
        projectedGrowth: number;
        regionalGrowth: number;
        propertyPrice: number;
        marketAvgPrice: number;
        areaDemandIndex?: number;
        legalRisk?: number;
        builderRisk?: number;
    }): AIScoreResult;
    fromRentalEstimate(params: {
        price: number;
        rentalEstimate: number;
        regionalAvgYield: number;
        regionalGrowth: number;
        marketAvgPrice: number;
        areaDemandIndex?: number;
    }): AIScoreResult & {
        rentalYield: number;
    };
}
