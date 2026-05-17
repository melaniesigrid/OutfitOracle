# ROADMAP.md

## Progress Tracking Convention

- `[ ]` = Todo | `[-]` = In Progress 🏗️ | `[x]` = Completed ✅

---

## CEO Launch Command Center

> Working assumption as of 2026/05/15: the next business outcome is not another feature. It is getting Outfit Oracle onto a real iPhone through TestFlight, then using real-device feedback to decide what earns a public-launch slot.

### Launch Goal

**Get the app downloadable on Melanie's phone via internal TestFlight as fast as possible.**

Internal TestFlight is the shortest path because it does **not** require App Review for internal testers. Public App Store release and external TestFlight can follow after the first real-device pass.

### CEO Priority Stack

1. **Ship an internal TestFlight build**
   - Finish the two archive blockers: Sentry DSN and `PrivacyInfo.xcprivacy` Xcode reference.
   - Create the App Store Connect record.
   - Archive from Xcode and upload.
   - Add Melanie as an internal tester and install from the TestFlight app.

2. **Verify the product on-device**
   - Complete one full first-run path: install -> onboarding -> first consult -> save -> share -> settings.
   - Run the 15-minute VoiceOver pass.
   - Confirm Cloudflare Worker, rate limiting, Sentry, analytics opt-out, and privacy policy links behave correctly in the build.

3. **Fix only launch-blocking issues**
   - Blocker = crash, Apple rejection risk, broken first consult, unreadable UI, privacy/compliance gap, or trust-breaking data behavior.
   - Anything else moves to post-TestFlight unless it directly improves first-session conversion.

4. **Prepare public launch assets**
   - Screenshots, app subtitle/keywords, beta feedback email, support/privacy URLs, and public release notes.

### Tentative Launch Calendar

| Date | Goal | Owner | Exit Criteria |
|---|---|---|---|
| 2026/05/15 | **Internal TestFlight readiness sprint** | Engineering | `npm run typecheck`, `npm test -- --runInBand`, Sentry DSN set, `PrivacyInfo.xcprivacy` added to Xcode, App Store Connect record created |
| 2026/05/15 | **Archive + upload build** | Engineering | Xcode archive succeeds, build appears in App Store Connect, internal testing enabled |
| 2026/05/15 | **Download on phone** | CEO / QA | TestFlight install succeeds on Melanie's iPhone and one first consult completes |
| 2026/05/16 | **Device QA day** | CEO / QA | First-run, settings, share, saved looks, map, themes, VoiceOver, offline cache, and analytics opt-out checked on a real device |
| 2026/05/17 | **Launch-blocker fix window** | Engineering | Only P0/P1 issues from device QA fixed; new build uploaded if needed |
| 2026/05/18 | **External beta prep** | CEO | App Store screenshots captured, subtitle/keywords finalized, beta feedback email set |
| 2026/05/19 | **External TestFlight submission** | CEO / Engineering | Build submitted for beta review if internal QA is clean |
| 2026/05/20-2026/05/23 | **External beta observation** | CEO | 5-20 trusted testers invited; Sentry checked daily; feedback triaged into blocker / later |
| 2026/05/24 | **Public launch decision** | CEO | Go / no-go decision based on crash-free sessions, first-consult reliability, and feedback severity |
| 2026/05/25-2026/05/29 | **Public release window** | CEO / Engineering | Public App Store submission or one final beta build, depending on the launch decision |

### Calendar Import

An importable phone calendar lives at `docs/launch-calendar.ics`. After this repo is pushed and GitHub Pages refreshes, open:

`https://melaniesigrid.github.io/OutfitOracle/launch-calendar.ics`

Use that file for reminders. Use this `Roadmap.md` section as the source of truth when dates change.

### Update Directives

- **Daily launch check-in:** update this section once per day until internal TestFlight is installed on a phone.
- **Date format:** use `YYYY/MM/DD` in markdown tables and ISO dates inside `.ics`.
- **Status discipline:** every calendar line must have one owner and one measurable exit criterion.
- **Scope rule:** no new Phase 2+ feature enters the launch calendar unless it removes a launch blocker or materially improves first-session conversion.
- **Triage rule:** classify device feedback as:
  - `P0 Launch Blocker`: crash, broken install, broken first consult, Apple rejection risk.
  - `P1 Fix Before External Beta`: visible trust, privacy, accessibility, or core UX issue.
  - `P2 Post-TestFlight`: polish or delight that does not block learning.
  - `P3 Later`: monetisation, identity, widgets, leaderboard, or platform expansion.
- **Calendar maintenance:** when this table changes, update `docs/launch-calendar.ics` in the same commit so phone reminders stay aligned.
- **CEO rule:** the fastest path to learning is a build on a real phone. Prefer shipping a controlled internal beta over perfecting the backlog.

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
| 9 | 2026/05/11 | All remaining 8–9px informational labels | Bumped to 10px across all components |
| 10 | 2026/05/11 | City suggestions appeared flush left | Added `marginHorizontal: spacing.lg` to `CitySuggestions` container |
| 11 | 2026/05/12 | Accessories Google Shopping searched all items as one query | `splitItems()` splits on `,` and `and`; renders one Pressable per piece |
| 12 | 2026/05/14 | Settings analytics toggle looked real but did not control tracking | Added persisted `@outfit_oracle_analytics_enabled` preference, gated PostHog calls in `analytics.ts`, loaded the stored switch state in Settings, and covered opt-out behavior with tests |

---

## TestFlight Beta — Launch Checklist 🚀

> These are the **only** remaining tasks before uploading to App Store Connect for internal beta testing. They can be completed in a single focused session.

### Must-do before archive

