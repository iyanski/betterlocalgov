const WEATHER_API_BASE_URL =
  import.meta.env.VITE_WEATHER_API_BASE_URL ||
  'https://cis-mock.ginxproduction.com/api';

export const GATTARAN_WEATHER_LOCATION = 'Gattaran, Cagayan';
export const GATTARAN_WEATHER_COORDINATES = {
  latitude: 18.054287,
  longitude: 121.970096,
} as const;
export const WEATHER_REQUEST_TIMEOUT_MS = 10_000;

export interface CurrentWeather {
  location: string;
  source: string;
  observedAt: string | null;
  temperatureC: number | null;
  apparentTemperatureC: number | null;
  rainfallMm: number | null;
  humidityPercent: number | null;
  windSpeedKmh: number | null;
  condition: string | null;
  stationName: string | null;
  qualityWarning: string | null;
}

interface FetchWeatherOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
  fetcher?: typeof fetch;
}

export class WeatherServiceError extends Error {
  public readonly reason: 'api' | 'malformed' | 'network' | 'timeout';

  constructor(
    reason: 'api' | 'malformed' | 'network' | 'timeout',
    options?: ErrorOptions
  ) {
    super(`Weather request failed: ${reason}`, options);
    this.name = 'WeatherServiceError';
    this.reason = reason;
  }
}

function nullableNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function nullableString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : null;
}

export function parseCurrentWeatherResponse(payload: unknown): CurrentWeather {
  const response = asRecord(payload);
  if (!response || response.success !== true) {
    throw new WeatherServiceError('api');
  }

  const data = asRecord(response.data);
  if (!data) throw new WeatherServiceError('malformed');

  const source = nullableString(data.source) ?? nullableString(response.source);
  if (!source) throw new WeatherServiceError('malformed');

  const station = asRecord(data.station);
  const quality = asRecord(data.quality);
  const warnings = Array.isArray(quality?.warnings)
    ? quality.warnings.filter(
        (warning): warning is string => typeof warning === 'string'
      )
    : [];

  return {
    location: nullableString(data.location) ?? GATTARAN_WEATHER_LOCATION,
    source,
    observedAt: nullableString(data.time),
    temperatureC: nullableNumber(data.temperature_c),
    apparentTemperatureC: nullableNumber(data.apparent_temperature_c),
    rainfallMm:
      nullableNumber(data.rain_mm) ?? nullableNumber(data.precipitation_mm),
    humidityPercent: nullableNumber(data.humidity),
    windSpeedKmh: nullableNumber(data.wind_speed_10m_kmh),
    condition: nullableString(data.condition),
    stationName: nullableString(station?.station_name),
    qualityWarning: warnings[0] ?? null,
  };
}

export async function fetchCurrentWeather({
  signal,
  timeoutMs = WEATHER_REQUEST_TIMEOUT_MS,
  fetcher = fetch,
}: FetchWeatherOptions = {}): Promise<CurrentWeather> {
  const controller = new AbortController();
  let didTimeout = false;
  const abortFromCaller = () => controller.abort(signal?.reason);
  if (signal?.aborted) abortFromCaller();
  signal?.addEventListener('abort', abortFromCaller, { once: true });
  const timeout = window.setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, timeoutMs);

  const endpoint = new URL(
    `${WEATHER_API_BASE_URL.replace(/\/$/, '')}/weather/current`
  );
  endpoint.searchParams.set(
    'latitude',
    String(GATTARAN_WEATHER_COORDINATES.latitude)
  );
  endpoint.searchParams.set(
    'longitude',
    String(GATTARAN_WEATHER_COORDINATES.longitude)
  );

  try {
    const response = await fetcher(endpoint, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) throw new WeatherServiceError('api');

    let payload: unknown;
    try {
      payload = await response.json();
    } catch (error) {
      throw new WeatherServiceError('malformed', { cause: error });
    }
    return parseCurrentWeatherResponse(payload);
  } catch (error) {
    if (error instanceof WeatherServiceError) throw error;
    if (didTimeout) throw new WeatherServiceError('timeout', { cause: error });
    throw new WeatherServiceError('network', { cause: error });
  } finally {
    window.clearTimeout(timeout);
    signal?.removeEventListener('abort', abortFromCaller);
  }
}
