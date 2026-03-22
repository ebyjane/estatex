import { Injectable } from '@nestjs/common';

// Fallback rates when API is unavailable
const FALLBACK_RATES: Record<string, number> = {
  'INR-USD': 0.012,
  'USD-INR': 83,
  'AED-USD': 0.27,
  'USD-AED': 3.67,
  'USD-USD': 1,
  'INR-INR': 1,
};

@Injectable()
export class FxService {
  async getRate(from: string, to: string): Promise<number> {
    const key = `${from.toUpperCase()}-${to.toUpperCase()}`;
    if (from.toUpperCase() === to.toUpperCase()) return 1;
    const fallback = FALLBACK_RATES[key] || FALLBACK_RATES[`${to}-${from}`];
    if (fallback) return fallback;

    const apiKey = process.env.FX_API_KEY;
    if (apiKey) {
      try {
        const res = await fetch(
          `https://api.exchangerate-api.com/v4/latest/${from}`
        );
        const data = await res.json();
        return data.rates?.[to] ?? 1;
      } catch {
        return 1;
      }
    }
    return FALLBACK_RATES[key] ?? 1;
  }

  async convert(amount: number, from: string, to: string) {
    const rate = await this.getRate(from, to);
    return { amount, from, to, rate, converted: Math.round(amount * rate * 100) / 100 };
  }
}
