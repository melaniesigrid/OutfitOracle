# Outfit Oracle — Editorial Image Generation
**Product + Engineering Spec**  
*Last updated: May 2026*

---

## Overview

Outfit Oracle generates a cinematic editorial photograph for every oracle consultation. The image appears on the Today screen immediately after the verdict is returned, giving users a visual reference for the outfit — not a catalog photo, but an emotional mood piece that makes the recommendation feel aspirational and personally relevant.

This document covers the image generation directive (prompt engineering), the technical integration plan, and the product decisions behind the feature.

---

## Why Images

Text recommendations tell users what to wear. Images show them who they could be wearing it.

The oracle's verdict — "camel trench, cream ribbed knit, dark straight-leg trousers, leather loafer" — becomes abstract without visual context. A cinematic editorial image collapses the gap between recommendation and aspiration. The user sees themselves in the image and the outfit becomes emotionally inevitable.

This is the gap no competitor fills:
- Indyx: text lists and human-assembled mood boards
- Wishi: shoppable links, no imagery
- Stitch Fix: product catalog photography

Outfit Oracle's images should feel like stills from a fashion film the user wants to walk into.

---

## Visual Identity Directive

### Core Brand DNA

Every generated image must express:
- **Vogue editorial sensibility** — opinionated, composed, intentional
- **Weather intelligence** — the image *feels* like 9°C and overcast, not just described
- **Feminine storytelling** — the woman in the image has a life, a mood, an interiority
- **Soft luxury** — expensive in taste, not necessarily in price
- **Romantic realism** — aspirational but believable, never fantasy

Reference aesthetics:
- Old fashion magazines found in a Paris apartment
- Sofia Coppola softness
- Miu Miu campaign restraint
- 1990s Vogue realism
- Quiet luxury / literary femininity
- Modern Central European elegance

### Never Generate
- Influencer content or "Instagram baddie" aesthetics
- Ecommerce product shots
- Exaggerated AI glamour or uncanny perfection
- Hypersexualized imagery
- TikTok fashion poses
- Fast fashion energy
- Pinterest collage aesthetics

---

## Image Objective

The image must instantly communicate:
1. Who this woman is and how she moves through the world
2. What the weather physically feels like
3. The emotional tone of the day
4. Why this outfit emotionally works — not just functionally

The outfit recommendation should feel **emotionally inevitable**.

The viewer should think: *"Yes. That is exactly the energy I want."*

---

## Visual Style Specifications

### Photography Style
- Cinematic editorial photography
- Soft atmospheric lighting with realistic shadows
- Shallow depth of field
- Soft grain — not clinical sharpness
- Luxury magazine lighting (warm but not artificial)
- Realistic skin texture (no over-airbrushing)
- Believable textile rendering — wool should look like wool

### Model Direction
- Intelligent, emotionally present, naturally beautiful
- Subtle asymmetry, realistic faces, soft eyes
- Nuanced expressions — understated confidence, not performed joy
- Natural body proportions — no impossible silhouettes
- Refined posture without stiffness

Avoid: overfilled lips, exaggerated jawlines, excessive makeup, uncanny symmetry, artificial beauty standards.

Beauty should feel cinematic, believable, timeless.

### Clothing Presentation
The clothing is the emotional architecture of the image.

Prioritize: silhouette, movement, layering, texture, fabric realism, color harmony, weather-appropriateness.

Clothing should feel: lived-in but aspirational, elegant but wearable, intentional but effortless.

Fabrics to render accurately: wool, cashmere, silk, cotton, linen, leather, brushed knits, structured tailoring, soft draping.

Never: loud logos, neon palettes, synthetic-looking textures, chaotic layering.

### Composition
Preferred framing:
- Medium portrait (most common)
- 3/4 body (standard)
- Full body editorial (for layered looks)
- Seated candid elegance
- Environmental portraiture

The full outfit — including footwear, coat structure, and accessories — must be visible. Never crop important layering.

