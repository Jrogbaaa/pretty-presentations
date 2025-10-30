# Manual Influencer Feature - Testing Checklist

## Test Plan for v2.5.0 Manual Influencer Addition Feature

### Prerequisites
- Dev server running on `localhost:3000`
- Firebase connection working
- OpenAI API key configured

---

## Test 1: Manual Entry via Form Field

**Steps:**
1. Navigate to `/` (home page)
2. Fill out brief form with:
   - Client Name: "Test Brand"
   - Budget: 50000
   - Campaign Goals: "Brand awareness"
   - Add at least one platform
   - Add target demographics
3. In "Manually Requested Influencers" field, add:
   - `@test_influencer`
   - `Maria Garcia`
   - `Carlos Lopez (@carlos_lopez)`
4. Click "Generate Text Response"

**Expected Results:**
- ✅ All three influencer names appear as tags
- ✅ Can remove tags individually
- ✅ Form submits successfully
- ✅ Text response includes "Manually Requested Influencers" section
- ✅ Each influencer appears with proper formatting

---

## Test 2: Brief Text Extraction

**Steps:**
1. Upload a brief document or paste text containing:
   ```
   We want to work with @maria_garcia and Carlos Lopez (@carlos_lopez) for this campaign.
   Also consider @fashion_influencer.
   ```
2. Let parser extract information
3. Check parsed brief form

**Expected Results:**
- ✅ `manualInfluencers` array contains: `["@maria_garcia", "Carlos Lopez (@carlos_lopez)", "@fashion_influencer"]`
- ✅ Names appear in form field
- ✅ Can edit/remove extracted names

---

## Test 3: Database Matching

**Steps:**
1. Add an influencer name that exists in database (check Firestore for real names)
2. Add an influencer name that does NOT exist in database
3. Generate text response

**Expected Results:**
- ✅ Influencer found in database: Shows real data (followers, engagement, etc.)
- ✅ Influencer not found: Shows placeholder with "(estimated)" labels
- ✅ Both appear in "Manually Requested Influencers" section
- ✅ Rationale generated for placeholder influencer explaining brand fit

---

## Test 4: Placeholder Replacement Bug Fix

**Steps:**
1. Add manual influencers via form
2. Generate text response
3. Check markdown output

**Expected Results:**
- ✅ Manual influencers appear ONCE in response
- ✅ Manual influencers section appears BEFORE algorithm-matched section
- ✅ No duplicate sections
- ✅ Both sections display correctly

---

## Test 5: Format Support

**Test each format:**
1. `@handle_only` → Should extract handle correctly
2. `Just Name` → Should extract name correctly
3. `Name (@handle)` → Should extract both name and handle
4. `Name @handle` → Should extract both name and handle

**Expected Results:**
- ✅ All formats parsed correctly
- ✅ Database search uses both name and handle
- ✅ Display shows both when available

---

## Test 6: Empty/No Manual Influencers

**Steps:**
1. Submit brief WITHOUT any manual influencers
2. Generate text response

**Expected Results:**
- ✅ No "Manually Requested Influencers" section appears
- ✅ Only algorithm-matched influencers show
- ✅ No errors in console

---

## Test 7: Combined Output

**Steps:**
1. Add manual influencers
2. Generate text response
3. Check full response structure

**Expected Results:**
- ✅ Response has proper structure:
  1. Executive Summary
  2. Campaign Brief Analysis
  3. **Manually Requested Influencers** (if any)
  4. **Recommended Influencer Lineup** (algorithm-matched)
  5. Performance Projections
  6. Campaign Execution Plan
- ✅ Both sections have proper formatting
- ✅ Tables render correctly
- ✅ No duplicate content

---

## Test 8: Error Handling

**Test scenarios:**
1. Invalid format (empty string, just spaces)
2. Very long influencer name
3. Special characters in name

**Expected Results:**
- ✅ Invalid inputs filtered out
- ✅ No crashes
- ✅ Error messages are user-friendly

---

## Test 9: Validation

**Steps:**
1. Submit brief with manual influencers
2. Check validation passes

**Expected Results:**
- ✅ `manualInfluencers` array validated correctly
- ✅ Empty strings filtered out
- ✅ Max length enforced if applicable

---

## Test 10: API Integration

**Steps:**
1. Call `/api/generate-text-response` directly with:
   ```json
   {
     "clientName": "Test",
     "manualInfluencers": ["@test1", "Test Name"],
     ...
   }
   ```
2. Check response

**Expected Results:**
- ✅ API processes manual influencers correctly
- ✅ Returns proper JSON response
- ✅ Markdown includes manual influencers section

---

## Bug Fix Verification

**Specific Test for Bug 1 Fix:**
1. Add manual influencers
2. Generate response
3. Search markdown for "Manually Requested Influencers"
4. Count occurrences

**Expected Results:**
- ✅ Section appears exactly ONCE
- ✅ No duplicate manual influencer sections
- ✅ Placeholder replacement logic works correctly

---

## Success Criteria

All tests pass:
- ✅ Manual entry works
- ✅ Brief extraction works
- ✅ Database matching works
- ✅ Placeholder generation works
- ✅ Format support works
- ✅ Bug fix verified (no duplicates)
- ✅ Error handling works
- ✅ Validation works
- ✅ API integration works

---

## Notes

- Test with real Firebase database connection
- Test with OpenAI API working
- Check browser console for errors
- Check server logs for issues
- Verify PDF export still works with manual influencers

