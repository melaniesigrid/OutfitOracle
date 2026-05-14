import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeatherData } from './weather';
import { StyleProfile, OraclePersonality } from '../hooks/useStyleProfile';

const DEVICE_ID_KEY = '@outfit_oracle_device_id';

const CLAUDE_API  = 'https://api.anthropic.com/v1/messages';
const PROXY_URL   = process.env.EXPO_PUBLIC_PROXY_URL ?? '';

const BUDGET_NOTES: Record<string, string> = {
  'high-street':  'ASOS, Zara, & Other Stories',
  'contemporary': 'Reiss, AllSaints, COS',
  'luxury':       'Totême, Bottega, The Row',
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

// DEV-ONLY: this prompt is used by the viaDirect path (no proxy, local API key).
// Production uses the Cloudflare Worker's buildPrompt — keep both in sync when editing.
function buildPrompt(weather: WeatherData, gender: string, profile?: StyleProfile, occasion?: string): string {
  const voiceInstruction = PERSONALITY_VOICE[profile?.personality ?? 'editorial'];
  const profileSection = profile?.keywords?.length
    ? `\nUser style profile:\n- Name: ${profile.name ?? 'The Devotee'}\n- Aesthetic: ${profile.keywords.join(', ')}\n- Budget tier: ${profile.budget} (${BUDGET_NOTES[profile.budget] ?? ''})\nTailor all item recommendations to this aesthetic and budget range.\n`
    : '';
  const occasionNote = occasion && occasion !== 'Any'
    ? `- Occasion: ${occasion} — shape every recommendation specifically for this context.\n`
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

  return `You are the Outfit Oracle — a devastatingly chic AI fashion authority. ${voiceInstruction}
${profileSection}
Weather right now:
- City: ${weather.city}, ${weather.country}
- Temperature: ${weather.temp}°C (feels like ${weather.feelsLike}°C)
- Condition: ${weather.conditionLabel} — ${weather.description}
- Humidity: ${weather.humidity}%
- Wind: ${weather.windSpeed} km/h
- Dressing for: ${gender}
${occasionNote}${tempNote}${colorNote}
Respond ONLY with a valid JSON object — no markdown, no backticks, no preamble:

{
  "verdict": "2-3 punchy, slightly savage sentences about what this weather means for getting dressed. Be specific to the actual numbers. At least one wry or dramatic observation required.",
  "vibe": "3-5 word vibe name for the day, e.g. 'Cozy Intellectual', 'Apocalypse Chic', 'Main Character Winter'",
  "rating": <integer 1-5 representing how much effort/complexity the day demands — 1 is basic, 5 is full look>,
  "outfits": [
    { "category": "Top", "item": "daytime item — functional and appropriate for the occasion and daylight hours", "detail": "why it works for the day", "accentColor": "mint" },
    { "category": "Bottom", "item": "daytime item", "detail": "styling note", "accentColor": "lavender" },
    { "category": "Outer Layer", "item": "daytime outer layer or 'None needed — the universe has gifted you warmth'", "detail": "why this makes sense for ${weather.temp}°C during the day", "accentColor": "coral" },
    { "category": "Footwear", "item": "daytime footwear — practical and stylish", "detail": "practical and stylish reasoning", "accentColor": "lemon" },
    { "category": "Accessories", "item": "daytime accessories", "detail": "complete the daytime look", "accentColor": "iris" }
  ],
  "outfitsAlt": [
    { "category": "Top", "item": "evening/night item — same weather, different energy after dark", "detail": "why it shifts the look for night", "accentColor": "mint" },
    { "category": "Bottom", "item": "evening item", "detail": "styling note", "accentColor": "lavender" },
    { "category": "Outer Layer", "item": "evening outer layer or 'None needed — the universe has gifted you warmth'", "detail": "why this makes sense for ${weather.temp}°C at night", "accentColor": "coral" },
    { "category": "Footwear", "item": "evening footwear — elevated where appropriate", "detail": "how it shifts the mood for night", "accentColor": "lemon" },
    { "category": "Accessories", "item": "evening accessories", "detail": "finish the night look", "accentColor": "iris" }
  ],
  "avoid": ["specific item to avoid", "another mistake", "one more thing the Oracle forbids"]
}`;
}

async function viaProxy(weather: WeatherData, gender: string, profile?: StyleProfile, occasion?: string): Promise<OracleVerdict> {
  const deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY).catch(() => null);

  let resp: Response;
  try {
    resp = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(deviceId ? { 'X-Device-ID': deviceId } : {}),
      },
      body: JSON.stringify({ weather, gender, styleProfile: profile, occasion }),
    });
  } catch {
    throw new Error('The Oracle requires a signal. Check your connection and try again.');
  }

  if (!resp.ok) {
    if (resp.status === 429) {
      const retrySeconds = Number(resp.headers.get('Retry-After') ?? 86400);
      const hours = Math.ceil(retrySeconds / 3600);
      throw new Error(`The Oracle has spoken enough today. Available again in ${hours === 1 ? '1 hour' : `${hours} hours`}.`);
    }
    if (resp.status >= 500) {
      throw new Error('The Oracle is momentarily unavailable. The fashion world waits.');
    }
    throw new Error('The Oracle is displeased. Something went wrong.');
  }

  return resp.json().catch(() => {
    throw new Error('The Oracle is displeased. The response was unreadable.');
  }) as Promise<OracleVerdict>;
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

  try {
    return JSON.parse(text) as OracleVerdict;
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
