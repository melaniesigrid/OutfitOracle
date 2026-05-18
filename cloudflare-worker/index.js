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
  'high-street':  'accessible price point; everyday retail, resale, and budget-friendly finds',
  'contemporary': 'mid-range investment pieces; better fabrics, construction, and modern labels',
  'luxury':       'designer or atelier-level pieces; refined materials, longevity, and restraint',
};

const PERSONALITY_VOICE = {
  diplomatic: 'Adopt a measured, neutral, and informative tone. Give clear recommendations without strong opinions or dramatic commentary.',
  editorial:  "Be opinionated, direct, and editorial. Deliver verdicts with confidence. Use the Oracle's distinctive voice — witty, specific, slightly savage.",
  savage:     'Be ruthlessly honest. If the weather is terrible or certain choices are unacceptable, say so with sharp wit and zero softening. Fashion is a serious matter.',
};

function getTimeContext() {
  const h = new Date().getHours();
  if (h >= 5  && h < 9)  return 'Early morning (5–9am) — the city is waking up; practical, fresh-start energy';
  if (h >= 9  && h < 12) return 'Mid-morning (9am–noon) — the day is underway; consider where the wearer needs to be by midday';
  if (h >= 12 && h < 14) return 'Midday (noon–2pm) — peak activity; the look must hold up to full daylight and movement';
  if (h >= 14 && h < 17) return 'Afternoon (2–5pm) — the day is in full swing; light is shifting toward golden hour';
  if (h >= 17 && h < 20) return 'Early evening (5–8pm) — transitional golden hour; the day look should carry into evening, or the evening look should now lead';
  if (h >= 20 && h < 23) return 'Evening (8–11pm) — night energy is here; social, after-dark, the city has shifted';
  return 'Late night / early hours — minimal, quiet city energy; the Oracle suggests something unfussy';
}

const DEFAULT_LAT = 45; // Northern Hemisphere fallback when no GPS fix is available

function getSeason(month, lat) {
  const isNorthern = (lat ?? DEFAULT_LAT) >= 0;
  const m = isNorthern ? month : (month + 6) % 12;
  if (m >= 2 && m <= 4) return 'Spring';
  if (m >= 5 && m <= 7) return 'Summer';
  if (m >= 8 && m <= 10) return 'Autumn';
  return 'Winter';
}

function buildOccasionSection(occasion) {
  if (!occasion || occasion === 'Any') {
    return '- Occasion: Going about the day — balance practicality with considered style for errands, lunch, and wherever the day leads.\n';
  }
  const guides = {
    'Work':    '- Occasion: WORK — professional or semi-professional environment. Structured pieces, intentional tailoring, nothing gym or ultra-casual. Day: appropriately polished. Night (outfitsAlt): loosens toward post-work dinner or drinks — still refined but more personal.\n',
    'Date':    '- Occasion: DATE — confident and attractive, not costumed. Flattering silhouettes, a considered detail or two. Day: afternoon coffee or gallery energy. Night (outfitsAlt): dinner or bar energy — warmer, slightly more intimate.\n',
    'Event':   '- Occasion: EVENT — something worth attending. Elevated fabrics, clean silhouette, at least one intentional moment (statement shoe, jewellery, or considered layer). Not casual. Not costume. The Oracle requires effort.\n',
    'Weekend': '- Occasion: WEEKEND — deliberate ease. Not lazy, not polished. Comfortable enough for a long walk, stylish enough for an unexpected plan. Elevated casual: quality denim, a great knit, relaxed separates. No gym wear.\n',
    'Active':  '- Occasion: ACTIVE — mobility and practicality are non-negotiable. Elevated athleisure that looks intentional, layers built for movement, shoes for actual activity. Day: genuinely functional. Night (outfitsAlt): can shift toward social energy if activity is daytime.\n',
  };
  return guides[occasion] ?? `- Occasion: ${occasion} — shape every recommendation specifically for this context.\n`;
}

