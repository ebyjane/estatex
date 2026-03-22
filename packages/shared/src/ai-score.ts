/**
 * INVESTIFY — AI Value Score Mathematical Logic
 * Production-grade weighted formula for property investment scoring
 */

export const WEIGHTS = {
  rentalYield: 0.30,
  growth: 0.25,
  priceAdvantage: 0.20,
  locationDemand: 0.15,
  riskPenalty: 0.10,
} as const;

export type AICategory = 'UNDERVALUED' | 'FAIR' | 'PREMIUM' | 'HIGH_RISK';

export interface AIScoreInputs {
  propertyYield: number;       // rental yield %
  regionalAverageYield: number;
  projectedGrowth: number;    // 5Y CAGR %
  regionalGrowth: number;
  propertyPrice: number;
  marketAvgPrice: number;
  areaDemandIndex: number;    // 0–100
  legalRisk: number;         // 0–100
  builderRisk: number;       // 0–100
  marketVolatility: number;  // 0–100
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

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function calculateAIScore(inputs: AIScoreInputs): AIScoreResult {
  const { rentalYield, growth, priceAdvantage, locationDemand, riskPenalty } = WEIGHTS;

  // Normalize yield (avoid div by zero)
  const normalizedYield = inputs.regionalAverageYield > 0
    ? (inputs.propertyYield / inputs.regionalAverageYield) * 100
    : inputs.propertyYield;

  // Normalize growth
  const normalizedGrowth = inputs.regionalGrowth > 0
    ? (inputs.projectedGrowth / inputs.regionalGrowth) * 100
    : inputs.projectedGrowth;

  // Price advantage: cheaper = higher score
  const priceAdvantageScore = inputs.marketAvgPrice > 0
    ? ((inputs.marketAvgPrice - inputs.propertyPrice) / inputs.marketAvgPrice) * 100
    : 50;

  const demandScore = clamp(inputs.areaDemandIndex, 0, 100);

  const riskScore = clamp(
    (inputs.legalRisk + inputs.builderRisk + inputs.marketVolatility) / 3,
    0,
    100
  );

  const yieldComponent = clamp(normalizedYield, 0, 100) * rentalYield;
  const growthComponent = clamp(normalizedGrowth, 0, 100) * growth;
  const priceAdvantageComponent = clamp(priceAdvantageScore, 0, 100) * priceAdvantage;
  const demandComponent = demandScore * locationDemand;
  const riskPenaltyComponent = riskScore * riskPenalty;

  const valueScore = clamp(
    Math.round(
      yieldComponent +
      growthComponent +
      priceAdvantageComponent +
      demandComponent -
      riskPenaltyComponent
    ),
    0,
    100
  );

  const category: AICategory =
    valueScore >= 80 ? 'UNDERVALUED' :
    valueScore >= 60 ? 'FAIR' :
    valueScore >= 40 ? 'PREMIUM' :
    'HIGH_RISK';

  return {
    valueScore,
    riskScore,
    category,
    breakdown: {
      yieldComponent,
      growthComponent,
      priceAdvantageComponent,
      demandComponent,
      riskPenaltyComponent,
    },
  };
}
