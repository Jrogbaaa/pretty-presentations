/**
 * Manual Influencer Matcher
 * Handles matching manually specified influencer names to database entries
 * and creating placeholder entries if not found
 */

import OpenAI from "openai";
import { getAdminDb } from "./firebase-admin";
import type { ClientBrief, Influencer, SelectedInfluencer } from "@/types";
import { logInfo, logError } from "./logger";

/**
 * Extract influencer name and handle from input string
 * Handles formats like: "name", "@handle", "name (@handle)", "name @handle"
 */
const parseInfluencerInput = (input: string): { name: string; handle: string | null } => {
  const trimmed = input.trim();
  
  // Check if it's just a handle (starts with @)
  if (trimmed.startsWith("@")) {
    return {
      name: trimmed.substring(1),
      handle: trimmed.substring(1),
    };
  }
  
  // Check if it contains handle in parentheses: "name (@handle)"
  const parenMatch = trimmed.match(/^(.+?)\s*\(@(.+?)\)$/);
  if (parenMatch) {
    return {
      name: parenMatch[1].trim(),
      handle: parenMatch[2].trim(),
    };
  }
  
  // Check if it contains handle with @: "name @handle"
  const atMatch = trimmed.match(/^(.+?)\s+@(.+?)$/);
  if (atMatch) {
    return {
      name: atMatch[1].trim(),
      handle: atMatch[2].trim(),
    };
  }
  
  // Just a name
  return {
    name: trimmed,
    handle: null,
  };
};

/**
 * Search for influencer in database by name or handle
 */
const searchInfluencerByName = async (
  name: string,
  handle: string | null
): Promise<Influencer | null> => {
  try {
    const db = getAdminDb();
    const influencersRef = db.collection("influencers");
    
    // Try exact name match first
    if (name) {
      const nameQuery = await influencersRef
        .where("name", "==", name)
        .limit(1)
        .get();
      
      if (!nameQuery.empty) {
        const doc = nameQuery.docs[0];
        return { id: doc.id, ...doc.data() } as Influencer;
      }
      
      // Try case-insensitive name match (fetch more and filter)
      const allQuery = await influencersRef.limit(500).get();
      const match = allQuery.docs.find((doc) => {
        const data = doc.data();
        const dbName = (data.name || "").toLowerCase();
        return dbName === name.toLowerCase();
      });
      
      if (match) {
        return { id: match.id, ...match.data() } as Influencer;
      }
    }
    
    // Try handle match
    if (handle) {
      const handleQuery = await influencersRef
        .where("handle", "==", handle)
        .limit(1)
        .get();
      
      if (!handleQuery.empty) {
        const doc = handleQuery.docs[0];
        return { id: doc.id, ...doc.data() } as Influencer;
      }
      
      // Try case-insensitive handle match
      const allQuery = await influencersRef.limit(500).get();
      const match = allQuery.docs.find((doc) => {
        const data = doc.data();
        const dbHandle = (data.handle || "").toLowerCase();
        return dbHandle === handle.toLowerCase();
      });
      
      if (match) {
        return { id: match.id, ...match.data() } as Influencer;
      }
    }
    
    // Try partial name match (contains)
    if (name) {
      const allQuery = await influencersRef.limit(500).get();
      const match = allQuery.docs.find((doc) => {
        const data = doc.data();
        const dbName = (data.name || "").toLowerCase();
        return dbName.includes(name.toLowerCase()) || name.toLowerCase().includes(dbName);
      });
      
      if (match) {
        return { id: match.id, ...match.data() } as Influencer;
      }
    }
    
    return null;
  } catch (error) {
    logError(error, { function: "searchInfluencerByName", name, handle });
    return null;
  }
};

/**
 * Create placeholder influencer entry with AI-generated rationale
 */
