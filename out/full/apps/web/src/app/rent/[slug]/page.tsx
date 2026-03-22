import type { Metadata } from 'next';
import Link from 'next/link';
import { ListingHubClient } from '@/components/seo/ListingHubClient';

function parseSlug(slug: string): { bhk: number; city: string } | null {
  const m = slug.match(/^(\d+)bhk-in-(.+)$/i);
  if (!m) return null;
  return { bhk: parseInt(m[1], 10), city: decodeURIComponent(m[2]).replace(/-/g, ' ') };
}

function titleCase(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const p = parseSlug(params.slug);
  if (!p) {
    return { title: 'Rentals | Investify' };
  }
  const c = titleCase(p.city);
  const title = `${p.bhk} BHK for rent in ${c} | Investify`;
  const description = `Find ${p.bhk} BHK rental homes in ${c} with trust-verified listings and AI insights. Investify — global investor-grade search (no scraped portal data).`;
  return {
    title,
    description,
    keywords: [`${p.bhk} BHK rent ${c}`, `${c} rental`, 'verified rental', 'Investify'],
    openGraph: { title, description },
  };
}

export default function RentSlugPage({ params }: { params: { slug: string } }) {
  const p = parseSlug(params.slug);
  if (!p) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-24 text-center text-slate-400">
        Invalid URL. Use <code className="text-slate-500">/rent/2bhk-in-mumbai</code> format.
        <div className="mt-6">
          <Link href="/properties" className="text-cyan-400 hover:underline">
            All properties
          </Link>
        </div>
      </div>
    );
  }

  const label = titleCase(p.city);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${p.bhk} BHK rentals in ${label}`,
    numberOfItems: 0,
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
        <span className="text-slate-300">
          {p.bhk} BHK rent — {label}
        </span>
      </nav>
      <h1 className="mt-4 text-3xl font-bold text-white">
        {p.bhk} BHK for rent in {label}
      </h1>
      <p className="mt-2 max-w-2xl text-slate-400">
        Rental-focused view with the same trust and AI signals as purchase listings. Data is
        supplied by Investify partners and synthetic demo rows — never scraped from competitor sites.
      </p>
      <div className="mt-10">
        <ListingHubClient
          city={p.city}
          listingType="rent"
          minBedrooms={p.bhk}
          maxBedrooms={p.bhk}
          countryCode="IND"
        />
      </div>
    </div>
  );
}
