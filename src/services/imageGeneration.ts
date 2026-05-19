import { OracleVerdict } from './oracle';
import { WeatherData } from './weather';
import { StyleProfile } from '../hooks/useStyleProfile';

// Image generation routes through the Cloudflare Worker proxy (/image endpoint) when
// EXPO_PUBLIC_PROXY_URL is set, so the fal.ai key never ships in the JS bundle.
// In development without a proxy, EXPO_PUBLIC_FAL_KEY can be used for direct calls.
const PROXY_URL  = process.env.EXPO_PUBLIC_PROXY_URL ?? '';
const FAL_KEY_DEV = process.env.EXPO_PUBLIC_FAL_KEY ?? '';

export const IMAGE_ENABLED = PROXY_URL.length > 0 || FAL_KEY_DEV.length > 0;
const IS_DEV = typeof __DEV__ !== 'undefined' && __DEV__;
const MAX_IMAGE_PROMPT_CHARS = 4800;

if (IS_DEV) {
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

function truncateText(value: string, maxChars: number): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxChars) return normalized;
  const clipped = normalized.slice(0, maxChars - 1);
  const lastSpace = clipped.lastIndexOf(' ');
  return `${clipped.slice(0, lastSpace > 40 ? lastSpace : clipped.length).trim()}…`;
}

function sketchOutfitManifest(outfits: OracleVerdict['outfits']): string {
  return outfits.map((outfit, index) => {
    const item = truncateText(outfit.item, 180);
    const detail = outfit.detail ? ` Detail: ${truncateText(outfit.detail, 90)}` : '';
    return `${index + 1}. ${outfit.category}: ${item}.${detail}`;
  }).join('\n');
}

