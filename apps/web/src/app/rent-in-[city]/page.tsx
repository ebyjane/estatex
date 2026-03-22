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
  const path = `/rent-in-${params.city}`;
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
  const title = `Rent in ${label} | EstateX.ai`;
  const description = `Find verified rental homes in ${label} with transparent pricing and AI rental insights.`;
  return { title, description, openGraph: { title, description } };
}

export default function RentInCityPage({ params }: { params: { city: string } }) {
  return (
    <CityHubTemplate
      params={params}
      mode="rent"
      titlePrefix="Rent in"
      descriptionTemplate={(l) =>
        `Long- and short-term rentals in ${l} — filter by budget, BHK, and trust score on EstateX.`
      }
    />
  );
}
