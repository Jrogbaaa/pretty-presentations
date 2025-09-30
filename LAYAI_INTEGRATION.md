# LAYAI Influencer Database Integration

This document explains the integration of the LAYAI influencer database into Pretty Presentations and how the matching logic works.

---

## Overview

LAYAI is a comprehensive influencer matching platform with a database of **2,996 validated Spanish influencers**. We've integrated their database and matching algorithms to power Pretty Presentations' influencer selection features.

**LAYAI Repository**: https://github.com/Jrogbaaa/LAYAI

---

## Database Knowledge

### Data Scale & Quality

- **Total Influencers**: 2,996 processed Spanish influencers
- **Data Source**: Top 3,000 Spanish influencers CSV (validated and cleaned)
- **Validation Rate**: 99%+ legitimate profiles
- **Quality Score**: Authenticity checks and engagement validation
- **Performance**: 22ms average query response time (with local caching)

### Data Sources

LAYAI aggregates data from multiple sources:

1. **Primary Database**: Curated CSV of top Spanish influencers
2. **StarNgage**: Real audience demographics (age/gender breakdowns)
3. **Apify**: Instagram profile scraping and verification
4. **Serply**: Web search for influencer discovery
5. **Custom APIs**: Brand research and collaboration verification

### Influencer Data Structure

Each influencer profile contains:

#### **Profile Information**
- Full name and social media handle
- Platform (Instagram, TikTok, YouTube, etc.)
- Profile image URL
- Verification status

#### **Audience Metrics**
- Follower count
- Engagement rate (percentage)
- Average views per post
- Audience growth rate

#### **Demographics** (from StarNgage)
- Age range (e.g., "18-34")
- Gender distribution (e.g., "70% Female, 30% Male")
- Geographic locations (multiple supported)
- Audience interests and psychographics

#### **Content Categories**
- Primary niches (Fashion, Fitness, Food, Tech, etc.)
- Multi-niche support with OR logic
- Content themes and specializations

#### **Brand Collaborations**
- Previous brand partnerships
- Campaign history
- Brand compatibility scores

#### **Pricing (Rate Cards)**
- Single post rate
- Story rate
- Reel/short-form video rate
- Long-form video rate
- Brand integration packages

#### **Performance Metrics**
- Average engagement rate (historical)
- Average reach per post
- Audience growth rate (monthly %)
- Content quality score (0-10 scale)
- Authenticity score (0-100)

---

## Matching Logic

### Multi-Stage Matching Process

Our influencer matcher uses a 4-stage process based on LAYAI's proven algorithms:

#### **Stage 1: Basic Criteria Filtering**

Filters influencers by hard requirements:

```typescript
- Platform match (Instagram, TikTok, YouTube, etc.)
- Location match (Spain, Latin America, etc.)
- Budget feasibility (estimated cost ≤ budget / 3)
- Engagement threshold (≥ 2.0%)
```

**Implementation**: `filterByBasicCriteria()` in `lib/influencer-matcher.ts`

#### **Stage 2: AI-Powered Ranking**

Uses Vertex AI (Gemini) to rank filtered influencers:

```typescript
Considers:
- Audience alignment with target demographics
- Brand fit and compatibility
- Content quality and authenticity
- Previous brand performance
- ROI potential
- Engagement quality (not just quantity)
```

Returns ranked list with scores (0-100) and reasoning.

**Implementation**: `rankInfluencersWithAI()` in `lib/influencer-matcher.ts`

#### **Stage 3: Optimal Mix Selection**

Selects balanced mix across influencer tiers:

```typescript
Strategy:
- 1x Macro (>500K followers) - 40-50% of budget
- 2-3x Mid-tier (50K-500K) - 30-40% of budget
- 2-3x Micro (<50K) - 10-20% of budget

Benefits:
- Reach (macro)
- Engagement (mid-tier)
- Authenticity & ROI (micro)
```

**Implementation**: `selectOptimalMix()` in `lib/influencer-matcher.ts`

#### **Stage 4: Enrichment & Projections**

For each selected influencer, generates:

```typescript
- AI-powered rationale (2-3 sentences)
- Proposed content mix (posts, stories, reels)
- Estimated reach (followers × 35%)
- Estimated engagement (reach × engagement rate)
- Cost estimate (rate card based)
```

