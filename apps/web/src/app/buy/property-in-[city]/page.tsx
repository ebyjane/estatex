import type { Metadata } from 'next';
import Link from 'next/link';
import { ListingHubClient } from '@/components/seo/ListingHubClient';
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
  const path = `/buy/property-in-${params.city}`;
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
  const title = `Buy property in ${label} | EstateX.ai — AI value & trust scores`;
  const description = `Explore verified, AI-scored homes and apartments for sale in ${label}. Multi-currency (INR, USD, AED), rental yields, and global investor tools — data from EstateX only, no scraped listings.`;
  return {
    title,
    description,
    keywords: [
      `buy property ${label}`,
      `${label} real estate`,
      'AI property score',
      'NRI investment',
      'EstateX',
    ],
    openGraph: { title, description },
  };
}

export default function BuyInCityPage({ params }: { params: { city: string } }) {
  const city = slugToCity(params.city);
  const label = titleCase(city);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Buy property in ${label}`,
    description: `Listings for sale in ${label} on EstateX.ai`,
    url: `https://estatex.ai/buy/property-in-${params.city}`,
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="text-sm text-slate-500">
        <Link href="/" className="hover:text-cyan-400">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/properties" className="hover:text-cyan-400">
          Properties
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-300">Buy in {label}</span>
      </nav>
      <h1 className="mt-4 text-3xl font-bold text-white">Buy property in {label}</h1>
      <p className="mt-2 max-w-2xl text-slate-400">
        Curated sale listings with EstateX Score, Trust Score, and rental yield — built for serious
        cross-border investors. Listings expire after 30 days unless renewed (quality over stale
        inventory).
      </p>
      <div className="mt-10">
        <ListingHubClient city={city} listingType="sale" countryCode="IND" />
      </div>
    </div>
  );
}
