# FIREBASE_ADMIN_PRIVATE_KEY Fix for Vercel

## The Problem

Error: `error:1E08010C:DECODER routines::unsupported`

This means the private key format in Vercel is incorrect.

---

## ✅ EXACT FORMAT REQUIRED

The key **MUST** be on a **single line** with `\n` as **literal two-character sequences** (backslash followed by n), NOT actual newline characters.

### Step-by-Step Fix

#### Option 1: Use This Terminal Command (Recommended)

Run this command to get the correctly formatted key from your `.env.local`:

```bash
cd "/Users/JackEllis/Pretty Presentations"
grep "^FIREBASE_ADMIN_PRIVATE_KEY=" .env.local | sed 's/FIREBASE_ADMIN_PRIVATE_KEY=//'
```

**Copy the ENTIRE output** (including the quotes at start and end).

---

#### Option 2: Manual Format (If command doesn't work)

Your key from `.env.local` is:

```
"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDRjdo7efnSJOyG\nfcziRfWPmzb6yU4Eu9IBP3LzGPtBz/P4LFHpRfBBE8HecDj/DGffzpaTMWbDCI0X\n10jQDw3uffesOU6K1Q1o4hgFGrjt4dHIsDKc4Rd8gO5DRl2b+nBcde8kD4jYoRQY\nrgORyIXljN3D2kQJDDwZerfz0cOCZkrwE0gTOZlBhpnwFTVm8B5pfIRxRdXQjyVz\nswHIikngQlW04+/sKYCU6fMoz5/ifLIizfNh+RPiRRKQtd6OWy/nzaMeFGFNbKVF\n5YLpWnh3Xx77x8LA74gUNNtcS8YpiJwZGFOQxUHy0e8YDKUzm3CCOxJQR6H1VI4b\nbDIR/8YLAgMBAAECggEAA+XugQJ4d/g4zebgQZA+qnEnulZxhhlrR4qHnkmrrhNm\nlF+dFrvhdpnIfQAVTCWSMvg5L6aVArpRhzNogHoOrsFGEM2jkncMAhR4f+sCNQCC\n3v8wGU8hkKZZ4enUc49awbx/GCZNS9vxoqBtzYDJGjIjPjov8J0Dt9xJjgE9AcHj\nCM6zIwXoom+YBaS5x5mzxZc/Fh9cmFdSgwHtZf0sJ90a1xTg1jG/+muzpxFsbCWZ\n/0dopuB8E6yvuwvLiFfklk94KOnFobP3pL9u9CQXCeCOhiRr5FoTk3Rr2tBbKyfI\n668BwpOnwn21MynD5EbjT7y+Bg1jrT/7ZP8m+DiiwQKBgQDot3b1kP2d3eM80k0o\nT9dWX0H20wco6atVP+NNRvHt3Nasv6yJkjbnc4thl7yT+cxdLvYr6eGR9JWTJUwq\n2qEWll3lZdPZkroEqzYnbf169t/NEgM3DKVuimmPyJD7pkDAohNxtyE5UkMKonA1\ny17E+BGnKLIJ4JChZwbmZIN74QKBgQDmhSELcBwqBH6wKidPQEdZFAYx1Udi1uud\nF7wwcW6yK3Hsel06cv6koTSj4j0byj/5NsyGRY4BQhC4RQ6kkWyLgeOjYJOZEoOI\nKnBP/nucQfb4JQl70iuDV9/LdvWax98khoDSAbd6SE7l2CvmSr7Or5kOD/OHQpJf\nblsVWmLfawKBgQDdKI3K7dG4V4h+4rUk3Eue78Q2l3I0dWy4BZE0fXmpPbheT4He\n869t4ibRxmwWjMykud6E+S2/kZscTdPG3iM83gW53j2ohYJ2sWczrZm5ZChoMPgR\nNtl45d1QIaF3JhZfeyfTZ+ARI5ZG4vyUgwM7WS0dmNUqAdoxKUIrbdZuwQKBgEpb\nnzElVLBpCsSglFWIEnu1bdodRg2n7hCaW2X08RQf13vEbNYxydoo9eX3UGbqcoBd\nINQfE5NsUCBghjynfC/0Eg3dVT8HLc56gggLuqvIy3V33PtH7ClN6y6ijM8EsgIC\nMQOM8jZLpMeXV3HNoobhNanHk3KKEtUdr9vPcB1JAoGABfLgbDX0oNRzspqn930D\nwW83Y3jWBMbpRvjjLxatNT1kqEwASvOAq7y1ip3VjDDxbRUigSxg72TNo9LptGfo\nBauMeyNyQfnME2A4bC10Ubj+j7asdSAtMh3ZNz01gFt9zNmwWTS0ZXI0Qw9/bD6F\ndpjE4mi9KX3R7St3pnOAH+M=\n-----END PRIVATE KEY-----\n"
```

