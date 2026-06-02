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
| Framework | Expo SDK 54, React Native 0.81.5 |
| Language | TypeScript |
| Navigation | React Navigation v6 (3 tabs: Today / Oracle / You) |
| AI | Claude Sonnet 4.6 via Cloudflare Worker proxy |
| Weather | Open-Meteo (geocoding + forecast + air quality — free, no key) |
| Persistence | AsyncStorage + SecureStore (auth credentials) |
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

# Expo Go
npm run go

# iOS simulator (requires Xcode + CocoaPods)
npx expo run:ios

# Specific device
npx expo run:ios --device "iPhone 16 Pro"

# Android
npx expo run:android
```

TypeScript check: `npx tsc --noEmit`

Run tests: `npm test` (Jest + ts-jest, 202 tests across 22 suites)

SDK 54 requires Node 20.19.0 or newer. Use an even-numbered LTS release such as Node 22 or Node 24 for the cleanest local tooling support.

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

See **[ARCHITECTURE.md](ARCHITECTURE.md)** for the full codebase guide: entry points, module map, multi-theme routing, proxy flow, environment rules, and what to read before changing code.

At a glance:

```
App.tsx (fonts, providers)
  └── AppNavigator (auth → onboarding → MainStack)
        └── TabNavigator
              ├── TodayScreen   (weather dashboard)
              ├── OracleScreen  (consult → useOracle → Worker → OracleVerdict)
              └── YouScreen       (badges, saved looks, passport)
```

Data flow: `OracleScreen` → `useOracle.consult()` → Open-Meteo weather → Cloudflare Worker → Claude Sonnet 4.6 → JSON verdict → presentational cards. All oracle state lives in `useOracle`; UI components are props-only.

### Style profile

`useStyleProfile` reads preferences from AsyncStorage: keywords (pick-3), budget tier, Oracle personality (Diplomat / Editor / Savage), temperature sensitivity (Runs Cold / Normal / Runs Hot), and colour loves/avoids (16-swatch grid). Passed to Claude on every consult. Set via `StyleOnboarding` (first launch) or `ProfileEditScreen`.

### Achievements

`useWeatherBadges(history, firstConsultAt, extras)` returns 127 badges with `earned: boolean` and `category: string`. Categories (in display order):

| Category | Examples |
|---|---|
| **Fashion References** | Carrie Bradshaw (10 saved looks), Miranda Priestly (Work + rain), Euphoria Hour (after 10pm), Bridgerton Season (London in spring) |
| Temperature | Cold-Weather Regular, Desert Chic, The Goldilocks |
| Streaks | Seven-Day Edit, Century Streak |
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
- Rate-limits at 20 req/day per device (UUID header) or IP via Cloudflare KV

Deploy: `wrangler deploy`. Set the key: `wrangler secret put ANTHROPIC_API_KEY`.

---

## Agentic engineering workflows

This repo includes a small agent-orchestration layer to make AI-assisted engineering work more reproducible than ad hoc prompting. The goal is not to let agents edit freely; it is to define roles, boundaries, shared context, and review loops in files that can be inspected and improved like any other engineering artifact.

| Area | Files | Purpose |
|---|---|---|
| Agent workflow guide | `docs/agent-workflows/README.md` | Documents which agent patterns are ready to use, which are experimental, and what each workflow is appropriate for |
| Model debate runner | `tools/model-chat/model_chat.py`, `tools/model-chat/requirements.txt` | Runs several Claude API calls with different framings, captures the full transcript, and writes a synthesis to `active/model-chat/` |
| Browser worker config | `multi-chrome-agent-workspace/chrome-agent-*/.mcp.json` | Gives each browser worker its own Chrome DevTools MCP connection on a separate debug port |
| Browser worker instructions | `multi-chrome-agent-workspace/chrome-agent-*/CLAUDE.md`, `multi-chrome-agent-workspace/chat.md` | Defines worker responsibilities, status protocol, and a shared task board for parallel browser research |
| Local skill specs | `model-chat-skill/SKILL.md`, `multi-agent-chrome-skill/SKILL.md` | Captures repeatable invocation patterns for debate-style analysis and parallel Chrome automation |
| Methodology notes | `Stochastic Multi-Agent Consensus.md`, `Agent Chatrooms.md`, `Subagent Verification Loops.md` | Design notes for consensus polling, adversarial review, and fresh-context verification loops |

Engineering choices:

- **Configuration over memory**: worker behavior lives in `CLAUDE.md`, `SKILL.md`, `.mcp.json`, and shared markdown files instead of relying on one-off prompt history.
- **Isolated execution**: browser agents use separate Chrome profiles and remote-debugging ports, reducing session bleed and making failures easier to attribute.
- **Explicit coordination protocol**: multi-agent browser work uses `chat.md` with `[WORKING]`, `[DONE]`, `[ERROR]`, and `[WAITING]` markers so progress is auditable.
- **Generated output hygiene**: `active/`, browser logs, and snapshots are ignored by git; source instructions and configs are kept, run artifacts are not.
- **Review-oriented workflows**: the documented agent patterns emphasize independent analysis, structured disagreement, and verification before changes are accepted.

These files are intentionally visible in the repo because they show how the project approaches AI-assisted development as an engineering system: scoped agents, portable configuration, explicit handoffs, and reproducible outputs.

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

1. Confirm `EXPO_PUBLIC_SENTRY_DSN` is set in `.env` and rebuild after any value change
2. Enable GitHub Pages for the privacy policy: repo Settings → Pages → Source → main → /docs → Save
3. Confirm `ios/OutfitOracle/PrivacyInfo.xcprivacy` remains referenced in `ios/OutfitOracle.xcodeproj/project.pbxproj`
4. Create the App Store Connect record (name: Outfit Oracle, category: Lifestyle, age rating: 4+, privacy policy URL: `https://outfitoracle.fashion/privacy`)
5. Capture 6.5" (1284×2778) and 5.5" (1242×2208) screenshots — minimum 3 per device class
6. Run a 15-minute VoiceOver audit on a real device

