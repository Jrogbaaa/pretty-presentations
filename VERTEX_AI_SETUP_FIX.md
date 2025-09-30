# 🔧 Vertex AI Setup Fix Guide

## 🚨 Issue: Gemini Model 404 Error

If you're seeing this error:
```
Publisher Model `projects/pretty-presentations/locations/us-central1/publishers/google/models/gemini-1.5-flash` was not found
```

**This means your Firebase project doesn't have proper access to the Vertex AI API.**

---

## ✅ Solution: Enable Vertex AI API

### Step 1: Enable Required APIs

1. **Open Google Cloud Console APIs Dashboard:**
   ```
   https://console.cloud.google.com/apis/dashboard?project=pretty-presentations
   ```

2. **Enable these APIs** (click "Enable API" if not already enabled):
   
   **a) Vertex AI API:**
   - Go to: https://console.cloud.google.com/apis/library/aiplatform.googleapis.com?project=pretty-presentations
   - Click **"Enable"**
   
   **b) Cloud AI Platform API:**
   - Go to: https://console.cloud.google.com/apis/library/ml.googleapis.com?project=pretty-presentations
   - Click **"Enable"**
   
   **c) Firebase ML API:**
   - Go to: https://console.cloud.google.com/apis/library/firebaseml.googleapis.com?project=pretty-presentations
   - Click **"Enable"**

3. **Wait 2-5 minutes** for the APIs to fully propagate.

---

### Step 2: Update Environment Variables

Add the following to your `.env.local` file:

```bash
# Add this line (if not already present)
NEXT_PUBLIC_VERTEX_AI_LOCATION=us-central1
```

Your complete Vertex AI configuration should look like:

```bash
# Vertex AI Configuration
NEXT_PUBLIC_VERTEX_AI_LOCATION=us-central1
NEXT_PUBLIC_VERTEX_AI_MODEL=gemini-1.5-flash
NEXT_PUBLIC_VERTEX_AI_IMAGE_MODEL=gemini-2.0-flash-exp
```

---

### Step 3: Verify Firebase Billing

Vertex AI requires a **Firebase Blaze (Pay-as-you-go) plan**.

1. Go to: https://console.firebase.google.com/project/pretty-presentations/usage
2. Ensure you're on the **Blaze Plan**
3. If not, upgrade by clicking **"Upgrade to Blaze"**

**Don't worry:** Gemini is very affordable (~$0.001 per request)

---

### Step 4: Restart Your Development Server

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

---

## 🧪 Test the Fix

### Test 1: Firebase Connection
```bash
npm run test:firebase
```

Expected output:
```
✅ Firebase: Connected
✅ Firestore: Connected
✅ Vertex AI: Connected
   Test response: Hello, Pretty Presentations!
```

### Test 2: Parse Sample Brief

1. Open: http://localhost:3000
2. Click **"Try Sample Brief"** or paste the sample brief
3. Click **"Parse Brief"**
4. If it works, you're all set! 🎉

---

## 🔍 Alternative Locations

If `us-central1` doesn't work, try these locations in your `.env.local`:

```bash
# European location
NEXT_PUBLIC_VERTEX_AI_LOCATION=europe-west1

# Asian location
NEXT_PUBLIC_VERTEX_AI_LOCATION=asia-northeast1

# US East Coast
NEXT_PUBLIC_VERTEX_AI_LOCATION=us-east1
```

**Check available locations:**
https://cloud.google.com/vertex-ai/docs/general/locations

---

## 🐛 Still Not Working?

### Error: "Permission Denied" (403)

**Solution:**
1. Go to: https://console.cloud.google.com/iam-admin/iam?project=pretty-presentations
2. Find your service account (firebase-adminsdk-xxxxx@...)
3. Add these roles:
   - **Vertex AI User**
   - **Firebase ML Service Agent**
   - **Service Usage Consumer**

### Error: "Location Not Supported"

**Solution:**
Try a different location (see Alternative Locations above)

### Error: "Quota Exceeded"

**Solution:**
1. Go to: https://console.cloud.google.com/apis/api/aiplatform.googleapis.com/quotas?project=pretty-presentations
2. Request quota increase if needed (usually not required for free tier)

---

## 📊 What Changed

### Files Updated:

1. **`lib/firebase.ts`**
   - Added `location` parameter to `getVertexAI()` initialization
   - Now properly configures Vertex AI with location

2. **`lib/brief-parser.ts`**
   - Enhanced error handling with specific messages
   - Provides helpful guidance when API errors occur

3. **`env.example`**
   - Added `NEXT_PUBLIC_VERTEX_AI_LOCATION`
   - Added `NEXT_PUBLIC_VERTEX_AI_IMAGE_MODEL`

---

## ✅ Checklist

Before trying again, ensure:

- [ ] Vertex AI API is enabled in Google Cloud Console
- [ ] Cloud AI Platform API is enabled
- [ ] Firebase ML API is enabled
- [ ] You're on Firebase Blaze (Pay-as-you-go) plan
- [ ] `NEXT_PUBLIC_VERTEX_AI_LOCATION=us-central1` is in `.env.local`
- [ ] Development server was restarted after env changes
- [ ] Waited 2-5 minutes after enabling APIs

---

## 💰 Cost Estimate

**Gemini 1.5 Flash Pricing:**
- Input: $0.00001875 per 1K characters
- Output: $0.000075 per 1K characters

**Typical costs per operation:**
- Brief parsing: ~$0.001
- Influencer matching: ~$0.003
- Content generation: ~$0.002

**Monthly estimate for 1,000 presentations: ~$6-10**

---

## 🎉 Success!

Once you see:
```
✅ Brief parsed successfully!
✅ Found X influencers matching your criteria
```

Your Vertex AI is properly configured! 🚀

---

**Last Updated:** September 30, 2025
**Issue:** Firebase/Vertex AI 404 Error
**Status:** ✅ Fixed
