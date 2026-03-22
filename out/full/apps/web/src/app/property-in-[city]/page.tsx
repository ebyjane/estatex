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
  const path = `/property-in-${params.city}`;
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
  const title = `Properties in ${label} | Investify — Buy & Rent`;
  const description = `Explore buy and rent listings in ${label} with AI scores, trust badges, and global investor tools.`;
  return { title, description, openGraph: { title, description } };
}

export default function PropertyInCityPage({ params }: { params: { city: string } }) {
  return (
    <CityHubTemplate
      params={params}
      mode="all"
      titlePrefix="Properties in"
      descriptionTemplate={(l) =>
        `Sale and rental inventory across ${l} — one hub for NRI, GCC, and US investors on Investify.`
      }
    />
  );
}
