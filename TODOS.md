# TODOS.md

Design and UX debt tracked here. Each item has a what, why, and context for anyone picking it up later.

---

## UI / Design Debt

### ~~Style Passport — CityDossierSheet~~ — RESOLVED 2026-05-19
MapScreen pin tap now opens the full dossier: FASHION TERRITORY (Claude descriptor from `useCityPassport`), CLIMATE PERSONALITY (`getClimatePersonality(humidity, windSpeed)`), YOUR HISTORY (consult count + first visit date + signature vibe), FROM YOUR ARCHIVE (2×2 thumbnail grid), SHARE THIS CITY → button (captures `PassportPageCard` via `captureRef`). Same slide-up animation pattern, `ScrollView` inside `Animated.View` with `maxHeight: 72vh`.

---

### ~~Style Passport — Collectible Deck View~~ — RESOLVED 2026-05-19
PASSPORT DECK section added to YouScreen below the city count hero. 2-column grid of collected city cards (thumbnail or gradient placeholder, city name, visit count, red dot for fashion capital). Locked silhouette cards for the 5 featured capitals not yet visited. "SHOW ALL n ↓ / SHOW LESS ↑" expand toggle after 6 cards. Tap collected card → `navigation.navigate('Map', { openCity })` → MapScreen reads `openCity` param and pre-selects the pin, opening the CityDossierSheet.

---

### ~~Achievements empty state copy~~ — RESOLVED 2026-05-18
YouScreen now renders `{personalityLabel} earns standing here. The Oracle tracks 127 marks of distinction across 15 disciplines — temperature, rainfall, wind, cities, occasions, timing, and eight further style records. Your ledger is empty. Consult a first verdict to open it.` — uses the user's personality title, names 15 disciplines, creates anticipation for the badge depth.

---

### Try-before-profile funnel events needed
**What:** Once try-before-profile ships, add 4 new events: `first_consult_unprofiled`, `profile_modal_shown`, `profile_modal_tapped`, `profile_completed`. Decision gate: if modal-to-completion < 30% at 4 weeks post-launch, revert to mandatory gate.
**Why:** Without funnel analytics, try-before-profile has no measurable outcome. Shipping a large UX bet without measurement is irresponsible.
**Pros:** Unlocks real data on whether the try-before-profile bet is working.
**Cons:** Depends on the try-before-profile surfaces existing before the events can be placed cleanly.
**Context:** Funnel events added 2026-05-14 during /plan-devex-review (DX EXPANSION for try-before-profile, v1.2). The original non-functional Settings analytics toggle was fixed 2026-05-14: `@outfit_oracle_analytics_enabled` persists opt-out state, `analytics.ts` gates PostHog calls, Settings loads the stored preference, and full reset clears the key.
**Depends on:** Try-before-profile implementation (for funnel events); toggle fix is self-contained.

---

### Try-before-profile architecture (v1.2)
**What:** Remove the mandatory onboarding gate. Route new users from WelcomeScreen → Oracle tab directly (defaults: personality=editorial, budget=contemporary, keywords=[]). Add three-touch post-verdict profile CTA: (1) first-verdict modal with Oracle-voice copy "The Oracle delivered without knowing you. Set your aesthetic and the verdict becomes yours." → 'Tell the Oracle your style'; (2) dismissible bottom banner on subsequent unprofiled consults (first 3 only); (3) You tab badge + empty state "The Oracle knows nothing about you. Fix that." Route new users to Oracle tab; returning users to Today tab. GPS pre-warm triggers after 'Enter the Oracle' CTA tap on WelcomeScreen so city is auto-filled on first Oracle open.
**Why:** Current flow takes ~4 min to first verdict. Creator referral traffic from influencer posts bounces before experiencing the magic. Try-before-profile reduces TTHV to < 1 min, matching the original "zero setup" promise.
**Pros:** 5–10x TTHV improvement. Converts the mandatory gate from a blocker into an aspirational upgrade. Claude produces good results even without profile context (weather + occasion is sufficient for a quality verdict). Matches editorial promise of the WelcomeScreen copy.
**Cons:** First verdict is generic (no keywords, default personality, no colors/temperature). Requires undoing the v1.1.0 mandatory gate decision. Needs analytics toggle fixed first (for funnel measurement). Risk: if modal-to-completion < 30% at 4 weeks, revert to gate.
**Context:** Added 2026-05-14 during /plan-devex-review DX EXPANSION session. Implementation scope: AppNavigator (remove gate, keep WelcomeScreen), TabNavigator (session-aware initial route: new user → Oracle, returning user → Today), OracleScreen (post-verdict modal + bottom banner), YouScreen (badge/empty state), WelcomeScreen (GPS trigger after CTA tap). Decision gate at 4 weeks post-launch using funnel analytics.
**Depends on:** Analytics toggle fix (to track modal-to-completion rate).

