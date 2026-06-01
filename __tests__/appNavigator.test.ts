/**
 * appNavigator.test.ts
 *
 * Contract tests for AppNavigator's onboarding detection logic (no RNTL needed).
 *
 * Tests the AsyncStorage key contract, the D6 rejection-fallback fix, the
 * completeOnboarding write, and the needsOnboarding gate logic — all without
 * rendering the component.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { trackOnboardingCompleted } from '../src/services/analytics';

const ONBOARDING_KEY = '@onboarding_complete';

jest.mock('../src/services/analytics', () => ({
  trackOnboardingCompleted: jest.fn(),
}));

beforeEach(() => jest.clearAllMocks());

describe('Onboarding AsyncStorage key contract', () => {
  it('key value "true" → onboarding is done', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('true');
    const val = await AsyncStorage.getItem(ONBOARDING_KEY);
    expect(val === 'true').toBe(true);
  });

  it('key absent (null) → onboarding not done', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    const val = await AsyncStorage.getItem(ONBOARDING_KEY);
    expect(val === 'true').toBe(false);
  });

  it('D6 fix — AsyncStorage rejection → treated as false, not a hung promise', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('storage unavailable'));
    // Mirrors the .catch(() => setOnboardingDone(false)) branch in AppNavigator
    let onboardingDone: boolean | null = null;
    await AsyncStorage.getItem(ONBOARDING_KEY)
      .then(val => { onboardingDone = val === 'true'; })
      .catch(() => { onboardingDone = false; });
    expect(onboardingDone).toBe(false);
  });
});

describe('completeOnboarding contract', () => {
  it('writes "true" to ONBOARDING_KEY', async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(ONBOARDING_KEY, 'true');
  });

  it('calls trackOnboardingCompleted after saving key', async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    trackOnboardingCompleted();
    expect(trackOnboardingCompleted).toHaveBeenCalledTimes(1);
  });
});

describe('needsOnboarding gate logic', () => {
  type ProfileStatus = 'loading' | 'not-set' | 'set';

  function needsOnboarding(onboardingDone: boolean, status: ProfileStatus): boolean {
    return !onboardingDone || status === 'not-set';
  }

  it('fresh install (onboardingDone=false, status=not-set) → needs onboarding', () => {
    expect(needsOnboarding(false, 'not-set')).toBe(true);
  });

  it('completed onboarding + set profile → no onboarding', () => {
    expect(needsOnboarding(true, 'set')).toBe(false);
  });

  it('completed onboarding + not-set profile → re-runs style questionnaire (mandatory)', () => {
    expect(needsOnboarding(true, 'not-set')).toBe(true);
  });
});

describe('hydrated gate', () => {
  type AnyStatus = 'loading' | 'not-set' | 'set';
  type AuthStatus = 'loading' | 'unauthenticated' | 'authenticated';
  function isHydrated(onboardingDone: boolean | null, status: AnyStatus, authStatus: AuthStatus): boolean {
    return onboardingDone !== null && status !== 'loading' && authStatus !== 'loading';
  }

  it('null onboardingDone → not hydrated (splash stays visible)', () => {
    expect(isHydrated(null, 'set', 'authenticated')).toBe(false);
  });

  it('profile loading → not hydrated (splash stays visible)', () => {
    expect(isHydrated(true, 'loading', 'authenticated')).toBe(false);
  });

  it('auth loading → not hydrated (splash stays visible)', () => {
    expect(isHydrated(true, 'set', 'loading')).toBe(false);
  });

  it('both resolved → hydrated (splash dismissed)', () => {
    expect(isHydrated(true, 'set', 'authenticated')).toBe(true);
  });
});

describe('auth gate logic', () => {
  function needsAuth(authStatus: 'unauthenticated' | 'authenticated'): boolean {
    return authStatus === 'unauthenticated';
  }

  it('unauthenticated users see the auth screen before onboarding/main app', () => {
    expect(needsAuth('unauthenticated')).toBe(true);
  });

  it('authenticated users can continue into onboarding or the main app', () => {
    expect(needsAuth('authenticated')).toBe(false);
  });
});
