# Evaluation Framework: Complex Brief Parsing System

## Overview

This evaluation framework tests the end-to-end system for parsing complex client briefs and generating appropriate influencer recommendations. It validates against 5 real client brief examples covering edge cases.

---

##  Test Scenarios

### Test 1: Puerto de Indias (CPM Constraint + Follow-Up Campaign)

**Brief Characteristics:**
- Follow-up campaign (Wave 2)
- Hard CPM constraint (max €20)
- Budget: €111,800
- Manual influencers: Rocío Osorno, María Segarra, Violeta
- Category restriction: must be willing to work with spirits/alcohol

**Expected Extraction:**
```json
{
  "clientName": "Puerto de Indias",
  "budget": 111800,
  "constraints": {
    "maxCPM": 20,
    "categoryRestrictions": ["must be willing to work with spirits/alcohol"]
  },
  "campaignHistory": {
    "isFollowUp": true,
    "wave": 2
  },
  "manualInfluencers": ["Rocío Osorno", "María Segarra", "Violeta"]
}
```

**Evaluation Criteria:**
- ✅ CPM limit extracted correctly (20)
- ✅ Wave 2 detected
- ✅ Manual influencers extracted
- ✅ Spirits/alcohol restriction noted
- ✅ Budget parsed: €111,800

---

### Test 2: IKEA GREJSIMOJS (Multi-Phase + Multi-Budget)

**Brief Characteristics:**
- 3-phase campaign with budget split (20%/40%/40%)
- Two budget scenarios (€30k and €50k)
- Phase 1: Embargo (no product reveals)
- Manual influencers: Laura Escanes, Violeta Mangriyan

**Expected Extraction:**
```json
{
  "clientName": "IKEA",
  "budget": 30000,
  "isMultiPhase": true,
  "phases": [
    {
      "name": "Phase 1: El Rumor",
      "budgetPercentage": 20,
      "budgetAmount": 6000,
      "creatorTier": "mid-tier",
      "creatorCount": 5,
      "constraints": ["embargo: no product reveals"]
    },
    {
      "name": "Phase 2: La Revelación",
      "budgetPercentage": 40,
      "budgetAmount": 12000,
      "creatorTier": "mid-tier"
    },
    {
      "name": "Phase 3: El Rush Final",
      "budgetPercentage": 40,
      "budgetAmount": 12000,
      "creatorTier": "macro"
    }
  ],
  "budgetScenarios": [
    { "name": "Scenario 1", "amount": 30000 },
    { "name": "Scenario 2", "amount": 50000 }
  ]
}
```

**Evaluation Criteria:**
- ✅ Multi-phase detected (3 phases)
- ✅ Budget percentages: 20%, 40%, 40%
- ✅ Budget amounts calculated correctly
- ✅ Two budget scenarios extracted
- ✅ Phase 1 embargo constraint captured
- ✅ Manual influencers extracted

---

### Test 3: Square (Geographic Distribution + B2B)

**Brief Characteristics:**
- B2B campaign (entrepreneurs only)
- Geographic distribution required
- Cities: Madrid, Barcelona, Sevilla, Valencia
- Core cities: Madrid, Barcelona
- Public speaking requirement
- Budget: €28,000

**Expected Extraction:**
```json
{
  "clientName": "Square",
  "budget": 28000,
  "targetAudienceType": "B2B",
  "geographicDistribution": {
    "cities": ["Madrid", "Barcelona", "Sevilla", "Valencia"],
    "coreCities": ["Madrid", "Barcelona"],
    "requireDistribution": true
  },
  "constraints": {
    "requirePublicSpeaking": true
  },
  "deliverables": [
    { "type": "speaking", "description": "Speaker at entrepreneur events" },
    { "type": "social", "description": "2-3 Stories amplification" }
  ]
}
```

**Evaluation Criteria:**
- ✅ B2B campaign type identified
- ✅ Geographic distribution extracted (4 cities)
- ✅ Core cities identified (Madrid, Barcelona)
- ✅ Public speaking requirement flagged
- ✅ Event + social deliverables captured

---

### Test 4: PYD Halloween (Event-Based + Dual Deliverables)

