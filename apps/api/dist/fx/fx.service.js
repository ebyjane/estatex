"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FxService = void 0;
const common_1 = require("@nestjs/common");
const FALLBACK_RATES = {
    'INR-USD': 0.012,
    'USD-INR': 83,
    'AED-USD': 0.27,
    'USD-AED': 3.67,
    'USD-USD': 1,
    'INR-INR': 1,
};
let FxService = class FxService {
    async getRate(from, to) {
        const key = `${from.toUpperCase()}-${to.toUpperCase()}`;
        if (from.toUpperCase() === to.toUpperCase())
            return 1;
        const fallback = FALLBACK_RATES[key] || FALLBACK_RATES[`${to}-${from}`];
        if (fallback)
            return fallback;
        const apiKey = process.env.FX_API_KEY;
        if (apiKey) {
            try {
                const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
                const data = await res.json();
                return data.rates?.[to] ?? 1;
            }
            catch {
                return 1;
            }
        }
        return FALLBACK_RATES[key] ?? 1;
    }
    async convert(amount, from, to) {
        const rate = await this.getRate(from, to);
        return { amount, from, to, rate, converted: Math.round(amount * rate * 100) / 100 };
    }
};
exports.FxService = FxService;
exports.FxService = FxService = __decorate([
    (0, common_1.Injectable)()
], FxService);
//# sourceMappingURL=fx.service.js.map