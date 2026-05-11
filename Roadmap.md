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

---

## TestFlight Beta — Launch Checklist 🚀

> These are the **only** remaining tasks before uploading to App Store Connect for internal beta testing. They can be completed in a single focused session.

### Must-do before archive

- [ ] **Rotate the Anthropic API key** — generate a new key at console.anthropic.com; update the Cloudflare Worker secret (`wrangler secret put ANTHROPIC_API_KEY`). The old key was exposed in the bundle during early development. This is a security blocker.
- [ ] **Host the privacy policy** — publish `PRIVACY_POLICY.md` as a public web page (GitHub Pages, Notion public page, or a simple HTML file). App Store Connect requires a live URL — a markdown file in a private repo is not accepted.
- [ ] **Configure Sentry** — run `npx @sentry/wizard@latest -s -i reactNative` in the project root; set `SENTRY_DSN` in `.env` and in the Cloudflare Worker. Without this, crashes on beta devices go undetected.

### Nice-to-have before archive

- [ ] **VoiceOver / TalkBack device audit** — all Pressables have labels and roles in code; needs a 15-minute end-to-end test on a real device with VoiceOver enabled. Apple will require this for public release.
- [ ] **App Store Connect record** — create the app listing (name: "Outfit Oracle", category: Lifestyle, age rating: 4+, privacy policy URL from above). Required before you can upload a build.
- [ ] **App Store screenshots** — 6.5" iPhone (1284×2778) and 5.5" iPhone (1242×2208); minimum 3 per device class. Can be captured from the simulator.
- [ ] **Settings sheet** — minimum viable: a way for beta users to clear data and opt out of analytics. Apple reviewers look for data deletion options.

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
- [ ] **"Rate my outfit day"** — time-delayed prompt (local notification) after the user has gone out; 1–5 star rating on Oracle accuracy; shown in history feed; feeds Oracle Accuracy score (see Gamification)
- [ ] **App Clip** — a shareable link (`outfitoracle.app/clip?city=Paris`) renders a lightweight clip showing today's verdict for any city; non-users can try the Oracle without installing; drives conversion. Requires a domain and Clip target in Xcode.

### Retention
- [x] **Outfit history** — 20-entry cap, 5-min dedup, tap-to-reconsult ✅ 2026/05/11
- [x] **Last result cache** — 12hr TTL, city pre-filled, one-tap refresh ✅ 2026/05/11
- [x] **Analytics** — PostHog HTTP API, tracks 7 events, no-op if key not set ✅ 2026/05/11
- [ ] **Daily push notification** — opt-in at first consult; user sets time; fires a morning brief ("London, 12°C, overcast — the Oracle is ready") with deep link to a fresh result; uses `expo-notifications`
- [ ] **iOS Home Screen Widget** — "Today's Vibe" widget via WidgetKit (React Native requires a native extension target); shows current city, temp, condition icon, vibe word in editorial type. Drives daily return better than any notification. *High effort, very high impact.*

### Input Quality
- [x] **GPS auto-detect** — `expo-location`, `reverseGeocodeAsync`, no double-geocode ✅ 2026/05/11
- [x] **City autocomplete** — debounced (300ms), collapses on selection ✅ 2026/05/11
- [ ] **Occasion input** — "I'm dressing for..." (Work, Date, Event, Weekend, Travel) shown below the city input; a single selection completely reshapes the Claude verdict. The single biggest improvement to output quality available. *Low effort, very high impact.*

### Content Depth
- [x] **Skeleton loading UI** — shimmer placeholder during fetch ✅ 2026/05/11
- [x] **Expanded TodayScreen** — hourly forecast, 7-day daily, UV index, sun/moon, allergens & AQI ✅ 2026/05/11
- [ ] **Alternative outfits** — prompt Claude for 2 sets (polished + casual); user swipes between them; doubles perceived value per consult

### Gamification — The Oracle's Court
> Every mechanic stays in the editorial register — no XP bars, no pixel badges. Devotion, rank, pilgrimage.

