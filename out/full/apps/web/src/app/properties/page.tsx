import { Suspense } from 'react';
import { PropertiesView } from './PropertiesView';

function PropertiesFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-slate-950">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
    </div>
  );
}

/**
 * Server Component wrapper: `useSearchParams` lives in PropertiesView under this Suspense.
 * Prevents dev-time 500s and the "missing required error components" loop.
 */
export default function PropertiesPage() {
  return (
    <Suspense fallback={<PropertiesFallback />}>
      <PropertiesView />
    </Suspense>
  );
}
