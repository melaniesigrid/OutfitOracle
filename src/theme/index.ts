// ── Shared structural palette ──────────────────────────────────────────────

const sharedColors = {
  // Editorial accent palette — semantically tied to outfit categories
  mint:        '#4A7A58',
  mintDim:     '#EAF2EC',
  mintText:    '#000000',
  lavender:    '#6B3F78',
  lavenderDim: '#EFE8F4',
  lavenderText:'#000000',
  coral:       '#B84B2E',
  coralDim:    '#F7EAE7',
  coralText:   '#000000',
  lemon:       '#8B6838',
  lemonDim:    '#F5EDE0',
  lemonText:   '#000000',
  iris:        '#2E5470',
  irisDim:     '#E2ECF3',
  irisText:    '#000000',

  // Primary accent — overridden per-theme
  scarlet:     '#C41230',
  scarletDim:  '#FCEDEF',
  // Text color to place ON a scarlet-background element (button, badge, chip).
  // Most themes use white; lime-accent themes use black.
  scarletText: '#FFFFFF',
  // Foreground-safe accent: use for text, icons, borders. Equals scarlet on every
  // theme except neo-brutal-light where lime (#D4FA7B) is fills-only and
  // scarletFg is black to guarantee contrast on lavender/white backgrounds.
  scarletFg:   '#C41230',
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
  widgetBg:    '#1C1C1C',  // dark widget background (lock screen / widget views)
};

const editorialLightColors = {
  ...classicColors,
  widgetBg: '#FFFFFF',
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
  textMuted:     '#A0978D',
  border:      '#2A2520',
  borderHard:  '#F5F0E8',
  borderMid:   '#3A342E',
  widgetBg:    '#252118',
};

// Electric — nightclub editorial. Deep electric navy for readability, hot-pink
// accent, and cobalt edges for energy without sacrificing small-label contrast.

const electricColors = {
  ...classicColors,
  scarlet:       '#FF1060',  // TREVO hot-pink/magenta accent
  scarletFg:     '#FF9FC8',  // readable pink for text/icons on navy surfaces
  scarletDim:    '#360019',  // dark tint for on-navy overlays
  bg:            '#050B46',  // deep electric navy — primary reading surface
  bgDark:        '#02031F',  // near-black indigo — headers and hero panels
  bgSurface:     '#060D5A',  // raised navy section surface
  bgCard:        '#07106B',  // cobalt-tinted card surface
  bgCardAlt:     '#060D5A',
  textPrimary:   '#FFFFFF',
  textSecondary: '#EEF2FF',  // crisp periwinkle-white
  textMuted:     '#BFCBFF',  // readable small label colour
  border:        '#2636A8',  // cobalt divider on navy
  borderHard:    '#FFFFFF',
  borderMid:     '#7185FF',
  widgetBg:      '#030629',
};

// Warm organic themes — accent replaces scarlet; same breadth of use as Classic.

const terraFirmaColors = {
  ...classicColors,
  scarlet:       '#B5491A',  // terracotta
  scarletFg:     '#B5491A',
  scarletDim:    '#F5E8E0',
  bg:            '#F5EEE3',
  bgDark:        '#3D2B1F',  // deep umber
  bgSurface:     '#EDE4D5',
  bgCard:        '#FFFFFF',
  bgCardAlt:     '#EDE4D5',
  textPrimary:   '#1C1208',
  textSecondary: '#5A4030',
  textMuted:     '#735137',
  border:        '#D8CFC0',
  borderHard:    '#1C1208',
  borderMid:     '#B0997A',
  widgetBg:      '#FFFFFF',
};

const morningPaperColors = {
  ...classicColors,
  scarlet:       '#6B7F5E',  // sage green
  scarletFg:     '#6B7F5E',
  scarletDim:    '#EAF0E5',
  bg:            '#FBF7F0',
  bgDark:        '#2C2820',  // warm charcoal
  bgSurface:     '#F3EDE2',
  bgCard:        '#FFFFFF',
  bgCardAlt:     '#F3EDE2',
  textPrimary:   '#1A1714',
  textSecondary: '#4A4540',
  textMuted:     '#695F55',
  border:        '#DDD5C8',
  borderHard:    '#1A1714',
  borderMid:     '#B0A898',
  widgetBg:      '#F4F6F0',
};

