"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiScoreService = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@real-estate/shared");
let AiScoreService = class AiScoreService {
    computeScore(params) {
        const inputs = {
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
        return (0, shared_1.calculateAIScore)(inputs);
    }
    fromRentalEstimate(params) {
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
};
exports.AiScoreService = AiScoreService;
exports.AiScoreService = AiScoreService = __decorate([
    (0, common_1.Injectable)()
], AiScoreService);
//# sourceMappingURL=ai-score.service.js.map