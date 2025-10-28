/**
 * Quick Database & Text Response Check
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, limit, where } from 'firebase/firestore';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkDatabase() {
  console.log('\n' + '═'.repeat(70));
  console.log('🔍 QUICK DATABASE CHECK');
  console.log('═'.repeat(70) + '\n');

  try {
    // Check total count
    console.log('📊 Counting influencers...');
    const allSnapshot = await getDocs(collection(db, 'influencers'));
    console.log(`✅ Total influencers in database: ${allSnapshot.size}`);
    
    if (allSnapshot.size === 0) {
      console.log('\n❌ ERROR: Database is empty!');
      console.log('   Run: npm run import:influencers');
      process.exit(1);
    }
    
    // Check platform distribution
    console.log('\n📱 Platform distribution:');
    const platforms = ['Instagram', 'TikTok', 'YouTube', 'Twitter'];
    for (const platform of platforms) {
      const platformQuery = query(
        collection(db, 'influencers'),
        where('platform', '==', platform),
        limit(100)
      );
      const snapshot = await getDocs(platformQuery);
      console.log(`   ${platform}: ${snapshot.size}+ influencers`);
    }
    
    // Show sample influencers
    console.log('\n👥 Sample influencers:');
    const sampleDocs = allSnapshot.docs.slice(0, 5);
    sampleDocs.forEach((doc, idx) => {
      const data = doc.data();
      console.log(`\n${idx + 1}. ${data.name} (@${data.handle})`);
      console.log(`   Platform: ${data.platform}`);
      console.log(`   Followers: ${data.followers?.toLocaleString() || 'N/A'}`);
      console.log(`   Engagement: ${data.engagement}%`);
      console.log(`   Categories: ${data.contentCategories?.join(', ') || 'None'}`);
    });
    
    console.log('\n' + '═'.repeat(70));
    console.log('✅ DATABASE IS OPERATIONAL');
    console.log('═'.repeat(70) + '\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

checkDatabase();