**Brief Characteristics:**
- Event-based campaign (OT academy attendance)
- Dual deliverables: physical event + social content
- Budget: TBD (quote needed)
- Manual influencers: @dyanbay

**Expected Extraction:**
```json
{
  "clientName": "Perfumes Y Diseño (PYD) - Halloween",
  "budget": 0,
  "constraints": {
    "requireEventAttendance": true
  },
  "deliverables": [
    { "type": "event", "description": "Academy attendance + educational talk" },
    { "type": "social", "description": "1 Reel + 3 Stories" }
  ],
  "manualInfluencers": ["@dyanbay"]
}
```

**Evaluation Criteria:**
- ✅ Event attendance requirement detected
- ✅ Dual deliverables captured
- ✅ Budget = 0 (quote needed)
- ✅ Manual influencer (@handle format) extracted

---

### Test 5: Imagin (Mid-Process + Celebrity Partnership)

**Brief Characteristics:**
- Mid-process brief (modifications to existing proposal)
- Celebrity partnership (Marc Márquez)
- Manual influencers with feedback: Carlos Maldonado, Jordi Cruz, Ale Vicio, @eliasdosunmu
- No budget specified

**Expected Extraction:**
```json
{
  "clientName": "Imagin",
  "budget": 0,
  "manualInfluencers": [
    "Carlos Maldonado",
    "Jordi Cruz",
    "Ale Vicio",
    "@eliasdosunmu"
  ],
  "additionalNotes": "Marc Márquez collaboration TBC, cooking-world presenters"
}
```

**Evaluation Criteria:**
- ✅ Client name extracted
- ✅ All manual influencers captured
- ✅ Marc Márquez partnership noted
- ✅ Budget = 0 (not specified)

---

## Evaluation Metrics

### 1. Extraction Accuracy

For each test brief, calculate:

```
Accuracy = (Correctly Extracted Fields / Total Expected Fields) × 100%
```

**Pass Threshold**: ≥ 90% accuracy per brief

**Fields to Check:**
- Client name
- Budget
- Campaign goals
- Target demographics
- Platform preferences
- Content themes
- Manual influencers
- **Enhanced fields:**
  - Multi-phase structure
  - Budget scenarios
  - Hard constraints
  - Geographic distribution
  - Deliverables
  - Campaign history

---

### 2. Constraint Enforcement

Test that hard constraints are ENFORCED (not just noted):

**Puerto de Indias:**
```python
# All matched influencers must have CPM ≤ €20
for influencer in matched_influencers:
    cpm = (influencer.rate_card.post / influencer.followers) * 1000
    assert cpm <= 20, f"{influencer.name} exceeds max CPM: €{cpm}"
```

**Square:**
```python
# Must have at least 1 influencer from each city
cities = ["Madrid", "Barcelona", "Sevilla", "Valencia"]
for city in cities:
    city_influencers = [i for i in matched_influencers if city in i.location]
    assert len(city_influencers) >= 1, f"No influencer from {city}"
```

**PYD Halloween:**
```python
# All must have event attendance capability
for influencer in matched_influencers:
    assert influencer.capabilities.event_appearances == True
```

---

### 3. Multi-Phase Matching

**IKEA GREJSIMOJS:**

Verify that each phase gets different influencers:

```python
phase1_influencers = [i for i in results if "Phase 1" in i.rationale]
phase2_influencers = [i for i in results if "Phase 2" in i.rationale]
phase3_influencers = [i for i in results if "Phase 3" in i.rationale]

# Check no overlap
phase1_ids = {i.id for i in phase1_influencers}
phase2_ids = {i.id for i in phase2_influencers}
phase3_ids = {i.id for i in phase3_influencers}

assert len(phase1_ids & phase2_ids) == 0, "Phase 1 and 2 share influencers"
assert len(phase2_ids & phase3_ids) == 0, "Phase 2 and 3 share influencers"
assert len(phase1_ids & phase3_ids) == 0, "Phase 1 and 3 share influencers"

# Check budget allocation
assert sum([i.cost_estimate for i in phase1_influencers]) <= 6000 * 1.1  # 10% buffer
assert sum([i.cost_estimate for i in phase2_influencers]) <= 12000 * 1.1
assert sum([i.cost_estimate for i in phase3_influencers]) <= 12000 * 1.1
```

