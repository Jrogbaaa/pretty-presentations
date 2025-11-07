# Complex Brief Features - Quick Start Guide

## 🚀 How to Use Enhanced Brief Parsing

The system automatically detects and handles complex brief requirements. No configuration needed!

---

## 📝 Supported Brief Types

### 1. Multi-Phase Campaigns

**Example**: IKEA GREJSIMOJS (3 phases with different creators)

The parser automatically detects:
- "Phase 1", "Phase 2", "Fase 1"
- "oleada 2", "wave 2"
- Budget percentages: "20% Phase 1, 40% Phase 2"
- Phase names: "El Rumor", "La Revelación", "El Rush Final"

**What you get**:
```typescript
{
  isMultiPhase: true,
  phases: [
    {
      name: "Phase 1: Teasing",
      budgetPercentage: 20,
      budgetAmount: 6000,
      creatorTier: "mid-tier",
      creatorCount: 5,
      contentFocus: ["Design", "Aesthetic"],
      constraints: ["embargo: no product reveals"]
    },
    // ... more phases
  ]
}
```

**Result**: Different influencers for each phase, budget split automatically.

---

### 2. Multi-Budget Scenarios

**Example**: IKEA - "present both €30k and €50k proposals"

The parser detects:
- "hagamos dos escenarios"
- "two scenarios"
- "€30k and €50k"
- "Scenario 1: €X, Scenario 2: €Y"

**What you get**:
```typescript
{
  budget: 30000, // Primary budget
  budgetScenarios: [
    { name: "Scenario 1", amount: 30000 },
    { name: "Scenario 2", amount: 50000 }
  ]
}
```

**How to use**:
```typescript
import { generateMultiBudgetScenarios } from '@/lib/multi-budget-scenario-generator';

const comparison = await generateMultiBudgetScenarios(brief);
// Returns complete proposals for both budgets with side-by-side comparison
```

---

### 3. Hard CPM Constraints

**Example**: Puerto de Indias - "max CPM €20 per talent"

The parser detects:
- "máximo CPM de €20"
- "max CPM €20 per talent"
- "no superar el CPM de X"

**What you get**:
```typescript
{
  constraints: {
    maxCPM: 20 // Hard limit - system will reject any influencer over this
  }
}
```

**Result**: Any influencer with CPM > €20 is automatically rejected.

---

### 4. Geographic Distribution

**Example**: Square - "5-6 profiles distributed across Madrid, Barcelona, Sevilla, Valencia"

The parser detects:
- "distributed across"
- "repartidos en Madrid, Barcelona"
- "core cities", "ciudades core"

**What you get**:
```typescript
{
  geographicDistribution: {
    cities: ["Madrid", "Barcelona", "Sevilla", "Valencia"],
    coreCities: ["Madrid", "Barcelona"],
    requireDistribution: true
  }
}
```

**Result**: At least 1 influencer from each city, 2+ from core cities.

---

### 5. Event-Based Requirements

**Example**: PYD Halloween - "attend OT academy + give talk"

The parser detects:
- "asistencia a la academia"
- "attend OT academy"
- "dar una charla"
- "speaker at events"

**What you get**:
```typescript
{
  constraints: {
    requireEventAttendance: true, // Physical presence required
    requirePublicSpeaking: true   // Must be able to speak publicly
  },
  deliverables: [
    { type: "event", description: "Academy attendance + talk" },
    { type: "social", description: "1 Reel + 3 Stories" }
  ]
}
```

**Result**: Only influencers with event/speaking capabilities selected.

---

### 6. Follow-Up Campaigns

**Example**: Puerto de Indias Wave 2 - "repeat well-performing creators"

The parser detects:
- "Wave 2", "oleada 2"
- "repeat well-performing creators"
- "previous campaign"

**What you get**:
```typescript
{
  campaignHistory: {
    isFollowUp: true,
    wave: 2,
    successfulInfluencers: ["name1", "name2"]
  }
}
```

---

### 7. B2B Campaigns

**Example**: Square - "entrepreneur gastronomy profiles"

The parser detects:
- "emprendedores"
- "business owners"
- "restaurateurs"
- "B2B"

**What you get**:
```typescript
{
  targetAudienceType: "B2B",
  constraints: {
    requirePublicSpeaking: true // Often needed for B2B events
  }
}
```

---

## 🎯 Common Use Cases

### Use Case 1: Client Wants Two Budget Options

**Input Brief**:
```
Budget: €50,000. Also prepare a €30,000 scenario for comparison.
```

**How it works**:
1. Parser extracts both budgets
2. System generates 2 complete proposals
3. Includes side-by-side comparison
4. Provides recommendation based on goals

**Code**:
```typescript
const brief = await parseBriefDocument(briefText);
if (brief.budgetScenarios && brief.budgetScenarios.length > 1) {
  const comparison = await generateMultiBudgetScenarios(brief);
  // Use comparison.scenarios[0] and comparison.scenarios[1]
  // Show comparison.recommendation to client
}
```

---

### Use Case 2: Campaign Has CPM Limit

**Input Brief**:
```
Budget: €100,000. Critical: Cannot exceed €15 CPM per talent.
```

**How it works**:
1. Parser extracts maxCPM: 15
2. System REJECTS any influencer with CPM > €15
3. Only budget-efficient influencers selected

**Result**: All influencers guaranteed under €15 CPM.

---

### Use Case 3: Need Geographic Coverage

