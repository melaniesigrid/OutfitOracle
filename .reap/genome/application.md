# Application

## Project Identity

- **Project:** outfit-oracle
- **Tagline:** *Your unsolicited style authority.*
- **What it is:** A weather-powered AI fashion advisor for iOS. Fetches real-time weather for any city, then calls Claude Sonnet 4.6 (via a Cloudflare Worker proxy) to generate a personalised outfit verdict. Features 13 visual themes, a full gamification system (streaks, 127+ badges across 15 categories, rank tiers, weekly challenges), and a saved looks archive.
- **Target user:** Style-conscious smartphone users who want a fast, opinionated outfit recommendation based on where they are and what they're doing.

## Tech Stack

- **Language:** TypeScript (strict mode)
- **Framework:** React Native (Expo bare workflow, iOS-first)
- **Navigation:** React Navigation v6 — 3 tabs: Today / Oracle / You
- **AI:** Claude Sonnet 4.6 via Cloudflare Worker proxy (key never in client bundle)
- **Weather:** Open-Meteo API (free, no key required)
- **Weather Alerts:** Environment Canada + NWS (US) — planned
- **Image gen:** fal.ai (on-demand, 4 variants per verdict: day photo, night photo, day sketch, night sketch)
- **State:** React Context + AsyncStorage (no Redux)
- **Testing:** Jest + ts-jest (153 tests, 14 suites)
- **Fonts:** Expo Font (Cormorant Garamond, IBM Plex Mono, Space Mono, Syne, Baloo 2)
- **Icons:** MaterialCommunityIcons from @expo/vector-icons

## Architecture Decisions

### Provider stack (App.tsx)
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
Fonts load in `App.tsx` via `useFonts`. App shows a blank cream view until fonts resolve; on font error the splash screen is dismissed so the app is not bricked.

### Navigation gate (AppNavigator.tsx)
Three sequential gates before showing UI:
1. **Auth** (`AuthContext`) — unauthenticated users see `AuthScreen`. Auth is local AsyncStorage-based (not a remote IdP).
2. **Onboarding** — fresh installs see: `WelcomeScreen` → `OnboardingCarousel` → `PersonalityScreen` → `StyleOnboarding`.
3. **Main app** — `TabNavigator` (Today / Oracle / You) + modals: `ProfileEdit`, `Map`, `Settings`. Badge toasts and confetti render in a portal above `MainStack`.

### Thin-router pattern for multi-theme screens
`OracleScreen` is a thin router: `isY2KTheme()` → `Y2KOracleScreen`, `isMondrianTheme()` → `MondrianOracleScreen`, else `EditorialOracleScreen`. Each theme gets its own full-screen component. Same pattern applies to TodayScreen, YouScreen. No shared layout abstraction — themes diverge too much.

### Proxy-first API architecture
`EXPO_PUBLIC_CLAUDE_API_KEY` must NEVER be set in production. The Cloudflare Worker holds the Anthropic key server-side. All Claude calls go through the proxy. `anthropic-dangerous-direct-browser-access` header has been removed — direct calls will 403.

### Hook-driven data layer
`useOracle` is the only stateful oracle layer. Core consult flow:
1. `OracleScreen` calls `useOracle.consult()`
2. `fetchWeather(city)` — Open-Meteo geocoding + forecast (no API key)
3. `fetchOracleVerdict(...)` — POST to Cloudflare Worker → Claude Sonnet 4.6
4. Worker returns pure JSON matching `OracleVerdict`
5. Presentational components render the result (props only)

Status values: `idle` | `fetching-weather` | `fetching-verdict` | `done` | `error`. Results cached in AsyncStorage for 12 hours.

### Theme system
13 themes: Classic, Editorial Light, Editorial Dark, Terra Firma, Morning Paper, Golden Hour, Electric, Weather Glance, Weather Editorial, Y2K, Neo-Brutal Light, Neo-Brutal Dark, Mondrian. All design tokens (colors, fonts, spacing, radius) live in `src/theme/index.ts`. Theme name stored at `@outfit_oracle_theme`. Y2K font subtheme at `@outfit_oracle_y2k_font_subtheme`.

