# API Usage & Data Flow Explained

## Overview

Pretty Presentations uses a **hybrid approach** combining OpenAI's GPT models for intelligent content generation with our own curated database of influencers and brands.

---

## 🤖 What We Use OpenAI For

### 1. **Brief Parsing** (`lib/brief-parser-openai.server.ts`)
- **Model:** GPT-4o-mini
- **Purpose:** Intelligently parse uploaded briefs to extract structured data
- **Input:** Raw brief text (Word docs, PDFs, plain text)
- **Output:** Structured ClientBrief object with:
  - Client name
  - Campaign goals
  - Budget
  - Target demographics
  - Content themes
  - Platform preferences

**Example:**
```typescript
// User uploads: "Campaign for Nike targeting Gen Z athletes..."
// OpenAI extracts:
{
  clientName: "Nike",
  budget: 50000,
  targetDemographics: {
    ageRange: "18-25",
    gender: "All genders",
    interests: ["Sports", "Fitness", "Athleisure"]
  }
}
```

### 2. **Text Response Generation** (`lib/markdown-response-generator.server.ts`)
- **Model:** GPT-4o
- **Purpose:** Generate comprehensive influencer recommendation documents
- **Input:** 
  - ClientBrief (parsed brief)
  - Matched influencers from our database
- **Output:** Professional markdown document with:
  - Executive summary
  - Campaign analysis
  - Influencer profiles with rationale
  - Strategic recommendations
  - Performance projections
  - Budget breakdown

**Example:**
```typescript
// We send to OpenAI:
{
  brief: {...parsed brief data...},
  influencers: [...matched influencers from our DB...]
}

// OpenAI generates:
"# Campaign Strategy for Nike
## Executive Summary
Based on your €50K budget and Gen Z targeting..."
```

### 3. **Presentation Content Generation** (`lib/ai-processor-openai.ts`)
- **Model:** GPT-4o-mini
- **Purpose:** Generate slide content for presentations
- **Input:**
  - ClientBrief
  - Matched influencers from our database
  - Slide templates
- **Output:** Complete slide content with:
  - Cover slide copy
  - Campaign objectives
  - Creative strategy
  - Influencer profiles
  - Budget scenarios

---

## 🗄️ What We Use Our Database For

### 1. **Influencer Matching** (`lib/influencer-matcher.ts`)
- **Database:** 3,001 verified Spanish influencers (Firestore)
- **Purpose:** Find the best influencers for each campaign
- **Algorithm:** LAYAI 9-factor scoring system:
  1. Platform match
  2. Follower range match
  3. Engagement rate
  4. Demographics alignment (age, gender, location)
  5. Interest overlap
  6. Content category relevance
  7. Brand aesthetic fit
  8. Previous brand collaborations
  9. Authenticity score

**Data Sources:**
- **Primary:** CSV import (3,001 Spanish influencers)
- **Enhanced with:**
  - StarNgage: Real audience demographics
  - Apify: Instagram profile data
  - Manual verification

**Example:**
```typescript
// User brief: "Fashion brand targeting women 25-35 in Spain"
// Our database returns top matches:
[
  {
    name: "María López",
    followers: 150000,
    engagement: 8.5%,
    demographics: { gender: "Female", ageRange: "25-34" },
    categories: ["Fashion", "Lifestyle"],
    location: "Madrid, Spain",
    matchScore: 92
  }
]
```

### 2. **Brand Intelligence** (`lib/brand-intelligence.ts`)
- **Database:** 218 Spanish & international brands (CSV)
- **Purpose:** Enrich briefs with brand-specific data
- **Includes:**
  - Industry category
  - Target demographics
  - Content themes
  - Brand description
  - Similar brands

**Example:**
```typescript
// User mentions "Nike" in brief
// We automatically add:
{
  industry: "Sports & Fitness",
  targetAge: "18-35",
  targetGender: "All genders",
  targetInterests: ["Sports", "Fitness", "Athleisure", "Wellness"],
  contentThemes: ["Performance", "Athletic lifestyle", "Motivation"]
}
```

### 3. **Random Sample Brief Generator** (`lib/sample-brief-generator.ts`)
- **Database:** 218 brands CSV
- **Purpose:** Generate diverse test briefs
- **Process:**
  1. Randomly select a brand from database
  2. Map brand to industry template
  3. Generate contextually relevant campaign
  4. Create unique brief every time

**Example:**
```typescript
// Click "Random Sample"
// System picks: Zara (Fashion)
// Generates: "New sustainable collection launch campaign"

// Click again
// System picks: Red Bull (Beverage)
// Generates: "Extreme sports energy drink campaign"
```

---

## 🔄 Complete Data Flow

### Text Response Generation Flow:

```
1. User submits brief
   ↓
2. OpenAI parses brief → structured ClientBrief
   ↓
3. Our database matches influencers → Top 10-15 matches
   ↓
4. OpenAI generates comprehensive document using:
   - Brief data
   - Matched influencers
   - Brand intelligence
   ↓
5. User sees beautiful formatted response with PDF export
```

### Presentation Generation Flow:

```
1. User submits brief
   ↓
2. OpenAI parses brief → structured ClientBrief
   ↓
3. Our database:
   - Matches influencers (LAYAI algorithm)
   - Looks up brand intelligence
   ↓
4. OpenAI generates slide content using:
   - Brief data
   - Matched influencers
   - Brand context
   ↓
5. Nano Banana generates slide images
   ↓
6. User gets complete editable presentation
```

---

## 💡 Why This Hybrid Approach?

### OpenAI Strengths:
✅ Natural language understanding
✅ Content generation and copywriting
✅ Strategic analysis and recommendations
✅ Adapting tone and style

### Our Database Strengths:
✅ Real, verified influencer data
✅ Accurate audience demographics
✅ Engagement metrics and performance data
✅ Spanish market expertise
✅ Fast, reliable matching
✅ No API costs for matching

### Combined Power:
🚀 **Intelligent content + Real data = Perfect recommendations**

---

## 📊 Cost Breakdown

### Per Brief Processing:

| Component | Service | Avg Cost |
|-----------|---------|----------|
| Brief Parsing | OpenAI GPT-4o-mini | $0.002 |
| Influencer Matching | Our Database (Firestore) | $0.00001 |
| Content Generation | OpenAI GPT-4o | $0.015 |
| Image Generation | Replicate (Nano Banana) | $0.02 |
| **Total per brief** | | **~$0.037** |

### Per Text Response:

| Component | Service | Avg Cost |
|-----------|---------|----------|
| Brief Parsing | OpenAI GPT-4o-mini | $0.002 |
| Influencer Matching | Our Database | $0.00001 |
| Content Generation | OpenAI GPT-4o | $0.015 |
| **Total per response** | | **~$0.017** |

---

## 🔐 API Keys Required

### Production:
- ✅ **OPENAI_API_KEY** - Required for brief parsing and content generation
- ✅ **FIREBASE credentials** - Required for influencer database access
- ✅ **REPLICATE_API_TOKEN** - Required for image generation (presentations only)

### Optional:
- 🔹 **VERTEX_AI** - Legacy, can use for alternative AI provider

---

## 🎯 Key Takeaways

1. **OpenAI = Intelligence** - Parses briefs, generates content, provides strategy
2. **Our Database = Truth** - Real influencer data, verified metrics, accurate matching
3. **Hybrid = Best Results** - AI creativity meets real-world data accuracy
4. **Cost Effective** - Database matching saves API costs vs. pure AI approach
5. **Quality Focused** - 3,001 verified influencers, not random AI-generated profiles

---

**Updated:** October 28, 2025
**Version:** 2.4.2

