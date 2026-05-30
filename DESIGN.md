# Design System — Outfit Oracle

## Product Context

- **What this is:** A weather-powered AI fashion advisor that delivers editorial outfit verdicts — not a wardrobe organizer, not a catalog app. An authority speaking TO the user.
- **Who it's for:** Aesthetically aspirational people 25–40 who follow fashion but want practical, opinionated help getting dressed. Creator referral traffic from influencer posts; style-literate but time-poor.
- **Space / industry:** AI consumer apps × fashion editorial. Peers: nothing in category — every wardrobe/style app (Whering, Cladwell, Stylebook) uses "your clothes, your space" UX. Outfit Oracle is oracle-as-magazine, not app-as-wardrobe.
- **Project type:** iOS-first mobile app (Expo bare workflow, React Native)
- **Positioning:** The version of Vogue that knows your weather.

---

## Aesthetic Direction

- **Direction:** Oracle-as-Magazine — editorial authority, not wardrobe utility.
- **Decoration level:** Minimal-intentional. Typography IS the decoration. A single oversized Cormorant numeral (temperature, rating, streak count) creates more editorial presence than any illustration. No decorative blobs, no icon grids, no rounded cards.
- **Mood:** Cold information rendered with the heat of obsession. The app should feel like it cost something to make. Not delight — recognition. Like opening a magazine you didn't know you'd been waiting for.
- **Key insight (EUREKA):** Every AI style app assumes users want to see their clothes reflected back. Outfit Oracle doesn't work that way. It's a publication, not a mirror. This drives every design decision.
- **The thirteen themes** span four design families (editorial, warm, electric/Y2K/neo-brutal/mondrian, weather). The editorial core (Classic, Editorial Light/Dark) shares typography logic, layout grammar, and motion spec. Each family adds its own visual grammar on top — the oracle-as-magazine posture is consistent; the surface expression varies.

---

## Theme System

Users select themes in **Settings → Oracle Theme**. Preference persists to AsyncStorage key `@outfit_oracle_theme`. Default: Classic.

All themes ship in `src/theme/index.ts` as entries in the `THEMES` record. Every theme supplies the complete `AppColors` + `AppFonts` + `AppMetrics` + `AppFlags` + `isDark` + `family` fields — no optional fields. TypeScript enforces completeness.

### Theme Classification

| Theme | `isDark` | `family` | Display font | Mono font | Accent | Structural tone |
|---|---|---|---|---|---|---|
| Classic | false | `classic` | Cormorant Garamond | IBM Plex Mono | Scarlet `#C41230` — broad | Warm cream editorial |
| Editorial Light | false | `editorial` | Cormorant Garamond | Space Mono | Scarlet — one per screen | Cream, print-publication grammar |
| Editorial Dark | true | `editorial` | Cormorant Garamond | Space Mono | Scarlet — one per screen | Near-black, maximum authority |
| Terra Firma | false | `warm` | Cormorant Garamond | IBM Plex Mono | Terracotta `#B5491A` | Desert-warm, Marrakech editorial |
| Morning Paper | false | `warm` | Syne | Space Mono | Sage `#6B7F5E` | Botanical, Porter × Kinfolk |
| Golden Hour | false | `warm` | Cormorant Garamond | IBM Plex Mono | Amber-gold `#C88040` | Luxury warmth, Loewe at dusk |
| Electric | true | `electric` | Syne ExtraBold | IBM Plex Mono | Hot-pink `#FF1060` | TREVO-inspired, vivid cobalt |
| Weather Glance | false | `weather` | Syne | Space Mono | Amber `#FFD166` | Animated sky-forward forecast widgets |
| Weather Editorial | false | `weather` | Cormorant Garamond | IBM Plex Mono | Amber `#FFD166` | Editorial sky; glass/phone treatment |
| Y2K | false | `y2k` | Syne ExtraBold (Decree) / Baloo 2 ExtraBold (Club) | IBM Plex Mono | Hot-pink `#EC1E79` | Digital zine / fashion club |
| Neo-Brutal Light | false | `neo-brutal` | Montserrat Black | IBM Plex Mono | Lime `#D4FA7B` | Thick borders, offset shadow, pastel purple |
| Neo-Brutal Dark | true | `neo-brutal` | Montserrat Black | IBM Plex Mono | Lime `#C9F7A1` | Thick borders, offset shadow, dark |
| Mondrian | false | `mondrian` | Montserrat Black | IBM Plex Mono | Red `#D40000` | de Stijl grid, primary colours, Memphis pattern |

---

## Individual Theme Specs

### Classic

The baseline. Warm, editorial, broad scarlet as UI structure.

| Token | Value |
|---|---|
| `bg` | `#FAF9F6` warm cream |
| `bgDark` | `#0D0B08` near-black |
| `bgSurface` | `#F3EEE5` |
| `bgCard` | `#FFFFFF` |
| `scarlet` | `#C41230` |
| `textPrimary` | `#1A1714` |
| `textSecondary` | `#5A5248` |
| `mono font` | IBM Plex Mono |
| `display font` | Cormorant Garamond |

**Scarlet usage:** Broad. Chips, badges, headers, category markers, borders. No restriction.

**Mood:** The app as shipped for early adopters. Clean, warm, editorial. IBM Plex reads slightly corporate but legible at all sizes. Scarlet as structural color is familiar and consistent.

---

### Editorial Light

Oracle-as-Magazine on cream. The print publication metaphor on light surfaces.

| Token | Value |
|---|---|
| `bg` | `#FAF9F6` warm cream |
| `bgDark` | `#0D0B08` near-black |
| `bgSurface` | `#F3EEE5` |
| `bgCard` | `#FFFFFF` |
| `scarlet` | `#C41230` |
| `textPrimary` | `#1A1714` |
| `textSecondary` | `#5A5248` |
| `mono font` | Space Mono |
| `display font` | Cormorant Garamond |

**Scarlet usage:** One element per screen maximum. Priority: verdict rule > Founding Member badge > error state > category marker. One drop of blood on paper.

**Section grammar:** Verdict arrives on dark (`#0D0B08`). Outfit cards alternate cream. This is publication grammar — editorial spreads — not a dark mode.

**Macro type:** Temperature, rating, streak count at 160–180px Cormorant Light. Data becomes decoration.

**Mood:** The oracle as fashion publication. Cold, authoritative, typographic. Space Mono reads like a print label from a sample-sale tag.

---

### Editorial Dark

Oracle-as-Magazine on near-black. The publication at night.

| Token | Value |
|---|---|
| `bg` | `#1A1714` near-black |
| `bgDark` | `#0D0B08` |
| `bgSurface` | `#252118` |
| `bgCard` | `#252118` |
| `bgCardAlt` | `#2E2920` |
| `textPrimary` | `#F5F0E8` |
| `textSecondary` | `#B0A898` |
| `textMuted` | `#706A66` |
| `border` | `#2A2520` |
| `borderHard` | `#F5F0E8` |
| `borderMid` | `#3A342E` |
| `scarlet` | `#C41230` |
| `mono font` | Space Mono |
| `display font` | Cormorant Garamond |

