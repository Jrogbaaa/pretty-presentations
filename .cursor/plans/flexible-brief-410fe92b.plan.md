<!-- 410fe92b-746f-4c88-b038-8cb192192144 291323ea-4440-431d-9a65-c7b4e44d1bb3 -->
# Flexible Brief Budget Validation

## Problem

The system throws a validation error when parsing briefs that don't explicitly mention a budget (like the Spanish Calzedonia brief), preventing any further processing.

## Solution

Make budget optional during parsing but required before generating influencer recommendations. The user will be prompted to fill in missing information.

## Implementation Steps

### 1. Update Validation Schema

**File**: `pretty-presentations/lib/validation.ts`

Modify the `ClientBriefSchema` to make budget optional or allow 0 as a placeholder:

```typescript
budget: z.number()
  .int('Budget must be a whole number')
  .min(0, 'Budget cannot be negative') // Changed from .positive()
  .max(10000000, 'Budget must be less than 10 million')
```

This allows 0 as a valid value to represent "not specified".

### 2. Update AI Parser Prompt

**File**: `pretty-presentations/lib/brief-parser-openai.server.ts` (line 84)

Update the prompt to instruct the AI to use 0 when budget is not mentioned:

```typescript
"budget": number (in euros, extract number only. If no budget mentioned, use 0),
```

Add to Key instructions section:

```typescript
- If budget is not mentioned in the brief, set budget to 0 (user will be prompted to enter it later)
```

### 3. Add Budget Warning in BriefForm

**File**: `pretty-presentations/components/BriefForm.tsx`

Add a prominent warning banner when `budget === 0` or is missing, displayed above the budget input field:

```typescript
{formData.budget === 0 && (
  <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-lg">
    <div className="flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
      <div>
        <h4 className="font-semibold text-amber-900 dark:text-amber-300">Budget Required</h4>
        <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
          No budget was found in your brief. Please enter a campaign budget below to generate influencer recommendations.
        </p>
      </div>
    </div>
  </div>
)}
```

### 4. Add Pre-Generation Budget Check

**File**: `pretty-presentations/app/page.tsx` (line 52, `handleSubmit` function)

Before calling `processBrief`, validate that budget is greater than 0:

```typescript
const handleSubmit = async (brief: ClientBrief) => {
  // Check budget is provided
  if (!brief.budget || brief.budget === 0) {
    setError('Please enter a campaign budget before generating your presentation.');
    return;
  }
  
  // Check online status
  if (!isOnline) {
    setError('You are offline. Please check your internet connection and try again.');
    return;
  }
  
  // ... rest of existing code
}
```

### 5. Update Influencer Matcher Budget Handling

**File**: `pretty-presentations/lib/influencer-matcher.ts` (line 20)

Add a safeguard in case budget somehow gets through as 0:

```typescript
maxBudget: brief.budget > 0 ? brief.budget : undefined, // Don't filter by budget if 0
```

This ensures that if budget is 0, the system shows all influencers (no budget filtering), allowing for the best brand fit matching.

## Files Changed

- `pretty-presentations/lib/validation.ts` - Make budget allow 0
- `pretty-presentations/lib/brief-parser-openai.server.ts` - Set budget to 0 when not found
- `pretty-presentations/components/BriefForm.tsx` - Add budget warning UI
- `pretty-presentations/app/page.tsx` - Add pre-generation validation
- `pretty-presentations/lib/influencer-matcher.ts` - Handle budget=0 gracefully

## Expected Behavior

1. User pastes Calzedonia brief (no budget mentioned)
2. AI parsing succeeds, sets budget to 0
3. BriefForm displays with amber warning: "Budget Required"
4. User enters budget amount (e.g., 50000)
5. User clicks generate
6. System validates budget > 0, then proceeds with influencer matching
7. Influencers are matched using budget as context for filtering and optimization

### To-dos

- [ ] Modify budget validation in ClientBriefSchema to allow 0 (change from .positive() to .min(0))
- [ ] Update OpenAI parser prompt to set budget to 0 when not mentioned in brief
- [ ] Add amber warning banner in BriefForm when budget is 0 or missing
- [ ] Add budget validation in handleSubmit before calling processBrief
- [ ] Update influencer matcher to handle budget=0 gracefully (skip budget filter)