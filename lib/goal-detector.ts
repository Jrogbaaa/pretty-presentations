/**
 * Goal Detection and Campaign Strategy
 * Detects campaign type (sales vs awareness) and recommends influencer strategy
 */

import type { ClientBrief } from "@/types";

export type CampaignGoalType = 
  | 'sales' // Revenue, conversions, e-commerce
  | 'awareness' // Brand awareness, reach, impressions
  | 'engagement' // Community building, followers
  | 'traffic'; // Website visits, qualified traffic

export interface CampaignStrategy {
  goalType: CampaignGoalType;
  primaryGoals: string[];
  nanoWeight: number; // 0-1, percentage of budget for nano-influencers (1k-50k)
  microWeight: number; // 0-1, percentage of budget for micro-influencers (50k-500k)
  macroWeight: number; // 0-1, percentage of budget for macro-influencers (500k+)
  focusMetric: 'rois' | 'cpm' | 'engagement' | 'reach';
  kpiEmphasis: 'revenue' | 'impressions' | 'engagement';
}

/**
 * Detect if campaign has sales/revenue goals
 */
export const hasSalesGoal = (brief: ClientBrief): boolean => {
  const textToSearch = [
    ...(brief.campaignGoals || []),
    ...(brief.brandRequirements || []),
    brief.additionalNotes || ''
  ].join(' ').toLowerCase();
  
  const salesKeywords = [
    'ventas', 'sales', 'sell', 'vender',
    'conversión', 'conversion', 'convertir',
    'e-commerce', 'ecommerce', 'online store',
    'tienda online', 'compras',
    'revenue', 'ingresos',
    'rois', 'roi',
    'aumentar ventas', 'increase sales',
    'purchase', 'compra'
  ];
  
  return salesKeywords.some(keyword => textToSearch.includes(keyword));
};

/**
 * Detect if campaign has awareness goals
 */
export const hasAwarenessGoal = (brief: ClientBrief): boolean => {
  const textToSearch = [
    ...(brief.campaignGoals || []),
    ...(brief.brandRequirements || []),
    brief.additionalNotes || ''
  ].join(' ').toLowerCase();
  
  const awarenessKeywords = [
    'awareness', 'conocimiento', 'notoriedad',
    'brand awareness', 'conciencia de marca',
    'reach', 'alcance', 'alcanzar',
    'impressions', 'impresiones',
    'visibility', 'visibilidad',
    'positioning', 'posicionamiento',
    'launch', 'lanzamiento'
  ];
  
  return awarenessKeywords.some(keyword => textToSearch.includes(keyword));
};

/**
 * Detect if campaign has traffic goals
 */
export const hasTrafficGoal = (brief: ClientBrief): boolean => {
  const textToSearch = [
    ...(brief.campaignGoals || []),
    ...(brief.brandRequirements || []),
    brief.additionalNotes || ''
  ].join(' ').toLowerCase();
  
  const trafficKeywords = [
    'traffic', 'tráfico',
    'visitas', 'visits',
    'web', 'website', 'site',
    'qualified traffic', 'tráfico cualificado',
    'landing page', 'página de aterrizaje',
    'clicks', 'clics'
  ];
  
  return trafficKeywords.some(keyword => textToSearch.includes(keyword));
};

/**
 * Detect if client is DTC/E-commerce
 */
export const isDTCClient = (brief: ClientBrief): boolean => {
  const textToSearch = [
    ...(brief.campaignGoals || []),
    ...(brief.brandRequirements || []),
    brief.additionalNotes || '',
    brief.clientName || ''
  ].join(' ').toLowerCase();
  
  const dtcKeywords = [
    'e-commerce', 'ecommerce', 'online store',
    'tienda online', 'direct-to-consumer', 'dtc',
    'shopify', 'prestashop', 'woocommerce',
    'online sales', 'ventas online'
  ];
  
  return dtcKeywords.some(keyword => textToSearch.includes(keyword));
};

/**
 * Determine campaign strategy based on goals
 */
