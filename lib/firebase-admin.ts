/**
 * Firebase Admin SDK - Server-side Only
 * Use this for API routes and server-side operations
 * 
 * Supports both standard and base64 private key formats for maximum compatibility
 */

import * as admin from 'firebase-admin';

/**
 * Get private key from environment variables
 * Tries base64 format first (more reliable in Vercel), then falls back to standard format
 */
const getPrivateKey = (): string | undefined => {
  // Try base64 format first (recommended for Vercel)
  if (process.env.FIREBASE_ADMIN_PRIVATE_KEY_BASE64) {
    try {
      let decoded = Buffer.from(
        process.env.FIREBASE_ADMIN_PRIVATE_KEY_BASE64,
        'base64'
      ).toString('utf-8');
      
      // Remove surrounding quotes if present
      decoded = decoded.replace(/^"/, '').replace(/"$/, '');
      
      // Replace literal \n with actual newlines
      decoded = decoded.replace(/\\n/g, '\n');
      
      console.log('✅ Using FIREBASE_ADMIN_PRIVATE_KEY_BASE64');
      return decoded;
    } catch (error) {
      console.warn('⚠️ Failed to decode base64 private key, trying standard format', error);
    }
  }

  // Fallback to standard format
  if (process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
    console.log('✅ Using FIREBASE_ADMIN_PRIVATE_KEY (standard format)');
    return process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n');
  }

  return undefined;
};

/**
 * Initialize Firebase Admin (lazy initialization to avoid build-time errors)
 */
const initializeFirebaseAdmin = () => {
  if (admin.apps.length > 0) {
    return admin.apps[0];
  }

  const privateKey = getPrivateKey();

  if (!privateKey) {
    throw new Error(
      'Missing Firebase Admin private key. Set either FIREBASE_ADMIN_PRIVATE_KEY or FIREBASE_ADMIN_PRIVATE_KEY_BASE64'
    );
  }

  const serviceAccount = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey,
  };

  // Validate required fields
  if (!serviceAccount.projectId) {
    throw new Error('Missing FIREBASE_ADMIN_PROJECT_ID');
  }
  if (!serviceAccount.clientEmail) {
    throw new Error('Missing FIREBASE_ADMIN_CLIENT_EMAIL');
  }

  try {
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
    throw new Error(
      'Firebase Admin initialization failed. Check your private key format. ' +
      'Try using FIREBASE_ADMIN_PRIVATE_KEY_BASE64 instead.'
    );
  }
};

/**
 * Get Firebase Admin services (lazy initialization)
 * These getters ensure Firebase Admin is only initialized when actually used,
 * not during build time
 */
export const getAdminDb = () => {
  initializeFirebaseAdmin();
  return admin.firestore();
};

export const getAdminStorage = () => {
  initializeFirebaseAdmin();
  return admin.storage();
};

export const getAdminAuth = () => {
  initializeFirebaseAdmin();
  return admin.auth();
};

// Lazy-initialized exports (for backwards compatibility)
export const adminDb = new Proxy({} as FirebaseFirestore.Firestore, {
  get: (target, prop) => {
    const db = getAdminDb();
    const value = (db as any)[prop];
    return typeof value === 'function' ? value.bind(db) : value;
  },
});

export const adminStorage = new Proxy({} as admin.storage.Storage, {
  get: (target, prop) => {
    const storage = getAdminStorage();
    const value = (storage as any)[prop];
    return typeof value === 'function' ? value.bind(storage) : value;
  },
});

export const adminAuth = new Proxy({} as admin.auth.Auth, {
  get: (target, prop) => {
    const auth = getAdminAuth();
    const value = (auth as any)[prop];
    return typeof value === 'function' ? value.bind(auth) : value;
  },
});

export default admin;

