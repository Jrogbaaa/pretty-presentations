# System Enhancement Roadmap for Complex Brief Handling

## Current Status
✅ Basic brief parsing (Spanish/English)
✅ Standard influencer matching with LAYAI scoring
✅ Manual influencer integration
✅ Brand intelligence integration
✅ 50k+ influencer database

## Gaps Identified from Real Client Briefs

### HIGH PRIORITY (Required for 90%+ Brief Accuracy)

#### 1. Multi-Phase Campaign Support
**Example**: IKEA GREJSIMOJS (3 phases: Rumor → Revelation → Rush)

**Required Changes**:
```typescript
// types/index.ts - Add phase structure
export interface CampaignPhase {
  name: string;
  budgetPercentage: number;
  budgetAmount: number;
  creatorTier: "micro" | "mid-tier" | "macro" | "mixed";
  creatorCount: number;
  contentFocus: string[];
  timeline: string;
  constraints?: string[]; // e.g., "embargo: no product reveals"
}

export interface ClientBrief {
  // ... existing fields
  phases?: CampaignPhase[];
  isMultiPhase: boolean;
}
```

**Implementation**:
- `lib/brief-parser-openai.server.ts`: Update prompt to extract phases
- `lib/influencer-matcher.server.ts`: Match influencers per phase
- Presentation output: Separate slide decks or sections per phase

---

#### 2. Multi-Budget Scenario Generation
**Example**: IKEA - "Present both €30k and €50k scenarios"

**Required Changes**:
```typescript
// types/index.ts
export interface ClientBrief {
  // ... existing
  budgetScenarios?: {
    scenario1: number;
    scenario2?: number;
    scenario3?: number;
  };
  primaryBudget: number; // Main budget to use
}
```

**Implementation**:
- Generate multiple responses in parallel
- Compare scenarios side-by-side in output
- UI: Allow user to select which scenario to develop

---

#### 3. Hard Constraint Enforcement (CPM Limits, Category Restrictions)
**Example**: Puerto de Indias - "Max CPM €20 per talent"

**Required Changes**:
```typescript
// types/index.ts
export interface BriefConstraints {
  maxCPM?: number;
  minFollowers?: number;
  maxFollowers?: number;
  requiredCategories?: string[];
  excludedCategories?: string[];
  categoryRestrictions?: string[]; // e.g., "no spirits", "no gambling"
  mustHaveVerification?: boolean;
}

export interface ClientBrief {
  // ... existing
  constraints?: BriefConstraints;
}
```

**Implementation**:
- `lib/influencer-matcher.server.ts`: Add hard constraint filtering
- Reject influencers that violate constraints (not just score lower)
- Alert user if constraints eliminate too many candidates

---

#### 4. Geographic Distribution Requirements
**Example**: Square - "5-6 profiles across Madrid, Barcelona, Sevilla, Valencia"

**Required Changes**:
```typescript
// types/index.ts
export interface GeographicDistribution {
  cities: string[];
  coreCities?: string[]; // Priority cities
  requireDistribution: boolean;
  minPerCity?: number;
  maxPerCity?: number;
}

export interface ClientBrief {
  // ... existing
  geographicDistribution?: GeographicDistribution;
}
```

**Implementation**:
- `lib/influencer-matcher.server.ts`: Add distribution algorithm
- Ensure at least 1 influencer from each required city
- Prioritize core cities when selecting top candidates

---

### MEDIUM PRIORITY (Nice to Have, Improves Accuracy)

#### 5. Event-Based vs Social-Only Deliverables
**Example**: PYD Halloween - "Academy attendance + social content"

**Required Changes**:
```typescript
// types/index.ts
export interface Deliverable {
  type: "social" | "event" | "content-creation" | "speaking" | "ambassador";
  description: string;
  requirements?: string[];
}

export interface ClientBrief {
  // ... existing
  deliverables: Deliverable[];
}

// Influencer type enhancement
export interface Influencer {
  // ... existing
  capabilities?: {
    eventAppearances: boolean;
    publicSpeaking: boolean;
    contentCreation: boolean;
    longTermAmbassador: boolean;
  };
}
```

---

#### 6. B2B vs B2C Distinction
**Example**: Square - "Actual entrepreneurs, not just influencers"

**Required Changes**:
```typescript
// types/index.ts
export interface Influencer {
  // ... existing
  professionalBackground?: {
    isEntrepreneur: boolean;
    businessType?: string; // e.g., "restaurant owner", "tech founder"
    businessName?: string;
    yearsInBusiness?: number;
  };
  audienceType?: "consumer" | "business" | "mixed";
}

export interface ClientBrief {
  // ... existing
  targetAudienceType: "B2C" | "B2B" | "D2C";
}
```

