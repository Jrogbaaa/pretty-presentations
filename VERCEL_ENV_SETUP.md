# Vercel Environment Variables Setup

**Date:** October 28, 2025  
**Status:** Required for Deployment

---

## ✅ Quick Answers

### Do I need to set NODE_ENV=production?
**NO** - Vercel automatically sets this for production deployments.

### Do I need to add the Vercel URL?
**NO** - Vercel provides automatic environment variables like `VERCEL_URL`.

---

## 🔑 Required Environment Variables for Vercel

You need to add these to your Vercel project settings:

### 1. Navigate to Vercel Dashboard
```
https://vercel.com/your-username/pretty-presentations/settings/environment-variables
```

### 2. Add These Variables

Based on your `env.example`, here's what you need:

#### **Firebase Configuration** (Required)
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

#### **Firebase Admin SDK** (Required for server-side)
```bash
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

⚠️ **IMPORTANT:** For `FIREBASE_ADMIN_PRIVATE_KEY`, paste the entire key including:
```
-----BEGIN PRIVATE KEY-----
...your key...
-----END PRIVATE KEY-----
```

#### **Google AI Configuration** (Required)
```bash
NEXT_PUBLIC_GOOGLE_AI_API_KEY=
NEXT_PUBLIC_GOOGLE_AI_MODEL=gemini-2.5-flash
NEXT_PUBLIC_GOOGLE_AI_IMAGE_MODEL=gemini-2.5-flash-image
```

Get your API key from: https://aistudio.google.com/app/apikey

#### **Vertex AI** (Optional - for reference)
```bash
NEXT_PUBLIC_VERTEX_AI_LOCATION=us-central1
NEXT_PUBLIC_VERTEX_AI_MODEL=gemini-1.5-flash
NEXT_PUBLIC_VERTEX_AI_IMAGE_MODEL=gemini-2.0-flash-exp
```

#### **Replicate API** (Required for Nano Banana images)
```bash
REPLICATE_API_TOKEN=
NEXT_PUBLIC_REPLICATE_API_TOKEN=
```

Get your token from: https://replicate.com/account/api-tokens

#### **Optional APIs**
```bash
APIFY_API_KEY=        # Optional
SERPLY_API_KEY=       # Optional
STARNGAGE_API_KEY=    # Optional
```

---

## 🚀 Automatic Vercel Environment Variables

Vercel provides these automatically - **DO NOT SET MANUALLY:**

### Production
```bash
NODE_ENV=production           # Automatically set
VERCEL=1                      # Indicates running on Vercel
VERCEL_ENV=production         # production | preview | development
VERCEL_URL=your-app.vercel.app # Your deployment URL
VERCEL_REGION=iad1           # Deployment region
```

### Preview (PR Deployments)
```bash
NODE_ENV=production           # Yes, preview also uses production
VERCEL_ENV=preview
VERCEL_GIT_COMMIT_SHA=abc123
VERCEL_GIT_COMMIT_REF=feature-branch
```

### How to Use Auto Variables in Code
```typescript
// Check if running on Vercel
if (process.env.VERCEL) {
  console.log('Running on Vercel');
}

// Get deployment URL (server-side only)
const url = process.env.VERCEL_URL;

// Check environment
const isProduction = process.env.VERCEL_ENV === 'production';
const isPreview = process.env.VERCEL_ENV === 'preview';
```

---

## 📝 Step-by-Step Setup

### Option 1: Via Vercel Dashboard (Recommended)

1. **Go to your project settings:**
   ```
   https://vercel.com/[your-username]/pretty-presentations/settings/environment-variables
   ```

2. **Click "Add New"**

3. **For each variable:**
   - Enter the **Key** (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`)
   - Enter the **Value** (your actual key)
   - Select environments: **Production**, **Preview**, **Development** (usually all three)
   - Click **Save**

4. **Repeat for all required variables** from the list above

5. **Redeploy** your project to apply the new variables

### Option 2: Via Vercel CLI

```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Login
vercel login

# Add environment variables
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY preview
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY development

# Or pull existing env vars from Vercel
vercel env pull .env.local
```

### Option 3: Bulk Import (Fastest)

