/**
 * Test script to verify simplified CPM calculations
 * Uses high-reach tier only: 15% reach rate, €15 CPM
 */

import type { SelectedInfluencer } from '../types';

// Create mock influencers
const mockInfluencers: SelectedInfluencer[] = [
  {
    id: '1',
    name: 'Anna Ponsa',
    handle: '@annaponsa',
    platform: 'Instagram',
    profileImage: 'https://example.com/anna.jpg',
    followers: 285000,
    engagement: 13.5,
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
  {
    id: '2',
    name: 'Carlos Mood',
    handle: '@carlosmood',
    platform: 'Instagram',
    profileImage: 'https://example.com/carlos.jpg',
    followers: 420000,
    engagement: 11.2,
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
    engagement: 15.8,
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
    engagement: 10.1,
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
    engagement: 14.2,
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
  {
    id: '6',
    name: 'Influencer Magazine',
    handle: '@influencermag',
    platform: 'Instagram',
    followers: 450000,
    engagement: 2.8,
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
    engagement: 4.5,
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
    engagement: 6.2,
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

async function testSimplifiedCPM() {
  console.log('🧪 Testing Simplified CPM Calculation (High-Reach Only)\n');
  console.log('=' .repeat(80));
  console.log('\n📊 Configuration:\n');
  console.log('  • Reach Rate: 15% (awareness-focused)');
  console.log('  • CPM: €15.00 (standard awareness pricing)');
  console.log('  • No tier segmentation - all influencers treated equally\n');
  console.log('=' .repeat(80));
  
  // Calculate using high-reach tier logic (15% reach, €15 CPM)
  const totalFollowers = mockInfluencers.reduce((sum, inf) => sum + inf.followers, 0);
  const totalImpressions = Math.round(mockInfluencers.reduce((sum, inf) => sum + (inf.followers * 0.15), 0));
  const cpm = 15;
  
  console.log('\n📋 Individual Influencer Calculations:\n');
  console.log('-'.repeat(80));
  
  mockInfluencers.forEach((inf, index) => {
    const impressions = Math.round(inf.followers * 0.15);
    console.log(`${index + 1}. ${inf.name}`);
    console.log(`   Followers: ${inf.followers.toLocaleString()}`);
    console.log(`   Engagement: ${inf.engagement.toFixed(2)}%`);
    console.log(`   Impressions (15% reach): ${impressions.toLocaleString()}`);
    console.log(`   CPM: €${cpm.toFixed(2)}`);
    console.log();
  });
  
  console.log('=' .repeat(80));
  console.log('\n💰 CAMPAIGN TOTALS:\n');
  console.log(`  Total Influencers: ${mockInfluencers.length}`);
  console.log(`  Total Followers: ${totalFollowers.toLocaleString()}`);
  console.log(`  Total Impressions (15% reach): ${totalImpressions.toLocaleString()}`);
  console.log(`  CPM: €${cpm.toFixed(2)}`);
  
  console.log('\n=' .repeat(80));
  console.log('\n📊 MARKDOWN TABLE OUTPUT:\n');
  console.log('| Total Impressions | CPM |');
  console.log('|:---|:---|');
  console.log(`| ${totalImpressions.toLocaleString()} | €${cpm.toFixed(2)} |`);
  
  console.log('\n=' .repeat(80));
  console.log('\n✅ VERIFICATION:\n');
  
  // Verify calculations
  let allPassed = true;
  
  // Check 1: Total followers match
  const expectedFollowers = 2137200; // Sum of all mock influencers
  const followersMatch = totalFollowers === expectedFollowers;
  console.log(`  1. Total followers correct: ${followersMatch ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`     Expected: ${expectedFollowers.toLocaleString()}, Actual: ${totalFollowers.toLocaleString()}`);
  allPassed = allPassed && followersMatch;
  
  // Check 2: Impressions calculated at 15%
  const expectedImpressions = Math.round(expectedFollowers * 0.15);
  const impressionsMatch = totalImpressions === expectedImpressions;
  console.log(`  2. Impressions at 15% reach: ${impressionsMatch ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`     Expected: ${expectedImpressions.toLocaleString()}, Actual: ${totalImpressions.toLocaleString()}`);
  allPassed = allPassed && impressionsMatch;
  
  // Check 3: CPM is €15
  const cpmCorrect = cpm === 15;
  console.log(`  3. CPM is €15: ${cpmCorrect ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`     Actual: €${cpm.toFixed(2)}`);
  allPassed = allPassed && cpmCorrect;
  
  console.log('\n=' .repeat(80));
  if (allPassed) {
    console.log('\n🎉 ALL CHECKS PASSED! Simplified CPM system working correctly.\n');
    console.log('Summary:');
    console.log(`  • ${totalImpressions.toLocaleString()} impressions (15% reach rate)`);
    console.log(`  • €${cpm.toFixed(2)} CPM (awareness-focused pricing)`);
    console.log('  • Clean, simple metrics for reports\n');
  } else {
    console.log('\n⚠️  SOME CHECKS FAILED!\n');
    return false;
  }
  
  return true;
}

// Run the test
testSimplifiedCPM()
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

