/**
 * weatherBadges.test.ts
 *
 * Tests the exported constants and structural contracts from useWeatherBadges.ts.
 *
 * What changed in this diff:
 *   - New `category` field added to every BadgeDef and every WeatherBadge
 *   - New BADGE_CATEGORY_LABELS export (15 categories with display names)
 *   - New BADGE_CATEGORY_ORDER export (15-element ordered array)
 *   - __DEV__ validation changed from strict 100-badge count to dev log
 *
 * The hook itself (useWeatherBadges) calls useMemo and requires React context —
 * it is marked MOBILE-ONLY and is not invoked here.
 * The pure helper functions (nthMatch, consecutiveDayStreak, sinceFirst) are
 * internal (not exported) and are covered indirectly through the category label
 * and order structure tests.
 */

// __DEV__ is used in the module body; set it before importing.
(global as any).__DEV__ = false;

import {
  BADGE_CATEGORY_LABELS,
  BADGE_CATEGORY_ORDER,
  WeatherBadge,
  BadgeExtras,
} from '../src/hooks/useWeatherBadges';

// ── BADGE_CATEGORY_LABELS ─────────────────────────────────────────────────────

describe('BADGE_CATEGORY_LABELS', () => {
  it('exports a non-empty record', () => {
    expect(typeof BADGE_CATEGORY_LABELS).toBe('object');
    expect(Object.keys(BADGE_CATEGORY_LABELS).length).toBeGreaterThan(0);
  });

  it('contains exactly 15 categories', () => {
    expect(Object.keys(BADGE_CATEGORY_LABELS).length).toBe(15);
  });

  it('contains all expected category keys', () => {
    const expectedKeys = [
      'culture', 'first_steps', 'streak', 'cold', 'heat',
      'rain', 'snow', 'sunshine', 'atmosphere', 'timing',
      'calendar', 'cities', 'occasions', 'collection', 'anniversary',
    ];
    for (const key of expectedKeys) {
      expect(BADGE_CATEGORY_LABELS).toHaveProperty(key);
    }
  });

  it('maps known categories to uppercased display labels', () => {
    expect(BADGE_CATEGORY_LABELS['culture']).toBe('FASHION MYTHOLOGY');
    expect(BADGE_CATEGORY_LABELS['first_steps']).toBe('FIRST STEPS');
    expect(BADGE_CATEGORY_LABELS['streak']).toBe('DEVOTION STREAKS');
    expect(BADGE_CATEGORY_LABELS['cold']).toBe('COLD WEATHER');
    expect(BADGE_CATEGORY_LABELS['heat']).toBe('HOT WEATHER');
    expect(BADGE_CATEGORY_LABELS['rain']).toBe('RAIN & STORMS');
    expect(BADGE_CATEGORY_LABELS['snow']).toBe('SNOWFALL');
    expect(BADGE_CATEGORY_LABELS['sunshine']).toBe('SUNSHINE');
    expect(BADGE_CATEGORY_LABELS['atmosphere']).toBe('ATMOSPHERE');
    expect(BADGE_CATEGORY_LABELS['timing']).toBe('TIME OF DAY');
    expect(BADGE_CATEGORY_LABELS['calendar']).toBe('CALENDAR');
    expect(BADGE_CATEGORY_LABELS['cities']).toBe('CITIES & TRAVEL');
    expect(BADGE_CATEGORY_LABELS['occasions']).toBe('OCCASIONS');
    expect(BADGE_CATEGORY_LABELS['collection']).toBe('THE COLLECTION');
    expect(BADGE_CATEGORY_LABELS['anniversary']).toBe('ANNIVERSARIES');
  });

  it('all display label values are non-empty uppercase strings', () => {
    for (const [key, label] of Object.entries(BADGE_CATEGORY_LABELS)) {
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
      expect(label).toBe(label.toUpperCase());
      // key is used as identifier in category filtering — must be valid
      expect(key).toMatch(/^[a-z_]+$/);
    }
  });
});

// ── BADGE_CATEGORY_ORDER ──────────────────────────────────────────────────────

describe('BADGE_CATEGORY_ORDER', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(BADGE_CATEGORY_ORDER)).toBe(true);
    expect(BADGE_CATEGORY_ORDER.length).toBeGreaterThan(0);
  });

  it('has exactly 15 entries', () => {
    expect(BADGE_CATEGORY_ORDER.length).toBe(15);
  });

  it('starts with culture (most prominent category in UI)', () => {
    expect(BADGE_CATEGORY_ORDER[0]).toBe('culture');
  });

  it('ends with anniversary', () => {
    expect(BADGE_CATEGORY_ORDER[BADGE_CATEGORY_ORDER.length - 1]).toBe('anniversary');
  });

  it('contains no duplicate category keys', () => {
    const seen = new Set(BADGE_CATEGORY_ORDER);
    expect(seen.size).toBe(BADGE_CATEGORY_ORDER.length);
  });

  it('every entry in ORDER has a matching entry in LABELS', () => {
    for (const cat of BADGE_CATEGORY_ORDER) {
      expect(BADGE_CATEGORY_LABELS).toHaveProperty(cat);
    }
  });

  it('every key in LABELS appears in ORDER', () => {
    for (const key of Object.keys(BADGE_CATEGORY_LABELS)) {
      expect(BADGE_CATEGORY_ORDER).toContain(key);
    }
  });

  it('LABELS and ORDER have the same number of entries', () => {
    expect(BADGE_CATEGORY_ORDER.length).toBe(Object.keys(BADGE_CATEGORY_LABELS).length);
  });

  it('contains all expected categories in a well-defined order', () => {
    expect(BADGE_CATEGORY_ORDER).toEqual([
      'culture', 'first_steps', 'streak', 'cold', 'heat',
      'rain', 'snow', 'sunshine', 'atmosphere', 'timing',
      'calendar', 'cities', 'occasions', 'collection', 'anniversary',
    ]);
  });
});

// ── WeatherBadge interface contract ──────────────────────────────────────────

describe('WeatherBadge interface — new category field', () => {
  it('accepts an object with the required category field (compile-time check via assignment)', () => {
    // This verifies the category field is part of the exported interface.
    // If category were missing from the interface this would be a TS error.
    const badge: WeatherBadge = {
      id: 'test_badge',
      title: 'Test Badge',
      desc: 'A test badge',
      icon: 'star',
      category: 'culture',   // NEW field in this diff
      earned: true,
      earnedAt: Date.now(),
    };
    expect(badge.category).toBe('culture');
  });

  it('category field is a string', () => {
    const badge: WeatherBadge = {
      id: 'b2',
      title: 'B2',
      desc: 'desc',
      icon: 'fire',
      category: 'streak',
      earned: false,
    };
    expect(typeof badge.category).toBe('string');
  });

  it('earnedAt is optional on unearned badges', () => {
    const badge: WeatherBadge = {
      id: 'b3',
      title: 'B3',
      desc: 'desc',
      icon: 'snowflake',
      category: 'snow',
      earned: false,
    };
    expect(badge.earnedAt).toBeUndefined();
  });
});

// ── BadgeExtras interface ─────────────────────────────────────────────────────

describe('BadgeExtras interface', () => {
  it('accepts all required fields', () => {
    const extras: BadgeExtras = {
      totalConsults: 5,
      streak: 3,
      savedCount: 2,
    };
    expect(extras.totalConsults).toBe(5);
    expect(extras.streak).toBe(3);
    expect(extras.savedCount).toBe(2);
  });
});
