import { model } from "./firebase";
import { searchInfluencers } from "./influencer-service";
import { matchBrandToInfluencers, getBrandIntelligenceSummary } from "./brand-matcher";
import type { ClientBrief, Influencer, SelectedInfluencer } from "@/types";

export const matchInfluencers = async (
  brief: ClientBrief,
  influencerPool?: Influencer[]
): Promise<SelectedInfluencer[]> => {
  try {
    // ========================================
    // BRAND INTELLIGENCE INTEGRATION
    // ========================================
    // Enhance brief with brand profile data if clientName is provided
    let enhancedBrief = brief;
    let brandSuggestions: string[] = [];
    
    if (brief.clientName && brief.clientName.trim()) {
      console.log(`🔍 Looking up brand intelligence for: ${brief.clientName}`);
      
      try {
        const brandIntelligence = await getBrandIntelligenceSummary(
          brief.clientName,
          brief
        );
        
        if (brandIntelligence.brandFound && brandIntelligence.brandProfile) {
          console.log(`✅ Brand found: ${brandIntelligence.brandProfile.name} (${brandIntelligence.matchQuality} match)`);
          
          // Enhance brief with brand data
          const brandMatch = await matchBrandToInfluencers(
            brief.clientName,
            brief,
            [] // We'll use the influencers after fetching
          );
          
          enhancedBrief = brandMatch.enhancedBrief;
          brandSuggestions = brandMatch.suggestions;
          
          console.log(`📊 Enhanced brief with brand profile:`);
          console.log(`  - Industry: ${brandIntelligence.brandProfile.industry}`);
          console.log(`  - Target Interests: ${brandIntelligence.brandProfile.targetInterests.join(', ')}`);
          console.log(`  - Content Themes: ${brandIntelligence.brandProfile.contentThemes.slice(0, 3).join(', ')}`);
        } else {
          console.log(`⚠️  Brand "${brief.clientName}" not in database. Using brief details only.`);
          brandSuggestions = brandIntelligence.recommendations;
        }
      } catch (brandError) {
        console.warn('⚠️  Brand intelligence lookup failed:', brandError);
        console.log('Continuing with original brief...');
      }
    }
    
    // Use enhanced brief for rest of matching process
    brief = enhancedBrief;
    
    // Use provided pool or fetch from Firestore
    let pool = influencerPool;
    
    if (!pool || pool.length === 0) {
      try {
        console.log('🔍 Searching Firestore with filters:', {
          platforms: brief.platformPreferences,
          locations: brief.targetDemographics.location,
          contentCategories: brief.contentThemes,
          maxBudget: brief.budget
        });
        
        // Try to fetch from Firestore with comprehensive filters
        pool = await searchInfluencers({
          platforms: brief.platformPreferences,
          locations: brief.targetDemographics.location,
          contentCategories: brief.contentThemes, // Match content themes to influencer categories
          maxBudget: brief.budget > 0 ? brief.budget : undefined, // Don't filter by budget if 0
        }, 200);
        
        console.log(`✅ Fetched ${pool.length} influencers from Firestore`);
      } catch (error) {
        console.error('⚠️  Firestore query failed, retrying...', error);
        // Retry once before failing
        try {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
          pool = await searchInfluencers({
            platforms: brief.platformPreferences,
            locations: brief.targetDemographics.location,
            contentCategories: brief.contentThemes,
            maxBudget: brief.budget > 0 ? brief.budget : undefined, // Don't filter by budget if 0
          }, 200);
          console.log('✅ Retry successful, fetched influencers from database');
        } catch (retryError) {
          console.error('❌ CRITICAL: Unable to fetch influencers after retry:', retryError);
          throw new Error('Unable to connect to influencer database. Please check your Firebase configuration and try again.');
        }
      }
    }
    
    // Step 1: Filter influencers by basic criteria
    const filtered = filterByBasicCriteria(brief, pool);
    console.log(`📝 After basic criteria filter: ${filtered.length} influencers`);

    // Step 2: Use LAYAI scoring algorithm to rank best matches
    const ranked = rankInfluencersWithLAYAI(brief, filtered);
    console.log(`📊 After LAYAI ranking: ${ranked.length} influencers`);

    // Step 3: Select optimal mix (macro/micro/nano)
    const selected = selectOptimalMix(ranked, brief.budget);
    console.log(`🎯 After optimal mix selection: ${selected.length} influencers`);

    // Step 4: Generate rationale and projections for each
    const enriched = await enrichSelectedInfluencers(selected, brief);
    console.log(`✨ After enrichment: ${enriched.length} influencers`);

    return enriched;
  } catch (error) {
    console.error("❌ CRITICAL: Error matching influencers:", error);
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
    
    // Location match
    const locationMatch = influencer.demographics.location.some(loc =>
      brief.targetDemographics.location.includes(loc)
    );
    
    // Budget feasibility (rough estimate)
    const estimatedCost = influencer.rateCard.post * 3;
    const budgetMatch = estimatedCost <= brief.budget / 3; // Assuming at least 3 influencers
    
    // Engagement rate threshold - MORE LENIENT (was 2.0, now 0.5)
    // Many legitimate influencers have engagement < 2% (magazines, brands, large accounts)
    const engagementMatch = influencer.engagement >= 0.5;

    return platformMatch && locationMatch && budgetMatch && engagementMatch;
  });
};

/**
 * LAYAI-Based Scoring Algorithm
 * Replaces Gemini AI ranking with proven LAYAI matching logic
 * Based on: https://github.com/Jrogbaaa/LAYAI
 */
