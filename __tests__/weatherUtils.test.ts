import { uvLabel, localHour } from '../src/services/weather';

describe('uvLabel', () => {
  it.each([
    [0,  'Low'],
    [2,  'Low'],
    [3,  'Moderate'],
    [5,  'Moderate'],
    [6,  'High'],
    [7,  'High'],
    [8,  'Very High'],
    [10, 'Very High'],
    [11, 'Extreme'],
    [20, 'Extreme'],
  ])('uv=%i → %s', (uv, expected) => {
    expect(uvLabel(uv)).toBe(expected);
  });
});

describe('localHour', () => {
  it('computes local hour from UTC offset', () => {
    const fixedEpochMs = new Date('2026-06-01T14:00:00Z').getTime();
    jest.spyOn(Date, 'now').mockReturnValue(fixedEpochMs);

    // UTC+0: 14:00 UTC → local hour 14
    expect(localHour(0)).toBe(14);
    // UTC+5 (18300s): 14:00 UTC + 5h = 19:00 → local hour 19
    expect(localHour(18000)).toBe(19);
    // UTC-5 (-18000s): 14:00 UTC - 5h = 09:00 → local hour 9
    expect(localHour(-18000)).toBe(9);
    // Midnight UTC+10: 14:00 UTC + 10h = 00:00 next day → 0
    expect(localHour(36000)).toBe(0);

    jest.restoreAllMocks();
  });
});

describe('NWS (US) weather alerts path', () => {
  const WEATHER_PAYLOAD = {
    latitude: 40.7128,
    longitude: -74.006,
    current: {
      temperature_2m: 22,
      apparent_temperature: 20,
      relative_humidity_2m: 55,
      wind_speed_10m: 10,
      wind_direction_10m: 180,
      weather_code: 2,
      uv_index: 5,
    },
    hourly: {
      time: [], temperature_2m: [], precipitation_probability: [],
      weather_code: [], uv_index: [],
    },
    daily: {
      time: [], temperature_2m_max: [], temperature_2m_min: [],
      sunrise: [], sunset: [], uv_index_max: [],
      precipitation_probability_max: [], weather_code: [],
    },
  };

  const POLLEN_PAYLOAD = {
    current: { european_aqi: 10 },
    hourly: { grass_pollen: [0], birch_pollen: [0], ragweed_pollen: [0] },
  };

  const NWS_ALERT_PAYLOAD = {
    features: [
      {
        properties: {
          event: 'Heat Advisory',
          severity: 'Moderate',
          headline: 'Heat Advisory issued until 8 PM EDT',
        },
      },
    ],
  };

  function jsonResponse(payload: unknown) {
    return { ok: true, json: async () => payload };
  }

  beforeEach(() => {
    const { fetchWeatherByCoords: _ } = jest.requireActual('../src/services/weather');
    global.fetch = jest.fn(async input => {
      const url = String(input);
      if (url.includes('api.open-meteo.com/v1/forecast')) return jsonResponse(WEATHER_PAYLOAD) as Response;
      if (url.includes('air-quality-api.open-meteo.com')) return jsonResponse(POLLEN_PAYLOAD) as Response;
      if (url.includes('api.weather.gov/alerts/active')) return jsonResponse(NWS_ALERT_PAYLOAD) as Response;
      return { ok: false, json: async () => ({}) } as Response;
    }) as jest.Mock;
  });

  afterEach(() => jest.restoreAllMocks());

  it('hits NWS alerts endpoint for US coordinates', async () => {
    const { fetchWeatherByCoords } = await import('../src/services/weather');
    const weather = await fetchWeatherByCoords(40.7128, -74.006, 'New York', 'US');

    const urls = (global.fetch as jest.Mock).mock.calls.map(([input]) => String(input));
    expect(urls.some(url => url.includes('api.weather.gov/alerts/active'))).toBe(true);

    expect(weather.alerts).toEqual([
      {
        event: 'Heat Advisory',
        severity: 'Moderate',
        headline: 'Heat Advisory issued until 8 PM EDT',
        source: 'National Weather Service',
      },
    ]);
  });

  it('returns empty alerts when NWS returns non-ok', async () => {
    global.fetch = jest.fn(async input => {
      const url = String(input);
      if (url.includes('api.open-meteo.com/v1/forecast')) return jsonResponse(WEATHER_PAYLOAD) as Response;
      if (url.includes('air-quality-api.open-meteo.com')) return jsonResponse(POLLEN_PAYLOAD) as Response;
      if (url.includes('api.weather.gov')) return { ok: false, json: async () => ({}) } as Response;
      return { ok: false, json: async () => ({}) } as Response;
    }) as jest.Mock;

    const { fetchWeatherByCoords } = await import('../src/services/weather');
    const weather = await fetchWeatherByCoords(40.7128, -74.006, 'New York', 'US');
    // alerts is undefined when empty (weather.ts:470 — only set when length > 0)
    expect(weather.alerts).toBeUndefined();
  });
});
