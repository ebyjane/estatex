import Link from 'next/link';
import { ListingHubClient } from '@/components/seo/ListingHubClient';

function slugToCity(slug: string) {
  return decodeURIComponent(slug).replace(/-/g, ' ');
}

function titleCase(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function CityHubTemplate({
  params,
  mode,
  titlePrefix,
  descriptionTemplate,
}: {
  params: { city: string };
  mode: 'sale' | 'rent' | 'all';
  titlePrefix: string;
  descriptionTemplate: (label: string) => string;
}) {
  const city = slugToCity(params.city);
  const label = titleCase(city);
  const listingType = mode === 'sale' ? 'sale' : mode === 'rent' ? 'rent' : undefined;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <nav className="text-sm text-slate-500">
        <Link href="/" className="hover:text-cyan-400">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/properties" className="hover:text-cyan-400">
          Properties
        </Link>
      </nav>
      <h1 className="mt-4 text-3xl font-bold text-white">
        {titlePrefix} {label}
      </h1>
      <p className="mt-2 max-w-2xl text-slate-400">{descriptionTemplate(label)}</p>
      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link
          href={`/buy-in-${params.city}`}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-slate-300 hover:border-cyan-500/40"
        >
          Buy
        </Link>
        <Link
          href={`/rent-in-${params.city}`}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-slate-300 hover:border-cyan-500/40"
        >
          Rent
        </Link>
        <Link
          href={`/property-in-${params.city}`}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-slate-300 hover:border-cyan-500/40"
        >
          All
        </Link>
      </div>
      <div className="mt-10">
        <ListingHubClient city={city} listingType={listingType} countryCode="IND" />
      </div>
    </div>
  );
}
