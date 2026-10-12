import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CurrentWeather } from '../../services/weather';
import CurrentWeatherCard from './CurrentWeatherCard';

const weather: CurrentWeather = {
  location: 'Gattaran, Cagayan',
  source: 'PAGASA PANaHON',
  observedAt: '2026-09-23T16:10:00+08:00',
  temperatureC: 29.56,
  apparentTemperatureC: 36,
  rainfallMm: 0,
  humidityPercent: 79.5,
  windSpeedKmh: 4.32,
  condition: null,
  stationName: 'Sta Ana, Cagayan AWS',
  qualityWarning:
    'Observations are from the nearest available station and may not represent exact site conditions.',
};

afterEach(() => vi.useRealTimers());

describe('CurrentWeatherCard', () => {
  it('shows a restrained loading state', () => {
    const loadWeather = vi.fn(() => new Promise<CurrentWeather>(() => {}));
    render(<CurrentWeatherCard loadWeather={loadWeather} />);
    expect(screen.getByText('Loading Gattaran weather…')).toBeInTheDocument();
  });

  it('renders temperature, zero rainfall, observation time, and PAGASA source', async () => {
    const loadWeather = vi.fn().mockResolvedValue(weather);
    render(<CurrentWeatherCard loadWeather={loadWeather} />);

    expect(await screen.findByText('29.6°C')).toBeInTheDocument();
    expect(screen.getByText('0.0 mm')).toBeInTheDocument();
    expect(screen.getByText('PAGASA PANaHON')).toBeInTheDocument();
    expect(screen.getByText(/Sep 23, 2026.*4:10 PM/)).toBeInTheDocument();
    expect(screen.getByText(/Sta Ana, Cagayan AWS/)).toBeInTheDocument();
  });

  it('renders a fallback provider and unavailable rainfall without inventing zero', async () => {
    const loadWeather = vi.fn().mockResolvedValue({
      ...weather,
      source: 'Open-Meteo',
      rainfallMm: null,
      stationName: null,
      qualityWarning: null,
    });
    render(<CurrentWeatherCard loadWeather={loadWeather} />);

    expect(await screen.findByText('Open-Meteo')).toBeInTheDocument();
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
    expect(screen.queryByText('0.0 mm')).not.toBeInTheDocument();
  });

  it('fails without breaking the surrounding page', async () => {
    const loadWeather = vi.fn().mockRejectedValue(new Error('offline'));
    render(<CurrentWeatherCard loadWeather={loadWeather} />);

    expect(
      await screen.findByText('Current weather is temporarily unavailable.')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/check PAGASA or local authorities/i)
    ).toBeInTheDocument();
  });

  it('supports a controlled manual refresh', async () => {
    const loadWeather = vi.fn().mockResolvedValue(weather);
    render(<CurrentWeatherCard loadWeather={loadWeather} />);
    await screen.findByText('PAGASA PANaHON');

    fireEvent.click(screen.getByRole('button', { name: 'Refresh weather' }));
    await waitFor(() => expect(loadWeather).toHaveBeenCalledTimes(2));
  });

  it('aborts the active request and clears polling on unmount', () => {
    vi.useFakeTimers();
    let capturedSignal: AbortSignal | undefined;
    const loadWeather = vi.fn(({ signal }: { signal?: AbortSignal } = {}) => {
      capturedSignal = signal;
      return new Promise<CurrentWeather>(() => {});
    });
    const { unmount } = render(
      <CurrentWeatherCard
        loadWeather={loadWeather}
        refreshIntervalMs={60_000}
      />
    );

    act(() => vi.advanceTimersByTime(1));
    expect(loadWeather).toHaveBeenCalledTimes(1);
    unmount();
    expect(capturedSignal?.aborted).toBe(true);
    vi.advanceTimersByTime(60_000);
    expect(loadWeather).toHaveBeenCalledTimes(1);
  });
});
