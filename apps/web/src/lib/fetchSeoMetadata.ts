import { apiUrl } from '@/lib/api';

export type SeoPagePayload = {
  pagePath: string;
  metaTitle: string;
  metaDescription: string;
  keywords?: string | null;
  canonicalUrl?: string | null;
  openGraph?: { title?: string; description?: string };
  jsonLd?: string | null;
};

/** Server-side: merge with defaults for hub pages. */
export async function fetchSeoPage(path: string): Promise<SeoPagePayload | null> {
  try {
    const u = `${apiUrl('/seo/page')}?path=${encodeURIComponent(path)}`;
    const res = await fetch(u, { next: { revalidate: 120 } });
    if (!res.ok) return null;
    const data = (await res.json()) as SeoPagePayload | null;
    return data && data.metaTitle ? data : null;
  } catch {
    return null;
  }
}
