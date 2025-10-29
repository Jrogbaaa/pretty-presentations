/**
 * Firebase Admin SDK - Server-side Only (Base64 Alternative)
 * Use this if the standard format keeps failing in Vercel
 * 
 * To use this version:
 * 1. Rename this file to firebase-admin.ts (backup the old one first)
 * 2. Set FIREBASE_ADMIN_PRIVATE_KEY_BASE64 in Vercel (see instructions below)
 */

import * as admin from 'firebase-admin';

// Initialize Firebase Admin (singleton pattern)
if (!admin.apps.length) {
  // Support both formats: base64 (preferred for Vercel) and standard
  let privateKey: string | undefined;
  
  if (process.env.FIREBASE_ADMIN_PRIVATE_KEY_BASE64) {
    // Decode from base64 - this completely avoids the \n format issue
    try {
      privateKey = Buffer.from(
        process.env.FIREBASE_ADMIN_PRIVATE_KEY_BASE64,
        'base64'
      ).toString('utf-8');
      console.log('✅ Using base64 encoded private key');
    } catch (error) {
      console.error('❌ Failed to decode base64 private key:', error);
      throw new Error('Invalid FIREBASE_ADMIN_PRIVATE_KEY_BASE64 format');
    }
  } else if (process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
    // Standard format with \n replacement
    privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n');
    console.log('✅ Using standard private key format');
  } else {
    throw new Error('Missing FIREBASE_ADMIN_PRIVATE_KEY or FIREBASE_ADMIN_PRIVATE_KEY_BASE64');
  }

  const serviceAccount = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey,
  };

  // Validate all required fields
  if (!serviceAccount.projectId) {
    throw new Error('Missing FIREBASE_ADMIN_PROJECT_ID');
  }
  if (!serviceAccount.clientEmail) {
    throw new Error('Missing FIREBASE_ADMIN_CLIENT_EMAIL');
  }
  if (!serviceAccount.privateKey) {
    throw new Error('Private key is empty after processing');
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
    throw error;
  }
}

// Export Admin SDK services
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();
export const adminAuth = admin.auth();

export default admin;

/**
 * HOW TO GENERATE BASE64 KEY:
 * 
 * Run this command in your terminal:
 * 
 * cd "/Users/JackEllis/Pretty Presentations"
 * grep "^FIREBASE_ADMIN_PRIVATE_KEY=" .env.local | \
 *   sed 's/FIREBASE_ADMIN_PRIVATE_KEY=//' | \
 *   sed 's/^"//' | sed 's/"$//' | \
 *   base64 | tr -d '\n'
 * 
 * Then in Vercel:
 * 1. Add new environment variable
 * 2. Name: FIREBASE_ADMIN_PRIVATE_KEY_BASE64
 * 3. Value: (paste the base64 output - NO quotes needed)
 * 4. Save and redeploy
 * 
 * This approach is 100% reliable because it avoids all \n format issues.
 */

