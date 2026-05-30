import type { OutfitItem } from './oracle';

export const GOOGLE_SHOPPING_BASE_URL = 'https://www.google.com/search';

const NONE_NEEDED_RE = /\bnone\b|not needed|no outer|skip the|weather permits|too warm|unnecessary/i;
const MAX_SHOP_QUERIES = 4;

function compactQueryWords(value: string, maxWords = 10): string {
  const words = value.split(/\s+/).filter(Boolean);
  let compacted = words.length > maxWords ? words.slice(0, maxWords).join(' ') : value;
  compacted = compacted.replace(/\b(and|or|with|for|in|of|to|a|an|the)$/i, '').trim();
  return compacted || value;
}

export function normalizeShopQuery(value: string): string {
  return value
    .replace(/^[\s"“”'‘’•*-]+/, '')
    .replace(/[\s"“”'‘’,.;:]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isNoneNeededItem(value: string): boolean {
  return NONE_NEEDED_RE.test(value);
}

function sanitizeShopPhrase(value: string): string {
  let query = normalizeShopQuery(value)
    .replace(/\s+—\s+.*$/, '')
    .replace(/\s*;.*$/, '')
    .replace(/,\s*(?:or|with|worn|if|but|which|the kind)\b.*$/i, '')
    .replace(/^\s*(?:the\s+same|same)\s+/i, '')
    .replace(/^\s*(?:add|swap to|swap for)\s+/i, '')
    .replace(/\bremains\b.*$/i, '')
    .trim();

  query = query.replace(/^(?:the|a|an)\s+/i, '').trim();

  if (query.split(/\s+/).length > 9) {
    query = query.replace(/\s+with\s+.*$/i, '').trim();
  }

  return compactQueryWords(normalizeShopQuery(query));
}

function deriveShopQueries(item: Pick<OutfitItem, 'item'> & Partial<Pick<OutfitItem, 'category'>>): string[] {
  const raw = normalizeShopQuery(item.item);
  if (!raw || isNoneNeededItem(raw)) return [];

  const category = item.category?.toLowerCase() ?? '';
  const candidates = category.includes('accessor')
    ? raw.split(/\s*,\s*(?:and\s+)?|\s+plus\s+|\s*\+\s*/i)
    : [raw.split(/,\s*or\s+|\s+or\s+swap\s+to\s+/i)[0]];

  return [...new Set(candidates.map(sanitizeShopPhrase))]
    .filter(query => query.length >= 3 && !isNoneNeededItem(query))
    .slice(0, MAX_SHOP_QUERIES);
}

export function resolveShopQueries(item: Pick<OutfitItem, 'item' | 'shopItems'> & Partial<Pick<OutfitItem, 'category'>>): string[] {
  if (isNoneNeededItem(item.item)) return [];

  const generatedQueries = Array.isArray(item.shopItems)
    ? item.shopItems.map(sanitizeShopPhrase).filter(Boolean)
    : [];

  const queries = generatedQueries.length > 0
    ? generatedQueries
    : deriveShopQueries(item);

  return [...new Set(queries)]
    .filter(query => query.length >= 3 && !isNoneNeededItem(query))
    .slice(0, MAX_SHOP_QUERIES);
}

export function buildGoogleShoppingUrl(query: string): string {
  const normalized = normalizeShopQuery(query);
  return `${GOOGLE_SHOPPING_BASE_URL}?tbm=shop&q=${encodeURIComponent(normalized)}`;
}
