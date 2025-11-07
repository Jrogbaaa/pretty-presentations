# Parser Graceful Degradation Strategy

## 🎯 Philosophy

**Core Principle**: The parser should NEVER crash on incomplete or partial data. Instead, it should:
1. Extract what it can confidently identify
2. Allow the UI to prompt users for missing fields
3. Validate strictly only at the final output stage

---

## 🛡️ How It Works

### 1. Lenient Validation Schemas

All optional fields use **permissive validators**:

```typescript
// ✅ GOOD - Allows 0 and omitting the field
wave: z.number().int().nonnegative().optional()
maxCPM: z.number().nonnegative().optional()
minPerCity: z.number().int().nonnegative().optional()

// ❌ BAD - Would reject 0 even when optional
wave: z.number().int().positive().optional()  // Fails if parser sets to 0
```

**Key Changes Made:**
- `campaignHistory.wave`: Changed from `.positive()` to `.nonnegative()`
- `constraints.maxCPM`: Changed from `.positive()` to `.nonnegative()`
- `constraints.maxFollowers`: Changed from `.positive()` to `.nonnegative()`
- `phases[].creatorCount`: Changed from `.positive()` to `.nonnegative().optional()`
- `geographicDistribution.minPerCity/maxPerCity`: Changed from `.positive()` to `.nonnegative()`

### 2. Conservative Parser Prompt

The OpenAI parser is instructed to:

```
CRITICAL: ONLY include optional complex fields when EXPLICITLY mentioned in the brief
- Do NOT include these fields with default/empty values
- When in doubt, OMIT the field rather than guessing
- Missing fields will be prompted in the UI if needed
```

**Fields with strict "OMIT IF NOT PRESENT" instructions:**
- `campaignHistory` - Only if follow-up campaign mentioned
- `geographicDistribution` - Only if cities explicitly required
- `budgetScenarios` - Only if multiple budgets proposed
- `phases` - Only if multi-phase structure detected
- `constraints.*` - Only include specific constraints mentioned

### 3. UI Prompting for Missing Data

When fields are missing, the UI shows helpful prompts:

**Example: Missing Budget**
```tsx
{!briefData.budget && (
  <Alert>
    <AlertTitle>Budget Required</AlertTitle>
    <AlertDescription>
      No budget was found in your brief. Please enter a campaign budget below.
    </AlertDescription>
  </Alert>
)}
```

**Example: Missing Demographics**
```tsx
{!briefData.targetDemographics?.ageRange && (
  <Tooltip content="Add age range for better influencer matching">
    <Input placeholder="e.g., 18-35" />
  </Tooltip>
)}
```

---

## 📝 Examples

### Example 1: Simple Brief (No Complex Fields)

**Input Brief:**
```
Campaign for Coca-Cola
Budget: €50,000
Target: 18-25 year olds in Spain
Instagram and TikTok preferred
```

**Parsed Output:**
```json
{
  "clientName": "Coca-Cola",
  "budget": 50000,
  "targetDemographics": {
    "ageRange": "18-25",
    "location": ["Spain"]
  },
  "platforms": ["Instagram", "TikTok"]
  // ✅ NO campaignHistory - not mentioned
  // ✅ NO geographicDistribution - not required
  // ✅ NO constraints - none specified
}
```

**UI Behavior**: 
- Shows basic fields populated
- Prompts user to add campaign goals (missing)
- Allows user to add manual influencers (optional)

---

### Example 2: Complex Brief with Missing Wave Number

**Input Brief:**
```
Puerto de Indias follow-up campaign
Budget: €111,800
Max CPM: €20
Include: Rocío Osorno, María Segarra
```

**Parsed Output (BEFORE fix):**
```json
{
  "clientName": "Puerto de Indias",
  "budget": 111800,
  "constraints": { "maxCPM": 20 },
  "campaignHistory": {
    "isFollowUp": true,
    "wave": 0  // ❌ Parser guessed 0, validation FAILED
  }
}
```

**Parsed Output (AFTER fix):**
```json
{
  "clientName": "Puerto de Indias",
  "budget": 111800,
  "constraints": { "maxCPM": 20 },
  "campaignHistory": {
    "isFollowUp": true
    // ✅ wave field OMITTED (not mentioned in brief)
  }
}
```

**UI Behavior**: 
- Shows "Follow-up campaign detected"
- Prompts: "Which wave is this? (Optional)"
- User can add wave number if known

---

### Example 3: Geographic Distribution Without Min/Max

**Input Brief:**
```
Square campaign for entrepreneurs
Budget: €28,000
Need influencers from Madrid, Barcelona, Sevilla, Valencia
```

