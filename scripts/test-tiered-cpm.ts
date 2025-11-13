/**
 * Test script to verify tiered CPM calculations
 */

import { matchInfluencersServer } from '../lib/influencer-matcher.server';
import { calculateTieredMetrics, formatTierMetricsTable } from '../lib/tiered-cpm-calculator';
import type { ClientBrief, SelectedInfluencer } from '../types';

const testBrief: ClientBrief = {
  clientName: "Renault Test Campaign",
  brandCategory: "Automotive",
  campaignGoals: ["Drive test drive sign-ups", "Generate brand awareness", "Reach automotive enthusiasts"],
  targetDemographics: {
    ageRange: "25-45",
    gender: "All",
    location: ["Spain", "Madrid"],
    interests: ["Automotive", "Technology", "Lifestyle"],
    psychographics: "Tech-savvy urban professionals"
  },
  budget: 15000,
  platformPreferences: ["Instagram", "TikTok"],
  contentThemes: ["Automotive", "Technology", "Lifestyle", "Urban"],
  brandVoice: "Modern, innovative, accessible",
  keyMessages: ["Innovation meets accessibility", "Test drive the future"],
  deliverables: {
    presentations: 1,
    textResponse: false
  },
  campaignDuration: "1 month",
  previousCampaigns: []
};

