import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeatherData } from './weather';
import { StyleProfile, OraclePersonality } from '../hooks/useStyleProfile';

const DEVICE_ID_KEY = '@outfit_oracle_device_id';

const CLAUDE_API  = 'https://api.anthropic.com/v1/messages';
const PROXY_URL   = process.env.EXPO_PUBLIC_PROXY_URL ?? '';

const BUDGET_NOTES: Record<string, string> = {
  'high-street':  'accessible price point; everyday retail, resale, and budget-friendly finds',
  'contemporary': 'mid-range investment pieces; better fabrics, construction, and modern labels',
  'luxury':       'designer or atelier-level pieces; refined materials, longevity, and restraint',
};

const PERSONALITY_VOICE: Record<OraclePersonality, string> = {
  diplomatic: 'Adopt a measured, neutral, and informative tone. Give clear recommendations without strong opinions or dramatic commentary.',
  editorial:  'Be opinionated, direct, and editorial. Deliver verdicts with confidence. Use the Oracle\'s distinctive voice — witty, specific, slightly savage.',
  savage:     'Be ruthlessly honest. If the weather is terrible or certain choices are unacceptable, say so with sharp wit and zero softening. Fashion is a serious matter.',
};

export interface OutfitItem {
  category: string;
  item: string;
  detail: string;
  accentColor: 'mint' | 'lavender' | 'coral' | 'lemon' | 'iris';
}

export interface OracleVerdict {
  verdict: string;
  vibe: string;
  outfits: OutfitItem[];
  outfitsAlt?: OutfitItem[];
  avoid: string[];
  rating: number;
  foundingMember?: boolean;
}

function getTimeContext(): string {
  const h = new Date().getHours();
  if (h >= 5  && h < 9)  return 'Early morning (5–9am) — the city is waking up; practical, fresh-start energy';
  if (h >= 9  && h < 12) return 'Mid-morning (9am–noon) — the day is underway; consider where the wearer needs to be by midday';
  if (h >= 12 && h < 14) return 'Midday (noon–2pm) — peak activity; the look must hold up to full daylight and movement';
  if (h >= 14 && h < 17) return 'Afternoon (2–5pm) — the day is in full swing; light is shifting toward golden hour';
  if (h >= 17 && h < 20) return 'Early evening (5–8pm) — transitional golden hour; the day look should be able to carry into evening, or the evening look should now lead';
  if (h >= 20 && h < 23) return 'Evening (8–11pm) — night energy is here; social, after-dark, the city has shifted';
  return 'Late night / early hours — minimal, quiet city energy; the Oracle suggests something unfussy';
}

const DEFAULT_LAT = 45; // Northern Hemisphere fallback when no GPS fix is available

// Keep in sync with getSeason() in cloudflare-worker/index.js — both copies must match.
export function getSeason(month: number, lat?: number): string {
  const isNorthern = (lat ?? DEFAULT_LAT) >= 0;
  const m = isNorthern ? month : (month + 6) % 12;
  if (m >= 2 && m <= 4) return 'Spring';
  if (m >= 5 && m <= 7) return 'Summer';
  if (m >= 8 && m <= 10) return 'Autumn';
  return 'Winter';
}

function buildOccasionSection(occasion?: string): string {
  if (!occasion || occasion === 'Any') {
    return '- Occasion: Going about the day — balance practicality with considered style for errands, lunch, and wherever the day leads.\n';
  }
  const guides: Record<string, string> = {
    'Work':    '- Occasion: WORK — professional or semi-professional environment. Structured pieces, intentional tailoring, nothing gym or ultra-casual. Day: appropriately polished. Night (outfitsAlt): loosens toward post-work dinner or drinks — still refined but more personal.\n',
    'Date':    '- Occasion: DATE — confident and attractive, not costumed. Flattering silhouettes, a considered detail or two. Day: afternoon coffee or gallery energy. Night (outfitsAlt): dinner or bar energy — warmer, slightly more intimate.\n',
    'Event':   '- Occasion: EVENT — something worth attending. Elevated fabrics, clean silhouette, at least one intentional moment (statement shoe, jewellery, or considered layer). Not casual. Not costume. The Oracle requires effort.\n',
    'Weekend': '- Occasion: WEEKEND — deliberate ease. Not lazy, not polished. Comfortable enough for a long walk, stylish enough for an unexpected plan. Elevated casual: quality denim, a great knit, relaxed separates. No gym wear.\n',
    'Active':  '- Occasion: ACTIVE — mobility and practicality are non-negotiable. Elevated athleisure that looks intentional, layers built for movement, shoes for actual activity. Day: genuinely functional. Night (outfitsAlt): can shift toward social energy if activity is daytime.\n',
  };
  return guides[occasion] ?? `- Occasion: ${occasion} — shape every recommendation specifically for this context.\n`;
}

