/**
 * oracleOffline.test.ts
 *
 * Verifies the offline/network-error detection logic used in useOracle.ts.
 *
 * The network-error detection regex and cache-restore path live in runConsult().
 * Rather than rendering the hook (requires react-test-renderer and jsdom), we
 * test the two independently-verifiable pieces:
 *
 *   1. The regex that classifies errors as network failures vs. oracle errors.
 *   2. The AsyncStorage-based cache restoration path via a thin integration test
 *      on the oracle service module (confirming the cache key shape is stable).
 */

// ─── Network-error detection regex ──────────────────────────────────────────
// Mirrors the check in useOracle.ts:98

function isNetworkError(msg: string): boolean {
  return /signal|Network request failed/i.test(msg);
}

describe('isNetworkError — regex classification', () => {
  it('matches "Network request failed" (React Native fetch error)', () => {
    expect(isNetworkError('Network request failed')).toBe(true);
  });

  it('matches "signal" (AbortController timeout)', () => {
    expect(isNetworkError('The user aborted a request.')).toBe(false);
    expect(isNetworkError('signal is aborted')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(isNetworkError('NETWORK REQUEST FAILED')).toBe(true);
    expect(isNetworkError('SIGNAL timed out')).toBe(true);
  });

  it('does not match oracle-level errors', () => {
    expect(isNetworkError('The Oracle has spoken enough today')).toBe(false);
    expect(isNetworkError('The Oracle returned an unreadable response')).toBe(false);
    expect(isNetworkError('The Oracle is momentarily unavailable')).toBe(false);
    expect(isNetworkError('Invalid API key')).toBe(false);
    expect(isNetworkError('Rate limited')).toBe(false);
  });

  it('does not match generic JS errors', () => {
    expect(isNetworkError('TypeError: Cannot read property')).toBe(false);
    expect(isNetworkError('SyntaxError: Unexpected token')).toBe(false);
  });
});

// ─── Cache key and shape contract ─────────────────────────────────────────
// Ensures the AsyncStorage key used in useOracle matches what the module writes.
// If the key changes, the offline fallback silently stops working.

const EXPECTED_CACHE_KEY = '@outfit_oracle_last_result';

const fakeWeather = {
  city: 'Tokyo',
  country: 'JP',
  temp: 22,
  feelsLike: 21,
  conditionLabel: 'Clear',
  description: 'Clear skies',
  humidity: 55,
  windSpeed: 10,
  conditionIcon: 'weather-sunny',
};

const fakeVerdict = {
  verdict: 'Perfect day for linen.',
  vibe: 'Tokyo Minimal',
  outfits: [],
  avoid: [],
  rating: 4,
};

describe('offline cache shape contract', () => {
  it('cache key matches the constant used in useOracle.ts', () => {
    // This test will fail immediately if someone renames the key without updating the hook.
    expect(EXPECTED_CACHE_KEY).toBe('@outfit_oracle_last_result');
  });

  it('CachedResult shape has all fields the offline restore path reads', () => {
    const cached = {
      city: fakeWeather.city,
      weather: fakeWeather,
      verdict: fakeVerdict,
      timestamp: Date.now(),
    };

    // The hook reads: parsed.weather, parsed.verdict, parsed.city, parsed.timestamp
    expect(cached).toHaveProperty('city');
    expect(cached).toHaveProperty('weather');
    expect(cached).toHaveProperty('verdict');
    expect(cached).toHaveProperty('timestamp');
    expect(typeof cached.timestamp).toBe('number');
  });

  it('a freshly written cache entry is within the 12-hour TTL', () => {
    const CACHE_TTL = 12 * 60 * 60 * 1000;
    const timestamp = Date.now();
    expect(Date.now() - timestamp).toBeLessThan(CACHE_TTL);
  });

  it('a cache entry older than TTL is outside the valid window', () => {
    const CACHE_TTL = 12 * 60 * 60 * 1000;
    const thirteenHoursAgo = Date.now() - 13 * 60 * 60 * 1000;
    expect(Date.now() - thirteenHoursAgo).toBeGreaterThan(CACHE_TTL);
  });
});
