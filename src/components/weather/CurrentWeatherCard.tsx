import { useCallback, useEffect, useRef, useState } from 'react';
import { CloudSun, RefreshCw } from 'lucide-react';
import {
  fetchCurrentWeather,
  type CurrentWeather,
} from '../../services/weather';

export const WEATHER_REFRESH_INTERVAL_MS = 15 * 60 * 1000;

interface CurrentWeatherCardProps {
  loadWeather?: typeof fetchCurrentWeather;
  refreshIntervalMs?: number;
}

function metric(value: number | null, unit: string, digits = 0): string {
  return value === null ? 'Unavailable' : `${value.toFixed(digits)}${unit}`;
}

function observationTime(value: string | null): string {
  if (!value) return 'Unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unavailable';
  return new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Manila',
  }).format(date);
}

export default function CurrentWeatherCard({
  loadWeather = fetchCurrentWeather,
  refreshIntervalMs = WEATHER_REFRESH_INTERVAL_MS,
}: CurrentWeatherCardProps) {
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const activeController = useRef<AbortController | null>(null);

  const refresh = useCallback(
    async (initial = false) => {
      activeController.current?.abort();
      const controller = new AbortController();
      activeController.current = controller;
      if (initial) setIsLoading(true);
      else setIsRefreshing(true);
      setHasError(false);

      try {
        const nextWeather = await loadWeather({ signal: controller.signal });
        if (!controller.signal.aborted) setWeather(nextWeather);
      } catch {
        if (!controller.signal.aborted) setHasError(true);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [loadWeather]
  );

  useEffect(() => {
    const initialRequest = window.setTimeout(() => void refresh(true), 0);
    const interval = window.setInterval(
      () => void refresh(false),
      refreshIntervalMs
    );
    return () => {
      window.clearTimeout(initialRequest);
      window.clearInterval(interval);
      activeController.current?.abort();
    };
  }, [refresh, refreshIntervalMs]);

  return (
    <section
      aria-labelledby="gattaran-weather-heading"
      aria-busy={isLoading || isRefreshing}
      className="rounded-xl border border-white/30 bg-white p-6 text-gray-900 shadow-lg"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">
            Live local weather
          </p>
          <h2 id="gattaran-weather-heading" className="mt-1 text-xl font-bold">
            Weather in Gattaran
          </h2>
        </div>
        <CloudSun className="h-8 w-8 text-primary-700" aria-hidden="true" />
      </div>

      {isLoading && !weather && (
        <p role="status" className="mt-6 text-gray-600">
          Loading Gattaran weather…
        </p>
      )}

      {hasError && !weather && (
        <div role="status" className="mt-6 text-gray-700">
          <p className="font-semibold">
            Current weather is temporarily unavailable.
          </p>
          <p className="mt-2 text-sm">
            Please check PAGASA or local authorities for official weather
            advisories.
          </p>
        </div>
      )}

      {weather && (
        <div className="mt-5">
          <div className="flex items-end gap-3">
            <p className="text-4xl font-bold text-gray-950">
              {metric(weather.temperatureC, '°C', 1)}
            </p>
            {weather.condition && (
              <p className="pb-1 text-lg font-medium">{weather.condition}</p>
            )}
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-x-5 gap-y-3 text-sm">
            <div>
              <dt className="text-gray-600">Feels like</dt>
              <dd className="font-semibold">
                {metric(weather.apparentTemperatureC, '°C', 1)}
              </dd>
            </div>
            <div>
              <dt className="text-gray-600">Rainfall</dt>
              <dd className="font-semibold">
                {metric(weather.rainfallMm, ' mm', 1)}
              </dd>
            </div>
            <div>
              <dt className="text-gray-600">Humidity</dt>
              <dd className="font-semibold">
                {metric(weather.humidityPercent, '%', 0)}
              </dd>
            </div>
            <div>
              <dt className="text-gray-600">Wind</dt>
              <dd className="font-semibold">
                {metric(weather.windSpeedKmh, ' km/h', 1)}
              </dd>
            </div>
          </dl>
          <div className="mt-5 border-t border-gray-200 pt-4 text-xs text-gray-600">
            <p>
              <span className="font-semibold text-gray-800">Observed:</span>{' '}
              <time dateTime={weather.observedAt ?? undefined}>
                {observationTime(weather.observedAt)}
              </time>
            </p>
            <p className="mt-1">
              <span className="font-semibold text-gray-800">Source:</span>{' '}
              {weather.source}
            </p>
            {weather.stationName && (
              <p className="mt-1">
                Nearest reporting station: {weather.stationName}
              </p>
            )}
            {weather.qualityWarning && (
              <p className="mt-2 text-warning-800">{weather.qualityWarning}</p>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        disabled={isLoading || isRefreshing}
        onClick={() => void refresh(false)}
        className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RefreshCw
          className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
          aria-hidden="true"
        />
        {isRefreshing ? 'Refreshing…' : 'Refresh weather'}
      </button>
    </section>
  );
}
