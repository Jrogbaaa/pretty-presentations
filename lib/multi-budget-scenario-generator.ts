/**
 * Multi-Budget Scenario Generator
 * Handles briefs that request multiple budget scenarios (e.g., IKEA: €30k and €50k)
 */

import type { ClientBrief, SelectedInfluencer, BudgetScenario } from "@/types";
import { matchInfluencersServer } from "./influencer-matcher.server";

export interface ScenarioResult {
  scenario: BudgetScenario;
  influencers: SelectedInfluencer[];
  totalCost: number;
  totalReach: number;
  totalEngagement: number;
  summary: string;
}

export interface MultiScenarioComparison {
  scenarios: ScenarioResult[];
  recommendation: string;
  comparison: {
    costDifference: number;
    reachDifference: number;
    influencerCountDifference: number;
    valueAnalysis: string;
  };
}

/**
 * Generate multiple budget scenarios for comparison
 * Example: IKEA wants both €30k and €50k proposals
 */
export const generateMultiBudgetScenarios = async (
  brief: ClientBrief
): Promise<MultiScenarioComparison> => {
  if (!brief.budgetScenarios || brief.budgetScenarios.length < 2) {
    throw new Error('Multi-budget generation requires at least 2 budget scenarios');
  }

  console.log(`💰 [MULTI-BUDGET] Generating ${brief.budgetScenarios.length} budget scenarios...`);

  const scenarioResults: ScenarioResult[] = [];

  for (const scenario of brief.budgetScenarios) {
    console.log(`\n📊 [SCENARIO] ${scenario.name} - €${scenario.amount.toLocaleString()}`);

    // Create a modified brief with this scenario's budget
    const scenarioBrief: ClientBrief = {
      ...brief,
      budget: scenario.amount,
    };

    // Match influencers for this budget
    const influencers = await matchInfluencersServer(scenarioBrief);

    // Calculate totals
    const totalCost = influencers.reduce((sum, inf) => sum + inf.costEstimate, 0);
    const totalReach = influencers.reduce((sum, inf) => sum + inf.estimatedReach, 0);
    const totalEngagement = influencers.reduce((sum, inf) => sum + inf.estimatedEngagement, 0);

    // Generate summary
    const summary = generateScenarioSummary(scenario, influencers, totalCost, totalReach);

    scenarioResults.push({
      scenario,
      influencers,
      totalCost,
      totalReach,
      totalEngagement,
      summary,
    });

    console.log(`   ✅ ${influencers.length} influencers, €${totalCost.toLocaleString()} total, ${totalReach.toLocaleString()} reach`);
  }

  // Generate comparison and recommendation
  const comparison = generateComparison(scenarioResults);
  const recommendation = generateRecommendation(scenarioResults, brief);

  console.log(`\n✅ [MULTI-BUDGET] All scenarios generated successfully`);

  return {
    scenarios: scenarioResults,
    recommendation,
    comparison,
  };
};

/**
 * Generate a summary for a single scenario
 */
const generateScenarioSummary = (
  scenario: BudgetScenario,
  influencers: SelectedInfluencer[],
  totalCost: number,
  totalReach: number
): string => {
  const macro = influencers.filter(inf => inf.followers >= 500000).length;
  const midTier = influencers.filter(inf => inf.followers >= 100000 && inf.followers < 500000).length;
  const micro = influencers.filter(inf => inf.followers < 100000).length;

  const avgEngagement = influencers.reduce((sum, inf) => sum + inf.engagement, 0) / influencers.length;
  const cpm = (totalCost / totalReach) * 1000;

  return `${scenario.name} (€${scenario.amount.toLocaleString()}): ${influencers.length} influencers (${macro} macro, ${midTier} mid-tier, ${micro} micro). Estimated reach: ${totalReach.toLocaleString()}, Avg engagement: ${avgEngagement.toFixed(2)}%, CPM: €${cpm.toFixed(2)}.`;
};

/**
 * Generate comparison between scenarios
 */
