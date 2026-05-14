# Interface Design System — Outfit Oracle

## Product & Intent

**Who:** Aesthetically aspirational people 25–40, style-literate but time-poor. Opening the app between meetings, before a date, on the way out the door. They want an authority, not a mirror.

**What:** Get dressed. Fast. The app delivers one opinionated verdict per consult — weather-backed, personality-tuned, editorially voiced.

**How it should feel:** Oracle-as-Magazine. Cold information rendered with the heat of obsession. Not delight — recognition. Like opening a magazine you didn't know you'd been waiting for.

**Key constraint:** This is a publication speaking TO the user, not a wardrobe app reflecting their clothes back. Every layout decision follows from this.

---

## Direction

**Oracle-as-Magazine.** Editorial authority, not wardrobe utility. Typography IS the decoration — a 160px Cormorant italic numeral does more editorial work than any illustration. No decorative blobs, no icon grids, no rounded cards.

The seven themes are moods of the same publication, not different apps. They share layout grammar, motion spec, and information hierarchy. What varies: palette, mono typeface, and in Electric, the display typeface.

---

## Depth Strategy

**Borders-only + subtle surface elevation.**

- No box shadows (React Native `elevation` only used sparingly in Android)
- Separation via `border` token at 1px — borders should disappear when you're not looking, but be findable
- Surface elevation: `bg` → `bgSurface` → `bgCard` — each jump is a few percent lightness, felt not seen
- Inputs: `bgSurface` (darker than surrounding content) — inset feel, signals "type here"
- Cards on dark sections: `bgCard`/`bgCardAlt` as islands of lightness
- Sidebars/headers use `bgDark` — same hue family, hard contrast, not a different color world

**Hard borders for emphasis:** `borderHard` token (near-black or white depending on theme) — used for active states, vertical section rules, category markers. Not for general structure.

---

## Spacing

Base unit: **8px**

| Token | Value | Usage |
|---|---|---|
| `xs` | 4px | Icon margins, tight inline gaps |
| `sm` | 8px | Inner component padding |
| `md` | 16px | Standard card/section padding |
| `lg` | 24px | Screen horizontal margin, section gap |
| `xl` | 40px | Major section breaks |
| `xxl` | 64px | Screen-level breathing room |

Screen horizontal margin: `20px` each side (40px total content narrowing). Content bleeds intentionally for macro type (hero numerals).

---

## Typography

### Display — Cormorant Garamond (Classic, Editorial Light/Dark, Terra Firma, Golden Hour)

Editorial voice. Weight contrast between 300 Light and 700 Bold Italic is the defining personality.

| Role | Token | Weight | Size |
|---|---|---|---|
| Hero numeral | `display` | 700 Bold Italic | 160–180px |
| Verdict headline / screen title | `displayBold` | 600 SemiBold | 42–56px |
| Oracle rank / passport title | `displayLight` | 300 Light | 24–32px |
| Verdict prose / description | `serif` | 400 Regular Italic | 16–18px |

**Macro type rule:** Temperature, streak count, rating — oversized, positioned to bleed slightly past the right edge. Asymmetric, never centered.

### Display — Syne (Morning Paper, Electric)

Geometric contemporary sans. Replaces Cormorant entirely in these themes.

| Theme | `display` | `displayBold` | `displayLight` | `serif` |
|---|---|---|---|---|
| Morning Paper | Syne_700Bold | Syne_800ExtraBold | Syne_400Regular | Syne_600SemiBold |
| Electric | Syne_800ExtraBold | Syne_800ExtraBold | Syne_600SemiBold | Syne_700Bold |

Electric uses maximum weight throughout — heaviest, most graphic. Morning Paper is editorial-warm. They must read visually distinct.

### Mono — All UI text, labels, buttons, data

| Theme | `mono` | `monoMedium` |
|---|---|---|
| Classic, Terra Firma, Golden Hour, Electric | IBMPlexMono_400Regular | IBMPlexMono_500Medium |
| Editorial Light, Editorial Dark, Morning Paper | SpaceMono_400Regular | SpaceMono_700Bold |

**Space Mono:** Print-label grit. Sample-sale tag feel. Used in Editorial + Morning Paper.
**IBM Plex Mono:** Technical precision. Corporate-clean. Used in Classic, Terra Firma, Golden Hour, Electric.

| Role | Size | Tracking | Case |
|---|---|---|---|
| Eyebrow / label | 8–10px | 0.25–0.35em | ALL CAPS |
| Button copy | 10–11px | 0.25em | ALL CAPS |
| Data value | 12–14px | 0.1em | As written |
| Chip text | 8–9px | 0.2em | ALL CAPS |

