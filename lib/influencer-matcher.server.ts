/**
 * Server-Side Influencer Matcher
 * Uses Admin SDK for API routes
 */

import { searchInfluencersServer } from "./influencer-service.server";
import type { ClientBrief, Influencer, SelectedInfluencer } from "@/types";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { matchBrandToInfluencers, getBrandIntelligenceSummary } from "./brand-matcher";

// Initialize Google AI for enrichment (using non-public env var for server-side security)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");
const model = genAI.getGenerativeModel({
  model: process.env.GOOGLE_AI_MODEL || "gemini-2.5-flash",
});

export const matchInfluencersServer = async (
  brief: ClientBrief
): Promise<SelectedInfluencer[]> => {
  try {
    // BRAND INTELLIGENCE INTEGRATION - Enhance brief with brand data if available
    let enhancedBrief = brief;
    let brandSuggestions: string[] = [];
    
    if (brief.clientName && brief.clientName.trim()) {
      console.log(`🔍 [SERVER] Looking up brand intelligence for: ${brief.clientName}`);
      
      try {
        const brandIntelligence = await getBrandIntelligenceSummary(
          brief.clientName,
          brief
        );
        
        if (brandIntelligence.brandFound && brandIntelligence.brandProfile) {
          console.log(`✅ [SERVER] Brand found: ${brandIntelligence.brandProfile.name} (${brandIntelligence.matchQuality} match)`);
          
          // Enhance brief with brand data
          const brandMatch = await matchBrandToInfluencers(
            brief.clientName,
            brief,
            [] // We'll use the influencers after fetching
          );
          
          enhancedBrief = brandMatch.enhancedBrief;
          brandSuggestions = brandMatch.suggestions;
          
          console.log(`📊 [SERVER] Enhanced brief with brand profile:`);
          console.log(`  - Industry: ${brandIntelligence.brandProfile.industry}`);
          console.log(`  - Target Interests: ${brandIntelligence.brandProfile.targetInterests.join(', ')}`);
          console.log(`  - Content Themes: ${brandIntelligence.brandProfile.contentThemes.slice(0, 3).join(', ')}`);
        } else {
          console.log(`⚠️  [SERVER] Brand "${brief.clientName}" not in database. Using brief details only.`);
          brandSuggestions = brandIntelligence.recommendations;
        }
      } catch (brandError) {
        console.warn('⚠️  [SERVER] Brand intelligence lookup failed:', brandError);
        console.log('Continuing with original brief...');
      }
    }
    
    // Use enhanced brief for rest of matching process
    brief = enhancedBrief;
    
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
    }, 500); // Increased from 200 to 500 to ensure we have enough candidates
    
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
  // If pool is empty, return empty
  if (pool.length === 0) {
    console.log('⚠️  [SERVER] Pool is empty, skipping basic criteria filter');
    return [];
  }

  console.log(`🔍 [SERVER] Filtering ${pool.length} influencers with basic criteria...`);
  
  const filtered = pool.filter(influencer => {
    // Platform match (REQUIRED)
    const platformMatch = brief.platformPreferences.includes(influencer.platform);
    if (!platformMatch) {
      return false;
    }
    
    // HARD CONSTRAINT: CPM Limit (Puerto de Indias style)
    if (brief.constraints?.maxCPM) {
      const influencerCPM = (influencer.rateCard.post / influencer.followers) * 1000;
      if (influencerCPM > brief.constraints.maxCPM) {
        console.log(`  ❌ ${influencer.name} exceeds max CPM: €${influencerCPM.toFixed(2)} > €${brief.constraints.maxCPM}`);
        return false; // HARD LIMIT - reject if over
      }
    }
    
    // HARD CONSTRAINT: Follower limits
    if (brief.constraints?.minFollowers && influencer.followers < brief.constraints.minFollowers) {
      return false;
    }
    if (brief.constraints?.maxFollowers && influencer.followers > brief.constraints.maxFollowers) {
      return false;
    }
    
    // HARD CONSTRAINT: Required categories
    if (brief.constraints?.requiredCategories && brief.constraints.requiredCategories.length > 0) {
      const hasRequiredCategory = brief.constraints.requiredCategories.some(required =>
        influencer.contentCategories.some(cat =>
          cat.toLowerCase().includes(required.toLowerCase())
        )
      );
      if (!hasRequiredCategory) {
        return false;
      }
    }
    
    // HARD CONSTRAINT: Excluded categories
    if (brief.constraints?.excludedCategories && brief.constraints.excludedCategories.length > 0) {
      const hasExcludedCategory = brief.constraints.excludedCategories.some(excluded =>
        influencer.contentCategories.some(cat =>
          cat.toLowerCase().includes(excluded.toLowerCase())
        )
      );
      if (hasExcludedCategory) {
        return false;
      }
    }
    
    // HARD CONSTRAINT: Category restrictions (e.g., "must be willing to work with spirits")
    if (brief.constraints?.categoryRestrictions && brief.constraints.categoryRestrictions.length > 0) {
      // Check influencer's category preferences if available
      if (influencer.categoryPreferences?.notWillingToWorkWith) {
        const hasConflict = brief.constraints.categoryRestrictions.some(restriction =>
          influencer.categoryPreferences?.notWillingToWorkWith?.some(notWilling =>
            restriction.toLowerCase().includes(notWilling.toLowerCase()) ||
            notWilling.toLowerCase().includes(restriction.toLowerCase())
          )
        );
        if (hasConflict) {
          console.log(`  ❌ ${influencer.name} has category restriction conflict`);
          return false;
        }
      }
    }
    
    // HARD CONSTRAINT: Event attendance capability (PYD Halloween style)
    if (brief.constraints?.requireEventAttendance) {
      if (influencer.capabilities && !influencer.capabilities.eventAppearances) {
        return false;
      }
    }
    
    // HARD CONSTRAINT: Public speaking capability (Square style)
    if (brief.constraints?.requirePublicSpeaking) {
      if (influencer.capabilities && !influencer.capabilities.publicSpeaking) {
        return false;
      }
    }
    
    // HARD CONSTRAINT: Verification requirement
    if (brief.constraints?.mustHaveVerification) {
      // Check if influencer has verification flag (if we track it)
      // For now, assume high follower count (500k+) implies verification
      if (influencer.followers < 500000) {
        return false;
      }
    }
    
    // Location match - bidirectional (location contains filter or vice versa)
    // If no location specified, skip location filter
    const locationMatch = brief.targetDemographics.location.length === 0 || 
      influencer.demographics.location.some(loc =>
        brief.targetDemographics.location.some(briefLoc =>
          loc.toLowerCase().includes(briefLoc.toLowerCase()) ||
          briefLoc.toLowerCase().includes(loc.toLowerCase())
        )
      );
    
    // Budget feasibility - VERY LENIENT (allow influencers up to full budget per influencer if needed)
    const estimatedCost = influencer.rateCard.post * 3;
    const budgetMatch = brief.budget === 0 || estimatedCost <= brief.budget;
    
    // Engagement rate threshold - VERY LENIENT
    const engagementMatch = influencer.engagement >= 0.3;

    return platformMatch && locationMatch && budgetMatch && engagementMatch;
  });

  console.log(`✅ [SERVER] Basic criteria filter: ${filtered.length} influencers passed (from ${pool.length})`);
  
  // If we filtered out too many, relax location filter
  if (filtered.length < 3 && brief.targetDemographics.location.length > 0) {
    console.log(`⚠️  [SERVER] Only ${filtered.length} influencers passed strict filters. Relaxing location filter...`);
    const relaxed = pool.filter(influencer => {
      const platformMatch = brief.platformPreferences.includes(influencer.platform);
      const estimatedCost = influencer.rateCard.post * 3;
      const budgetMatch = brief.budget === 0 || estimatedCost <= brief.budget;
      const engagementMatch = influencer.engagement >= 0.3;
      return platformMatch && budgetMatch && engagementMatch; // Remove location requirement
    });
    console.log(`✅ [SERVER] Relaxed filter: ${relaxed.length} influencers passed`);
    return relaxed;
  }

  return filtered;
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

  // Try to select 1 macro (if budget allows) - but only use 40% max
  if (macro.length > 0 && selected.length < 3) {
    const macroInfluencer = macro[0];
    // Skip if already selected (check by id or handle) - shouldn't happen but safety check
    if (!selected.some(s => s.id === macroInfluencer.id || s.handle === macroInfluencer.handle)) {
      const cost = macroInfluencer.rateCard.post * 3;
      if (cost <= remainingBudget * 0.4) {
        selected.push(macroInfluencer);
        remainingBudget -= cost;
      }
    }
  }

  // Select mid-tier influencers - MORE LENIENT (just need to fit in remaining budget)
  for (let i = 0; i < midTier.length && selected.length < 8; i++) {
    // Skip if already selected (check by id or handle)
    if (selected.some(s => s.id === midTier[i].id || s.handle === midTier[i].handle)) continue;
    
    const cost = midTier[i].rateCard.post * 3;
    // More lenient: if we have less than 3, allow up to 100% of remaining budget
    // If we have 3+, allow up to 50% of remaining budget
    const maxCost = selected.length < 3 ? remainingBudget : remainingBudget * 0.7;
    if (cost <= maxCost) {
      selected.push(midTier[i]);
      remainingBudget -= cost;
    }
  }

  // Fill with micro influencers - MORE LENIENT
  for (let i = 0; i < micro.length && selected.length < 8; i++) {
    // Skip if already selected (check by id or handle)
    if (selected.some(s => s.id === micro[i].id || s.handle === micro[i].handle)) continue;
    
    const cost = micro[i].rateCard.post * 3;
    // More lenient: if we have less than 3, allow up to 100% of remaining budget
    if (cost <= remainingBudget) {
      selected.push(micro[i]);
      remainingBudget -= cost;
    }
  }

  // CRITICAL: Ensure we always get at least 3 influencers
  // If we have fewer than 3, take top ranked within budget (even if less optimal)
  if (selected.length < 3) {
    console.log(`⚠️  [SERVER] Only ${selected.length} influencers selected. Ensuring minimum of 3...`);
    
    // Calculate what we've already spent
    const spent = selected.reduce((sum, inf) => sum + (inf.rateCard.post * 3), 0);
    const remainingFor3 = budget > 0 ? budget - spent : Infinity;
    const budgetPerRemaining = remainingFor3 > 0 && selected.length < 3
      ? remainingFor3 / (3 - selected.length)
      : remainingFor3;

    console.log(`   Budget remaining: €${remainingFor3.toLocaleString()}, Budget per remaining influencer: €${budgetPerRemaining.toLocaleString()}`);

    // Fill remaining slots with top ranked influencers
    // Try to find influencers that fit within the remaining budget
    for (const influencer of ranked) {
      if (selected.length >= 3) break;
      
      // Skip if already selected (check by id or handle)
      if (selected.some(s => s.id === influencer.id || s.handle === influencer.handle)) continue;
      
      const cost = influencer.rateCard.post * 3;
      
      // If we have budget remaining, check if this influencer fits
      if (budget === 0) {
        // No budget constraint - just add them
        selected.push(influencer);
        remainingBudget -= cost;
        console.log(`   Added ${influencer.name} (€${cost.toLocaleString()}) - no budget constraint`);
      } else if (cost <= remainingFor3) {
        // Check if adding this influencer would still leave room for remaining slots
        const wouldSpend = spent + cost;
        const remainingAfter = budget - wouldSpend;
        const slotsRemaining = 3 - selected.length - 1;
        
        // If we can fit this influencer and still have budget for remaining slots (or it's the last one)
        if (slotsRemaining === 0 || remainingAfter >= 0 || cost <= budgetPerRemaining * 2) {
          selected.push(influencer);
          remainingBudget -= cost;
          console.log(`   Added ${influencer.name} (€${cost.toLocaleString()}) - fits in remaining budget`);
        }
      } else {
        // This influencer is too expensive, but if we still need more and budget allows, try anyway
        // Only if we're desperate (have < 2 influencers and this is our last chance)
        if (selected.length < 2 && cost <= budget * 1.5) {
          selected.push(influencer);
          remainingBudget -= cost;
          console.log(`   Added ${influencer.name} (€${cost.toLocaleString()}) - slightly over budget but needed for minimum`);
        }
      }
    }
    
    // If we STILL don't have 3, be very aggressive - just take top 3 regardless of budget
    if (selected.length < 3 && ranked.length >= 3) {
      console.log(`   ⚠️ Still only ${selected.length} influencers. Taking top 3 regardless of budget...`);
      for (const influencer of ranked) {
        if (selected.length >= 3) break;
        // Skip if already selected (check by id or handle)
        if (selected.some(s => s.id === influencer.id || s.handle === influencer.handle)) continue;
        selected.push(influencer);
        console.log(`   Added ${influencer.name} (€${(influencer.rateCard.post * 3).toLocaleString()}) - final fallback`);
      }
    }
  }

  // Final deduplication pass to ensure no duplicates (by id or handle)
  const uniqueSelected: Influencer[] = [];
  const seenIds = new Set<string>();
  const seenHandles = new Set<string>();
  
  for (const influencer of selected) {
    const id = influencer.id || '';
    const handle = influencer.handle || '';
    
    // Skip if we've already seen this influencer (by id or handle)
    if (seenIds.has(id) || seenHandles.has(handle)) {
      console.log(`   ⚠️ Skipping duplicate: ${influencer.name} (${id || handle})`);
      continue;
    }
    
    uniqueSelected.push(influencer);
    if (id) seenIds.add(id);
    if (handle) seenHandles.add(handle);
  }

  console.log(`✅ [SERVER] Selected ${uniqueSelected.length} unique influencers (target: min 3)`);

  return uniqueSelected;
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