**Scarlet usage:** One element per screen maximum (same rule as Editorial Light). One red element on near-black is a declaration, not decoration.

**Section grammar:** Dark everywhere. Input state: cream cards emerge as islands. Verdict: dark primary with cream type. Outfit cards: slightly lighter dark.

**Macro type:** 160–180px Cormorant Light at `rgba(245,240,232,0.15)` — watermark behind content.

**Mood:** Maximum authority. The oracle speaks from darkness.

---

### Terra Firma

Desert editorial. Warm organic palette with terracotta as the structural accent.

| Token | Value |
|---|---|
| `bg` | `#F5EEE3` warm cream-sand |
| `bgDark` | `#3D2B1F` deep umber |
| `bgSurface` | `#EDE4D5` |
| `bgCard` | `#FFFFFF` |
| `scarlet` | `#B5491A` terracotta |
| `scarletDim` | `#F5E8E0` |
| `textPrimary` | `#1C1208` |
| `textSecondary` | `#5A4030` |
| `textMuted` | `#8B6A50` |
| `border` | `#D8CFC0` |
| `borderHard` | `#1C1208` |
| `borderMid` | `#B0997A` |
| `mono font` | IBM Plex Mono |
| `display font` | Cormorant Garamond |

**Accent role:** `scarlet` token is terracotta throughout. The accent is broad (Classic-style discipline), not restricted.