- [x] **Consult streak** — consecutive-day tracking; milestone banners at 3/7/14/30/100 days ✅ 2026/05/11
- [x] **Oracle Rank** — 5 tiers (Initiate → Oracle's Chosen) based on lifetime consults ✅ 2026/05/11
- [x] **Style Passport** — unique city tally; milestone stamps at 10/25/50 cities ✅ 2026/05/11
- [x] **Weather badges** — 16 badges across temperature, UV, precipitation, timing, travel, anniversary ✅ 2026/05/11
- [ ] **Weekly editorial challenge** — fresh brief every Monday (hardcoded rotating set of 8–10); "Dress for rain in two different cities this week." Completing it adds a limited badge and a share card variant. Shown as a strip in the Oracle tab when active.
- [ ] **Oracle Accuracy score** — powered by "Rate my outfit day" ratings; running percentage shown in YouScreen ("The Oracle has been right 78% of the time"); >80% unlocks "Trusted Oracle" badge; <50% prompts style profile update
- [ ] **Leaderboard** — opt-in, global, ranked by streak + city count; display name derived from city of first consult ("The London Oracle"). **Do not build until DAU > 1,000.** Empty leaderboards are demotivating.

---

## Phase 3 — Personalisation

> Without personalisation the Oracle gives the same answer to everyone in the same city. This is the moat.

### Style Profile
- [x] **3-step onboarding** — keywords (pick-3) + budget tier; skippable; persisted ✅ 2026/05/11
- [x] **Oracle Personality** — Diplomat / Editor / Savage; injected into every prompt ✅ 2026/05/11
- [x] **ProfileEditScreen** — name, keywords, budget, voice; accessible from YouScreen ✅ 2026/05/11
- [ ] **Temperature sensitivity** — "I usually run cold / hot" toggle; shifts the Oracle toward layering or lighter pieces independently of the actual temperature reading. *10-minute build, immediately improves cold-weather advice.*
- [ ] **Colour preferences** — mark 2–3 colours you love and 1–2 you avoid; Claude references these in picks ("avoiding your dislike of yellow")
- [ ] **Settings sheet** — toggle notifications, clear data, export history

### Wardrobe
- [ ] **Saved outfits** — heart icon on each outfit card; stored in AsyncStorage; accessible from a "Saved" tab or YouScreen section
- [ ] **"Wear this again"** — if current weather matches a past consult within ±5°C and same condition type, surface the saved look with one-tap option to re-consult
- [ ] **Wardrobe photo upload** *(Phase 3 stretch)* — photograph individual pieces; Claude Vision identifies the item; the Oracle then references "your navy blazer" or "the linen shirt you own" in verdicts. This is the long-term moat — no other weather-to-outfit app does this.

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

## Recently Completed

- [x] **Multi-screen UX redesign** — 3-tab navigation (Today / Oracle / You); welcome flow; `AppDataProvider` context; `ProfileEditScreen`; `YouScreen` ✅ 2026/05/11
- [x] **Gamification suite** — consult streak, Oracle Rank, Style Passport, 16 weather badges ✅ 2026/05/11
- [x] **Style profile onboarding** — 2-step flow, skippable, persisted, passed to Claude ✅ 2026/05/11
- [x] **Outfit history + last result cache** — `useOutfitHistory`, tap-to-reconsult, 12hr TTL ✅ 2026/05/11
- [x] **Expanded TodayScreen** — hourly forecast, 7-day daily, UV, sun/moon, allergens ✅ 2026/05/11
- [x] **Weather service expansion** — pollen/AQI (Open-Meteo Air Quality API), moon phase calculation, parallel fetches ✅ 2026/05/11
- [x] **City autocomplete alignment fix** — `CitySuggestions` now respects screen horizontal margins ✅ 2026/05/11
- [x] **BEST_PRACTICES.md** — commit conventions, TypeScript rules, RN/Expo constraints documented ✅ 2026/05/11
- [x] **Engineering audit + 9 bug fixes** ✅ 2026/05/11
- [x] **Cloudflare Worker proxy + rate limiting** ✅ 2026/05/11
- [x] **App identity** — bundle ID, icon, splash, privacy policy ✅ 2026/05/11
- [x] **Analytics + crash reporting** — PostHog (HTTP), Sentry (installed, needs DSN) ✅ 2026/05/11
- [x] **Share card** — `react-native-view-shot` + native Share sheet ✅ 2026/05/11
- [x] **GPS auto-detect + city autocomplete** ✅ 2026/05/11
