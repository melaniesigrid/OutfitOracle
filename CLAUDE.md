# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.


## Roadmap Management

- Always check ROADMAP.md first
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

There are no lint or test scripts. TypeScript checking is the only static analysis available (`tsc --noEmit`).

After changing `.env`, you must fully restart the bundler — `EXPO_PUBLIC_*` vars are baked in at build time, not hot-reloaded.

## Environment

Copy `.env.example` to `.env` and set:
```
EXPO_PUBLIC_CLAUDE_API_KEY=sk-ant-...
```

The key is read in `src/screens/HomeScreen.tsx` via `process.env.EXPO_PUBLIC_CLAUDE_API_KEY`. It is sent directly from the client using the `anthropic-dangerous-direct-browser-access: true` header — there is no backend proxy. This is acceptable for development but flagged in the README production checklist.

## Architecture

Single-screen Expo bare workflow app. No navigation library — `App.tsx` renders `HomeScreen` directly.

### Data flow

`HomeScreen` → `useOracle` hook → two sequential fetches:
1. `fetchWeather(city)` — Open-Meteo geocoding + weather (free, no key)
2. `fetchOracleVerdict(weather, gender, apiKey)` — Claude Sonnet 4.6

`useOracle` is the only stateful layer. It exposes `status` (`idle | fetching-weather | fetching-verdict | done | error`), the `weather` and `verdict` payloads, and `consult` / `reset` actions. All display components are pure presentational — they receive props only.

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
