# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.


## Project docs

- `Roadmap.md` — feature backlog, launch checklist, completed work
- `CHANGELOG.md` — release history
- `TODOS.md` — design/engineering debt with context
- `BEST_PRACTICES.md` — commit conventions, TypeScript rules, RN constraints
- `PRIVACY_POLICY.md` — privacy policy (also hosted at GitHub Pages)
- `DESIGN.md` — design system: three themes (Classic / Editorial Light / Editorial Dark), typography, color, spacing, motion spec

## Roadmap Management

- Always check Roadmap.md first
- Use checkbox progression: [ ] → [-] → [x]
- Add 🏗️ timestamp when starting, ✅ timestamp when completing
- Ask before updating personal content

## Commands

```bash
# Install dependencies
npm install

# Run on iOS (primary target — bare workflow, requires Xcode)
npx expo run:ios

# Run on Android
npx expo run:android

# Expo Go (limited — bare workflow native modules may not work)
npx expo start
```

Run tests: `npm test` (Jest + ts-jest, 61 tests across 6 suites). TypeScript checking: `npx tsc --noEmit`.

After changing `.env`, you must fully restart the bundler — `EXPO_PUBLIC_*` vars are baked in at build time, not hot-reloaded.

## Environment

Production (required for any device or TestFlight build):
```
EXPO_PUBLIC_PROXY_URL=https://outfit-oracle-proxy.<subdomain>.workers.dev
```

The app calls the Cloudflare Worker proxy which holds the Anthropic key server-side. `EXPO_PUBLIC_CLAUDE_API_KEY` must NOT be set in production builds — the key would be baked into the JS bundle and readable from the IPA.

Development only (no proxy): set `EXPO_PUBLIC_CLAUDE_API_KEY` in `.env` and leave `EXPO_PUBLIC_PROXY_URL` unset. Direct calls will fail without the proxy since `anthropic-dangerous-direct-browser-access` has been removed. Use the proxy for all environments.

## Architecture

Expo bare workflow app with React Navigation v6 (3 tabs: Today / Oracle / You). Navigation entry point: `src/navigation/AppNavigator.tsx`. Tab navigator: `src/navigation/TabNavigator.tsx`. `App.tsx` wraps `AppDataProvider` (shared context) → `AppNavigator`. `AppNavigator` shows a mandatory onboarding flow (WelcomeScreen → OnboardingCarousel → PersonalityScreen → StyleOnboarding) on first launch; afterwards it mounts `TabNavigator`.

### Data flow

`OracleScreen` → `useOracle` hook → two sequential fetches:
1. `fetchWeather(city)` — Open-Meteo geocoding + weather (free, no key)
2. `fetchOracleVerdict(weather, gender, apiKey, styleProfile?)` — Cloudflare Worker proxy → Claude Sonnet 4.6

`useOracle` is the only stateful layer. It exposes `status` (`idle | fetching-weather | fetching-verdict | done | error`), the `weather` and `verdict` payloads, and `consult` / `reset` actions. All display components are pure presentational — they receive props only.

### Proxy routing (`src/services/oracle.ts`)

`fetchOracleVerdict` checks `EXPO_PUBLIC_PROXY_URL` at module init:
- **Set** → `viaProxy()`: POST `{ weather, gender, styleProfile? }` to the Cloudflare Worker; Worker calls Anthropic server-side.
- **Not set** → `viaDirect()`: direct Anthropic API call. Requires `EXPO_PUBLIC_CLAUDE_API_KEY`. Note: `anthropic-dangerous-direct-browser-access` header has been removed — direct calls will 403. Use the proxy.

### Style profile (`src/hooks/useStyleProfile.ts`)

`useStyleProfile` loads the user's aesthetic preferences (keywords + budget tier) from AsyncStorage. Status can be `loading | not-set | skipped | set`. `AppNavigator` gates the tab navigator on `status === 'set'` — both `not-set` and `skipped` users are routed through the mandatory onboarding flow. Profile is passed to Claude's prompt on every consult.

### Claude integration (`src/services/oracle.ts`)

- Model: `claude-sonnet-4-6` (Claude 4 naming — no date suffix)
- The prompt instructs the model to return **pure JSON only** (no markdown, no backticks). The response is parsed directly with `JSON.parse` — no extraction logic.
- The JSON shape is defined by `OracleVerdict` in `oracle.ts`. If the prompt or shape changes, update both.

### Weather icons (`src/services/weather.ts`)

`conditionIcon` in `WeatherData` stores a **`MaterialCommunityIcons` icon name** (e.g. `"weather-sunny"`), not an emoji. It is rendered in `WeatherStrip.tsx` via `<MaterialCommunityIcons>` from `@expo/vector-icons` (bundled with Expo SDK — no separate install).

Emoji were removed because Unicode weather characters (`⛅`, `⛈`) render inconsistently across iOS/Android without variation selectors.

### Theme (`src/theme/index.ts`)

Editorial aesthetic — cream/ivory background (`#FAF9F6`), jet-black dark sections (`#0D0B08`), scarlet accent (`#C41230`). All design tokens (colors, fonts, spacing, radius) live here. `radius.sm` and `radius.md` are both `0` — sharp corners everywhere.

**Fonts:** Cormorant Garamond (display/serif, editorial headlines) + IBM Plex Mono (labels, captions, data). Loaded via `useFonts` in `HomeScreen.tsx`. The app renders a blank view until fonts resolve.

**Accent colors** (`mint`, `lavender`, `coral`, `lemon`, `iris`) are used by `OutfitCard` via `accentMap` — each outfit item from Claude specifies one of these five names.

Do not use emoji in Text components with a custom `fontFamily` set — IBM Plex Mono lacks many Unicode symbols. Use `MaterialCommunityIcons` or plain ASCII.

### Known simulator noise

These console messages are harmless and come from iOS internals, not app code:
- `hapticpatternlibrary.plist` errors — simulator has no Taptic Engine
- `appearanceChanged with no listeners` — silenced via no-op listener in `App.tsx`

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore

## Design System

Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, motion, and aesthetic direction are defined there.
Do not deviate without explicit user approval.

**Three themes:** Classic (IBM Plex Mono, broad scarlet) / Editorial Light (Space Mono, scarlet 1x per screen, cream bg) / Editorial Dark (Space Mono, scarlet 1x per screen, dark bg). User preference stored at `@outfit_oracle_theme`. Default: Classic.

**Scarlet discipline (Editorial themes):** One scarlet element per screen maximum. Priority: verdict rule > Founding Member badge > error state > category marker. Everything else uses near-black `#1A1714` + cream type.

In QA mode, flag any code that doesn't match the active theme's spec in DESIGN.md.
