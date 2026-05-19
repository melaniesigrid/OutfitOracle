import {
  FASHION_CAPITALS,
  STYLE_PASSPORT_LANDMARKS,
  getStylePassportLandmark,
  isFashionCapital,
  isStylePassportLandmark,
} from '../src/data/fashionCapitals';

describe('style passport landmarks', () => {
  it('keeps a broad global catalog for passport visits', () => {
    expect(STYLE_PASSPORT_LANDMARKS.length).toBeGreaterThanOrEqual(120);
    expect(new Set(STYLE_PASSPORT_LANDMARKS.map(c => c.country)).size).toBeGreaterThanOrEqual(55);
  });

  it('keeps the old fashion-capital export as a compatibility alias', () => {
    expect(FASHION_CAPITALS).toBe(STYLE_PASSPORT_LANDMARKS);
    expect(isFashionCapital('Toronto')).toBe(true);
  });

  it('has unique city names with valid map coordinates', () => {
    const names = STYLE_PASSPORT_LANDMARKS.map(c => c.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);

    for (const landmark of STYLE_PASSPORT_LANDMARKS) {
      expect(Number.isFinite(landmark.lat)).toBe(true);
      expect(Number.isFinite(landmark.lon)).toBe(true);
      expect(landmark.lat).toBeGreaterThanOrEqual(-90);
      expect(landmark.lat).toBeLessThanOrEqual(90);
      expect(landmark.lon).toBeGreaterThanOrEqual(-180);
      expect(landmark.lon).toBeLessThanOrEqual(180);
    }
  });

  it('recognizes common city aliases and accented input', () => {
    expect(getStylePassportLandmark('New York City')?.name).toBe('New York');
    expect(getStylePassportLandmark('NYC')?.name).toBe('New York');
    expect(getStylePassportLandmark('CDMX')?.name).toBe('Mexico City');
    expect(getStylePassportLandmark('Bangalore')?.name).toBe('Bengaluru');
    expect(getStylePassportLandmark('Sao Paulo')?.name).toBe('Sao Paulo');
    expect(getStylePassportLandmark('São Paulo')?.name).toBe('Sao Paulo');
  });

  it('does not let short aliases match unrelated city names', () => {
    expect(getStylePassportLandmark('Lagos')?.name).toBe('Lagos');
    expect(getStylePassportLandmark('Lahore')?.name).toBe('Lahore');
    expect(isStylePassportLandmark('Auckland')).toBe(true);
  });
});
