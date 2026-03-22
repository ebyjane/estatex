/**
 * Suggested meta for city hub routes — matches copy used in `generateMetadata` fallbacks where possible.
 */

function slugToLabel(slug: string): string {
  const s = decodeURIComponent(slug).replace(/-/g, ' ');
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

export type SeoSuggestion = {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
};

/**
 * @param siteOrigin No trailing slash, e.g. https://investify.app or http://localhost:3002
 */
export function suggestSeoForPath(pagePath: string, siteOrigin = ''): SeoSuggestion | null {
  const raw = pagePath.trim();
  const p = raw.startsWith('/') ? raw : `/${raw}`;

  const hub = p.match(/^\/(buy-in|rent-in|property-in)-(.+)$/i);
  if (hub) {
    const kind = hub[1].toLowerCase();
    const slug = hub[2];
    const label = slugToLabel(slug);
    const base = siteOrigin.replace(/\/$/, '');
    const canonicalUrl = base ? `${base}${p}` : '';

    if (kind === 'buy-in') {
      const metaTitle = `Buy property in ${label} | Investify`;
      const metaDescription = `Browse AI-scored homes for sale in ${label}. Verified listings, yields, and multi-currency tools on Investify.`;
      return {
        metaTitle,
        metaDescription,
        keywords: `${label} property for sale, buy home ${label}, ${label} real estate, Investify, NRI investment`,
        canonicalUrl,
        ogTitle: metaTitle,
        ogDescription: metaDescription,
      };
    }
    if (kind === 'rent-in') {
      const metaTitle = `Rent in ${label} | Investify`;
      const metaDescription = `Find verified rental homes in ${label} with transparent pricing and AI rental insights.`;
      return {
        metaTitle,
        metaDescription,
        keywords: `rent ${label}, rental homes ${label}, ${label} apartments, Investify`,
        canonicalUrl,
        ogTitle: metaTitle,
        ogDescription: metaDescription,
      };
    }
    const metaTitle = `Properties in ${label} | Investify — Buy & Rent`;
    const metaDescription = `Explore buy and rent listings in ${label} with AI scores, trust badges, and global investor tools.`;
    return {
      metaTitle,
      metaDescription,
      keywords: `${label} properties, buy rent ${label}, real estate ${label}, Investify`,
      canonicalUrl,
      ogTitle: metaTitle,
      ogDescription: metaDescription,
    };
  }

  const buyNested = p.match(/^\/buy\/property-in-(.+)$/i);
  if (buyNested) {
    const slug = buyNested[1];
    const label = slugToLabel(slug);
    const base = siteOrigin.replace(/\/$/, '');
    const canonicalUrl = base ? `${base}${p}` : '';
    const metaTitle = `Buy property in ${label} | Investify — AI value & trust scores`;
    const metaDescription = `Explore verified, AI-scored homes and apartments for sale in ${label}. Multi-currency (INR, USD, AED), rental yields, and global investor tools.`;
    return {
      metaTitle,
      metaDescription,
      keywords: `buy property ${label}, ${label} real estate, AI property score, NRI investment, Investify`,
      canonicalUrl,
      ogTitle: metaTitle,
      ogDescription: metaDescription,
    };
  }

  return null;
}
