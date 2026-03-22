export default function RootLoading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-6 px-6">
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 animate-pulse rounded-full bg-cyan-400 shadow-brand" />
        <div className="h-3 w-3 animate-pulse rounded-full bg-blue-500 shadow-brand [animation-delay:150ms]" />
        <div className="h-3 w-3 animate-pulse rounded-full bg-purple-500 shadow-brand [animation-delay:300ms]" />
      </div>
      <div className="w-full max-w-md space-y-3">
        <div className="h-8 w-48 mx-auto rounded-lg bg-white/10 animate-pulse" />
        <div className="h-4 w-full rounded bg-white/5 animate-pulse" />
        <div className="h-4 w-[80%] mx-auto rounded bg-white/5 animate-pulse" />
      </div>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
    </div>
  );
}
