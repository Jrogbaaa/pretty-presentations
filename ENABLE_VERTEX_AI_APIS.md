# 🚀 Quick Fix: Enable Vertex AI APIs

## ⚠️ Current Issue
Your Firebase project `pretty-presentations` doesn't have access to Gemini models yet. This requires enabling specific APIs in Google Cloud Console.

---

## ✅ STEP-BY-STEP FIX (5 minutes)

### Step 1: Enable Vertex AI API

**Click this link and enable the API:**
👉 https://console.cloud.google.com/apis/library/aiplatform.googleapis.com?project=pretty-presentations

1. You should see "Vertex AI API" page
2. Click the blue **"ENABLE"** button
3. Wait for it to say "API enabled"

---

### Step 2: Enable Generative Language API

**Click this link and enable the API:**
👉 https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com?project=pretty-presentations

1. You should see "Generative Language API" page
2. Click the blue **"ENABLE"** button
3. Wait for it to say "API enabled"

---

### Step 3: Verify Your Environment Variable

Check your `.env.local` file has this line:

```bash
NEXT_PUBLIC_VERTEX_AI_LOCATION=us-central1
```

If it doesn't exist, add it now.

---

### Step 4: Verify Firebase Billing

**Vertex AI requires Firebase Blaze Plan (Pay-as-you-go)**

1. Go to: https://console.firebase.google.com/project/pretty-presentations/usage
2. Check if you're on **"Blaze Plan"**
3. If you see "Spark Plan" (free), you need to upgrade:
   - Click **"Modify plan"**
   - Select **"Blaze"** (Pay as you go)
   - Add a payment method
   
**Don't worry about cost:** Gemini is very cheap (~$0.001 per request, about $6-10 per 1,000 presentations)

---

### Step 5: Restart Your Dev Server

```bash
# In your terminal, stop the server (Ctrl+C or Cmd+C)
# Then restart:
npm run dev
```

---

### Step 6: Test Again

1. Open http://localhost:3000
2. Paste in your sample brief
3. Click "Parse Brief"
4. It should work now! ✅

---

## 🔍 Still Not Working?

### Option A: Wait 2-5 Minutes
After enabling APIs, Google Cloud sometimes takes a few minutes to propagate the changes. Wait 2-5 minutes and try again.

### Option B: Try a Different Region

Edit your `.env.local`:
```bash
# Try Europe instead
NEXT_PUBLIC_VERTEX_AI_LOCATION=europe-west1

# Or try US East
NEXT_PUBLIC_VERTEX_AI_LOCATION=us-east1
```

Then restart the dev server.

### Option C: Verify API is Actually Enabled

1. Go to: https://console.cloud.google.com/apis/dashboard?project=pretty-presentations
2. Look for "Vertex AI API" in the list
3. It should show "Enabled" with a green checkmark
4. If you don't see it, go back to Step 1

---

## 🔑 Alternative: Use Google AI API (If Vertex AI Doesn't Work)

If Vertex AI continues to fail, we can switch to the direct Google AI API instead:

### 1. Get a Google AI API Key
1. Go to: https://aistudio.google.com/app/apikey
2. Click **"Create API Key"**
3. Select your project (or create new)
4. Copy the generated key

### 2. Add to `.env.local`
```bash
GOOGLE_AI_API_KEY=your_api_key_here
```

### 3. Let me know
If you go this route, I'll need to update the code to use the Google AI API instead of Vertex AI. Just let me know and I can make that change.

---

## 📊 Quick Checklist

Before trying again:

- [ ] Vertex AI API is enabled (Step 1)
- [ ] Generative Language API is enabled (Step 2)
- [ ] `NEXT_PUBLIC_VERTEX_AI_LOCATION=us-central1` is in `.env.local` (Step 3)
- [ ] Firebase is on Blaze Plan (Pay-as-you-go) (Step 4)
- [ ] Dev server was restarted after changes (Step 5)
- [ ] Waited 2-5 minutes if APIs were just enabled
- [ ] Checked Google Cloud Console to verify APIs show as "Enabled"

---

## 💡 Understanding the Error

The 404 error means:
```
Publisher Model `projects/pretty-presentations/.../gemini-1.5-flash` was not found
```

This happens when:
1. ❌ Vertex AI API is not enabled (most common)
2. ❌ Project doesn't have billing enabled
3. ❌ Wrong location specified
4. ❌ APIs were just enabled (need to wait)

**Not** because:
- ✅ Your code is wrong (the code is correct)
- ✅ Your Firebase config is wrong (it's working)
- ✅ The model name is wrong (it's correct)

---

## 🎯 Expected Result

After completing these steps, you should see:

✅ **Success message:** "Brief parsed successfully!"
✅ **Form auto-filled** with extracted data
✅ **No errors** in the console

---

**Need help?** Share a screenshot of your Google Cloud Console APIs page and I can help diagnose further.
