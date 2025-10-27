# 🔧 Quick Fix: Update Firestore Rules for Import

## The Problem
Firestore rules are blocking writes. You need to temporarily allow writes to import the data.

---

## 🚀 Solution (2 minutes)

### Step 1: Go to Firebase Console
Open: https://console.firebase.google.com

### Step 2: Select Your Project
Click: **pretty-presentations**

### Step 3: Go to Firestore Rules
1. Click **Firestore Database** in left menu
2. Click **Rules** tab at the top

### Step 4: Update Rules
Replace the entire rules file with this:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // TEMPORARY: Allow all writes for import
    match /influencers/{influencerId} {
      allow read, write: if true;
    }
    
    match /metadata/{document} {
      allow read, write: if true;
    }
    
    match /presentations/{presentationId} {
      allow read, write: if true;
    }
  }
}
```

### Step 5: Publish Rules
Click **"Publish"** button at the top

### Step 6: Run Import
Go back to: http://localhost:3001/admin/import
Upload the CSV again

### Step 7: Restore Secure Rules (IMPORTANT!)
After import succeeds, restore these secure rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /influencers/{influencerId} {
      allow read: if true;
      allow write: if false; // Only admin
    }
    
    match /metadata/{document} {
      allow read: if true;
      allow write: if false; // Only admin
    }
    
    match /presentations/{presentationId} {
      allow read: if true;
      allow create: if true;
      allow update: if true;
      allow delete: if false;
    }
  }
}
```

Click **"Publish"** again.

---

## ✅ That's It!

After updating rules and running import, you'll have 3,000 real influencers in your database.

