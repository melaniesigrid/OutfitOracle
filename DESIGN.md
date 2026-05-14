# Design System — Outfit Oracle

## Product Context

- **What this is:** A weather-powered AI fashion advisor that delivers editorial outfit verdicts — not a wardrobe organizer, not a catalog app. An authority speaking TO the user.
- **Who it's for:** Aesthetically aspirational people 25–40 who follow fashion but want practical, opinionated help getting dressed. Creator referral traffic from influencer posts; style-literate but time-poor.
- **Space/industry:** AI consumer apps × fashion editorial. Peers: nothing in category — every wardrobe/style app (Whering, Cladwell, Stylebook) uses "your clothes, your space" UX. Outfit Oracle is oracle-as-magazine, not app-as-wardrobe.
- **Project type:** iOS-first mobile app (Expo bare workflow, React Native)
- **Positioning:** The version of Vogue that knows your weather.

---

## Aesthetic Direction

- **Direction:** Oracle-as-Magazine — editorial authority, not wardrobe utility
- **Decoration level:** Minimal-intentional. Typography IS the decoration. A single oversized Cormorant numeral (temperature, rating, streak count) creates more editorial presence than any illustration. No decorative blobs, no icon grids, no rounded cards.
- **Mood:** Cold information rendered with the heat of obsession. The app should feel like it cost something to make. Not delight — recognition. Like opening a magazine you didn't know you'd been waiting for.
- **Key insight (EUREKA):** Every AI style app assumes users want to see their clothes reflected back. Outfit Oracle doesn't work that way. It's a publication, not a mirror. This drives every design decision.

---

## Multi-Theme System

The app ships three named themes. Users select via **Settings → Oracle Theme**. The preference persists to AsyncStorage key `@outfit_oracle_theme`. Default: Classic.

### Theme 1 — Classic

The existing system. Warm, editorial, broad use of scarlet as UI structure.

| Token | Value |
|---|---|
| `bg` | `#FAF9F6` (warm cream) |
| `bgDark` | `#0D0B08` (near-black) |
| `bgSurface` | `#F3EEE5` |
| `mono font` | IBM Plex Mono |
| `scarlet usage` | Broad — chips, badges, headers, category markers, borders |
| `section grammar` | Dark sections are special; cream is default |

**Mood:** The current app as shipped. Clean, warm, editorial. IBM Plex Mono reads slightly corporate but legible at all sizes. Scarlet as structural color is familiar and consistent.

---

### Theme 2 — Editorial Light

Oracle-as-Magazine on cream. The print publication metaphor rendered on light surfaces.

| Token | Value |
|---|---|
| `bg` | `#FAF9F6` (warm cream) |
| `bgDark` | `#0D0B08` (near-black) |
| `bgSurface` | `#F3EEE5` |
| `mono font` | Space Mono |
| `scarlet usage` | **One element per screen maximum.** One rule line, one verdict word, one category marker. Not UI chrome. Not badge fills. One drop of blood on paper. |
| `section grammar` | **Structural inversion as rhythm.** Oracle verdict arrives on dark (`#0D0B08`). Outfit cards alternate cream. Avoid section on dark. This is publication grammar — editorial spreads — not dark mode. |
| `macro type` | Temperature, rating, streak count rendered at 160–180px Cormorant Light. Data becomes decoration. |
| `layout` | Asymmetric editorial grid. Headlines flush left. Single items can bleed right margin. Negative space is a deliberate decision, not a gap. |

**Scarlet rule in detail:** One scarlet element per screen. Priority order: (1) a single thin horizontal rule above the verdict headline, (2) the Founding Member badge chip text only, (3) a single category marker. If more than one item competes, pick the highest priority and use near-black `#1A1714` + cream type for structural chips.

**Mood:** The oracle as fashion publication. Cold, authoritative, typographic. Space Mono reads like a print label from a sample-sale tag. Every competitor rounds their corners and uses friendly palettes. This goes the other way.

---

### Theme 3 — Editorial Dark

Oracle-as-Magazine on near-black. The publication at night.