**Implementation**: `enrichSelectedInfluencers()` in `lib/influencer-matcher.ts`

---

## Advanced Features

### 1. Enhanced Gender Filtering

LAYAI's gender detection system achieves **95%+ accuracy**:

- **Spanish Name Recognition**: 50+ male names, 40+ female names with variants
- **Username Analysis**: Pattern detection in handles
- **Biography Parsing**: Gender indicators in profile text
- **StarNgage Data**: Real audience gender breakdowns

### 2. Multi-Niche Support

Supports complex niche combinations with OR logic:

```typescript
Example: "Lifestyle + Fitness + Fashion"
Returns: Influencers matching ANY of these categories
```

### 3. Brand Compatibility

AI-powered matching considers:
- Previous brand partnerships
- Brand values alignment
- Content style compatibility
- Audience overlap with brand's target market

### 4. Intelligent Fallback

When no results match strict criteria:
1. Relaxes engagement threshold
2. Expands location radius
3. Broadens age range
4. Suggests alternative platforms

### 5. Quality Scoring

Each influencer has multiple quality scores:

- **Engagement Quality**: Real engagement vs. fake/bot engagement
- **Content Quality**: Visual appeal, production value (0-10)
- **Authenticity Score**: Likelihood of genuine following (0-100)
- **Brand Safety**: Risk assessment for brand partnerships

---

## Firebase Integration

### Firestore Structure

```
influencers/
  {influencerId}/
    - All profile data
    - Updated via LAYAI import
    
    performance/
      {timestamp}/
        - Historical performance data
        - Metrics over time
```

### Search Optimization

#### Composite Indexes

Required for efficient queries:

```typescript
1. platform + followers + engagement
2. contentCategories (array) + engagement + followers
3. demographics.location (array) + followers
```

#### Caching Strategy

1. **In-Memory Cache**: Frequently accessed influencers (1-hour TTL)
2. **Offline Persistence**: IndexedDB for offline access
3. **Prefetching**: Top 50 influencers on app load

### Throttling (from LAYAI)

Firebase write throttling prevents resource exhaustion:

```typescript
Configuration:
- 15 writes per 1.5 seconds
- Priority queue (high/normal/low)
- Automatic retry with exponential backoff
- Health monitoring
```

**Implementation**: `lib/firebase-throttler.ts`

---

## Search API

### Basic Search

```typescript
import { searchInfluencers } from '@/lib/influencer-service';

const results = await searchInfluencers({
  platforms: ['Instagram', 'TikTok'],
  minFollowers: 10000,
  maxFollowers: 500000,
  minEngagement: 3.0,
  locations: ['Spain', 'Madrid'],
  contentCategories: ['Fashion', 'Lifestyle'],
  gender: 'Female',
  ageRange: '18-34',
  maxBudget: 50000
}, 50); // limit to 50 results
```

### Get by ID (with caching)

```typescript
import { getInfluencerById } from '@/lib/influencer-service';

const influencer = await getInfluencerById('inf_mariagonzstyle');
```

### Get by Platform

```typescript
import { getInfluencersByPlatform } from '@/lib/influencer-service';

const instagramInfluencers = await getInfluencersByPlatform('Instagram', 100);
```

### Get by Category

```typescript
import { getInfluencersByCategory } from '@/lib/influencer-service';

const fashionInfluencers = await getInfluencersByCategory('Fashion', 50);
```

### Top Influencers

```typescript
import { getTopInfluencers } from '@/lib/influencer-service';

const topInfluencers = await getTopInfluencers(20);
```

---

## AI-Powered Matching

### Full Matching Flow

```typescript
import { matchInfluencers } from '@/lib/influencer-matcher';
import type { ClientBrief } from '@/types';

const brief: ClientBrief = {
  clientName: "Nike",
  campaignGoals: ["Brand awareness", "Product launch"],
  budget: 75000,
  targetDemographics: {
    ageRange: "18-35",
    gender: "Mixed",
    location: ["Spain", "Portugal"],
    interests: ["Fitness", "Sports", "Lifestyle"]
  },
  brandRequirements: ["Authentic content", "High engagement"],
  timeline: "3 months",
  platformPreferences: ["Instagram", "TikTok"],
  contentThemes: ["Product reviews", "Lifestyle integration"]
};

// Automatically fetches from Firestore, filters, ranks, and enriches
const selectedInfluencers = await matchInfluencers(brief);

// Returns 5-8 influencers with:
// - AI-generated rationale for each
// - Proposed content mix
// - Estimated reach & engagement
// - Cost estimates
```

