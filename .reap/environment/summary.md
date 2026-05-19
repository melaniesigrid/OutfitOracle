# outfit-oracle Environment

## Project
- Source: `/Users/melaniesigrid/Desktop/OutfitOracle/OutfitOracle`
- Language: TypeScript (strict)
- Framework: React Native, Expo bare workflow (SDK 54), Node ≥ 20.19.0
- Platform: iOS-first (Android supported)
- Test framework: Jest + ts-jest — `npm test` (153 tests, 14 suites)
- Type check: `npx tsc --noEmit`
- Dependencies: 27 packages, 9 devDependencies

## Build & Scripts
- `npm install` — install deps
- `npx expo run:ios` — primary target (bare workflow, requires Xcode)
- `npx expo run:android` — Android
- `npm run go` — Expo Go (limited — some native modules unavailable)
- `npm test` — Jest
- `npx tsc --noEmit` — type check
- `npx wrangler deploy` (from `cloudflare-worker/`) — deploy proxy
- `npx wrangler secret put ANTHROPIC_API_KEY` — set key in Worker

## Source Structure
```
App.tsx                         — Root: fonts, Sentry, provider stack, NavigationContainer
src/
  navigation/
    AppNavigator.tsx            — Auth → onboarding → MainStack gate
    TabNavigator.tsx            — Today / Oracle / You tabs
  contexts/
    AppContext.tsx              — Composes oracle, profile, history, streaks, badges, archive
    AuthContext.tsx             — Local AsyncStorage auth (not a remote IdP)
    ThemeContext.tsx            — Active theme + Y2K font subtheme
    TemperatureContext.tsx      — C/F preference
  hooks/
    useOracle.ts               — Consult state machine, 12h cache, analytics
    useStyleProfile.ts         — Keywords, budget, personality, onboarding gate
    useOracleImage.ts          — fal.ai editorial image generation
    useOutfitHistory.ts        — Consult history
    useSavedOutfits.ts         — Hearted / saved looks
    useConsultStreak.ts        — Daily streak, rank tiers, milestone events
    useWeatherBadges.ts        — 127+ achievement badges across 15 categories
    useArchive.ts              — Archived consults with reactions and notes
    useRecentCities.ts         — City autocomplete memory
    useWeeklyChallenge.ts      — ISO-week editorial challenge (16 rotating)
    useNotifications.ts        — Daily push notification scheduling
    useMagicMoment.ts          — First-consult celebration
  services/
    weather.ts                 — Open-Meteo geocoding + forecast
    oracle.ts                  — OracleVerdict type, proxy routing, dev buildPrompt
    auth.ts                    — Local email/password auth in AsyncStorage
    imageGeneration.ts         — fal.ai integration
    analytics.ts               — PostHog (no-op without key)
    pexels.ts                  — Pexels image search
  screens/
    TodayScreen.tsx            — Weather dashboard; delegates to y2k/ or mondrian/ by theme
    OracleScreen.tsx           — Thin router → Y2K / Mondrian / Editorial implementations
    YouScreen.tsx              — Profile, 127+ badges, saved looks, city passport
    SettingsScreen.tsx         — Theme picker, units, notifications, account, reset
    WelcomeScreen.tsx, OnboardingCarousel.tsx, PersonalityScreen.tsx
    AuthScreen.tsx, MapScreen.tsx, ProfileEditScreen.tsx
    y2k/                       — Y2KOracleScreen, Y2KTodayScreen
    mondrian/                  — MondrianOracleScreen, MondrianTodayScreen, MondrianSettingsScreen
  components/
    VerdictCard, OutfitCard, WeatherStrip, AvoidSection, LoadingOracle
    ChallengeCard, DressingLogicCard, WeatherGlanceCard, OracleImage
    UnlockToast                — Rank/milestone celebration overlay
    y2k/                       — Y2KBadge, Y2KDecreeCard, Y2KOutfitCard, Y2KSignature, Y2KWeatherCard
  theme/
    index.ts                   — All design tokens, ThemeName, theme helpers
    y2kTypography.ts           — Y2K font subthemes (club / decree)
cloudflare-worker/
  index.js                     — Anthropic proxy, rate limiting (KV), prompt, CORS
__tests__/                     — 14 Jest suites
```

## Key Design Decisions
- **Proxy-first:** All Claude calls go through the Cloudflare Worker. `EXPO_PUBLIC_CLAUDE_API_KEY` must never be set in production — key is readable from the IPA.
- **Hook-driven, presentational components:** `useOracle` owns all oracle state. Display components receive props only.
- **Thin-router per theme:** OracleScreen/TodayScreen/YouScreen route to dedicated theme implementations rather than conditional rendering inside a shared layout.
- **Image cost control:** Only the `day` image auto-generates on consult. Night + sketch are on-demand.
- **Local auth:** AsyncStorage-based email/password, not a remote IdP.
- **Weather Alerts (planned):** Environment Canada + NWS (US) integration not yet built.

## Environment Variables
| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_PROXY_URL` | Required for production/TestFlight — Cloudflare Worker URL |
| `EXPO_PUBLIC_CLAUDE_API_KEY` | Dev only — never ship in production |
| `EXPO_PUBLIC_POSTHOG_KEY` | Optional analytics (PostHog) |
| `EXPO_PUBLIC_FAL_KEY` | Optional editorial images (fal.ai) |
| `EXPO_PUBLIC_SENTRY_DSN` | Optional crash reporting |

After changing `.env`, fully restart Metro — `EXPO_PUBLIC_*` vars are baked at build time.