**Never use emoji or icon glyphs inline with mono fonts.** Neither family contains icon characters. Use `<MaterialCommunityIcons>` exclusively for iconography.

---

## Color System

### Token Architecture

Every color traces back to: `bg`, `bgDark`, `bgSurface`, `bgCard`, `bgCardAlt`, `textPrimary`, `textSecondary`, `textMuted`, `border`, `borderHard`, `borderMid`, `scarlet`, `scarletDim` + the five outfit accent pairs.

No arbitrary hex values in components. Everything maps to tokens.

### The `scarlet` token

Not always red — it is the theme's primary accent, whatever that is.

| Theme | `scarlet` | `scarletDim` | Discipline |
|---|---|---|---|
| Classic | `#C41230` | `#FCEDEF` | Broad — chips, badges, headers, borders |
| Editorial Light | `#C41230` | `#FCEDEF` | **One per screen** |
| Editorial Dark | `#C41230` | `#FCEDEF` | **One per screen** |
| Terra Firma | `#B5491A` terracotta | `#F5E8E0` | Broad |
| Morning Paper | `#6B7F5E` sage | `#EAF0E5` | Broad |
| Golden Hour | `#C88040` amber-gold | `#F5E8D0` | Broad |
| Electric | `#FF1060` hot-pink | `#33001A` | Broad |

**Editorial one-per-screen priority:**
1. Thin horizontal rule above verdict headline
2. Founding Member badge chip text
3. Single category marker
4. Error / rate limit state
Anything that loses the priority contest renders in `textPrimary` with surface-colored type.

### Outfit accent palette (semantic — all themes)

Do not repurpose for structural UI. These are tied to outfit categories via `accentMap` in OutfitCard.

| Name | Hex | Dim | Category |
|---|---|---|---|
| `mint` | `#4A7A58` | `#EAF2EC` | Top |
| `lavender` | `#6B3F78` | `#EFE8F4` | Bottom |
| `coral` | `#B84B2E` | `#F7EAE7` | Outer Layer |
| `lemon` | `#8B6838` | `#F5EDE0` | Footwear |
| `iris` | `#2E5470` | `#E2ECF3` | Accessories |

### Semantic state colors

| State | Color | Note |
|---|---|---|
| Error | `scarlet` | Counts as the one scarlet use in Editorial themes |
| Success | `mint` | `#4A7A58` |
| Warning | `lemon` | `#8B6838` |
| Info | `iris` | `#2E5470` |

---

## Layout

- **Grid:** Single-column. Content width = screen width − 40px (20px each side)
- **Border radius:** `sm: 0`, `md: 0`, `lg: 2px`, `pill: 999px` — sharp everywhere except pill chips
- **Headlines:** Flush left in Editorial themes. Centered only for single-word vibe names
- **Macro type:** Hero numerals bleed slightly past the right edge — asymmetric, never centered
- **Negative space:** Intentional. Empty space between sections is a design decision, not padding to fill

**Sharp corners are the most differentiating choice in this category.** Every competing style app rounds everything. Sharp = editorial, not approachable.

---

## Motion

Principle: **Slow.** Everything resolves slower than the user expects. No spring physics, no bounce. Stillness is the punctuation.

| Interaction | Animation | Duration | Easing |
|---|---|---|---|
| Oracle verdict arrival | Horizontal wipe from right | 600ms | ease-in-out |
| Outfit card entrance | Slide-up 20px + fade, 80ms stagger | 300ms/card | ease-out |
| Navigation tab switch | Cross-dissolve | 400ms | ease-in-out |
| Modal/sheet entrance | Slide-up from bottom | 500ms | ease-out |
| Micro-interactions | Opacity/scale | 150ms | ease-out |
| Skeleton loading pulse | Opacity 0.3→0.7→0.3 loop | 1800ms | ease-in-out |
| Save/heart animation | Scale 1.0→1.15→1.0 | 300ms | ease-in-out |
| TodayScreen focus entrance | Fade + slide-up 12px | 500ms opacity / 450ms position | ease-out |

**Never:** Spring physics, bounce easing, elastic effects, confetti, scale-bounce on tap, animations under 100ms for primary interactions.

**useFocusEffect note:** Always wrap focus animation callbacks in `useCallback([heroOpacity, heroY])`. Without this, parent re-renders (e.g., badge toast) re-fire the effect and reset hero opacity to 0 — visible flicker.

