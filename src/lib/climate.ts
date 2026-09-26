import { useEffect, useRef, useState } from 'react';

export type NullableNumber = number | null;

type OpenMeteoCurrent = {
  time?: string;
  temperature_2m?: number;
  relative_humidity_2m?: number;
  apparent_temperature?: number;
  precipitation?: number;
  weather_code?: number;
  cloud_cover?: number;
  pressure_msl?: number;
  wind_speed_10m?: number;
  wind_direction_10m?: number;
  wind_gusts_10m?: number;
};

type OpenMeteoDaily = {
  time?: string[];
  weather_code?: number[];
  temperature_2m_max?: number[];
  temperature_2m_min?: number[];
  precipitation_sum?: number[];
  precipitation_probability_max?: number[];
  wind_speed_10m_max?: number[];
  wind_gusts_10m_max?: number[];
  uv_index_max?: number[];
  et0_fao_evapotranspiration?: number[];
  shortwave_radiation_sum?: number[];
};

type OpenMeteoForecastResponse = {
  current?: OpenMeteoCurrent;
  daily?: OpenMeteoDaily;
};

type OpenMeteoMarineCurrent = {
  time?: string;
  wave_height?: number;
  wave_period?: number;
  sea_surface_temperature?: number;
};

type OpenMeteoMarineDaily = {
  wave_height_max?: number[];
  wave_period_max?: number[];
  wave_period?: number[];
};

type OpenMeteoMarineResponse = {
  current?: OpenMeteoMarineCurrent;
  daily?: OpenMeteoMarineDaily;
};

export type WeatherSnapshot = {
  time: string;
  temperature: number;
  humidity: NullableNumber;
  apparentTemperature: NullableNumber;
  precipitation: NullableNumber;
  weatherCode: NullableNumber;
  cloudCover: NullableNumber;
  pressure: NullableNumber;
  windDirection: NullableNumber;
  windGusts: NullableNumber;
  windSpeed: NullableNumber;
};

export type DailyOutlook = {
  date: string;
  weatherCode: NullableNumber;
  temperatureMax: NullableNumber;
  temperatureMin: NullableNumber;
  precipitation: NullableNumber;
  precipitationProbability: NullableNumber;
  windSpeed: NullableNumber;
  windGusts: NullableNumber;
  uvIndex: NullableNumber;
  evapotranspiration: NullableNumber;
  solarRadiation: NullableNumber;
};

export type MarineSnapshot = {
  time: string;
  waveHeight: NullableNumber;
  wavePeriod: NullableNumber;
  seaSurfaceTemperature: NullableNumber;
  waveHeightMax: NullableNumber;
  wavePeriodMax: NullableNumber;
};

export type ClimateSnapshot = {
  weather: WeatherSnapshot;
  outlook: DailyOutlook[];
  marine: MarineSnapshot;
};

export type WeatherCodeInfo = {
  label: string;
  icon: string;
};

export type AdvisoryDetail = {
  icon?: string;
  label: string;
  bullets: string[];
};

export type Advisory = {
  audience: string;
  icon: string;
  status: string;
  tone: string;
  details: AdvisoryDetail[];
};

export type RiskLevel = 'low' | 'watch' | 'caution' | 'high';

export type HazardType = 'heat' | 'rain' | 'wind' | 'sea' | 'farm' | 'none';

export type RiskAssessment = {
  level: RiskLevel;
  hazard: HazardType;
  status: string;
  detail: string;
  actions: string[];
};

export const LOCATION = {
  name: 'Aparri, Cagayan',
  latitude: 18.3566,
  longitude: 121.6406,
};

/** Days of forecast to request from Open-Meteo. Open-Meteo allows up to 16
 * for the standard forecast API; 7 gives residents a full week of planning
 * horizon without over-fetching. */
export const FORECAST_DAYS = 7;

/** How many of the fetched days to show in the compact homepage widget. The
 * full week is available on the dedicated /weather page. */
export const HOMEPAGE_OUTLOOK_DAYS = 3;

const CACHE_KEY = 'betteraparri:climate-snapshot:v1';
const CACHE_MAX_AGE_MS = 3 * 60 * 60 * 1000; // 3 hours

const CURRENT_WEATHER_VARIABLES = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'precipitation',
  'weather_code',
  'cloud_cover',
  'pressure_msl',
  'wind_speed_10m',
  'wind_direction_10m',
  'wind_gusts_10m',
];

