import { Link } from 'react-router-dom';
import {
  buildAdvisories,
  formatDayLabel,
  formatDecimal,
  formatNumber,
  formatUpdatedAt,
  getUvLevel,
  getWeatherInfo,
  getWindDirection,
  HOMEPAGE_OUTLOOK_DAYS,
  LOCATION,
  useClimateData,
  type Advisory,
  type DailyOutlook,
} from '../../lib/climate';

function ClimateMetric({
  icon,
  label,
  value,
  helper,
}: {
  icon: string;
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="card-fade-in rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <i
        className={`${icon} inline-flex h-5 w-5 items-center justify-center text-primary-700 leading-none`}
        aria-hidden="true"
      />
      <p className="mt-3 text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
      {helper && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
    </div>
  );
}

function ForecastCard({ day, index }: { day: DailyOutlook; index: number }) {
  const condition = getWeatherInfo(day.weatherCode);

  return (
    <article className="card-fade-in rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {formatDayLabel(day.date, index)}
          </p>
          <p className="mt-1 text-xs text-slate-500">{condition.label}</p>
        </div>
        <i
          className={`${condition.icon} inline-flex h-8 w-8 items-center justify-center text-3xl leading-none text-primary-700`}
          aria-hidden="true"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-slate-500">Temperature</p>
          <p className="font-semibold text-slate-900">
            {formatNumber(day.temperatureMin)}°-
            {formatNumber(day.temperatureMax)}
            °C
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Rain chance</p>
          <p className="font-semibold text-slate-900">
            {formatNumber(day.precipitationProbability)}%
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Rain total</p>
          <p className="font-semibold text-slate-900">
            {formatDecimal(day.precipitation)} mm
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">UV level</p>
          <p className="font-semibold text-slate-900">
            {getUvLevel(day.uvIndex)}
          </p>
        </div>
      </div>
    </article>
  );
}

function AdvisoryCard({
  advisory,
  defaultOpen = false,
}: {
  advisory: Advisory;
  defaultOpen?: boolean;
}) {
  return (
    <details
      className={`card-fade-in group rounded-lg border shadow-sm ${advisory.tone}`}
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-start gap-3 p-5 marker:hidden [&::-webkit-details-marker]:hidden">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
          <i
            className={`${advisory.icon} inline-flex h-5 w-5 items-center justify-center leading-none`}
            aria-hidden="true"
          />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-slate-900">
            {advisory.audience}
          </h3>
          <p className="mt-1 text-sm font-medium text-primary-700">
            {advisory.status}
          </p>
        </div>
        <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/70 text-slate-500 transition-transform group-open:rotate-180">
          <i
            className="ri-arrow-down-s-line inline-flex h-5 w-5 items-center justify-center text-xl leading-none"
            aria-hidden="true"
          />
        </span>
      </summary>

      <div className="space-y-3 border-t border-black/5 px-5 pb-5 pt-4 text-sm leading-6 text-slate-700">
        <div className="grid lg:grid-cols-3 sm:grid-cols-1 gap-6">
          {advisory.details.map(detail => (
            <div key={detail.label}>
              <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">
                <i
                  className={`${detail.icon} mr-1 h-3 w-3 items-center justify-center text-slate-400`}
                  aria-hidden="true"
                />
                {detail.label}
              </p>
              <ul className="mt-1 list-disc space-y-1 pl-4">
                {detail.bullets.map(bullet => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}

export default function WeatherLocationSection() {
  const { snapshot, isLoading, hasError, isStale, staleSince } =
    useClimateData();

  const weather = snapshot?.weather;
  const today = snapshot?.outlook[0];
  const marine = snapshot?.marine;
  const condition = getWeatherInfo(weather?.weatherCode ?? null);
  const advisories = buildAdvisories(snapshot, hasError);
  const homepageOutlook = (snapshot?.outlook ?? []).slice(
    0,
    HOMEPAGE_OUTLOOK_DAYS
  );

  return (
    <section className="border-y border-slate-200 bg-sky-50 py-12 sm:py-16">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-normal text-primary-700">
              What's the weather?
            </p>
            <h2 className="mt-2 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
              Local Weather Conditions
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              A practical guide for residents, fisherfolk, and farmers.
            </p>
          </div>
          <Link
            to="/weather"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:underline"
          >
            View full 7-day forecast
            <i
              className="ri-arrow-right-line inline-flex h-4 w-4 items-center justify-center leading-none"
              aria-hidden="true"
            />
          </Link>
        </div>

        {isStale && (
          <div className="mb-6 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <i
              className="ri-wifi-off-line mt-0.5 inline-flex h-4 w-4 items-center justify-center leading-none"
              aria-hidden="true"
            />
            <span>
              Showing the last update from {formatUpdatedAt(staleSince)}. The
              live feed did not respond just now.
            </span>
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="card-fade-in rounded-md bg-primary-800 p-6 text-white shadow-sm sm:p-8">
            <div>
              <p className="text-lg font-semibold text-blue-100">
                {LOCATION.name}
              </p>
              <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="text-7xl font-bold leading-none tracking-normal sm:text-8xl">
                    {formatNumber(weather?.temperature)}
                  </span>
                  <span className="pt-2 text-3xl font-semibold text-blue-100">
                    °C
                  </span>
                </div>
                <div className="flex items-center gap-3 sm:max-w-56">
                  <i
                    className={`${condition.icon} inline-flex h-10 w-10 items-center justify-center text-5xl text-blue-100 leading-none`}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-lg font-semibold text-white">
                      {hasError ? 'Update unavailable' : condition.label}
                    </p>
                    <p className="mt-1 text-xs text-blue-100">
                      {hasError
                        ? 'Please check again shortly.'
                        : `as of ${formatUpdatedAt(weather?.time)}`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 border-t border-white/20 pt-5 sm:grid-cols-2">
                <span>
                  <span className="block text-xs text-blue-100">
                    Feels like
                  </span>
                  <span className="text-lg font-semibold text-white">
                    {formatNumber(weather?.apparentTemperature)}°C
                  </span>
                </span>
                <span>
                  <span className="block text-xs text-blue-100">
                    Rain chance today
                  </span>
                  <span className="text-lg font-semibold text-white">
                    {formatNumber(today?.precipitationProbability)}%
                  </span>
                </span>
                <span>
                  <span className="block text-xs text-blue-100">
                    Strongest wind
                  </span>
                  <span className="text-lg font-semibold text-white">
                    {formatNumber(weather?.windGusts)} km/h
                  </span>
                </span>
                <span>
                  <span className="block text-xs text-blue-100">
                    Sea condition
                  </span>
                  <span className="text-lg font-semibold text-white">
                    {formatDecimal(marine?.waveHeightMax)} m waves
                  </span>
                </span>
              </div>

              {isLoading && (
                <div className="mt-8 h-2 w-full max-w-xs overflow-hidden rounded-full bg-white/20">
                  <div className="h-full w-2/3 animate-pulse rounded-full bg-white/70" />
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <ClimateMetric
              icon="ri-rainy-line"
              label="Rain expected"
              value={`${formatDecimal(today?.precipitation)} mm`}
              helper="Use with local observations."
            />
            <ClimateMetric
              icon="ri-water-percent-line"
              label="Humidity"
              value={`${formatNumber(weather?.humidity)}%`}
              helper="High humidity can make heat feel heavier."
            />
            <ClimateMetric
              icon="ri-windy-line"
              label="Wind direction"
              value={getWindDirection(weather?.windDirection ?? null)}
              helper={`${formatNumber(weather?.windSpeed)} km/h sustained wind.`}
            />
            <ClimateMetric
              icon="ri-sun-line"
              label="UV level"
              value={getUvLevel(today?.uvIndex ?? null)}
              helper="Use shade, hats, and water when this is high."
            />
          </div>
        </div>

        <div className="mt-5 grid gap-3 rounded-md border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-3">
          <div className="sm:col-span-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <i
                className="ri-ship-2-line inline-flex h-4 w-4 items-center justify-center text-primary-700 leading-none"
                aria-hidden="true"
              />
              Sea &amp; Fishing Conditions
            </h3>
          </div>
          <div>
            <p className="text-xs text-slate-500">Wave height (today's max)</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {formatDecimal(marine?.waveHeightMax)} m
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Wave period</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {formatDecimal(marine?.wavePeriod)} s
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Sea surface temperature</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {formatNumber(marine?.seaSurfaceTemperature)}°C
            </p>
          </div>
        </div>

        <div className="mt-6 grid items-start gap-4 lg:grid-cols-1">
          <h3 className="text-lg font-semibold text-slate-900">
            Guidance for today
          </h3>

          {advisories.map(advisory => (
            <AdvisoryCard key={advisory.audience} advisory={advisory} />
          ))}
        </div>

        <div className="mt-6 grid">
          <div>
            <div className="mt-3 grid gap-4 md:grid-cols-3">
              {homepageOutlook.map((day, index) => (
                <ForecastCard key={day.date} day={day} index={index} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 text-xs leading-5 text-slate-500">
          <p>
            Data is provided by{' '}
            <a
              href="https://open-meteo.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary-700 underline"
            >
              Open-Meteo
            </a>{' '}
            . This service is for public guidance only. For official warnings,
            class suspensions, evacuation notices, and maritime advisories,
            follow local and national government announcements.
          </p>
        </div>
      </div>
    </section>
  );
}
