import { useMemo } from 'react';
import { HistoryEntry } from './useOutfitHistory';

export interface WeatherBadge {
  id: string;
  title: string;
  desc: string;
  icon: string;
  earned: boolean;
  earnedAt?: number;
}

type BadgeDef = {
  id: string;
  title: string;
  desc: string;
  icon: string;
  evaluate: (history: HistoryEntry[], firstConsultAt?: number) => number | false;
};

const isRainy  = (l: string) => ['Rain', 'Showers', 'Drizzle', 'Light Rain', 'Heavy Rain', 'Light Drizzle', 'Heavy Drizzle', 'Heavy Showers', 'Storm Showers'].some(s => l.includes(s));
const isClear  = (l: string) => ['Clear', 'Mostly Clear', 'Partly Cloudy'].includes(l);
const isSnow   = (l: string) => l.includes('Snow');
const isStorm  = (l: string) => l === 'Thunderstorm' || l === 'Severe Storm';

function consecutiveDayStreak(
  history: HistoryEntry[],
  condition: (e: HistoryEntry) => boolean,
  minDays: number,
): number | false {
  const matching = history.filter(condition);
  if (matching.length < minDays) return false;

  const dateSet = new Set(
    matching.map(e => new Date(e.consultedAt).toISOString().slice(0, 10)),
  );
  const dates = [...dateSet].sort();

  if (dates.length < minDays) return false;

  let run = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = Math.round(
      (new Date(dates[i] + 'T12:00:00').getTime() -
       new Date(dates[i - 1] + 'T12:00:00').getTime()) / 86400000,
    );
    if (diff === 1) {
      run++;
      if (run >= minDays) {
        const lastDate = dates[i];
        const entries = matching.filter(
          e => new Date(e.consultedAt).toISOString().slice(0, 10) === lastDate,
        );
        return entries[entries.length - 1].consultedAt;
      }
    } else {
      run = 1;
    }
  }
  return false;
}

const SIX_MONTHS_MS = 183 * 24 * 3600 * 1000;
const ONE_YEAR_MS   = 365 * 24 * 3600 * 1000;

