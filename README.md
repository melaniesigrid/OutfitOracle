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
- **City autocomplete** — debounced geocoding suggestions appear as you type; tap to instantly consult; list collapses on selection and does not reappear until you type again
- **5 outfit categories** — Top, Bottom, Outer Layer, Footwear, Accessories; each with a per-category editorial accent colour
- **Shop this piece** — every item links directly to Google Shopping; the Oracle's recommendations are shoppable in one tap
- **"The Oracle Forbids"** — 3 items to avoid today, listed with scarlet marks
- **Effort rating** — 5-dash scale of how much the day demands from you, sartorially
- **Today's Vibe** — a 3-5 word editorial vibe name with contextual icons derived from keywords
- **Recent cities** — last 5 searches persisted, shown as chips, tap to re-consult instantly
- **Pull-to-refresh** — swipe down on results to re-fetch for the same city
- **Haptic feedback** — impact on consult press, success notification on verdict load
- **Rotating loading statements** — 5 atmospheric messages (weather phase) + 7 Oracle-voice messages (verdict phase) cycling every 2.5s
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
| Proxy | Cloudflare Worker (`cloudflare-worker/`) — keeps API key server-side |
| Haptics | `expo-haptics` |
| Persistence | `@react-native-async-storage/async-storage` |
| Animations | React Native `Animated` API (native driver throughout) |

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` — for local development set `EXPO_PUBLIC_CLAUDE_API_KEY`. For production set `EXPO_PUBLIC_PROXY_URL` (see Proxy Setup below).

### 3. Run

```bash
npx expo run:ios      # iOS — primary target (requires Xcode)
npx expo run:android  # Android
npx expo start        # Expo Go (limited — bare workflow modules may not work)
```

Changing `.env` requires a full bundler restart — `EXPO_PUBLIC_*` vars are baked in at build time, not hot-reloaded.

### Proxy Setup (recommended before sharing)

The `cloudflare-worker/` directory contains a Cloudflare Worker that keeps your Anthropic key server-side. The app automatically routes to the proxy when `EXPO_PUBLIC_PROXY_URL` is set.

```bash
cd cloudflare-worker
npx wrangler login
npx wrangler deploy
npx wrangler secret put ANTHROPIC_API_KEY   # paste your key when prompted
```

Add the Worker URL to `.env`:
```
EXPO_PUBLIC_PROXY_URL=https://outfit-oracle-proxy.<subdomain>.workers.dev
```

---

## Project Structure

```
cloudflare-worker/
├── index.js            # Cloudflare Worker — proxies Claude API calls
└── wrangler.toml       # Worker config and deploy settings
src/
├── theme/index.ts          # All design tokens — colors, fonts, spacing, radius
├── services/
│   ├── weather.ts          # Open-Meteo geocoding + WMO condition map + city search
│   └── oracle.ts           # Claude API call — routes via proxy or direct based on env
├── hooks/
│   ├── useOracle.ts        # State machine: idle → fetching-weather → fetching-verdict → done/error
│   └── useRecentCities.ts  # AsyncStorage persistence for last 5 searched cities
├── components/
│   ├── CitySuggestions.tsx # Autocomplete dropdown — collapses on selection
│   ├── WeatherStrip.tsx    # Slides in from left on mount
│   ├── VerdictCard.tsx     # Fades + slides up on mount; pull quote + vibe icons + effort rating
│   ├── OutfitCard.tsx      # Staggered fade + slide up (index × 90ms delay per card)
│   ├── AvoidSection.tsx    # Fades in last (480ms delay) with scarlet forbidden list
│   ├── GenderToggle.tsx    # Women / Men / Anyone chip selector
│   └── LoadingOracle.tsx   # Rotating messages + animated progress line
└── screens/
    └── HomeScreen.tsx      # Single screen — masthead, input, autocomplete, recents, results
```

---

## Production Checklist

- [-] Deploy Cloudflare Worker proxy (`cloudflare-worker/`) and set `ANTHROPIC_API_KEY` secret
- [ ] Rotate the API key after proxy is live (current key is in `.env` history)
- [ ] Rate-limit the proxy (per IP/device) before any public launch
- [x] Bundle identifier set (`com.melaniesigrid.outfitoracle`)
- [ ] App icon (1024×1024) and splash screen image
- [x] Privacy policy (`PRIVACY_POLICY.md`) — add hosted URL to App Store listing
- [ ] VoiceOver / TalkBack end-to-end audit
- [ ] Sentry crash reporting (`@sentry/react-native`)
- [ ] GPS auto-detect city via `expo-location`
- [ ] TestFlight build for first users
- [ ] App Store / Play Store listing assets