---

### Paid tier / rate limit model
**What:** Current rate limit is 20 req/day per device (changed from hourly 2026-05-14). Consider introducing a paid tier with higher or unlimited daily requests. The free tier could be reduced (e.g., 5 req/day) to create upgrade pressure.
**Why:** 20 free requests/day is generous. A paid tier (e.g., RevenueCat, in-app purchase) unlocks a monetization path and lets serious users consult without hitting limits.
**Pros:** Revenue stream. Power users get unlimited use. Paid tier creates a natural retention hook.
**Cons:** Requires RevenueCat integration (or similar), App Store in-app purchase setup, Worker entitlement logic. Non-trivial (human: ~1 week / CC: ~2 hrs).
**Context:** Added 2026-05-14 during /plan-devex-review rate limit discussion. Rate limit changed to daily (86400s window) in the same session.
**Depends on:** Stable launch and user validation that demand exceeds free quota.

---

### Style presets — curated occasion templates
**What:** A curated library of 10–15 ready-made outfit combinations for named occasions: Smart Casual, Business Formal, Weekend Brunch, Date Night, Gym & Active, Beach Day, Black Tie, etc. Each preset contains 4–5 item categories with example descriptors but no specific items — Claude fills in the specifics using the user's profile and current weather. Surfaced as a horizontal scroll of preset chips above the occasion picker in OracleScreen, or as a dedicated "Presets" section in TodayScreen.
**Why:** TREVO (design inspo, 2026-05-14) shows "Style Presets" as a marquee feature. For users who know what kind of occasion they're dressing for but lack outfit vocabulary, presets remove the blank-page problem and dramatically improve verdict quality by seeding Claude with a structured template rather than relying purely on the occasion tag.
**Pros:** Reduces cognitive load for new users; improves Claude output quality; zero cost (no additional API call — the preset just augments the existing prompt); builds a content differentiation layer that gets richer over time.
**Cons:** Preset taxonomy needs editorial curation (10–15 presets × gender × season = non-trivial content work). Risk of overlap with the existing occasion picker — needs to complement, not replace.
**Context:** Added 2026-05-14 from TREVO design reference. Implementation: (1) Define a `STYLE_PRESETS` constant (name, icon, keyItems[], occasions[]); (2) render as horizontal chip scroll in OracleScreen above the existing occasion row; (3) tapping a preset auto-selects the matching occasion AND appends preset key items to the prompt as "structure guide". The user can still override city, gender, and weather.
**Depends on:** Existing occasion input system (already shipped). Can be layered on top without architecture changes.

---

### Outfit avatar / virtual dressing room
**What:** Show the user's outfit verdict as a visual — a figure wearing the items — rather than a text list. Three tiers of ambition:

**Tier 1 — Flat editorial mannequin (achievable now, ~4 hrs CC)**
A fixed SVG silhouette (front-facing, gender-neutral or selectable M/F/NB) in the centre of a grid. Each of Claude's outfit items gets a card around it: category icon + item name + "Buy" (Google Shopping link) or "You own" (if it matches a saved look). No 3D, no image generation. Pure React Native. The silhouette is decorative — the power is the "Buy / You own" split which is data Outfit Oracle already has (saved outfits in `useSavedOutfits`). This is shippable as part of OracleScreen today.

