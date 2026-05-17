import { OracleVerdict } from './oracle';
import { WeatherData } from './weather';
import { StyleProfile } from '../hooks/useStyleProfile';

// Image generation routes through the Cloudflare Worker proxy (/image endpoint) when
// EXPO_PUBLIC_PROXY_URL is set, so the fal.ai key never ships in the JS bundle.
// In development without a proxy, EXPO_PUBLIC_FAL_KEY can be used for direct calls.
const PROXY_URL  = process.env.EXPO_PUBLIC_PROXY_URL ?? '';
const FAL_KEY_DEV = process.env.EXPO_PUBLIC_FAL_KEY ?? '';

export const IMAGE_ENABLED = PROXY_URL.length > 0 || FAL_KEY_DEV.length > 0;

if (__DEV__) {
  if (PROXY_URL) {
    console.log('[OracleImage] image generation via proxy — fal.ai key stays server-side');
  } else if (FAL_KEY_DEV) {
    console.log('[OracleImage] fal.ai key loaded (dev direct) — image generation active');
  } else {
    console.warn('[OracleImage] No proxy URL or FAL_KEY — image generation disabled. Set EXPO_PUBLIC_PROXY_URL in .env');
  }
}

function aestheticTags(weather: WeatherData, gender: string, profile?: StyleProfile): string {
  const tags: string[] = [];
  const temp = weather.temp;
  const cond = weather.conditionLabel.toLowerCase();

  if (temp < 3)        tags.push('European winter', 'cinematic melancholy');
  else if (temp < 10)  tags.push('Central European elegance', 'soft intellectual');
  else if (temp < 18)  tags.push('quiet luxury', 'modern classic');
  else if (temp < 26)  tags.push('warm editorial', 'effortless Mediterranean ease');
  else                 tags.push('golden realism', 'airy romance');

  if (cond.includes('rain') || cond.includes('drizzle'))
    tags.push('rainy city romance', 'moody reflections');
  else if (cond.includes('sunny') || cond.includes('clear'))
    tags.push('warm neutrals', 'soft natural light');
  else if (cond.includes('snow'))
    tags.push('winter poetry energy', 'editorial knitwear');
  else if (cond.includes('cloud') || cond.includes('overcast'))
    tags.push('wistful elegance', 'modern classic');

  if (profile?.keywords?.length) {
    const kws = profile.keywords.map(k => k.toLowerCase());
    if (kws.some(k => k.includes('minimal')))  tags.push('Parisian restraint');
    if (kws.some(k => k.includes('vintage')))  tags.push('vintage editorial');
    if (kws.some(k => k.includes('luxury')))   tags.push('old money');
    if (kws.some(k => k.includes('literary'))) tags.push(gender === 'Men' ? 'literary intellectual' : 'literary girl');
  }

  return [...new Set(tags)].slice(0, 5).join(', ');
}

function tempVisualCue(temp: number): string {
  if (temp < 0)   return `${temp}°C — below freezing, visibly cold winter conditions`;
  if (temp < 8)   return `${temp}°C — cold, a warm coat is essential`;
  if (temp < 14)  return `${temp}°C — cool, a light jacket or mid-layer is needed`;
  if (temp < 20)  return `${temp}°C — mild and pleasant, spring or early autumn energy`;
  if (temp < 27)  return `${temp}°C — warm, light fabrics, no heavy outerwear`;
  return `${temp}°C — hot, summer conditions, minimal layers`;
}

function environmentDetail(weather: WeatherData, S: string): string {
  const cond = weather.conditionLabel.toLowerCase();
  const temp = weather.temp;

  if (cond.includes('rain') || cond.includes('drizzle'))
    return `${S} walks along a rain-slicked city street or sits beside a café window, reflections of street lamps on the wet pavement.`;
  if (temp < 0)
    return `${S} stands on a snow-dusted street, a quiet train platform, or in the entrance of an old stone building. The cold is clearly visible in the scene.`;
  if (temp < 8)
    return `${S} walks past a used bookstore or stands outside a museum on a quiet cobblestone street, fallen leaves underfoot. The coat is essential — it is genuinely cold.`;
  if (temp < 14)
    return `${S} strolls along a tree-lined boulevard or waits outside a café. The air is cool — a jacket is needed — but the light is pleasant and the setting feels mild.`;
  if (temp < 20)
    return `${S} walks through a mild city afternoon — a gallery entrance, a wide sunlit street, or a weekend market. The weather is comfortable. No heavy layers are needed.`;
  if (temp < 27)
    return `${S} is on a warm café terrace, a sunlit piazza, or a lively boulevard. The warmth of the day is clearly present — light, airy layers.`;
  return `${S} is in a sunlit university courtyard, an open-air market, or along a coastal European street, light filtering through trees. The summer heat is palpable.`;
}