1. Create a file with your variables (one per line):
   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   # ... etc
   ```

2. In Vercel Dashboard, use the bulk import feature:
   - Go to Environment Variables
   - Click on the **"..."** menu
   - Select **"Import from .env"**
   - Paste your variables

---

## 🔒 Security Best Practices

### ✅ DO:
- Use `NEXT_PUBLIC_` prefix for client-side variables only
- Keep sensitive keys (Firebase Admin, Replicate) **without** `NEXT_PUBLIC_` prefix
- Store private keys in Vercel's encrypted storage
- Rotate API keys regularly
- Use different Firebase projects for dev/staging/prod

### ❌ DON'T:
- Never commit `.env.local` or `.env.production` to Git
- Don't use `NEXT_PUBLIC_` for sensitive server-only secrets
- Don't share environment variables in screenshots or logs
- Don't use the same API keys for development and production

---

## 🧪 Testing Environment Variables

### After adding variables to Vercel:

1. **Trigger a new deployment:**
   ```bash
   git commit --allow-empty -m "Trigger redeploy for env vars"
   git push origin main
   ```

2. **Check the build logs** to ensure variables are loaded

3. **Test in production:**
   - Open your Vercel URL
   - Check browser console for any "missing API key" errors
   - Test key features (Firebase auth, AI generation, etc.)

### Debug Missing Variables:

If something doesn't work, check:

```typescript
// Add this temporarily to a server component or API route
console.log('Environment Check:', {
  hasFirebaseKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  hasGoogleAI: !!process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY,
  hasReplicate: !!process.env.REPLICATE_API_TOKEN,
  nodeEnv: process.env.NODE_ENV,
  vercelEnv: process.env.VERCEL_ENV
});
```

---

## 🌍 Environment-Specific Variables

If you need different values for preview vs production:

### In Vercel Dashboard:
When adding a variable, you can set different values for:
- **Production** - Main deployment (your-app.vercel.app)
- **Preview** - PR deployments (your-app-git-branch.vercel.app)
- **Development** - Local development with `vercel dev`

Example:
```bash
# Production
NEXT_PUBLIC_FIREBASE_PROJECT_ID=pretty-presentations-prod

# Preview
NEXT_PUBLIC_FIREBASE_PROJECT_ID=pretty-presentations-staging

# Development
NEXT_PUBLIC_FIREBASE_PROJECT_ID=pretty-presentations-dev
```

---

## 📊 Current Project Requirements

Based on your `env.example`, you need to set **at minimum**:

### Critical (App won't work without these):
- ✅ All `NEXT_PUBLIC_FIREBASE_*` variables (8 total)
- ✅ All `FIREBASE_ADMIN_*` variables (3 total)
- ✅ `NEXT_PUBLIC_GOOGLE_AI_API_KEY`
- ✅ `NEXT_PUBLIC_GOOGLE_AI_MODEL`
- ✅ `REPLICATE_API_TOKEN` (if using Nano Banana images)

### Optional (Enhanced features):
- ⭐ `APIFY_API_KEY`
- ⭐ `SERPLY_API_KEY`
- ⭐ `STARNGAGE_API_KEY`

**Total:** ~15 required variables minimum

---

## 🔄 After Setting Variables

1. **Redeploy** (automatic on next git push)
2. **Verify** the build succeeds
3. **Test** all features in production
4. **Monitor** for any API errors

---

## 📚 Additional Resources

- [Vercel Environment Variables Docs](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Firebase Setup Guide](https://firebase.google.com/docs/web/setup)
- [Google AI Studio](https://aistudio.google.com/)

---

## 🆘 Troubleshooting

### "Build succeeds but app doesn't work"
→ Missing `NEXT_PUBLIC_` variables (needed for client-side)

### "Firebase Auth fails in production"
→ Check Firebase Console → Authentication → Authorized domains
→ Add your Vercel domain (your-app.vercel.app)

### "API routes return 500 errors"
→ Missing server-side variables (Firebase Admin, Replicate)
→ Check Vercel Function Logs for specific errors

### "Environment variables not updating"
→ After changing variables, you MUST redeploy
→ Clear Vercel cache: Settings → Data Cache → Clear Cache

---

**Next Steps:**
1. Add all required environment variables to Vercel
2. Wait for automatic redeployment
3. Test the production site

Your TypeScript build errors are now fixed! Once you add the environment variables, your app should deploy successfully. 🚀

