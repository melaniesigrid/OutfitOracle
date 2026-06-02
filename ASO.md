# App Store Optimization — Outfit Oracle
**Living document** · Update with every release · Tie keyword changes to version bumps  
*Last updated: 2026-06-01 (v2 — expanded research)*

Related: [MARKETING.md](MARKETING.md) · [COMPETITOR_ANALYSIS.md](COMPETITOR_ANALYSIS.md) · [DESIGN.md](DESIGN.md)

---

## What ASO Actually Does

ASO is not about tricks. It is the compound interest of small, correct decisions made consistently over time. Three levers:

1. **Discoverability** — ranking for the right keywords so the right people find you
2. **Conversion** — turning a store page visit into an install (icon, screenshots, title, ratings)
3. **Retention signal** — satisfied users leave reviews and re-engage, which feeds the algorithm

All three interact. A high-conversion page with weak keywords gets no visitors. Perfect keywords with a weak page get visitors who bounce. Bad retention signals drag rank even with both.

---

## Platform Mechanics

### iOS App Store
| Field | Limit | Indexed for search? |
|-------|-------|---------------------|
| App Name | 30 chars | YES — most weighted |
| Subtitle | 30 chars | YES |
| Keywords field | 100 chars | YES |
| Description (first line visible) | ~252 chars before "More" | NO (but conversion-critical) |
| Full description | no limit | NO |
| Developer name | — | YES |
| In-app purchase names | — | YES |

No spaces between keywords — use commas only. Do not repeat a word already in the Title or Subtitle — Apple ignores duplicates across fields, wasting space.

### Google Play
| Field | Limit | Indexed? |
|-------|-------|----------|
| App name | 50 chars | YES — highest weight |
| Short description | 80 chars | YES |
| Long description | 4000 chars | YES — keyword density matters |
| Developer name | — | YES |

Google Play indexes the full description. Repeat core keywords naturally 3–5 times. Do not keyword-stuff — Google's algorithm penalises it and users notice.

---

## 2026 Algorithm: The Two-Engine Model

The App Store search algorithm is best understood as two sequential filters running in order:

1. **Metadata relevance engine** — keyword matching against your title, subtitle, keyword field, developer name, and in-app purchase names. This determines eligibility: whether your app is *considered* for a given query.
2. **Behavioral quality engine** — post-install signals: retention, engagement depth, uninstall rate, crash rate. This determines rank: where you land among all eligible apps.

**The implication:** keyword optimization gets you on the list; product quality determines your position on it. An app with a perfect keyword set and a poor two-day retention cliff will rank below an app with a weaker keyword set and strong engagement. Metadata and product quality are not separate concerns — they are the same funnel.

### 2026 Behavioral Benchmarks

| Signal | Benchmark | Ranking impact |
|--------|-----------|----------------|
| Day-1 retention | >35% | Strong positive signal |
| Day-7 retention | >15% | Confirms habitual-use pattern |
| Crash rate | <1.09% | Above this = measurable rank penalty |
| ANR rate (Android/Play) | <0.47% | Google Play hard threshold |
| Session depth | Multiple-screen return visits | Engagement quality signal |

Apps with crash rates above 2% see measurable drops in search visibility. Fix crashes before touching keywords.

**For Outfit Oracle:** Every improvement to the consult loop — faster load, cleaner onboarding, better first-consult experience — is simultaneously a product decision and an ASO decision. Users who complete a consult on day 1 and return within 48 hours are the behavioral signal the algorithm rewards.

---

## Current Store Listing (Baseline)

### iOS — Live / Proposed

| Field | Current | Proposed |
|-------|---------|---------|
| **App Name** | Outfit Oracle | `Outfit Oracle: AI Style Advisor` |
| **Subtitle** | *(none)* | `Weather-Powered Fashion Oracle` |
| **Keywords (100 chars)** | *(none set)* | `outfit,stylist,fashion,AI,weather,clothing,wardrobe,daily,look,style,what to wear,dress` |
| **Category** | *(not set)* | **Primary:** Lifestyle · **Secondary:** Shopping |
| **Age Rating** | 4+ | 4+ |

### Google Play — Proposed

| Field | Proposed |
|-------|---------|
| **App Name** | `Outfit Oracle — AI Fashion Stylist` |
| **Short description** | `AI tells you what to wear based on today's weather.` |
| **Category** | Lifestyle |

---

## Title Strategy

The title is the single highest-weight ASO signal. Every word earns its place.

**Current:** `Outfit Oracle`  
**Proposed:** `Outfit Oracle: AI Style Advisor`

**Why:**
- "Outfit Oracle" is the brand — keep it first, always
- "AI" is searched heavily and not in any competitor's title
- "Style Advisor" captures the job-to-be-done without being generic ("fashion app")
- 30-character limit: `Outfit Oracle: AI Style Advisor` = 31 chars — trim to `Outfit Oracle · AI Stylist` (26) or `Outfit Oracle: AI Fashion` (25) depending on test results

