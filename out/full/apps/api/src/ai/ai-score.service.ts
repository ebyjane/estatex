import { Injectable } from '@nestjs/common';
import { calculateAIScore, type AIScoreInputs, type AIScoreResult } from '@real-estate/shared';

@Injectable()
export class AiScoreService {
  /**
   * Compute AI Value Score for a property using regional market data
   */
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
  }): AIScoreResult {
    const inputs: AIScoreInputs = {
      propertyYield: params.rentalYield,
      regionalAverageYield: params.regionalAvgYield,
      projectedGrowth: params.projectedGrowth,
      regionalGrowth: params.regionalGrowth,
      propertyPrice: params.propertyPrice,
      marketAvgPrice: params.marketAvgPrice,
      areaDemandIndex: params.areaDemandIndex ?? 50,
      legalRisk: params.legalRisk ?? 30,
      builderRisk: params.builderRisk ?? 30,
      marketVolatility: params.legalRisk ?? 25,
    };
    return calculateAIScore(inputs);
  }

  /**
   * From rental_estimate and price, derive yield and run full score
   */
  fromRentalEstimate(params: {
    price: number;
    rentalEstimate: number;
    regionalAvgYield: number;
    regionalGrowth: number;
    marketAvgPrice: number;
    areaDemandIndex?: number;
  }): AIScoreResult & { rentalYield: number } {
    const rentalYield = params.price > 0
      ? (params.rentalEstimate * 12 / params.price) * 100
      : 0;
    const projectedGrowth = params.regionalGrowth * 0.9 + Math.random() * 2;
    const result = this.computeScore({
      rentalYield,
      regionalAvgYield: params.regionalAvgYield,
      projectedGrowth,
      regionalGrowth: params.regionalGrowth,
      propertyPrice: params.price,
      marketAvgPrice: params.marketAvgPrice,
      areaDemandIndex: params.areaDemandIndex,
    });
    return { ...result, rentalYield };
  }
}
