"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ClientBrief, InfluencerRequirements } from "@/types";

/**
 * Parse unstructured brief text into structured ClientBrief format using Google AI (Gemini)
 * This is a server action and will only run on the server.
 */
export const parseBriefDocument = async (
  briefText: string
): Promise<ClientBrief> => {
  // Initialize Google AI with API key (much simpler than Vertex AI!)
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  
  if (!apiKey) {
    throw new Error("GOOGLE_AI_API_KEY environment variable is not set");
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash", // Updated to latest Gemini model
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 2048,
    }
  });
  
  const prompt = `You are an expert at parsing client briefs for influencer marketing campaigns.

IMPORTANT: These are REAL EMAIL BRIEFS, not polished documents. They contain:
- Conversational greetings and sign-offs (ignore these)
- Information scattered throughout paragraphs
- Emojis, informal language, and casual Spanish business communication
- External links (WeTransfer, Instagram, TikTok) - note them but don't try to access
- References to previous campaigns or meetings
- Incomplete information (this is normal, don't fabricate)
- Multiple topics mixed together

Extract the BUSINESS INFORMATION and ignore pleasantries, greetings, and conversational elements.

Brief text:
${briefText}

Extract and return JSON with this exact structure:
{
  "clientName": "string (brand or company name, may include partnerships like 'IKEA + Museum')",
  "campaignGoals": ["goal1", "goal2", ...] (specific objectives),
  "budget": number (in euros, extract number only. If multiple scenarios mentioned, use the first/lower one. If not specified or TBD, use 0),
  "targetDemographics": {
    "ageRange": "string (e.g., 25-65+, 18-35)",
    "gender": "string (e.g., All genders, 60% Female, Men and Women)",
    "location": ["country1", "city1", ...] (if not specified, use ["Spain"])",
    "interests": ["interest1", "interest2", ...],
    "psychographics": "string (optional, lifestyle/values)"
  },
  "brandRequirements": ["requirement1", "requirement2", ...] (constraints, guidelines, CPM/CPV limits, in-store requirements, embargo constraints),
  "timeline": "string (campaign period or deadline, note if TBD/uncertain)",
  "platformPreferences": ["Instagram", "TikTok", ...] (if not specified, suggest based on target)",
  "contentThemes": ["theme1", "theme2", ...] (creative direction, topics)",
  "manualInfluencers": ["name1", "@handle1", "name2 (@handle2)", ...] (extract any influencer names, Instagram handles, or creator mentions from the brief. If no influencers mentioned, use empty array []),
  "additionalNotes": "string (urgency, special considerations, specific creator names, previous campaign references, multi-phase details, event components, budget scenarios)",
  "influencerRequirements": {
    "totalCount": number (total influencers needed, sum of all tiers. If not specified, use null),
    "breakdown": [
      {
        "tier": "macro" | "mid" | "micro" | "nano",
        "count": number,
        "gender": { "male": number, "female": number } (if specified, otherwise null)
      }
    ] (array of tier requirements. If no breakdown specified, use null),
    "locationDistribution": [
      { "city": "string", "percentage": number }
    ] (if location split specified like "50% Barcelona, 50% Madrid", otherwise null),
    "proposedMultiplier": number (if they ask for proposals of double/triple the needed count, e.g., 2 for "propose double". Otherwise null),
    "notes": "string (any special requirements about influencer selection not captured above)"
  }
}

CRITICAL PARSING RULES:

1. EMAIL FORMAT HANDLING:
   - IGNORE: Greetings ("Hola Gema", "¿Cómo estás?"), sign-offs ("Abrazo", "Mil gracias"), pleasantries
   - EXTRACT: Budget figures, dates, creator names, deliverables, campaign concepts
   - NOTE: External links (mention in additionalNotes but don't access)

2. SPANISH AGENCY TERMINOLOGY:
   - "oleada" = wave/campaign iteration
   - "contrastar" = confirm/validate (means unconfirmed at this stage)
   - "PDM" = presentation deadline
   - "PTE" = pending/to be confirmed
   - "Presupuesto" = budget
   - "Territorio" = content themes/territory
   - "Target" = target audience
   - "Periodo" = timeline/period
   - "Objetivo" = goal/objective
   - "porfi" = por favor (please, informal)

3. BUDGET HANDLING:
   - Extract number only (convert "111.800€" to 111800)
   - If multiple scenarios ("30.000€ or 50.000€"), use lower/first number
   - If "€39,000 + €5,000 boost", calculate total (44000)
   - If budget not specified/TBD, use 0 and note in additionalNotes
   - CPM/CPV constraints go in brandRequirements (e.g., "Max CPM €20")

4. MULTI-PHASE CAMPAIGNS:
   - If phases mentioned (Phase 1/2/3, Teaser/Reveal/Launch), extract ALL phases
   - Note phase timing, budget allocation percentages, and distinct strategies
   - Include in contentThemes and additionalNotes with phase breakdown

5. INCOMPLETE INFORMATION (NORMAL):
   - Timeline says "probably October" or "dates TBD" = note uncertainty
   - Budget "not confirmed" = use 0, note in additionalNotes
   - "Brief pending" or "details coming" = extract what exists, note incompleteness
   - DO NOT fabricate missing information

6. CREATOR/TALENT MENTIONS:
   - Extract specific names requested (with Instagram handles if provided)
   - Include in manualInfluencers array in formats: "name", "@handle", "name (@handle)", or "name @handle"
   - Note if creators are suggestions vs. requirements in additionalNotes
   - Note any rejected names ("X said no") in additionalNotes
   - Example: If brief mentions "We want @maria_garcia and Carlos Lopez (@carlos_lopez)", extract: ["@maria_garcia", "Carlos Lopez (@carlos_lopez)"]

7. CAMPAIGN TYPES TO IDENTIFY:
   - B2B vs B2C (if targeting businesses, note this)
   - Event-based (physical attendance required)
   - Social amplification only
   - Multi-phase strategies
   - Follow-up campaigns (Wave 2, etc.)
   - Institutional partnerships (museums, etc.)

8. SPECIAL REQUIREMENTS:
   - In-store filming percentages (e.g., "30% must film in IKEA")
   - Embargo constraints (can't show product until X date)
   - Geographic distribution needs
   - CPM/CPV limits (add to brandRequirements)
   - Category restrictions (e.g., "must work with alcohol brands")

9. TARGET DEMOGRAPHICS:
   - If event speakers mentioned separately from audience, note both
   - Extract both who sees content AND who creates it if different
   - B2B campaigns: include business type in interests

10. ADDITIONAL NOTES SHOULD CAPTURE:
    - Specific creator names and their deliverables
    - Multi-budget scenarios ("Also provide €50k scenario")
    - Event components and attendance requirements
    - Previous campaign references
    - Rejected options
    - Pending confirmations
    - Celebrity collaborations
    - Template references
    - Reference to attached files/links

11. INFLUENCER REQUIREMENTS EXTRACTION (CRITICAL):
    This is one of the MOST IMPORTANT sections. Carefully extract:
    
    A. TIER BREAKDOWN:
       - "macros" / "macro influencers" = tier "macro" (500k+ followers)
       - "mids" / "mid-tier" / "medios" = tier "mid" (100k-500k followers)
       - "micros" / "micro influencers" = tier "micro" (10k-100k followers)
       - "nanos" / "nano influencers" = tier "nano" (1k-10k followers)
       
    B. COUNT EXTRACTION EXAMPLES:
       - "2 macros" = { tier: "macro", count: 2 }
       - "6 mids" = { tier: "mid", count: 6 }
       - "Necesitamos 6 mids (3 chicas y 3 chicos)" = { tier: "mid", count: 6, gender: { male: 3, female: 3 } }
       - "2 macros (una chica y un chico)" = { tier: "macro", count: 2, gender: { male: 1, female: 1 } }
       
    C. GENDER TERMINOLOGY (Spanish):
       - "chica/chicas" = female
       - "chico/chicos" = male
       - "una chica y un chico" = { male: 1, female: 1 }
       - "3 chicas y 3 chicos" = { male: 3, female: 3 }
       
    D. LOCATION DISTRIBUTION:
       - "repartidos 50% y 50% Barcelona/Madrid" = [{ city: "Barcelona", percentage: 50 }, { city: "Madrid", percentage: 50 }]
       - "deben vivir en Barcelona o Madrid, repartidos 50% y 50%" = same as above
       
    E. PROPOSAL MULTIPLIER:
       - "proponer el doble de lo que necesitamos" = proposedMultiplier: 2
       - "4-6 macros y 6-12 mids" when only 2 macros and 6 mids needed = proposedMultiplier: 2
       - If no multiplier mentioned, use null
       
    F. TOTAL COUNT:
       - Sum all tier counts: 2 macros + 6 mids = totalCount: 8
       - If specific counts aren't given but a total is ("necesitamos 10 influencers"), use that

Be comprehensive but accurate. Extract signal from noise. If information is missing, acknowledge it - don't invent it.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonText = text.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(jsonText) as ClientBrief;

    if (!parsed.clientName || !parsed.campaignGoals || parsed.campaignGoals.length === 0) {
      throw new Error("Failed to extract required fields from brief");
    }

    if (!parsed.platformPreferences || parsed.platformPreferences.length === 0) {
      parsed.platformPreferences = ["Instagram", "TikTok"];
    }
    if (!parsed.contentThemes) parsed.contentThemes = [];
    if (!parsed.brandRequirements) parsed.brandRequirements = [];
    if (!parsed.manualInfluencers) parsed.manualInfluencers = [];
    
    // Process influencer requirements
    if (parsed.influencerRequirements) {
      console.log(`📋 [PARSER] Raw influencer requirements extracted:`, JSON.stringify(parsed.influencerRequirements, null, 2));
      
      // Clean up null values in breakdown
      if (parsed.influencerRequirements.breakdown) {
        parsed.influencerRequirements.breakdown = parsed.influencerRequirements.breakdown.filter(
          (item: { tier?: string; count?: number }) => item && item.tier && item.count && item.count > 0
        );
        // Calculate total if not provided
        if (!parsed.influencerRequirements.totalCount && parsed.influencerRequirements.breakdown.length > 0) {
          parsed.influencerRequirements.totalCount = parsed.influencerRequirements.breakdown.reduce(
            (sum: number, item: { count?: number }) => sum + (item.count || 0), 0
          );
        }
      }
      // Clean up null location distribution
      if (parsed.influencerRequirements.locationDistribution) {
        parsed.influencerRequirements.locationDistribution = parsed.influencerRequirements.locationDistribution.filter(
          (item: { city?: string; percentage?: number }) => item && item.city && item.percentage
        );
        if (parsed.influencerRequirements.locationDistribution.length === 0) {
          parsed.influencerRequirements.locationDistribution = undefined;
        }
      }
      // Remove empty influencerRequirements object
      if (!parsed.influencerRequirements.totalCount &&
          (!parsed.influencerRequirements.breakdown || parsed.influencerRequirements.breakdown.length === 0)) {
        console.log(`⚠️ [PARSER] Influencer requirements removed (empty or no count)`);
        parsed.influencerRequirements = undefined;
      } else {
        console.log(`✅ [PARSER] Final influencer requirements: ${parsed.influencerRequirements.totalCount} total influencers`);
        if (parsed.influencerRequirements.breakdown) {
          parsed.influencerRequirements.breakdown.forEach(tier => {
            console.log(`   - ${tier.tier}: ${tier.count} ${tier.gender ? `(${tier.gender.female}F/${tier.gender.male}M)` : ''}`);
          });
        }
      }
    } else {
      console.log(`⚠️ [PARSER] No influencer requirements extracted from brief`);
    }

    return parsed;
  } catch (error) {
    console.error("Error parsing brief with Google AI:", error);
    if (error instanceof Error) {
      if (error.message.includes("API_KEY") || error.message.includes("invalid")) {
        throw new Error("Invalid Google AI API key. Please check your GOOGLE_AI_API_KEY environment variable.");
      }
      if (error.message.includes("quota") || error.message.includes("429")) {
        throw new Error("API quota exceeded. Please try again later.");
      }
    }
    throw new Error("Unable to parse brief document. The AI model could not process the text.");
  }
};