function nightEnvironmentDetail(weather: WeatherData, S: string): string {
  const cond = weather.conditionLabel.toLowerCase();
  const temp = weather.temp;

  if (cond.includes('rain') || cond.includes('drizzle'))
    return `${S} is inside a warmly lit restaurant or jazz bar, the wet city street visible through large windows, reflections of neon and street lamps outside.`;
  if (temp < 8)
    return `${S} steps out of a taxi or into the entrance of a warmly lit bar or restaurant, the cold evening air behind, warm interior light spilling onto the pavement.`;
  if (temp < 16)
    return `${S} walks along a lamp-lit street or stands at the entrance of a restaurant. The cool evening air is present but comfortable. The scene is intimate and dimly lit.`;
  if (temp < 24)
    return `${S} is on a restaurant terrace or at a bar with open windows, the warm evening air soft. Candlelight and warm lamp glow surround the scene.`;
  return `${S} is on a rooftop terrace or at an outdoor restaurant, the warm summer night palpable, city lights visible in the background, golden ambient light filling the frame.`;
}

function compositionType(outfits: OracleVerdict['outfits']): string {
  const hasOuter = outfits.some(
    o => o.category === 'Outer Layer' && !o.item.toLowerCase().includes('none'),
  );
  return hasOuter
    ? '3/4 body or full body, showing the complete layered look including coat structure, footwear, and any accessories'
    : 'medium portrait framing, 3/4 body, naturally composed with environmental context visible';
}

function getLightingContext(variant: 'day' | 'night'): string {
  if (variant === 'night') {
    return 'The scene takes place in the evening or night. Use warm, ambient, intimate lighting — candlelight, warm lamp glow, restaurant light, neon reflections on wet streets. The sky is dark. Do not use daytime outdoor light.';
  }
  return 'The scene takes place during the day. Use natural daylight — morning or afternoon sun, clear atmospheric brightness, visible sky, and readable garment color. Do not use night, dusk, candlelight, neon, or dark restaurant lighting.';
}

function occasionContext(occasion?: string, pronoun = 'her'): string {
  if (!occasion || occasion === 'Any') return `going about ${pronoun} day — unhurried, somewhere interesting to be`;
  if (occasion === 'Work')    return `heading to or leaving a meeting — composed, purposeful`;
  if (occasion === 'Date')    return `meeting someone in the evening — relaxed confidence, not trying too hard`;
  if (occasion === 'Event')   return `dressed for something worth attending — aware of the occasion, poised`;
  if (occasion === 'Weekend') return `a relaxed weekend — at ease, unhurried, with somewhere interesting to go`;
  if (occasion === 'Active')  return `between errands — practical, unstudied, quietly pulled together`;
  return occasion.toLowerCase();
}

