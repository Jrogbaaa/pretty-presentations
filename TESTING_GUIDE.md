# 🧪 Testing Guide: Database Integration (v1.3.1)

## Purpose
Verify that real influencers from Firestore are being fetched and matched (not mock data).

---

## ✅ Quick Manual Test (5 minutes)

### Step 1: Start the Development Server
```bash
cd "/Users/JackEllis/Pretty Presentations/pretty-presentations"
npm run dev
```

Wait for: `✓ Ready in X seconds`

---

### Step 2: Open the Application
Open: http://localhost:3000

You should see the homepage with animated hero section.

---

### Step 3: Fill Out a Test Brief

Scroll down to the brief form and enter:

**Client Name**: `Zara`

**Campaign Goals**: 
- Click "+ Add Goal"
- Type: `Brand Awareness`
- Click "+ Add Goal" again
- Type: `Engagement`

**Budget**: `25000`

**Target Demographics**:
- Age Range: `25-34`
- Gender: `Female`
- Location: Click "+  Add Location" → Type: `Spain`
- Interests: Click "+ Add Interest" → Type: `Fashion`

**Platform Preferences**: Click `Instagram`

**Content Themes**:
- Click "+ Add Theme"
- Type: `Fashion`
- Click "+ Add Theme" again
- Type: `Lifestyle`

**Timeline**: `3 months`

**Template**: Select `Default - Modern` (or any template)

Click **"Generate Presentation"**

---

### Step 4: Watch the Processing

You should see a loading overlay with:
- ✅ "Processing brief requirements"
- ✅ "Matching influencers to target audience" ← **THIS IS CRITICAL!**
- ✅ "Generating slide content with AI"
- ✅ "Creating professional presentation..."

**Expected Time**: 10-30 seconds

---

### Step 5: Verify in the Editor

The presentation should open in the editor.

**Navigate to the Talent Strategy Slide** (slide 7-8, usually labeled "Talent Strategy" or "Pool de influencers"):

---

## 🔍 What to Look For (Critical Checks)

### ✅ **CHECK 1: Influencers Are Real (Not Mock Data)**

Look at the influencer names. They should be **real Spanish names** like:
- María González
- Carlos Rodríguez  
- Ana Martínez
- Pablo Fernández
- Laura Sánchez

❌ **If you see generic names like**:
- Influencer 1
- Test Influencer
- Mock User
- Fashion Blogger 1

→ **The system is using mock data (BUG!)**

---

### ✅ **CHECK 2: Real Spanish Demographics**

Each influencer card should show:
- Real follower counts (e.g., "145,600" not round numbers like "100,000")
- Realistic engagement rates (e.g., "4.2%" not "10.0%")
- Spanish locations: "66% España", "España (Primary)", "Madrid", etc.
- Gender splits: "54%F / 46%M" (real demographics, not 50/50)

---

### ✅ **CHECK 3: Content Categories Match**

Since you selected **Fashion + Lifestyle**, the influencers should have:
- Content Categories: "Fashion, Lifestyle, Beauty" (or similar)
- Previous Brands: Real Spanish brands like "Zara", "Mango", "H&M", "Pull&Bear"

---

### ✅ **CHECK 4: Realistic Pricing**

Cost estimates should be realistic:
- Micro influencers (<50K): €500-€2,000
- Mid-tier (50-500K): €2,000-€8,000
- Macro (>500K): €8,000-€25,000

❌ **If all costs are exactly the same** → Mock data

---

## 🎯 Expected Results (PASS)

✅ 5-8 influencers displayed
✅ All have real Spanish names
✅ Demographics show Spain/España
✅ Content categories include Fashion/Lifestyle
✅ Follower counts are varied and realistic
✅ Engagement rates between 2-10%
✅ Total campaign cost within your €25,000 budget
✅ Influencer mix: 1-2 macro, 2-3 mid-tier, 2-3 micro

---

## 🔴 Failure Indicators (Database Not Connected)

❌ Generic influencer names ("Influencer 1", "Test User")
❌ Round follower counts (100K, 500K, 1M exactly)
❌ No location data or generic "Location"
❌ All costs identical
❌ All engagement rates identical
❌ No content categories shown
❌ Placeholder text like "Sample Influencer"