// DEV-ONLY: this prompt is used by the viaDirect path (no proxy, local API key).
// Production uses the Cloudflare Worker's buildPrompt — keep both in sync when editing.
function buildPrompt(weather: WeatherData, gender: string, profile?: StyleProfile, occasion?: string): string {
  const voiceInstruction = PERSONALITY_VOICE[profile?.personality ?? 'editorial'];
  const profileSection = profile?.keywords?.length
    ? `\nUser style profile:\n- Name: ${profile.name ?? 'The Devotee'}\n- Aesthetic: ${profile.keywords.join(', ')}\n- Budget tier: ${profile.budget} (${BUDGET_NOTES[profile.budget] ?? ''})\n\nThe verdict must speak to what this specific weather means for this specific aesthetic. A "quiet luxury minimalist" in 12°C overcast hears something different from a "vintage eclectic maximalist" in the same conditions. Tailor the vibe, verdict, and every pick to their profile.\n`
    : '';
  const occasionSection = buildOccasionSection(occasion);
  const sizeNote = profile?.size
    ? `- Clothing size: ${profile.size} — recommend fits and proportions suited to this size. An oversized silhouette reads differently on XS vs L; tailor cut and volume accordingly.\n`
    : '';
  const tempNote = profile?.tempSensitivity === 'runs-cold'
    ? `- Temperature sensitivity: This person runs cold — lean toward warmer layers and heavier fabrics than the thermometer alone might suggest.\n`
    : profile?.tempSensitivity === 'runs-hot'
    ? `- Temperature sensitivity: This person runs hot — recommend lighter, more breathable pieces than the temperature might suggest.\n`
    : '';
  const colorNote = (() => {
    const loves  = profile?.colorLoves?.length  ? `- Colour loves: ${profile.colorLoves.join(', ')} — weave these into picks where possible.\n`  : '';
    const avoids = profile?.colorAvoids?.length ? `- Colour avoids: ${profile.colorAvoids.join(', ')} — never recommend items in these colours.\n` : '';
    return loves + avoids;
  })();

  const season = getSeason(new Date().getMonth(), weather.latitude);
  const timeContext = getTimeContext();

  const uvNote = weather.uvIndex !== undefined
    ? `- UV Index: ${weather.uvIndex}${weather.uvIndex >= 8 ? ' — VERY HIGH: sun protection is non-negotiable; recommend sunglasses and SPF-rated layers' : weather.uvIndex >= 6 ? ' — High: sunglasses and a hat are wise' : ''}\n`
    : '';

  const windNote = (() => {
    if (!weather.windDirection) return `- Wind: ${weather.windSpeed} km/h\n`;
    const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
    const compass = dirs[Math.round(weather.windDirection / 22.5) % 16];
    return `- Wind: ${weather.windSpeed} km/h from the ${compass}\n`;
  })();

  const alertNote = weather.alerts?.length
    ? `- Active weather alerts: ${weather.alerts.map(a => a.event).join(', ')} — incorporate any relevant safety or comfort adjustments\n`
    : '';

  return `You are the Outfit Oracle — a devastatingly chic AI fashion authority. ${voiceInstruction}
${profileSection}
Weather right now:
- City: ${weather.city}, ${weather.country}
- Season: ${season}
- Time of day: ${timeContext}
- Temperature: ${weather.temp}°C (feels like ${weather.feelsLike}°C)
- Condition: ${weather.conditionLabel} — ${weather.description}
- Humidity: ${weather.humidity}%
${windNote}${uvNote}${alertNote}- Dressing for: ${gender}
${occasionSection}${sizeNote}${tempNote}${colorNote}
TEMPERATURE RULES — non-negotiable, override aesthetic instincts. Base all layering decisions on the FEELS LIKE temperature (${weather.feelsLike}°C), not the raw temperature:
- Feels like below 5°C: A coat is mandatory. No exceptions.
- Feels like 5–12°C: A jacket or substantial mid-layer is required.
- Feels like 13–19°C: Transitional — smart layers that can be added or removed.
- Feels like 20–26°C: Light fabrics only. No heavy wool or thick knits as a primary layer.
- Feels like above 27°C: Summer weight only. Do not recommend coats or layered looks.
- Rain or freezing precipitation: Footwear must be waterproof or at least water-resistant. Mention an umbrella in accessories.
- Freezing rain or ice (codes 56/57/66/67): Warn explicitly — grippy, waterproof boots are required for safety.

VARIETY MANDATE: Avoid predictable defaults. Every pick must feel specific to this city, this aesthetic, this exact weather — not a generic outfit for any day. Do not default to: plain white t-shirt, straight-leg jeans, black coat, white sneakers unless there is a strong specific reason. Make personality-driven, unexpected-but-correct choices.

BRAND RULE — strict: Do not include brand names, designer names, retailer names, store names, logos, or label references in "item", "detail", "verdict", "vibe", "outfitsAlt", or "avoid". Describe the outfit itself: garment type, fabric, cut, color, weather function, and styling. The only exception is a genuinely exclusive non-generic item or a vetted affiliate-link item explicitly supplied by the app. No affiliate item list is supplied in this request, so default to zero brand names.

Respond ONLY with valid JSON — no markdown, no backticks, no preamble:

{
  "verdict": "3-4 sentences about what this specific weather means for dressing today. If a style profile exists, frame it through that aesthetic — a quiet luxury minimalist and a vintage maximalist should receive different verdicts in the same conditions. Name the actual temperature. Be opinionated. Include at least one wry or sharp observation.",
  "vibe": "3-5 word vibe name that is specific to this day, this weather, and this person — not generic. Example formats: 'Soft Intellectual Monday', 'Warm Girl Summer Errands', 'Apocalypse Chic'. Make it feel earned.",
  "rating": <integer 1-5 representing effort and complexity the day demands — 1 is minimal, 5 is maximum occasion>,
  "outfits": [
    { "category": "Top", "item": "specific, personality-appropriate daytime top for this weather and occasion — not a default", "detail": "why it is the right call for ${weather.temp}°C and the occasion", "accentColor": "mint" },
    { "category": "Bottom", "item": "specific daytime bottom that works for the weather and occasion", "detail": "styling and weather rationale", "accentColor": "lavender" },
    { "category": "Outer Layer", "item": "weather-appropriate outer layer — if above 21°C and not raining, use exactly: 'None needed — ${weather.temp}°C is the look'", "detail": "why this is the correct outer decision for ${weather.temp}°C", "accentColor": "coral" },
    { "category": "Footwear", "item": "occasion- and weather-correct footwear — waterproof if raining, breathable if warm", "detail": "why this footwear suits both the weather and the occasion", "accentColor": "lemon" },
    { "category": "Accessories", "item": "weather-informed accessories — umbrella if rain, scarf if cold, sunglasses if sunny", "detail": "how this completes and protects the look", "accentColor": "iris" }
  ],
  "outfitsAlt": [
    { "category": "Top", "item": "evening top — shift the energy for after dark, don't just swap one piece", "detail": "what changes and why for the evening context", "accentColor": "mint" },
    { "category": "Bottom", "item": "evening bottom — may be the same or elevated", "detail": "styling note", "accentColor": "lavender" },
    { "category": "Outer Layer", "item": "evening outer — remember: ${weather.temp}°C feels cooler after sunset; apply the same temperature rules", "detail": "evening outer reasoning", "accentColor": "coral" },
    { "category": "Footwear", "item": "elevated evening footwear appropriate for the occasion and weather", "detail": "how it shifts the mood for night", "accentColor": "lemon" },
    { "category": "Accessories", "item": "evening accessories — differ from daytime where possible", "detail": "finish the night look", "accentColor": "iris" }
  ],
  "avoid": ["specific wrong item for this exact weather and occasion combination", "another actual mistake for these specific conditions", "one more thing the Oracle forbids today"]
}`;
}