---

## Seven Themes

### Classic
`bg: #FAF9F6` | `bgDark: #0D0B08` | `scarlet: #C41230` | Cormorant + IBM Plex Mono | `isDark: false`
Warm cream editorial. The app as shipped. IBM Plex reads slightly corporate but legible. Scarlet used broadly as structural color.

### Editorial Light
`bg: #FAF9F6` | `bgDark: #0D0B08` | `scarlet: #C41230` | Cormorant + Space Mono | `isDark: false`
Same palette as Classic; discipline is enforced by component authors. Scarlet: one per screen. Verdict arrives on dark; outfit cards on cream — publication grammar, not dark mode.

### Editorial Dark
`bg: #1A1714` | `bgDark: #0D0B08` | `scarlet: #C41230` | Cormorant + Space Mono | `isDark: true`
Maximum authority. One scarlet element is a declaration on near-black. Macro type at `rgba(245,240,232,0.15)` — watermark.

### Terra Firma
`bg: #F5EEE3` | `bgDark: #3D2B1F` | `scarlet: #B5491A` terracotta | Cormorant + IBM Plex Mono | `isDark: false`
Desert editorial. Marrakech luxury travel magazine. Terracotta used broadly.

### Morning Paper
`bg: #FBF7F0` | `bgDark: #2C2820` | `scarlet: #6B7F5E` sage | Syne + Space Mono | `isDark: false`
Porter × Kinfolk. Botanical, clean, morning ritual. Syne replaces Cormorant for all display.

### Golden Hour
`bg: #FAF6EE` | `bgDark: #1E1208` | `scarlet: #C88040` amber-gold | Cormorant + IBM Plex Mono | `isDark: false`
Loewe × The Row at dusk. The richest, most luxurious palette. Amber-gold dominates hero temperature.

### Electric
`bg: #1E2DFF` | `bgDark: #0A15CC` | `scarlet: #FF1060` hot-pink | Syne_800ExtraBold + IBM Plex Mono | `isDark: true`
TREVO-inspired. Vivid cobalt throughout. Hot-pink on cobalt is graphic, not decorative. Maximum-weight Syne everywhere.

---

## TodayScreen Theme Flags

```typescript
const isWarmTheme   = ['terra-firma', 'morning-paper', 'golden-hour', 'electric'].includes(themeName);
const isBannerTheme = ['morning-paper', 'golden-hour', 'electric'].includes(themeName);
```

- `isWarmTheme = false` → Classic/Editorial: cream bg, hardcoded light-surface values
- `isWarmTheme = true` → use theme token values for text/bg (Electric is "warm" because S-object needs theme tokens)
- `isBannerTheme = false` → city + temperature inline in hero
- `isBannerTheme = true` → time + city + temperature in a structured dark-header unit

---

## Key Component Patterns

### OutfitCard
- Accent left-border (1px, full height) in the category's accent color
- Item name in `displayLight` (Cormorant 300 / Syne equivalent)
- Category label in mono eyebrow, `textMuted`, ALL CAPS, tracked
- Google Shopping Pressable: `borderHard` border, `textPrimary` label
- Heart save icon: scale animation on toggle (`impactAsync(Medium)`)
- `key={item.category}` — never index-based keys

### VerdictCard
- Dark section (`bgDark`) — verdict arrives as a black panel
- Vibe name: `displayBold` at 42–56px, flush left, not centered (unless single word)
- Scarlet rule above headline (1px horizontal, full width) — counts as the one scarlet use in Editorial
- Verdict prose: `serif` (Cormorant italic or Syne equivalent), 16–18px, `textSecondary` on cream sections
- Horizontal wipe animation on arrival, 600ms

### WeatherStrip
- `MaterialCommunityIcons` icon name stored in `conditionIcon` — not emoji
- Temperature in `display` font at reduced size (not the full 160px hero)
- Condition text: mono eyebrow style

### ChallengeCard
- Scarlet-accented (counts as one use in Editorial themes)
- Editorial copy voice: challenge text in `serif` italic
- Bordered card, `bgCard` surface

### SkeletonResults
- Opacity pulse 0.3→0.7→0.3, 1800ms period, ease-in-out
- Surface: `bgSurface`, not `bgCard` (appears as placeholders, not elevated)

### BadgeToast
- Dark editorial bottom-sheet: `bgDark` surface
- Slide-up from bottom, 500ms ease-out, auto-dismiss 3.5s
- Badge icon + title + "Achievement unlocked." + `Haptics.notificationAsync(Success)`
- Detection in AppContext (fires from any tab)

