'use client';

import { useEffect } from 'react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[admin]', error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg p-6 text-center text-white">
      <h1 className="text-xl font-semibold">Error loading admin</h1>
      <p className="mt-2 text-sm text-slate-400">{error.message}</p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-400"
      >
        Try again
      </button>
    </div>
  );
}
