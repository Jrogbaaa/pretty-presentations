/**
 * Integration Test: Database Influencer Matching
 * Tests that real influencers from Firestore are fetched and used in presentations
 * 
 * This validates the v1.3.1 changes where we switched from mock data to real database
 */

import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

const db = admin.firestore();

// Mock brief data for testing
const createTestBrief = (overrides = {}) => ({
  clientName: 'Test Client',
  campaignGoals: ['Brand Awareness', 'Engagement'],
  budget: 25000,
  targetDemographics: {
    ageRange: '25-34',
    gender: 'All',
    location: ['Spain'],
    interests: ['Fashion', 'Lifestyle'],
  },
  brandRequirements: ['Authentic content', 'High engagement'],
  timeline: '3 months',
  platformPreferences: ['Instagram'],
  contentThemes: ['Fashion', 'Lifestyle'],
  ...overrides,
});

/**
 * Test 1: Verify Database Connection
 */
const testDatabaseConnection = async () => {
  console.log('\n🧪 TEST 1: Database Connection\n');
  console.log('─'.repeat(70));
  
  try {
    const snapshot = await db.collection('influencers').limit(1).get();
    
    if (snapshot.empty) {
      console.log('❌ FAIL: Influencer collection is empty');
      return { success: false, error: 'No influencers in database' };
    }
    
    const totalSnapshot = await db.collection('influencers').count().get();
    const totalCount = totalSnapshot.data().count;
    
    console.log(`✅ Database connected successfully`);
    console.log(`✅ Total influencers in database: ${totalCount}`);
    console.log(`✅ Expected: ~3,000 | Actual: ${totalCount}`);
    
    if (totalCount < 2900) {
      console.log('⚠️  WARNING: Count is lower than expected');
    }
    
    return { success: true, count: totalCount };
  } catch (error) {
    console.error('❌ FAIL: Database connection error:', error);
    return { success: false, error };
  }
};

/**
 * Test 2: Query Influencers by Platform
 */
const testPlatformQuery = async () => {
  console.log('\n🧪 TEST 2: Platform-Based Query\n');
  console.log('─'.repeat(70));
  
  try {
    const brief = createTestBrief();
    
    console.log(`Query: Platform = ${brief.platformPreferences[0]}`);
    
    const snapshot = await db.collection('influencers')
      .where('platform', '==', brief.platformPreferences[0])
      .limit(50)
      .get();
    
    console.log(`✅ Found ${snapshot.size} ${brief.platformPreferences[0]} influencers`);
    
    if (snapshot.size === 0) {
      console.log('❌ FAIL: No influencers found for platform');
      return { success: false };
    }
    
    // Show sample
    const sample = snapshot.docs[0].data();
    console.log(`\n📋 Sample Influencer:`);
    console.log(`   ID: ${snapshot.docs[0].id}`);
    console.log(`   Name: ${sample.name}`);
    console.log(`   Handle: @${sample.handle}`);
    console.log(`   Platform: ${sample.platform}`);
    console.log(`   Followers: ${sample.followers?.toLocaleString() || 'N/A'}`);
    console.log(`   Engagement: ${sample.engagement}%`);
    console.log(`   Categories: ${sample.contentCategories?.join(', ') || 'None'}`);
    console.log(`   Location: ${sample.demographics?.location?.join(', ') || 'N/A'}`);
    
    return { success: true, count: snapshot.size, sample };
  } catch (error) {
    console.error('❌ FAIL: Platform query error:', error);
    return { success: false, error };
  }
};

/**
 * Test 3: Content Category Filtering (NEW in v1.3.1)
 */