---

### 4. Geographic Distribution

**Square:**

```python
madrid = [i for i in results if "Madrid" in i.demographics.location]
barcelona = [i for i in results if "Barcelona" in i.demographics.location]
sevilla = [i for i in results if "Sevilla" in i.demographics.location]
valencia = [i for i in results if "Valencia" in i.demographics.location]

assert len(madrid) >= 1, "No Madrid influencer"
assert len(barcelona) >= 1, "No Barcelona influencer"
assert len(sevilla) >= 1, "No Sevilla influencer"
assert len(valencia) >= 1, "No Valencia influencer"

# Core cities should have ≥ 2
assert len(madrid) >= 2, "Madrid (core city) needs ≥ 2"
assert len(barcelona) >= 2, "Barcelona (core city) needs ≥ 2"
```

---

### 5. Multi-Budget Scenarios

**IKEA:**

```python
from lib.multi_budget_scenario_generator import generateMultiBudgetScenarios

comparison = await generateMultiBudgetScenarios(brief)

assert len(comparison.scenarios) == 2, "Should have 2 scenarios"
assert comparison.scenarios[0].scenario.amount == 30000
assert comparison.scenarios[1].scenario.amount == 50000

# More budget should yield more reach
assert comparison.scenarios[1].totalReach > comparison.scenarios[0].totalReach

# Check recommendation is provided
assert len(comparison.recommendation) > 50, "Recommendation too short"
```

---

## Automated Evaluation Script

Create `/scripts/run-evals.ts`:

```typescript
/**
 * Run automated evaluations on complex brief parsing
 */

import { parseBriefDocument } from '@/lib/brief-parser-openai.server';
import { matchInfluencersServer } from '@/lib/influencer-matcher.server';
import { generateMultiBudgetScenarios } from '@/lib/multi-budget-scenario-generator';
import * as fs from 'fs';
import * as path from 'path';

interface EvalResult {
  test: string;
  passed: boolean;
  score: number;
  errors: string[];
  extractedData: any;
}

const runEval = async (
  briefFile: string,
  expectedFields: Record<string, any>
): Promise<EvalResult> => {
  const result: EvalResult = {
    test: briefFile,
    passed: false,
    score: 0,
    errors: [],
    extractedData: null,
  };

  try {
    // Read brief
    const briefPath = path.join(process.cwd(), 'examples', briefFile);
    const content = fs.readFileSync(briefPath, 'utf-8');
    const emailMatch = content.match(/## Original Email[^\\n]*\\n\\n([\\s\\S]+?)(?=\\n##|$)/);
    const briefText = emailMatch ? emailMatch[1].trim() : content;

    // Parse
    const parsed = await parseBriefDocument(briefText);
    result.extractedData = parsed;

    // Check expected fields
    let correctFields = 0;
    let totalFields = 0;

    for (const [field, expectedValue] of Object.entries(expectedFields)) {
      totalFields++;
      const actualValue = getNestedValue(parsed, field);

      if (compareValues(actualValue, expectedValue)) {
        correctFields++;
      } else {
        result.errors.push(
          `Field "${field}": expected ${JSON.stringify(expectedValue)}, got ${JSON.stringify(actualValue)}`
        );
      }
    }

    result.score = (correctFields / totalFields) * 100;
    result.passed = result.score >= 90;

    // Test influencer matching
    if (result.passed) {
      const influencers = await matchInfluencersServer(parsed);
      console.log(`✓ Matched ${influencers.length} influencers for ${briefFile}`);
    }
  } catch (error) {
    result.errors.push(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
};

const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

const compareValues = (actual: any, expected: any): boolean => {
  if (expected === null || expected === undefined) {
    return actual === expected;
  }
  if (typeof expected === 'object' && !Array.isArray(expected)) {
    return Object.keys(expected).every(key =>
      compareValues(actual?.[key], expected[key])
    );
  }
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual) || actual.length !== expected.length) {
      return false;
    }
    return expected.every((item, i) => compareValues(actual[i], item));
  }
  return actual === expected;
};

// RUN ALL EVALS
const main = async () => {
  console.log('\\n' + '='.repeat(80));
  console.log('🧪 RUNNING COMPLEX BRIEF EVALUATIONS');
  console.log('='.repeat(80) + '\\n');

  const tests: Array<[string, Record<string, any>]> = [
    [
      'brief-puerto-de-indias.md',
      {
        clientName: 'Puerto de Indias',
        budget: 111800,
        'constraints.maxCPM': 20,
        'campaignHistory.isFollowUp': true,
        'campaignHistory.wave': 2,
      },
    ],
    [
      'brief-ikea-grejsimojs.md',
      {
        clientName: 'IKEA',
        budget: 30000,
        isMultiPhase: true,
        'phases.length': 3,
        'budgetScenarios.length': 2,
      },
    ],
    [
      'brief-square.md',
      {
        clientName: 'Square',
        budget: 28000,
        targetAudienceType: 'B2B',
        'geographicDistribution.requireDistribution': true,
      },
    ],
    [
      'brief-pyd-halloween.md',
      {
        clientName: 'Perfumes Y Diseño (PYD) - Halloween',
        budget: 0,
        'constraints.requireEventAttendance': true,
      },
    ],
    [
      'brief-imagin.md',
      {
        clientName: 'Imagin',
        budget: 0,
      },
    ],
  ];

  const results: EvalResult[] = [];

  for (const [briefFile, expectedFields] of tests) {
    console.log(`\\n📋 Testing: ${briefFile}`);
    const result = await runEval(briefFile, expectedFields);
    results.push(result);

    console.log(`   Score: ${result.score.toFixed(1)}%`);
    console.log(`   Passed: ${result.passed ? '✅' : '❌'}`);
    if (result.errors.length > 0) {
      console.log(`   Errors:`);
      result.errors.forEach(err => console.log(`     - ${err}`));
    }
  }

  // Summary
  console.log('\\n' + '='.repeat(80));
  console.log('📊 EVALUATION SUMMARY');
  console.log('='.repeat(80));
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / total;
  console.log(`Tests Passed: ${passed}/${total}`);
  console.log(`Average Score: ${avgScore.toFixed(1)}%`);
  console.log(passed === total ? '\\n🎉 ALL TESTS PASSED!' : '\\n⚠️  SOME TESTS FAILED');
  console.log('='.repeat(80) + '\\n');
};

main().catch(console.error);
```

