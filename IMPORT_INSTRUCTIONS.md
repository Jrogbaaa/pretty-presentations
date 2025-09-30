# 📥 Importing LAYAI Database

## ✅ **Status: Ready to Import**

- ✅ LAYAI repository cloned
- ✅ 2,996 influencers found
- ✅ Data copied to `data/influencers.json` (1.1MB)
- ✅ Import script updated for LAYAI structure
- ⚠️ Need Firebase Admin credentials

---

## 🔑 **Step 1: Get Firebase Admin Credentials**

### **Option A: Download Service Account Key (Recommended)**

1. Go to: https://console.firebase.google.com/project/pretty-presentations/settings/serviceaccounts/adminsdk

2. Click **"Generate new private key"**

3. Click **"Generate key"** in the confirmation dialog

4. A JSON file will download (keep it safe!)

5. Open the downloaded JSON file and copy these values:

```json
{
  "project_id": "pretty-presentations",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...long key...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@pretty-presentations.iam.gserviceaccount.com"
}
```

### **Option B: Use Existing Credentials**

If you already have a service account key, use those credentials.

---

## 🔧 **Step 2: Update .env.local**

Open your `.env.local` file and update these lines with the values from the JSON:

```bash
# Replace these lines in .env.local:
FIREBASE_ADMIN_PROJECT_ID=pretty-presentations
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@pretty-presentations.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_actual_private_key_here\n-----END PRIVATE KEY-----\n"
```

**⚠️ Important**: 
- Keep the quotes around the private key
- Keep the `\n` characters (they represent line breaks)
- Don't commit this file to git (already in .gitignore)

---

## 🚀 **Step 3: Run the Import**

Once credentials are configured:

```bash
cd /Users/JackEllis/Pretty\ Presentations/pretty-presentations
npm run import:influencers
```

**Expected output:**
```
🚀 Starting influencer import...

📖 Reading influencer data...
✅ Found 2996 influencers

🔄 Transforming data...
✅ Transformed 2996 records

💾 Importing to Firestore...
Processing batch 1/6 (500 items)...
✅ Batch 1 committed successfully
Processing batch 2/6 (500 items)...
✅ Batch 2 committed successfully
...

✨ Import completed successfully!
📊 Total influencers imported: 2996
📝 Metadata updated

🎉 Done!
```

**⏱️ Duration**: 15-20 minutes (due to Firebase throttling: 15 writes per 1.5 seconds)

---

## 🧪 **Step 4: Verify Import**

After import completes, test Firebase connection:

```bash
npm run test:firebase
```

Expected result:
```
📊 Testing Firestore Database...
✅ Firestore: Connected (2996 influencers found)
   Total influencers: 2996
```

---

## 🎯 **Step 5: Test in App**

1. Make sure dev server is running:
   ```bash
   npm run dev
   ```

2. Open: http://localhost:3000

3. Create a test presentation:
   - Fill in brief form
   - Select platforms: Instagram
   - Add location: Spain
   - Set budget: 50000
   - Click "Generate Presentation"

4. Should now match from **2,996 real influencers** instead of 8 mocks!

---

## 📊 **What Gets Imported**

Each of the 2,996 influencers includes:

### **Profile Data:**
- ✅ Name (e.g., "Georgina Rodríguez")
- ✅ Handle (e.g., "georginagio")
- ✅ Platform (Instagram, TikTok, YouTube, etc.)
- ✅ Profile image URL

### **Metrics:**
- ✅ Follower count (ranging from 10K to 67M)
- ✅ Engagement rate (converted to percentage)
- ✅ Estimated average views

### **Demographics:**
- ✅ Location/Country (Spain, Latin America, etc.)
- ✅ Gender (Male/Female/Mixed)
- ✅ Age range (estimated: 18-34)
- ✅ Content niches (Lifestyle, Fashion, Sports, etc.)

### **Pricing (Estimated):**
- ✅ Post rate (based on follower count)
- ✅ Story rate (25% of post rate)
- ✅ Reel rate (150% of post rate)
- ✅ Video rate (200% of post rate)
- ✅ Integration rate (300% of post rate)

**Rate Calculation:**
- Nano (<10K): €0.01 per follower
- Micro (10K-100K): €0.008 per follower
- Mid-tier (100K-500K): €0.006 per follower
- Macro (500K-1M): €0.004 per follower
- Mega (1M+): €0.002 per follower

### **Performance:**
- ✅ Average engagement rate
- ✅ Average reach estimate
- ✅ Content quality score
- ✅ Audience growth rate

---

## 🗑️ **Removing Mock Data**

After successful import, the app will automatically use Firestore data instead of mocks. The mock data (`lib/mock-influencers.ts`) will only be used as a fallback if:
- Firestore is unavailable
- Database is empty
- Network error occurs

**To completely remove mock data** (optional):
```bash
# Backup first
cp lib/mock-influencers.ts lib/mock-influencers.ts.backup

# Replace with empty array
echo 'export const mockInfluencers = [];' > lib/mock-influencers.ts
```

---

## 🔍 **Troubleshooting**

### **"ENOENT: no such file" Error**
**Problem**: `data/influencers.json` not found

**Solution**: 
```bash
cp /tmp/LAYAI/processed_influencers.json data/influencers.json
```

### **"Permission Denied" Error**
**Problem**: Firebase Admin credentials incorrect

**Solution**: 
1. Download new service account key from Firebase Console
2. Update .env.local with correct values
3. Ensure private key has `\n` characters preserved

### **"Quota Exceeded" Error**
**Problem**: Too many writes in short time

**Solution**: 
- Script already has throttling (15 writes/1.5s)
- Ensure you're on Firebase Blaze plan (pay-as-you-go)
- Wait a few minutes and try again

### **Import Stops/Hangs**
**Problem**: Network timeout or Firebase issue

**Solution**:
- Script has retry logic (3 attempts)
- If it fails completely, it will skip that batch
- You can run import again - it uses `merge: true` so won't duplicate

---

## 💰 **Cost Estimate**

**One-time import of 2,996 influencers:**

- Firestore writes: 2,996 writes
- Cost: ~$0.54 (at $0.18 per 100K writes)
- Additional metadata: ~5 writes
- **Total: ~$0.55 one-time**

**Ongoing costs (after import):**
- Reading influencers: Mostly cached, minimal cost
- Updates: Only if you refresh data
- Estimated: $1-5/month for typical usage

---

## ✅ **Post-Import Checklist**

After successful import:

- [ ] Verify influencer count in Firebase Console
- [ ] Test `npm run test:firebase` shows 2,996 influencers
- [ ] Generate test presentation in app
- [ ] Verify influencer matching uses real data
- [ ] Check Firestore usage in Firebase Console
- [ ] Set up billing alerts (optional)
- [ ] Remove mock data (optional)

---

## 📚 **Additional Resources**

- **Firebase Console**: https://console.firebase.google.com/project/pretty-presentations/firestore
- **Service Accounts**: https://console.firebase.google.com/project/pretty-presentations/settings/serviceaccounts
- **Firestore Quotas**: https://firebase.google.com/docs/firestore/quotas
- **LAYAI Repository**: https://github.com/Jrogbaaa/LAYAI

---

**✨ Ready to import! Follow steps 1-2 above to get your credentials, then run the import.**
