import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  fetchCurrentWeather,
  fetchOpenMeteoWeather,
  OPEN_METEO_QUALITY_WARNING,
  parseCurrentWeatherResponse,
  parseOpenMeteoResponse,
  WeatherServiceError,
} from './weather';

function response(body: unknown, ok = true): Response {
  return { ok, json: vi.fn().mockResolvedValue(body) } as unknown as Response;
}

afterEach(() => vi.useRealTimers());

describe('weather service', () => {
  it.each(['PAGASA PANaHON', 'Open-Meteo'])(
    'parses the runtime response and preserves provider %s',
    source => {
      const weather = parseCurrentWeatherResponse({
        success: true,
        source,
        data: {
          location: 'Gattaran, Cagayan',
          time: '2026-09-23T16:10:00+08:00',
          temperature_c: 29.56,
          apparent_temperature_c: 36,
          humidity: 79.5,
          rain_mm: 0,
          wind_speed_10m_kmh: 4.32,
          condition: 'Cloudy',
          source,
        },
      });

      expect(weather.source).toBe(source);
      expect(weather.temperatureC).toBe(29.56);
      expect(weather.rainfallMm).toBe(0);
      expect(weather.observedAt).toBe('2026-09-23T16:10:00+08:00');
    }
  );

  it('keeps unavailable rainfall distinct from a real zero', () => {
    const weather = parseCurrentWeatherResponse({
      success: true,
      source: 'Open-Meteo',
      data: { source: 'Open-Meteo', rain_mm: null },
    });

    expect(weather.rainfallMm).toBeNull();
  });

  it('rejects failed and malformed API payloads', () => {
    expect(() => parseCurrentWeatherResponse({ success: false })).toThrow(
      WeatherServiceError
    );
    expect(() =>
      parseCurrentWeatherResponse({ success: true, data: null })
    ).toThrow(/malformed/);
  });

  it('rejects non-success HTTP responses', async () => {
    const fetcher = vi.fn().mockResolvedValue(response({}, false));
    await expect(fetchCurrentWeather({ fetcher })).rejects.toMatchObject({
      reason: 'api',
    });
  });

  it('requests current weather using the fixed Gattaran coordinates', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      response({
        success: true,
        source: 'PAGASA PANaHON',
        data: { source: 'PAGASA PANaHON' },
      })
    );

    await fetchCurrentWeather({ fetcher });

    const requestedUrl = new URL(String(fetcher.mock.calls[0]?.[0]));
    expect(requestedUrl.pathname).toBe('/api/weather/current');
    expect(requestedUrl.searchParams.get('latitude')).toBe('18.054287');
    expect(requestedUrl.searchParams.get('longitude')).toBe('121.970096');
    expect(requestedUrl.searchParams.has('city')).toBe(false);
  });

  it('rejects malformed JSON', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockRejectedValue(new SyntaxError('bad json')),
    });
    await expect(fetchCurrentWeather({ fetcher })).rejects.toMatchObject({
      reason: 'malformed',
    });
  });

  it('aborts a request after the configured timeout', async () => {
    vi.useFakeTimers();
    const fetcher = vi.fn((_url: RequestInfo | URL, init?: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError'))
        );
      });
    });
    const pending = fetchCurrentWeather({
      fetcher,
      timeoutMs: 100,
      fallback: false,
    });
    const expectation = expect(pending).rejects.toMatchObject({
      reason: 'timeout',
    });
    await vi.advanceTimersByTimeAsync(100);
    await expectation;
  });
});

const openMeteoPayload = {
  latitude: 18.031633,
  longitude: 121.95525,
  utc_offset_seconds: 28800,
  timezone: 'Asia/Manila',
  current: {
    time: '2026-10-12T12:15',
    interval: 900,
    temperature_2m: 29.6,
    relative_humidity_2m: 64,
    apparent_temperature: 35.1,
    precipitation: 0,
    weather_code: 1,
    wind_speed_10m: 7.9,
  },
};