### CitySuggestions
- `marginHorizontal: spacing.lg` — respects screen margins
- Mono type, `textPrimary`, bordered rows

---

## Patterns to Avoid

- Emoji in Text components with a custom `fontFamily` — neither IBM Plex Mono nor Space Mono renders them
- `MaterialCommunityIcons` inline with mono font — use standalone icon components
- Rounded corners on cards or inputs — `radius.sm` and `radius.md` are both 0
- Box shadows that are visible at arm's length
- Multiple accent colors on one screen (except outfit accent palette which is semantically prescribed)
- Centered headlines — flush left is the rule; centering only single-word display text
- `key={index}` on lists
- Hardcoded hex values in components — always use theme token

---

## Interaction Patterns

### Haptic feedback scale
- **Toggle / selection** (gender, occasion, theme picker) → `Haptics.selectionAsync()`
- **Save / meaningful action** (heart save, consult CTA) → `Haptics.impactAsync(ImpactFeedbackStyle.Medium)`
- **Achievement / success** (verdict arrival, badge unlock) → `Haptics.notificationAsync(NotificationFeedbackType.Success)`
- Never use `selectionAsync` for a save action — it reads as too light for something the user wants to feel.

### Mode-switch crossfade
When a toggle switches between two sets of content (e.g. POLISHED/CASUAL outfit cards), fade the container in after the switch rather than letting React re-render raw:

```ts
const toggleFade    = useRef(new Animated.Value(1)).current;
const isFirstToggle = useRef(true);

useEffect(() => {
  if (isFirstToggle.current) { isFirstToggle.current = false; return; }
  toggleFade.setValue(0);
  Animated.timing(toggleFade, { toValue: 1, duration: 220, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();
}, [activeMode]);
```

Wrap the content list in `<Animated.View style={{ opacity: toggleFade }}>`. Skip on first render so initial card entrance animations don't compound.

### Empty state copy
Sections that may be empty on first launch must always render — never conditionally hide an entire section. When the list is empty, show editorial copy instead:

```tsx
{list.length === 0 ? (
  <Text style={styles.emptyState}>The Oracle awaits your first inquiry.</Text>
) : list.map(item => ...)}
```

Style: `fonts.serif` (Cormorant italic or Syne equivalent), `fontSize: 16`, `lineHeight: 24`, `color: colors.textMuted`, `fontStyle: 'italic'`. Never `fonts.mono` for empty states — italic display type reads as intentional, not broken.

**Canonical copy:**
- Oracle Archives empty: *"The Oracle awaits your first inquiry."*
- Saved Looks empty: *"No looks saved. The wardrobe is a blank canvas."*
- Achievements empty: *"Consult the Oracle to begin earning achievements."* (mono, 10px — existing)

### Tab bar dot badge
To hint stale/fresh content without a number badge, render a small dot inside the icon's container:

```tsx
tabBarIcon: ({ color, size }) => (
  <View>
    <MaterialCommunityIcons name={icon} size={size} color={color} />
    {showDot && <View style={styles.tabDot} />}
  </View>
),
```

```ts
tabDot: {
  position: 'absolute',
  top: -1,
  right: -5,
  width: 6,
  height: 6,
  borderRadius: 3,
  backgroundColor: colors.scarlet,
},
```

Always use `colors.scarlet` — the dot adapts across all seven themes automatically. Never hardcode a color here.

---

## Phase 3.5 Polish Queue (from Roadmap)

These are the open style improvements. Before adding new features, check this list:

- [x] **Empty state editorial copy** — Saved Looks + Oracle Archives always render; serif italic `textMuted` copy when empty
- [x] **POLISHED/CASUAL toggle crossfade** — 220ms ease-out fade on `lookMode` change; skips first render
- [x] **Tab bar dot** — 6px `colors.scarlet` circle on Oracle icon when cached result >2 hours old
- [x] **Haptic on save** — heart toggle uses `impactAsync(Medium)`
- [x] **Offline graceful state** — network errors restore last cache; "OFFLINE — CACHED" badge; editorial no-cache message
- [x] **Seasonal prompt tuning** — `getSeason(month, lat)` hemisphere-aware; injected into both app + Worker prompts
- [x] **First-consult magic moment** — full-screen dark overlay on first result; logo + city + vibe; tap-to-skip; one-time only
- [ ] **`AppIcons` type** — icon token object in theme type; enables per-theme icon set swapping; prerequisite for custom themes
