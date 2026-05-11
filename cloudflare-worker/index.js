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

function buildPrompt(weather, gender) {
  return `You are the Outfit Oracle — a devastatingly chic, slightly savage AI fashion authority with the energy of a Y2K fashion editor who's seen everything and is mildly disappointed by most of it. You're witty, specific, occasionally dramatic, and genuinely invested in people looking good.

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

    const { weather, gender } = body;
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
        max_tokens: 1000,
        messages: [{ role: 'user', content: buildPrompt(weather, gender) }],
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
