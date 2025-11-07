# Firestore Rules Deployment Guide

## 📋 Overview

This project includes two sets of Firestore security rules:

1. **`firestore.rules`** - Development rules (current, allows public access)
2. **`firestore.rules.production`** - Production rules (secure, requires authentication)

## 🔒 Security Status

### Current Rules (Development)
```
⚠️ WARNING: Public access enabled for development
- influencers: Anyone can read
- presentations: Anyone can read/write
- responses: Anyone can read/write
```

### Production Rules
```
✅ Secure: Authentication required
- influencers: Authenticated users only
- presentations: Owner only (create/read/update/delete)
- responses: Owner only (create/read/update/delete)
```

---

## 🚀 Deploying Firestore Rules

### Option 1: Deploy via Firebase CLI (Recommended)

#### For Development (current rules):
```bash
firebase deploy --only firestore:rules
```

#### For Production (secure rules):
```bash
# Backup current rules
cp firestore.rules firestore.rules.backup

# Use production rules
cp firestore.rules.production firestore.rules

# Deploy
firebase deploy --only firestore:rules

# Verify deployment
firebase firestore:rules:get
```

### Option 2: Deploy via Firebase Console

1. **Navigate to Firebase Console**
   - Go to https://console.firebase.google.com
   - Select your project

2. **Open Firestore Rules Editor**
   - Click **"Firestore Database"** in the left sidebar
   - Click the **"Rules"** tab at the top
   - You'll see the rules editor

3. **Paste Rules**
   
   **For Development (less secure, easier testing):**
   - Open `firestore.rules` in your code editor
   - Copy the entire contents
   - Paste into the Firebase Console rules editor
   - Click **"Publish"**

   **For Production (secure, recommended):**
   - Open `firestore.rules.production` in your code editor
   - Copy the entire contents
   - Paste into the Firebase Console rules editor
   - **IMPORTANT:** Before publishing, add admin UIDs to the `isAdmin()` function:
     ```javascript
     function isAdmin() {
       return isAuthenticated() && 
         request.auth.uid in [
           "your-admin-uid-here",  // Replace with actual admin UID
           "another-admin-uid"      // Add more as needed
         ];
     }
     ```
   - Click **"Publish"**

4. **Verify Deployment**
   - After publishing, test with a read/write operation
   - Check the "Rules playground" tab to simulate requests

---

## 🔍 Where to Find the Rules in Firebase Console

### Visual Guide:

```
Firebase Console
└── Your Project
    └── Firestore Database (left sidebar)
        └── Rules (top tab)
            ├── Rules Editor (main area)
            ├── Publish button (top right)
            └── Rules playground (tab)
```

### Step-by-Step:

1. **Sidebar Navigation:**
   ```
   Build → Firestore Database
   ```

2. **Top Tabs:**
   ```
   Data | Rules | Indexes | Usage | ...
         ^^^^^ Click here
   ```

3. **Rules Editor:**
   - Large text area with current rules
   - Syntax highlighting for Firestore security rules
   - Line numbers on the left

4. **Actions:**
   - **Publish** button (top right) - Deploy your rules
   - **Rules playground** tab - Test rules before deploying

---

## ⚠️ Important Notes

### Before Deploying Production Rules:

1. **Authentication Must Be Set Up**
   - Production rules require Firebase Authentication
   - Users must be signed in to access data
   - If authentication is not set up, users will be unable to access the app

2. **Add Admin Users**
   - Update the `isAdmin()` function with your admin UIDs
   - Find your UID in Firebase Authentication console

3. **Test First**
   - Use the Rules playground in Firebase Console
   - Simulate authenticated and unauthenticated requests
   - Verify expected behavior before deploying

4. **Migration Considerations**
   - Existing data created without `createdBy` field will be inaccessible
   - Consider running a migration script to add `createdBy` to existing documents

### Development vs Production:

| Aspect | Development | Production |
|--------|-------------|------------|
| **Access** | Public (anyone) | Authenticated only |
| **Security** | ⚠️ Low | ✅ High |
| **Testing** | Easy | Requires auth setup |
| **Recommended For** | Local dev, testing | Live deployment |

---

## 🧪 Testing Rules

### Using Rules Playground (Firebase Console):

1. Click **"Rules playground"** tab
2. Set up test scenario:
   - **Location:** `/influencers/test-id`
   - **Auth:** Authenticated or Unauthenticated
   - **Operation:** Read or Write
3. Click **"Run"**
4. See if request is allowed or denied

### Using Firebase Emulator (Local):

```bash
# Start emulator with rules
firebase emulators:start --only firestore

# Rules are loaded from firestore.rules
# Test your app against emulator
```

---

## 📝 Rule Explanation

### Production Rules Include:

1. **Helper Functions:**
   ```javascript
   isAuthenticated()  // Check if user is signed in
   isOwner(userId)    // Check if user owns resource
   isAdmin()          // Check if user is admin
   ```

2. **Collection Rules:**
   - `influencers`: Read-only for authenticated users
   - `presentations`: Owner-only access
   - `responses`: Owner-only access
   - `brands`: Read-only for authenticated users
   - `users`: Owner-only access
   - `analytics`: Write-only logs

3. **Default Deny:**
   - All other collections are blocked by default
   - Explicit rules required for new collections

---

## 🔄 Rolling Back

If you need to revert to previous rules:

### Via Firebase Console:
1. Click the "History" link in the rules editor
2. Select previous version
3. Click "Restore" and "Publish"

### Via CLI:
```bash
# Restore from backup
cp firestore.rules.backup firestore.rules
firebase deploy --only firestore:rules
```

---

## 📞 Support

If you encounter issues:

1. **Check Firebase Console Errors:**
   - Look for error messages in the console
   - Check the "Rules" tab for syntax errors

2. **Verify Authentication:**
   - Ensure users are properly authenticated
   - Check `request.auth.uid` in rules playground

3. **Test Incrementally:**
   - Start with permissive rules
   - Gradually add restrictions
   - Test after each change

---

## 📚 Additional Resources

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Rules Syntax Reference](https://firebase.google.com/docs/firestore/security/rules-syntax)
- [Testing Rules](https://firebase.google.com/docs/firestore/security/test-rules-emulator)

