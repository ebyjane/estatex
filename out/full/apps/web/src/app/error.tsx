'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 p-6">
      <h2 className="text-xl font-semibold text-white">Something went wrong</h2>
      <p className="text-slate-400 text-sm text-center max-w-md">{error.message || 'An error occurred.'}</p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-lg bg-cyan-500 px-4 py-2 text-white font-medium hover:bg-cyan-600 transition"
      >
        Try again
      </button>
      <Link href="/" className="text-cyan-400 hover:underline text-sm">Go home</Link>
    </div>
  );
}
