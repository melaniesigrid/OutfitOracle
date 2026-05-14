# Outfit Oracle

> *Your unsolicited style authority.*

A weather-powered AI fashion advisor built with the editorial sensibility of a Vogue editor who is mildly disappointed by most things. Enter a city, choose an occasion, receive a verdict.

<!-- Your unsolicited style authority.

A weather-powered AI fashion advisor with the energy of a Y2K fashion editor who's seen everything and is mildly disappointed by most of it. Enter a city, receive a verdict. -->

---

## What it does

- Fetches live weather for any city via Open-Meteo (free, no key)
- Sends weather + your style profile to a Cloudflare Worker, which calls Claude Sonnet 4.6 server-side
- Returns a structured outfit verdict: editorial vibe, 5–6 outfit items (each with category, name, styling detail, accent colour, and a Google Shopping link), and a polished / casual pair of looks
- Tracks consult history, daily streaks, passport cities, saved looks, and 127+ achievements across 15 categories

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 51 (bare workflow), React Native 0.74 |
| Language | TypeScript |
| Navigation | React Navigation v6 (3 tabs: Today / Oracle / You) |
| AI | Claude Sonnet 4.6 via Cloudflare Worker proxy |
| Weather | Open-Meteo (geocoding + forecast + air quality — free, no key) |
| Persistence | AsyncStorage |
| Icons | MaterialCommunityIcons (bundled with Expo SDK) |
| Fonts | Cormorant Garamond (display) + IBM Plex Mono (labels/data) |
| Crash reporting | Sentry (installed — no-ops without DSN) |
| Analytics | PostHog HTTP API (no-ops without key) |
| Maps | Apple Maps (`react-native-maps`) |
| Share | `react-native-view-shot` + native Share sheet |

---

## Running locally

```bash
npm install

# iOS simulator (requires Xcode + CocoaPods)
npx expo run:ios

# Specific device
npx expo run:ios --device "iPhone 16 Pro"

# Android
npx expo run:android
```

TypeScript check: `npx tsc --noEmit`

Run tests: `npm test` (Jest + ts-jest, 61 tests across 6 suites)

After changing `.env`, fully restart the bundler — `EXPO_PUBLIC_*` vars are baked in at build time.

---

## Environment variables

Create `.env` at the project root:

```
# Required for all device/TestFlight builds
EXPO_PUBLIC_PROXY_URL=https://outfit-oracle-proxy.melaniesigrid.workers.dev

# Optional — Sentry crash reporting (get from sentry.io)
EXPO_PUBLIC_SENTRY_DSN=

# Optional — PostHog analytics
EXPO_PUBLIC_POSTHOG_KEY=
```

**Never set `EXPO_PUBLIC_CLAUDE_API_KEY` in production.** It would be baked into the JS bundle and readable from the IPA. The Anthropic key lives only in the Cloudflare Worker secret (`wrangler secret put ANTHROPIC_API_KEY`).

---

## Architecture

```
App.tsx
  └── AppDataProvider          (shared context: profile, history, streak, saved)
        └── HomeScreen         (font loading gate — blank until fonts resolve)
              ├── TodayScreen  (weather dashboard: hourly, 7-day, AQI, UV, moon phase,
              │                 Word of the Day — editorial fashion vocabulary widget)
              ├── OracleScreen (city input → outfit verdict)
              │     ├── useOracle          (state machine: idle → weather → verdict → done)
              │     ├── ChallengeCard      (weekly editorial challenge, ISO week rotation)
              │     └── OutfitCard × N     (each item: shop link, heart/save, accent colour)
              └── YouScreen    (rank, passport, achievements, saved looks, history)
                    ├── useWeatherBadges   (127 achievements, 15 categories)
                    ├── useConsultStreak   (consecutive-day tracking + Oracle Rank)
                    └── MapScreen          (Apple Maps, visited cities, fashion capitals)
```

### Data flow

1. `OracleScreen` calls `useOracle.consult(city, occasion)`
2. `useOracle` fetches weather (Open-Meteo geocoding + conditions), then POSTs `{ weather, gender, occasion, styleProfile }` to the Cloudflare Worker
3. Worker calls `claude-sonnet-4-6` server-side, returns pure JSON matching `OracleVerdict`
4. Results render as staggered animated `OutfitCard` components; history, streak, and passport update via context

### Style profile

