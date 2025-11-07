/**
 * Test Firestore Rules and Connectivity
 * Verifies that Firestore is accessible and rules are working correctly
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, limit, addDoc, deleteDoc, doc } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('\n🔥 Testing Firestore Rules & Connectivity\n');
console.log('='.repeat(50));

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
}

const results: TestResult[] = [];

async function runTests() {
  // Test 1: Read influencers (should work with dev rules, might fail with production rules)
  console.log('\n📖 Test 1: Reading influencers collection...');
  try {
    const influencersRef = collection(db, 'influencers');
    const q = query(influencersRef, limit(1));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      results.push({
        name: 'Read Influencers',
        status: 'PASS',
        message: '✅ Can read influencers collection (empty)'
      });
    } else {
      const count = snapshot.size;
      results.push({
        name: 'Read Influencers',
        status: 'PASS',
        message: `✅ Can read influencers collection (${count} document${count !== 1 ? 's' : ''} found)`
      });
    }
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      results.push({
        name: 'Read Influencers',
        status: 'FAIL',
        message: '🔒 Permission denied - Production rules are active (requires authentication)'
      });
    } else {
      results.push({
        name: 'Read Influencers',
        status: 'FAIL',
        message: `❌ Error: ${error.message}`
      });
    }
  }

  // Test 2: Read responses (should work with dev rules, might fail with production rules)
  console.log('\n📖 Test 2: Reading responses collection...');
  try {
    const responsesRef = collection(db, 'responses');
    const q = query(responsesRef, limit(1));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      results.push({
        name: 'Read Responses',
        status: 'PASS',
        message: '✅ Can read responses collection (empty)'
      });
    } else {
      const count = snapshot.size;
      results.push({
        name: 'Read Responses',
        status: 'PASS',
        message: `✅ Can read responses collection (${count} document${count !== 1 ? 's' : ''} found)`
      });
    }
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      results.push({
        name: 'Read Responses',
        status: 'FAIL',
        message: '🔒 Permission denied - Production rules are active (requires authentication)'
      });
    } else {
      results.push({
        name: 'Read Responses',
        status: 'FAIL',
        message: `❌ Error: ${error.message}`
      });
    }
  }

  // Test 3: Write test (create a test document)
  console.log('\n✍️  Test 3: Writing test document...');
  try {
    const testRef = collection(db, 'test-connection');
    const testDoc = await addDoc(testRef, {
      test: true,
      timestamp: new Date(),
      message: 'Firestore connection test'
    });
    
    results.push({
      name: 'Write Test',
      status: 'PASS',
      message: `✅ Can write to Firestore (doc: ${testDoc.id})`
    });

    // Clean up - delete the test document
    try {
      await deleteDoc(doc(db, 'test-connection', testDoc.id));
      console.log('   🧹 Test document cleaned up');
    } catch (cleanupError) {
      console.log('   ⚠️  Could not clean up test document');
    }
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      results.push({
        name: 'Write Test',
        status: 'FAIL',
        message: '🔒 Permission denied - Production rules are active (requires authentication)'
      });
    } else {
      results.push({
        name: 'Write Test',
        status: 'FAIL',
        message: `❌ Error: ${error.message}`
      });
    }
  }

  // Test 4: Read presentations
  console.log('\n📖 Test 4: Reading presentations collection...');
  try {
    const presentationsRef = collection(db, 'presentations');
    const q = query(presentationsRef, limit(1));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      results.push({
        name: 'Read Presentations',
        status: 'PASS',
        message: '✅ Can read presentations collection (empty)'
      });
    } else {
      const count = snapshot.size;
      results.push({
        name: 'Read Presentations',
        status: 'PASS',
        message: `✅ Can read presentations collection (${count} document${count !== 1 ? 's' : ''} found)`
      });
    }
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      results.push({
        name: 'Read Presentations',
        status: 'FAIL',
        message: '🔒 Permission denied - Production rules are active (requires authentication)'
      });
    } else {
      results.push({
        name: 'Read Presentations',
        status: 'FAIL',
        message: `❌ Error: ${error.message}`
      });
    }
  }

  // Print results
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Results:');
  console.log('='.repeat(50));
  
  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️';
    console.log(`\n${icon} ${result.name}`);
    console.log(`   ${result.message}`);
  });

  const passCount = results.filter(r => r.status === 'PASS').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;
  const total = results.length;

  console.log('\n' + '='.repeat(50));
  console.log(`📈 Summary: ${passCount}/${total} tests passed`);
  
  if (failCount > 0) {
    console.log('\n⚠️  Some tests failed. This might indicate:');
    console.log('   1. Production Firestore rules are deployed (requires authentication)');
    console.log('   2. Firestore security rules need adjustment');
    console.log('   3. Network connectivity issues');
    console.log('\n💡 Tip: Check Firebase Console → Firestore → Rules tab');
  } else {
    console.log('\n🎉 All tests passed! Firestore is working correctly.');
  }
  
  console.log('='.repeat(50) + '\n');
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
});

