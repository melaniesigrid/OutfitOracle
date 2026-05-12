/**
 * Outfit Oracle — Cloudflare Worker proxy
 *
 * Keeps the Anthropic API key server-side. The app posts
 * { weather, gender } and receives an OracleVerdict JSON object.
 *
 * Deploy:
 *   cd cloudflare-worker
 *   npx wrangler kv:namespace create "RATE_LIMIT_KV"   ← copy the id into wrangler.toml
 *   npx wrangler deploy
 *   npx wrangler secret put ANTHROPIC_API_KEY           ← paste your key when prompted
 *
 * Then add to .env:
 *   EXPO_PUBLIC_PROXY_URL=https://outfit-oracle-proxy.<your-subdomain>.workers.dev
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const RATE_LIMIT_REQUESTS = 20; // per window
const RATE_LIMIT_WINDOW_S = 3600; // 1 hour

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

async function checkRateLimit(request, env) {
  // Gracefully skip rate limiting if KV namespace isn't wired up yet
  if (!env.RATE_LIMIT_KV) return { limited: false };

  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  const key = `rl:${ip}`;
  const now = Date.now();
  const windowMs = RATE_LIMIT_WINDOW_S * 1000;

  const record = (await env.RATE_LIMIT_KV.get(key, { type: 'json' }))
    ?? { count: 0, resetAt: now + windowMs };

  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + windowMs;
  }

  if (record.count >= RATE_LIMIT_REQUESTS) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return { limited: true, retryAfter };
  }

  record.count++;
  await env.RATE_LIMIT_KV.put(key, JSON.stringify(record), {
    expirationTtl: RATE_LIMIT_WINDOW_S,
  });
  return { limited: false };
}

const BUDGET_NOTES = {
  'high-street':  'ASOS, Zara, & Other Stories',
  'contemporary': 'Reiss, AllSaints, COS',
  'luxury':       'Totême, Bottega, The Row',
};

const PERSONALITY_VOICE = {
  diplomatic: 'Adopt a measured, neutral, and informative tone. Give clear recommendations without strong opinions or dramatic commentary.',
  editorial:  "Be opinionated, direct, and editorial. Deliver verdicts with confidence. Use the Oracle's distinctive voice — witty, specific, slightly savage.",
  savage:     'Be ruthlessly honest. If the weather is terrible or certain choices are unacceptable, say so with sharp wit and zero softening. Fashion is a serious matter.',
};

function buildPrompt(weather, gender, styleProfile, occasion) {
  const voiceInstruction = PERSONALITY_VOICE[styleProfile?.personality ?? 'editorial'];
  const profileSection = styleProfile?.keywords?.length
    ? `\nUser style profile:\n- Name: ${styleProfile.name ?? 'The Devotee'}\n- Aesthetic: ${styleProfile.keywords.join(', ')}\n- Budget tier: ${styleProfile.budget} (${BUDGET_NOTES[styleProfile.budget] ?? ''})\nTailor all item recommendations to this aesthetic and budget range.\n`
    : '';
  const occasionNote = occasion && occasion !== 'Any'
    ? `- Occasion: ${occasion} — shape every recommendation specifically for this context.\n`
    : '';
  const tempNote = styleProfile?.tempSensitivity === 'runs-cold'
    ? `- Temperature sensitivity: This person runs cold — lean toward warmer layers and heavier fabrics than the thermometer alone might suggest.\n`
    : styleProfile?.tempSensitivity === 'runs-hot'
    ? `- Temperature sensitivity: This person runs hot — recommend lighter, more breathable pieces than the temperature might suggest.\n`
    : '';
  const colorLoves  = styleProfile?.colorLoves?.length  ? `- Colour loves: ${styleProfile.colorLoves.join(', ')} — weave these into picks where possible.\n`  : '';
  const colorAvoids = styleProfile?.colorAvoids?.length ? `- Colour avoids: ${styleProfile.colorAvoids.join(', ')} — never recommend items in these colours.\n` : '';
  const colorNote   = colorLoves + colorAvoids;

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
    { "category": "Outer Layer", "item": "polished item or 'None needed — the universe has gifted you warmth'", "detail": "why this makes sense for the temperature", "accentColor": "coral" },
    { "category": "Footwear", "item": "polished item", "detail": "practical and stylish reasoning", "accentColor": "lemon" },
    { "category": "Accessories", "item": "considered accessories", "detail": "complete the polished look", "accentColor": "iris" }
  ],
  "outfitsAlt": [
    { "category": "Top", "item": "casual, relaxed item for the same weather", "detail": "styling note — this is the off-duty, effortless version", "accentColor": "mint" },
    { "category": "Bottom", "item": "casual item", "detail": "styling note", "accentColor": "lavender" },
    { "category": "Outer Layer", "item": "casual item or 'None needed — the universe has gifted you warmth'", "detail": "why this makes sense for the temperature", "accentColor": "coral" },
    { "category": "Footwear", "item": "casual item", "detail": "practical and relaxed reasoning", "accentColor": "lemon" },
    { "category": "Accessories", "item": "minimal accessories", "detail": "finish the casual look", "accentColor": "iris" }
  ],
  "avoid": ["specific item to avoid", "another mistake", "one more thing the Oracle forbids"]
}`;
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405);
    }

    const rateCheck = await checkRateLimit(request, env);
    if (rateCheck.limited) {
      return json(
        { error: `Too many requests. Please wait ${rateCheck.retryAfter}s before trying again.` },
        429
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON body' }, 400);
    }

    const { weather, gender, styleProfile, occasion } = body;
    if (!weather || !gender) {
      return json({ error: 'Missing required fields: weather, gender' }, 400);
    }

    const claudeResp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1800,
        messages: [{ role: 'user', content: buildPrompt(weather, gender, styleProfile, occasion) }],
      }),
    });

    if (!claudeResp.ok) {
      const err = await claudeResp.json().catch(() => ({}));
      return json(
        { error: err.error?.message ?? `Claude API error ${claudeResp.status}` },
        claudeResp.status
      );
    }

    const data = await claudeResp.json();
    const text = data.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('')
      .trim();

    let verdict;
    try {
      verdict = JSON.parse(text);
    } catch {
      return json({ error: 'The Oracle returned an unreadable response. Please try again.' }, 502);
    }

    return json(verdict);
  },
};