| Token | Value |
|---|---|
| `bg` | `#0D0B08` (near-black) — primary surface |
| `bgDark` | `#FAF9F6` — used for accent/inverted sections |
| `bgSurface` | `#1A1714` |
| `bgCard` | `#1F1C18` |
| `text-primary` | `#F5F0E8` |
| `text-secondary` | `#B0A898` |
| `text-muted` | `#706A66` |
| `border` | `#2A2520` |
| `border-hard` | `#F5F0E8` |
| `mono font` | Space Mono |
| `scarlet usage` | One element per screen maximum (same rule as Editorial Light) |
| `section grammar` | Dark everywhere. Input state: cream cards emerge as islands on dark. Verdict: dark primary with cream type. Outfit cards: slightly lighter dark (`#1F1C18`). |
| `macro type` | 160–180px Cormorant Light, color: `rgba(245,240,232,0.15)` — watermark behind content |

**Mood:** The oracle speaks from darkness. Maximum authority. The scarlet single-use rule hits hardest here — one red element on near-black is a declaration, not decoration.

---

## Typography (shared across all themes)

### Display — Cormorant Garamond

The editorial voice of the app. Not yet overused. Weight contrast between 300 Light and 700 Bold Italic is intentional and distinctive. No substitute.

| Role | Weight + Style | Size | Usage |
|---|---|---|---|
| Hero numeral | 300 Light Italic | 160–180px | Temperature, streak count, rating — data as decoration |
| Verdict headline | 700 Bold Italic | 42–56px | Vibe name, screen titles |
| Section subhead | 300 Light | 24–32px | Oracle rank, passport title |
| Editorial body | 400 Regular Italic | 16–18px | Verdict prose, challenge text, descriptions |
| Item name | 700 Bold Italic | 14–17px | Outfit item names within cards |
| Display caption | 600 SemiBold | 13–15px | Category headers in YouScreen |

**Loading:** Google Fonts CDN. Loaded via `useFonts` in `HomeScreen.tsx`. App renders blank until fonts resolve — this is intentional and correct.

### Mono — IBM Plex Mono (Classic) / Space Mono (Editorial Light + Dark)

All data labels, UI text, eyebrows, button copy, metadata, captions.

| Role | Weight | Size | Tracking | Case |
|---|---|---|---|---|
| Eyebrow / label | 400 Regular | 8–10px | 0.25–0.35em | ALL CAPS |
| UI button | 700 Bold | 10–11px | 0.25em | ALL CAPS |
| Data value | 400 Regular | 12–14px | 0.1em | As written |
| Chip text | 400 Regular | 8–9px | 0.2em | ALL CAPS |
| Verdict detail | 400 Regular | 9–10px | 0.05–0.1em | As written |

**Do not use mono fonts with emoji or MaterialCommunityIcons inline** — both IBM Plex Mono and Space Mono lack many Unicode symbol glyphs. Use `<MaterialCommunityIcons>` from `@expo/vector-icons` for all icons.

### Modular Type Scale

Base: 16px. Scale ratio: 1.333 (Perfect Fourth).

| Step | px | rem | Usage |
|---|---|---|---|
| Hero | 160–180px | — | Macro numerals only |
| 6xl | 85px | 5.33 | — |
| 5xl | 64px | 4.0 | — |
| 4xl | 48px | 3.0 | Vibe name, rank |
| 3xl | 36px | 2.25 | Screen headlines |
| 2xl | 28px | 1.75 | Section subheads |
| xl | 21px | 1.333 | Card titles |
| lg | 18px | 1.125 | Body, verdict prose |
| base | 16px | 1.0 | Default body |
| sm | 13px | 0.813 | Captions, item detail |
| xs | 11px | 0.688 | Labels, data |
| 2xs | 9px | 0.563 | Eyebrows, chips |
| 3xs | 8px | 0.5 | Micro labels |

---

## Color (shared palette)

### Structural colors

| Name | Token | Hex | Usage |
|---|---|---|---|
| Cream | `bg` | `#FAF9F6` | Primary background (Classic + Editorial Light) |
| Surface | `bgSurface` | `#F3EEE5` | Cards, inset sections |
| Near-black | `bgDark` | `#0D0B08` | Dark sections, primary bg (Editorial Dark) |
| Jet | `textPrimary` | `#1A1714` | Primary text |
| Ash | `textSecondary` | `#5A5248` | Secondary text, descriptions |
| Stone | `textMuted` | `#706A66` | Muted text, labels |
| Border light | `border` | `#DDD7CE` | Subtle dividers |
| Border hard | `borderHard` | `#1A1714` | Active borders, inputs |
| Border mid | `borderMid` | `#B0A898` | Intermediate borders |
| Scarlet | `scarlet` | `#C41230` | **See scarlet usage rule per theme** |
| Scarlet dim | `scarletDim` | `#FCEDEF` | Scarlet backgrounds (error states, alerts) |