### Lighting
- Overcast daylight (default — most weather states)
- Soft window light (interior settings)
- Golden hour (warm-weather consultations)
- Warm lamp glow (evening looks)
- Rainy city reflections (rain/storm weather)
- Muted winter daylight (cold conditions)

Avoid: harsh flash, oversaturated contrast, beauty dish glamour, HDR aesthetics.

### Environment
Backgrounds support the emotional narrative of the day.

Examples by weather/mood:
- Cold + quiet: Paris apartment, bookstore, train platform, museum lobby
- Rain: rainy sidewalk, old hotel hallway, café window
- Warm + sunny: coastal European town, university courtyard, open air market
- Evening: dim jazz bar, lamp-lit street, restaurant terrace

Environment should feel expensive in taste, not necessarily in money.

---

## The Image Generation Prompt

### Template Structure

```
[STYLE DIRECTIVE]
Generate a cinematic editorial fashion photograph. The aesthetic should feel like
a luxury fashion campaign — soft atmospheric lighting, realistic textures, shallow
depth of field, gentle grain. The model should appear intelligent, emotionally present,
and naturally beautiful — not influencer-styled, not AI-glamorized.

[OUTFIT]
The woman wears: {outfit_items_joined}

[WEATHER + ENVIRONMENT]
The setting is {city_or_environment}. The weather is {weather_description} —
{temperature_description}. The environment should physically feel like this weather.
{environment_detail}

[OCCASION]
She is dressed for {occasion}. The occasion should be visible in how she holds herself.

[EMOTIONAL DIRECTION]
The mood is {emotional_tone}. The aesthetic registers as {aesthetic_tags}.

[COMPOSITION]
Framing: {composition_type}. The full outfit — including coat, footwear, and
accessories — must be visible. The image should feel like a still from a fashion
film the viewer wants to walk into.

[PROHIBITIONS]
Do not generate: influencer aesthetics, ecommerce product shots, exaggerated AI
beauty, hypersexualized poses, distorted anatomy, logos, loud colors, or
synthetic-looking fabric textures.
```

### Runtime Data Mapping

| Prompt variable | Source |
|----------------|--------|
| `{outfit_items_joined}` | Claude verdict → `outfits` array, all items joined |
| `{city_or_environment}` | User-entered city from oracle consultation |
| `{weather_description}` | `weather.conditionLabel` + `weather.description` |
| `{temperature_description}` | `weather.temp`°C / `weather.feelsLike`°C |
| `{environment_detail}` | Derived from weather code → environment mapping |
| `{occasion}` | User-selected occasion from OracleScreen |
| `{emotional_tone}` | Claude verdict → `vibe` field |
| `{aesthetic_tags}` | Derived from style profile keywords + weather mood |
| `{composition_type}` | Derived from outfit complexity (layered = full body; simple = portrait) |

### Aesthetic Tag System

Mix naturally based on weather + style profile:

**Mood/aesthetic tags (combine 3–5):**
- old money, quiet luxury, romantic minimalism
- literary girl, European winter, soft intellectual
- editorial knitwear, modern classic, dreamcore realism
- cinematic melancholy, Central European elegance
- warm neutrals, vintage Vogue, post-Soviet luxury minimalism
- Parisian restraint, modern femininity, wistful elegance
- museum date, soft tailoring, rainy city romance
- espresso bar aesthetic, winter poetry energy

**Derivation logic:**
- Cold + overcast → cinematic melancholy, European winter, muted palette
- Warm + sunny → golden realism, soft femininity, airy romance
- Rain → rainy city romance, cinematic melancholy, moody reflections
- Work occasion → soft tailoring, modern femininity, editorial restraint
- Evening/event → quiet luxury, wistful elegance, warm shadows

---

## Example: Full Generated Prompt

**Input (from oracle consultation):**
- City: Montreal
- Weather: cold cloudy autumn afternoon, 9°C, feels like 6°C
- Occasion: Weekend
- Outfit: cream cashmere sweater, charcoal wool trousers, black leather loafers, camel overcoat, gold pendant necklace
- Vibe: "Soft Intellectual"
- Style profile keywords: quiet luxury, literary, minimalist

