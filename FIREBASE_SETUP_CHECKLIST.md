# Firebase Setup Checklist

Use this checklist to ensure your Firebase integration is fully configured and operational.

---

## ☑️ Prerequisites

- [ ] Node.js 18+ installed
- [ ] Firebase account created ([firebase.google.com](https://firebase.google.com))
- [ ] Firebase project created in Firebase Console

---

## 📝 Step 1: Environment Configuration

### 1.1 Create Environment File

```bash
cp env.example .env.local
```

### 1.2 Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click ⚙️ Settings → Project settings
4. Scroll to "Your apps" → Web app
5. Copy configuration values

### 1.3 Fill in `.env.local`

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXX
```

### 1.4 Get Firebase Admin SDK Credentials

1. Go to Firebase Console → Project settings
2. Navigate to "Service accounts" tab
3. Click "Generate new private key"
4. Download the JSON file
5. Extract and add to `.env.local`:

```bash
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**⚠️ IMPORTANT**: Never commit `.env.local` to version control!

---

## 🔥 Step 2: Enable Firebase Services

### 2.1 Authentication

- [ ] Go to Firebase Console → Authentication
- [ ] Click "Get started"
- [ ] Enable "Email/Password" provider
- [ ] (Optional) Enable "Google" provider
- [ ] Save settings

### 2.2 Firestore Database

- [ ] Go to Firebase Console → Firestore Database
- [ ] Click "Create database"
- [ ] Select **Production mode** (we'll deploy custom rules)
- [ ] Choose database location (closest to your users):
  - `europe-west1` for Europe
  - `us-central1` for North America
  - `asia-southeast1` for Asia
- [ ] Click "Enable"

### 2.3 Storage

- [ ] Go to Firebase Console → Storage
- [ ] Click "Get started"
- [ ] Start in **Production mode**
- [ ] Use same location as Firestore
- [ ] Click "Done"

### 2.4 Vertex AI (Gemini)

- [ ] Vertex AI is automatically enabled with Firebase
- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Navigate to "Vertex AI" → "Generative AI"
- [ ] Ensure "Gemini API" is enabled
- [ ] No additional setup needed

---

## 📦 Step 3: Install Dependencies

```bash
npm install
```

This installs:
- `firebase` - Firebase SDK
- `firebase-admin` - Firebase Admin SDK (for imports)
- `@firebase/vertexai-preview` - Vertex AI integration
- `dotenv` - Environment variable loading
- `ts-node` - TypeScript execution for scripts

---

## 🧪 Step 4: Test Firebase Connection

Run the test script to verify all services:

```bash
npm run test:firebase
```

Expected output:
```
🧪 Pretty Presentations - Firebase Test Suite
==================================================

🔐 Checking Environment Variables...
✅ All required environment variables present

🔥 Firebase initialized

📊 Testing Firestore Database...
✅ Firestore: Connected

💾 Testing Firebase Storage...
✅ Storage: Connected

🤖 Testing Vertex AI (Gemini)...
✅ Vertex AI: Connected
   Test response: Hello, Pretty Presentations!

==================================================
📋 Test Summary:
==================================================
✅ firestore       PASS
✅ storage         PASS
✅ vertexAI        PASS
==================================================
Result: 3/3 tests passed

🎉 All Firebase services are working correctly!
```

**If tests fail**, check:
- Environment variables are correct
- Firebase services are enabled
- No firewall/network restrictions
- API quotas not exceeded

---

## 🛡️ Step 5: Deploy Security Rules

### 5.1 Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 5.2 Login to Firebase

```bash
firebase login
```

### 5.3 Initialize Firebase Project

```bash
firebase init
```

Select:
- **Firestore**: Rules and indexes
- **Storage**: Rules
- (Optional) **Hosting**: For deployment

Configuration:
- Use existing project → Select your project
- Firestore rules: `firestore.rules`
- Storage rules: `storage.rules`

### 5.4 Deploy Rules

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage:rules
```

Expected output:
```
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/your-project/overview
```

---

## 📊 Step 6: Import Influencer Database

### 6.1 Obtain LAYAI Database

**Option A: Clone LAYAI Repository**

```bash
cd /tmp
git clone https://github.com/Jrogbaaa/LAYAI.git
cd LAYAI
```

Look for the influencer data in:
- `data/influencers.json`
- `data/spanish-influencers-top-3000.csv`

**Option B: Request Data Export**

If the repository doesn't contain the data files, you'll need to:
1. Contact the LAYAI repository owner
2. Or use the LAYAI API endpoints (if available)
3. Or manually create a compatible dataset

### 6.2 Copy Data to Project

```bash
mkdir -p /Users/JackEllis/Pretty\ Presentations/pretty-presentations/data
cp /tmp/LAYAI/data/influencers.json /Users/JackEllis/Pretty\ Presentations/pretty-presentations/data/
```

### 6.3 Run Import Script

```bash
npm run import:influencers
```

Expected output:
```
🚀 Starting influencer import...

📖 Reading influencer data...
✅ Found 2996 influencers

🔄 Transforming data...
✅ Transformed 2996 records

💾 Importing to Firestore...
Processing batch 1/6 (500 items)...
✅ Batch 1 committed successfully
...
✨ Import completed successfully!
📊 Total influencers imported: 2996
📝 Metadata updated

🎉 Done!
```

**Note**: Import takes ~15-20 minutes due to Firebase throttling (15 writes per 1.5 seconds).

---

## 🔍 Step 7: Create Firestore Indexes

Some queries require composite indexes. Create them:

### 7.1 Via Firebase Console

1. Go to Firestore → Indexes
2. Click "Add index"
3. Create these indexes:

**Index 1: Platform + Followers + Engagement**
```
Collection: influencers
Fields:
  - platform (Ascending)
  - followers (Descending)
  - engagement (Descending)
```

**Index 2: Categories + Engagement + Followers**
```
Collection: influencers
Fields:
  - contentCategories (Array)
  - engagement (Descending)
  - followers (Descending)
```

**Index 3: Location + Followers**
```
Collection: influencers
Fields:
  - demographics.location (Array)
  - followers (Descending)
```

### 7.2 Auto-Create (Recommended)

Indexes will auto-create when you run queries. Firebase will show an error with a link to create the index.

---

## ⚡ Step 8: Enable Offline Persistence (Optional)

Offline persistence is enabled by default in `lib/influencer-service.ts`.

To verify:
1. Run dev server: `npm run dev`
2. Open browser DevTools → Application → IndexedDB
3. You should see Firebase cached data

---

## 📈 Step 9: Set Up Monitoring

### 9.1 Firebase Performance Monitoring

```bash
firebase init performance
```

### 9.2 Google Analytics

Already configured via `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`.

Track events in your code:
```typescript
import { analytics } from '@/lib/firebase';
import { logEvent } from 'firebase/analytics';

logEvent(analytics, 'influencer_search', {
  platform: 'Instagram',
  category: 'Fashion',
});
```

### 9.3 Set Up Alerts

1. Go to Firebase Console → Cloud Monitoring
2. Create alerts for:
   - High API usage
   - Error rates
   - Performance degradation

---

## 💰 Step 10: Configure Billing & Quotas

### 10.1 Set Budget Alert

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to Billing → Budgets & alerts
3. Create budget (recommended: $50-100/month to start)
4. Set alert thresholds: 50%, 80%, 100%

### 10.2 Understand Quotas

**Firebase Spark (Free) Plan:**
- Firestore: 50K reads/day, 20K writes/day
- Storage: 5GB, 1GB/day downloads
- Vertex AI: Limited requests

**Blaze (Pay-as-you-go) Plan:**
- Required for Vertex AI (Gemini)
- Firestore: $0.06/100K reads, $0.18/100K writes
- Storage: $0.026/GB/month
- Vertex AI: ~$0.001 per request

**Recommendation**: Start with Blaze plan for this app.

---

## ✅ Verification Checklist

### Environment
- [ ] `.env.local` file created with all credentials
- [ ] `.env.local` added to `.gitignore`
- [ ] Firebase Admin SDK key downloaded

### Services
- [ ] Authentication enabled
- [ ] Firestore Database created
- [ ] Storage bucket created
- [ ] Vertex AI enabled

### Testing
- [ ] `npm run test:firebase` passes all tests
- [ ] Can read/write to Firestore in app
- [ ] Can upload to Storage
- [ ] Gemini AI responds correctly

### Security
- [ ] Firestore rules deployed
- [ ] Storage rules deployed
- [ ] Rules tested in Firebase Console

### Data
- [ ] Influencer database imported (2,996 records)
- [ ] Metadata document exists
- [ ] Can search influencers in app
- [ ] Composite indexes created

### Monitoring
- [ ] Billing alerts set up
- [ ] Performance monitoring enabled
- [ ] Analytics working

---

## 🚨 Troubleshooting

### "Permission Denied" Errors

**Symptom**: Can't read/write to Firestore
**Solution**:
1. Check security rules are deployed
2. Ensure user is authenticated (or allow unauthenticated read if needed)
3. Verify rules match your data structure

### Import Script Fails

**Symptom**: Import stops or errors out
**Solution**:
1. Check you're on Blaze plan (required for >50K writes/day)
2. Verify `data/influencers.json` exists and is valid JSON
3. Check Firebase Admin credentials are correct
4. Try reducing batch size in script

### Slow Queries

**Symptom**: Searches take >5 seconds
**Solution**:
1. Create composite indexes (see Step 7)
2. Limit query results (default 50)
3. Enable offline persistence
4. Consider caching frequently accessed data

### High Costs

**Symptom**: Unexpected Firebase bills
**Solution**:
1. Check Firebase Console → Usage
2. Optimize queries (use limits, indexes)
3. Implement caching
4. Review Vertex AI usage (most expensive)
5. Set stricter budgets/quotas

### Vertex AI Not Working

**Symptom**: AI features fail
**Solution**:
1. Ensure on Blaze plan
2. Check Vertex AI is enabled in Google Cloud Console
3. Verify `NEXT_PUBLIC_VERTEX_AI_MODEL` is set
4. Check quota limits in Google Cloud Console

---

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [LAYAI Repository](https://github.com/Jrogbaaa/LAYAI)

---

## 🎯 Next Steps

After completing this checklist:

1. **Test the full flow**:
   - Upload a client brief
   - Generate a presentation
   - Verify influencer matching works
   - Export presentation

2. **Optimize performance**:
   - Monitor query times
   - Adjust cache TTL
   - Optimize AI prompts

3. **Enhance data**:
   - Set up regular data updates
   - Integrate additional data sources (Apify, StarNgage)
   - Add more influencers

4. **Deploy to production**:
   - Deploy to Vercel/Firebase Hosting
   - Set up custom domain
   - Configure production environment variables

---

**✨ You're all set! Your Firebase integration is ready.**