**Tier 2 — AI outfit flat-lay (medium effort, ~1 day CC + API cost)**
After the verdict arrives, fire a second call to an image generation API (Stability AI, DALL·E, or Ideogram) with a structured prompt: "editorial flat-lay photograph, white background, {items}, fashion magazine style". Show the generated image as a hero above the outfit cards. Cache per verdict (don't regenerate on refresh). Adds ~$0.04 per consult at current image gen pricing — viable for a Pro tier feature. No avatar, no body — just a styled product photograph.

**Tier 3 — Personalized 3D avatar (high effort, Phase 5+)**
ReadyPlayer.me SDK or Apple RealityKit (native Swift target). User configures a 3D avatar (face, skin, hair, body proportions) once; the avatar renders wearing outfit items using glTF clothing models. Requires: (a) a 3D clothing model pipeline for every item category, or a partnership with a fashion SDK provider; (b) native Xcode targets; (c) significant ongoing art/model maintenance. This is what StyleScape shows (design inspo, 2026-05-14). Technically feasible but ~2–4 weeks of human engineering + ongoing asset cost. Do not attempt until after monetisation is proven.

**Why:** Verdict comprehension improves dramatically when users can see the items together as an outfit, not parse a list. "You own" / "Buy" split (Tier 1) also surfaces wardrobe overlap in a genuinely useful way without requiring photo upload.
**Pros:** Tier 1 is the best effort/delight ratio — ships fast and makes the OracleScreen feel like a product, not a chatbot. Tier 2 would be a marquee Pro feature. Tier 3 is the long-term moat.
**Cons:** Tier 2 adds per-consult cost that needs paywall gating. Tier 3 is a separate engineering track, not an extension of the current app.
**Context:** Added 2026-05-14 from StyleScape design reference (outfit detail screen with 3D avatar + item grid + Buy/You own buttons). Start with Tier 1 in Phase 3.5. Gate Tier 2 behind Pro in Phase 4.
**Depends on:** Tier 1 is self-contained. Tier 2 needs Pro paywall (Phase 4). Tier 3 needs identity + Pro + native target (Phase 5+).

---

### Size / fit preference in style profile
**What:** Add a clothing size selector (XS / S / M / L / XL / XXL) to the onboarding flow and `ProfileEditScreen`. Store as `size` in the style profile and inject into `buildPrompt` so Claude can reference fit — "an oversized trench works for XS, a tailored coat for L."
**Why:** Two users in the same city with the same weather can need entirely different outfit advice based on their preferred fit and available sizing. Size is the single highest-signal missing field. StyleScape (design inspo, 2026-05-14) shows this as a horizontal slider in step 1 of their quiz.
**Pros:** Improves recommendation specificity for free; tiny surface area (one new profile key, one prompt line); no additional AI calls.
**Cons:** Requires adding a step or expanding an existing step in the 3-screen onboarding. Returning users need a migration path (prompt to fill in once on next Settings open).
**Context:** Added 2026-05-14 from StyleScape design reference. Implementation: (1) add `size?: string` to `StyleProfile` type, (2) render a chip row (not a slider — RN slider is harder to style) in `PersonalityScreen` or a new Step 3, (3) render the same chips in `ProfileEditScreen`, (4) add to `buildPrompt` in both app and Worker.
**Depends on:** Existing `StyleProfile` AsyncStorage schema (safe to add optional field).

---

### Clothing category preferences in style profile
**What:** Add a multi-select chip grid for garment categories to the onboarding / `ProfileEditScreen`: Shirts, Trousers, Dresses, Skirts, Denim, Knitwear, Outerwear, Sneakers, Boots, Heels, Accessories. Stored as `categories: string[]` in the style profile; injected into the prompt ("User prefers dresses and boots — avoid suggesting trousers"). Claude can then give results that match what the user actually owns and wears.
**Why:** Without this, Claude suggests complete outfit types the user might never wear (e.g. suits, heels). StyleScape (design inspo, 2026-05-14) shows this as the most prominent onboarding question after style aesthetic. This is the missing link between "I like minimal style" and "I actually wear dresses and sneakers."
**Pros:** Dramatically improves verdict relevance; reuses the chip pattern already used for style keywords; no AI cost increase.
**Cons:** Medium onboarding length increase. Must guard against over-constraining Claude (inject as preferences, not hard rules).
**Context:** Added 2026-05-14 from StyleScape design reference. Can ship as an expansion of `StyleOnboarding` step 2 or as a new step 3, pushing the size field to step 4. Keep to ≤ 12 chips to avoid scroll. Selected chips should highlight in `colors.scarlet`.
**Depends on:** Size preference field (above) — ideally shipped together as an "onboarding expansion" PR.

---

### ~~Time-aware greeting in TodayScreen header~~ — RESOLVED 2026-05-18
`StandardTodayScreen` now derives `greeting` from `new Date().getHours()` and `profile?.name`. Falls back to "Outfit Oracle" wordmark when no name is set. Uses display font at 20px (vs. wordmark's 22px). Streak label unchanged.

---

### `earnedAt` timestamps inaccurate for streak and count badges
**What:** `consecutiveDayStreak()` in `useWeatherBadges.ts` returns `entries[entries.length - 1].consultedAt` — the oldest consult on the qualifying day — instead of the most recent. Streak and consult-count badges also use `Date.now()` at memo evaluation time, not the actual moment the milestone was crossed.
**Why:** `earnedAt` is exposed on the `WeatherBadge` interface and will naturally become the source of truth for "Earned on [date]" display in a future achievements expansion. Fixing stale timestamps after users have persisted data is harder than fixing them before the UI ships.
**Pros:** Correct "earned on" dates when the feature ships; no need to backfill or migrate.
**Cons:** Requires separate milestone tracking (e.g., a small AsyncStorage key per badge or a timestamp Map in history). Non-trivial and low urgency while dates aren't shown.
**Context:** Added 2026-05-14 during /plan-eng-review of feat/launch-week1. Pre-existing issue, not introduced by this branch. `earnedAt` is not currently displayed anywhere in the UI.
**Depends on:** Future "Earned on date" UI feature in YouScreen achievements section.

---

## Test Debt (v1.4.0 — auth + image gen branch)

### ~~Test coverage for getSeason~~ — RESOLVED in 1.4.0
`getSeason()` is exported and covered by 22 tests in `__tests__/oracleUtils.test.ts` (northern/southern hemisphere, all months, equator, undefined lat). Also added: `themePredicates.test.ts` (isDarkColor + all 5 isXTheme predicates) and `y2kTypography.test.ts` (font set + typography for both subthemes). Total: 134 tests across 11 suites.

### ~~Test coverage for formatTemp and offline cache fallback~~ — RESOLVED 2026-05-18
`__tests__/formatTemp.test.ts` — 12 tests covering C/F conversion, rounding, edge cases (-40 convergence), and return type.
`__tests__/oracleOffline.test.ts` — 6 tests covering the network-error regex classification and the CachedResult shape/TTL contract. Total: 152 tests across 13 suites.

## Test Debt (v1.5.0.0 — social auth + notifications branch)

### ~~Test coverage for weather utilities~~ — RESOLVED in 1.5.0.0
`__tests__/weatherUtils.test.ts` — 14 tests covering `uvLabel` (boundary cases for all 5 tiers), `localHour` (UTC offsets), NWS US alert path (happy path + non-ok fallback). Oracle payload stripping tests added to `oracleProxy.test.ts`. Total: 202 tests across 22 suites.

## Known Deferred Issues (from adversarial review v1.5.0.0)

### Auth rate limiting on Worker
**What:** `/auth/siwa`, `/auth/google`, `/auth/facebook`, `/auth/me` have no rate limiting. The oracle/image/city-descriptor endpoints are rate limited; auth is not.
**Why deferred:** Auth endpoint rate limiting requires session-aware logic (don't limit already-authenticated refreshes) and separate KV key space design.
**Priority:** P1

### ~~makeId() uses Math.random()~~ — RESOLVED 2026-06-01
`auth.ts:makeId()` now uses `fillSecureRandomBytes()` for the local user ID suffix instead of `Math.random()`. Added `auth.test.ts` coverage proving local account creation does not call `Math.random()` and still emits the expected `user_<timestamp>_<hex>` shape.

### ~~autoLocationStartedRef never resets after app reset~~ — RESOLVED 2026-06-01
Full data reset now emits a central `notifyDataReset()` signal from `AppContext`. The app-level auto-consult guard and all three Oracle screen variants (editorial, Y2K, Mondrian) clear their one-shot auto-location refs when that signal changes, and auto-location now waits for a set style profile instead of firing during loading/onboarding. The reset path also clears in-memory Oracle/profile/history/streak/saved/archive state plus missing persisted reset keys including look archive, notification state, device ID, generated image cache, and city descriptor cache.