**Generated prompt:**
```
Generate a cinematic editorial fashion photograph. The aesthetic should feel like a
luxury fashion campaign — soft atmospheric lighting, realistic textures, shallow depth
of field, gentle grain. The model should appear intelligent, emotionally present, and
naturally beautiful — not influencer-styled, not AI-glamorized.

The woman wears: a cream cashmere sweater, charcoal wool trousers, black leather
loafers, a camel overcoat, and a delicate gold pendant necklace.

The setting is Montreal in late autumn. The weather is cold and overcast — 9°C,
feels like 6°C. The environment should physically feel like this cold grey afternoon.
She stands outside a used bookstore on a quiet street, fallen leaves on the pavement.

She is dressed for a relaxed weekend. The occasion should be visible in how she
holds herself — unhurried, at ease, with somewhere interesting to go.

The mood is thoughtful and romantically grounded — "Soft Intellectual". The aesthetic
registers as: literary girl, quiet luxury, Central European elegance, cinematic
melancholy, warm neutrals.

Framing: 3/4 body, slightly loose composition with environmental context visible. The
full outfit — including the camel overcoat structure, loafers, and necklace — must be
clearly readable. The image should feel like a still from a fashion film the viewer
wants to walk into.

Do not generate: influencer aesthetics, ecommerce product shots, exaggerated AI
beauty, hypersexualized poses, distorted anatomy, logos, loud colors, or
synthetic-looking fabric textures.
```

---

## Technical Integration

### Status: Shipped

Image generation is live. The feature is silently disabled when `EXPO_PUBLIC_FAL_KEY` is not set — no crashes, no error states.

### API Selection

fal.ai FLUX Pro v1.1 was selected and is live in production.

| Service | Model | Decision |
|---------|-------|----------|
| **fal.ai** | **FLUX Pro v1.1** | **✅ Selected — best editorial realism, direct REST API, no SDK required** |
| Anthropic | Native multimodal | Not yet available for image generation |
| Stability AI | SD 3.5 | Lower quality ceiling for photorealism |
| OpenAI | DALL-E 3 | Illustrative rather than photographic |

**Endpoint:** `POST https://fal.run/fal-ai/flux-pro/v1.1`  
**Auth:** `Authorization: Key <EXPO_PUBLIC_FAL_KEY>`  
**Output:** 832×1040px JPEG (~4:5 portrait), synchronous response, ~10–20s per image

### Files Shipped

| File | Role |
|------|------|
| `src/services/imageGeneration.ts` | fal.ai REST call + prompt builder (outfit items, weather, vibe, aesthetic tags) |
| `src/hooks/useOracleImage.ts` | Loading state, AsyncStorage cache, cancel-on-reset logic |
| `src/components/OracleImage.tsx` | Shimmer → fade-in image → tap-to-fullscreen modal, regenerate button |
| `src/screens/OracleScreen.tsx` | Hook wired in, `<OracleImage>` placed above WeatherStrip in results |

### Actual Data Flow

```
EditorialOracleScreen (verdict lands)
  → useOracleImage(status='done', verdict, weather, occasion, profile)
    → check AsyncStorage for cached image (key: city + vibe + occasion)
    → if cached: display immediately (no network call)
    → if fresh consult + no cache: buildImagePrompt() → POST fal.ai → URL
  → OracleImage component: shimmer while loading, fade-in on done, null on idle
```

Image generation fires **automatically** after the oracle verdict arrives. It does not block the verdict display — the outfit cards and vibe text appear immediately, and the image fades in above them as it loads.

### Caching

Cache key: `@oracle_image_v1_{city}_{vibe}_{occasion}` (normalised, lowercased)  
Storage: AsyncStorage on device. No server-side persistence.  
Hit rate: high — same city + weather mood + occasion returns the cached image instantly.  
Stale images: fal.ai CDN URLs expire after 24–48 hours. After expiry the image will fail to load silently; a tap on "Try Again" regenerates.

### Setup

Add to `.env` or `.env.local`:
```
EXPO_PUBLIC_FAL_KEY=fal-xxxxxxxx
```

