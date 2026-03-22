'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { PropertyImage } from './PropertyImage';

/** Image-only carousel (videos render in `PropertyVideoSection`). */
export function MediaCarousel({
  images,
  title,
  propertyId,
}: {
  images: { url: string }[];
  title: string;
  /** Enables thumbnail fallback chain if Unsplash/API URLs fail. */
  propertyId?: string;
}) {
  const slides = useMemo(() => {
    const list = images.filter((img) => img?.url).map((img) => img.url);
    return list.length > 0 ? list : [''];
  }, [images]);

  const [idx, setIdx] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const next = useCallback(() => setIdx((i) => (i + 1) % slides.length), [slides.length]);
  const prev = useCallback(
    () => setIdx((i) => (i - 1 + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    const t = setInterval(() => {
      if (slides.length > 1) setIdx((i) => (i + 1) % slides.length);
    }, 8000);
    return () => clearInterval(t);
  }, [slides.length]);

  const url = slides[idx];

  return (
    <div className="relative z-10 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      <div
        className="relative h-80 w-full bg-slate-950 md:h-96"
        onTouchStart={(e) => setTouchStart(e.targetTouches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchStart == null) return;
          const d = e.changedTouches[0].clientX - touchStart;
          if (d > 50) prev();
          if (d < -50) next();
          setTouchStart(null);
        }}
      >
        <PropertyImage
          src={url || undefined}
          propertyId={propertyId}
          alt={title}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 66vw"
        />

        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-2 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur hover:bg-black/70"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-2 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur hover:bg-black/70"
              aria-label="Next photo"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            <div className="absolute bottom-3 left-0 right-0 z-30 flex justify-center gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIdx(i)}
                  className={clsx(
                    'h-2 rounded-full transition-all',
                    i === idx ? 'w-6 bg-cyan-400' : 'w-2 bg-white/35',
                  )}
                  aria-label={`Photo ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
