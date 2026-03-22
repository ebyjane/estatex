import { apiUrl } from '@/lib/api';

/** Convert amount between ISO currency codes via backend FX. */
export async function convertFx(amount: number, from: string, to: string): Promise<number> {
  const f = (from || 'USD').toUpperCase();
  const t = (to || 'USD').toUpperCase();
  if (!Number.isFinite(amount) || f === t) return amount;
  const q = `amount=${encodeURIComponent(String(amount))}&from=${encodeURIComponent(f)}&to=${encodeURIComponent(t)}`;
  const r = await fetch(apiUrl(`/fx/convert?${q}`));
  if (!r.ok) throw new Error('FX convert failed');
  const d = (await r.json()) as { converted?: number };
  return typeof d.converted === 'number' ? d.converted : amount;
}
