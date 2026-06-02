# Changelog

All notable changes to Outfit Oracle are documented here.

---

## [1.5.1.0] — 2026-06-02

### Fixed
- **Data reset completeness** — Full reset now clears every persisted key: look archive, device ID, notification state (last city, prompted flag, rating ID), generated image cache, and city descriptor cache. All three Oracle screen variants (Editorial, Y2K, Mondrian) and Settings screens aligned to the same `ALL_KEYS` list.
- **Auto-location after reset** — Oracle screens now listen to `dataResetEpoch` from `AppContext`; the one-shot auto-location guard resets on each epoch tick so GPS consult fires correctly after a full data reset. Guard also waits for `profileState.status === 'set'` instead of `!== 'loading'` to prevent spurious triggers during onboarding.
- **Hook `clear()` completeness** — `useOutfitHistory.clear()` now also clears `firstConsultAt` and its AsyncStorage key. `useArchive`, `useConsultStreak`, and `useStyleProfile` each expose a `clear()` method wired to `notifyDataReset()` so the reset signal propagates atomically.
- **`makeId()` uses secure random bytes** — Local user ID suffix is now generated with `fillSecureRandomBytes` (24-hex-char suffix) instead of `Math.random().toString(36)`. Added `auth.test.ts` assertion proving `Math.random` is never called during account creation.

### Documentation
- **README screenshots** — Added 4 simulator screenshots (Oracle tab, Today tab, You tab, theme picker) displayed in a 4-column table near the top of the README.

---

## [1.5.0.1] — 2026-06-01

### Documentation
- **ASO.md (v2 — expanded)** — Full App Store Optimization guide, 27 sections. Covers: 2026 two-engine algorithm model, iOS/Google Play platform mechanics, title/keyword/description strategy, Custom Product Pages (organic indexing, 3-CPP plan), In-App Events playbook, Apple Search Ads integration, Smart App Banners, Google Play Custom Store Listings (CSLs, 57% CVR lift case study), Google Play Promotional Content (LiveOps), hidden keyword surfaces (developer name strategy, IAP naming, single-word field tactic), seasonal keyword calendar with fashion week windows, iOS platform features for discovery (Widgets, Live Activities, App Clips), rating velocity from zero to fifty, review gating implementation, market context ($1.2B AI stylist category), and monthly ongoing ASO checklist.

---

## [1.5.0.0] — 2026-06-01

### Added
- **Google & Facebook sign-in** — Social authentication via Google and Facebook OAuth, with server-side token verification (Google iss/aud/email_verified, Facebook debug_token). Apple Sign In support stubbed and ready pending paid Apple Developer enrollment.
- **Daily push notifications** — Opt-in daily reminder with city and temperature context. Three schedule options (8am, 12pm, 6pm). Permission prompt surfaces automatically after the first consult; deep-links directly to the Oracle tab.
- **City passport expansion** — CityArrivalModal celebrates first-visit cities; city descriptor (editorial fashion territory prose) now generated server-side via Claude Haiku and gated behind the same rate limiter as oracle consults.
- **Cloud profile sync** — Style profile uploads to the Cloudflare Worker on sign-in; syncs down on new device login without overwriting a locally set profile.
- **Shopping links** — Outfit cards include searchable shop links generated server-side from Claude's verdict items.
- **Weather Glance Card** — Full animated weather card with condition-matched palettes, hot/cold weather animations, UV label, hourly graph, moon phase, and editorial copy variants.
- **WeatherUtils** — `uvLabel` and `localHour` exported from weather service; NWS (US) alert path added alongside existing ECCC (Canada) integration.

### Changed
- **Oracle Cloudflare Worker** — Migrated to Hono routing framework. City descriptor endpoint added. Rate limiting now uses separate key namespace per endpoint type to prevent city lookups burning oracle quota.
- **Y2K & Mondrian theme refinements** — Settings screen layout overhauled (2-column chip grid, palette strip swatch), dozens of visual polish fixes across Y2K and Mondrian screens.
- **DailyNotifPrompt** — `makeStyles` moved to `useMemo`; notification prompt handlers stabilised with `useCallback`.

