'use client';

import { useMemo } from 'react';
import { Film } from 'lucide-react';

function VideoPlayer({
  src,
  poster,
  index,
  total,
}: {
  src: string;
  poster?: string;
  index: number;
  total: number;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-black shadow-xl ring-1 ring-white/5">
      <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/90 px-3 py-2">
        <span className="text-xs font-medium text-slate-400">
          {total > 1 ? `Video ${index + 1} of ${total}` : 'Property video'}
        </span>
        <span className="text-[10px] uppercase tracking-wide text-slate-600">HD</span>
      </div>
      <div className="aspect-video w-full bg-black">
        <video
          src={src}
          poster={poster}
          controls
          playsInline
          preload="metadata"
          className="h-full w-full object-contain"
        />
      </div>
    </div>
  );
}

export function PropertyVideoSection({
  videoUrls,
  posterUrl,
}: {
  videoUrls: string[];
  posterUrl?: string;
}) {
  const urls = useMemo(() => videoUrls.map((u) => u.trim()).filter(Boolean), [videoUrls]);

  if (urls.length === 0) return null;

  return (
    <section
      className="rounded-2xl border border-fuchsia-500/20 bg-gradient-to-b from-slate-950/80 to-slate-900/40 p-4 shadow-inner md:p-6"
      aria-labelledby="property-videos-heading"
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-fuchsia-500/15 text-fuchsia-400">
          <Film className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h2 id="property-videos-heading" className="text-lg font-semibold text-white">
            Videos
          </h2>
          <p className="text-xs text-slate-500">Watch property tours and walkthroughs</p>
        </div>
      </div>

      <div
        className={
          urls.length > 1 ? 'grid gap-6 md:grid-cols-1 lg:grid-cols-2' : 'max-w-4xl'
        }
      >
        {urls.map((src, i) => (
          <VideoPlayer key={`${src}-${i}`} src={src} poster={posterUrl} index={i} total={urls.length} />
        ))}
      </div>
    </section>
  );
}