export function buildImagePrompt(
  verdict: OracleVerdict,
  weather: WeatherData,
  variant: 'day' | 'night' = 'day',
  gender = 'Women',
  occasion?: string,
  profile?: StyleProfile,
): string {
  const isMale  = gender === 'Men';
  const person  = isMale ? 'The man'  : 'The woman';
  const S       = isMale ? 'He'       : 'She';
  const pronoun = isMale ? 'his'      : 'her';
  const modelDesc = isMale
    ? 'intelligent, emotionally present, naturally handsome — not influencer-styled, not AI-glamorized. Realistic male proportions, no exaggerated physique.'
    : 'intelligent, emotionally present, naturally beautiful — not influencer-styled, not AI-glamorized. Realistic body proportions, no uncanny perfection.';

  const outfits = variant === 'night' && verdict.outfitsAlt ? verdict.outfitsAlt : verdict.outfits;
  const outfitItems = outfits.map(o => o.item).join(', ');
  const tags = aestheticTags(weather, gender, profile);
  const env = variant === 'night' ? nightEnvironmentDetail(weather, S) : environmentDetail(weather, S);
  const comp = compositionType(outfits);
  const tempCue = tempVisualCue(weather.temp);
  const timeOfDay = getLightingContext(variant);

  const variantRule = variant === 'night'
    ? 'This is the NIGHT image. It must use the evening outfit, after-dark setting, dark sky or interior night ambience, and a clearly different pose/composition from the daytime version.'
    : 'This is the DAY image. It must use the daytime outfit, visible daylight, and a clearly different pose/composition from the night version.';

  return `Generate a cinematic editorial fashion photograph. The aesthetic should feel like a luxury fashion campaign — soft atmospheric lighting, realistic textures, shallow depth of field, gentle grain. The model should appear ${modelDesc}

${variantRule}

${person} wears: ${outfitItems}.

The setting is ${weather.city}. The weather is ${weather.conditionLabel.toLowerCase()} — ${weather.temp}°C, feels like ${weather.feelsLike}°C. ${env}

Temperature context: ${tempCue}. The image's visual warmth, layering weight, and setting must accurately reflect this temperature. Do not depict heavy winter coats, cold breath, or winter textures unless the temperature is genuinely cold (below 8°C).

${timeOfDay}

${S} is dressed for ${occasionContext(occasion, pronoun)}. The occasion should be visible in how ${S.toLowerCase()} holds ${pronoun}self.

The mood is ${verdict.vibe}. The aesthetic registers as: ${tags}.

Framing: ${comp}. The full outfit — including coat, footwear, and accessories — must be visible. The image should feel like a still from a fashion film the viewer wants to walk into.

Do not generate: influencer aesthetics, ecommerce product shots, exaggerated AI beauty, hypersexualized poses, distorted anatomy, brand names, designer logos, visible labels, loud colors, or synthetic-looking fabric textures. If the outfit text contains a brand, translate it into generic garment characteristics before rendering.`;
}

const SKETCH_RENDER_STYLES = [
  'soft watercolor realism with pencil underdrawing',
  'digital gouache on textured paper',
  'pencil and watercolor hybrid with loose ink lines',
  'textured editorial illustration in the manner of vintage Vogue sketches',
  'semi-realistic fashion rendering with visible brushwork',
] as const;

function sketchRenderStyle(vibe: string): string {
  const idx = Math.abs(vibe.charCodeAt(0) + vibe.charCodeAt(vibe.length - 1)) % SKETCH_RENDER_STYLES.length;
  return SKETCH_RENDER_STYLES[idx];
}

