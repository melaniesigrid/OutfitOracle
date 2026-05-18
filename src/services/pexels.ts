const PEXELS_KEY = process.env.EXPO_PUBLIC_PEXELS_KEY ?? '';

// Session-level cache: category::itemName → URL | null
const cache = new Map<string, string | null>();

function buildQuery(category: string, itemName: string): string {
  // Strip everything after the first comma (styling detail), keep first 4 words
  const base = itemName.split(',')[0].trim();
  const words = base.split(/\s+/).slice(0, 4).join(' ');
  // Map generic categories to better Pexels fashion keywords
  const catHint: Record<string, string> = {
    'Outer Layer': 'coat jacket outerwear',
    'Top':         'shirt blouse fashion',
    'Bottom':      'trousers pants skirt',
    'Footwear':    'shoes boots fashion',
    'Accessories': 'accessory fashion',
    'Dress':       'dress fashion',
    'Bag':         'bag handbag fashion',
  };
  const hint = catHint[category] ?? 'fashion outfit';
  return `${words} ${hint}`;
}

export async function fetchPexelsImage(category: string, itemName: string): Promise<string | null> {
  if (!PEXELS_KEY) return null;

  const cacheKey = `${category}::${itemName}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey) ?? null;

  const query = buildQuery(category, itemName);
  try {
    const resp = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=3&orientation=portrait&size=small`,
      { headers: { Authorization: PEXELS_KEY } },
    );
    if (!resp.ok) { cache.set(cacheKey, null); return null; }
    const data: { photos?: Array<{ src: { small: string } }> } = await resp.json();
    // Pick the second result when available — first is often too generic
    const url = data.photos?.[1]?.src?.small ?? data.photos?.[0]?.src?.small ?? null;
    cache.set(cacheKey, url);
    return url;
  } catch {
    cache.set(cacheKey, null);
    return null;
  }
}
