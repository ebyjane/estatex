'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { pickListingThumbForProperty } from '@real-estate/shared';

const PLACEHOLDER_DATA =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1e293b"/><stop offset="100%" stop-color="#0f172a"/></linearGradient></defs><rect width="800" height="600" fill="url(#g)"/><g fill="#64748b" opacity="0.5"><path d="M400 200 L500 280 L470 380 L330 380 L300 280 Z"/><rect x="350" y="320" width="100" height="80" rx="4"/></g><text x="400" y="520" text-anchor="middle" fill="#475569" font-size="24" font-family="sans-serif">Property</text></svg>'
  );

const MAX_THUMB_ATTEMPTS = 14;

function isExternalUrl(url: string): boolean {
  return typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'));
}

interface PropertyImageProps {
  src: string | null | undefined;
  /** When set, failed loads rotate through the Unsplash pool instead of showing the 🏠 placeholder. */
  propertyId?: string;
  alt: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
}

export function PropertyImage({
  src,
  propertyId,
  alt,
  className = '',
  fill = true,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
}: PropertyImageProps) {
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [fatal, setFatal] = useState(false);

  useEffect(() => {
    setAttempt(0);
    setLoaded(false);
    setFatal(false);
  }, [src]);

  const displaySrc = useMemo(() => {
    if (fatal) return undefined;
    if (!propertyId) return src?.trim() || undefined;
    if (attempt === 0) return src?.trim() || pickListingThumbForProperty(propertyId, 0);
    return pickListingThumbForProperty(propertyId, attempt);
  }, [src, attempt, propertyId, fatal]);

  const useFallback = fatal || !displaySrc;
  const useNativeImg = displaySrc && isExternalUrl(displaySrc);

  const onImgError = () => {
    if (propertyId && attempt < MAX_THUMB_ATTEMPTS) {
      setAttempt((a) => a + 1);
      setLoaded(false);
    } else {
      setFatal(true);
    }
  };

  if (useFallback) {
    return (
      <div className={`relative overflow-hidden w-full h-full min-h-0 ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
          <span className="text-slate-600 text-4xl" aria-hidden>🏠</span>
        </div>
      </div>
    );
  }

  if (useNativeImg) {
    return (
      <div className={`relative overflow-hidden w-full h-full min-h-0 ${className}`}>
        {!loaded && (
          <div className="absolute inset-0 z-0 animate-pulse bg-slate-800/80" aria-hidden />
        )}
        <img
          key={`${displaySrc}-${attempt}`}
          src={displaySrc}
          alt={alt}
          className="absolute inset-0 z-[1] h-full w-full object-cover"
          onLoad={() => setLoaded(true)}
          onError={onImgError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 z-0 animate-pulse bg-slate-800/80" aria-hidden />
      )}
      <Image
        key={`${displaySrc}-${attempt}`}
        src={displaySrc || PLACEHOLDER_DATA}
        alt={alt}
        fill={fill}
        priority={priority}
        sizes={sizes}
        className="object-cover z-[1]"
        onLoad={() => setLoaded(true)}
        onError={onImgError}
        unoptimized
      />
    </div>
  );
}
