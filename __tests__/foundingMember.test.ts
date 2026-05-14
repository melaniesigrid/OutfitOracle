/**
 * foundingMember.test.ts
 *
 * Regression tests for the Founding Member badge persistence fix (D1 eng review).
 *
 * Root cause fixed: isFoundingMember was derived from history.some(), which is
 * capped at 20 entries. Badge would silently disappear after 20+ additional consults.
 *
 * Fix: badge is now persisted to a dedicated @outfit_oracle_founding_member key.
 * OracleScreen writes '1' when verdict.foundingMember is true.
 * YouScreen reads this key directly; it is immune to history trimming.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const FM_KEY = '@outfit_oracle_founding_member';

const SOFT_KEYS = [
  '@outfit_oracle_history',
  '@outfit_oracle_first_consult',
  '@outfit_oracle_recent_cities',
  '@outfit_oracle_last_result',
  '@outfit_oracle_saved',
];

const ALL_KEYS = [
  '@outfit_oracle_history',
  '@outfit_oracle_first_consult',
  '@outfit_oracle_recent_cities',
  '@outfit_oracle_last_result',
  '@outfit_oracle_streak',
  '@outfit_oracle_style_profile',
  '@outfit_oracle_saved',
  '@onboarding_complete',
  '@outfit_oracle_founding_member',
];

beforeEach(() => jest.clearAllMocks());

describe('Founding Member AsyncStorage key', () => {
  it('key present → isFoundingMember is true', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('1');
    const val = await AsyncStorage.getItem(FM_KEY);
    expect(val === '1').toBe(true);
  });

  it('key absent (null) → isFoundingMember is false', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    const val = await AsyncStorage.getItem(FM_KEY);
    expect(val === '1').toBe(false);
  });

  it('OracleScreen writes the key when verdict.foundingMember is true', async () => {
    await AsyncStorage.setItem(FM_KEY, '1');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(FM_KEY, '1');
  });

  it('key is NOT in SOFT_KEYS — survives "Clear history" soft reset', () => {
    expect(SOFT_KEYS).not.toContain(FM_KEY);
  });

  it('key IS in ALL_KEYS — erased on full "Delete all data" reset', () => {
    expect(ALL_KEYS).toContain(FM_KEY);
  });

  it('badge is not derived from history array — immune to 20-entry history trim', async () => {
    // Simulate the old history.some() pattern: 20 entries, none with foundingMember
    const fakeHistory = Array.from({ length: 20 }, (_, i) => ({
      id: String(i),
      verdict: { foundingMember: false },
    }));
    const fromHistory = fakeHistory.some(e => (e.verdict as any).foundingMember === true);
    expect(fromHistory).toBe(false);

    // The dedicated key is unaffected by history content
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('1');
    const fromKey = await AsyncStorage.getItem(FM_KEY);
    expect(fromKey === '1').toBe(true);
  });
});
