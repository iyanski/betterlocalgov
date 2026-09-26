import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import type { Map as LeafletMap, TileLayer as LeafletTileLayer } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LOCATION } from '../../lib/climate';

const RADAR_CENTER: [number, number] = [LOCATION.latitude, LOCATION.longitude];
const DEFAULT_ZOOM = 8;
const FRAME_INTERVAL_MS = 700;

type RainViewerFrame = {
  time: number;
  path: string;
};

type RainViewerResponse = {
  radar?: {
    past?: RainViewerFrame[];
    nowcast?: RainViewerFrame[];
  };
};

const RAINVIEWER_API = 'https://api.rainviewer.com/public/weather-maps.json';
const RADAR_TILE_SIZE = 256;
const RADAR_COLOR_SCHEME = 2; // universal blue scale
const RADAR_SMOOTHING = 1;

const formatFrameTime = (unixSeconds: number) =>
  new Intl.DateTimeFormat('en-PH', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(unixSeconds * 1000));

/**
 * Rain radar overlay for Aparri using RainViewer's free, keyless tile API.
 * Shows the past ~2 hours of radar frames plus short-term nowcast, looped
 * as a simple animation. Radar-only (no wind/temperature layers) — see
 * docs/plan/13-weather-radar-map for why this was chosen over the
 * Open-Meteo MapLibre layer.
 *
 * RainViewer's terms require visible attribution, which is rendered below
 * the map (not just in the Leaflet corner attribution).
 */
export default function WeatherRadarMap() {
  const [frames, setFrames] = useState<RainViewerFrame[]>([]);
  const [pastCount, setPastCount] = useState(0);
  const [frameIndex, setFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef<LeafletMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const radarLayerRef = useRef<LeafletTileLayer | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    const loadFrames = async () => {
      try {
        const response = await fetch(RAINVIEWER_API, {
          signal: abortController.signal,
        });
        if (!response.ok) throw new Error('Unable to load radar frames');

        const data = (await response.json()) as RainViewerResponse;
        const past = data.radar?.past ?? [];
        const nowcast = data.radar?.nowcast ?? [];
        const allFrames = [...past, ...nowcast];

        if (allFrames.length === 0) throw new Error('No radar frames returned');

        setFrames(allFrames);
        setPastCount(past.length);
        // Start on the latest observed frame (last of "past"), not the
        // forecast nowcast, so the default view is a real reading.
        setFrameIndex(Math.max(past.length - 1, 0));
        setHasError(false);
      } catch (error) {
        if ((error as DOMException).name !== 'AbortError') {
          setHasError(true);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadFrames();

    return () => {
      abortController.abort();
    };
  }, []);

  // Animate through frames when playing.
  useEffect(() => {
    if (!isPlaying || frames.length === 0) return;

    const interval = setInterval(() => {
      setFrameIndex(current => (current + 1) % frames.length);
    }, FRAME_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isPlaying, frames.length]);

  // Swap the radar tile layer whenever the active frame changes, instead
  // of remounting <TileLayer>, so tiles already fetched for a frame stay
  // cached by the browser as the animation loops.
  useEffect(() => {
    const map = mapRef.current;
    const frame = frames[frameIndex];
    if (!map || !frame) return;

    let cancelled = false;

    void import('leaflet').then(L => {
      if (cancelled) return;

      const nextLayer = L.tileLayer(
        `https://tilecache.rainviewer.com/v2/radar/${frame.path}/${RADAR_TILE_SIZE}/{z}/{x}/{y}/${RADAR_COLOR_SCHEME}/1_${RADAR_SMOOTHING}.png`,
        { opacity: 0.65, zIndex: 10 }
      );

      nextLayer.addTo(map);
      const previousLayer = radarLayerRef.current;
      radarLayerRef.current = nextLayer;

      if (previousLayer) {
        map.removeLayer(previousLayer);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [frames, frameIndex]);

  // The map card is stretched by its parent grid to match the height of
  // the column next to it, so its container's real height is only known
  // after that layout settles (and can change again on window resize).
  // Leaflet sizes its canvas once at mount and won't notice a container
  // resize on its own, which left a blank strip under the tiles — so we
  // watch the container and re-measure the map whenever it changes.
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const invalidate = () => mapRef.current?.invalidateSize();

    // Layout may still be settling right after mount (fonts, sibling
    // content), so check again on the next couple of frames too.
    const raf1 = requestAnimationFrame(() => {
      invalidate();
      requestAnimationFrame(invalidate);
    });

    const resizeObserver = new ResizeObserver(invalidate);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(raf1);
      resizeObserver.disconnect();
    };
  }, [hasError]);

  const activeFrame = frames[frameIndex];
  const isNowcast = frameIndex >= pastCount;

  return (
    <div className="card-fade-in flex h-full flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <i
              className="ri-radar-line inline-flex h-5 w-5 items-center justify-center text-primary-700 leading-none"
              aria-hidden="true"
            />
            Rain Radar
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {hasError
              ? 'Radar imagery is unavailable right now.'
              : activeFrame
                ? `${isNowcast ? 'Forecast' : 'Observed'} · ${formatFrameTime(activeFrame.time)}`
                : 'Loading radar frames...'}
          </p>
        </div>
        {!hasError && frames.length > 0 && (
          <button
            type="button"
            onClick={() => setIsPlaying(playing => !playing)}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <i
              className={`${isPlaying ? 'ri-pause-line' : 'ri-play-line'} inline-flex h-4 w-4 items-center justify-center leading-none`}
              aria-hidden="true"
            />
            {isPlaying ? 'Pause' : 'Play'}
          </button>
        )}
      </div>

      {hasError ? (
        <div className="flex min-h-[280px] flex-1 items-center justify-center bg-slate-50 text-sm text-slate-500">
          Could not load the rain radar. Please try again later.
        </div>
      ) : (
        <div ref={mapContainerRef} className="relative min-h-[280px] flex-1">
          {isLoading && (
            <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-slate-50/80">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-700 border-t-transparent" />
            </div>
          )}
          <MapContainer
            center={RADAR_CENTER}
            zoom={DEFAULT_ZOOM}
            scrollWheelZoom={false}
            className="h-full w-full"
            ref={mapRef}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </MapContainer>
        </div>
      )}

      <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
        <p>
          Radar imagery by{' '}
          <a
            href="https://www.rainviewer.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary-700 underline"
          >
            RainViewer
          </a>
          . This shows rain echoes only and is not an official PAGASA product.
          For typhoon signals and official warnings, follow PAGASA and local
          government announcements.
        </p>
      </div>
    </div>
  );
}
