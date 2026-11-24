'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Map as MapLibreMap, StyleSpecification, GeoJSONSource, Marker as MapLibreMarker, LayerSpecification } from 'maplibre-gl';
import { Minus, Plus, Position, Xmark } from 'iconoir-react';
import { cn } from '../../lib/utils';
import { useTheyaI18n } from '../../lib/i18n';
import { Button } from './button';
import { ListItem } from './list-item';

/**
 * A map of places on MapLibre GL with vector tiles (OpenFreeMap by
 * default, no key). The base map is drawn from Theya tokens — land,
 * water, parks, roads and labels take their colors from the surface,
 * info, success and border tokens — so it follows light / dark and the
 * product theme, and is rebuilt when either changes.
 *
 * Points are HTML markers in the primary color; nearby points merge into
 * clusters with a count (click to zoom in). Selecting a point — on the
 * map or in the list — flies to it and opens a card over the map.
 *
 * The map is never the only way in: a list of the same places (name,
 * address, distance) sits next to it on wide screens and under it on a
 * phone. The list is the keyboard and screen-reader path; markers mirror
 * it for the pointer and stay out of the tab order. The map itself takes
 * focus for panning (arrows) and zoom (+ / −), and has zoom buttons.
 * "Find near me" asks for the location, sorts the list by distance and
 * selects the nearest place.
 *
 * maplibre-gl is loaded on the client only (dynamic import), so the
 * component renders on the server as the list plus an empty map frame.
 */

export interface MapPoint {
  id: string;
  name: string;
  /** Street address or another line under the name. */
  address?: string;
  /** Longitude, degrees. */
  lng: number;
  /** Latitude, degrees. */
  lat: number;
}

export interface MapCoordinates {
  lng: number;
  lat: number;
}

export interface MapViewProps {
  points: MapPoint[];
  /** Accessible name of the map region, e.g. "Our restaurants". Defaults to the dictionary's "Map". */
  'aria-label'?: string;
  /** Start center; defaults to the middle of the points. */
  center?: MapCoordinates;
  /** Start zoom; defaults to a zoom that fits every point. */
  zoom?: number;
  /** Controlled selection (point id, or null). */
  selectedId?: string | null;
  defaultSelectedId?: string | null;
  onSelectedChange?: (id: string | null) => void;
  /** Where distances are measured from. Controlled: pass with onOriginChange; otherwise set by "Find near me". */
  origin?: MapCoordinates | null;
  onOriginChange?: (origin: MapCoordinates | null) => void;
  /** Distance unit in the list and card. */
  unit?: 'kilometer' | 'mile';
  /** Merge nearby points into clusters with a count. */
  cluster?: boolean;
  /** Where the list goes on wide screens (it always goes under the map on a phone). `none` only when the same places are listed elsewhere on the page. */
  list?: 'start' | 'end' | 'none';
  /** Heading above the list. */
  listTitle?: ReactNode;
  /** Show the "Find near me" button above the list. */
  locate?: boolean;
  /** Body of the card over the map for the selected point; the default shows name, address and distance. */
  renderCard?: (point: MapPoint, distance: string | null) => ReactNode;
  /** Map height on wide screens; on a phone the map is 320px tall. */
  height?: number;
  /** Vector tiles (a TileJSON URL in the OpenMapTiles schema). `null` draws no base map: points on the land color only. */
  tiles?: string | null;
  /** Glyphs URL for map labels ({fontstack}, {range}). */
  glyphs?: string;
  className?: string;
}

const DEFAULT_TILES = 'https://tiles.openfreemap.org/planet';
const DEFAULT_GLYPHS = 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf';
const ATTRIBUTION = '<a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> © <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener">OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>';
const POINTS = 'theya-points';
const CLUSTER_MAX_ZOOM = 14;
const SELECT_ZOOM = CLUSTER_MAX_ZOOM + 1;

