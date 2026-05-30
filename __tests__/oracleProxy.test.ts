/**
 * oracleProxy.test.ts
 *
 * Tests oracle.ts proxy behaviour:
 *
 *   1. viaProxy() reads DEVICE_ID_KEY from AsyncStorage and attaches it as
 *      X-Device-ID header when present.
 *   2. viaProxy() omits X-Device-ID when AsyncStorage returns null.
 *   3. fetchOracleVerdict() always routes through the Cloudflare Worker proxy.
 *      The viaDirect path was removed — direct Anthropic calls 403 without the
 *      removed dangerous-direct-browser-access header.
 *
 * The Cloudflare Worker changes (hybrid rate-limit key, Founding Member counter)
 * run in a V8 isolate and cannot be unit-tested with ts-jest — see GAP notes.
 */

// ---------------------------------------------------------------------------
// global.fetch mock — set up before any module imports
// ---------------------------------------------------------------------------

const mockFetch = jest.fn();
global.fetch = mockFetch;

// ---------------------------------------------------------------------------
// Helper: build a minimal WeatherData object
// ---------------------------------------------------------------------------
const fakeWeather = {
  city: 'London',
  country: 'GB',
  temp: 15,
  feelsLike: 13,
  conditionLabel: 'Cloudy',
  description: 'Overcast skies',
  humidity: 72,
  windSpeed: 20,
  conditionIcon: 'weather-cloudy',
  uvIndex: 3,
};

const fakeVerdict = {
  verdict: 'Dress for the occasion.',
  vibe: 'Grey Eminence',
  outfits: [],
  avoid: [],
  rating: 2,
};

// ---------------------------------------------------------------------------
// Helpers to isolate module state (process.env must be set before import)
// Returns { oracle, asyncStorage } so callers can mock the fresh instance.
// ---------------------------------------------------------------------------

function loadOracleModule(proxyUrl: string) {
  jest.resetModules();
  process.env.EXPO_PUBLIC_PROXY_URL = proxyUrl;
  // Re-require after env reset so the module sees the new env var.
  // Also get a fresh reference to the AsyncStorage mock for this module instance.
  const oracle = require('../src/services/oracle');
  const asyncStorage = require('@react-native-async-storage/async-storage');
  return { oracle, asyncStorage };
}

afterEach(() => {
  jest.clearAllMocks();
  delete process.env.EXPO_PUBLIC_PROXY_URL;
});

// ---------------------------------------------------------------------------
// viaProxy — X-Device-ID header injection
// ---------------------------------------------------------------------------

describe('viaProxy() — X-Device-ID header (new in this diff)', () => {
  beforeEach(() => {
    process.env.EXPO_PUBLIC_PROXY_URL = 'https://fake-proxy.example.com/api';
  });

  it('sends X-Device-ID header when AsyncStorage returns a stored device ID', async () => {
    const { oracle, asyncStorage } = loadOracleModule('https://fake-proxy.example.com/api');
    asyncStorage.getItem.mockResolvedValueOnce('test-device-uuid-1234');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(fakeVerdict),
    });

    await oracle.fetchOracleVerdict(fakeWeather, 'female');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [_url, init] = mockFetch.mock.calls[0];
    expect(init.headers['X-Device-ID']).toBe('test-device-uuid-1234');
  });

  it('omits X-Device-ID header when AsyncStorage returns null', async () => {
    const { oracle, asyncStorage } = loadOracleModule('https://fake-proxy.example.com/api');
    asyncStorage.getItem.mockResolvedValueOnce(null);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(fakeVerdict),
    });

    await oracle.fetchOracleVerdict(fakeWeather, 'female');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [_url, init] = mockFetch.mock.calls[0];
    expect(init.headers).not.toHaveProperty('X-Device-ID');
  });

  it('still sends Content-Type regardless of device ID presence', async () => {
    const { oracle, asyncStorage } = loadOracleModule('https://fake-proxy.example.com/api');
    asyncStorage.getItem.mockResolvedValueOnce(null);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(fakeVerdict),
    });

    await oracle.fetchOracleVerdict(fakeWeather, 'male');

    const [_url, init] = mockFetch.mock.calls[0];
    expect(init.headers['Content-Type']).toBe('application/json');
  });

  it('omits X-Device-ID when AsyncStorage.getItem rejects (error swallowed)', async () => {
    const { oracle, asyncStorage } = loadOracleModule('https://fake-proxy.example.com/api');
    asyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(fakeVerdict),
    });

    await oracle.fetchOracleVerdict(fakeWeather, 'female');

    const [_url, init] = mockFetch.mock.calls[0];
    expect(init.headers).not.toHaveProperty('X-Device-ID');
  });

  it('sends request body with weather, gender, and optional profile', async () => {
    const { oracle, asyncStorage } = loadOracleModule('https://fake-proxy.example.com/api');
    asyncStorage.getItem.mockResolvedValueOnce('dev-id');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(fakeVerdict),
    });

    const fakeProfile = { keywords: ['minimal'], budget: 'high-street' as const, personality: 'editorial' as const };
    await oracle.fetchOracleVerdict(fakeWeather, 'female', fakeProfile, 'Work');

    const [_url, init] = mockFetch.mock.calls[0];
    const body = JSON.parse(init.body);
    expect(body.weather).toBeDefined();
    expect(body.gender).toBe('female');
    expect(body.styleProfile).toEqual(fakeProfile);
    expect(body.occasion).toBe('Work');
  });

  it('throws rate-limit editorial message when proxy returns 429', async () => {
    const { oracle, asyncStorage } = loadOracleModule('https://fake-proxy.example.com/api');
    asyncStorage.getItem.mockResolvedValueOnce(null);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      headers: { get: () => null },
      json: () => Promise.resolve({ error: 'Rate limited' }),
    });

    await expect(oracle.fetchOracleVerdict(fakeWeather, 'male')).rejects.toThrow('The Oracle has spoken enough today');
  });

  it('retries transient proxy failures before throwing overloaded message', async () => {
    const { oracle, asyncStorage } = loadOracleModule('https://fake-proxy.example.com/api');
    asyncStorage.getItem.mockResolvedValueOnce(null);
    mockFetch.mockResolvedValue({
      ok: false,
      status: 503,
      json: () => Promise.resolve({}),
    });

    await expect(oracle.fetchOracleVerdict(fakeWeather, 'male')).rejects.toThrow('The Oracle is momentarily overwhelmed');
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('throws with fallback message when proxy returns non-retryable server error', async () => {
    const { oracle, asyncStorage } = loadOracleModule('https://fake-proxy.example.com/api');
    asyncStorage.getItem.mockResolvedValueOnce(null);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    });

    await expect(oracle.fetchOracleVerdict(fakeWeather, 'male')).rejects.toThrow('The Oracle is momentarily unavailable');
  });
});

// ---------------------------------------------------------------------------
// fetchOracleVerdict — always routes through proxy
// ---------------------------------------------------------------------------

describe('fetchOracleVerdict() — proxy routing', () => {
  it('always calls the configured proxy URL', async () => {
    const proxyUrl = 'https://my-worker.workers.dev';
    const { oracle, asyncStorage } = loadOracleModule(proxyUrl);
    asyncStorage.getItem.mockResolvedValueOnce(null);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(fakeVerdict),
    });

    await oracle.fetchOracleVerdict(fakeWeather, 'female');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe(proxyUrl);
  });
});
