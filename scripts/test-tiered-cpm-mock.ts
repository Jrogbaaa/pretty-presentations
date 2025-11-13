/**
 * Test script to verify tiered CPM calculations with mock data
 */

import { 
  calculateTieredMetrics, 
  formatTierMetricsTable,
  generateTierRecommendations,
  classifyInfluencerTier,
  getStrategicCPM,
  getReachRate,
  getTierLabel,
  enrichInfluencersWithTiers
} from '../lib/tiered-cpm-calculator';
import type { SelectedInfluencer } from '../types';

// Create mock influencers with varying engagement rates
const mockInfluencers: SelectedInfluencer[] = [
  // HIGH-ROI Influencers (≥9% engagement)
  {
    id: '1',
    name: 'Anna Ponsa',
    handle: '@annaponsa',
    platform: 'Instagram',
    profileImage: 'https://example.com/anna.jpg',
    followers: 285000,
    engagement: 13.5, // HIGH-ROI
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
    estimatedReach: 71250, // Will be recalculated by tier system
    estimatedEngagement: 9619,
    costEstimate: 10000
  },
  {
    id: '2',
    name: 'Carlos Mood',
    handle: '@carlosmood',
    platform: 'Instagram',
    profileImage: 'https://example.com/carlos.jpg',
    followers: 420000,
    engagement: 11.2, // HIGH-ROI
    avgViews: 140000,
    demographics: {
      ageRange: '25-40',
      gender: 'Male',
      location: ['Spain'],
      interests: ['Technology', 'Automotive'],
      psychographics: 'Tech enthusiasts'
    },
    contentCategories: ['Technology', 'Automotive'],
    previousBrands: ['Tesla', 'Apple'],
    rateCard: { post: 3500, story: 700, reel: 5000, video: 7000, integration: 10500 },
    performance: {
      averageEngagementRate: 11.2,
      averageReach: 140000,
      audienceGrowthRate: 3.0,
      contentQualityScore: 95
    },
    rationale: 'High engagement tech influencer',
    proposedContent: ['Reel', '2x Posts', '3x Stories'],
    estimatedReach: 105000,
    estimatedEngagement: 11760,
    costEstimate: 14000
  },
  {
    id: '3',
    name: 'Maria Tech',
    handle: '@mariatech',
    platform: 'Instagram',
    followers: 195000,
    engagement: 15.8, // HIGH-ROI
    avgViews: 75000,
    demographics: {
      ageRange: '22-35',
      gender: 'Female',
      location: ['Spain'],
      interests: ['Technology', 'Innovation'],
      psychographics: 'Early adopters'
    },
    contentCategories: ['Technology', 'Innovation'],
    previousBrands: ['Google', 'Samsung'],
    rateCard: { post: 2000, story: 400, reel: 3000, video: 4000, integration: 6000 },
    performance: {
      averageEngagementRate: 15.8,
      averageReach: 75000,
      audienceGrowthRate: 4.2,
      contentQualityScore: 98
    },
    rationale: 'Exceptional engagement rate',
    proposedContent: ['Reel', '2x Posts', '3x Stories'],
    estimatedReach: 48750,
    estimatedEngagement: 7703,
    costEstimate: 8000
  },
  {
    id: '4',
    name: 'Javier Auto',
    handle: '@javierauto',
    platform: 'Instagram',
    followers: 320000,
    engagement: 10.1, // HIGH-ROI
    avgViews: 110000,
    demographics: {
      ageRange: '28-42',
      gender: 'Male',
      location: ['Spain'],
      interests: ['Automotive', 'Racing'],
      psychographics: 'Car enthusiasts'
    },
    contentCategories: ['Automotive', 'Racing'],
    previousBrands: ['Audi', 'Porsche'],
    rateCard: { post: 3000, story: 600, reel: 4500, video: 6000, integration: 9000 },
    performance: {
      averageEngagementRate: 10.1,
      averageReach: 110000,
      audienceGrowthRate: 2.8,
      contentQualityScore: 90
    },
    rationale: 'Automotive specialist with high engagement',
    proposedContent: ['Reel', '2x Posts', '3x Stories'],
    estimatedReach: 80000,
    estimatedEngagement: 8080,
    costEstimate: 12000
  },
  {
    id: '5',
    name: 'Laura Urban',
    handle: '@lauraurban',
    platform: 'Instagram',
    followers: 219700,
    engagement: 14.2, // HIGH-ROI
    avgViews: 80000,
    demographics: {
      ageRange: '24-36',
      gender: 'Female',
      location: ['Spain'],
      interests: ['Urban Lifestyle', 'Design'],
      psychographics: 'Creative professionals'
    },
    contentCategories: ['Urban', 'Lifestyle', 'Design'],
    previousBrands: ['IKEA', 'Volvo'],
    rateCard: { post: 2200, story: 450, reel: 3300, video: 4400, integration: 6600 },
    performance: {
      averageEngagementRate: 14.2,
      averageReach: 80000,
      audienceGrowthRate: 3.5,
      contentQualityScore: 94
    },
    rationale: 'Urban lifestyle expert with strong engagement',
    proposedContent: ['Reel', '2x Posts', '3x Stories'],
    estimatedReach: 54925,
    estimatedEngagement: 7799,
    costEstimate: 9000
  },
  
  // HIGH-REACH Influencers (<9% engagement)
  {
    id: '6',
    name: 'Influencer Magazine',
    handle: '@influencermag',
    platform: 'Instagram',
    followers: 450000,
    engagement: 2.8, // HIGH-REACH
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
      averageEngagementRate: 2.8,
      averageReach: 75000,
      audienceGrowthRate: 1.2,
      contentQualityScore: 75
    },
    rationale: 'Large reach but lower engagement',
    proposedContent: ['Reel', '2x Posts', '3x Stories'],
    estimatedReach: 112500,
    estimatedEngagement: 3150,
    costEstimate: 12000
  },
  {
    id: '7',
    name: 'Brand Ambassador',
    handle: '@brandambassador',
    platform: 'Instagram',
    followers: 180000,
    engagement: 4.5, // HIGH-REACH
    avgViews: 45000,
    demographics: {
      ageRange: '20-40',
      gender: 'All',
      location: ['Spain'],
      interests: ['Brands', 'Lifestyle'],
      psychographics: 'Brand conscious'
    },
    contentCategories: ['Lifestyle', 'Brands'],
    previousBrands: ['Multiple brands'],
    rateCard: { post: 1800, story: 350, reel: 2700, video: 3600, integration: 5400 },
    performance: {
      averageEngagementRate: 4.5,
      averageReach: 45000,
      audienceGrowthRate: 1.5,
      contentQualityScore: 78
    },
    rationale: 'Good reach for awareness',
    proposedContent: ['Reel', '2x Posts', '3x Stories'],
    estimatedReach: 45000,
    estimatedEngagement: 2025,
    costEstimate: 7500
  },
  {
    id: '8',
    name: 'Lifestyle Pro',
    handle: '@lifestylepro',
    platform: 'Instagram',
    followers: 67500,
    engagement: 6.2, // HIGH-REACH
    avgViews: 22000,
    demographics: {
      ageRange: '22-38',
      gender: 'All',
      location: ['Spain'],
      interests: ['Lifestyle'],
      psychographics: 'Lifestyle focused'
    },
    contentCategories: ['Lifestyle'],
    previousBrands: ['Various lifestyle brands'],
    rateCard: { post: 800, story: 150, reel: 1200, video: 1600, integration: 2400 },
    performance: {
      averageEngagementRate: 6.2,
      averageReach: 22000,
      audienceGrowthRate: 2.0,
      contentQualityScore: 82
    },
    rationale: 'Moderate engagement',
    proposedContent: ['Reel', '2x Posts', '3x Stories'],
    estimatedReach: 16875,
    estimatedEngagement: 1046,
    costEstimate: 3500
  }
];

