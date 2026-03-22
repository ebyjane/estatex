'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function CalculatorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[calculator/error]', error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-6 py-16 text-center">
      <h1 className="text-xl font-semibold text-white">Calculator couldn&apos;t load</h1>
      <p className="mt-3 text-sm text-slate-400">{error.message}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-400"
        >
          Try again
        </button>
        <Link href="/" className="rounded-lg border border-white/15 px-4 py-2 text-sm text-slate-200">
          Home
        </Link>
      </div>
    </div>
  );
}
