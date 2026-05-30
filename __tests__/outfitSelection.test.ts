import { hasNightOutfit, selectOutfitsForLook } from '../src/utils/outfitSelection';
import type { OracleVerdict, OutfitItem } from '../src/services/oracle';

const dayTop: OutfitItem = {
  category: 'Top',
  item: 'ivory ribbed tank',
  detail: 'Light enough for the afternoon.',
  accentColor: 'mint',
};

const nightTop: OutfitItem = {
  category: 'Top',
  item: 'black silk halter',
  detail: 'Sharper after dark.',
  accentColor: 'iris',
};

const baseVerdict: OracleVerdict = {
  verdict: 'Wear the actual verdict.',
  vibe: 'City Heat',
  rating: 4,
  outfits: [dayTop],
  avoid: [],
};

describe('outfit selection', () => {
  it('uses day outfits for polished mode', () => {
    expect(selectOutfitsForLook({ ...baseVerdict, outfitsAlt: [nightTop] }, 'polished')).toEqual([dayTop]);
  });

  it('uses night outfits for casual mode when night outfits exist', () => {
    expect(selectOutfitsForLook({ ...baseVerdict, outfitsAlt: [nightTop] }, 'casual')).toEqual([nightTop]);
  });

  it('falls back to day outfits when casual mode has no night outfits', () => {
    expect(selectOutfitsForLook(baseVerdict, 'casual')).toEqual([dayTop]);
    expect(selectOutfitsForLook({ ...baseVerdict, outfitsAlt: [] }, 'casual')).toEqual([dayTop]);
  });

  it('only reports a night look when there is at least one night outfit', () => {
    expect(hasNightOutfit({ ...baseVerdict, outfitsAlt: [nightTop] })).toBe(true);
    expect(hasNightOutfit({ ...baseVerdict, outfitsAlt: [] })).toBe(false);
    expect(hasNightOutfit(baseVerdict)).toBe(false);
    expect(hasNightOutfit(null)).toBe(false);
  });
});
