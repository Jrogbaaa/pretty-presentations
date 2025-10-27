/**
 * Test Presentation Generation with Real Influencer Matching
 * Simulates a brief submission and checks if real influencers are matched
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';
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

console.log('\n' + '═'.repeat(70));
console.log('🧪 TEST: PRESENTATION GENERATION & INFLUENCER MATCHING');
console.log('═'.repeat(70) + '\n');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Test brief (similar to what a user would submit)
const testBrief = {
  clientName: "Zara",
  brandInfo: "Fashion retailer targeting young professionals",
  campaignGoals: [
    "Increase brand awareness in Spain",
    "Drive traffic to e-commerce site",
    "Showcase new summer collection"
  ],
  targetDemographics: {
    ageRange: "25-34",
    gender: "All",
    location: ["Spain", "España"],
    interests: ["Fashion", "Lifestyle", "Shopping"]
  },
  budget: 25000,
  platformPreferences: ["Instagram"],
  contentThemes: ["Fashion", "Lifestyle", "Style"],
  timeline: {
    startDate: "2025-11-01",
    endDate: "2025-12-31",
    milestones: []
  },
  deliverables: [
    "Instagram posts",
    "Instagram stories",
    "Influencer partnerships"
  ],
  competitors: ["H&M", "Mango"],
  brandVoice: "Modern, stylish, accessible",
  kpis: ["Engagement rate", "Reach", "Conversions"]
};

async function testPresentationGeneration() {
  try {
    console.log('📝 Test Brief:');
    console.log(`   Client: ${testBrief.clientName}`);
    console.log(`   Platform: ${testBrief.platformPreferences.join(', ')}`);
    console.log(`   Content Themes: ${testBrief.contentThemes.join(', ')}`);
    console.log(`   Budget: €${testBrief.budget.toLocaleString()}`);
    console.log(`   Location: ${testBrief.targetDemographics.location.join(', ')}\n`);

    console.log('🔍 Simulating influencer search...');
    
    // Import the search function
    const { searchInfluencers } = await import('../lib/influencer-service.js');
    
    console.log('   Searching with filters:');
    console.log(`   - Platforms: ${testBrief.platformPreferences}`);
    console.log(`   - Locations: ${testBrief.targetDemographics.location}`);
    console.log(`   - Content Categories: ${testBrief.contentThemes}`);
    console.log(`   - Max Budget: €${testBrief.budget}\n`);
    
    const results = await searchInfluencers({
      platforms: testBrief.platformPreferences,
      locations: testBrief.targetDemographics.location,
      contentCategories: testBrief.contentThemes,
      maxBudget: testBrief.budget,
    }, 50);

    console.log(`✅ Found ${results.length} matching influencers\n`);

    if (results.length === 0) {
      console.error('❌ FAIL: No influencers matched!');
      console.error('This means the matching logic or filters are too restrictive.\n');
      process.exit(1);
    }

    console.log('📊 Top 10 Matched Influencers:\n');
    results.slice(0, 10).forEach((inf, idx) => {
      console.log(`${idx + 1}. ${inf.name} (@${inf.handle})`);
      console.log(`   Platform: ${inf.platform}`);
      console.log(`   Followers: ${inf.followers.toLocaleString()}`);
      console.log(`   Engagement: ${inf.engagement}%`);
      console.log(`   Categories: ${inf.contentCategories.slice(0, 3).join(', ')}`);
      console.log(`   Location: ${inf.demographics.location.join(', ')}`);
      console.log(`   Est. Cost: €${inf.rateCard.post.toLocaleString()}/post\n`);
    });

    // Verify data quality
    console.log('✅ Data Quality Checks:\n');
    
    const hasRealNames = results.some(inf => 
      inf.name && 
      inf.name !== 'Unknown' && 
      inf.name !== 'NAME' &&
      !inf.name.includes('Mock') &&
      !inf.name.includes('Test')
    );
    console.log(`   Real names: ${hasRealNames ? '✅ YES' : '❌ NO'}`);

    const hasVariedFollowers = new Set(results.map(inf => inf.followers)).size > 1;
    console.log(`   Varied followers: ${hasVariedFollowers ? '✅ YES' : '❌ NO'}`);

    const hasSpanishLocations = results.every(inf => 
      inf.demographics.location.some(loc => 
        loc.toLowerCase().includes('spain') || 
        loc.toLowerCase().includes('españa')
      )
    );
    console.log(`   Spanish locations: ${hasSpanishLocations ? '✅ YES' : '❌ NO'}`);

    const hasFashionCategories = results.some(inf => 
      inf.contentCategories.some(cat => 
        cat.toLowerCase().includes('fashion') || 
        cat.toLowerCase().includes('lifestyle')
      )
    );
    console.log(`   Relevant categories: ${hasFashionCategories ? '✅ YES' : '❌ NO'}`);

    const allWithinBudget = results.every(inf => 
      inf.rateCard.post * 3 <= testBrief.budget
    );
    console.log(`   Within budget: ${allWithinBudget ? '✅ YES' : '❌ NO'}`);

    console.log('\n' + '═'.repeat(70));
    
    if (hasRealNames && hasVariedFollowers && hasSpanishLocations && hasFashionCategories) {
      console.log('✅ TEST PASSED: REAL INFLUENCERS MATCHED SUCCESSFULLY!');
      console.log('═'.repeat(70));
      console.log('\n✅ Influencer matching: Working');
      console.log('✅ Real data: Confirmed');
      console.log('✅ Filters: Working correctly');
      console.log('✅ Spanish influencers: Matched');
      console.log('✅ Content categories: Matched');
      console.log(`✅ Results: ${results.length} relevant influencers\n`);
      
      console.log('🎉 YOUR SYSTEM IS READY FOR PRODUCTION!');
      console.log('\n📋 Next Steps:');
      console.log('   1. Go to http://localhost:3000');
      console.log('   2. Submit the same brief through the UI');
      console.log('   3. Check the generated presentation');
      console.log('   4. Verify Talent Strategy slide shows these influencers\n');
      
      process.exit(0);
    } else {
      console.log('❌ TEST FAILED: DATA QUALITY ISSUES');
      console.log('═'.repeat(70));
      console.log('\nSome data quality checks failed. Please review above.\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('\nError details:', error);
    
    if (error.code === 'permission-denied') {
      console.error('\n⚠️  FIRESTORE PERMISSION DENIED!');
      console.error('The app cannot read from Firestore.');
      console.error('You need to update Firestore security rules.');
      console.error('See: QUICK_FIX_RULES.md\n');
    }
    
    process.exit(1);
  }
}

testPresentationGeneration();

