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
exports.PropertiesController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const ai_service_1 = require("./ai.service");
const properties_service_1 = require("./properties.service");
let PropertiesController = class PropertiesController {
    constructor(service, ai, jwt) {
        this.service = service;
        this.ai = ai;
        this.jwt = jwt;
    }
    stats() {
        return this.service.getStats();
    }
    localityInsights(city, countryCode) {
        return this.service.localityInsights(city || '', countryCode);
    }
    priceTrends(city, countryCode) {
        return this.service.priceTrends(city || '', countryCode);
    }
    list(countryId, countryCode, type, listingType, minPrice, maxPrice, minBedrooms, maxBedrooms, city, minLat, maxLat, minLng, maxLng, limit, page, offset, flat, format) {
        const wantArray = flat === '1' || flat === 'true' || format?.toLowerCase() === 'array';
        const limitNum = limit ? Math.min(500, Math.max(1, Number(limit) || 20)) : 20;
        let offsetNum = 0;
        if (page != null && page !== '') {
            const p = Math.max(1, Math.floor(Number(page)) || 1);
            offsetNum = (p - 1) * limitNum;
        }
        else if (offset != null && offset !== '') {
            offsetNum = Math.max(0, Math.floor(Number(offset)) || 0);
        }
        const payload = this.service.findAll({
            countryId,
            countryCode: countryCode?.trim() || undefined,
            type,
            listingType,
            minPrice: minPrice ? +minPrice : undefined,
            maxPrice: maxPrice ? +maxPrice : undefined,
            minBedrooms: minBedrooms ? +minBedrooms : undefined,
            maxBedrooms: maxBedrooms ? +maxBedrooms : undefined,
            city: city?.trim() || undefined,
            minLat: minLat ? +minLat : undefined,
            maxLat: maxLat ? +maxLat : undefined,
            minLng: minLng ? +minLng : undefined,
            maxLng: maxLng ? +maxLng : undefined,
            limit: limitNum,
            offset: offsetNum,
        });
        if (wantArray) {
            return payload.then((p) => p.items);
        }
        return payload;
    }
    submitListing(body, auth) {
        let ownerUserId;
        if (auth?.startsWith('Bearer ')) {
            try {
                const payload = this.jwt.verify(auth.slice(7));
                ownerUserId = payload.sub;
            }
            catch {
            }
        }
        return this.service.submitPublicListing(body, { ownerUserId });
    }
    canEdit(id, user) {
        return this.service.canEditProperty(id, user);
    }
    forEdit(id, user) {
        return this.service.findOneForEdit(id, user);
    }
    one(id) {
        return this.service.findOnePublic(id);
    }
    create(dto, user) {
        return this.service.create(dto, user.id);
    }
    patch(id, dto, user) {
        return this.service.updateWithAuth(id, dto, user);
    }
    report(id, body) {
        return this.service.addReport(id, body?.reason);
    }
    aiDescription(id) {
        return this.service.findOne(id).then(async (p) => {
            if (!p)
                return { description: '' };
            const description = await this.ai.generateDescription({
                title: p.title,
                propertyType: p.propertyType || undefined,
                bedrooms: p.bedrooms || undefined,
                bathrooms: p.bathrooms || undefined,
                areaSqft: p.areaSqft ? +p.areaSqft : undefined,
                city: p.city || undefined,
            });
            return { description };
        });
    }
    aiValuate(id) {
        return this.service.findOne(id).then(async (p) => {
            if (!p)
                return null;
            const result = await this.ai.valuate(p);
            await this.service.patchRaw(id, {
                aiValueScore: result.valueScore,
                rentalYield: result.rentalYield,
                cagr5y: result.cagr5y,
                riskScore: result.riskScore,
            });
            return result;
        });
    }
};
exports.PropertiesController = PropertiesController;
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)('insights/locality'),
    __param(0, (0, common_1.Query)('city')),
    __param(1, (0, common_1.Query)('countryCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "localityInsights", null);
__decorate([
    (0, common_1.Get)('insights/price-trends'),
    __param(0, (0, common_1.Query)('city')),
    __param(1, (0, common_1.Query)('countryCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "priceTrends", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('countryId')),
    __param(1, (0, common_1.Query)('countryCode')),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, common_1.Query)('listingType')),
    __param(4, (0, common_1.Query)('minPrice')),
    __param(5, (0, common_1.Query)('maxPrice')),
    __param(6, (0, common_1.Query)('minBedrooms')),
    __param(7, (0, common_1.Query)('maxBedrooms')),
    __param(8, (0, common_1.Query)('city')),
    __param(9, (0, common_1.Query)('minLat')),
    __param(10, (0, common_1.Query)('maxLat')),
    __param(11, (0, common_1.Query)('minLng')),
    __param(12, (0, common_1.Query)('maxLng')),
    __param(13, (0, common_1.Query)('limit')),
    __param(14, (0, common_1.Query)('page')),
    __param(15, (0, common_1.Query)('offset')),
    __param(16, (0, common_1.Query)('flat')),
    __param(17, (0, common_1.Query)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('submit-listing'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "submitListing", null);
__decorate([
    (0, common_1.Get)(':id/can-edit'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "canEdit", null);
__decorate([
    (0, common_1.Get)(':id/for-edit'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "forEdit", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "one", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "patch", null);
__decorate([
    (0, common_1.Post)(':id/report'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "report", null);
__decorate([
    (0, common_1.Post)(':id/ai/description'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "aiDescription", null);
__decorate([
    (0, common_1.Post)(':id/ai/valuate'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "aiValuate", null);
exports.PropertiesController = PropertiesController = __decorate([
    (0, common_1.Controller)('properties'),
    __metadata("design:paramtypes", [properties_service_1.PropertiesService,
        ai_service_1.AiService,
        jwt_1.JwtService])
], PropertiesController);
//# sourceMappingURL=properties.controller.js.map