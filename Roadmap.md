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
- [ ] **App icon** — 1024×1024 PNG in `assets/`; editorial aesthetic (the "O" monogram or an oracle eye motif)
- [ ] **Splash screen** — cream background with wordmark; wire `"splash.image"` in `app.json`
- [ ] **Privacy policy** — required by Apple, Google, and any AI-disclosure rules; must mention Claude/Anthropic and weather data

### Stability
- [ ] **Crash reporting** — `@sentry/react-native` before any external users; without it you're flying blind
- [ ] **VoiceOver / TalkBack audit** — all Pressables have labels and roles; needs end-to-end device test

---

## Phase 2 — Growth Engine

> Features that make the app shareable, sticky, and reviewable. Ship before monetising — users won't pay for something they don't love yet.

### Virality
- [ ] **Share card** — `expo-view-shot` + `expo-sharing`; a portrait image with the editorial masthead, today's vibe, and top 3 outfit items. Designed to be screenshot-worthy and Instagram-ready. This is the single highest-leverage growth feature.
- [ ] **"Rate my outfit day"** — after the user has dressed and gone out, a time-delayed prompt (via local notification at 9am) asks them to rate how accurate the Oracle was (1-5 stars). Shown in the history feed. Social proof + engagement loop.

### Input Quality
- [ ] **GPS auto-detect** — `expo-location` + `foregroundPermission`; "Use my location" button; reverse-geocode via Open-Meteo. Removes the single biggest friction point in the onboarding flow.
- [x] **City autocomplete** — debounced Open-Meteo geocoding suggestions; collapses immediately on selection and suppresses re-appearance until user types again ✅ 2026/05/11

### Retention
- [ ] **Outfit history** — store every consultation (date, city, weather snapshot, verdict, outfits) in AsyncStorage; scrollable archive surfaced below the input; browsable by date
- [x] **Last result cache** — app opens to last result (12hr TTL); city pre-filled; "LAST CONSULTED" badge with one-tap refresh ✅ 2026/05/11
- [x] **Analytics** — PostHog HTTP API (no SDK, no rebuild); tracks app_opened, consult_started, consult_completed (with duration), consult_error, share_card_tapped, recent_city_tapped, autocomplete_city_selected; no-op if key not set ✅ 2026/05/11
- [ ] **Daily push notification** — `expo-notifications`; optional opt-in at first consult; fires at user-set time with today's city vibe teaser; deep-links to a fresh result

### Virality (cont.)
- [x] **Share card** — `react-native-view-shot` + `expo-sharing`; editorial portrait card (375×667) with masthead, vibe, weather, top 3 outfits, scarlet accent; "SHARE THE LOOK →" button in results ✅ 2026/05/11

### Content Depth
- [ ] **Skeleton loading UI** — editorial placeholder cards matching the final layout; eliminates the layout shift during the ~3s Claude response time
- [ ] **Alternative outfits** — prompt Claude for 2 outfit sets (polished + casual) and let the user swipe between them; doubles the perceived value per consult

---

## Phase 3 — Personalisation

> Without personalisation the Oracle gives the same answer to everyone in the same city. This is the moat.

### Style Profile (onboarding)
- [ ] **3-step onboarding** — shown on first launch; skippable but nudged. Step 1: gender. Step 2: style keywords (pick 3 from: Minimal / Maximalist / Streetwear / Classic / Eclectic / Coastal / Dark Academic / Y2K). Step 3: budget tier (High Street / Contemporary / Luxury). Stored in AsyncStorage, passed as context to Claude on every consult.
- [ ] **Settings sheet** — accessible from a gear icon in the masthead; edit style profile, toggle notifications, view history, clear data

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

## Recently Completed

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
