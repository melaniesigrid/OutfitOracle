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
- **The seven themes** are moods of the same publication, not different apps. They share typography logic, layout grammar, and motion spec. What varies: palette, mono typeface, and—in Electric—the display typeface.

---

## Theme System

Users select themes in **Settings → Oracle Theme**. Preference persists to AsyncStorage key `@outfit_oracle_theme`. Default: Classic.

All themes ship in `src/theme/index.ts` as entries in the `THEMES` record. Every theme supplies the complete `AppColors` + `AppFonts` + `isDark` objects — no optional fields. TypeScript enforces completeness.

### Theme Classification

| Theme | `isDark` | Display font | Mono font | Accent | Structural tone |
|---|---|---|---|---|---|
| Classic | false | Cormorant Garamond | IBM Plex Mono | Scarlet `#C41230` — broad | Warm cream editorial |
| Editorial Light | false | Cormorant Garamond | Space Mono | Scarlet — one per screen | Cream, print-publication grammar |
| Editorial Dark | true | Cormorant Garamond | Space Mono | Scarlet — one per screen | Near-black, maximum authority |
| Terra Firma | false | Cormorant Garamond | IBM Plex Mono | Terracotta `#B5491A` | Desert-warm, Marrakech editorial |
| Morning Paper | false | Syne | Space Mono | Sage `#6B7F5E` | Botanical, Porter × Kinfolk |
| Golden Hour | false | Cormorant Garamond | IBM Plex Mono | Amber-gold `#C88040` | Luxury warmth, Loewe at dusk |
| Electric | true | Syne ExtraBold | IBM Plex Mono | Hot-pink `#FF1060` | TREVO-inspired, vivid cobalt |

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

**Mood:** Porter × Kinfolk. Botanical, clean, morning ritual.

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

TREVO-inspired. Vivid cobalt throughout, hot-pink accent, maximum-weight Syne display. The most distinct theme — violates every warm-editorial convention deliberately.

| Token | Value |
|---|---|
| `bg` | `#1E2DFF` vivid electric blue — scrollable content surface |
| `bgDark` | `#0A15CC` deeper blue — header and hero panels |
| `bgSurface` | `#2538FF` section surfaces |
| `bgCard` | `#3040FF` card surfaces |
| `bgCardAlt` | `#2538FF` |
| `textPrimary` | `#FFFFFF` |
| `textSecondary` | `#C8D0FF` light periwinkle |
| `textMuted` | `#8090CC` muted blue-white |
| `border` | `#3248FF` subtle same-palette divider |
| `borderHard` | `#FFFFFF` |
| `borderMid` | `#4858FF` |
| `scarlet` | `#FF1060` TREVO hot-pink/magenta — the accent |
| `scarletDim` | `#33001A` dark tint for on-blue overlays |
| `display font` | Syne (`Syne_800ExtraBold` for display + displayBold, `Syne_600SemiBold` for displayLight, `Syne_700Bold` for serif) |
| `mono font` | IBM Plex Mono |
| `isDark` | `true` |

**Display typography:** Electric uses the heaviest Syne weight (`_800ExtraBold`) for headlines — maximum visual impact, the opposite of Cormorant's elegance. "displayLight" is still `Syne_600SemiBold`, maintaining visual weight even at reduced roles. IBM Plex Mono (not Space Mono) handles data labels for technical precision.

**How Electric differs from Morning Paper's Syne use:** Both use Syne for display. Morning Paper: `Syne_700Bold` display (editorial warmth). Electric: `Syne_800ExtraBold` display (maximum-weight, graphic impact). Morning Paper mono: Space Mono. Electric mono: IBM Plex Mono. Visually and typographically distinct.

**TodayScreen treatment:** `isWarmTheme = true`, `isBannerTheme = true`. Hero temperature displays in `scarlet` (hot-pink `#FF1060`) against the deep cobalt header. The `isWarm = true` classification means the surface token S-object resolves text/bg using the theme's token values rather than hardcoded light-surface values.

**Scarlet discipline:** Electric uses the accent freely (Classic-style), not the one-per-screen restriction. Hot pink on cobalt blue is graphic, not decorative.

**Mood:** TREVO-inspired. High energy, graphic, fashion-forward. The oracle as nightclub flyer.

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

## TodayScreen Theme Flags

`TodayScreen.tsx` uses two boolean flags to select between widget structures. These are derived from `themeName` and are not part of the theme token set.