### Oracle tab stale indicator
The Oracle tab shows a scarlet dot when the cached verdict is older than 2 hours.

### Image generation cost control
`AppContext` wires 4 `useOracleImage` instances; only the `day` variant auto-generates on consult (~$0.05–0.08/image). Night and sketch variants are on-demand to avoid 4× sequential fal.ai fetches per consult.

### Why This Architecture?
Expo bare workflow chosen for native module access (haptics, notifications, location) with JS-first DX. Proxy chosen to keep the Anthropic key out of the IPA (inspectable). AsyncStorage chosen because the data model is fully local — no sync required. Local auth (vs remote IdP) chosen for simplicity at current scale.

## Conventions

### Design
- **Scarlet discipline (Editorial themes):** One scarlet element per screen maximum. Priority: verdict rule > Founding Member badge > error state > category marker.
- **No emoji in custom font Text components:** IBM Plex Mono and Cormorant Garamond lack most Unicode symbols. Use `MaterialCommunityIcons` or plain ASCII.
- **Weather condition icons:** Use `MaterialCommunityIcons` icon names (e.g. `"weather-sunny"`), not emoji. Stored in `conditionIcon` on `WeatherData`.
- **Sharp corners everywhere:** `radius.sm` and `radius.md` are both `0`. Do not add `borderRadius` unless designing a pill/capsule.
- **Motion spec:** Card entrances = `Easing.out(Easing.ease)`, 300–500ms. No spring/bounce. Always `useNativeDriver: true` on opacity/transform animations.
- **Styling pattern:** `makeStyles(colors, fonts, ...)` wrapped in `useMemo` per screen. No hard-coded hex values — always use `colors.*`, `fonts.*`, `spacing.*`.
- **Minimum font size:** 10px. `colors.textMuted` is the lightest allowed body text on `colors.bg` (5.08:1 contrast).

### Code
- **Claude response format:** Pure JSON only — no markdown, no backticks. Parsed with `JSON.parse`. Shape defined by `OracleVerdict` in `oracle.ts`.
- **AsyncStorage key prefix:** All keys use `@outfit_oracle_*`.
- **Optional fields on shared interfaces:** `WeatherData`, `HistoryEntry` — old persisted records must deserialize without crashing. New fields must always be optional.
- **AsyncStorage corruption handling:** Always wrap `JSON.parse` in try/catch and call `removeItem` on corrupt data. Never rethrow.
- **AsyncStorage security:** Not encrypted. Do not store secrets or plain passwords. Use `expo-secure-store` for sensitive data.
- **Prompt + `getSeason()` sync:** Must stay aligned between `src/services/oracle.ts` (dev path) and `cloudflare-worker/index.js` (production). Update both when changing verdict shape or season logic.
- **Y2K / Mondrian edits:** May need changes in both the thin-router screen and the themed subfolder.
- **useCallback on all mutation functions:** `addEntry`, `removeEntry`, `recordConsult`, etc. Unstable references cause unnecessary child re-renders.
- **Discriminated unions for status types:** e.g. `'idle' | 'fetching-weather' | 'fetching-verdict' | 'done' | 'error'` — not plain strings.
- **Rate limit handling:** Worker enforces 20 req/day per device. UI must handle `429` with a clear message, not a generic error.
- **Fetch timeouts:** All fetch calls must time out within 15 seconds. A hanging fetch with no timeout blocks the user indefinitely.

### Process
- **Commits:** Conventional Commits (`feat | fix | refactor | style | docs | chore | test`). No emoji.
- **Tests:** Every new feature requires a test. Modified logic requires updated tests run fresh before commit.
- **Dependency installs:** Always `npx expo install` for native-module packages, never `npm install`. Current SDK: 54.

## Constraints

- **Test command:** `npm test`
- **Type check:** `npx tsc --noEmit`
- **Run (iOS):** `npx expo run:ios`
- **EXPO_PUBLIC_CLAUDE_API_KEY must NOT be in production builds** — key would be readable from the IPA.
- **No breaking changes to `OracleVerdict` shape** without updating both `oracle.ts` and the Cloudflare Worker prompt.
- **iOS-first:** Android is supported but not the primary test target.
