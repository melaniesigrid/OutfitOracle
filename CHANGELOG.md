# Changelog

All notable changes to Outfit Oracle are documented here.

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
