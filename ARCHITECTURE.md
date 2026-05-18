# Architecture & codebase guide

This document is the onboarding map for Outfit Oracle: entry points, module layout, data flow, and what to read before changing code. For agent-specific rules and learned constraints, see [CLAUDE.md](CLAUDE.md). For coding conventions, see [BEST_PRACTICES.md](BEST_PRACTICES.md).

---

## What the app is

Outfit Oracle is a React Native app (Expo bare workflow) that gives weather-aware outfit advice. It geocodes a city, pulls forecast data from Open-Meteo, then asks Claude (via a Cloudflare Worker proxy) for a structured JSON “verdict” tailored to the user’s style profile, gender, occasion, and oracle personality.

---

## Main entry points

| Layer | File | Role |
|--------|------|------|
| **Bundler entry** | `package.json` → `"main": "node_modules/expo/AppEntry.js"` | Expo loads the app from here |
| **React root** | `App.tsx` | Fonts, Sentry, provider stack, `NavigationContainer` |
| **Navigation gate** | `src/navigation/AppNavigator.tsx` | Auth → onboarding → main stack |
| **Tabs** | `src/navigation/TabNavigator.tsx` | Today / Oracle / You |
| **iOS native** | `ios/OutfitOracle/main.m` | `UIApplicationMain` → AppDelegate |
| **Backend** | `cloudflare-worker/index.js` | Anthropic proxy, rate limits, production prompt |

### Provider nesting (`App.tsx`)

```
GestureHandlerRootView
  └── SafeAreaProvider
        └── TemperatureProvider
              └── ThemeProvider
                    └── AuthProvider
                          └── AppDataProvider
                                └── NavigationContainer
                                      └── AppNavigator
```

Fonts load in `App.tsx` via `useFonts` (not `HomeScreen`). The app shows a blank cream view until fonts resolve or fail; on font error the splash screen is dismissed so the app is not bricked.

---

## High-level architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Native App                         │
│  App.tsx → AppNavigator → TabNavigator                       │
│    TodayScreen │ OracleScreen │ YouScreen                    │
│         │              │                                     │
│         └──── AppContext (useOracle, profile, badges, …)    │
└──────────────────────────┬──────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
   weather.ts        oracle.ts         imageGeneration.ts
   (Open-Meteo)      (proxy/direct)    (fal.ai, optional)
                           │
                           ▼
              cloudflare-worker/index.js
                           │
                           ▼
                    Anthropic API
