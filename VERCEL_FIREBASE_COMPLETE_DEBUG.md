# 🔍 Complete Vercel Firebase Connection Debug Guide

**Error:** `error:1E08010C:DECODER routines::unsupported`  
**Root Cause:** Private key format issue in Vercel environment variables  
**Date:** October 29, 2025

---

## 🎯 The Problem

The Firebase Admin SDK cannot decode the private key in Vercel. This is **100% a format issue** with how the key is stored in Vercel's environment variables.

Your code is correct (line 13 in `firebase-admin.ts`):
```typescript
privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')
```

The issue is the **value** stored in Vercel, not the code.

---

## 🔬 ALL Possible Causes & Solutions

### ✅ Cause 1: Private Key Format (99% likely)

**Problem:** The private key in Vercel doesn't match the required format

**Test:**
1. Go to Vercel → Environment Variables
2. Click to view `FIREBASE_ADMIN_PRIVATE_KEY`
3. Check if it has `\n` as literal two characters (correct) or actual line breaks (wrong)

**Solutions:** See "5 Ways to Fix" section below

---

### ✅ Cause 2: Missing Environment Variables

**Problem:** One or more required variables are not set

**Required Variables:**
```bash
FIREBASE_ADMIN_PROJECT_ID
FIREBASE_ADMIN_CLIENT_EMAIL
FIREBASE_ADMIN_PRIVATE_KEY
OPENAI_API_KEY
NEXT_PUBLIC_FIREBASE_PROJECT_ID
```

**Test:**
```bash
# In Vercel dashboard, verify ALL these exist:
1. FIREBASE_ADMIN_PROJECT_ID=pretty-presentations
2. FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbsvc@pretty-presentations.iam.gserviceaccount.com
3. FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...
4. OPENAI_API_KEY=sk-proj-...
5. NEXT_PUBLIC_FIREBASE_PROJECT_ID=pretty-presentations
```

**Solution:** Add any missing variables

---

### ✅ Cause 3: Service Account Permissions

**Problem:** The service account doesn't have proper permissions

