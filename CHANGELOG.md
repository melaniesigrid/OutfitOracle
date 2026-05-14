# Changelog

All notable changes to Outfit Oracle are documented here.

---

## [1.3.0] — 2026-05-14

### Added
- **Y2K theme** — Full lavender/hot-pink/lime design system: Y2KCard, Y2KBadge, Y2KSticker, Y2KDecreeCard, Y2KWeatherCard, Y2KOutfitCard, Y2KOracleScreen, Y2KTodayScreen. Two font subthemes: Decree (Syne + Cormorant) and Club (Baloo 2 + Knewave).
- **Confetti celebration** — 55-particle animated overlay fires on badge unlock, theme-aware colors (lavender/lime for Y2K, hot-pink/white for Electric, warm earth tones for terra-firma themes). Sits below BadgeToast at `zIndex: 998`.
- **BadgeToast spring animation** — Icon spring-pops with rotation after the card slides up. 4 s auto-dismiss with TAP × hint.
- **HourlyGraph** — Shared sparkline component renders hourly temperature forecast on Today screens.
- **Temperature toggle** — Celsius / Fahrenheit switcher via `TemperatureContext`. All temperature displays (Oracle Archives, weather strips, hourly graph) respect the setting.

### Fixed
- **Founding Member chip (YouScreen)** — Icon and label were using `colors.bg` (lavender on Y2K, vivid blue on Electric) as text color against a scarlet background. Fixed to cream `#FAF9F6` — readable on all theme variants.
- **Electric consult button text** — Button text used `colors.bg` (#1E2DFF vivid blue) on a hot-pink (#FF1060) background — ~1.88:1 contrast, far below readable. Fixed to cream for all themes (~3.8:1 on hot pink).
- **Archive temperature format** — Oracle Archives always showed raw Celsius, ignoring the C/F toggle. Now wrapped in `formatTemp()` from `TemperatureContext`.

---

## [1.2.0] — 2026-05-14

### Added
- **Three-theme system** — Classic (IBM Plex Mono, broad scarlet), Editorial Light (Space Mono, cream background, restrained scarlet), and Editorial Dark (Space Mono, near-black background). Theme persists across sessions via AsyncStorage. Switch in Settings.
- **Achievement badge toasts** — unlocking a new weather badge triggers an animated bottom-sheet toast with haptic feedback. Scarlet accent in Classic; neutral in Editorial themes (scarlet discipline: one per screen max).
- **Cold-start badge spam fix** — badge diff detection now gates on `historyLoaded`, preventing all previously-earned badges from firing as "new" toasts on every app open.
- **DESIGN.md** — full three-theme design system specification: color tokens, typography, spacing, motion rules, scarlet discipline, and theme extensibility guide for contributors.

### Changed
- **StatusBar adapts to theme** — five screens now use `isDark ? 'light-content' : 'dark-content'` so status bar icons are visible on all three theme backgrounds.
- **ThemeProvider wraps AppDataProvider** — corrected provider nesting so theme tokens are available to all app hooks at the context level.
- **ThemeContext value memoized** — context object wrapped in `useMemo` to prevent unnecessary re-renders across all `useTheme()` consumers.
- **BadgeToast animation** — entrance/exit uses `Timing + Easing.out(Easing.cubic)` per DESIGN.md motion spec (spring physics prohibited).

### Fixed
- **TodayScreen theme tokens** — scroll background and content colors now follow theme tokens instead of hardcoded dark values; Editorial Light is fully legible.
- **Editorial error messages** — rate limit, server, network, and parse errors now use editorial voice ("The Oracle has spoken enough today…") matching the app's persona.
- **SettingsScreen active theme chip** — active chip border and text use `colors.bg` (not hardcoded cream `#FAF9F6`) so the active state is visible in all themes.
- **Oracle proxy test assertions** — two tests updated to match editorial error message strings after the error-map refactor.

### For contributors
- **Theme extensibility** — adding a new theme requires entries in `THEMES` (theme/index.ts) and `THEME_OPTIONS` (SettingsScreen.tsx) only; all consumers call `useTheme()` and require no changes.
- **Accent color discipline** — `accentMap`/`ACCENT` objects in `OutfitCard` and `ShareCard` are now memoized with `useMemo([colors])` to prevent unnecessary renders.
- **`dismissBadgeToast`** stabilized with `useCallback` to prevent AppContext consumers re-rendering on every badge state change.

---

## [1.1.1] — 2026-05-14

### Fixed
- **Founding Member badge persistence** — badge now stored in a dedicated `@outfit_oracle_founding_member` AsyncStorage key rather than derived from history; survives the 20-entry history cap and soft clears
- **Splash screen hang on storage failure** — `.catch()` fallbacks added to AsyncStorage reads in `AppNavigator` and `useStyleProfile` so a storage rejection no longer leaves the splash screen visible forever
- **Splash screen hang on font load failure** — `useFonts` error is now handled; `SplashScreen.hideAsync()` fires even when font loading fails so the app is never bricked on the launch screen
- **APP_VERSION stale value** — Settings screen now reads version from `Constants.expoConfig?.version` (expo-constants) instead of the hardcoded `'1.0.0'`
- **Locked achievements UI** — badge grid now collapses behind a pressable header; chip order corrected (Founding Member before Streak); `badgeDescLocked` style consolidated into `badgeDesc`

### For contributors
- **Test suite expanded to 61 tests** — two new suites (`foundingMember.test.ts`, `appNavigator.test.ts`) cover FM badge key isolation, onboarding gate logic, hydration contract, and the D6 storage-rejection fallback
- **TODOS.md** — three open debt items captured with full context: achievements empty-state copy, analytics toggle wiring, and `earnedAt` timestamp accuracy for streak/count badges

---

## [1.1.0] — 2026-05-13

### Added
- **Founding Member badge** — first 100 unique devices earn a scarlet chip in YouScreen; server-controlled via Cloudflare KV; LLM trust boundary enforced before KV logic
- **Mandatory onboarding gate** — style profile is now required before entering the app; skip button removed; returning users who previously skipped are prompted on next launch
- **Hybrid rate limiting** — X-Device-ID UUID v4 validation; requests with no identifier are rejected with 400; CF-Connecting-IP fallback preserved

### For contributors
- **Test suite** — 43 tests across 4 suites (oracle types, analytics, weather badges, proxy routing) using ts-jest; compatible with Node 23

### Changed
- Worker Founding Member KV reads parallelized with `Promise.all` (was sequential)
- `FOUNDING_MEMBER_CAP` extracted as a named constant in the Worker
- `earnedBadges`, `unearnedBadges`, `isFoundingMember`, and badge category grouping wrapped in `useMemo` in YouScreen
- Dead `skipBtn`/`skipText` styles removed from StyleOnboarding

### Fixed
- `profileCtx.profileState.status` — AppNavigator was referencing `.status` directly (TypeScript error)
- `skip` unused variable removed from HomeScreen after `onSkip` prop removal
- `onSkip` prop no longer passed to StyleOnboarding (prop was removed in a prior commit)

---

## [1.0.0] — 2026-05-12

Initial launch build.

- Weather fetch via Open-Meteo (geocoding + conditions, free, no key)
- Claude Sonnet 4.6 outfit verdicts via Cloudflare Worker proxy
- Editorial UI — Cormorant Garamond + IBM Plex Mono, cream/black/scarlet
- 3-tab navigation: Today / Oracle / You
- Style profile: keywords, budget tier, Oracle personality, temperature sensitivity, colour preferences
- Outfit history (20-entry cap, 5-min dedup), last result cache (12hr TTL)
- Consult streak, Oracle Rank, Style Passport, 127 achievements across 15 categories
- Weekly editorial challenge (16 rotating prompts, ISO week picker)
- Saved outfits with "Wear this again" banner
- Share card (react-native-view-shot + native Share sheet)
- GPS auto-detect, city autocomplete, occasion picker (Any / Work / Date / Event / Weekend / Active)
- Expanded Today tab: hourly + 7-day forecast, UV, sun/moon, pollen, AQI
- Style Passport world map (Apple Maps, scarlet markers, fashion capital stamps)
- PostHog analytics (HTTP, 7 events), Sentry crash reporting (no-op without DSN)
- Cloudflare Worker proxy with KV rate limiting (20 req/hr per device)
- Settings screen: clear data, analytics toggle, version info, privacy policy link