export const detectCampaignStrategy = (brief: ClientBrief): CampaignStrategy => {
  const hasSales = hasSalesGoal(brief);
  const hasAwareness = hasAwarenessGoal(brief);
  const hasTraffic = hasTrafficGoal(brief);
  const isDTC = isDTCClient(brief);
  
  // PRIORITY 1: Sales/Revenue Goals (especially for DTC)
  if (hasSales || isDTC) {
    return {
      goalType: 'sales',
      primaryGoals: brief.campaignGoals.filter(g => {
        const lower = g.toLowerCase();
        return lower.includes('ventas') || 
               lower.includes('sales') || 
               lower.includes('conversión') ||
               lower.includes('ecommerce');
      }),
      // Research shows nano-influencers outperform by order of magnitude for sales
      nanoWeight: 0.70,  // 70% to nano (1k-50k followers, high engagement)
      microWeight: 0.20, // 20% to micro (50k-500k, balance)
      macroWeight: 0.10, // 10% to macro (500k+, reach)
      focusMetric: 'rois',
      kpiEmphasis: 'revenue'
    };
  }
  
  // PRIORITY 2: Traffic Goals
  if (hasTraffic) {
    return {
      goalType: 'traffic',
      primaryGoals: brief.campaignGoals.filter(g => {
        const lower = g.toLowerCase();
        return lower.includes('tráfico') || 
               lower.includes('traffic') || 
               lower.includes('web');
      }),
      nanoWeight: 0.50,  // 50% nano for authenticity
      microWeight: 0.35, // 35% micro for reach
      macroWeight: 0.15, // 15% macro for credibility
      focusMetric: 'engagement',
      kpiEmphasis: 'engagement'
    };
  }
  
  // PRIORITY 3: Awareness Goals
  if (hasAwareness) {
    return {
      goalType: 'awareness',
      primaryGoals: brief.campaignGoals.filter(g => {
        const lower = g.toLowerCase();
        return lower.includes('awareness') || 
               lower.includes('alcanzar') || 
               lower.includes('posicion');
      }),
      nanoWeight: 0.30,  // 30% nano for authenticity
      microWeight: 0.40, // 40% micro for balance
      macroWeight: 0.30, // 30% macro for reach
      focusMetric: 'cpm',
      kpiEmphasis: 'impressions'
    };
  }
  
  // DEFAULT: Balanced engagement strategy
  return {
    goalType: 'engagement',
    primaryGoals: brief.campaignGoals,
    nanoWeight: 0.40,
    microWeight: 0.40,
    macroWeight: 0.20,
    focusMetric: 'engagement',
    kpiEmphasis: 'engagement'
  };
};

/**
 * Get recommended number of influencers based on budget and strategy
 */
export const getRecommendedInfluencerCount = (
  budget: number,
  strategy: CampaignStrategy
): { nano: number; micro: number; macro: number } => {
  // Average costs per tier (rough estimates)
  const avgNanoCost = 300;   // €300 per nano-influencer
  const avgMicroCost = 2000;  // €2,000 per micro-influencer
  const avgMacroCost = 8000;  // €8,000 per macro-influencer
  
  // Calculate budget per tier
  const nanoBudget = budget * strategy.nanoWeight;
  const microBudget = budget * strategy.microWeight;
  const macroBudget = budget * strategy.macroWeight;
  
  // Calculate recommended counts
  const nanoCount = Math.floor(nanoBudget / avgNanoCost);
  const microCount = Math.floor(microBudget / avgMicroCost);
  const macroCount = Math.floor(macroBudget / avgMacroCost);
  
  return {
    nano: nanoCount,
    micro: microCount,
    macro: macroCount
  };
};

/**
 * Format strategy explanation for proposals
 */
export const formatStrategyExplanation = (
  strategy: CampaignStrategy,
  brief: ClientBrief
): string => {
  const recommendations = getRecommendedInfluencerCount(brief.budget, strategy);
  const totalCount = recommendations.nano + recommendations.micro + recommendations.macro;
  
  switch (strategy.goalType) {
    case 'sales':
      return `**Sales-Optimized Strategy:** Research shows nano-influencers (${recommendations.nano} recommended) outperform macro-influencers by order of magnitude for e-commerce conversions due to higher trust, authenticity, and engagement rates (12-18% vs 2-4%). This strategy allocates ${(strategy.nanoWeight * 100).toFixed(0)}% of budget to nano-influencers for maximum ROIS.`;
    
    case 'traffic':
      return `**Traffic-Focused Strategy:** Balanced mix of ${totalCount} influencers optimized for driving qualified website visits and maintaining strong engagement throughout the customer journey.`;
    
    case 'awareness':
      return `**Awareness-Focused Strategy:** Strategic mix of ${totalCount} influencers balancing reach (macro) with authenticity (nano/micro) to maximize brand exposure while maintaining credibility.`;
    
    case 'engagement':
      return `**Engagement-Focused Strategy:** Balanced portfolio of ${totalCount} influencers selected for strong community connections and high interaction rates.`;
    
    default:
      return `Strategic mix of ${totalCount} influencers optimized for campaign goals.`;
  }
};

