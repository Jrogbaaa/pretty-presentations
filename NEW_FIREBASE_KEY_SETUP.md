# 🔑 New Firebase Private Key Setup Guide

**Date:** October 29, 2025  
**Status:** ✅ Local `.env.local` Updated | ⚠️ Vercel Needs Update

---

## What Changed

You generated a **NEW** Firebase Admin service account private key on October 29, 2025.

**Key ID:** `32cdd0db007a75b392573e0b692a672fca2ce6f1`

---

## ✅ Step 1: Local Setup (COMPLETE)

Your local `.env.local` file has been updated with the new private key.

**Backup created:** `.env.local.backup-[timestamp]`

---

## ⚠️ Step 2: Update Vercel (REQUIRED)

You **MUST** update the private key in Vercel, or your production site will continue to fail.

### Copy This EXACT Value for Vercel:

```
"-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDaE3yw2st2HPl6\n9w+5UQiJQG0z+H22MPImoTEywVcalnoyM/p19I6c78sa+BnfJgNFopU3Jdi9hKJU\nhrkaoL4aTL5gH4KXu1crPPOU/lp7E4pjIlDidK6/6k0m5MFP8hCrjcEUpeSort4i\naBR95m+e3zaYv17u3JOV1DC7qOBy2FlqyhRbW3oalixLrXPKYNn2FBACHgm8sE7W\n0cAoj3jEZjS9VboXAo6LOt6czF2tJ16nIaExEZ795tBd8qjW0M06omJGPT4ICLpD\nLDI286ljqSn/xlKshAwbKrOVgkCRMgnsgO5JosscTFBWWsVuXyNUU5H0TBn+dqqm\ntcmKAFPFAgMBAAECggEAFEaEDRhmmtZyTp+6X0c8tTAfhxm3LHGMDhHmFls5+z+a\n4GCLTJy+hrJXzqvbEe+Bld+aIny7FFHI2vWEr8harGzOtXawiGVzYxKBbiyg4nkM\nYI+v+AITvkWtQyy5GXL+4Ehnd4E+C33oqsfFAfijD6EevSBr1eb9tMw79LKsnZi6\ndSNyCztXijX9l4KSyZHZYOKRSMZK+ooBs9F3huI7tuJqihNKhFzD4hyIBANzcVC/\nYA5ZR83Yi3UyFoKNqbueieH4vgOBNvldWaT8zTBOlZgzgh8qp40umLI4GbGIocmo\n3HsN5TTjbT/7SYRwYhgvVkn/pzJ0hzNrO5em5a4wiQKBgQDu/vP8gCtpSivga2Hk\nm64NrMiJLmtzCFbcykL/xMfWxa5Wp1VpLZ8MdBh6adI6XkwgIX3bXlZPaziwVjbC\nXYm52b51m6Qyc+/tl75Be0O+YbaJFpnmuSxsrjR3c/HeITJ0oAHpo+45nUcvwkyr\nMqKby0KB3oFnJhMyZLZPK45/bQKBgQDpl4DMNq1po64KkNnOIknEEsN1Svilere8\nMIkF7cCcxRSYT+HaLKwbp9f4I1QR8fd1e/Tod7F0V9yETuuWzcFdvh5JaYosXE9R\n1OoPxhzOWQ/K0QIfj3uJyy9x8Z7oV7kkFkVBKDWAt2VQ6kdZruH0vZnnZapxkgdA\noZV/tjJ2uQKBgCkd7cX0GwPbQd8zOj1FV1V882c+eDfrKF6F4a71INhfXBYGZdhZ\ng/J1iryMtiFalcg1WtzBxyGUtcUIoBUiWI6D2pOLOl1/urhqkc3cMhRv5SKCo+mg\n0/bCpb4jUWpA1dhgqtOSY2rAFz4tNFmDtZwOBRwotqSTVVwnHYJTYQmlAoGBAIEd\npiq62lW3DJ94e3vORhnkCTgPLatCTsbtyP+G8F13LjAWj49p++P5fY4B8RlONusw\njink5yiY3CIiAWTE7GoliVYoySBGEe34kzwO1KNWZT1FFDhftfhvYBVKafyhaIvC\n55rhX9l7BbyZEsFGwkzmdGiMMI9AGVQnPJxwGCq5AoGBAI5k5Kpq9Hesa3U32em4\nw4edOD5Ert0pVuiH9Lm520FrekSNECp0Cw8bYSlXsCtDL2YwBnQvs31DIfbzrljd\ng974SEbUUPsmzHAOFr6qaOgRueiuIYXm9XMqUnB848DZU8pMVDua9oKfE8iwBE2u\ngdlyvYrhhHQF6TuxceKquHKg\n-----END PRIVATE KEY-----\n"
```

