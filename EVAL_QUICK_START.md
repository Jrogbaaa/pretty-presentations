# Evaluation Quick Start Guide

## 🚀 How to Run Evaluations

### Prerequisites
- OpenAI API key configured in `.env`
- Dev dependencies installed (`npm install`)

### Option 1: Automated Evaluation (Recommended)

Run the full test suite against all 5 complex briefs:

```bash
cd "/Users/JackEllis/Pretty Presentations"
npx tsx scripts/run-evals.ts
```

**What it does:**
- Tests Puerto de Indias brief (CPM constraint + Wave 2)
- Tests IKEA GREJSIMOJS brief (Multi-phase + Multi-budget)
- Tests Square brief (Geographic distribution + B2B)
- Tests PYD Halloween brief (Event-based)
- Tests Imagin brief (Mid-process)
- Generates `eval-results.json` with detailed metrics

**Expected time**: ~30-60 seconds (depending on API latency)

---

### Option 2: Browser Testing (Visual QA)

Test the full UI flow with manual inspection:

#### Step 1: Start Dev Server
```bash
npm run dev
```

#### Step 2: Navigate to App
Open browser to: `http://localhost:3000`

#### Step 3: Test Each Brief
For each example brief file:

1. Copy the "Original Email" section content
2. Paste into the brief textarea
3. Click "Parse Brief & Auto-Fill Form"
4. **Verify extracted data**:
   - Client name
   - Budget
   - Campaign goals
   - Target demographics
   - Manual influencers
   - **Complex fields** (if applicable):
     - Multi-phase structure shown
     - Budget scenarios displayed
     - Constraints noted
     - Geographic requirements shown
5. Click "Generate Text Response"
6. **Review influencer recommendations**:
   - Are constraints enforced? (CPM, geo, etc.)
   - Are manual influencers included?
   - Is the rationale clear and relevant?
7. Take screenshots for documentation

#### Test Order (Recommended):
1. **Puerto de Indias** - Tests CPM constraint enforcement
2. **Square** - Tests geographic distribution
3. **PYD Halloween** - Tests event attendance requirement
4. **IKEA** - Tests multi-phase complexity
5. **Imagin** - Tests manual influencer handling

---

### Option 3: Individual Brief Testing

Test a single brief in isolation:

```bash
npx tsx scripts/test-complex-briefs.ts
```

This runs the original complex brief test script.

---

## 📊 Understanding Results

### Automated Eval Output

```
📋 TEST 1/5: CPM Constraint + Follow-Up Campaign (Wave 2)
   File: brief-puerto-de-indias.md
   📄 Brief length: 10102 characters
   🤖 Parsing with OpenAI...
   ✓ clientName: "Puerto de Indias"
   ✓ budget: 111800
   ✓ constraints.maxCPM: 20
   ✓ campaignHistory.isFollowUp: true
   ✓ campaignHistory.wave: 2

   ⏱️  Duration: 4.52s
   📊 Score: 100.0% (0 errors)
   ✅ PASSED
```

### Score Interpretation

| Score | Meaning |
|-------|---------|
| 100%  | Perfect extraction - all fields correct |
| ≥ 90% | **PASS** - Production ready |
| 80-89% | Close - minor tweaks needed |
| < 80% | **FAIL** - Significant issues |

### Common Errors

**"Field X: expected Y, got Z"**
→ Parser extracted wrong value
→ Fix: Update prompt in `brief-parser-openai.server.ts`

**"Validation failed: ..."**
→ Schema too strict or parser format mismatch
→ Fix: Adjust Zod schema in `lib/validation.ts`

**"FATAL: OPENAI_API_KEY not set"**
→ Environment variable missing
→ Fix: Check `.env` file or export variable

**"Parsing Error: ..."**
→ API error or network issue
→ Fix: Check API key, rate limits, network

---

## 🔧 Debugging Failed Tests

### Step 1: Check Extracted Data
Look at `eval-results.json`:

```json
{
  "results": [
    {
      "test": "brief-puerto-de-indias.md",
      "extractedData": {
        "clientName": "PDI",  // ← Wrong! Expected "Puerto de Indias"
        "budget": 111800,
        "constraints": {
          "maxCPM": 20
        }
      }
    }
  ]
}
```

### Step 2: Update Parser Prompt
Edit `lib/brief-parser-openai.server.ts`:

```typescript
// Add to system prompt:
"- For Puerto de Indias, use full name 'Puerto de Indias', not abbreviation 'PDI'"
```

### Step 3: Re-run Eval
```bash
npx tsx scripts/run-evals.ts
```

### Step 4: Iterate Until Pass
Repeat steps 1-3 until all tests pass (≥90%).

---

## 🎯 Production Checklist

Before deploying to production, verify:

- [x] Automated eval script created
- [x] Evaluation framework documented
- [x] Schema validation fixed
- [ ] **All 5 evals pass (≥90%)**
- [ ] **Manual browser testing complete**
- [ ] **Constraint enforcement verified**
- [ ] Multi-phase matching tested
- [ ] Multi-budget scenarios tested
- [ ] Geographic distribution tested
- [ ] Performance acceptable (<10s avg)
- [ ] Edge cases handled gracefully

---

## 📝 Adding New Test Cases

### Step 1: Add Brief to `/examples/`
```bash
touch examples/brief-new-client.md
```

### Step 2: Update Eval Script
Edit `scripts/run-evals.ts`:

```typescript
const tests: TestCase[] = [
  // ... existing tests ...
  {
    briefFile: 'brief-new-client.md',
    description: 'New Client Campaign Type',
    expectedFields: {
      clientName: 'New Client',
      budget: 50000,
      // ... expected fields ...
    },
    constraints: ['Constraint 1', 'Constraint 2'],
  },
];
```

### Step 3: Run Updated Eval
```bash
npx tsx scripts/run-evals.ts
```

---

## 🐛 Troubleshooting

### "Cannot find module ..."
```bash
npm install
npm run build
```

### "TypeError: X is not a function"
Check imports - may need to rebuild:
```bash
rm -rf .next
npm run dev
```

### "RateLimitError from OpenAI"
Add delay between tests:
```typescript
await new Promise(resolve => setTimeout(resolve, 5000)); // 5s
```

### "Validation Error" in Browser
Check browser console for detailed Zod error:
1. Open DevTools (F12)
2. Go to Console tab
3. Look for validation error details
4. Fix schema or parser output format

---

## 📚 Related Documentation

- **Implementation**: `EVAL_IMPLEMENTATION_SUMMARY.md`
- **Framework**: `EVAL_FRAMEWORK_COMPLEX_BRIEFS.md`
- **Complex Briefs**: `CODE_REVIEW_IMPLEMENTATION_SUMMARY.md`

---

## 🎓 Best Practices

### When to Run Evals:
- ✅ After modifying brief parser
- ✅ After updating validation schemas
- ✅ After changing type definitions
- ✅ Before deploying to production
- ✅ When adding new brief types
- ✅ Weekly as part of regression testing

### What to Measure:
- ✅ Extraction accuracy (all fields)
- ✅ Execution time (should be <10s)
- ✅ Error rate (should be 0%)
- ✅ Constraint enforcement (manual check)
- ✅ User experience (browser testing)

### How to Improve Scores:
1. **Review failed extractions** in `eval-results.json`
2. **Update system prompt** with clearer instructions
3. **Add few-shot examples** for tricky cases
4. **Refine Zod schemas** to match actual data
5. **Test iteratively** until all pass

---

**Ready to evaluate? Run:**
```bash
npx tsx scripts/run-evals.ts
```