---

## Issues Found

### ❌ Issue 1: Validation Schema Too Strict

**Problem:** `GeographicDistributionSchema` requires `minPerCity` and `maxPerCity` to be `positive()` but briefs without geographic distribution set these to 0.

**Fix Applied:**
```typescript
// Changed from .positive() to .nonnegative() to allow 0
minPerCity: z.number().int().nonnegative().optional(),
maxPerCity: z.number().int().nonnegative().optional(),
```

**Status:** ✅ FIXED

---

### ⚠️ Issue 2: Parser May Over-Extract

**Observation:** Parser attempted to extract `geographicDistribution` for Puerto de Indias brief even though it has no geographic requirements.

**Recommendation:** Update brief parser prompt to be more conservative - only include optional fields when explicitly mentioned in brief.

---

## Next Steps

1. **Run automated eval script** to test all 5 briefs
2. **Fix any remaining validation issues**
3. **Create visual evaluation dashboard** showing parsed vs expected
4. **Test multi-budget scenario generation** end-to-end
5. **Test multi-phase matching** with IKEA brief
6. **Verify constraint enforcement** with Puerto de Indias (CPM), Square (geo), PYD (event)

---

## Success Criteria

- ✅ All 5 briefs parse with ≥ 90% accuracy
- ✅ Hard constraints are enforced (CPM, event, speaking)
- ✅ Multi-phase campaigns generate different influencers per phase
- ✅ Geographic distribution ensures city coverage
- ✅ Multi-budget scenarios generate comparison with recommendation
- ✅ Manual influencers are included in final output
- ✅ No validation errors or crashes

---

**The evaluation framework is ready. Next: run the automated evaluation script to systematically test all scenarios.**