---

## Performance Benchmarks

### Query Performance

| Operation | Average Time | Notes |
|-----------|--------------|-------|
| Search (Firestore) | 1-2s | With indexes |
| Search (Cached) | 22ms | From cache |
| Get by ID (Cached) | 5ms | From cache |
| Get by ID (Firestore) | 200-400ms | Single document |
| AI Ranking | 3-8s | Depends on pool size |
| Full Matching Flow | 8-15s | End-to-end |

### Optimization Tips

1. **Limit Query Results**: Default to 50, max 200
2. **Use Filters**: More filters = fewer results to rank with AI
3. **Enable Caching**: Significantly improves repeat queries
4. **Prefetch Popular**: Load top influencers on app start
5. **Batch Operations**: Use throttler for bulk writes

---

## Data Updates

### Manual Import

```bash
# From LAYAI repository
npm run import:influencers
```

### Automated Updates (Future)

Planned integrations:
- Daily sync with LAYAI API
- Weekly refresh of StarNgage demographics
- Real-time follower count updates
- Automated brand collaboration tracking

---

## Testing

### Test Firebase Connection

```bash
npm run test:firebase
```

Tests:
- ✅ Firestore connectivity
- ✅ Storage access
- ✅ Vertex AI (Gemini)
- ✅ Query performance
- ✅ Cache functionality

### Test Matching Logic

```typescript
// In your tests
import { matchInfluencers } from '@/lib/influencer-matcher';
import { mockInfluencers } from '@/lib/mock-influencers';

const results = await matchInfluencers(mockBrief, mockInfluencers);
expect(results.length).toBeGreaterThan(0);
expect(results[0].rationale).toBeDefined();
```

---

## Limitations & Considerations

### Current Limitations

1. **Spanish Market Focus**: Database primarily covers Spanish-speaking influencers
2. **Platform Coverage**: Strongest on Instagram, TikTok, YouTube
3. **Data Freshness**: Manual imports required for updates
4. **Follower Range**: Best coverage for 10K-1M followers
5. **Niche Coverage**: Strongest in Fashion, Lifestyle, Fitness, Food

### Firestore Quotas

- **Free Tier (Spark)**: 50K reads/day, 20K writes/day
- **Paid Tier (Blaze)**: Required for production use
- **Vertex AI**: Requires Blaze plan (~$0.001 per request)

### Cost Estimates

**Monthly costs for 1,000 active users**:
- Firestore: ~$50-100 (reads/writes)
- Storage: ~$10-20 (images, files)
- Vertex AI: ~$200-400 (AI matching)
- **Total: ~$260-520/month**

---

## Future Enhancements

### Planned Features

1. **Real-time Data Sync**: Live updates from LAYAI API
2. **Expanded Markets**: UK, US, LATAM influencer databases
3. **Performance History**: Track influencer campaign results
4. **Automated Outreach**: AI-powered email generation
5. **Contract Management**: Full campaign lifecycle tools
6. **Advanced Analytics**: ROI prediction and tracking

### Technical Improvements

1. **GraphQL API**: More efficient data fetching
2. **Redis Caching**: Faster than in-memory cache
3. **Microservices**: Separate matching service
4. **WebSocket Updates**: Real-time follower updates
5. **Machine Learning**: Improved matching algorithms

---

## Support & Resources

- **LAYAI Repository**: https://github.com/Jrogbaaa/LAYAI
- **LAYAI Live Demo**: https://layai.vercel.app
- **Firebase Console**: https://console.firebase.google.com
- **Pretty Presentations Docs**: See `/README.md`

---

## Credits

This integration is based on the LAYAI platform:
- **Repository**: https://github.com/Jrogbaaa/LAYAI
- **Contributors**: @Jrogbaaa, @claude
- **License**: MIT

Thank you to the LAYAI team for creating such a comprehensive influencer database and matching system! 🙏
