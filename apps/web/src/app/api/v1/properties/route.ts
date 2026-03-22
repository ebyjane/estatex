import { NextRequest } from 'next/server';
import { MOCK_PROPERTIES } from '@/utils/mockProperties';

function filterByCountryCode<T extends { currencyCode?: string }>(
  items: readonly T[],
  code: string | null,
): T[] {
  if (!code || code === 'all') return [...items];
  if (code === 'IND') return items.filter((p) => p.currencyCode === 'INR');
  if (code === 'UAE') return items.filter((p) => p.currencyCode === 'AED');
  if (code === 'USA') return items.filter((p) => p.currencyCode === 'USD');
  return [...items];
}

/**
 * Fallback listing data when the Nest API is not deployed (e.g. Vercel-only frontend).
 * Matches shapes accepted by `parsePropertiesPageResponse` / `normalizePropertiesResponse`.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 20, 1), 400);
  const page = Math.max(Number(searchParams.get('page')) || 1, 1);
  const countryCode = searchParams.get('countryCode');

  let list = filterByCountryCode(MOCK_PROPERTIES, countryCode);
  const start = (page - 1) * limit;
  const pageItems = list.slice(start, start + limit);
  const hasMore = start + pageItems.length < list.length;

  return Response.json({
    success: true,
    data: pageItems,
    page,
    hasMore,
    total: list.length,
  });
}
