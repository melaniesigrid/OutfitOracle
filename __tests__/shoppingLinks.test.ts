import { buildGoogleShoppingUrl, normalizeShopQuery, resolveShopQueries } from '../src/services/shoppingLinks';
import { OutfitItem } from '../src/services/oracle';

function item(overrides: Partial<OutfitItem>): OutfitItem {
  return {
    category: 'Top',
    item: 'black and white striped cotton button-down shirt',
    detail: 'A clean layer for transitional weather.',
    accentColor: 'mint',
    ...overrides,
  };
}

describe('shopping links', () => {
  it('does not split natural-language item names into broken queries', () => {
    expect(resolveShopQueries(item({}))).toEqual([
      'black and white striped cotton button-down shirt',
    ]);
  });

  it('prefers sanitized generated shopItems when present', () => {
    expect(resolveShopQueries(item({
      item: 'black silk halter top, satin midi skirt, and slingback heels',
      shopItems: [' black silk halter top ', 'satin midi skirt.', 'slingback heels'],
    }))).toEqual([
      'black silk halter top',
      'satin midi skirt',
      'slingback heels',
    ]);
  });

  it('does not create shopping links for none-needed outer layers', () => {
    expect(resolveShopQueries(item({
      category: 'Outer Layer',
      item: 'None needed — 28°C is the look',
      shopItems: ['None needed'],
    }))).toEqual([]);
  });

  it('round-trips Google Shopping URLs with complete query text', () => {
    const url = buildGoogleShoppingUrl('black and white striped cotton button-down shirt');
    const parsed = new URL(url);

    expect(parsed.origin + parsed.pathname).toBe('https://www.google.com/search');
    expect(parsed.searchParams.get('tbm')).toBe('shop');
    expect(parsed.searchParams.get('q')).toBe('black and white striped cotton button-down shirt');
  });

  it('normalizes punctuation and whitespace without removing internal words', () => {
    expect(normalizeShopQuery('  “cashmere and silk blend cardigan,”  ')).toBe('cashmere and silk blend cardigan');
  });

  it('derives cleaner fallback queries from editorial item prose', () => {
    expect(resolveShopQueries(item({
      category: 'Footwear',
      item: 'Minimalist black leather mule with a low square heel and a single wide strap across the forefoot — no ankle strap, maximum airflow',
    }))).toEqual(['Minimalist black leather mule']);

    expect(resolveShopQueries(item({
      category: 'Accessories',
      item: 'Oversized square-frame black sunglasses with UV400 lenses, a slim black crossbody in smooth pebbled leather, and a single fine gold cuff',
    }))).toEqual([
      'Oversized square-frame black sunglasses with UV400 lenses',
      'slim black crossbody in smooth pebbled leather',
      'single fine gold cuff',
    ]);
  });
});