const rankInfluencersWithLAYAI = (
  brief: ClientBrief,
  influencers: Influencer[]
): Influencer[] => {
  if (influencers.length === 0) return [];

  console.log('🎯 Using LAYAI scoring algorithm for influencer ranking...');

  // Score each influencer based on LAYAI's proven criteria
  const scored = influencers.map(influencer => {
    let score = 0;
    const reasons: string[] = [];

    // 1. Content Category Match (0-30 points) - MOST IMPORTANT
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
      score += 5; // Partial credit for being in the pool
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
    const followerScore = 
      influencer.followers >= 1000000 ? 20 : // Mega: Max reach
      influencer.followers >= 500000 ? 18 :  // Macro: High reach
      influencer.followers >= 100000 ? 16 :  // Mid-tier: Balanced
      influencer.followers >= 50000 ? 14 :   // Micro: Good engagement
      influencer.followers >= 10000 ? 10 : 5; // Nano: High authenticity
    score += followerScore;

    // 4. Location Match (0-15 points)
    const locationMatch = brief.targetDemographics.location.some(loc =>
      influencer.demographics.location.some(infLoc =>
        infLoc.toLowerCase().includes(loc.toLowerCase())
      )
    );
    if (locationMatch) {
      score += 15;
      reasons.push('Target location match');
    } else {
      score += 5; // Partial credit
    }

    // 5. Platform Optimization (0-10 points)
    if (brief.platformPreferences.includes(influencer.platform)) {
      score += 10;
    }

    // LAYAI Quality Scoring Factors:

    // 6. Authenticity Score (0-10 points)
    // Real accounts have varied engagement, not exactly round followers
    const hasAuthenticFollowers = influencer.followers % 10000 !== 0;
    if (hasAuthenticFollowers && influencer.engagement > 0) {
      score += 10;
      reasons.push('High authenticity indicators');
    } else if (influencer.engagement > 0) {
      score += 5;
    }

    // 7. Brand Safety (0-10 points)
    // Profiles with complete data are safer bets
    const hasCompleteProfile = 
      influencer.name && 
      influencer.name !== 'Unknown' &&
      influencer.name !== 'NAME' &&
      influencer.contentCategories.length > 0;
    if (hasCompleteProfile) {
      score += 10;
    }

    // 8. ROI Potential (0-10 points)
    // Calculate estimated cost per impression
    const estimatedReach = influencer.followers * 0.35; // Avg reach
    const costPerPost = influencer.rateCard?.post || 0;
    const cpm = costPerPost / (estimatedReach / 1000);
    
    if (cpm < 50) { // Excellent CPM
      score += 10;
      reasons.push('Excellent ROI potential');
    } else if (cpm < 100) { // Good CPM
      score += 7;
    } else if (cpm < 200) { // Fair CPM
      score += 4;
    }

    // 9. Budget Fit (Penalty for being too expensive)
    const estimatedCost = costPerPost * 3; // Assume 3 posts
    const budgetUtilization = estimatedCost / (brief.budget / 3); // Assuming 3-5 influencers
    if (budgetUtilization <= 1) {
      score += 5; // Within budget
    } else if (budgetUtilization <= 1.5) {
      score += 2; // Slightly over
    } else {
      score -= 5; // Too expensive
    }

    return {
      influencer,
      score: Math.round(score),
      reasons: reasons.slice(0, 3) // Top 3 reasons
    };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  console.log(`✅ Scored ${scored.length} influencers using LAYAI algorithm`);
  console.log(`   Top 3 scores: ${scored.slice(0, 3).map(s => s.score).join(', ')}`);
  console.log(`   Top match: ${scored[0].influencer.name} (${scored[0].score} points)`);

  return scored.map(s => s.influencer);
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
    const macroInfluencer = macro[0];
    // Skip if already selected (check by id or handle)
    if (!selected.some(s => s.id === macroInfluencer.id || s.handle === macroInfluencer.handle)) {
      const cost = macroInfluencer.rateCard.post * 3;
      if (cost <= remainingBudget * 0.5) {
        selected.push(macroInfluencer);
        remainingBudget -= cost;
      }
    }
  }

  // Add 2-3 mid-tier
  for (let i = 0; i < Math.min(3, midTier.length); i++) {
    // Skip if already selected (check by id or handle)
    if (selected.some(s => s.id === midTier[i].id || s.handle === midTier[i].handle)) continue;
    
    const cost = midTier[i].rateCard.post * 3;
    if (cost <= remainingBudget && selected.length < 6) {
      selected.push(midTier[i]);
      remainingBudget -= cost;
    }
  }

  // Add micro influencers to fill remaining budget
  for (let i = 0; i < micro.length && selected.length < 8; i++) {
    // Skip if already selected (check by id or handle)
    if (selected.some(s => s.id === micro[i].id || s.handle === micro[i].handle)) continue;
    
    const cost = micro[i].rateCard.post * 3;
    if (cost <= remainingBudget) {
      selected.push(micro[i]);
      remainingBudget -= cost;
    }
  }

  // Final deduplication pass
  const uniqueSelected: Influencer[] = [];
  const seenIds = new Set<string>();
  const seenHandles = new Set<string>();
  
  for (const influencer of selected) {
    const id = influencer.id || '';
    const handle = influencer.handle || '';
    
    if (seenIds.has(id) || seenHandles.has(handle)) continue;
    
    uniqueSelected.push(influencer);
    if (id) seenIds.add(id);
    if (handle) seenHandles.add(handle);
  }

  return uniqueSelected.slice(0, 8); // Max 8 influencers per presentation
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
    const response = result.response;
    return response.text().trim();
  } catch {
    return `${influencer.name} brings ${influencer.followers.toLocaleString()} engaged followers with a ${influencer.engagement}% engagement rate, perfectly aligned with your target demographic.`;
  }
};
