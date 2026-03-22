'use client';

import { useEffect } from 'react';
import Link from 'next/link';

/** Route-level boundary so a render error on /properties never takes down the whole app shell. */
export default function PropertiesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[properties/error]', error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h1 className="text-xl font-semibold text-white">Properties couldn&apos;t load</h1>
      <p className="mt-3 text-sm text-slate-400">
        {error.message || 'Something went wrong while rendering this page.'}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-400"
        >
          Try again
        </button>
        <Link href="/" className="rounded-lg border border-white/15 px-4 py-2 text-sm text-slate-200 hover:bg-white/5">
          Home
        </Link>
      </div>
      <p className="mt-8 text-xs text-slate-600">
        If this keeps happening, stop the dev server, run <code className="text-slate-500">npm run clean</code> in{' '}
        <code className="text-slate-500">apps/web</code>, then <code className="text-slate-500">npm run dev:clean</code>{' '}
        from the repo root.
      </p>
    </div>
  );
}
