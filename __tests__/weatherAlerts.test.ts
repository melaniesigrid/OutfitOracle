import { fetchWeatherByCoords } from '../src/services/weather';

const WEATHER_PAYLOAD = {
  latitude: 43.7064,
  longitude: -79.3986,
  current: {
    temperature_2m: 30,
    apparent_temperature: 36,
    relative_humidity_2m: 62,
    wind_speed_10m: 12,
    wind_direction_10m: 210,
    weather_code: 0,
    uv_index: 7,
  },
  hourly: {
    time: [],
    temperature_2m: [],
    precipitation_probability: [],
    weather_code: [],
    uv_index: [],
  },
  daily: {
    time: [],
    temperature_2m_max: [],
    temperature_2m_min: [],
    sunrise: [],
    sunset: [],
    uv_index_max: [],
    precipitation_probability_max: [],
    weather_code: [],
  },
};

const POLLEN_PAYLOAD = {
  current: { european_aqi: 22 },
  hourly: {
    grass_pollen: [1],
    birch_pollen: [0],
    ragweed_pollen: [0],
  },
};

const CANADA_ALERT_PAYLOAD = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        alert_type: 'warning',
        alert_name_en: 'heat warning',
        alert_short_name_en: 'Heat',
        alert_text_en: 'The first heat event of the season will begin this afternoon.\n\nWhat:\nDaytime highs near 30 degrees Celsius.',
        risk_colour_en: 'yellow',
        impact_en: 'Moderate',
      },
    },
  ],
};

function jsonResponse(payload: unknown) {
  return {
    ok: true,
    json: async () => payload,
  };
}

describe('Canadian weather alerts', () => {
  beforeEach(() => {
    global.fetch = jest.fn(async input => {
      const url = String(input);
      if (url.includes('api.open-meteo.com/v1/forecast')) return jsonResponse(WEATHER_PAYLOAD) as Response;
      if (url.includes('air-quality-api.open-meteo.com')) return jsonResponse(POLLEN_PAYLOAD) as Response;
      if (url.includes('api.weather.gc.ca/collections/weather-alerts/items')) return jsonResponse(CANADA_ALERT_PAYLOAD) as Response;
      throw new Error(`Unexpected fetch URL: ${url}`);
    }) as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetches ECCC weather-alerts for Canada country codes and maps yellow heat alerts', async () => {
    const weather = await fetchWeatherByCoords(43.7064, -79.3986, 'Toronto', 'CA');

    expect(weather.alerts).toEqual([
      {
        event: 'Heat Warning',
        severity: 'Moderate',
        headline: 'The first heat event of the season will begin this afternoon.',
      },
    ]);

    const urls = (global.fetch as jest.Mock).mock.calls.map(([input]) => String(input));
    expect(urls.some(url => url.includes('/collections/weather-alerts/items'))).toBe(true);
    expect(urls.some(url => url.includes('/collections/alerts/items'))).toBe(false);
  });
});
