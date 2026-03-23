"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
let StripeService = class StripeService {
    async createCheckoutSession(params) {
        if (!STRIPE_KEY) {
            return { url: `${params.successUrl}?session_id=dev_${Date.now()}`, sessionId: 'dev' };
        }
        return { url: `${params.successUrl}?session_id=dev_${Date.now()}`, sessionId: 'dev' };
    }
    async createCustomerPortalSession(customerId, returnUrl) {
        if (!STRIPE_KEY)
            return { url: returnUrl };
        return { url: returnUrl };
    }
    async handleWebhook(payload, signature) {
        return { received: true };
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = __decorate([
    (0, common_1.Injectable)()
], StripeService);
//# sourceMappingURL=stripe.service.js.map