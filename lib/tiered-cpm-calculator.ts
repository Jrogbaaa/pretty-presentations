/**
 * Tiered CPM and Impressions Calculator
 * 
 * Implements evidence-based tiered performance model that segments influencers
 * by engagement rate to provide accurate ROI projections.
 * 
 * Key Principles:
 * - Nano-influencers (high engagement) generate significantly higher ROI
 * - Engagement rate is more important than follower count
 * - Different tiers warrant different CPM rates and reach estimates
 */

import { SelectedInfluencer } from '@/types';

export type InfluencerTier = 'tier-1' | 'tier-2' | 'tier-3';

export interface TieredInfluencer extends SelectedInfluencer {
  tier: InfluencerTier;
  tierLabel: string;
  strategicCPM: number;
  reachRate: number; // Percentage of followers expected to see content
  tierImpressions: number;
}

export interface TierMetrics {
  tier: InfluencerTier;
  tierLabel: string;
  influencers: TieredInfluencer[];
  totalFollowers: number;
  avgEngagement: number;
  estimatedImpressions: number;
  strategicCPM: number;
  impliedBudget: number;
}

export interface TieredCampaignMetrics {
  tiers: TierMetrics[];
  totalInfluencers: number;
  totalFollowers: number;
  totalImpressions: number;
  blendedCPM: number;
  totalBudget: number;
  highROIPercentage: number; // Percentage of budget in high-ROI tier
}

/**
 * Engagement thresholds for tier classification
 * Based on industry research and ROI data
 */
const TIER_THRESHOLDS = {
  TIER_1: 10.0,  // >10% engagement = Tier 1 (High-ROI, Conversion-Drivers)
  TIER_2: 5.0,   // 5-10% engagement = Tier 2 (Mid-Funnel, Connection Builders)
  TIER_3: 0,     // <5% engagement = Tier 3 (Top-Funnel, Awareness)
} as const;

/**
 * Strategic CPM rates per tier (evidence-based pricing)
 * Tier 1: High-intent, conversion-ready impressions
 * Tier 2: Standard value for good influencers
 * Tier 3: Cheap reach for awareness only
 */
const TIER_CPM_RATES = {
  'tier-1': 30.0,  // €25-€35 range, using €30 as standard
  'tier-2': 22.0,  // €20-€25 range, using €22 as standard
  'tier-3': 15.0,  // €15-€18 range, using €15 as standard
} as const;

/**
 * Strategic reach rates per tier
 * High-engagement posts shown to larger percentage of audience
 * Tier 1: Algorithm favors their high-engagement content
 * Tier 2: Solid, healthy reach
 * Tier 3: Smaller fraction of large audience sees content
 */
const TIER_REACH_RATES = {
  'tier-1': 0.35,  // 30-40% range, using 35% as standard
  'tier-2': 0.25,  // 20-25% range, using 25% as standard
  'tier-3': 0.15,  // 10-15% range, using 15% as standard
} as const;

/**
 * Classify an influencer into a strategic tier based on engagement rate
 */
export const classifyInfluencerTier = (engagement: number): InfluencerTier => {
  if (engagement >= TIER_THRESHOLDS.TIER_1) {
    return 'tier-1';
  } else if (engagement >= TIER_THRESHOLDS.TIER_2) {
    return 'tier-2';
  }
  return 'tier-3';
};

/**
 * Get the strategic CPM rate for a tier
 */
export const getStrategicCPM = (tier: InfluencerTier): number => {
  return TIER_CPM_RATES[tier];
};

/**
 * Get the realistic reach rate for a tier
 */
export const getReachRate = (tier: InfluencerTier): number => {
  return TIER_REACH_RATES[tier];
};

/**
 * Get human-readable tier label
 */
export const getTierLabel = (tier: InfluencerTier): string => {
  switch (tier) {
    case 'tier-1':
      return 'Tier 1 (High-ROI, Conversion-Drivers)';
    case 'tier-2':
      return 'Tier 2 (Mid-Funnel, Connection Builders)';
    case 'tier-3':
      return 'Tier 3 (Top-Funnel, Awareness)';
  }
};