**Input Brief**:
```
Need influencers distributed across Barcelona, Madrid, Valencia, and Sevilla.
Madrid and Barcelona are priority markets.
```

**How it works**:
1. Parser extracts cities and core cities
2. System ensures 1+ from each city
3. Prioritizes Madrid & Barcelona (2+ each)
4. Fills remaining slots evenly

**Result**: Balanced geographic distribution.

---

### Use Case 4: Multi-Phase Launch

**Input Brief**:
```
Phase 1 (December): 20% budget, teaser content, mid-tier creators
Phase 2 (January): 40% budget, reveal, culturally relevant creators  
Phase 3 (February): 40% budget, launch push, macro creators
```

**How it works**:
1. Parser extracts 3 phases with budgets
2. System selects different creators per phase
3. Each phase gets appropriate tier (mid/macro)
4. No creator reuse across phases

**Result**: Complete phased campaign plan.

---

## 🔧 API Usage

### Basic Brief Parsing
```typescript
import { parseBriefDocument } from '@/lib/brief-parser-openai.server';

const brief = await parseBriefDocument(briefText);

// Check what was detected:
console.log('Multi-phase?', brief.isMultiPhase);
console.log('CPM limit?', brief.constraints?.maxCPM);
console.log('Geographic?', brief.geographicDistribution?.requireDistribution);
console.log('Budget scenarios?', brief.budgetScenarios?.length);
```

### Influencer Matching
```typescript
import { matchInfluencersServer } from '@/lib/influencer-matcher.server';

const influencers = await matchInfluencersServer(brief);

// For multi-phase:
if (brief.isMultiPhase) {
  // Influencers are tagged with [Phase Name] in rationale
  const phase1 = influencers.filter(i => i.rationale.includes('[Phase 1'));
  const phase2 = influencers.filter(i => i.rationale.includes('[Phase 2'));
}
```

### Multi-Budget Scenarios
```typescript
import { generateMultiBudgetScenarios } from '@/lib/multi-budget-scenario-generator';

if (brief.budgetScenarios && brief.budgetScenarios.length > 1) {
  const comparison = await generateMultiBudgetScenarios(brief);
  
  console.log('Scenario 1:', comparison.scenarios[0].summary);
  console.log('Scenario 2:', comparison.scenarios[1].summary);
  console.log('Recommendation:', comparison.recommendation);
  console.log('Value analysis:', comparison.comparison.valueAnalysis);
}
```

---

## 📊 What Gets Extracted Automatically

The enhanced parser extracts ALL of these if present in the brief:

### Basic Info
- ✅ Client name
- ✅ Budget (primary)
- ✅ Campaign goals
- ✅ Target demographics
- ✅ Timeline
- ✅ Platform preferences
- ✅ Content themes
- ✅ Manual influencer names

### Enhanced Fields
- ✅ Multiple phases (name, budget %, tier, count, focus)
- ✅ Budget scenarios (€30k, €50k, etc.)
- ✅ Hard constraints (CPM, followers, categories)
- ✅ Geographic distribution (cities, core cities)
- ✅ Deliverables (social, event, speaking)
- ✅ Campaign history (follow-up, wave #)
- ✅ B2B vs B2C targeting
- ✅ Campaign type

---

## ⚠️ Important Notes

1. **Backward Compatible**: All new fields are optional. Simple briefs work as before.

2. **Automatic Detection**: You don't need to configure anything. Just submit the brief text.

3. **Spanish + English**: Works with both languages and mixed content.

4. **Hard vs Soft Constraints**: 
   - Hard constraints (CPM, event attendance) = rejection
   - Soft preferences (content themes) = scoring boost

5. **Multi-Phase Budget**: Automatically calculated from percentages × total budget.

---

## 🎓 Best Practices

### For Simple Briefs
Just use as before:
```typescript
const brief = await parseBriefDocument(briefText);
const influencers = await matchInfluencersServer(brief);
```

### For Multi-Phase Briefs
Check and handle phases:
```typescript
const brief = await parseBriefDocument(briefText);
const influencers = await matchInfluencersServer(brief);

if (brief.isMultiPhase && brief.phases) {
  // Group by phase
  brief.phases.forEach((phase, i) => {
    const phaseInfluencers = influencers.filter(inf => 
      inf.rationale.includes(`[${phase.name}]`)
    );
    console.log(`Phase ${i + 1}: ${phaseInfluencers.length} influencers`);
  });
}
```

### For Multi-Budget Briefs
Generate comparison:
```typescript
const brief = await parseBriefDocument(briefText);

if (brief.budgetScenarios?.length > 1) {
  const comparison = await generateMultiBudgetScenarios(brief);
  // Present both scenarios + recommendation to client
}
```

---

## ✅ Testing Your Brief

Use the test script to validate:

```bash
npx tsx scripts/test-complex-briefs.ts
```

This will show you exactly what the system detects in your brief.

---

## 🚀 Summary

The enhanced system handles **ANY** complex brief automatically:

- 🎭 Multi-phase campaigns (different creators per phase)
- 💰 Multi-budget scenarios (€30k + €50k proposals)
- 🚫 Hard constraints (CPM limits, event requirements)
- 📍 Geographic distribution (city coverage)
- 🎤 Event-based deliverables (speaking, attendance)
- 🔄 Follow-up campaigns (Wave 2, 3, etc.)
- 🏢 B2B campaigns (entrepreneurs, business owners)

**Just submit the brief text - the system does the rest!** ✨

