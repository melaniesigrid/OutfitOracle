# Outfit Oracle — Affiliate Marketing Strategy
**Monetization Architecture · Growth Strategy · Implementation Roadmap**  
*Internal document — not for distribution*

---

> *"Your unsolicited style authority."*  
> The Oracle recommends. The Oracle discloses. The Oracle cannot be bought. Usually.

---

## Table of Contents

1. [Affiliate Network Selection](#1-affiliate-network-selection)
2. [Business Email Architecture](#2-business-email-architecture)
3. [Data Separation & API Hygiene](#3-data-separation--api-hygiene)
4. [Product Data Model](#4-product-data-model)
5. [App Architecture for Affiliate Links](#5-app-architecture-for-affiliate-links)
6. [Affiliate Disclosure UX](#6-affiliate-disclosure-ux)
7. [Product Recommendation Rules](#7-product-recommendation-rules)
8. [Implementation Roadmap](#8-implementation-roadmap)
9. [Technical Implementation](#9-technical-implementation)
10. [Setup Checklist](#10-setup-checklist)

---

## 1. Affiliate Network Selection

### Tier 1 — Apply First (Day 1)

These networks have the broadest brand coverage, lowest approval barriers for early-stage apps, and the most fashion-relevant inventory.

| Network | Strengths | Commission Range | Approval Difficulty |
|---------|-----------|-----------------|-------------------|
| **LTK (LikeToKnowIt)** | Fashion-native, curated brands, strong creator tools | 5–20% | Medium — requires follower count or app traction |
| **ShareASale** | Thousands of fashion/beauty merchants, easy approval, good API | 4–15% | Low |
| **Rakuten Advertising** | Premium brands (Net-a-Porter, SSENSE, Nordstrom), reliable tracking | 3–10% | Medium |
| **Commission Junction (CJ)** | Large fashion retailers (Revolve, Madewell, Gap), robust reporting | 3–12% | Low-Medium |
| **Impact (impact.com)** | Modern platform, strong API, real-time tracking, used by Reformation, Allbirds | 5–15% | Medium |

### Tier 2 — Apply as Traffic Grows

| Network | Strengths | Commission Range |
|---------|-----------|-----------------|
| **Awin** | European brand coverage (ASOS, & Other Stories, Weekday) | 4–12% |
| **Partnerize** | Enterprise fashion brands, Farfetch, Browns | 5–12% |
| **Amazon Associates** | Long tail — accessories, basics, beauty | 1–4% (low but high conversion) |
| **FARFETCH Partner Program** | Luxury and contemporary, global inventory | 5–8% |

### Direct Brand Partnerships (Later)

Once the app has meaningful traffic (5k+ MAU), approach brands directly:
- **Reformation** — sustainability-forward, editorial-friendly
- **COS / & Other Stories / Arket** — already speak the editorial language
- **Totême, Massimo Dutti** — quiet luxury sweet spot
- **A.P.C., Sandro, Maje** — French aesthetic, strong affiliate appetite
- **The RealReal / Vestiaire** — resale angle, sustainability cred, no-new-clothes positioning

### Priority Brand Categories by Outfit Oracle Use Case

| Oracle use case | Priority retailers |
|----------------|-------------------|
| Cold / winter weather | Canada Goose, Moncler (aspirational), Barbour, Uniqlo |
| Business / work occasion | Reiss, COS, Theory, Banana Republic |
| Casual / weekend | Madewell, Everlane, Arket, ASOS |
| Evening / event | Rent the Runway, Revolve, Anthropologie |
| Accessories | & Other Stories, Mango, Mejuri (jewelry) |
| Footwear | Aldo, Steve Madden, Stuart Weitzman, Senso |
| Beauty / fragrance | Sephora, Cult Beauty, Space NK |
| Luxury / aspirational | Net-a-Porter, Mytheresa, SSENSE |

---

## 2. Business Email Architecture

### What to Create (and When)

**Create these now — Day 1:**

| Address | Purpose | Priority |
|---------|---------|---------|
| `hello@outfitoracle.app` | Primary brand-facing address; affiliate applications, general inquiries | Immediate |
| `partnerships@outfitoracle.app` | Brand deals, collaboration pitches, PR contacts | Immediate |

**Create these before public launch:**

| Address | Purpose |
|---------|---------|
| `support@outfitoracle.app` | User support, app store review responses |
| `affiliate@outfitoracle.app` | Dedicated for affiliate network correspondence; keeps approval emails clean |

**Create these when team grows:**

| Address | Purpose |
|---------|---------|
| `dev@outfitoracle.app` | Developer accounts, API keys, service subscriptions |
| `legal@outfitoracle.app` | DMCA, privacy requests, compliance |
| `press@outfitoracle.app` | Media inquiries |

### Domain Strategy

Register `outfitoracle.app` via Google Domains / Namecheap. Set up Google Workspace (Business Starter, $6/user/month) — gives you:
- Custom email with no setup friction
- Google Drive for contracts/agreements
- Google Meet for brand calls
- Separate from personal Google account

**Critical:** Never use your personal Gmail for affiliate applications. Affiliate networks use your email as a primary identifier — mixing personal and business creates tracking pollution and looks unprofessible to brands.

### Why Separation Matters for Recommendation Hygiene

Affiliate networks and product APIs (especially Amazon, Google Shopping) personalize their recommendations based on account history. If you test the Amazon Associates API logged into your personal Amazon account, your purchase history, browsing patterns, and Prime preferences will bias the product results returned to OutfitOracle users.

A business email account → business-only affiliate accounts → business-only API keys creates a clean separation: the oracle recommends based on weather, occasion, and style — not because you bought three pairs of black trousers last month.

---

## 3. Data Separation & API Hygiene

### The Fundamental Rule

> Every API key, affiliate account, and test environment used by OutfitOracle must be created under the OutfitOracle business identity. No exceptions.

### Account Separation Checklist

**Affiliate Networks**
- [ ] Create all affiliate accounts with `affiliate@outfitoracle.app`
- [ ] Use a dedicated browser profile (Chrome profile or Firefox container) for affiliate network logins
- [ ] Never log into affiliate dashboards from your personal browsing profile
- [ ] Create a 1Password / Bitwarden vault specifically for OutfitOracle business accounts

**Product APIs (Amazon, Rakuten, etc.)**
- [ ] Create a new Amazon Associates account under the business email — do NOT link to personal Amazon account
- [ ] Create new Google Cloud project under business Google Workspace account for Shopping API
- [ ] All API keys stored in `.env` files, never committed to git
- [ ] Separate API keys for development, staging, and production

**Testing**
- [ ] Use neutral, fictional user profiles when testing product recommendations
  - Test user A: "minimalist, quiet luxury, London, 12°C, work occasion"
  - Test user B: "Y2K, bold, New York, 28°C, weekend"
  - Test user C: "editorial dark, Paris, 5°C, evening"
- [ ] Never use your real location, real style preferences, or real city when testing
- [ ] Product recommendation tests should not infer from any browsing or purchase history

**Environment Separation**

```
Development  →  .env.development  →  test API keys, mock affiliate links
Staging      →  .env.staging      →  real API keys, test affiliate links (non-tracking)
Production   →  .env.production   →  live API keys, live affiliate links (tracking active)
```

### Logging Principles

Log only:
- Click events (product ID, timestamp, category — no user PII)
- Affiliate link outbound requests (retailer, product category)
- Conversion signals from affiliate network (order ID, commission amount)

Never log:
- User email addresses
- Device IDs in affiliate logs
- Personal style profile data in affiliate analytics
- Individual user purchasing behavior

### Data Minimization

OutfitOracle should never store:
- User email addresses (unless explicit account creation)
- Payment information
- IP addresses in affiliate click logs
- Purchase history from linked retailers

What you CAN store and use:
- Anonymous session IDs for click attribution
- Style preference vectors (aesthetic tags — aggregated, not per-user PII)
- Weather + city context (anonymized before logging)

---

## 4. Product Data Model

### Core Product Schema

```typescript
interface AffiliateProduct {
  // Identity
  id: string;                        // UUID, internal
  externalId?: string;               // Retailer's product ID
  
  // Display
  productName: string;               // "Ribbed Cashmere Turtleneck"
  brand: string;                     // "COS"
  retailer: string;                  // "cos.com"
  description?: string;              // Optional editorial copy
  
  // Categorization
  category: ProductCategory;         // see enum below
  subcategory?: string;              // "knitwear", "outerwear", etc.
  
  // Tags for matching
  occasionTags: Occasion[];          // ['Work', 'Weekend', 'Date']
  weatherTags: WeatherTag[];         // ['cold', 'rain', 'overcast']
  aestheticTags: AestheticTag[];     // ['quiet-luxury', 'editorial', 'minimalist']
  seasonTags: Season[];              // ['autumn', 'winter']
  genderTarget: GenderTarget[];      // ['Women', 'Men', 'Anyone']
  
  // Pricing
  price: number;
  currency: string;                  // 'USD', 'GBP', 'EUR', 'CAD'
  salePrice?: number;
  budgetTier: BudgetTier;           // 'high-street' | 'contemporary' | 'luxury'
  
  // Commerce
  productUrl: string;                // Canonical retailer URL
  affiliateUrl: string;              // Tracked affiliate link
  affiliateNetwork: AffiliateNetwork; // 'shareasale' | 'rakuten' | 'cj' | 'ltk' | 'impact'
  commissionRate?: number;           // 0.08 = 8% (store for optimization)
  
  // Media
  imageUrl: string;                  // Hosted image
  imageAlt: string;                  // Accessibility + SEO
  additionalImages?: string[];
  
  // Availability
  availability: AvailabilityStatus;  // 'in-stock' | 'low-stock' | 'out-of-stock' | 'unknown'
  sizes?: string[];
  colors?: string[];
  
  // Oracle editorial
  oracleApprovalLevel: OracleApproval; // 'approved' | 'conditional' | 'emergency-option'
  editorialNote?: string;            // "The Oracle considers this acceptable."
  
  // Meta
  disclosureRequired: boolean;       // always true for affiliate links
  isSponsored: boolean;              // true = paid placement; false = organic affiliate
  isFeatured: boolean;               // pinned to top of category
  
  // Freshness
  lastCheckedAt: string;             // ISO datetime — when availability was verified
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;               // For time-limited deals/seasons
}

// ── Enums ──────────────────────────────────────────────────────────────────

type ProductCategory =
  | 'top' | 'bottom' | 'dress' | 'outerwear' | 'knitwear'
  | 'footwear' | 'accessories' | 'bags' | 'jewelry'
  | 'beauty' | 'fragrance' | 'skincare'
  | 'activewear' | 'swimwear' | 'lingerie';

type WeatherTag =
  | 'cold' | 'very-cold' | 'mild' | 'warm' | 'hot'
  | 'rain' | 'snow' | 'wind' | 'humid' | 'sunny' | 'overcast';

type AestheticTag =
  | 'quiet-luxury' | 'editorial' | 'minimalist' | 'classic' | 'y2k'
  | 'old-money' | 'romantic' | 'literary' | 'modern-classic'
  | 'neo-brutal' | 'mondrian' | 'european' | 'casual' | 'workwear';

type BudgetTier = 'high-street' | 'contemporary' | 'luxury';
type GenderTarget = 'Women' | 'Men' | 'Anyone';
type Season = 'spring' | 'summer' | 'autumn' | 'winter' | 'all-season';
type OracleApproval = 'approved' | 'conditional' | 'emergency-option';
type AvailabilityStatus = 'in-stock' | 'low-stock' | 'out-of-stock' | 'unknown';
type AffiliateNetwork = 'shareasale' | 'rakuten' | 'cj' | 'impact' | 'ltk' | 'awin' | 'amazon' | 'direct';
```

### Product Matching Logic

When the oracle returns a verdict, the product matching layer runs:

```
matchProducts(verdict, weather, styleProfile, occasion) →
  filter by:
    - weatherTags ∩ current weather conditions
    - occasionTags ∩ selected occasion
    - aestheticTags ∩ styleProfile.keywords
    - budgetTier = styleProfile.budget
    - genderTarget ∩ selected gender
    - availability = 'in-stock' | 'low-stock'
    - expiresAt > now (if set)
  rank by:
    - oracleApprovalLevel (approved first)
    - isFeatured (pinned items)
    - lastCheckedAt (fresher data ranked higher)
    - NOT by commissionRate (this would compromise trust)
  limit: 3–5 products per verdict
```

---

## 5. App Architecture for Affiliate Links

### Display Contexts

**A. Verdict Card — "Shop this verdict"**  
Appears below the oracle verdict text. 3 product cards horizontally scrollable. Small, unobtrusive.

```
[ VERDICT TEXT — "Layer aggressively or you'll regret it." ]
  ─────────────────────────────────
  Shop this verdict  ↗ commission disclosure icon
  [Card] [Card] [Card]  →
```

**B. Outfit Item Cards — Item-level affiliate links**  
Each outfit item row has a subtle "shop" icon. Tapping opens the affiliate product detail sheet.

```
  ◆ OUTER LAYER
  Camel wool overcoat                              ↗
  "Because the alternative is suffering."
```

**C. "Shop the Look" Section**  
Full editorial section below the day's outfit. A curated grid of 4–6 matching items with Oracle-voice editorial notes.

**D. Image Carousel — "The Oracle approves"**  
Swipeable product carousel with editorial photography thumbnails. Each card has brand, price, and Oracle approval badge.

**E. Seasonal Recommendations Section**  
On the Today screen during seasonal transitions: "The Oracle notes that autumn is here and your wardrobe is not ready."

**F. Weather-Specific Emergency Recommendations**  
Triggered when extreme weather is detected: "It is -14°C in Montreal. The Oracle has identified exactly one acceptable coat."

### Navigation Flow

```
OracleScreen (consult) 
  → verdict displayed
  → product cards load (parallel, non-blocking)
  → user taps product card
    → AffiliateProductSheet (bottom modal)
      → product image, Oracle editorial note, price
      → "Shop at [Retailer]" CTA button
        → AffiliateRedirectHandler
          → log click event
          → open affiliate URL in in-app browser (SafariViewController / Chrome Custom Tab)
          → return user to app after close
```

### Component Hierarchy

```
TodayScreen
  ├── VerdictCard
  │     ├── OracleText
  │     ├── OutfitItemList
  │     │     └── OutfitItemRow (with affiliate tap target)
  │     └── ShopThisVerdictRail
  │           └── AffiliateProductCard (×3)
  │
  └── ShopTheLookSection (collapsible)
        ├── SectionHeader ("The Oracle approves —")
        ├── AffiliateDisclosureBadge
        └── ProductCarousel
              └── AffiliateProductCard (×6)
```

---

## 6. Affiliate Disclosure UX

The Oracle discloses. The Oracle is transparent. The Oracle is not a sell-out — it's just honest about its arrangements.

### Card-Level Disclosure (inline, small)

```
* The Oracle may earn a commission from selected links.
```

```
↗ Affiliate link — the verdict remains impartial.
```

```
Some links may earn us a small commission. The Oracle's standards remain unreasonably high.
```

### Section Header Disclosure

```
The Oracle approves — and yes, some links may earn a commission.
Your style, however, is entirely your own responsibility.
```

```
Shop the look — curated by the Oracle, disclosed like a professional.
Affiliate links may be included. The verdict is still independent.
```

### Tooltip / Info Icon Copy (tapped by user)

```
OutfitOracle may earn a small commission if you purchase through links in this section.
This does not affect the Oracle's recommendations, editorial standards, or withering
assessments of poor style choices.
```

### Footer Disclosure (Today Screen)

```
Product recommendations may include affiliate links. OutfitOracle earns a small 
commission on qualifying purchases at no additional cost to you. 
The Oracle's verdict is always based on weather, occasion, and your preferences —
never on commission rates.
```

### Outbound Link Modal (shown before leaving app)

```
You're leaving OutfitOracle.

You're about to visit [Retailer] to shop [Product Name].

OutfitOracle may receive a commission if you make a purchase. 
This doesn't affect the price you pay.

The Oracle selected this because it matches your weather, occasion, and aesthetic — 
not because it benefits us. But transparency is always in season.

[ Continue to [Retailer] ]    [ Stay here ]
```

### Full Affiliate Disclosure Page (`/affiliate-disclosure`)

```markdown
# Affiliate Disclosure

OutfitOracle participates in affiliate marketing programs. When you click a product
link in the app and make a purchase, OutfitOracle may receive a small commission
from the retailer at no additional cost to you.

## What this means

Affiliate commissions help support OutfitOracle's development and keep the oracle 
running — literally and figuratively.

## What this doesn't mean

Affiliate relationships do not influence which products OutfitOracle recommends. 
Product selection is based entirely on:
- Current weather conditions in your city
- Your selected occasion
- Your personal style preferences
- Product quality, availability, and retailer reliability

The Oracle cannot be bought. It simply has arrangements.

## Affiliate networks we work with

OutfitOracle works with affiliate networks including [list]. Specific brand 
relationships may vary over time.

## Your choices

You may choose not to purchase through our affiliate links. All featured products 
are available directly from the retailer's website. The Oracle will not take this 
personally. Much.

## Contact

Questions about our affiliate relationships: partnerships@outfitoracle.app

Last updated: [date]
```

---

## 7. Product Recommendation Rules

These rules govern how the oracle selects affiliate products. They are non-negotiable. Brand standards depend on them; user trust depends on them.

### Rules the Oracle Lives By

**1. Match context, not commission.**  
Products are selected based on weather, occasion, and style profile. Commission rate is stored for analytics only — it must never influence ranking or selection.

**2. The oracle recommends what it would wear.**  
If the Oracle would not genuinely suggest the item in the context of the verdict, the item doesn't appear. An 8°C rainy Tuesday in Edinburgh is not the right time for linen shorts regardless of the commission.

**3. Availability first.**  
Out-of-stock products should not appear in recommendations. `availability` must be checked within the last 24 hours for items that appear in active recommendations. Nothing erodes trust faster than clicking through to a sold-out page.

**4. Editorial and affiliate are clearly distinct.**  
The Oracle's text verdict is never written to serve affiliate inventory. The product cards are clearly labeled as commerce. These are two separate layers and must remain so.

**5. No counterfeit, unsafe, or misleading products.**  
Only established retailers with verifiable return policies and genuine inventory. No drop-shippers, no unverified marketplace sellers, no sponsored fast fashion that contradicts the Oracle's aesthetic standards.

**6. Sponsored placements are labeled `isSponsored: true`.**  
If a brand pays for featured placement, this is disclosed separately from standard affiliate disclosure. The label reads: "Featured" or "Sponsored." The Oracle calls this "arranged."

**7. Budget tiers must match the user's profile.**  
A user with `budgetTier: 'high-street'` should not be shown luxury products at 10× their stated budget. Products should match the tier or offer one step up as an aspirational option, clearly labeled.

**8. Category discipline.**  
An outfit recommendation for a top should produce top-related affiliate products, not random upsells. The product category must match the outfit category it's attached to.

**9. The Oracle approves only what the Oracle approves.**  
`oracleApprovalLevel: 'emergency-option'` products may appear but are labeled accordingly: "The Oracle considers this acceptable given the circumstances." Not everything on the internet meets the Oracle's standards.

**10. Refresh and expire products regularly.**  
Products must have `lastCheckedAt` within 24 hours for active recommendations. Seasonal items should have `expiresAt` set to prevent a winter coat appearing in August.

---

## 8. Implementation Roadmap

### Phase 1 — Foundation (Week 1–2)
**Goal:** Affiliate-ready infrastructure with manual links. No product API required.

- [ ] Register `outfitoracle.app` domain
- [ ] Create Google Workspace account: `hello@` and `partnerships@`
- [ ] Apply to ShareASale and CJ (lowest approval friction)
- [ ] Create affiliate disclosure page (in-app screen)
- [ ] Add `AffiliateDisclosureBadge` component
- [ ] Build `AffiliateProductCard` component (static, no API)
- [ ] Implement `AffiliateProduct` TypeScript interface
- [ ] Create local JSON product catalog (10–20 manually curated items)
- [ ] Add `ShopTheLookSection` to TodayScreen (behind feature flag)
- [ ] Implement `AffiliateRedirectHandler` with click logging
- [ ] Add `EXPO_PUBLIC_AFFILIATE_ENABLED` flag to `.env`

**Deliverable:** 5–10 manually curated products appear in a "Shop the look" section. Click events are logged. Disclosure is visible.

---

### Phase 2 — Tracking & Admin (Week 3–4)
**Goal:** Reliable click tracking, organized product management, environment separation.

- [ ] Apply to Rakuten and Impact affiliate networks
- [ ] Set up click event logging (PostHog events: `affiliate_card_viewed`, `affiliate_link_tapped`, `affiliate_modal_dismissed`)
- [ ] Create product tagging taxonomy (finalize `weatherTags`, `aestheticTags`, `occasionTags`)
- [ ] Build simple admin JSON/CSV import for product catalog management
- [ ] Add `availability` validation (basic — manual flag or simple HEAD request)
- [ ] Implement outbound link modal ("You're leaving OutfitOracle")
- [ ] Add affiliate footer disclosure to Today screen
- [ ] Create product card A/B variants (card layout A vs. B)
- [ ] Add `AFFILIATE_NETWORK_*` env variables structure

**Deliverable:** Click tracking live, 30–50 curated products organized by weather/occasion/aesthetic tags, clean environment variable structure.

---

### Phase 3 — Automation (Month 2)
**Goal:** Dynamic product matching, API integration, real availability data.

- [ ] Integrate first product API (ShareASale Product API or Rakuten Product API)
- [ ] Build `matchProducts()` function with full filtering + ranking logic
- [ ] Add product availability refresh job (background, every 24 hours)
- [ ] Implement product carousel component (swipeable, 6-card)
- [ ] Add "The Oracle approves" editorial badge system
- [ ] Build weather-specific emergency recommendation trigger
- [ ] Implement seasonal recommendations section
- [ ] Create product image CDN pipeline (resize + serve at correct dimensions)
- [ ] Add affiliate revenue tracking dashboard (basic — click volume, estimated commissions)
- [ ] Build `neutral-seed-data.json` for development/staging testing

**Deliverable:** Product recommendations are dynamic and weather/occasion/aesthetic matched. No manual curation required for standard recommendations.

---

### Phase 4 — Optimization (Month 3+)
**Goal:** Revenue optimization without compromising editorial standards.

- [ ] A/B test product card layouts (image-first vs. brand-first vs. Oracle-note-first)
- [ ] Revenue attribution by weather condition, occasion, aesthetic tag, city
- [ ] Expand to 3+ affiliate networks, 50+ retailers
- [ ] Add direct brand partnership infrastructure
- [ ] Implement "Shop this look" image generation alignment (when image gen ships — match generated image aesthetic to product cards)
- [ ] Add Saved Looks affiliate integration (saved outfits can surface matching affiliate products)
- [ ] Launch referral program for high-value affiliate verticals (luxury, fragrance)
- [ ] Quarterly affiliate link audit (check for dead links, availability drift, commission rate changes)

---

## 9. Technical Implementation

### A. AffiliateProductCard Component

```typescript
// src/components/AffiliateProductCard.tsx

import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { AffiliateProduct } from '../types/affiliate';
import { openAffiliateLink } from '../services/affiliateRedirect';
import { spacing } from '../theme';

interface Props {
  product: AffiliateProduct;
  context: 'rail' | 'carousel' | 'featured';
}

export function AffiliateProductCard({ product, context }: Props) {
  const { colors, fonts } = useTheme();

  const approvalLabel = {
    approved: 'The Oracle approves.',
    conditional: 'Conditionally acceptable.',
    'emergency-option': 'The Oracle considers this acceptable given the circumstances.',
  }[product.oracleApprovalLevel];

  return (
    <Pressable
      style={[styles.card, context === 'featured' && styles.cardFeatured]}
      onPress={() => openAffiliateLink(product)}
      accessibilityRole="link"
      accessibilityLabel={`Shop ${product.productName} by ${product.brand}`}
    >
      {/* Product image */}
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.image}
          accessibilityLabel={product.imageAlt}
        />
        {product.isSponsored && (
          <View style={styles.sponsoredBadge}>
            <Text style={styles.sponsoredText}>Featured</Text>
          </View>
        )}
      </View>

      {/* Product details */}
      <View style={styles.details}>
        <Text style={[styles.brand, { color: colors.textSub }]} numberOfLines={1}>
          {product.brand}
        </Text>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
          {product.productName}
        </Text>
        <Text style={[styles.price, { color: colors.scarlet }]}>
          {product.currency} {product.price.toFixed(0)}
          {product.salePrice && (
            <Text style={styles.salePrice}> {product.salePrice.toFixed(0)}</Text>
          )}
        </Text>
        {product.editorialNote && (
          <Text style={[styles.editorial, { color: colors.textSub }]} numberOfLines={2}>
            {approvalLabel}
          </Text>
        )}
      </View>

      {/* Disclosure */}
      <Text style={[styles.disclosure, { color: colors.faint }]}>
        ↗ Affiliate link
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    marginRight: spacing.md,
    borderWidth: 1,
  },
  cardFeatured: {
    width: 220,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: 'rgba(0,0,0,0.04)',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  sponsoredBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sponsoredText: {
    fontSize: 9,
    letterSpacing: 1.5,
    color: '#fff',
    fontFamily: 'IBMPlexMono_500Medium',
  },
  details: {
    padding: spacing.sm,
    gap: 3,
  },
  brand: {
    fontSize: 10,
    letterSpacing: 1.5,
    fontFamily: 'IBMPlexMono_400Regular',
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 12,
    fontFamily: 'IBMPlexMono_400Regular',
    lineHeight: 16,
  },
  price: {
    fontSize: 13,
    fontFamily: 'IBMPlexMono_500Medium',
  },
  salePrice: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  editorial: {
    fontSize: 10,
    fontFamily: 'IBMPlexMono_400Regular',
    lineHeight: 14,
    fontStyle: 'italic',
  },
  disclosure: {
    fontSize: 9,
    fontFamily: 'IBMPlexMono_400Regular',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    letterSpacing: 0.5,
  },
});
```

### B. Affiliate Redirect Handler

```typescript
// src/services/affiliateRedirect.ts

import { Linking } from 'react-native';
import { AffiliateProduct } from '../types/affiliate';
import { trackAffiliateClick } from './analytics';

// Opens an affiliate link and logs the click event.
// Never exposes the raw affiliate URL to client-side logging — only
// logs product ID, category, and network (no personal identifiers).
export async function openAffiliateLink(product: AffiliateProduct): Promise<void> {
  // Log click event (no PII — product ID only)
  trackAffiliateClick({
    productId: product.id,
    category: product.category,
    brand: product.brand,
    retailer: product.retailer,
    network: product.affiliateNetwork,
    budgetTier: product.budgetTier,
    isSponsored: product.isSponsored,
  });

  const canOpen = await Linking.canOpenURL(product.affiliateUrl);
  if (canOpen) {
    await Linking.openURL(product.affiliateUrl);
  }
}
```

### C. Product Matching Service

```typescript
// src/services/productMatcher.ts

import { AffiliateProduct, WeatherTag, AestheticTag } from '../types/affiliate';
import { WeatherData } from './weather';
import { StyleProfile } from '../hooks/useStyleProfile';
import { Occasion } from '../components/OccasionPicker';
import { Gender } from '../components/GenderToggle';

interface MatchContext {
  weather: WeatherData;
  occasion: Occasion;
  gender: Gender;
  styleProfile?: StyleProfile;
  category?: AffiliateProduct['category'];
  limit?: number;
}

export function matchProducts(
  catalog: AffiliateProduct[],
  context: MatchContext,
): AffiliateProduct[] {
  const { weather, occasion, gender, styleProfile, category, limit = 5 } = context;

  const weatherTags = deriveWeatherTags(weather);
  const aestheticTags = styleProfile?.keywords as AestheticTag[] ?? [];
  const budgetTier = styleProfile?.budget;

  return catalog
    .filter(p => {
      // Must be in-stock
      if (p.availability === 'out-of-stock') return false;
      // Must not be expired
      if (p.expiresAt && new Date(p.expiresAt) < new Date()) return false;
      // Category filter
      if (category && p.category !== category) return false;
      // Gender match
      if (!p.genderTarget.includes('Anyone') && !p.genderTarget.includes(gender)) return false;
      // Budget match (allow one tier up for aspirational)
      if (budgetTier && !isBudgetCompatible(p.budgetTier, budgetTier)) return false;
      // Occasion match
      if (occasion !== 'Any' && !p.occasionTags.includes(occasion)) return false;
      // Weather match (at least one tag must match)
      if (!weatherTags.some(t => p.weatherTags.includes(t))) return false;
      return true;
    })
    .sort((a, b) => {
      // Featured first, then Oracle-approved, then by freshness
      // NOTE: commission rate intentionally NOT a sort factor
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      const approvalOrder = { approved: 0, conditional: 1, 'emergency-option': 2 };
      if (a.oracleApprovalLevel !== b.oracleApprovalLevel) {
        return approvalOrder[a.oracleApprovalLevel] - approvalOrder[b.oracleApprovalLevel];
      }
      // Aesthetic tag affinity score
      const aScore = aestheticTags.filter(t => a.aestheticTags.includes(t)).length;
      const bScore = aestheticTags.filter(t => b.aestheticTags.includes(t)).length;
      return bScore - aScore;
    })
    .slice(0, limit);
}

function deriveWeatherTags(weather: WeatherData): WeatherTag[] {
  const tags: WeatherTag[] = [];
  if (weather.temp < 5) tags.push('very-cold', 'cold');
  else if (weather.temp < 15) tags.push('cold');
  else if (weather.temp < 22) tags.push('mild');
  else if (weather.temp < 28) tags.push('warm');
  else tags.push('hot', 'warm');
  if (weather.conditionLabel.toLowerCase().includes('rain')) tags.push('rain');
  if (weather.conditionLabel.toLowerCase().includes('snow')) tags.push('snow', 'very-cold');
  if (weather.windSpeed > 30) tags.push('wind');
  if (weather.humidity > 80) tags.push('humid');
  return tags;
}

function isBudgetCompatible(
  productTier: AffiliateProduct['budgetTier'],
  userTier: AffiliateProduct['budgetTier'],
): boolean {
  const order = { 'high-street': 0, contemporary: 1, luxury: 2 };
  // Allow user's tier and one tier above (aspirational upsell)
  return order[productTier] <= order[userTier] + 1;
}
```

### D. Environment Variable Structure

```bash
# .env.example — affiliate and product API keys
# Never commit real values. Never use personal accounts for these.

# ── Feature flags ─────────────────────────────────────────────────────────────
EXPO_PUBLIC_AFFILIATE_ENABLED=false          # Set to true when Phase 1 ships
EXPO_PUBLIC_AFFILIATE_DISCLOSURE_MODAL=true  # Show outbound link modal

# ── Affiliate tracking ────────────────────────────────────────────────────────
# ShareASale
AFFILIATE_SHAREASALE_MERCHANT_ID=           # From ShareASale dashboard
AFFILIATE_SHAREASALE_TOKEN=                 # Business account only

# Rakuten Advertising
AFFILIATE_RAKUTEN_TOKEN=                    # Business account only

# CJ Affiliate
AFFILIATE_CJ_TOKEN=                         # Business account only

# Impact
AFFILIATE_IMPACT_ACCOUNT_SID=
AFFILIATE_IMPACT_AUTH_TOKEN=

# ── Product APIs ──────────────────────────────────────────────────────────────
# These keys must be created under business accounts, not personal accounts.
# Personalization bias from personal accounts will pollute recommendations.

# Amazon Product Advertising API (use OutfitOracle business Amazon account)
AMAZON_PA_ACCESS_KEY=
AMAZON_PA_SECRET_KEY=
AMAZON_PA_PARTNER_TAG=outfitoracle-20       # Business associate tag

# Google Shopping (Cloud project: outfitoracle-production)
GOOGLE_SHOPPING_API_KEY=
GOOGLE_SHOPPING_COUNTRY=                    # e.g., 'US', 'GB', 'CA'

# ── Internal ──────────────────────────────────────────────────────────────────
# Product catalog source (Phase 1: local JSON; Phase 3: API or CMS)
PRODUCT_CATALOG_SOURCE=local               # 'local' | 'cms' | 'api'
PRODUCT_CATALOG_CMS_URL=                   # When Phase 3 CMS is set up
```

---

## 10. Setup Checklist

### A — Affiliate Marketing Setup (ordered)

```
WEEK 1
[ ] Registered outfitoracle.fashion
 domain
[ ] Set up Google Workspace — create hello@ and partnerships@
[ ] Create dedicated browser profile for OutfitOracle business accounts
[ ] Create 1Password/Bitwarden vault for OutfitOracle accounts
[ ] Apply to ShareASale (low friction, broad catalog)
[ ] Apply to CJ Affiliate (mid-sized brands, easy onboarding)
[ ] Create affiliate disclosure screen in app
[ ] Build AffiliateProductCard component
[ ] Implement AffiliateRedirectHandler with PostHog click logging
[ ] Create 15–20 manually curated products (JSON catalog)
[ ] Add EXPO_PUBLIC_AFFILIATE_ENABLED feature flag

WEEK 2
[ ] Apply to Impact (used by Reformation, Allbirds)
[ ] Apply to Rakuten (Net-a-Porter, Nordstrom)
[ ] Add ShopTheLookSection to TodayScreen (feature flag OFF in production)
[ ] Add affiliate footer disclosure to TodayScreen
[ ] Set up .env variable structure (all affiliate keys)
[ ] Separate .env.development / .env.production
[ ] Create neutral test profiles for staging recommendations

MONTH 2
[ ] Apply to LTK (build traction first — they check download counts)
[ ] Apply to Awin (European brand coverage)
[ ] First direct brand outreach (3–5 brands) via partnerships@
[ ] Ship Phase 2 tracking
[ ] Enable affiliate section in production (feature flag ON)
```

### B — Recommended Business Emails

| Phase | Email | Purpose |
|-------|-------|---------|
| Now | `hello@outfitoracle.app` | Primary contact, affiliate applications |
| Now | `partnerships@outfitoracle.app` | Brand deals, PR |
| Pre-launch | `affiliate@outfitoracle.app` | Affiliate network correspondence |
| Pre-launch | `support@outfitoracle.app` | User support |
| Post-launch | `dev@outfitoracle.app` | Developer accounts, API subscriptions |

### C — API Hygiene Rules (non-negotiable)

```
✅ All affiliate accounts created under hello@outfitoracle.app or affiliate@outfitoracle.app
✅ All product API keys created in dedicated business cloud projects
✅ No personal Amazon / Google Shopping accounts used for testing
✅ All API keys stored in .env files — never committed to git
✅ .env files in .gitignore — verified before first commit
✅ Separate API keys for dev / staging / production
✅ Neutral test profiles used in development (not personal style preferences)
✅ Click logs contain no PII — product ID + category only
✅ No user purchase history stored by OutfitOracle
✅ Affiliate URLs never logged in plain text in production analytics
```

---

*This document governs OutfitOracle's monetization architecture. Revisit quarterly.  
The Oracle recommends updating it before every new affiliate partnership.*

*Affiliate links may be included in this document. Just kidding. But the Oracle does feel strongly about cashmere.*