**Parsed Output (AFTER fix):**
```json
{
  "clientName": "Square",
  "budget": 28000,
  "geographicDistribution": {
    "cities": ["Madrid", "Barcelona", "Sevilla", "Valencia"],
    "requireDistribution": true
    // ✅ minPerCity and maxPerCity OMITTED (not specified)
  }
}
```

**Matching Logic**: 
- Ensures at least 1 influencer per city (default behavior)
- Doesn't enforce strict min/max since not specified
- User can add min/max constraints in UI if desired

---

## 🔄 Error Handling Flow

### Previous Flow (Strict - Would Crash):
```
Brief Input 
  → Parser extracts all fields (guesses if unsure)
  → Validation fails on guessed values
  → ❌ Error thrown, parsing crashes
  → User sees error, can't proceed
```

### New Flow (Graceful - Never Crashes):
```
Brief Input 
  → Parser extracts only confident fields
  → Validation passes (all present fields valid)
  → ✅ Partial data saved
  → UI shows what's missing with helpful prompts
  → User fills in gaps
  → Final validation before generation
```

---

## ✅ Benefits

### 1. Better User Experience
- No confusing validation errors
- Clear prompts for missing data
- Progressive disclosure (show what's parsed, ask for rest)

### 2. More Accurate Parsing
- Parser doesn't guess when uncertain
- Reduces false positives (extracting fields that aren't there)
- Encourages explicit brief writing

### 3. Flexible Workflows
- Quick parse → review → refine
- Users can start with minimal brief
- System adapts to various brief formats

### 4. Easier Debugging
- Clear which fields parser found vs. user-added
- Validation errors only at generation (not parsing)
- Logs show actual extracted data, not guesses

---

## 🎓 Implementation Guidelines

### When Adding New Optional Fields:

#### 1. Make Validators Lenient
```typescript
// ✅ DO: Allow 0 and make truly optional
newField: z.number().nonnegative().optional()

// ❌ DON'T: Strict validation for optional fields
newField: z.number().positive().optional()
```

#### 2. Update Parser Prompt
```typescript
"newField": number (OMIT if not mentioned in brief)
```

#### 3. Add UI Prompt
```tsx
{!briefData.newField && (
  <Alert>
    <AlertDescription>
      New field not found. Add it here for better results.
    </AlertDescription>
  </Alert>
)}
```

#### 4. Document in Examples
Add to `EVAL_FRAMEWORK_COMPLEX_BRIEFS.md` showing when field should be extracted vs. omitted.

---

## 🧪 Testing Checklist

For each optional field, verify:

- [ ] **Parser Omits When Not Present**: Brief without field → parsed output has no field
- [ ] **Parser Includes When Present**: Brief with field → parsed output has field
- [ ] **Validation Accepts 0**: If parser extracts 0 → validation passes
- [ ] **Validation Accepts Omission**: Field not in output → validation passes
- [ ] **UI Shows Prompt**: Missing field → UI prompts user to add
- [ ] **UI Accepts Manual Entry**: User adds field → form validates → submission works

---

## 📊 Validation Strategy by Stage

| Stage | Validation Level | Purpose |
|-------|------------------|---------|
| **Parsing** | Very Lenient | Accept partial data, never crash |
| **Form Display** | Moderate | Show warnings for recommended fields |
| **Form Submission** | Moderate | Require core fields, suggest optional |
| **Generation** | Strict | Ensure all required data for output |

---

## 🔧 Files Modified

### 1. `/lib/validation.ts`
- Made all optional numeric fields `.nonnegative()` instead of `.positive()`
- Changed: `wave`, `maxCPM`, `maxFollowers`, `creatorCount`, `minPerCity`, `maxPerCity`

### 2. `/lib/brief-parser-openai.server.ts`
- Added "OPTIONAL FIELDS - IMPORTANT" section to prompt
- Emphasized "OMIT if not present" for complex fields
- Updated field descriptions to be more explicit

### 3. `/components/BriefForm.tsx` (Existing)
- Already shows alerts for missing budget
- Already prompts for required fields
- Works seamlessly with partial data

---

## 🎯 Success Criteria

**The system is working correctly when:**

✅ Parser never crashes on any brief format
✅ Validation errors only occur at generation stage
✅ UI clearly shows what's missing and how to add it
✅ Users can start with minimal brief and add details
✅ All optional fields truly optional (can be 0 or omitted)
✅ Complex briefs still extract all relevant fields
✅ Simple briefs don't get unwanted complex fields

---

## 📚 Related Documentation

- **Validation Schemas**: `/lib/validation.ts`
- **Parser Implementation**: `/lib/brief-parser-openai.server.ts`
- **Evaluation Framework**: `EVAL_FRAMEWORK_COMPLEX_BRIEFS.md`
- **Complex Brief Examples**: `/examples/brief-*.md`

---

**Philosophy**: "Extract confidently, validate leniently, guide helpfully"

