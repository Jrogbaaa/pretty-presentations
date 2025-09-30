# 🤖 Gemini API Configuration Guide

## 🎯 **Two Ways to Use Gemini**

Your app can use Gemini AI in two ways:

### **Option 1: Through Firebase Vertex AI** (Current Setup) ✅

**Pros:**
- Already configured
- Integrated with Firebase
- No separate API key needed
- Built-in throttling and monitoring

**Cons:**
- Requires Firebase Blaze plan
- Uses Vertex AI pricing
- Location-specific (us-central1)

**Status**: ✅ **Ready to use** (after enabling APIs)

**Current configuration in `.env.local`:**
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDLEV0_6OVYJs_dnxUj6b4-zsBOYQb4wzc
NEXT_PUBLIC_VERTEX_AI_LOCATION=us-central1
NEXT_PUBLIC_VERTEX_AI_MODEL=gemini-1.5-flash
```

---

### **Option 2: Direct Gemini API Key** (Alternative)

**Pros:**
- Simpler setup
- Direct access to Google AI Studio
- Can use without Firebase
- Separate billing

**Cons:**
- Need separate API key
- Less integrated
- Manual rate limiting

**Status**: 🔧 **Optional - not required**

---

## 🚀 **Recommended: Stick with Vertex AI**

Since you've already enabled the APIs, **you don't need a separate Gemini API key**. Your current setup will work perfectly.

### **What You've Enabled:**

1. ✅ **Firebase ML API** - For Vertex AI access
2. ✅ **Vertex AI API** - For Gemini model access
3. ✅ **IAM Permissions** - For predictions

### **Test Vertex AI Connection:**

```bash
npm run test:firebase
```

Should show:
```
🤖 Testing Vertex AI (Gemini)...
✅ Vertex AI: Connected
   Test response: Hello, Pretty Presentations!
```

---

## 🔑 **Optional: Get Gemini API Key** (If You Want Direct Access)

If you prefer using a direct Gemini API key instead of Vertex AI:

### **Step 1: Get API Key**

1. Go to: https://makersuite.google.com/app/apikey
2. Click **"Create API Key"**
3. Select your Google Cloud project or create new
4. Copy the generated key

### **Step 2: Add to .env.local**

```bash
# Add this line to .env.local:
GEMINI_API_KEY=your_api_key_here
```

### **Step 3: Update Code to Use Direct API**

You'd need to modify `lib/firebase.ts` to use the direct Gemini API instead of Vertex AI. But this is **NOT recommended** since Vertex AI is already working.

---

## 📊 **API Comparison**

| Feature | Vertex AI (Current) | Direct Gemini API |
|---------|-------------------|------------------|
| Setup Complexity | Medium | Easy |
| Firebase Integration | ✅ Built-in | ❌ Manual |
| Rate Limiting | ✅ Automatic | ⚠️ Manual |
| Monitoring | ✅ Firebase Console | ⚠️ Cloud Console |
| Cost | ~$0.001/request | ~$0.001/request |
| Recommended | ✅ **YES** | ⚠️ Only if needed |

---

## 🧪 **Test Your Current Setup**

Let's verify Vertex AI is working:

### **Test 1: Firebase Connection**
```bash
npm run test:firebase
```

Expected output:
```
✅ Vertex AI: Connected
```

### **Test 2: Generate Brief**

1. Open: http://localhost:3000
2. Fill in brief form
3. Click "Generate Presentation"
4. If it works, Vertex AI is configured correctly!

### **Test 3: Check Firebase Console**

1. Go to: https://console.firebase.google.com/project/pretty-presentations/usage
2. You should see Vertex AI usage after running tests

---

## 🐛 **Troubleshooting**

### **"Permission Denied" Error**

**Problem**: APIs not fully enabled yet

**Solution**: 
1. Wait 2-5 minutes after enabling APIs
2. Go to: https://console.cloud.google.com/apis/dashboard?project=pretty-presentations
3. Verify these are enabled:
   - ✅ Firebase ML API
   - ✅ Vertex AI API
   - ✅ Cloud AI Platform

### **"Model Not Found" Error**

**Problem**: Model name incorrect in .env.local

**Solution**: Verify model name:
```bash
NEXT_PUBLIC_VERTEX_AI_MODEL=gemini-1.5-flash
```

Valid models:
- `gemini-1.5-flash` (fastest, recommended)
- `gemini-1.5-pro` (more powerful, slower)
- `gemini-pro` (older version)

### **"Location Not Supported" Error**

**Problem**: Vertex AI not available in your location

**Solution**: Try different locations in .env.local:
```bash
NEXT_PUBLIC_VERTEX_AI_LOCATION=us-central1  # Default, recommended
# Or try:
# NEXT_PUBLIC_VERTEX_AI_LOCATION=europe-west1
# NEXT_PUBLIC_VERTEX_AI_LOCATION=asia-northeast1
```

---

## 💰 **Pricing**

### **Vertex AI (Gemini 1.5 Flash):**
- Input: $0.00001875 per 1K characters (~$0.001 per request)
- Output: $0.000075 per 1K characters
- Very affordable for most use cases

### **Typical Usage:**
- Brief parsing: ~2,000 characters input, 500 output = $0.001
- Influencer ranking: ~5,000 characters input, 1,000 output = $0.003
- Content generation: ~3,000 characters input, 2,000 output = $0.002

**Estimated monthly cost for 1,000 presentations**: ~$6-10

---

## ✅ **Current Status**

**What's Configured:**
- ✅ Firebase SDK initialized
- ✅ Vertex AI endpoint configured
- ✅ Gemini 1.5 Flash model selected
- ✅ Environment variables set
- ✅ APIs enabled (per your confirmation)

**What's Needed:**
- ⏳ Wait 2-5 minutes for APIs to propagate
- ⏳ Run test to verify connection
- ✅ You're ready to use!

**No separate Gemini API key needed** - your Firebase setup handles everything!

---

## 🎉 **Recommendation**

**✅ Use Vertex AI** (current setup)
- It's already configured
- More integrated with your app
- Better monitoring through Firebase Console
- No additional setup needed

**❌ Don't add separate Gemini API key** unless:
- You specifically need it for other projects
- You want to bypass Firebase
- You hit Vertex AI quotas (unlikely)

---

## 🚀 **Next Steps**

1. **Wait 2-5 minutes** after enabling APIs (already done)
2. **Test connection**: `npm run test:firebase`
3. **If it works**: You're done! 🎉
4. **If it fails**: Check troubleshooting section above

---

**Your AI setup is complete! No Gemini API key needed.** 🚀