**Do not use:**
- "Wardrobe" — positions us as a closet-catalog app (Stylebook's territory)
- "Planner" — implies effort, not oracle authority
- "Daily" — wastes a word; implied by the oracle concept
- Emoji — banned on iOS; penalised on Play

### Subtitle (iOS only)
`Weather-Powered Fashion Oracle` (31 chars — trim one word if rejected)  
Backup: `Your AI Fashion Authority` (25 chars)

The subtitle reinforces the weather-AI angle that no competitor owns. It also captures a separate keyword cluster from the title.

---

## Keyword Research

### Methodology

1. **Seed keywords** — what the target user types when they want this app
2. **Competitor ranking** — what keywords drive installs for Indyx, Cladwell, Smart Closet
3. **Adjacent intent** — users who search for problems Outfit Oracle solves (not just the product category)
4. **Volume / difficulty balance** — high volume + low competition is the target; don't waste 100 chars on "fashion" (impossible to rank)

### Seed Keyword Clusters

| Cluster | Keywords | Intent |
|---------|----------|--------|
| **Core product** | outfit, outfit ideas, outfit of the day | Primary — what users know they want |
| **AI angle** | AI stylist, AI fashion, AI outfit | Emerging — growing fast, low competition |
| **Weather angle** | weather outfit, dress for weather, what to wear today | High intent — user has a specific need right now |
| **Daily use** | daily outfit, outfit planner, outfit picker | Habitual users, good for retention |
| **Style identity** | personal stylist, style guide, fashion advice | Aspirational — style-conscious user |
| **Occasion** | work outfit, date night outfit, occasion dressing | Long-tail, high conversion |
| **Decision fatigue** | what to wear, outfit help, outfit decision | Problem-aware — the job the app does |

### iOS Keyword Field — Recommended (100 chars)

```
outfit,AI stylist,weather,clothing,wardrobe,fashion advice,what to wear,style,daily look,dress
```
Count: 93 chars ✓  
Note: Do not include "Outfit Oracle", "Oracle", "AI", "Style", "Advisor" — already in the title/subtitle and would be wasted.

**Iteration cadence:** Review keyword rankings every 30 days. Swap out keywords ranked outside the top 10 that have not improved over 2 consecutive reporting periods.

### Keywords NOT Worth Using
| Keyword | Why to skip |
|---------|-------------|
| `fashion` | Volume 10M+; Vogue, Net-a-Porter, every major brand owns this. Unwinnable. |
| `clothes` | Too generic; low purchase intent |
| `shopping` | Wrong job-to-be-done; implies a store, not an advisor |
| `model` | High volume but wrong audience (aspiring models) |
| `trends` | Trend-chasers are not retention users |

---

## Competitive Keyword Gap Analysis

Pulled from [COMPETITOR_ANALYSIS.md](COMPETITOR_ANALYSIS.md). These are keywords competitors rank for that we do not yet target:

| Keyword | Who ranks | Our opportunity |
|---------|-----------|----------------|
| `outfit generator` | Cladwell | Medium — add to keyword field |
| `capsule wardrobe` | Stylebook, Indyx | Low — wrong positioning for us |
| `personal stylist app` | Wishi, Indyx | High — add "personal stylist" to description |
| `get dressed` | Smart Closet | Medium — add to Play description |
| `fashion oracle` | Nobody | High — we own this term, lean into it |
| `AI outfit picker` | Nobody strong | Very high — new term, low competition |
| `weather clothes` | Weather apps | Medium — niche but very intentful |
| `what should i wear` | Multiple weak apps | High — exact match to the oracle question |
| `AI fashion advisor` | No strong owner | Very high — exact match for our product; zero dominant app |
| `style assistant` | Alta, xlook | High — growing cluster, no dominant owner |
| `outfit picker AI` | No strong owner | High — long-tail, high conversion intent |
| `AI wardrobe` | Whering, Alta | Medium — captures wardrobe-adjacent searchers; wrong job-to-be-done for us so use sparingly |

**Immediate action:** Add `AI outfit picker`, `fashion oracle`, `what should i wear`, and `AI fashion advisor` to the keyword field on next metadata update.

---

## Hidden Keyword Surfaces

Beyond the standard keyword field, three indexed surfaces are almost always ignored. Each one is free, requires no additional submissions, and compounds over time.

### Developer Name

Apple and Google Play both index the developer name. Most teams use their legal entity name ("Melanie Arellano" or "OutfitOracle LLC"), which contributes nothing to ranking. The name that appears under your app title in search results has ~50 characters of keyword potential.

**Strategy:** The developer name should capture at least one high-value keyword not already in the title, subtitle, or keyword field. "Fashion" and "Style" are the best candidates — both are too competitive to waste the 100-char keyword field on, but capturing them via developer name is free.

| Option | Keyword signal | Notes |
|--------|---------------|-------|
| `Oracle Fashion Labs` | "fashion", "labs" (authority signal) | Clean, studio-like credibility |
| `Oracle Style Studio` | "style", "studio" | Distinct from the app name |
| **`Oracle Fashion Studio`** | "fashion", "studio" | Recommended — indexed, credible |
| `AI Fashion Technology` | "AI", "fashion", "technology" | Generic but keyword-dense |

Do not repeat words already in the app title ("Outfit", "Oracle", "Advisor"). Duplication across metadata fields is ignored — it is not additive.

### In-App Purchase Names (When Pro Tier Ships)

Apple indexes IAP display names. The indexing weight is lighter than title/subtitle, but the cost of optimising is zero. When Oracle Pro launches, name IAPs with keyword intent rather than generic tier names:

| IAP | Avoid | Use instead |
|-----|-------|------------|
| Monthly subscription | `Outfit Oracle Pro Monthly` | `Oracle Pro — AI Style Advisor` |
| Annual subscription | `Outfit Oracle Pro Annual` | `Oracle Pro — AI Fashion Stylist` |
| Unlimited consults | `Remove Limit Pack` | `Unlimited Oracle Consults` |

Rules: Keep "Oracle" in every IAP name (reinforces the brand keyword). Each IAP should contain at least one keyword not in the title. Do not repeat the same keyword across IAPs.

### Single-Word Keyword Field Tactic

Apple's algorithm auto-generates keyword combinations from all indexed fields. Entering `outfit,weather,AI,stylist` into the keyword field generates: "outfit weather", "weather stylist", "AI outfit", "AI stylist" — far more coverage than entering individual phrases.

**Implication:** Use single words in the keyword field. Place multi-word phrases in the title and subtitle, where phrase-match carries higher weight. The keyword field should extend the combination space, not duplicate phrases already in title/subtitle.

**Current field (inefficient):**
```
outfit,AI stylist,weather,clothing,wardrobe,fashion advice,what to wear,style,daily look,dress
```

**Revised field (single words, more combinations):**
```
outfit,stylist,weather,clothing,wardrobe,advice,look,dress,travel,occasion,verdict,guide
```
Count: 76 chars ✓ — saves 17 chars for additional keywords while generating more unique combinations.

**Exception:** Keep multi-word phrases that represent exact high-intent queries Apple is unlikely to generate from components. "What to wear" (a common 3-word search) is worth keeping. "Fashion advice" is not — Apple will combine "fashion" + "advice" itself.

---

## Seasonal Keyword Calendar

Fashion search volume is strongly seasonal. Missing the pre-season indexing window means missing peak demand. Apple takes 7–14 days to index metadata changes — update 3 weeks before each season's search peak, not on the day.

### Seasonal Update Schedule

| Season | Keyword update window | Add to field | Remove from field |
|--------|----------------------|-------------|-------------------|
| **Spring** | Early February | `spring outfit`, `transitional look`, `rain outfit` | `winter layering`, `cold weather dressing` |
| **Summer** | Early April | `summer outfit`, `heat dressing`, `vacation look`, `linen` | `spring layers`, `rain outfit` |
| **Fall** | Early August | `fall outfit`, `autumn layers`, `back to work look` | `summer outfit`, `vacation look` |
| **Winter** | Early October | `winter outfit`, `cold weather`, `layering`, `coat` | `fall outfit`, `autumn layers` |

**Rule:** Never replace more than 20% of keywords at once. Seasonal swaps should only touch the lowest-performing current keywords (by rank report). Core terms — "outfit", "AI stylist", "weather", "clothing" — are evergreen and never rotated out.

### Fashion Week Windows

Fashion Week drives measurable search spikes for style-related terms. Add fashion week keywords 2 weeks before each city's show dates, then rotate out within 30 days.

| Fashion Week | Show dates (approx) | Keywords to temporarily add |
|-------------|-------------------|----------------------------|
| New York | Early Sept / Early Feb | `fashion week outfit`, `NYFW style`, `New York fashion` |
| London | Mid-Sept / Mid-Feb | `LFW outfit`, `London fashion style` |
| Milan | Late Sept / Late Feb | `MFW outfit`, `Milan fashion week` |
| Paris | Late Sept / Early March | `PFW outfit`, `Paris fashion style`, `Paris chic` |

**In-App Events connection:** Run a "Fashion Week Oracle Edition" In-App Event during each city's Fashion Week window. The event's indexed name and description capture the spike keywords while the event itself earns editorial placement.

### Seasonal Screenshot Updates

Screenshots can (and should) change with seasons. The Editorial Dark theme works year-round but captions and city choices should reflect the season:
- Summer: swap hero city to a warm-weather destination (Los Angeles, Barcelona)
- Winter: show a cold-weather verdict with layering complexity visible
- Fashion Week: add a screenshot showing a fashion-capital city (Paris, Milan) consult

Do not change screenshots and keywords at the same time — change one element per cycle to maintain attribution clarity.

---

## Description

### iOS Long Description

The description does not affect search ranking on iOS but is the primary conversion tool after screenshots. Write for the user who is on the fence. Structure: hook → problem → product → proof → call to action.

```
The Oracle knows what to wear. You just have to ask.

Outfit Oracle reads the weather in any city and hands you a complete outfit verdict — 
specific, confident, and tailored to your taste. No mood boards. No scrolling. 
One authoritative answer.

──────────────────────────────

HOW IT WORKS
Open the app. Enter your city. The Oracle checks today's weather and conditions,
then delivers a full outfit prescription: top, bottom, layer, shoes, and accessories —
with the exact reasoning behind every choice.

──────────────────────────────

BUILT FOR YOUR STYLE
Set your aesthetic — editorial, minimalist, streetwear, classic, or anything between —
and the Oracle adapts. The more you use it, the sharper it gets.

──────────────────────────────

EVERY CITY IN THE WORLD
Travelling? Moving? The Oracle works anywhere. Real-time weather from any location,
matched to local climate and occasion context.

──────────────────────────────

TRACK YOUR LOOKS
Save verdicts to your archive. Build a visual record of your best days. 
Unlock 127 style badges across 15 categories as you explore different cities, 
weather conditions, and occasions.

──────────────────────────────

YOUR UNSOLICITED STYLE AUTHORITY
```

**Writing rules:**
- No marketing superlatives ("best", "ultimate", "amazing")
- Lead with what the user can do, not what the app has
- Short paragraphs — store descriptions are read on a 6" screen
- The first 252 chars appear before "More" — make them count

### Google Play Long Description

Play description IS indexed. Repeat high-value keywords naturally.

Target keyword density: `outfit` 4x, `AI` 3x, `weather` 4x, `style` 3x, `fashion` 2x.

```
Outfit Oracle is an AI-powered fashion advisor that tells you exactly what to wear — 
based on the real-time weather in any city in the world.

WHAT THE APP DOES
Enter your city. The Oracle reads today's weather — temperature, wind, humidity, UV 
index, and conditions — then generates a complete outfit prescription. Every item is 
specific, reasoned, and matched to your personal style.

No wardrobe cataloging required. Open the app, get your outfit. Done.

AI STYLE ADVISOR
Outfit Oracle uses Claude AI (Anthropic) to build outfit recommendations that feel 
like advice from an editor who knows your aesthetic — not a generic algorithm. The 
more you describe your taste, the sharper the oracle gets.

WEATHER-AWARE FASHION
Your outfit changes with the weather. Outfit Oracle tracks temperature, rain 
probability, UV index, wind, and humidity — and factors all of it into the verdict. 
No more being underdressed for a cold front or overdressed for an unexpectedly warm day.

WORKS ANYWHERE
From your home city to a last-minute trip to Tokyo — the Oracle has real-time weather 
for every city on the planet. Use it at home, use it while travelling.

STYLE GAMIFICATION
Unlock 127 achievement badges across 15 style categories as you consult the Oracle 
across different weather conditions, cities, and occasions. Track your consulting streak. 
Earn your rank.

WHO IT'S FOR
• Style-conscious people who want a fast, authoritative morning answer
• Frequent travellers who need outfit advice in unfamiliar climates  
• Anyone who spends too long deciding what to wear

Outfit Oracle. Your unsolicited style authority.
```

---

## Screenshots Strategy

Screenshots are the single highest-leverage conversion element on the store page. 65–70% of users decide to install or leave based on screenshots alone, before reading a word of the description.

### iOS Screenshot Requirements

| Device | Dimensions | Required? |
|--------|-----------|----------|
| iPhone 6.9" (iPhone 16 Pro Max) | 1320 × 2868 px | YES — shown by default on newer devices |
| iPhone 6.5" (iPhone 14 Pro Max) | 1284 × 2778 px | YES — fallback for most devices |
| iPhone 5.5" (iPhone 8 Plus) | 1242 × 2208 px | Recommended |
| iPad Pro 12.9" | 2048 × 2732 px | Required if iPad supported |

**Min set:** 3 screenshots. **Optimal set:** 6–8 screenshots.  
**File format:** PNG or JPEG. No rounded corners (Apple adds them).

### Screenshot Content Plan (6-screen sequence)

| Position | Content | Goal |
|----------|---------|------|
| **1 — Hero** | Full oracle verdict screen: city, weather strip, verdict card with full outfit. Bold caption overlay: *"What to wear today."* | First impression — must communicate the product in 1 second |
| **2 — Weather + AI** | Weather Glance Card with condition animation + Claude's reasoning text visible. Caption: *"Reads the weather. Recommends the outfit."* | Establish the weather-AI differentiator |
| **3 — Outfit detail** | Outfit cards in full: Top, Bottom, Layer, Shoes — with accent colors and shop links visible. Caption: *"Specific. Never generic."* | Show the depth of the recommendation |
| **4 — Themes** | Side-by-side Editorial vs Y2K vs Mondrian screens. Caption: *"13 visual themes. Your aesthetic, your interface."* | Showcase the design differentiation; attracts style-literate users |
| **5 — City passport** | City passport/map screen with fashion capital badges. Caption: *"Your global style record."* | Surface the gamification/travel angle |
| **6 — Badges / You screen** | Badge grid + streak counter. Caption: *"127 ways to earn your Oracle rank."* | Reinforce retention and depth |

**Screenshot rules:**
- Caption text: max 5 words. If you need more, the visual is not doing its job.
- Do not show onboarding screens — show the product at full value
- Consistent device frame (or no frame) across all screenshots
- Use the Editorial Dark theme for screenshots — best contrast, most premium-looking
- No "Award Winner" or "Top App" badges — those are Apple policy violations unless sourced from Apple

**Screenshot caption keywords (2025 algorithm note):** Apple may now be extracting text from screenshot caption overlays as additional keyword signals — confirmed by Appfigures as "one of the most significant algorithm changes in years," though Apple has not officially confirmed it and AppTweak's position is that broad indexing is not yet proven. Cost of alignment is zero: write captions as keyword phrases, not pure marketing copy. "Weather-aware outfit advice" is better than "Smart. Simple. Stylish." Both fit in 5 words. Keywords in captions do not count as duplicates against the 100-char keyword field — use important terms in both.

### Preview Video (App Preview)

iOS App Preview: 15–30 seconds, autoplays muted, must show actual app UI (no screen recordings from a simulator).

**Recommended script:**
1. 0–3s: App icon → Oracle verdict appearing (hook)
2. 3–8s: Weather data being read → outfit cards populating (the "how it works" moment)
3. 8–15s: Theme switch → Y2K mode → Editorial Dark → the oracle voice (aesthetic range)
4. 15–22s: City passport + badge unlock animation (depth/gamification)
5. 22–30s: Logo + tagline: *"Your unsolicited style authority."*

**Do not:** show the sign-up screen, loading states, or any error states.

---

## App Icon

The icon is the face of the app in search results, featured lists, and the device home screen. It is an advertising asset, not decoration.

### Current Icon Assessment
The current icon (logo-dark.png) should be evaluated against:
- Legibility at 29×29px (notification size)
- Distinctiveness in a grid of competitor icons
- Coherence with the editorial aesthetic

### Icon Principles for Outfit Oracle
- **Dark background** preferred — stands out on the white app store background
- **Single strong symbol** — no wordmarks; icons are too small
- The O-mark or a stylised oracle eye motif would be distinctive
- Avoid: clothing illustrations (too literal), hanger icons (Stylebook owns this space), weather symbols

### A/B Testing Icons
Apple Product Page Optimization allows up to 3 icon variants tested simultaneously. Test:
- Variant A: Current icon (dark background, O-mark)
- Variant B: Scarlet background, monogram
- Variant C: Minimal cream/ivory with geometric oracle motif

Run each test for a minimum of 90 days to reach statistical significance (minimum 1000 impressions per variant).

---

## Ratings & Reviews Strategy

### Why This Matters for ASO
The algorithm weighs:
1. **Average rating** (4.0+ needed to rank; 4.5+ for featured consideration)
2. **Volume of ratings** (more is better; 50+ to be taken seriously; 500+ for strong signal)
3. **Recency** (fresh ratings outweigh old ones; Apple weights the last 30 days)
4. **Response rate** — Apple/Google reward developers who respond to reviews

### In-App Rating Prompt Rules
Apple's `SKStoreReviewRequest` API guidelines:
- Can only be called 3 times per 365-day period
- Cannot be triggered by a button the user tapped ("Rate us!")
- Must be triggered by a natural positive moment

**Optimal trigger points for Outfit Oracle:**
1. After the user's **3rd consult** — they've validated the core loop
2. After a **badge unlock** — emotional high point, natural celebration moment
3. After a **streak milestone** (7-day, 30-day) — confirmed habitual user

**What not to do:**
- Do not prompt on first launch
- Do not prompt after an error or loading state
- Do not prompt mid-session before the user has seen a verdict

### Review Response Protocol

Respond to **every 1, 2, and 3-star review** within 72 hours. Template structure:
1. Acknowledge the specific issue (don't be generic)
2. Explain what was fixed or is being fixed (if anything)
3. Invite them back with a specific version number

Good: *"Thanks for the feedback on the loading time — we fixed the caching issue in v1.5 and consults now load in under 2 seconds. Would love to know if that resolves it."*  
Bad: *"Thanks for your feedback! We're always working to improve!"*

Respond to **positive reviews** at least selectively — it signals to Apple that the developer is engaged.

### Rating Velocity: Zero to Fifty

The first 50 ratings define the store page for months. A 3.8 from 20 early ratings is recoverable but painful — it suppresses conversion, which suppresses impressions, which suppresses new ratings. The only clean path is 50 ratings fast at 4.5+.

**Rating velocity matters more than average score.** An app with a 4.2 rating collecting 100 reviews per week will typically outrank a 4.5-rated app collecting 5 per week. The algorithm reads velocity as a proxy for active usage and user satisfaction.

**Launch week tactics — in order of impact:**

1. **Prime beta testers before App Store day 1.** TestFlight users who have been using the app for 2+ weeks are the most satisfied users you will ever have. Before submitting to the App Store, send a personal message (DM or email, not in-app) asking if they'd leave a review on launch day. Ten testers who say yes = ten reviews at launch. Frame it: "We go live on [date] — one review from you changes how the algorithm treats us in the first week."

2. **Use Instagram on launch day.** Post a Story with a review link (not just "link in bio" — use the direct App Store review URL in a link sticker). Your first 100 followers are disproportionately high-intent and willing to help. Phrase: "We launched today — a 30-second review changes the App Store algorithm for us." Direct, specific, no guilt.

3. **Time the in-app prompt precisely.** Day-1 users are still evaluating. Day-3 users who return have self-selected as satisfied. The `SKStoreReviewRequest` at the 3rd consult is correct — do not move this earlier.

4. **Badge unlock is the peak trigger.** Badge animations are emotional highs. The review prompt placed immediately after a badge animation closes is the highest-converting moment in the product lifecycle.

5. **Streak milestones.** Users on a 7-day or 30-day streak are confirmed habitual users. They are the safest possible moment to prompt — lowest churn, highest satisfaction.

**Never:**
- Incentivise reviews with free features, credits, or any reward (Apple and Google ban this; app can be removed)
- Ask people to review from the same IP or household (flagged as manipulation)
- Purchase reviews from any service (permanent account suspension risk)

### Review Gating (Legal Implementation)

Apple's guidelines ban "review gating" — routing unhappy users away from the App Store before they can review. However, a pre-prompt satisfaction check routed to an **in-app feedback form** (not a block on App Store access) is legal and widely used.

**Legal implementation pattern:**

```
Trigger: after 3rd consult or badge unlock

Screen 1:
  "Quick check before we ask — how's the Oracle working for you?"
  → [It's great]     → fires SKStoreReviewRequest
  → [Could be better] → opens in-app feedback form (text field, send button)
```

The critical distinction: the unhappy path leads to a genuine feedback form that is monitored and actioned — not a dead end. Users on the unhappy path are not blocked from reviewing the app on the App Store; they can still navigate there independently.

**Why this is worth implementing:** The 3 annual `SKStoreReviewRequest` calls are a scarce resource. Using one on a user at a frustrating moment produces a 1-star review that costs more in conversion suppression than a missed prompt would have. The satisfaction gate preserves the call for users in a positive state.

**Implementation note:** The feedback form responses should feed into a real inbox (`support@outfitoracle.fashion`) and be reviewed weekly. Apple has rejected apps where the "feedback" path was clearly a dead end — it must be genuine.

---

## Category Selection

### Primary Category
**Lifestyle** — most installs come from Browse and category-level recommendations. Lifestyle has lower competition than Shopping and Entertainment, and aligns with how the target user self-identifies.

### Secondary Category  
**Shopping** — captures cross-category recommendation placement. Users browsing shopping apps have demonstrated purchase intent; outfit recommendation is a natural adjacent category.

**Do not use:**
- Health & Fitness — wrong audience, wrong job-to-be-done
- Entertainment — miscategorises the app as passive consumption
- Utilities — undersells the product

---

## Localization Strategy

Localising the store listing (title, keywords, description) for additional markets is the highest-ROI ASO action after the English base is optimised. Keywords are market-specific — German users search differently than American users for the same product.

### Priority Markets (Phase 1)

| Market | Language | Why |
|--------|----------|-----|
| **United States** | en-US | Primary market, largest App Store |
| **United Kingdom** | en-GB | Same language, fashion-forward culture, high LTV |
| **Canada** | en-CA / fr-CA | Adjacent market; ECCC weather alerts already integrated |
| **Australia** | en-AU | English-speaking, fashion-conscious, weather-variable |

### Priority Markets (Phase 2 — localize keywords only)

| Market | Language | Key keyword adaptations |
|--------|----------|------------------------|
| **France** | fr | `tenue du jour`, `conseil mode`, `météo vêtements` |
| **Germany** | de | `Outfit des Tages`, `KI Modeberaterin`, `was anziehen heute` |
| **Japan** | ja | `コーデ`, `天気`, `AIスタイリスト` |
| **Brazil** | pt-BR | `roupa do dia`, `stylista IA`, `o que vestir hoje` |

**Localization rule:** Localise the **keywords and title** in each market before translating the description. Keyword localisation takes 20 minutes; full description translation takes hours. Do keywords first.

---

## Featured by Apple

App Store featuring is editorial, not algorithmic, but it is heavily influenced by:
1. **High conversion rate** on the product page (screenshots do the work)
2. **Recent release or major update** — featuring happens within 2–4 weeks of launch
3. **Active developer response** to reviews
4. **Technical quality** — no crashes, no ANRs, no App Review rejections
5. **Unique or innovative use of platform features** — Live Activities, Dynamic Island, Widgets

### Outfit Oracle's Path to Feature Consideration

| Action | Status | When |
|--------|--------|------|
| Submit for App Store featuring consideration | Not done | Before v1.5 launch |
| Add a Lock Screen widget (outfit of the day) | Backlog | v1.6 |
| Add a Dynamic Island Live Activity (weather → outfit) | Backlog | v1.7 |
| Support App Clips (zero-install demo consult) | Backlog | v2.0 |
| Submit to "Apps We Love" editorial consideration | Not done | After 50+ ratings |

**How to submit:** App Store Connect → App Information → "Promotional Artwork" section → fill in the pitch form. Apple does not confirm submissions or guarantee consideration.

### iOS Platform Features: Widgets, Live Activities, App Clips

Apple explicitly lists "unique or innovative use of platform features" as a featuring consideration factor. These three features have direct ASO impact — each one improves retention signals, earns editorial attention, or reduces the barrier to first use.

**Build order recommendation: Widget → Live Activity → App Clip** (ascending complexity; widget is a weekend project, App Clip requires a separate target and review).

---

#### Home Screen & Lock Screen Widgets

A widget showing the Oracle's daily verdict — city name, weather condition icon, and the top outfit recommendation — lives on the user's home screen and functions as a daily retention nudge without requiring an app open.

**ASO impact:**
- Home screen presence means the app icon is seen daily even on non-open days, which reduces the uninstall signal
- Widgets increase daily active usage (the retention metric the algorithm rewards)
- Lock Screen widgets (iOS 16+) are one of the features Apple's editorial team actively looks for when selecting apps to feature
- Apple specifically features widget-capable apps in "Apps We Love" editorial

**Recommended widget: `Today's Verdict`**
- Small: city name + condition icon + 1-line verdict
- Medium: city + weather strip + top outfit piece
- Lock Screen: condition icon + city + temperature

Refreshes every morning via background fetch. Tapping opens the Oracle tab directly. Cost: one weekend to build with WidgetKit; no new backend endpoints required.

---

#### Live Activities / Dynamic Island

A Live Activity for the Oracle displays real-time consult progress in the Dynamic Island and Lock Screen — weather fetching → verdict generating → done — with the final verdict's lead piece ("Layer: camel coat") persisting in the Dynamic Island after completion.

**ASO impact:**
- Apple lists Live Activities as an explicit featuring consideration
- Dynamic Island presence = persistent brand visibility between app opens
- Live Activities that surface genuinely useful real-time information get editorial attention; fashion + weather is a strong use case

**Implementation scope:**
- Start state: "Checking the weather in [city]…" — weather condition icon animating
- Update: "Building your verdict…" — shimmer loader
- End state: top outfit item + condition icon; taps into the full verdict screen
- Expiry: auto-dismiss after 2 hours (user has presumably dressed by then)

---

#### App Clips

A zero-install demo consult: a QR code or NFC tag on the outfitoracle.fashion website, in press kits, or on physical collateral triggers a mini Outfit Oracle experience — enter a city, see one verdict — with no App Store download required. If the verdict is compelling, the full install prompt appears at the end.

**ASO impact:**
- Apple's editorial team features App Clips that demonstrate clear, focused utility with no friction
- Clip-to-install conversion is higher than cold organic install — users have already experienced value before the install ask
- App Clips surface in Maps, Safari, and Siri Suggestions — contexts where the App Store would never appear
- A well-executed App Clip is a PR asset: "try the Oracle without downloading anything" is a genuinely shareable angle for fashion media

**Clip scope (keep it under 10 MB):**
- One screen: city text input → consult button
- One result: weather strip + 3 outfit items (stripped-down verdict card)
- One CTA: "Get the full Oracle" → App Store install page
- No auth, no onboarding, no theme switching — just the core loop

**Trigger points to set up:** QR code on website hero, NFC tag in press kit PDF, `appclip.outfitoracle.fashion` subdomain for direct link sharing.

---

## Smart App Banners

A Smart App Banner is an Apple-native strip that appears at the top of mobile Safari pages, prompting visitors to open or install the app. It requires a single `<meta>` tag in the page `<head>`:

```html
<meta name="apple-itunes-app" content="app-id=YOUR_APP_ID">
```

Add this to **outfitoracle.fashion** before launch. The banner:
- Appears automatically on iOS Safari with no JavaScript required
- Shows the app icon, name, and star rating
- Deep-links into the app if already installed (no re-download prompt)
- Is tracked in App Store Connect Analytics under "Web Referrer" source

The marketing site is the primary referral path at launch (Instagram bio → website → App Store). The Smart App Banner removes one tap from that funnel. The `app-id` is in App Store Connect → App Information. No app code changes required.

---

## Product Page Optimization (A/B Testing)

Apple's Product Page Optimization (PPO) allows testing of:
- Up to 3 treatment pages vs 1 control
- Icon, screenshots, and preview video can be tested
- Traffic is split by Apple automatically (min. 5% per treatment)

### Current Test Priority

**Test 1: Screenshot set (Conversion impact — highest priority)**  
Control: No screenshots (current state)  
Treatment A: 6 screenshots — editorial aesthetic, dark theme  
Treatment B: 6 screenshots — bright theme (Morning Paper), lifestyle framing  
Success metric: Install conversion rate  
Minimum runtime: 90 days

**Test 2: Icon**  
After Test 1 concludes and a winning screenshot set is locked.

**Test 3: Title wording**  
Test "AI Style Advisor" vs "AI Fashion Oracle" vs "AI Personal Stylist" in subtitle.

---

## Custom Product Pages (CPPs)

Custom Product Pages let you create up to **70** alternate store listings — each with its own URL, different screenshots, preview video, and promotional text. As of June 2025, CPPs now appear in **organic search results**, not just paid campaigns. This makes them a full ASO lever, not only a paid traffic tool.

Apple reports a **156% average CVR lift** when users arrive at a CPP matched to their intent vs the default product page.

### How CPPs Work

- Each CPP has a unique App Store URL
- Screenshots, preview video, and promotional text differ per page
- App name, icon, ratings, and long description are shared with the default page
- Goal: **message-match** between what drove the click and what the page shows

### CPP Strategy for Outfit Oracle

Build three CPPs as a starting set, each targeting a distinct intent cluster:

| CPP | Target query cluster | Page headline | Key screenshot diff |
|-----|---------------------|---------------|---------------------|
| **Weather** | "what to wear today", "dress for weather", "weather outfit" | "The Oracle reads the weather first" | Lead with weather strip → verdict; emphasize the data-to-outfit pipeline |
| **AI angle** | "AI stylist", "AI outfit", "AI fashion advisor" | "Your AI fashion authority" | Lead with the AI verdict card and outfit item breakdown |
| **Travel** | "outfit abroad", "packing outfits", "travel style" | "Any city. Any climate. Any occasion." | Lead with city passport / multi-city map view; emphasize global coverage |

**Keyword linking:** Wire each CPP to its keyword cluster in Apple Search Ads. Users who tap an ad see the page version that matches what they searched — message-match maximises install intent.

### CPP Rules
- Screenshots must show real in-app UI — no mockups or illustrations
- App name and icon cannot be changed per CPP
- Review time mirrors standard metadata updates (1–3 business days)
- Track CPP conversion rates separately in App Store Connect Analytics

---

## In-App Events

In-App Events are Apple's editorial promotion format: a card that appears on your App Store product page and in search results, editorial sections, and the Today tab. Up to **5 events** can run simultaneously. Each event lasts up to **31 days** and can be promoted up to 14 days before it starts.

**ASO impact:** The event name (30 chars) and short description (70 chars) are indexed for search — an extra 100 characters of keyword real estate beyond the standard keyword field. Only 30–40% of non-gaming lifestyle apps currently use In-App Events, so early adoption is a low-competition advantage.

### Event Types Available to Outfit Oracle

| Type | Apple's definition | Outfit Oracle use case |
|------|-------------------|------------------------|
| **Challenge** | Time-limited activity encouraging users to reach a goal | Weekly style challenge (already exists in-app — promote it externally) |
| **Major Update** | Significant feature release | v1.6, v2.0 launches |
| **Live Event** | Real-time event available to all users | Fashion Week Oracle Edition (NY, Paris, Milan, London) |
| **Premiere** | Debut of new content or a new collection | Seasonal theme launch (e.g. Summer Editorial) |

Note: Discounts, sales, and daily repeating activities are explicitly excluded by Apple policy and will be rejected.

### Event Keyword Strategy

Front-load keywords in the event name and short description — these are the only fields indexed:

| Event | Name (30 chars) | Short description (70 chars) |
|-------|-----------------|------------------------------|
| Weekly challenge | `Oracle Style Challenge` | `7-day weather-aware outfit challenge. Earn your rank.` |
| Fashion Week | `Paris Fashion Week: Oracle Edit` | `AI outfit verdicts for fashion week. Wear it right.` |
| Major update | `Oracle v2: Wardrobe Intelligence` | `Teach the Oracle your closet. Smarter daily verdicts.` |
| Summer theme | `Summer Editorial Drop` | `New season. New theme. AI outfit verdicts for the heat.` |

### Event Submission Checklist
- [ ] Event name (30 chars) — keyword-first, not marketing-first
- [ ] Short description (70 chars) — keyword-aware, benefit-led
- [ ] Long description (120 chars)
- [ ] Event card image: 1080 × 1920 px portrait, real in-app UI
- [ ] Start and end date set (max 31 days)
- [ ] Event badge type selected
- [ ] Submitted for review at least 5 business days before the start date

---

## Google Play: Custom Store Listings (CSLs)

Google Play's equivalent of Apple's Custom Product Pages. Up to **50 CSLs** can run simultaneously. Unlike Apple CPPs, CSLs can be triggered by five distinct signals — country, Google Ads campaign, keyword, install state, or custom URL. This makes them more flexible for segmentation.

Phiture case study: **57% CVR increase** over two months using keyword-targeted CSLs on a lifestyle app.

### How CSLs Differ from CPPs

| Feature | Apple CPPs | Google Play CSLs |
|---------|-----------|-----------------|
| Max simultaneous | 70 | 50 |
| Trigger types | URL / ASA campaign | Country, keyword, Ads campaign, install state, URL |
| Indexed for organic search | Yes (June 2025) | Yes — via keyword targeting |
| Content that can vary | Screenshots, preview, promo text | Short description, long description, screenshots, icon |
| Shared fields | App name, icon, description, ratings | App name, ratings |

### CSL Strategy for Outfit Oracle

| CSL | Trigger | Key change from default |
|-----|---------|------------------------|
| **Weather intent** | Keyword: "weather", "what to wear today", "dress for weather" | Lead screenshot: weather strip → verdict; short description emphasizes real-time data |
| **AI intent** | Keyword: "AI stylist", "AI outfit", "AI fashion" | Lead screenshot: verdict card; short description: "Claude AI tells you what to wear" |
| **Travel intent** | Keyword: "travel outfit", "packing", "vacation style" | Lead screenshot: city passport; short description: "Oracle covers every city in the world" |
| **Returning users** | Install state: previously uninstalled | Short description emphasizes what's new since they left |
| **UK market** | Country: GB | British English throughout ("travelling", "wardrobe", "favourite colour") |
| **French market** | Country: FR | Full French short description with `tenue du jour`, `conseil mode` keywords |

**Note:** Google Play also has Store Listing Experiments (their equivalent of Apple's PPO A/B testing). Run these via Play Console → Store Presence → Store Listing Experiments. Minimum 2 weeks per test; Play provides statistical significance indicators automatically.

---

## Google Play: Promotional Content (LiveOps)

Google Play's equivalent of Apple's In-App Events. Promotional content lets you showcase events, updates, and offers directly on the Play Store listing — appearing in search results, category pages, and the editorial "Offers" tab.

Google reports that apps running Promotional Content during the launch beta saw **+5% more active users and +4% higher revenue** than apps that did not.

### Key Differences from Apple In-App Events

| Feature | Apple In-App Events | Google Play Promotional Content |
|---------|--------------------|---------------------------------|
| Indexed fields | Name + short description | Title + description |
| Visual format | Portrait card (1080×1920 px) | Landscape card (1024×500 px) |
| Max duration | 31 days | 14 days |
| Approval wait | 5 business days | 2–3 business days |
| Policy on discounts | Banned — real in-app experiences only | Allowed — can promote offers and sales |
| Live events | Supported | Supported |

### Promotional Content for Outfit Oracle on Google Play

| Content | Title | Description |
|---------|-------|-------------|
| Style Challenge | `Oracle Style Challenge` | `7-day AI outfit challenge. Beat the weather, earn your rank.` |
| Summer drop | `Summer Oracle Edition` | `AI outfit verdicts for summer heat. New themes, new season.` |
| Feature update | `v2.0: Wardrobe Intelligence` | `Teach the Oracle your closet. AI verdicts from what you actually own.` |
| Fashion Week | `Paris Fashion Week: Oracle Edit` | `AI outfit advice for fashion week. Any city, any occasion.` |

**Workflow difference:** Submit iOS In-App Events and Google Play Promotional Content simultaneously for the same campaign, but prepare separate assets (portrait vs landscape card) and different review lead times (5 days vs 2–3 days).

---

## Apple Search Ads — The ASO Connection

Apple Search Ads (ASA) and organic ASO are a closed feedback loop. They are not separate budgets for separate goals — they are the same funnel running in parallel.

### How They Connect

1. **Relevance as eligibility filter.** Apple scores every keyword bid for relevance before the auction. An app with weak metadata for a keyword cannot outbid its way into that result — relevance blocks the bid. Strong ASO = more keywords become biddable at lower cost per tap.
2. **Quality score feedback.** High tap-through and post-install engagement rates (produced by a well-optimised product page) lower your effective cost-per-tap. The same conversion quality that improves organic rank also lowers paid CPA.
3. **Keyword discovery.** Running broad-match ASA campaigns surfaces the actual search terms users convert on — faster and more reliable than keyword tools alone. These terms are the most valuable additions to the organic metadata field.

### Minimum Viable ASA Strategy at Launch

Organic rank takes 3–6 months to build. A small ASA budget bridges the gap and generates keyword intelligence:

| Campaign | Goal | Suggested daily budget | Keyword approach |
|----------|------|----------------------|-----------------|
| **Brand** | Own your name — competitors can buy it | $5–10 | "Outfit Oracle" exact match |
| **Discovery** | Find high-converting search terms | $15–20 | Broad match on 10 seed keywords |
| **Competitor** | Appear when users search rivals | $10 | "Indyx", "Cladwell", "what to wear app" exact match |

The brand campaign is non-negotiable at launch. At low volume it costs almost nothing; without it, a competitor can rank above your own name in search.

### ASA Data → ASO Metadata Cadence

Every 30 days, pull the Search Terms Report from ASA. Apply this decision rule:

| Signal | Action |
|--------|--------|
| High impressions + high conversion | Add to organic keyword field (or elevate into title/subtitle) |
| High impressions + low conversion | Investigate creative — intent may not match the page |
| Zero impressions | Low search volume; deprioritise |

Do not run ASA campaigns until organic ASO fundamentals are in place (title, subtitle, keyword field, screenshots). Running ads to a weak product page wastes budget and generates a poor quality score that carries forward.

---

## Market Context

Understanding category scale calibrates keyword ambition and informs the acquisition vs competition tradeoff.

| Metric | Value | Source |
|--------|-------|--------|
| AI fashion app users (2025) | 47 million | InsightAce Analytic |
| Projected users (end 2026) | 85 million+ | InsightAce Analytic |
| AI personal stylist market size (2025) | $1.2 billion | DataIntelo |
| Market CAGR (2026–2034) | 21.3% | DataIntelo |
| Projected market size (2034) | $6.8 billion | DataIntelo |

**ASO implication:** The "AI stylist" and "AI outfit" keyword clusters are growing with the market — competition for these terms will increase year over year. Ranking for them now costs far less than ranking for them in 2027. Early organic investment in the AI-angle keywords has disproportionate long-term value.

**Positioning note:** The mass market searches for "AI stylist." Outfit Oracle's oracle positioning is distinctive and converts — but the keyword field must capture "AI stylist" traffic because that is what users type even when the oracle framing is what makes them stay. Rank for how they search; convert on what makes you different.

---

## Key Metrics to Track

### Discoverability Metrics
| Metric | Where | Target |
|--------|-------|--------|
| Keyword impressions | App Store Connect Analytics | Trending up week-over-week |
| Keyword rank (top 10 keywords) | AppFollow / Sensor Tower / AppTweak | All 10 keywords in top 50 |
| Browse impressions (non-search) | App Store Connect | >20% of total impressions |
| Search impressions | App Store Connect | 60–70% of total impressions |

### Conversion Metrics
| Metric | Where | Target |
|--------|-------|--------|
| Product page conversion rate | App Store Connect | >35% (industry avg: 25–30%) |
| Impression-to-install rate | App Store Connect | Trending up during screenshot tests |
| Download volume (organic) | App Store Connect | Week-on-week growth |

### Quality Signals
| Metric | Where | Target |
|--------|-------|--------|
| Average rating | App Store / Play | 4.5+ |
| Total ratings | App Store / Play | 50 → 500 → 5000 (milestone targets) |
| Crash rate | Xcode Organizer / Sentry | <1% sessions |
| Day-1 retention | Analytics (PostHog) | >40% |
| Day-7 retention | Analytics | >20% |

---

## ASO Tooling

| Tool | Purpose | Cost |
|------|---------|------|
| **App Store Connect Analytics** | Impressions, conversions, retention — authoritative source | Free |
| **AppFollow** | Keyword tracking, review monitoring, competitor alerts | ~$50/mo |
| **Sensor Tower** | Deep keyword research, download estimates, competitor intel | ~$400/mo (or use sparingly) |
| **AppTweak** | Keyword difficulty scoring, localization research | ~$70/mo |
| **MobileAction** | Creative intelligence (what screenshots competitors test) | ~$100/mo |

**Minimum viable tooling:** App Store Connect Analytics (free) + AppFollow ($50/mo). That covers 80% of what you need for a solo-developer operation.

---

## 30-Day Launch ASO Checklist

### Week 1 — Foundation
- [ ] Set app name to `Outfit Oracle: AI Style Advisor` (or tested variant)
- [ ] Set subtitle: `Weather-Powered Fashion Oracle`
- [ ] Set developer name to `Oracle Fashion Studio` (indexes "fashion" keyword for free)
- [ ] Enter keyword field: single-word optimised, 100 chars, no duplicates from title/subtitle
- [ ] Set Primary: Lifestyle, Secondary: Shopping
- [ ] Upload 6 screenshots (English set — Editorial Dark theme; captions as keyword phrases)
- [ ] Write and upload App Preview video (15–30 sec)
- [ ] Complete full description (iOS + Play)
- [ ] Set up AppFollow keyword rank tracking for 20 target keywords
- [ ] Build first Google Play CSL (Weather intent) alongside default iOS listing
- [ ] Schedule seasonal keyword update dates in calendar (Feb / Apr / Aug / Oct)

### Week 2 — Ratings Foundation + Paid Discovery
- [ ] Implement `SKStoreReviewRequest` trigger on 3rd consult and badge unlock
- [ ] Set up review response rotation (check daily, respond within 72h)
- [ ] Submit featuring consideration form to Apple
- [ ] Launch ASA Brand campaign ($5–10/day, "Outfit Oracle" exact match)
- [ ] Launch ASA Discovery campaign ($15–20/day, broad match on 10 seed keywords)
- [ ] Add Smart App Banner `<meta>` tag to outfitoracle.fashion
- [ ] Create first In-App Event: "Oracle Style Challenge" (Challenge type, 7-day duration)

### Week 3 — Analysis + CPPs
- [ ] Pull first keyword rank report from AppFollow
- [ ] Pull ASA Search Terms Report — identify 3 high-converting terms to add to keyword field
- [ ] Review App Store Connect conversion metrics
- [ ] Identify 3 keywords with low rank + medium volume → swap into field
- [ ] Check if any competitor changed their keywords (AppFollow alert)
- [ ] Build CPP #1 (Weather angle) and submit for review
- [ ] Build CPP #2 (AI angle) and submit for review

### Week 4 — Iteration + CPP Launch
- [ ] Launch Product Page Optimization Test 1 (screenshots variant)
- [ ] Wire CPP #1 and CPP #2 to their ASA keyword clusters
- [ ] Build CPP #3 (Travel angle) and submit
- [ ] Build Google Play CSLs #2 and #3 (AI intent, Travel intent)
- [ ] Submit first Google Play Promotional Content event
- [ ] Localise keyword field for en-GB and en-AU (10 minutes each)
- [ ] Draft French keyword translation for Phase 2
- [ ] Implement review gating pre-prompt (satisfaction check → feedback form or SKStoreReviewRequest)
- [ ] Begin Widget design (Today's Verdict — small + medium + Lock Screen)

### Ongoing — Monthly
- [ ] Pull ASA Search Terms Report → swap bottom keyword performers
- [ ] Check AppFollow rank report for all 20 tracked keywords
- [ ] Respond to all 1–3 star reviews within 72 hours
- [ ] Run a Google Play Store Listing Experiment (rotate quarterly)
- [ ] Refresh seasonal keywords 3 weeks before each season peak (Feb / Apr / Aug / Oct)
- [ ] Submit a new In-App Event (iOS) and Promotional Content (Google Play) each month

---

## Rule: Never Touch Keywords and Screenshots Simultaneously

Changing keywords and screenshots in the same update makes it impossible to attribute any metric change to either variable. Always change one element per update cycle, wait 30+ days for data, then change the next.

---

*ASO is a compound practice. The apps that win are the ones that make small, data-driven improvements every month for two years — not the ones that had a brilliant launch day.*