If you see these → **The system is using mock data, database integration failed**

---

## 🎨 Advanced Verification

### Open Browser Developer Tools
1. Press `F12` or `Cmd+Option+I`
2. Go to **Console** tab
3. Look for logs during generation:

**Expected (SUCCESS)**:
```
Firestore: Query returned 147 influencers
Stage 1: Filtered to 89 influencers
Stage 2: AI ranked 50 influencers
Stage 3: Selected 6 influencers
Stage 4: Enriched with rationale
```

**Failure (MOCK DATA)**:
```
Firestore not available, using mock data
```

---

## 🧪 Test Different Scenarios

### Test 2: Music Campaign (The Band Perfume)
- Client: `The Band`
- Content Themes: `Music`, `Lifestyle`
- Platforms: `Instagram`, `TikTok`
- Budget: `75000`

**Expected**: Music/lifestyle influencers, possibly with concert/festival content

---

### Test 3: Fitness Campaign (Nike)
- Client: `Nike`
- Content Themes: `Fitness`, `Sports`, `Wellness`
- Platforms: `Instagram`
- Budget: `50000`

**Expected**: Athletic/fitness influencers

---

### Test 4: Beauty Campaign (L'Oréal)
- Client: `L'Oréal`
- Content Themes: `Beauty`, `Makeup`, `Lifestyle`
- Platforms: `Instagram`, `TikTok`
- Budget: `35000`

**Expected**: Beauty/makeup influencers

---

## 📊 Database Statistics to Verify

If database is connected, you should see variety:
- **Total Influencers**: ~3,000 in database
- **Platforms**: Instagram (majority), TikTok, YouTube, Twitter
- **Locations**: All Spanish (España, Madrid, Barcelona, Valencia, etc.)
- **Content Categories**: Fashion, Lifestyle, Beauty, Fitness, Music, Food, Travel, etc.
- **Follower Range**: 10,000 - 5,000,000+
- **Engagement Range**: 2% - 15%

---

## 💾 Check Firestore Direct (Optional)

1. Go to Firebase Console: https://console.firebase.google.com
2. Select project: `pretty-presentations`
3. Navigate to **Firestore Database**
4. Check collection: `influencers`
5. Verify count: Should show ~2,995-3,000 documents

---

## 🚨 Troubleshooting

### "Firestore not available, using mock data" in console

**Causes**:
1. Firebase credentials not configured
2. Internet connection issue
3. Firestore rules blocking access

**Fix**:
- Check `.env.local` has all `NEXT_PUBLIC_FIREBASE_*` variables
- Check internet connection
- Verify Firestore rules allow read access

---

### All influencers look fake/generic

**Cause**: System fell back to mock data

**Fix**:
1. Check browser console for errors
2. Verify Firebase configuration
3. Check that Firestore has data (`npm run test:firebase`)

---

### "Processing" never completes

**Causes**:
1. OpenAI API key missing/invalid
2. Network timeout
3. AI processing error

**Fix**:
- Check `.env.local` has `OPENAI_API_KEY`
- Check browser console for error messages
- Try again (may be temporary API issue)

---

## ✅ Success Criteria

**The database integration is working if**:

✅ All influencers have real Spanish names  
✅ Variety in follower counts and engagement rates  
✅ Spanish locations/demographics  
✅ Content categories match your brief  
✅ Realistic pricing and cost estimates  
✅ No console errors about "mock data"  
✅ Different campaigns return different influencers  
✅ Total of 5-8 influencers selected  
✅ Mix of macro/mid-tier/micro influencers  

**Test Status**: 🟢 **PASS** or 🔴 **FAIL**

---

## 📝 Report Results

After testing, document:

1. **Test Date**: _______________
2. **Database Status**: Connected ✅ / Mock Data ❌
3. **Sample Influencer Names**: _______________
4. **Total Influencers Matched**: _______________
5. **Content Categories Present**: _______________
6. **Budget Fit**: Within Budget ✅ / Over Budget ❌
7. **Console Errors**: None ✅ / Errors present ❌

---

**Questions? Check**: `INFLUENCER_DATABASE_INTEGRATION.md` for technical details

