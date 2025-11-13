/**
 * Revenue-Focused KPI Calculator
 * Calculates ROIS, conversion estimates, and sales impact for e-commerce campaigns
 */

import type { SelectedInfluencer } from "@/types";
import { calculateTieredMetrics } from "./tiered-cpm-calculator";

export interface RevenueMetrics {
  // Traffic Estimates
  totalImpressions: number;
  estimatedClicks: number;
  clickThroughRate: number; // CTR %
  
  // Conversion Estimates
  estimatedConversions: number;
  conversionRate: number; // CVR %
  
  // Revenue Estimates
  averageOrderValue: number; // AOV
  estimatedRevenue: number;
  
  // ROI Metrics
  campaignCost: number;
  rois: number; // Return on Influencer Spend
  revenueMultiplier: number; // e.g., 2.5x
  
  // Engagement
  totalEngagements: number;
  averageEngagementRate: number;
  
  // UGC
  ugcPieces: number;
}

/**
 * Industry-average conversion benchmarks
 */
const CONVERSION_BENCHMARKS = {
  fashion: {
    ctr: 2.5,  // 2.5% click-through rate
    cvr: 3.0,  // 3.0% conversion rate
    aov: 85    // €85 average order value
  },
  beauty: {
    ctr: 3.0,
    cvr: 3.5,
    aov: 65
  },
  lifestyle: {
    ctr: 2.0,
    cvr: 2.5,
    aov: 95
  },
  food: {
    ctr: 2.5,
    cvr: 4.0,
    aov: 45
  },
  tech: {
    ctr: 1.8,
    cvr: 2.0,
    aov: 150
  },
  default: {
    ctr: 2.5,
    cvr: 3.0,
    aov: 85
  }
};

/**
 * Detect industry from brief to use appropriate benchmarks
 */
const detectIndustry = (briefText: string): keyof typeof CONVERSION_BENCHMARKS => {
  const text = briefText.toLowerCase();
  
  if (text.includes('fashion') || text.includes('moda') || text.includes('clothing') || text.includes('apparel')) {
    return 'fashion';
  }
  if (text.includes('beauty') || text.includes('belleza') || text.includes('cosmetics') || text.includes('skincare')) {
    return 'beauty';
  }
  if (text.includes('lifestyle') || text.includes('estilo de vida')) {
    return 'lifestyle';
  }
  if (text.includes('food') || text.includes('comida') || text.includes('gastro')) {
    return 'food';
  }
  if (text.includes('tech') || text.includes('technology') || text.includes('electronics')) {
    return 'tech';
  }
  
  return 'default';
};

/**
 * Calculate revenue-focused metrics for e-commerce campaigns
 */
export const calculateRevenueMetrics = (
  influencers: SelectedInfluencer[],
  campaignCost: number,
  briefContext?: {
    contentThemes?: string[];
    campaignGoals?: string[];
    clientName?: string;
  }
): RevenueMetrics => {
  // Get tiered metrics for impressions
  const tieredMetrics = calculateTieredMetrics(influencers);
  
  // Detect industry for benchmarks
  const briefText = [
    ...(briefContext?.contentThemes || []),
    ...(briefContext?.campaignGoals || []),
    briefContext?.clientName || ''
  ].join(' ');
  
  const industry = detectIndustry(briefText);
  const benchmarks = CONVERSION_BENCHMARKS[industry];
  
  // Calculate traffic estimates
  const totalImpressions = tieredMetrics.totalImpressions;
  const clickThroughRate = benchmarks.ctr;
  const estimatedClicks = Math.round(totalImpressions * (clickThroughRate / 100));
  
  // Calculate conversion estimates
  const conversionRate = benchmarks.cvr;
  const estimatedConversions = Math.round(estimatedClicks * (conversionRate / 100));
  
  // Calculate revenue estimates
  const averageOrderValue = benchmarks.aov;
  const estimatedRevenue = estimatedConversions * averageOrderValue;
  
  // Calculate ROI metrics
  const rois = campaignCost > 0 ? estimatedRevenue / campaignCost : 0;
  const revenueMultiplier = rois;
  
  // Calculate engagement
  const totalEngagements = influencers.reduce((sum, inf) => {
    const engagements = Math.round((inf.followers * (inf.engagement / 100)));
    return sum + engagements;
  }, 0);
  
  const averageEngagementRate = influencers.length > 0
    ? influencers.reduce((sum, inf) => sum + inf.engagement, 0) / influencers.length
    : 0;
  
  // Estimate UGC pieces (each influencer creates 3-5 pieces)
  const ugcPieces = influencers.length * 4; // Average 4 pieces per influencer
  
  return {
    totalImpressions,
    estimatedClicks,
    clickThroughRate,
    estimatedConversions,
    conversionRate,
    averageOrderValue,
    estimatedRevenue,
    campaignCost,
    rois,
    revenueMultiplier,
    totalEngagements,
    averageEngagementRate,
    ugcPieces
  };
};

