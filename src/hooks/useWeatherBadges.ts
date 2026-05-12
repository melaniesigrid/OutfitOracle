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

export interface BadgeExtras {
  totalConsults: number;
  streak: number;
  savedCount: number;
}

type Evaluator = (
  history: HistoryEntry[],
  firstConsultAt: number | undefined,
  extras: BadgeExtras,
) => number | false;

type BadgeDef = {
  id: string;
  title: string;
  desc: string;
  icon: string;
  evaluate: Evaluator;
};

// ── Condition helpers ────────────────────────────────────────────────────────

const isRainy  = (l: string) => /rain|drizzle|shower/i.test(l);
const isClear  = (l: string) => ['Clear', 'Mostly Clear', 'Partly Cloudy'].includes(l);
const isSnow   = (l: string) => /snow|blizzard/i.test(l);
const isStorm  = (l: string) => /thunderstorm|severe storm/i.test(l);
const isFoggy  = (l: string) => /fog|mist|haze/i.test(l);
const isCloud  = (l: string) => /cloud|overcast/i.test(l);

// Returns the timestamp of the Nth entry matching predicate (1-indexed), or false
function nthMatch(
  history: HistoryEntry[],
  predicate: (e: HistoryEntry) => boolean,
  n: number,
): number | false {
  const matching = history.filter(predicate);
  return matching.length >= n ? matching[n - 1].consultedAt : false;
}

// Returns timestamp if `n` consecutive calendar days all match predicate
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

// ── Time helpers ─────────────────────────────────────────────────────────────

const MONTH_MS     = 30  * 24 * 3600 * 1000;
const SIX_MONTH_MS = 183 * 24 * 3600 * 1000;
const YEAR_MS      = 365 * 24 * 3600 * 1000;

function sinceFirst(firstConsultAt: number | undefined, ms: number): number | false {
  if (!firstConsultAt) return false;
  const earned = firstConsultAt + ms;
  return Date.now() >= earned ? earned : false;
}

const FASHION_CAPITALS = ['paris', 'milan', 'new york', 'london', 'tokyo'];

// ── 100 Badge definitions ────────────────────────────────────────────────────

