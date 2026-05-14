# TODOS.md

Design and UX debt tracked here. Each item has a what, why, and context for anyone picking it up later.

---

## UI / Design Debt

### Achievements empty state copy
**What:** Replace the single-line placeholder "Consult the Oracle to begin earning achievements." with richer editorial copy that teases the depth of the 127-badge system.
**Why:** New users land on the ACHIEVEMENTS section with zero badges earned. The current text is accurate but doesn't signal the 15-category depth or create anticipation. The empty state is the first thing they see before collapsing the locked row.
**Pros:** Better Day 1 impression; sets expectation for the gamification depth; in the Oracle voice.
**Cons:** Requires editorial copy decision (which voice, how specific); blocked on knowing which Oracle personality the user has when they first open the screen.
**Context:** Added 2026-05-13 during /plan-design-review of feat/launch-week1. The locked-badge collapse was fixed in that review — this is the remaining empty-state gap. The YouScreen has a `personalityLabel` derived from the user's profile; the empty state could use it.
**Depends on:** User has completed mandatory onboarding and has a personality set (guaranteed by the gate added in this branch).

---

### Analytics toggle non-functional + try-before-profile funnel events needed
**What:** (1) The "Usage analytics" Switch in SettingsScreen looks real but does nothing. `analyticsEnabled` state is never read by `analytics.ts` — PostHog events fire regardless of toggle position. The setting also resets to `true` on every app open. (2) Once try-before-profile ships, add 4 new events: `first_consult_unprofiled`, `profile_modal_shown`, `profile_modal_tapped`, `profile_completed`. Decision gate: if modal-to-completion < 30% at 4 weeks post-launch, revert to mandatory gate.
**Why:** (1) Users who opt out are still tracked — App Store review risk. (2) Without funnel analytics, try-before-profile has no measurable outcome. Shipping a large UX bet without measurement is irresponsible.
**Pros:** Enforces user intent on analytics; unlocks real data on whether the try-before-profile bet is working; removes App Store risk.
**Cons:** Requires threading a preference through `analytics.ts` (read from AsyncStorage, gate all `track()` calls) plus showing the correct state on Settings mount.
**Context:** Toggle added 2026-05-14 during /plan-eng-review. Funnel events added 2026-05-14 during /plan-devex-review (DX EXPANSION for try-before-profile, v1.2). Fix toggle: (1) persist to `@outfit_oracle_analytics_enabled` on toggle, (2) read the key in `analytics.ts` and gate `track()`, (3) load persisted value in SettingsScreen `useEffect`. Add `@outfit_oracle_analytics_enabled` to `ALL_KEYS` for full reset.
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

### `earnedAt` timestamps inaccurate for streak and count badges
**What:** `consecutiveDayStreak()` in `useWeatherBadges.ts` returns `entries[entries.length - 1].consultedAt` — the oldest consult on the qualifying day — instead of the most recent. Streak and consult-count badges also use `Date.now()` at memo evaluation time, not the actual moment the milestone was crossed.
**Why:** `earnedAt` is exposed on the `WeatherBadge` interface and will naturally become the source of truth for "Earned on [date]" display in a future achievements expansion. Fixing stale timestamps after users have persisted data is harder than fixing them before the UI ships.
**Pros:** Correct "earned on" dates when the feature ships; no need to backfill or migrate.
**Cons:** Requires separate milestone tracking (e.g., a small AsyncStorage key per badge or a timestamp Map in history). Non-trivial and low urgency while dates aren't shown.
**Context:** Added 2026-05-14 during /plan-eng-review of feat/launch-week1. Pre-existing issue, not introduced by this branch. `earnedAt` is not currently displayed anywhere in the UI.
**Depends on:** Future "Earned on date" UI feature in YouScreen achievements section.
