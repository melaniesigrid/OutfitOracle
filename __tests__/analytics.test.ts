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
  trackAppOpened,
  trackConsultStarted,
  trackConsultCompleted,
  trackConsultError,
  trackShareTapped,
  trackRecentCityTapped,
  trackAutocompleteCitySelected,
  trackOnboardingCompleted,
} from '../src/services/analytics';

describe('analytics — named event functions', () => {
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