const createPlaceholderInfluencer = async (
  name: string,
  handle: string | null,
  brief: ClientBrief
): Promise<SelectedInfluencer> => {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  const openai = new OpenAI({ apiKey });

  // Estimate follower count based on budget (rough heuristic)
  const estimatedFollowers = brief.budget > 50000 
    ? 300000 + Math.floor(Math.random() * 200000) // 300k-500k for large budgets
    : brief.budget > 25000
    ? 100000 + Math.floor(Math.random() * 200000) // 100k-300k for medium budgets
    : 50000 + Math.floor(Math.random() * 50000); // 50k-100k for smaller budgets

  // Estimate engagement rate (between 2-5%)
  const estimatedEngagement = 2 + Math.random() * 3;

  // Estimate cost based on budget and number of manual influencers
  const manualCount = brief.manualInfluencers?.length || 1;
  const estimatedCost = Math.floor(brief.budget / Math.max(manualCount, 3));

  // Generate AI rationale
  let rationale = `${name} is an excellent fit for ${brief.clientName}'s campaign based on audience alignment and content style.`;
  
  try {
    const prompt = `Write a 2-3 sentence rationale explaining why ${name}${handle ? ` (@${handle})` : ""} would be a great fit for ${brief.clientName}'s influencer marketing campaign.

Campaign goals: ${brief.campaignGoals.join(", ")}
Target audience: ${brief.targetDemographics.ageRange}, ${brief.targetDemographics.gender}, ${brief.targetDemographics.location.join(", ")}
Content themes: ${brief.contentThemes?.join(", ") || "General"}
Budget: €${brief.budget.toLocaleString()}

Write a professional, specific rationale that explains why this influencer would work well for this brand. Be specific about audience alignment, content style, or brand fit.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a senior influencer marketing strategist. Write concise, professional rationales for influencer recommendations.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const generatedRationale = response.choices[0]?.message?.content?.trim();
    if (generatedRationale && generatedRationale.length > 20) {
      rationale = generatedRationale;
    }
  } catch (error) {
    logError(error, { function: "createPlaceholderInfluencer", name });
    // Fall back to default rationale
  }

  // Determine platform from brief preferences
  const platform = brief.platformPreferences?.[0] || "Instagram";

  // Create placeholder influencer
  const placeholder: SelectedInfluencer = {
    id: `manual-${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
    name,
    handle: handle || name.toLowerCase().replace(/\s+/g, ""),
    platform,
    profileImage: "",
    followers: estimatedFollowers,
    engagement: Number(estimatedEngagement.toFixed(2)),
    avgViews: Math.floor(estimatedFollowers * 0.15),
    demographics: {
      ageRange: brief.targetDemographics.ageRange || "25-35",
      gender: brief.targetDemographics.gender || "All genders",
      location: brief.targetDemographics.location || ["Spain"],
      interests: brief.targetDemographics.interests || [],
    },
    contentCategories: brief.contentThemes || ["Lifestyle"],
    previousBrands: [],
    rateCard: {
      post: Math.floor(estimatedCost * 0.4),
      story: Math.floor(estimatedCost * 0.1),
      reel: Math.floor(estimatedCost * 0.3),
      video: Math.floor(estimatedCost * 0.5),
      integration: Math.floor(estimatedCost * 0.6),
    },
    performance: {
      averageEngagementRate: estimatedEngagement,
      averageReach: Math.floor(estimatedFollowers * 0.35),
      audienceGrowthRate: 2.5,
      contentQualityScore: 85,
    },
    rationale,
    proposedContent: [
      "2-3 Instagram Reels",
      "3-4 Instagram Stories",
      "1-2 Feed Posts",
    ],
    estimatedReach: Math.floor(estimatedFollowers * 0.35),
    estimatedEngagement: Math.floor(estimatedFollowers * (estimatedEngagement / 100)),
    costEstimate: estimatedCost,
    matchScore: 90, // High score for manual selections
  };

  return placeholder;
};

/**
 * Process manual influencers: match to database or create placeholders
 */
export const processManualInfluencers = async (
  brief: ClientBrief
): Promise<SelectedInfluencer[]> => {
  if (!brief.manualInfluencers || brief.manualInfluencers.length === 0) {
    return [];
  }

  logInfo("Processing manual influencers", {
    count: brief.manualInfluencers.length,
    names: brief.manualInfluencers,
  });

  const results: SelectedInfluencer[] = [];

  for (const input of brief.manualInfluencers) {
    const { name, handle } = parseInfluencerInput(input);
    
    // Try to find in database
    const found = await searchInfluencerByName(name, handle);
    
    if (found) {
      logInfo("Found manual influencer in database", {
        name,
        handle,
        influencerId: found.id,
      });
      
      // Convert to SelectedInfluencer with enrichment
      const selected: SelectedInfluencer = {
        ...found,
        rationale: found.name
          ? `${found.name} is an excellent fit for ${brief.clientName}'s campaign based on audience alignment and content style.`
          : "Manually requested influencer with strong audience alignment.",
        proposedContent: ["2-3 Instagram Reels", "3-4 Instagram Stories", "1-2 Feed Posts"],
        estimatedReach: Math.floor(found.followers * 0.35),
        estimatedEngagement: Math.floor(found.followers * (found.engagement / 100)),
        costEstimate: (found.rateCard.post * 2) + found.rateCard.reel + (found.rateCard.story * 3),
        matchScore: 95, // High score for manual matches
      };
      
      results.push(selected);
    } else {
      logInfo("Manual influencer not found in database, creating placeholder", {
        name,
        handle,
      });
      
      // Create placeholder
      const placeholder = await createPlaceholderInfluencer(name, handle, brief);
      results.push(placeholder);
    }
  }

  return results;
};