**Critical:** `EXPO_PUBLIC_*` variables are baked into the JS bundle at build time, not hot-reloaded. After adding or changing this key, you must **fully quit and restart the bundler** (`npx expo run:ios` or `npx expo start --clear`). The running simulator will not pick up the new key without a restart. The symptom of a missing or stale key is no image and no shimmer — the component returns `null` silently.

> fal.ai keys are bundled client-side (same pattern as PostHog). Before external TestFlight: set a **monthly spend cap** in the fal.ai dashboard at `fal.ai/dashboard/billing`. At 1 consult/day per user this costs ~$1.80/user/month with FLUX Pro.

### Cost Model

**Usage assumption:** 1 city query per day, location-based, one outfit image per consult.

**Per-user cost (FLUX Pro at ~$0.06/image):**

| Timeframe | Cost per active user |
|-----------|---------------------|
| Per day | $0.06 |
| Per month (30 days) | $1.80 |
| Per year | $21.90 |

**Fleet cost at scale:**

| DAU | Daily | Monthly | Annual |
|-----|-------|---------|--------|
| 100 | $6 | $180 | $2,190 |
| 1,000 | $60 | $1,800 | $21,900 |
| 5,000 | $300 | $9,000 | $109,500 |
| 10,000 | $600 | $18,000 | $219,000 |

**Subscription math:** Oracle Pro is priced at $4.99/month. Image generation costs $1.80/user/month at full daily usage — 36% of subscription revenue. This is acceptable at scale but means images must be gated behind Pro, or the free tier must be limited (e.g. 3 images/week free, unlimited for Pro).

**Cost reduction levers:**
- FLUX Schnell (~$0.003/image) is 20× cheaper with slightly lower realism — viable for free tier
- FLUX Pro Ultra (~$0.08/image) is the premium ceiling — use only for Pro subscribers or special occasions
- Caching: `useOracleImage` already caches per city + vibe + occasion in AsyncStorage; repeat queries cost nothing
- Regenerations count as additional images — rate-limit to 2 regenerations/day on free tier

**Free tier approach:** 1 image/day free (FLUX Schnell); unlimited regenerations and FLUX Pro quality as a paid Pro feature.

---

## Product Decisions

**Q: Should the image show the user's actual wardrobe items?**  
Not yet. Pre-wardrobe-upload, the image is an editorial mood piece representing the *style* of the outfit, not the exact garments. Post-wardrobe-upload, the image could incorporate recognizable versions of the user's actual pieces — this is a premium feature roadmap item.

**Q: Should we generate day and evening versions?**  
Yes — the oracle already returns `outfits` (day) and `outfitsAlt` (evening). Each should have its own image. The evening image has warmer, moodier lighting by default.

**Q: What about user privacy — does the image generation API receive the user's location?**  
Only the city name and weather description are sent in the prompt. No coordinates, device ID, or personal identifiers are included. This should be clearly stated in the privacy policy.

**Q: What if the generated image has quality issues (anatomy errors, wrong outfit)?**  
A discreet "regenerate" button lets users request a new image. The regeneration uses the same prompt — if it fails twice, the image slot shows a beautiful ambient placeholder (weather-appropriate aesthetic, no figure).

---

## Rollout Plan

| Phase | Description | Gate |
|-------|-------------|------|
| **Phase 0** | Prompt engineering + API evaluation (off-device) | Select API, validate quality |
| **Phase 1** | Internal beta — image appears on Today screen, single outfit | Quality bar: 8/10 oracle team satisfaction |
| **Phase 2** | Soft launch — behind feature flag, 20% of users | Monitor: latency, cost, crash rate |
| **Phase 3** | Full rollout — day + evening images, regeneration button | — |
| **Phase 4** | Wardrobe-aware images — reference user's uploaded items | Wardrobe upload shipped |

---

*This document covers the editorial image generation spec. For the oracle prompt and JSON contract, see the Architecture section of CLAUDE.md. For the visual design system, see DESIGN.md.*
