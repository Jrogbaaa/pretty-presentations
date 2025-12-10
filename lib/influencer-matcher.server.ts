/**
 * Server-Side Influencer Matcher
 * Uses Admin SDK for API routes
 */

import { searchInfluencersServer } from "./influencer-service.server";
import type { ClientBrief, Influencer, SelectedInfluencer, InfluencerRequirements, InfluencerTierRequirement } from "@/types";
import OpenAI from "openai";
import { matchBrandToInfluencers, getBrandIntelligenceSummary } from "./brand-matcher";
import { 
  classifyInfluencerTier, 
  getStrategicCPM, 
  getReachRate, 
  getTierLabel 
} from "./tiered-cpm-calculator";
import { detectCampaignStrategy, formatStrategyExplanation } from "./goal-detector";

// Initialize OpenAI for enrichment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
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
    
    // Fetch from Firestore using Admin SDK with generous pool size
    const pool = await searchInfluencersServer({
      platforms: brief.platformPreferences,
      locations: brief.targetDemographics.location,
      contentCategories: brief.contentThemes,
      maxBudget: brief.budget > 0 ? brief.budget : undefined,
    }, 1000); // Large pool (1000) to maximize selection options for budget utilization
    
    console.log(`✅ [SERVER] Fetched ${pool.length} influencers from Firestore`);
    
    // Step 1: Filter influencers by basic criteria (STRICT)
    let filtered = filterByBasicCriteria(brief, pool, 'strict');
    console.log(`📝 [SERVER] After STRICT criteria filter: ${filtered.length} influencers`);

    // If pool is too small (<10 influencers), try RELAXED filtering
    if (filtered.length < 10) {
      console.log(`⚠️  [SERVER] Pool too small (${filtered.length}), trying RELAXED filtering...`);
      filtered = filterByBasicCriteria(brief, pool, 'relaxed');
      console.log(`📝 [SERVER] After RELAXED criteria filter: ${filtered.length} influencers`);
    }

    // Step 2: Use LAYAI scoring algorithm to rank best matches
    const ranked = rankInfluencersWithLAYAI(brief, filtered);
    console.log(`📊 [SERVER] After LAYAI ranking: ${ranked.length} influencers`);

    // Step 3: Handle multi-phase campaigns (IKEA GREJSIMOJS style)
    if (brief.isMultiPhase && brief.phases && brief.phases.length > 0) {
      console.log(`🎭 [SERVER] Multi-phase campaign detected: ${brief.phases.length} phases`);
      return await handleMultiPhaseCampaign(brief, ranked);
    }

    // Step 3.5: If explicit influencer requirements exist, use requirements-based selection
    // This takes priority over strategy-based selection
    let selected: Influencer[];

    // Debug: Log what we received
    console.log(`🔍 [SERVER] Checking for influencer requirements...`);
    console.log(`   brief.influencerRequirements exists: ${!!brief.influencerRequirements}`);
    if (brief.influencerRequirements) {
      console.log(`   totalCount: ${brief.influencerRequirements.totalCount}`);
      console.log(`   breakdown: ${JSON.stringify(brief.influencerRequirements.breakdown)}`);
    }

    if (brief.influencerRequirements &&
        (brief.influencerRequirements.totalCount ||
         (brief.influencerRequirements.breakdown && brief.influencerRequirements.breakdown.length > 0))) {
      console.log(`📋 [SERVER] ✅ Explicit influencer requirements detected!`);
      console.log(`   Requested: ${brief.influencerRequirements.totalCount} influencers`);
      selected = selectByRequirements(ranked, brief.influencerRequirements, brief.budget, brief);
      console.log(`📋 [SERVER] After requirements-based selection: ${selected.length} influencers`);
    } else {
      // Step 4: Select optimal mix based on campaign strategy (macro/micro/nano)
      const strategy = detectCampaignStrategy(brief);
      console.log(`🎯 [SERVER] Detected campaign strategy: ${strategy.goalType} (nano: ${(strategy.nanoWeight * 100).toFixed(0)}%, micro: ${(strategy.microWeight * 100).toFixed(0)}%, macro: ${(strategy.macroWeight * 100).toFixed(0)}%)`);
      
      selected = selectOptimalMixWithStrategy(ranked, brief.budget, strategy);
      console.log(`🎯 [SERVER] After strategy-based mix selection: ${selected.length} influencers`);
    }

    // Step 5: Ensure geographic distribution if required (Square style)
    if (brief.geographicDistribution?.requireDistribution) {
      selected = ensureGeographicDistribution(brief, selected.length < 10 ? ranked : selected);
      console.log(`📍 [SERVER] After geographic distribution: ${selected.length} influencers`);
    }

    // Step 6: Generate rationale and projections for each
    const enriched = await enrichSelectedInfluencers(selected, brief);
    console.log(`✨ [SERVER] After enrichment: ${enriched.length} influencers`);

    return enriched;
  } catch (error) {
    console.error("❌ [SERVER] CRITICAL: Error matching influencers:", error);
    throw new Error(`Influencer matching failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Handle multi-phase campaigns (IKEA GREJSIMOJS style)
 * Each phase gets different influencers based on tier and budget allocation
 */
const handleMultiPhaseCampaign = async (
  brief: ClientBrief,
  rankedPool: Influencer[]
): Promise<SelectedInfluencer[]> => {
  console.log(`🎭 [MULTI-PHASE] Processing ${brief.phases?.length} phases...`);
  
  if (!brief.phases || brief.phases.length === 0) {
    throw new Error('Multi-phase campaign requires phase definitions');
  }

  const allSelectedInfluencers: SelectedInfluencer[] = [];
  const usedInfluencerIds = new Set<string>();

  for (let i = 0; i < brief.phases.length; i++) {
    const phase = brief.phases[i];
    console.log(`\n📋 [PHASE ${i + 1}] ${phase.name} (${phase.budgetPercentage}% - €${phase.budgetAmount.toLocaleString()})`);
    console.log(`   Tier: ${phase.creatorTier}, Count: ${phase.creatorCount}`);
    console.log(`   Focus: ${phase.contentFocus.join(', ')}`);
    if (phase.constraints && phase.constraints.length > 0) {
      console.log(`   Constraints: ${phase.constraints.join(', ')}`);
    }

    // Filter pool by phase tier
    let phasePool = rankedPool.filter(inf => {
      // Skip if already used in previous phase
      if (usedInfluencerIds.has(inf.id)) return false;

      // Filter by tier
      switch (phase.creatorTier) {
        case 'micro':
          return inf.followers < 100000;
        case 'mid-tier':
          return inf.followers >= 100000 && inf.followers < 500000;
        case 'macro':
          return inf.followers >= 500000;
        case 'mixed':
          return true; // Any tier
        default:
          return true;
      }
    });

    // Filter by phase content focus if specified
    if (phase.contentFocus && phase.contentFocus.length > 0) {
      phasePool = phasePool.filter(inf =>
        phase.contentFocus.some(focus =>
          inf.contentCategories.some(cat =>
            cat.toLowerCase().includes(focus.toLowerCase()) ||
            focus.toLowerCase().includes(cat.toLowerCase())
          )
        )
      );
    }

    console.log(`   Available pool after filtering: ${phasePool.length} influencers`);

    // Select influencers for this phase
    // Use strategy-based selection for multi-phase campaigns too
    const phaseStrategy = detectCampaignStrategy(brief);
    const phaseSelected = selectOptimalMixWithStrategy(phasePool, phase.budgetAmount, phaseStrategy);
    
    // Ensure we get the requested count (or close to it)
    const finalPhaseSelection = phaseSelected.slice(0, phase.creatorCount);
    
    console.log(`   ✅ Selected ${finalPhaseSelection.length} influencers for Phase ${i + 1}`);

    // Mark as used
    finalPhaseSelection.forEach(inf => usedInfluencerIds.add(inf.id));

    // Enrich with phase-specific information
    const enrichedPhase = await enrichSelectedInfluencers(finalPhaseSelection, brief);
    
    // Add phase information to rationale
    enrichedPhase.forEach(inf => {
      inf.rationale = `[${phase.name}] ${inf.rationale}`;
      // Add phase constraints to proposed content if any
      if (phase.constraints && phase.constraints.length > 0) {
        inf.proposedContent = [
          ...inf.proposedContent,
          `⚠️ Constraints: ${phase.constraints.join(', ')}`
        ];
      }
    });

    allSelectedInfluencers.push(...enrichedPhase);
  }

  console.log(`\n✅ [MULTI-PHASE] Total selected across all phases: ${allSelectedInfluencers.length} influencers`);
  console.log(`   Phase breakdown: ${brief.phases.map((p, i) => 
    `Phase ${i + 1}: ${allSelectedInfluencers.filter(inf => inf.rationale.includes(p.name)).length}`
  ).join(', ')}`);

  return allSelectedInfluencers;
};

const filterByBasicCriteria = (
  brief: ClientBrief,
  pool: Influencer[],
  mode: 'strict' | 'relaxed' = 'strict'
): Influencer[] => {
  // If pool is empty, return empty
  if (pool.length === 0) {
    console.log('⚠️  [SERVER] Pool is empty, skipping basic criteria filter');
    return [];
  }

  console.log(`🔍 [SERVER] Filtering ${pool.length} influencers with ${mode.toUpperCase()} criteria...`);
  
  const filtered = pool.filter(influencer => {
    // Platform match (ALWAYS REQUIRED)
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
    
    // Location match - STRICT: Must match, RELAXED: Optional (just gives bonus in ranking)
    const locationMatch = mode === 'relaxed' || 
      brief.targetDemographics.location.length === 0 || 
      influencer.demographics.location.some(loc =>
        brief.targetDemographics.location.some(briefLoc =>
          loc.toLowerCase().includes(briefLoc.toLowerCase()) ||
          briefLoc.toLowerCase().includes(loc.toLowerCase())
        )
      );
    
    // Budget feasibility - Always check (allow influencers up to full budget per influencer)
    const estimatedCost = influencer.rateCard.post * 3;
    const budgetMatch = brief.budget === 0 || estimatedCost <= brief.budget;
    
    // Engagement rate threshold - STRICT: 0.3%, RELAXED: No minimum
    const engagementMatch = mode === 'relaxed' || influencer.engagement >= 0.3;

    return platformMatch && locationMatch && budgetMatch && engagementMatch;
  });

  console.log(`✅ [SERVER] ${mode.toUpperCase()} filter: ${filtered.length} influencers passed (from ${pool.length})`);

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

/**
 * Ensure geographic distribution of influencers across required cities
 * Example: Square needs profiles distributed across Madrid, Barcelona, Sevilla, Valencia
 */
const ensureGeographicDistribution = (
  brief: ClientBrief,
  influencers: Influencer[]
): Influencer[] => {
  if (!brief.geographicDistribution?.requireDistribution) {
    return influencers; // No distribution requirement
  }

  const { cities, coreCities, minPerCity, maxPerCity } = brief.geographicDistribution;
  
  // Safety check: cities must be defined for geographic distribution
  if (!cities || cities.length === 0) {
    console.warn('⚠️  [SERVER] Geographic distribution requested but no cities specified. Returning all influencers.');
    return influencers;
  }
  
  console.log(`📍 [SERVER] Ensuring geographic distribution across: ${cities.join(', ')}`);
  if (coreCities && coreCities.length > 0) {
    console.log(`   Core cities (priority): ${coreCities.join(', ')}`);
  }

  // Group influencers by city
  const influencersByCity: Record<string, Influencer[]> = {};
  
  for (const city of cities) {
    influencersByCity[city] = influencers.filter(inf =>
      inf.demographics.location.some(loc =>
        loc.toLowerCase().includes(city.toLowerCase()) ||
        city.toLowerCase().includes(loc.toLowerCase())
      )
    );
  }

  // Log distribution
  for (const city of cities) {
    console.log(`   ${city}: ${influencersByCity[city].length} candidates`);
  }

  // Select influencers ensuring distribution
  const selected: Influencer[] = [];
  const selectedIds = new Set<string>();

  // STEP 1: Ensure at least minPerCity from each city (or 1 if not specified)
  const minRequired = minPerCity || 1;
  for (const city of cities) {
    const cityInfluencers = influencersByCity[city];
    const toSelect = Math.min(minRequired, cityInfluencers.length);
    
    for (let i = 0; i < toSelect && i < cityInfluencers.length; i++) {
      const inf = cityInfluencers[i];
      if (!selectedIds.has(inf.id)) {
        selected.push(inf);
        selectedIds.add(inf.id);
      }
    }
  }

  console.log(`   Step 1: Selected ${selected.length} ensuring minimum per city`);

  // STEP 2: Prioritize core cities if specified
  if (coreCities && coreCities.length > 0) {
    for (const coreCity of coreCities) {
      const cityInfluencers = influencersByCity[coreCity] || [];
      const currentCount = selected.filter(inf =>
        inf.demographics.location.some(loc =>
          loc.toLowerCase().includes(coreCity.toLowerCase())
        )
      ).length;

      // Add one more from core city if we can
      if (currentCount < 2 && cityInfluencers.length > currentCount) {
        const next = cityInfluencers.find(inf => !selectedIds.has(inf.id));
        if (next) {
          selected.push(next);
          selectedIds.add(next.id);
        }
      }
    }
    console.log(`   Step 2: After prioritizing core cities: ${selected.length}`);
  }

  // STEP 3: Fill remaining slots evenly across cities
  const remainingInfluencers = influencers.filter(inf => !selectedIds.has(inf.id));
  const maxPerCityLimit = maxPerCity || Math.ceil((influencers.length) / cities.length);

  for (const inf of remainingInfluencers) {
    if (selected.length >= 8) break; // Hard limit
    
    // Check which cities this influencer belongs to
    const influencerCities = cities.filter(city =>
      inf.demographics.location.some(loc =>
        loc.toLowerCase().includes(city.toLowerCase())
      )
    );

    // Check if adding this influencer would violate maxPerCity
    let canAdd = false;
    for (const city of influencerCities) {
      const currentCityCount = selected.filter(s =>
        s.demographics.location.some(loc =>
          loc.toLowerCase().includes(city.toLowerCase())
        )
      ).length;
      
      if (currentCityCount < maxPerCityLimit) {
        canAdd = true;
        break;
      }
    }

    if (canAdd) {
      selected.push(inf);
      selectedIds.add(inf.id);
    }
  }

  console.log(`✅ [SERVER] Geographic distribution result: ${selected.length} influencers`);
  
  // Log final distribution
  for (const city of cities) {
    const count = selected.filter(inf =>
      inf.demographics.location.some(loc =>
        loc.toLowerCase().includes(city.toLowerCase())
      )
    ).length;
    console.log(`   ${city}: ${count} selected`);
  }

  return selected;
};

/**
 * Select optimal influencer mix based on campaign strategy
 * BUDGET-AWARE: Tries to use 80-100% of available budget
 * STRATEGY-AWARE: Prioritizes nano-influencers for sales, macro for awareness
 */
const selectOptimalMixWithStrategy = (
  ranked: Influencer[],
  budget: number,
  strategy: ReturnType<typeof detectCampaignStrategy>
): Influencer[] => {
  if (ranked.length === 0) return [];
  if (budget === 0) return selectOptimalMix(ranked, 0); // Fallback to old logic if no budget

  const selected: Influencer[] = [];
  
  // Define tiers
  const nano = ranked.filter(i => i.followers >= 1000 && i.followers < 50000);
  const micro = ranked.filter(i => i.followers >= 50000 && i.followers < 500000);
  const macro = ranked.filter(i => i.followers >= 500000);
  
  console.log(`📊 [SERVER] Available pool: ${nano.length} nano, ${micro.length} micro, ${macro.length} macro`);
  
  // Calculate budget per tier
  const nanoBudget = budget * strategy.nanoWeight;
  const microBudget = budget * strategy.microWeight;
  const macroBudget = budget * strategy.macroWeight;
  
  // Target: Use 80-100% of total budget
  let totalSpent = 0;
  
  // STEP 1: Fill nano tier (highest priority for sales campaigns)
  console.log(`💫 [SERVER] Selecting nano-influencers (budget: €${nanoBudget.toFixed(0)})`);
  for (const influencer of nano) {
    if (selected.some(s => s.id === influencer.id)) continue;
    
    const cost = influencer.rateCard.post * 3;
    const tierSpent = selected
      .filter(s => s.followers < 50000)
      .reduce((sum, s) => sum + (s.rateCard.post * 3), 0);
    
    // Allow some budget flexibility (±30%) per tier
    if (tierSpent < nanoBudget * 1.3 && totalSpent + cost <= budget) {
      selected.push(influencer);
      totalSpent += cost;
    }
  }
  console.log(`   Selected ${selected.filter(s => s.followers < 50000).length} nano-influencers (€${selected.filter(s => s.followers < 50000).reduce((sum, s) => sum + s.rateCard.post * 3, 0).toFixed(0)})`);
  
  // STEP 2: Fill micro tier
  console.log(`✨ [SERVER] Selecting micro-influencers (budget: €${microBudget.toFixed(0)})`);
  for (const influencer of micro) {
    if (selected.some(s => s.id === influencer.id)) continue;
    
    const cost = influencer.rateCard.post * 3;
    const tierSpent = selected
      .filter(s => s.followers >= 50000 && s.followers < 500000)
      .reduce((sum, s) => sum + (s.rateCard.post * 3), 0);
    
    if (tierSpent < microBudget * 1.3 && totalSpent + cost <= budget) {
      selected.push(influencer);
      totalSpent += cost;
    }
  }
  console.log(`   Selected ${selected.filter(s => s.followers >= 50000 && s.followers < 500000).length} micro-influencers (€${selected.filter(s => s.followers >= 50000 && s.followers < 500000).reduce((sum, s) => sum + s.rateCard.post * 3, 0).toFixed(0)})`);
  
  // STEP 3: Fill macro tier
  console.log(`⭐ [SERVER] Selecting macro-influencers (budget: €${macroBudget.toFixed(0)})`);
  for (const influencer of macro) {
    if (selected.some(s => s.id === influencer.id)) continue;
    
    const cost = influencer.rateCard.post * 3;
    const tierSpent = selected
      .filter(s => s.followers >= 500000)
      .reduce((sum, s) => sum + (s.rateCard.post * 3), 0);
    
    if (tierSpent < macroBudget * 1.3 && totalSpent + cost <= budget) {
      selected.push(influencer);
      totalSpent += cost;
    }
  }
  console.log(`   Selected ${selected.filter(s => s.followers >= 500000).length} macro-influencers (€${selected.filter(s => s.followers >= 500000).reduce((sum, s) => sum + s.rateCard.post * 3, 0).toFixed(0)})`);
  
  // STEP 4: Greedy fill to maximize budget utilization (80-100%)
  const minTargetUtilization = 0.8; // 80%
  const maxTargetUtilization = 0.95; // 95%
  
  if (totalSpent < budget * minTargetUtilization && ranked.length > selected.length) {
    console.log(`📈 [SERVER] Budget under-utilized (${((totalSpent / budget) * 100).toFixed(0)}%). Greedy fill to maximize ROI...`);
    
    // Prioritize by strategy (nano for sales, macro for awareness)
    const remaining = ranked.filter(r => !selected.some(s => s.id === r.id));
    const sortedRemaining = strategy.goalType === 'sales'
      ? remaining.sort((a, b) => a.followers - b.followers) // Smallest first for sales (better ROI)
      : remaining.sort((a, b) => b.followers - a.followers); // Largest first for awareness (max reach)
    
    let addedCount = 0;
    for (const influencer of sortedRemaining) {
      const cost = influencer.rateCard.post * 3;
      if (totalSpent + cost <= budget) {
        selected.push(influencer);
        totalSpent += cost;
        addedCount++;
        console.log(`     + Added ${influencer.name} (@${influencer.handle}, ${influencer.followers.toLocaleString()} followers, €${cost.toFixed(0)}) - Total: €${totalSpent.toFixed(0)} (${((totalSpent/budget)*100).toFixed(0)}%)`);
        
        // Stop when we reach target utilization or run out of budget
        if (totalSpent >= budget * maxTargetUtilization) {
          console.log(`   ✅ Target utilization reached: ${((totalSpent/budget)*100).toFixed(0)}%`);
          break;
        }
      }
    }
    
    if (addedCount > 0) {
      console.log(`   ✅ Greedy fill added ${addedCount} influencers`);
    } else {
      console.log(`   ⚠️  No additional influencers fit within budget`);
    }
  }
  
  const utilizationPercent = ((totalSpent / budget) * 100).toFixed(1);
  console.log(`💰 [SERVER] Final budget utilization: €${totalSpent.toFixed(0)} / €${budget.toFixed(0)} (${utilizationPercent}%)`);
  console.log(`👥 [SERVER] Final selection: ${selected.length} influencers (${selected.filter(s => s.followers < 50000).length} nano, ${selected.filter(s => s.followers >= 50000 && s.followers < 500000).length} micro, ${selected.filter(s => s.followers >= 500000).length} macro)`);
  
  // Warn if budget utilization is low
  if (totalSpent < budget * minTargetUtilization) {
    console.log(`⚠️  [SERVER] Budget utilization below target: ${utilizationPercent}% (target: ${(minTargetUtilization * 100).toFixed(0)}%)`);
    console.log(`   💡 This may indicate limited influencer pool for the specified criteria`);
  }
  
  // Ensure minimum of 2 influencers (lowered from 3 to be less aggressive)
  if (selected.length < 2) {
    console.log(`⚠️  [SERVER] Only ${selected.length} influencers selected. Insufficient pool for campaign.`);
    console.log(`   💡 Consider broadening criteria (location, interests) or increasing budget`);
  }
  
  return selected;
};

/**
 * OLD LOGIC: Kept as fallback
 * Select optimal mix without strategy (legacy behavior)
 */
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

/**
 * Select influencers based on explicit requirements from the brief
 * e.g., "2 macros (1 girl, 1 guy) + 6 mids (3 girls, 3 guys)"
 * 
 * This function prioritizes meeting the exact count requirements
 * over budget optimization, while still respecting budget limits.
 */
const selectByRequirements = (
  ranked: Influencer[],
  requirements: InfluencerRequirements,
  budget: number,
  brief: ClientBrief
): Influencer[] => {
  console.log(`📋 [SERVER] Selecting influencers by EXPLICIT REQUIREMENTS`);
  console.log(`   Total requested: ${requirements.totalCount || 'not specified'}`);
  
  if (requirements.breakdown) {
    requirements.breakdown.forEach(tier => {
      const genderInfo = tier.gender 
        ? ` (${tier.gender.female} female, ${tier.gender.male} male)` 
        : '';
      console.log(`   - ${tier.tier}: ${tier.count}${genderInfo}`);
    });
  }
  
  if (requirements.locationDistribution) {
    console.log(`   Location distribution: ${requirements.locationDistribution.map(l => `${l.city}: ${l.percentage}%`).join(', ')}`);
  }

  const selected: Influencer[] = [];
  const selectedIds = new Set<string>();
  let totalSpent = 0;

  // Helper to check if influencer is in a specific city
  const isInCity = (inf: Influencer, city: string): boolean => {
    return inf.demographics.location.some(loc =>
      loc.toLowerCase().includes(city.toLowerCase()) ||
      city.toLowerCase().includes(loc.toLowerCase())
    );
  };

  // Helper to get influencer tier
  const getInfluencerTier = (inf: Influencer): 'macro' | 'mid' | 'micro' | 'nano' => {
    if (inf.followers >= 500000) return 'macro';
    if (inf.followers >= 100000) return 'mid';
    if (inf.followers >= 10000) return 'micro';
    return 'nano';
  };

  // Process each tier requirement
  if (requirements.breakdown && requirements.breakdown.length > 0) {
    for (const tierReq of requirements.breakdown) {
      console.log(`\n🎯 [SERVER] Selecting ${tierReq.count} ${tierReq.tier} influencers...`);
      
      // Filter pool by tier
      const tierPool = ranked.filter(inf => {
        if (selectedIds.has(inf.id)) return false;
        return getInfluencerTier(inf) === tierReq.tier;
      });
      
      console.log(`   Available ${tierReq.tier} pool: ${tierPool.length} influencers`);

      // If gender requirements exist, separate by gender
      if (tierReq.gender && (tierReq.gender.male > 0 || tierReq.gender.female > 0)) {
        // Note: We don't have gender data in our influencer model currently
        // For now, we'll select based on count only and log that gender wasn't applied
        console.log(`   ⚠️ Gender requirements specified (${tierReq.gender.female}F, ${tierReq.gender.male}M) but gender data not available in database`);
      }

      // If location distribution exists, try to respect it
      if (requirements.locationDistribution && requirements.locationDistribution.length > 0) {
        const totalForTier = tierReq.count;
        
        for (const locReq of requirements.locationDistribution) {
          const countForCity = Math.round((locReq.percentage / 100) * totalForTier);
          const cityPool = tierPool.filter(inf => 
            !selectedIds.has(inf.id) && isInCity(inf, locReq.city)
          );
          
          console.log(`   📍 ${locReq.city}: need ${countForCity}, available ${cityPool.length}`);
          
          let addedForCity = 0;
          for (const inf of cityPool) {
            if (addedForCity >= countForCity) break;
            if (selectedIds.has(inf.id)) continue;
            
            const cost = inf.rateCard.post * 3;
            if (budget > 0 && totalSpent + cost > budget) {
              console.log(`      ⚠️ Skipping ${inf.name} - would exceed budget`);
              continue;
            }
            
            selected.push(inf);
            selectedIds.add(inf.id);
            totalSpent += cost;
            addedForCity++;
            console.log(`      + Added ${inf.name} (@${inf.handle}, ${inf.followers.toLocaleString()} followers, ${locReq.city})`);
          }
        }
      } else {
        // No location distribution - just select by count
        let addedForTier = 0;
        for (const inf of tierPool) {
          if (addedForTier >= tierReq.count) break;
          if (selectedIds.has(inf.id)) continue;
          
          const cost = inf.rateCard.post * 3;
          if (budget > 0 && totalSpent + cost > budget) {
            console.log(`      ⚠️ Skipping ${inf.name} - would exceed budget`);
            continue;
          }
          
          selected.push(inf);
          selectedIds.add(inf.id);
          totalSpent += cost;
          addedForTier++;
          console.log(`      + Added ${inf.name} (@${inf.handle}, ${inf.followers.toLocaleString()} followers)`);
        }
        
        console.log(`   ✅ Selected ${addedForTier}/${tierReq.count} ${tierReq.tier} influencers`);
      }
    }
  } else if (requirements.totalCount) {
    // No breakdown specified, just a total count
    console.log(`\n🎯 [SERVER] Selecting ${requirements.totalCount} influencers (no tier breakdown specified)`);
    
    let added = 0;
    for (const inf of ranked) {
      if (added >= requirements.totalCount) break;
      if (selectedIds.has(inf.id)) continue;
      
      const cost = inf.rateCard.post * 3;
      if (budget > 0 && totalSpent + cost > budget) continue;
      
      selected.push(inf);
      selectedIds.add(inf.id);
      totalSpent += cost;
      added++;
    }
    
    console.log(`   ✅ Selected ${added}/${requirements.totalCount} influencers`);
  }

  // Log final summary
  const macroCount = selected.filter(s => s.followers >= 500000).length;
  const midCount = selected.filter(s => s.followers >= 100000 && s.followers < 500000).length;
  const microCount = selected.filter(s => s.followers >= 10000 && s.followers < 100000).length;
  const nanoCount = selected.filter(s => s.followers < 10000).length;

  console.log(`\n✅ [SERVER] REQUIREMENTS-BASED SELECTION COMPLETE:`);
  console.log(`   Total selected: ${selected.length}/${requirements.totalCount || 'N/A'}`);
  console.log(`   Breakdown: ${macroCount} macro, ${midCount} mid, ${microCount} micro, ${nanoCount} nano`);
  console.log(`   Total budget used: €${totalSpent.toFixed(0)} / €${budget.toFixed(0)} (${budget > 0 ? ((totalSpent/budget)*100).toFixed(1) : 'N/A'}%)`);

  // If we couldn't meet requirements, log a warning
  if (requirements.totalCount && selected.length < requirements.totalCount) {
    console.log(`   ⚠️ WARNING: Could only find ${selected.length} of ${requirements.totalCount} requested influencers`);
    console.log(`   💡 Consider broadening location/category criteria or increasing budget`);
  }

  return selected;
};

const enrichSelectedInfluencers = async (
  influencers: Influencer[],
  brief: ClientBrief
): Promise<SelectedInfluencer[]> => {
  const enriched: SelectedInfluencer[] = [];

  for (const influencer of influencers) {
    // Classify influencer into tier based on engagement
    const tier = classifyInfluencerTier(influencer.engagement);
    const tierLabel = getTierLabel(tier);
    const strategicCPM = getStrategicCPM(tier);
    const reachRate = getReachRate(tier);
    
    // Calculate tier-specific impressions and engagement
    const tierImpressions = Math.round(influencer.followers * reachRate);
    const estimatedReach = tierImpressions; // Use tier-specific reach
    const estimatedEngagement = estimatedReach * (influencer.engagement / 100);
    
    const costEstimate = (influencer.rateCard.post * 2) + influencer.rateCard.reel + (influencer.rateCard.story * 3);

    // Generate a detailed rationale based on available data
    const categoryMatch = influencer.contentCategories.slice(0, 2).join(' and ');
    const engagementLevel = influencer.engagement > 5 ? 'exceptional' : influencer.engagement > 3 ? 'strong' : 'solid';
    const audienceSize = influencer.followers > 100000 ? 'established' : influencer.followers > 50000 ? 'growing' : 'engaged';
    
    let rationale = `${influencer.name} is an excellent fit for ${brief.clientName} with an ${audienceSize} audience of ${influencer.followers.toLocaleString()} followers and ${engagementLevel} engagement (${influencer.engagement}%). `;
    rationale += `Their content focus on ${categoryMatch} aligns perfectly with the campaign's objectives${brief.targetDemographics?.location && brief.targetDemographics.location.length > 0 ? ` and their presence in ${brief.targetDemographics.location[0]} matches the target market` : ''}.`;
    
    // Try to generate AI-enhanced rationale if OpenAI API is configured
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 20) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{
            role: 'user',
            content: `Write a 2-sentence rationale for why ${influencer.name} (@${influencer.handle}) is a great fit for ${brief.clientName}'s campaign. 
Influencer: ${influencer.followers.toLocaleString()} followers, ${influencer.engagement}% engagement, ${influencer.contentCategories.slice(0, 3).join(', ')}.
Campaign goals: ${brief.campaignGoals.join(', ')}.
Keep it professional and specific.`
          }],
          temperature: 0.7,
          max_tokens: 150,
        });
        
        const text = response.choices[0]?.message?.content;
        if (text && text.length > 20) {
          rationale = text.trim();
        }
      } catch (error) {
        // Silently use the fallback rationale - no need to log warnings
        // API might not be configured or have quota issues, which is okay
      }
    }

    enriched.push({
      ...influencer,
      rationale,
      proposedContent: ["Instagram Reel", "2x Feed Posts", "3x Story Series"],
      estimatedReach,
      estimatedEngagement,
      costEstimate,
      matchScore: 85,
      // Tiered performance metrics
      tier,
      tierLabel,
      strategicCPM,
      reachRate,
      tierImpressions,
    });
  }

  return enriched;
};

