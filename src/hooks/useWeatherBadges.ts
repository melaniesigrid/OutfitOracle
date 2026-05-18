import { useMemo } from 'react';
import { HistoryEntry } from './useOutfitHistory';

export interface WeatherBadge {
  id: string;
  title: string;
  desc: string;
  icon: string;
  category: string;
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
  category: string;
  evaluate: Evaluator;
};

// ── Category display names ────────────────────────────────────────────────────

export const BADGE_CATEGORY_LABELS: Record<string, string> = {
  culture:     'FASHION MYTHOLOGY',
  first_steps: 'FIRST STEPS',
  streak:      'DEVOTION STREAKS',
  cold:        'COLD WEATHER',
  heat:        'HOT WEATHER',
  rain:        'RAIN & STORMS',
  snow:        'SNOWFALL',
  sunshine:    'SUNSHINE',
  atmosphere:  'ATMOSPHERE',
  timing:      'TIME OF DAY',
  calendar:    'CALENDAR',
  cities:      'CITIES & TRAVEL',
  occasions:   'OCCASIONS',
  collection:  'THE COLLECTION',
  anniversary: 'ANNIVERSARIES',
};

export const BADGE_CATEGORY_ORDER = [
  'culture', 'first_steps', 'streak', 'cold', 'heat',
  'rain', 'snow', 'sunshine', 'atmosphere', 'timing',
  'calendar', 'cities', 'occasions', 'collection', 'anniversary',
];

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

// ── Badge definitions ────────────────────────────────────────────────────────

