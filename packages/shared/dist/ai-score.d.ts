/**
 * INVESTIFY — AI Value Score Mathematical Logic
 * Production-grade weighted formula for property investment scoring
 */
export declare const WEIGHTS: {
    readonly rentalYield: 0.3;
    readonly growth: 0.25;
    readonly priceAdvantage: 0.2;
    readonly locationDemand: 0.15;
    readonly riskPenalty: 0.1;
};
export type AICategory = 'UNDERVALUED' | 'FAIR' | 'PREMIUM' | 'HIGH_RISK';
export interface AIScoreInputs {
    propertyYield: number;
    regionalAverageYield: number;
    projectedGrowth: number;
    regionalGrowth: number;
    propertyPrice: number;
    marketAvgPrice: number;
    areaDemandIndex: number;
    legalRisk: number;
    builderRisk: number;
    marketVolatility: number;
}
export interface AIScoreResult {
    valueScore: number;
    riskScore: number;
    category: AICategory;
    breakdown: {
        yieldComponent: number;
        growthComponent: number;
        priceAdvantageComponent: number;
        demandComponent: number;
        riskPenaltyComponent: number;
    };
}
export declare function calculateAIScore(inputs: AIScoreInputs): AIScoreResult;
