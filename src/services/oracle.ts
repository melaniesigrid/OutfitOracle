import { WeatherData } from './weather';
import { StyleProfile, OraclePersonality } from '../hooks/useStyleProfile';

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
}

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
    { "category": "Top", "item": "polished, put-together item", "detail": "styling note — this is the elevated, considered look", "accentColor": "mint" },
    { "category": "Bottom", "item": "polished item", "detail": "styling note", "accentColor": "lavender" },
    { "category": "Outer Layer", "item": "polished item or 'None needed — the universe has gifted you warmth'", "detail": "why this makes sense for ${weather.temp}°C", "accentColor": "coral" },
    { "category": "Footwear", "item": "polished item", "detail": "practical and stylish reasoning", "accentColor": "lemon" },
    { "category": "Accessories", "item": "considered accessories", "detail": "complete the polished look", "accentColor": "iris" }
  ],
  "outfitsAlt": [
    { "category": "Top", "item": "casual, relaxed item for the same weather", "detail": "styling note — this is the off-duty, effortless version", "accentColor": "mint" },
    { "category": "Bottom", "item": "casual item", "detail": "styling note", "accentColor": "lavender" },
    { "category": "Outer Layer", "item": "casual item or 'None needed — the universe has gifted you warmth'", "detail": "why this makes sense for ${weather.temp}°C", "accentColor": "coral" },
    { "category": "Footwear", "item": "casual item", "detail": "practical and relaxed reasoning", "accentColor": "lemon" },
    { "category": "Accessories", "item": "minimal accessories", "detail": "finish the casual look", "accentColor": "iris" }
  ],
  "avoid": ["specific item to avoid", "another mistake", "one more thing the Oracle forbids"]
}`;
}

async function viaProxy(weather: WeatherData, gender: string, profile?: StyleProfile, occasion?: string): Promise<OracleVerdict> {
  const resp = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ weather, gender, styleProfile: profile, occasion }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? `Proxy error ${resp.status}`);
  }

  return resp.json() as Promise<OracleVerdict>;
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