- [x] **Rotate the Anthropic API key** — new key generated; old key removed from `.env`; Cloudflare Worker secret updated via `wrangler secret put ANTHROPIC_API_KEY`. ✅ 2026/05/12
- [x] **Host the privacy policy** — `docs/index.html` deployed to GitHub Pages at `https://melaniesigrid.github.io/OutfitOracle/`. ✅ 2026/05/14
- [x] **Configure Sentry DSN** — Sentry project created at `outfitoracle.sentry.io` (project ID 4511388656205824); `EXPO_PUBLIC_SENTRY_DSN` is set locally for rebuilds. `App.tsx` is wired with `Sentry.init({ dsn: process.env.EXPO_PUBLIC_SENTRY_DSN })`, only enabled in non-DEV builds when the key is set. ✅ 2026/05/15
- [x] **Add PrivacyInfo.xcprivacy to Xcode** — file exists at `ios/OutfitOracle/PrivacyInfo.xcprivacy` with all four standard RN Required Reasons API entries and is now referenced by `ios/OutfitOracle.xcodeproj/project.pbxproj` in the app target resources. ✅ 2026/05/15
- [x] **Mandatory profile onboarding gate** — `AppNavigator` now gates on `profileCtx.profileState.status`; skippable inline flow replaced with mandatory full-screen onboarding; returning users who previously skipped are redirected to the style step. ✅ 2026/05/13

### Nice-to-have before archive

- [ ] **Register outfitoracle.app domain** — purchase via Namecheap or Google Domains (~$15/yr). Required for: App Clip deep links, business email (`hello@outfitoracle.app`), custom privacy policy URL, and affiliate network applications. Point DNS to GitHub Pages immediately so `https://outfitoracle.app/privacy` resolves alongside the existing GitHub Pages URL. Do this now — domain propagation takes 24–48 hours.
- [ ] **VoiceOver / TalkBack device audit** — all Pressables have labels and roles in code; needs a 15-minute end-to-end test on a real device with VoiceOver enabled. Apple will require this for public release.
- [ ] **App Store Connect record** — create the app listing (name: "Outfit Oracle", category: Lifestyle, age rating: 4+, privacy policy URL from above). Required before you can upload a build.
- [ ] **App Store screenshots** — 6.5" iPhone (1284×2778) and 5.5" iPhone (1242×2208); minimum 3 per device class. Can be captured from the simulator.
- [ ] **App Store keyword research** — subtitle (30 chars): "AI outfit advisor for real life"; keywords field: weather, fashion, outfit, style, wardrobe, clothing, AI, daily, look, occasion. Keyword field is comma-separated, no spaces after commas, 100-char limit.
- [x] **Settings screen** — gear icon in YouScreen rank hero → dark modal with: DATA (clear history, reset all data with confirmation Alert), ANALYTICS toggle, ABOUT (version, privacy policy link, attributions) ✅ 2026/05/11

### After archive is uploaded

- [ ] Add internal testers to TestFlight (up to 100 without review)
- [ ] Set a beta feedback email in App Store Connect
- [ ] Monitor Sentry dashboard for first-session crashes

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

## Phase 1 — App Store Infrastructure ✅

- [x] **Backend proxy for Claude API** — Cloudflare Worker deployed, `EXPO_PUBLIC_PROXY_URL` set ✅ 2026/05/11
- [x] **Rate limiting on the proxy** — KV-based, 20 req/hr per IP ✅ 2026/05/11
- [x] **Bundle identifier** — `com.melaniesigrid.outfitoracle` ✅ 2026/05/11
- [x] **App icon** — 1024×1024 wired in `app.json` ✅ 2026/05/11
- [x] **Splash screen** — cream background, scarlet wordmark, `expo-splash-screen` ✅ 2026/05/11
- [x] **Privacy policy document** — `PRIVACY_POLICY.md` covering all third-party services ✅ 2026/05/11
- [x] **Crash reporting** — Sentry installed, `Sentry.wrap(App)`, no-ops without DSN ✅ 2026/05/11

---

## Phase 2 — Growth Engine

> Features that make the app shareable, sticky, and reviewable. Ship before monetising.

### Virality
- [x] **Share card** — editorial portrait card with masthead, vibe, weather, top 3 outfits ✅ 2026/05/11
- [ ] **"Rate my outfit day"** — time-delayed local notification fired 8 hours after a consult ("Did the Oracle get it right?"); 1–5 star tap-to-rate sheet; rating stored in history entry; feeds Oracle Accuracy score; shown as a star indicator in Oracle Archives in YouScreen
- [x] **First-consult magic moment** — full-screen dark overlay on first-ever result: Oracle logo + city + vibe. 700ms fade-in, 2.8s hold, 500ms fade-out. Tap to skip. One-time only (`@outfit_oracle_magic_shown`). ✅ 2026/05/14
- [ ] **App Clip** — a shareable link (`outfitoracle.app/clip?city=Paris`) renders a lightweight clip showing today's verdict for any city; non-users can try the Oracle without installing; drives conversion. Requires a domain and Clip target in Xcode.

### Retention
- [x] **Outfit history** — 20-entry cap, 5-min dedup, tap-to-reconsult ✅ 2026/05/11
- [x] **Last result cache** — 12hr TTL, city pre-filled, one-tap refresh ✅ 2026/05/11
- [x] **Analytics** — PostHog HTTP API, tracks 7 events, no-op if key not set ✅ 2026/05/11
- [ ] **Daily push notification** — opt-in prompt shown after first consult; user sets preferred time; notification body: "{city}, {temp}° — the Oracle has a verdict for you"; deep-links directly into Oracle tab with city pre-filled; uses `expo-notifications`. Schedule notification at opt-in time; reschedule daily on app open if user hasn't consulted yet that day.
- [x] **Offline graceful state** — network errors restore cache from AsyncStorage (skips TTL when offline); badge shows "OFFLINE — CACHED · HH:MM" with no refresh button; no-cache path shows "The Oracle requires a connection. Return when the signal is clear." ✅ 2026/05/14
- [ ] **iOS Home Screen Widget** — "Today's Vibe" widget via WidgetKit (requires a native Swift extension target in Xcode; React Native cannot render in widgets); shows current city, temp, condition icon, and vibe word in editorial type; refreshes hourly. Drives daily return better than any notification. *High effort, very high impact.*

