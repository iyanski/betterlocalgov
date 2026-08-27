import { useEffect, useState } from 'react';

type NullableNumber = number | null;

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
};

type OpenMeteoMarineResponse = {
  current?: OpenMeteoMarineCurrent;
  daily?: OpenMeteoMarineDaily;
};

type WeatherSnapshot = {
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

type DailyOutlook = {
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

type MarineSnapshot = {
  time: string;
  waveHeight: NullableNumber;
  wavePeriod: NullableNumber;
  waveHeightMax: NullableNumber;
  wavePeriodMax: NullableNumber;
};

type ClimateSnapshot = {
  weather: WeatherSnapshot;
  outlook: DailyOutlook[];
  marine: MarineSnapshot;
};

type WeatherCodeInfo = {
  label: string;
  icon: string;
};

type AdvisoryDetail = {
  icon?: string;
  label: string;
  bullets: string[];
};

type Advisory = {
  audience: string;
  icon: string;
  status: string;
  tone: string;
  details: AdvisoryDetail[];
};

type RiskLevel = 'low' | 'watch' | 'caution' | 'high';

type HazardType = 'heat' | 'rain' | 'wind' | 'sea' | 'farm' | 'none';

type RiskAssessment = {
  level: RiskLevel;
  hazard: HazardType;
  status: string;
  detail: string;
  actions: string[];
};

const LOCATION = {
  name: 'Aparri, Cagayan',
  latitude: 18.3566,
  longitude: 121.6406,
};

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

const getWeatherInfo = (weatherCode: NullableNumber): WeatherCodeInfo => {
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

const formatNumber = (value: NullableNumber | undefined, fallback = '--') => {
  if (typeof value !== 'number') return fallback;

  return Math.round(value).toString();
};

const formatDecimal = (
  value: NullableNumber | undefined,
  digits = 1,
  fallback = '--'
) => {
  if (typeof value !== 'number') return fallback;

  return value.toFixed(digits);
};

const formatUpdatedAt = (time: string | null | undefined) => {
  if (!time) return 'Live forecast from Open-Meteo';

  return new Intl.DateTimeFormat('en-PH', {
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  }).format(new Date(time));
};

const formatDayLabel = (date: string, index: number) => {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';

  return new Intl.DateTimeFormat('en-PH', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

const getUvLevel = (uvIndex: NullableNumber) => {
  if (typeof uvIndex !== 'number') return 'Check UV';
  if (uvIndex >= 11) return 'Extreme';
  if (uvIndex >= 8) return 'Very high';
  if (uvIndex >= 6) return 'High';
  if (uvIndex >= 3) return 'Moderate';

  return 'Low';
};

const getWindDirection = (degrees: NullableNumber) => {
  if (typeof degrees !== 'number') return '--';

  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % directions.length;

  return directions[index];
};

const getWeatherApiUrl = () => {
  const params = new URLSearchParams({
    latitude: LOCATION.latitude.toString(),
    longitude: LOCATION.longitude.toString(),
    current: CURRENT_WEATHER_VARIABLES.join(','),
    daily: DAILY_WEATHER_VARIABLES.join(','),
    timezone: 'Asia/Manila',
    forecast_days: '3',
  });

  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
};

const getMarineApiUrl = () => {
  const params = new URLSearchParams({
    latitude: LOCATION.latitude.toString(),
    longitude: LOCATION.longitude.toString(),
    current: CURRENT_MARINE_VARIABLES.join(','),
    daily: DAILY_MARINE_VARIABLES.join(','),
    timezone: 'Asia/Manila',
    forecast_days: '3',
    cell_selection: 'sea',
  });

  return `https://marine-api.open-meteo.com/v1/marine?${params.toString()}`;
};

const firstValue = (values: number[] | undefined): NullableNumber => {
  return readNumber(values?.[0]);
};

const buildDailyOutlook = (daily: OpenMeteoDaily | undefined) => {
  const times = daily?.time ?? [];

  return times.slice(0, 3).map((date, index) => ({
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

const getHighestRisk = (...levels: RiskLevel[]) => {
  return levels.reduce<RiskLevel>((highest, level) => {
    return riskRank[level] > riskRank[highest] ? level : highest;
  }, 'low');
};

const getRiskTone = (level: RiskLevel) => {
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

const assessSea = (
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
    status: 'Marine weather risk is low',
    detail: 'Marine weather risk looks low, but check the shore first.',
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

const buildAdvisories = (
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
              'Review Coast Guard, MDRRMO, or barangay advisories before leaving.',
              'Delay the trip if waves look rough.',
            ],
          },
        ],
      },
      {
        audience: 'Farmers and Field Work',
        icon: 'ri-seedling-line',
        status: 'Use local rain reports',
        tone: 'border-slate-200 bg-white',
        details: [
          {
            icon: 'ri-question-line',
            label: 'Status',
            bullets: ['The farm planning feed did not load.'],
          },
          {
            icon: 'ri-question-line',
            label: 'What to do',
            bullets: [
              'Use local rain reports and field observations before drying or spraying.',
            ],
          },
        ],
      },
    ];
  }

  const today = snapshot.outlook[0];
  const heatRisk = assessHeat(
    snapshot.weather.apparentTemperature,
    snapshot.weather.humidity
  );
  const rainRisk = assessRain(
    today?.precipitationProbability ?? null,
    today?.precipitation ?? null
  );
  const windRisk = assessWind(
    today?.windSpeed ?? snapshot.weather.windSpeed,
    today?.windGusts ?? snapshot.weather.windGusts
  );
  const seaRisk = assessSea(
    snapshot.marine.waveHeightMax ?? snapshot.marine.waveHeight,
    snapshot.marine.wavePeriodMax ?? snapshot.marine.wavePeriod,
    today?.windGusts ?? snapshot.weather.windGusts
  );
  const farmRisk = assessFarm(
    rainRisk,
    heatRisk,
    today?.precipitationProbability ?? null,
    today?.precipitation ?? null,
    today?.evapotranspiration ?? null,
    today?.uvIndex ?? null
  );
  const publicRisk = getHighestRisk(
    heatRisk.level,
    rainRisk.level,
    windRisk.level
  );
  const publicStatus =
    publicRisk === rainRisk.level && rainRisk.level !== 'low'
      ? rainRisk.status
      : publicRisk === heatRisk.level && heatRisk.level !== 'low'
        ? heatRisk.status
        : publicRisk === windRisk.level && windRisk.level !== 'low'
          ? windRisk.status
          : 'Generally manageable conditions';
  const publicGuidance =
    publicRisk === rainRisk.level && rainRisk.level !== 'low'
      ? rainRisk
      : publicRisk === heatRisk.level && heatRisk.level !== 'low'
        ? heatRisk
        : publicRisk === windRisk.level && windRisk.level !== 'low'
          ? windRisk
          : rainRisk;
  const seaHeight =
    snapshot.marine.waveHeightMax ?? snapshot.marine.waveHeight ?? null;
  const forecastGusts = today?.windGusts ?? snapshot.weather.windGusts;

  return [
    {
      audience: 'Commuters and Errands',
      icon: 'ri-community-line',
      status: publicStatus,
      tone: getRiskTone(publicRisk),
      details: [
        {
          icon: 'ri-question-line',
          label: 'Level',
          bullets: [`${publicGuidance.status}. ${publicGuidance.detail}`],
        },
        {
          icon: 'ri-information-line',
          label: 'What to do',
          bullets: [publicGuidance.actions[0] ?? 'Follow official advisories.'],
        },
        {
          icon: 'ri-database-line',
          label: 'Basis',
          bullets: [
            `${formatDecimal(today?.precipitation)} mm rain expected today.`,
          ],
        },
      ],
    },
    {
      audience: 'Fisherfolk and Coastal Travel',
      icon: 'ri-ship-2-line',
      status: seaRisk.status,
      tone: getRiskTone(seaRisk.level),
      details: [
        {
          icon: 'ri-question-line',
          label: 'Level',
          bullets: [`${windRisk.status}. ${seaRisk.detail}`],
        },
        {
          icon: 'ri-question-line',
          label: 'What to do',
          bullets: [
            seaRisk.actions[0] ?? 'Check shore conditions before sailing.',
          ],
        },
        {
          icon: 'ri-database-line',
          label: 'Basis',
          bullets: [
            `${formatDecimal(seaHeight)} m waves; gusts up to ${formatNumber(forecastGusts)} km/h.`,
          ],
        },
      ],
    },
    {
      audience: 'Farmers and Field Work',
      icon: 'ri-seedling-line',
      status: farmRisk.status,
      tone: getRiskTone(farmRisk.level),
      details: [
        {
          icon: 'ri-question-line',
          label: 'Level',
          bullets: [`${farmRisk.status}. ${farmRisk.detail}`],
        },
        {
          icon: 'ri-information-line',
          label: 'What to do',
          bullets: [
            farmRisk.actions[0] ?? 'Use local observations before field work.',
          ],
        },
        {
          icon: 'ri-database-line',
          label: 'Basis',
          bullets: [
            `Feels like ${formatDecimal(snapshot.weather.apparentTemperature)}°C; rain chance ${formatNumber(today?.precipitationProbability)}%.`,
          ],
        },
      ],
    },
  ];
};

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
  const [snapshot, setSnapshot] = useState<ClimateSnapshot | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchClimateData = async () => {
      try {
        const [weatherResponse, marineResponse] = await Promise.all([
          fetch(getWeatherApiUrl(), { signal: abortController.signal }),
          fetch(getMarineApiUrl(), { signal: abortController.signal }),
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

        setSnapshot({
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
          outlook: buildDailyOutlook(weatherData.daily),
          marine: {
            time: marineData.current?.time ?? '',
            waveHeight: readNumber(marineData.current?.wave_height),
            wavePeriod: readNumber(marineData.current?.wave_period),
            waveHeightMax: firstValue(marineData.daily?.wave_height_max),
            wavePeriodMax: firstValue(marineData.daily?.wave_period_max),
          },
        });
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

    fetchClimateData();

    return () => {
      abortController.abort();
    };
  }, []);

  const weather = snapshot?.weather;
  const today = snapshot?.outlook[0];
  const marine = snapshot?.marine;
  const condition = getWeatherInfo(weather?.weatherCode ?? null);
  const advisories = buildAdvisories(snapshot, hasError);

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
        </div>

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
            <h3 className="text-lg font-semibold text-slate-900">
              3-Day Weather Outlook
            </h3>
            <div className="mt-3 grid gap-4 md:grid-cols-3">
              {(snapshot?.outlook ?? []).map((day, index) => (
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
