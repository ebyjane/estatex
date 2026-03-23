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
exports.FxController = void 0;
const common_1 = require("@nestjs/common");
const fx_service_1 = require("./fx.service");
let FxController = class FxController {
    constructor(fx) {
        this.fx = fx;
    }
    async latest(from = 'USD', to = 'INR') {
        try {
            const rate = await this.fx.getRate(from, to);
            return { from, to, rate };
        }
        catch (error) {
            console.error('GET /fx/latest', error);
            return {
                success: false,
                data: null,
                from,
                to,
                rate: 1,
                message: error instanceof Error ? error.message : 'FX rate failed',
            };
        }
    }
    async convert(amount, from = 'USD', to = 'INR') {
        try {
            return await this.fx.convert(+(amount || 1000), from, to);
        }
        catch (error) {
            console.error('GET /fx/convert', error);
            const amt = +(amount || 0);
            return {
                success: false,
                data: null,
                amount: amt,
                from,
                to,
                rate: 0,
                converted: amt,
                message: error instanceof Error ? error.message : 'FX convert failed',
            };
        }
    }
};
exports.FxController = FxController;
__decorate([
    (0, common_1.Get)('latest'),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FxController.prototype, "latest", null);
__decorate([
    (0, common_1.Get)('convert'),
    __param(0, (0, common_1.Query)('amount')),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], FxController.prototype, "convert", null);
exports.FxController = FxController = __decorate([
    (0, common_1.Controller)('fx'),
    __metadata("design:paramtypes", [fx_service_1.FxService])
], FxController);
//# sourceMappingURL=fx.controller.js.map