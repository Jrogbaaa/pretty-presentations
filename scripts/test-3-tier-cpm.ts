/**
 * Test script to verify 3-tier CPM calculations
 * Tier 1 (>10%): 35% reach, €30 CPM
 * Tier 2 (5-10%): 25% reach, €22 CPM
 * Tier 3 (<5%): 15% reach, €15 CPM
 */

import { 
  calculateTieredMetrics, 
  classifyInfluencerTier,
  enrichInfluencersWithTiers
} from '../lib/tiered-cpm-calculator';
import type { SelectedInfluencer } from '../types';

// Create mock influencers matching the example
const mockInfluencers: SelectedInfluencer[] = [
  // TIER 1: >10% engagement
  {
    id: '1',
    name: 'Carlos Mood',
    handle: '@carlosmood',
    platform: 'Instagram',
    profileImage: 'https://example.com/carlos.jpg',
    followers: 120200,
    engagement: 25.22, // TIER 1
    avgViews: 40000,
    demographics: {
      ageRange: '25-40',
      gender: 'Male',
      location: ['Spain'],
      interests: ['Automotive', 'Lifestyle'],
      psychographics: 'Urban professionals'
    },
    contentCategories: ['Automotive', 'Lifestyle'],
    previousBrands: ['BMW', 'Mercedes'],
    rateCard: { post: 3500, story: 700, reel: 5000, video: 7000, integration: 10500 },
    performance: {
      averageEngagementRate: 25.22,
      averageReach: 40000,
      audienceGrowthRate: 3.0,
      contentQualityScore: 95
    },
    rationale: 'High-ROI conversion driver',
    proposedContent: ['Reel', '2x Posts', '3x Stories'],
    estimatedReach: 42070,
    estimatedEngagement: 10610,
    costEstimate: 14000
  },
  // TIER 2: 5-10% engagement
  {
    id: '2',
    name: 'B. Pino',
    handle: '@bpino',
    platform: 'Instagram',
    profileImage: 'https://example.com/bpino.jpg',
    followers: 284100,
    engagement: 6.48, // TIER 2
    avgViews: 85000,
    demographics: {
      ageRange: '22-35',
      gender: 'Female',
      location: ['Spain'],
      interests: ['Fashion', 'Lifestyle'],
      psychographics: 'Fashion conscious'
    },
    contentCategories: ['Fashion', 'Lifestyle'],
    previousBrands: ['Zara', 'Mango'],
    rateCard: { post: 2500, story: 500, reel: 3500, video: 5000, integration: 7500 },
    performance: {
      averageEngagementRate: 6.48,
      averageReach: 85000,
      audienceGrowthRate: 2.5,
      contentQualityScore: 88
    },
    rationale: 'Mid-funnel connection builder',
    proposedContent: ['Reel', '2x Posts', '3x Stories'],
    estimatedReach: 71025,
    estimatedEngagement: 4602,
    costEstimate: 10000
  },
  // Additional TIER 1
  {
    id: '3',
    name: 'Anna Ponsa',
    handle: '@annaponsa',
    platform: 'Instagram',
    followers: 285000,
    engagement: 13.5, // TIER 1
    avgViews: 95000,
    demographics: {
      ageRange: '25-35',
      gender: 'Female',
      location: ['Spain'],
      interests: ['Lifestyle', 'Automotive'],
      psychographics: 'Urban professionals'
    },
    contentCategories: ['Lifestyle', 'Automotive'],
    previousBrands: ['BMW', 'Mercedes'],
    rateCard: { post: 2500, story: 500, reel: 3500, video: 5000, integration: 7500 },
    performance: {
      averageEngagementRate: 13.5,
      averageReach: 95000,
      audienceGrowthRate: 2.5,
      contentQualityScore: 92
    },
    rationale: 'High engagement influencer',
    proposedContent: ['Reel', '2x Posts', '3x Stories'],
    estimatedReach: 71250,
    estimatedEngagement: 9619,
    costEstimate: 10000
  },
  // TIER 2
  {
    id: '4',
    name: 'Bienvenido Aguado',
    handle: '@bienvenidoaguado',
    platform: 'Instagram',
    followers: 195000,
    engagement: 10.33, // TIER 1 (just over threshold)
    avgViews: 60000,
    demographics: {
      ageRange: '28-40',
      gender: 'Male',
      location: ['Spain'],
      interests: ['Lifestyle', 'Travel'],
      psychographics: 'Adventurous'
    },
    contentCategories: ['Lifestyle', 'Travel'],
    previousBrands: ['Various'],
    rateCard: { post: 2000, story: 400, reel: 3000, video: 4000, integration: 6000 },
    performance: {
      averageEngagementRate: 10.33,
      averageReach: 60000,
      audienceGrowthRate: 2.8,
      contentQualityScore: 90
    },
    rationale: 'High-quality connection builder',
    proposedContent: ['Reel', '2x Posts', '3x Stories'],
    estimatedReach: 48750,
    estimatedEngagement: 5036,
    costEstimate: 8000
  },
  // TIER 2
  {
    id: '5',
    name: 'Maria Orbai',
    handle: '@mariaorbai',
    platform: 'Instagram',
    followers: 167500,
    engagement: 9.02, // TIER 2
    avgViews: 50000,
    demographics: {
      ageRange: '24-36',
      gender: 'Female',
      location: ['Spain'],
      interests: ['Fashion', 'Lifestyle'],
      psychographics: 'Creative professionals'
    },
    contentCategories: ['Fashion', 'Lifestyle'],
    previousBrands: ['Various'],
    rateCard: { post: 1800, story: 350, reel: 2700, video: 3600, integration: 5400 },
    performance: {
      averageEngagementRate: 9.02,
      averageReach: 50000,
      audienceGrowthRate: 3.2,
      contentQualityScore: 88
    },
    rationale: 'Mid-funnel connection builder',
    proposedContent: ['Reel', '2x Posts', '3x Stories'],
    estimatedReach: 41875,
    estimatedEngagement: 3777,
    costEstimate: 7000
  },
  // TIER 3
  {
    id: '6',
    name: 'Matilde Trobeck',
    handle: '@matildetrobeck',
    platform: 'Instagram',
    followers: 450000,
    engagement: 3.3, // TIER 3
    avgViews: 75000,
    demographics: {
      ageRange: '18-45',
      gender: 'All',
      location: ['Spain'],
      interests: ['General Lifestyle'],
      psychographics: 'Mass market'
    },
    contentCategories: ['Lifestyle', 'General'],
    previousBrands: ['Various'],
    rateCard: { post: 3000, story: 600, reel: 4500, video: 6000, integration: 9000 },
    performance: {
      averageEngagementRate: 3.3,
      averageReach: 75000,
      audienceGrowthRate: 1.2,
      contentQualityScore: 75
    },
    rationale: 'Broad reach for awareness',
    proposedContent: ['Reel', '2x Posts', '3x Stories'],
    estimatedReach: 67500,
    estimatedEngagement: 2228,
    costEstimate: 12000
  },
];

