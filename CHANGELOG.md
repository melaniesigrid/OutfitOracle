# Changelog

All notable changes to Outfit Oracle are documented here.

---

## [1.1.0] — 2026-05-13

### Added
- **Founding Member badge** — first 100 unique devices earn a scarlet chip in YouScreen; server-controlled via Cloudflare KV; LLM trust boundary enforced before KV logic
- **Test suite** — 43 tests across 4 suites (oracle types, analytics, weather badges, proxy routing) using ts-jest; compatible with Node 23
- **Mandatory onboarding gate** — skip button removed; AppNavigator gates the tab navigator on profile status; returning skipped users are redirected to the style step on next launch
- **Hybrid rate limiting** — X-Device-ID UUID v4 validation; requests with no identifier are rejected with 400; CF-Connecting-IP fallback preserved

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