/**
 * Format revenue metrics for markdown proposals
 */
export const formatRevenueMetrics = (metrics: RevenueMetrics): string => {
  const percentIncrease = ((metrics.rois - 1) * 100).toFixed(0);
  const isPositiveROIS = metrics.rois >= 1.5; // 1.5x considered good
  
  return `
**Revenue-Focused Performance Projections:**

<table>
<tr>
<th>Metric</th>
<th>Estimate</th>
<th>Methodology</th>
</tr>
<tr>
<td><strong>Estimated Clicks</strong></td>
<td>${metrics.estimatedClicks.toLocaleString()}</td>
<td>${metrics.clickThroughRate.toFixed(1)}% CTR (industry benchmark)</td>
</tr>
<tr>
<td><strong>Expected Conversions</strong></td>
<td>${metrics.estimatedConversions}</td>
<td>${metrics.conversionRate.toFixed(1)}% CVR (industry benchmark)</td>
</tr>
<tr>
<td><strong>Projected Revenue</strong></td>
<td><strong>€${metrics.estimatedRevenue.toLocaleString()}</strong></td>
<td>€${metrics.averageOrderValue} avg order value</td>
</tr>
<tr>
<td><strong>ROIS (Return on Influencer Spend)</strong></td>
<td><strong>${metrics.rois.toFixed(1)}x</strong></td>
<td>${isPositiveROIS ? '✅ Strong ROI' : '⚠️ Below 1.5x target'}</td>
</tr>
</table>

**Campaign Investment & Returns:**
- **Campaign Cost:** €${metrics.campaignCost.toLocaleString()}
- **Projected Revenue:** €${metrics.estimatedRevenue.toLocaleString()}
- **Net Return:** €${(metrics.estimatedRevenue - metrics.campaignCost).toLocaleString()}
- **Revenue Increase:** ${percentIncrease}% ${isPositiveROIS ? '(exceeds minimum 30% target)' : '(below target)'}

**Engagement & Content:**
- **Total Engagements:** ${metrics.totalEngagements.toLocaleString()} (${metrics.averageEngagementRate.toFixed(1)}% avg ER)
- **Authentic UGC Pieces:** ${metrics.ugcPieces}+ pieces of user-generated content
- **Total Impressions:** ${metrics.totalImpressions.toLocaleString()}
`;
};

/**
 * Calculate sales increase percentage
 */
export const calculateSalesIncrease = (
  projectedRevenue: number,
  currentRevenue: number
): number => {
  if (currentRevenue === 0) return 0;
  return ((projectedRevenue - currentRevenue) / currentRevenue) * 100;
};

/**
 * Estimate baseline revenue needed to hit target increase
 */
export const estimateBaselineRevenue = (
  targetIncreasePercent: number,
  campaignCost: number,
  expectedROIS: number = 2.0
): number => {
  // If we need 30% increase and ROIS is 2x
  // campaignRevenue = campaignCost * ROIS
  // baselineRevenue * (targetIncrease/100) = campaignRevenue
  // baselineRevenue = (campaignCost * ROIS) / (targetIncrease/100)
  
  const campaignRevenue = campaignCost * expectedROIS;
  const baselineRevenue = campaignRevenue / (targetIncreasePercent / 100);
  
  return baselineRevenue;
};

/**
 * Check if campaign can achieve sales goal
 */
export const canAchieveSalesGoal = (
  targetIncreasePercent: number,
  metrics: RevenueMetrics,
  currentRevenue?: number
): { canAchieve: boolean; reason: string } => {
  // If no current revenue provided, use ROIS as proxy
  if (!currentRevenue) {
    const minROIS = 1.5; // Minimum for healthy campaign
    const targetROIS = 1 + (targetIncreasePercent / 100) / 3; // Rough proxy
    
    if (metrics.rois >= targetROIS) {
      return {
        canAchieve: true,
        reason: `ROIS of ${metrics.rois.toFixed(1)}x suggests campaign will contribute significantly to ${targetIncreasePercent}% sales target`
      };
    } else {
      return {
        canAchieve: false,
        reason: `ROIS of ${metrics.rois.toFixed(1)}x may be insufficient for ${targetIncreasePercent}% sales increase. Consider increasing budget or number of nano-influencers.`
      };
    }
  }
  
  // If current revenue provided, calculate directly
  const projectedIncrease = (metrics.estimatedRevenue / currentRevenue) * 100;
  
  if (projectedIncrease >= targetIncreasePercent * 0.9) { // Within 90% of target
    return {
      canAchieve: true,
      reason: `Campaign projects ${projectedIncrease.toFixed(0)}% sales increase, meeting ${targetIncreasePercent}% target`
    };
  } else {
    return {
      canAchieve: false,
      reason: `Campaign projects ${projectedIncrease.toFixed(0)}% increase, falling short of ${targetIncreasePercent}% target. Recommend increasing budget or influencer count.`
    };
  }
};

