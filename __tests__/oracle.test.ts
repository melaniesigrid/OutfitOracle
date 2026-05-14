import { OracleVerdict, OutfitItem } from '../src/services/oracle';

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
});