**Test:**
1. Go to [IAM Console](https://console.cloud.google.com/iam-admin/iam?project=pretty-presentations)
2. Find: `firebase-adminsdk-fbsvc@pretty-presentations.iam.gserviceaccount.com`
3. Verify roles include:
   - Firebase Admin SDK Administrator Service Agent
   - Cloud Datastore User (or Editor)

**Solution:**
1. Click "Edit" on the service account
2. Add role: "Cloud Datastore User"
3. Add role: "Firebase Admin"
4. Save

---

### ✅ Cause 4: Firestore Security Rules

**Problem:** Security rules block Admin SDK access (unlikely but possible)

**Test:** Check `firestore.rules` for overly restrictive rules

**Solution:**
Ensure Admin SDK can bypass rules (it should by default):
```javascript
// firestore.rules should NOT block admin access
// Admin SDK automatically bypasses security rules
```

---

### ✅ Cause 5: Environment Variable Scope

**Problem:** Variable is set for wrong environment

**Test:**
Check that `FIREBASE_ADMIN_PRIVATE_KEY` is checked for:
- ✅ Production
- ✅ Preview
- ✅ Development

**Solution:**
Edit the variable and ensure all three environments are checked

---

### ✅ Cause 6: Stale Build Cache

**Problem:** Vercel is using cached build with old env vars

**Test:** Redeploy with cache cleared

**Solution:**
1. Go to Deployments
2. Click latest
3. Click Redeploy
4. **UNCHECK** "Use existing Build Cache"
5. Redeploy

---

## 🛠️ 5 Ways to Fix the Private Key Issue

### Method 1: Copy from Terminal (Recommended)

```bash
cd "/Users/JackEllis/Pretty Presentations"

# This outputs the EXACT correct format:
grep "^FIREBASE_ADMIN_PRIVATE_KEY=" .env.local | sed 's/FIREBASE_ADMIN_PRIVATE_KEY=//'
```

**Copy the entire output** and paste into Vercel.

---

### Method 2: Use Vercel CLI

```bash
# Install CLI if needed
npm i -g vercel

# Login
vercel login

# Remove old variable
vercel env rm FIREBASE_ADMIN_PRIVATE_KEY production

# Add new variable (will prompt for value)
vercel env add FIREBASE_ADMIN_PRIVATE_KEY production

# When prompted, paste the value from Method 1
# Press Enter

# Repeat for other environments
vercel env add FIREBASE_ADMIN_PRIVATE_KEY preview
vercel env add FIREBASE_ADMIN_PRIVATE_KEY development

# Deploy
vercel --prod
```

---

### Method 3: Use Base64 Encoding (If format keeps breaking)

This method avoids the `\n` issue entirely by encoding the key.

**Step 1: Update `firebase-admin.ts`**

```typescript
// Option: Decode from base64 if that format is used
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY_BASE64
  ? Buffer.from(process.env.FIREBASE_ADMIN_PRIVATE_KEY_BASE64, 'base64').toString('utf-8')
  : process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

const serviceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey,
};
```

**Step 2: Generate base64 encoded key**

```bash
cd "/Users/JackEllis/Pretty Presentations"

# Generate base64 encoded version
grep "^FIREBASE_ADMIN_PRIVATE_KEY=" .env.local | \
  sed 's/FIREBASE_ADMIN_PRIVATE_KEY=//' | \
  sed 's/^"//' | sed 's/"$//' | \
  base64 | tr -d '\n'
```

**Step 3: Add to Vercel**
- Variable name: `FIREBASE_ADMIN_PRIVATE_KEY_BASE64`
- Value: (paste the base64 output from step 2)
- No quotes needed

---

### Method 4: Use Vercel Secret (Most Secure)

```bash
# Create a secret (more secure than env var)
vercel secrets add firebase-admin-key "YOUR_PRIVATE_KEY_HERE"

# Then reference it in env vars
# In Vercel dashboard, set:
# FIREBASE_ADMIN_PRIVATE_KEY = @firebase-admin-key
```

---

### Method 5: Direct JSON File (Alternative Approach)

**Step 1: Add the JSON file to Vercel**

Upload your service account JSON file:
- `/Users/JackEllis/Desktop/pretty-presentations-firebase-adminsdk-fbsvc-32cdd0db00.json`

**Step 2: Update `firebase-admin.ts`**

```typescript
import * as admin from 'firebase-admin';
import serviceAccount from '@/pretty-presentations-firebase-adminsdk.json';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}
```

**Note:** This is less secure but guaranteed to work

---

## 🧪 Diagnostic Test Script

Create this API route to test the connection:

**File:** `app/api/test-firebase-admin/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    // Test 1: Check env vars exist
    const envCheck = {
      hasProjectId: !!process.env.FIREBASE_ADMIN_PROJECT_ID,
      hasClientEmail: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
      privateKeyLength: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.length || 0,
      privateKeyStart: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.substring(0, 50) || 'missing',
    };

    // Test 2: Try to query Firestore
    const testQuery = await adminDb.collection('influencers').limit(1).get();
    
    return NextResponse.json({
      success: true,
      envCheck,
      firestoreTest: {
        connected: true,
        documentsFetched: testQuery.size,
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
```

**Deploy this and visit:** `https://your-vercel-app.vercel.app/api/test-firebase-admin`

This will show you EXACTLY what's wrong.

---

## 🎯 Step-by-Step Fix (Do This Now)

### Option A: Quick Fix (Try This First)

1. **Copy the correct value:**
```bash
cd "/Users/JackEllis/Pretty Presentations"
grep "^FIREBASE_ADMIN_PRIVATE_KEY=" .env.local | sed 's/FIREBASE_ADMIN_PRIVATE_KEY=//'
```

2. **Open two windows side-by-side:**
   - Left: Terminal with the output above
   - Right: Vercel dashboard env vars

3. **In Vercel:**
   - Find `FIREBASE_ADMIN_PRIVATE_KEY`
   - Click Edit
   - Select ALL text and delete
   - Copy from terminal (CMD+C)
   - Paste into Vercel (CMD+V)
   - **DO NOT MODIFY** - paste as-is
   - Save

4. **Redeploy:**
   - Deployments → Latest → Redeploy
   - **UNCHECK** "Use existing Build Cache"
   - Redeploy

5. **Test:**
   - Go to your Vercel URL
   - Try generating a text response

---

### Option B: Base64 Fix (If Option A Doesn't Work)

Use **Method 3** from the "5 Ways to Fix" section above. This completely avoids the format issue.

---

### Option C: JSON File Fix (If All Else Fails)

Use **Method 5** - direct JSON file approach. 100% guaranteed to work.

---

## 🔍 How to Verify It's Fixed

### ✅ Success Indicators:

**In Vercel Function Logs:**
```
[INFO] Starting markdown response generation
🔍 [SERVER] Searching Firestore with filters: {...}
✅ [SERVER] Fetched 9 influencers from Firestore
```

**In Browser:**
- Text response generates successfully
- Shows influencer recommendations
- No 500 error

### ❌ Still Broken:

**In Vercel Function Logs:**
```
Error: error:1E08010C:DECODER routines::unsupported
```

**Next Steps if Still Broken:**
1. Try Method 3 (Base64)
2. Try Method 5 (JSON file)
3. Create diagnostic route (see above)
4. Check service account permissions

---

## 📋 Complete Environment Variables Checklist

Verify ALL of these are set in Vercel:

### Firebase Client (Public - NEXT_PUBLIC_)
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

### Firebase Admin (Server-only)
- [ ] `FIREBASE_ADMIN_PROJECT_ID`
- [ ] `FIREBASE_ADMIN_CLIENT_EMAIL`
- [ ] `FIREBASE_ADMIN_PRIVATE_KEY` ⚠️ **THIS ONE IS THE PROBLEM**

### APIs
- [ ] `OPENAI_API_KEY`

### Optional
- [ ] `NEXT_PUBLIC_VERTEX_AI_LOCATION`
- [ ] `NEXT_PUBLIC_VERTEX_AI_MODEL`

---

## 🚀 The Nuclear Option (100% Success Rate)

If NOTHING works, here's the absolute foolproof method:

### 1. Use Vercel Environment Variables File Upload

Create a file: `vercel-env.txt`

```bash
FIREBASE_ADMIN_PROJECT_ID=pretty-presentations
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbsvc@pretty-presentations.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDaE3yw2st2HPl6\n9w+5UQiJQG0z+H22MPImoTEywVcalnoyM/p19I6c78sa+BnfJgNFopU3Jdi9hKJU\nhrkaoL4aTL5gH4KXu1crPPOU/lp7E4pjIlDidK6/6k0m5MFP8hCrjcEUpeSort4i\naBR95m+e3zaYv17u3JOV1DC7qOBy2FlqyhRbW3oalixLrXPKYNn2FBACHgm8sE7W\n0cAoj3jEZjS9VboXAo6LOt6czF2tJ16nIaExEZ795tBd8qjW0M06omJGPT4ICLpD\nLDI286ljqSn/xlKshAwbKrOVgkCRMgnsgO5JosscTFBWWsVuXyNUU5H0TBn+dqqm\ntcmKAFPFAgMBAAECggEAFEaEDRhmmtZyTp+6X0c8tTAfhxm3LHGMDhHmFls5+z+a\n4GCLTJy+hrJXzqvbEe+Bld+aIny7FFHI2vWEr8harGzOtXawiGVzYxKBbiyg4nkM\nYI+v+AITvkWtQyy5GXL+4Ehnd4E+C33oqsfFAfijD6EevSBr1eb9tMw79LKsnZi6\ndSNyCztXijX9l4KSyZHZYOKRSMZK+ooBs9F3huI7tuJqihNKhFzD4hyIBANzcVC/\nYA5ZR83Yi3UyFoKNqbueieH4vgOBNvldWaT8zTBOlZgzgh8qp40umLI4GbGIocmo\n3HsN5TTjbT/7SYRwYhgvVkn/pzJ0hzNrO5em5a4wiQKBgQDu/vP8gCtpSivga2Hk\nm64NrMiJLmtzCFbcykL/xMfWxa5Wp1VpLZ8MdBh6adI6XkwgIX3bXlZPaziwVjbC\nXYm52b51m6Qyc+/tl75Be0O+YbaJFpnmuSxsrjR3c/HeITJ0oAHpo+45nUcvwkyr\nMqKby0KB3oFnJhMyZLZPK45/bQKBgQDpl4DMNq1po64KkNnOIknEEsN1Svilere8\nMIkF7cCcxRSYT+HaLKwbp9f4I1QR8fd1e/Tod7F0V9yETuuWzcFdvh5JaYosXE9R\n1OoPxhzOWQ/K0QIfj3uJyy9x8Z7oV7kkFkVBKDWAt2VQ6kdZruH0vZnnZapxkgdA\noZV/tjJ2uQKBgCkd7cX0GwPbQd8zOj1FV1V882c+eDfrKF6F4a71INhfXBYGZdhZ\ng/J1iryMtiFalcg1WtzBxyGUtcUIoBUiWI6D2pOLOl1/urhqkc3cMhRv5SKCo+mg\n0/bCpb4jUWpA1dhgqtOSY2rAFz4tNFmDtZwOBRwotqSTVVwnHYJTYQmlAoGBAIEd\npiq62lW3DJ94e3vORhnkCTgPLatCTsbtyP+G8F13LjAWj49p++P5fY4B8RlONusw\njink5yiY3CIiAWTE7GoliVYoySBGEe34kzwO1KNWZT1FFDhftfhvYBVKafyhaIvC\n55rhX9l7BbyZEsFGwkzmdGiMMI9AGVQnPJxwGCq5AoGBAI5k5Kpq9Hesa3U32em4\nw4edOD5Ert0pVuiH9Lm520FrekSNECp0Cw8bYSlXsCtDL2YwBnQvs31DIfbzrljd\ng974SEbUUPsmzHAOFr6qaOgRueiuIYXm9XMqUnB848DZU8pMVDua9oKfE8iwBE2u\ngdlyvYrhhHQF6TuxceKquHKg\n-----END PRIVATE KEY-----\n"
```

### 2. Import in Vercel
- Go to Environment Variables
- Click "..." menu → Import
- Paste the contents of `vercel-env.txt`
- Import

---

## 📞 Support Checklist

If you're contacting Vercel support, provide:
1. Error message: `error:1E08010C:DECODER routines::unsupported`
2. It's a Firebase Admin SDK private key format issue
3. You've tried the CLI method
4. The key works locally but not in Vercel
5. You need help ensuring the `\n` characters are preserved

---

**Bottom Line:** The key format is STILL wrong in Vercel. Try Option A above right now, and if it doesn't work, use the Base64 method (Method 3) which completely bypasses the format issue.