/**
 * Enrich influencers with tier information and calculate tier-specific metrics
 */
export const enrichInfluencersWithTiers = (
  influencers: SelectedInfluencer[]
): TieredInfluencer[] => {
  return influencers.map(influencer => {
    const tier = classifyInfluencerTier(influencer.engagement);
    const strategicCPM = getStrategicCPM(tier);
    const reachRate = getReachRate(tier);
    const tierImpressions = Math.round(influencer.followers * reachRate);
    
    return {
      ...influencer,
      tier,
      tierLabel: getTierLabel(tier),
      strategicCPM,
      reachRate,
      tierImpressions,
      // Update estimatedReach to use tier-specific calculation
      estimatedReach: tierImpressions,
    };
  });
};

/**
 * Calculate metrics for a specific tier
 */
const calculateTierMetrics = (
  tier: InfluencerTier,
  influencers: TieredInfluencer[]
): TierMetrics | null => {
  const tierInfluencers = influencers.filter(inf => inf.tier === tier);
  
  if (tierInfluencers.length === 0) {
    return null;
  }
  
  const totalFollowers = tierInfluencers.reduce((sum, inf) => sum + inf.followers, 0);
  const avgEngagement = tierInfluencers.reduce((sum, inf) => sum + inf.engagement, 0) / tierInfluencers.length;
  const estimatedImpressions = tierInfluencers.reduce((sum, inf) => sum + inf.tierImpressions, 0);
  const strategicCPM = getStrategicCPM(tier);
  const impliedBudget = (estimatedImpressions / 1000) * strategicCPM;
  
  return {
    tier,
    tierLabel: getTierLabel(tier),
    influencers: tierInfluencers,
    totalFollowers,
    avgEngagement,
    estimatedImpressions,
    strategicCPM,
    impliedBudget,
  };
};

/**
 * Calculate complete tiered campaign metrics
 */
export const calculateTieredMetrics = (
  influencers: SelectedInfluencer[]
): TieredCampaignMetrics => {
  // Enrich influencers with tier data
  const tieredInfluencers = enrichInfluencersWithTiers(influencers);
  
  // Calculate metrics for each tier
  const tier1Metrics = calculateTierMetrics('tier-1', tieredInfluencers);
  const tier2Metrics = calculateTierMetrics('tier-2', tieredInfluencers);
  const tier3Metrics = calculateTierMetrics('tier-3', tieredInfluencers);
  
  // Collect all tier metrics (filter out null)
  const tiers: TierMetrics[] = [tier1Metrics, tier2Metrics, tier3Metrics].filter(
    (t): t is TierMetrics => t !== null
  );
  
  // Calculate totals
  const totalInfluencers = tieredInfluencers.length;
  const totalFollowers = tieredInfluencers.reduce((sum, inf) => sum + inf.followers, 0);
  const totalImpressions = tiers.reduce((sum, tier) => sum + tier.estimatedImpressions, 0);
  const totalBudget = tiers.reduce((sum, tier) => sum + tier.impliedBudget, 0);
  
  // Calculate blended CPM
  const blendedCPM = totalImpressions > 0 
    ? (totalBudget / totalImpressions) * 1000 
    : 0;
  
  // Calculate Tier 1 + Tier 2 percentage (high-value budget concentration)
  const tier1Budget = tier1Metrics?.impliedBudget || 0;
  const tier2Budget = tier2Metrics?.impliedBudget || 0;
  const highValueBudget = tier1Budget + tier2Budget;
  const highROIPercentage = totalBudget > 0 
    ? (highValueBudget / totalBudget) * 100 
    : 0;
  
  return {
    tiers,
    totalInfluencers,
    totalFollowers,
    totalImpressions,
    blendedCPM,
    totalBudget,
    highROIPercentage,
  };
};

/**
 * Format tier metrics for display in reports
 */
