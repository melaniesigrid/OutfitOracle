// ── Shared structural palette ──────────────────────────────────────────────

const sharedColors = {
  // Editorial accent palette — semantically tied to outfit categories
  mint:        '#4A7A58',
  mintDim:     '#EAF2EC',
  lavender:    '#6B3F78',
  lavenderDim: '#EFE8F4',
  coral:       '#B84B2E',
  coralDim:    '#F7EAE7',
  lemon:       '#8B6838',
  lemonDim:    '#F5EDE0',
  iris:        '#2E5470',
  irisDim:     '#E2ECF3',

  scarlet:    '#C41230',
  scarletDim: '#FCEDEF',
};

// ── Theme token sets ───────────────────────────────────────────────────────

const classicColors = {
  ...sharedColors,
  bg:          '#FAF9F6',
  bgDark:      '#0D0B08',
  bgSurface:   '#F3EEE5',
  bgCard:      '#FFFFFF',
  bgCardAlt:   '#F3EEE5',
  textPrimary:   '#1A1714',
  textSecondary: '#5A5248',
  textMuted:     '#706A66',
  border:      '#DDD7CE',
  borderHard:  '#1A1714',
  borderMid:   '#B0A898',
};

const editorialLightColors = {
  ...classicColors,
  // Same palette as Classic — scarlet discipline enforced by component authors
};

const editorialDarkColors = {
  ...sharedColors,
  bg:          '#1A1714',
  bgDark:      '#0D0B08',
  bgSurface:   '#252118',
  bgCard:      '#252118',
  bgCardAlt:   '#2E2920',
  textPrimary:   '#F5F0E8',
  textSecondary: '#B0A898',
  textMuted:     '#706A66',
  border:      '#2A2520',
  borderHard:  '#F5F0E8',
  borderMid:   '#3A342E',
};

// ── Font sets ─────────────────────────────────────────────────────────────

const cormorantFonts = {
  display:      'CormorantGaramond_700Bold_Italic',
  displayBold:  'CormorantGaramond_600SemiBold',
  displayLight: 'CormorantGaramond_300Light',
  serif:        'CormorantGaramond_400Regular_Italic',
};

const classicFonts = {
  ...cormorantFonts,
  mono:         'IBMPlexMono_400Regular',
  monoMedium:   'IBMPlexMono_500Medium',
};

const editorialFonts = {
  ...cormorantFonts,
  mono:         'SpaceMono_400Regular',
  monoMedium:   'SpaceMono_700Bold',
};

// ── Public types ───────────────────────────────────────────────────────────

export type ThemeName = 'classic' | 'editorial-light' | 'editorial-dark';
export type AppColors = typeof classicColors;
export type AppFonts = typeof classicFonts;

// ── Named theme objects ────────────────────────────────────────────────────

export const THEMES: Record<ThemeName, { colors: AppColors; fonts: AppFonts; isDark: boolean }> = {
  'classic': {
    colors: classicColors,
    fonts:  classicFonts,
    isDark: false,
  },
  'editorial-light': {
    colors: editorialLightColors,
    fonts:  editorialFonts,
    isDark: false,
  },
  'editorial-dark': {
    colors: editorialDarkColors,
    fonts:  editorialFonts,
    isDark: true,
  },
};

export function getThemeTokens(name: ThemeName) {
  return THEMES[name];
}

// ── Legacy static exports (kept for gradual migration) ─────────────────────
// Components should prefer useTheme(). These are the Classic defaults.

export const colors = classicColors;
export const fonts  = classicFonts;

// ── Shared tokens (same across all themes) ─────────────────────────────────

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
  xxl: 64,
};

export const radius = {
  sm: 0,
  md: 0,
  lg: 2,
  pill: 999,
};
