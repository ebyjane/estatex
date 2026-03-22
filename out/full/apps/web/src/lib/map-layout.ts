/**
 * Mapbox GL / Leaflet render wrong tile sizes when the container was 0×0 or off-screen at init,
 * or after layout changes. Call resize (Mapbox) / invalidateSize (Leaflet) when the container
 * changes size or scrolls into view.
 *
 * Leaflet: calling invalidateSize during zoom/pan animations can throw (_leaflet_pos / _getMapPanePos).
 * We debounce and defer until zoom/move animations finish.
 */

export function bindMapboxLayout(
  container: HTMLElement,
  map: { resize: () => void; on: (ev: string, fn: () => void) => void; off?: (ev: string, fn: () => void) => void },
): () => void {
  const bump = () => {
    try {
      map.resize();
    } catch {
      /* ignore */
    }
  };

  map.on('load', bump);
  window.addEventListener('resize', bump);

  let ro: ResizeObserver | undefined;
  let io: IntersectionObserver | undefined;
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(() => bump());
    ro.observe(container);
  }
  if (typeof IntersectionObserver !== 'undefined') {
    io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) bump();
      },
      { threshold: [0, 0.01, 0.1] },
    );
    io.observe(container);
  }

  const timeoutIds = [0, 80, 200, 450, 800].map((ms) => window.setTimeout(bump, ms));

  return () => {
    window.removeEventListener('resize', bump);
    if (typeof map.off === 'function') {
      map.off('load', bump);
    }
    ro?.disconnect();
    io?.disconnect();
    timeoutIds.forEach((id) => clearTimeout(id));
  };
}

export type LeafletLike = {
  invalidateSize: (animate?: boolean) => void;
  whenReady: (fn: () => void) => void;
};

/** Leaflet Map — optional internals used to avoid invalidateSize during animations */
type LeafletMapForLayout = LeafletLike & {
  _animatingZoom?: boolean;
  once?: (ev: string, fn: () => void) => void;
};

export function bindLeafletLayout(container: HTMLElement, map: LeafletMapForLayout): () => void {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  /** Avoid invalidateSize during zoom animation — triggers Leaflet _leaflet_pos / _getMapPanePos errors. */
  const safeInvalidate = () => {
    if (!container.isConnected) return;

    const apply = () => {
      requestAnimationFrame(() => {
        if (!container.isConnected) return;
        try {
          map.invalidateSize(false);
        } catch {
          /* ignore */
        }
      });
    };

    if (map._animatingZoom) {
      map.once?.('zoomend', apply);
      return;
    }

    apply();
  };

  const debouncedInvalidate = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      safeInvalidate();
    }, 220);
  };

  map.whenReady(() => {
    safeInvalidate();
    /** After fitBounds / initial fly, not during the animation */
    map.once?.('moveend', () => {
      window.setTimeout(safeInvalidate, 150);
    });
  });

  window.addEventListener('resize', debouncedInvalidate);

  let ro: ResizeObserver | undefined;
  let io: IntersectionObserver | undefined;
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(debouncedInvalidate);
    ro.observe(container);
  }
  if (typeof IntersectionObserver !== 'undefined') {
    io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) debouncedInvalidate();
      },
      { threshold: [0, 0.01, 0.1] },
    );
    io.observe(container);
  }

  return () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    window.removeEventListener('resize', debouncedInvalidate);
    ro?.disconnect();
    io?.disconnect();
  };
}
