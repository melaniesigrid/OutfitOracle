# BEST_PRACTICES.md

Engineering conventions for Outfit Oracle. Read alongside `CLAUDE.md` and `ARCHITECTURE.md`.

---

## Commits

**Commit after every logical unit of work** — a bug fix, a new hook, a completed screen section. Never let more than one feature accumulate unstaged.

**Message format:**
```
<type>: <what changed and why>

Types: feat | fix | refactor | style | docs | chore | test
```

Examples:
```
feat: add hourly + daily forecast to TodayScreen
fix: GenderToggle misaligned — add paddingHorizontal to row
chore: bump react-navigation to v6 for SDK 54 compatibility
test: add coverage for useConsultStreak milestone promotion
```

**Stage files by name**, not `git add -A`. Binary assets (`.png`) and generated native files (`ios/Podfile.lock`, `ios/*.xcodeproj`) should be reviewed before staging — they're rarely intentional changes.

---

## TypeScript

- All new functions must have explicit return types. No implicit `any` on function parameters.
- Use `??` over `||` for nullish coalescing — they differ when falsy non-null values are valid (e.g. `0`, `''`).
- Optional fields on interfaces (`field?: T`) instead of `field: T | undefined` — cleaner call sites.
- When narrowing optionals from `WeatherData` (e.g. `weather.hourly`, `weather.pollen`), use `!!weather.hourly?.length` not `weather.hourly !== undefined` — empty arrays are falsy intent too.
- Use **discriminated unions** for status/state values, not plain strings:
  ```ts
  // Good — the union is the contract
  type OracleStatus = 'idle' | 'fetching-weather' | 'fetching-verdict' | 'done' | 'error';
  // Bad
  const status = 'fetching'; // unchecked string
  ```
- Use `as const` for static lookup tables to get literal types for free:
  ```ts
  const RANK_TITLES = [
    { min: 100, title: "Front Row" },
  ] as const;
  ```
- Prefer `type` for unions, intersections, and mapped types. Use `interface` only for object shapes that will be extended or implemented. Do not mix both for the same concept.
- Avoid type assertions (`as`) except at system boundaries (JSON parsing, external API responses). They suppress the compiler — use type guards instead.

---

## React Native

**Never use emoji in `<Text>` with a custom `fontFamily`.**
IBM Plex Mono and Cormorant Garamond lack most Unicode symbols. Use `MaterialCommunityIcons` (bundled with `@expo/vector-icons`) for all icons.

**Pressables need accessibility props** — every interactive element:
```tsx
<Pressable
  accessibilityRole="button"
  accessibilityLabel="Human-readable description"
  accessibilityState={{ selected: isActive }}
/>
```

**List keys must be stable and unique.** Use domain identifiers (`item.category`, `entry.id`), never array index. Array index keys cause subtle re-render bugs and break accessibility.

**Animations must use `useNativeDriver: true`** wherever possible (opacity, transform). Falling back to the JS thread causes dropped frames on low-end devices. Only layout properties (`width`, `height`, `padding`) require the JS thread.

**Avoid inline object/function creation in hot paths.** Inline styles in repeated list items allocate on every render. Extract to `StyleSheet.create` or a `useMemo`-wrapped `makeStyles` call.

**ScrollView vs. FlatList:** Use `FlatList` (or `FlashList`) for any list that could exceed ~20 items. `ScrollView` renders all children immediately — it does not virtualise. For short static lists, `ScrollView` is fine.

---

## Performance

**Memoize expensive derivations** with `useMemo`. The dependency array is a contract — be precise:
```ts
const badgesByCategory = useMemo(
  () => Object.fromEntries(BADGE_CATEGORY_ORDER.map(cat => [cat, earnedBadges.filter(b => b.category === cat)])),
  [earnedBadges], // not [badges] — only recompute when earned set changes
);
```

**Stabilise callbacks passed as props** with `useCallback`. A new function reference on every render forces child re-renders even if props are otherwise unchanged:
```ts
const recordConsult = useCallback(async () => { ... }, []);
```

**`React.memo` for pure presentational components** that receive stable props. VerdictCard, OutfitCard, ChallengeCard are good candidates — they render from props only.

**Context granularity:** A context update re-renders every consumer. Split large contexts if only a subset of consumers need a given value. `TemperatureContext`, `ThemeContext`, and `AppContext` are already split — maintain this separation.

**Profile before optimising.** React Native's Flipper profiler and the built-in `why-did-you-render` package identify actual bottlenecks. Don't add memos speculatively.

---

## State Management

**Functional updates for derived state** — avoids stale closure bugs:
```ts
setHistory(prev => {
  const next = computeNext(prev);
  AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
});
```

**Parallel async fetches** wherever results are independent:
```ts
const [wxResp, pollen] = await Promise.all([fetchWeather(), fetchPollen()]);
```

**`useCallback` on all mutation functions** (`addEntry`, `removeEntry`, `recordConsult`). These are passed as props and re-creating them on every render causes unnecessary child re-renders.

**Local state vs. context:** If state is only needed by one component or a tightly coupled parent-child pair, keep it local (`useState`). Lift to context only when multiple unrelated components need it. The current context set (App, Auth, Theme, Temperature) is intentional — don't add new contexts without justification.

**Avoid derived state in `useState`.** If a value can be computed from existing state or props, compute it during render (or with `useMemo`). Derived `useState` creates synchronisation bugs.

---

## Error Handling

**Network errors must be user-visible, not silent.** Every `try/catch` around a fetch should either set an error state the UI renders, or explicitly decide the failure is non-critical and log it.

**Fail gracefully at the feature level, not the app level.** Pollen, air quality, and image generation are optional — their failures must not block the oracle verdict. Return `undefined` / `null`, never rethrow.

