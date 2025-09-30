# 🔑 Set Up Firebase Service Account

Your old project was using **Firebase Admin SDK with service accounts** for Vertex AI access. This is more stable than the direct Google AI API!

## 📋 What You Need to Add to .env.local:

```bash
# Google Cloud Service Account (for Vertex AI)
GOOGLE_CLOUD_PROJECT_ID=pretty-presentations
GOOGLE_CLOUD_PRIVATE_KEY="your_private_key_here"
GOOGLE_CLOUD_CLIENT_EMAIL=firebase-adminsdk-xxxxx@pretty-presentations.iam.gserviceaccount.com

# Google AI Platform API Key (for Vertex AI)
GOOGLE_AI_API_KEY=your_api_key_here
```

---

## 🚀 How to Get These:

### Step 1: Get Service Account Key

1. **Go to Firebase Console:**
   👉 https://console.firebase.google.com/project/pretty-presentations/settings/serviceaccounts/adminsdk

2. **Click "Generate new private key"**

3. **Download the JSON file**

4. **Open the JSON file** - it will look like:
   ```json
   {
     "type": "service_account",
     "project_id": "pretty-presentations",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     "client_email": "firebase-adminsdk-xxxxx@pretty-presentations.iam.gserviceaccount.com",
     ...
   }
   ```

### Step 2: Add to .env.local

From that JSON file, copy:

```bash
GOOGLE_CLOUD_PROJECT_ID=pretty-presentations
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_CLOUD_CLIENT_EMAIL=firebase-adminsdk-xxxxx@pretty-presentations.iam.gserviceaccount.com
```

**IMPORTANT:** Keep the quotes around the private key and include the `\n` line breaks!

---

## ⚙️ Option: Use Your Old Working Project Instead

**Easier option:** Just use your old `creative-creatives-v2` project that was working!

Replace your entire `.env.local` with your old config (I can help you do this).

---

## 🤔 Which Approach?

**Option A: Set up service account for `pretty-presentations`**
- More work (get new service account key)
- Uses your new project

**Option B: Switch to your old `creative-creatives-v2` project**
- Instant (just copy old env vars)
- Already working
- Can migrate to new project later

**Which would you prefer?**
