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

### Analytics toggle non-functional
**What:** The "Usage analytics" Switch in SettingsScreen looks real but does nothing. `analyticsEnabled` state is never read by `analytics.ts` — PostHog events fire regardless of toggle position. The setting also resets to `true` on every app open (not persisted to AsyncStorage).
**Why:** Users who tap the toggle to opt out are still being tracked. This is a trust issue and a potential App Store review concern if a reviewer checks whether toggles do what they say.
**Pros:** Implementing it enforces user intent; removes any App Store review risk around privacy toggles.
**Cons:** Requires threading a preference through `analytics.ts` (read from AsyncStorage, gate all `track()` calls) plus showing the correct state on Settings mount.
**Context:** Added 2026-05-14 during /plan-eng-review of feat/launch-week1. Pre-existing issue — the toggle appeared as a UI placeholder in an earlier commit. Fix: (1) persist to `@outfit_oracle_analytics_enabled` on toggle, (2) read the key in `analytics.ts` and gate `track()`, (3) load persisted value in SettingsScreen `useEffect`. Need to also add `@outfit_oracle_analytics_enabled` to `ALL_KEYS` for full reset.
**Depends on:** Nothing — fully self-contained.

---

### `earnedAt` timestamps inaccurate for streak and count badges
**What:** `consecutiveDayStreak()` in `useWeatherBadges.ts` returns `entries[entries.length - 1].consultedAt` — the oldest consult on the qualifying day — instead of the most recent. Streak and consult-count badges also use `Date.now()` at memo evaluation time, not the actual moment the milestone was crossed.
**Why:** `earnedAt` is exposed on the `WeatherBadge` interface and will naturally become the source of truth for "Earned on [date]" display in a future achievements expansion. Fixing stale timestamps after users have persisted data is harder than fixing them before the UI ships.
**Pros:** Correct "earned on" dates when the feature ships; no need to backfill or migrate.
**Cons:** Requires separate milestone tracking (e.g., a small AsyncStorage key per badge or a timestamp Map in history). Non-trivial and low urgency while dates aren't shown.
**Context:** Added 2026-05-14 during /plan-eng-review of feat/launch-week1. Pre-existing issue, not introduced by this branch. `earnedAt` is not currently displayed anywhere in the UI.
**Depends on:** Future "Earned on date" UI feature in YouScreen achievements section.