### Input Quality
- [x] **GPS auto-detect** — `expo-location`, `reverseGeocodeAsync`, no double-geocode ✅ 2026/05/11
- [x] **City autocomplete** — debounced (300ms), collapses on selection ✅ 2026/05/11
- [x] **Occasion input** — Any / Work / Date / Event / Weekend / Active picker below gender toggle; threads through `useOracle` → `fetchOracleVerdict` → `buildPrompt` in both app and Worker ✅ 2026/05/11

### Content Depth
- [ ] **Item imagery on OutfitCard** — Pexels API (free, 200 req/hr, fashion-quality photography); search with `{category} {simplified descriptor}`; cache per session in a Map keyed by item ID; thumbnail renders in OutfitCard as an 80×80 bordered image beside the item name. API key is non-sensitive (public search) and can live in `.env` as `EXPO_PUBLIC_PEXELS_KEY`. Fetches run in parallel after verdict arrives. *Medium effort, high delight.*
- [x] **Seasonal prompt tuning** — `getSeason(month, lat)` added to both app and Worker `buildPrompt`; hemisphere-aware (southern hemisphere shifts by 6 months); "Season: Spring/Summer/Autumn/Winter" injected into weather context. ✅ 2026/05/14
- [x] **"Oracle of the Week" in TodayScreen** — curated editorial card surfaces this week's strongest saved vibe, falling back to most-consulted vibe when nothing has been saved; no AI call, pure local aggregation from saved looks and `useOutfitHistory`. ✅ 2026/05/15
- [x] **Skeleton loading UI** — shimmer placeholder during fetch ✅ 2026/05/11
- [x] **Expanded TodayScreen** — hourly forecast, 7-day daily, UV index, sun/moon, allergens & AQI ✅ 2026/05/11
- [x] **TodayScreen widget redesign** — all sections refactored into uniform dark bordered Widget cards; Word of the Day widget (60-word curated fashion vocabulary, deterministic per calendar day) shown above weather ✅ 2026/05/11
- [x] **Alternative outfits** — Claude now returns `outfits` (polished) + `outfitsAlt` (casual); POLISHED / CASUAL toggle appears in OracleScreen when both sets are present; old cached verdicts without `outfitsAlt` render normally ✅ 2026/05/11

### Gamification — The Oracle's Court
> Every mechanic stays in the editorial register — no XP bars, no pixel badges. Devotion, rank, pilgrimage.

