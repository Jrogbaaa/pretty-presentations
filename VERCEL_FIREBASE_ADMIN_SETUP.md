# 🚀 Fix Vercel Build Error: Firebase Admin Setup

## ❌ Current Error

```
Error: Service account object must contain a string "private_key" property.
```

**Why it happens:** Vercel doesn't have your Firebase Admin credentials (service account) needed for the server-side influencer matching.

---

## ✅ Solution: Add 3 Environment Variables to Vercel

### Step 1: Get Your Firebase Service Account Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **Pretty Presentations**
3. Click ⚙️ **Settings** → **Project Settings**
4. Click **Service Accounts** tab
5. Click **Generate new private key** button
6. Download the JSON file (it contains your credentials)

### Step 2: Extract Values from JSON File

Open the downloaded JSON file. You'll see something like:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "...",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
}
```

### Step 3: Add to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **pretty-presentations**
3. Go to **Settings** → **Environment Variables**
4. Add these 3 variables:

#### Variable 1: FIREBASE_ADMIN_PROJECT_ID
- **Name:** `FIREBASE_ADMIN_PROJECT_ID`
- **Value:** Copy `project_id` from your JSON
- **Example:** `pretty-presentations-123abc`
- **Environments:** Check ✅ Production, ✅ Preview, ✅ Development

#### Variable 2: FIREBASE_ADMIN_CLIENT_EMAIL
- **Name:** `FIREBASE_ADMIN_CLIENT_EMAIL`
- **Value:** Copy `client_email` from your JSON
- **Example:** `firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com`
- **Environments:** Check ✅ Production, ✅ Preview, ✅ Development

#### Variable 3: FIREBASE_ADMIN_PRIVATE_KEY
- **Name:** `FIREBASE_ADMIN_PRIVATE_KEY`
- **Value:** Copy the ENTIRE `private_key` from your JSON (including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)
- **IMPORTANT:** Keep the `\n` characters - they should stay as literal `\n` (not actual newlines)
- **Example:** `-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n`
- **Environments:** Check ✅ Production, ✅ Preview, ✅ Development

### Step 4: Redeploy

After adding all 3 variables:

1. Go to **Deployments** tab in Vercel
2. Click **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
4. **OR** just push a new commit to trigger deployment:

```bash
cd "/Users/JackEllis/Pretty Presentations"
git commit --allow-empty -m "Trigger redeploy with Firebase Admin credentials"
git push origin main
```

---

## 🔍 Why This Is Needed

### The Flow:
```
1. User clicks "Generate Text Response"
   ↓
2. API route `/api/generate-text-response` runs on Vercel servers
   ↓
3. Needs to fetch influencers from Firestore database
   ↓
4. Firebase Admin SDK requires service account credentials
   ↓
5. ❌ If missing → Build error: "private_key" property missing
   ↓
6. ✅ If present → Successfully queries 4,008 influencers
```

### Local vs. Vercel:
- **Local:** Works because `.env.local` has credentials
- **Vercel:** Fails because environment variables not set in dashboard

---

## ✅ Verification

After redeploying with credentials:

### Build Should Succeed:
```bash
✓ Compiled successfully in 31.6s
✓ Running TypeScript ...
✓ Collecting page data ...
✓ Generating static pages (9/9)
✓ Collecting build traces
✓ Finalizing page optimization
✓ Build Completed in XX seconds
```

### Test the Feature:
1. Visit your deployed site: `https://pretty-presentations.vercel.app`
2. Generate a text response with:
   - Budget: €50,000
   - Platforms: Instagram
   - Location: Spain
3. Should see influencers displayed! 🎉

---

## 🔒 Security Notes

- **Never commit** service account JSON to Git
- **Never share** your private key publicly
- **Keep** `.env.local` in `.gitignore`
- **Use** Vercel's encrypted environment variables (they handle security)

---

## 🆘 Still Getting Errors?

### Error: "Invalid credentials"
- Double-check you copied the ENTIRE private key (with BEGIN and END lines)
- Make sure `\n` characters are preserved (not converted to actual newlines)

### Error: "Permission denied"
- Go to Firebase Console → IAM & Admin
- Make sure your service account has **Firestore User** role
- Add role if missing: Click **Add**, select service account, add "Cloud Datastore User" role

### Error: Build still failing
- Verify all 3 variables are set in Vercel dashboard
- Check they're enabled for "Production" environment
- Try deleting and re-adding the variables
- Hard refresh deployment: Delete `.next` cache in Vercel settings

---

## 📞 Quick Checklist

Before redeploying, verify you have:

- [ ] Downloaded Firebase service account JSON
- [ ] Added `FIREBASE_ADMIN_PROJECT_ID` to Vercel
- [ ] Added `FIREBASE_ADMIN_CLIENT_EMAIL` to Vercel
- [ ] Added `FIREBASE_ADMIN_PRIVATE_KEY` to Vercel (with `\n` preserved)
- [ ] Enabled variables for Production, Preview, Development
- [ ] Triggered a new deployment

Once all checked, your influencer matching will work on production! 🚀

---

**Need the service account JSON again?**
Firebase Console → Settings → Service Accounts → Generate new private key

