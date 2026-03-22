'use client';

import { useEffect, useRef } from 'react';
import { bindLeafletLayout, bindMapboxLayout, type LeafletLike } from '@/lib/map-layout';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

declare global {
  interface Window {
    mapboxgl?: {
      Map: new (opts: object) => { remove: () => void; addControl: (c: object, pos?: string) => void };
      NavigationControl: new () => object;
      accessToken: string;
      LngLatBounds: new () => { extend: (coord: [number, number]) => void };
      Marker: new (opts?: { element?: HTMLElement }) => {
        setLngLat: (c: [number, number]) => {
          setPopup: (p: object) => { addTo: (m: object) => void };
        };
        addTo: (map: object) => void;
        remove: () => void;
      };
      Popup: new (opts?: object) => { setHTML: (html: string) => object };
    };
    L?: {
      map: (el: HTMLElement, opts: object) => { remove: () => void };
      tileLayer: (url: string, opts?: object) => { addTo: (m: object) => void };
    };
  }
}

export function GlobalMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let layoutCleanup: (() => void) | undefined;

    if (MAPBOX_TOKEN) {
      const script = document.createElement('script');
      script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.js';
      script.onload = () => {
        const mapboxgl = (window as Window & { mapboxgl?: typeof window.mapboxgl }).mapboxgl;
        if (!mapboxgl || !containerRef.current) return;
        const container = containerRef.current;
        mapboxgl.accessToken = MAPBOX_TOKEN;
        const map = new mapboxgl.Map({
          container,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: [78.9, 20.5],
          zoom: 4,
        });
        map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
        mapRef.current = map;
        layoutCleanup = bindMapboxLayout(
          container,
          map as unknown as {
            resize: () => void;
            on: (ev: string, fn: () => void) => void;
            off?: (ev: string, fn: () => void) => void;
          },
        );
      };
      document.head.appendChild(script);
      const link = document.createElement('link');
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      return () => {
        layoutCleanup?.();
        mapRef.current?.remove();
        mapRef.current = null;
        script.remove();
        link.remove();
      };
    }

    const link = document.createElement('link');
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.rel = 'stylesheet';
    link.setAttribute('crossorigin', '');
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.setAttribute('crossorigin', '');
    script.onload = () => {
      const L = (window as unknown as { L: typeof window.L }).L;
      const container = containerRef.current;
      if (!L || !container) return;
      if ((container as unknown as { _leaflet_id?: number })._leaflet_id) {
        return;
      }
      const map = L.map(container, { center: [20.5, 78.9], zoom: 4 });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OSM &copy; CARTO',
      }).addTo(map);
      mapRef.current = map;
      layoutCleanup = bindLeafletLayout(container, map as unknown as LeafletLike);
    };
    document.head.appendChild(script);
    return () => {
      layoutCleanup?.();
      mapRef.current?.remove();
      mapRef.current = null;
      script.remove();
      link.remove();
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full min-h-[400px]" />;
}

export default GlobalMap;