---

#### 7. Campaign History & Follow-Up Tracking
**Example**: Puerto de Indias Wave 2 - "Repeat well-performing creators"

**Required Changes**:
```typescript
// types/index.ts
export interface CampaignHistory {
  previousCampaignId?: string;
  isFollowUp: boolean;
  wave?: number;
  successfulInfluencers?: string[]; // IDs or handles
  performanceData?: {
    influencerId: string;
    reach: number;
    engagement: number;
    conversions: number;
    roi: number;
  }[];
}

export interface ClientBrief {
  // ... existing
  campaignHistory?: CampaignHistory;
}
```

**Implementation**:
- Store campaign results in Firestore
- Boost match score for previously successful influencers
- Allow "repeat all" or "repeat top 3" shortcuts

---

#### 8. Celebrity Appeal / Recognition Level Scoring
**Example**: Imagin - "Recognized enough for Marc Márquez to want to participate"

**Required Changes**:
```typescript
// types/index.ts
export interface Influencer {
  // ... existing
  celebrityScore?: number; // 0-100, mainstream recognition
  crossoverAppeal?: string[]; // e.g., ["sports fans", "business world", "media"]
  mediaAppearances?: {
    tv: boolean;
    radio: boolean;
    press: boolean;
    awards: boolean;
  };
}
```

---

#### 9. Content Restrictions & Embargo Tracking
**Example**: IKEA - "Phase 1: no product reveals until Dec 4"

**Required Changes**:
```typescript
// types/index.ts
export interface ContentRestriction {
  phase: string;
  restriction: string;
  startDate?: Date;
  endDate?: Date;
}

export interface ClientBrief {
  // ... existing
  contentRestrictions?: ContentRestriction[];
}
```

---

### LOW PRIORITY (Advanced Features)

#### 10. Influencer Category Blacklists
**Example**: "Won't work with alcoholic beverages"

```typescript
// types/index.ts
export interface Influencer {
  // ... existing
  categoryPreferences?: {
    willingToWorkWith: string[]; // e.g., ["fashion", "beauty", "tech"]
    notWillingToWorkWith: string[]; // e.g., ["alcohol", "gambling", "pharma"]
  };
}
```

---

## Implementation Priority

### IMMEDIATE (Ship in 2-4 weeks):
1. ✅ Hard constraint enforcement (CPM, category restrictions)
2. ✅ Geographic distribution algorithm
3. ✅ Multi-budget scenario generation

### NEXT (Ship in 1-2 months):
4. ✅ Multi-phase campaign support
5. ✅ B2B vs B2C distinction
6. ✅ Event-based deliverables

### FUTURE (Nice to have):
7. Campaign history tracking
8. Celebrity appeal scoring
9. Content restrictions/embargo tracking
10. Category blacklists

---

## Validation: Can We Handle the Example Briefs After Enhancements?

### IKEA GREJSIMOJS (3-phase, 2 budgets, embargo)
- ✅ Multi-phase support → **Phase 1/2/3 with different creators**
- ✅ Multi-budget → **€30k and €50k scenarios**
- ✅ Embargo → **Phase 1 content restrictions noted**
- ✅ Geographic → **Spain focus**

### Imagin (Celebrity partnership, mid-process)
- ⚠️ Celebrity appeal → **Medium priority (score mainstream recognition)**
- ✅ Cooking category → **Content theme filtering**
- ✅ Manual names → **Already supported**

### Puerto de Indias (Wave 2, CPM limit, spirits)
- ✅ CPM constraint → **Hard limit enforcement**
- ⚠️ Campaign history → **Medium priority (repeat performers)**
- ⚠️ Category restriction → **Low priority (alcohol willingness)**

### PYD Halloween (Event-based, OT academy)
- ⚠️ Event deliverables → **Medium priority (physical attendance)**
- ✅ Manual creator requests → **Already supported**
- ✅ Budget → **Standard handling**

### Square (B2B, geographic distribution, entrepreneurs)
- ✅ Geographic distribution → **High priority (city spread)**
- ⚠️ B2B distinction → **Medium priority (entrepreneur flag)**
- ⚠️ Event speakers → **Medium priority (speaking capability)**

---

## Decision Point

**Option A**: Ship now with current capabilities (80% of briefs)
- ✅ Fast to market
- ❌ Complex briefs need manual adjustment

**Option B**: Implement HIGH PRIORITY enhancements first (90%+ briefs)
- ✅ Handles complex client scenarios
- ❌ 2-4 weeks additional development

**Recommendation**: Implement HIGH PRIORITY items first for professional-grade solution.