- [x] **Consult streak** — consecutive-day tracking; milestone banners at 3/7/14/30/100 days ✅ 2026/05/11
- [x] **Oracle Rank** — 5 tiers (Initiate → Oracle's Chosen) based on lifetime consults ✅ 2026/05/11
- [x] **Style Passport** — unique city tally; milestone stamps at 10/25/50 cities ✅ 2026/05/11
- [x] **Achievements** — 127 badges across 15 categories (temperature, precipitation, wind, timing, cities, occasions, saves, streaks, calendar, anniversaries, and "Fashion Mythology" pop culture references); category-grouped display in YouScreen with scarlet category headers; expandable — new badges added without cap ✅ 2026/05/13
- [x] **Weekly editorial challenge** — 16 rotating challenges (rain, cities, occasions, timing, weather conditions); ISO week number picks the active challenge; `useWeeklyChallenge` evaluates against current week's history; `ChallengeCard` shown above the consult CTA in OracleScreen ✅ 2026/05/12
- [ ] **Achievement unlock celebration** — when `useWeatherBadges` returns a newly-earned badge (compare prev count vs current count after each consult), trigger a bottom-sheet toast: badge icon, title, category, and "Achievement unlocked." with a haptic `notificationAsync(Success)`. Currently badges appear silently, which wastes a moment of genuine delight.
- [ ] **Oracle Accuracy score** — powered by "Rate my outfit day" ratings; running percentage shown in YouScreen ("The Oracle has been right 78% of the time"); >80% unlocks "Trusted Oracle" badge; <50% prompts style profile update
- [ ] **Leaderboard** — opt-in, global, ranked by streak + city count; display name derived from city of first consult ("The London Oracle"). **Do not build until DAU > 1,000.** Empty leaderboards are demotivating. Requires Phase 6 (Identity).

---

## Phase 3 — Personalisation

> Without personalisation the Oracle gives the same answer to everyone in the same city. This is the moat.

### Style Profile
- [x] **Oracle Personality** — Diplomat / Editor / Savage; injected into every prompt ✅ 2026/05/11
- [x] **ProfileEditScreen** — name, keywords, budget, voice; accessible from YouScreen ✅ 2026/05/11
- [x] **Temperature sensitivity** — Runs Cold / Normal / Runs Hot 3-way toggle in ProfileEditScreen; shifts layering recommendations in both app and Worker `buildPrompt` ✅ 2026/05/11
- [x] **Colour preferences** — 16-colour swatch grid in ProfileEditScreen; tap-cycle (love → avoid → clear); up to 3 loves + 2 avoids; injected into Claude prompt in both app and Worker ✅ 2026/05/12
- [x] **Mandatory onboarding gate** — `AppNavigator` gates on `profileState.status`; skip button removed; returning skipped users redirected to style step. ✅ 2026/05/13
- [x] **Name collection in onboarding** — optional final step asks "What shall the Oracle call you?", saves to style profile, and renders a personalised greeting in YouScreen rank hero ("Welcome back, Melanie."). ✅ 2026/05/15
- [ ] **Settings sheet** — toggle notifications, clear data, export history

### Wardrobe
- [x] **Saved outfits** — heart icon on each OutfitCard; `useSavedOutfits` hook (AsyncStorage, 50-item cap, dedup); SAVED LOOKS section in YouScreen with unsave tap; key included in Settings clear flows ✅ 2026/05/12
- [x] **"Wear this again"** — after results load, OracleScreen checks saved looks for the same city within ±5°C; shows a scarlet-accented banner when matches found; weather context stored on save via `SavedOutfitWeather` ✅ 2026/05/12
- [ ] **Saved looks filter + sort** — currently SAVED LOOKS renders as a flat reverse-chronological list; add filter chips (by occasion, by city, by category) and a sort toggle (recent vs. most-worn); becomes essential once a user has 20+ saves.
- [ ] **Outfit notes** — after saving a look, allow the user to add a short free-text note ("wore to Sarah's wedding, got three compliments"); rendered as an italic caption under the saved item in YouScreen; passed to Claude as context when "wear this again" is triggered so the Oracle can reference it.
- [ ] **Wardrobe photo upload** *(Phase 3 stretch)* — photograph individual pieces; Claude Vision identifies the item; the Oracle then references "your navy blazer" or "the linen shirt you own" in verdicts. This is the long-term moat — no other weather-to-outfit app does this.

---

## Phase 3.5 — UX & Polish

> Refinements that have outsized impact on perceived quality. Ship these before monetising — they determine whether users trust the product enough to pay.

- [ ] **Achievement unlock toast** — when a badge is newly earned (detect by comparing earned count before vs. after consult), fire a brief animated bottom sheet: badge icon + title + "Achievement unlocked" with `Haptics.notificationAsync(Success)`. Currently badges appear silently. This is a missed delight moment on every unlock.
- [ ] **Mandatory onboarding gate** *(see Launch Checklist — this is the implementation detail)* — `App.tsx` checks `profileCtx.status`; renders `<WelcomeOnboarding />` full-screen when `not-set`; tab navigator only mounts after profile is saved. The onboarding component needs a redesign from its current inline/skippable form: full-bleed dark opening screen, editorial copy, 3 steps max, no skip.
- [ ] **Tab bar badge on Oracle tab** — when a cached result is available and it's over 2 hours old, show a small dot on the Oracle tab icon hinting the Oracle has a fresh take waiting. Subtle urgency without being pushy.
- [ ] **Transition polish** — the switch between POLISHED and CASUAL outfit sets currently re-renders cards with no animation; add a crossfade or slide so the toggle feels intentional.
- [x] **Empty state illustrations** — Oracle Archives, Saved Looks, and the Map now show editorial first-run states instead of blank surfaces. ✅ 2026/05/15
- [ ] **Keyboard avoidance on Oracle tab** — on smaller devices (iPhone SE), the city input can be obscured by the keyboard; verify `KeyboardAvoidingView` behaviour with `behavior="padding"` is consistent across all supported device sizes.
- [x] **Haptic on save** — `OutfitCard` now fires `impactAsync(Medium)` when saving and keeps `selectionAsync` for unsaving. ✅ 2026/05/15
- [x] **Three-theme system** — Classic (IBM Plex Mono, broad scarlet), Editorial Light (Space Mono, one scarlet per screen, cream bg), Editorial Dark (Space Mono, warm near-black palette); `ThemeContext` + `useTheme` hook; persisted to AsyncStorage; picker in SettingsScreen; full makeStyles refactor across all 26 theme-importing files; TodayScreen scroll bg themes to cream/dark per mode ✅ 2026/05/14
- [x] **Y2K theme** — digital zine / fashion club aesthetic; lavender + hot pink + deep purple + cream palette; Syne ExtraBold display + Cormorant Italic serif + IBM Plex Mono; Y2KOracleScreen with double-border Y2KCard system, Y2KDecreeCard (44px headline, scarlet rating pip bar, oracle signature), Y2KWeatherCard (80px temp hero, file-label headers), Y2KOutfitCard, Y2KAvoidSection, Y2KBadge, Y2KSticker, Y2KSignature components; OracleScreen routes to Y2KOracleScreen via isY2KTheme(); 61/61 tests pass ✅ 2026/05/14
- [x] **Achievement unlock toast** — dark editorial bottom-sheet slide-up with badge icon, title, desc, and `Haptics.notificationAsync(Success)`; auto-dismisses after 3.5s; badge detection moves to AppContext so toast fires from any tab ✅ 2026/05/14
- [ ] **`AppIcons` type — icon-set extensibility** — introduce an `icons` token object in the theme type (`AppIcons`); components reference `icons.settings` instead of hardcoded `"cog-outline"`; enables per-theme icon library swapping (MCi → Feather → Ionicons). Requires also decoupling weather condition icons from MCi-specific names in the weather service (return semantic name like `"partly-cloudy"`, map per theme). See `DESIGN.md → Theme Extensibility Guide`. *Prerequisite for custom themes.*
- [ ] **Custom theme (beyond the three)** — design and ship one new theme from the future-themes list in DESIGN.md; Brutalist or Archive are the strongest candidates. Requires `AppIcons` type and at least one new font family. Full checklist in DESIGN.md.

---

## Phase 3.8 — Business Infrastructure *(do before Phase 4)*

> Non-negotiable groundwork. Affiliate networks check domain age, professional email, and brand presence before approving applications. Set this up while the app is in TestFlight — it takes 2–4 weeks to get approved by networks.

### Domain & Email (Week 1 of Phase 3.8)
- [ ] **Register outfitoracle.app** — Namecheap or Google Domains (~$15/yr). If already done in the TestFlight checklist, verify DNS is resolving correctly.
- [ ] **Set up Google Workspace** — Business Starter ($6/user/month). Creates `@outfitoracle.app` email with Google Drive for contracts and a professional presence for brand outreach.
- [ ] **Create `hello@outfitoracle.app`** — primary address; use for affiliate applications, all brand correspondence, and App Store contact email. Never use personal Gmail for business accounts.
- [ ] **Create `partnerships@outfitoracle.app`** — for brand deals, PR pitches, and collaboration inquiries.
- [ ] **Create `affiliate@outfitoracle.app`** — dedicated address for affiliate network applications and approval emails. Keeps approval correspondence separate and searchable.
- [ ] **Create `support@outfitoracle.app`** — for user support and App Store review responses.
- [ ] **Create a dedicated browser profile** — separate Chrome/Firefox profile logged into all OutfitOracle business accounts. Never log into affiliate dashboards or product APIs from a personal browsing profile — account history biases recommendation outputs.
- [ ] **Create a password vault** — 1Password or Bitwarden, OutfitOracle business vault only. Store every API key, affiliate credential, and network login here.

### Affiliate Network Applications (Week 1–2 of Phase 3.8)
Apply in this order — lowest approval friction first. Use `affiliate@outfitoracle.app` for all applications.

- [ ] **Apply to ShareASale** — broadest fashion/beauty catalog; fast approval; good for initial product inventory. Apply at `shareasale.com/info/merchant.cfm`. Category: Fashion & Clothing.
- [ ] **Apply to Commission Junction (CJ)** — Revolve, Madewell, Gap; easy onboarding; solid reporting API. Apply at `cj.com`. Category: Apparel.
- [ ] **Apply to Impact** — used by Reformation, Allbirds, Quay; modern tracking; best API for automated link generation. Apply at `impact.com`.
- [ ] **Apply to Rakuten Advertising** — Net-a-Porter, Nordstrom, SSENSE, Saks; premium brands; requires some traffic to approve. Apply at `rakutenadvertising.com`.
- [ ] **Apply to Awin** (after launch) — European brand coverage: ASOS, & Other Stories, Weekday, Monki. Apply at `awin.com`. Requires a deposit (~$5 refundable) that confirms legitimate publisher status.
- [ ] **Apply to LTK (LikeToKnowIt)** (after 1k+ MAU) — fashion-native; commission is excellent (5–20%); approval requires demonstrating an audience. Apply at `liketoknow.it/creators`.
- [ ] **Create Amazon Associates account** — use `affiliate@outfitoracle.app` and a business Amazon account; NEVER link to personal Amazon account (purchase history pollutes product recommendations). Tag: `outfitoracle-20`. Apply at `affiliate-program.amazon.com`.

### API Hygiene (Week 2 of Phase 3.8)
- [ ] **Set up `.env` structure** — create `.env.development`, `.env.staging`, `.env.production` with separate affiliate and product API keys per environment. Template in `AFFILIATE_STRATEGY.md § Technical Implementation`.
- [ ] **Create neutral test user profiles** — three fictional personas for staging tests (e.g., "minimalist, London, 12°C, work" / "Y2K, New York, 28°C, weekend" / "editorial dark, Paris, 5°C, evening"). Never test product APIs using real location or personal style preferences — personalization algorithms will corrupt the neutral recommendation baseline.
- [ ] **Verify `.env` files are in `.gitignore`** — all affiliate API keys must never be committed. Run `git ls-files | grep .env` to confirm nothing is tracked.
- [ ] **Add affiliate disclosure screen** — in-app page accessible from Settings and linked inline on any screen with affiliate product cards. Copy in `AFFILIATE_STRATEGY.md § Affiliate Disclosure UX`.

---

## Phase 4 — Monetisation

> Only introduce monetisation after Phase 2 is shipped and retention metrics confirm D7 > 30%. Charging too early kills growth. Phase 3.8 business infrastructure should be complete before any Phase 4 work begins.

### Oracle Pro — Subscription ($4.99/month or $34.99/year)
- [ ] **Paywall design** — editorial, non-aggressive; shown after 3 free consults/day; 7-day free trial standard
- [ ] **Free tier** — 3 consults/day, basic outfit set, Google Shopping links
- [ ] **Pro tier** — unlimited consults, alternative outfit sets (polished/casual), full history, wardrobe saves, daily notifications, Home Screen Widget, priority response (higher Claude token budget)
- [ ] **Restore purchases** — required by Apple; RevenueCat handles this automatically
- [ ] **RevenueCat integration** — handles receipt validation, restoration, and A/B testing; simpler than raw `expo-in-app-purchases`

### Affiliate Revenue — Phase 4a: Foundation *(manual links, no API)*

> Goal: affiliate-ready infrastructure with hand-curated links. Validates the UX and disclosure flow before investing in product API integration.

- [ ] **`AffiliateProduct` TypeScript interface** — full data model with `id`, `productName`, `brand`, `retailer`, `category`, `affiliateUrl`, `price`, `budgetTier`, `occasionTags`, `weatherTags`, `aestheticTags`, `availability`, `oracleApprovalLevel`, `disclosureRequired`, `isSponsored`, `lastCheckedAt`. Full schema in `AFFILIATE_STRATEGY.md § Product Data Model`.
- [ ] **`AffiliateProductCard` component** — editorial card with product image, brand, name, price, Oracle approval note, and `↗ Affiliate link` disclosure micro-copy. Full implementation in `AFFILIATE_STRATEGY.md § Technical Implementation`.
- [ ] **`AffiliateRedirectHandler`** — `openAffiliateLink(product)` logs click event (product ID + category, no PII) via PostHog then opens affiliate URL via `Linking.openURL`. Outbound link modal shown before navigating away ("You're leaving Outfit Oracle").
- [ ] **Manual product catalog (JSON)** — 15–20 hand-curated products organized by `weatherTags`, `occasionTags`, `aestheticTags`, and `budgetTier`. Covers at minimum: cold outerwear, warm-weather tops, rain footwear, work bottom, evening accessories. Use ShareASale or CJ links.
- [ ] **`ShopTheLookSection` component** — collapsible section on TodayScreen below the verdict; horizontally scrollable rail of 3 `AffiliateProductCard` items matched to current weather + occasion. Feature-flagged: `EXPO_PUBLIC_AFFILIATE_ENABLED=false` until QA-complete.
- [ ] **Outfit item tap-to-shop** — each row in the outfit list gets a subtle `↗` tap target. Opens `AffiliateProductSheet` (bottom modal) with the matched product card and a "Shop at [Retailer]" CTA. Falls back to Google Shopping if no affiliate match exists.
- [ ] **Affiliate disclosure in Settings** — link to full disclosure page. Copy: *"Some links may earn Outfit Oracle a commission. The verdict remains judgmental and independent."*
- [ ] **PostHog affiliate events** — add `affiliate_card_viewed`, `affiliate_link_tapped`, `affiliate_modal_dismissed`, `affiliate_outbound_confirmed` to analytics service.
- [ ] **Enable affiliate section in production** — flip `EXPO_PUBLIC_AFFILIATE_ENABLED=true` after internal QA confirms UX is clean, disclosure is visible, and no affiliate URL is logged in plain text.

### Affiliate Revenue — Phase 4b: Tracking & Enrichment

> Goal: reliable click attribution, organized product taxonomy, environment separation.

- [ ] **Product tagging taxonomy** — finalize and document all valid values for `weatherTags`, `occasionTags`, `aestheticTags`, `seasonTags`, `budgetTier`. Consistency here determines matching quality.
- [ ] **Availability validation** — add `lastCheckedAt` staleness check; suppress products where `lastCheckedAt` is >24 hours old until refreshed. Out-of-stock links are the fastest way to erode trust.
- [ ] **"The Oracle approves" editorial badge** — `oracleApprovalLevel` renders as a styled label on cards: `approved` → "The Oracle approves.", `conditional` → "Conditionally acceptable.", `emergency-option` → "The Oracle considers this acceptable given the circumstances."
- [ ] **Price tier matching** — `matchProducts()` filters by `budgetTier` against user's style profile; allows one tier above for aspirational upsell, labeled "The Oracle also recommends, if the budget allows."
- [ ] **Seasonal expiry** — add `expiresAt` to products; winter coats expire May 1, linen shirts expire October 1. Prevents embarrassing weather-mismatched recommendations.
- [ ] **Day + evening image alignment** *(after image generation ships)* — when the oracle returns `outfits` (day) and `outfitsAlt` (evening), surface separate product rails under each. Evening rail should prioritise elevated pieces.
- [ ] **Affiliate revenue estimate tracking** — PostHog dashboard: click volume by category, weather condition, occasion, aesthetic tag, and budget tier. Track estimated commission (clicks × average conversion rate × average order value × commission rate). This informs which categories to expand first.

### Affiliate Revenue — Phase 4c: Dynamic Product Matching *(requires product API)*

> Goal: automated product matching with live inventory. No more manual catalog updates.

- [ ] **Integrate ShareASale Product API or Rakuten Product API** — fetch products by category + keyword; cache results per session; filter by availability and price range.
- [ ] **`matchProducts()` service** — full implementation: filter by `weatherTags` ∩ weather conditions, `occasionTags` ∩ occasion, `aestheticTags` ∩ style profile, `budgetTier`, gender, availability, and `expiresAt`. Rank by `oracleApprovalLevel` then aesthetic affinity score. Commission rate is stored for analytics only — **never used for ranking**. Full implementation in `AFFILIATE_STRATEGY.md § Technical Implementation`.
- [ ] **Product image CDN** — resize and serve product images at correct dimensions (160×213px for rail cards, 220×293px for featured cards) to avoid layout shift and slow load times.
- [ ] **Product carousel component** — swipeable 6-card full-width carousel for "Shop the look" section. Each card: brand, product name, price, Oracle approval label, and affiliate tap target.
- [ ] **Weather-specific emergency recommendation trigger** — when extreme weather is detected (temp < −10°C, temp > 35°C, heavy rain), surface an editorial callout above the verdict: *"It is −14°C in Montreal. The Oracle has identified exactly one acceptable coat."* with 1–2 targeted affiliate products.
- [ ] **Seasonal recommendations section** — on TodayScreen during seasonal transitions (±2 weeks of equinox/solstice), surface a seasonal callout: *"The Oracle notes that autumn is here and your wardrobe is not ready."* Feeds a category-specific product rail.
- [ ] **Availability refresh job** — background task runs every 24 hours; checks availability on active products; marks stale or out-of-stock items; removes them from active recommendation pool until refreshed.

### Affiliate Revenue — Phase 4d: Optimization *(post-launch, data-driven)*

> Goal: revenue optimization without compromising editorial standards or user trust.

- [ ] **A/B test product card layouts** — image-first vs. brand-first vs. Oracle-note-first. Measure: tap rate, outbound confirmation rate, return rate.
- [ ] **Revenue attribution by segment** — analyze commission performance by: weather condition, city tier, occasion, aesthetic tag, budget tier, and time of day. Double down on highest-converting segments.
- [ ] **Direct brand outreach** — once app has 1k+ MAU, email `partnerships@outfitoracle.app` pitches to: Reformation, COS, Arket, Madewell, Mejuri, Senso. Target brands whose aesthetic already matches Oracle recommendations — the pitch is product-market fit, not ad inventory.
- [ ] **Affiliate link quarterly audit** — check for dead links, availability drift, commission rate changes, and retailer policy updates. Run before each seasonal transition.
- [ ] **Expand affiliate catalog to 3+ networks, 50+ retailers** — prioritize European coverage (Awin), luxury tier (FARFETCH Partner Program), and resale (The RealReal, Vestiaire) for sustainability-forward positioning.

### Brand Partnerships *(post-scale, 5k+ MAU)*
- [ ] **Sponsored "Oracle's Pick"** — a clearly labelled `isSponsored: true` card in the outfit rail; disclosed as "Featured"; sold directly to brands via `partnerships@outfitoracle.app` or via a fashion ad network. Never replaces organic affiliate cards — appears as an additional slot.
- [ ] **City-based editorial drops** — brand-funded, city-specific content (*"This week in Milan: the Oracle recommends..."*) surfaced at the top of the Today tab; sold as a seasonal sponsorship package.
- [ ] **Oracle x Brand co-editorial** — the Oracle writes a weather+city-specific editorial in a brand's voice for their owned channels; Outfit Oracle earns a flat fee + affiliate commission on referenced products. Differentiator: no other styling app has an AI voice distinctive enough to co-author editorial content.

---

## Phase 5 — Platform Expansion

> After product-market fit is confirmed on iOS.

- [ ] **Android parity audit** — fonts, icons, haptics, keyboard behaviour all differ on Android; full QA pass required
- [ ] **iPad / tablet layout** — two-column split (input + weather left, results right); `app.json` has `supportsTablet: false`
- [ ] **Apple Watch complication** — today's temp + condition icon on watch face; tap opens iPhone app. Requires a WatchKit extension target.
- [ ] **Siri Shortcut** — "Hey Siri, ask the Oracle for [city]"; runs a background consult and reads back the vibe and top 3 picks
- [ ] **Web version** — `expo start --web` works but is unstyled; a proper web build opens SEO and desktop users
- [ ] **B2B API** — fashion trend data aggregated by city + weather condition; sell access to brands for inventory and marketing decisions
- [ ] **Waitlist / referral page** — launch before Android; referral rewards unlock Pro features early

---

## Phase 6 — Identity & Cloud Sync

> Without identity, every user is anonymous and all their data lives on one device. Identity unlocks cross-device continuity, social features, cloud backup, and eventually personalised model fine-tuning.  
> **Do not build until after TestFlight beta confirms retention — identity is infrastructure, not a feature.**

### Authentication
- [ ] **Sign in with Apple** — required by Apple if any social login is offered; `expo-apple-authentication`; most frictionless for iOS users; no email required
- [ ] **Email / password** — fallback for non-Apple users; handled by Supabase Auth or Firebase Authentication; password reset flow required
- [ ] **Guest → account upgrade** — anonymous sessions with local data must seamlessly migrate to an authenticated account on sign-up (merge history, profile, saved outfits); losing data on sign-up is a conversion killer
- [ ] **Auth gate** — sign-in wall is shown only when a cloud feature is triggered (leaderboard, cross-device sync), never at cold launch; anonymous use stays fully functional

### Cloud Sync (requires Auth)
- [ ] **Profile sync** — style profile (keywords, budget, personality, temp sensitivity, colour prefs) synced to user record; survives device change
- [ ] **History sync** — outfit history and saved looks backed up; accessible on any device; conflict resolution: server wins on merge (last-write)
- [ ] **Streak sync** — consult streak is currently device-local; losing a device resets it. Store streak + last consult date in user record
- [ ] **Backend** — Supabase recommended (Postgres + Auth + Realtime + Storage in one hosted service, generous free tier); Firebase is viable but vendor lock-in is higher. Either integrates well with Expo via REST or JS SDK

### Social & Identity Features (requires Auth)
- [ ] **Display name** — chosen at sign-up (or derived from city of first consult: "The London Oracle"); shown in leaderboard and share cards
- [ ] **Friend sharing** — send a consult result directly to a friend in-app; requires knowing their username or sharing a link; drives word-of-mouth
- [ ] **Leaderboard** — move here from Phase 2 Gamification; requires stable identity to prevent manipulation. See Phase 2 note: do not build until DAU > 1,000
- [ ] **Oracle Accuracy crowdsourcing** — aggregate anonymised accuracy ratings across users to surface which occasion × weather combos the Oracle nails vs. misses; feed this back into prompt tuning

### Privacy & Compliance (required for any cloud storage of personal data)
- [ ] **GDPR / CCPA delete-my-data flow** — authenticated users must be able to request full account deletion including all cloud records; required for EU App Store distribution
- [ ] **Data export** — download full history + profile as JSON; Apple requires this for apps with user accounts
- [ ] **Server-side rate limiting per user** — replace IP-based rate limiting on the Cloudflare Worker with user-ID-based limits once auth exists; prevents VPN abuse

---

## Recently Completed

- [x] **Expo SDK 54 upgrade for Expo Go** — upgraded Expo to `~54.0.0`, React to `19.1.0`, React Native to `0.81.5`, aligned Expo modules with `npx expo install --fix`, removed stale `@types/react-native`, added `npm run go`, and fixed the React 19 `useRef` type issue in `Confetti`. ✅ 2026/05/15
- [x] **Seven-theme system** — Classic / Editorial Light / Editorial Dark / Terra Firma (terracotta) / Morning Paper (sage, Syne display) / Golden Hour (amber-gold) / Electric (TREVO-inspired vivid cobalt + hot-pink, Syne_800ExtraBold display); each with distinct palette, fonts, `isWarmTheme`/`isBannerTheme` TodayScreen flags; Electric is `isDark: true`, cobalt throughout (`#1E2DFF` scrollable content, `#0A15CC` header); all 7 wired in `ThemeName` union, `THEMES` record, SettingsScreen picker ✅ 2026/05/14
- [x] **DESIGN.md full rewrite** — comprehensive 7-theme design system doc; complete token specs per theme, scarlet token semantics, Syne font role table, `isWarmTheme`/`isBannerTheme` flag logic, motion spec, decisions log ✅ 2026/05/14
- [x] **Allergen widget icons** — bee (AQI), grass (grass pollen), leaf-maple (birch), flower-pollen (ragweed) added to TodayScreen pollen widget; `graphPad` style added ✅ 2026/05/14
- [x] **useFocusEffect flicker fix** — TodayScreen hero opacity animation wrapped in `useCallback([heroOpacity, heroY])`; prevents re-fire on parent re-render (e.g., badge toast); fixes flash under achievements section ✅ 2026/05/14
- [x] **Three-theme system** — Classic (IBM Plex Mono, broad scarlet), Editorial Light (Space Mono, strict one-scarlet-per-screen, cream bg), Editorial Dark (Space Mono, warm near-black palette); `ThemeContext` + `useTheme`; persisted at `@outfit_oracle_theme`; ORACLE THEME picker in SettingsScreen; makeStyles pattern across all 26 theme-importing files; TodayScreen scroll background themes to cream (light) or warm near-black (dark) ✅ 2026/05/14
- [x] **Founding Member badge** — first 100 unique devices earn a scarlet "FOUNDING MEMBER" chip in YouScreen; server-controlled via KV; LLM trust boundary enforced (`delete verdict.foundingMember` before KV logic); X-Device-ID UUID validation + identifier requirement added to Worker; KV reads parallelized ✅ 2026/05/13
- [x] **Analytics opt-out enforcement** — Settings "Usage analytics" now persists to `@outfit_oracle_analytics_enabled`; `analytics.ts` reads the preference before generating a device ID or sending PostHog events; full reset clears the key; analytics tests cover default enabled, explicit opt-out, persistence, and no-network-call behavior ✅ 2026/05/14
- [x] **Test suite (ts-jest)** — 43 tests across 4 suites covering oracle type shapes, analytics events, weather badge exports, and proxy routing; compatible with Node 23 via ts-jest (jest-expo incompatible with Node 23) ✅ 2026/05/13
- [x] **Mandatory onboarding gate** — skip button removed from StyleOnboarding; AppNavigator gates tab navigator on profileState.status; returning skipped users redirected to style step on next launch ✅ 2026/05/13
- [x] **Achievement categories + Fashion Mythology** — 127 achievements across 15 named categories; 27 new pop culture badges (Carrie Bradshaw, Miranda Priestly, Euphoria, Succession, Bridgerton, etc.); YouScreen now groups earned achievements by category with scarlet headers; locked badges shown as a collapsed count at the bottom ✅ 2026/05/13
- [x] **Colour preferences** — 16-colour swatch grid in ProfileEditScreen; tap-cycle (love → avoid → clear); injected into Claude prompt in both app and Worker ✅ 2026/05/12
- [x] **Saved outfits** — `useSavedOutfits` hook; heart icon on OutfitCard; SAVED LOOKS in YouScreen; settings clear flow ✅ 2026/05/12
- [x] **Accessories split fix** — `splitItems()` splits comma/and-separated accessories into individual Google Shopping links ✅ 2026/05/12
- [x] **Orchestrator-Workers engine** — `src/files/orchestrator.py`; Phase 1 (orchestrator LLM selects 2–4 outfit lenses), Phase 2 (worker LLMs generate per-lens outfit sets); saves JSON + Markdown to `src/files/results/` ✅ 2026/05/12
- [x] **Multi-screen UX redesign** — 3-tab navigation (Today / Oracle / You); welcome flow; `AppDataProvider` context; `ProfileEditScreen`; `YouScreen` ✅ 2026/05/11
- [x] **Gamification suite** — consult streak, Oracle Rank, Style Passport, 16 weather badges ✅ 2026/05/11
- [x] **Style profile onboarding** — 2-step flow, skippable, persisted, passed to Claude ✅ 2026/05/11
- [x] **Outfit history + last result cache** — `useOutfitHistory`, tap-to-reconsult, 12hr TTL ✅ 2026/05/11
- [x] **Expanded TodayScreen** — hourly forecast, 7-day daily, UV, sun/moon, allergens ✅ 2026/05/11
- [x] **Weather service expansion** — pollen/AQI (Open-Meteo Air Quality API), moon phase calculation, parallel fetches ✅ 2026/05/11
- [x] **Style Passport world map** — `MapScreen` with Apple Maps (mutedStandard); scarlet markers for visited cities with visit-count badge; 5 fashion capital inspiration markers (Paris/Milan/NY/London/Tokyo) that hide once visited; tap-to-select city detail card (name, country, last vibe, temp, condition, date); passport stats panel (city count, milestone countdown, earned stamps); `lat/lon` added to `WeatherData`; entry via "VIEW ON MAP" in YouScreen ✅ 2026/05/11
- [x] **City autocomplete alignment fix** — `CitySuggestions` now respects screen horizontal margins ✅ 2026/05/11
- [x] **BEST_PRACTICES.md** — commit conventions, TypeScript rules, RN/Expo constraints documented ✅ 2026/05/11
- [x] **Engineering audit + 9 bug fixes** ✅ 2026/05/11
- [x] **Cloudflare Worker proxy + rate limiting** ✅ 2026/05/11
- [x] **App identity** — bundle ID, icon, splash, privacy policy ✅ 2026/05/11
- [x] **Analytics + crash reporting** — PostHog (HTTP), Sentry (installed, needs DSN) ✅ 2026/05/11
- [x] **Share card** — `react-native-view-shot` + native Share sheet ✅ 2026/05/11
- [x] **GPS auto-detect + city autocomplete** ✅ 2026/05/11
