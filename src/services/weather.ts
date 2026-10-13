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

/** Requests JSON with a timeout; maps every failure to a WeatherServiceError. */
async function requestJson(
  endpoint: URL,
  {
    signal,
    timeoutMs = WEATHER_REQUEST_TIMEOUT_MS,
    fetcher = fetch,
  }: FetchWeatherOptions
): Promise<unknown> {
  const controller = new AbortController();
  let didTimeout = false;
  const abortFromCaller = () => controller.abort(signal?.reason);
  if (signal?.aborted) abortFromCaller();
  signal?.addEventListener('abort', abortFromCaller, { once: true });
  const timeout = window.setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, timeoutMs);

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
    return payload;
  } catch (error) {
    if (error instanceof WeatherServiceError) throw error;
    if (didTimeout) throw new WeatherServiceError('timeout', { cause: error });
    throw new WeatherServiceError('network', { cause: error });
  } finally {
    window.clearTimeout(timeout);
    signal?.removeEventListener('abort', abortFromCaller);
  }
}

/** Primary provider: the CIS public weather API. */
export async function fetchCisWeather(
  options: FetchWeatherOptions = {}
): Promise<CurrentWeather> {
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
  return parseCurrentWeatherResponse(await requestJson(endpoint, options));
}

export const OPEN_METEO_SOURCE = 'Open-Meteo';
const OPEN_METEO_ENDPOINT = 'https://api.open-meteo.com/v1/forecast';

/** WMO weather interpretation codes, as listed in the Open-Meteo documentation. */
const OPEN_METEO_CONDITIONS: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snowfall',
  73: 'Moderate snowfall',
  75: 'Heavy snowfall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  97: 'Heavy thunderstorm',
  99: 'Thunderstorm with heavy hail',
};

export const OPEN_METEO_QUALITY_WARNING =
  'Model data for a grid point near Gattaran, not a station observation.';

function formatUtcOffset(seconds: number): string {
  const sign = seconds < 0 ? '-' : '+';
  const absolute = Math.abs(seconds);
  const hours = String(Math.floor(absolute / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((absolute % 3600) / 60)).padStart(2, '0');
  return `${sign}${hours}:${minutes}`;
}

/** Converts an Open-Meteo `current` block into the shared CurrentWeather shape. */
export function parseOpenMeteoResponse(payload: unknown): CurrentWeather {
  const response = asRecord(payload);
  const current = asRecord(response?.current);
  if (!response || !current) throw new WeatherServiceError('malformed');

  // The API returns local time without an offset; keep the offset it reports
  // so the observation time stays unambiguous.
  const time = nullableString(current.time);
  const offset = nullableNumber(response.utc_offset_seconds);
  const observedAt =
    time && offset !== null ? `${time}:00${formatUtcOffset(offset)}` : null;
  const code = nullableNumber(current.weather_code);

  return {
    location: GATTARAN_WEATHER_LOCATION,
    source: OPEN_METEO_SOURCE,
    observedAt,
    temperatureC: nullableNumber(current.temperature_2m),
    apparentTemperatureC: nullableNumber(current.apparent_temperature),
    rainfallMm: nullableNumber(current.precipitation),
    humidityPercent: nullableNumber(current.relative_humidity_2m),
    windSpeedKmh: nullableNumber(current.wind_speed_10m),
    condition: code === null ? null : (OPEN_METEO_CONDITIONS[code] ?? null),
    stationName: null,
    qualityWarning: OPEN_METEO_QUALITY_WARNING,
  };
}

/** Fallback provider: Open-Meteo (no API key, cross-origin enabled). */
export async function fetchOpenMeteoWeather(
  options: FetchWeatherOptions = {}
): Promise<CurrentWeather> {
  const endpoint = new URL(OPEN_METEO_ENDPOINT);
  endpoint.searchParams.set(
    'latitude',
    String(GATTARAN_WEATHER_COORDINATES.latitude)
  );
  endpoint.searchParams.set(
    'longitude',
    String(GATTARAN_WEATHER_COORDINATES.longitude)
  );
  endpoint.searchParams.set(
    'current',
    'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m'
  );
  endpoint.searchParams.set('timezone', 'Asia/Manila');
  return parseOpenMeteoResponse(await requestJson(endpoint, options));
}

interface FetchCurrentWeatherOptions extends FetchWeatherOptions {
  /** Disable the Open-Meteo fallback (the primary error is then thrown). */
  fallback?: boolean;
}

/**
 * Current weather for Gattaran. Tries the CIS API first and falls back to
 * Open-Meteo when it fails. The returned `source` and `observedAt` always
 * come from whichever provider answered. A caller abort stops everything.
 */
export async function fetchCurrentWeather({
  fallback = true,
  ...options
}: FetchCurrentWeatherOptions = {}): Promise<CurrentWeather> {
  try {
    return await fetchCisWeather(options);
  } catch (primaryError) {
    if (!fallback || options.signal?.aborted) throw primaryError;
    try {
      return await fetchOpenMeteoWeather(options);
    } catch {
      // Report the primary failure; the fallback adds no diagnostic value.
      throw primaryError;
    }
  }
}
