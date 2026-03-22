'use client';

import { useEffect, useMemo, useRef } from 'react';
import { isValidLatLng } from '@/lib/geo';
import { bindLeafletLayout, bindMapboxLayout } from '@/lib/map-layout';

export interface MapProperty {
  id: string;
  title: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  aiValueScore?: number;
}

export type GeoBounds = { south: number; west: number; north: number; east: number };

interface PropertyMapProps {
  properties: MapProperty[];
  onMarkerClick?: (property: MapProperty) => void;
  highlightedId?: string;
  showHeatmap?: boolean;
  /** Leaflet only: rectangle draw → geo filter (no scraping; client-side bounds). */
  enableDrawFilter?: boolean;
  onDrawBounds?: (bounds: GeoBounds) => void;
  className?: string;
}

function escapeHtml(s: string): string {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function markerPopupHtml(property: MapProperty): string {
  const href = `/property/${encodeURIComponent(property.id)}`;
  const ai =
    property.aiValueScore != null
      ? `<br/><span class="text-cyan-600 font-medium">AI Score ${escapeHtml(String(property.aiValueScore))}</span>`
      : '';
  return `<div class="p-2 text-sm" style="min-width:180px">
    <strong class="text-slate-900">${escapeHtml(property.title)}</strong>
    <br/>
    <span class="text-slate-600">${escapeHtml(property.city || '')}</span>
    ${ai}
    <div style="margin-top:10px">
      <a href="${href}" style="color:#0891b2;font-weight:600;font-size:13px;text-decoration:underline">View listing</a>
    </div>
  </div>`;
}

type MapboxNS = NonNullable<
  (Window & { mapboxgl?: Record<string, unknown> })['mapboxgl']
>;

export function PropertyMap({
  properties,
  onMarkerClick,
  highlightedId,
  showHeatmap = false,
  enableDrawFilter = false,
  onDrawBounds,
  className = '',
}: PropertyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<object | null>(null);
  const markersRef = useRef<{ remove?: () => void }[]>([]);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const validProperties = useMemo(
    () =>
      properties.filter((p) => {
        if (p.latitude == null || p.longitude == null) return false;
        const lat = Number(p.latitude);
        const lng = Number(p.longitude);
        return isValidLatLng(lat, lng);
      }),
    [properties],
  );

  const leafletKey = useMemo(
    () => JSON.stringify(validProperties.map((p) => [p.id, p.latitude, p.longitude, p.title, p.city])),
    [validProperties],
  );

  /* ---------- Mapbox (token set) ---------- */
  useEffect(() => {
    if (!token || !containerRef.current) return;

    let cancelled = false;
    let layoutCleanup: (() => void) | undefined;

    const script = document.createElement('script');
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.js';
    const link = document.createElement('link');
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.css';
    link.rel = 'stylesheet';

    script.onload = () => {
      if (cancelled) return;
      const mapboxgl = (window as unknown as { mapboxgl?: MapboxNS }).mapboxgl;
      const container = containerRef.current;
      if (!mapboxgl || !container) return;
      (mapboxgl as { accessToken: string }).accessToken = token;
      const map = new (mapboxgl as { Map: new (o: object) => object }).Map({
        container,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [55, 25],
        zoom: 2,
      });
      (map as { addControl: (c: object, p?: string) => void }).addControl(
        new (mapboxgl as { NavigationControl: new () => object }).NavigationControl(),
        'bottom-right',
      );
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
    document.head.appendChild(link);

    return () => {
      cancelled = true;
      layoutCleanup?.();
      markersRef.current.forEach((m) => m.remove?.());
      markersRef.current = [];
      const map = mapRef.current;
      if (map && typeof (map as { remove?: () => void }).remove === 'function') {
        (map as { remove: () => void }).remove();
      }
      mapRef.current = null;
      script.remove();
      link.remove();
    };
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const mapboxgl = (window as unknown as { mapboxgl?: MapboxNS }).mapboxgl;
    const map = mapRef.current;
    if (!mapboxgl || !map || !token) return;

    markersRef.current.forEach((m) => m.remove?.());
    markersRef.current = [];

    if (validProperties.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();

    validProperties.forEach((property) => {
      const lng = Number(property.longitude);
      const lat = Number(property.latitude);
      const el = document.createElement('div');
      el.className = 'property-marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = highlightedId === property.id ? '#22d3ee' : '#0891b2';
      el.style.border = '2px solid white';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(markerPopupHtml(property)));
      marker.addTo(map);

      el.addEventListener('click', () => onMarkerClick?.(property));

      markersRef.current.push(marker as { remove?: () => void });
      bounds.extend([lng, lat]);
    });

    if (validProperties.length > 1) {
      (map as { fitBounds: (b: object, o?: object) => void }).fitBounds?.(bounds, {
        padding: 50,
        maxZoom: 14,
      });
    } else if (validProperties.length === 1) {
      (map as { flyTo: (o: object) => void }).flyTo?.({
        center: [Number(validProperties[0].longitude), Number(validProperties[0].latitude)],
        zoom: 12,
      });
    }

    requestAnimationFrame(() => {
      try {
        (map as { resize?: () => void }).resize?.();
      } catch {
        /* ignore */
      }
    });
  }, [token, validProperties, highlightedId, onMarkerClick]);

  useEffect(() => {
    if (!token) return;
    const mapboxgl = (window as unknown as { mapboxgl?: MapboxNS }).mapboxgl;
    const map = mapRef.current;
    if (!mapboxgl || !map || !token || !showHeatmap || validProperties.length < 5) return;

    const heatmapId = 'property-heatmap';

    if ((map as { getLayer: (id: string) => unknown }).getLayer?.(heatmapId)) {
      (map as { removeLayer: (id: string) => void }).removeLayer?.(heatmapId);
      (map as { removeSource: (id: string) => void }).removeSource?.(heatmapId);
    }

    (map as { addSource: (id: string, s: object) => void }).addSource?.(heatmapId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: validProperties.map((p) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [Number(p.longitude), Number(p.latitude)],
          },
          properties: { weight: (p.aiValueScore ?? 50) / 100 },
        })),
      },
    });

    (map as { addLayer: (l: object) => void }).addLayer?.({
      id: heatmapId,
      type: 'heatmap',
      source: heatmapId,
      paint: {
        'heatmap-weight': ['get', 'weight'],
        'heatmap-intensity': 1,
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0,
          'rgba(0,0,0,0)',
          0.2,
          'rgba(34,211,238,0.4)',
          0.5,
          'rgba(34,211,238,0.7)',
          1,
          'rgba(34,211,238,1)',
        ],
        'heatmap-radius': 25,
      },
    });

    return () => {
      if ((map as { getLayer: (id: string) => unknown }).getLayer?.(heatmapId)) {
        (map as { removeLayer: (id: string) => void }).removeLayer?.(heatmapId);
        (map as { removeSource: (id: string) => void }).removeSource?.(heatmapId);
      }
    };
  }, [showHeatmap, validProperties, token]);

  /* ---------- Leaflet fallback (no Mapbox token) — map + markers in one pass ---------- */
  useEffect(() => {
    if (token || !containerRef.current) return;
    let cancelled = false;
    let layoutCleanup: (() => void) | undefined;
    const el = containerRef.current;
    const link = document.createElement('link');
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const L = (window as unknown as { L?: any }).L;
      if (cancelled || !L || !containerRef.current) return;
      const c = containerRef.current;
      c.innerHTML = '';
      const map = L.map(c, { center: [20, 78], zoom: 3 });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OSM &copy; CARTO',
      }).addTo(map);
      mapRef.current = map;
      layoutCleanup = bindLeafletLayout(c, map);

      const latlngs: [number, number][] = [];
      validProperties.forEach((property) => {
        const lat = Number(property.latitude);
        const lng = Number(property.longitude);
        latlngs.push([lat, lng]);
        const mk = L.marker([lat, lng], { title: property.title }).addTo(map);
        mk.bindPopup(markerPopupHtml(property));
        mk.on('click', () => onMarkerClick?.(property));
        markersRef.current.push(mk as { remove?: () => void });
      });

      if (latlngs.length > 1) {
        const b = L.latLngBounds(latlngs);
        map.fitBounds(b, { padding: [40, 40], maxZoom: 12 });
      } else if (latlngs.length === 1) {
        map.setView(latlngs[0], 11);
      }

      if (enableDrawFilter && onDrawBounds) {
        const dlink = document.createElement('link');
        dlink.href = 'https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css';
        dlink.rel = 'stylesheet';
        document.head.appendChild(dlink);
        const dscript = document.createElement('script');
        dscript.src = 'https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.js';
        dscript.onload = () => {
          if (cancelled || !map) return;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const Ldraw = (window as unknown as { L?: any }).L;
          if (!Ldraw?.Control?.Draw || !Ldraw.Draw?.Event) return;
          const drawnItems = new Ldraw.FeatureGroup();
          map.addLayer(drawnItems);
          map.addControl(
            new Ldraw.Control.Draw({
              edit: { featureGroup: drawnItems, remove: true },
              draw: {
                rectangle: true,
                polygon: false,
                polyline: false,
                circle: false,
                marker: false,
                circlemarker: false,
              },
            }),
          );
          map.on(Ldraw.Draw.Event.CREATED, (e: { layer: { getBounds: () => { getSouth: () => number; getWest: () => number; getNorth: () => number; getEast: () => number } } }) => {
            drawnItems.clearLayers();
            drawnItems.addLayer(e.layer);
            const b = e.layer.getBounds();
            onDrawBounds({
              south: b.getSouth(),
              west: b.getWest(),
              north: b.getNorth(),
              east: b.getEast(),
            });
          });
        };
        document.head.appendChild(dscript);
      }
    };
    document.head.appendChild(script);
    return () => {
      cancelled = true;
      layoutCleanup?.();
      markersRef.current.forEach((m) => m.remove?.());
      markersRef.current = [];
      (mapRef.current as { remove?: () => void } | null)?.remove?.();
      mapRef.current = null;
      if (containerRef.current) containerRef.current.innerHTML = '';
      script.remove();
      link.remove();
    };
  }, [token, leafletKey, onMarkerClick, validProperties, enableDrawFilter, onDrawBounds]);

  if (!token) {
    return (
      <div
        className={`relative w-full h-[500px] rounded-2xl overflow-hidden border border-white/10 ${className}`}
      >
        {enableDrawFilter && (
          <div className="pointer-events-none absolute left-3 top-3 z-[500] max-w-[220px] rounded-lg border border-white/10 bg-slate-950/95 px-3 py-2 text-[11px] leading-snug text-slate-300">
            Draw a <strong className="text-cyan-400">rectangle</strong> on the map (left toolbar) to filter listings in that area.
          </div>
        )}
        <div ref={containerRef} className="h-full w-full" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`w-full h-[500px] rounded-2xl overflow-hidden ${className}`}
    />
  );
}

export default PropertyMap;