async function test3TierCPM() {
  console.log('🧪 Testing 3-Tier CPM Calculation System\n');
  console.log('=' .repeat(90));
  console.log('\n📊 Configuration:\n');
  console.log('  Tier 1 (>10% engagement): 35% reach, €30 CPM');
  console.log('  Tier 2 (5-10% engagement): 25% reach, €22 CPM');
  console.log('  Tier 3 (<5% engagement): 15% reach, €15 CPM\n');
  console.log('=' .repeat(90));
  
  // Step 1: Test tier classification
  console.log('\n📋 Step 1: Individual Influencer Classification:\n');
  console.log('-'.repeat(90));
  
  mockInfluencers.forEach((inf, index) => {
    const tier = classifyInfluencerTier(inf.engagement);
    console.log(`${index + 1}. ${inf.name}`);
    console.log(`   Followers: ${inf.followers.toLocaleString()}`);
    console.log(`   Engagement: ${inf.engagement.toFixed(2)}%`);
    console.log(`   Classified as: ${tier.toUpperCase()}`);
    console.log();
  });
  
  // Step 2: Enrich and calculate
  console.log('=' .repeat(90));
  console.log('\n📊 Step 2: Calculating Tiered Metrics:\n');
  console.log('-'.repeat(90));
  
  const enriched = enrichInfluencersWithTiers(mockInfluencers);
  
  enriched.forEach((inf, index) => {
    console.log(`${index + 1}. ${inf.name}`);
    console.log(`   Tier: ${inf.tier?.toUpperCase()} (${inf.tierLabel})`);
    console.log(`   Reach Rate: ${(inf.reachRate! * 100).toFixed(0)}%`);
    console.log(`   Tier Impressions: ${inf.tierImpressions?.toLocaleString()}`);
    console.log(`   Strategic CPM: €${inf.strategicCPM?.toFixed(2)}`);
    console.log();
  });
  
  // Step 3: Calculate campaign metrics
  console.log('=' .repeat(90));
  console.log('\n💰 Step 3: Campaign Totals:\n');
  console.log('-'.repeat(90));
  
  const tieredMetrics = calculateTieredMetrics(mockInfluencers);
  
  // Display tier breakdown
  console.log('\n🎯 TIER BREAKDOWN:\n');
  tieredMetrics.tiers.forEach(tier => {
    console.log(`${tier.tierLabel.toUpperCase()}`);
    console.log(`  Influencers: ${tier.influencers.length}`);
    console.log(`  Total Followers: ${tier.totalFollowers.toLocaleString()}`);
    console.log(`  Avg Engagement: ${tier.avgEngagement.toFixed(2)}%`);
    console.log(`  Estimated Impressions: ${tier.estimatedImpressions.toLocaleString()}`);
    console.log(`  Strategic CPM: €${tier.strategicCPM.toFixed(2)}`);
    console.log(`  Implied Budget: €${tier.impliedBudget.toFixed(2)}`);
    console.log(`  Budget %: ${((tier.impliedBudget / tieredMetrics.totalBudget) * 100).toFixed(1)}%`);
    console.log();
  });
  
  // Display totals
  console.log('=' .repeat(90));
  console.log('\n📊 CAMPAIGN TOTALS:\n');
  console.log(`  Total Influencers: ${tieredMetrics.totalInfluencers}`);
  console.log(`  Total Followers: ${tieredMetrics.totalFollowers.toLocaleString()}`);
  console.log(`  Total Impressions: ${tieredMetrics.totalImpressions.toLocaleString()}`);
  console.log(`  Blended CPM: €${tieredMetrics.blendedCPM.toFixed(2)}`);
  console.log(`  Total Budget (implied): €${tieredMetrics.totalBudget.toFixed(2)}`);
  console.log(`  High-Value Focus (Tier 1+2): ${tieredMetrics.highROIPercentage.toFixed(1)}%`);
  
  // Step 4: Verify calculations
  console.log('\n' + '=' .repeat(90));
  console.log('\n✅ VERIFICATION CHECKS:\n');
  
  let allPassed = true;
  
  // Check 1: Tier 1 influencers (>10%)
  const tier1Count = enriched.filter(inf => inf.tier === 'tier-1').length;
  const expectedTier1 = 3; // Carlos Mood, Anna Ponsa, Bienvenido Aguado
  const tier1Correct = tier1Count === expectedTier1;
  console.log(`  1. Tier 1 count (expected ${expectedTier1}): ${tier1Correct ? '✅ PASS' : '❌ FAIL'} (actual: ${tier1Count})`);
  allPassed = allPassed && tier1Correct;
  
  // Check 2: Tier 2 influencers (5-10%)
  const tier2Count = enriched.filter(inf => inf.tier === 'tier-2').length;
  const expectedTier2 = 2; // B. Pino, Maria Orbai
  const tier2Correct = tier2Count === expectedTier2;
  console.log(`  2. Tier 2 count (expected ${expectedTier2}): ${tier2Correct ? '✅ PASS' : '❌ FAIL'} (actual: ${tier2Count})`);
  allPassed = allPassed && tier2Correct;
  
  // Check 3: Tier 3 influencers (<5%)
  const tier3Count = enriched.filter(inf => inf.tier === 'tier-3').length;
  const expectedTier3 = 1; // Matilde Trobeck
  const tier3Correct = tier3Count === expectedTier3;
  console.log(`  3. Tier 3 count (expected ${expectedTier3}): ${tier3Correct ? '✅ PASS' : '❌ FAIL'} (actual: ${tier3Count})`);
  allPassed = allPassed && tier3Correct;
  
  // Check 4: Tier 1 has 35% reach and €30 CPM
  const tier1Influencers = enriched.filter(inf => inf.tier === 'tier-1');
  const tier1CPMCorrect = tier1Influencers.every(inf => inf.strategicCPM === 30 && inf.reachRate === 0.35);
  console.log(`  4. Tier 1 has 35% reach & €30 CPM: ${tier1CPMCorrect ? '✅ PASS' : '❌ FAIL'}`);
  allPassed = allPassed && tier1CPMCorrect;
  
  // Check 5: Tier 2 has 25% reach and €22 CPM
  const tier2Influencers = enriched.filter(inf => inf.tier === 'tier-2');
  const tier2CPMCorrect = tier2Influencers.every(inf => inf.strategicCPM === 22 && inf.reachRate === 0.25);
  console.log(`  5. Tier 2 has 25% reach & €22 CPM: ${tier2CPMCorrect ? '✅ PASS' : '❌ FAIL'}`);
  allPassed = allPassed && tier2CPMCorrect;
  
  // Check 6: Tier 3 has 15% reach and €15 CPM
  const tier3Influencers = enriched.filter(inf => inf.tier === 'tier-3');
  const tier3CPMCorrect = tier3Influencers.every(inf => inf.strategicCPM === 15 && inf.reachRate === 0.15);
  console.log(`  6. Tier 3 has 15% reach & €15 CPM: ${tier3CPMCorrect ? '✅ PASS' : '❌ FAIL'}`);
  allPassed = allPassed && tier3CPMCorrect;
  
  // Check 7: Blended CPM calculation
  const calculatedBlendedCPM = (tieredMetrics.totalBudget / tieredMetrics.totalImpressions) * 1000;
  const blendedCPMCorrect = Math.abs(calculatedBlendedCPM - tieredMetrics.blendedCPM) < 0.01;
  console.log(`  7. Blended CPM calculated correctly: ${blendedCPMCorrect ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`     Expected: €${calculatedBlendedCPM.toFixed(2)}, Actual: €${tieredMetrics.blendedCPM.toFixed(2)}`);
  allPassed = allPassed && blendedCPMCorrect;
  
  // Check 8: Impressions match tier-sum
  const sumImpressions = enriched.reduce((sum, inf) => sum + (inf.tierImpressions || 0), 0);
  const impressionsMatch = sumImpressions === tieredMetrics.totalImpressions;
  console.log(`  8. Total impressions match: ${impressionsMatch ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`     Sum: ${sumImpressions.toLocaleString()}, Calculated: ${tieredMetrics.totalImpressions.toLocaleString()}`);
  allPassed = allPassed && impressionsMatch;
  
  // Check 9: Blended CPM is in reasonable range (€20-€30)
  const cpmReasonable = tieredMetrics.blendedCPM >= 20 && tieredMetrics.blendedCPM <= 30;
  console.log(`  9. Blended CPM in reasonable range (€20-€30): ${cpmReasonable ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`     Actual: €${tieredMetrics.blendedCPM.toFixed(2)}`);
  allPassed = allPassed && cpmReasonable;
  
  console.log('\n' + '=' .repeat(90));
  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED! 3-Tier CPM system working correctly.\n');
    console.log('Summary:');
    console.log(`  • Tier 1: ${tier1Count} influencers (${tieredMetrics.tiers[0]?.estimatedImpressions.toLocaleString() || 0} impressions @ €30 CPM)`);
    console.log(`  • Tier 2: ${tier2Count} influencers (${tieredMetrics.tiers[1]?.estimatedImpressions.toLocaleString() || 0} impressions @ €22 CPM)`);
    console.log(`  • Tier 3: ${tier3Count} influencers (${tieredMetrics.tiers[2]?.estimatedImpressions.toLocaleString() || 0} impressions @ €15 CPM)`);
    console.log(`  • Total: ${tieredMetrics.totalImpressions.toLocaleString()} impressions`);
    console.log(`  • Blended CPM: €${tieredMetrics.blendedCPM.toFixed(2)}`);
    console.log(`  • High-value concentration: ${tieredMetrics.highROIPercentage.toFixed(0)}%\n`);
  } else {
    console.log('\n⚠️  SOME TESTS FAILED!\n');
    return false;
  }
  
  return true;
}

// Run the test
test3TierCPM()
  .then((success) => {
    if (success) {
      console.log('✅ Test completed successfully');
      process.exit(0);
    } else {
      console.log('❌ Test failed');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  });