```typescript
const isWarmTheme   = ['terra-firma', 'morning-paper', 'golden-hour', 'electric'].includes(themeName);
const isBannerTheme = ['morning-paper', 'golden-hour', 'electric'].includes(themeName);
```

| Flag | Meaning |
|---|---|
| `isWarmTheme = false` | Classic/Editorial themes — cream bg, uses hardcoded light-surface values |
| `isWarmTheme = true` | Warm/Electric themes — uses theme token values for text and bg |
| `isBannerTheme = false` | No banner: TodayScreen hero shows city + temperature inline |
| `isBannerTheme = true` | Banner layout: time, city, and temperature in a structured dark-header unit |

The S-object (surface token resolver) inside `makeStyles` uses `isWarm` to decide whether text/bg values come from the theme tokens or from hardcoded cream/near-black values.

---

## Theme Extensibility

### What a theme controls

```typescript
{
  colors: AppColors,   // all color tokens — bg, text, borders, accents, outfit palette
  fonts:  AppFonts,    // font family strings for display, displayBold, displayLight, serif, mono, monoMedium
  isDark: boolean,     // true → StatusBar light-content, false → dark-content
}
```

Every theme must supply every token — no optional fields. A missing token is a TypeScript error, not a runtime surprise.

### Font roles

| Token | Role |
|---|---|
| `display` | Bold-weight headline (Cormorant 700 Bold Italic or Syne 800) |
| `displayBold` | Semibold display (Cormorant 600 SemiBold or Syne 800) |
| `displayLight` | Light/regular display (Cormorant 300 Light or Syne 400/600) |
| `serif` | Regular italic body (Cormorant 400 Italic or Syne 600/700) |
| `mono` | All UI text, labels, data | 
| `monoMedium` | Bold mono, buttons |

**A theme can replace Cormorant Garamond entirely** — the display tokens are just strings. Install the font, add it to `useFonts` in `App.tsx`, and map the strings. Morning Paper and Electric already demonstrate this with Syne.

### Adding a new theme — checklist

1. Add the string literal to `ThemeName` in `src/theme/index.ts`
2. Create `const myThemeColors = { ...someBaseColors, /* overrides */ }` satisfying `AppColors`
3. Create `const myThemeFonts = { ... }` satisfying `AppFonts`. Load new font families in `App.tsx`
4. Add to `THEMES` record: `'my-theme': { colors, fonts, isDark }`
5. Add `{ id: 'my-theme', label: 'My Theme' }` to `THEME_OPTIONS` in `SettingsScreen.tsx`
6. Update `isWarmTheme` / `isBannerTheme` inclusions in `TodayScreen.tsx` if the theme needs warm-surface or banner layout
7. Run `npx tsc --noEmit` and fix every error
8. If Editorial themes: run scarlet audit — count one element per screen manually

### Do not add theme-specific tokens

Every token must exist in every theme, even if its value matches Classic. Components read only the colors object — they cannot check which theme is active. Theme-specific behaviour lives in component flags (`isWarmTheme`, etc.), not in the token set.

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
| 2026-05-14 | Electric theme (TREVO-inspired) added | 7th theme. Vivid cobalt `#1E2DFF` throughout (both content surface and header), hot-pink `#FF1060` accent, `Syne_800ExtraBold` display — maximum-weight, graphic-design register. Chosen over lighter electric-blue approach because the vivid full-screen blue is the TREVO identity. |
| 2026-05-14 | Electric uses `Syne_800ExtraBold` not `Syne_700Bold` | Morning Paper already uses `Syne_700Bold`. Distinct weight ensures the two Syne themes read differently — Electric is heavier, more graphic; Morning Paper is editorial. Both use IBM Plex for mono (not Space Mono) to pair precision data labels with vivid blue. |
| 2026-05-14 | Electric classified as `isWarmTheme = true` | Even though Electric is dark/blue, the warm-theme flag means "use theme tokens for surface values" not "light cream surface." The S-object resolves correctly because `textPrimary = #FFFFFF` and the bg is the vivid blue. |
| 2026-05-14 | useFocusEffect wrapped in useCallback | Without it, the focus animation re-fires on every parent re-render (e.g., achievement badge toast), resetting hero opacity to 0 — a visible flicker under the achievements section. `heroOpacity` and `heroY` are stable `useRef` values; the deps array is effectively stable. |