function buildPrompt(weather, gender, styleProfile, occasion) {
  const voiceInstruction = PERSONALITY_VOICE[styleProfile?.personality ?? 'editorial'];
  const profileSection = styleProfile?.keywords?.length
    ? `\nUser style profile:\n- Name: ${styleProfile.name ?? 'The Devotee'}\n- Aesthetic: ${styleProfile.keywords.join(', ')}\n- Budget tier: ${styleProfile.budget} (${BUDGET_NOTES[styleProfile.budget] ?? ''})\n\nThe verdict must speak to what this specific weather means for this specific aesthetic. A "quiet luxury minimalist" in 12°C overcast hears something different from a "vintage eclectic maximalist" in the same conditions. Tailor the vibe, verdict, and every pick to their profile.\n`
    : '';
  const occasionSection = buildOccasionSection(occasion);
  const sizeNote = styleProfile?.size
    ? `- Clothing size: ${styleProfile.size} — recommend fits and proportions suited to this size. An oversized silhouette reads differently on XS vs L; tailor cut and volume accordingly.\n`
    : '';
  const tempNote = styleProfile?.tempSensitivity === 'runs-cold'
    ? `- Temperature sensitivity: This person runs cold — lean toward warmer layers and heavier fabrics than the thermometer alone might suggest.\n`
    : styleProfile?.tempSensitivity === 'runs-hot'
    ? `- Temperature sensitivity: This person runs hot — recommend lighter, more breathable pieces than the temperature might suggest.\n`
    : '';
  const colorLoves  = styleProfile?.colorLoves?.length  ? `- Colour loves: ${styleProfile.colorLoves.join(', ')} — weave these into picks where possible.\n`  : '';
  const colorAvoids = styleProfile?.colorAvoids?.length ? `- Colour avoids: ${styleProfile.colorAvoids.join(', ')} — never recommend items in these colours.\n` : '';
  const colorNote   = colorLoves + colorAvoids;

  const season = getSeason(new Date().getMonth(), weather.latitude);
  const timeContext = getTimeContext();

  const uvNote = weather.uvIndex !== undefined
    ? `- UV Index: ${weather.uvIndex}${weather.uvIndex >= 8 ? ' — VERY HIGH: sun protection is non-negotiable; recommend sunglasses and SPF-rated layers' : weather.uvIndex >= 6 ? ' — High: sunglasses and a hat are wise' : ''}\n`
    : '';

  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  const windNote = weather.windDirection !== undefined
    ? `- Wind: ${weather.windSpeed} km/h from the ${dirs[Math.round(weather.windDirection / 22.5) % 16]}\n`
    : `- Wind: ${weather.windSpeed} km/h\n`;

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
- Freezing rain or ice: Warn explicitly — grippy, waterproof boots are required for safety.

VARIETY MANDATE: Avoid predictable defaults. Every pick must feel specific to this city, this aesthetic, this exact weather — not a generic outfit for any day. Do not default to: plain white t-shirt, straight-leg jeans, black coat, white sneakers unless there is a strong specific reason. Make personality-driven, unexpected-but-correct choices.

BRAND RULE — strict: Do not include brand names, designer names, retailer names, store names, logos, or label references in "item", "detail", "verdict", "vibe", "outfitsAlt", or "avoid". Describe the outfit itself: garment type, fabric, cut, color, weather function, and styling. The only exception is a genuinely exclusive non-generic item or a vetted affiliate-link item explicitly supplied by the app. No affiliate item list is supplied in this request, so default to zero brand names.

Respond ONLY with valid JSON — no markdown, no backticks, no preamble:

{
  "verdict": "3-4 sentences about what this specific weather means for dressing today. If a style profile exists, frame it through that aesthetic — a quiet luxury minimalist and a vintage maximalist should receive different verdicts in the same conditions. Name the actual temperature. Be opinionated. Include at least one wry or sharp observation.",
  "vibe": "3-5 word vibe name that is specific to this day, this weather, and this person — not generic. Example formats: 'Soft Intellectual Monday', 'Warm Girl Summer Errands', 'Apocalypse Chic'. Make it feel earned.",
  "rating": <integer 1-5 representing effort and complexity the day demands — 1 is minimal, 5 is maximum occasion>,
  "outfits": [
    { "category": "Top", "item": "specific, personality-appropriate daytime top for this weather and occasion — not a default", "detail": "why it is the right call for the temperature and the occasion", "accentColor": "mint" },
    { "category": "Bottom", "item": "specific daytime bottom that works for the weather and occasion", "detail": "styling and weather rationale", "accentColor": "lavender" },
    { "category": "Outer Layer", "item": "weather-appropriate outer layer — if feels-like above 21°C and not raining, use exactly: 'None needed — ${weather.feelsLike}°C is the look'", "detail": "why this is the correct outer decision for ${weather.feelsLike}°C feels-like", "accentColor": "coral" },
    { "category": "Footwear", "item": "occasion- and weather-correct footwear — waterproof if raining, breathable if warm", "detail": "why this footwear suits both the weather and the occasion", "accentColor": "lemon" },
    { "category": "Accessories", "item": "weather-informed accessories — umbrella if rain, scarf if cold, sunglasses if sunny", "detail": "how this completes and protects the look", "accentColor": "iris" }
  ],
  "outfitsAlt": [
    { "category": "Top", "item": "evening top — shift the energy for after dark, don't just swap one piece", "detail": "what changes and why for the evening context", "accentColor": "mint" },
    { "category": "Bottom", "item": "evening bottom — may be the same or elevated", "detail": "styling note", "accentColor": "lavender" },
    { "category": "Outer Layer", "item": "evening outer — remember: ${weather.feelsLike}°C feels cooler after sunset; apply the same feels-like temperature rules", "detail": "evening outer reasoning", "accentColor": "coral" },
    { "category": "Footwear", "item": "elevated evening footwear appropriate for the occasion and weather", "detail": "how it shifts the mood for night", "accentColor": "lemon" },
    { "category": "Accessories", "item": "evening accessories — differ from daytime where possible", "detail": "finish the night look", "accentColor": "iris" }
  ],
  "avoid": ["specific wrong item for this exact weather and occasion combination", "another actual mistake for these specific conditions", "one more thing the Oracle forbids today"]
}`;
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    const { pathname } = new URL(request.url);

    // Diagnostic: test Anthropic reachability from this Worker's data center
    if (pathname === '/ping' && request.method === 'GET') {
      const t0 = Date.now();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      let status, ms, error;
      try {
        const r = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 5, messages: [{ role: 'user', content: 'hi' }] }),
        });
        status = r.status;
        ms = Date.now() - t0;
      } catch (e) {
        error = e && e.name === 'AbortError' ? 'timeout >8s' : String(e);
        ms = Date.now() - t0;
      } finally {
        clearTimeout(timer);
      }
      return new Response(JSON.stringify({ status, ms, error: error ?? null }), {
        headers: { 'Content-Type': 'application/json', ...CORS },
      });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405);
    }

    // ── /image route: proxy fal.ai requests server-side so the key never ships in the bundle ──
    if (pathname === '/image') {
      // Require device identifier and rate-limit (same gates as oracle route)
      const imgDeviceId = parseDeviceId(request);
      if (!imgDeviceId && !request.headers.get('CF-Connecting-IP')) {
        return json({ error: 'Missing device identifier' }, 400);
      }
      const imgRateCheck = await checkRateLimit(request, env);
      if (imgRateCheck.limited) {
        return new Response(JSON.stringify({ error: 'Daily limit reached.' }), {
          status: 429,
          headers: { 'Content-Type': 'application/json', 'Retry-After': String(imgRateCheck.retryAfter), ...CORS },
        });
      }
      let body;
      try { body = await request.json(); } catch { return json({ error: 'Invalid JSON body' }, 400); }
      const { prompt } = body;
      if (typeof prompt !== 'string' || !prompt.trim()) return json({ error: 'Missing prompt' }, 400);
      if (prompt.length > 5000) return json({ error: 'Prompt too long' }, 400);
      if (!env.FAL_KEY) return json({ error: 'Image generation not configured' }, 503);

      const falResp = await fetch('https://fal.run/fal-ai/flux-pro/v1.1', {
        method: 'POST',
        headers: { 'Authorization': `Key ${env.FAL_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, image_size: 'portrait_4_3', num_images: 1, output_format: 'jpeg' }),
      });
      if (!falResp.ok) {
        const err = await falResp.json().catch(() => ({}));
        return json({ error: err.detail ?? `fal.ai error ${falResp.status}` }, falResp.status);
      }
      const data = await falResp.json();
      return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } });
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

    let { weather, gender, styleProfile } = body;
    const VALID_OCCASIONS = new Set(['Work', 'Date', 'Event', 'Weekend', 'Active', 'Any']);
    const occasion = VALID_OCCASIONS.has(body.occasion) ? body.occasion : 'Any';
    if (!weather || !gender) {
      return json({ error: 'Missing required fields: weather, gender' }, 400);
    }

    // Validate and sanitize weather + gender to prevent prompt injection
    const VALID_GENDERS = new Set(['Men', 'Women']);
    gender = VALID_GENDERS.has(gender) ? gender : 'Women';
    if (typeof weather.city !== 'string' || !weather.city.trim()) {
      return json({ error: 'Invalid weather data: city required' }, 400);
    }
    weather.city    = String(weather.city).slice(0, 100);
    weather.country = String(weather.country ?? '').slice(0, 100);

    // Cap styleProfile fields to prevent prompt bloat and injection via long strings
    if (styleProfile) {
      if (styleProfile.name) styleProfile.name = String(styleProfile.name).slice(0, 100);
      if (Array.isArray(styleProfile.keywords)) styleProfile.keywords = styleProfile.keywords.slice(0, 20).map(k => String(k).slice(0, 50));
      if (Array.isArray(styleProfile.colorLoves)) styleProfile.colorLoves = styleProfile.colorLoves.slice(0, 20).map(c => String(c).slice(0, 50));
      if (Array.isArray(styleProfile.colorAvoids)) styleProfile.colorAvoids = styleProfile.colorAvoids.slice(0, 20).map(c => String(c).slice(0, 50));
    }

    const claudeController = new AbortController();
    const claudeTimer = setTimeout(() => claudeController.abort(), 40_000);
    let claudeResp;
    try {
      claudeResp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        signal: claudeController.signal,
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
    } catch (e) {
      if (e && e.name === 'AbortError') {
        return json({ error: 'Anthropic API timed out. Please try again in a moment.' }, 504);
      }
      throw e;
    } finally {
      clearTimeout(claudeTimer);
    }

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

    if (data.stop_reason === 'max_tokens') {
      return json({ error: 'Response truncated — Anthropic hit the token limit. Try again.' }, 502);
    }

    // Claude sometimes wraps the JSON in markdown code fences despite instructions — strip them
    const cleanText = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();

    let verdict;
    try {
      verdict = JSON.parse(cleanText);
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
