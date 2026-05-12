import { useMemo } from 'react';
import { HistoryEntry } from './useOutfitHistory';

// ── Condition helpers (mirrored from useWeatherBadges) ───────────────────────

const isRainy = (l: string) => /rain|drizzle|shower/i.test(l);
const isClear = (l: string) => ['Clear', 'Mostly Clear', 'Partly Cloudy'].includes(l);
const isSnow  = (l: string) => /snow|blizzard/i.test(l);
const isStorm = (l: string) => /thunderstorm|severe storm/i.test(l);
const isCold  = (e: HistoryEntry) => e.weather.temp < 10;
const isHot   = (e: HistoryEntry) => e.weather.temp >= 28;

const FASHION_CAPITALS = ['paris', 'milan', 'new york', 'london', 'tokyo'];

// ── Challenge definitions ────────────────────────────────────────────────────

export interface WeeklyChallenge {
  id: string;
  title: string;
  brief: string;
  evaluate: (weekHistory: HistoryEntry[]) => boolean;
}

const CHALLENGES: WeeklyChallenge[] = [
  {
    id: 'rain_chaser',
    title: 'Rain Chaser',
    brief: 'Consult the Oracle for a city with rain in the forecast this week.',
    evaluate: h => h.some(e => isRainy(e.weather.conditionLabel)),
  },
  {
    id: 'city_hopper',
    title: 'City Hopper',
    brief: 'Dress for 2 different cities before the week is out.',
    evaluate: h => new Set(h.map(e => e.city.toLowerCase())).size >= 2,
  },
  {
    id: 'early_brief',
    title: 'The Early Brief',
    brief: 'Consult the Oracle before 9am any day this week.',
    evaluate: h => h.some(e => new Date(e.consultedAt).getHours() < 9),
  },
  {
    id: 'work_wardrobe',
    title: 'Work Wardrobe Week',
    brief: 'Let the Oracle dress you for a work occasion this week.',
    evaluate: h => h.some(e => e.occasion === 'Work'),
  },
  {
    id: 'date_night',
    title: 'Date Night Oracle',
    brief: 'Let the Oracle dress you for a date at least once this week.',
    evaluate: h => h.some(e => e.occasion === 'Date'),
  },
  {
    id: 'active_week',
    title: 'Move in Style',
    brief: 'Consult for an active occasion this week. Fashion has no off-days.',
    evaluate: h => h.some(e => e.occasion === 'Active'),
  },
  {
    id: 'fashion_capital',
    title: 'Fashion Capital',
    brief: 'Consult for Paris, Milan, New York, London, or Tokyo this week.',
    evaluate: h => h.some(e => FASHION_CAPITALS.some(c => e.city.toLowerCase().includes(c))),
  },
  {
    id: 'sunny_seeker',
    title: 'Sunny Seeker',
    brief: 'Find a clear-sky city and dress for it this week.',
    evaluate: h => h.some(e => isClear(e.weather.conditionLabel)),
  },
  {
    id: 'tri_city',
    title: 'Tri-City Tour',
    brief: 'Consult for 3 different cities before Sunday.',
    evaluate: h => new Set(h.map(e => e.city.toLowerCase())).size >= 3,
  },
  {
    id: 'cold_front',
    title: 'Cold Front',
    brief: 'Dress for a city below 10°C this week. Layers required.',
    evaluate: h => h.some(isCold),
  },
  {
    id: 'heat_wave',
    title: 'Heat Wave',
    brief: 'Consult for a city at 28°C or above this week.',
    evaluate: h => h.some(isHot),
  },
  {
    id: 'storm_chaser',
    title: 'Into the Storm',
    brief: 'Consult during a thunderstorm this week. The Oracle thrives in drama.',
    evaluate: h => h.some(e => isStorm(e.weather.conditionLabel)),
  },
  {
    id: 'snow_globe',
    title: 'Snow Globe',
    brief: 'Find a city with snow and dress accordingly this week.',
    evaluate: h => h.some(e => isSnow(e.weather.conditionLabel)),
  },
  {
    id: 'weekend_wardrobe',
    title: 'Weekend Edit',
    brief: 'Consult with the Weekend occasion — the Oracle has opinions on leisure.',
    evaluate: h => h.some(e => e.occasion === 'Weekend'),
  },
  {
    id: 'night_oracle',
    title: 'After Dark',
    brief: 'Request a night verdict — check what the Oracle says for after dark.',
    evaluate: h => h.some(e => {
      const hr = new Date(e.consultedAt).getHours();
      return hr >= 20 || hr < 6;
    }),
  },
  {
    id: 'new_continent',
    title: 'New Horizons',
    brief: 'Consult for a city you have never searched before this week.',
    evaluate: h => {
      if (h.length === 0) return false;
      const thisWeekCities = new Set(h.map(e => e.city.toLowerCase()));
      return thisWeekCities.size >= 1;
    },
  },
];

// ── ISO week number ──────────────────────────────────────────────────────────

function isoWeekNumber(d: Date): number {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const jan4 = new Date(date.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((date.getTime() - jan4.getTime()) / 86400000 -
        3 +
        ((jan4.getDay() + 6) % 7)) /
        7,
    )
  );
}

// Monday of the current week at midnight (local time)
function startOfWeek(): Date {
  const now = new Date();
  const day = now.getDay(); // 0 = Sun
  const diff = (day === 0 ? -6 : 1 - day);
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// Days remaining until Sunday 23:59 (1 = today is Sunday)
function daysLeftInWeek(): number {
  const now = new Date();
  const day = now.getDay(); // 0 = Sun, 6 = Sat
  return day === 0 ? 1 : 7 - day + 1;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export interface WeeklyChallengeState {
  challenge: WeeklyChallenge;
  completed: boolean;
  daysLeft: number;
  weekNumber: number;
}

export function useWeeklyChallenge(history: HistoryEntry[]): WeeklyChallengeState {
  return useMemo(() => {
    const weekNum = isoWeekNumber(new Date());
    const challenge = CHALLENGES[weekNum % CHALLENGES.length];

    const weekStart = startOfWeek().getTime();
    const weekHistory = history.filter(e => e.consultedAt >= weekStart);
    const completed = challenge.evaluate(weekHistory);

    return {
      challenge,
      completed,
      daysLeft: daysLeftInWeek(),
      weekNumber: weekNum,
    };
  }, [history]);
}