export const formatTierMetricsTable = (metrics: TieredCampaignMetrics): string => {
  const rows = metrics.tiers.map(tier => {
    return `| **${tier.tierLabel}** | ${tier.totalFollowers.toLocaleString()} | **${tier.avgEngagement.toFixed(2)}%** | ~${tier.estimatedImpressions.toLocaleString()} (${(tier.influencers[0]?.reachRate * 100).toFixed(0)}% Rate) | **€${tier.strategicCPM.toFixed(2)}** | **€${tier.impliedBudget.toFixed(2)}** |`;
  }).join('\n');
  
  const totalRow = `| **Total** | ${metrics.totalFollowers.toLocaleString()} | ${(metrics.tiers.reduce((sum, t) => sum + t.avgEngagement * t.influencers.length, 0) / metrics.totalInfluencers).toFixed(2)}% | **~${metrics.totalImpressions.toLocaleString()}** | **€${metrics.blendedCPM.toFixed(2)}** (Blended) | **€${metrics.totalBudget.toFixed(2)}** |`;
  
  return `| Strategic Group | Total Followers | Avg. Engagement | Est. Impressions (Reach) | Strategic CPM (Justified Cost) | Implied Budget |
| :--- | :--- | :--- | :--- | :--- | :--- |
${rows}
${totalRow}`;
};

/**
 * Generate strategic recommendations based on tiered metrics
 */
export const generateTierRecommendations = (metrics: TieredCampaignMetrics): string[] => {
  const recommendations: string[] = [];
  
  const tier1 = metrics.tiers.find(t => t.tier === 'tier-1');
  const tier2 = metrics.tiers.find(t => t.tier === 'tier-2');
  const tier3 = metrics.tiers.find(t => t.tier === 'tier-3');
  
  // Budget concentration insight
  if (tier1 || tier2) {
    const tier1Count = tier1?.influencers.length || 0;
    const tier2Count = tier2?.influencers.length || 0;
    const highValueCount = tier1Count + tier2Count;
    
    recommendations.push(
      `**Strategic Budget Concentration:** ${metrics.highROIPercentage.toFixed(0)}% of the budget is concentrated in Tier 1 and Tier 2 influencers (${highValueCount} influencers with >5% engagement) who are proven to drive conversions and authentic connections.`
    );
  }
  
  // Tier 1 specific insight
  if (tier1 && tier1.influencers.length > 0) {
    recommendations.push(
      `**Tier 1 Premium Value:** ${tier1.influencers.length} high-engagement influencers (>${TIER_THRESHOLDS.TIER_1}% engagement, avg ${tier1.avgEngagement.toFixed(1)}%) deliver ${tier1.estimatedImpressions.toLocaleString()} high-intent impressions at €${tier1.strategicCPM.toFixed(2)} CPM. These are conversion-ready audiences.`
    );
  }
  
  // Tier 2 insight
  if (tier2 && tier2.influencers.length > 0) {
    recommendations.push(
      `**Tier 2 Quality Reach:** ${tier2.influencers.length} mid-funnel influencers (${TIER_THRESHOLDS.TIER_2}-${TIER_THRESHOLDS.TIER_1}% engagement) provide ${tier2.estimatedImpressions.toLocaleString()} quality impressions at €${tier2.strategicCPM.toFixed(2)} CPM, building authentic connections with the target audience.`
    );
  }
  
  // Tier 3 insight (if present)
  if (tier3 && tier3.influencers.length > 0) {
    recommendations.push(
      `**Tier 3 Cost-Effective Awareness:** ${tier3.influencers.length} broad-reach influencers deliver ${tier3.estimatedImpressions.toLocaleString()} awareness impressions at cost-effective €${tier3.strategicCPM.toFixed(2)} CPM.`
    );
  }
  
  // Realistic projections
  recommendations.push(
    `**Evidence-Based Projections:** Total ${metrics.totalImpressions.toLocaleString()} impressions calculated using tier-specific reach rates (Tier 1: 35%, Tier 2: 25%, Tier 3: 15%) based on engagement quality, not inflated vanity metrics.`
  );
  
  return recommendations;
};