---

## Privacy policy

Hosted at `https://outfitoracle.fashion/privacy` (canonical) and mirrored at GitHub Pages from `/docs/index.html`. Covers: Open-Meteo, Anthropic, Cloudflare, Google Shopping, Sentry. Contact: hello@outfitoracle.fashion.

---

## More docs

- [MARKETING.md](MARKETING.md) — marketing plan: Instagram, content calendar, launch checklist, brand voice
- [ARCHITECTURE.md](ARCHITECTURE.md) — codebase guide: entry points, modules, data flow, pre-change reading list
- [Roadmap.md](Roadmap.md) — feature backlog and launch checklist
- [CHANGELOG.md](CHANGELOG.md) — release history
- [TODOS.md](TODOS.md) — open design/engineering debt
- [BEST_PRACTICES.md](BEST_PRACTICES.md) — coding conventions
- [DESIGN.md](DESIGN.md) — design system and theme specs
- [CLAUDE.md](CLAUDE.md) — AI assistant guidance
- [docs/agent-workflows](docs/agent-workflows/README.md) — agent orchestration and verification workflows

---

## License & Copyright

© 2026 Oracle Fashion Studio. All rights reserved.

Outfit Oracle is proprietary software. The source code is shared publicly for transparency and portfolio purposes. No licence is granted to copy, modify, distribute, or use this code in other products without explicit written permission.

Third-party components are subject to their own licences:
- [Expo SDK](https://github.com/expo/expo/blob/main/LICENSE) — MIT
- [React Native](https://github.com/facebook/react-native/blob/main/LICENSE) — MIT
- [React Navigation](https://github.com/react-navigation/react-navigation/blob/main/packages/native/LICENSE) — MIT
- [Open-Meteo](https://open-meteo.com/) — CC BY 4.0 (non-commercial free tier)
- [Anthropic Claude API](https://www.anthropic.com/legal/aup) — subject to Anthropic's usage policy

Contact: [hello@outfitoracle.fashion](mailto:hello@outfitoracle.fashion)
