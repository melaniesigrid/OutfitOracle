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

// Electric — TREVO-inspired. Vivid cobalt throughout, hot-pink accent, ExtraBold Syne.

const electricColors = {
  ...classicColors,
  scarlet:       '#FF1060',  // TREVO hot-pink/magenta accent
  scarletDim:    '#33001A',  // dark tint for on-blue overlays
  bg:            '#1E2DFF',  // vivid electric blue — the scrollable content surface
  bgDark:        '#0A15CC',  // deeper blue — header and hero panels
  bgSurface:     '#2538FF',  // slightly lighter blue for section surfaces
  bgCard:        '#3040FF',  // card surface (on dark blue)
  bgCardAlt:     '#2538FF',
  textPrimary:   '#FFFFFF',
  textSecondary: '#C8D0FF',  // light periwinkle
  textMuted:     '#8090CC',  // muted blue-white
  border:        '#3248FF',  // subtle same-palette divider
  borderHard:    '#FFFFFF',
  borderMid:     '#4858FF',
};

// Warm organic themes — accent replaces scarlet; same breadth of use as Classic.

const terraFirmaColors = {
  ...classicColors,
  scarlet:       '#B5491A',  // terracotta
  scarletDim:    '#F5E8E0',
  bg:            '#F5EEE3',
  bgDark:        '#3D2B1F',  // deep umber
  bgSurface:     '#EDE4D5',
  bgCard:        '#FFFFFF',
  bgCardAlt:     '#EDE4D5',
  textPrimary:   '#1C1208',
  textSecondary: '#5A4030',
  textMuted:     '#8B6A50',
  border:        '#D8CFC0',
  borderHard:    '#1C1208',
  borderMid:     '#B0997A',
};

const morningPaperColors = {
  ...classicColors,
  scarlet:       '#6B7F5E',  // sage green
  scarletDim:    '#EAF0E5',
  bg:            '#FBF7F0',
  bgDark:        '#2C2820',  // warm charcoal
  bgSurface:     '#F3EDE2',
  bgCard:        '#FFFFFF',
  bgCardAlt:     '#F3EDE2',
  textPrimary:   '#1A1714',
  textSecondary: '#4A4540',
  textMuted:     '#7A7268',
  border:        '#DDD5C8',
  borderHard:    '#1A1714',
  borderMid:     '#B0A898',
};

const goldenHourColors = {
  ...classicColors,
  scarlet:       '#C88040',  // amber-gold
  scarletDim:    '#F5E8D0',
  bg:            '#FAF6EE',
  bgDark:        '#1E1208',  // deep tobacco
  bgSurface:     '#F2EAD8',
  bgCard:        '#FFFFFF',
  bgCardAlt:     '#F2EAD8',
  textPrimary:   '#1C1408',
  textSecondary: '#4A3C28',
  textMuted:     '#7A6A52',
  border:        '#E2D8C8',
  borderHard:    '#1C1408',
  borderMid:     '#B89870',
};

// Y2K — digital zine / fashion club. Lavender + hot pink + deep purple + cream.

const y2kColors = {
  ...sharedColors,
  // Override shared lavender/lemon with Y2K-calibrated versions
  lavender:    '#9B5CA8',
  lavenderDim: '#F0E0F8',
  lemon:       '#A09A00',
  lemonDim:    '#F6E85F',
  // Core palette
  bg:          '#D8C2F2',   // lavender page background
  bgDark:      '#35106E',   // deep purple — hero panels, headers
  bgSurface:   '#F8BBD4',   // soft pink surface
  bgCard:      '#FFFBEF',   // cream card background
  bgCardAlt:   '#FFFDF7',   // sticker white
  textPrimary:   '#24113F', // ink — primary text
  textSecondary: '#35106E', // deep purple — secondary text
  textMuted:     '#7B5CA8', // muted purple
  border:      '#B088D4',   // subtle lavender dividers
  borderHard:  '#35106E',   // deep purple — card outlines, rules
  borderMid:   '#7B5CA8',   // mid-strength purple border
  scarlet:    '#EC1E79',    // hot pink — the singular accent
  scarletDim: '#FDDDF0',   // blush tint for scarlet backgrounds
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

// Electric — maximum-weight Syne for display; IBM Plex Mono for precision data labels
const electricFonts = {
  display:      'Syne_800ExtraBold',   // heaviest weight — bold editorial impact
  displayBold:  'Syne_800ExtraBold',
  displayLight: 'Syne_600SemiBold',   // "light" is still semi-bold for visual weight
  serif:        'Syne_700Bold',
  mono:         'IBMPlexMono_400Regular',
  monoMedium:   'IBMPlexMono_500Medium',
};

// Y2K — Syne ExtraBold for maximum Y2K headline impact; Cormorant Italic for script-like editorial
const y2kFonts = {
  display:      'Syne_800ExtraBold',
  displayBold:  'Syne_800ExtraBold',
  displayLight: 'Syne_600SemiBold',
  serif:        'CormorantGaramond_700Bold_Italic',
  mono:         'IBMPlexMono_400Regular',
  monoMedium:   'IBMPlexMono_500Medium',
};

// Morning Paper — geometric sans-serif (Syne) replaces Cormorant for display
const syneFonts = {
  display:      'Syne_700Bold',
  displayBold:  'Syne_800ExtraBold',
  displayLight: 'Syne_400Regular',
  serif:        'Syne_600SemiBold',
  mono:         'SpaceMono_400Regular',
  monoMedium:   'SpaceMono_700Bold',
};

// ── Public types ───────────────────────────────────────────────────────────

export type ThemeName =
  | 'classic'
  | 'editorial-light'
  | 'editorial-dark'
  | 'terra-firma'
  | 'morning-paper'
  | 'golden-hour'
  | 'electric'
  | 'y2k';
export type AppColors = typeof classicColors;
export type AppFonts = typeof classicFonts;

export function isEditorialTheme(name: ThemeName): boolean {
  return name === 'editorial-light' || name === 'editorial-dark';
}

export function isY2KTheme(name: ThemeName): boolean {
  return name === 'y2k';
}

// Extra decorative tokens only used by Y2K components
export const y2kTokens = {
  lime:          '#C7F238',
  yellowHighlight: '#F6E85F',
  hotPink:       '#EC1E79',
  deepPurple:    '#35106E',
  mutedPurple:   '#7B5CA8',
  ink:           '#24113F',
  cream:         '#FFFBEF',
  blush:         '#FDDDF0',
  lavenderBg:    '#D8C2F2',
  softPink:      '#F8BBD4',
  radius:        16,     // rounded corners for Y2K cards
  radiusSm:      10,
  shadowOffset:  4,      // offset shadow depth
  borderWidth:   1.5,    // Y2K card outer border
} as const;

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
  'terra-firma': {
    colors: terraFirmaColors,
    fonts:  classicFonts,
    isDark: false,
  },
  'morning-paper': {
    colors: morningPaperColors,
    fonts:  syneFonts,
    isDark: false,
  },
  'golden-hour': {
    colors: goldenHourColors,
    fonts:  classicFonts,
    isDark: false,
  },
  'electric': {
    colors: electricColors,
    fonts:  electricFonts,
    isDark: true,
  },
  'y2k': {
    colors: y2kColors,
    fonts:  y2kFonts,
    isDark: false,
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
