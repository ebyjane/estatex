"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompareService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const property_entity_1 = require("../entities/property.entity");
const fx_service_1 = require("../fx/fx.service");
let CompareService = class CompareService {
    constructor(repo, fx) {
        this.repo = repo;
        this.fx = fx;
    }
    async compare(propertyIds, targetCurrency = 'USD') {
        const ids = propertyIds.slice(0, 3);
        if (ids.length === 0)
            return { properties: [], comparisons: [] };
        const properties = await this.repo.find({
            where: { id: (0, typeorm_2.In)(ids) },
            relations: ['images'],
        });
        const comparisons = await Promise.all(properties.map(async (p) => {
            const rate = await this.fx.getRate(p.currencyCode, targetCurrency);
            const priceInTarget = Number(p.price) * rate;
            return {
                id: p.id,
                title: p.title,
                price: Number(p.price),
                currencyCode: p.currencyCode,
                priceInTarget,
                targetCurrency,
                aiValueScore: p.aiValueScore,
                rentalYield: p.rentalYield ? Number(p.rentalYield) : null,
                cagr5y: p.cagr5y ? Number(p.cagr5y) : null,
                riskScore: p.riskScore ? Number(p.riskScore) : null,
                city: p.city,
                propertyType: p.propertyType,
            };
        }));
        return { properties: comparisons };
    }
};
exports.CompareService = CompareService;
exports.CompareService = CompareService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(property_entity_1.PropertyEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        fx_service_1.FxService])
], CompareService);
//# sourceMappingURL=compare.service.js.map