### How to Update in Vercel:

#### Option 1: Via Dashboard (Recommended)

1. **Go to Environment Variables:**
   ```
   https://vercel.com/[your-username]/pretty-presentations/settings/environment-variables
   ```

2. **Find `FIREBASE_ADMIN_PRIVATE_KEY`** and click the **⋯ menu** → **Edit**

3. **Delete the old value completely**

4. **Paste the NEW value above** (copy from start `"` to end `"`)

5. **Verify format:**
   - ✅ Starts with `"-----BEGIN PRIVATE KEY-----\n`
   - ✅ Contains `\n` throughout (literal backslash-n)
   - ✅ Ends with `\n-----END PRIVATE KEY-----\n"`

6. **Save** and ensure all environments are checked (Production, Preview, Development)

7. **Redeploy:** Go to Deployments → Latest → Redeploy

#### Option 2: Via Vercel CLI

```bash
# Remove old key
vercel env rm FIREBASE_ADMIN_PRIVATE_KEY production

# Add new key
vercel env add FIREBASE_ADMIN_PRIVATE_KEY production
# When prompted, paste the value from above

# Repeat for other environments
vercel env add FIREBASE_ADMIN_PRIVATE_KEY preview
vercel env add FIREBASE_ADMIN_PRIVATE_KEY development

# Deploy
vercel --prod
```

---

## 📋 All Three Firebase Admin Variables

Make sure ALL three are set in Vercel:

```bash
FIREBASE_ADMIN_PROJECT_ID=pretty-presentations

FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbsvc@pretty-presentations.iam.gserviceaccount.com

FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDaE3yw2st2HPl6\n9w+5UQiJQG0z+H22MPImoTEywVcalnoyM/p19I6c78sa+BnfJgNFopU3Jdi9hKJU\nhrkaoL4aTL5gH4KXu1crPPOU/lp7E4pjIlDidK6/6k0m5MFP8hCrjcEUpeSort4i\naBR95m+e3zaYv17u3JOV1DC7qOBy2FlqyhRbW3oalixLrXPKYNn2FBACHgm8sE7W\n0cAoj3jEZjS9VboXAo6LOt6czF2tJ16nIaExEZ795tBd8qjW0M06omJGPT4ICLpD\nLDI286ljqSn/xlKshAwbKrOVgkCRMgnsgO5JosscTFBWWsVuXyNUU5H0TBn+dqqm\ntcmKAFPFAgMBAAECggEAFEaEDRhmmtZyTp+6X0c8tTAfhxm3LHGMDhHmFls5+z+a\n4GCLTJy+hrJXzqvbEe+Bld+aIny7FFHI2vWEr8harGzOtXawiGVzYxKBbiyg4nkM\nYI+v+AITvkWtQyy5GXL+4Ehnd4E+C33oqsfFAfijD6EevSBr1eb9tMw79LKsnZi6\ndSNyCztXijX9l4KSyZHZYOKRSMZK+ooBs9F3huI7tuJqihNKhFzD4hyIBANzcVC/\nYA5ZR83Yi3UyFoKNqbueieH4vgOBNvldWaT8zTBOlZgzgh8qp40umLI4GbGIocmo\n3HsN5TTjbT/7SYRwYhgvVkn/pzJ0hzNrO5em5a4wiQKBgQDu/vP8gCtpSivga2Hk\nm64NrMiJLmtzCFbcykL/xMfWxa5Wp1VpLZ8MdBh6adI6XkwgIX3bXlZPaziwVjbC\nXYm52b51m6Qyc+/tl75Be0O+YbaJFpnmuSxsrjR3c/HeITJ0oAHpo+45nUcvwkyr\nMqKby0KB3oFnJhMyZLZPK45/bQKBgQDpl4DMNq1po64KkNnOIknEEsN1Svilere8\nMIkF7cCcxRSYT+HaLKwbp9f4I1QR8fd1e/Tod7F0V9yETuuWzcFdvh5JaYosXE9R\n1OoPxhzOWQ/K0QIfj3uJyy9x8Z7oV7kkFkVBKDWAt2VQ6kdZruH0vZnnZapxkgdA\noZV/tjJ2uQKBgCkd7cX0GwPbQd8zOj1FV1V882c+eDfrKF6F4a71INhfXBYGZdhZ\ng/J1iryMtiFalcg1WtzBxyGUtcUIoBUiWI6D2pOLOl1/urhqkc3cMhRv5SKCo+mg\n0/bCpb4jUWpA1dhgqtOSY2rAFz4tNFmDtZwOBRwotqSTVVwnHYJTYQmlAoGBAIEd\npiq62lW3DJ94e3vORhnkCTgPLatCTsbtyP+G8F13LjAWj49p++P5fY4B8RlONusw\njink5yiY3CIiAWTE7GoliVYoySBGEe34kzwO1KNWZT1FFDhftfhvYBVKafyhaIvC\n55rhX9l7BbyZEsFGwkzmdGiMMI9AGVQnPJxwGCq5AoGBAI5k5Kpq9Hesa3U32em4\nw4edOD5Ert0pVuiH9Lm520FrekSNECp0Cw8bYSlXsCtDL2YwBnQvs31DIfbzrljd\ng974SEbUUPsmzHAOFr6qaOgRueiuIYXm9XMqUnB848DZU8pMVDua9oKfE8iwBE2u\ngdlyvYrhhHQF6TuxceKquHKg\n-----END PRIVATE KEY-----\n"
```