export function buildSketchPrompt(
  verdict: OracleVerdict,
  weather: WeatherData,
  variant: 'day' | 'night' = 'day',
  gender = 'Women',
  occasion?: string,
  profile?: StyleProfile,
): string {
  const isMale  = gender === 'Men';
  const pronoun = isMale ? 'his' : 'her';
  const figureGender = isMale
    ? 'Male figure — elongated, editorial, graceful. Elegant masculine proportions, relaxed tailoring energy.'
    : 'Female figure — elongated, editorial, graceful. Elegant feminine proportions, effortless posture.';

  const outfits = variant === 'night' && verdict.outfitsAlt ? verdict.outfitsAlt : verdict.outfits;
  const outfitItems = outfits.map(o => `${o.item}`).join(',\n');
  const tags = aestheticTags(weather, gender, profile);
  const tempCue = tempVisualCue(weather.temp);
  const env = variant === 'night' ? nightEnvironmentDetail(weather, 'The figure') : environmentDetail(weather, 'The figure');
  const renderStyle = sketchRenderStyle(verdict.vibe);
  const lightingCtx = getLightingContext(variant);
  const timeOfDay = variant === 'night'
    ? 'evening — warm, ambient, intimate light'
    : 'daytime — natural daylight, visible sky, readable garment color';
  const weatherDesc = `${weather.conditionLabel.toLowerCase()} — ${weather.temp}°C, feels like ${weather.feelsLike}°C`;
  const variantRule = variant === 'night'
    ? 'This is the NIGHT sketch. It must show the evening outfit and after-dark mood, not a daylight version.'
    : 'This is the DAY sketch. It must show the daytime outfit in natural daylight, not an evening version.';

  return `Generate a ${renderStyle} fashion illustration for Outfit Oracle. This is an ILLUSTRATED ARTWORK, not a photograph. The style must resemble luxury editorial fashion sketches, couture croquis, and cinematic fashion renderings — never photorealistic.

${variantRule}

FIGURE RULES — NON-NEGOTIABLE:
The figure must be faceless or near-faceless. Allowed: soft jawline indication, neck, hair, profile silhouette, abstract facial structure, face turned away or cropped. The figure may be partially obscured or rendered like a fashion illustration mannequin.
FORBIDDEN: detailed eyes, detailed nose, realistic mouth, influencer beauty, AI faces, portrait focus. The clothing is the emotional center, not the face.

${figureGender}

OUTFIT — render every piece with obsessive textile detail and fashion-illustration specificity:
${outfitItems}

Focus intensely on: silhouette, layering, tailoring, drape, knit texture, fabric folds, stitching, accessories, color harmony, footwear styling. The outfit communicates mood, social identity, weather, and narrative.

WEATHER & ENVIRONMENT:
City: ${weather.city}. Weather: ${weatherDesc}. Time of day: ${timeOfDay}.
Lighting: ${lightingCtx}
Temperature context: ${tempCue}. ${env}
The illustration's visual warmth, fabric weight, and layering must accurately reflect ${weather.temp}°C. Do NOT depict heavy winter coats or cold breath unless below 8°C.

OCCASION: The figure is ${occasionContext(occasion, pronoun)}. This should be visible in posture and styling confidence.

MOOD & AESTHETIC:
Vibe: ${verdict.vibe}. Aesthetic: ${tags}. The image should feel like a memory, a dream wardrobe, a fashion diary.

COMPOSITION:
Full body or 3/4 body. Walking silhouette, seated styling pose, or over-the-shoulder composition. The figure appears graceful, elongated, editorial — relaxed but intentional.

RENDER STYLE:
${renderStyle}. Textures feel tactile, layered, expensive, soft, atmospheric. Background: soft, painterly, cinematic — ${env.replace('The figure', 'suggested behind the figure')} Never clutter.

COLOR PALETTE:
Muted luxury tones — cream, camel, charcoal, espresso, soft navy, dusty rose, olive, wine red, faded black, heather gray. Avoid neon, oversaturation, harsh contrast, synthetic colors.

MANDATORY: elegant illustrated anatomy, realistic fabric rendering with visible brushwork, editorial styling quality, cohesive silhouette, emotionally atmospheric, luxury visual language.
FORBIDDEN: photorealistic faces, AI glamour, uncanny realism, ecommerce product catalog energy, generic Pinterest collage, fast fashion aesthetic, photographs, brand names, designer logos, visible labels. If the outfit text contains a brand, translate it into generic garment characteristics before rendering.`;
}

export async function generateOutfitImage(prompt: string): Promise<string> {
  if (PROXY_URL) {
    // Production: route through Cloudflare Worker — key never in bundle
    const resp = await fetch(`${PROXY_URL}/image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    if (!resp.ok) {
      const body = await resp.json().catch(() => ({})) as { error?: string };
      throw new Error(body.error ?? `Proxy image error ${resp.status}`);
    }
    const data = await resp.json() as { images: { url: string }[] };
    if (!data.images?.length) throw new Error('No image returned');
    return data.images[0].url;
  }

  // Dev fallback: direct fal.ai call (key must be set in .env.local, never in production)
  if (!FAL_KEY_DEV) throw new Error('No proxy URL or FAL_KEY configured');
  const resp = await fetch('https://fal.run/fal-ai/flux-pro/v1.1', {
    method: 'POST',
    headers: { 'Authorization': `Key ${FAL_KEY_DEV}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      image_size: 'portrait_4_3', // 768×1024, tallest named preset FLUX Pro v1.1 supports
      num_images: 1,
      output_format: 'jpeg',
    }),
  });

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({})) as { detail?: string };
    const detail = body.detail ?? `HTTP ${resp.status}`;
    if (__DEV__) console.error(`[OracleImage] fal.ai ${resp.status}:`, detail);
    throw new Error(detail);
  }

  const data = await resp.json() as { images: { url: string }[] };
  if (!data.images?.length) throw new Error('No image returned');
  if (__DEV__) console.log('[OracleImage] image ready:', data.images[0].url.slice(0, 60) + '…');
  return data.images[0].url;
}