const DAILY_WEATHER_VARIABLES = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_sum',
  'precipitation_probability_max',
  'wind_speed_10m_max',
  'wind_gusts_10m_max',
  'uv_index_max',
  'et0_fao_evapotranspiration',
  'shortwave_radiation_sum',
];

const CURRENT_MARINE_VARIABLES = [
  'wave_height',
  'wave_period',
  'sea_surface_temperature',
];

const DAILY_MARINE_VARIABLES = ['wave_height_max', 'wave_period_max'];

const WEATHER_CODE_LOOKUP: Record<number, WeatherCodeInfo> = {
  0: { label: 'Clear sky', icon: 'ri-sun-line' },
  1: { label: 'Mainly clear', icon: 'ri-sun-cloudy-line' },
  2: { label: 'Partly cloudy', icon: 'ri-sun-cloudy-line' },
  3: { label: 'Overcast', icon: 'ri-cloudy-line' },
  45: { label: 'Fog', icon: 'ri-mist-line' },
  48: { label: 'Rime fog', icon: 'ri-mist-line' },
  51: { label: 'Light drizzle', icon: 'ri-drizzle-line' },
  53: { label: 'Moderate drizzle', icon: 'ri-drizzle-line' },
  55: { label: 'Dense drizzle', icon: 'ri-drizzle-line' },
  61: { label: 'Slight rain', icon: 'ri-rainy-line' },
  63: { label: 'Moderate rain', icon: 'ri-rainy-line' },
  65: { label: 'Heavy rain', icon: 'ri-heavy-showers-line' },
  80: { label: 'Rain showers', icon: 'ri-showers-line' },
  81: { label: 'Moderate showers', icon: 'ri-showers-line' },
  82: { label: 'Heavy showers', icon: 'ri-heavy-showers-line' },
  95: { label: 'Thunderstorm', icon: 'ri-thunderstorms-line' },
  96: { label: 'Thunderstorm with hail', icon: 'ri-thunderstorms-line' },
  99: { label: 'Thunderstorm with heavy hail', icon: 'ri-thunderstorms-line' },
};

export const getWeatherInfo = (
  weatherCode: NullableNumber
): WeatherCodeInfo => {
  if (weatherCode === null) {
    return { label: 'Current forecast', icon: 'ri-cloud-line' };
  }

  return (
    WEATHER_CODE_LOOKUP[weatherCode] ?? {
      label: 'Current conditions',
      icon: 'ri-cloud-line',
    }
  );
};

const readNumber = (value: unknown): NullableNumber => {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
};

export const formatNumber = (
  value: NullableNumber | undefined,
  fallback = '--'
) => {
  if (typeof value !== 'number') return fallback;

  return Math.round(value).toString();
};

export const formatDecimal = (
  value: NullableNumber | undefined,
  digits = 1,
  fallback = '--'
) => {
  if (typeof value !== 'number') return fallback;

  return value.toFixed(digits);
};

export const formatUpdatedAt = (time: string | null | undefined) => {
  if (!time) return 'Live forecast from Open-Meteo';

  return new Intl.DateTimeFormat('en-PH', {
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  }).format(new Date(time));
};