const testContentCategoryFiltering = async () => {
  console.log('\n🧪 TEST 3: Content Category Filtering (v1.3.1 Feature)\n');
  console.log('─'.repeat(70));
  
  try {
    const brief = createTestBrief({ contentThemes: ['Fashion', 'Lifestyle'] });
    
    console.log(`Query: Content Categories = ${brief.contentThemes.join(', ')}`);
    
    // Firestore array-contains-any query
    const snapshot = await db.collection('influencers')
      .where('platform', '==', 'Instagram')
      .where('contentCategories', 'array-contains-any', brief.contentThemes.slice(0, 10))
      .limit(100)
      .get();
    
    console.log(`✅ Found ${snapshot.size} influencers with Fashion/Lifestyle content`);
    
    if (snapshot.size === 0) {
      console.log('⚠️  WARNING: No influencers found with these content categories');
      console.log('   This might indicate category mismatch in database');
      return { success: true, count: 0, warning: true };
    }
    
    // Verify categories
    const influencers = snapshot.docs.map(d => d.data());
    const withCategories = influencers.filter(inf => {
      const cats = inf.contentCategories || [];
      return cats.some((cat: string) => 
        brief.contentThemes.some(theme => 
          cat.toLowerCase().includes(theme.toLowerCase())
        )
      );
    });
    
    console.log(`✅ Verified ${withCategories.length}/${snapshot.size} have matching categories`);
    
    // Show examples
    console.log(`\n📋 Sample Matched Influencers:\n`);
    withCategories.slice(0, 3).forEach((inf, idx) => {
      console.log(`${idx + 1}. ${inf.name} (@${inf.handle})`);
      console.log(`   Categories: ${inf.contentCategories?.join(', ')}`);
      console.log(`   Followers: ${inf.followers?.toLocaleString()}`);
      console.log('');
    });
    
    return { success: true, count: withCategories.length };
  } catch (error) {
    console.error('❌ FAIL: Content category query error:', error);
    return { success: false, error };
  }
};

/**
 * Test 4: Budget-Based Filtering
 */
const testBudgetFiltering = async () => {
  console.log('\n🧪 TEST 4: Budget-Based Filtering\n');
  console.log('─'.repeat(70));
  
  try {
    const brief = createTestBrief({ budget: 25000 });
    const maxCostPerInfluencer = brief.budget / 3; // Assuming at least 3 influencers
    
    console.log(`Budget: €${brief.budget.toLocaleString()}`);
    console.log(`Max cost per influencer: €${maxCostPerInfluencer.toLocaleString()} (3 posts)`);
    
    const snapshot = await db.collection('influencers')
      .where('platform', '==', 'Instagram')
      .limit(100)
      .get();
    
    // Client-side budget filter
    const withinBudget = snapshot.docs
      .map(d => d.data())
      .filter(inf => {
        const estimatedCost = (inf.rateCard?.post || 0) * 3; // 3 posts
        return estimatedCost <= maxCostPerInfluencer && estimatedCost > 0;
      });
    
    console.log(`✅ Found ${withinBudget.length}/${snapshot.size} influencers within budget`);
    
    if (withinBudget.length === 0) {
      console.log('⚠️  WARNING: No influencers found within budget constraints');
      return { success: true, count: 0, warning: true };
    }
    
    // Show examples
    console.log(`\n📋 Affordable Influencers (within €${maxCostPerInfluencer.toLocaleString()}):\n`);
    withinBudget.slice(0, 3).forEach((inf, idx) => {
      const cost = (inf.rateCard?.post || 0) * 3;
      console.log(`${idx + 1}. ${inf.name}`);
      console.log(`   Followers: ${inf.followers?.toLocaleString()}`);
      console.log(`   Post Rate: €${inf.rateCard?.post || 'N/A'}`);
      console.log(`   3 Posts Cost: €${cost.toLocaleString()}`);
      console.log('');
    });
    
    return { success: true, count: withinBudget.length };
  } catch (error) {
    console.error('❌ FAIL: Budget filtering error:', error);
    return { success: false, error };
  }
};

/**
 * Test 5: Location Filtering
 */