async function testTieredCPM() {
  console.log('🧪 Testing Tiered CPM Calculation System\n');
  console.log('=' .repeat(80));
  
  try {
    // Step 1: Match influencers
    console.log('\n📊 Step 1: Matching influencers...');
    const influencers: SelectedInfluencer[] = await matchInfluencersServer(testBrief);
    
    console.log(`✅ Matched ${influencers.length} influencers\n`);
    
    // Step 2: Display individual influencer tier classifications
    console.log('📋 Step 2: Individual Influencer Classifications:\n');
    console.log('-'.repeat(80));
    
    influencers.forEach((inf, index) => {
      console.log(`${index + 1}. ${inf.name} (@${inf.handle})`);
      console.log(`   Followers: ${inf.followers.toLocaleString()}`);
      console.log(`   Engagement: ${inf.engagement.toFixed(2)}%`);
      console.log(`   Tier: ${inf.tier?.toUpperCase() || 'NOT CLASSIFIED'} (${inf.tierLabel || 'N/A'})`);
      console.log(`   Strategic CPM: €${inf.strategicCPM?.toFixed(2) || 'N/A'}`);
      console.log(`   Reach Rate: ${inf.reachRate ? (inf.reachRate * 100).toFixed(0) + '%' : 'N/A'}`);
      console.log(`   Tier Impressions: ${inf.tierImpressions?.toLocaleString() || 'N/A'}`);
      console.log(`   Cost Estimate: €${inf.costEstimate.toLocaleString()}`);
      console.log();
    });
    
    // Step 3: Calculate tiered metrics
    console.log('📊 Step 3: Calculating Tiered Campaign Metrics:\n');
    console.log('-'.repeat(80));
    
    const tieredMetrics = calculateTieredMetrics(influencers);
    
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
    console.log('\n' + '='.repeat(80));
    console.log('\n💰 CAMPAIGN TOTALS:\n');
    console.log(`  Total Influencers: ${tieredMetrics.totalInfluencers}`);
    console.log(`  Total Followers: ${tieredMetrics.totalFollowers.toLocaleString()}`);
    console.log(`  Total Impressions: ${tieredMetrics.totalImpressions.toLocaleString()}`);
    console.log(`  Blended CPM: €${tieredMetrics.blendedCPM.toFixed(2)}`);
    console.log(`  Total Budget (implied): €${tieredMetrics.totalBudget.toFixed(2)}`);
    console.log(`  High-ROI Focus: ${tieredMetrics.highROIPercentage.toFixed(1)}%`);
    
    // Display formatted table
    console.log('\n' + '='.repeat(80));
    console.log('\n📊 FORMATTED MARKDOWN TABLE:\n');
    console.log(formatTierMetricsTable(tieredMetrics));
    
    // Step 4: Verify calculations
    console.log('\n' + '='.repeat(80));
    console.log('\n✅ VERIFICATION CHECKS:\n');
    
    // Check 1: All influencers have tier data
    const allHaveTiers = influencers.every(inf => inf.tier && inf.strategicCPM && inf.tierImpressions);
    console.log(`  ✓ All influencers classified: ${allHaveTiers ? '✅ PASS' : '❌ FAIL'}`);
    
    // Check 2: Tier impressions match calculated totals
    const sumTierImpressions = influencers.reduce((sum, inf) => sum + (inf.tierImpressions || 0), 0);
    const impressionsMatch = sumTierImpressions === tieredMetrics.totalImpressions;
    console.log(`  ✓ Impressions total matches: ${impressionsMatch ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`    Sum of tier impressions: ${sumTierImpressions.toLocaleString()}`);
    console.log(`    Calculated total: ${tieredMetrics.totalImpressions.toLocaleString()}`);
    
    // Check 3: High-ROI influencers have correct CPM
    const highROIInfluencers = influencers.filter(inf => inf.tier === 'high-roi');
    const allHighROIHaveCorrectCPM = highROIInfluencers.every(inf => inf.strategicCPM === 30);
    console.log(`  ✓ High-ROI influencers have €30 CPM: ${allHighROIHaveCorrectCPM ? '✅ PASS' : '❌ FAIL'}`);
    
    // Check 4: High-Reach influencers have correct CPM
    const highReachInfluencers = influencers.filter(inf => inf.tier === 'high-reach');
    const allHighReachHaveCorrectCPM = highReachInfluencers.every(inf => inf.strategicCPM === 15);
    console.log(`  ✓ High-Reach influencers have €15 CPM: ${allHighReachHaveCorrectCPM ? '✅ PASS' : '❌ FAIL'}`);
    
    // Check 5: High-ROI influencers have 25% reach rate
    const allHighROIHaveCorrectReach = highROIInfluencers.every(inf => inf.reachRate === 0.25);
    console.log(`  ✓ High-ROI influencers have 25% reach: ${allHighROIHaveCorrectReach ? '✅ PASS' : '❌ FAIL'}`);
    
    // Check 6: High-Reach influencers have 15% reach rate
    const allHighReachHaveCorrectReach = highReachInfluencers.every(inf => inf.reachRate === 0.15);
    console.log(`  ✓ High-Reach influencers have 15% reach: ${allHighReachHaveCorrectReach ? '✅ PASS' : '❌ FAIL'}`);
    
    // Check 7: Blended CPM calculation is correct
    const calculatedBlendedCPM = (tieredMetrics.totalBudget / tieredMetrics.totalImpressions) * 1000;
    const blendedCPMCorrect = Math.abs(calculatedBlendedCPM - tieredMetrics.blendedCPM) < 0.01;
    console.log(`  ✓ Blended CPM calculated correctly: ${blendedCPMCorrect ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`    Expected: €${calculatedBlendedCPM.toFixed(2)}`);
    console.log(`    Actual: €${tieredMetrics.blendedCPM.toFixed(2)}`);
    
    // Final summary
    const allChecksPassed = allHaveTiers && impressionsMatch && allHighROIHaveCorrectCPM && 
                           allHighReachHaveCorrectCPM && allHighROIHaveCorrectReach && 
                           allHighReachHaveCorrectReach && blendedCPMCorrect;
    
    console.log('\n' + '='.repeat(80));
    if (allChecksPassed) {
      console.log('\n🎉 ALL TESTS PASSED! Tiered CPM system is working correctly.\n');
    } else {
      console.log('\n⚠️  SOME TESTS FAILED! Please review the output above.\n');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR during testing:');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testTieredCPM()
  .then(() => {
    console.log('✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });

