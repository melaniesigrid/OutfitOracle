import { fashionUsageFor } from '../src/utils/wordUsage';

describe('fashionUsageFor', () => {
  it('returns usage for a known word', () => {
    expect(fashionUsageFor('sartorial')).toContain('tailoring');
  });

  it('is case-insensitive', () => {
    expect(fashionUsageFor('SARTORIAL')).toContain('tailoring');
    expect(fashionUsageFor('Sartorial')).toContain('tailoring');
  });

  it('strips accent marks for lookup', () => {
    // 'élan' normalizes to 'elan'
    expect(fashionUsageFor('élan')).toContain('movement');
  });

  it('returns fallback for unknown word', () => {
    const result = fashionUsageFor('zzz_not_a_word');
    expect(result).toContain('styling prompt');
  });

  it('handles hyphenated terms', () => {
    expect(fashionUsageFor('avant-garde')).toContain('experimental');
  });

  it('handles multi-word French terms', () => {
    expect(fashionUsageFor('je ne sais quoi')).toContain('alive');
  });

  it('handles pret-a-porter', () => {
    expect(fashionUsageFor('pret-a-porter')).toContain('ready-to-wear');
  });

  it('returns a non-empty string for every known word', () => {
    const knownWords = [
      'sartorial', 'sprezzatura', 'insouciant', 'louche', 'elan', 'panache',
      'diaphanous', 'bespoke', 'nonchalant', 'raffish', 'opulent', 'austere',
      'languid', 'silhouette', 'atelier', 'couture', 'toile', 'maison',
      'gestalt', 'zeitgeist', 'demode', 'ecru', 'celadon', 'mauve', 'umber',
      'tawny', 'alabaster', 'burnished', 'capsule', 'curation', 'provenance',
      'archive', 'monochromatic', 'sculptural', 'deconstructed', 'understated',
      'draped', 'cinched', 'oversized', 'textural', 'polished', 'heritage',
      'gilded', 'chromatic', 'studied', 'verdant', 'slouchy', 'laconic',
      'palette', 'ennui', 'chic', 'proportion', 'craft', 'wardrobe', 'minimal',
      'cobalt', 'eclecticism',
    ];
    for (const word of knownWords) {
      expect(fashionUsageFor(word).length).toBeGreaterThan(10);
    }
  });
});