```

### Core consult flow

1. `OracleScreen` (or a theme variant) calls `useOracle.consult()`.
2. `fetchWeather` / `fetchWeatherByCoords` — Open-Meteo geocoding + forecast (no API key).
3. `fetchOracleVerdict` — POST to Cloudflare Worker (or dev-only direct path).
4. Worker returns pure JSON matching `OracleVerdict`.
5. Presentational components render the result (`VerdictCard`, `OutfitCard`, `AvoidSection`, etc.).

**`useOracle` is the only stateful oracle layer.** Display components receive props only. Status values: `idle` | `fetching-weather` | `fetching-verdict` | `done` | `error`. Results are cached in AsyncStorage for 12 hours.

---

## Navigation

### `AppNavigator.tsx`

Hydrates three gates before showing UI:

1. **Auth** (`AuthContext`) — unauthenticated users see `AuthScreen`.
2. **Onboarding** (`@onboarding_complete` + style profile) — fresh installs or users who skipped profile see:
   - `WelcomeScreen` → `OnboardingCarousel` → `PersonalityScreen` → `StyleOnboarding`
3. **Main app** — `MainStack` with `TabNavigator` plus modals: `ProfileEdit`, `Map`, `Settings`.

Badge toasts and confetti render in a portal above `MainStack`.

### `TabNavigator.tsx`

| Tab | Screen | Purpose |
|-----|--------|---------|
| Today | `TodayScreen` | Weather dashboard, history glance, word of the day |
| Oracle | `OracleScreen` | City consult → verdict |
| You | `YouScreen` | Profile, badges, saved looks, passport |

The Oracle tab shows a scarlet dot when the cached verdict is older than 2 hours.

---

## Key modules by folder

### `src/navigation/`

- **`AppNavigator.tsx`** — Auth, onboarding, and main stack routing.
- **`TabNavigator.tsx`** — Bottom tabs and stale-oracle indicator.

### `src/contexts/`

| File | Responsibility |
|------|----------------|
| `AppContext.tsx` | Composes oracle, profile, history, streaks, saved outfits, badges, archive, oracle images |
| `AuthContext.tsx` | Session over local AsyncStorage auth |
| `ThemeContext.tsx` | Active visual theme + Y2K font subtheme |
| `TemperatureContext.tsx` | °C / °F preference |

`AppContext` wires four `useOracleImage` instances; only the `day` variant auto-generates on consult to limit fal.ai cost (~$0.05–0.08 per image). Night and sketch variants are on-demand.

### `src/hooks/` (read before changing behavior)

| Hook | Purpose |
|------|---------|
| `useOracle.ts` | Consult state machine, 12h cache, analytics |
| `useStyleProfile.ts` | Keywords, budget, personality, onboarding gate |
| `useOracleImage.ts` | Optional fal.ai editorial images |
| `useOutfitHistory.ts` | Consult history |
| `useSavedOutfits.ts` | Hearted / saved looks |
| `useConsultStreak.ts` | Daily streak and rank |
| `useWeatherBadges.ts` | Achievement badges |
| `useArchive.ts` | Archived consults with reactions |
| `useRecentCities.ts` | City autocomplete memory |
| `useWeeklyChallenge.ts` | ISO-week editorial challenge |

### `src/services/`

| File | Purpose |
|------|---------|
| `weather.ts` | Geocoding + forecast; `conditionIcon` is a **MaterialCommunityIcons** name, not emoji |
| `oracle.ts` | `OracleVerdict` type, proxy routing, dev-only `buildPrompt` |
| `auth.ts` | Local email/password users in AsyncStorage (not a remote IdP) |
| `imageGeneration.ts` | fal.ai integration |
| `analytics.ts` | PostHog (no-op without key) |

### `src/screens/`

| Screen | Notes |
|--------|-------|
| `TodayScreen.tsx` | Primary “home” weather UI; delegates to `y2k/` or `mondrian/` when theme matches |
| `OracleScreen.tsx` | Routes to `Y2KOracleScreen`, `MondrianOracleScreen`, or `EditorialOracleScreen` |
| `YouScreen.tsx` | Profile, achievements, saved looks |
| `SettingsScreen.tsx` | Theme picker, units, account |
| `HomeScreen.tsx` | Legacy; tab home is **TodayScreen** |
| `y2k/*`, `mondrian/*` | Full alternate UIs per theme family |

### `src/theme/`

- **`index.ts`** — All design tokens, `ThemeName`, `ThemeFamily`, helpers (`isY2KTheme`, `isMondrianTheme`, `isEditorialTheme`, etc.).
- **`y2kTypography.ts`** — Y2K font subthemes (`club` / `decree`).

### `src/components/`

Shared UI: `VerdictCard`, `OutfitCard`, `WeatherStrip`, `WeatherGlanceCard`, `DressingLogicCard`, plus theme-specific `y2k/*` building blocks.

### `cloudflare-worker/`

Production brain: prompt construction, rate limiting (KV), founding-member cap, CORS.

**Keep prompts in sync:** when changing verdict shape, voice, or season logic, update both `cloudflare-worker/index.js` and `buildPrompt` in `src/services/oracle.ts` (dev direct path). `getSeason()` must match in both files.

### `__tests__/`

Jest suites: theme predicates, oracle utils, auth, navigator, proxy behavior, analytics, weather badges, founding member. Run: `npm test`.

---

## Multi-theme system

Themes are not only color swaps—they can swap **entire screen implementations**:

```tsx
// OracleScreen.tsx
if (isY2KTheme(themeName)) return <Y2KOracleScreen />;
if (isMondrianTheme(themeName)) return <MondrianOracleScreen />;
return <EditorialOracleScreen />;
```

`TodayScreen` follows the same pattern for Y2K and Mondrian.

### Theme names (`ThemeName`)

`classic`, `editorial-light`, `editorial-dark`, `terra-firma`, `morning-paper`, `golden-hour`, `electric`, `weather-glance`, `weather-editorial`, `y2k`, `neo-brutal-light`, `neo-brutal-dark`, `mondrian`

User preference: AsyncStorage key `@outfit_oracle_theme`. Y2K font subtheme: `@outfit_oracle_y2k_font_subtheme`.

Adding a theme usually requires: tokens in `src/theme/index.ts`, optional dedicated screens under `src/screens/<family>/`, and tests in `__tests__/themePredicates.test.ts`.

---

## Data types

### `OracleVerdict` (`src/services/oracle.ts`)

```ts
interface OracleVerdict {
  verdict: string;
  vibe: string;
  outfits: OutfitItem[];
  outfitsAlt?: OutfitItem[];
  avoid: string[];
  rating: number;
  foundingMember?: boolean;
}
```

Claude must return **pure JSON** (no markdown fences). The app parses with `JSON.parse` directly.

### Style profile (`useStyleProfile.ts`)

Stored in AsyncStorage: keywords, budget tier, personality (`diplomatic` | `editorial` | `savage`), temperature sensitivity, color loves/avoids. Passed to the Worker on every consult.

---

## Proxy routing (`src/services/oracle.ts`)

At module init, `EXPO_PUBLIC_PROXY_URL` is read:

- **Set** → `viaProxy()`: POST `{ weather, gender, styleProfile?, occasion? }` to the Worker; Anthropic key stays server-side.
- **Not set** → `viaDirect()`: requires `EXPO_PUBLIC_CLAUDE_API_KEY`. Direct browser calls to Anthropic will 403 without the removed dangerous-direct header—**use the proxy for all real environments.**

---

## Environment and security

Copy `.env.example` → `.env`. After any change, **fully restart** Metro—`EXPO_PUBLIC_*` vars are baked at build time.

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_PROXY_URL` | **Required for production/TestFlight** — Worker URL |
| `EXPO_PUBLIC_CLAUDE_API_KEY` | Dev only — never ship in production builds |
| `EXPO_PUBLIC_POSTHOG_KEY` | Optional analytics |
| `EXPO_PUBLIC_FAL_KEY` | Optional editorial images (set spend cap in fal.ai dashboard) |
| `EXPO_PUBLIC_SENTRY_DSN` | Optional crash reporting |

Worker deploy (from `cloudflare-worker/`):

```bash
npx wrangler deploy
npx wrangler secret put ANTHROPIC_API_KEY
```

---

## Commands

```bash
npm install
npx expo run:ios          # primary target (bare workflow, Xcode)
npx expo run:android
npm run go                # Expo Go (limited — some native modules may not work)
npm test
npx tsc --noEmit
```

Node ≥ 20.19.0 (SDK 54).

---

## What to read before making changes

### Always (in order)

1. **[CLAUDE.md](CLAUDE.md)** — Commands, env rules, architecture summary, learned rules
2. **[DESIGN.md](DESIGN.md)** — Typography, scarlet discipline, per-theme specs (required for any UI)
3. **[BEST_PRACTICES.md](BEST_PRACTICES.md)** — TypeScript, React Native, AsyncStorage, accessibility

### By task type

| If you're changing… | Also read |
|---------------------|-----------|
| Oracle copy / JSON shape | `src/services/oracle.ts`, `cloudflare-worker/index.js` |
| Weather UI | `src/services/weather.ts`, `TodayScreen.tsx`, `animations/*.html` |
| Onboarding / auth | `AppNavigator.tsx`, `useStyleProfile.ts`, `auth.ts`, `AuthScreen.tsx` |
| Themes / visuals | `src/theme/index.ts`, `ThemeContext.tsx`, `DESIGN.md` |
| Images / cost | `IMAGE_GENERATION.md`, `useOracleImage.ts`, `AppContext.tsx` |
| Shipping / backlog | `Roadmap.md`, `CHANGELOG.md`, `TODOS.md` |
| Product / affiliate | `AFFILIATE_STRATEGY.md`, `COMPETITOR_ANALYSIS.md` |

---

## Pitfalls (documented in repo)

- **No emoji** in `<Text>` with custom `fontFamily` — use `MaterialCommunityIcons`.
- **Optional fields** on shared interfaces (`WeatherData`, `HistoryEntry`) — old AsyncStorage records must not crash deserialization.
- **Prompt + `getSeason()`** must stay aligned between app and Worker.
- **Y2K / Mondrian** edits may need changes in both the router screen and the themed subfolder.
- **Simulator noise** (`hapticpatternlibrary.plist`, appearance listener) is harmless; see `CLAUDE.md`.

---

## Related docs

- [README.md](README.md) — Product overview, stack, local setup
- [Roadmap.md](Roadmap.md) — Feature backlog and launch checklist
- [CHANGELOG.md](CHANGELOG.md) — Release history
- [TODOS.md](TODOS.md) — Open design/engineering debt
- [IMAGE_GENERATION.md](IMAGE_GENERATION.md) — fal.ai image pipeline
- [docs/agent-workflows/README.md](docs/agent-workflows/README.md) — Agent orchestration workflows