function fitPrompt(prompt: string): string {
  if (prompt.length <= MAX_IMAGE_PROMPT_CHARS) return prompt;
  const tail = '\n\nFinal rules: draw the listed outfit exactly. No extra garments, no missing pieces, no logos, no realistic face.';
  return `${prompt.slice(0, MAX_IMAGE_PROMPT_CHARS - tail.length).trim()}${tail}`;
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

function countryModelHint(country: string, isMale: boolean): string {
  const c = country.trim().toLowerCase();

  // South Asia
  if (/india|pakistan|bangladesh|sri lanka|nepal|bhutan/.test(c))
    return isMale
      ? 'South Asian man — warm brown to deep brown complexion, dark hair, naturally expressive features'
      : 'South Asian woman — warm brown to deep brown complexion, dark hair, naturally expressive features';

  // East Asia
  if (/china|japan|korea|taiwan|hong kong|mongolia/.test(c))
    return isMale
      ? 'East Asian man — fair to medium complexion, dark straight hair, refined natural features'
      : 'East Asian woman — fair to medium complexion, dark straight hair, refined natural features';

  // Southeast Asia
  if (/thailand|vietnam|indonesia|malaysia|philippines|singapore|myanmar|cambodia|laos/.test(c))
    return isMale
      ? 'Southeast Asian man — medium golden-brown complexion, dark hair, natural features'
      : 'Southeast Asian woman — medium golden-brown complexion, dark hair, natural features';

  // Middle East
  if (/saudi|arab emirates|qatar|kuwait|bahrain|oman|jordan|lebanon|syria|iraq|iran|israel|turkey/.test(c))
    return isMale
      ? 'Middle Eastern man — olive to warm brown complexion, dark hair, strong natural features'
      : 'Middle Eastern woman — olive to warm brown complexion, dark hair, strong natural features';

  // North Africa
  if (/egypt|morocco|algeria|tunisia|libya/.test(c))
    return isMale
      ? 'North African man — olive to medium brown complexion, dark hair, natural Mediterranean-North African features'
      : 'North African woman — olive to medium brown complexion, dark hair, natural Mediterranean-North African features';

  // West Africa
  if (/nigeria|ghana|senegal|cameroon|ivory coast|côte d'ivoire|mali|guinea/.test(c))
    return isMale
      ? 'West African man — deep brown complexion, dark hair, proud natural features'
      : 'West African woman — deep brown complexion, dark hair, proud natural features';

  // East Africa
  if (/kenya|ethiopia|tanzania|uganda|rwanda|somalia/.test(c))
    return isMale
      ? 'East African man — rich dark complexion, dark hair, elegant natural features'
      : 'East African woman — rich dark complexion, dark hair, elegant natural features';

  // Southern Africa
  if (/south africa|zimbabwe|zambia|botswana|namibia/.test(c))
    return isMale
      ? 'Southern African man — warm brown to deep brown complexion, dark hair, natural features'
      : 'Southern African woman — warm brown to deep brown complexion, dark hair, natural features';

  // Brazil
  if (/brazil|brasil/.test(c))
    return isMale
      ? 'Brazilian man — diverse complexion ranging from light olive to warm brown, natural expressive features'
      : 'Brazilian woman — diverse complexion ranging from light olive to warm brown, natural expressive features';

  // Latin America
  if (/mexico|colombia|argentina|peru|chile|venezuela|ecuador|bolivia|uruguay|paraguay|costa rica|panama|guatemala|honduras|el salvador|nicaragua/.test(c))
    return isMale
      ? 'Latin American man — warm olive to medium brown complexion, dark hair, natural features'
      : 'Latin American woman — warm olive to medium brown complexion, dark hair, natural features';

  // Caribbean
  if (/cuba|jamaica|haiti|dominican|trinidad|barbados|bahamas/.test(c))
    return isMale
      ? 'Caribbean man — warm brown to deep brown complexion, dark hair, natural features'
      : 'Caribbean woman — warm brown to deep brown complexion, dark hair, natural features';

  // Scandinavia
  if (/sweden|norway|denmark|finland|iceland/.test(c))
    return isMale
      ? 'Scandinavian man — fair complexion, light hair (blonde to light brown), natural Nordic features'
      : 'Scandinavian woman — fair complexion, light hair (blonde to light brown), natural Nordic features';

  // Southern Europe
  if (/italy|spain|portugal|greece/.test(c))
    return isMale
      ? 'Southern European man — light olive to warm complexion, dark hair, natural Mediterranean features'
      : 'Southern European woman — light olive to warm complexion, dark hair, natural Mediterranean features';

  // Western Europe (after Southern to avoid false match on Germany → "many")
  if (/france|germany|netherlands|belgium|switzerland|austria|luxembourg/.test(c))
    return isMale
      ? 'Western European man — fair to light complexion, natural European features'
      : 'Western European woman — fair to light complexion, natural European features';

  // Eastern Europe
  if (/russia|poland|ukraine|czech|hungary|romania|bulgaria|serbia|croatia|slovakia/.test(c))
    return isMale
      ? 'Eastern European man — fair complexion, dark or light hair, natural Slavic features'
      : 'Eastern European woman — fair complexion, dark or light hair, natural Slavic features';

  // UK / Ireland
  if (/united kingdom|england|scotland|wales|ireland/.test(c))
    return isMale
      ? 'British man — naturally diverse British look, fair complexion, natural features'
      : 'British woman — naturally diverse British look, fair complexion, natural features';

  // United States
  if (/united states|usa/.test(c))
    return isMale
      ? 'American man — naturally diverse, real-world American look, not idealized'
      : 'American woman — naturally diverse, real-world American look, not idealized';

  // Canada
  if (/canada/.test(c))
    return isMale
      ? 'Canadian man — naturally diverse, fair to medium complexion, natural features'
      : 'Canadian woman — naturally diverse, fair to medium complexion, natural features';

  // Australia / New Zealand
  if (/australia|new zealand/.test(c))
    return isMale
      ? 'Australian man — fair to medium complexion, natural features'
      : 'Australian woman — fair to medium complexion, natural features';

  // Fallback: no region-specific hint
  return isMale ? '' : '';
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
  const S       = isMale ? 'He'       : 'She';
  const pronoun = isMale ? 'his'      : 'her';
  const regionHint = countryModelHint(weather.country, isMale);
  const baseDesc = isMale
    ? 'intelligent, emotionally present, naturally handsome — not influencer-styled, not AI-glamorized. Realistic male proportions, no exaggerated physique.'
    : 'intelligent, emotionally present, naturally beautiful — not influencer-styled, not AI-glamorized. Realistic body proportions, no uncanny perfection.';
  const modelDesc = regionHint ? `${regionHint} — ${baseDesc}` : baseDesc;

  const outfits = variant === 'night' && verdict.outfitsAlt ? verdict.outfitsAlt : verdict.outfits;
  const outfitItems = sketchOutfitManifest(outfits);
  const tags = aestheticTags(weather, gender, profile);
  const env = variant === 'night' ? nightEnvironmentDetail(weather, S) : environmentDetail(weather, S);
  const comp = compositionType(outfits);
  const tempCue = tempVisualCue(weather.temp);
  const timeOfDay = getLightingContext(variant);

  const variantRule = variant === 'night'
    ? 'This is the NIGHT image. It must use the evening outfit, after-dark setting, dark sky or interior night ambience, and a clearly different pose/composition from the daytime version.'
    : 'This is the DAY image. It must use the daytime outfit, visible daylight, and a clearly different pose/composition from the night version.';

  // Outfit items first — FLUX Pro weights earlier tokens most heavily.
  // Everything else is context; the outfit list is the source of truth.
  const prompt = `VERDICT OUTFIT — render ONLY these garments, nothing else:
${outfitItems}

Do not add, swap, or omit any listed piece. Do not invent unlisted garments. If outer layer says "None needed", show NO jacket, coat, blazer, or extra layer of any kind. Every listed accessory and footwear item must be clearly visible.

Cinematic editorial fashion photograph. Luxury campaign aesthetic — soft atmospheric lighting, realistic fabric textures, shallow depth of field, gentle grain. Model: ${modelDesc}

${variantRule}

Setting: ${weather.city}, ${weather.conditionLabel.toLowerCase()}, ${weather.temp}°C (feels like ${weather.feelsLike}°C). ${env}
Temperature: ${tempCue}. Layering weight and fabric choice must match this temperature exactly.

${timeOfDay}

${S} is ${occasionContext(occasion, pronoun)}. Mood: ${verdict.vibe}. Aesthetic: ${tags}.

Framing: ${comp}. Full outfit including footwear must be visible. The image should feel like a still from a fashion film.`;

  return fitPrompt(prompt);
}

// Hand-drawn style references — specific enough that FLUX's CLIP encoder
// maps them to actual drawn media rather than polished digital art.
const SKETCH_RENDER_STYLES = [
  'pencil and loose ink wash on cream cartridge paper, gestural hatching lines, visible paper grain, clearly handmade',
  'editorial fashion illustration in the tradition of René Gruau — bold ink lines, flat watercolor fills, expressive gesture',
  'hand-drawn fashion croquis in the style of 1960s Vogue fashion plates — dry-brush ink, delicate watercolor washes',
  'loose pencil croquis with wet watercolor washes, visible pencil underdrawing showing through color, art-school sketchbook quality',
  'Antonio Lopez editorial ink drawing — sinuous ink lines, minimal color, gestural poses, clearly hand-rendered',
] as const;

function sketchRenderStyle(vibe: string): string {
  const idx = Math.abs(vibe.charCodeAt(0) + vibe.charCodeAt(vibe.length - 1)) % SKETCH_RENDER_STYLES.length;
  return SKETCH_RENDER_STYLES[idx];
}

export const PHOTO_NEGATIVE_PROMPT =
  'invented garments, extra unlisted clothing, missing outfit pieces, wrong outfit items, ' +
  'added jacket, added coat, added cardigan, added blazer, added scarf, added hat, added bag, added sunglasses, ' +
  'influencer aesthetics, ecommerce product shot, brand logos, designer labels, visible text, ' +
  'distorted anatomy, exaggerated AI beauty, hypersexualized pose, uncanny face, ' +
  'neon colors, oversaturated, heavy winter layers in warm weather, summer clothes in cold weather';

const SKETCH_NEGATIVE_PROMPT =
  'photorealistic, photography, photograph, CGI, 3D render, digital painting, airbrushed, perfectly smooth, ' +
  'hyper-detailed fabric texture, studio lighting, DSLR, sharp focus, skin pores, ' +
  'realistic face, influencer, AI face, uncanny, ecommerce, product shot, ' +
  'neon colors, oversaturated, brand logos, labels, ' +
  'invented garments, extra clothing not in the outfit list, missing listed garments';

export function buildSketchPrompt(
  verdict: OracleVerdict,
  weather: WeatherData,
  variant: 'day' | 'night' = 'day',
  gender = 'Women',
  occasion?: string,
  profile?: StyleProfile,
): string {
  const isMale  = gender === 'Men';
  const regionHintSketch = countryModelHint(weather.country, isMale);
  const sketchToneNote = regionHintSketch
    ? ` Skin tone and hair: reflect ${regionHintSketch.split(' — ')[1] ?? regionHintSketch}.`
    : '';
  const figureGender = isMale
    ? `Elongated male fashion croquis — elegant masculine proportions, relaxed tailoring energy.${sketchToneNote}`
    : `Elongated female fashion croquis — graceful feminine proportions, effortless editorial posture.${sketchToneNote}`;

  const outfits = variant === 'night' && verdict.outfitsAlt ? verdict.outfitsAlt : verdict.outfits;
  const outfitItems = sketchOutfitManifest(outfits);
  const tags = aestheticTags(weather, gender, profile);
  const env = variant === 'night' ? nightEnvironmentDetail(weather, 'The figure') : environmentDetail(weather, 'The figure');
  const renderStyle = sketchRenderStyle(verdict.vibe);
  const timeOfDay = variant === 'night'
    ? 'evening/night — warm ambient light, dark sky or interior glow'
    : 'daytime — natural light, visible sky, readable garment color';
  const variantRule = variant === 'night'
    ? 'NIGHT SKETCH: show the evening/night outfit in after-dark ambience.'
    : 'DAY SKETCH: show the daytime outfit in natural daylight.';

  // Outfit section intentionally first — FLUX weights earlier tokens more heavily.
  const prompt = `Hand-drawn editorial fashion illustration. Medium: ${renderStyle}. NOT a photograph, NOT CGI, NOT digital art. Every line and wash is visibly hand-made.

VERDICT OUTFIT — draw exactly these garments, nothing else:
${outfitItems}

This is the only source of truth for clothing. Do not substitute, simplify, add, or omit any listed piece. If the outer layer says "None needed", draw absolutely no jacket, coat, blazer, or extra layer. Every listed accessory and footwear item must be visible.

FIGURE: ${figureGender} Faceless or near-faceless — eyes, nose, and mouth are minimal marks or absent; the clothing is the subject. No realistic face, no influencer beauty, no AI-generated features.

${variantRule}
Setting: ${truncateText(env, 120)}. Mood: ${verdict.vibe}. Aesthetic register: ${tags}.
Lighting: ${timeOfDay}. Temperature ${weather.temp}°C — fabric weight and layering must reflect this.

COMPOSITION: Full body or 3/4 body so all footwear and accessories are visible. Graceful editorial pose. Muted, sophisticated palette. No heavy winter layers unless below 8°C. No neon, no loud color. Background: loose gestural suggestion of the setting, not a detailed scene.`;

  return fitPrompt(prompt);
}

export { SKETCH_NEGATIVE_PROMPT };

export async function generateOutfitImage(prompt: string, negativePrompt?: string): Promise<string> {
  if (PROXY_URL) {
    // Production: route through Cloudflare Worker — key never in bundle
    const resp = await fetch(`${PROXY_URL}/image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, negative_prompt: negativePrompt }),
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
  const body: Record<string, unknown> = {
    prompt,
    image_size: 'portrait_4_3', // 768×1024, tallest named preset FLUX Pro v1.1 supports
    num_images: 1,
    output_format: 'jpeg',
  };
  if (negativePrompt) body.negative_prompt = negativePrompt;
  const resp = await fetch('https://fal.run/fal-ai/flux-pro/v1.1', {
    method: 'POST',
    headers: { 'Authorization': `Key ${FAL_KEY_DEV}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errBody = await resp.json().catch(() => ({})) as { detail?: string };
    const detail = errBody.detail ?? `HTTP ${resp.status}`;
    if (IS_DEV) console.error(`[OracleImage] fal.ai ${resp.status}:`, detail);
    throw new Error(detail);
  }

  const data = await resp.json() as { images: { url: string }[] };
  if (!data.images?.length) throw new Error('No image returned');
  if (IS_DEV) console.log('[OracleImage] image ready:', data.images[0].url.slice(0, 60) + '…');
  return data.images[0].url;
}