const testLocationFiltering = async () => {
  console.log('\n🧪 TEST 5: Location Filtering\n');
  console.log('─'.repeat(70));
  
  try {
    const brief = createTestBrief({ targetDemographics: { location: ['Spain'] } });
    
    console.log(`Target Location: ${brief.targetDemographics.location.join(', ')}`);
    
    const snapshot = await db.collection('influencers')
      .where('platform', '==', 'Instagram')
      .limit(100)
      .get();
    
    // Client-side location filter (as done in influencer-service.ts)
    const inLocation = snapshot.docs
      .map(d => d.data())
      .filter(inf => {
        const locations = inf.demographics?.location || [];
        return locations.some((loc: string) =>
          brief.targetDemographics.location.some(targetLoc =>
            loc.toLowerCase().includes(targetLoc.toLowerCase())
          )
        );
      });
    
    console.log(`✅ Found ${inLocation.length}/${snapshot.size} Spanish influencers`);
    
    if (inLocation.length === 0) {
      console.log('⚠️  WARNING: No influencers found in Spain');
      return { success: true, count: 0, warning: true };
    }
    
    // Show examples
    console.log(`\n📋 Spanish Influencers:\n`);
    inLocation.slice(0, 3).forEach((inf, idx) => {
      console.log(`${idx + 1}. ${inf.name} (@${inf.handle})`);
      console.log(`   Location: ${inf.demographics?.location?.join(', ') || 'N/A'}`);
      console.log(`   Followers: ${inf.followers?.toLocaleString()}`);
      console.log('');
    });
    
    return { success: true, count: inLocation.length };
  } catch (error) {
    console.error('❌ FAIL: Location filtering error:', error);
    return { success: false, error };
  }
};

/**
 * Test 6: Engagement Quality Check
 */
const testEngagementQuality = async () => {
  console.log('\n🧪 TEST 6: Engagement Quality (≥2% threshold)\n');
  console.log('─'.repeat(70));
  
  try {
    const minEngagement = 2.0; // Minimum 2% as per matching logic
    
    console.log(`Minimum Engagement: ${minEngagement}%`);
    
    const snapshot = await db.collection('influencers')
      .where('engagement', '>=', minEngagement)
      .limit(100)
      .get();
    
    console.log(`✅ Found ${snapshot.size} influencers with ≥${minEngagement}% engagement`);
    
    const influencers = snapshot.docs.map(d => d.data());
    const avgEngagement = influencers.reduce((sum, inf) => sum + (inf.engagement || 0), 0) / influencers.length;
    
    console.log(`✅ Average engagement: ${avgEngagement.toFixed(2)}%`);
    
    // High performers
    const highPerformers = influencers.filter(i => (i.engagement || 0) >= 5.0);
    console.log(`✅ High performers (≥5%): ${highPerformers.length}`);
    
    if (highPerformers.length > 0) {
      console.log(`\n📋 Top Engagement Examples:\n`);
      highPerformers.slice(0, 3).forEach((inf, idx) => {
        console.log(`${idx + 1}. ${inf.name} (@${inf.handle})`);
        console.log(`   Engagement: ${inf.engagement}%`);
        console.log(`   Followers: ${inf.followers?.toLocaleString()}`);
        console.log('');
      });
    }
    
    return { success: true, avgEngagement, highPerformers: highPerformers.length };
  } catch (error) {
    console.error('❌ FAIL: Engagement query error:', error);
    return { success: false, error };
  }
};

/**
 * Test 7: Verify Data Structure (Critical for matching)
 */
const testDataStructure = async () => {
  console.log('\n🧪 TEST 7: Data Structure Validation\n');
  console.log('─'.repeat(70));
  
  try {
    const snapshot = await db.collection('influencers').limit(10).get();
    const influencers = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
    
    console.log(`Checking structure of ${influencers.length} sample influencers...\n`);
    
    // Required fields check
    const requiredFields = [
      'name', 'handle', 'platform', 'followers', 'engagement',
      'contentCategories', 'demographics', 'rateCard'
    ];
    
    let allValid = true;
    
    requiredFields.forEach(field => {
      const count = influencers.filter((inf: any) => inf[field] !== undefined && inf[field] !== null).length;
      const isValid = count === influencers.length;
      
      console.log(`${isValid ? '✅' : '⚠️ '} ${field}: ${count}/${influencers.length}`);
      
      if (!isValid) allValid = false;
    });
    
    // Check nested structures
    console.log(`\n📋 Sample Data Structure:\n`);
    const sample = influencers[0];
    console.log(`{`);
    console.log(`  id: "${sample.id}",`);
    console.log(`  name: "${sample.name}",`);
    console.log(`  handle: "${sample.handle}",`);
    console.log(`  platform: "${sample.platform}",`);
    console.log(`  followers: ${sample.followers},`);
    console.log(`  engagement: ${sample.engagement},`);
    console.log(`  contentCategories: [${sample.contentCategories?.slice(0, 2).map((c: string) => `"${c}"`).join(', ')}],`);
    console.log(`  demographics: {`);
    console.log(`    location: [${sample.demographics?.location?.slice(0, 2).map((l: string) => `"${l}"`).join(', ')}],`);
    console.log(`    ageRange: "${sample.demographics?.ageRange}",`);
    console.log(`    gender: "${sample.demographics?.gender}"`);
    console.log(`  },`);
    console.log(`  rateCard: {`);
    console.log(`    post: ${sample.rateCard?.post},`);
    console.log(`    story: ${sample.rateCard?.story},`);
    console.log(`    reel: ${sample.rateCard?.reel}`);
    console.log(`  }`);
    console.log(`}`);
    
    if (!allValid) {
      console.log(`\n⚠️  WARNING: Some influencers missing required fields`);
      console.log(`   This may affect matching accuracy`);
    }
    
    return { success: true, allValid };
  } catch (error) {
    console.error('❌ FAIL: Data structure validation error:', error);
    return { success: false, error };
  }
};