**Hero dark panel:** Header and hero sections use `bgDark` (#3D2B1F, deep umber), giving an earthy-warm contrast to the sand-cream scrollable content.

**TodayScreen treatment:** `isWarmTheme = true`, `isBannerTheme = false`, `isTerraFirma = true`. Hero temperature displays in amber-orange (`#D4873A`) against the umber header.

**Mood:** Marrakech editorial. Desert authority. The app as a luxury travel magazine.

---

### Morning Paper

Botanical editorial. Syne sans-serif replaces Cormorant for display; sage accent.

| Token | Value |
|---|---|
| `bg` | `#FBF7F0` paper-warm |
| `bgDark` | `#2C2820` warm charcoal |
| `bgSurface` | `#F3EDE2` |
| `bgCard` | `#FFFFFF` |
| `scarlet` | `#6B7F5E` sage green |
| `scarletDim` | `#EAF0E5` |
| `textPrimary` | `#1A1714` |
| `textSecondary` | `#4A4540` |
| `textMuted` | `#7A7268` |
| `border` | `#DDD5C8` |
| `borderHard` | `#1A1714` |
| `borderMid` | `#B0A898` |
| `display font` | Syne (`Syne_700Bold` display, `Syne_800ExtraBold` displayBold, `Syne_400Regular` displayLight, `Syne_600SemiBold` serif) |
| `mono font` | Space Mono |

**Typography shift:** Syne replaces Cormorant Garamond for all display roles in this theme. Syne is geometric, confident, contemporary — the editorial authority expressed as graphic design rather than print heritage. The mono switches to Space Mono for print-label texture.

**TodayScreen treatment:** `isWarmTheme = true`, `isBannerTheme = true`. Hero temperature is rendered in ivory-cream (`#FAF9F6`) inside the charcoal header banner. The banner layout displays time + city + temperature together in a single structured unit.

**Mood:** Porter × Kinfolk. Botanical, clean, morning routine.

---

### Golden Hour

Luxury warmth. Amber-gold accent, tobacco-dark header, Cormorant display.

| Token | Value |
|---|---|
| `bg` | `#FAF6EE` warm ivory |
| `bgDark` | `#1E1208` deep tobacco |
| `bgSurface` | `#F2EAD8` |
| `bgCard` | `#FFFFFF` |
| `scarlet` | `#C88040` amber-gold |
| `scarletDim` | `#F5E8D0` |
| `textPrimary` | `#1C1408` |
| `textSecondary` | `#4A3C28` |
| `textMuted` | `#7A6A52` |
| `border` | `#E2D8C8` |
| `borderHard` | `#1C1408` |
| `borderMid` | `#B89870` |
| `mono font` | IBM Plex Mono |
| `display font` | Cormorant Garamond |

**TodayScreen treatment:** `isWarmTheme = true`, `isBannerTheme = true`. Hero temperature displays in `scarlet` (amber-gold, `#C88040`) — a dominant gold glow against the tobacco-black header.

**Mood:** Loewe × The Row at dusk. The richest, most luxurious palette in the system.

---

### Electric

Nightclub editorial. Electric keeps the hot-pink/Syne attitude, but the reading plane is now deep electric navy rather than full-screen bright cobalt. Bright cobalt survives as edges, dividers, and energy; small text sits on dark surfaces where it can pass contrast.

| Token | Value |
|---|---|
| `bg` | `#050B46` deep electric navy — primary reading surface |
| `bgDark` | `#02031F` near-black indigo — header and hero panels |
| `bgSurface` | `#060D5A` raised navy section surface |
| `bgCard` | `#07106B` cobalt-tinted card surface |
| `bgCardAlt` | `#060D5A` |
| `textPrimary` | `#FFFFFF` |
| `textSecondary` | `#EEF2FF` crisp periwinkle-white |
| `textMuted` | `#BFCBFF` readable small-label colour |
| `border` | `#2636A8` cobalt divider on navy |
| `borderHard` | `#FFFFFF` |
| `borderMid` | `#7185FF` |
| `scarlet` | `#FF1060` TREVO hot-pink/magenta — the accent |
| `scarletFg` | `#FF9FC8` readable pink for text/icons on navy surfaces |
| `scarletDim` | `#360019` dark tint for on-navy overlays |
| `widgetBg` | `#030629` near-black widget surface |
| `display font` | Syne (`Syne_800ExtraBold` for display + displayBold, `Syne_600SemiBold` for displayLight, `Syne_700Bold` for serif) |
| `mono font` | IBM Plex Mono |
| `isDark` | `true` |

**Display typography:** Electric uses the heaviest Syne weight (`_800ExtraBold`) for headlines — maximum visual impact, the opposite of Cormorant's elegance. "displayLight" is still `Syne_600SemiBold`, maintaining visual weight even at reduced roles. IBM Plex Mono (not Space Mono) handles data labels for technical precision.

**How Electric differs from Morning Paper's Syne use:** Both use Syne for display. Morning Paper: `Syne_700Bold` display (editorial warmth). Electric: `Syne_800ExtraBold` display (maximum-weight, graphic impact). Morning Paper mono: Space Mono. Electric mono: IBM Plex Mono. Visually and typographically distinct.

**TodayScreen treatment:** `isWarmTheme = false`, `isBannerTheme = true`. Hero temperature displays in `scarlet` (hot-pink `#FF1060`) against the near-black indigo header. Widget labels use Electric's semantic text tokens instead of low-opacity white, so 9–10px mono labels remain legible.

**Scarlet discipline:** Electric uses the accent freely (Classic-style), not the one-per-screen restriction. Hot pink on cobalt blue is graphic, not decorative.

**Contrast contract:** `textMuted` on `bg`, `bgSurface`, `bgCard`, and `widgetBg` must stay above WCAG AA for normal text. Current ratios are 11.55:1, 10.88:1, 10.19:1, and 12.43:1 respectively.

**Mood:** TREVO after midnight. High energy, graphic, fashion-forward, but readable. The oracle as nightclub flyer printed on black stock.

---

### Weather Glance

Animated sky-forward forecast widgets. Each condition (sunny, rain, storm, snow, fog, night) renders a distinct animated scene using custom particle systems and gradient skies.

| Token | Value |
|---|---|
| `bg` | `#EAF4FF` pale sky blue |
| `bgDark` | `#08111F` deep night |
| `bgSurface` | `#D7E9F8` light sky panel |
| `bgCard` | `#FFFFFF` |
| `scarlet` | `#FFD166` amber-gold |
| `scarletFg` | `#F6A728` deep amber |
| `scarletDim` | `#2D3E53` dark sky tint |
| `textPrimary` | `#111827` |
| `textSecondary` | `#2D4F73` navy |
| `textMuted` | `#5F7287` |
| `border` | `#B7D2E6` |
| `display font` | Syne (syneFonts) |
| `mono font` | Space Mono |

**Metrics:** `borderWidth: 0`, `radius: 8` (via `weatherGlanceTokens.radius`).
**Flags:** `isWarmTheme: false`, `isBannerTheme: false`, `solidCardBackgrounds: false`.

**Extended tokens:** `weatherGlanceTokens` exports sky-specific palette and geometry constants — `skyBlue`, `skyDeep`, `sun`, `coral`, `rain`, `snow`, `storm`, `cloud`, `glass`, `glassStrong`, `glassBorder`, and `radius: 8`. Use these in weather widget components only; do not bleed them into structural UI.

**Animation system:** `WeatherGlanceCard.tsx` renders condition-specific scenes using Animated API. Each `WeatherGlanceKind` (`sunny`, `partly-cloudy`, `cloudy`, `rain`, `heavy-rain`, `storm`, `snow`, `fog`, `wind`, `night`) maps to a distinct palette and particle set. The ten-drop rain array and snow-flake positions are hardcoded constants, not random — guaranteed smooth performance.

**Mood:** A weather dashboard that feels like looking out the window, not reading a data table. Sky comes first; information comes second.

---

### Weather Editorial

Editorial sky — the Weather Glance aesthetic translated into a more typographic, editorial register. Cormorant Garamond replaces Syne; glass/phone treatment over a muted off-white ground.

| Token | Value |
|---|---|
| `bg` | `#F6F7F6` near-white |
| `bgDark` | `#182436` deep navy |
| `bgSurface` | `#EEF2F4` |
| `bgCard` | `#FFFFFF` |
| `scarlet` | `#FFD166` amber-gold |
| `scarletFg` | `#B8871F` dark amber (foreground use) |
| `scarletDim` | `#FFF3CB` pale amber tint |
| `textPrimary` | `#111827` |
| `textSecondary` | `#35465C` |
| `textMuted` | `#6A7481` |
| `display font` | Cormorant Garamond (classicFonts) |
| `mono font` | IBM Plex Mono |

**Metrics:** `borderWidth: 0`, `radius: 8` (shared with Weather Glance).
**Flags:** `isWarmTheme: false`, `isBannerTheme: false`, `solidCardBackgrounds: false`.

**Mood:** Weather as a magazine spread — editorial type, sky palette, glass surface treatment.

---

### Y2K

Digital zine / fashion club. Lavender page background, deep purple hero panels, soft pink surfaces, cream cards. Hot pink is the singular accent. The font subtheme system (Decree vs. Club) makes this the only theme with two distinct typographic registers selectable at runtime.

| Token | Value |
|---|---|
| `bg` | `#D8C2F2` lavender page |
| `bgDark` | `#35106E` deep purple — hero panels, headers |
| `bgSurface` | `#F8BBD4` soft pink surface |
| `bgCard` | `#FFFBEF` cream card |
| `bgCardAlt` | `#FFFDF7` sticker white |
| `textPrimary` | `#24113F` ink |
| `textSecondary` | `#35106E` deep purple |
| `textMuted` | `#5F3D8C` muted purple |
| `border` | `#B088D4` subtle lavender |
| `borderHard` | `#35106E` deep purple — card outlines |
| `borderMid` | `#7B5CA8` mid-strength purple |
| `scarlet` | `#EC1E79` hot pink |
| `scarletFg` | `#EC1E79` |
| `scarletDim` | `#FDDDF0` blush tint |
| `display font` | Syne ExtraBold (Decree) or Baloo 2 ExtraBold (Club) |
| `mono font` | IBM Plex Mono |

**Metrics:** `borderWidth: 1.5`, `radius: 16`.
**Flags:** `isWarmTheme: false`, `isBannerTheme: true`, `solidCardBackgrounds: false`.

**Extended tokens (`y2kTokens`):** `lime: '#C7F238'`, `yellowHighlight: '#F6E85F'`, `hotPink: '#EC1E79'`, `deepPurple: '#35106E'`, `mutedPurple: '#5F3D8C'`, `ink: '#24113F'`, `cream: '#FFFBEF'`, `blush: '#FDDDF0'`, `tangerine: '#FF7C35'`, `lavenderBg: '#D8C2F2'`, `softPink: '#F8BBD4'`, `radius: 16`, `radiusSm: 10`, `shadowOffset: 4`, `borderWidth: 1.5`. Use `y2kTokens` in Y2K-specific components only.

**Card anatomy:** `Y2KCard` uses a double-border system: 1.5px `borderHard` outer, 4px cream gap, 1px `borderHard` inner + 4px offset shadow in `borderHard` colour. This matches the Y2K zine/sticker aesthetic.

**Component set (`src/components/y2k/`):**
- `Y2KCard` — double-border container with offset shadow
- `Y2KBadge` — pill badge: hotpink / lime / cream / purple variants
- `Y2KSticker` — Unicode decorative glyphs (♡ ✦ ★ ◆)
- `Y2KSignature` — oracle signature in script font (e.g. "xoxo, the oracle ♡")
- `Y2KDecreeCard` — verdict: file header → vibe headline (40px display) → scarlet rule → Cormorant italic pull quote → pip rating bar → signature
- `Y2KWeatherCard` — weather: file header → city + condition → 80px temp hero in deep purple panel → mono meta line
- `Y2KOutfitCard` — outfit item: piece number, category badge, shop link, heart save
- `Y2KAvoidSection` — "ORACLE VETOES" avoid list on blush background

**Oracle routing:** `OracleScreen` is a thin router — `isY2KTheme(themeName)` → `<Y2KOracleScreen />`, otherwise `<EditorialOracleScreen />`.

**Copy register:** Lowercase throughout — "outfit oracle", "the oracle.", `verdict.vibe.toLowerCase()`. Playful prompts: "where are we judging?", "CONSULT THE ORACLE ♡", "checking humidity, morality…"

**Mood:** @ziobratclub — deep purple panels, lime accents, hot pink, cream sections. Digital fashion club that takes its archive seriously. The oracle as a Y2K fashion zine from an alternate timeline where the internet was always this stylish.

---

### Neo-Brutal Light

Pastel purple background, pure white widgets and cards, solid black borders everywhere, lime green as the fill accent (never as text). Outfit cards use solid bright colours (white, pink/red, yellow, lime) instead of the standard accent palette. Montserrat Black for all display. Offset shadow: 6px solid black.

| Token | Value |
|---|---|
| `bg` | `#DCD3FF` pastel purple |
| `bgDark` | `#000000` pure black |
| `bgSurface` | `#FFFFFF` |
| `bgCard` | `#FFFFFF` |
| `textPrimary` | `#000000` |
| `textSecondary` | `#000000` |
| `textMuted` | `#000000` |
| `border` | `#000000` solid black |
| `borderHard` | `#000000` |
| `scarlet` | `#D4FA7B` lime — fill/background only |
| `scarletFg` | `#000000` black — contrast-safe on lavender/white |
| `scarletDim` | `#F1FDCE` pale lime |
| `scarletText` | `#000000` black text on lime fills |
| `display font` | Montserrat Black |
| `mono font` | IBM Plex Mono |

**Outfit card accent overrides:** `mint: '#FFFFFF'` (white), `lavender: '#FF4B62'` (pink-red), `coral: '#FAEE7B'` (yellow), `lemon: '#FFFFFF'` (white), `iris: '#D4FA7B'` (lime). All text on these backgrounds: black.

**Metrics:** `borderWidth: 4`, `shadowOffset: 6`, `shadowOpacity: 1`, `shadowColor: '#000000'`, `cardGap: 32`.
**Flags:** `isWarmTheme: false`, `isBannerTheme: true`, `solidCardBackgrounds: true`.

**`solidCardBackgrounds` flag:** When true, outfit cards use the theme's overridden `mint`/`lavender`/`coral`/`lemon`/`iris` values as full card backgrounds (not dim tints). Components must respect this flag — do not use `accentDim` for card backgrounds in `solidCardBackgrounds` themes.

**Lime accent rule:** `scarlet` (`#D4FA7B`) is a fill colour only. Never use it as a hairline border or text colour — it fails contrast on white. Use `scarletFg` (`#000000`) for any foreground lines, icons, or text.

**Mood:** 90s zine meets brutalist web — bold, graphic, unapologetically loud. The oracle as a hand-stamped flyer.

---

### Neo-Brutal Dark

Same structural grammar as Neo-Brutal Light — thick borders, offset shadow, solid card backgrounds, Montserrat Black — shifted to a dark register with white borders and lime green accent.

| Token | Value |
|---|---|
| `bg` | `#111111` deep grey |
| `bgDark` | `#000000` pure black |
| `bgSurface` | `#222222` |
| `bgCard` | `#222222` |
| `textPrimary` | `#FFFFFF` |
| `textSecondary` | `#FFFFFF` |
| `textMuted` | `#CCCCCC` |
| `border` | `#FFFFFF` solid white |
| `borderHard` | `#FFFFFF` |
| `scarlet` | `#C9F7A1` lime green |
| `scarletFg` | `#C9F7A1` |
| `scarletDim` | `#3A5025` dark lime tint |
| `scarletText` | `#000000` black text on lime fills |
| `display font` | Montserrat Black |
| `mono font` | IBM Plex Mono |

**Outfit card accent overrides:** `mint: '#222222'` (dark), `lavender: '#FF4B62'` (pink-red), `coral: '#FAEE7B'` (yellow), `lemon: '#222222'` (dark), `iris: '#D4FA7B'` (lime).

**Metrics:** `borderWidth: 4`, `shadowOffset: 6`, `shadowOpacity: 1`, `shadowColor: '#FFFFFF'`, `cardGap: 32`.
**Flags:** `isWarmTheme: false`, `isBannerTheme: true`, `solidCardBackgrounds: true`.

**Mood:** The same brutalist grammar, at night.

---

### Mondrian

de Stijl editorial. White ground with cadmium yellow as the primary surface, cobalt blue and Mondrian red as outfit accent cards. Thick 4px black grid dividers everywhere. No shadow, no radius, no cardGap — pure grid structure. Montserrat Black for condensed poster weight.

| Token | Value |
|---|---|
| `bg` | `#FFFFFF` white |
| `bgDark` | `#000000` black |
| `bgSurface` | `#F5BE0B` cadmium yellow |
| `bgCard` | `#FFFFFF` |
| `bgCardAlt` | `#F5BE0B` yellow card alt |
| `textPrimary` | `#000000` |
| `textSecondary` | `#000000` |
| `textMuted` | `#4A4A4A` |
| `border` | `#000000` thick black grid lines |
| `borderHard` | `#000000` |
| `scarlet` | `#D40000` Mondrian red |
| `scarletFg` | `#D40000` |
| `scarletDim` | `#FFDDDD` |
| `scarletText` | `#FFFFFF` |
| `display font` | Montserrat Black |
| `mono font` | IBM Plex Mono |

**Outfit card accent overrides:** `mint: '#003FA5'` (cobalt blue, white text), `lavender: '#D40000'` (Mondrian red, white text), `coral: '#F5BE0B'` (cadmium yellow, black text), `lemon: '#FFFFFF'` (white panel, black text), `iris: '#000000'` (black panel, white text).

**Extended tokens (`mondrianTokens`):** `red: '#D40000'`, `blue: '#003FA5'`, `yellow: '#F5BE0B'`, `black: '#000000'`, `white: '#FFFFFF'`, `gridLine: 4`. Use in Mondrian-specific components only.

**Metrics:** `borderWidth: 4`, `shadowOffset: 0`, `shadowOpacity: 0`, `shadowColor: 'transparent'`, `cardGap: 0`.
**Flags:** `isWarmTheme: false`, `isBannerTheme: true`, `solidCardBackgrounds: true`.

**`cardGap: 0`:** Mondrian cards butt up against each other to form continuous grid panels. This is intentional — the negative space is the grid line (`borderWidth: 4`), not padding.

**Mondrian screens:** The Mondrian family uses dedicated full-screen renderers in `src/screens/mondrian/` — `MondrianOracleScreen`, `MondrianSettingsScreen`, `MondrianTodayScreen`, `MondrianYouScreen`. These replace the standard screens entirely for the Mondrian family, the same way `Y2KOracleScreen` handles Y2K.

**Mood:** Piet Mondrian's grid as a fashion editorial. The oracle as an art object. Maximum graphic precision; zero ornamentation.

---

## Typography

### Cormorant Garamond (Classic, Editorial Light/Dark, Terra Firma, Golden Hour)

The primary editorial voice. Weight contrast between 300 Light and 700 Bold Italic is intentional and distinctive.

| Role | Token | Weight + Style | Size | Usage |
|---|---|---|---|---|
| Hero numeral | `display` | 700 Bold Italic | 160–180px | Temperature, streak count, rating — data as decoration |
| Verdict headline | `displayBold` | 600 SemiBold | 42–56px | Vibe name, screen titles |
| Section subhead | `displayLight` | 300 Light | 24–32px | Oracle rank, passport title |
| Editorial body | `serif` | 400 Regular Italic | 16–18px | Verdict prose, challenge text, descriptions |

### Syne (Morning Paper display, Electric display)

Contemporary geometric sans. Used for all display roles in Morning Paper and Electric instead of Cormorant.

| Role | Morning Paper | Electric |
|---|---|---|
| `display` | `Syne_700Bold` | `Syne_800ExtraBold` |
| `displayBold` | `Syne_800ExtraBold` | `Syne_800ExtraBold` |
| `displayLight` | `Syne_400Regular` | `Syne_600SemiBold` |
| `serif` | `Syne_600SemiBold` | `Syne_700Bold` |

Syne is used exclusively for display-tier text — not for mono/data/label roles.

### Mono — IBM Plex Mono vs Space Mono

All data labels, UI text, eyebrows, button copy, metadata, captions.

| Theme | `mono` | `monoMedium` |
|---|---|---|
| Classic | `IBMPlexMono_400Regular` | `IBMPlexMono_500Medium` |
| Editorial Light | `SpaceMono_400Regular` | `SpaceMono_700Bold` |
| Editorial Dark | `SpaceMono_400Regular` | `SpaceMono_700Bold` |
| Terra Firma | `IBMPlexMono_400Regular` | `IBMPlexMono_500Medium` |
| Morning Paper | `SpaceMono_400Regular` | `SpaceMono_700Bold` |
| Golden Hour | `IBMPlexMono_400Regular` | `IBMPlexMono_500Medium` |
| Electric | `IBMPlexMono_400Regular` | `IBMPlexMono_500Medium` |

**Space Mono:** Print-label grit. Used in Editorial and Morning Paper themes. Reads like a sample-sale tag — typographically opinionated and not corporate-neutral.

**IBM Plex Mono:** Technical precision. Used in Classic, Terra Firma, Golden Hour, Electric. Legible, slightly corporate, pairs well with Cormorant and Syne_ExtraBold.

### Mono type scale

| Role | Size | Tracking | Case |
|---|---|---|---|
| Eyebrow / label | 8–10px | 0.25–0.35em | ALL CAPS |
| UI button | 10–11px | 0.25em | ALL CAPS |
| Data value | 12–14px | 0.1em | As written |
| Chip text | 8–9px | 0.2em | ALL CAPS |
| Verdict detail | 9–10px | 0.05–0.1em | As written |

**Do not use mono fonts with emoji or `MaterialCommunityIcons` inline.** Neither IBM Plex Mono nor Space Mono contains icon glyphs. Use `<MaterialCommunityIcons>` from `@expo/vector-icons` for all iconography.

---

## Color

### Accent / `scarlet` token per theme

The `scarlet` token in `AppColors` is not always red. It is the theme's primary accent — whatever that accent is. The `scarletDim` token is the same accent at low opacity or with a matching light tint.

| Theme | `scarlet` | `scarletDim` | Notes |
|---|---|---|---|
| Classic | `#C41230` red | `#FCEDEF` | Broad use |
| Editorial Light | `#C41230` red | `#FCEDEF` | One per screen |
| Editorial Dark | `#C41230` red | `#FCEDEF` | One per screen |
| Terra Firma | `#B5491A` terracotta | `#F5E8E0` | Broad use |
| Morning Paper | `#6B7F5E` sage | `#EAF0E5` | Broad use |
| Golden Hour | `#C88040` amber-gold | `#F5E8D0` | Broad use |
| Electric | `#FF1060` hot-pink | `#33001A` | Broad use |
| Weather Glance | `#FFD166` amber | `#2D3E53` | Broad use |
| Weather Editorial | `#FFD166` amber | `#FFF3CB` | Broad use |
| Y2K | `#EC1E79` hot-pink | `#FDDDF0` | Broad use |
| Neo-Brutal Light | `#D4FA7B` lime (fill only) | `#F1FDCE` | Broad use |
| Neo-Brutal Dark | `#C9F7A1` lime | `#3A5025` | Broad use |
| Mondrian | `#D40000` Mondrian red | `#FFDDDD` | Broad use |

### Outfit accent palette (semantic — all themes)

Semantically tied to outfit categories via `accentMap` in `OutfitCard`. Do not repurpose these for structural UI.

| Name | Hex | Category |
|---|---|---|
| `mint` | `#4A7A58` | Top |
| `lavender` | `#6B3F78` | Bottom |
| `coral` | `#B84B2E` | Outer Layer |
| `lemon` | `#8B6838` | Footwear |
| `iris` | `#2E5470` | Accessories |

Dim variants (`mintDim`, `lavenderDim`, etc.) are in the shared `sharedColors` object and available in every theme.

### Semantic colors (all themes)

| State | Token | Notes |
|---|---|---|
| Error / limit | `scarlet` | Counts as the one scarlet use in Editorial themes |
| Success | `mint` | Re-uses the mint accent consistently |
| Warning | `lemon` | Re-uses lemon accent |
| Info | `iris` | Re-uses iris accent |

---

## Scarlet Discipline (Editorial Themes Only)

**Only Editorial Light and Editorial Dark** enforce the one-scarlet-per-screen rule. All other themes use `scarlet` freely.

**Per-screen priority order:**
1. A single thin horizontal rule above the verdict headline
2. The Founding Member badge chip text only
3. A single category marker
4. Error state (rate limit, API failure)

If more than one element competes, the lower-priority ones become `#1A1714` (near-black) with surface-colored type. This is a design discipline, not a runtime enforcement. Count scarlet elements when building or reviewing screens in these themes.

---

## Y2K Font Subtheme System

The Y2K theme is the only theme with a runtime font switcher. Two distinct typographic registers are selectable in Settings while staying within the Y2K colour palette and component set.

### The two subthemes

| Subtheme | Display font | Script font | Registered as | Default |
|---|---|---|---|---|
| **Decree** | `Syne_800ExtraBold` | `CormorantGaramond_700Bold_Italic` | `'decree'` | No |
| **Club ♡** | `Baloo2_800ExtraBold` | `Knewave_400Regular` | `'club'` | **Yes** |

Both share:
- `IBMPlexMono_400Regular` / `IBMPlexMono_500Medium` for mono labels
- `CormorantGaramond_600SemiBold` / `CormorantGaramond_700Bold_Italic` for editorial titles

**Decree** reads as fashion-editorial impact — the oracle as a printed decree. **Club ♡** reads as bubbly Y2K digital energy — the oracle as a club flyer from 2001.

**Default is Club**, not Decree. Club is the intended out-of-box Y2K experience. Decree is the more restrained "editorial mode."

### Typography scale

Defined in `src/theme/y2kTypography.ts` via `getY2KTypography(subtheme)`. Returns semantic style objects — components use `typo.displayHero`, `typo.scriptMedium`, etc. Never hardcode font family strings directly in Y2K components.

| Token | Size | Role |
|---|---|---|
| `displayHero` | 54px | Large headline |
| `displayLarge` | 40px | Vibe headline (DecreeCard) |
| `displayMedium` | 30px | Section headers |
| `displaySmall` | 20px | Item names, card titles |
| `displayMicro` | 13px | Uppercase eyebrow labels |
| `scriptLarge` | 32px | Oracle signature large |
| `scriptMedium` | 24px | Oracle signature |
| `scriptSmall` | 20px | Script accents |
| `monoLabel` | 10px | Archive labels (tracked 2em) |
| `monoData` | 12px | Data values (tracked 1em) |

**Tracking:** Decree display tokens use negative letter-spacing (−1.5px at hero size) for typographic tightness. Club display uses 0 (Baloo 2 is optically tighter). Same `dispLS()` utility handles this per-subtheme — don't try to replicate it.

### Persistence

`ThemeContext` carries `y2kFontSubtheme: Y2KFontSubtheme` and `setY2KFontSubtheme`. Persisted to `@outfit_oracle_y2k_font_subtheme` in AsyncStorage. Settings shows "Y2K FONT STYLE" chip selector only when the Y2K theme is active.

### Font loading

`Baloo2_800ExtraBold`, `Baloo2_700Bold` and `Knewave_400Regular` are loaded via `useFonts` in `App.tsx` from `@expo-google-fonts/baloo-2` and `@expo-google-fonts/knewave`. Both packages are in `package.json`.

---

## Spacing

Base unit: 8px.

| Token | Value | Usage |
|---|---|---|
| `xs` | 4px | Micro gaps, icon margins |
| `sm` | 8px | Inner padding, tight gaps |
| `md` | 16px | Standard padding |
| `lg` | 24px | Section padding |
| `xl` | 40px | Large gaps |
| `xxl` | 64px | Section breaks |

**Density:** Comfortable. White/cream space is editorial breathing room, not wasted space.

---

## Layout

- **Grid:** Single-column iOS layout. Content width: screen width minus 40px horizontal padding (20px each side).
- **Border radius:** `sm: 0`, `md: 0`, `lg: 2px`, `pill: 999px`. Sharp corners everywhere except pill chips. The most differentiating choice in the category — every style app rounds everything.
- **Headlines:** Flush left in Editorial themes. Never centered except for single-word vibe names.
- **Macro type placement:** Hero numerals (160–180px) positioned to bleed slightly past the right edge — asymmetric, not centered.
- **Negative space:** Intentional, not accidental. Empty space between sections is a design decision.

---

## Motion

**Principle:** Slow. Everything resolves slower than the user expects. No spring physics. No bounce. Stillness is the punctuation.

| Interaction | Animation | Duration | Easing |
|---|---|---|---|
| Oracle verdict arrival | Horizontal wipe (page-turn) | 600ms | ease-in-out |
| Outfit card entrance | Slide-up 20px + fade, 80ms stagger per card | 300ms per card | ease-out |
| Navigation tab switch | Cross-dissolve | 400ms | ease-in-out |
| Modal/sheet entrance | Slide-up from bottom | 500ms | ease-out |
| Micro-interactions (tap states, toggles) | Opacity/scale | 150ms | ease-out |
| Loading pulse (skeleton) | Opacity 0.3 → 0.7 → 0.3, looping | 1800ms period | ease-in-out |
| Save/heart animation | Scale 1.0 → 1.15 → 1.0 | 300ms | ease-in-out |
| TodayScreen focus entrance | Fade + slide-up 12px | 500ms opacity / 450ms position | ease-out |

**Never:** Spring physics, bounce easing, elastic effects, confetti, scale-bounce on tap, animations under 100ms for primary interactions.

**useFocusEffect note:** Wrap the focus animation callback in `useCallback([heroOpacity, heroY])`. Without this, every parent state change re-creates the callback reference, React Navigation re-fires the effect, and the hero opacity resets to 0 mid-screen — a visible flicker.

---

## Theme Flags (`AppFlags`)

Flags are now part of each theme's entry in `THEMES` — not computed at runtime in components. Read them via `useTheme().flags`.

```typescript
interface AppFlags {
  isWarmTheme:          boolean;
  isBannerTheme:        boolean;
  solidCardBackgrounds: boolean;
}
```

| Flag | `false` | `true` |
|---|---|---|
| `isWarmTheme` | Classic/Editorial — cream bg, uses hardcoded light-surface values | Warm/vivid themes — uses theme token values for surface text and bg |
| `isBannerTheme` | No banner: hero shows city + temperature inline | Banner layout: time, city, and temperature in a structured dark-header unit |
| `solidCardBackgrounds` | Outfit cards use `accentDim` tint backgrounds (standard) | Outfit cards use full solid accent colour (Neo-Brutal, Mondrian) |

Per-theme flag assignments:

| Theme | `isWarmTheme` | `isBannerTheme` | `solidCardBackgrounds` |
|---|---|---|---|
| Classic | false | false | false |
| Editorial Light | false | false | false |
| Editorial Dark | false | false | false |
| Terra Firma | true | false | false |
| Morning Paper | false | true | false |
| Golden Hour | false | true | false |
| Electric | false | true | false |
| Weather Glance | false | false | false |
| Weather Editorial | false | false | false |
| Y2K | false | true | false |
| Neo-Brutal Light | false | true | true |
| Neo-Brutal Dark | false | true | true |
| Mondrian | false | true | true |

The S-object (surface token resolver) inside `makeStyles` uses `isWarmTheme` to decide whether surface text/bg values come from the theme tokens or from hardcoded cream/near-black values.

---

## Theme Extensibility

### What a theme controls

```typescript
{
  colors:  AppColors,    // all color tokens — bg, text, borders, accents, outfit palette
  fonts:   AppFonts,     // font family strings for display, displayBold, displayLight, serif, mono, monoMedium
  metrics: AppMetrics,   // borderWidth, radius, shadowOffset, shadowOpacity, shadowColor, cardGap, widgetLeftBorderWidth
  flags:   AppFlags,     // isWarmTheme, isBannerTheme, solidCardBackgrounds
  isDark:  boolean,      // true → StatusBar light-content, false → dark-content
  family:  ThemeFamily,  // lineage grouping for predicate helpers
}
```

Every theme must supply every field — no optional fields. A missing token is a TypeScript error, not a runtime surprise.

### `AppMetrics` — structural geometry

```typescript
interface AppMetrics {
  borderWidth:          number;  // card border thickness (1, 1.5, 4)
  radius:               number;  // card corner radius (0 = sharp, 8 = weather, 16 = Y2K)
  shadowOffset:         number;  // Neo-Brutal offset shadow depth (0 or 6)
  shadowOpacity:        number;  // 0 = no shadow, 1 = solid shadow
  shadowColor:          string;  // '#000000' (light), '#FFFFFF' (dark), or 'transparent'
  cardGap:              number;  // spacing between outfit cards (24 standard, 32 neo-brutal, 0 mondrian)
  widgetLeftBorderWidth:number;  // left-accent border for widgets (Terra Firma: 3)
}
```

Default (`baseMetrics`): `borderWidth: 1`, `radius: 0`, `shadowOffset: 0`, `shadowOpacity: 0`, `shadowColor: 'transparent'`, `cardGap: 24`, `widgetLeftBorderWidth: 0`.

### `ThemeFamily` — lineage groups

```typescript
type ThemeFamily =
  | 'classic'    // The baseline editorial theme
  | 'editorial'  // Scarlet-discipline variants (editorial-light, editorial-dark)
  | 'warm'       // Organic accent themes (terra-firma, morning-paper, golden-hour)
  | 'electric'   // TREVO-inspired dark vivid themes
  | 'weather'    // Animated forecast widgets (weather-glance, weather-editorial)
  | 'y2k'        // Digital zine / fashion club
  | 'neo-brutal' // Thick borders, offset shadows, solid card backgrounds
  | 'mondrian';  // de Stijl grid — primary colours, thick black dividers
```

Use `THEMES[name].family` in components that need family-level branching. Prefer family checks over per-name conditionals — a new theme in a family gets correct behaviour automatically.

### Extended token objects (family-specific, read-only)

These are exported from `src/theme/index.ts` as `as const` objects. Use them only within their family's components — do not use them in shared/structural UI.

| Export | Used by | Contents |
|---|---|---|
| `y2kTokens` | Y2K components | lime, yellowHighlight, hotPink, deepPurple, mutedPurple, ink, cream, blush, tangerine, lavenderBg, softPink, radius, radiusSm, shadowOffset, borderWidth |
| `mondrianTokens` | Mondrian components | red, blue, yellow, black, white, gridLine (4) |
| `weatherGlanceTokens` | Weather widget components | ink, cream, nightInk, skyBlue, skyDeep, sun, coral, rain, snow, storm, cloud, glass, glassStrong, glassBorder, radius (8) |

### Font roles

| Token | Role |
|---|---|
| `display` | Bold-weight headline (Cormorant 700 Bold Italic, Syne 800, Montserrat 900, Baloo 2 800) |
| `displayBold` | Semibold display |
| `displayLight` | Light/regular display |
| `serif` | Regular italic body |
| `mono` | All UI text, labels, data |
| `monoMedium` | Bold mono, buttons |

**A theme can replace Cormorant Garamond entirely** — the display tokens are just strings. Install the font, add it to `useFonts` in `App.tsx`, and map the strings. Morning Paper (Syne), Electric (Syne ExtraBold), Neo-Brutal (Montserrat Black), and Mondrian (Montserrat Black) all demonstrate this.

### Adding a new theme — checklist

1. Add the string literal to `ThemeName` in `src/theme/index.ts`
2. Create `const myThemeColors = { ...someBaseColors, /* overrides */ }` satisfying `AppColors`
3. Create `const myThemeFonts = { ... }` satisfying `AppFonts`. Load new font families in `App.tsx`
4. Add `const myMetrics` and `const myFlags` — start from `baseMetrics` and `baseFlags` and override
5. Choose the correct `ThemeFamily` value
6. Add to `THEMES` record: `'my-theme': { colors, fonts, metrics, flags, isDark, family }`
7. Add `{ id: 'my-theme', label: 'My Theme' }` to `THEME_OPTIONS` in `SettingsScreen.tsx`
8. Run `npx tsc --noEmit` and fix every error
9. If Editorial family: run scarlet audit — count one element per screen manually
10. If the theme needs dedicated screens (like Y2K or Mondrian), add screen router in the relevant tab screens

### Do not add theme-specific tokens to `AppColors`

Every token must exist in every theme, even if its value matches Classic. Components read only the `colors` object — they cannot check which theme is active. Theme-specific behaviour lives in `AppFlags` or `ThemeFamily`, not in the token set. If a theme needs extra colours (Y2K's lime, Mondrian's yellow surface), use the per-family extended token exports, not new `AppColors` fields.

---

## Future Theme Ideas

| Name | Concept | Font | Accent | Feel |
|---|---|---|---|---|
| **Brutalist** | Anti-fashion. Stark monochrome, typewriter aesthetic. | Courier Prime or iA Writer Duo (mono only, no display serif) | Pure black / pure white / one neon | Typewritten runway notes |
| **Parisian** | Soft luxury. French nonchalance. | Playfair Display + DM Mono | Dusty rose `#D4A5A5` | Chanel counter at 9am |
| **Tokyo** | Graphic novel meets editorial. | Noto Sans JP + monospace | Acid yellow `#E8F000` | Comme des Garçons lookbook |
| **Archive** | Sepia, aged paper, library card. | Libre Baskerville + Courier New | Muted red `#8B1A1A` | Vintage Vogue archive |
| **Gallery** | Museum-white. Maximum negative space. | Helvetica Neue / system mono | Cool gray `#999` | White cube gallery |

---

## Decisions Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-05-14 | Design system v2 — three-theme system | Oracle-as-magazine positioning identified as the key differentiator: every AI style app uses wardrobe-mirror UX; Outfit Oracle is authority speaking TO the user. |
| 2026-05-14 | Three named themes: Classic / Editorial Light / Editorial Dark | Keep current system as Classic; add two editorial variants. Gives users aesthetic control while preserving the shipped experience. |
| 2026-05-14 | Space Mono replaces IBM Plex in Editorial themes | IBM Plex reads corporate-neutral. Space Mono has print-label grit — reads like a sample-sale tag. Classic keeps IBM Plex. |
| 2026-05-14 | Scarlet: one use per screen in Editorial themes | Restricts scarlet from structural color to a single declaration per screen. One drop of blood on paper is dramatic; a bucket is just red paint. |
| 2026-05-14 | Section inversion as structural rhythm (Editorial) | Verdict on dark, outfit cards on cream. Publication grammar — editorial spreads — not dark mode. |
| 2026-05-14 | Macro type scale: data as decoration | Temperature, rating, streak count at 160–180px Cormorant Light. A massive italic numeral does more editorial work than any illustration. |
| 2026-05-14 | Full motion spec — no spring, no bounce | Was absent. Verdict: horizontal wipe, 600ms. Cards: 80ms stagger. Navigation: cross-dissolve, 400ms. Slowness is editorial authority. |
| 2026-05-14 | Sharp corners (radius: 0) | Single most differentiating choice in the category. Every AI style app rounds everything. Sharp is editorial, not approachable. |
| 2026-05-14 | Asymmetric grid (Editorial) | Headlines flush left. Single items bleed right margin. Negative space deliberate. |
| 2026-05-14 | Outfit accent palette retained (all themes) | Mint/lavender/coral/lemon/iris are semantically tied to outfit categories. They work. They don't compete. |
| 2026-05-14 | Terra Firma, Morning Paper, Golden Hour added | Three warm-organic themes. Terracotta, sage, amber-gold replace scarlet as the accent. Warm-theme flag pattern introduced in TodayScreen. |
| 2026-05-14 | Syne for Morning Paper display | Geometric sans replaces Cormorant in Morning Paper. Botanical-clean editorial voice; different font identity from Editorial themes without losing authority. |
| 2026-05-14 | Electric theme (TREVO-inspired) added | 7th theme. Vivid cobalt `#1E2DFF` throughout (both content surface and header), hot-pink `#FF1060` accent, `Syne_800ExtraBold` display — maximum-weight, graphic-design register. Selected over lighter electric-blue approach because the vivid full-screen blue is the TREVO identity. |
| 2026-05-14 | Electric readability revamp | Full-screen cobalt made small periwinkle labels hard to read. Electric moved to deep navy `#050B46` / near-black widget surfaces with readable periwinkle tokens while retaining hot pink and cobalt as accent energy. |
| 2026-05-14 | Electric uses `Syne_800ExtraBold` not `Syne_700Bold` | Morning Paper already uses `Syne_700Bold`. Distinct weight ensures the two Syne themes read differently — Electric is heavier, more graphic; Morning Paper is editorial. Both use IBM Plex for mono (not Space Mono) to pair precision data labels with vivid blue. |
| 2026-05-14 | Electric classified as `isWarmTheme = false`, `isBannerTheme = true` | Electric is structurally a dark theme with full-width banner rhythm. Surface readability comes from `widgetBg` + semantic text tokens, not from the warm-theme light-surface resolver. |
| 2026-05-14 | useFocusEffect wrapped in useCallback | Without it, the focus animation re-fires on every parent re-render (e.g., achievement badge toast), resetting hero opacity to 0 — a visible flicker under the achievements section. `heroOpacity` and `heroY` are stable `useRef` values; the deps array is effectively stable. |
| 2026-05-14 | Y2K theme added — digital zine / fashion club | 8th theme. @ziobratclub-inspired: lavender bg, deep purple hero panels, hot-pink accent, cream cards. Design-award showcase aesthetic — the oracle as a Y2K fashion zine. |
| 2026-05-14 | Y2K font subtheme system (Decree vs Club) | Two typographic registers for Y2K without separate theme entries. Decree = Syne ExtraBold (editorial impact). Club = Baloo 2 ExtraBold + Knewave (bubbly digital club). Default is Club. Persisted separately from theme selection. |
| 2026-05-14 | Y2K card double-border anatomy | 1.5px outer border → 4px cream gap → 1px inner border + offset shadow. Matches Y2K zine/sticker aesthetic. Implemented via `Y2KCard` component. |
| 2026-05-14 | OracleScreen thin-router pattern | OracleScreen became a thin router: `isY2KTheme()` → `Y2KOracleScreen`; otherwise `EditorialOracleScreen`. Pattern lets families own their full screen experience without burdening the shared oracle flow. Extended to Mondrian. |
| 2026-05-14 | Weather Glance and Weather Editorial themes added | Sky-forward animated forecast themes. Weather Glance: Syne + sky-blue palette + particle animations per condition. Weather Editorial: Cormorant + glass treatment over muted off-white. Both share amber `#FFD166` as accent and radius: 8. |
| 2026-05-14 | WeatherGlanceCard animated scene system | Condition-specific animated scenes (10 kinds: sunny → night). Particle arrays (rain drops, snowflakes) are hardcoded constants, not random — predictable performance. Condition-to-palette mapping via `GlancePalette` object. |
| 2026-05-14 | Neo-Brutal Light and Dark themes added | Thick 4px borders, 6px offset shadow, Montserrat Black display. Lime green as fill accent (not text). Outfit cards use solid bright colours via `solidCardBackgrounds: true`. The oracle as a hand-stamped zine flyer. |
| 2026-05-14 | `solidCardBackgrounds` flag added to AppFlags | Standard themes use `accentDim` tint backgrounds on outfit cards. Neo-Brutal and Mondrian need full solid accent colours. Flag lets components branch without family checks. |
| 2026-05-14 | Mondrian theme added | de Stijl editorial. White ground, cadmium yellow surface, cobalt/red/yellow outfit card accents. 4px black grid lines, zero radius, zero cardGap — cards butt together as continuous grid. Montserrat Black for condensed poster weight. `mondrianTokens` for component-specific extended palette. |
| 2026-05-14 | Mondrian dedicated screens (`src/screens/mondrian/`) | MondrianOracleScreen, MondrianSettingsScreen, MondrianTodayScreen, MondrianYouScreen — full-screen replacements that own the de Stijl grid grammar completely, rather than adapting the standard screen layout. |
| 2026-05-14 | `ThemeFamily` + `AppMetrics` + `AppFlags` moved into `THEMES` record | Flags were previously component-level computed booleans (`isWarmTheme`, `isBannerTheme` derived from `includes()`). Moving them into the `THEMES` record makes theme entry the single source of truth and removes the need to update multiple files when adding a theme. |
| 2026-05-14 | Temperature unit toggle (C/F) | `TemperatureContext` with `formatTemp(celsius)` and `unitLabel`. All Open-Meteo temperatures arrive in Celsius; conversion at display time. All temperature-displaying components use `const { formatTemp } = useTempUnit()` — no raw degree values in UI. |