**This is the EXACT value to paste into Vercel.**

---

## 🎯 How to Add to Vercel (Step-by-Step)

### Method 1: Via Vercel Dashboard (Recommended)

1. **Go to Environment Variables:**
   ```
   https://vercel.com/[your-username]/pretty-presentations/settings/environment-variables
   ```

2. **Find `FIREBASE_ADMIN_PRIVATE_KEY`** in the list

3. **Click the ⋯ menu** → **Edit**

4. **Delete the current value completely**

5. **Paste the new value:**
   - Copy from the terminal command output above
   - OR copy the exact string from the "Manual Format" section
   - **IMPORTANT:** Paste it exactly as-is, including the opening `"` and closing `"`

6. **Verify the format in Vercel:**
   - It should start with: `"-----BEGIN PRIVATE KEY-----\n`
   - It should end with: `\n-----END PRIVATE KEY-----\n"`
   - You should see `\n` as literal two characters throughout (not actual line breaks)
   - It should be all on one line (or Vercel might wrap it visually, but no actual newlines)

7. **Save** and select all environments (Production, Preview, Development)

8. **Redeploy**

---

### Method 2: Via Vercel CLI (Alternative)

If the dashboard keeps mangling the format, use the CLI:

```bash
# Remove the existing variable
vercel env rm FIREBASE_ADMIN_PRIVATE_KEY production

# Add it fresh (you'll be prompted to paste the value)
vercel env add FIREBASE_ADMIN_PRIVATE_KEY production

# When prompted, paste the EXACT value from terminal command or manual format above
# Press Enter

# Repeat for preview and development
vercel env add FIREBASE_ADMIN_PRIVATE_KEY preview
vercel env add FIREBASE_ADMIN_PRIVATE_KEY development

# Trigger a fresh deployment
vercel --prod
```

---

## ❌ Common Mistakes to Avoid

### DON'T:
- ❌ Remove the quotes at the start/end
- ❌ Add extra spaces before or after
- ❌ Replace `\n` with actual newline characters
- ❌ Add a trailing comma
- ❌ Copy from a text editor that auto-formats
- ❌ Use the JSON file format from Firebase Console directly

### DO:
- ✅ Copy the ENTIRE string including quotes
- ✅ Keep `\n` as literal backslash-n
- ✅ Paste as a single line
- ✅ Verify it matches your local `.env.local` format
- ✅ Test locally first to confirm `.env.local` is correct

---

## 🧪 Verification Steps

After updating the key in Vercel:

### 1. Check the Variable in Vercel

In the Environment Variables page, click to view the variable. You should see:
- Opening quote `"`
- `-----BEGIN PRIVATE KEY-----\n`
- A long string of characters with `\n` scattered throughout
- `\n-----END PRIVATE KEY-----\n"`
- Closing quote `"`

### 2. Trigger a Redeploy

Go to Deployments → Latest → Redeploy (use existing build cache)

### 3. Check Function Logs

After redeploying, trigger a text generation and check logs:

**✅ SUCCESS - You should see:**
```
🔍 [SERVER] Searching Firestore with filters: {...}
✅ [SERVER] Fetched X influencers from Firestore
```

**❌ FAILURE - If you still see:**
```
Error: error:1E08010C:DECODER routines::unsupported
```
Then the format is still wrong - try Method 2 (CLI) instead.

---

## 🆘 Still Not Working?

If you've tried both methods and it's still failing:

### Option A: Generate a New Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select `pretty-presentations`
3. Settings → Service Accounts
4. Click "Generate new private key"
5. Download the JSON file
6. Open the JSON file in a text editor
7. Find the `"private_key"` field
8. Copy the ENTIRE value (including the quotes)
9. That's your new `FIREBASE_ADMIN_PRIVATE_KEY`
10. Add to Vercel using Method 1 or 2 above

### Option B: Use the CLI with Input Redirection

```bash
cd "/Users/JackEllis/Pretty Presentations"

# Extract just the key value to a temporary file
grep "^FIREBASE_ADMIN_PRIVATE_KEY=" .env.local | sed 's/FIREBASE_ADMIN_PRIVATE_KEY=//' > /tmp/firebase_key.txt

# View it to confirm format
cat /tmp/firebase_key.txt

# Now manually copy from /tmp/firebase_key.txt and paste into Vercel

# Clean up
rm /tmp/firebase_key.txt
```

---

## 📚 Why This Happens

