/**
 * oracleProxy.test.ts
 *
 * Tests the runtime behaviour introduced in this diff for oracle.ts:
 *
 *   1. viaProxy() now reads DEVICE_ID_KEY from AsyncStorage and attaches it as
 *      X-Device-ID header when present.
 *   2. viaProxy() omits X-Device-ID when AsyncStorage returns null.
 *   3. fetchOracleVerdict() routes to viaProxy() when EXPO_PUBLIC_PROXY_URL is set.
 *   4. fetchOracleVerdict() routes to viaDirect() when EXPO_PUBLIC_PROXY_URL is unset.
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

    await oracle.fetchOracleVerdict(fakeWeather, 'female', '');

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

    await oracle.fetchOracleVerdict(fakeWeather, 'female', '');

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

    await oracle.fetchOracleVerdict(fakeWeather, 'male', '');

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

    await oracle.fetchOracleVerdict(fakeWeather, 'female', '');

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
    await oracle.fetchOracleVerdict(fakeWeather, 'female', '', fakeProfile, 'Work');

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

    await expect(oracle.fetchOracleVerdict(fakeWeather, 'male', '')).rejects.toThrow('The Oracle has spoken enough today');
  });

  it('throws with fallback message when proxy returns non-ok with no error field', async () => {
    const { oracle, asyncStorage } = loadOracleModule('https://fake-proxy.example.com/api');
    asyncStorage.getItem.mockResolvedValueOnce(null);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: () => Promise.resolve({}),
    });

    await expect(oracle.fetchOracleVerdict(fakeWeather, 'male', '')).rejects.toThrow('The Oracle is momentarily unavailable');
  });
});

// ---------------------------------------------------------------------------
// fetchOracleVerdict — routing logic
// ---------------------------------------------------------------------------

describe('fetchOracleVerdict() — routing (PROXY_URL set vs unset)', () => {
  it('calls proxy URL (not Claude API) when EXPO_PUBLIC_PROXY_URL is set', async () => {
    const proxyUrl = 'https://my-worker.workers.dev';
    const { oracle, asyncStorage } = loadOracleModule(proxyUrl);
    asyncStorage.getItem.mockResolvedValueOnce(null);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(fakeVerdict),
    });

    await oracle.fetchOracleVerdict(fakeWeather, 'female', 'sk-test-key');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe(proxyUrl);
  });

  it('calls Claude API directly when EXPO_PUBLIC_PROXY_URL is empty string', async () => {
    const { oracle } = loadOracleModule('');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        content: [{ type: 'text', text: JSON.stringify(fakeVerdict) }],
      }),
    });

    await oracle.fetchOracleVerdict(fakeWeather, 'female', 'sk-direct-key');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe('https://api.anthropic.com/v1/messages');
  });

  it('viaDirect parses JSON from Claude content blocks', async () => {
    const { oracle } = loadOracleModule('');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        content: [
          { type: 'text', text: JSON.stringify(fakeVerdict) },
        ],
      }),
    });

    const result = await oracle.fetchOracleVerdict(fakeWeather, 'female', 'sk-key');
    expect(result.vibe).toBe('Grey Eminence');
    expect(result.rating).toBe(2);
  });

  it('viaDirect throws if Claude returns malformed JSON text', async () => {
    const { oracle } = loadOracleModule('');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        content: [{ type: 'text', text: 'NOT JSON AT ALL' }],
      }),
    });

    await expect(oracle.fetchOracleVerdict(fakeWeather, 'female', 'sk-key')).rejects.toThrow(
      'The Oracle returned an unreadable response. Please try again.',
    );
  });

  it('viaDirect throws if Claude returns non-ok status', async () => {
    const { oracle } = loadOracleModule('');
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: { message: 'Invalid API key' } }),
    });

    await expect(oracle.fetchOracleVerdict(fakeWeather, 'female', 'bad-key')).rejects.toThrow(
      'Invalid API key',
    );
  });
});
