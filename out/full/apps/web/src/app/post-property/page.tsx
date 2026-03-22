import type { Metadata } from 'next';
import { PostPropertyWizard } from './PostPropertyWizard';

export const metadata: Metadata = {
  title: 'Post a property | Investify',
  description: 'List your property on Investify — rent, sale, PG, or flatmates. Drafts auto-save; AI enrichment after submit.',
};

function firstQueryParam(v: string | string[] | undefined): string {
  if (typeof v === 'string') return v;
  if (Array.isArray(v) && v[0]) return v[0];
  return '';
}

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function PostPropertyPage({ searchParams }: PageProps) {
  const editQuery = firstQueryParam(searchParams?.edit).trim();
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 md:px-6">
      <div className="mx-auto max-w-3xl">
        <PostPropertyWizard editQuery={editQuery} />
      </div>
    </div>
  );
}
