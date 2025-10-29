# Vercel Firebase Admin Setup - Troubleshooting Guide

## Quick Reference

### The Three Required Environment Variables

1. **FIREBASE_ADMIN_PROJECT_ID**
   - Value: `pretty-presentations`
   - Format: Simple string, no quotes

2. **FIREBASE_ADMIN_CLIENT_EMAIL**
   - Value: `firebase-adminsdk-fbsvc@pretty-presentations.iam.gserviceaccount.com`
   - Format: Simple string, no quotes

3. **FIREBASE_ADMIN_PRIVATE_KEY** ⚠️ **MOST COMMON ISSUE**
   - Format: **MUST** include quotes and `\n` as literal characters
   - Example: `"-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n"`

---

## Common Errors & Solutions

### Error: `error:1E08010C:DECODER routines::unsupported`

**Cause:** Private key format is incorrect

**Solutions:**
1. Verify key starts with `"-----BEGIN` (with opening quote)
2. Verify key has `\n` as literal backslash-n (not actual newlines)
3. Verify key ends with `-----\n"` (with closing quote)
4. No trailing commas
5. Copy directly from `.env.local` (working local setup)

### Error: `Service account object must contain a string "private_key" property`

**Cause:** Environment variable is missing or empty

**Solutions:**
1. Check variable exists in Vercel dashboard
2. Check variable is set for Production environment
3. Redeploy after adding the variable

### Error: `permission-denied` or `PERMISSION_DENIED`

**Cause:** Firestore security rules or wrong project

**Solutions:**
1. Verify project ID matches Firebase Console
2. Check Firestore rules allow admin SDK access
3. Verify service account has correct permissions

---

## How to Get Your Private Key

### Option 1: From Working Local Setup
```bash
cd "/Users/JackEllis/Pretty Presentations"
grep "^FIREBASE_ADMIN_PRIVATE_KEY=" .env.local | sed 's/FIREBASE_ADMIN_PRIVATE_KEY=//'
```

Copy the output EXACTLY (including quotes).

### Option 2: From Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `pretty-presentations`
3. Click ⚙️ → Project Settings
4. Click "Service accounts" tab
5. Click "Generate new private key"
6. Download the JSON file
7. Open in text editor
8. Find the `"private_key"` field
9. Copy the ENTIRE value (including surrounding quotes)

---

## How to Add to Vercel

### Via Vercel Dashboard (Recommended)

1. Go to: https://vercel.com/[your-team]/pretty-presentations/settings/environment-variables

2. For each variable:
   - Click "Add New"
   - Enter variable name
   - Paste value (EXACTLY as shown, no modifications)
   - Check: ✅ Production, ✅ Preview, ✅ Development
   - Click "Save"

3. After adding all three:
   - Go to Deployments tab
   - Click latest deployment
   - Click ⋯ → Redeploy
   - Check "Use existing build cache"
   - Click "Redeploy"

### Via Vercel CLI (Alternative)

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Login
vercel login

# Add each variable
vercel env add FIREBASE_ADMIN_PROJECT_ID production
# Paste: pretty-presentations

vercel env add FIREBASE_ADMIN_CLIENT_EMAIL production
# Paste: firebase-adminsdk-fbsvc@pretty-presentations.iam.gserviceaccount.com

vercel env add FIREBASE_ADMIN_PRIVATE_KEY production
# Paste the entire private key with quotes and \n

# Repeat for preview and development environments
vercel env add FIREBASE_ADMIN_PRIVATE_KEY preview
vercel env add FIREBASE_ADMIN_PRIVATE_KEY development

# Redeploy
vercel --prod
```

---

## Verification Steps

### 1. Check Environment Variables Are Set

In Vercel Dashboard:
- Settings → Environment Variables
- Verify all 3 variables exist
- Verify they're checked for Production

### 2. Check Deployment Logs

After redeploying:
1. Go to Deployments tab
2. Click the latest deployment
3. Click "View Function Logs" or "Runtime Logs"
4. Generate a test response on your site
5. Look for these logs:

**✅ SUCCESS:**
```
🔍 [SERVER] Searching Firestore with filters: {...}
✅ [SERVER] Fetched 9 influencers from Firestore
```

**❌ FAILURE:**
```
Error: 2 UNKNOWN: Getting metadata from plugin failed with error: error:1E08010C:DECODER routines::unsupported
```

### 3. Test on Live Site

1. Go to your production URL
2. Click "Generate Text Response"
3. Use a simple brief or click "Random Sample"
4. Wait for response
5. Check if influencers appear

---

## Private Key Format Examples

### ✅ CORRECT Format (works locally and on Vercel)
```
"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDR...\n-----END PRIVATE KEY-----\n"
```

**Key characteristics:**
- Opens with `"`
- Has `\n` after BEGIN marker
- Has `\n` scattered throughout (every ~64 characters in original key)
- Has `\n` before END marker
- Has `\n` after END marker
- Closes with `"`
- All on one line (or wrapped by UI)

### ❌ INCORRECT Formats

**Missing \n:**
```
"-----BEGIN PRIVATE KEY-----MIIEvQIBADANBg...-----END PRIVATE KEY-----"
```

**Actual line breaks instead of \n:**
```
"-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkq...
-----END PRIVATE KEY-----"
```

**No quotes:**
```
-----BEGIN PRIVATE KEY-----\nMIIEvQ...
```

**Trailing comma:**
```
"-----BEGIN PRIVATE KEY-----\nMIIEvQ...\n-----END PRIVATE KEY-----\n",
```

---

## Testing Locally First

Before deploying to Vercel, always test locally:

```bash
cd "/Users/JackEllis/Pretty Presentations"

# 1. Verify .env.local has all 3 variables
grep "FIREBASE_ADMIN" .env.local

# 2. Start dev server
npm run dev

# 3. Generate a text response
# 4. Check terminal for:
✅ [SERVER] Fetched X influencers from Firestore

# If local works, then copy .env.local values to Vercel EXACTLY
```

---

## Still Having Issues?

1. **Double-check the key format** - This is the #1 issue
2. **Try copying from `.env.local`** - It works locally, so the format is correct
3. **Use Vercel CLI instead of Dashboard** - Sometimes the UI modifies the value
4. **Download a fresh service account key** - Your current key might be corrupted
5. **Check Vercel Runtime Logs** - Look for the exact error message

---

## Related Documentation

- [Firebase Admin SDK Setup](./SETUP_SERVICE_ACCOUNT.md)
- [Vercel Environment Variables](./VERCEL_ENV_SETUP.md)
- [Deployment Status](./DEPLOYMENT_STATUS_v2.4.4.md)

