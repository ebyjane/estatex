export default function PropertiesLoading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="h-8 w-48 bg-white/10 rounded animate-pulse mb-4" />
      <div className="h-4 w-64 bg-white/10 rounded animate-pulse mb-8" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="h-48 animate-pulse bg-white/10" />
            <div className="p-5 space-y-3">
              <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-white/10 rounded animate-pulse" />
              <div className="h-6 w-1/3 bg-white/10 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
