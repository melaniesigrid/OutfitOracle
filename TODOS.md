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
