"use server";

import OpenAI from "openai";
import type { ClientBrief } from "@/types";
import { withRetry, RetryPresets } from "./retry";
import { briefCache, getBriefCacheKey } from "./cache";
import { 
  logError, 
  logInfo,
  logAPIUsage,
  logBriefProcessingStart,
  logBriefProcessingComplete,
  startTimer
} from "./logger";
import { OpenAIError, ValidationError } from "@/types/errors";
import { validateServiceEnv } from "./env-validation";
import { enforceRateLimit, RateLimitPresets } from "./rate-limiter";

/**
 * Parse unstructured brief text into structured ClientBrief format using OpenAI
 * This is a server action and will only run on the server.
 * 
 * WHY OPENAI? 
 * - Extremely reliable (99.9% uptime)
 * - Clear, consistent API
 * - Best-in-class structured outputs
 * - No authentication headaches
 * 
 * Enhanced with:
 * - Retry logic for API resilience
 * - Response caching for duplicate briefs
 * - Rate limiting to prevent abuse
 * - Comprehensive logging and observability
 */
export const parseBriefDocument = async (
  briefText: string
): Promise<ClientBrief> => {
  const timer = startTimer('parseBriefDocument');
  
  // Validate environment
  if (!validateServiceEnv('openai')) {
    throw new OpenAIError(
      "OPENAI_API_KEY environment variable is not set. Get one at https://platform.openai.com/api-keys",
      "missing_api_key"
    );
  }
  
  // Rate limiting (prevent abuse)
  try {
    enforceRateLimit('brief-parsing', RateLimitPresets.MODERATE);
  } catch (error) {
    logError(error, { function: 'parseBriefDocument' });
    throw error;
  }
  
  // Check cache first
  const cacheKey = getBriefCacheKey(briefText);
  const cached = briefCache.get(cacheKey);
  
  if (cached) {
    logInfo('Using cached brief parsing result', { 
      cacheKey: cacheKey.substring(0, 8),
      briefLength: briefText.length
    });
    return cached as unknown as ClientBrief;
  }
  
  logBriefProcessingStart(briefText);
  
  const apiKey = process.env.OPENAI_API_KEY!;
  const openai = new OpenAI({ apiKey });
  
  const prompt = `You are an expert at parsing client briefs for influencer marketing campaigns, with advanced reading comprehension and brand intelligence capabilities.

**CRITICAL: Use your knowledge of well-known brands (IKEA, Nike, Starbucks, Zara, McDonald's, etc.) to identify the client name even if not explicitly labeled. Look for brand names anywhere in the text.**

**CRITICAL: Use reading comprehension to INFER campaign goals from context:**
- Product launches → "Launch new product", "Drive awareness of [product]"
- Events → "Event promotion", "Drive attendance"
- Seasonal campaigns → "Holiday sales", "Back-to-school awareness"
- Brand partnerships → "Build brand awareness", "Strengthen brand positioning"
- New collections → "Showcase new collection", "Drive pre-orders"
- Even if goals aren't explicitly stated, INFER them from the campaign context, deliverables, and content themes

Parse this brief into a structured format. The brief may be in Spanish, English, or mixed languages.

Brief text:
${briefText}

Extract and return JSON with this exact structure:
{
  "clientName": "string (USE BRAND INTELLIGENCE: identify well-known brand names like IKEA, Nike, Zara, etc. even if not labeled as 'client'. Look throughout the entire text.)",
  "campaignGoals": ["goal1", "goal2", ...] (USE READING COMPREHENSION: extract explicit goals AND infer implicit goals from campaign context, product mentions, events, deliverables, and content themes. NEVER leave this empty - always infer at least 1-2 goals.),
  "budget": number (PRIMARY budget in euros, extract number only. If no budget mentioned, use 0),
  "targetDemographics": {
    "ageRange": "string (e.g., 25-65+, 18-35)",
    "gender": "string (e.g., All genders, 60% Female, Men and Women)",
    "location": ["country1", "city1", ...] (if not specified, use ["Spain"]),
    "interests": ["interest1", "interest2", ...],
    "psychographics": "string (optional, lifestyle/values)"
  },
  "brandRequirements": ["requirement1", "requirement2", ...] (constraints, guidelines),
  "timeline": "string (campaign period or deadline)",
  "platformPreferences": ["Instagram", "TikTok", ...] (if not specified, suggest based on target),
  "contentThemes": ["theme1", "theme2", ...] (creative direction, topics),
  "manualInfluencers": ["name1", "@handle1", "name2 (@handle2)", ...] (extract any influencer names, Instagram handles, or creator mentions from the brief),
  "additionalNotes": "string (urgency, special considerations, confidentiality, etc.)",
  
  "isMultiPhase": boolean (true if campaign has multiple phases like IKEA GREJSIMOJS: Phase 1/2/3),
  "phases": [
    {
      "name": "string (e.g., 'Phase 1: Teasing', 'Rumor', 'Revelation')",
      "budgetPercentage": number (e.g., 20 for 20%),
      "budgetAmount": number (calculated from budgetPercentage * budget),
      "creatorTier": "micro|mid-tier|macro|mixed",
      "creatorCount": number (e.g., 5-6 profiles),
      "contentFocus": ["theme1", "theme2"] (specific to this phase),
      "timeline": "string (phase dates)",
      "constraints": ["constraint1"] (e.g., "embargo: no product reveals"),
      "description": "string (phase strategy summary)"
    }
  ] (ONLY include if multi-phase campaign detected, otherwise omit or empty array),
  
  "constraints": {
    "maxCPM": number (maximum cost per thousand impressions, e.g., 20 for €20 CPM like Puerto de Indias),
    "minFollowers": number,
    "maxFollowers": number,
    "requiredCategories": ["category1"],
    "excludedCategories": ["category1"],
    "categoryRestrictions": ["restriction1"] (e.g., "must be willing to work with spirits/alcohol"),
    "mustHaveVerification": boolean,
    "requireEventAttendance": boolean (true if physical event attendance required like PYD Halloween),
    "requirePublicSpeaking": boolean (true if must speak at events like Square)
  } (ONLY include fields that are explicitly mentioned),
  
  "influencerRequirements": [
    {
      "tier": "macro|mid-tier|micro",
      "totalCount": number (total number needed for this tier),
      "femaleCount": number (OMIT if not specified),
      "maleCount": number (OMIT if not specified),
      "genderNotes": "string (e.g., '50/50 split', 'mostly female')",
      "deliverables": ["1 Reel", "1 Story", "TikTok replica"] (what each influencer in this tier will create),
      "schedule": "string (e.g., 'alternating months', 'March, May, July')",
      "notes": "string (any additional requirements for this tier)"
    }
  ] (ONLY include if influencer breakdown by tier/gender is specified, like Celsius: 2 macros (1F+1M) + 6 mids (3F+3M)),
  
  "geographicDistribution": {
    "cities": ["city1", "city2"] (specific cities required, e.g., Madrid, Barcelona, Sevilla, Valencia),
    "coreCities": ["city1"] (priority cities if mentioned, e.g., Madrid and Barcelona as core),
    "requireDistribution": boolean (true if profiles must be distributed across multiple cities),
    "minPerCity": number (OMIT if not specified),
    "maxPerCity": number (OMIT if not specified)
  } (OMIT ENTIRE OBJECT if geographic distribution NOT explicitly required),
  
  "deliverables": [
    {
      "type": "social|event|content-creation|speaking|ambassador|brand-integration",
      "description": "string",
      "requirements": ["requirement1"],
      "quantity": number
    }
  ] (extract all deliverable types mentioned),
  
  "budgetScenarios": [
    {
      "name": "Scenario 1|Scenario 2|Conservative|Aggressive",
      "amount": number,
      "description": "string"
    }
  ] (ONLY include if multiple budget scenarios requested like IKEA €30k and €50k),
  
  "campaignHistory": {
    "isFollowUp": boolean (true if this is Wave 2, follow-up, or references previous campaign),
    "wave": number (e.g., 2 for Wave 2. OMIT this field if wave number not mentioned),
    "successfulInfluencers": ["name1", "@handle1"] (creators mentioned as performing well previously)
  } (OMIT ENTIRE OBJECT if NOT a follow-up campaign),
  
  "targetAudienceType": "B2C|B2B|D2C" (B2B if targeting business owners like Square, B2C for consumers),
  "campaignType": "string (e.g., Product Launch, Brand Awareness, Event-based, Multi-phase)"
}

CRITICAL PARSING INSTRUCTIONS:

0. BRAND INTELLIGENCE & READING COMPREHENSION:
   - **Brand Recognition:** Use your knowledge of well-known brands to identify clients. If you see "IKEA", "Nike", "Starbucks", "Zara", "McDonald's", etc. in the text, that's likely the client even if not explicitly labeled
   - **Goal Inference:** Campaign goals are often IMPLIED, not explicitly stated. Look for:
     * Product names → infer "Launch [product]" or "Drive awareness of [product]"
     * Event mentions → infer "Promote [event]" or "Drive attendance"
     * New collections → infer "Showcase [collection]"
     * Seasonal timing → infer seasonal goals (e.g., "Halloween campaign" → "Drive Halloween sales")
     * Deliverables → infer goals from what's being created (e.g., "Reels + Stories" → "Increase social engagement")
   - **Context Clues:** Read between the lines. A brief about a new furniture collection launch clearly has goals even if not labeled "objectives"
   - **NEVER leave campaignGoals empty** - always extract or infer at least 1-3 goals from the brief

1. OPTIONAL FIELDS - IMPORTANT:
   - ONLY include optional complex fields (campaignHistory, geographicDistribution, budgetScenarios, phases, constraints) when EXPLICITLY mentioned in the brief
   - Do NOT include these fields with default/empty values if they're not in the brief
   - When in doubt, OMIT the field rather than guessing
   - Missing fields will be prompted in the UI if needed
   - **EXCEPTION:** campaignGoals must ALWAYS be filled - infer from context if not explicit

2. MULTI-PHASE CAMPAIGNS (like IKEA GREJSIMOJS):
   - Look for phrases: "Phase 1", "Phase 2", "Fase 1", "oleada", "wave"
   - Extract budget percentages (e.g., "20% Phase 1, 40% Phase 2, 40% Phase 3")
   - Extract phase names (e.g., "El Rumor", "La Revelación", "El Rush Final")
   - Extract phase-specific strategies and creator requirements
   - Note any phase constraints (e.g., "embargo: no products shown in Phase 1")

3. BUDGET SCENARIOS (like IKEA):
   - Look for: "hagamos dos escenarios", "two scenarios", "€30k and €50k"
   - Extract all budget amounts mentioned as alternatives
   - Use PRIMARY budget as main "budget" field

4. HARD CONSTRAINTS:
   - CPM limits: "máximo CPM de €20", "max CPM €20 per talent" → maxCPM: 20
   - Category restrictions: "willing to work with spirits", "no alcohol brands"
   - Event attendance: "asistencia a la academia", "attend OT academy" → requireEventAttendance: true
   - Public speaking: "dar una charla", "speaker at events" → requirePublicSpeaking: true

5. INFLUENCER REQUIREMENTS WITH GENDER BREAKDOWN (like Celsius):
   - Look for specific tier + gender requirements: "2 macros (una chica y un chico)", "6 mids (3 chicas y 3 chicos)"
   - Extract: tier, total count, female count, male count
   - Example: "2 macros (1 female + 1 male)" → {tier: "macro", totalCount: 2, femaleCount: 1, maleCount: 1}
   - Example: "6 mids (3 girls + 3 boys)" → {tier: "mid-tier", totalCount: 6, femaleCount: 3, maleCount: 3}
   - Include schedule if alternating: "macros publish March, May, July" vs "mids publish April, June, August"
   - Spanish: "chica/chico" = female/male, "mujer/hombre" = woman/man

6. GEOGRAPHIC DISTRIBUTION (like Square):
   - Look for: "distributed across", "repartidos en Madrid, Barcelona, Sevilla"
   - Extract city lists and identify priority/core cities
   - Set requireDistribution: true if distribution is important
   - Look for percentages: "50% Barcelona, 50% Madrid" → equal distribution

8. DELIVERABLES:
   - Social: "1 Reel + 3 Stories", "2 posts", "réplica en TikTok" (TikTok replica/repost)
   - Event: "Academy attendance", "Asistencia Evento", "asistencia a dos eventos" (2 events)
   - Speaking: "dar una charla", "speaker talks"
   - Brand Integration: "brand integration at OT"
   - Rights: "derechos de imagen para paid" (image rights for paid media), note max spend per content

9. FOLLOW-UP CAMPAIGNS (like Puerto de Indias Wave 2):
   - Look for: "Wave 2", "oleada 2", "repeat well-performing creators"
   - Extract mentions of previous campaign performance
   - Note if certain influencers should be repeated

10. B2B vs B2C:
   - B2B if targeting: "emprendedores", "business owners", "restaurateurs"
   - B2C if targeting: consumers, general public

11. MANUAL INFLUENCERS:
   - Extract ALL mentioned names: "Laura Escanes", "Violeta Mangriyan", "@dyanbay"
   - Include question marks: "¿Las podemos meter?" still means they're requested
   - Include rejected options with note: "Dabiz Muñoz (said no)"
   - Note: "proponer talento nuevo" (propose new talent) means client wants fresh suggestions beyond examples

12. CAMPAIGN GOAL INFERENCE EXAMPLES:
   - "Launch GREJSIMOJS collection" + "3 phases" → ["Launch GREJSIMOJS collection", "Build anticipation and buzz", "Drive sales and conversions"]
   - "Halloween event" + "OT academy" → ["Drive event attendance", "Increase brand awareness", "Generate social buzz"]
   - "New gin flavor" + "testimonials" → ["Launch new product", "Build product credibility", "Drive trial and purchase"]
   - "Furniture collection" + "lifestyle content" → ["Showcase new collection", "Drive store traffic", "Increase online sales"]
   - Use this logic to ALWAYS infer meaningful goals from campaign context

13. For Spanish briefs: 
   - "Presupuesto" = budget
   - "Territorio" = content themes
   - "Target" = demographics
   - "PDM" = presentation deadline
   - "PTE" = pending/TBD
   - "una chica y un chico" = a girl and a boy (1 female + 1 male)
   - "repartidos 50% y 50%" = split 50/50
   - "un mes sí y un mes no" = alternating months (one month yes, one month no)

Return ONLY valid JSON, no markdown formatting. Be COMPREHENSIVE - extract every detail mentioned in the brief.`;

  try {
    const response = await withRetry(
      () => openai.chat.completions.create({
        model: "gpt-4o-mini", // Fast, cheap, and excellent for structured outputs
        messages: [
          {
            role: "system",
            content: "You are a precise JSON extraction assistant. Always return valid JSON without markdown formatting."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent structured outputs
        response_format: { type: "json_object" } // Ensures valid JSON response
      }),
      RetryPresets.STANDARD
    );

    const text = response.choices[0]?.message?.content || "";
    
    if (!text) {
      throw new OpenAIError("No response from OpenAI", "empty_response");
    }

    const rawParsed = JSON.parse(text);

    // Set defaults for required fields
    if (!rawParsed.platformPreferences || rawParsed.platformPreferences.length === 0) {
      rawParsed.platformPreferences = ["Instagram", "TikTok"];
    }
    if (!rawParsed.contentThemes) rawParsed.contentThemes = [];
    if (!rawParsed.brandRequirements) rawParsed.brandRequirements = [];
    if (!rawParsed.manualInfluencers) rawParsed.manualInfluencers = [];
    
    // Set defaults for enhanced optional fields
    if (!rawParsed.isMultiPhase) rawParsed.isMultiPhase = false;
    if (!rawParsed.phases) rawParsed.phases = [];
    if (!rawParsed.deliverables) rawParsed.deliverables = [];
    if (!rawParsed.budgetScenarios) rawParsed.budgetScenarios = [];
    
    // Calculate phase budget amounts if percentages provided
    if (rawParsed.phases && rawParsed.phases.length > 0 && rawParsed.budget > 0) {
      rawParsed.phases = rawParsed.phases.map((phase: any) => ({
        ...phase,
        budgetAmount: Math.round((phase.budgetPercentage / 100) * rawParsed.budget)
      }));
    }
    
    // Log complex brief detection
    if (rawParsed.isMultiPhase) {
      console.log(`🎯 [PARSER] Multi-phase campaign detected: ${rawParsed.phases.length} phases`);
    }
    if (rawParsed.constraints?.maxCPM) {
      console.log(`🎯 [PARSER] Hard CPM constraint detected: €${rawParsed.constraints.maxCPM}`);
    }
    if (rawParsed.geographicDistribution?.requireDistribution) {
      console.log(`🎯 [PARSER] Geographic distribution required: ${rawParsed.geographicDistribution.cities.join(', ')}`);
    }
    if (rawParsed.budgetScenarios && rawParsed.budgetScenarios.length > 1) {
      console.log(`🎯 [PARSER] Multi-budget scenarios detected: ${rawParsed.budgetScenarios.length} scenarios`);
    }

    // Validate with Zod schema (use safe validation to avoid throwing errors)
    const { safeValidateClientBrief, sanitizeBriefData } = await import('./validation');
    const sanitized = sanitizeBriefData(rawParsed);
    const validationResult = safeValidateClientBrief(sanitized);

    let parsed: any;
    const suggestions: string[] = [];
    
    if (!validationResult.success) {
      // Validation failed - provide defaults for missing required fields
      console.warn('⚠️  Brief validation failed, using defaults for missing fields:', validationResult.errors);
      
      // Start with sanitized data and fill in missing required fields with defaults
      parsed = {
        ...sanitized,
        campaignGoals: sanitized.campaignGoals?.length > 0 ? sanitized.campaignGoals : ['Please specify campaign goals'],
        platformPreferences: sanitized.platformPreferences?.length > 0 ? sanitized.platformPreferences : ['Instagram'],
        targetDemographics: {
          ageRange: sanitized.targetDemographics?.ageRange || '18-65',
          gender: sanitized.targetDemographics?.gender || 'All genders',
          location: sanitized.targetDemographics?.location?.length > 0 ? sanitized.targetDemographics.location : ['Spain'],
          interests: sanitized.targetDemographics?.interests || [],
          psychographics: sanitized.targetDemographics?.psychographics || ''
        }
      };
      
      // Add warnings for missing fields
      if (validationResult.errors) {
        suggestions.push('⚠️  Some required fields could not be extracted from the brief. Please review and update:');
        validationResult.errors.forEach(error => {
          suggestions.push(`   • ${error}`);
        });
      }
    } else {
      parsed = validationResult.data;
    }

    // Add helpful suggestions if demographics are missing
    if (!parsed.targetDemographics.interests || parsed.targetDemographics.interests.length === 0) {
      suggestions.push('💡 TIP: Add target audience interests for more accurate influencer matching and better results.');
    }
    if (parsed.targetDemographics.ageRange === '18-65') {
      suggestions.push('💡 TIP: Specify a narrower age range (e.g., 25-45) for more targeted influencer recommendations.');
    }
    
    // Append suggestions to additional notes
    if (suggestions.length > 0) {
      const suggestionText = '\n\n' + suggestions.join('\n');
      parsed.additionalNotes = (parsed.additionalNotes || '') + suggestionText;
      console.log('ℹ️  Suggestions added to brief');
    }

    // Cache the result
    briefCache.set(cacheKey, parsed);
    
    const duration = timer.stop({ success: true });
    
    logAPIUsage('openai', 'brief_parsing', {
      tokens: response.usage?.total_tokens,
      cost: (response.usage?.total_tokens || 0) * 0.0000015, // Approximate cost
      model: 'gpt-4o-mini',
      success: true,
      duration
    });
    
    logBriefProcessingComplete(duration, true, {
      clientName: parsed.clientName,
      budget: parsed.budget,
      goalsCount: parsed.campaignGoals.length
    });

    return parsed;
  } catch (error) {
    const duration = timer.stop({ success: false });
    
    logError(error, {
      function: 'parseBriefDocument',
      briefLength: briefText.length
    });
    
    logAPIUsage('openai', 'brief_parsing', {
      model: 'gpt-4o-mini',
      success: false,
      duration
    });
    
    logBriefProcessingComplete(duration, false);
    
    if (error instanceof Error) {
      // Handle specific OpenAI errors
      if (error.message.includes("API key")) {
        throw new OpenAIError(
          "Invalid OpenAI API key. Get one at https://platform.openai.com/api-keys",
          "invalid_api_key"
        );
      }
      if (error.message.includes("quota") || error.message.includes("insufficient_quota")) {
        throw new OpenAIError(
          "OpenAI API quota exceeded. Please add credits to your account.",
          "insufficient_quota"
        );
      }
      if (error.message.includes("rate_limit")) {
        throw new OpenAIError(
          "Rate limit exceeded. Please try again in a moment.",
          "rate_limit_exceeded"
        );
      }
    }
    
    if (error instanceof OpenAIError || error instanceof ValidationError) {
      throw error;
    }
    
    throw new OpenAIError(
      "Unable to parse brief document. Please try again.",
      "parsing_failed"
    );
  }
};

