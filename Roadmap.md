# ROADMAP.md

## Progress Tracking Convention

- `[ ]` = Todo | `[-]` = In Progress 🏗️ | `[x]` = Completed ✅

---

## Bugs

> Active bugs only. Move to **Fixed Bugs** once resolved with a date and one-line summary of the fix.

| # | Severity | Description | File(s) | Status |
|---|---|---|---|---|
| — | — | *No open bugs* | — | — |

### Fixed Bugs

| # | Fixed | Description | Fix Summary |
|---|---|---|---|
| 1 | 2026/05/10 | `handleConsult` crashed from `onSubmitEditing` | Keyboard event passed as `overrideCity`; wrapped in `() => handleConsult()` |
| 2 | 2026/05/10 | Weather icons showed as `?` on device | Replaced emoji strings with `MaterialCommunityIcons` name strings |
| 3 | 2026/05/10 | `claude-sonnet-4-20250514` model not found | Claude 4 drops date suffix; corrected to `claude-sonnet-4-6` |
| 4 | 2026/05/11 | CTA `onPress={handleConsult}` passed `GestureResponderEvent` as `overrideCity` | Wrapped in `() => handleConsult()` |
| 5 | 2026/05/11 | `JSON.parse` on Claude response had no error handling | Wrapped in try/catch with a user-readable message |
| 6 | 2026/05/11 | `console.log` leaking partial API key in production | Removed both log statements |
| 7 | 2026/05/11 | `key={i}` on `OutfitCard` list — index-based key | Changed to `key={item.category}` (stable, unique per response) |
| 8 | 2026/05/11 | `textMuted` (#9A958E) contrast 2.70:1 — fails accessibility guidelines (4.5:1 required) | Darkened to #706A66 → 5.08:1, passes AA |
| 9 | 2026/05/11 | All remaining 8–9px informational labels — WeatherStrip condition/statSub, HomeScreen inputLabel/recentsLabel/errorLabel | Bumped to 10px across all components |

---

## Phase 0 — Completed Foundation ✅

- [x] Weather fetch via Open-Meteo (geocoding + conditions) ✅ 2026/05/10
- [x] Claude Sonnet 4.6 outfit verdict (JSON response, structured prompt) ✅ 2026/05/10
- [x] Full editorial UI redesign — Vogue aesthetic (Cormorant Garamond, cream/black/scarlet) ✅ 2026/05/10
- [x] MaterialCommunityIcons weather icons ✅ 2026/05/10
- [x] Google Shopping deep-links on every outfit card ✅ 2026/05/10
- [x] Error handling, loading states, reset flow ✅ 2026/05/10
- [x] Haptic feedback (consult press + verdict success) ✅ 2026/05/10
- [x] Recent cities — persisted, shown as chips, tap to re-run ✅ 2026/05/10
- [x] Pull-to-refresh on results ✅ 2026/05/10
- [x] Full accessibility pass (labels, roles, hints) ✅ 2026/05/10
- [x] CLAUDE.md + .gitignore ✅ 2026/05/10

---

## Phase 1 — App Store Readiness 🚨

> Hard blockers before any public release.

### Security
- [x] **Backend proxy for Claude API** — Cloudflare Worker deployed, `EXPO_PUBLIC_PROXY_URL` set ✅ 2026/05/11
- [ ] **Rotate the API key** — generate a new key on the Anthropic dashboard; old key was exposed in bundle history
- [x] **Rate limiting on the proxy** — KV-based, 20 req/hr per IP; gracefully skipped if KV not yet wired ✅ 2026/05/11

### App Identity
- [x] **Bundle identifier** — `com.melaniesigrid.outfitoracle` set in `app.json` ✅ 2026/05/11
- [x] **App icon** — `src/logo-dark.png` (2000×2000, jet-black + white wordmark); resized to 1024×1024 into iOS asset catalog; `"icon"` wired in `app.json` ✅ 2026/05/11
- [x] **Splash screen** — `src/logo-light.png` (cream + scarlet wordmark); `"splash.image"` wired in `app.json`; `expo-splash-screen@0.27.7` installed; `resizeMode: "contain"` on cream `#FAF9F6` ✅ 2026/05/11
- [x] **Privacy policy** — `PRIVACY_POLICY.md` covering Claude/Anthropic, Open-Meteo, AsyncStorage, PostHog ✅ 2026/05/11

### Stability
- [x] **Crash reporting** — `@sentry/react-native@8.x`; JS exceptions auto-captured + `captureException` on all Oracle errors; `Sentry.wrap(App)` in `App.tsx`; no-ops when DSN not set; native setup requires `npx @sentry/wizard@latest -s -i reactNative` + DSN in `.env` ✅ 2026/05/11
- [ ] **VoiceOver / TalkBack audit** — all Pressables have labels and roles; needs end-to-end device test

---

## Phase 2 — Growth Engine

> Features that make the app shareable, sticky, and reviewable. Ship before monetising — users won't pay for something they don't love yet.

### Virality
- [x] **Share card** — `react-native-view-shot` + React Native `Share`; editorial portrait card with masthead, vibe, weather, top 3 outfits, scarlet accent ✅ 2026/05/11
- [ ] **"Rate my outfit day"** — after the user has dressed and gone out, a time-delayed prompt (via local notification at 9am) asks them to rate how accurate the Oracle was (1-5 stars). Shown in the history feed. Social proof + engagement loop.

### Input Quality
- [x] **GPS auto-detect** — `expo-location@55.x`; "Use my location" below city input; `reverseGeocodeAsync` for city name; `consultByCoords` in `useOracle` calls Open-Meteo directly with coordinates (no double-geocode); graceful silent fallback if permission denied ✅ 2026/05/11
- [x] **City autocomplete** — debounced Open-Meteo geocoding suggestions; collapses immediately on selection and suppresses re-appearance until user types again ✅ 2026/05/11

### Retention
- [x] **Outfit history** — `useOutfitHistory` hook; saves every fresh consult (deduped within 5min window, capped at 20); "ORACLE ARCHIVES" section in HomeScreen with date/city/vibe/temp rows; tap to re-consult ✅ 2026/05/11
- [x] **Last result cache** — app opens to last result (12hr TTL); city pre-filled; "LAST CONSULTED" badge with one-tap refresh ✅ 2026/05/11
- [x] **Analytics** — PostHog HTTP API (no SDK, no rebuild); tracks app_opened, consult_started, consult_completed (with duration), consult_error, share_card_tapped, recent_city_tapped, autocomplete_city_selected; no-op if key not set ✅ 2026/05/11
- [ ] **Daily push notification** — `expo-notifications`; optional opt-in at first consult; fires at user-set time with today's city vibe teaser; deep-links to a fresh result


### Content Depth
- [x] **Skeleton loading UI** — `SkeletonResults` component; shimmer placeholder matching WeatherStrip/VerdictCard/3×OutfitCard layouts; shown alongside atmospheric loading messages during fetch ✅ 2026/05/11
- [ ] **Alternative outfits** — prompt Claude for 2 outfit sets (polished + casual) and let the user swipe between them; doubles the perceived value per consult

### Gamification — The Oracle's Court
> Inspired by the 2026 trend of gamified digital experiences (Duolingo streaks, Sephora challenges, progress-as-reward UX). The execution here must stay true to the editorial aesthetic — no XP bars or pixel badges. Every mechanic is reframed in the Oracle's voice: devotion, rank, pilgrimage.

- [x] **Consult streak** — `useConsultStreak` hook; consecutive-day tracking in AsyncStorage; streak badge in masthead ("7-DAY DEVOTEE"); milestones at 3/7/14/30/100 days trigger haptic + dismissible scarlet banner; same-day double-count prevented ✅ 2026/05/11

- [x] **Oracle Rank** — a tier system based on lifetime consults, not a point score. Titles stay in the editorial register:
  | Consults | Title |
  |---|---|
  | 1–4 | Initiate |
  | 5–19 | Devotee |
  | 20–49 | Connoisseur |
  | 50–99 | Muse |
  | 100+ | Oracle's Chosen |
  Displayed as a small label in the profile/settings sheet. Unlocking a new rank triggers a haptic + a one-time congratulatory banner (implemented). ✅ 2026/05/11

- [x] **Style Passport** — running tally of unique cities in YouScreen; milestone stamps at 10/25/50 cities ("Globetrotter", "World Citizen", "The Nomad Oracle") derived from `useOutfitHistory` ✅ 2026/05/11

- [x] **Weather badges** — `useWeatherBadges` hook; 16 badges: temperature extremes (Blizzard Chic, Polar Explorer, Desert Muse), UV (Solar Oracle, Extreme UV), precipitation (Snow Day, Storm Chaser, Rain Oracle, Rain Dancer), sunshine (The Sun Devotee, Sunshine Streak), conditions (Four Seasons), timing (Night Oracle), travel (World Citizen), anniversary (Six-Month Devotee, Year of the Oracle); `firstConsultAt` tracked in `useOutfitHistory` for anniversary badges; earned badges shown full-opacity, unearned dimmed; displayed in YouScreen ✅ 2026/05/11

- [ ] **Weekly editorial challenge** — a fresh brief every Monday, generated by Claude and stored in the Worker (or hardcoded rotating set). Examples: *"This week: dress for rain in three different cities"* or *"Consult from two continents before Sunday."* Completing it adds a limited badge and a congratulatory share card variant. The challenge is shown as a strip below the city input when active.

- [ ] **Oracle Accuracy score** — powered by the existing "Rate my outfit day" prompt (Phase 2 Virality). After rating, the running accuracy percentage is shown in the profile: "The Oracle has been right 78% of the time." High accuracy (>80%) unlocks a "Trusted Oracle" badge. Low accuracy (<50%) triggers a prompt to update the style profile — closing the personalisation feedback loop.

- [ ] **Leaderboard (post-scale)** — opt-in global leaderboard ranked by streak length and city count. Privacy-safe: display name only (derived from city of first consult, e.g. "The London Oracle"). Requires a lightweight backend (Cloudflare KV or D1). Do not build until DAU > 1,000 — leaderboards are empty and demotivating below critical mass.

---

## Phase 3 — Personalisation

> Without personalisation the Oracle gives the same answer to everyone in the same city. This is the moat.

### Style Profile (onboarding)
- [x] **3-step onboarding** — 2-step UI (keywords pick-3 + budget tier); skippable with persisted marker; profile badge in masthead taps to re-edit; profile passed to Claude on every consult via proxy and direct path ✅ 2026/05/11
- [x] **Oracle Personality selection** — Diplomat / Editor / Savage Oracle; voice injected into prompt on every consult; selectable in onboarding and editable in ProfileEditScreen ✅ 2026/05/11
- [x] **ProfileEditScreen** — name, keywords (pick-3), budget tier, Oracle voice; accessible from YouScreen "Edit →" ✅ 2026/05/11
- [ ] **Settings sheet** — toggle notifications, clear data

### Wardrobe
- [ ] **Saved outfits** — heart icon on each outfit card; saved looks stored in AsyncStorage; accessible from the header
- [ ] **"Wear this again"** — if weather is similar to a past consultation, surface the saved look with a one-tap option to re-consult

---

## Phase 4 — Monetisation

> Only introduce monetisation after Phase 2 is shipped and retention metrics show users returning. Charging too early kills growth.

### Oracle Pro — Subscription ($4.99/month or $34.99/year)
- [ ] **Paywall design** — editorial, non-aggressive; shown after 3 free consults/day. Uses `expo-in-app-purchases` or RevenueCat (recommended — handles receipt validation, restore, and analytics out of the box).
- [ ] **Free tier** — 3 consults/day, basic outfit set, Google Shopping links
- [ ] **Pro tier** — unlimited consults, alternative outfit sets, full history, wardrobe saves, daily notifications, style profile, priority response (higher Claude token budget = richer responses)
- [ ] **Restore purchases** — required by Apple; `RevenueCat` handles this automatically
- [ ] **Paywall A/B test** — test hard paywall vs. soft paywall (feature-gate only) vs. usage cap

### Affiliate Revenue
- [ ] **Retailer-specific links** — replace Google Shopping URLs with ASOS, Nordstrom, or Farfetch affiliate links via their APIs or SerpAPI; commission is 4-8% per purchase. Highest-revenue opportunity per user.
- [ ] **"Shop the full look" button** — one tap opens a curated shopping page with all 5 outfit items pre-searched; better conversion than individual item links
- [ ] **Price tier filtering** — surface items matching the user's budget tier from the style profile

### Brand Partnerships (post-scale)
- [ ] **Sponsored "Oracle's Pick"** — a 6th card in the outfit results, clearly labelled "Presented by [Brand]"; sold directly or via a fashion ad network
- [ ] **City-based editorial drops** — "This week in Milan: the Oracle recommends..."; brand-funded, city-specific editorial content surfaced at the top of the home screen

---

## Phase 5 — Platform Expansion

> After product-market fit is confirmed on iOS.

- [ ] **Android parity audit** — fonts, icons, haptics, keyboard behaviour all differ; full QA pass required before Android launch
- [ ] **iPad / tablet layout** — two-column split: input + weather left, results right; `app.json` currently has `supportsTablet: false`
- [ ] **Web version** — `expo start --web` works today but is unstyled; a proper web build opens SEO and desktop users
- [ ] **B2B API** — fashion trend data aggregated by city + weather condition; sell access to brands and retailers for inventory/marketing decisions
- [ ] **Waitlist / referral** — launch a waitlist page before Android goes live; referral rewards unlock Pro features

---

- [x] **Expanded TodayScreen** — hourly forecast (next 24h horizontal scroll with time/icon/temp/precip%/UV); conditions strip (UV with color-coded label, sunrise, sunset, moon phase icon + name); 7-day daily forecast (day label, icon, condition, precip%, high/low temps); allergens & air quality section (AQI + grass/birch/ragweed pollen levels); verdict + outfit chips moved below weather detail ✅ 2026/05/11

## Recently Completed

- [x] **Multi-screen UX redesign** — 3-tab navigation (Today / Oracle / You); welcome flow (Intro → Carousel → Personality → Style Onboarding); `AppDataProvider` context sharing oracle state across tabs; `ProfileEditScreen`; `YouScreen` with rank hero, Style Passport, archives ✅ 2026/05/11
- [x] **Consult streak + Oracle Rank** — `useConsultStreak` hook; streak badge in masthead; milestone/rank banner with haptic; `SkeletonResults` shimmer loading ✅ 2026/05/11
- [x] **Style profile onboarding** — 2-step flow (keywords + budget), skippable with persistence, profile badge in masthead, profile passed to Claude prompt ✅ 2026/05/11
- [x] **Outfit history** — `useOutfitHistory`, "ORACLE ARCHIVES" list, tap-to-reconsult ✅ 2026/05/11

- [x] **ROADMAP.md professional audit** ✅ 2026/05/10
- [x] **Phase 1 accessibility pass** ✅ 2026/05/10
- [x] **Haptic feedback** ✅ 2026/05/10
- [x] **Recent cities** ✅ 2026/05/10
- [x] **Pull-to-refresh** ✅ 2026/05/10
- [x] **app.json theme fix** ✅ 2026/05/10
- [x] **Engineering audit + 7 bug fixes** (GestureResponderEvent crash, JSON.parse safety, console.log removal, stable list keys, dead interface field, indentation, typed `any`) ✅ 2026/05/11
- [x] **Accessibility audit** — contrast ratio fix (textMuted darkened, 5.08:1), all informational labels bumped from 8px → 10px ✅ 2026/05/11
- [x] **Rotating loading messages** — 5 atmospheric + 7 Oracle-voice messages cycling every 2.5s per phase ✅ 2026/05/11
- [x] **Staggered entrance animations** — WeatherStrip (translateX), VerdictCard (translateY), OutfitCards (staggered 90ms), AvoidSection (delayed fade) ✅ 2026/05/11
- [x] **City autocomplete** — debounced suggestions (300ms), collapses on selection, suppressed until user types again ✅ 2026/05/11
- [x] **Full accessibility label audit** — all remaining 8–9px labels bumped to 10px; textMuted contrast fixed to 5.08:1 ✅ 2026/05/11
- [x] **Cloudflare Worker proxy** — Worker written, app auto-routes when `EXPO_PUBLIC_PROXY_URL` set ✅ 2026/05/11
- [x] **Bundle identifier** — `com.melaniesigrid.outfitoracle` ✅ 2026/05/11
- [x] **Privacy policy** — `PRIVACY_POLICY.md` covering all third-party services ✅ 2026/05/11
- [x] **GitHub repository** — private repo, initial commit, all subsequent work pushed ✅ 2026/05/11
