import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private openai: OpenAI | null = null;

  constructor() {
    const key = process.env.OPENAI_API_KEY;
    if (key) this.openai = new OpenAI({ apiKey: key });
  }

  async generateDescription(property: {
    title: string;
    propertyType?: string;
    bedrooms?: number;
    bathrooms?: number;
    areaSqft?: number;
    city?: string;
  }): Promise<string> {
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

  async suggestPrice(property: {
    title: string;
    propertyType?: string;
    bedrooms?: number;
    areaSqft?: number;
    city?: string;
    countryCode?: string;
    currentPrice?: number;
  }): Promise<{ suggestedPrice: number; reasoning: string }> {
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
    } catch {
      return {
        suggestedPrice: property.currentPrice || 100000,
        reasoning: 'AI price suggestion unavailable.',
      };
    }
  }

  async valuate(property: { areaSqft?: number; latitude?: number }): Promise<{
    valueScore: number;
    rentalYield: number;
    cagr5y: number;
    riskScore: number;
  }> {
    // Simplified valuation - in prod use ML model or richer AI
    const baseScore = 60;
    const areaBonus = property.areaSqft && property.areaSqft > 1500 ? 10 : 0;
    const locBonus = property.latitude ? 5 : 0;
    const valueScore = Math.min(100, baseScore + areaBonus + locBonus + Math.floor(Math.random() * 15));

    const rentalYield = 4 + Math.random() * 4;
    const cagr5y = 6 + Math.random() * 4;
    const riskScore = 3 + Math.random() * 2;

    return { valueScore, rentalYield, cagr5y, riskScore };
  }
}
