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
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const ai_search_service_1 = require("./ai-search.service");
class AiSearchDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], AiSearchDto.prototype, "query", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AiSearchDto.prototype, "countryCode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AiSearchDto.prototype, "countryId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['any', 'city', 'address']),
    __metadata("design:type", String)
], AiSearchDto.prototype, "placeScope", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], AiSearchDto.prototype, "explicitCity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], AiSearchDto.prototype, "explicitAddress", void 0);
let AiController = class AiController {
    constructor(searchSvc) {
        this.searchSvc = searchSvc;
    }
    search(body) {
        const q = (body.query ?? '').trim();
        const ec = (body.explicitCity ?? '').trim();
        const ea = (body.explicitAddress ?? '').trim();
        if (q.length < 2 && ec.length < 2 && ea.length < 2) {
            throw new common_1.BadRequestException('Enter at least 2 characters in the search box, or in City or Address.');
        }
        return this.searchSvc.search(q, {
            countryCode: body.countryCode?.trim() || undefined,
            countryId: body.countryId?.trim() || undefined,
            placeScope: body.placeScope,
            explicitCity: ec || undefined,
            explicitAddress: ea || undefined,
        });
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Post)('search'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AiSearchDto]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "search", null);
exports.AiController = AiController = __decorate([
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [ai_search_service_1.AiSearchService])
], AiController);
//# sourceMappingURL=ai.controller.js.map