const goldenHourColors = {
  ...classicColors,
  scarlet:       '#C88040',  // amber-gold
  scarletFg:     '#C88040',
  scarletDim:    '#F5E8D0',
  bg:            '#FAF6EE',
  bgDark:        '#1E1208',  // deep tobacco
  bgSurface:     '#F2EAD8',
  bgCard:        '#FFFFFF',
  bgCardAlt:     '#F2EAD8',
  textPrimary:   '#1C1408',
  textSecondary: '#4A3C28',
  textMuted:     '#6D5A42',
  border:        '#E2D8C8',
  borderHard:    '#1C1408',
  borderMid:     '#B89870',
  widgetBg:      '#1A1412',
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
  textMuted:     '#5F3D8C', // muted purple
  border:      '#B088D4',   // subtle lavender dividers
  borderHard:  '#35106E',   // deep purple — card outlines, rules
  borderMid:   '#7B5CA8',   // mid-strength purple border
  scarlet:    '#EC1E79',    // hot pink — the singular accent
  scarletFg:  '#EC1E79',
  scarletDim: '#FDDDF0',   // blush tint for scarlet backgrounds
  widgetBg:   '#DCD2F5',
};

// Neo-Brutalist Light
const neoBrutalLightColors = {
  ...sharedColors,
  bg:            '#DCD3FF', // Pastel purple background
  bgDark:        '#000000', // Pure black headers
  bgSurface:     '#FFFFFF', // Pure white widgets
  bgCard:        '#FFFFFF', // Pure white cards
  bgCardAlt:     '#FFFFFF',
  textPrimary:   '#000000',
  textSecondary: '#000000',
  textMuted:     '#000000',
  border:        '#000000', // Solid black borders
  borderHard:    '#000000',
  borderMid:     '#000000',
  // Lime is a fill/background accent only — never use as text or hairline border.
  // For foreground lines use scarletFg (#000000). scarletText tells components
  // what text color to place ON a lime fill.
  scarlet:       '#D4FA7B',
  scarletFg:     '#000000', // Black — contrast-safe on lavender/white
  scarletDim:    '#F1FDCE',
  scarletText:   '#000000', // Black text on lime backgrounds
  widgetBg:      '#FFFFFF',

  // Mockup-inspired bright solid backgrounds for cards
  mint:        '#FFFFFF', // White card
  lavender:    '#FF4B62', // Pink/Red card
  coral:       '#FAEE7B', // Yellow card
  lemon:       '#FFFFFF', // White card
  iris:        '#D4FA7B', // Lime green card (softer tint — intentionally lighter than accent)
  mintText:    '#000000',
  lavenderText:'#000000',
  coralText:   '#000000',
  lemonText:   '#000000',
  irisText:    '#000000',
};

// Mondrian — de Stijl grid. Primary red/blue/yellow on white, thick black dividers, Memphis pattern.

const mondrianColors = {
  ...sharedColors,
  bg:            '#FFFFFF',      // white — Memphis-patterned ground
  bgDark:        '#000000',      // black — thick grid lines, headers
  bgSurface:     '#F5BE0B',      // cadmium yellow — primary surface panels
  bgCard:        '#FFFFFF',      // white — art-label content cards
  bgCardAlt:     '#F5BE0B',      // yellow card alt
  textPrimary:   '#000000',
  textSecondary: '#000000',
  textMuted:     '#4A4A4A',
  border:        '#000000',      // thick black grid lines everywhere
  borderHard:    '#000000',
  borderMid:     '#000000',
  scarlet:       '#D40000',      // Mondrian red
  scarletFg:     '#D40000',
  scarletDim:    '#FFDDDD',
  scarletText:   '#FFFFFF',
  widgetBg:      '#FFFFFF',

  // Outfit card accents — Mondrian primaries
  mint:        '#003FA5',        // cobalt blue
  mintText:    '#FFFFFF',
  mintDim:     '#D0DEFF',
  lavender:    '#D40000',        // Mondrian red
  lavenderText:'#FFFFFF',
  lavenderDim: '#FFDDDD',
  coral:       '#F5BE0B',        // cadmium yellow
  coralText:   '#000000',
  coralDim:    '#FFF4C2',
  lemon:       '#FFFFFF',        // white panel
  lemonText:   '#000000',
  lemonDim:    '#F0F0F0',
  iris:        '#000000',        // black panel
  irisText:    '#FFFFFF',
  irisDim:     '#333333',
};

