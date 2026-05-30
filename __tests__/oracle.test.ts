import { normalizeVerdictShopItems, OracleVerdict, OutfitItem } from '../src/services/oracle';

describe('OracleVerdict type shape', () => {
  it('accepts a valid verdict object', () => {
    const item: OutfitItem = {
      category: 'Top',
      item: 'White linen shirt',
      detail: 'Breathable for humid conditions',
      accentColor: 'mint',
    };
    const verdict: OracleVerdict = {
      verdict: 'Dress light or suffer.',
      vibe: 'Apocalypse Chic',
      outfits: [item],
      avoid: ['heavy wool'],
      rating: 3,
    };
    expect(verdict.vibe).toBe('Apocalypse Chic');
    expect(verdict.outfits[0].accentColor).toBe('mint');
    expect(verdict.rating).toBeGreaterThanOrEqual(1);
    expect(verdict.rating).toBeLessThanOrEqual(5);
  });

  it('allows optional outfitsAlt', () => {
    const verdict: OracleVerdict = {
      verdict: 'Cold today.',
      vibe: 'Cozy Intellectual',
      outfits: [],
      avoid: [],
      rating: 2,
    };
    expect(verdict.outfitsAlt).toBeUndefined();
  });

  it('accepts foundingMember flag from Worker', () => {
    const verdict: OracleVerdict = {
      verdict: 'You made it.',
      vibe: 'Founding Energy',
      outfits: [],
      avoid: [],
      rating: 5,
      foundingMember: true,
    };
    expect(verdict.foundingMember).toBe(true);
  });

  it('foundingMember is optional (undefined by default)', () => {
    const verdict: OracleVerdict = {
      verdict: 'Ordinary day.',
      vibe: 'Quiet Confidence',
      outfits: [],
      avoid: [],
      rating: 3,
    };
    expect(verdict.foundingMember).toBeUndefined();
  });

  it('fills missing shopItems with deterministic shopping queries', () => {
    const verdict: OracleVerdict = {
      verdict: 'A real outfit.',
      vibe: 'Shopping Sanity',
      rating: 3,
      outfits: [
        {
          category: 'Footwear',
          item: 'Minimalist black leather mule with a low square heel and a single wide strap across the forefoot — no ankle strap, maximum airflow',
          detail: 'A better query should not include the whole editorial note.',
          accentColor: 'lemon',
        },
      ],
      avoid: [],
    };

    expect(normalizeVerdictShopItems(verdict).outfits[0].shopItems).toEqual([
      'Minimalist black leather mule',
    ]);
  });
});