export const formatDayLabel = (date: string, index: number) => {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';

  return new Intl.DateTimeFormat('en-PH', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

export const getUvLevel = (uvIndex: NullableNumber) => {
  if (typeof uvIndex !== 'number') return 'Check UV';
  if (uvIndex >= 11) return 'Extreme';
  if (uvIndex >= 8) return 'Very high';
  if (uvIndex >= 6) return 'High';
  if (uvIndex >= 3) return 'Moderate';

  return 'Low';
};

export const getWindDirection = (degrees: NullableNumber) => {
  if (typeof degrees !== 'number') return '--';

  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % directions.length;

  return directions[index];
};

const getWeatherApiUrl = (days: number) => {
  const params = new URLSearchParams({
    latitude: LOCATION.latitude.toString(),
    longitude: LOCATION.longitude.toString(),
    current: CURRENT_WEATHER_VARIABLES.join(','),
    daily: DAILY_WEATHER_VARIABLES.join(','),
    timezone: 'Asia/Manila',
    forecast_days: days.toString(),
  });

  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
};

const getMarineApiUrl = (days: number) => {
  const params = new URLSearchParams({
    latitude: LOCATION.latitude.toString(),
    longitude: LOCATION.longitude.toString(),
    current: CURRENT_MARINE_VARIABLES.join(','),
    daily: DAILY_MARINE_VARIABLES.join(','),
    timezone: 'Asia/Manila',
    forecast_days: days.toString(),
    cell_selection: 'sea',
  });

  return `https://marine-api.open-meteo.com/v1/marine?${params.toString()}`;
};

const firstValue = (values: number[] | undefined): NullableNumber => {
  return readNumber(values?.[0]);
};

const buildDailyOutlook = (daily: OpenMeteoDaily | undefined, days: number) => {
  const times = daily?.time ?? [];

  return times.slice(0, days).map((date, index) => ({
    date,
    weatherCode: readNumber(daily?.weather_code?.[index]),
    temperatureMax: readNumber(daily?.temperature_2m_max?.[index]),
    temperatureMin: readNumber(daily?.temperature_2m_min?.[index]),
    precipitation: readNumber(daily?.precipitation_sum?.[index]),
    precipitationProbability: readNumber(
      daily?.precipitation_probability_max?.[index]
    ),
    windSpeed: readNumber(daily?.wind_speed_10m_max?.[index]),
    windGusts: readNumber(daily?.wind_gusts_10m_max?.[index]),
    uvIndex: readNumber(daily?.uv_index_max?.[index]),
    evapotranspiration: readNumber(daily?.et0_fao_evapotranspiration?.[index]),
    solarRadiation: readNumber(daily?.shortwave_radiation_sum?.[index]),
  }));
};

const riskRank: Record<RiskLevel, number> = {
  low: 0,
  watch: 1,
  caution: 2,
  high: 3,
};

export const getHighestRisk = (...levels: RiskLevel[]) => {
  return levels.reduce<RiskLevel>((highest, level) => {
    return riskRank[level] > riskRank[highest] ? level : highest;
  }, 'low');
};

export const getRiskTone = (level: RiskLevel) => {
  if (level === 'high') return 'border-rose-200 bg-rose-50';
  if (level === 'caution') return 'border-amber-200 bg-amber-50';
  if (level === 'watch') return 'border-sky-200 bg-sky-50';

  return 'border-slate-200 bg-white';
};

const assessHeat = (
  apparentTemperature: NullableNumber,
  humidity: NullableNumber
): RiskAssessment => {
  if (typeof apparentTemperature !== 'number') {
    return {
      level: 'watch',
      hazard: 'heat',
      status: 'Check heat conditions',
      detail: 'Heat index is not available right now.',
      actions: ['Bring water and avoid staying too long under direct sun.'],
    };
  }

  const humidityUnavailable = typeof humidity !== 'number';

  if (apparentTemperature >= 52) {
    return {
      level: 'high',
      hazard: 'heat',
      status: 'Extreme danger heat index',
      detail:
        'This is very dangerous heat. Heat stroke can happen with long exposure.',
      actions: ['Stay indoors or in shade. Drink water often.'],
    };
  }

  if (apparentTemperature >= 42) {
    return {
      level: 'high',
      hazard: 'heat',
      status: 'Danger heat index',
      detail: 'The heat can cause cramps, exhaustion, or heat stroke.',
      actions: ['Limit outdoor work. Rest in shade and drink water.'],
    };
  }

  if (apparentTemperature >= 33) {
    return {
      level: 'caution',
      hazard: 'heat',
      status: 'Extreme caution heat index',
      detail: 'Outdoor activity can feel tiring, especially around midday.',
      actions: ['Do heavy work earlier or later in the day. Bring water.'],
    };
  }

  if (apparentTemperature >= 27) {
    return {
      level: 'watch',
      hazard: 'heat',
      status: 'Caution heat index',
      detail: humidityUnavailable
        ? 'It is warm, but humidity data is not available.'
        : 'It is warm enough to take simple heat precautions.',
      actions: ['Use shade and bring water for longer trips.'],
    };
  }

  return {
    level: 'low',
    hazard: 'heat',
    status: 'Heat risk appears low',
    detail: humidityUnavailable
      ? 'Heat risk looks low, but humidity data is not available.'
      : 'Heat risk looks low for most daily activities.',
    actions: ['Bring water if you will be outside for long.'],
  };
};

const assessRain = (
  precipitationProbability: NullableNumber,
  forecastPrecipitation: NullableNumber
): RiskAssessment => {
  const probability = precipitationProbability ?? 0;
  const forecastRain = forecastPrecipitation ?? 0;

  if (forecastRain > 180) {
    return {
      level: 'high',
      hazard: 'rain',
      status: 'Heavy 24-hour rainfall',
      detail: 'Very heavy rain is possible within the day.',
      actions: [
        'Avoid flooded roads and follow barangay or MDRRMO advisories.',
      ],
    };
  }

  if (forecastRain >= 60) {
    return {
      level: 'caution',
      hazard: 'rain',
      status: 'Moderate 24-hour rainfall',
      detail: 'Rain may be enough to affect roads and low-lying areas.',
      actions: ['Bring rain gear and keep important items dry.'],
    };
  }

  if (probability >= 60 || forecastRain >= 3) {
    return {
      level: 'watch',
      hazard: 'rain',
      status: 'Possible rain',
      detail:
        'Rain is below PAGASA moderate rainfall level, but showers are possible.',
      actions: ['Bring an umbrella or raincoat for longer trips.'],
    };
  }

  return {
    level: 'low',
    hazard: 'rain',
    status: 'Below 24-hour rainfall threshold',
    detail: 'Rain is below PAGASA moderate rainfall level.',
    actions: ['Continue normal plans, but watch the sky for local showers.'],
  };
};

const assessWind = (
  windSpeed: NullableNumber,
  windGusts: NullableNumber
): RiskAssessment => {
  const speed = windSpeed ?? 0;
  const gusts = windGusts ?? 0;

  if (gusts >= 51 || speed >= 51) {
    return {
      level: 'high',
      hazard: 'wind',
      status: 'Gale-force wind',
      detail:
        'Wind may be strong enough to affect walking, boating, and light materials.',
      actions: [
        'Secure loose items and avoid risky coastal or roadside areas.',
      ],
    };
  }

  if (gusts >= 40 || speed >= 40) {
    return {
      level: 'caution',
      hazard: 'wind',
      status: 'Strong wind',
      detail: 'Wind may make umbrellas hard to use and move tree branches.',
      actions: ['Secure tarps, signs, light materials, and loose roofing.'],
    };
  }

  if (gusts >= 30 || speed >= 30) {
    return {
      level: 'watch',
      hazard: 'wind',
      status: 'Fresh wind',
      detail: 'Wind may be noticeable in open and coastal areas.',
      actions: ['Use extra care in open and coastal areas.'],
    };
  }

  return {
    level: 'low',
    hazard: 'wind',
    status: 'Light to moderate wind',
    detail: 'Wind risk looks low for most daily activities.',
    actions: ['Normal outdoor plans should be manageable for wind.'],
  };
};

export const assessSea = (
  waveHeight: NullableNumber,
  wavePeriod: NullableNumber,
  windGusts: NullableNumber
): RiskAssessment => {
  const waves = waveHeight ?? 0;
  const period = wavePeriod ?? 0;
  const gusts = windGusts ?? 0;
  const steepShortWaves = waves >= 1.2 && period > 0 && period <= 6;

  if (waves >= 2.5 || gusts >= 45 || (waves >= 1.8 && steepShortWaves)) {
    return {
      level: 'high',
      hazard: 'sea',
      status: 'Avoid small boats',
      detail: 'Sea conditions may be unsafe for small boats.',
      actions: [
        'Delay small-boat trips, fishing, or coastal travel until conditions are calmer.',
        'Check Coast Guard, MDRRMO, barangay, port, and local shore advisories before leaving.',
        'Do not rely on the forecast alone if waves at the shore already look rough.',
      ],
    };
  }

  if (waves >= 1.5 || gusts >= 30 || steepShortWaves) {
    return {
      level: 'caution',
      hazard: 'sea',
      status: 'Take extra care at sea',
      detail: 'Small boats may face choppy water or harder docking.',
      actions: [
        'Compare the forecast with actual shore, tide, and wind conditions before loading a boat.',
        'Avoid overloading and delay the trip if waves or gusts are increasing.',
        'Check Coast Guard, MDRRMO, barangay, or port advisories.',
      ],
    };
  }

  if (waves >= 1 || gusts >= 25) {
    return {
      level: 'watch',
      hazard: 'sea',
      status: 'Monitor sea conditions',
      detail: 'Sea conditions may still change near the shore.',
      actions: [
        'Check the shore, tide, and wind before leaving.',
        'Be ready to delay if waves become rougher than expected.',
      ],
    };
  }

  return {
    level: 'low',
    hazard: 'sea',
    status: 'Sea conditions look manageable',
    detail:
      'Marine weather risk looks low, but conditions can change near the shore.',
    actions: [
      'Check the shore before leaving and continue to follow official marine advisories.',
    ],
  };
};

const assessFarm = (
  rain: RiskAssessment,
  heat: RiskAssessment,
  rainChance: NullableNumber,
  precipitation: NullableNumber,
  evapotranspiration: NullableNumber,
  uvIndex: NullableNumber
): RiskAssessment => {
  const probability = rainChance ?? 0;
  const rainTotal = precipitation ?? 0;
  const waterDemand = evapotranspiration ?? 0;
  const uv = uvIndex ?? 0;

  if (rain.level === 'high' || rainTotal >= 20) {
    return {
      level: 'high',
      hazard: 'farm',
      status: 'Delay drying and spraying',
      detail: 'Rain may interrupt drying, spraying, hauling, or harvest work.',
      actions: [
        'Delay spraying, fertilizer application, and open-air drying until rain risk drops.',
        'Move harvested crops, fish, feeds, tools, and supplies under cover early.',
        'Check drainage around fields, canals, storage areas, and animal shelters.',
      ],
    };
  }

  if (rain.level === 'caution' || probability >= 75 || rainTotal >= 8) {
    return {
      level: 'caution',
      hazard: 'farm',
      status: 'Protect drying crops',
      detail: 'Showers may interrupt drying, spraying, or hauling.',
      actions: [
        'Use cover, tarps, or shaded areas for drying harvest, fish, feeds, and supplies.',
        'Avoid spraying if rain is nearby or expected during the work period.',
        'Keep harvest and hauling plans flexible in case showers arrive earlier than expected.',
      ],
    };
  }

  if (heat.level === 'high') {
    return {
      level: 'high',
      hazard: 'farm',
      status: 'Limit field work during dangerous heat',
      detail: 'The heat may be unsafe for long field work.',
      actions: [
        'Move heavy field work to early morning or late afternoon.',
        'Set water and shade breaks for workers.',
        'Check soil moisture, seedlings, livestock water, and shaded areas before midday.',
      ],
    };
  }

  if (waterDemand >= 5 || heat.level === 'caution' || uv >= 8) {
    return {
      level: 'caution',
      hazard: 'farm',
      status: 'Irrigation and heat caution',
      detail: 'Crops, animals, and workers may need more water or shade.',
      actions: [
        'Check soil moisture before watering so irrigation is targeted.',
        'Schedule longer field work for cooler parts of the day when possible.',
        'Bring drinking water and plan shade breaks for field workers.',
      ],
    };
  }

  if (waterDemand >= 3.5 || heat.level === 'watch' || uv >= 6) {
    return {
      level: 'watch',
      hazard: 'farm',
      status: 'Good with water checks',
      detail: 'Regular work looks okay, but check water needs.',
      actions: [
        'Check water needs before midday heat.',
        'Use shade and drinking water for longer field work.',
      ],
    };
  }

  return {
    level: 'low',
    hazard: 'farm',
    status: 'Good day for regular farm work',
    detail: 'Weather risk looks low for regular farm work.',
    actions: [
      'Continue routine field checks and watch for local changes in rain or wind.',
    ],
  };
};

export const buildAdvisories = (
  snapshot: ClimateSnapshot | null,
  hasError: boolean
): Advisory[] => {
  if (hasError || !snapshot) {
    return [
      {
        audience: 'Commuters and Errands',
        icon: 'ri-community-line',
        status: 'No live update right now',
        tone: 'border-slate-200 bg-white',
        details: [
          {
            icon: 'ri-question-line',
            label: 'Status',
            bullets: ['The live weather feed did not load.'],
          },
          {
            icon: 'ri-question-line',
            label: 'What to do',
            bullets: [
              'Check LGU, barangay, school, or transport announcements.',
              'Look at nearby road, river, and sky conditions.',
            ],
          },
        ],
      },
      {
        audience: 'Fisherfolk and Coastal Travel',
        icon: 'ri-ship-2-line',
        status: 'Check before sailing',
        tone: 'border-slate-200 bg-white',
        details: [
          {
            icon: 'ri-question-line',
            label: 'Status',
            bullets: ['The marine feed did not load.'],
          },
          {
            icon: 'ri-question-line',
            label: 'What to do',
            bullets: [
              'Check the shore, tide, and wind before loading a boat.',
              'Follow Coast Guard, MDRRMO, barangay, or port advisories.',
            ],
          },
        ],
      },
      {
        audience: 'Farmers and Field Work',
        icon: 'ri-plant-line',
        status: 'Check before field work',
        tone: 'border-slate-200 bg-white',
        details: [
          {
            icon: 'ri-question-line',
            label: 'Status',
            bullets: ['The live weather feed did not load.'],
          },
          {
            icon: 'ri-question-line',
            label: 'What to do',
            bullets: [
              'Check local sky, soil, and rain conditions before planning work.',
              'Follow barangay or municipal agriculture office advisories.',
            ],
          },
        ],
      },
    ];
  }

  const { weather, outlook, marine } = snapshot;
  const today = outlook[0];

  const heat = assessHeat(weather.apparentTemperature, weather.humidity);
  const rain = assessRain(
    today?.precipitationProbability ?? null,
    today?.precipitation ?? null
  );
  const wind = assessWind(weather.windSpeed, weather.windGusts);
  const sea = assessSea(
    marine.waveHeightMax ?? marine.waveHeight,
    marine.wavePeriodMax ?? marine.wavePeriod,
    weather.windGusts
  );
  const farm = assessFarm(
    rain,
    heat,
    today?.precipitationProbability ?? null,
    today?.precipitation ?? null,
    today?.evapotranspiration ?? null,
    today?.uvIndex ?? null
  );

  const commuterLevel = getHighestRisk(heat.level, rain.level, wind.level);
  const fisherfolkLevel = getHighestRisk(sea.level, wind.level, rain.level);
  const farmLevel = getHighestRisk(farm.level, heat.level, rain.level);

  return [
    {
      audience: 'Commuters and Errands',
      icon: 'ri-community-line',
      status:
        commuterLevel === 'low'
          ? 'Good day for errands and commuting'
          : 'Plan around today’s weather',
      tone: getRiskTone(commuterLevel),
      details: [
        {
          icon: 'ri-sun-line',
          label: 'Heat',
          bullets: [heat.detail, ...heat.actions],
        },
        {
          icon: 'ri-rainy-line',
          label: 'Rain',
          bullets: [rain.detail, ...rain.actions],
        },
        {
          icon: 'ri-windy-line',
          label: 'Wind',
          bullets: [wind.detail, ...wind.actions],
        },
      ],
    },
    {
      audience: 'Fisherfolk and Coastal Travel',
      icon: 'ri-ship-2-line',
      status:
        fisherfolkLevel === 'low'
          ? 'Sea conditions look manageable'
          : 'Check sea conditions before heading out',
      tone: getRiskTone(fisherfolkLevel),
      details: [
        {
          icon: 'ri-ship-2-line',
          label: 'Sea',
          bullets: [sea.detail, ...sea.actions],
        },
        {
          icon: 'ri-windy-line',
          label: 'Wind',
          bullets: [wind.detail, ...wind.actions],
        },
        {
          icon: 'ri-rainy-line',
          label: 'Rain',
          bullets: [rain.detail, ...rain.actions],
        },
      ],
    },
    {
      audience: 'Farmers and Field Work',
      icon: 'ri-plant-line',
      status:
        farmLevel === 'low'
          ? 'Good day for regular farm work'
          : 'Plan farm work around today’s weather',
      tone: getRiskTone(farmLevel),
      details: [
        {
          icon: 'ri-plant-line',
          label: 'Field work',
          bullets: [farm.detail, ...farm.actions],
        },
        {
          icon: 'ri-sun-line',
          label: 'Heat',
          bullets: [heat.detail, ...heat.actions],
        },
        {
          icon: 'ri-rainy-line',
          label: 'Rain',
          bullets: [rain.detail, ...rain.actions],
        },
      ],
    },
  ];
};

type CachedSnapshot = {
  snapshot: ClimateSnapshot;
  cachedAt: string;
};

const readCache = (): CachedSnapshot | null => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CachedSnapshot;
    if (!parsed?.snapshot || !parsed?.cachedAt) return null;

    const age = Date.now() - new Date(parsed.cachedAt).getTime();
    if (!Number.isFinite(age) || age > CACHE_MAX_AGE_MS) return null;

    return parsed;
  } catch {
    return null;
  }
};