The private key needs to be in a specific format for Node.js crypto libraries:
- PEM format with actual newlines for local usage
- Escaped newlines (`\n`) for environment variables
- Vercel's UI sometimes auto-formats or strips characters
- Copy/paste can introduce invisible characters

**The solution:** Always copy from your working `.env.local` file exactly as-is.

---

## Quick Reference: The Three Firebase Admin Variables

All three need to be set correctly:

```bash
FIREBASE_ADMIN_PROJECT_ID=pretty-presentations

FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbsvc@pretty-presentations.iam.gserviceaccount.com

FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDRjdo7efnSJOyG\nfcziRfWPmzb6yU4Eu9IBP3LzGPtBz/P4LFHpRfBBE8HecDj/DGffzpaTMWbDCI0X\n10jQDw3uffesOU6K1Q1o4hgFGrjt4dHIsDKc4Rd8gO5DRl2b+nBcde8kD4jYoRQY\nrgORyIXljN3D2kQJDDwZerfz0cOCZkrwE0gTOZlBhpnwFTVm8B5pfIRxRdXQjyVz\nswHIikngQlW04+/sKYCU6fMoz5/ifLIizfNh+RPiRRKQtd6OWy/nzaMeFGFNbKVF\n5YLpWnh3Xx77x8LA74gUNNtcS8YpiJwZGFOQxUHy0e8YDKUzm3CCOxJQR6H1VI4b\nbDIR/8YLAgMBAAECggEAA+XugQJ4d/g4zebgQZA+qnEnulZxhhlrR4qHnkmrrhNm\nlF+dFrvhdpnIfQAVTCWSMvg5L6aVArpRhzNogHoOrsFGEM2jkncMAhR4f+sCNQCC\n3v8wGU8hkKZZ4enUc49awbx/GCZNS9vxoqBtzYDJGjIjPjov8J0Dt9xJjgE9AcHj\nCM6zIwXoom+YBaS5x5mzxZc/Fh9cmFdSgwHtZf0sJ90a1xTg1jG/+muzpxFsbCWZ\n/0dopuB8E6yvuwvLiFfklk94KOnFobP3pL9u9CQXCeCOhiRr5FoTk3Rr2tBbKyfI\n668BwpOnwn21MynD5EbjT7y+Bg1jrT/7ZP8m+DiiwQKBgQDot3b1kP2d3eM80k0o\nT9dWX0H20wco6atVP+NNRvHt3Nasv6yJkjbnc4thl7yT+cxdLvYr6eGR9JWTJUwq\n2qEWll3lZdPZkroEqzYnbf169t/NEgM3DKVuimmPyJD7pkDAohNxtyE5UkMKonA1\ny17E+BGnKLIJ4JChZwbmZIN74QKBgQDmhSELcBwqBH6wKidPQEdZFAYx1Udi1uud\nF7wwcW6yK3Hsel06cv6koTSj4j0byj/5NsyGRY4BQhC4RQ6kkWyLgeOjYJOZEoOI\nKnBP/nucQfb4JQl70iuDV9/LdvWax98khoDSAbd6SE7l2CvmSr7Or5kOD/OHQpJf\nblsVWmLfawKBgQDdKI3K7dG4V4h+4rUk3Eue78Q2l3I0dWy4BZE0fXmpPbheT4He\n869t4ibRxmwWjMykud6E+S2/kZscTdPG3iM83gW53j2ohYJ2sWczrZm5ZChoMPgR\nNtl45d1QIaF3JhZfeyfTZ+ARI5ZG4vyUgwM7WS0dmNUqAdoxKUIrbdZuwQKBgEpb\nnzElVLBpCsSglFWIEnu1bdodRg2n7hCaW2X08RQf13vEbNYxydoo9eX3UGbqcoBd\nINQfE5NsUCBghjynfC/0Eg3dVT8HLc56gggLuqvIy3V33PtH7ClN6y6ijM8EsgIC\nMQOM8jZLpMeXV3HNoobhNanHk3KKEtUdr9vPcB1JAoGABfLgbDX0oNRzspqn930D\nwW83Y3jWBMbpRvjjLxatNT1kqEwASvOAq7y1ip3VjDDxbRUigSxg72TNo9LptGfo\nBauMeyNyQfnME2A4bC10Ubj+j7asdSAtMh3ZNz01gFt9zNmwWTS0ZXI0Qw9/bD6F\ndpjE4mi9KX3R7St3pnOAH+M=\n-----END PRIVATE KEY-----\n"
```

Copy the private key value **exactly as shown above**.

---

**Next Step:** Update the private key in Vercel using Method 1 or Method 2, then redeploy and test!

