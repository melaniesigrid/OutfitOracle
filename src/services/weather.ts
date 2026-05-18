const GEO_API  = 'https://geocoding-api.open-meteo.com/v1/search';
const WX_API   = 'https://api.open-meteo.com/v1/forecast';
const AQ_API   = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const NWS_API  = 'https://api.weather.gov/alerts/active';
const ECCC_API = 'https://api.weather.gc.ca/collections/weather-alerts/items';

export interface WeatherAlert {
  event: string;
  severity: 'Extreme' | 'Severe' | 'Moderate' | 'Minor' | 'Unknown';
  headline: string;
}

const SEVERITIES = new Set<WeatherAlert['severity']>(['Extreme', 'Severe', 'Moderate', 'Minor', 'Unknown']);

function titleCase(value: string): string {
  return value.replace(/\w\S*/g, word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

function firstTextBlock(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  return value.split(/\n\s*\n|\r?\n/).map(line => line.trim()).find(Boolean);
}

function normalizeSeverity(value: unknown): WeatherAlert['severity'] {
  if (typeof value !== 'string') return 'Unknown';
  const normalized = titleCase(value.trim()) as WeatherAlert['severity'];
  return SEVERITIES.has(normalized) ? normalized : 'Unknown';
}

function canadaSeverity(props: Record<string, any>): WeatherAlert['severity'] {
  const riskColour = String(props.risk_colour_en ?? '').trim().toLowerCase();
  switch (riskColour) {
    case 'red':    return 'Extreme';
    case 'orange': return 'Severe';
    case 'yellow': return 'Moderate';
    case 'grey':
    case 'gray':   return 'Minor';
    default:       return normalizeSeverity(props.impact_en);
  }
}

function isCanada(country: string): boolean {
  const normalized = country.trim().toLowerCase();
  return normalized === 'ca' || normalized === 'can' || normalized.includes('canada');
}

export interface CitySuggestion {
  name: string;
  country: string;
  region: string;
  displayName: string;
}

export async function searchCities(query: string): Promise<CitySuggestion[]> {
  if (query.trim().length < 2) return [];
  try {
    const resp = await fetch(
      `${GEO_API}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
    );
    if (!resp.ok) return [];
    const data = await resp.json();
    if (!data.results?.length) return [];
    return (data.results as Record<string, string>[]).map(r => ({
      name:        r.name,
      country:     r.country   ?? '',
      region:      r.admin1    ?? '',
      displayName: [r.name, r.admin1, r.country].filter(Boolean).join(', '),
    }));
  } catch {
    return [];
  }
}

export interface HourlyForecast {
  time: string;       // "14:00"
  temp: number;
  precipProb: number; // 0-100
  conditionIcon: string;
  uvIndex: number;
}

export interface DailyForecast {
  date: string;       // YYYY-MM-DD
  dayLabel: string;   // "Mon" / "Today" / "Tmrw"
  tempMax: number;
  tempMin: number;
  conditionIcon: string;
  conditionLabel: string;
  precipProb: number;
  uvIndexMax: number;
  sunrise: string;    // "06:42"
  sunset: string;     // "20:15"
}

export interface PollenData {
  grass: number;    // grains/m³
  birch: number;
  ragweed: number;
  aqi: number;      // European AQI (0-500)
  aqiLabel: string;
}

export interface WeatherData {
  city: string;
  country: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection?: number;
  conditionCode: number;
  conditionLabel: string;
  conditionIcon: string;
  description: string;
  latitude?: number;
  longitude?: number;
  uvIndex?: number;
  hourly?: HourlyForecast[];
  daily?: DailyForecast[];
  sunrise?: string;
  sunset?: string;
  moonPhase?: number;
  moonPhaseName?: string;
  moonPhaseIcon?: string;
  pollen?: PollenData;
  alerts?: WeatherAlert[];
}

function wmoCondition(code: number): [string, string, string] {
  const map: Record<number, [string, string, string]> = {
    0:  ['weather-sunny',           'Clear',          'Crystal clear skies'],
    1:  ['weather-sunny',           'Mostly Clear',   'Mostly clear'],
    2:  ['weather-partly-cloudy',   'Partly Cloudy',  'Some cloud cover'],
    3:  ['weather-cloudy',          'Overcast',       'Fully overcast'],
    45: ['weather-fog',             'Foggy',          'Dense fog'],
    48: ['weather-fog',             'Icy Fog',        'Depositing rime fog'],
    51: ['weather-partly-rainy',    'Light Drizzle',    'Light drizzle'],
    53: ['weather-rainy',           'Drizzle',          'Moderate drizzle'],
    55: ['weather-pouring',         'Heavy Drizzle',    'Dense drizzle'],
    56: ['weather-snowy-rainy',     'Freezing Drizzle', 'Freezing light drizzle'],
    57: ['weather-snowy-rainy',     'Freezing Drizzle', 'Freezing dense drizzle'],
    61: ['weather-partly-rainy',    'Light Rain',       'Slight rain'],
    63: ['weather-rainy',           'Rain',             'Moderate rain'],
    65: ['weather-pouring',         'Heavy Rain',       'Heavy rain'],
    66: ['weather-snowy-rainy',     'Freezing Rain',    'Freezing light rain'],
    67: ['weather-snowy-rainy',     'Freezing Rain',    'Freezing heavy rain'],
    71: ['weather-snowy',           'Light Snow',       'Light snowfall'],
    73: ['weather-snowy',           'Snow',             'Moderate snow'],
    75: ['weather-snowy-heavy',     'Heavy Snow',       'Heavy snowfall'],
    77: ['weather-snowy',           'Snow Grains',      'Snow grains'],
    80: ['weather-partly-rainy',    'Showers',          'Rain showers'],
    81: ['weather-pouring',         'Heavy Showers',    'Moderate showers'],
    82: ['weather-lightning-rainy', 'Storm Showers',    'Violent showers'],
    85: ['weather-snowy',           'Snow Showers',     'Slight snow showers'],
    86: ['weather-snowy-heavy',     'Heavy Snow Showers','Heavy snow showers'],
    95: ['weather-lightning-rainy', 'Thunderstorm',     'Thunderstorm'],
    96: ['weather-hail',            'Storm with Hail',  'Thunderstorm with slight hail'],
    99: ['weather-hail',            'Severe Storm',     'Hail & thunder'],
  };
  return map[code] ?? ['thermometer-off', 'Unknown', 'Unknown conditions'];
}

function moonCalc(date: Date): { phase: number; name: string; icon: string } {
  const ref = new Date('2000-01-06T18:14:00Z').getTime();
  const cycleMs = 29.53059 * 24 * 3600 * 1000;
  let phase = ((date.getTime() - ref) % cycleMs) / cycleMs;
  if (phase < 0) phase += 1;

  let name: string;
  let icon: string;
  if      (phase < 0.0625) { name = 'New Moon';        icon = 'moon-new'; }
  else if (phase < 0.1875) { name = 'Waxing Crescent'; icon = 'moon-waxing-crescent'; }
  else if (phase < 0.3125) { name = 'First Quarter';   icon = 'moon-first-quarter'; }
  else if (phase < 0.4375) { name = 'Waxing Gibbous';  icon = 'moon-waxing-gibbous'; }
  else if (phase < 0.5625) { name = 'Full Moon';       icon = 'moon-full'; }
  else if (phase < 0.6875) { name = 'Waning Gibbous';  icon = 'moon-waning-gibbous'; }
  else if (phase < 0.8125) { name = 'Last Quarter';    icon = 'moon-last-quarter'; }
  else if (phase < 0.9375) { name = 'Waning Crescent'; icon = 'moon-waning-crescent'; }
  else                     { name = 'New Moon';        icon = 'moon-new'; }
  return { phase, name, icon };
}

function aqiLabel(aqi: number): string {
  if (aqi <= 20)  return 'Good';
  if (aqi <= 40)  return 'Fair';
  if (aqi <= 60)  return 'Moderate';
  if (aqi <= 80)  return 'Poor';
  if (aqi <= 100) return 'Very Poor';
  return 'Hazardous';
}

function isoToTime(iso: string): string {
  return iso.slice(11, 16); // "2026-05-12T14:00" → "14:00"
}

function toDayLabel(dateStr: string): string {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);
  if (dateStr === todayStr)     return 'Today';
  if (dateStr === tomorrowStr)  return 'Tmrw';
  return new Date(dateStr + 'T12:00:00').toLocaleDateString([], { weekday: 'short' });
}

async function fetchNWSAlerts(lat: number, lon: number): Promise<WeatherAlert[]> {
  try {
    const resp = await fetch(
      `${NWS_API}?point=${lat.toFixed(4)},${lon.toFixed(4)}`,
      { headers: { 'User-Agent': 'OutfitOracle/1.0 (melaniesigridab@gmail.com)' } },
    );
    if (!resp.ok) return [];
    const data = await resp.json();
    return (data.features ?? []).map((f: Record<string, any>) => ({
      event:    f.properties?.event    ?? 'Alert',
      severity: normalizeSeverity(f.properties?.severity),
      headline: f.properties?.headline ?? f.properties?.event ?? 'Weather Alert',
    }));
  } catch {
    return [];
  }
}

async function fetchCanadaAlerts(lat: number, lon: number): Promise<WeatherAlert[]> {
  try {
    const d = 0.05;
    const bbox = `${(lon - d).toFixed(4)},${(lat - d).toFixed(4)},${(lon + d).toFixed(4)},${(lat + d).toFixed(4)}`;
    const resp = await fetch(
      `${ECCC_API}?bbox=${bbox}&f=json&lang=en&limit=10`,
      { headers: { 'User-Agent': 'OutfitOracle/1.0 (melaniesigridab@gmail.com)' } },
    );
    if (!resp.ok) return [];
    const data = await resp.json();
    return (data.features ?? []).map((f: Record<string, any>) => {
      const props = f.properties ?? {};
      const event = String(props.alert_name_en ?? props.alert_short_name_en ?? props.alert_type ?? 'Alert');
      const eventTitle = titleCase(event);
      return {
        event:    eventTitle,
        severity: canadaSeverity(props),
        headline: firstTextBlock(props.alert_text_en) ?? eventTitle,
      };
    });
  } catch {
    return [];
  }
}

function fetchWeatherAlerts(lat: number, lon: number, country: string): Promise<WeatherAlert[]> {
  if (isCanada(country)) return fetchCanadaAlerts(lat, lon);
  return fetchNWSAlerts(lat, lon);
}

export function fetchActiveWeatherAlerts(lat: number, lon: number, country: string): Promise<WeatherAlert[]> {
  return fetchWeatherAlerts(lat, lon, country);
}

async function fetchPollen(lat: number, lon: number): Promise<PollenData | undefined> {
  try {
    const resp = await fetch(
      `${AQ_API}?latitude=${lat}&longitude=${lon}` +
      `&current=european_aqi&hourly=grass_pollen,birch_pollen,ragweed_pollen` +
      `&forecast_hours=1&timezone=auto`
    );
    if (!resp.ok) return undefined;
    const d = await resp.json();
    const aqi     = Math.round(d.current?.european_aqi ?? 0);
    const grass   = Math.round(d.hourly?.grass_pollen?.[0]   ?? 0);
    const birch   = Math.round(d.hourly?.birch_pollen?.[0]   ?? 0);
    const ragweed = Math.round(d.hourly?.ragweed_pollen?.[0] ?? 0);
    return { grass, birch, ragweed, aqi, aqiLabel: aqiLabel(aqi) };
  } catch {
    return undefined;
  }
}

const CURRENT_PARAMS =
  'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,uv_index';
const HOURLY_PARAMS =
  'temperature_2m,precipitation_probability,weather_code,uv_index';
const DAILY_PARAMS =
  'temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max,weather_code';

function buildWeatherResult(
  city: string,
  country: string,
  wxData: Record<string, any>,
  pollen?: PollenData,
  alerts?: WeatherAlert[],
): WeatherData {
  const cur = wxData.current ?? {};
  const hourlyRaw = wxData.hourly ?? {};
  const dailyRaw  = wxData.daily ?? {};

  const [conditionIcon, conditionLabel, description] = wmoCondition(cur.weather_code ?? 0);

  // Hourly: find entries starting from the current hour, take up to 24
  const nowPrefix = new Date().toISOString().slice(0, 13); // "2026-05-12T14"
  const hourly: HourlyForecast[] = [];
  const times: string[] = hourlyRaw.time ?? [];
  for (let i = 0; i < times.length && hourly.length < 24; i++) {
    if (times[i].slice(0, 13) < nowPrefix) continue;
    const [icon] = wmoCondition(hourlyRaw.weather_code?.[i] ?? 0);
    hourly.push({
      time:        isoToTime(times[i]),
      temp:        Math.round(hourlyRaw.temperature_2m?.[i] ?? 0),
      precipProb:  Math.round(hourlyRaw.precipitation_probability?.[i] ?? 0),
      conditionIcon: icon,
      uvIndex:     Math.round(hourlyRaw.uv_index?.[i] ?? 0),
    });
  }

  // Daily: 7 days
  const daily: DailyForecast[] = (dailyRaw.time ?? []).map((date: string, i: number) => {
    const [icon, label] = wmoCondition(dailyRaw.weather_code?.[i] ?? 0);
    return {
      date,
      dayLabel:      toDayLabel(date),
      tempMax:       Math.round(dailyRaw.temperature_2m_max?.[i] ?? 0),
      tempMin:       Math.round(dailyRaw.temperature_2m_min?.[i] ?? 0),
      conditionIcon: icon,
      conditionLabel: label,
      precipProb:    Math.round(dailyRaw.precipitation_probability_max?.[i] ?? 0),
      uvIndexMax:    Math.round(dailyRaw.uv_index_max?.[i] ?? 0),
      sunrise:       dailyRaw.sunrise?.[i] ? isoToTime(dailyRaw.sunrise[i]) : '--:--',
      sunset:        dailyRaw.sunset?.[i]  ? isoToTime(dailyRaw.sunset[i])  : '--:--',
    };
  });

  const today = daily[0];
  const moon  = moonCalc(new Date());

  return {
    city,
    country,
    temp:          Math.round(cur.temperature_2m ?? 0),
    feelsLike:     Math.round(cur.apparent_temperature ?? 0),
    humidity:      Math.round(cur.relative_humidity_2m ?? 0),
    windSpeed:     Math.round(cur.wind_speed_10m ?? 0),
    windDirection: cur.wind_direction_10m !== undefined ? Math.round(cur.wind_direction_10m) : undefined,
    conditionCode: cur.weather_code ?? 0,
    conditionLabel,
    conditionIcon,
    description,
    uvIndex:       Math.round(cur.uv_index ?? 0),
    hourly:        hourly.length ? hourly : undefined,
    daily:         daily.length  ? daily  : undefined,
    sunrise:       today?.sunrise,
    sunset:        today?.sunset,
    latitude:      wxData.latitude,
    longitude:     wxData.longitude,
    moonPhase:     moon.phase,
    moonPhaseName: moon.name,
    moonPhaseIcon: moon.icon,
    pollen,
    alerts:        alerts?.length ? alerts : undefined,
  };
}

export async function fetchWeatherByCoords(
  latitude: number,
  longitude: number,
  city: string,
  country: string,
): Promise<WeatherData> {
  const [wxResp, pollen, alerts] = await Promise.all([
    fetch(
      `${WX_API}?latitude=${latitude}&longitude=${longitude}` +
      `&current=${CURRENT_PARAMS}&hourly=${HOURLY_PARAMS}&daily=${DAILY_PARAMS}` +
      `&forecast_hours=48&forecast_days=7&wind_speed_unit=kmh&timezone=auto`
    ),
    fetchPollen(latitude, longitude),
    fetchWeatherAlerts(latitude, longitude, country),
  ]);
  if (!wxResp.ok) throw new Error('Failed to fetch weather data.');
  const wxData = await wxResp.json();
  return buildWeatherResult(city, country, wxData, pollen, alerts);
}

export async function fetchWeather(city: string): Promise<WeatherData> {
  const geoResp = await fetch(
    `${GEO_API}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
  );
  if (!geoResp.ok) throw new Error('Failed to reach weather service.');
  const geoData = await geoResp.json();

  if (!geoData.results?.length) {
    throw new Error(`City "${city}" not found. Check the spelling and try again.`);
  }

  const { latitude, longitude, name, country } = geoData.results[0];

  const [wxResp, pollen, alerts] = await Promise.all([
    fetch(
      `${WX_API}?latitude=${latitude}&longitude=${longitude}` +
      `&current=${CURRENT_PARAMS}&hourly=${HOURLY_PARAMS}&daily=${DAILY_PARAMS}` +
      `&forecast_hours=48&forecast_days=7&wind_speed_unit=kmh&timezone=auto`
    ),
    fetchPollen(latitude, longitude),
    fetchWeatherAlerts(latitude, longitude, country),
  ]);
  if (!wxResp.ok) throw new Error('Failed to fetch weather data.');
  const wxData = await wxResp.json();
  return buildWeatherResult(name, country, wxData, pollen, alerts);
}