**Corrupt AsyncStorage data must be cleared, not re-thrown:**
```ts
try {
  const data = JSON.parse(raw);
  // use data
} catch {
  await AsyncStorage.removeItem(KEY); // reset to clean state
}
```

**Use error boundaries** for screen-level crashes. A single bad render in `YouScreen` should not take down the entire tab navigator.

**Log errors to Sentry** (`@sentry/react-native`) in production. In development, `console.error` is sufficient. Never swallow an error silently in production — if you catch it, either handle it or report it.

---

## Testing

**Every new feature requires a corresponding test.** A feature without tests is not complete. Modified logic requires updated tests before the change ships.

**Test what the user observes, not implementation details.** Test hook return values and state transitions, not internal variables. Tests that assert `setEnabled(true)` was called are brittle — assert the resulting state instead.

**File naming:** `__tests__/<subject>.test.ts`. Mirror the source path — `src/hooks/useConsultStreak.ts` → `__tests__/consultStreak.test.ts`.

**Unit tests for pure logic** (badge evaluators, `getSeason`, `formatTemp`, `isoWeekNumber`). These are deterministic and fast — test edge cases exhaustively.

**Integration tests for hook state machines** (`useOracle`, `useConsultStreak`). Use `renderHook` from `@testing-library/react-hooks` and assert the full state sequence.

**Mock at the boundary, not inside the system.** Mock `AsyncStorage`, `expo-location`, and network calls. Do not mock internal hooks or utility functions — that defeats the purpose of the test.

**Run tests fresh before every commit.** Never rely on a cached result. `npm test` takes ~10 seconds — there is no excuse to skip it.

---

## Hooks

**Extract a hook when:** logic involves multiple `useState`/`useEffect` calls, the logic is reused in more than one component, or the logic involves AsyncStorage / network / subscriptions.

**Keep effects focused.** One `useEffect` per concern. An effect that fetches data, updates AsyncStorage, and fires an animation is three effects — split them. They have different dependencies and different cleanup needs.

**Effect cleanup is not optional.** Timers, subscriptions, and in-flight fetch sequences must be cancelled on unmount. Use a cleanup function or an `AbortController`:
```ts
useEffect(() => {
  const controller = new AbortController();
  fetch(url, { signal: controller.signal });
  return () => controller.abort();
}, [url]);
```

**Stale closure discipline.** If a value used inside an effect comes from component scope (props, state), it belongs in the dependency array. Lint with `eslint-plugin-react-hooks` to catch violations.

---

## Data Safety

- New fields on shared interfaces (`WeatherData`, `HistoryEntry`) must be **optional** — existing AsyncStorage records won't have them and must deserialize without crashing.
- Never store raw API responses in AsyncStorage. Store the typed, transformed shape from the service layer.
- Wrap all `AsyncStorage.getItem` → `JSON.parse` calls in try/catch and `removeItem` on corrupt data.
- **AsyncStorage is not encrypted.** Do not store secrets, tokens, or passwords in plain AsyncStorage. The current local auth stores hashed credentials — do not weaken this. For truly sensitive data, use `expo-secure-store`.

---

## API / Network

- All Claude calls go through the Cloudflare Worker proxy. `EXPO_PUBLIC_CLAUDE_API_KEY` must not be set in production — it is readable from the IPA.
- Open-Meteo fetches (weather + air quality) are free and keyless. Pollen fetches run in parallel and fail gracefully — return `undefined`, never throw.
- **Weather alerts (planned):** Environment Canada and NWS (US) APIs. Implement with the same graceful-failure pattern as pollen — alert absence must never block the verdict.
- `EXPO_PUBLIC_*` vars are baked at build time. After changing `.env`, fully restart the bundler.
- **Rate limit awareness:** The Cloudflare Worker enforces 20 requests/day per device (86400s window via KV). UI must handle `429` responses gracefully with a clear human-readable message, not a generic error.
- **Timeouts:** All fetch calls should have a timeout (15s max). A hanging fetch with no timeout blocks the user indefinitely.

---

## Styling

- All design tokens live in `src/theme/index.ts`. No hard-coded hex values in component files — use `colors.*`, `fonts.*`, `spacing.*`.
- `radius.sm` and `radius.md` are both `0` — the aesthetic is sharp corners everywhere. Do not add `borderRadius` unless explicitly designing a pill/capsule shape.
- Minimum font size: **10px** for any label visible to the user. Sub-10px is a contrast/accessibility failure.
- `colors.textMuted` (`#706A66`) is the darkest allowed muted text on `colors.bg` — 5.08:1 contrast ratio (WCAG AA pass). Do not use lighter values for body text.
- `makeStyles(colors, fonts, ...)` pattern: styles are computed inside `useMemo` and passed to `StyleSheet.create`. This is the established pattern — follow it on every new screen.
- DESIGN.md is the authority for per-theme specifications. Read it before making any visual decision.

---

## Dependency Management

**Always use `npx expo install`** for packages with native modules, not `npm install`. Expo enforces SDK-compatible peer versions. Using `npm install` bypasses this and can install incompatible versions.

**Current SDK:** 54 (Node ≥ 20.19.0 required).

Locked versions for SDK 54:
- `react-native`: aligned to SDK 54
- `react-native-screens`: SDK-pinned via `npx expo install`
- `react-native-safe-area-context`: SDK-pinned
- `react-navigation/*`: v6

Before adding any new package: check Expo SDK 54 compatibility in the [Expo SDK changelog](https://docs.expo.dev/versions/latest/). Packages that require a custom native module need a full rebuild (`npx expo run:ios`), not just a Metro restart.
