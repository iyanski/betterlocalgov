import SEO from '../components/SEO';
import Section from '../components/ui/Section';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { Heading } from '../components/ui/Heading';
import { Text } from '../components/ui/Text';
import WeatherRadarMap from '../components/weather/WeatherRadarMap';
import {
  assessSea,
  buildAdvisories,
  formatDayLabel,
  formatDecimal,
  formatNumber,
  formatUpdatedAt,
  getRiskTone,
  getUvLevel,
  getWeatherInfo,
  getWindDirection,
  LOCATION,
  useClimateData,
  type Advisory,
  type DailyOutlook,
} from '../lib/climate';

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
          <p className="text-xs text-slate-500">Wind (max)</p>
          <p className="font-semibold text-slate-900">
            {formatNumber(day.windGusts)} km/h
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

function AdvisoryCard({ advisory }: { advisory: Advisory }) {
  return (
    <div
      className={`card-fade-in rounded-lg border p-5 shadow-sm ${advisory.tone}`}
    >
      <div className="flex items-start gap-3">
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
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {advisory.details.map(detail => (
          <div key={detail.label}>
            <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">
              <i
                className={`${detail.icon} mr-1 h-3 w-3 items-center justify-center text-slate-400`}
                aria-hidden="true"
              />
              {detail.label}
            </p>
            <ul className="mt-1 list-disc space-y-1 pl-4 text-sm leading-6 text-slate-700">
              {detail.bullets.map(bullet => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Weather() {
  const { snapshot, isLoading, hasError, isStale, staleSince } =
    useClimateData();

  const weather = snapshot?.weather;
  const marine = snapshot?.marine;
  const outlook = snapshot?.outlook ?? [];
  const today = outlook[0];
  const condition = getWeatherInfo(weather?.weatherCode ?? null);
  const advisories = buildAdvisories(snapshot, hasError);
  const sea = snapshot
    ? assessSea(
        marine?.waveHeightMax ?? marine?.waveHeight ?? null,
        marine?.wavePeriodMax ?? marine?.wavePeriod ?? null,
        weather?.windGusts ?? null
      )
    : null;

  return (
    <>
      <SEO
        title="Weather Forecast"
        description={`7-day weather, sea, and farm guidance for ${LOCATION.name}.`}
        pageType="WebPage"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Weather', href: '/weather' },
        ]}
      />

      <Section className="p-3 mb-12">
        <Breadcrumbs className="mb-8" />

        <Heading className="mb-2">Weather Forecast</Heading>
        <Text className="mb-8 max-w-3xl text-slate-600">
          A full 7-day outlook for {LOCATION.name}
        </Text>

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

        <div className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="flex h-full flex-col gap-5">
            <div className="card-fade-in rounded-md bg-primary-800 p-6 text-white shadow-sm sm:p-8">
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

              {isLoading && (
                <div className="mt-8 h-2 w-full max-w-xs overflow-hidden rounded-full bg-white/20">
                  <div className="h-full w-2/3 animate-pulse rounded-full bg-white/70" />
                </div>
              )}
            </div>

            <div className="card-fade-in grid gap-4 rounded-md border border-slate-200 bg-white p-5 text-sm text-slate-600 sm:grid-cols-3">
              <div>
                <p className="text-xs text-slate-500">Humidity</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {formatNumber(weather?.humidity)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Rain expected today</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {formatDecimal(today?.precipitation)} mm
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">UV level today</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {getUvLevel(today?.uvIndex ?? null)}
                </p>
              </div>
            </div>

            <div
              className={`card-fade-in flex-1 rounded-md border p-6 shadow-sm ${sea ? getRiskTone(sea.level) : 'border-slate-200 bg-white'}`}
            >
              <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <i
                  className="ri-ship-2-line inline-flex h-5 w-5 items-center justify-center text-primary-700 leading-none"
                  aria-hidden="true"
                />
                Sea &amp; Fishing Conditions
              </h2>
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Wave height (max)</p>
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
                  <p className="text-xs text-slate-500">Sea surface temp</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {formatNumber(marine?.seaSurfaceTemperature)}°C
                  </p>
                </div>
              </div>
              {sea && (
                <p className="mt-4 text-sm font-medium text-slate-800">
                  {sea.status} — {sea.detail}
                </p>
              )}
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-200 pt-4 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Wind direction</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {getWindDirection(weather?.windDirection ?? null)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">
                    Strongest wind (gusts)
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {formatNumber(weather?.windGusts)} km/h
                  </p>
                </div>
              </div>
            </div>
          </div>

          <WeatherRadarMap />
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-semibold text-slate-900">
            Guidance today
          </h2>
          <div className="mt-3 grid gap-4">
            {advisories.map(advisory => (
              <AdvisoryCard key={advisory.audience} advisory={advisory} />
            ))}
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-semibold text-slate-900">
            7-Day Weather Outlook
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {outlook.map((day, index) => (
              <ForecastCard key={day.date} day={day} index={index} />
            ))}
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
            follow local and national government announcements, including
            PAGASA.
          </p>
        </div>
      </Section>
    </>
  );
}