const BADGE_DEFS: BadgeDef[] = [
  // ── Temperature extremes ──────────────────────────────────────────────────
  {
    id: 'blizzard_chic',
    title: 'Blizzard Chic',
    desc: 'Consulted when temp ≤ −10°C',
    icon: 'snowflake',
    evaluate: h => {
      const e = h.find(e => e.weather.temp <= -10);
      return e ? e.consultedAt : false;
    },
  },
  {
    id: 'polar_explorer',
    title: 'Polar Explorer',
    desc: 'Feels like ≤ −20°C',
    icon: 'thermometer-minus',
    evaluate: h => {
      const e = h.find(e => (e.weather.feelsLike ?? e.weather.temp) <= -20);
      return e ? e.consultedAt : false;
    },
  },
  {
    id: 'desert_muse',
    title: 'Desert Muse',
    desc: 'Consulted when temp ≥ 38°C',
    icon: 'weather-sunny-alert',
    evaluate: h => {
      const e = h.find(e => e.weather.temp >= 38);
      return e ? e.consultedAt : false;
    },
  },

  // ── UV ────────────────────────────────────────────────────────────────────
  {
    id: 'solar_oracle',
    title: 'Solar Oracle',
    desc: 'Consulted with UV index ≥ 8',
    icon: 'white-balance-sunny',
    evaluate: h => {
      const e = h.find(e => (e.weather.uvIndex ?? 0) >= 8);
      return e ? e.consultedAt : false;
    },
  },
  {
    id: 'extreme_uv',
    title: 'Extreme UV',
    desc: 'Consulted with UV index ≥ 11',
    icon: 'sun-wireless',
    evaluate: h => {
      const e = h.find(e => (e.weather.uvIndex ?? 0) >= 11);
      return e ? e.consultedAt : false;
    },
  },

  // ── Precipitation ─────────────────────────────────────────────────────────
  {
    id: 'snow_day',
    title: 'Snow Day',
    desc: 'Consulted during snowfall',
    icon: 'weather-snowy',
    evaluate: h => {
      const e = h.find(e => isSnow(e.weather.conditionLabel));
      return e ? e.consultedAt : false;
    },
  },
  {
    id: 'storm_chaser',
    title: 'Storm Chaser',
    desc: 'Consulted during a thunderstorm',
    icon: 'weather-lightning-rainy',
    evaluate: h => {
      const e = h.find(e => isStorm(e.weather.conditionLabel));
      return e ? e.consultedAt : false;
    },
  },
  {
    id: 'rain_oracle',
    title: 'Rain Oracle',
    desc: '10 rainy-day consults',
    icon: 'weather-rainy',
    evaluate: h => {
      const rainy = h.filter(e => isRainy(e.weather.conditionLabel));
      return rainy.length >= 10 ? rainy[9].consultedAt : false;
    },
  },
  {
    id: 'rain_dancer',
    title: 'Rain Dancer',
    desc: '3 consecutive rainy days',
    icon: 'weather-pouring',
    evaluate: h => consecutiveDayStreak(h, e => isRainy(e.weather.conditionLabel), 3),
  },

  // ── Sunshine ──────────────────────────────────────────────────────────────
  {
    id: 'sun_devotee',
    title: 'The Sun Devotee',
    desc: '20 clear-sky consults',
    icon: 'weather-sunny',
    evaluate: h => {
      const sunny = h.filter(e => isClear(e.weather.conditionLabel));
      return sunny.length >= 20 ? sunny[19].consultedAt : false;
    },
  },
  {
    id: 'sunshine_streak',
    title: 'Sunshine Streak',
    desc: '3 consecutive clear-sky days',
    icon: 'weather-partly-cloudy',
    evaluate: h => consecutiveDayStreak(h, e => isClear(e.weather.conditionLabel), 3),
  },

  // ── All conditions ────────────────────────────────────────────────────────
  {
    id: 'four_seasons',
    title: 'Four Seasons',
    desc: 'Consulted in all 4 weather types',
    icon: 'weather-partly-cloudy',
    evaluate: h => {
      if (
        h.some(e => isRainy(e.weather.conditionLabel)) &&
        h.some(e => isClear(e.weather.conditionLabel)) &&
        h.some(e => isSnow(e.weather.conditionLabel)) &&
        h.some(e => isStorm(e.weather.conditionLabel))
      ) {
        return h[0].consultedAt;
      }
      return false;
    },
  },

  // ── Timing ────────────────────────────────────────────────────────────────
  {
    id: 'night_oracle',
    title: 'Night Oracle',
    desc: 'Consulted between midnight and 5am',
    icon: 'weather-night',
    evaluate: h => {
      const e = h.find(e => {
        const hour = new Date(e.consultedAt).getHours();
        return hour < 5;
      });
      return e ? e.consultedAt : false;
    },
  },

  // ── Travel ────────────────────────────────────────────────────────────────
  {
    id: 'world_citizen',
    title: 'World Citizen',
    desc: 'Consulted from 5+ countries',
    icon: 'earth',
    evaluate: h => {
      const countries = new Set(
        h.map(e => e.weather.country?.toLowerCase()).filter(Boolean),
      );
      return countries.size >= 5 ? h[0].consultedAt : false;
    },
  },

  // ── Anniversary ───────────────────────────────────────────────────────────
  {
    id: 'six_month',
    title: 'Six-Month Devotee',
    desc: '6 months with the Oracle',
    icon: 'calendar-check',
    evaluate: (_h, firstConsultAt) => {
      if (!firstConsultAt) return false;
      const earned = firstConsultAt + SIX_MONTHS_MS;
      return Date.now() >= earned ? earned : false;
    },
  },
  {
    id: 'one_year',
    title: 'Year of the Oracle',
    desc: '1 full year with the Oracle',
    icon: 'crown',
    evaluate: (_h, firstConsultAt) => {
      if (!firstConsultAt) return false;
      const earned = firstConsultAt + ONE_YEAR_MS;
      return Date.now() >= earned ? earned : false;
    },
  },
];

export function useWeatherBadges(history: HistoryEntry[], firstConsultAt?: number): WeatherBadge[] {
  return useMemo(
    () =>
      BADGE_DEFS.map(def => {
        const result = def.evaluate(history, firstConsultAt);
        return {
          id:       def.id,
          title:    def.title,
          desc:     def.desc,
          icon:     def.icon,
          earned:   result !== false,
          earnedAt: result !== false ? result : undefined,
        };
      }),
    [history, firstConsultAt],
  );
}
