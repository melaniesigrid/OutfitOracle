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
| 9 | 2026/05/11 | All remaining 8–9px informational labels | Bumped to 10px across all components |
| 10 | 2026/05/11 | City suggestions appeared flush left | Added `marginHorizontal: spacing.lg` to `CitySuggestions` container |
| 11 | 2026/05/12 | Accessories Google Shopping searched all items as one query | `splitItems()` splits on `,` and `and`; renders one Pressable per piece |

---

## TestFlight Beta — Launch Checklist 🚀

> These are the **only** remaining tasks before uploading to App Store Connect for internal beta testing. They can be completed in a single focused session.

### Must-do before archive

- [x] **Rotate the Anthropic API key** — new key generated; old key removed from `.env`; Cloudflare Worker secret updated via `wrangler secret put ANTHROPIC_API_KEY`. ✅ 2026/05/12
- [-] **Host the privacy policy** — `docs/index.html` created, ready for GitHub Pages. **Action required: go to github.com → repo Settings → Pages → Source → Deploy from branch → main → /docs → Save.** URL will be `https://melaniesigrid.github.io/OutfitOracle/`. 🏗️ 2026/05/12
- [-] **Configure Sentry DSN** — Sentry is initialized in `App.tsx` (`Sentry.init` + `Sentry.wrap`). **Action required: create a project at sentry.io → copy the DSN → paste into `EXPO_PUBLIC_SENTRY_DSN` in `.env` → rebuild.** 🏗️ 2026/05/12
- [x] **Add PrivacyInfo.xcprivacy** — file created at `ios/OutfitOracle/PrivacyInfo.xcprivacy` with all four standard RN Required Reasons API entries. **Must be dragged into Xcode project navigator** (File → Add Files) before archiving — the file exists on disk but is not yet referenced in the `.xcodeproj`. ✅ 2026/05/11
- [x] **Mandatory profile onboarding gate** — `AppNavigator` now gates on `profileCtx.profileState.status`; skippable inline flow replaced with mandatory full-screen onboarding; returning users who previously skipped are redirected to the style step. ✅ 2026/05/13

### Nice-to-have before archive

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
- [ ] **First-consult magic moment** — after mandatory onboarding completes and the user runs their very first consult, show a brief full-screen brand moment before revealing results: Oracle wordmark + an editorial line referencing their city + first keyword. One-time only, never shown again. Sets the emotional hook before they've seen a single outfit card.
- [ ] **App Clip** — a shareable link (`outfitoracle.app/clip?city=Paris`) renders a lightweight clip showing today's verdict for any city; non-users can try the Oracle without installing; drives conversion. Requires a domain and Clip target in Xcode.

### Retention
- [x] **Outfit history** — 20-entry cap, 5-min dedup, tap-to-reconsult ✅ 2026/05/11
- [x] **Last result cache** — 12hr TTL, city pre-filled, one-tap refresh ✅ 2026/05/11
- [x] **Analytics** — PostHog HTTP API, tracks 7 events, no-op if key not set ✅ 2026/05/11
- [ ] **Daily push notification** — opt-in prompt shown after first consult; user sets preferred time; notification body: "{city}, {temp}° — the Oracle has a verdict for you"; deep-links directly into Oracle tab with city pre-filled; uses `expo-notifications`. Schedule notification at opt-in time; reschedule daily on app open if user hasn't consulted yet that day.
- [ ] **Offline graceful state** — when network is unavailable, show the last cached result with a subtle "CACHED" label and the timestamp; clear error messaging if no cache exists ("The Oracle requires a connection. Return when the signal is clear."); currently a network error just shows the generic error state.
- [ ] **iOS Home Screen Widget** — "Today's Vibe" widget via WidgetKit (requires a native Swift extension target in Xcode; React Native cannot render in widgets); shows current city, temp, condition icon, and vibe word in editorial type; refreshes hourly. Drives daily return better than any notification. *High effort, very high impact.*

### Input Quality
- [x] **GPS auto-detect** — `expo-location`, `reverseGeocodeAsync`, no double-geocode ✅ 2026/05/11
- [x] **City autocomplete** — debounced (300ms), collapses on selection ✅ 2026/05/11
- [x] **Occasion input** — Any / Work / Date / Event / Weekend / Active picker below gender toggle; threads through `useOracle` → `fetchOracleVerdict` → `buildPrompt` in both app and Worker ✅ 2026/05/11