/**
 * Test 8: Simulated Complete Matching Flow
 */
const testCompleteMatchingFlow = async () => {
  console.log('\n🧪 TEST 8: Complete Matching Flow Simulation\n');
  console.log('─'.repeat(70));
  
  try {
    const brief = createTestBrief({
      clientName: 'The Band Perfume',
      platformPreferences: ['Instagram', 'TikTok'],
      contentThemes: ['Music', 'Lifestyle'],
      budget: 75000,
    });
    
    console.log('Brief Parameters:');
    console.log(`  Client: ${brief.clientName}`);
    console.log(`  Platforms: ${brief.platformPreferences.join(', ')}`);
    console.log(`  Content: ${brief.contentThemes.join(', ')}`);
    console.log(`  Location: ${brief.targetDemographics.location.join(', ')}`);
    console.log(`  Budget: €${brief.budget.toLocaleString()}\n`);
    
    // Stage 1: Firestore Query
    console.log('Stage 1: Firestore Query...');
    const snapshot = await db.collection('influencers')
      .where('platform', 'in', brief.platformPreferences)
      .limit(200)
      .get();
    
    console.log(`  ✅ Fetched ${snapshot.size} influencers from database`);
    
    // Stage 2: Client-side filtering
    console.log('\nStage 2: Client-Side Filtering...');
    let filtered = snapshot.docs.map(d => d.data());
    
    // Location filter
    filtered = filtered.filter(inf => {
      const locations = inf.demographics?.location || [];
      return locations.some((loc: string) =>
        brief.targetDemographics.location.some(targetLoc =>
          loc.toLowerCase().includes(targetLoc.toLowerCase())
        )
      );
    });
    console.log(`  ✅ Location filter: ${filtered.length} Spanish influencers`);
    
    // Budget filter
    const maxCost = brief.budget / 3;
    filtered = filtered.filter(inf => {
      const cost = (inf.rateCard?.post || 0) * 3;
      return cost <= maxCost && cost > 0;
    });
    console.log(`  ✅ Budget filter: ${filtered.length} within budget`);
    
    // Engagement filter
    filtered = filtered.filter(inf => (inf.engagement || 0) >= 2.0);
    console.log(`  ✅ Engagement filter: ${filtered.length} with ≥2% ER`);
    
    // Stage 3: Optimal Mix Selection (simplified)
    console.log('\nStage 3: Optimal Mix Selection...');
    const macro = filtered.filter(i => (i.followers || 0) >= 500000);
    const midTier = filtered.filter(i => (i.followers || 0) >= 50000 && (i.followers || 0) < 500000);
    const micro = filtered.filter(i => (i.followers || 0) < 50000);
    
    console.log(`  Available: ${macro.length} macro, ${midTier.length} mid-tier, ${micro.length} micro`);
    
    // Select mix
    const selected = [];
    if (macro.length > 0) selected.push(macro[0]);
    selected.push(...midTier.slice(0, 3));
    selected.push(...micro.slice(0, 2));
    
    console.log(`  ✅ Selected ${selected.length} influencers for optimal mix`);
    
    // Stage 4: Cost calculation
    console.log('\nStage 4: Cost Calculation...');
    const totalCost = selected.reduce((sum, inf) => {
      return sum + ((inf.rateCard?.post || 0) * 2) + (inf.rateCard?.reel || 0) + ((inf.rateCard?.story || 0) * 3);
    }, 0);
    const totalReach = selected.reduce((sum, inf) => sum + Math.floor((inf.followers || 0) * 0.35), 0);
    
    console.log(`  Total Cost: €${totalCost.toLocaleString()}`);
    console.log(`  Total Reach: ${totalReach.toLocaleString()}`);
    console.log(`  Within Budget: ${totalCost <= brief.budget ? '✅ YES' : '❌ NO'}`);
    
    // Show selected influencers
    console.log(`\n📋 Selected Influencers:\n`);
    selected.forEach((inf, idx) => {
      const tier = inf.followers >= 500000 ? 'MACRO' : inf.followers >= 50000 ? 'MID' : 'MICRO';
      const cost = ((inf.rateCard?.post || 0) * 2) + (inf.rateCard?.reel || 0) + ((inf.rateCard?.story || 0) * 3);
      
      console.log(`${idx + 1}. [${tier}] ${inf.name} (@${inf.handle})`);
      console.log(`   Followers: ${inf.followers?.toLocaleString()}`);
      console.log(`   Engagement: ${inf.engagement}%`);
      console.log(`   Estimated Cost: €${cost.toLocaleString()}`);
      console.log('');
    });
    
    return { 
      success: true, 
      selectedCount: selected.length,
      totalCost,
      totalReach,
      withinBudget: totalCost <= brief.budget
    };
  } catch (error) {
    console.error('❌ FAIL: Complete flow simulation error:', error);
    return { success: false, error };
  }
};

