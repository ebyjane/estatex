import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 p-6">
      <h2 className="text-xl font-semibold text-white">Page not found</h2>
      <p className="text-slate-400 text-sm">The page you’re looking for doesn’t exist.</p>
      <Link href="/" className="btn-primary px-6 py-2.5 text-sm">
        Go home
      </Link>
    </div>
  );
}
