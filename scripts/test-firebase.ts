/**
 * Firebase Connection Test Script
 * Tests all Firebase services to ensure proper configuration
 * 
 * Usage: npx ts-node scripts/test-firebase.ts
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  limit,
  doc,
  getDoc,
} from 'firebase/firestore';
import { getStorage, ref, listAll } from 'firebase/storage';
import { getVertexAI, getGenerativeModel } from '@firebase/vertexai-preview';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/**
 * Test Firestore connection
 */
const testFirestore = async (): Promise<boolean> => {
  try {
    console.log('\n📊 Testing Firestore Database...');
    const db = getFirestore();
    
    // Try to read from influencers collection
    const influencersRef = collection(db, 'influencers');
    const q = query(influencersRef, limit(1));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log('⚠️  Firestore connected, but no influencers found');
      console.log('   Run: npm run import:influencers');
      return true;
    }
    
    console.log(`✅ Firestore: Connected (${snapshot.size} document(s) found)`);
    
    // Check metadata
    const metadataRef = doc(db, 'metadata', 'influencers');
    const metadataSnap = await getDoc(metadataRef);
    
    if (metadataSnap.exists()) {
      const data = metadataSnap.data();
      console.log(`   Total influencers: ${data.totalCount || 'Unknown'}`);
      console.log(`   Last imported: ${data.lastImported?.toDate?.() || 'Unknown'}`);
    }
    
    return true;
  } catch (error: any) {
    console.error('❌ Firestore test failed:', error.message);
    return false;
  }
};

/**
 * Test Storage connection
 */
const testStorage = async (): Promise<boolean> => {
  try {
    console.log('\n💾 Testing Firebase Storage...');
    const storage = getStorage();
    const storageRef = ref(storage);
    
    // Try to list root directory
    await listAll(storageRef);
    
    console.log('✅ Storage: Connected');
    return true;
  } catch (error: any) {
    // Storage might not have any files yet, which is okay
    if (error.code === 'storage/object-not-found') {
      console.log('✅ Storage: Connected (empty)');
      return true;
    }
    
    console.error('❌ Storage test failed:', error.message);
    return false;
  }
};

/**
 * Test Vertex AI (Gemini)
 */
const testVertexAI = async (): Promise<boolean> => {
  try {
    console.log('\n🤖 Testing Vertex AI (Gemini)...');
    const vertexAI = getVertexAI();
    const model = getGenerativeModel(vertexAI, {
      model: process.env.NEXT_PUBLIC_VERTEX_AI_MODEL || 'gemini-1.5-flash',
    });
    
    // Simple test prompt
    const result = await model.generateContent('Say "Hello, Pretty Presentations!" in exactly 3 words.');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Vertex AI: Connected');
    console.log(`   Test response: ${text.trim()}`);
    return true;
  } catch (error: any) {
    console.error('❌ Vertex AI test failed:', error.message);
    return false;
  }
};

/**
 * Test environment variables
 */
const testEnvironment = (): boolean => {
  console.log('\n🔐 Checking Environment Variables...');
  
  const required = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.log('\n💡 Create .env.local file with your Firebase credentials');
    console.log('   See env.example for template');
    return false;
  }
  
  console.log('✅ All required environment variables present');
  return true;
};

/**
 * Main test runner
 */
const runTests = async () => {
  console.log('🧪 Pretty Presentations - Firebase Test Suite');
  console.log('='.repeat(50));
  
  // Test environment first
  const envOk = testEnvironment();
  if (!envOk) {
    process.exit(1);
  }
  
  // Initialize Firebase
  try {
    initializeApp(firebaseConfig);
    console.log('\n🔥 Firebase initialized');
  } catch (error: any) {
    console.error('\n❌ Firebase initialization failed:', error.message);
    process.exit(1);
  }
  
  // Run tests
  const results = {
    firestore: await testFirestore(),
    storage: await testStorage(),
    vertexAI: await testVertexAI(),
  };
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📋 Test Summary:');
  console.log('='.repeat(50));
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([service, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${service.padEnd(15)} ${passed ? 'PASS' : 'FAIL'}`);
  });
  
  console.log('='.repeat(50));
  console.log(`Result: ${passed}/${total} tests passed\n`);
  
  if (passed === total) {
    console.log('🎉 All Firebase services are working correctly!');
    console.log('\n📚 Next steps:');
    console.log('   1. Import influencer database: npm run import:influencers');
    console.log('   2. Deploy Firestore rules: firebase deploy --only firestore:rules');
    console.log('   3. Deploy Storage rules: firebase deploy --only storage:rules');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.');
    process.exit(1);
  }
};

// Run tests
runTests().catch((error) => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