const PROXY_TIMEOUT_MS = 40_000;

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function viaProxy(weather: WeatherData, gender: string, profile?: StyleProfile, occasion?: string, attempt = 0): Promise<OracleVerdict> {
  const deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY).catch(() => null);

  const { pollen: _p, hourly: _h, daily: _d, sunrise: _sr, sunset: _ss, moonPhase: _mp, moonPhaseName: _mpn, moonPhaseIcon: _mpi, ...weatherCore } = weather;
  const payload = { weather: weatherCore, gender, styleProfile: profile, occasion };
  console.log('[Oracle] viaProxy attempt', attempt, JSON.stringify(payload, null, 2));

  let resp: Response;
  try {
    resp = await fetchWithTimeout(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(deviceId ? { 'X-Device-ID': deviceId } : {}),
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    const isTimeout = e instanceof Error && e.name === 'AbortError';
    console.log('[Oracle] fetch error — timeout:', isTimeout, e);
    if (isTimeout) throw new Error('The Oracle timed out. Check your connection and try again.');
    throw new Error('The Oracle requires a signal. Check your connection and try again.');
  }

  console.log('[Oracle] response status:', resp.status);

  if (!resp.ok) {
    if (resp.status === 429) {
      const retrySeconds = Number(resp.headers.get('Retry-After') ?? 86400);
      const hours = Math.ceil(retrySeconds / 3600);
      throw new Error(`The Oracle has spoken enough today. Available again in ${hours === 1 ? '1 hour' : `${hours} hours`}.`);
    }
    // 504 = Anthropic API gateway timeout — don't retry, fail immediately
    if (resp.status === 504) {
      throw new Error('The Oracle is unreachable right now. Anthropic may be experiencing issues — try again in a few minutes.');
    }
    // 529 = Cloudflare/Anthropic overloaded, 503/502 = transient upstream failure — auto-retry
    if ((resp.status === 529 || resp.status === 503 || resp.status === 502) && attempt < 2) {
      await new Promise(r => setTimeout(r, 1500 * (attempt + 1)));
      return viaProxy(weather, gender, profile, occasion, attempt + 1);
    }
    if (resp.status === 529 || resp.status === 503 || resp.status === 502) {
      // Surface Anthropic's actual message (e.g. "credit limit reached") if present
      const body = await resp.json().catch(() => ({})) as { error?: string };
      const detail = typeof body.error === 'string' ? ` ${body.error}` : '';
      throw new Error(`The Oracle is momentarily overwhelmed.${detail} Please try again in a moment.`);
    }
    if (resp.status >= 500) {
      throw new Error('The Oracle is momentarily unavailable. The fashion world waits.');
    }
    throw new Error('The Oracle is displeased. Something went wrong.');
  }

  const verdict = await resp.json().catch(() => {
    throw new Error('The Oracle is displeased. The response was unreadable.');
  }) as OracleVerdict;
  console.log('[Oracle] verdict received:', JSON.stringify(verdict, null, 2));
  return verdict;
}

async function viaDirect(weather: WeatherData, gender: string, apiKey: string, profile?: StyleProfile, occasion?: string): Promise<OracleVerdict> {
  const resp = await fetch(CLAUDE_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1800,
      messages: [{ role: 'user', content: buildPrompt(weather, gender, profile, occasion) }],
    }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err.error?.message ?? `Claude API error ${resp.status}`);
  }

  const data = await resp.json() as { content: { type: string; text: string }[] };
  const text = data.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('')
    .trim();

  const cleanText = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
  try {
    return JSON.parse(cleanText) as OracleVerdict;
  } catch {
    throw new Error('The Oracle returned an unreadable response. Please try again.');
  }
}

export async function fetchOracleVerdict(
  weather: WeatherData,
  gender: string,
  apiKey: string,
  profile?: StyleProfile,
  occasion?: string,
): Promise<OracleVerdict> {
  return PROXY_URL
    ? viaProxy(weather, gender, profile, occasion)
    : viaDirect(weather, gender, apiKey, profile, occasion);
}