`useStyleProfile` reads preferences from AsyncStorage: keywords (pick-3), budget tier, Oracle personality (Diplomat / Editor / Savage), temperature sensitivity (Runs Cold / Normal / Runs Hot), and colour loves/avoids (16-swatch grid). Passed to Claude on every consult. Set via `StyleOnboarding` (first launch) or `ProfileEditScreen`.

### Achievements

`useWeatherBadges(history, firstConsultAt, extras)` returns 127 badges with `earned: boolean` and `category: string`. Categories (in display order):

| Category | Examples |
|---|---|
| **Fashion Mythology** | Carrie Bradshaw (10 saved looks), Miranda Priestly (Work + rain), Euphoria Hour (after 10pm), Bridgerton Season (London in spring) |
| Temperature | Arctic Devotee, Desert Chic, The Goldilocks |
| Streaks | The Oracle's Devotee (7-day), Century (100-day) |
| Precipitation | First Rain, Storm Chaser, The Detox |
| Sunshine | First Sun, UV Warrior |
| Wind | Windswept Editorial |
| Humidity | Tropical Luxury |
| Timing | Golden Hour Oracle, Midnight Runway |
| Cities | Globetrotter (10 cities), The Nomad Oracle (50 cities) |
| Occasions | Work Wardrobe, The Method Actor |
| Saves | The Collector, The Archive (30 saved) |
| Calendar | New Year Oracle, Solstice Seeker |
| Anniversaries | One Week, The Annual |
| Firsts | First Consult, First Save |

YouScreen groups earned badges by category with scarlet category headers. Locked badges appear as a collapsed count at the bottom.

### Cloudflare Worker

The Worker (`cloudflare-worker/`) handles all Claude API calls:
- Receives `{ weather, gender, styleProfile?, occasion? }` via POST
- Calls `buildPrompt()` → `claude-sonnet-4-6` with structured JSON schema
- Returns `OracleVerdict` (pure JSON — no markdown wrapping)
- Rate-limits at 20 req/hr per IP via Cloudflare KV

Deploy: `wrangler deploy`. Set the key: `wrangler secret put ANTHROPIC_API_KEY`.

---

## Design language

Editorial, not app-like. Borrowed from Vogue, AnOther Magazine, and high-end lookbooks.

- **Background**: warm cream `#FAF9F6`
- **Dark sections**: near-black `#0D0B08`
- **Accent**: scarlet `#C41230`
- **Corners**: sharp — `radius.sm` and `radius.md` are both `0`
- **Type**: Cormorant Garamond for headlines (weight contrast between 300 Light and 700 Bold Italic is intentional), IBM Plex Mono for all data/labels
- **Outfit accents**: mint (sage), lavender (deep plum), coral (terracotta), lemon (warm gold), iris (slate blue)

Do not use emoji in `Text` components with a custom `fontFamily` — IBM Plex Mono lacks many Unicode symbols. Use `MaterialCommunityIcons` or plain ASCII.

---

## TestFlight checklist

Before archiving in Xcode:

1. Set `EXPO_PUBLIC_SENTRY_DSN` in `.env` and rebuild
2. Enable GitHub Pages for the privacy policy: repo Settings → Pages → Source → main → /docs → Save
3. In Xcode, drag `ios/OutfitOracle/PrivacyInfo.xcprivacy` into the project navigator (File → Add Files to OutfitOracle) — the file exists on disk but must be referenced in the `.xcodeproj`
4. Create the App Store Connect record (name: Outfit Oracle, category: Lifestyle, age rating: 4+, privacy policy URL: `https://melaniesigrid.github.io/OutfitOracle/`)
5. Capture 6.5" (1284×2778) and 5.5" (1242×2208) screenshots — minimum 3 per device class
6. Run a 15-minute VoiceOver audit on a real device

---

## Privacy policy

Hosted at `https://melaniesigrid.github.io/OutfitOracle/` (GitHub Pages from `/docs/index.html`). Covers: Open-Meteo, Anthropic, Cloudflare, Google Shopping, Sentry. Contact: melaniesigridab@gmail.com.

---

## More docs

- [Roadmap.md](Roadmap.md) — feature backlog and launch checklist
- [CHANGELOG.md](CHANGELOG.md) — release history
- [TODOS.md](TODOS.md) — open design/engineering debt
- [BEST_PRACTICES.md](BEST_PRACTICES.md) — coding conventions
- [CLAUDE.md](CLAUDE.md) — AI assistant guidance
