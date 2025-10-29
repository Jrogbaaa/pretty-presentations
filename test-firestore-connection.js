// Test Firestore Connection and Count Influencers
require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

console.log('🔍 Checking Firebase Admin credentials...');
console.log('  - Project ID:', serviceAccount.projectId ? '✅' : '❌ MISSING');
console.log('  - Client Email:', serviceAccount.clientEmail ? '✅' : '❌ MISSING');
console.log('  - Private Key:', serviceAccount.privateKey ? `✅ (${serviceAccount.privateKey.length} chars)` : '❌ MISSING');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function testDatabase() {
  try {
    console.log('\n📊 Checking Firestore database...\n');
    
    // Count total influencers
    const allInfluencers = await db.collection('influencers').limit(1000).get();
    console.log(`✅ Total influencers in database: ${allInfluencers.size}`);
    
    if (allInfluencers.size === 0) {
      console.log('\n❌ DATABASE IS EMPTY!');
      console.log('You need to import influencers. Run: node scripts/import-4000-influencers.js');
      process.exit(1);
    }
    
    // Show sample influencer
    const first = allInfluencers.docs[0].data();
    console.log('\n📋 Sample influencer:');
    console.log('  - Name:', first.name);
    console.log('  - Handle:', first.handle);
    console.log('  - Platform:', first.platform);
    console.log('  - Followers:', first.followers);
    console.log('  - Engagement:', first.engagement);
    console.log('  - Location:', JSON.stringify(first.demographics?.location));
    console.log('  - Categories:', JSON.stringify(first.contentCategories?.slice(0, 3)));
    
    // Test Instagram filter
    console.log('\n🔍 Testing Instagram filter...');
    const instagramInfluencers = await db.collection('influencers')
      .where('platform', '==', 'Instagram')
      .limit(10)
      .get();
    console.log(`  Found ${instagramInfluencers.size} Instagram influencers`);
    
    // Test location filter (look for Spain-related)
    console.log('\n🌍 Testing location filters...');
    const allDocs = allInfluencers.docs.slice(0, 100);
    const spainVariations = {};
    allDocs.forEach(doc => {
      const locations = doc.data().demographics?.location || [];
      locations.forEach(loc => {
        const normalized = loc.toLowerCase();
        if (normalized.includes('spain') || normalized.includes('españa') || normalized.includes('madrid') || normalized.includes('barcelona')) {
          spainVariations[loc] = (spainVariations[loc] || 0) + 1;
        }
      });
    });
    console.log('  Spain-related location variations found:', Object.keys(spainVariations).slice(0, 10));
    
    // Test content categories
    console.log('\n🎨 Testing content categories...');
    const allCategories = new Set();
    allDocs.forEach(doc => {
      const categories = doc.data().contentCategories || [];
      categories.forEach(cat => allCategories.add(cat));
    });
    console.log('  Total unique categories:', allCategories.size);
    console.log('  Sample categories:', Array.from(allCategories).slice(0, 10));
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testDatabase();

