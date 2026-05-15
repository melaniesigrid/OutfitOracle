/**
 * analytics.test.ts
 *
 * Tests the named event functions exported from src/services/analytics.ts.
 * The `track` helper is fire-and-forget (swallows all errors), so these tests
 * verify function signatures and ensure they do not throw when called without
 * a PostHog API key configured (API_KEY is '' in the test environment).
 *
 * trackOnboardingCompleted() is the NEW function added in this diff.
 */

// All AsyncStorage calls are mocked via __mocks__/async-storage.js
import {
  ANALYTICS_ENABLED_KEY,
  getAnalyticsEnabledPreference,
  setAnalyticsEnabledPreference,
  trackAppOpened,
  trackConsultStarted,
  trackConsultCompleted,
  trackConsultError,
  trackShareTapped,
  trackRecentCityTapped,
  trackAutocompleteCitySelected,
  trackOnboardingCompleted,
} from '../src/services/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const flushPromises = () => new Promise(resolve => setImmediate(resolve));

describe('analytics — named event functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('trackOnboardingCompleted() does not throw (new function)', () => {
    expect(() => trackOnboardingCompleted()).not.toThrow();
  });

  it('trackOnboardingCompleted() returns void / undefined', () => {
    const result = trackOnboardingCompleted();
    expect(result).toBeUndefined();
  });

  it('trackAppOpened() accepts boolean parameter', () => {
    expect(() => trackAppOpened(true)).not.toThrow();
    expect(() => trackAppOpened(false)).not.toThrow();
  });

  it('trackConsultStarted() accepts city and gender strings', () => {
    expect(() => trackConsultStarted('London', 'female')).not.toThrow();
  });

  it('trackConsultCompleted() accepts all required parameters', () => {
    expect(() =>
      trackConsultCompleted('Paris', 'male', 'Rain', 12, 'Soaked Chic', 3, 4200),
    ).not.toThrow();
  });

  it('trackConsultError() accepts phase union values', () => {
    expect(() => trackConsultError('Tokyo', 'weather', 'Fetch failed')).not.toThrow();
    expect(() => trackConsultError('Tokyo', 'verdict', 'Parse failed')).not.toThrow();
  });

  it('trackShareTapped() accepts city and vibe', () => {
    expect(() => trackShareTapped('Milan', 'Continental Precision')).not.toThrow();
  });

  it('trackRecentCityTapped() accepts city', () => {
    expect(() => trackRecentCityTapped('Seoul')).not.toThrow();
  });

  it('trackAutocompleteCitySelected() accepts city', () => {
    expect(() => trackAutocompleteCitySelected('New York')).not.toThrow();
  });
});

describe('analytics preference', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    delete process.env.EXPO_PUBLIC_POSTHOG_KEY;
  });

  it('defaults analytics to enabled when no preference is stored', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

    await expect(getAnalyticsEnabledPreference()).resolves.toBe(true);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith(ANALYTICS_ENABLED_KEY);
  });

  it('reads false as an explicit opt-out', async () => {
    jest.resetModules();
    const storage = require('@react-native-async-storage/async-storage');
    storage.getItem.mockResolvedValueOnce('false');
    const analytics = require('../src/services/analytics');

    await expect(analytics.getAnalyticsEnabledPreference()).resolves.toBe(false);
    expect(storage.getItem).toHaveBeenCalledWith(analytics.ANALYTICS_ENABLED_KEY);
  });

  it('persists the analytics preference', async () => {
    await setAnalyticsEnabledPreference(false);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(ANALYTICS_ENABLED_KEY, 'false');
  });

  it('does not send PostHog events when the user has opted out', async () => {
    jest.resetModules();
    process.env.EXPO_PUBLIC_POSTHOG_KEY = 'test-key';
    const storage = require('@react-native-async-storage/async-storage');
    storage.getItem.mockResolvedValueOnce('false');
    const fetchMock = jest.fn(() => Promise.resolve({ ok: true }));
    global.fetch = fetchMock as jest.Mock;
    const analytics = require('../src/services/analytics');

    analytics.trackAppOpened(false);
    await flushPromises();
    await flushPromises();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(storage.getItem).toHaveBeenCalledWith(analytics.ANALYTICS_ENABLED_KEY);
  });
});