// Token → map role. Read from the map element, so a data-theme / data-brand
// island around the map recolors it too.
const TOKENS = {
  land: '--color-bg-surface-bg-surface-sunken',
  water: '--color-bg-info-bg-info-subtle',
  park: '--color-bg-success-bg-success-subtler',
  building: '--color-bg-neutral-bg-neutral-subtle',
  road: '--color-bg-surface-bg-surface',
  casing: '--color-border-border-subtle',
  casingStrong: '--color-border-border',
  boundary: '--color-border-border',
  label: '--color-text-text-subtle',
  labelStrong: '--color-text-text',
  labelWater: '--color-text-text-info',
} as const;
type MapColors = Record<keyof typeof TOKENS, string>;

// MapLibre parses rgb/hex/hsl but not oklch or color-mix, which tokens may
// resolve to: paint each token on a 1px canvas and read the pixel back.
function readColors(el: HTMLElement): MapColors {
  const style = getComputedStyle(el);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const out = {} as MapColors;
  for (const [role, name] of Object.entries(TOKENS) as [keyof MapColors, string][]) {
    const value = style.getPropertyValue(name).trim();
    if (!ctx || !value) {
      out[role] = 'rgba(128,128,128,1)'; // raw-ok: fallback when a token can't be read (no canvas)
      continue;
    }
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = value;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    out[role] = `rgba(${r},${g},${b},${(a / 255).toFixed(3)})`; // raw-ok: a token resolved to rgba for MapLibre
  }
  return out;
}

type PointFeatures = {
  type: 'FeatureCollection';
  features: { type: 'Feature'; id: string; properties: { id: string; name: string }; geometry: { type: 'Point'; coordinates: [number, number] } }[];
};

function pointsGeoJSON(points: MapPoint[]): PointFeatures {
  return {
    type: 'FeatureCollection',
    features: points.map((p) => ({ type: 'Feature', id: p.id, properties: { id: p.id, name: p.name }, geometry: { type: 'Point', coordinates: [p.lng, p.lat] } })),
  };
}

