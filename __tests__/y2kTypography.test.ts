import { getY2KFontSet, getY2KTypography } from '../src/theme/y2kTypography';

describe('getY2KFontSet', () => {
  it('decree subtheme uses Syne for display', () => {
    const fonts = getY2KFontSet('decree');
    expect(fonts.display).toBe('Syne_800ExtraBold');
    expect(fonts.displaySub).toBe('Syne_600SemiBold');
    expect(fonts.script).toBe('CormorantGaramond_700Bold_Italic');
  });

  it('club subtheme uses Baloo2 for display', () => {
    const fonts = getY2KFontSet('club');
    expect(fonts.display).toBe('Baloo2_800ExtraBold');
    expect(fonts.displaySub).toBe('Baloo2_700Bold');
    expect(fonts.script).toBe('Knewave_400Regular');
  });

  it('both subthemes share IBM Plex Mono for mono', () => {
    expect(getY2KFontSet('decree').mono).toBe('IBMPlexMono_400Regular');
    expect(getY2KFontSet('club').mono).toBe('IBMPlexMono_400Regular');
  });

  it('both subthemes share Cormorant for editorial', () => {
    expect(getY2KFontSet('decree').editorial).toBe('CormorantGaramond_600SemiBold');
    expect(getY2KFontSet('club').editorial).toBe('CormorantGaramond_600SemiBold');
  });
});

describe('getY2KTypography', () => {
  describe('decree subtheme — negative letterSpacing on display', () => {
    const t = getY2KTypography('decree');

    it('displayHero has letterSpacing -1.5', () => expect(t.displayHero.letterSpacing).toBe(-1.5));
    it('displayLarge has letterSpacing -1', () => expect(t.displayLarge.letterSpacing).toBe(-1));
    it('displayMedium has letterSpacing -0.5', () => expect(t.displayMedium.letterSpacing).toBe(-0.5));
    it('displayMicro has letterSpacing 3 (wide)', () => expect(t.displayMicro.letterSpacing).toBe(3));
    it('uses Syne ExtraBold for displayHero', () => {
      expect(t.displayHero.fontFamily).toBe('Syne_800ExtraBold');
    });
  });

  describe('club subtheme — zero letterSpacing on display', () => {
    const t = getY2KTypography('club');

    it('displayHero has letterSpacing 0', () => expect(t.displayHero.letterSpacing).toBe(0));
    it('displayLarge has letterSpacing 0', () => expect(t.displayLarge.letterSpacing).toBe(0));
    it('displayMicro has letterSpacing 1', () => expect(t.displayMicro.letterSpacing).toBe(1));
    it('uses Baloo2 ExtraBold for displayHero', () => {
      expect(t.displayHero.fontFamily).toBe('Baloo2_800ExtraBold');
    });
  });

  it('both subthemes expose monoLabel with letterSpacing 2', () => {
    expect(getY2KTypography('decree').monoLabel.letterSpacing).toBe(2);
    expect(getY2KTypography('club').monoLabel.letterSpacing).toBe(2);
  });
});
