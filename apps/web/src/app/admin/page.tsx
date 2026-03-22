import dynamic from 'next/dynamic';

/** Client-only: avoids pulling Zustand, fetchApi, and hooks into the RSC graph (fixes dev 500s on chunks). */
const AdminDashboard = dynamic(() => import('./AdminDashboard'), {
  ssr: false,
  loading: () => (
    <div className="mx-auto max-w-7xl px-4 py-16 text-center text-slate-400">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
      <p className="mt-4 text-sm">Loading control panel…</p>
    </div>
  ),
});

export default function AdminPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950">
      <AdminDashboard />
    </div>
  );
}
