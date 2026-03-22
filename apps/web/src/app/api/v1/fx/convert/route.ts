import { NextRequest } from 'next/server';

/** Approximate mock FX (same-origin fallback when Nest is unavailable). Pivot: USD. */
const TO_USD: Record<string, number> = {
  USD: 1,
  INR: 1 / 83,
  AED: 1 / 3.67,
  EUR: 1 / 1.08,
  GBP: 1 / 1.27,
};

function convertAmount(amount: number, from: string, to: string): { converted: number; rate: number } {
  const f = (from || 'USD').toUpperCase();
  const t = (to || 'USD').toUpperCase();
  if (!Number.isFinite(amount)) return { converted: 0, rate: 0 };
  if (f === t) return { converted: amount, rate: 1 };

  const uf = TO_USD[f] ?? 1;
  const ut = TO_USD[t] ?? 1;
  const usd = amount * uf;
  const out = usd / ut;
  const rate = amount !== 0 ? out / amount : ut / uf;
  return { converted: out, rate };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const amount = Number(searchParams.get('amount') || 0);
  const from = searchParams.get('from') || 'USD';
  const to = searchParams.get('to') || 'USD';

  const { converted, rate } = convertAmount(amount, from, to);

  return Response.json({
    success: true,
    converted,
    rate,
  });
}