const writeCache = (snapshot: ClimateSnapshot) => {
  try {
    const entry: CachedSnapshot = {
      snapshot,
      cachedAt: new Date().toISOString(),
    };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // sessionStorage may be unavailable (private browsing, quota); the
    // widget still works without a stale-data fallback.
  }
};

export type UseClimateDataResult = {
  snapshot: ClimateSnapshot | null;
  isLoading: boolean;
  hasError: boolean;
  /** True when the live fetch failed and we're showing a cached snapshot
   * from earlier in the session instead of the generic error state. */
  isStale: boolean;
  staleSince: string | null;
};

/**
 * Fetches current conditions, a daily outlook, and marine conditions from
 * Open-Meteo for Aparri. On failure, falls back to the last successful
 * snapshot cached in sessionStorage (if fetched within the last few hours)
 * instead of dropping straight to the generic "no data" advisories.
 */
export function useClimateData(
  days: number = FORECAST_DAYS
): UseClimateDataResult {
  const [snapshot, setSnapshot] = useState<ClimateSnapshot | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isStale, setIsStale] = useState(false);
  const [staleSince, setStaleSince] = useState<string | null>(null);
  const daysRef = useRef(days);
  daysRef.current = days;

  useEffect(() => {
    const abortController = new AbortController();

    const fetchClimateData = async () => {
      try {
        const [weatherResponse, marineResponse] = await Promise.all([
          fetch(getWeatherApiUrl(daysRef.current), {
            signal: abortController.signal,
          }),
          fetch(getMarineApiUrl(daysRef.current), {
            signal: abortController.signal,
          }),
        ]);

        if (!weatherResponse.ok || !marineResponse.ok) {
          throw new Error('Unable to load climate data');
        }

        const weatherData =
          (await weatherResponse.json()) as OpenMeteoForecastResponse;
        const marineData =
          (await marineResponse.json()) as OpenMeteoMarineResponse;
        const current = weatherData.current;

        if (!current || typeof current.temperature_2m !== 'number') {
          throw new Error('Weather response is missing current conditions');
        }

        const nextSnapshot: ClimateSnapshot = {
          weather: {
            time: current.time ?? '',
            temperature: current.temperature_2m,
            humidity: readNumber(current.relative_humidity_2m),
            apparentTemperature: readNumber(current.apparent_temperature),
            precipitation: readNumber(current.precipitation),
            weatherCode: readNumber(current.weather_code),
            cloudCover: readNumber(current.cloud_cover),
            pressure: readNumber(current.pressure_msl),
            windDirection: readNumber(current.wind_direction_10m),
            windGusts: readNumber(current.wind_gusts_10m),
            windSpeed: readNumber(current.wind_speed_10m),
          },
          outlook: buildDailyOutlook(weatherData.daily, daysRef.current),
          marine: {
            time: marineData.current?.time ?? '',
            waveHeight: readNumber(marineData.current?.wave_height),
            wavePeriod: readNumber(marineData.current?.wave_period),
            seaSurfaceTemperature: readNumber(
              marineData.current?.sea_surface_temperature
            ),
            waveHeightMax: firstValue(marineData.daily?.wave_height_max),
            wavePeriodMax: firstValue(marineData.daily?.wave_period_max),
          },
        };

        setSnapshot(nextSnapshot);
        setHasError(false);
        setIsStale(false);
        setStaleSince(null);
        writeCache(nextSnapshot);
      } catch (error) {
        if ((error as DOMException).name === 'AbortError') return;

        const cached = readCache();
        if (cached) {
          setSnapshot(cached.snapshot);
          setHasError(false);
          setIsStale(true);
          setStaleSince(cached.cachedAt);
        } else {
          setHasError(true);
          setIsStale(false);
          setStaleSince(null);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchClimateData();

    return () => {
      abortController.abort();
    };
  }, []);

  return { snapshot, isLoading, hasError, isStale, staleSince };
}
