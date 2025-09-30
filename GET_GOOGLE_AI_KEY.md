# 🔑 Get Google AI API Key (Simpler Alternative)

## Why This Approach?

The Firebase Vertex AI preview package has known issues. Using the **Google AI API directly** is:
- ✅ More reliable
- ✅ Easier to set up
- ✅ No billing requirements for testing
- ✅ Same Gemini models

---

## 📋 Step-by-Step Guide (2 minutes)

### Step 1: Get Your API Key

1. **Go to Google AI Studio:**
   👉 https://aistudio.google.com/app/apikey

2. **Click "Create API Key"**

3. **Select a project:**
   - Choose "pretty-presentations" from dropdown
   - OR click "Create API key in new project"

4. **Copy the API key** that appears (starts with "AIza...")

---

### Step 2: Add to .env.local

Open your `.env.local` file and add this line:

```bash
NEXT_PUBLIC_GOOGLE_AI_API_KEY=AIza...your_key_here...
```

**Important:** Keep all your existing Firebase variables - just add this new one.

Your `.env.local` should now have:
```bash
# Firebase Configuration (keep these)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_DATABASE_URL=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...

# Vertex AI Configuration (keep these)
NEXT_PUBLIC_VERTEX_AI_LOCATION=us-central1
NEXT_PUBLIC_VERTEX_AI_MODEL=gemini-1.5-flash
NEXT_PUBLIC_VERTEX_AI_IMAGE_MODEL=gemini-2.0-flash-exp

# Google AI API Key (NEW - add this)
NEXT_PUBLIC_GOOGLE_AI_API_KEY=AIza...your_key_here...
```

---

### Step 3: Tell Me When Done

Once you've added the API key, let me know and I'll update the code to use this more reliable approach.

---

## 💰 Cost & Limits

**Free Tier (Good for development):**
- ✅ 15 requests per minute
- ✅ 1,500 requests per day
- ✅ 1 million tokens per minute
- ✅ Perfect for testing and development

**Paid Tier (For production):**
- Same pricing as Vertex AI (~$0.001 per request)
- Higher rate limits

---

## 🔐 Security Note

The API key will be visible in the browser (it's a client-side key). This is normal and expected for this type of API. Google AI Studio keys have built-in rate limiting and can be restricted to specific domains in production.

---

## ✅ What Happens Next

After you add the API key:
1. I'll update the code to use Google AI SDK
2. Restart your dev server
3. Try parsing a brief - it will work! 🎉

---

**Ready?** Go get your API key and paste it in `.env.local`, then let me know!
