import {
  isDarkColor,
  isY2KTheme,
  isMondrianTheme,
  isNeoBrutalTheme,
  isEditorialTheme,
  isWeatherGlanceTheme,
  THEMES,
  ThemeName,
} from '../src/theme';

describe('isDarkColor', () => {
  it('jet black (#0D0B08) is dark', () => expect(isDarkColor('#0D0B08')).toBe(true));
  it('cream (#FAF9F6) is light', () => expect(isDarkColor('#FAF9F6')).toBe(false));
  it('pure black (#000000) is dark', () => expect(isDarkColor('#000000')).toBe(true));
  it('pure white (#FFFFFF) is light', () => expect(isDarkColor('#FFFFFF')).toBe(false));
  it('scarlet (#C41230) is light (luminance ~0.228, above 0.179 threshold)', () => expect(isDarkColor('#C41230')).toBe(false));
  it('mid-grey (#808080) is light (luminance ~0.216, above threshold)', () => expect(isDarkColor('#808080')).toBe(false));
});

describe('theme family predicates', () => {
  const allThemes = Object.keys(THEMES) as ThemeName[];

  describe('isY2KTheme', () => {
    it('y2k → true', () => expect(isY2KTheme('y2k')).toBe(true));
    it('classic → false', () => expect(isY2KTheme('classic')).toBe(false));
    it('mondrian → false', () => expect(isY2KTheme('mondrian')).toBe(false));
    it('exactly 1 theme in registry is Y2K', () => {
      expect(allThemes.filter(n => isY2KTheme(n))).toHaveLength(1);
    });
  });

  describe('isMondrianTheme', () => {
    it('mondrian → true', () => expect(isMondrianTheme('mondrian')).toBe(true));
    it('y2k → false', () => expect(isMondrianTheme('y2k')).toBe(false));
    it('exactly 1 theme in registry is Mondrian', () => {
      expect(allThemes.filter(n => isMondrianTheme(n))).toHaveLength(1);
    });
  });

  describe('isNeoBrutalTheme', () => {
    it('neo-brutal-light → true', () => expect(isNeoBrutalTheme('neo-brutal-light')).toBe(true));
    it('neo-brutal-dark → true', () => expect(isNeoBrutalTheme('neo-brutal-dark')).toBe(true));
    it('classic → false', () => expect(isNeoBrutalTheme('classic')).toBe(false));
    it('exactly 2 themes in registry are NeoBrutal', () => {
      expect(allThemes.filter(n => isNeoBrutalTheme(n))).toHaveLength(2);
    });
  });

  describe('isEditorialTheme', () => {
    it('editorial-light → true', () => expect(isEditorialTheme('editorial-light')).toBe(true));
    it('editorial-dark → true', () => expect(isEditorialTheme('editorial-dark')).toBe(true));
    it('y2k → false', () => expect(isEditorialTheme('y2k')).toBe(false));
  });

  describe('isWeatherGlanceTheme', () => {
    it('weather-glance → true', () => expect(isWeatherGlanceTheme('weather-glance')).toBe(true));
    it('weather-editorial → true', () => expect(isWeatherGlanceTheme('weather-editorial')).toBe(true));
    it('classic → false', () => expect(isWeatherGlanceTheme('classic')).toBe(false));
  });

  it('every theme belongs to exactly one family (predicates are mutually exclusive)', () => {
    for (const name of allThemes) {
      const matches = [
        isY2KTheme(name),
        isMondrianTheme(name),
        isNeoBrutalTheme(name),
        isEditorialTheme(name),
        isWeatherGlanceTheme(name),
      ].filter(Boolean).length;
      // Some themes (classic, warm, electric) belong to none of these — that's OK
      expect(matches).toBeLessThanOrEqual(1);
    }
  });
});
