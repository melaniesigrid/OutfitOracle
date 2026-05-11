# Outfit Oracle

> *Your unsolicited style authority.*

A weather-powered AI fashion advisor with the energy of a Y2K fashion editor who's seen everything and is mildly disappointed by most of it. Enter a city, receive a verdict.

---

## Design Language

Outfit Oracle is built to feel like a fashion editorial magazine — not an app. The aesthetic borrows from Vogue, AnOther Magazine, and high-end lookbooks: cream ivory pages, jet-black masthead, scarlet accents, generous whitespace, and zero rounded corners.

### Palette

| Token | Hex | Role |
|---|---|---|
| `bg` | `#FAF9F6` | Warm cream — page background |
| `bgDark` | `#0D0B08` | Near-black — masthead, CTA button |
| `bgSurface` | `#F3EEE5` | Slightly deeper cream — hover states |
| `borderHard` | `#1A1714` | Black rule lines, input underline |
| `scarlet` | `#C41230` | Forbidden section accent |
| `mint` | `#4A7A58` | Sage — Top accent |
| `lavender` | `#6B3F78` | Deep plum — Bottom accent |
| `coral` | `#B84B2E` | Terracotta — Outer Layer accent |
| `lemon` | `#8B6838` | Warm gold — Footwear accent |
| `iris` | `#2E5470` | Slate — Accessories accent |

### Typography

| Role | Font | Usage |
|---|---|---|
| Display | Cormorant Garamond 700 Bold Italic | Masthead "Oracle", verdict pull quotes, item names |
| Display Light | Cormorant Garamond 300 Light | Masthead "OUTFIT" (spaced, contrasting weight) |
| Serif | Cormorant Garamond 400 Italic | Button text, loading copy, reset link |
| Display Semi | Cormorant Garamond 600 SemiBold | Vibe name, weather stat values |
| Mono | IBM Plex Mono 400 | All labels, captions, data points, category badges |
| Mono Medium | IBM Plex Mono 500 | Error retry, emphasis labels |

The weight contrast between the 300 Light masthead and the 700 Bold Italic title is intentional — it is the single most editorial decision in the app.

---

## Features

- **Weather-powered verdict** — geocodes any city via Open-Meteo, fetches live conditions, passes them to Claude for a savage, weather-specific fashion opinion
- **5 outfit categories** — Top, Bottom, Outer Layer, Footwear, Accessories; each with a per-category editorial accent colour
- **Shop this piece** — every item links directly to Google Shopping; the Oracle's recommendations are shoppable in one tap
- **"The Oracle Forbids"** — 3 items to avoid today, listed with scarlet ✕ marks
- **Effort rating** — 5-dash scale of how much the day demands from you, sartorially
- **Today's Vibe** — a 3-5 word editorial vibe name with contextual icons derived from keywords
- **Recent cities** — last 5 searches persisted, shown as chips, tap to re-consult instantly
- **Pull-to-refresh** — swipe down on results to re-fetch for the same city
- **Haptic feedback** — impact on consult press, success notification on verdict load
- **Staggered entrance animations** — results reveal sequentially; weather slides in, verdict fades, outfit cards stagger up one by one, forbidden list fades last

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 51 (bare workflow) |
| Language | TypeScript 5.3 |
| UI | React Native 0.74 |
| Fonts | `@expo-google-fonts/cormorant-garamond`, `@expo-google-fonts/ibm-plex-mono` |
| Icons | `@expo/vector-icons` → `MaterialCommunityIcons` (bundled with Expo) |
| Weather | [Open-Meteo](https://open-meteo.com/) — free, no key required |
| AI | Claude Sonnet 4.6 via Anthropic API |
| Haptics | `expo-haptics` |
| Persistence | `@react-native-async-storage/async-storage` |
| Animations | React Native `Animated` API (native driver throughout) |

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure your API key

```bash
# Create your .env file
echo "EXPO_PUBLIC_CLAUDE_API_KEY=sk-ant-..." > .env
```

> **Security note:** `EXPO_PUBLIC_*` variables are bundled into the JS bundle at build time. Anyone who unpacks the IPA can read this key. Before shipping publicly, move Claude calls to a backend proxy (Cloudflare Worker, Supabase Edge Function, or Next.js API route) and rotate the key.

### 3. Run

```bash
npx expo run:ios      # iOS — primary target (requires Xcode)
npx expo run:android  # Android
npx expo start        # Expo Go (limited — bare workflow modules may not work)
```

Changing `.env` requires a full bundler restart — `EXPO_PUBLIC_*` vars are baked in at build time, not hot-reloaded.

---

## Project Structure

```
src/
├── theme/index.ts          # All design tokens — colors, fonts, spacing, radius
├── services/
│   ├── weather.ts          # Open-Meteo geocoding + WMO condition map (returns MCI icon names)
│   └── oracle.ts           # Claude API call + JSON response parsing
├── hooks/
│   ├── useOracle.ts        # State machine: idle → fetching-weather → fetching-verdict → done/error
│   └── useRecentCities.ts  # AsyncStorage persistence for last 5 searched cities
├── components/
│   ├── WeatherStrip.tsx    # Slides in from left on mount
│   ├── VerdictCard.tsx     # Fades + slides up on mount; pull quote + vibe icons + effort rating
│   ├── OutfitCard.tsx      # Staggered fade + slide up (index × 90ms delay per card)
│   ├── AvoidSection.tsx    # Fades in last (480ms delay) with scarlet forbidden list
│   ├── GenderToggle.tsx    # Women / Men / Anyone chip selector
│   └── LoadingOracle.tsx   # Pulsing italic text + animated progress line
└── screens/
    └── HomeScreen.tsx      # Single screen — masthead, input, recent cities, results
```

---

## Production Checklist

- [ ] Move Claude API calls to a backend proxy
- [ ] Rotate the API key (current key is in `.env` history)
- [ ] Set real bundle identifier in `app.json`
- [ ] Design and add app icon (1024×1024) and splash screen
- [ ] Add privacy policy URL (required by Apple for AI-powered apps)
- [ ] Integrate Sentry for crash reporting
- [ ] GPS auto-detect city via `expo-location`
- [ ] App Store / Play Store listing assets
