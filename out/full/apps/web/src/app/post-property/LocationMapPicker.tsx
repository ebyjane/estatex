'use client';

import { useCallback, useEffect, useRef } from 'react';
import { bindLeafletLayout, bindMapboxLayout } from '@/lib/map-layout';

type MapboxGL = {
  accessToken: string;
  Map: new (o: {
    container: HTMLElement;
    style: string;
    center: [number, number];
    zoom: number;
  }) => {
    on: (ev: string, fn: (e: { lngLat: { lat: number; lng: number } }) => void) => void;
    addControl: (c: unknown, pos?: string) => void;
    remove: () => void;
  };
  NavigationControl: new () => unknown;
  Marker: new (o?: { color?: string }) => {
    setLngLat: (lngLat: [number, number]) => unknown;
    addTo: (map: unknown) => unknown;
    remove: () => void;
  };
};

/** Minimal Leaflet surface loaded from CDN (no @types package). */
type LeafletMap = {
  setView: (center: [number, number], zoom: number) => LeafletMap;
  on: (ev: 'click', fn: (e: { latlng: { lat: number; lng: number } }) => void) => void;
  remove: () => void;
  invalidateSize: (animate?: boolean) => void;
  whenReady: (fn: () => void) => unknown;
};

type LeafletMarker = {
  setLatLng: (ll: [number, number]) => unknown;
  addTo: (map: LeafletMap) => unknown;
  remove: () => void;
};

type LeafletStatic = {
  map: (el: HTMLElement, opts?: { zoomControl?: boolean }) => LeafletMap;
  tileLayer: (
    url: string,
    opts: { attribution?: string; subdomains?: string; maxZoom?: number },
  ) => { addTo: (map: LeafletMap) => void };
  marker: (ll: [number, number]) => LeafletMarker;
};

const INDIA_CENTER: [number, number] = [78.9629, 20.5937];

const CARTO_DARK =
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