const BADGE_DEFS: BadgeDef[] = [

  // ══ FASHION MYTHOLOGY (Pop Culture) ══════════════════════════════════════
  {
    id: 'miranda_directive',
    title: "Miranda's Directive",
    desc: 'Work verdict in the rain. The Oracle never cancels.',
    icon: 'briefcase-outline',
    category: 'culture',
    evaluate: h => nthMatch(h, e => e.occasion === 'Work' && isRainy(e.weather.conditionLabel), 1),
  },
  {
    id: 'emily_in_paris',
    title: 'Emily in Paris',
    desc: 'Consulted the Oracle for Paris.',
    icon: 'map-marker-outline',
    category: 'culture',
    evaluate: h => nthMatch(h, e => e.city.toLowerCase().includes('paris'), 1),
  },
  {
    id: 'carrie_bradshaw',
    title: 'The Carrie Bradshaw',
    desc: '10 saved looks. The closet has opinions.',
    icon: 'heart-multiple-outline',
    category: 'culture',
    evaluate: (_h, _f, ex) => ex.savedCount >= 10 ? Date.now() : false,
  },
  {
    id: 'holly_golightly',
    title: 'Holly Golightly',
    desc: 'Night consult in New York. Breakfast optional.',
    icon: 'city-variant-outline',
    category: 'culture',
    evaluate: h => nthMatch(h, e => {
      const hr = new Date(e.consultedAt).getHours();
      return e.city.toLowerCase().includes('new york') && (hr >= 20 || hr < 5);
    }, 1),
  },
  {
    id: 'la_dolce_vita',
    title: 'La Dolce Vita',
    desc: 'Consulted for Rome. Fashion is a religion here.',
    icon: 'bank-outline',
    category: 'culture',
    evaluate: h => nthMatch(h, e => e.city.toLowerCase().includes('rome'), 1),
  },
  {
    id: 'winter_is_coming',
    title: 'Winter is Coming',
    desc: 'Snow forecast AND below −5°C. The Oracle layers accordingly.',
    icon: 'sword-cross',
    category: 'culture',
    evaluate: h => nthMatch(h, e => isSnow(e.weather.conditionLabel) && e.weather.temp <= -5, 1),
  },
  {
    id: 'euphoria_hour',
    title: 'Euphoria Hour',
    desc: 'Consulting after 10pm. The night has opinions.',
    icon: 'moon-waning-crescent',
    category: 'culture',
    evaluate: h => nthMatch(h, e => {
      const hr = new Date(e.consultedAt).getHours();
      return hr >= 22 || hr < 3;
    }, 1),
  },
  {
    id: 'succession_dressing',
    title: 'Succession Dressing',
    desc: '10 Work looks. Power dressing is a strategy.',
    icon: 'account-tie-outline',
    category: 'culture',
    evaluate: h => nthMatch(h, e => e.occasion === 'Work', 10),
  },
  {
    id: 'blackpink_seoul',
    title: 'BLACKPINK in Your Area',
    desc: 'Consulted the Oracle for Seoul.',
    icon: 'music-note',
    category: 'culture',
    evaluate: h => nthMatch(h, e => e.city.toLowerCase().includes('seoul'), 1),
  },
  {
    id: 'amelie_paris',
    title: "Amélie's Montmartre",
    desc: 'Paris before 9am. The Oracle rises early.',
    icon: 'coffee-outline',
    category: 'culture',
    evaluate: h => nthMatch(h, e => {
      const hr = new Date(e.consultedAt).getHours();
      return e.city.toLowerCase().includes('paris') && hr < 9;
    }, 1),
  },
  {
    id: 'september_issue',
    title: 'The September Issue',
    desc: 'Consulted in September. The most important month.',
    icon: 'calendar-star',
    category: 'culture',
    evaluate: h => nthMatch(h, e => new Date(e.consultedAt).getMonth() === 8, 1),
  },
  {
    id: 'copenhagen_cool',
    title: 'Copenhagen Cool',
    desc: 'Consulted for Copenhagen. Scandi minimalism approved.',
    icon: 'snowflake',
    category: 'culture',
    evaluate: h => nthMatch(h, e => e.city.toLowerCase().includes('copenhagen'), 1),
  },
  {
    id: 'tokyo_drift',
    title: 'Tokyo Drift',
    desc: 'Consulted for Tokyo. Street style capital of the world.',
    icon: 'city',
    category: 'culture',
    evaluate: h => nthMatch(h, e => e.city.toLowerCase().includes('tokyo'), 1),
  },
  {
    id: 'vivienne_domain',
    title: "Vivienne's Domain",
    desc: 'London, 3 times. Punk never died.',
    icon: 'crown-outline',
    category: 'culture',
    evaluate: h => {
      const london = h.filter(e => e.city.toLowerCase().includes('london'));
      return london.length >= 3 ? london[2].consultedAt : false;
    },
  },
  {
    id: 'haileys_era',
    title: "Hailey's Era",
    desc: '30 saved looks. An archive in progress.',
    icon: 'bookmark-multiple-outline',
    category: 'culture',
    evaluate: (_h, _f, ex) => ex.savedCount >= 30 ? Date.now() : false,
  },
  {
    id: 'blue_steel',
    title: 'Blue Steel',
    desc: 'Work verdict during a thunderstorm. Unmovable.',
    icon: 'lightning-bolt',
    category: 'culture',
    evaluate: h => nthMatch(h, e => e.occasion === 'Work' && isStorm(e.weather.conditionLabel), 1),
  },
  {
    id: 'bridgerton_season',
    title: 'Bridgerton Season',
    desc: 'London consult in spring. The season begins.',
    icon: 'flower-outline',
    category: 'culture',
    evaluate: h => nthMatch(h, e => {
      const month = new Date(e.consultedAt).getMonth();
      return e.city.toLowerCase().includes('london') && month >= 2 && month <= 4;
    }, 1),
  },
  {
    id: 'matrix_midnight',
    title: 'The Matrix',
    desc: 'Consulted at midnight. Follow the white rabbit.',
    icon: 'eye',
    category: 'culture',
    evaluate: h => nthMatch(h, e => new Date(e.consultedAt).getHours() === 0, 1),
  },
  {
    id: 'sex_and_city',
    title: 'Sex and the City',
    desc: '5 New York consults. The borough has opinions.',
    icon: 'city-variant',
    category: 'culture',
    evaluate: h => {
      const ny = h.filter(e => e.city.toLowerCase().includes('new york'));
      return ny.length >= 5 ? ny[4].consultedAt : false;
    },
  },
  {
    id: 'cerulean_moment',
    title: 'The Cerulean Moment',
    desc: '10 consults across all fashion capitals. The Oracle has seen the runway.',
    icon: 'earth',
    category: 'culture',
    evaluate: h => {
      const capitalConsults = h.filter(e =>
        FASHION_CAPITALS.some(c => e.city.toLowerCase().includes(c)),
      );
      return capitalConsults.length >= 10 ? capitalConsults[9].consultedAt : false;
    },
  },
  {
    id: 'mary_poppins',
    title: 'Mary Poppins',
    desc: 'Rain + wind ≥ 50 km/h. Practically perfect in every way.',
    icon: 'umbrella',
    category: 'culture',
    evaluate: h => nthMatch(h, e => isRainy(e.weather.conditionLabel) && e.weather.windSpeed >= 50, 1),
  },
  {
    id: 'andrea_journey',
    title: "Andrea's Journey",
    desc: 'Consulted for Milan, Paris, and New York.',
    icon: 'airplane',
    category: 'culture',
    evaluate: h => {
      const cities = h.map(e => e.city.toLowerCase());
      const done = ['milan', 'paris', 'new york'].every(c => cities.some(city => city.includes(c)));
      return done ? h[0].consultedAt : false;
    },
  },
  {
    id: 'gossip_girl',
    title: 'Gossip Girl',
    desc: '10 New York consults. XOXO.',
    icon: 'comment-text-outline',
    category: 'culture',
    evaluate: h => {
      const ny = h.filter(e => e.city.toLowerCase().includes('new york'));
      return ny.length >= 10 ? ny[9].consultedAt : false;
    },
  },
  {
    id: 'project_runway',
    title: 'Project Runway',
    desc: 'Consulted for 7 different cities.',
    icon: 'scissors-cutting',
    category: 'culture',
    evaluate: h => {
      const cities = new Set(h.map(e => e.city.toLowerCase()));
      return cities.size >= 7 ? h[0].consultedAt : false;
    },
  },
  {
    id: 'devil_prada_devotee',
    title: 'The Devil Wore This',
    desc: '20 Work occasion consults. The Oracle approves.',
    icon: 'briefcase',
    category: 'culture',
    evaluate: h => nthMatch(h, e => e.occasion === 'Work', 20),
  },
  {
    id: 'anna_karenina',
    title: 'Anna Karenina',
    desc: 'Snow consult in Moscow, St. Petersburg, or Warsaw.',
    icon: 'train',
    category: 'culture',
    evaluate: h => nthMatch(h, e => {
      const c = e.city.toLowerCase();
      return isSnow(e.weather.conditionLabel) &&
        (c.includes('moscow') || c.includes('petersburg') || c.includes('warsaw'));
    }, 1),
  },
  {
    id: 'cher_horowitz',
    title: 'As If',
    desc: '20 consults with Any occasion. Whatever, I do what I want.',
    icon: 'help-circle-outline',
    category: 'culture',
    evaluate: h => nthMatch(h, e => !e.occasion || e.occasion === 'Any', 20),
  },

  // ══ FIRST STEPS ══════════════════════════════════════════════════════════
  {
    id: 'oracle_awakens',
    title: 'The Oracle Awakens',
    desc: 'Your very first consult',
    icon: 'eye-outline',
    category: 'first_steps',
    evaluate: (_h, _f, ex) => ex.totalConsults >= 1 ? Date.now() : false,
  },
  {
    id: 'five_consults',
    title: 'Five and Counting',
    desc: '5 total consults',
    icon: 'numeric-5-circle-outline',
    category: 'first_steps',
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
    category: 'first_steps',
    evaluate: (h, _f, ex) => ex.totalConsults >= 10 ? (h[0]?.consultedAt ?? Date.now()) : false,
  },
  {
    id: 'quarter_century',
    title: 'Quarter Century',
    desc: '25 total consults',
    icon: 'medal-outline',
    category: 'first_steps',
    evaluate: (h, _f, ex) => ex.totalConsults >= 25 ? (h[0]?.consultedAt ?? Date.now()) : false,
  },
  {
    id: 'half_century',
    title: 'Half Century',
    desc: '50 total consults',
    icon: 'trophy-outline',
    category: 'first_steps',
    evaluate: (h, _f, ex) => ex.totalConsults >= 50 ? (h[0]?.consultedAt ?? Date.now()) : false,
  },
  {
    id: 'centurion',
    title: 'The Centurion',
    desc: '100 total consults',
    icon: 'crown-outline',
    category: 'first_steps',
    evaluate: (h, _f, ex) => ex.totalConsults >= 100 ? (h[0]?.consultedAt ?? Date.now()) : false,
  },
  {
    id: 'two_hundred',
    title: 'Two Hundred',
    desc: '200 total consults',
    icon: 'star-four-points',
    category: 'first_steps',
    evaluate: (h, _f, ex) => ex.totalConsults >= 200 ? (h[0]?.consultedAt ?? Date.now()) : false,
  },
  {
    id: 'five_hundred',
    title: 'Five Hundred',
    desc: '500 total consults — truly devoted',
    icon: 'infinity',
    category: 'first_steps',
    evaluate: (h, _f, ex) => ex.totalConsults >= 500 ? (h[0]?.consultedAt ?? Date.now()) : false,
  },

  // ══ STREAKS ══════════════════════════════════════════════════════════════
  {
    id: 'streak_3',
    title: 'Three Days Running',
    desc: '3-day consult streak',
    icon: 'fire',
    category: 'streak',
    evaluate: (_h, _f, ex) => ex.streak >= 3 ? Date.now() : false,
  },
  {
    id: 'streak_7',
    title: 'Week of Devotion',
    desc: '7-day consult streak',
    icon: 'fire',
    category: 'streak',
    evaluate: (_h, _f, ex) => ex.streak >= 7 ? Date.now() : false,
  },
  {
    id: 'streak_14',
    title: 'Fortnight',
    desc: '14-day consult streak',
    icon: 'lightning-bolt',
    category: 'streak',
    evaluate: (_h, _f, ex) => ex.streak >= 14 ? Date.now() : false,
  },
  {
    id: 'streak_30',
    title: 'Monthly Devotee',
    desc: '30-day consult streak',
    icon: 'lightning-bolt-outline',
    category: 'streak',
    evaluate: (_h, _f, ex) => ex.streak >= 30 ? Date.now() : false,
  },
  {
    id: 'streak_50',
    title: 'The Fifty',
    desc: '50-day consult streak',
    icon: 'flash',
    category: 'streak',
    evaluate: (_h, _f, ex) => ex.streak >= 50 ? Date.now() : false,
  },
  {
    id: 'streak_100',
    title: 'Century Streak',
    desc: '100-day consult streak',
    icon: 'lightning-bolt-circle',
    category: 'streak',
    evaluate: (_h, _f, ex) => ex.streak >= 100 ? Date.now() : false,
  },
  {
    id: 'streak_365',
    title: 'Year of Devotion',
    desc: '365-day consult streak',
    icon: 'star-circle',
    category: 'streak',
    evaluate: (_h, _f, ex) => ex.streak >= 365 ? Date.now() : false,
  },

  // ══ COLD TEMPERATURES ════════════════════════════════════════════════════
  {
    id: 'deep_freeze',
    title: 'Deep Freeze',
    desc: 'Consulted at 0°C or below',
    icon: 'snowflake-alert',
    category: 'cold',
    evaluate: h => nthMatch(h, e => e.weather.temp <= 0, 1),
  },
  {
    id: 'subzero_chic',
    title: 'Sub-Zero Chic',
    desc: 'Consulted at −5°C or below',
    icon: 'snowflake-variant',
    category: 'cold',
    evaluate: h => nthMatch(h, e => e.weather.temp <= -5, 1),
  },
  {
    id: 'blizzard_chic',
    title: 'Blizzard Chic',
    desc: 'Consulted when temp ≤ −10°C',
    icon: 'snowflake',
    category: 'cold',
    evaluate: h => nthMatch(h, e => e.weather.temp <= -10, 1),
  },
  {
    id: 'polar_explorer',
    title: 'Polar Explorer',
    desc: 'Feels like −20°C or below',
    icon: 'thermometer-minus',
    category: 'cold',
    evaluate: h => nthMatch(h, e => (e.weather.feelsLike ?? e.weather.temp) <= -20, 1),
  },
  {
    id: 'cold_devotee',
    title: 'Cold Devotee',
    desc: '5 consults at 5°C or below',
    icon: 'weather-snowy-heavy',
    category: 'cold',
    evaluate: h => nthMatch(h, e => e.weather.temp <= 5, 5),
  },
  {
    id: 'wind_chill',
    title: 'Wind Chill',
    desc: 'Feels like −15°C or colder',
    icon: 'weather-windy-variant',
    category: 'cold',
    evaluate: h => nthMatch(h, e => (e.weather.feelsLike ?? e.weather.temp) <= -15, 1),
  },

  // ══ HOT TEMPERATURES ═════════════════════════════════════════════════════
  {
    id: 'warm_welcome',
    title: 'Warm Welcome',
    desc: 'Consulted at 25°C or above',
    icon: 'white-balance-sunny',
    category: 'heat',
    evaluate: h => nthMatch(h, e => e.weather.temp >= 25, 1),
  },
  {
    id: 'heatwave_hero',
    title: 'Heatwave Hero',
    desc: 'Consulted at 35°C or above',
    icon: 'weather-sunny-alert',
    category: 'heat',
    evaluate: h => nthMatch(h, e => e.weather.temp >= 35, 1),
  },
  {
    id: 'desert_muse',
    title: 'Desert Muse',
    desc: 'Consulted at 38°C or above',
    icon: 'weather-sunny-alert',
    category: 'heat',
    evaluate: h => nthMatch(h, e => e.weather.temp >= 38, 1),
  },
  {
    id: 'scorched',
    title: 'Scorched',
    desc: 'Consulted at 40°C or above — the Oracle sweats',
    icon: 'fire-circle',
    category: 'heat',
    evaluate: h => nthMatch(h, e => e.weather.temp >= 40, 1),
  },
  {
    id: 'heat_devotee',
    title: 'Heat Devotee',
    desc: '5 consults at 30°C or above',
    icon: 'thermometer-plus',
    category: 'heat',
    evaluate: h => nthMatch(h, e => e.weather.temp >= 30, 5),
  },
  {
    id: 'heat_index',
    title: 'Heat Index',
    desc: 'Feels like 42°C or above',
    icon: 'sun-thermometer',
    category: 'heat',
    evaluate: h => nthMatch(h, e => (e.weather.feelsLike ?? e.weather.temp) >= 42, 1),
  },
  {
    id: 'goldilocks',
    title: 'The Goldilocks Zone',
    desc: 'Consulted on a perfect 20–24°C clear day',
    icon: 'weather-sunny',
    category: 'heat',
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
    category: 'heat',
    evaluate: h => nthMatch(h, e => (e.weather.temp - (e.weather.feelsLike ?? e.weather.temp)) >= 10, 1),
  },

  // ══ RAIN ═════════════════════════════════════════════════════════════════
  {
    id: 'first_rain',
    title: 'April Showers',
    desc: 'First rainy-day consult',
    icon: 'weather-rainy',
    category: 'rain',
    evaluate: h => nthMatch(h, e => isRainy(e.weather.conditionLabel), 1),
  },
  {
    id: 'puddle_jumper',
    title: 'Puddle Jumper',
    desc: '5 rainy-day consults',
    icon: 'umbrella',
    category: 'rain',
    evaluate: h => nthMatch(h, e => isRainy(e.weather.conditionLabel), 5),
  },
  {
    id: 'rain_oracle',
    title: 'Rain Oracle',
    desc: '10 rainy-day consults',
    icon: 'weather-rainy',
    category: 'rain',
    evaluate: h => nthMatch(h, e => isRainy(e.weather.conditionLabel), 10),
  },
  {
    id: 'storm_season',
    title: 'Storm Season',
    desc: '25 rainy-day consults',
    icon: 'weather-pouring',
    category: 'rain',
    evaluate: h => nthMatch(h, e => isRainy(e.weather.conditionLabel), 25),
  },
  {
    id: 'rain_dancer',
    title: 'Rain Dancer',
    desc: '3 consecutive rainy days',
    icon: 'weather-pouring',
    category: 'rain',
    evaluate: h => consecutiveDayStreak(h, e => isRainy(e.weather.conditionLabel), 3),
  },
  {
    id: 'monsoon_week',
    title: 'Monsoon Week',
    desc: '7 consecutive rainy days',
    icon: 'weather-hurricane',
    category: 'rain',
    evaluate: h => consecutiveDayStreak(h, e => isRainy(e.weather.conditionLabel), 7),
  },
  {
    id: 'storm_chaser',
    title: 'Storm Chaser',
    desc: 'Consulted during a thunderstorm',
    icon: 'weather-lightning-rainy',
    category: 'rain',
    evaluate: h => nthMatch(h, e => isStorm(e.weather.conditionLabel), 1),
  },
  {
    id: 'thunder_devotee',
    title: 'Thunder Devotee',
    desc: '3 thunderstorm consults',
    icon: 'weather-lightning',
    category: 'rain',
    evaluate: h => nthMatch(h, e => isStorm(e.weather.conditionLabel), 3),
  },

  // ══ SNOW ═════════════════════════════════════════════════════════════════
  {
    id: 'snow_day',
    title: 'Snow Day',
    desc: 'First consult during snowfall',
    icon: 'weather-snowy',
    category: 'snow',
    evaluate: h => nthMatch(h, e => isSnow(e.weather.conditionLabel), 1),
  },
  {
    id: 'white_winter',
    title: 'White Winter',
    desc: '5 consults during snowfall',
    icon: 'snowflake',
    category: 'snow',
    evaluate: h => nthMatch(h, e => isSnow(e.weather.conditionLabel), 5),
  },
  {
    id: 'snow_devotee',
    title: 'Snow Devotee',
    desc: '10 consults during snowfall',
    icon: 'weather-snowy-heavy',
    category: 'snow',
    evaluate: h => nthMatch(h, e => isSnow(e.weather.conditionLabel), 10),
  },
  {
    id: 'blizzard_week',
    title: 'Blizzard Week',
    desc: '3 consecutive snowy days',
    icon: 'weather-snowy-rainy',
    category: 'snow',
    evaluate: h => consecutiveDayStreak(h, e => isSnow(e.weather.conditionLabel), 3),
  },
  {
    id: 'snow_globe',
    title: 'Snow Globe',
    desc: 'Consulted during snowfall in 3 different cities',
    icon: 'image-filter-hdr',
    category: 'snow',
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
    category: 'sunshine',
    evaluate: h => nthMatch(h, e => isClear(e.weather.conditionLabel), 1),
  },
  {
    id: 'sunny_disposition',
    title: 'Sunny Disposition',
    desc: '5 clear-sky consults',
    icon: 'white-balance-sunny',
    category: 'sunshine',
    evaluate: h => nthMatch(h, e => isClear(e.weather.conditionLabel), 5),
  },
  {
    id: 'sun_devotee',
    title: 'The Sun Devotee',
    desc: '20 clear-sky consults',
    icon: 'weather-sunny',
    category: 'sunshine',
    evaluate: h => nthMatch(h, e => isClear(e.weather.conditionLabel), 20),
  },
  {
    id: 'golden_summer',
    title: 'Golden Summer',
    desc: '30 clear-sky consults',
    icon: 'sun-compass',
    category: 'sunshine',
    evaluate: h => nthMatch(h, e => isClear(e.weather.conditionLabel), 30),
  },
  {
    id: 'sunshine_streak',
    title: 'Sunshine Streak',
    desc: '3 consecutive clear-sky days',
    icon: 'weather-partly-cloudy',
    category: 'sunshine',
    evaluate: h => consecutiveDayStreak(h, e => isClear(e.weather.conditionLabel), 3),
  },
  {
    id: 'solar_week',
    title: 'Solar Week',
    desc: '7 consecutive clear-sky days',
    icon: 'weather-sunny',
    category: 'sunshine',
    evaluate: h => consecutiveDayStreak(h, e => isClear(e.weather.conditionLabel), 7),
  },
  {
    id: 'solar_oracle',
    title: 'Solar Oracle',
    desc: 'Consulted with UV index ≥ 8',
    icon: 'white-balance-sunny',
    category: 'sunshine',
    evaluate: h => nthMatch(h, e => (e.weather.uvIndex ?? 0) >= 8, 1),
  },
  {
    id: 'extreme_uv',
    title: 'Extreme UV',
    desc: 'Consulted with UV index ≥ 11',
    icon: 'sun-wireless',
    category: 'sunshine',
    evaluate: h => nthMatch(h, e => (e.weather.uvIndex ?? 0) >= 11, 1),
  },

  // ══ WIND ═════════════════════════════════════════════════════════════════
  {
    id: 'windy_oracle',
    title: 'Windy Oracle',
    desc: 'Consulted with wind ≥ 40 km/h',
    icon: 'weather-windy',
    category: 'atmosphere',
    evaluate: h => nthMatch(h, e => e.weather.windSpeed >= 40, 1),
  },
  {
    id: 'gale_force',
    title: 'Gale Force',
    desc: 'Consulted with wind ≥ 60 km/h',
    icon: 'weather-windy-variant',
    category: 'atmosphere',
    evaluate: h => nthMatch(h, e => e.weather.windSpeed >= 60, 1),
  },
  {
    id: 'hurricane_adjacent',
    title: 'Hurricane Adjacent',
    desc: 'Consulted with wind ≥ 80 km/h',
    icon: 'weather-hurricane',
    category: 'atmosphere',
    evaluate: h => nthMatch(h, e => e.weather.windSpeed >= 80, 1),
  },
  {
    id: 'swamp_chic',
    title: 'Swamp Chic',
    desc: 'Consulted with humidity ≥ 90%',
    icon: 'water-percent',
    category: 'atmosphere',
    evaluate: h => nthMatch(h, e => e.weather.humidity >= 90, 1),
  },
  {
    id: 'desert_dry',
    title: 'Desert Dry',
    desc: 'Consulted with humidity ≤ 20%',
    icon: 'water-off-outline',
    category: 'atmosphere',
    evaluate: h => nthMatch(h, e => e.weather.humidity <= 20, 1),
  },
  {
    id: 'tropical_hell',
    title: 'Tropical Hell',
    desc: 'Temp ≥ 35°C and humidity ≥ 80% simultaneously',
    icon: 'palm-tree',
    category: 'atmosphere',
    evaluate: h => nthMatch(h, e => e.weather.temp >= 35 && e.weather.humidity >= 80, 1),
  },
  {
    id: 'fog_oracle',
    title: 'Fog Oracle',
    desc: 'Consulted in fog, mist, or haze',
    icon: 'weather-fog',
    category: 'atmosphere',
    evaluate: h => nthMatch(h, e => isFoggy(e.weather.conditionLabel), 1),
  },
  {
    id: 'cloud_watcher',
    title: 'Cloud Watcher',
    desc: '10 cloudy or overcast consults',
    icon: 'weather-cloudy',
    category: 'atmosphere',
    evaluate: h => nthMatch(h, e => isCloud(e.weather.conditionLabel), 10),
  },
  {
    id: 'four_seasons',
    title: 'Four Seasons',
    desc: 'Consulted in rain, sun, snow, and a storm',
    icon: 'weather-partly-cloudy',
    category: 'atmosphere',
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
    category: 'atmosphere',
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
    category: 'atmosphere',
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
    category: 'timing',
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
    category: 'timing',
    evaluate: h => nthMatch(h, e => new Date(e.consultedAt).getHours() < 7, 1),
  },
  {
    id: 'dawn_patrol',
    title: 'Dawn Patrol',
    desc: '3 consults before 8am',
    icon: 'weather-sunset',
    category: 'timing',
    evaluate: h => nthMatch(h, e => new Date(e.consultedAt).getHours() < 8, 3),
  },
  {
    id: 'lunchtime_oracle',
    title: 'Lunchtime Oracle',
    desc: 'Consulted between 12pm and 1pm',
    icon: 'clock-time-twelve-outline',
    category: 'timing',
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
    category: 'timing',
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
    category: 'timing',
    evaluate: h => nthMatch(h, e => new Date(e.consultedAt).getHours() >= 22, 5),
  },

  // ══ CALENDAR ═════════════════════════════════════════════════════════════
  {
    id: 'monday_blues',
    title: 'Monday Oracle',
    desc: '5 Monday consults',
    icon: 'calendar-week',
    category: 'calendar',
    evaluate: h => nthMatch(h, e => new Date(e.consultedAt).getDay() === 1, 5),
  },
  {
    id: 'hump_day',
    title: 'Midweek Crisis',
    desc: '5 Wednesday consults',
    icon: 'calendar-week-begin',
    category: 'calendar',
    evaluate: h => nthMatch(h, e => new Date(e.consultedAt).getDay() === 3, 5),
  },
  {
    id: 'sunday_sartorialist',
    title: 'Sunday Sartorialist',
    desc: '5 Sunday consults',
    icon: 'calendar-weekend',
    category: 'calendar',
    evaluate: h => nthMatch(h, e => new Date(e.consultedAt).getDay() === 0, 5),
  },
  {
    id: 'weekend_devotee',
    title: 'Weekend Devotee',
    desc: '10 consults on a Saturday or Sunday',
    icon: 'calendar-weekend-outline',
    category: 'calendar',
    evaluate: h => nthMatch(h, e => {
      const day = new Date(e.consultedAt).getDay();
      return day === 0 || day === 6;
    }, 10),
  },
  {
    id: 'new_year_oracle',
    title: 'New Year Oracle',
    desc: 'Consulted on January 1st',
    icon: 'party-popper',
    category: 'calendar',
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
    category: 'calendar',
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
    category: 'calendar',
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
    category: 'calendar',
    evaluate: h => nthMatch(h, e => new Date(e.consultedAt).getDate() === 1, 3),
  },

    {
    id: 'oracle_apprentice',
    title: 'Oracle Apprentice',
    desc: '15 total consults. The visions are becoming clearer.',
    icon: 'crystal-ball',
    category: 'first_steps',
    evaluate: (h, _f, ex) => ex.totalConsults >= 15 ? (h[0]?.consultedAt ?? Date.now()) : false,
  },
  {
    id: 'oracle_regular',
    title: 'Oracle Regular',
    desc: '75 total consults. At this point, it knows your closet.',
    icon: 'eye-check-outline',
    category: 'first_steps',
    evaluate: (h, _f, ex) => ex.totalConsults >= 75 ? (h[0]?.consultedAt ?? Date.now()) : false,
  },
  {
    id: 'cult_following',
    title: 'Cult Following',
    desc: '300 total consults. The Oracle has become a lifestyle.',
    icon: 'account-group-outline',
    category: 'first_steps',
    evaluate: (h, _f, ex) => ex.totalConsults >= 300 ? (h[0]?.consultedAt ?? Date.now()) : false,
  },
  {
    id: 'thousand_verdicts',
    title: 'A Thousand Verdicts',
    desc: '1,000 total consults. The Oracle is no longer optional.',
    icon: 'all-inclusive',
    category: 'first_steps',
    evaluate: (h, _f, ex) => ex.totalConsults >= 1000 ? (h[0]?.consultedAt ?? Date.now()) : false,
  },

  {
    id: 'workweek_warrior',
    title: 'Workweek Warrior',
    desc: 'Consulted Monday through Friday in the same week.',
    icon: 'calendar-range',
    category: 'calendar',
    evaluate: h => {
      const weeks = new Map<string, Set<number>>();

      for (const e of h) {
        const d = new Date(e.consultedAt);
        const day = d.getDay();
        if (day < 1 || day > 5) continue;

        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - ((day + 6) % 7));
        const key = weekStart.toISOString().slice(0, 10);

        if (!weeks.has(key)) weeks.set(key, new Set());
        weeks.get(key)!.add(day);
      }

      for (const [, days] of weeks) {
        if ([1, 2, 3, 4, 5].every(day => days.has(day))) {
          return h[0]?.consultedAt ?? Date.now();
        }
      }

      return false;
    },
  },
  {
    id: 'friday_finale',
    title: 'Friday Finale',
    desc: '5 Friday consults. The weekend outfit discourse begins.',
    icon: 'calendar-heart',
    category: 'calendar',
    evaluate: h => nthMatch(h, e => new Date(e.consultedAt).getDay() === 5, 5),
  },
  {
    id: 'midnight_muse',
    title: 'Midnight Muse',
    desc: '3 consults exactly at midnight. Dramatic, but correct.',
    icon: 'clock-time-twelve',
    category: 'timing',
    evaluate: h => nthMatch(h, e => new Date(e.consultedAt).getHours() === 0, 3),
  },
  {
    id: 'breakfast_verdict',
    title: 'Breakfast Verdict',
    desc: '5 consults before 9am. The outfit is decided before coffee.',
    icon: 'coffee',
    category: 'timing',
    evaluate: h => nthMatch(h, e => new Date(e.consultedAt).getHours() < 9, 5),
  },
  {
    id: 'after_dark_archive',
    title: 'After-Dark Archive',
    desc: '10 consults after 8pm. Night styling has a paper trail.',
    icon: 'weather-night',
    category: 'timing',
    evaluate: h => nthMatch(h, e => new Date(e.consultedAt).getHours() >= 20, 10),
  },

  {
    id: 'temperature_swing',
    title: 'Temperature Swing',
    desc: 'Consulted at both 30°C+ and 0°C or below.',
    icon: 'thermometer-chevron-up',
    category: 'atmosphere',
    evaluate: h => {
      const hasHot = h.some(e => e.weather.temp >= 30);
      const hasCold = h.some(e => e.weather.temp <= 0);
      return hasHot && hasCold ? (h[0]?.consultedAt ?? Date.now()) : false;
    },
  },
  {
    id: 'climate_chameleon',
    title: 'Climate Chameleon',
    desc: 'Consulted in heat, cold, rain, snow, and clear skies.',
    icon: 'weather-partly-snowy-rainy',
    category: 'atmosphere',
    evaluate: h => {
      const hasHeat = h.some(e => e.weather.temp >= 30);
      const hasCold = h.some(e => e.weather.temp <= 0);
      const hasRain = h.some(e => isRainy(e.weather.conditionLabel));
      const hasSnow = h.some(e => isSnow(e.weather.conditionLabel));
      const hasClear = h.some(e => isClear(e.weather.conditionLabel));

      return hasHeat && hasCold && hasRain && hasSnow && hasClear
        ? (h[0]?.consultedAt ?? Date.now())
        : false;
    },
  },
  {
    id: 'cloudy_with_opinions',
    title: 'Cloudy With Opinions',
    desc: 'First cloudy or overcast consult. The sky is undecided.',
    icon: 'weather-cloudy',
    category: 'atmosphere',
    evaluate: h => nthMatch(h, e => isCloud(e.weather.conditionLabel), 1),
  },
  {
    id: 'gray_area',
    title: 'The Gray Area',
    desc: '25 cloudy or overcast consults. Minimalism wins.',
    icon: 'cloud-outline',
    category: 'atmosphere',
    evaluate: h => nthMatch(h, e => isCloud(e.weather.conditionLabel), 25),
  },
  {
    id: 'humidity_humbled',
    title: 'Humidity Humbled',
    desc: '5 consults with humidity ≥ 85%. The fabric must breathe.',
    icon: 'water-percent-alert',
    category: 'atmosphere',
    evaluate: h => nthMatch(h, e => e.weather.humidity >= 85, 5),
  },
  {
    id: 'windproof_wardrobe',
    title: 'Windproof Wardrobe',
    desc: '5 consults with wind ≥ 40 km/h.',
    icon: 'weather-windy',
    category: 'atmosphere',
    evaluate: h => nthMatch(h, e => e.weather.windSpeed >= 40, 5),
  },

  {
    id: 'soft_launch_summer',
    title: 'Soft Launch Summer',
    desc: '5 consults at 28°C or above with clear skies.',
    icon: 'sun-snowflake',
    category: 'heat',
    evaluate: h => nthMatch(h, e => e.weather.temp >= 28 && isClear(e.weather.conditionLabel), 5),
  },
  {
    id: 'city_heat',
    title: 'City Heat',
    desc: 'Hot consult in New York, Paris, London, Milan, or Tokyo.',
    icon: 'city-variant-outline',
    category: 'heat',
    evaluate: h => nthMatch(
      h,
      e => e.weather.temp >= 30 &&
        FASHION_CAPITALS.some(c => e.city.toLowerCase().includes(c)),
      1,
    ),
  },
  {
    id: 'linen_emergency',
    title: 'Linen Emergency',
    desc: 'Feels like 35°C or above with humidity ≥ 70%.',
    icon: 'hanger',
    category: 'heat',
    evaluate: h => nthMatch(
      h,
      e => (e.weather.feelsLike ?? e.weather.temp) >= 35 && e.weather.humidity >= 70,
      1,
    ),
  },

  {
    id: 'coat_check',
    title: 'Coat Check',
    desc: '5 consults at 0°C or below.',
    icon: 'coat-rack',
    category: 'cold',
    evaluate: h => nthMatch(h, e => e.weather.temp <= 0, 5),
  },
  {
    id: 'frostbite_but_make_it_fashion',
    title: 'Frostbite, But Make It Fashion',
    desc: 'Consulted when it feels like −25°C or colder.',
    icon: 'snowflake-alert',
    category: 'cold',
    evaluate: h => nthMatch(h, e => (e.weather.feelsLike ?? e.weather.temp) <= -25, 1),
  },
  {
    id: 'arctic_archive',
    title: 'Arctic Archive',
    desc: '10 consults at −5°C or below.',
    icon: 'snowflake-alert',
    category: 'cold',
    evaluate: h => nthMatch(h, e => e.weather.temp <= -5, 10),
  },

  {
    id: 'umbrella_optional',
    title: 'Umbrella Optional',
    desc: 'Rain consult with wind under 10 km/h. Manageable drama.',
    icon: 'umbrella-outline',
    category: 'rain',
    evaluate: h => nthMatch(h, e => isRainy(e.weather.conditionLabel) && e.weather.windSpeed < 10, 1),
  },
  {
    id: 'cinematic_rain',
    title: 'Cinematic Rain',
    desc: 'Rain consult after 8pm. Main character weather.',
    icon: 'weather-night-partly-cloudy',
    category: 'rain',
    evaluate: h => nthMatch(h, e => {
      const hr = new Date(e.consultedAt).getHours();
      return isRainy(e.weather.conditionLabel) && hr >= 20;
    }, 1),
  },
  {
    id: 'raincoat_regular',
    title: 'Raincoat Regular',
    desc: '15 rainy-day consults. Practicality has entered the chat.',
    icon: 'umbrella',
    category: 'rain',
    evaluate: h => nthMatch(h, e => isRainy(e.weather.conditionLabel), 15),
  },

  {
    id: 'first_flurry',
    title: 'First Flurry',
    desc: 'Snow consult with temp above −2°C. Pretty, but suspicious.',
    icon: 'weather-snowy-rainy',
    category: 'snow',
    evaluate: h => nthMatch(h, e => isSnow(e.weather.conditionLabel) && e.weather.temp > -2, 1),
  },
  {
    id: 'snow_after_dark',
    title: 'Snow After Dark',
    desc: 'Snow consult after 8pm. The city becomes a film set.',
    icon: 'weather-night',
    category: 'snow',
    evaluate: h => nthMatch(h, e => {
      const hr = new Date(e.consultedAt).getHours();
      return isSnow(e.weather.conditionLabel) && hr >= 20;
    }, 1),
  },
  {
    id: 'powder_room',
    title: 'Powder Room',
    desc: 'Snow consult in a fashion capital.',
    icon: 'snowflake-variant',
    category: 'snow',
    evaluate: h => nthMatch(
      h,
      e => isSnow(e.weather.conditionLabel) &&
        FASHION_CAPITALS.some(c => e.city.toLowerCase().includes(c)),
      1,
    ),
  },

  {
    id: 'clear_morning',
    title: 'Clear Morning',
    desc: 'Clear-sky consult before 9am.',
    icon: 'weather-sunset-up',
    category: 'sunshine',
    evaluate: h => nthMatch(h, e => {
      const hr = new Date(e.consultedAt).getHours();
      return isClear(e.weather.conditionLabel) && hr < 9;
    }, 1),
  },
  {
    id: 'sunny_workday',
    title: 'Sunny Workday',
    desc: 'Work consult under clear skies. Corporate optimism.',
    icon: 'briefcase-variant-outline',
    category: 'sunshine',
    evaluate: h => nthMatch(h, e => e.occasion === 'Work' && isClear(e.weather.conditionLabel), 1),
  },
  {
    id: 'blue_sky_archive',
    title: 'Blue-Sky Archive',
    desc: '50 clear-sky consults. The forecast is becoming smug.',
    icon: 'weather-sunny',
    category: 'sunshine',
    evaluate: h => nthMatch(h, e => isClear(e.weather.conditionLabel), 50),
  },

  {
    id: 'date_in_the_rain',
    title: 'Date in the Rain',
    desc: 'Date occasion during rain. Romantic, inconvenient, iconic.',
    icon: 'heart-multiple',
    category: 'occasions',
    evaluate: h => nthMatch(h, e => e.occasion === 'Date' && isRainy(e.weather.conditionLabel), 1),
  },
  {
    id: 'event_in_extremes',
    title: 'Event in Extremes',
    desc: 'Event occasion at 35°C+ or 0°C and below.',
    icon: 'star-shooting-outline',
    category: 'occasions',
    evaluate: h => nthMatch(
      h,
      e => e.occasion === 'Event' && (e.weather.temp >= 35 || e.weather.temp <= 0),
      1,
    ),
  },
  {
    id: 'active_in_weather',
    title: 'Active in Weather',
    desc: 'Active occasion during rain, snow, or wind ≥ 40 km/h.',
    icon: 'run-fast',
    category: 'occasions',
    evaluate: h => nthMatch(
      h,
      e => e.occasion === 'Active' &&
        (isRainy(e.weather.conditionLabel) || isSnow(e.weather.conditionLabel) || e.weather.windSpeed >= 40),
      1,
    ),
  },
  {
    id: 'weekend_in_the_sun',
    title: 'Weekend in the Sun',
    desc: 'Weekend occasion under clear skies.',
    icon: 'beach',
    category: 'occasions',
    evaluate: h => nthMatch(h, e => e.occasion === 'Weekend' && isClear(e.weather.conditionLabel), 1),
  },
  {
    id: 'work_under_pressure',
    title: 'Work Under Pressure',
    desc: 'Work consult in rain, snow, storm, or wind ≥ 40 km/h.',
    icon: 'briefcase-outline',
    category: 'occasions',
    evaluate: h => nthMatch(
      h,
      e => e.occasion === 'Work' &&
        (isRainy(e.weather.conditionLabel) || isSnow(e.weather.conditionLabel) || isStorm(e.weather.conditionLabel) || e.weather.windSpeed >= 40),
      1,
    ),
  },

  {
    id: 'city_sampler',
    title: 'City Sampler',
    desc: 'Consulted for 5 unique cities.',
    icon: 'map-marker-radius-outline',
    category: 'cities',
    evaluate: h => {
      const cities = new Set(h.map(e => e.city.toLowerCase()));
      return cities.size >= 5 ? (h[0]?.consultedAt ?? Date.now()) : false;
    },
  },
  {
    id: 'urban_obsession',
    title: 'Urban Obsession',
    desc: 'Consulted for the same city 25 times.',
    icon: 'home-city-outline',
    category: 'cities',
    evaluate: h => {
      const counts = new Map<string, number>();
      for (const e of h) {
        const key = e.city.toLowerCase();
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
      return [...counts.values()].some(v => v >= 25) ? (h[0]?.consultedAt ?? Date.now()) : false;
    },
  },
  {
    id: 'three_city_day',
    title: 'Three Cities, One Day',
    desc: 'Consulted for 3 different cities on the same calendar day.',
    icon: 'map-marker-path',
    category: 'cities',
    evaluate: h => {
      const byDay = new Map<string, Set<string>>();
      for (const e of h) {
        const day = new Date(e.consultedAt).toISOString().slice(0, 10);
        if (!byDay.has(day)) byDay.set(day, new Set());
        byDay.get(day)!.add(e.city.toLowerCase());
      }

      for (const [, cities] of byDay) {
        if (cities.size >= 3) return h[0]?.consultedAt ?? Date.now();
      }

      return false;
    },
  },
  {
    id: 'capital_repeat',
    title: 'Capital Repeat',
    desc: '5 consults in any fashion capital.',
    icon: 'city-variant',
    category: 'cities',
    evaluate: h => nthMatch(
      h,
      e => FASHION_CAPITALS.some(c => e.city.toLowerCase().includes(c)),
      5,
    ),
  },

  {
    id: 'saved_50',
    title: 'Fifty Saved Looks',
    desc: '50 saved outfits. The wardrobe has lore now.',
    icon: 'heart-multiple',
    category: 'collection',
    evaluate: (_h, _f, ex) => ex.savedCount >= 50 ? Date.now() : false,
  },
  {
    id: 'saved_100',
    title: 'The Archive',
    desc: '100 saved outfits. A private fashion museum.',
    icon: 'wardrobe-outline',
    category: 'collection',
    evaluate: (_h, _f, ex) => ex.savedCount >= 100 ? Date.now() : false,
  },
  {
    id: 'saved_250',
    title: 'Museum Collection',
    desc: '250 saved outfits. The curator is unavailable for comment.',
    icon: 'bank-outline',
    category: 'collection',
    evaluate: (_h, _f, ex) => ex.savedCount >= 250 ? Date.now() : false,
  },

  {
    id: 'camp_met_gala',
    title: 'Camp: Notes on Weather',
    desc: 'Event consult in New York after 6pm.',
    icon: 'star-four-points-outline',
    category: 'culture',
    evaluate: h => nthMatch(h, e => {
      const hr = new Date(e.consultedAt).getHours();
      return e.occasion === 'Event' && e.city.toLowerCase().includes('new york') && hr >= 18;
    }, 1),
  },
  {
    id: 'sabrina_carpenter_hour',
    title: 'Espresso Hour',
    desc: 'Morning consult under clear skies. That’s that me, styled.',
    icon: 'coffee-outline',
    category: 'culture',
    evaluate: h => nthMatch(h, e => {
      const hr = new Date(e.consultedAt).getHours();
      return hr >= 6 && hr < 11 && isClear(e.weather.conditionLabel);
    }, 1),
  },
  {
    id: 'blade_runner_weather',
    title: 'Blade Runner Weather',
    desc: 'Rainy night consult in a major city.',
    icon: 'weather-night-partly-cloudy',
    category: 'culture',
    evaluate: h => nthMatch(h, e => {
      const hr = new Date(e.consultedAt).getHours();
      const city = e.city.toLowerCase();
      const majorCity =
        FASHION_CAPITALS.some(c => city.includes(c)) ||
        ['seoul', 'hong kong', 'shanghai', 'berlin', 'toronto', 'los angeles'].some(c => city.includes(c));

      return isRainy(e.weather.conditionLabel) && majorCity && (hr >= 20 || hr < 5);
    }, 1),
  },
  {
    id: 'breakfast_at_tiffanys',
    title: "Breakfast at Tiffany's",
    desc: 'New York consult before 9am.',
    icon: 'diamond-stone',
    category: 'culture',
    evaluate: h => nthMatch(h, e => {
      const hr = new Date(e.consultedAt).getHours();
      return e.city.toLowerCase().includes('new york') && hr < 9;
    }, 1),
  },
  {
    id: 'milanese_minimalist',
    title: 'Milanese Minimalist',
    desc: '5 Milan consults. Quiet luxury has entered the forecast.',
    icon: 'sunglasses',
    category: 'culture',
    evaluate: h => {
      const milan = h.filter(e => e.city.toLowerCase().includes('milan'));
      return milan.length >= 5 ? milan[4].consultedAt : false;
    },
  },
  {
    id: 'parisian_repeat',
    title: 'Parisian Repeat',
    desc: '5 Paris consults. The Oracle has become insufferable.',
    icon: 'bag-personal-outline',
    category: 'culture',
    evaluate: h => {
      const paris = h.filter(e => e.city.toLowerCase().includes('paris'));
      return paris.length >= 5 ? paris[4].consultedAt : false;
    },
  },

    {
    id: 'oracle_initiate',
    title: 'Oracle Initiate',
    desc: '35 total consults. The ritual is working.',
    icon: 'eye-circle-outline',
    category: 'first_steps',
    evaluate: (h, _f, ex) => ex.totalConsults >= 35 ? (h[0]?.consultedAt ?? Date.now()) : false,
  },
  {
    id: 'oracle_inner_circle',
    title: 'Inner Circle',
    desc: '150 total consults. The Oracle now expects loyalty.',
    icon: 'account-star-outline',
    category: 'first_steps',
    evaluate: (h, _f, ex) => ex.totalConsults >= 150 ? (h[0]?.consultedAt ?? Date.now()) : false,
  },
  {
    id: 'oracle_high_priestess',
    title: 'High Priestess',
    desc: '750 total consults. Fashion prophecy has a spokesperson.',
    icon: 'account-cowboy-hat-outline',
    category: 'first_steps',
    evaluate: (h, _f, ex) => ex.totalConsults >= 750 ? (h[0]?.consultedAt ?? Date.now()) : false,
  },

  {
    id: 'streak_21',
    title: 'Habit Formed',
    desc: '21-day consult streak. The Oracle has entered the routine.',
    icon: 'calendar-sync',
    category: 'streak',
    evaluate: (_h, _f, ex) => ex.streak >= 21 ? Date.now() : false,
  },
  {
    id: 'streak_60',
    title: 'Sixty Days Styled',
    desc: '60-day consult streak. Commitment looks good on you.',
    icon: 'fire-circle',
    category: 'streak',
    evaluate: (_h, _f, ex) => ex.streak >= 60 ? Date.now() : false,
  },
  {
    id: 'streak_180',
    title: 'Half-Year Ritual',
    desc: '180-day consult streak. The Oracle is family now.',
    icon: 'calendar-star',
    category: 'streak',
    evaluate: (_h, _f, ex) => ex.streak >= 180 ? Date.now() : false,
  },

  {
    id: 'freezing_rain',
    title: 'Freezing Rain Couture',
    desc: 'Rain consult at 0°C or below. Treacherous, but considered.',
    icon: 'weather-snowy-rainy',
    category: 'cold',
    evaluate: h => nthMatch(h, e => isRainy(e.weather.conditionLabel) && e.weather.temp <= 0, 1),
  },
  {
    id: 'cold_morning',
    title: 'Cold Morning',
    desc: 'Consulted before 9am at 0°C or below.',
    icon: 'weather-sunset-up',
    category: 'cold',
    evaluate: h => nthMatch(h, e => {
      const hr = new Date(e.consultedAt).getHours();
      return hr < 9 && e.weather.temp <= 0;
    }, 1),
  },
  {
    id: 'icy_workday',
    title: 'Icy Workday',
    desc: 'Work consult at −5°C or below. Corporate suffering, styled.',
    icon: 'briefcase-variant-outline',
    category: 'cold',
    evaluate: h => nthMatch(h, e => e.occasion === 'Work' && e.weather.temp <= -5, 1),
  },
  {
    id: 'frozen_weekend',
    title: 'Frozen Weekend',
    desc: 'Weekend consult at −10°C or below. Staying in was an option.',
    icon: 'sofa-outline',
    category: 'cold',
    evaluate: h => nthMatch(h, e => e.occasion === 'Weekend' && e.weather.temp <= -10, 1),
  },
  {
    id: 'cold_snap',
    title: 'Cold Snap',
    desc: '3 consecutive days at 0°C or below.',
    icon: 'snowflake-thermometer',
    category: 'cold',
    evaluate: h => consecutiveDayStreak(h, e => e.weather.temp <= 0, 3),
  },
  {
    id: 'polar_week',
    title: 'Polar Week',
    desc: '7 consecutive days at 0°C or below.',
    icon: 'snowflake-alert',
    category: 'cold',
    evaluate: h => consecutiveDayStreak(h, e => e.weather.temp <= 0, 7),
  },

  {
    id: 'hot_morning',
    title: 'Hot Morning',
    desc: 'Consulted before 9am at 25°C or above. Already? Rude.',
    icon: 'weather-sunset-up',
    category: 'heat',
    evaluate: h => nthMatch(h, e => {
      const hr = new Date(e.consultedAt).getHours();
      return hr < 9 && e.weather.temp >= 25;
    }, 1),
  },
  {
    id: 'hot_night',
    title: 'Hot Night',
    desc: 'Consulted after 9pm at 25°C or above.',
    icon: 'weather-night',
    category: 'heat',
    evaluate: h => nthMatch(h, e => {
      const hr = new Date(e.consultedAt).getHours();
      return hr >= 21 && e.weather.temp >= 25;
    }, 1),
  },
  {
    id: 'sweaty_commute',
    title: 'Sweaty Commute',
    desc: 'Work consult at 30°C or above. Professionalism has limits.',
    icon: 'briefcase-clock-outline',
    category: 'heat',
    evaluate: h => nthMatch(h, e => e.occasion === 'Work' && e.weather.temp >= 30, 1),
  },
  {
    id: 'heat_streak',
    title: 'Heat Streak',
    desc: '3 consecutive days at 30°C or above.',
    icon: 'fire',
    category: 'heat',
    evaluate: h => consecutiveDayStreak(h, e => e.weather.temp >= 30, 3),
  },
  {
    id: 'summer_survivor',
    title: 'Summer Survivor',
    desc: '7 consecutive days at 28°C or above.',
    icon: 'weather-sunny-alert',
    category: 'heat',
    evaluate: h => consecutiveDayStreak(h, e => e.weather.temp >= 28, 7),
  },
  {
    id: 'dry_heat',
    title: 'Dry Heat',
    desc: '30°C or above with humidity under 30%. Chic, but dehydrating.',
    icon: 'water-off',
    category: 'heat',
    evaluate: h => nthMatch(h, e => e.weather.temp >= 30 && e.weather.humidity < 30, 1),
  },

  {
    id: 'rainy_workweek',
    title: 'Rainy Workweek',
    desc: '5 Work consults in the rain.',
    icon: 'briefcase-variant-outline',
    category: 'rain',
    evaluate: h => nthMatch(h, e => e.occasion === 'Work' && isRainy(e.weather.conditionLabel), 5),
  },
  {
    id: 'rainy_weekend',
    title: 'Rainy Weekend',
    desc: 'Weekend consult in the rain. Cozy plans require styling too.',
    icon: 'sofa-outline',
    category: 'rain',
    evaluate: h => nthMatch(h, e => e.occasion === 'Weekend' && isRainy(e.weather.conditionLabel), 1),
  },
  {
    id: 'rainy_date_repeat',
    title: 'Rainy Romance',
    desc: '3 Date consults in the rain.',
    icon: 'heart-outline',
    category: 'rain',
    evaluate: h => nthMatch(h, e => e.occasion === 'Date' && isRainy(e.weather.conditionLabel), 3),
  },
  {
    id: 'stormy_night',
    title: 'Stormy Night',
    desc: 'Thunderstorm consult after 8pm.',
    icon: 'weather-lightning',
    category: 'rain',
    evaluate: h => nthMatch(h, e => {
      const hr = new Date(e.consultedAt).getHours();
      return isStorm(e.weather.conditionLabel) && hr >= 20;
    }, 1),
  },
  {
    id: 'wet_and_windy',
    title: 'Wet and Windy',
    desc: 'Rain with wind ≥ 45 km/h. The umbrella has left the chat.',
    icon: 'weather-pouring',
    category: 'rain',
    evaluate: h => nthMatch(h, e => isRainy(e.weather.conditionLabel) && e.weather.windSpeed >= 45, 1),
  },
  {
    id: 'rain_world_tour',
    title: 'Rain World Tour',
    desc: 'Rain consults in 5 different cities.',
    icon: 'map-marker-multiple-outline',
    category: 'rain',
    evaluate: h => {
      const rainy = h.filter(e => isRainy(e.weather.conditionLabel));
      const cities = new Set(rainy.map(e => e.city.toLowerCase()));
      return cities.size >= 5 ? (rainy[0]?.consultedAt ?? Date.now()) : false;
    },
  },

  {
    id: 'snowy_workday',
    title: 'Snowy Workday',
    desc: 'Work consult during snowfall. The commute is a character test.',
    icon: 'briefcase-outline',
    category: 'snow',
    evaluate: h => nthMatch(h, e => e.occasion === 'Work' && isSnow(e.weather.conditionLabel), 1),
  },
  {
    id: 'snowy_date',
    title: 'Snowy Date',
    desc: 'Date consult during snowfall. Romantic, but slippery.',
    icon: 'snowflake-variant',
    category: 'snow',
    evaluate: h => nthMatch(h, e => e.occasion === 'Date' && isSnow(e.weather.conditionLabel), 1),
  },
  {
    id: 'snowy_morning',
    title: 'Snowy Morning',
    desc: 'Snow consult before 9am.',
    icon: 'weather-sunset-up',
    category: 'snow',
    evaluate: h => nthMatch(h, e => {
      const hr = new Date(e.consultedAt).getHours();
      return isSnow(e.weather.conditionLabel) && hr < 9;
    }, 1),
  },
  {
    id: 'snow_city_repeat',
    title: 'Snow City Regular',
    desc: '5 snow consults in the same city.',
    icon: 'home-city-outline',
    category: 'snow',
    evaluate: h => {
      const snowy = h.filter(e => isSnow(e.weather.conditionLabel));
      const counts = new Map<string, number>();

      for (const e of snowy) {
        const key = e.city.toLowerCase();
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }

      return [...counts.values()].some(v => v >= 5) ? (snowy[0]?.consultedAt ?? Date.now()) : false;
    },
  },
  {
    id: 'snowbound',
    title: 'Snowbound',
    desc: '25 consults during snowfall. The boots have tenure.',
    icon: 'weather-snowy-heavy',
    category: 'snow',
    evaluate: h => nthMatch(h, e => isSnow(e.weather.conditionLabel), 25),
  },

  {
    id: 'sunny_date',
    title: 'Sunny Date',
    desc: 'Date consult under clear skies. Suspiciously promising.',
    icon: 'heart-outline',
    category: 'sunshine',
    evaluate: h => nthMatch(h, e => e.occasion === 'Date' && isClear(e.weather.conditionLabel), 1),
  },
  {
    id: 'sunny_event',
    title: 'Sunny Event',
    desc: 'Event consult under clear skies. The lighting understood the assignment.',
    icon: 'star-outline',
    category: 'sunshine',
    evaluate: h => nthMatch(h, e => e.occasion === 'Event' && isClear(e.weather.conditionLabel), 1),
  },
  {
    id: 'clear_weekend_repeat',
    title: 'Clear Weekend Repeat',
    desc: '5 Weekend consults under clear skies.',
    icon: 'beach',
    category: 'sunshine',
    evaluate: h => nthMatch(h, e => e.occasion === 'Weekend' && isClear(e.weather.conditionLabel), 5),
  },
  {
    id: 'uv_regular',
    title: 'UV Regular',
    desc: '5 consults with UV index ≥ 8.',
    icon: 'sun-wireless-outline',
    category: 'sunshine',
    evaluate: h => nthMatch(h, e => (e.weather.uvIndex ?? 0) >= 8, 5),
  },
  {
    id: 'sunny_capital',
    title: 'Sunny Capital',
    desc: 'Clear-sky consult in a fashion capital.',
    icon: 'city-variant-outline',
    category: 'sunshine',
    evaluate: h => nthMatch(
      h,
      e => isClear(e.weather.conditionLabel) &&
        FASHION_CAPITALS.some(c => e.city.toLowerCase().includes(c)),
      1,
    ),
  },

  {
    id: 'foggy_morning',
    title: 'Foggy Morning',
    desc: 'Fog, mist, or haze before 9am. Very cinematic.',
    icon: 'weather-fog',
    category: 'atmosphere',
    evaluate: h => nthMatch(h, e => {
      const hr = new Date(e.consultedAt).getHours();
      return isFoggy(e.weather.conditionLabel) && hr < 9;
    }, 1),
  },
  {
    id: 'fog_devotee',
    title: 'Fog Devotee',
    desc: '5 consults in fog, mist, or haze.',
    icon: 'weather-fog',
    category: 'atmosphere',
    evaluate: h => nthMatch(h, e => isFoggy(e.weather.conditionLabel), 5),
  },
  {
    id: 'overcast_workday',
    title: 'Overcast Workday',
    desc: 'Work consult under clouds. Office lighting, but outdoors.',
    icon: 'briefcase-outline',
    category: 'atmosphere',
    evaluate: h => nthMatch(h, e => e.occasion === 'Work' && isCloud(e.weather.conditionLabel), 1),
  },
  {
    id: 'pressure_system',
    title: 'Pressure System',
    desc: 'Storm, wind ≥ 50 km/h, and humidity ≥ 80% all at once.',
    icon: 'weather-hurricane',
    category: 'atmosphere',
    evaluate: h => nthMatch(
      h,
      e => isStorm(e.weather.conditionLabel) && e.weather.windSpeed >= 50 && e.weather.humidity >= 80,
      1,
    ),
  },
  {
    id: 'muggy_morning',
    title: 'Muggy Morning',
    desc: 'Before 9am with humidity ≥ 85%. The day started personally.',
    icon: 'water-percent',
    category: 'atmosphere',
    evaluate: h => nthMatch(h, e => {
      const hr = new Date(e.consultedAt).getHours();
      return hr < 9 && e.weather.humidity >= 85;
    }, 1),
  },
  {
    id: 'windy_city',
    title: 'Windy City',
    desc: 'Consulted for Chicago with wind ≥ 30 km/h.',
    icon: 'weather-windy',
    category: 'atmosphere',
    evaluate: h => nthMatch(
      h,
      e => e.city.toLowerCase().includes('chicago') && e.weather.windSpeed >= 30,
      1,
    ),
  },

  {
    id: 'morning_person_lie',
    title: 'Morning Person, Allegedly',
    desc: '10 consults before 8am.',
    icon: 'weather-sunset-up',
    category: 'timing',
    evaluate: h => nthMatch(h, e => new Date(e.consultedAt).getHours() < 8, 10),
  },
  {
    id: 'office_hours',
    title: 'Office Hours',
    desc: '10 consults between 9am and 5pm.',
    icon: 'clock-outline',
    category: 'timing',
    evaluate: h => nthMatch(h, e => {
      const hr = new Date(e.consultedAt).getHours();
      return hr >= 9 && hr < 17;
    }, 10),
  },
  {
    id: 'twilight_oracle',
    title: 'Twilight Oracle',
    desc: 'Consulted between 5pm and 7pm.',
    icon: 'weather-sunset-down',
    category: 'timing',
    evaluate: h => nthMatch(h, e => {
      const hr = new Date(e.consultedAt).getHours();
      return hr >= 17 && hr < 19;
    }, 1),
  },
  {
    id: 'ungodly_hour',
    title: 'Ungodly Hour',
    desc: 'Consulted between 2am and 4am. Questions remain.',
    icon: 'moon-new',
    category: 'timing',
    evaluate: h => nthMatch(h, e => {
      const hr = new Date(e.consultedAt).getHours();
      return hr >= 2 && hr < 4;
    }, 1),
  },
  {
    id: 'all_day_oracle',
    title: 'All-Day Oracle',
    desc: 'Consulted in morning, afternoon, evening, and night.',
    icon: 'clock-time-four-outline',
    category: 'timing',
    evaluate: h => {
      const hasMorning = h.some(e => {
        const hr = new Date(e.consultedAt).getHours();
        return hr >= 5 && hr < 12;
      });
      const hasAfternoon = h.some(e => {
        const hr = new Date(e.consultedAt).getHours();
        return hr >= 12 && hr < 17;
      });
      const hasEvening = h.some(e => {
        const hr = new Date(e.consultedAt).getHours();
        return hr >= 17 && hr < 22;
      });
      const hasNight = h.some(e => {
        const hr = new Date(e.consultedAt).getHours();
        return hr >= 22 || hr < 5;
      });

      return hasMorning && hasAfternoon && hasEvening && hasNight
        ? (h[0]?.consultedAt ?? Date.now())
        : false;
    },
  },

  {
    id: 'tuesday_taste',
    title: 'Tuesday Taste',
    desc: '5 Tuesday consults.',
    icon: 'calendar-week',
    category: 'calendar',
    evaluate: h => nthMatch(h, e => new Date(e.consultedAt).getDay() === 2, 5),
  },
  {
    id: 'thursday_thesis',
    title: 'Thursday Thesis',
    desc: '5 Thursday consults. The outfit has supporting arguments.',
    icon: 'calendar-text',
    category: 'calendar',
    evaluate: h => nthMatch(h, e => new Date(e.consultedAt).getDay() === 4, 5),
  },
  {
    id: 'saturday_statement',
    title: 'Saturday Statement',
    desc: '5 Saturday consults.',
    icon: 'calendar-weekend',
    category: 'calendar',
    evaluate: h => nthMatch(h, e => new Date(e.consultedAt).getDay() === 6, 5),
  },
  {
    id: 'month_end_mood',
    title: 'Month-End Mood',
    desc: 'Consulted on the last day of a month.',
    icon: 'calendar-end',
    category: 'calendar',
    evaluate: h => nthMatch(h, e => {
      const d = new Date(e.consultedAt);
      const nextDay = new Date(d);
      nextDay.setDate(d.getDate() + 1);
      return nextDay.getDate() === 1;
    }, 1),
  },
  {
    id: 'valentines_oracle',
    title: "Valentine's Oracle",
    desc: 'Consulted on February 14th.',
    icon: 'heart',
    category: 'calendar',
    evaluate: h => nthMatch(h, e => {
      const d = new Date(e.consultedAt);
      return d.getMonth() === 1 && d.getDate() === 14;
    }, 1),
  },
  {
    id: 'halloween_oracle',
    title: 'Halloween Oracle',
    desc: 'Consulted on October 31st. Costume or not, it counts.',
    icon: 'ghost-outline',
    category: 'calendar',
    evaluate: h => nthMatch(h, e => {
      const d = new Date(e.consultedAt);
      return d.getMonth() === 9 && d.getDate() === 31;
    }, 1),
  },
  {
    id: 'birthday_energy',
    title: 'Main Character Day',
    desc: 'Consulted on the same calendar date in two different years.',
    icon: 'cake-variant-outline',
    category: 'calendar',
    evaluate: h => {
      const dates = new Map<string, Set<number>>();

      for (const e of h) {
        const d = new Date(e.consultedAt);
        const key = `${d.getMonth() + 1}-${d.getDate()}`;
        if (!dates.has(key)) dates.set(key, new Set());
        dates.get(key)!.add(d.getFullYear());
      }

      return [...dates.values()].some(years => years.size >= 2)
        ? (h[0]?.consultedAt ?? Date.now())
        : false;
    },
  },

  {
    id: 'toronto_oracle',
    title: 'Toronto Oracle',
    desc: 'Consulted for Toronto. Practical layers, emotional complexity.',
    icon: 'city',
    category: 'cities',
    evaluate: h => nthMatch(h, e => e.city.toLowerCase().includes('toronto'), 1),
  },
  {
    id: 'los_angeles_oracle',
    title: 'Los Angeles Oracle',
    desc: 'Consulted for Los Angeles. Sunglasses are not optional.',
    icon: 'palm-tree',
    category: 'cities',
    evaluate: h => nthMatch(h, e => e.city.toLowerCase().includes('los angeles'), 1),
  },
  {
    id: 'berlin_oracle',
    title: 'Berlin Oracle',
    desc: 'Consulted for Berlin. Black was always the answer.',
    icon: 'wall',
    category: 'cities',
    evaluate: h => nthMatch(h, e => e.city.toLowerCase().includes('berlin'), 1),
  },
  {
    id: 'city_hopper',
    title: 'City Hopper',
    desc: 'Consulted for 15 unique cities.',
    icon: 'airplane-marker',
    category: 'cities',
    evaluate: h => {
      const cities = new Set(h.map(e => e.city.toLowerCase()));
      return cities.size >= 15 ? (h[0]?.consultedAt ?? Date.now()) : false;
    },
  },
  {
    id: 'continental_drift',
    title: 'Continental Drift',
    desc: 'Consulted from 15+ different countries.',
    icon: 'earth-box',
    category: 'cities',
    evaluate: h => {
      const countries = new Set(h.map(e => e.weather.country?.toLowerCase()).filter(Boolean));
      return countries.size >= 15 ? (h[0]?.consultedAt ?? Date.now()) : false;
    },
  },
  {
    id: 'one_city_one_week',
    title: 'One City, One Week',
    desc: 'Consulted for the same city across 7 consecutive days.',
    icon: 'home-clock-outline',
    category: 'cities',
    evaluate: h => {
      const cities = new Set(h.map(e => e.city.toLowerCase()));

      for (const city of cities) {
        const result = consecutiveDayStreak(h, e => e.city.toLowerCase() === city, 7);
        if (result) return result;
      }

      return false;
    },
  },

  {
    id: 'date_night_regular',
    title: 'Date Night Regular',
    desc: '10 Date occasion consults.',
    icon: 'heart-multiple-outline',
    category: 'occasions',
    evaluate: h => nthMatch(h, e => e.occasion === 'Date', 10),
  },
  {
    id: 'event_season',
    title: 'Event Season',
    desc: '10 Event occasion consults.',
    icon: 'star-circle-outline',
    category: 'occasions',
    evaluate: h => nthMatch(h, e => e.occasion === 'Event', 10),
  },
  {
    id: 'weekend_regular',
    title: 'Weekend Regular',
    desc: '10 Weekend occasion consults.',
    icon: 'sofa-single-outline',
    category: 'occasions',
    evaluate: h => nthMatch(h, e => e.occasion === 'Weekend', 10),
  },
  {
    id: 'active_repeat',
    title: 'Active Repeat',
    desc: '10 Active occasion consults.',
    icon: 'run-fast',
    category: 'occasions',
    evaluate: h => nthMatch(h, e => e.occasion === 'Active', 10),
  },
  {
    id: 'work_lifer',
    title: 'Work Lifer',
    desc: '50 Work occasion consults. HR has been notified.',
    icon: 'account-tie',
    category: 'occasions',
    evaluate: h => nthMatch(h, e => e.occasion === 'Work', 50),
  },
  {
    id: 'occasion_maximalist',
    title: 'Occasion Maximalist',
    desc: 'Used all occasions at least 3 times each.',
    icon: 'format-list-checks',
    category: 'occasions',
    evaluate: h => {
      const required = ['Work', 'Date', 'Event', 'Weekend', 'Active'];
      const counts = new Map<string, number>();

      for (const e of h) {
        if (!e.occasion) continue;
        counts.set(e.occasion, (counts.get(e.occasion) ?? 0) + 1);
      }

      return required.every(o => (counts.get(o) ?? 0) >= 3)
        ? (h[0]?.consultedAt ?? Date.now())
        : false;
    },
  },

  {
    id: 'little_black_dress',
    title: 'Little Black Dress',
    desc: 'Saved 10 outfits after 8pm. The archive has nightlife.',
    icon: 'hanger',
    category: 'collection',
    evaluate: (_h, _f, ex) => ex.savedCount >= 10 ? Date.now() : false,
  },
  {
    id: 'wardrobe_editor',
    title: 'Wardrobe Editor',
    desc: '75 saved outfits. Taste is now a full-time job.',
    icon: 'clipboard-edit-outline',
    category: 'collection',
    evaluate: (_h, _f, ex) => ex.savedCount >= 75 ? Date.now() : false,
  },
  {
    id: 'private_collection',
    title: 'Private Collection',
    desc: '150 saved outfits. Invitations are extremely limited.',
    icon: 'wardrobe-outline',
    category: 'collection',
    evaluate: (_h, _f, ex) => ex.savedCount >= 150 ? Date.now() : false,
  },
  {
    id: 'couture_archive',
    title: 'Couture Archive',
    desc: '500 saved outfits. The closet has become an institution.',
    icon: 'bank',
    category: 'collection',
    evaluate: (_h, _f, ex) => ex.savedCount >= 500 ? Date.now() : false,
  },

  {
    id: 'nine_months',
    title: 'Nine Months In',
    desc: '9 months with the Oracle. Aesthetic attachment confirmed.',
    icon: 'calendar-heart',
    category: 'anniversary',
    evaluate: (_h, f) => sinceFirst(f, 9 * MONTH_MS),
  },
  {
    id: 'eighteen_months',
    title: 'Eighteen Months',
    desc: '18 months with the Oracle. The relationship has layers.',
    icon: 'calendar-clock',
    category: 'anniversary',
    evaluate: (_h, f) => sinceFirst(f, 18 * MONTH_MS),
  },
  {
    id: 'three_years',
    title: 'Three Years Styled',
    desc: '3 full years with the Oracle.',
    icon: 'calendar-star',
    category: 'anniversary',
    evaluate: (_h, f) => sinceFirst(f, 3 * YEAR_MS),
  },

  {
    id: 'clueless_closet',
    title: 'Clueless Closet',
    desc: 'Consulted for school-day hours before 9am. As if.',
    icon: 'hanger',
    category: 'culture',
    evaluate: h => nthMatch(h, e => {
      const hr = new Date(e.consultedAt).getHours();
      const day = new Date(e.consultedAt).getDay();
      return hr < 9 && day >= 1 && day <= 5;
    }, 1),
  },
  {
    id: 'fleabag_walk',
    title: 'Fleabag Walk',
    desc: 'London consult after 9pm. Looking at the camera counts.',
    icon: 'walk',
    category: 'culture',
    evaluate: h => nthMatch(h, e => {
      const hr = new Date(e.consultedAt).getHours();
      return e.city.toLowerCase().includes('london') && hr >= 21;
    }, 1),
  },
  {
    id: 'roman_holiday',
    title: 'Roman Holiday',
    desc: 'Weekend consult in Rome.',
    icon: 'scooter',
    category: 'culture',
    evaluate: h => nthMatch(h, e => {
      const day = new Date(e.consultedAt).getDay();
      return e.city.toLowerCase().includes('rome') &&
        e.occasion === 'Weekend' &&
        (day === 0 || day === 6);
    }, 1),
  },
  {
    id: 'prada_in_the_rain',
    title: 'Prada in the Rain',
    desc: 'Milan consult in the rain.',
    icon: 'umbrella',
    category: 'culture',
    evaluate: h => nthMatch(
      h,
      e => e.city.toLowerCase().includes('milan') && isRainy(e.weather.conditionLabel),
      1,
    ),
  },
  {
    id: 'lost_in_translation',
    title: 'Lost in Translation',
    desc: 'Tokyo consult after midnight.',
    icon: 'weather-night',
    category: 'culture',
    evaluate: h => nthMatch(h, e => {
      const hr = new Date(e.consultedAt).getHours();
      return e.city.toLowerCase().includes('tokyo') && hr < 5;
    }, 1),
  },
  {
    id: 'before_sunrise',
    title: 'Before Sunrise',
    desc: 'Early morning consult in a European city.',
    icon: 'weather-sunset-up',
    category: 'culture',
    evaluate: h => nthMatch(h, e => {
      const hr = new Date(e.consultedAt).getHours();
      const city = e.city.toLowerCase();
      const europe = ['paris', 'milan', 'london', 'rome', 'berlin', 'vienna', 'copenhagen', 'warsaw'];
      return hr < 7 && europe.some(c => city.includes(c));
    }, 1),
  },
  {
    id: 'quiet_luxury',
    title: 'Quiet Luxury',
    desc: 'Clear Work consult in London, Milan, or Paris.',
    icon: 'diamond-stone',
    category: 'culture',
    evaluate: h => nthMatch(h, e => {
      const city = e.city.toLowerCase();
      return e.occasion === 'Work' &&
        isClear(e.weather.conditionLabel) &&
        ['london', 'milan', 'paris'].some(c => city.includes(c));
    }, 1),
  },

  // ══ CITIES & TRAVEL ══════════════════════════════════════════════════════
  {
    id: 'globetrotter',
    title: 'Globetrotter',
    desc: 'Consulted for 10 unique cities',
    icon: 'map-marker-multiple',
    category: 'cities',
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
    category: 'cities',
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
    category: 'cities',
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
    category: 'cities',
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
    category: 'cities',
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
    category: 'cities',
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
    category: 'cities',
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
    category: 'cities',
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
    category: 'cities',
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
    category: 'occasions',
    evaluate: h => nthMatch(h, e => e.occasion === 'Work', 5),
  },
  {
    id: 'date_oracle',
    title: 'Date Night Oracle',
    desc: '5 Date occasion consults',
    icon: 'heart-outline',
    category: 'occasions',
    evaluate: h => nthMatch(h, e => e.occasion === 'Date', 5),
  },
  {
    id: 'event_oracle',
    title: 'Event Horizon',
    desc: '5 Event occasion consults',
    icon: 'star-outline',
    category: 'occasions',
    evaluate: h => nthMatch(h, e => e.occasion === 'Event', 5),
  },
  {
    id: 'weekend_oracle',
    title: 'Weekend Warrior',
    desc: '5 Weekend occasion consults',
    icon: 'sofa-outline',
    category: 'occasions',
    evaluate: h => nthMatch(h, e => e.occasion === 'Weekend', 5),
  },
  {
    id: 'active_oracle',
    title: 'Keeps Active',
    desc: '5 Active occasion consults',
    icon: 'run',
    category: 'occasions',
    evaluate: h => nthMatch(h, e => e.occasion === 'Active', 5),
  },
  {
    id: 'occasion_curious',
    title: 'Occasion Curious',
    desc: 'Used 3 different occasions',
    icon: 'format-list-bulleted',
    category: 'occasions',
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
    category: 'occasions',
    evaluate: h => {
      const occ = new Set(h.map(e => e.occasion));
      if (['Work', 'Date', 'Event', 'Weekend', 'Active'].every(o => occ.has(o))) {
        return h[0].consultedAt;
      }
      return false;
    },
  },
  {
    id: 'for_everyone',
    title: 'Dresses for Everyone',
    desc: 'Consulted for more than one gender',
    icon: 'gender-male-female',
    category: 'occasions',
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
    category: 'collection',
    evaluate: (_h, _f, ex) => ex.savedCount >= 1 ? Date.now() : false,
  },
  {
    id: 'wardrobe_growing',
    title: 'Wardrobe Growing',
    desc: '5 saved outfits',
    icon: 'hanger',
    category: 'collection',
    evaluate: (_h, _f, ex) => ex.savedCount >= 5 ? Date.now() : false,
  },
  {
    id: 'collector',
    title: 'The Collector',
    desc: '20 saved outfits',
    icon: 'wardrobe-outline',
    category: 'collection',
    evaluate: (_h, _f, ex) => ex.savedCount >= 20 ? Date.now() : false,
  },

  // ══ ANNIVERSARIES ════════════════════════════════════════════════════════
  {
    id: 'one_month',
    title: 'One Month In',
    desc: '30 days with the Oracle',
    icon: 'calendar-month-outline',
    category: 'anniversary',
    evaluate: (_h, f) => sinceFirst(f, MONTH_MS),
  },
  {
    id: 'three_months',
    title: 'Three Months',
    desc: '90 days with the Oracle',
    icon: 'calendar-check-outline',
    category: 'anniversary',
    evaluate: (_h, f) => sinceFirst(f, 3 * MONTH_MS),
  },
  {
    id: 'six_month',
    title: 'Six-Month Devotee',
    desc: '6 months with the Oracle',
    icon: 'calendar-check',
    category: 'anniversary',
    evaluate: (_h, f) => sinceFirst(f, SIX_MONTH_MS),
  },
  {
    id: 'one_year',
    title: 'Year of the Oracle',
    desc: '1 full year with the Oracle',
    icon: 'crown',
    category: 'anniversary',
    evaluate: (_h, f) => sinceFirst(f, YEAR_MS),
  },
  {
    id: 'two_years',
    title: 'Two Years Devoted',
    desc: '2 full years with the Oracle',
    icon: 'star-circle',
    category: 'anniversary',
    evaluate: (_h, f) => sinceFirst(f, 2 * YEAR_MS),
  },
];

// ── Dev logging ───────────────────────────────────────────────────────────────

if (__DEV__) {
  console.log(`[Badges] ${BADGE_DEFS.length} badges across ${Object.keys(BADGE_CATEGORY_LABELS).length} categories`);
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
          category: def.category,
          earned:   result !== false,
          earnedAt: result !== false ? result : undefined,
        };
      }),
    [history, firstConsultAt, extras.totalConsults, extras.streak, extras.savedCount],
  );
}