describe('Open-Meteo fallback provider', () => {
  it('maps the response and keeps the runtime provider and observation time', () => {
    const weather = parseOpenMeteoResponse(openMeteoPayload);

    expect(weather.source).toBe('Open-Meteo');
    expect(weather.observedAt).toBe('2026-10-12T12:15:00+08:00');
    expect(weather.temperatureC).toBe(29.6);
    expect(weather.apparentTemperatureC).toBe(35.1);
    expect(weather.humidityPercent).toBe(64);
    expect(weather.windSpeedKmh).toBe(7.9);
    expect(weather.rainfallMm).toBe(0);
    expect(weather.condition).toBe('Mainly clear');
    expect(weather.stationName).toBeNull();
    expect(weather.qualityWarning).toBe(OPEN_METEO_QUALITY_WARNING);
  });

  it('does not invent an observation time, rainfall or condition', () => {
    const weather = parseOpenMeteoResponse({
      current: { weather_code: 1234, temperature_2m: 30 },
    });

    expect(weather.observedAt).toBeNull();
    expect(weather.rainfallMm).toBeNull();
    expect(weather.condition).toBeNull();
  });

  it('rejects a payload without current conditions', () => {
    expect(() => parseOpenMeteoResponse({ latitude: 1 })).toThrow(/malformed/);
    expect(() => parseOpenMeteoResponse(null)).toThrow(WeatherServiceError);
  });

  it('requests the fixed Gattaran coordinates in Asia/Manila time', async () => {
    const fetcher = vi.fn().mockResolvedValue(response(openMeteoPayload));
    await fetchOpenMeteoWeather({ fetcher });

    const url = new URL(String(fetcher.mock.calls[0]?.[0]));
    expect(url.origin).toBe('https://api.open-meteo.com');
    expect(url.searchParams.get('latitude')).toBe('18.054287');
    expect(url.searchParams.get('longitude')).toBe('121.970096');
    expect(url.searchParams.get('timezone')).toBe('Asia/Manila');
  });
});

describe('fetchCurrentWeather fallback behavior', () => {
  const cisPayload = {
    success: true,
    source: 'PAGASA PANaHON',
    data: { source: 'PAGASA PANaHON', time: '2026-10-12T12:00:00+08:00' },
  };
  const hostOf = (call: unknown[]) => new URL(String(call[0])).hostname;

  it('uses only the primary provider when it succeeds', async () => {
    const fetcher = vi.fn().mockResolvedValue(response(cisPayload));
    const weather = await fetchCurrentWeather({ fetcher });

    expect(weather.source).toBe('PAGASA PANaHON');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['an HTTP error', () => Promise.resolve(response({}, false))],
    [
      'a network failure',
      () => Promise.reject(new TypeError('Failed to fetch')),
    ],
    ['a failed payload', () => Promise.resolve(response({ success: false }))],
  ])('falls back to Open-Meteo after %s', async (_label, primary) => {
    const fetcher = vi
      .fn()
      .mockImplementationOnce(primary)
      .mockResolvedValueOnce(response(openMeteoPayload));

    const weather = await fetchCurrentWeather({ fetcher });

    expect(weather.source).toBe('Open-Meteo');
    expect(weather.observedAt).toBe('2026-10-12T12:15:00+08:00');
    expect(fetcher.mock.calls.map(hostOf)).toEqual([
      'cis-mock.ginxproduction.com',
      'api.open-meteo.com',
    ]);
  });

  it('reports the primary failure when both providers fail', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(response({}, false))
      .mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(fetchCurrentWeather({ fetcher })).rejects.toMatchObject({
      reason: 'api',
    });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('does not call the fallback when the caller aborted', async () => {
    const controller = new AbortController();
    const fetcher = vi.fn(() => {
      controller.abort();
      return Promise.reject(new DOMException('Aborted', 'AbortError'));
    });

    await expect(
      fetchCurrentWeather({ fetcher, signal: controller.signal })
    ).rejects.toBeInstanceOf(WeatherServiceError);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('can disable the fallback', async () => {
    const fetcher = vi.fn().mockResolvedValue(response({}, false));
    await expect(
      fetchCurrentWeather({ fetcher, fallback: false })
    ).rejects.toMatchObject({ reason: 'api' });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('falls back after a primary timeout', async () => {
    vi.useFakeTimers();
    const fetcher = vi
      .fn()
      .mockImplementationOnce((_url: RequestInfo | URL, init?: RequestInit) => {
        return new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError'))
          );
        });
      })
      .mockResolvedValueOnce(response(openMeteoPayload));

    const pending = fetchCurrentWeather({ fetcher, timeoutMs: 100 });
    await vi.advanceTimersByTimeAsync(100);

    await expect(pending).resolves.toMatchObject({ source: 'Open-Meteo' });
  });
});
