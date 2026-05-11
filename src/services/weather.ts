const GEO_API = 'https://geocoding-api.open-meteo.com/v1/search';
const WX_API  = 'https://api.open-meteo.com/v1/forecast';

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

export interface WeatherData {
  city: string;
  country: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  conditionCode: number;
  conditionLabel: string;
  conditionIcon: string;
  description: string;
}

function wmoCondition(code: number): [string, string, string] {
  const map: Record<number, [string, string, string]> = {
    0:  ['weather-sunny',           'Clear',          'Crystal clear skies'],
    1:  ['weather-sunny',           'Mostly Clear',   'Mostly clear'],
    2:  ['weather-partly-cloudy',   'Partly Cloudy',  'Some cloud cover'],
    3:  ['weather-cloudy',          'Overcast',       'Fully overcast'],
    45: ['weather-fog',             'Foggy',          'Dense fog'],
    48: ['weather-fog',             'Icy Fog',        'Depositing rime fog'],
    51: ['weather-partly-rainy',    'Light Drizzle',  'Light drizzle'],
    53: ['weather-rainy',           'Drizzle',        'Moderate drizzle'],
    55: ['weather-pouring',         'Heavy Drizzle',  'Dense drizzle'],
    61: ['weather-partly-rainy',    'Light Rain',     'Slight rain'],
    63: ['weather-rainy',           'Rain',           'Moderate rain'],
    65: ['weather-pouring',         'Heavy Rain',     'Heavy rain'],
    71: ['weather-snowy',           'Light Snow',     'Light snowfall'],
    73: ['weather-snowy',           'Snow',           'Moderate snow'],
    75: ['weather-snowy-heavy',     'Heavy Snow',     'Heavy snowfall'],
    80: ['weather-partly-rainy',    'Showers',        'Rain showers'],
    81: ['weather-pouring',         'Heavy Showers',  'Moderate showers'],
    82: ['weather-lightning-rainy', 'Storm Showers',  'Violent showers'],
    95: ['weather-lightning-rainy', 'Thunderstorm',   'Thunderstorm'],
    99: ['weather-hail',            'Severe Storm',   'Hail & thunder'],
  };
  return map[code] ?? ['weather-thermometer', 'Unknown', 'Unknown conditions'];
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

  const wxResp = await fetch(
    `${WX_API}?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code` +
    `&wind_speed_unit=kmh&timezone=auto`
  );
  if (!wxResp.ok) throw new Error('Failed to fetch weather data.');
  const wxData = await wxResp.json();
  const cur = wxData.current;

  const [conditionIcon, conditionLabel, description] = wmoCondition(cur.weather_code);

  return {
    city: name,
    country,
    temp:          Math.round(cur.temperature_2m),
    feelsLike:     Math.round(cur.apparent_temperature),
    humidity:      Math.round(cur.relative_humidity_2m),
    windSpeed:     Math.round(cur.wind_speed_10m),
    conditionCode: cur.weather_code,
    conditionLabel,
    conditionIcon,
    description,
  };
}
