import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  fetchCurrentWeather,
  parseCurrentWeatherResponse,
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
    const pending = fetchCurrentWeather({ fetcher, timeoutMs: 100 });
    const expectation = expect(pending).rejects.toMatchObject({
      reason: 'timeout',
    });
    await vi.advanceTimersByTimeAsync(100);
    await expectation;
  });
});