function buildStyle(c: MapColors, opts: { tiles: string | null; glyphs: string; lang: string; points: MapPoint[]; cluster: boolean }): StyleSpecification {
  const name = ['coalesce', ['get', `name:${opts.lang}`], ['get', 'name']] as unknown as string;
  const base: LayerSpecification[] = opts.tiles
    ? [
        { id: 'park', type: 'fill', source: 'omt', 'source-layer': 'park', paint: { 'fill-color': c.park } },
        { id: 'landcover', type: 'fill', source: 'omt', 'source-layer': 'landcover', filter: ['in', ['get', 'class'], ['literal', ['wood', 'grass']]], paint: { 'fill-color': c.park, 'fill-opacity': 0.7 } },
        { id: 'water', type: 'fill', source: 'omt', 'source-layer': 'water', filter: ['!=', ['get', 'brunnel'], 'tunnel'], paint: { 'fill-color': c.water } },
        { id: 'waterway', type: 'line', source: 'omt', 'source-layer': 'waterway', paint: { 'line-color': c.water, 'line-width': ['interpolate', ['linear'], ['zoom'], 8, 0.5, 16, 3] } },
        { id: 'building', type: 'fill', source: 'omt', 'source-layer': 'building', minzoom: 14, paint: { 'fill-color': c.building } },
        { id: 'road-minor', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 12, filter: ['in', ['get', 'class'], ['literal', ['minor', 'service', 'track']]], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': c.road, 'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 12, 0.5, 18, 12] } },
        { id: 'road-major-casing', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 8, filter: ['in', ['get', 'class'], ['literal', ['primary', 'secondary', 'tertiary', 'trunk']]], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': c.casing, 'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 8, 1, 18, 22] } },
        { id: 'road-major', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 8, filter: ['in', ['get', 'class'], ['literal', ['primary', 'secondary', 'tertiary', 'trunk']]], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': c.road, 'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 8, 0.5, 18, 18] } },
        { id: 'road-motorway-casing', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 5, filter: ['==', ['get', 'class'], 'motorway'], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': c.casingStrong, 'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 5, 1, 18, 26] } },
        { id: 'road-motorway', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 5, filter: ['==', ['get', 'class'], 'motorway'], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': c.road, 'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 5, 0.5, 18, 22] } },
        { id: 'rail', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 11, filter: ['==', ['get', 'class'], 'rail'], paint: { 'line-color': c.casing, 'line-width': 1, 'line-dasharray': [3, 3] } },
        { id: 'boundary', type: 'line', source: 'omt', 'source-layer': 'boundary', filter: ['==', ['get', 'admin_level'], 2], paint: { 'line-color': c.boundary, 'line-width': 1, 'line-dasharray': [4, 2] } },
        { id: 'road-label', type: 'symbol', source: 'omt', 'source-layer': 'transportation_name', minzoom: 14, layout: { 'symbol-placement': 'line', 'text-field': name, 'text-font': ['Noto Sans Regular'], 'text-size': 11 }, paint: { 'text-color': c.label, 'text-halo-color': c.road, 'text-halo-width': 1.5 } },
        { id: 'water-label', type: 'symbol', source: 'omt', 'source-layer': 'water_name', layout: { 'text-field': name, 'text-font': ['Noto Sans Italic'], 'text-size': 12 }, paint: { 'text-color': c.labelWater, 'text-halo-color': c.water, 'text-halo-width': 1 } },
        { id: 'place-label', type: 'symbol', source: 'omt', 'source-layer': 'place', filter: ['in', ['get', 'class'], ['literal', ['suburb', 'neighbourhood', 'village', 'town']]], layout: { 'text-field': name, 'text-font': ['Noto Sans Regular'], 'text-size': ['interpolate', ['linear'], ['zoom'], 10, 11, 16, 14] }, paint: { 'text-color': c.label, 'text-halo-color': c.land, 'text-halo-width': 1.5 } },
        { id: 'city-label', type: 'symbol', source: 'omt', 'source-layer': 'place', filter: ['==', ['get', 'class'], 'city'], layout: { 'text-field': name, 'text-font': ['Noto Sans Bold'], 'text-size': ['interpolate', ['linear'], ['zoom'], 4, 12, 12, 18] }, paint: { 'text-color': c.labelStrong, 'text-halo-color': c.land, 'text-halo-width': 1.5 } },
      ]
    : [];
  return {
    version: 8,
    glyphs: opts.glyphs,
    sources: {
      ...(opts.tiles ? { omt: { type: 'vector', url: opts.tiles, attribution: ATTRIBUTION } } : {}),
      [POINTS]: { type: 'geojson', data: pointsGeoJSON(opts.points), cluster: opts.cluster, clusterRadius: 48, clusterMaxZoom: CLUSTER_MAX_ZOOM },
    },
    layers: [
      { id: 'land', type: 'background', paint: { 'background-color': c.land } },
      ...base,
      // Invisible: keeps the point/cluster features rendered so the HTML
      // markers can be read from querySourceFeatures.
      { id: `${POINTS}-hit`, type: 'circle', source: POINTS, paint: { 'circle-radius': 1, 'circle-opacity': 0 } },
    ],
  };
}

function distanceKm(a: MapCoordinates, b: MapCoordinates): number {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

function formatDistance(km: number, unit: 'kilometer' | 'mile', locale: string): string {
  if (unit === 'mile') {
    const mi = km / 1.609344;
    return new Intl.NumberFormat(locale, { style: 'unit', unit: 'mile', maximumFractionDigits: mi < 10 ? 1 : 0 }).format(mi);
  }
  if (km < 1) return new Intl.NumberFormat(locale, { style: 'unit', unit: 'meter', maximumFractionDigits: 0 }).format(Math.max(10, Math.round((km * 1000) / 10) * 10));
  return new Intl.NumberFormat(locale, { style: 'unit', unit: 'kilometer', maximumFractionDigits: km < 10 ? 1 : 0 }).format(km);
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}

/** A motion duration token in ms for MapLibre's animations; 0 under reduced motion. */
function motionMs(token: 'moderate' | 'slow' | 'slower'): number {
  if (prefersReducedMotion()) return 0;
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue(`--motion-duration-${token}`)) || 0;
}