### Content Depth
- [ ] **Item imagery on OutfitCard** — Pexels API (free, 200 req/hr, fashion-quality photography); search with `{category} {simplified descriptor}`; cache per session in a Map keyed by item ID; thumbnail renders in OutfitCard as an 80×80 bordered image beside the item name. API key is non-sensitive (public search) and can live in `.env` as `EXPO_PUBLIC_PEXELS_KEY`. Fetches run in parallel after verdict arrives. *Medium effort, high delight.*
- [ ] **Seasonal prompt tuning** — Claude's prompt currently adapts to weather condition but not season. Add a `season` field derived from hemisphere + month to `buildPrompt`; Claude reference seasonality in vibe copy ("Spring's first warm day calls for..."). Minimal code change, noticeable editorial quality lift.
- [ ] **"Oracle of the Week" in TodayScreen** — a curated editorial card surfacing the most-saved vibe from the current week across the user's own history; no AI call, pure aggregation from `useOutfitHistory`. Gives the Today tab a reason to be opened even without consulting.
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
- [ ] **Name collection in onboarding** — add an optional name field ("What shall the Oracle call you?") as a final step before entering the app; renders a personalised greeting in YouScreen rank hero ("Welcome back, Melanie.")
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
- [ ] **Empty state illustrations** — Oracle Archives, Saved Looks, and the Map are blank on first launch; replace with editorial one-liners ("The Oracle awaits your first inquiry." / "No looks saved. The wardrobe is a blank canvas.") in Cormorant Garamond italic. Currently shows nothing, which reads as broken.
- [ ] **Keyboard avoidance on Oracle tab** — on smaller devices (iPhone SE), the city input can be obscured by the keyboard; verify `KeyboardAvoidingView` behaviour with `behavior="padding"` is consistent across all supported device sizes.
- [ ] **Haptic on save** — `OutfitCard` heart fires `selectionAsync` on toggle; upgrade the save action to `impactAsync(Medium)` to make saving feel more satisfying than unsaving.
- [x] **Three-theme system** — Classic (IBM Plex Mono, broad scarlet), Editorial Light (Space Mono, one scarlet per screen, cream bg), Editorial Dark (Space Mono, warm near-black palette); `ThemeContext` + `useTheme` hook; persisted to AsyncStorage; picker in SettingsScreen; full makeStyles refactor across all 26 theme-importing files; TodayScreen scroll bg themes to cream/dark per mode ✅ 2026/05/14

---

## Phase 4 — Monetisation

> Only introduce monetisation after Phase 2 is shipped and retention metrics confirm D7 > 30%. Charging too early kills growth.

### Oracle Pro — Subscription ($4.99/month or $34.99/year)
- [ ] **Paywall design** — editorial, non-aggressive; shown after 3 free consults/day; 7-day free trial standard
- [ ] **Free tier** — 3 consults/day, basic outfit set, Google Shopping links
- [ ] **Pro tier** — unlimited consults, alternative outfit sets (polished/casual), full history, wardrobe saves, daily notifications, Home Screen Widget, priority response (higher Claude token budget)
- [ ] **Restore purchases** — required by Apple; RevenueCat handles this automatically
- [ ] **RevenueCat integration** — handles receipt validation, restoration, and A/B testing; simpler than raw `expo-in-app-purchases`

### Affiliate Revenue
- [ ] **Retailer-specific links** — replace Google Shopping URLs with ASOS, Nordstrom, or Farfetch affiliate links; 4–8% commission per purchase; highest revenue per user
- [ ] **"Shop the full look" button** — one tap opens a curated page with all outfit items pre-searched; better conversion than individual item links
- [ ] **Price tier filtering** — surface items matching the user's budget tier from their style profile

### Brand Partnerships *(post-scale)*
- [ ] **Sponsored "Oracle's Pick"** — a 6th card in outfit results, clearly labelled "Presented by [Brand]"; sold directly or via a fashion ad network
- [ ] **City-based editorial drops** — brand-funded, city-specific content ("This week in Milan: the Oracle recommends...") surfaced at the top of the Today tab

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

- [x] **Three-theme system** — Classic (IBM Plex Mono, broad scarlet), Editorial Light (Space Mono, strict one-scarlet-per-screen, cream bg), Editorial Dark (Space Mono, warm near-black palette); `ThemeContext` + `useTheme`; persisted at `@outfit_oracle_theme`; ORACLE THEME picker in SettingsScreen; makeStyles pattern across all 26 theme-importing files; TodayScreen scroll background themes to cream (light) or warm near-black (dark) ✅ 2026/05/14
- [x] **Founding Member badge** — first 100 unique devices earn a scarlet "FOUNDING MEMBER" chip in YouScreen; server-controlled via KV; LLM trust boundary enforced (`delete verdict.foundingMember` before KV logic); X-Device-ID UUID validation + identifier requirement added to Worker; KV reads parallelized ✅ 2026/05/13
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