const generateComparison = (scenarios: ScenarioResult[]): {
  costDifference: number;
  reachDifference: number;
  influencerCountDifference: number;
  valueAnalysis: string;
} => {
  if (scenarios.length < 2) {
    return {
      costDifference: 0,
      reachDifference: 0,
      influencerCountDifference: 0,
      valueAnalysis: 'Not enough scenarios to compare',
    };
  }

  // Compare first and last scenario (usually smallest and largest budget)
  const low = scenarios[0];
  const high = scenarios[scenarios.length - 1];

  const costDiff = high.totalCost - low.totalCost;
  const reachDiff = high.totalReach - low.totalReach;
  const influencerDiff = high.influencers.length - low.influencers.length;

  const costIncreasePercent = ((costDiff / low.totalCost) * 100).toFixed(1);
  const reachIncreasePercent = ((reachDiff / low.totalReach) * 100).toFixed(1);

  const valueAnalysis = `Increasing budget from €${low.scenario.amount.toLocaleString()} to €${high.scenario.amount.toLocaleString()} (+${costIncreasePercent}%) yields ${reachIncreasePercent}% more reach and ${influencerDiff} additional influencers. ${
    parseFloat(reachIncreasePercent) > parseFloat(costIncreasePercent)
      ? 'Higher budget offers better ROI through access to premium creators.'
      : 'Lower budget offers better cost efficiency per impression.'
  }`;

  return {
    costDifference: costDiff,
    reachDifference: reachDiff,
    influencerCountDifference: influencerDiff,
    valueAnalysis,
  };
};

/**
 * Generate recommendation on which scenario to choose
 */
const generateRecommendation = (
  scenarios: ScenarioResult[],
  brief: ClientBrief
): string => {
  if (scenarios.length === 0) return 'No scenarios available';

  // Analyze campaign goals to determine recommendation
  const hasAwarenessGoal = brief.campaignGoals.some(goal =>
    goal.toLowerCase().includes('awareness') ||
    goal.toLowerCase().includes('reach') ||
    goal.toLowerCase().includes('notoriedad') ||
    goal.toLowerCase().includes('alcance')
  );

  const hasConversionGoal = brief.campaignGoals.some(goal =>
    goal.toLowerCase().includes('conversion') ||
    goal.toLowerCase().includes('sales') ||
    goal.toLowerCase().includes('ventas')
  );

  // Find scenario with best value
  const scenariosWithValue = scenarios.map(s => ({
    ...s,
    cpm: (s.totalCost / s.totalReach) * 1000,
    avgEngagement: s.influencers.reduce((sum, inf) => sum + inf.engagement, 0) / s.influencers.length,
  }));

  if (hasAwarenessGoal) {
    // Prioritize reach
    const bestReach = scenariosWithValue.sort((a, b) => b.totalReach - a.totalReach)[0];
    return `RECOMMENDATION: ${bestReach.scenario.name} (€${bestReach.scenario.amount.toLocaleString()}) - Maximizes reach (${bestReach.totalReach.toLocaleString()}) which aligns with awareness goals. This budget enables access to ${bestReach.influencers.filter(i => i.followers >= 500000).length} macro influencers for maximum visibility.`;
  }

  if (hasConversionGoal) {
    // Prioritize engagement and mid-tier influencers
    const bestEngagement = scenariosWithValue.sort((a, b) => b.avgEngagement - a.avgEngagement)[0];
    return `RECOMMENDATION: ${bestEngagement.scenario.name} (€${bestEngagement.scenario.amount.toLocaleString()}) - Optimizes for engagement (${bestEngagement.avgEngagement.toFixed(2)}% avg) which drives conversions better than pure reach. Focus on quality interactions with highly engaged audiences.`;
  }

  // Default: best CPM efficiency
  const bestCPM = scenariosWithValue.sort((a, b) => a.cpm - b.cpm)[0];
  return `RECOMMENDATION: ${bestCPM.scenario.name} (€${bestCPM.scenario.amount.toLocaleString()}) - Offers best cost efficiency (€${bestCPM.cpm.toFixed(2)} CPM) delivering strong reach at optimal budget. Balanced mix of influencer tiers ensures broad coverage and engagement.`;
};