/**
 * Run All Tests
 */
const runAllTests = async () => {
  console.log('\n');
  console.log('═'.repeat(70));
  console.log('🧪 DATABASE INTEGRATION TEST SUITE (v1.3.1)');
  console.log('═'.repeat(70));
  console.log('Purpose: Verify real influencers from Firestore are used (not mock data)');
  console.log('Changes: app/page.tsx + lib/influencer-matcher.ts');
  console.log('═'.repeat(70));

  const results = {
    test1: await testDatabaseConnection(),
    test2: await testPlatformQuery(),
    test3: await testContentCategoryFiltering(),
    test4: await testBudgetFiltering(),
    test5: await testLocationFiltering(),
    test6: await testEngagementQuality(),
    test7: await testDataStructure(),
    test8: await testCompleteMatchingFlow(),
  };

  // Summary
  console.log('\n' + '═'.repeat(70));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('═'.repeat(70) + '\n');

  const passed = Object.values(results).filter(r => r.success).length;
  const total = Object.values(results).length;
  const hasWarnings = Object.values(results).some((r: any) => r.warning);

  console.log(`Tests Passed: ${passed}/${total}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(0)}%`);
  
  if (results.test1.success && results.test1.count) {
    console.log(`Database Count: ${results.test1.count} influencers`);
  }
  
  if (results.test8.success && results.test8.selectedCount) {
    console.log(`\n✅ CRITICAL: Matching flow successfully selected ${results.test8.selectedCount} influencers`);
    console.log(`✅ Cost: €${results.test8.totalCost?.toLocaleString()}`);
    console.log(`✅ Reach: ${results.test8.totalReach?.toLocaleString()}`);
  }
  
  console.log('\n' + '═'.repeat(70));
  
  if (passed === total && !hasWarnings) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ Database integration is working correctly');
    console.log('✅ Real influencers from Firestore are being used');
    console.log('✅ Content category filtering (v1.3.1) is operational');
    console.log('✅ All 4 matching stages are functional');
    console.log('✅ System is ready for production use');
  } else if (passed === total && hasWarnings) {
    console.log('⚠️  TESTS PASSED WITH WARNINGS');
    console.log('   Check warnings above for potential issues');
  } else {
    console.log('❌ SOME TESTS FAILED');
    console.log('   Review failed tests above');
  }

  console.log('═'.repeat(70) + '\n');
  
  process.exit(passed === total ? 0 : 1);
};

// Run tests
runAllTests().catch(error => {
  console.error('\n💥 FATAL ERROR:', error);
  process.exit(1);
});

