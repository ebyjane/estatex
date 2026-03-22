import type { Metadata } from 'next';
import { CityHubTemplate } from '@/components/seo/CityHubTemplate';
import { fetchSeoPage } from '@/lib/fetchSeoMetadata';

function slugToCity(slug: string) {
  return decodeURIComponent(slug).replace(/-/g, ' ');
}

function titleCase(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function generateMetadata({
  params,
}: {
  params: { city: string };
}): Promise<Metadata> {
  const path = `/buy-in-${params.city}`;
  const seo = await fetchSeoPage(path);
  if (seo) {
    return {
      title: seo.metaTitle,
      description: seo.metaDescription,
      keywords: seo.keywords?.split(',').map((k) => k.trim()),
      alternates: seo.canonicalUrl ? { canonical: seo.canonicalUrl } : undefined,
      openGraph: {
        title: seo.openGraph?.title ?? seo.metaTitle,
        description: seo.openGraph?.description ?? seo.metaDescription,
      },
    };
  }
  const label = titleCase(slugToCity(params.city));
  const title = `Buy property in ${label} | EstateX.ai`;
  const description = `Browse AI-scored homes for sale in ${label}. Verified listings, yields, and multi-currency tools.`;
  return { title, description, openGraph: { title, description } };
}

export default function BuyInCityPage({ params }: { params: { city: string } }) {
  return (
    <CityHubTemplate
      params={params}
      mode="sale"
      titlePrefix="Buy property in"
      descriptionTemplate={(l) =>
        `Curated sale listings in ${l} with EstateX AI value scores and trust signals — data from our platform only.`
      }
    />
  );
}
