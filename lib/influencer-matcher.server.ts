/**
 * Server-Side Influencer Matcher
 * Uses Admin SDK for API routes
 */

import { searchInfluencersServer } from "./influencer-service.server";
import type { ClientBrief, Influencer, SelectedInfluencer } from "@/types";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Google AI for enrichment
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "");
const model = genAI.getGenerativeModel({
  model: process.env.NEXT_PUBLIC_GOOGLE_AI_MODEL || "gemini-2.5-flash",
});

export const matchInfluencersServer = async (
  brief: ClientBrief
): Promise<SelectedInfluencer[]> => {
  try {
    console.log('🔍 [SERVER] Searching Firestore with filters:', {
      platforms: brief.platformPreferences,
      locations: brief.targetDemographics.location,
      contentCategories: brief.contentThemes,
      maxBudget: brief.budget
    });
    
    // Fetch from Firestore using Admin SDK
    const pool = await searchInfluencersServer({
      platforms: brief.platformPreferences,
      locations: brief.targetDemographics.location,
      contentCategories: brief.contentThemes,
      maxBudget: brief.budget > 0 ? brief.budget : undefined,
    }, 200);
    
    console.log(`✅ [SERVER] Fetched ${pool.length} influencers from Firestore`);
    
    // Step 1: Filter influencers by basic criteria
    const filtered = filterByBasicCriteria(brief, pool);
    console.log(`📝 [SERVER] After basic criteria filter: ${filtered.length} influencers`);

    // Step 2: Use LAYAI scoring algorithm to rank best matches
    const ranked = rankInfluencersWithLAYAI(brief, filtered);
    console.log(`📊 [SERVER] After LAYAI ranking: ${ranked.length} influencers`);

    // Step 3: Select optimal mix (macro/micro/nano)
    const selected = selectOptimalMix(ranked, brief.budget);
    console.log(`🎯 [SERVER] After optimal mix selection: ${selected.length} influencers`);

    // Step 4: Generate rationale and projections for each
    const enriched = await enrichSelectedInfluencers(selected, brief);
    console.log(`✨ [SERVER] After enrichment: ${enriched.length} influencers`);

    return enriched;
  } catch (error) {
    console.error("❌ [SERVER] CRITICAL: Error matching influencers:", error);
    throw new Error(`Influencer matching failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const filterByBasicCriteria = (
  brief: ClientBrief,
  pool: Influencer[]
): Influencer[] => {
  return pool.filter(influencer => {
    // Platform match
    const platformMatch = brief.platformPreferences.includes(influencer.platform);
    
    // Location match - bidirectional (location contains filter or vice versa)
    const locationMatch = brief.targetDemographics.location.length === 0 || 
      influencer.demographics.location.some(loc =>
        brief.targetDemographics.location.some(briefLoc =>
          loc.toLowerCase().includes(briefLoc.toLowerCase()) ||
          briefLoc.toLowerCase().includes(loc.toLowerCase())
        )
      );
    
    // Budget feasibility - MORE LENIENT (allow influencers up to budget/2 per influencer)
    const estimatedCost = influencer.rateCard.post * 3;
    const budgetMatch = brief.budget === 0 || estimatedCost <= brief.budget / 2; // More lenient: allow up to half budget per influencer
    
    // Engagement rate threshold - MORE LENIENT
    const engagementMatch = influencer.engagement >= 0.5;

    return platformMatch && locationMatch && budgetMatch && engagementMatch;
  });
};

const rankInfluencersWithLAYAI = (
  brief: ClientBrief,
  influencers: Influencer[]
): Influencer[] => {
  if (influencers.length === 0) return [];

  console.log('🎯 [SERVER] Using LAYAI scoring algorithm for influencer ranking...');

  const scored = influencers.map(influencer => {
    let score = 0;
    const reasons: string[] = [];

    // 1. Content Category Match (0-30 points)
    const categoryMatch = influencer.contentCategories.some(cat =>
      brief.contentThemes.some(theme =>
        cat.toLowerCase().includes(theme.toLowerCase()) ||
        theme.toLowerCase().includes(cat.toLowerCase())
      )
    );
    if (categoryMatch) {
      const matchCount = influencer.contentCategories.filter(cat =>
        brief.contentThemes.some(theme =>
          cat.toLowerCase().includes(theme.toLowerCase())
        )
      ).length;
      const categoryScore = Math.min(30, matchCount * 10);
      score += categoryScore;
      reasons.push(`Strong content match (${matchCount} categories)`);
    } else {
      score += 5;
    }

    // 2. Engagement Quality (0-25 points)
    const engagementScore = Math.min(25, (influencer.engagement / 10) * 25);
    score += engagementScore;
    if (influencer.engagement >= 5) {
      reasons.push(`Excellent engagement (${influencer.engagement}%)`);
    } else if (influencer.engagement >= 3) {
      reasons.push(`Good engagement (${influencer.engagement}%)`);
    }

    // 3. Audience Size & Reach (0-20 points)
    const followerScore = Math.min(20, (influencer.followers / 50000) * 10);
    score += followerScore;

    // 4. Budget Efficiency (0-15 points)
    const cpm = (influencer.rateCard.post / influencer.followers) * 1000;
    const efficiencyScore = Math.max(0, 15 - (cpm / 10));
    score += efficiencyScore;

    // 5. Location Match (0-10 points)
    const locationBonus = influencer.demographics.location.some(loc =>
      brief.targetDemographics.location.includes(loc)
    ) ? 10 : 0;
    score += locationBonus;

    return {
      influencer,
      score: Math.round(score),
      reasons
    };
  });

  scored.sort((a, b) => b.score - a.score);

  console.log(`✅ [SERVER] Scored ${scored.length} influencers using LAYAI algorithm`);
  if (scored.length > 0) {
    console.log(`   Top 3 scores: ${scored.slice(0, 3).map(s => s.score).join(', ')}`);
    console.log(`   Top match: ${scored[0].influencer.name} (${scored[0].score} points)`);
  }

  return scored.map(s => s.influencer);
};

const selectOptimalMix = (
  ranked: Influencer[],
  budget: number
): Influencer[] => {
  if (ranked.length === 0) return [];

  const selected: Influencer[] = [];
  let remainingBudget = budget;

  // Tier definitions
  const macro = ranked.filter(i => i.followers >= 500000);
  const midTier = ranked.filter(i => i.followers >= 100000 && i.followers < 500000);
  const micro = ranked.filter(i => i.followers < 100000);

  // Try to select 1 macro (if budget allows)
  if (macro.length > 0) {
    const macroInfluencer = macro[0];
    const cost = macroInfluencer.rateCard.post * 3;
    if (cost <= remainingBudget * 0.5) {
      selected.push(macroInfluencer);
      remainingBudget -= cost;
    }
  }

  // Select 2-3 mid-tier
  for (let i = 0; i < Math.min(3, midTier.length); i++) {
    const cost = midTier[i].rateCard.post * 3;
    if (cost <= remainingBudget / 2) {
      selected.push(midTier[i]);
      remainingBudget -= cost;
    }
  }

  // Fill with micro influencers
  for (let i = 0; i < micro.length && selected.length < 8; i++) {
    const cost = micro[i].rateCard.post * 3;
    if (cost <= remainingBudget) {
      selected.push(micro[i]);
      remainingBudget -= cost;
    }
  }

  // If we got no one, just take top ranked within budget
  if (selected.length === 0) {
    for (const influencer of ranked) {
      const cost = influencer.rateCard.post * 3;
      if (cost <= budget && selected.length < 5) {
        selected.push(influencer);
      }
    }
  }

  return selected;
};

const enrichSelectedInfluencers = async (
  influencers: Influencer[],
  brief: ClientBrief
): Promise<SelectedInfluencer[]> => {
  const enriched: SelectedInfluencer[] = [];

  for (const influencer of influencers) {
    const costEstimate = (influencer.rateCard.post * 2) + influencer.rateCard.reel + (influencer.rateCard.story * 3);
    const estimatedReach = influencer.followers * 0.35;
    const estimatedEngagement = estimatedReach * (influencer.engagement / 100);

    let rationale = `Strong fit based on audience alignment with ${brief.clientName}'s target demographic and excellent engagement metrics.`;
    
    // Generate AI rationale if possible
    try {
      const result = await model.generateContent(
        `Write a 2-sentence rationale for why ${influencer.name} (@${influencer.handle}) is a great fit for ${brief.clientName}'s campaign. 
        Influencer details: ${influencer.followers.toLocaleString()} followers, ${influencer.engagement}% engagement, categories: ${influencer.contentCategories.join(', ')}.
        Campaign goals: ${brief.campaignGoals.join(', ')}.
        Keep it professional and specific.`
      );
      const text = result.response.text();
      if (text && text.length > 20) {
        rationale = text.trim();
      }
    } catch (error) {
      console.warn(`Could not generate AI rationale for ${influencer.name}`);
    }

    enriched.push({
      ...influencer,
      rationale,
      proposedContent: ["Instagram Reel", "2x Feed Posts", "3x Story Series"],
      estimatedReach,
      estimatedEngagement,
      costEstimate,
      matchScore: 85
    });
  }

  return enriched;
};