### Fixed
- **Google/Facebook auth userId collision** — Empty `userId: ''` passed to local auth caused all social sign-in users on a shared device to land on the same local account slot. Now resolves to the server-verified `sub` claim from `cloudResult`.
- **SIWA nonce bypass** — `nonce_supported: false` in Apple token payload no longer silently skips nonce verification; tokens without a nonce are now rejected.
- **Google token `iss` validation** — Added issuer and `email_verified` checks to Google token verification in the Worker.
- **`/city-descriptor` rate limit gap** — Endpoint was calling the Anthropic API without any rate limiting; now shares the same per-device 20 req/day limit as oracle and image routes.
- **SecureStore key migration** — Auth keys migrated from AsyncStorage (plaintext) to `expo-secure-store` (Keychain/Keystore); invalid key strings (containing `@`) corrected.
- **PBKDF2 Hermes compatibility** — Replaced `crypto.subtle` (unavailable in some Hermes builds) with a pure-JS PBKDF2-SHA256 implementation using `expo-crypto` for CSPRNG.
- **Unused imports** — Removed dead `AUTH_SESSION_KEY`/`AUTH_USERS_KEY` imports from SettingsScreen and MondrianSettingsScreen after reset logic was refactored.

### Security
- **Auth SecureStore migration** — Session tokens and user records now stored in Keychain (iOS) / Keystore (Android) via `expo-secure-store`.
- **Timing-safe password compare** — XOR-based `timingSafeEqual` replaces direct string comparison to prevent timing attacks on local password verification.
- **SIWA nonce hardening** — `nonce_supported: false` no longer bypasses nonce check; missing nonce is a hard failure.
- **Google OIDC compliance** — `iss` and `email_verified` claims validated server-side.

---

## [1.4.0] — 2026-05-17

### Added
- **Local account auth** — Sign up / sign in with name, email, and password. Credentials stored on-device only using PBKDF2-SHA256 (100k iterations, Web Crypto API). Sessions persist 90 days with expiry enforcement on next launch.
- **Oracle image generation** — AI-generated editorial fashion photos and fashion-illustration sketches (day + night variants) via fal.ai FLUX Pro, proxied through the Cloudflare Worker so the API key never ships in the JS bundle. Day image auto-generates; night and sketch variants are on-demand to avoid $0.20–0.32 in sequential fal.ai charges per consult.
- **Image generation proxy** — `/image` endpoint added to the Cloudflare Worker with the same device-ID validation and rate limiting as the oracle route.

### Security
- **PBKDF2 password hashing** — Replaced the prior multiply-hash scheme with PBKDF2-SHA256 (100k iterations, 16-byte cryptographically random salt). Available in Hermes ≥ Expo SDK 50 via `crypto.subtle` — no new native modules required.
- **Password length cap** — Passwords over 1024 characters are rejected before hashing to prevent PBKDF2 DoS.
- **Session expiry** — Auth sessions now include an `expiresAt` timestamp (90 days). Expired sessions are cleared on next app launch.
- **fal.ai key moved server-side** — `EXPO_PUBLIC_FAL_KEY` is no longer baked into production builds. All image generation routes through the Worker proxy.
- **Image rate limiting** — `/image` endpoint now enforces the same per-device daily limit as the oracle route; unauthenticated requests (no device ID or CF IP) are rejected 400.
- **Prompt injection hardening** — Worker validates gender against an allowlist (`Men` / `Women`), caps `weather.city` and `weather.country` at 100 chars, and validates that city is a non-empty string before interpolating into the Claude prompt.
- **Oracle image cache cleared on reset** — "Reset Everything" in Settings now scans `AsyncStorage.getAllKeys()` for the `@oracle_image_v1_` prefix and removes all cached image entries in addition to the static key list.

### Performance
- **Confetti `interpolate` hoisted out of render** — `rotate.interpolate()` for 55 particles was recreated on every render; moved into the `makeParticles()` factory and stored on the `Particle` object. Eliminates 55 `Animated.InterpolatedNode` allocations per frame during confetti.
- **fal.ai CDN cache TTL** — Image cache entries now store `cachedAt`; entries older than 6 hours are treated as a miss and re-fetched to avoid serving expired CDN URLs.

### Fixed
- **TodayScreen background color** — Hardcoded `#000000` replaced with `colors.bgDark` token so all themes render correctly.
- **Y2KOracleScreen share button** — Hardcoded `#000000` border/shadow and `#FFFFFF` label replaced with `y2kTokens.ink` and `y2kTokens.cream`.
- **Y2KDecreeCard entrance animation** — Both `Animated.timing` calls now use `Easing.out(Easing.ease)` per DESIGN.md motion spec.
- **`autoGenerate` flag explicit** — All four `useOracleImage` calls in `AppContext` now pass explicit `autoGenerate` booleans; the day variant is eager, the three others are lazy.

### Tests
- **134 tests across 11 suites** — Three new suites added: `oracleUtils.test.ts` (22 getSeason hemisphere/edge-case tests), `themePredicates.test.ts` (isDarkColor + all 5 isXTheme predicates + mutual exclusivity), `y2kTypography.test.ts` (getY2KFontSet + getY2KTypography for both subthemes). Total up from 94.

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
