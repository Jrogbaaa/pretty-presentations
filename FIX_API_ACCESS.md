# 🔧 Fix API Access Issue

## Problem
Your Google AI API key doesn't have access to Gemini models (404 error).

## Solution (Choose ONE):

---

## ✅ Option 1: Enable the Generative Language API (Recommended)

### Step 1: Enable the API
1. **Click this link:**
   👉 https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com

2. **Make sure** you're in the correct project (pretty-presentations)

3. Click **"ENABLE"**

4. **Wait 2-5 minutes** for the API to activate

### Step 2: Test Again
```bash
node test-google-ai.js
```

If it works, restart your dev server and try parsing a brief!

---

## ✅ Option 2: Create a NEW API Key (If Option 1 doesn't work)

### Step 1: Delete Old Key
1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your API key (starts with AIzaSy...)
3. Delete it

### Step 2: Create New Key
1. Go to: https://aistudio.google.com/app/apikey
2. Click **"Create API Key"**
3. Select **"Create API key in new project"** (important!)
4. Copy the new key

### Step 3: Update .env.local
Replace the old key with the new one:
```bash
NEXT_PUBLIC_GOOGLE_AI_API_KEY=your_new_key_here
```

### Step 4: Test
```bash
node test-google-ai.js
```

---

## ✅ Option 3: Use a Simple Free API Key

If the above doesn't work, let's create a completely fresh API key:

1. **Go to Google AI Studio:**
   👉 https://makersuite.google.com/app/apikey
   OR
   👉 https://aistudio.google.com/app/apikey

2. **Click "Get API Key"**

3. **Select "Create API key in new project"** (this creates a fresh project with all the right settings)

4. **Copy the API key**

5. **Update .env.local**:
   ```bash
   NEXT_PUBLIC_GOOGLE_AI_API_KEY=paste_your_new_key_here
   ```

6. **Test**:
   ```bash
   node test-google-ai.js
   ```

---

## 🔍 What's the Issue?

The error message says:
```
models/gemini-pro is not found for API version v1beta
```

This means:
- ❌ The Generative Language API is NOT enabled for your project
- ❌ OR your API key doesn't have permission to use Gemini models

---

## ✅ Quick Check

Before doing anything, verify which project your API key belongs to:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Look at your API keys
3. Check which project they're in
4. Make sure that project has "Generative Language API" enabled

---

## 💡 Easiest Solution

**Just create a brand new API key:**

1. Go to: https://aistudio.google.com/app/apikey
2. Click "Create API key in new project" 
3. This automatically enables everything you need!
4. Copy the key
5. Update `.env.local`
6. Test with: `node test-google-ai.js`

---

## 🎯 After It Works

Once you see "SUCCESS!" in the test:

1. **Restart your dev server:**
   ```bash
   # Stop (Ctrl+C)
   npm run dev
   ```

2. **Go to:** http://localhost:3000

3. **Paste your sample brief** and click "Parse Brief"

4. **It will work!** 🎉

---

Let me know which option you choose and I'll help if you hit any snags!