function loadMapbox(): Promise<MapboxGL> {
  return new Promise((resolve, reject) => {
    const w = window as unknown as { mapboxgl?: MapboxGL };
    if (w.mapboxgl) {
      resolve(w.mapboxgl);
      return;
    }
    if (!document.querySelector('link[href*="mapbox-gl.css"]')) {
      const link = document.createElement('link');
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    const existing = document.querySelector('script[src*="mapbox-gl-js"]');
    if (existing) {
      existing.addEventListener('load', () => {
        const gl = (window as unknown as { mapboxgl?: MapboxGL }).mapboxgl;
        if (gl) resolve(gl);
        else reject(new Error('mapbox'));
      });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.js';
    script.onload = () => {
      const gl = (window as unknown as { mapboxgl?: MapboxGL }).mapboxgl;
      if (gl) resolve(gl);
      else reject(new Error('mapbox'));
    };
    script.onerror = () => reject(new Error('mapbox load'));
    document.head.appendChild(script);
  });
}

function loadLeaflet(): Promise<LeafletStatic> {
  return new Promise((resolve, reject) => {
    const w = window as unknown as { L?: LeafletStatic };
    if (w.L) {
      resolve(w.L);
      return;
    }
    if (!document.querySelector('link[href*="leaflet"][rel="stylesheet"]')) {
      const link = document.createElement('link');
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    const existing = document.querySelector('script[src*="leaflet"][src$="leaflet.js"]');
    if (existing) {
      existing.addEventListener('load', () => {
        const L = (window as unknown as { L?: LeafletStatic }).L;
        if (L) resolve(L);
        else reject(new Error('leaflet'));
      });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      const L = (window as unknown as { L?: LeafletStatic }).L;
      if (L) resolve(L);
      else reject(new Error('leaflet'));
    };
    script.onerror = () => reject(new Error('leaflet load'));
    document.head.appendChild(script);
  });
}

export function LocationMapPicker({
  latitude,
  longitude,
  onChange,
}: {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
}) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<{ remove?: () => void; jumpTo?: (o: { center: [number, number]; zoom: number }) => void } | null>(
    null,
  );
  const markerRef = useRef<{ remove?: () => void } | null>(null);
  const leafletMapRef = useRef<LeafletMap | null>(null);
  const leafletMarkerRef = useRef<LeafletMarker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const placeMapboxMarker = useCallback((map: unknown, lng: number, lat: number, mapboxgl: MapboxGL) => {
    markerRef.current?.remove?.();
    const marker = new mapboxgl.Marker({ color: '#06b6d4' });
    marker.setLngLat([lng, lat]);
    marker.addTo(map);
    markerRef.current = marker;
  }, []);

  const placeLeafletMarker = useCallback((map: LeafletMap, lat: number, lng: number, L: LeafletStatic) => {
    leafletMarkerRef.current?.remove?.();
    const marker = L.marker([lat, lng]).addTo(map) as LeafletMarker;
    leafletMarkerRef.current = marker;
  }, []);

  useEffect(() => {
    if (!token || !containerRef.current) return;
    let cancelled = false;
    let layoutCleanup: (() => void) | undefined;
    const el = containerRef.current;

    void (async () => {
      try {
        const mapboxgl = await loadMapbox();
        if (cancelled || !el) return;
        mapboxgl.accessToken = token;
        const lng = longitude ?? INDIA_CENTER[0];
        const lat = latitude ?? INDIA_CENTER[1];
        const map = new mapboxgl.Map({
          container: el,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: [lng, lat],
          zoom: latitude != null && longitude != null ? 14 : 4,
        });
        map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
        mapRef.current = map as { remove?: () => void; jumpTo?: (o: { center: [number, number]; zoom: number }) => void };
        layoutCleanup = bindMapboxLayout(
          el,
          map as unknown as {
            resize: () => void;
            on: (ev: string, fn: () => void) => void;
            off?: (ev: string, fn: () => void) => void;
          },
        );
        if (latitude != null && longitude != null) {
          placeMapboxMarker(map, longitude, latitude, mapboxgl);
        }
        map.on('click', (e) => {
          const { lng, lat } = e.lngLat;
          onChangeRef.current(lat, lng);
          placeMapboxMarker(map, lng, lat, mapboxgl);
        });
      } catch {
        /* blocked or load error */
      }
    })();

    return () => {
      cancelled = true;
      layoutCleanup?.();
      markerRef.current?.remove?.();
      markerRef.current = null;
      mapRef.current?.remove?.();
      mapRef.current = null;
    };
  }, [token, placeMapboxMarker]);

  useEffect(() => {
    if (token || !containerRef.current) return;
    let cancelled = false;
    let layoutCleanup: (() => void) | undefined;
    const el = containerRef.current;

    void (async () => {
      try {
        const L = await loadLeaflet();
        if (cancelled || !el) return;
        const lng = longitude ?? INDIA_CENTER[0];
        const lat = latitude ?? INDIA_CENTER[1];
        const zoom = latitude != null && longitude != null ? 14 : 4;
        const map = L.map(el, { zoomControl: true }).setView([lat, lng], zoom);
        L.tileLayer(CARTO_DARK, {
          attribution: '&copy; OpenStreetMap &copy; CARTO',
          subdomains: 'abcd',
          maxZoom: 20,
        }).addTo(map);
        leafletMapRef.current = map;
        layoutCleanup = bindLeafletLayout(el, map);
        if (latitude != null && longitude != null) {
          placeLeafletMarker(map, latitude, longitude, L);
        }
        map.on('click', (e) => {
          const { lat, lng } = e.latlng;
          onChangeRef.current(lat, lng);
          placeLeafletMarker(map, lat, lng, L);
        });
      } catch {
        /* blocked or load error */
      }
    })();

    return () => {
      cancelled = true;
      layoutCleanup?.();
      leafletMarkerRef.current?.remove?.();
      leafletMarkerRef.current = null;
      leafletMapRef.current?.remove?.();
      leafletMapRef.current = null;
    };
  }, [token, placeLeafletMarker]);

  useEffect(() => {
    if (latitude == null || longitude == null) return;

    if (token) {
      const map = mapRef.current;
      const mapboxgl = (window as unknown as { mapboxgl?: MapboxGL }).mapboxgl;
      if (!map || !mapboxgl) return;
      map.jumpTo?.({
        center: [longitude, latitude],
        zoom: 14,
      });
      placeMapboxMarker(map, longitude, latitude, mapboxgl);
      return;
    }

    const map = leafletMapRef.current;
    const L = (window as unknown as { L?: LeafletStatic }).L;
    if (!map || !L) return;
    map.setView([latitude, longitude], 14);
    placeLeafletMarker(map, latitude, longitude, L);
    requestAnimationFrame(() => {
      map.invalidateSize(false);
    });
  }, [latitude, longitude, token, placeMapboxMarker, placeLeafletMarker]);

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="relative z-0 isolate min-h-64 min-w-0 h-64 w-full overflow-hidden rounded-xl border border-white/10 md:min-h-80 md:h-80 [&_.leaflet-container]:h-full [&_.leaflet-container]:w-full [&_.leaflet-container]:max-w-full [&_.leaflet-container]:rounded-xl"
      />
      {!token ? <p className="text-[10px] text-slate-500">© OpenStreetMap · CARTO</p> : null}
    </div>
  );
}
