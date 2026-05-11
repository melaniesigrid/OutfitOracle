# BEST_PRACTICES.md

Engineering conventions for Outfit Oracle. Read alongside `CLAUDE.md`.

---

## Commits

**Commit after every logical unit of work** — a bug fix, a new hook, a completed screen section. Never let more than one feature accumulate unstaged.

**Message format:**
```
<type>: <what changed and why>

Types: feat | fix | refactor | style | docs | chore
```

Examples:
```
feat: add hourly + daily forecast to TodayScreen
fix: GenderToggle misaligned — add paddingHorizontal to row
chore: bump react-navigation to v6 for SDK 51 compatibility
```

**Stage files by name**, not `git add -A`. Binary assets (`.png`) and generated native files (`ios/Podfile.lock`, `ios/*.xcodeproj`) should be reviewed before staging — they're rarely intentional changes.

---

## TypeScript

- All new functions must have explicit return types. No implicit `any` on function parameters.
- Use `??` over `||` for nullish coalescing — they are not equivalent when falsy non-null values are valid.
- Optional fields on interfaces (`field?: T`) instead of `field: T | undefined` — cleaner call sites.
- When narrowing optionals from `WeatherData` (e.g. `weather.hourly`, `weather.pollen`), use `!!weather.hourly?.length` not `weather.hourly !== undefined` — empty arrays are falsy intent too.

---

## React Native

**Never use emoji in `<Text>` with a custom `fontFamily`.**
IBM Plex Mono and Cormorant Garamond lack most Unicode symbols. Use `MaterialCommunityIcons` (bundled with `@expo/vector-icons`) for all icons.

**Pressables need three accessibility props** — every interactive element:
```tsx
<Pressable
  accessibilityRole="button"
  accessibilityLabel="Human-readable description"
  accessibilityState={{ selected: isActive }}
/>
```

**List keys must be stable and unique.** Use domain identifiers (`item.category`, `entry.id`), never array index.

---

## State management

**Functional updates for derived state:**
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

**`useCallback` on all `addEntry` / `clear` mutations.** These are passed as props and re-creating them causes unnecessary re-renders.

---

## Data safety

- New fields on shared interfaces (`WeatherData`, `HistoryEntry`) must be **optional** — existing AsyncStorage records won't have them and will deserialize without crashing.
- Never store raw API responses in AsyncStorage. Store the typed, transformed shape from the service layer.
- Wrap all `AsyncStorage.getItem` → `JSON.parse` calls in try/catch and `removeItem` on corrupt data.

---

## API / network

- All Claude calls go through the Cloudflare Worker proxy. `EXPO_PUBLIC_CLAUDE_API_KEY` must not be set in production — it would be readable from the IPA.
- Open-Meteo fetches (weather + air quality) are free and keyless. Pollen fetches run in parallel and fail gracefully — return `undefined`, never throw.
- `EXPO_PUBLIC_*` vars are baked at build time. After changing `.env`, fully restart the bundler.

---

## Styling

- All design tokens live in `src/theme/index.ts`. No hard-coded hex values in component files — use `colors.*`, `fonts.*`, `spacing.*`.
- `radius.sm` and `radius.md` are both `0` — the aesthetic is sharp corners everywhere. Do not add `borderRadius` to components unless explicitly designing a pill or capsule shape.
- Minimum font size: **10px** for any label visible to the user. Sub-10px is a contrast/accessibility failure.
- `colors.textMuted` (`#706A66`) is the darkest allowed muted text on `colors.bg` — it achieves 5.08:1 contrast (AA pass). Do not go lighter.

---

## Dependency management

**Always use `npx expo install` for packages with native modules**, not `npm install`. Expo enforces SDK-compatible peer versions. Using `npm install` bypasses this and can install incompatible versions (e.g. `react-native-screens@4.x` on SDK 51 which requires `3.31.x`).

Current locked versions for SDK 51:
- `react-native-screens`: `3.31.1`
- `react-native-safe-area-context`: `4.10.5`
- `react-navigation/*`: v6 (v7 requires screens ≥ 4.x — incompatible with SDK 51)