---

## 🔄 About Generating New Keys

### ✅ Benefits:
- **Fresh start** - no more format issues
- **Security** - old key can be revoked
- **Clean slate** - eliminates any corruption

### ⚠️ Important Notes:

1. **Old key still works** until you revoke it in Firebase Console
2. **Both local AND Vercel must use the same key**
3. **You can have multiple active keys** - Firebase allows this
4. **Revoke old keys** after confirming new one works

### To Revoke Old Key (After Testing):

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select `pretty-presentations`
3. Settings → Service Accounts
4. Click "Manage service account permissions"
5. Find the old key and delete it

**⚠️ DON'T revoke until you've confirmed the new key works in both local and Vercel!**

---

## 🧪 Testing Steps

### 1. Test Locally First

```bash
cd "/Users/JackEllis/Pretty Presentations"

# Start dev server
npm run dev

# In browser:
# - Go to http://localhost:3000
# - Click "Generate Text Response"
# - Use "Random Sample" or fill in a brief
# - Check terminal for: ✅ [SERVER] Fetched X influencers from Firestore
```

If local works, proceed to update Vercel.

### 2. Test on Vercel (After Updating)

```bash
# After updating env var and redeploying:
# - Go to your Vercel URL
# - Click "Generate Text Response"
# - Use "Random Sample"
# - Check Function Logs for success message
```

---

## ✅ Success Indicators

### Local (Terminal):
```
🔍 [SERVER] Searching Firestore with filters: {...}
✅ [SERVER] Fetched 9 influencers from Firestore
[INFO] Starting markdown response generation
```

### Vercel (Function Logs):
```
🔍 [SERVER] Searching Firestore with filters: {...}
✅ [SERVER] Fetched 9 influencers from Firestore
[INFO] Starting markdown response generation
```

### ❌ Failure (Old Error):
```
Error: error:1E08010C:DECODER routines::unsupported
```

---

## 📝 Summary Checklist

- [x] ✅ New private key generated from Firebase Console
- [x] ✅ Local `.env.local` updated with new key
- [x] ✅ Backup of old `.env.local` created
- [ ] ⏳ Vercel `FIREBASE_ADMIN_PRIVATE_KEY` updated
- [ ] ⏳ Vercel redeployed
- [ ] ⏳ Local testing completed
- [ ] ⏳ Production testing completed
- [ ] ⏳ Old key revoked (optional, after confirming new key works)

---

## 🔗 Related Files

- Service Account JSON: `/Users/JackEllis/Desktop/pretty-presentations-firebase-adminsdk-fbsvc-32cdd0db00.json`
- Local Config: `.env.local` (updated)
- Backup: `.env.local.backup-[timestamp]`
- Vercel Settings: `https://vercel.com/[username]/pretty-presentations/settings/environment-variables`

---

## 🆘 Troubleshooting

### If local still fails after update:
```bash
# Verify the key is correct
grep "FIREBASE_ADMIN_PRIVATE_KEY" .env.local | head -c 100

# Should show: FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgI...
```

### If Vercel still fails after update:
1. Check you copied the ENTIRE key (including quotes)
2. Verify format in Vercel dashboard (should have `\n` not actual newlines)
3. Try using Vercel CLI instead of dashboard
4. Check Function Logs for specific error

---

**Next Step:** Update the private key in Vercel using the value from the "Copy This EXACT Value" section above! 🚀

