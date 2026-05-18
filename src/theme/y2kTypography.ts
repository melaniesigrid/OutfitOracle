/**
 * Y2K Decree Typography System
 *
 * Two subthemes:
 *   decree — Syne ExtraBold (editorial impact) + Cormorant Garamond Italic (elegant script)
 *   club   — Baloo 2 ExtraBold (bubbly Y2K) + Knewave (handwritten sticker energy)
 *
 * Both share IBM Plex Mono for archive labels / data and Cormorant for editorial titles.
 */

export type Y2KFontSubtheme = 'decree' | 'club';

export const Y2K_SUBTHEME_LABELS: Record<Y2KFontSubtheme, string> = {
  decree: 'Decree',
  club:   'Club ♡',
};

const decreeFonts = {
  display:    'Syne_800ExtraBold',
  displaySub: 'Syne_600SemiBold',
  script:     'CormorantGaramond_700Bold_Italic',
  mono:       'IBMPlexMono_400Regular',
  monoMedium: 'IBMPlexMono_500Medium',
  editorial:  'CormorantGaramond_600SemiBold',
  editorialItalic: 'CormorantGaramond_700Bold_Italic',
};

const clubFonts = {
  display:    'Baloo2_800ExtraBold',
  displaySub: 'Baloo2_700Bold',
  script:     'Knewave_400Regular',
  mono:       'IBMPlexMono_400Regular',
  monoMedium: 'IBMPlexMono_500Medium',
  editorial:  'CormorantGaramond_600SemiBold',
  editorialItalic: 'CormorantGaramond_700Bold_Italic',
};

export interface Y2KFontSet {
  display: string;
  displaySub: string;
  script: string;
  mono: string;
  monoMedium: string;
  editorial: string;
  editorialItalic: string;
}

export function getY2KFontSet(subtheme: Y2KFontSubtheme): Y2KFontSet {
  return subtheme === 'club' ? clubFonts : decreeFonts;
}

/** Loose tracking: did letterSpacing differ between subthemes */
function dispLS(subtheme: Y2KFontSubtheme, decree: number, club: number) {
  return subtheme === 'club' ? club : decree;
}

export function getY2KTypography(subtheme: Y2KFontSubtheme) {
  const f = getY2KFontSet(subtheme);

  return {
    // ── Display hierarchy ─────────────────────────────────────────────────
    displayHero: {
      fontFamily: f.display,
      fontSize: 54,
      lineHeight: 70,
      letterSpacing: dispLS(subtheme, -1.5, 0),
    },
    displayLarge: {
      fontFamily: f.display,
      fontSize: 40,
      lineHeight: 52,
      letterSpacing: dispLS(subtheme, -1, 0),
    },
    displayMedium: {
      fontFamily: f.display,
      fontSize: 30,
      lineHeight: 40,
      letterSpacing: dispLS(subtheme, -0.5, 0),
    },
    displaySmall: {
      fontFamily: f.display,
      fontSize: 20,
      lineHeight: 28,
      letterSpacing: dispLS(subtheme, -0.3, 0),
    },
    displayMicro: {
      fontFamily: f.display,
      fontSize: 13,
      lineHeight: 20,
      letterSpacing: dispLS(subtheme, 3, 1),
    },

    // ── Script / handwritten ──────────────────────────────────────────────
    scriptLarge: {
      fontFamily: f.script,
      fontSize: 32,
      lineHeight: 46,
    },
    scriptMedium: {
      fontFamily: f.script,
      fontSize: 24,
      lineHeight: 36,
    },
    scriptSmall: {
      fontFamily: f.script,
      fontSize: 20,
      lineHeight: 30,
    },

    // ── Mono labels / data ────────────────────────────────────────────────
    monoLabel: {
      fontFamily: f.monoMedium,
      fontSize: 10,
      letterSpacing: 2,
    },
    monoData: {
      fontFamily: f.mono,
      fontSize: 12,
      letterSpacing: 1,
    },
    monoMicro: {
      fontFamily: f.mono,
      fontSize: 9,
      letterSpacing: 1.5,
    },

    // ── Editorial (Cormorant, always) ─────────────────────────────────────
    editorialTitle: {
      fontFamily: f.editorial,
      fontSize: 32,
      lineHeight: 42,
    },
    editorialItalic: {
      fontFamily: f.editorialItalic,
      fontSize: 20,
      lineHeight: 32,
    },
    editorialSmall: {
      fontFamily: f.editorialItalic,
      fontSize: 15,
      lineHeight: 24,
    },
  } as const;
}

export type Y2KTypography = ReturnType<typeof getY2KTypography>;
