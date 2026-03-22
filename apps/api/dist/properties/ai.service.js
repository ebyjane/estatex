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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const openai_1 = require("openai");
let AiService = class AiService {
    constructor() {
        this.openai = null;
        const key = process.env.OPENAI_API_KEY;
        if (key)
            this.openai = new openai_1.default({ apiKey: key });
    }
    async generateDescription(property) {
        if (!this.openai) {
            return `Premium ${property.propertyType || 'property'} in ${property.city || 'prime location'}. ${property.bedrooms ? property.bedrooms + ' bed' : ''} ${property.bathrooms ? property.bathrooms + ' bath' : ''}. ${property.areaSqft ? property.areaSqft + ' sqft' : ''}.`;
        }
        const res = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'Generate a professional real estate listing description (2-3 sentences) for investment-focused buyers.',
                },
                {
                    role: 'user',
                    content: JSON.stringify(property),
                },
            ],
            max_tokens: 150,
        });
        return res.choices[0]?.message?.content?.trim() || '';
    }
    async suggestPrice(property) {
        if (!this.openai) {
            const base = property.currentPrice || (property.areaSqft ? property.areaSqft * 150 : 100000);
            return { suggestedPrice: Math.round(base * 1.05), reasoning: 'Offline fallback suggestion.' };
        }
        const res = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'Suggest a fair market price for this property. Respond with JSON: { "suggestedPrice": number, "reasoning": "brief" }',
                },
                {
                    role: 'user',
                    content: JSON.stringify(property),
                },
            ],
            max_tokens: 200,
        });
        try {
            const text = res.choices[0]?.message?.content || '{}';
            const parsed = JSON.parse(text.replace(/```json?\n?/g, '').trim());
            return { suggestedPrice: parsed.suggestedPrice || property.currentPrice, reasoning: parsed.reasoning || '' };
        }
        catch {
            return {
                suggestedPrice: property.currentPrice || 100000,
                reasoning: 'AI price suggestion unavailable.',
            };
        }
    }
    async valuate(property) {
        const baseScore = 60;
        const areaBonus = property.areaSqft && property.areaSqft > 1500 ? 10 : 0;
        const locBonus = property.latitude ? 5 : 0;
        const valueScore = Math.min(100, baseScore + areaBonus + locBonus + Math.floor(Math.random() * 15));
        const rentalYield = 4 + Math.random() * 4;
        const cagr5y = 6 + Math.random() * 4;
        const riskScore = 3 + Math.random() * 2;
        return { valueScore, rentalYield, cagr5y, riskScore };
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AiService);
//# sourceMappingURL=ai.service.js.map