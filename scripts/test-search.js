/**
 * Test Search Influencers Function
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, limit } from 'firebase/firestore';
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

async function testSearch() {
  console.log('\n' + '═'.repeat(70));
  console.log('🔍 TESTING INFLUENCER SEARCH');
  console.log('═'.repeat(70) + '\n');

  try {
    // Test 1: Get all influencers (first 800)
    console.log('Test 1: Fetching first 800 influencers from Instagram...');
    const q = query(
      collection(db, 'influencers'),
      where('platform', '==', 'Instagram'),
      limit(800)
    );
    const snapshot = await getDocs(q);
    console.log(`✅ Fetched ${snapshot.size} influencers\n`);
    
    // Test 2: Check content categories
    console.log('Test 2: Analyzing content categories...');
    const categories = new Map();
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.contentCategories && Array.isArray(data.contentCategories)) {
        data.contentCategories.forEach(cat => {
          categories.set(cat, (categories.get(cat) || 0) + 1);
        });
      }
    });
    
    console.log('\nTop 20 content categories:');
    const sortedCategories = Array.from(categories.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);
    sortedCategories.forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} influencers`);
    });
    
    // Test 3: Search for Fashion influencers
    console.log('\n\nTest 3: Searching for Fashion influencers...');
    const fashionInfluencers = snapshot.docs.filter(doc => {
      const data = doc.data();
      return data.contentCategories && data.contentCategories.some(cat => 
        cat.toLowerCase().includes('fashion') || 'fashion'.includes(cat.toLowerCase())
      );
    });
    
    console.log(`✅ Found ${fashionInfluencers.length} Fashion influencers`);
    
    if (fashionInfluencers.length > 0) {
      console.log('\nSample Fashion influencers:');
      fashionInfluencers.slice(0, 5).forEach((doc, idx) => {
        const data = doc.data();
        console.log(`\n${idx + 1}. ${data.name} (@${data.handle})`);
        console.log(`   Followers: ${data.followers?.toLocaleString() || 'N/A'}`);
        console.log(`   Engagement: ${data.engagement}%`);
        console.log(`   Categories: ${data.contentCategories?.join(', ')}`);
        console.log(`   Location: ${data.demographics?.location?.join(', ') || 'N/A'}`);
        console.log(`   Rate: €${data.rateCard?.post || 'N/A'}/post`);
      });
    }
    
    // Test 4: Apply Spain filter
    console.log('\n\nTest 4: Filtering for Spain location...');
    const spainFashionInfluencers = fashionInfluencers.filter(doc => {
      const data = doc.data();
      return data.demographics && data.demographics.location && data.demographics.location.some(loc =>
        loc.toLowerCase().includes('spain')
      );
    });
    
    console.log(`✅ Found ${spainFashionInfluencers.length} Fashion influencers in Spain`);
    
    // Test 5: Check budget feasibility
    console.log('\n\nTest 5: Checking budget feasibility (€25,000 budget)...');
    const affordableInfluencers = spainFashionInfluencers.filter(doc => {
      const data = doc.data();
      const estimatedCost = (data.rateCard?.post || 0) * 3;
      return estimatedCost <= 25000 && estimatedCost > 0;
    });
    
    console.log(`✅ Found ${affordableInfluencers.length} affordable Fashion influencers in Spain`);
    
    if (affordableInfluencers.length > 0) {
      console.log('\nSample affordable influencers:');
      affordableInfluencers.slice(0, 5).forEach((doc, idx) => {
        const data = doc.data();
        const estimatedCost = (data.rateCard?.post || 0) * 3;
        console.log(`\n${idx + 1}. ${data.name} (@${data.handle})`);
        console.log(`   Followers: ${data.followers?.toLocaleString()}`);
        console.log(`   Engagement: ${data.engagement}%`);
        console.log(`   Estimated cost: €${estimatedCost.toLocaleString()}`);
      });
    }
    
    console.log('\n' + '═'.repeat(70));
    console.log('✅ SEARCH TEST COMPLETE');
    console.log('═'.repeat(70) + '\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error);
    process.exit(1);
  }
}

testSearch();

