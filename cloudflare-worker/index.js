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
  'Access-Control-Allow-Headers': 'Content-Type, X-Device-ID',
};

const RATE_LIMIT_REQUESTS  = 20;    // per window
const RATE_LIMIT_WINDOW_S  = 86400; // 24 hours (daily limit)
const FOUNDING_MEMBER_CAP  = 100;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseDeviceId(request) {
  const id = request.headers.get('X-Device-ID');
  return id && UUID_RE.test(id) ? id : null;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

async function checkRateLimit(request, env) {
  // Gracefully skip rate limiting if KV namespace isn't wired up yet
  if (!env.RATE_LIMIT_KV) return { limited: false };

  // Validated UUID device ID primary; CF-Connecting-IP fallback for web clients.
  // Caller guarantees at least one is present before this function is called.
  const rateLimitKey = parseDeviceId(request) ?? request.headers.get('CF-Connecting-IP');
  const key = `rl:${rateLimitKey}`;
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
    { "category": "Top", "item": "daytime item — functional and appropriate for the occasion and daylight hours", "detail": "why it works for the day", "accentColor": "mint" },
    { "category": "Bottom", "item": "daytime item", "detail": "styling note", "accentColor": "lavender" },
    { "category": "Outer Layer", "item": "daytime outer layer or 'None needed — the universe has gifted you warmth'", "detail": "why this makes sense for the temperature during the day", "accentColor": "coral" },
    { "category": "Footwear", "item": "daytime footwear — practical and stylish", "detail": "practical and stylish reasoning", "accentColor": "lemon" },
    { "category": "Accessories", "item": "daytime accessories", "detail": "complete the daytime look", "accentColor": "iris" }
  ],
  "outfitsAlt": [
    { "category": "Top", "item": "evening/night item — same weather, different energy after dark", "detail": "why it shifts the look for night", "accentColor": "mint" },
    { "category": "Bottom", "item": "evening item", "detail": "styling note", "accentColor": "lavender" },
    { "category": "Outer Layer", "item": "evening outer layer or 'None needed — the universe has gifted you warmth'", "detail": "why this makes sense for the temperature at night", "accentColor": "coral" },
    { "category": "Footwear", "item": "evening footwear — elevated where appropriate", "detail": "how it shifts the mood for night", "accentColor": "lemon" },
    { "category": "Accessories", "item": "evening accessories", "detail": "finish the night look", "accentColor": "iris" }
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

    // S2: require at least one verifiable identifier (CF-Connecting-IP is always
    // present in production Workers; absence means local wrangler dev without a
    // device ID, which we reject to avoid the shared 'unknown' rate-limit bucket).
    const deviceId = parseDeviceId(request);
    if (!deviceId && !request.headers.get('CF-Connecting-IP')) {
      return json({ error: 'Missing device identifier' }, 400);
    }

    const rateCheck = await checkRateLimit(request, env);
    if (rateCheck.limited) {
      return new Response(JSON.stringify({ error: 'Daily limit reached.' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(rateCheck.retryAfter),
          ...CORS,
        },
      });
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

    // Founding Member counter — first 100 unique devices earn the badge.
    // Reads are awaited (needed to set the flag before responding).
    // Writes are fire-and-forget (never delay the verdict).
    // Clear any foundingMember Claude may have hallucinated in the response JSON.
    delete verdict.foundingMember;
    // deviceId is already validated as a UUID (or null) from the early check above
    if (deviceId && env.RATE_LIMIT_KV) {
      const fmKey = `fm:${deviceId}`;
      try {
        const [existing, count] = await Promise.all([
          env.RATE_LIMIT_KV.get(fmKey),
          env.RATE_LIMIT_KV.get('fm:count', { type: 'json' }),
        ]);
        if (existing !== null) {
          // Device already counted — it's a Founding Member
          verdict.foundingMember = true;
        } else {
          const n = (count ?? 0) + 1;
          if (n <= FOUNDING_MEMBER_CAP) {
            verdict.foundingMember = true;
            // Fire-and-forget: writes never delay the verdict
            env.RATE_LIMIT_KV.put('fm:count', JSON.stringify(n)).catch(() => {});
            env.RATE_LIMIT_KV.put(fmKey, '1').catch(() => {});
          }
        }
      } catch {
        // KV errors are non-fatal — verdict returns without the badge
      }
    }

    return json(verdict);
  },
};
