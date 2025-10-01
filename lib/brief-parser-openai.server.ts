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
    return cached;
  }
  
  logBriefProcessingStart(briefText);
  
  const apiKey = process.env.OPENAI_API_KEY!;
  const openai = new OpenAI({ apiKey });
  
  const prompt = `You are an expert at parsing client briefs for influencer marketing campaigns.

Parse this brief into a structured format. The brief may be in Spanish, English, or mixed languages.

Brief text:
${briefText}

Extract and return JSON with this exact structure:
{
  "clientName": "string (brand or company name)",
  "campaignGoals": ["goal1", "goal2", ...] (specific objectives),
  "budget": number (in euros, extract number only),
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
  "additionalNotes": "string (urgency, special considerations, confidentiality, etc.)"
}

Key instructions:
- Extract ALL relevant information, even if implicit
- For Spanish briefs: "Presupuesto" = budget, "Territorio" = content themes, "Target" = demographics
- Infer platform preferences from target age if not specified
- Capture urgency/timeline information
- Note any special requirements (confidentiality, guarantees, etc.)
- Be comprehensive but accurate

Return ONLY valid JSON, no markdown formatting.`;

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

    // Set defaults for optional fields before validation
    if (!rawParsed.platformPreferences || rawParsed.platformPreferences.length === 0) {
      rawParsed.platformPreferences = ["Instagram", "TikTok"];
    }
    if (!rawParsed.contentThemes) rawParsed.contentThemes = [];
    if (!rawParsed.brandRequirements) rawParsed.brandRequirements = [];

    // Validate with Zod schema
    const { validateClientBrief, sanitizeBriefData } = await import('./validation');
    const sanitized = sanitizeBriefData(rawParsed);
    const parsed = validateClientBrief(sanitized);

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

