import { WeatherData } from './weather';

const CLAUDE_API = 'https://api.anthropic.com/v1/messages';

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
  avoid: string[];
  rating: number;
}

export async function fetchOracleVerdict(
  weather: WeatherData,
  gender: string,
  apiKey: string
): Promise<OracleVerdict> {
  const prompt = `You are the Outfit Oracle — a devastatingly chic, slightly savage AI fashion authority with the energy of a Y2K fashion editor who's seen everything and is mildly disappointed by most of it. You're witty, specific, occasionally dramatic, and genuinely invested in people looking good.

Weather right now:
- City: ${weather.city}, ${weather.country}
- Temperature: ${weather.temp}°C (feels like ${weather.feelsLike}°C)
- Condition: ${weather.conditionLabel} — ${weather.description}
- Humidity: ${weather.humidity}%
- Wind: ${weather.windSpeed} km/h
- Dressing for: ${gender}

Respond ONLY with a valid JSON object — no markdown, no backticks, no preamble:

{
  "verdict": "2-3 punchy, slightly savage sentences about what this weather means for getting dressed. Be specific to the actual numbers. At least one wry or dramatic observation required.",
  "vibe": "3-5 word vibe name for the day, e.g. 'Cozy Intellectual', 'Apocalypse Chic', 'Main Character Winter'",
  "rating": <integer 1-5 representing how much effort/complexity the day demands — 1 is basic, 5 is full look>,
  "outfits": [
    { "category": "Top", "item": "specific item", "detail": "styling note or sassy observation", "accentColor": "mint" },
    { "category": "Bottom", "item": "specific item", "detail": "styling note", "accentColor": "lavender" },
    { "category": "Outer Layer", "item": "specific item or 'None needed — the universe has gifted you warmth'", "detail": "why this makes sense for ${weather.temp}°C", "accentColor": "coral" },
    { "category": "Footwear", "item": "specific item", "detail": "practical and stylish reasoning", "accentColor": "lemon" },
    { "category": "Accessories", "item": "specific items", "detail": "complete the look", "accentColor": "iris" }
  ],
  "avoid": ["specific item to avoid", "another mistake", "one more thing the Oracle forbids"]
}`;

  const resp = await fetch(CLAUDE_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error?.message ?? `Claude API error ${resp.status}`);
  }

  const data = await resp.json();
  const text: string = data.content
    .filter((b: { type: string }) => b.type === 'text')
    .map((b: { text: string }) => b.text)
    .join('')
    .trim();

  try {
    return JSON.parse(text) as OracleVerdict;
  } catch {
    throw new Error('The Oracle returned an unreadable response. Please try again.');
  }
}