// Neo-Brutalist Dark
const neoBrutalDarkColors = {
  ...sharedColors,
  bg:            '#111111', // Deep grey/black
  bgDark:        '#000000', // Pure black headers
  bgSurface:     '#222222', // Dark widgets
  bgCard:        '#222222', // Dark cards
  bgCardAlt:     '#222222',
  textPrimary:   '#FFFFFF',
  textSecondary: '#FFFFFF',
  textMuted:     '#CCCCCC',
  border:        '#FFFFFF', // Solid white borders
  borderHard:    '#FFFFFF',
  borderMid:     '#FFFFFF',
  scarlet:       '#C9F7A1', // Lime green (great contrast on black)
  scarletFg:     '#C9F7A1',
  scarletDim:    '#3A5025', // Dark lime tint for on-dark surfaces
  scarletText:   '#000000', // Black text on lime backgrounds
  widgetBg:      '#222222',

  // Mockup-inspired bright solid backgrounds for cards
  mint:        '#222222', // Dark card
  lavender:    '#FF4B62', // Pink/Red card
  coral:       '#FAEE7B', // Yellow card
  lemon:       '#222222', // Dark card
  iris:        '#D4FA7B', // Lime green card
  mintText:    '#FFFFFF',
  lavenderText:'#000000',
  coralText:   '#000000',
  lemonText:   '#FFFFFF',
  irisText:    '#000000',
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

// Neo-Brutalist — very bold geometric sans for display
const neoBrutalFonts = {
  display:      'Montserrat_900Black',
  displayBold:  'Montserrat_900Black',
  displayLight: 'Montserrat_700Bold',
  serif:        'Montserrat_700Bold',
  mono:         'IBMPlexMono_400Regular',
  monoMedium:   'IBMPlexMono_500Medium',
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
  | 'y2k'
  | 'neo-brutal-light'
  | 'neo-brutal-dark'
  | 'mondrian';

// ThemeFamily groups themes by visual/structural lineage.
// Use this (via THEMES[name].family) instead of per-name predicate functions
// so new family members don't require adding new predicates.
export type ThemeFamily =
  | 'classic'    // The baseline editorial theme
  | 'editorial'  // Scarlet-discipline variants (light + dark)
  | 'warm'       // Organic accent themes (terra-firma, morning-paper, golden-hour)
  | 'electric'   // TREVO-inspired dark vivid themes
  | 'y2k'        // Digital zine / fashion club
  | 'neo-brutal' // Thick borders, offset shadows, solid card backgrounds
  | 'mondrian';  // de Stijl grid — primary colours, thick black dividers, Memphis pattern

export type AppColors = typeof classicColors;
export type AppFonts = typeof classicFonts;

export interface AppMetrics {
  borderWidth: number;
  radius: number;
  shadowOffset: number;
  shadowOpacity: number;
  shadowColor: string;
  cardGap: number;
  widgetLeftBorderWidth: number;
}

export interface AppFlags {
  isWarmTheme: boolean;
  isBannerTheme: boolean;
  solidCardBackgrounds: boolean;
}

// Extra decorative tokens only used by Y2K components
export const y2kTokens = {
  lime:          '#C7F238',
  yellowHighlight: '#F6E85F',
  hotPink:       '#EC1E79',
  deepPurple:    '#35106E',
  mutedPurple:   '#5F3D8C',
  ink:           '#24113F',
  cream:         '#FFFBEF',
  blush:         '#FDDDF0',
  tangerine:     '#FF7C35',
  lavenderBg:    '#D8C2F2',
  softPink:      '#F8BBD4',
  radius:        16,     // rounded corners for Y2K cards
  radiusSm:      10,
  shadowOffset:  4,      // offset shadow depth
  borderWidth:   1.5,    // Y2K card outer border
} as const;

// Extra decorative tokens only used by Mondrian components
export const mondrianTokens = {
  red:         '#D40000',  // primary Mondrian red
  blue:        '#003FA5',  // cobalt blue
  yellow:      '#F5BE0B',  // cadmium yellow
  black:       '#000000',
  white:       '#FFFFFF',
  gridLine:    4,          // thickness of black grid dividers
} as const;

// Base metrics and flags
const baseMetrics: AppMetrics = {
  borderWidth: 1,
  radius: 0,
  shadowOffset: 0,
  shadowOpacity: 0,
  shadowColor: 'transparent',
  cardGap: 24, // spacing.lg
  widgetLeftBorderWidth: 0,
};

const baseFlags: AppFlags = { isWarmTheme: false, isBannerTheme: false, solidCardBackgrounds: false };
const warmFlags: AppFlags = { isWarmTheme: true, isBannerTheme: false, solidCardBackgrounds: false };
const bannerFlags: AppFlags = { isWarmTheme: false, isBannerTheme: true, solidCardBackgrounds: false };
const solidBannerFlags: AppFlags = { isWarmTheme: false, isBannerTheme: true, solidCardBackgrounds: true };

export const THEMES: Record<ThemeName, { colors: AppColors; fonts: AppFonts; metrics: AppMetrics; flags: AppFlags; isDark: boolean; family: ThemeFamily }> = {
  'classic': {
    colors: classicColors,
    fonts:  classicFonts,
    metrics: baseMetrics,
    flags: baseFlags,
    isDark: false,
    family: 'classic',
  },
  'editorial-light': {
    colors: editorialLightColors,
    fonts:  editorialFonts,
    metrics: baseMetrics,
    flags: baseFlags,
    isDark: false,
    family: 'editorial',
  },
  'editorial-dark': {
    colors: editorialDarkColors,
    fonts:  editorialFonts,
    metrics: baseMetrics,
    flags: baseFlags,
    isDark: true,
    family: 'editorial',
  },
  'terra-firma': {
    colors: terraFirmaColors,
    fonts:  classicFonts,
    metrics: { ...baseMetrics, borderWidth: 2, widgetLeftBorderWidth: 3 },
    flags: warmFlags,
    isDark: false,
    family: 'warm',
  },
  'morning-paper': {
    colors: morningPaperColors,
    fonts:  syneFonts,
    metrics: { ...baseMetrics, borderWidth: 0 },
    flags: bannerFlags,
    isDark: false,
    family: 'warm',
  },
  'golden-hour': {
    colors: goldenHourColors,
    fonts:  classicFonts,
    metrics: { ...baseMetrics, borderWidth: 0 },
    flags: bannerFlags,
    isDark: false,
    family: 'warm',
  },
  'electric': {
    colors: electricColors,
    fonts:  electricFonts,
    metrics: { ...baseMetrics, borderWidth: 0 },
    flags: bannerFlags,
    isDark: true,
    family: 'electric',
  },
  'y2k': {
    colors: y2kColors,
    fonts:  y2kFonts,
    metrics: { ...baseMetrics, borderWidth: 1.5, radius: 16 },
    flags: bannerFlags,
    isDark: false,
    family: 'y2k',
  },
  'neo-brutal-light': {
    colors: neoBrutalLightColors,
    fonts:  neoBrutalFonts,
    metrics: { ...baseMetrics, borderWidth: 4, shadowOffset: 6, shadowOpacity: 1, shadowColor: '#000000', cardGap: 32 },
    flags: solidBannerFlags,
    isDark: false,
    family: 'neo-brutal',
  },
  'neo-brutal-dark': {
    colors: neoBrutalDarkColors,
    fonts:  neoBrutalFonts,
    metrics: { ...baseMetrics, borderWidth: 4, shadowOffset: 6, shadowOpacity: 1, shadowColor: '#FFFFFF', cardGap: 32 },
    flags: solidBannerFlags,
    isDark: true,
    family: 'neo-brutal',
  },
  'mondrian': {
    colors: mondrianColors,
    fonts:  neoBrutalFonts,  // Montserrat Black — condensed poster weight
    metrics: { ...baseMetrics, borderWidth: 4, shadowOffset: 0, shadowOpacity: 0, shadowColor: 'transparent', cardGap: 0 },
    flags: solidBannerFlags,
    isDark: false,
    family: 'mondrian',
  },
};

export function getThemeTokens(name: ThemeName) {
  return THEMES[name];
}

/**
 * Returns true when a hex background color is dark enough to need light-coloured
 * foreground content (icons, text, lines).  Used by components to pick surface-
 * relative colours without depending on behavioural flags like isWarmTheme.
 */
export function isDarkColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.179;
}

// Predicate helpers — thin wrappers around THEMES[name].family.
// Prefer reading `family` directly in new code; these exist for backwards compat.
export function isEditorialTheme(name: ThemeName): boolean {
  return THEMES[name].family === 'editorial';
}

export function isY2KTheme(name: ThemeName): boolean {
  return THEMES[name].family === 'y2k';
}

export function isNeoBrutalTheme(name: ThemeName): boolean {
  return THEMES[name].family === 'neo-brutal';
}

export function isMondrianTheme(name: ThemeName): boolean {
  return THEMES[name].family === 'mondrian';
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