const MARKER_CLASS =
  'group/marker flex size-6 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 outline-none';
const DOT_CLASS =
  'block size-3.5 rounded-full bg-[var(--color-bg-primary-bg-primary)] ring-2 ring-[var(--color-bg-surface-bg-surface)] shadow-elevation-sm transition-transform duration-fast motion-reduce:transition-none ' +
  'group-hover/marker:scale-125 group-data-[selected]/marker:size-5 group-data-[selected]/marker:ring-[3px] forced-colors:bg-[Highlight]';
const ORIGIN_CLASS =
  'block size-4 rounded-full border-[3px] border-[var(--color-bg-surface-bg-surface)] bg-[var(--color-bg-info-bg-info)] shadow-elevation-sm ring-8 ring-[var(--color-bg-info-bg-info-subtle)] forced-colors:bg-[CanvasText]';
const CLUSTER_CLASS =
  'flex min-w-9 h-9 cursor-pointer items-center justify-center rounded-full border-0 px-2 font-body text-body-s font-semibold tabular-nums ' +
  'bg-[var(--color-bg-primary-bg-primary)] text-[var(--color-text-text-on-primary)] ring-4 ring-[var(--color-bg-primary-bg-primary-subtle)] shadow-elevation-sm ' +
  'hover:bg-[var(--color-bg-primary-bg-primary-hover)] forced-colors:border forced-colors:border-[CanvasText]';