### Outfit accent palette (semantic, used by OutfitCard — all themes)

These are tied to outfit categories. They are semantic, not decorative. Do not repurpose.

| Name | Token | Hex | Category |
|---|---|---|---|
| Mint | `mint` | `#4A7A58` | Top |
| Lavender | `lavender` | `#6B3F78` | Bottom |
| Coral | `coral` | `#B84B2E` | Outer Layer |
| Lemon | `lemon` | `#8B6838` | Footwear |
| Iris | `iris` | `#2E5470` | Accessories |

Each accent has a dim variant (`mintDim`, `lavenderDim`, etc.) for background use. The dim variants use the same hex with high opacity on a white surface, not a separate color.

### Semantic colors (all themes)

| State | Hex | Notes |
|---|---|---|
| Error / limit | `#C41230` (scarlet) | Counts as the one scarlet use in Editorial themes |
| Success | `#4A7A58` (mint) | Re-use of mint accent — consistent and deliberate |
| Warning | `#8B6838` (lemon) | Re-use of lemon accent |
| Info | `#2E5470` (iris) | Re-use of iris accent |

---

## Spacing (shared)

Base unit: 8px.

| Token | Value | Usage |
|---|---|---|
| `xs` | 4px | Micro gaps, icon margins |
| `sm` | 8px | Inner padding, tight gaps |
| `md` | 16px | Standard padding |
| `lg` | 24px | Section padding |
| `xl` | 40px | Large gaps |
| `xxl` | 64px | Section breaks |
| `macro` | 80px | Magazine-style section breathing room (Editorial themes only) |

**Density:** Comfortable. Not compact, not spacious. White space (or cream space) is editorial breathing room, not wasted space.

---

## Layout (shared)

- **Approach:** Asymmetric editorial grid (Editorial Light/Dark) / symmetric clean grid (Classic)
- **Grid:** Single-column iOS layout. Content width: screen width minus 40px horizontal padding (20px each side).
- **Border radius:** `sm: 0`, `md: 0`, `lg: 2px`, `pill: 999px`. Sharp corners everywhere except pill chips. This is the most differentiating choice in the category — every style app rounds everything.
- **Headlines:** Flush left in Editorial themes. Never centered except for single-word/short vibe names.
- **Macro type placement:** Hero numerals (160–180px) positioned to bleed slightly past the right edge — asymmetric, not centered.
- **Negative space:** Intentional, not accidental. Empty space between sections is a design decision.

---

## Motion (shared across all themes)

**Principle:** Slow. Everything resolves slower than the user expects. No spring physics. No bounce. Stillness is the punctuation. The app should never feel busy.

| Interaction | Animation | Duration | Easing |
|---|---|---|---|
| Oracle verdict arrival | Horizontal wipe (page-turn) | 600ms | ease-in-out |
| Outfit card entrance | Slide-up 20px + fade, 80ms stagger per card | 300ms per card | ease-out |
| Navigation tab switch | Cross-dissolve | 400ms | ease-in-out |
| Modal/sheet entrance | Slide-up from bottom | 500ms | ease-out |
| Micro-interactions (tap states, toggles) | Opacity/scale | 150ms | ease-out |
| Loading pulse (skeleton) | Opacity 0.3 → 0.7 → 0.3, looping | 1800ms period | ease-in-out |
| Save/heart animation | Scale 1.0 → 1.15 → 1.0 | 300ms | ease-in-out |

**Never:** Spring physics, bounce easing, elastic effects, confetti, scale-bounce on tap, animations under 100ms for primary interactions.

---

## Implementation Notes — Theme Switching

### Required additions to `src/theme/index.ts`

The theme system needs to export named theme objects and a `getTheme(name)` function:

```typescript
export type ThemeName = 'classic' | 'editorial-light' | 'editorial-dark';

export const THEMES: Record<ThemeName, { colors: typeof colors; monoFont: string }> = {
  'classic': {
    colors: colors, // current export
    monoFont: 'IBMPlexMono_400Regular',
  },
  'editorial-light': {
    colors: {
      ...colors,
      // same palette, scarlet usage enforced via component discipline
    },
    monoFont: 'SpaceMono_400Regular', // requires font loading
  },
  'editorial-dark': {
    colors: {
      ...colors,
      bg:          '#0D0B08',
      bgDark:      '#FAF9F6',
      bgSurface:   '#1A1714',
      bgCard:      '#1F1C18',
      textPrimary: '#F5F0E8',
      textSecondary:'#B0A898',
      border:      '#2A2520',
      borderHard:  '#F5F0E8',
    },
    monoFont: 'SpaceMono_400Regular',
  },
};
```

### AsyncStorage key

```
@outfit_oracle_theme  →  'classic' | 'editorial-light' | 'editorial-dark'
```

Add to `ALL_KEYS` in the clear-data function so it resets on "Clear All Data."

### Settings screen

Add a theme picker to `SettingsScreen.tsx` — three options displayed as named chips: **Classic**, **Editorial Light**, **Editorial Dark**. Selecting one persists to AsyncStorage and triggers a full re-render via the theme context.

### Font loading

Space Mono requires adding `SpaceMono_400Regular` and `SpaceMono_700Bold` to the `useFonts` call in `HomeScreen.tsx`. These are available in `@expo-google-fonts/space-mono` (install separately).

### Scarlet discipline (Editorial themes)

There is no enforcement mechanism — this is a design discipline. When building new screens in Editorial Light or Dark:
1. Count your scarlet elements per screen.
2. If more than one, the lower-priority one becomes `#1A1714` (near-black) with cream/surface-colored type.
3. Priority: verdict rule > Founding Member badge > error state > category marker > everything else.

---

## Decisions Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-05-14 | Design system v2 — three-theme system | Fresh /design-consultation. Oracle-as-magazine positioning identified as the key differentiator: every AI style app uses wardrobe-mirror UX; Outfit Oracle is authority speaking TO the user. |
| 2026-05-14 | Three named themes: Classic / Editorial Light / Editorial Dark | User request: keep the current system as Classic, add the two preview variants as additional options. Gives users aesthetic control while preserving the shipped experience. |
| 2026-05-14 | Space Mono replaces IBM Plex Mono in Editorial themes | IBM Plex reads corporate-neutral (every B2B SaaS uses it). Space Mono has print-label grit — reads like a sample-sale tag. Claude subagent agrees independently. Classic theme keeps IBM Plex. |
| 2026-05-14 | Scarlet: one use per screen in Editorial themes | Current Classic system uses scarlet broadly. Editorial themes restrict it to one element per screen — a declaration, not decoration. One drop of blood on paper is dramatic; a bucket is just red paint. |
| 2026-05-14 | Section inversion as structural rhythm (Editorial themes) | Verdict arrives on dark, outfit cards on cream, avoid section on dark. Not a dark mode — publication grammar. Differentiates from every competitor who has cream everywhere or dark-mode-as-feature. |
| 2026-05-14 | Macro type scale: data as decoration | Temperature, rating, streak count at 160–180px Cormorant Light. A massive italic numeral does more editorial work than any illustration. |
| 2026-05-14 | Full motion spec added | Was completely absent. Verdict: horizontal wipe (page-turn metaphor), 600ms. Outfit cards: 80ms stagger. Navigation: cross-dissolve, 400ms. No spring, no bounce. Slowness is editorial authority. |
| 2026-05-14 | Cormorant Garamond retained across all themes | Right choice. Not yet overused. Weight contrast (300 Light vs. 700 Bold Italic) is intentional. Subagent independently confirms. |
| 2026-05-14 | Sharp corners (radius: 0) retained | Single most differentiating UI choice in the category. Every AI style app rounds everything. Sharp corners are editorial, not approachable. |
| 2026-05-14 | Asymmetric grid (Editorial themes) | Headlines flush left. Single items bleed right margin. Negative space is deliberate. Biggest layout departure from current centered system. |
| 2026-05-14 | Outfit accent palette retained (all themes) | Mint/lavender/coral/lemon/iris are semantically tied to outfit categories. They work. They don't compete with the primary palette. Keep. |