async function testTieredCPM() {
  console.log('🧪 Testing Tiered CPM Calculation System (Mock Data)\n');
  console.log('=' .repeat(90));
  
  // Step 1: Test tier classification
  console.log('\n📊 Step 1: Testing Tier Classification:\n');
  console.log('-'.repeat(90));
  
  mockInfluencers.forEach((inf, index) => {
    const tier = classifyInfluencerTier(inf.engagement);
    const cpm = getStrategicCPM(tier);
    const reachRate = getReachRate(tier);
    const label = getTierLabel(tier);
    
    console.log(`${index + 1}. ${inf.name} - ${inf.engagement.toFixed(2)}% engagement`);
    console.log(`   → Classified as: ${tier.toUpperCase()} (${label})`);
    console.log(`   → Strategic CPM: €${cpm.toFixed(2)}`);
    console.log(`   → Reach Rate: ${(reachRate * 100).toFixed(0)}%`);
    console.log();
  });
  
  // Step 2: Enrich influencers with tier data
  console.log('\n📋 Step 2: Enriching Influencers with Tier Data:\n');
  console.log('-'.repeat(90));
  
  const enrichedInfluencers = enrichInfluencersWithTiers(mockInfluencers);
  
  enrichedInfluencers.forEach((inf, index) => {
    console.log(`${index + 1}. ${inf.name}`);
    console.log(`   Followers: ${inf.followers.toLocaleString()}`);
    console.log(`   Engagement: ${inf.engagement.toFixed(2)}%`);
    console.log(`   Tier: ${inf.tier?.toUpperCase()} (${inf.tierLabel})`);
    console.log(`   Strategic CPM: €${inf.strategicCPM?.toFixed(2)}`);
    console.log(`   Reach Rate: ${(inf.reachRate! * 100).toFixed(0)}%`);
    console.log(`   Tier Impressions: ${inf.tierImpressions?.toLocaleString()}`);
    console.log(`   Cost Estimate: €${inf.costEstimate.toLocaleString()}`);
    console.log();
  });
  
  // Step 3: Calculate tiered metrics
  console.log('\n📊 Step 3: Calculating Tiered Campaign Metrics:\n');
  console.log('-'.repeat(90));
  
  const tieredMetrics = calculateTieredMetrics(enrichedInfluencers);
  
  // Display tier breakdown
  console.log('\n🎯 TIER BREAKDOWN:\n');
  tieredMetrics.tiers.forEach(tier => {
    console.log(`\n${tier.tierLabel.toUpperCase()}`);
    console.log(`  Influencers: ${tier.influencers.length}`);
    console.log(`  Total Followers: ${tier.totalFollowers.toLocaleString()}`);
    console.log(`  Avg Engagement: ${tier.avgEngagement.toFixed(2)}%`);
    console.log(`  Estimated Impressions: ${tier.estimatedImpressions.toLocaleString()}`);
    console.log(`  Strategic CPM: €${tier.strategicCPM.toFixed(2)}`);
    console.log(`  Implied Budget: €${tier.impliedBudget.toFixed(2)}`);
    console.log(`  Budget %: ${((tier.impliedBudget / tieredMetrics.totalBudget) * 100).toFixed(1)}%`);
  });
  
  // Display totals
  console.log('\n' + '='.repeat(90));
  console.log('\n💰 CAMPAIGN TOTALS:\n');
  console.log(`  Total Influencers: ${tieredMetrics.totalInfluencers}`);
  console.log(`  Total Followers: ${tieredMetrics.totalFollowers.toLocaleString()}`);
  console.log(`  Total Impressions: ${tieredMetrics.totalImpressions.toLocaleString()}`);
  console.log(`  Blended CPM: €${tieredMetrics.blendedCPM.toFixed(2)}`);
  console.log(`  Total Budget (implied): €${tieredMetrics.totalBudget.toFixed(2)}`);
  console.log(`  High-ROI Focus: ${tieredMetrics.highROIPercentage.toFixed(1)}%`);
  
  // Display formatted table
  console.log('\n' + '='.repeat(90));
  console.log('\n📊 FORMATTED MARKDOWN TABLE:\n');
  console.log(formatTierMetricsTable(tieredMetrics));
  
  // Display recommendations
  console.log('\n' + '='.repeat(90));
  console.log('\n💡 STRATEGIC RECOMMENDATIONS:\n');
  const recommendations = generateTierRecommendations(tieredMetrics);
  recommendations.forEach((rec, i) => {
    console.log(`${i + 1}. ${rec}\n`);
  });
  
  // Step 4: Verify calculations
  console.log('='.repeat(90));
  console.log('\n✅ VERIFICATION CHECKS:\n');
  
  let allPassed = true;
  
  // Check 1: All influencers have tier data
  const allHaveTiers = enrichedInfluencers.every(inf => inf.tier && inf.strategicCPM && inf.tierImpressions);
  console.log(`  1. All influencers classified: ${allHaveTiers ? '✅ PASS' : '❌ FAIL'}`);
  allPassed = allPassed && allHaveTiers;
  
  // Check 2: Correct number of high-ROI influencers
  const highROICount = enrichedInfluencers.filter(inf => inf.tier === 'high-roi').length;
  const expectedHighROI = 5; // From our mock data
  const highROICountCorrect = highROICount === expectedHighROI;
  console.log(`  2. High-ROI influencer count (expected ${expectedHighROI}): ${highROICountCorrect ? '✅ PASS' : '❌ FAIL'} (actual: ${highROICount})`);
  allPassed = allPassed && highROICountCorrect;
  
  // Check 3: Correct number of high-reach influencers
  const highReachCount = enrichedInfluencers.filter(inf => inf.tier === 'high-reach').length;
  const expectedHighReach = 3; // From our mock data
  const highReachCountCorrect = highReachCount === expectedHighReach;
  console.log(`  3. High-Reach influencer count (expected ${expectedHighReach}): ${highReachCountCorrect ? '✅ PASS' : '❌ FAIL'} (actual: ${highReachCount})`);
  allPassed = allPassed && highReachCountCorrect;
  
  // Check 4: Tier impressions match calculated totals
  const sumTierImpressions = enrichedInfluencers.reduce((sum, inf) => sum + (inf.tierImpressions || 0), 0);
  const impressionsMatch = sumTierImpressions === tieredMetrics.totalImpressions;
  console.log(`  4. Impressions total matches: ${impressionsMatch ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`     Sum: ${sumTierImpressions.toLocaleString()}, Calculated: ${tieredMetrics.totalImpressions.toLocaleString()}`);
  allPassed = allPassed && impressionsMatch;
  
  // Check 5: High-ROI influencers have correct CPM
  const highROIInfluencers = enrichedInfluencers.filter(inf => inf.tier === 'high-roi');
  const allHighROIHaveCorrectCPM = highROIInfluencers.every(inf => inf.strategicCPM === 30);
  console.log(`  5. High-ROI influencers have €30 CPM: ${allHighROIHaveCorrectCPM ? '✅ PASS' : '❌ FAIL'}`);
  allPassed = allPassed && allHighROIHaveCorrectCPM;
  
  // Check 6: High-Reach influencers have correct CPM
  const highReachInfluencers = enrichedInfluencers.filter(inf => inf.tier === 'high-reach');
  const allHighReachHaveCorrectCPM = highReachInfluencers.every(inf => inf.strategicCPM === 15);
  console.log(`  6. High-Reach influencers have €15 CPM: ${allHighReachHaveCorrectCPM ? '✅ PASS' : '❌ FAIL'}`);
  allPassed = allPassed && allHighReachHaveCorrectCPM;
  
  // Check 7: High-ROI influencers have 25% reach rate
  const allHighROIHaveCorrectReach = highROIInfluencers.every(inf => inf.reachRate === 0.25);
  console.log(`  7. High-ROI influencers have 25% reach: ${allHighROIHaveCorrectReach ? '✅ PASS' : '❌ FAIL'}`);
  allPassed = allPassed && allHighROIHaveCorrectReach;
  
  // Check 8: High-Reach influencers have 15% reach rate
  const allHighReachHaveCorrectReach = highReachInfluencers.every(inf => inf.reachRate === 0.15);
  console.log(`  8. High-Reach influencers have 15% reach: ${allHighReachHaveCorrectReach ? '✅ PASS' : '❌ FAIL'}`);
  allPassed = allPassed && allHighReachHaveCorrectReach;
  
  // Check 9: Blended CPM calculation is correct
  const calculatedBlendedCPM = (tieredMetrics.totalBudget / tieredMetrics.totalImpressions) * 1000;
  const blendedCPMCorrect = Math.abs(calculatedBlendedCPM - tieredMetrics.blendedCPM) < 0.01;
  console.log(`  9. Blended CPM calculated correctly: ${blendedCPMCorrect ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`     Expected: €${calculatedBlendedCPM.toFixed(2)}, Actual: €${tieredMetrics.blendedCPM.toFixed(2)}`);
  allPassed = allPassed && blendedCPMCorrect;
  
  // Check 10: High-ROI percentage is reasonable
  const highROIPercentageReasonable = tieredMetrics.highROIPercentage > 50 && tieredMetrics.highROIPercentage < 100;
  console.log(` 10. High-ROI percentage is reasonable (50-100%): ${highROIPercentageReasonable ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`     Actual: ${tieredMetrics.highROIPercentage.toFixed(1)}%`);
  allPassed = allPassed && highROIPercentageReasonable;
  
  // Final summary
  console.log('\n' + '='.repeat(90));
  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED! Tiered CPM system is working correctly.\n');
    console.log('Key Results:');
    console.log(`  • ${highROICount} High-ROI influencers (€30 CPM, 25% reach)`);
    console.log(`  • ${highReachCount} High-Reach influencers (€15 CPM, 15% reach)`);
    console.log(`  • ${tieredMetrics.totalImpressions.toLocaleString()} total impressions (realistic projection)`);
    console.log(`  • €${tieredMetrics.blendedCPM.toFixed(2)} blended CPM`);
    console.log(`  • ${tieredMetrics.highROIPercentage.toFixed(0)}% of budget in high-ROI tier`);
    console.log();
  } else {
    console.log('\n⚠️  SOME TESTS FAILED! Please review the output above.\n');
    return false;
  }
  
  return true;
}

// Run the test
testTieredCPM()
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

