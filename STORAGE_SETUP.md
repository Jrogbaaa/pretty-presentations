# Firebase Storage Setup

## Quick Fix for Storage Permissions

The presentation generator needs to upload images to Firebase Storage. Currently getting permission errors.

### Option 1: Deploy Updated Rules (Recommended)

```bash
# Make sure you're in Firebase project directory
firebase deploy --only storage
```

### Option 2: Manual Console Update

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **pretty-presentations**
3. Navigate to **Storage** → **Rules**
4. Replace with:

```
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Presentation assets - Public write for demo
    match /presentations/{presentationId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.resource.contentType.matches('image/.*') && 
                      request.resource.size < 10 * 1024 * 1024;
    }
  }
}
```

5. Click **Publish**

### Current Status

✅ **Presentations are still working!**
- Images generate successfully
- Presentation saves to Firestore with base64 images
- Storage upload fails gracefully
- User still sees images in editor

⚠️ **Known Issue:**
- Storage upload fails with `storage/unauthorized`
- Images stored as base64 in Firestore (larger documents)
- Works fine but not optimal

### After Fixing Storage Rules:

✅ Images will upload to Storage
✅ Firestore documents will be smaller
✅ Better performance
✅ No more permission errors

**Note:** The updated `storage.rules` file is ready in the repo. Just needs deployment!