export function MapView({
  points,
  'aria-label': ariaLabel,
  center,
  zoom,
  selectedId: selectedProp,
  defaultSelectedId = null,
  onSelectedChange,
  origin: originProp,
  onOriginChange,
  unit = 'kilometer',
  cluster = true,
  list = 'end',
  listTitle,
  locate = true,
  renderCard,
  height = 480,
  tiles = DEFAULT_TILES,
  glyphs = DEFAULT_GLYPHS,
  className,
}: MapViewProps) {
  const { t, locale } = useTheyaI18n();
  const lang = locale.split('-')[0] || 'en';
  const label = ariaLabel ?? t.mapView.label;
  const listId = useId();

  const [selectedState, setSelectedState] = useState<string | null>(defaultSelectedId);
  const selectedId = selectedProp !== undefined ? selectedProp : selectedState;
  const select = useCallback(
    (id: string | null) => {
      if (selectedProp === undefined) setSelectedState(id);
      onSelectedChange?.(id);
    },
    [selectedProp, onSelectedChange],
  );

  const [originState, setOriginState] = useState<MapCoordinates | null>(null);
  const origin = originProp !== undefined ? originProp : originState;
  const [locating, setLocating] = useState(false);
  const [status, setStatus] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef(new Map<string, { marker: MapLibreMarker; el: HTMLButtonElement }>());
  const mapLibre = useRef<typeof import('maplibre-gl') | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number | null>(null);

  const distances = useMemo(() => {
    const m = new Map<string, number>();
    if (origin) for (const p of points) m.set(p.id, distanceKm(origin, p));
    return m;
  }, [origin, points]);
  const sorted = useMemo(() => (origin ? [...points].sort((a, b) => (distances.get(a.id) ?? 0) - (distances.get(b.id) ?? 0)) : points), [points, origin, distances]);
  const distanceText = useCallback((id: string) => (distances.has(id) ? formatDistance(distances.get(id)!, unit, locale) : null), [distances, unit, locale]);
  const selected = points.find((p) => p.id === selectedId) ?? null;

  // Latest values for the imperative marker code.
  const live = useRef({ select, selectedId, points, cluster, tiles, glyphs, lang, t });
  live.current = { select, selectedId, points, cluster, tiles, glyphs, lang, t };

  const updateMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.getSource(POINTS) || !map.isSourceLoaded(POINTS)) return;
    const seen = new Set<string>();
    const store = markersRef.current;
    const { t: msg } = live.current;
    for (const f of map.querySourceFeatures(POINTS)) {
      const props = f.properties as { cluster?: boolean; cluster_id?: number; point_count?: number; id?: string; name?: string };
      const key = props.cluster ? `c${props.cluster_id}` : `p${props.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const [lng, lat] = (f.geometry as { coordinates: [number, number] }).coordinates;
      let entry = store.get(key);
      if (!entry) {
        const el = document.createElement('button');
        el.type = 'button';
        // The list is the keyboard / screen-reader path; markers mirror it.
        el.tabIndex = -1;
        el.setAttribute('aria-hidden', 'true');
        if (props.cluster) {
          el.className = CLUSTER_CLASS;
          el.textContent = String(props.point_count ?? '');
          el.title = msg.mapView.cluster(props.point_count ?? 0);
          const clusterId = props.cluster_id!;
          el.addEventListener('click', async () => {
            const src = map.getSource(POINTS) as GeoJSONSource;
            const z = await src.getClusterExpansionZoom(clusterId);
            map.easeTo({ center: [lng, lat], zoom: z, duration: motionMs('slow') });
          });
        } else {
          el.className = MARKER_CLASS;
          el.title = props.name ?? '';
          const dot = document.createElement('span');
          dot.className = DOT_CLASS;
          el.appendChild(dot);
          const id = props.id!;
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            live.current.select(id);
          });
        }
        const marker = new (mapLibre.current!.Marker)({ element: el }).setLngLat([lng, lat]).addTo(map);
        entry = { marker, el };
        store.set(key, entry);
      }
      if (!props.cluster) entry.el.toggleAttribute('data-selected', props.id === live.current.selectedId);
    }
    for (const [key, entry] of store) {
      if (!seen.has(key)) {
        entry.marker.remove();
        store.delete(key);
      }
    }
  }, []);

  // Create the map once.
  useEffect(() => {
    let cancelled = false;
    const el = containerRef.current;
    if (!el) return;
    (async () => {
      const lib = await import('maplibre-gl');
      if (cancelled || !containerRef.current) return;
      mapLibre.current = lib;
      const { points: pts, cluster: cl, tiles: tl, glyphs: gl, lang: lg, t: msg } = live.current;
      let map: MapLibreMap;
      try {
        map = new lib.Map({
        container: el,
        style: buildStyle(readColors(el), { tiles: tl, glyphs: gl, lang: lg, points: pts, cluster: cl }),
        center: center ? [center.lng, center.lat] : undefined,
        zoom: zoom,
        attributionControl: { compact: true },
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        cooperativeGestures: false,
        locale: { 'Map.Title': msg.mapView.canvasLabel, 'AttributionControl.ToggleAttribution': msg.mapView.attribution },
        });
      } catch {
        // No WebGL (old device, blocked GPU): the list still works.
        setFailed(true);
        return;
      }
      map.touchZoomRotate.disableRotation();
      map.keyboard.disableRotation();
      mapRef.current = map;
      if (!center && pts.length) {
        const b = new lib.LngLatBounds();
        for (const p of pts) b.extend([p.lng, p.lat]);
        map.fitBounds(b, { padding: 56, maxZoom: zoom ?? 14, duration: 0 });
      }
      map.on('render', updateMarkers);
      map.on('zoom', () => setZoomLevel(map.getZoom()));
      map.on('load', () => {
        setReady(true);
        setZoomLevel(map.getZoom());
        updateMarkers();
      });
    })();
    return () => {
      cancelled = true;
      for (const { marker } of markersRef.current.values()) marker.remove();
      markersRef.current.clear();
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // The map is created once; later prop changes are applied below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rebuild the style when the theme, brand or base-map options change.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof MutationObserver === 'undefined') return;
    const restyle = () => {
      const map = mapRef.current;
      if (!map) return;
      const { points: pts, cluster: cl, tiles: tl, glyphs: gl, lang: lg } = live.current;
      map.setStyle(buildStyle(readColors(el), { tiles: tl, glyphs: gl, lang: lg, points: pts, cluster: cl }), { diff: true });
    };
    restyle();
    const obs = new MutationObserver(restyle);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-brand', 'class', 'style'] });
    for (let n = el.parentElement; n && n !== document.documentElement; n = n.parentElement) {
      if (n.hasAttribute('data-theme') || n.hasAttribute('data-brand')) obs.observe(n, { attributes: true, attributeFilter: ['data-theme', 'data-brand'] });
    }
    return () => obs.disconnect();
  }, [tiles, glyphs, lang, cluster, ready]);

  // New points: replace the source data.
  useEffect(() => {
    const src = mapRef.current?.getSource(POINTS) as GeoJSONSource | undefined;
    src?.setData(pointsGeoJSON(points));
  }, [points, ready]);

  // Origin ("you are here"): an info-colored dot with a halo, out of the tab order like the points.
  const originMarker = useRef<MapLibreMarker | null>(null);
  useEffect(() => {
    const map = mapRef.current;
    const lib = mapLibre.current;
    originMarker.current?.remove();
    originMarker.current = null;
    if (!map || !lib || !origin) return;
    const el = document.createElement('span');
    el.setAttribute('aria-hidden', 'true');
    el.title = t.mapView.origin;
    el.className = ORIGIN_CLASS;
    originMarker.current = new lib.Marker({ element: el }).setLngLat([origin.lng, origin.lat]).addTo(map);
  }, [origin, ready, t]);

  // Selection: mark the marker and fly to the point.
  useEffect(() => {
    for (const [key, { el }] of markersRef.current) if (key.startsWith('p')) el.toggleAttribute('data-selected', key === `p${selectedId}`);
    const map = mapRef.current;
    if (!map || !selected) return;
    const z = Math.max(map.getZoom(), SELECT_ZOOM);
    if (prefersReducedMotion()) map.jumpTo({ center: [selected.lng, selected.lat], zoom: z });
    else map.flyTo({ center: [selected.lng, selected.lat], zoom: z, duration: motionMs('slower') * 2 });
  }, [selectedId, selected, ready]);

  const zoomBy = (d: number) => {
    const map = mapRef.current;
    if (!map) return;
    if (d > 0) map.zoomIn({ duration: motionMs('moderate') });
    else map.zoomOut({ duration: motionMs('moderate') });
  };

  const findNearMe = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus(t.mapView.locateFailed);
      return;
    }
    setLocating(true);
    setStatus(t.mapView.locating);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const o = { lng: pos.coords.longitude, lat: pos.coords.latitude };
        if (originProp === undefined) setOriginState(o);
        onOriginChange?.(o);
        let nearest: MapPoint | null = null;
        let best = Infinity;
        for (const p of points) {
          const d = distanceKm(o, p);
          if (d < best) {
            best = d;
            nearest = p;
          }
        }
        if (nearest) {
          select(nearest.id);
          setStatus(t.mapView.sorted(nearest.name, formatDistance(best, unit, locale)));
        } else setStatus('');
      },
      () => {
        setLocating(false);
        setStatus(t.mapView.locateFailed);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }, // raw-ok: geolocation timeout and cache age, ms
    );
  };

  const minZoom = mapRef.current?.getMinZoom() ?? 0;
  const maxZoom = mapRef.current?.getMaxZoom() ?? 22;
  const showList = list !== 'none';
  const cardDistance = selected ? distanceText(selected.id) : null;

  return (
    <div
      data-slot="map-view"
      className={cn('grid gap-4', showList && 'md:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)]', showList && list === 'start' && 'md:grid-cols-[minmax(16rem,20rem)_minmax(0,1fr)]', className)}
    >
      <section
        aria-label={label}
        className={cn(
          'relative isolate h-80 min-w-0 overflow-hidden rounded-[var(--size-border-radius-border-radius-2xl)] border border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface-sunken)] md:h-[var(--map-height)]',
          showList && list === 'start' && 'md:order-2',
        )}
        style={{ '--map-height': `${height}px` } as React.CSSProperties}
      >
        {/* MapLibre's stylesheet (unlayered) sets position: relative on the map element, which beats an
            `absolute` utility: the wrapper takes the frame, the map fills it. */}
        <div data-slot="map-view-canvas" className="absolute inset-0">
          <div ref={containerRef} className="theya-map size-full" />
        </div>
        {failed && <p className="absolute inset-0 flex items-center justify-center p-6 text-center font-body text-body-s text-[var(--color-text-text-subtle)]">{t.mapView.unavailable}</p>}
        <div className="absolute end-3 top-3 z-10 flex flex-col overflow-hidden rounded-[var(--size-border-radius-border-radius-lg)] border border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] shadow-elevation-sm">
          <Button appearance="ghost" tone="neutral" size="sm" iconOnly aria-label={t.mapView.zoomIn} leftIcon={<Plus />} onClick={() => zoomBy(1)} disabled={!ready || (zoomLevel ?? 0) >= maxZoom} className="rounded-none" />
          <span aria-hidden className="h-px bg-[var(--color-border-border-subtler)]" />
          <Button appearance="ghost" tone="neutral" size="sm" iconOnly aria-label={t.mapView.zoomOut} leftIcon={<Minus />} onClick={() => zoomBy(-1)} disabled={!ready || (zoomLevel ?? 0) <= minZoom} className="rounded-none" />
        </div>
        {selected && (
          <div
            role="group"
            aria-label={selected.name}
            data-slot="map-view-card"
            className="absolute inset-x-3 bottom-10 z-10 flex items-start gap-3 rounded-[var(--size-border-radius-border-radius-xl)] border border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface-overlay)] p-4 shadow-elevation-md sm:inset-x-auto sm:start-3 sm:w-80"
          >
            <div className="min-w-0 flex-1">
              {renderCard ? (
                renderCard(selected, cardDistance)
              ) : (
                <div className="flex flex-col gap-1">
                  <p className="font-body text-body-m font-medium text-[var(--color-text-text)]">{selected.name}</p>
                  {selected.address && <p className="font-body text-body-s text-[var(--color-text-text-subtle)]">{selected.address}</p>}
                  {cardDistance && <p className="font-body text-body-s text-[var(--color-text-text-subtle)]">{t.mapView.away(cardDistance)}</p>}
                </div>
              )}
            </div>
            <Button appearance="ghost" tone="neutral" size="sm" iconOnly aria-label={t.common.close} leftIcon={<Xmark />} onClick={() => select(null)} className="-me-2 -mt-2 shrink-0" />
          </div>
        )}
      </section>

      {showList && (
        <div data-slot="map-view-list" className={cn('flex min-w-0 flex-col gap-3 md:h-[var(--map-height)]', list === 'start' && 'md:order-1')} style={{ '--map-height': `${height}px` } as React.CSSProperties}>
          {(listTitle || locate) && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              {listTitle ? (
                <h3 id={listId} className="font-body text-body-m font-semibold text-[var(--color-text-text)]">
                  {listTitle}
                </h3>
              ) : (
                <span />
              )}
              {locate && (
                <Button appearance="tonal" tone="primary" size="sm" leftIcon={<Position />} onClick={findNearMe} loading={locating}>
                  {t.mapView.findNearMe}
                </Button>
              )}
            </div>
          )}
          <p role="status" className="sr-only">
            {status}
          </p>
          {status && status !== t.mapView.locating && (
            <p aria-hidden className="font-body text-body-s text-[var(--color-text-text-subtle)]">
              {status}
            </p>
          )}
          <ul aria-labelledby={listTitle ? listId : undefined} aria-label={listTitle ? undefined : t.mapView.listLabel} className="-mx-1 flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-1 py-1">
            {sorted.map((p) => {
              const d = distanceText(p.id);
              return (
                <li key={p.id}>
                  <ListItem interactive selected={p.id === selectedId} title={p.name} description={p.address} trailing={d ? <span className="font-body text-body-s tabular-nums text-[var(--color-text-text-subtle)]">{d}</span> : undefined} onClick={() => select(p.id === selectedId ? null : p.id)} />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
