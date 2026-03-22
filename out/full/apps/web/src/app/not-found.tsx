import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 p-6">
      <h2 className="text-xl font-semibold text-white">Page not found</h2>
      <p className="text-slate-400 text-sm">The page you’re looking for doesn’t exist.</p>
      <Link
        href="/"
        className="rounded-lg bg-cyan-500 px-4 py-2 text-white font-medium hover:bg-cyan-600 transition"
      >
        Go home
      </Link>
    </div>
  );
}