const BADGE_DEFS: BadgeDef[] = [

  // ══ FIRST STEPS ══════════════════════════════════════════════════════════
  {
    id: 'oracle_awakens',
    title: 'The Oracle Awakens',
    desc: 'Your very first consult',
    icon: 'eye-outline',
    evaluate: (_h, _f, ex) => ex.totalConsults >= 1 ? Date.now() : false,
  },
  {
    id: 'five_consults',
    title: 'Five and Counting',
    desc: '5 total consults',
    icon: 'numeric-5-circle-outline',
    evaluate: (h, _f, ex) => {
      if (ex.totalConsults >= 5) return h[0]?.consultedAt ?? Date.now();
      return false;
    },
  },
  {
    id: 'ten_consults',
    title: 'Double Digits',
    desc: '10 total consults',
    icon: 'numeric-10-circle-outline',
    evaluate: (h, _f, ex) => ex.totalConsults >= 10 ? (h[0]?.consultedAt ?? Date.now()) : false,
  },
  {
    id: 'quarter_century',
    title: 'Quarter Century',
    desc: '25 total consults',
    icon: 'medal-outline',
    evaluate: (h, _f, ex) => ex.totalConsults >= 25 ? (h[0]?.consultedAt ?? Date.now()) : false,
  },
  {
    id: 'half_century',
    title: 'Half Century',
    desc: '50 total consults',
    icon: 'trophy-outline',
    evaluate: (h, _f, ex) => ex.totalConsults >= 50 ? (h[0]?.consultedAt ?? Date.now()) : false,
  },
  {
    id: 'centurion',
    title: 'The Centurion',
    desc: '100 total consults',
    icon: 'crown-outline',
    evaluate: (h, _f, ex) => ex.totalConsults >= 100 ? (h[0]?.consultedAt ?? Date.now()) : false,
  },
  {
    id: 'two_hundred',
    title: 'Two Hundred',
    desc: '200 total consults',
    icon: 'star-four-points',
    evaluate: (h, _f, ex) => ex.totalConsults >= 200 ? (h[0]?.consultedAt ?? Date.now()) : false,
  },
  {
    id: 'five_hundred',
    title: 'Five Hundred',
    desc: '500 total consults — truly devoted',
    icon: 'infinity',
    evaluate: (h, _f, ex) => ex.totalConsults >= 500 ? (h[0]?.consultedAt ?? Date.now()) : false,
  },

  // ══ STREAKS ══════════════════════════════════════════════════════════════
  {
    id: 'streak_3',
    title: 'Three Days Running',
    desc: '3-day consult streak',
    icon: 'fire',
    evaluate: (_h, _f, ex) => ex.streak >= 3 ? Date.now() : false,
  },
  {
    id: 'streak_7',
    title: 'Week of Devotion',
    desc: '7-day consult streak',
    icon: 'fire',
    evaluate: (_h, _f, ex) => ex.streak >= 7 ? Date.now() : false,
  },
  {
    id: 'streak_14',
    title: 'Fortnight',
    desc: '14-day consult streak',
    icon: 'lightning-bolt',
    evaluate: (_h, _f, ex) => ex.streak >= 14 ? Date.now() : false,
  },
  {
    id: 'streak_30',
    title: 'Monthly Devotee',
    desc: '30-day consult streak',
    icon: 'lightning-bolt-outline',
    evaluate: (_h, _f, ex) => ex.streak >= 30 ? Date.now() : false,
  },
  {
    id: 'streak_50',
    title: 'The Fifty',
    desc: '50-day consult streak',
    icon: 'flash',
    evaluate: (_h, _f, ex) => ex.streak >= 50 ? Date.now() : false,
  },
  {
    id: 'streak_100',
    title: 'Century Streak',
    desc: '100-day consult streak',
    icon: 'flash-circle',
    evaluate: (_h, _f, ex) => ex.streak >= 100 ? Date.now() : false,
  },
  {
    id: 'streak_365',
    title: 'Year of Devotion',
    desc: '365-day consult streak',
    icon: 'star-circle',
    evaluate: (_h, _f, ex) => ex.streak >= 365 ? Date.now() : false,
  },

  // ══ COLD TEMPERATURES ════════════════════════════════════════════════════
  {
    id: 'deep_freeze',
    title: 'Deep Freeze',
    desc: 'Consulted at 0°C or below',
    icon: 'snowflake-alert',
    evaluate: h => nthMatch(h, e => e.weather.temp <= 0, 1),
  },
  {
    id: 'subzero_chic',
    title: 'Sub-Zero Chic',
    desc: 'Consulted at −5°C or below',
    icon: 'snowflake-variant',
    evaluate: h => nthMatch(h, e => e.weather.temp <= -5, 1),
  },
  {
    id: 'blizzard_chic',
    title: 'Blizzard Chic',
    desc: 'Consulted when temp ≤ −10°C',
    icon: 'snowflake',
    evaluate: h => nthMatch(h, e => e.weather.temp <= -10, 1),
  },
  {
    id: 'polar_explorer',
    title: 'Polar Explorer',
    desc: 'Feels like −20°C or below',
    icon: 'thermometer-minus',
    evaluate: h => nthMatch(h, e => (e.weather.feelsLike ?? e.weather.temp) <= -20, 1),
  },
  {
    id: 'cold_devotee',
    title: 'Cold Devotee',
    desc: '5 consults at 5°C or below',
    icon: 'weather-snowy-heavy',
    evaluate: h => nthMatch(h, e => e.weather.temp <= 5, 5),
  },
  {
    id: 'wind_chill',
    title: 'Wind Chill',
    desc: 'Feels like −15°C or colder',
    icon: 'weather-windy-variant',
    evaluate: h => nthMatch(h, e => (e.weather.feelsLike ?? e.weather.temp) <= -15, 1),
  },

  // ══ HOT TEMPERATURES ═════════════════════════════════════════════════════
  {
    id: 'warm_welcome',
    title: 'Warm Welcome',
    desc: 'Consulted at 25°C or above',
    icon: 'white-balance-sunny',
    evaluate: h => nthMatch(h, e => e.weather.temp >= 25, 1),
  },
  {
    id: 'heatwave_hero',
    title: 'Heatwave Hero',
    desc: 'Consulted at 35°C or above',
    icon: 'weather-sunny-alert',
    evaluate: h => nthMatch(h, e => e.weather.temp >= 35, 1),
  },
  {
    id: 'desert_muse',
    title: 'Desert Muse',
    desc: 'Consulted at 38°C or above',
    icon: 'weather-sunny-alert',
    evaluate: h => nthMatch(h, e => e.weather.temp >= 38, 1),
  },
  {
    id: 'scorched',
    title: 'Scorched',
    desc: 'Consulted at 40°C or above — the Oracle sweats',
    icon: 'fire-circle',
    evaluate: h => nthMatch(h, e => e.weather.temp >= 40, 1),
  },
  {
    id: 'heat_devotee',
    title: 'Heat Devotee',
    desc: '5 consults at 30°C or above',
    icon: 'thermometer-plus',
    evaluate: h => nthMatch(h, e => e.weather.temp >= 30, 5),
  },
  {
    id: 'heat_index',
    title: 'Heat Index',
    desc: 'Feels like 42°C or above',
    icon: 'sun-thermometer',
    evaluate: h => nthMatch(h, e => (e.weather.feelsLike ?? e.weather.temp) >= 42, 1),
  },
  {
    id: 'goldilocks',
    title: 'The Goldilocks Zone',
    desc: 'Consulted on a perfect 20–24°C clear day',
    icon: 'weather-sunny',
    evaluate: h => nthMatch(
      h,
      e => e.weather.temp >= 20 && e.weather.temp <= 24 && isClear(e.weather.conditionLabel),
      1,
    ),
  },
  {
    id: 'feels_much_worse',
    title: 'Feels Much Worse',
    desc: 'Feels like 10°C+ colder than the actual temperature',
    icon: 'thermometer-lines',
    evaluate: h => nthMatch(h, e => (e.weather.temp - (e.weather.feelsLike ?? e.weather.temp)) >= 10, 1),
  },

  // ══ RAIN ═════════════════════════════════════════════════════════════════
  {
    id: 'first_rain',
    title: 'April Showers',
    desc: 'First rainy-day consult',
    icon: 'weather-rainy',
    evaluate: h => nthMatch(h, e => isRainy(e.weather.conditionLabel), 1),
  },
  {
    id: 'puddle_jumper',
    title: 'Puddle Jumper',
    desc: '5 rainy-day consults',
    icon: 'umbrella',
    evaluate: h => nthMatch(h, e => isRainy(e.weather.conditionLabel), 5),
  },
  {
    id: 'rain_oracle',
    title: 'Rain Oracle',
    desc: '10 rainy-day consults',
    icon: 'weather-rainy',
    evaluate: h => nthMatch(h, e => isRainy(e.weather.conditionLabel), 10),
  },
  {
    id: 'storm_season',
    title: 'Storm Season',
    desc: '25 rainy-day consults',
    icon: 'weather-pouring',
    evaluate: h => nthMatch(h, e => isRainy(e.weather.conditionLabel), 25),
  },
  {
    id: 'rain_dancer',
    title: 'Rain Dancer',
    desc: '3 consecutive rainy days',
    icon: 'weather-pouring',
    evaluate: h => consecutiveDayStreak(h, e => isRainy(e.weather.conditionLabel), 3),
  },
  {
    id: 'monsoon_week',
    title: 'Monsoon Week',
    desc: '7 consecutive rainy days',
    icon: 'weather-hurricane',
    evaluate: h => consecutiveDayStreak(h, e => isRainy(e.weather.conditionLabel), 7),
  },
  {
    id: 'storm_chaser',
    title: 'Storm Chaser',
    desc: 'Consulted during a thunderstorm',
    icon: 'weather-lightning-rainy',
    evaluate: h => nthMatch(h, e => isStorm(e.weather.conditionLabel), 1),
  },
  {
    id: 'thunder_devotee',
    title: 'Thunder Devotee',
    desc: '3 thunderstorm consults',
    icon: 'weather-lightning',
    evaluate: h => nthMatch(h, e => isStorm(e.weather.conditionLabel), 3),
  },

  // ══ SNOW ═════════════════════════════════════════════════════════════════
  {
    id: 'snow_day',
    title: 'Snow Day',
    desc: 'First consult during snowfall',
    icon: 'weather-snowy',
    evaluate: h => nthMatch(h, e => isSnow(e.weather.conditionLabel), 1),
  },
  {
    id: 'white_winter',
    title: 'White Winter',
    desc: '5 consults during snowfall',
    icon: 'snowflake',
    evaluate: h => nthMatch(h, e => isSnow(e.weather.conditionLabel), 5),
  },
  {
    id: 'snow_devotee',
    title: 'Snow Devotee',
    desc: '10 consults during snowfall',
    icon: 'weather-snowy-heavy',
    evaluate: h => nthMatch(h, e => isSnow(e.weather.conditionLabel), 10),
  },
  {
    id: 'blizzard_week',
    title: 'Blizzard Week',
    desc: '3 consecutive snowy days',
    icon: 'weather-snowy-rainy',
    evaluate: h => consecutiveDayStreak(h, e => isSnow(e.weather.conditionLabel), 3),
  },
  {
    id: 'snow_globe',
    title: 'Snow Globe',
    desc: 'Consulted during snowfall in 3 different cities',
    icon: 'image-filter-hdr',
    evaluate: h => {
      const snowy = h.filter(e => isSnow(e.weather.conditionLabel));
      const cities = new Set(snowy.map(e => e.city.toLowerCase()));
      return cities.size >= 3 ? snowy[0].consultedAt : false;
    },
  },

  // ══ SUNSHINE ═════════════════════════════════════════════════════════════
  {
    id: 'sunny_welcome',
    title: 'Hello, Sun',
    desc: 'First clear-sky consult',
    icon: 'weather-sunny',
    evaluate: h => nthMatch(h, e => isClear(e.weather.conditionLabel), 1),
  },
  {
    id: 'sunny_disposition',
    title: 'Sunny Disposition',
    desc: '5 clear-sky consults',
    icon: 'white-balance-sunny',
    evaluate: h => nthMatch(h, e => isClear(e.weather.conditionLabel), 5),
  },
  {
    id: 'sun_devotee',
    title: 'The Sun Devotee',
    desc: '20 clear-sky consults',
    icon: 'weather-sunny',
    evaluate: h => nthMatch(h, e => isClear(e.weather.conditionLabel), 20),
  },
  {
    id: 'golden_summer',
    title: 'Golden Summer',
    desc: '30 clear-sky consults',
    icon: 'sun-compass',
    evaluate: h => nthMatch(h, e => isClear(e.weather.conditionLabel), 30),
  },
  {
    id: 'sunshine_streak',
    title: 'Sunshine Streak',
    desc: '3 consecutive clear-sky days',
    icon: 'weather-partly-cloudy',
    evaluate: h => consecutiveDayStreak(h, e => isClear(e.weather.conditionLabel), 3),
  },
  {
    id: 'solar_week',
    title: 'Solar Week',
    desc: '7 consecutive clear-sky days',
    icon: 'weather-sunny',
    evaluate: h => consecutiveDayStreak(h, e => isClear(e.weather.conditionLabel), 7),
  },

  // ══ UV ═══════════════════════════════════════════════════════════════════
  {
    id: 'solar_oracle',
    title: 'Solar Oracle',
    desc: 'Consulted with UV index ≥ 8',
    icon: 'white-balance-sunny',
    evaluate: h => nthMatch(h, e => (e.weather.uvIndex ?? 0) >= 8, 1),
  },
  {
    id: 'extreme_uv',
    title: 'Extreme UV',
    desc: 'Consulted with UV index ≥ 11',
    icon: 'sun-wireless',
    evaluate: h => nthMatch(h, e => (e.weather.uvIndex ?? 0) >= 11, 1),
  },
  // ══ WIND ═════════════════════════════════════════════════════════════════
  {
    id: 'windy_oracle',
    title: 'Windy Oracle',
    desc: 'Consulted with wind ≥ 40 km/h',
    icon: 'weather-windy',
    evaluate: h => nthMatch(h, e => e.weather.windSpeed >= 40, 1),
  },
  {
    id: 'gale_force',
    title: 'Gale Force',
    desc: 'Consulted with wind ≥ 60 km/h',
    icon: 'weather-windy-variant',
    evaluate: h => nthMatch(h, e => e.weather.windSpeed >= 60, 1),
  },
  {
    id: 'hurricane_adjacent',
    title: 'Hurricane Adjacent',
    desc: 'Consulted with wind ≥ 80 km/h',
    icon: 'weather-hurricane',
    evaluate: h => nthMatch(h, e => e.weather.windSpeed >= 80, 1),
  },

  // ══ HUMIDITY ═════════════════════════════════════════════════════════════
  {
    id: 'swamp_chic',
    title: 'Swamp Chic',
    desc: 'Consulted with humidity ≥ 90%',
    icon: 'water-percent',
    evaluate: h => nthMatch(h, e => e.weather.humidity >= 90, 1),
  },
  {
    id: 'desert_dry',
    title: 'Desert Dry',
    desc: 'Consulted with humidity ≤ 20%',
    icon: 'water-off-outline',
    evaluate: h => nthMatch(h, e => e.weather.humidity <= 20, 1),
  },
  {
    id: 'tropical_hell',
    title: 'Tropical Hell',
    desc: 'Temp ≥ 35°C and humidity ≥ 80% simultaneously',
    icon: 'palm-tree',
    evaluate: h => nthMatch(h, e => e.weather.temp >= 35 && e.weather.humidity >= 80, 1),
  },

  // ══ ATMOSPHERE ═══════════════════════════════════════════════════════════
  {
    id: 'fog_oracle',
    title: 'Fog Oracle',
    desc: 'Consulted in fog, mist, or haze',
    icon: 'weather-fog',
    evaluate: h => nthMatch(h, e => isFoggy(e.weather.conditionLabel), 1),
  },
  {
    id: 'cloud_watcher',
    title: 'Cloud Watcher',
    desc: '10 cloudy or overcast consults',
    icon: 'weather-cloudy',
    evaluate: h => nthMatch(h, e => isCloud(e.weather.conditionLabel), 10),
  },
  {
    id: 'four_seasons',
    title: 'Four Seasons',
    desc: 'Consulted in rain, sun, snow, and a storm',
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
  {
    id: 'element_master',
    title: 'Element Master',
    desc: 'Consulted in 5 distinct weather types including fog',
    icon: 'earth',
    evaluate: h => {
      if (
        h.some(e => isRainy(e.weather.conditionLabel)) &&
        h.some(e => isClear(e.weather.conditionLabel)) &&
        h.some(e => isSnow(e.weather.conditionLabel)) &&
        h.some(e => isStorm(e.weather.conditionLabel)) &&
        h.some(e => isFoggy(e.weather.conditionLabel))
      ) {
        return h[0].consultedAt;
      }
      return false;
    },
  },
  {
    id: 'perfect_storm',
    title: 'Perfect Storm',
    desc: 'Rain, wind ≥ 30 km/h, and temp ≤ 10°C all at once',
    icon: 'weather-lightning-rainy',
    evaluate: h => nthMatch(
      h,
      e => isRainy(e.weather.conditionLabel) && e.weather.windSpeed >= 30 && e.weather.temp <= 10,
      1,
    ),
  },

  // ══ TIME OF DAY ══════════════════════════════════════════════════════════
  {
    id: 'night_oracle',
    title: 'Night Oracle',
    desc: 'Consulted between midnight and 5am',
    icon: 'weather-night',
    evaluate: h => nthMatch(h, e => {
      const hr = new Date(e.consultedAt).getHours();
      return hr < 5;
    }, 1),
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    desc: 'Consulted before 7am',
    icon: 'weather-sunset-up',
    evaluate: h => nthMatch(h, e => new Date(e.consultedAt).getHours() < 7, 1),
  },
  {
    id: 'dawn_patrol',
    title: 'Dawn Patrol',
    desc: '3 consults before 8am',
    icon: 'weather-sunset',
    evaluate: h => nthMatch(h, e => new Date(e.consultedAt).getHours() < 8, 3),
  },
  {
    id: 'lunchtime_oracle',
    title: 'Lunchtime Oracle',
    desc: 'Consulted between 12pm and 1pm',
    icon: 'clock-time-twelve-outline',
    evaluate: h => nthMatch(h, e => {
      const hr = new Date(e.consultedAt).getHours();
      return hr === 12;
    }, 1),
  },
  {
    id: 'golden_hour',
    title: 'Golden Hour',
    desc: 'Consulted between 6pm and 8pm',
    icon: 'weather-sunset-down',
    evaluate: h => nthMatch(h, e => {
      const hr = new Date(e.consultedAt).getHours();
      return hr >= 18 && hr < 20;
    }, 1),
  },
  {
    id: 'night_shift',
    title: 'The Night Shift',
    desc: '5 consults after 10pm',
    icon: 'moon-waning-crescent',
    evaluate: h => nthMatch(h, e => new Date(e.consultedAt).getHours() >= 22, 5),
  },

  // ══ DAY OF WEEK ══════════════════════════════════════════════════════════
  {
    id: 'monday_blues',
    title: 'Monday Oracle',
    desc: '5 Monday consults',
    icon: 'calendar-week',
    evaluate: h => nthMatch(h, e => new Date(e.consultedAt).getDay() === 1, 5),
  },
  {
    id: 'hump_day',
    title: 'Midweek Crisis',
    desc: '5 Wednesday consults',
    icon: 'calendar-week-begin',
    evaluate: h => nthMatch(h, e => new Date(e.consultedAt).getDay() === 3, 5),
  },
  {
    id: 'sunday_sartorialist',
    title: 'Sunday Sartorialist',
    desc: '5 Sunday consults',
    icon: 'calendar-weekend',
    evaluate: h => nthMatch(h, e => new Date(e.consultedAt).getDay() === 0, 5),
  },
  {
    id: 'weekend_devotee',
    title: 'Weekend Devotee',
    desc: '10 consults on a Saturday or Sunday',
    icon: 'calendar-weekend-outline',
    evaluate: h => nthMatch(h, e => {
      const day = new Date(e.consultedAt).getDay();
      return day === 0 || day === 6;
    }, 10),
  },

  // ══ CALENDAR EVENTS ══════════════════════════════════════════════════════
  {
    id: 'new_year_oracle',
    title: 'New Year Oracle',
    desc: 'Consulted on January 1st',
    icon: 'party-popper',
    evaluate: h => nthMatch(h, e => {
      const d = new Date(e.consultedAt);
      return d.getMonth() === 0 && d.getDate() === 1;
    }, 1),
  },
  {
    id: 'summer_solstice',
    title: 'Summer Solstice',
    desc: 'Consulted around June 21st',
    icon: 'white-balance-sunny',
    evaluate: h => nthMatch(h, e => {
      const d = new Date(e.consultedAt);
      return d.getMonth() === 5 && d.getDate() >= 19 && d.getDate() <= 23;
    }, 1),
  },
  {
    id: 'winter_solstice',
    title: 'Winter Solstice',
    desc: 'Consulted around December 21st',
    icon: 'snowflake',
    evaluate: h => nthMatch(h, e => {
      const d = new Date(e.consultedAt);
      return d.getMonth() === 11 && d.getDate() >= 19 && d.getDate() <= 23;
    }, 1),
  },
  {
    id: 'first_of_month',
    title: 'First of the Month',
    desc: 'Consulted on the 1st of a month, 3 times',
    icon: 'calendar-today',
    evaluate: h => nthMatch(h, e => new Date(e.consultedAt).getDate() === 1, 3),
  },

  // ══ CITIES & TRAVEL ══════════════════════════════════════════════════════
  {
    id: 'globetrotter',
    title: 'Globetrotter',
    desc: 'Consulted for 10 unique cities',
    icon: 'map-marker-multiple',
    evaluate: h => {
      const cities = new Set(h.map(e => e.city.toLowerCase()));
      return cities.size >= 10 ? h[0].consultedAt : false;
    },
  },
  {
    id: 'atlas',
    title: 'The Atlas',
    desc: 'Consulted for 25 unique cities',
    icon: 'map',
    evaluate: h => {
      const cities = new Set(h.map(e => e.city.toLowerCase()));
      return cities.size >= 25 ? h[0].consultedAt : false;
    },
  },
  {
    id: 'world_citizen',
    title: 'World Citizen',
    desc: 'Consulted from 5+ different countries',
    icon: 'earth',
    evaluate: h => {
      const countries = new Set(h.map(e => e.weather.country?.toLowerCase()).filter(Boolean));
      return countries.size >= 5 ? h[0].consultedAt : false;
    },
  },
  {
    id: 'ten_countries',
    title: 'Passport Stamped',
    desc: 'Consulted from 10+ different countries',
    icon: 'passport',
    evaluate: h => {
      const countries = new Set(h.map(e => e.weather.country?.toLowerCase()).filter(Boolean));
      return countries.size >= 10 ? h[0].consultedAt : false;
    },
  },
  {
    id: 'fashion_capital',
    title: 'Fashion Capital',
    desc: 'Consulted in Paris, Milan, New York, London, or Tokyo',
    icon: 'city-variant',
    evaluate: h => nthMatch(
      h,
      e => FASHION_CAPITALS.some(c => e.city.toLowerCase().includes(c)),
      1,
    ),
  },
  {
    id: 'fashion_capitals_all',
    title: 'The Grand Tour',
    desc: 'Consulted in all 5 fashion capitals',
    icon: 'crown',
    evaluate: h => {
      const cities = h.map(e => e.city.toLowerCase());
      if (FASHION_CAPITALS.every(c => cities.some(city => city.includes(c)))) {
        return h[0].consultedAt;
      }
      return false;
    },
  },
  {
    id: 'dual_city_day',
    title: 'Two Cities, One Day',
    desc: 'Consulted for 2 different cities on the same calendar day',
    icon: 'train',
    evaluate: h => {
      const byDay = new Map<string, Set<string>>();
      for (const e of h) {
        const day = new Date(e.consultedAt).toISOString().slice(0, 10);
        if (!byDay.has(day)) byDay.set(day, new Set());
        byDay.get(day)!.add(e.city.toLowerCase());
      }
      for (const [, cities] of byDay) {
        if (cities.size >= 2) return h[0].consultedAt;
      }
      return false;
    },
  },
  {
    id: 'homecoming',
    title: 'Homecoming',
    desc: 'Consulted for the same city 5 times',
    icon: 'home-heart',
    evaluate: h => {
      const counts = new Map<string, number>();
      for (const e of h) {
        const key = e.city.toLowerCase();
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
      const maxEntry = [...counts.entries()].find(([, v]) => v >= 5);
      return maxEntry ? h[0].consultedAt : false;
    },
  },
  {
    id: 'loyal_local',
    title: 'Loyal Local',
    desc: 'Consulted for the same city 10 times',
    icon: 'home-city',
    evaluate: h => {
      const counts = new Map<string, number>();
      for (const e of h) {
        const key = e.city.toLowerCase();
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
      const maxEntry = [...counts.entries()].find(([, v]) => v >= 10);
      return maxEntry ? h[0].consultedAt : false;
    },
  },

  // ══ OCCASIONS ════════════════════════════════════════════════════════════
  {
    id: 'working_it',
    title: 'Working It',
    desc: '5 Work occasion consults',
    icon: 'briefcase-outline',
    evaluate: h => nthMatch(h, e => e.occasion === 'Work', 5),
  },
  {
    id: 'date_oracle',
    title: 'Date Night Oracle',
    desc: '5 Date occasion consults',
    icon: 'heart-outline',
    evaluate: h => nthMatch(h, e => e.occasion === 'Date', 5),
  },
  {
    id: 'event_oracle',
    title: 'Event Horizon',
    desc: '5 Event occasion consults',
    icon: 'star-outline',
    evaluate: h => nthMatch(h, e => e.occasion === 'Event', 5),
  },
  {
    id: 'weekend_oracle',
    title: 'Weekend Warrior',
    desc: '5 Weekend occasion consults',
    icon: 'sofa-outline',
    evaluate: h => nthMatch(h, e => e.occasion === 'Weekend', 5),
  },
  {
    id: 'active_oracle',
    title: 'Keeps Active',
    desc: '5 Active occasion consults',
    icon: 'run',
    evaluate: h => nthMatch(h, e => e.occasion === 'Active', 5),
  },
  {
    id: 'occasion_curious',
    title: 'Occasion Curious',
    desc: 'Used 3 different occasions',
    icon: 'format-list-bulleted',
    evaluate: h => {
      const occasions = new Set(h.map(e => e.occasion).filter(Boolean));
      return occasions.size >= 3 ? h[0].consultedAt : false;
    },
  },
  {
    id: 'occasion_collector',
    title: 'Occasion Collector',
    desc: 'Used all 5 specific occasions (Work, Date, Event, Weekend, Active)',
    icon: 'format-list-checks',
    evaluate: h => {
      const occ = new Set(h.map(e => e.occasion));
      if (['Work', 'Date', 'Event', 'Weekend', 'Active'].every(o => occ.has(o))) {
        return h[0].consultedAt;
      }
      return false;
    },
  },

  // ══ GENDER ═══════════════════════════════════════════════════════════════
  {
    id: 'for_everyone',
    title: 'Dresses for Everyone',
    desc: 'Consulted for more than one gender',
    icon: 'gender-male-female',
    evaluate: h => {
      const genders = new Set(h.map(e => e.gender));
      return genders.size >= 2 ? h[0].consultedAt : false;
    },
  },

  // ══ SAVED LOOKS ══════════════════════════════════════════════════════════
  {
    id: 'first_save',
    title: 'First Love',
    desc: 'Saved your first outfit',
    icon: 'heart',
    evaluate: (_h, _f, ex) => ex.savedCount >= 1 ? Date.now() : false,
  },
  {
    id: 'wardrobe_growing',
    title: 'Wardrobe Growing',
    desc: '5 saved outfits',
    icon: 'hanger',
    evaluate: (_h, _f, ex) => ex.savedCount >= 5 ? Date.now() : false,
  },
  {
    id: 'collector',
    title: 'The Collector',
    desc: '20 saved outfits',
    icon: 'wardrobe-outline',
    evaluate: (_h, _f, ex) => ex.savedCount >= 20 ? Date.now() : false,
  },

  // ══ ANNIVERSARIES ════════════════════════════════════════════════════════
  {
    id: 'one_month',
    title: 'One Month In',
    desc: '30 days with the Oracle',
    icon: 'calendar-month-outline',
    evaluate: (_h, f) => sinceFirst(f, MONTH_MS),
  },
  {
    id: 'three_months',
    title: 'Three Months',
    desc: '90 days with the Oracle',
    icon: 'calendar-check-outline',
    evaluate: (_h, f) => sinceFirst(f, 3 * MONTH_MS),
  },
  {
    id: 'six_month',
    title: 'Six-Month Devotee',
    desc: '6 months with the Oracle',
    icon: 'calendar-check',
    evaluate: (_h, f) => sinceFirst(f, SIX_MONTH_MS),
  },
  {
    id: 'one_year',
    title: 'Year of the Oracle',
    desc: '1 full year with the Oracle',
    icon: 'crown',
    evaluate: (_h, f) => sinceFirst(f, YEAR_MS),
  },
  {
    id: 'two_years',
    title: 'Two Years Devoted',
    desc: '2 full years with the Oracle',
    icon: 'star-circle',
    evaluate: (_h, f) => sinceFirst(f, 2 * YEAR_MS),
  },
];

// ── Validation ────────────────────────────────────────────────────────────────

if (__DEV__ && BADGE_DEFS.length !== 100) {
  console.warn(`[Badges] Expected 100 badge definitions, found ${BADGE_DEFS.length}`);
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useWeatherBadges(
  history: HistoryEntry[],
  firstConsultAt: number | undefined,
  extras: BadgeExtras = { totalConsults: 0, streak: 0, savedCount: 0 },
): WeatherBadge[] {
  return useMemo(
    () =>
      BADGE_DEFS.map(def => {
        const result = def.evaluate(history, firstConsultAt, extras);
        return {
          id:       def.id,
          title:    def.title,
          desc:     def.desc,
          icon:     def.icon,
          earned:   result !== false,
          earnedAt: result !== false ? result : undefined,
        };
      }),
    [history, firstConsultAt, extras.totalConsults, extras.streak, extras.savedCount],
  );
}
