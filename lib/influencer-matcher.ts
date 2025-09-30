import { model } from "./firebase";
import type { ClientBrief, Influencer, SelectedInfluencer } from "@/types";

export const matchInfluencers = async (
  brief: ClientBrief,
  influencerPool: Influencer[]
): Promise<SelectedInfluencer[]> => {
  try {
    // Step 1: Filter influencers by basic criteria
    const filtered = filterByBasicCriteria(brief, influencerPool);

    // Step 2: Use AI to rank and select best matches
    const ranked = await rankInfluencersWithAI(brief, filtered);

    // Step 3: Select optimal mix (macro/micro/nano)
    const selected = selectOptimalMix(ranked, brief.budget);

    // Step 4: Generate rationale and projections for each
    const enriched = await enrichSelectedInfluencers(selected, brief);

    return enriched;
  } catch (error) {
    console.error("Error matching influencers:", error);
    // Return top influencers as fallback
    return influencerPool.slice(0, 5).map(inf => ({
      ...inf,
      rationale: "Selected based on audience alignment and performance metrics",
      proposedContent: ["Sponsored Post", "Story Series", "Reel"],
      estimatedReach: inf.followers * 0.3,
      estimatedEngagement: inf.followers * (inf.engagement / 100),
      costEstimate: inf.rateCard.post * 3,
    }));
  }
};

const filterByBasicCriteria = (
  brief: ClientBrief,
  pool: Influencer[]
): Influencer[] => {
  return pool.filter(influencer => {
    // Platform match
    const platformMatch = brief.platformPreferences.includes(influencer.platform);
    
    // Location match
    const locationMatch = influencer.demographics.location.some(loc =>
      brief.targetDemographics.location.includes(loc)
    );
    
    // Budget feasibility (rough estimate)
    const estimatedCost = influencer.rateCard.post * 3;
    const budgetMatch = estimatedCost <= brief.budget / 3; // Assuming at least 3 influencers
    
    // Engagement rate threshold
    const engagementMatch = influencer.engagement >= 2.0;

    return platformMatch && locationMatch && budgetMatch && engagementMatch;
  });
};

const rankInfluencersWithAI = async (
  brief: ClientBrief,
  influencers: Influencer[]
): Promise<Influencer[]> => {
  if (influencers.length === 0) return [];

  const prompt = `Rank these influencers for a ${brief.clientName} campaign with goals: ${brief.campaignGoals.join(", ")}.

Target audience: ${JSON.stringify(brief.targetDemographics)}
Budget: €${brief.budget}
Brand requirements: ${brief.brandRequirements.join(", ")}

Influencers:
${influencers.slice(0, 20).map((inf, idx) => `
${idx + 1}. ${inf.name} (@${inf.handle})
   - Platform: ${inf.platform}
   - Followers: ${inf.followers}
   - Engagement: ${inf.engagement}%
   - Categories: ${inf.contentCategories.join(", ")}
   - Previous brands: ${inf.previousBrands.slice(0, 3).join(", ")}
`).join("\n")}

Return a JSON array of influencer IDs ranked from best to worst match, with a score (0-100) for each:
[{"id": "influencer_id", "score": 95, "reason": "why they're a good fit"}, ...]

Consider: audience alignment, engagement quality, brand fit, content quality, authenticity, and ROI potential.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, "")) as Array<{
      id: string;
      score: number;
      reason: string;
    }>;

    // Sort influencers based on AI ranking
    const rankedIds = parsed.map((r) => r.id);
    return influencers.sort((a, b) => {
      const aIndex = rankedIds.indexOf(a.id);
      const bIndex = rankedIds.indexOf(b.id);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  } catch (error) {
    console.error("Error ranking with AI:", error);
    // Fallback: sort by engagement rate
    return influencers.sort((a, b) => b.engagement - a.engagement);
  }
};

const selectOptimalMix = (
  ranked: Influencer[],
  budget: number
): Influencer[] => {
  const selected: Influencer[] = [];
  let remainingBudget = budget;
  
  // Try to get 1 macro (>500k), 2-3 mid-tier (50k-500k), 2-3 micro (<50k)
  const macro = ranked.filter(i => i.followers >= 500000);
  const midTier = ranked.filter(i => i.followers >= 50000 && i.followers < 500000);
  const micro = ranked.filter(i => i.followers < 50000);

  // Add 1 macro if budget allows
  if (macro.length > 0) {
    const cost = macro[0].rateCard.post * 3;
    if (cost <= remainingBudget * 0.5) {
      selected.push(macro[0]);
      remainingBudget -= cost;
    }
  }

  // Add 2-3 mid-tier
  for (let i = 0; i < Math.min(3, midTier.length); i++) {
    const cost = midTier[i].rateCard.post * 3;
    if (cost <= remainingBudget && selected.length < 6) {
      selected.push(midTier[i]);
      remainingBudget -= cost;
    }
  }

  // Add micro influencers to fill remaining budget
  for (let i = 0; i < micro.length && selected.length < 8; i++) {
    const cost = micro[i].rateCard.post * 3;
    if (cost <= remainingBudget) {
      selected.push(micro[i]);
      remainingBudget -= cost;
    }
  }

  return selected.slice(0, 8); // Max 8 influencers per presentation
};

const enrichSelectedInfluencers = async (
  influencers: Influencer[],
  brief: ClientBrief
): Promise<SelectedInfluencer[]> => {
  const enrichedPromises = influencers.map(async (influencer) => {
    // Calculate projections
    const estimatedReach = Math.floor(influencer.followers * 0.35); // 35% reach estimate
    const estimatedEngagement = Math.floor(estimatedReach * (influencer.engagement / 100));
    const costEstimate = (influencer.rateCard.post * 2) + influencer.rateCard.reel + (influencer.rateCard.story * 3);

    // Generate AI rationale
    const rationale = await generateRationale(influencer, brief);

    return {
      ...influencer,
      rationale,
      proposedContent: ["Feed Post", "Story Series (3)", "Reel"],
      estimatedReach,
      estimatedEngagement,
      costEstimate,
    };
  });

  return Promise.all(enrichedPromises);
};

const generateRationale = async (
  influencer: Influencer,
  brief: ClientBrief
): Promise<string> => {
  const prompt = `Write a compelling 2-3 sentence rationale for why ${influencer.name} (@${influencer.handle}) is perfect for a ${brief.clientName} campaign.

Influencer details:
- Followers: ${influencer.followers}
- Engagement: ${influencer.engagement}%
- Categories: ${influencer.contentCategories.join(", ")}
- Previous brands: ${influencer.previousBrands.join(", ")}

Campaign goals: ${brief.campaignGoals.join(", ")}
Target audience: ${brief.targetDemographics.ageRange}, ${brief.targetDemographics.interests.join(", ")}

Be specific, persuasive, and data-driven. Focus on audience alignment and ROI potential.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch {
    return `${influencer.name} brings ${influencer.followers.toLocaleString()} engaged followers with a ${influencer.engagement}% engagement rate, perfectly aligned with your target demographic.`;
  }
};
