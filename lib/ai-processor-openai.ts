"use server";

import OpenAI from "openai";
import type {
  ClientBrief,
  Presentation,
  Influencer,
  SelectedInfluencer,
  AIProcessingResponse,
} from "@/types";
import { generateTemplateSlides } from "./template-slide-generator";
import { matchInfluencers } from "./influencer-matcher";
import { getTemplate, recommendTemplate } from "@/types/templates";
import type { TemplateId } from "@/types/templates";
import { withRetry, RetryPresets } from "./retry";
import { contentCache, getContentCacheKey } from "./cache";
import { 
  logError, 
  logInfo, 
  logAPIUsage, 
  logPresentationGeneration,
  startTimer
} from "./logger";
import { OpenAIError, ValidationError } from "@/types/errors";
import { validateServiceEnv } from "./env-validation";

/**
 * OpenAI-powered AI processor for presentation generation
 * Uses OpenAI for all text generation (more reliable than Google AI)
 * Google Vertex AI is still used for:
 * - Image generation/editing (Gemini 2.0 Flash Exp)
 * - Influencer ranking (in influencer-matcher.ts)
 * 
 * Enhanced with:
 * - Retry logic for API resilience
 * - Response caching for duplicate requests
 * - Comprehensive logging and observability
 */

const getOpenAI = () => {
  // Validate environment
  if (!validateServiceEnv('openai')) {
    throw new OpenAIError(
      "OPENAI_API_KEY environment variable is not set",
      "missing_api_key"
    );
  }
  
  const apiKey = process.env.OPENAI_API_KEY!;
  return new OpenAI({ apiKey });
};

export const processBrief = async (
  brief: ClientBrief,
  influencerPool: Influencer[]
): Promise<AIProcessingResponse> => {
  const timer = startTimer('processBrief');
  
  try {
    logInfo('Starting brief processing', {
      clientName: brief.clientName,
      budget: brief.budget,
      platforms: brief.platformPreferences
    });

    // Step 1: Extract and validate brief information
    timer.lap('validation-start');
    const validationResult = await validateBrief(brief);
    timer.lap('validation-complete');
    
    if (!validationResult.isValid) {
      logInfo('Brief validation failed', {
        warnings: validationResult.warnings,
        completeness: validationResult.completeness
      });
      
      return {
        presentation: {} as Presentation,
        recommendations: [],
        warnings: validationResult.warnings,
        confidence: 0,
      };
    }

    // Step 2: Match influencers using AI (uses Vertex AI for ranking)
    timer.lap('matching-start');
    const matchedInfluencers = await matchInfluencers(brief, influencerPool);
    timer.lap('matching-complete');
    
    logInfo('Influencer matching complete', {
      matchedCount: matchedInfluencers.length,
      totalBudget: matchedInfluencers.reduce((sum, inf) => sum + (inf.costEstimate || 0), 0)
    });

    // Step 3: Determine or recommend template
    const templateId: TemplateId = brief.templateId || recommendTemplate(
      brief.campaignGoals,
      brief.contentThemes,
      brief.clientName
    );
    const template = getTemplate(templateId);

    // Step 4: Generate presentation content with OpenAI (with caching)
    timer.lap('content-generation-start');
    const presentationContent = await generatePresentationContent(brief, matchedInfluencers);
    timer.lap('content-generation-complete');

    // Step 5: Create slides with template
    timer.lap('slide-generation-start');
    const slides = await generateTemplateSlides(
      brief,
      matchedInfluencers,
      presentationContent,
      template
    );
    timer.lap('slide-generation-complete');

    // Step 6: Create presentation object
    const presentation: Presentation = {
      id: Date.now().toString(),
      title: `${brief.clientName} - Influencer Campaign`,
      clientName: brief.clientName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slides,
      brief,
      selectedInfluencers: matchedInfluencers,
    };

    const totalDuration = timer.stop({
      success: true,
      slideCount: slides.length,
      influencerCount: matchedInfluencers.length
    });
    
    logPresentationGeneration(
      brief.clientName,
      slides.length,
      totalDuration
    );

    return {
      presentation,
      recommendations: presentationContent.recommendations || [],
      warnings: validationResult.warnings,
      confidence: presentationContent.confidence || 85,
    };
  } catch (error) {
    timer.stop({ success: false });
    
    logError(error, {
      function: 'processBrief',
      clientName: brief.clientName,
      budget: brief.budget
    });
    
    if (error instanceof OpenAIError || error instanceof ValidationError) {
      throw error;
    }
    
    throw new OpenAIError(
      "Failed to process brief. Please try again.",
      "processing_failed"
    );
  }
};

const validateBrief = async (brief: ClientBrief) => {
  const openai = getOpenAI();
  
  const prompt = `Analyze this client brief and identify any missing critical information:
  
Brief:
- Client: ${brief.clientName}
- Goals: ${brief.campaignGoals.join(", ")}
- Budget: €${brief.budget}
- Demographics: ${JSON.stringify(brief.targetDemographics)}
- Requirements: ${brief.brandRequirements.join(", ")}
- Timeline: ${brief.timeline}
- Platforms: ${brief.platformPreferences.join(", ")}

Return a JSON object with:
{
  "isValid": boolean,
  "warnings": string[] (list any missing or unclear information),
  "completeness": number (0-100)
}`;

  try {
    const response = await withRetry(
      () => openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a brief validation assistant. Always return valid JSON without markdown formatting."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      }),
      RetryPresets.FAST
    );

    const text = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(text);
    
    logAPIUsage('openai', 'brief_validation', {
      tokens: response.usage?.total_tokens,
      model: 'gpt-4o-mini',
      success: true
    });
    
    return {
      isValid: parsed.completeness >= 70,
      warnings: parsed.warnings || [],
      completeness: parsed.completeness,
    };
  } catch (error) {
    logError(error, {
      function: 'validateBrief',
      clientName: brief.clientName
    });
    
    logAPIUsage('openai', 'brief_validation', {
      model: 'gpt-4o-mini',
      success: false
    });
    
    return {
      isValid: true,
      warnings: ["Unable to fully validate brief"],
      completeness: 75,
    };
  }
};

const generatePresentationContent = async (
  brief: ClientBrief,
  influencers: SelectedInfluencer[]
) => {
  // Check cache first
  const cacheKey = getContentCacheKey({ ...brief, influencerCount: influencers.length });
  const cached = contentCache.get(cacheKey);
  
  if (cached) {
    logInfo('Using cached presentation content', { cacheKey: cacheKey.substring(0, 8) });
    return cached;
  }
  
  const openai = getOpenAI();
  
  const prompt = `You are a senior creative strategist at Dentsu Story Lab / Look After You, an elite influencer talent agency known for crafting premium, insight-driven campaign presentations.

Create a comprehensive, highly sophisticated campaign presentation based on this brief:

**CLIENT BRIEF:**
Client: ${brief.clientName}
Campaign Goals: ${brief.campaignGoals.join(", ")}
Budget: €${brief.budget}
Target Audience: ${JSON.stringify(brief.targetDemographics)}
Brand Requirements: ${brief.brandRequirements.join(", ")}
Timeline: ${brief.timeline}
Platforms: ${brief.platformPreferences.join(", ")}
Content Themes: ${brief.contentThemes?.join(", ") || "Lifestyle, Authenticity, Aspiration"}

**MATCHED INFLUENCERS:**
${influencers.map(i => `- ${i.name} (@${i.handle}): ${i.followers.toLocaleString()} followers, ${i.engagement}% ER, Cost: €${i.costEstimate?.toLocaleString()}`).join("\n")}

**INSTRUCTIONS:**
Generate sophisticated, agency-quality presentation content following this structure:

1. **Campaign Summary** - Key campaign parameters in a structured format
2. **Creative Ideas** (3-4 distinct concepts) - Each with:
   - A compelling title (e.g., "Mi Primer Concierto", "Actitud The Band")
   - A powerful claim/tagline (e.g., "El perfume que suena como tu historia")
   - 2-3 relevant hashtags
   - Detailed execution description (2-3 sentences)
   - Optional extra activation idea

3. **Influencer Pool Analysis** - Categorize influencers by:
   - Segment (e.g., "For Her & For Him", "For Her", "For Him")
   - Detailed profile with: followers, ER%, gender split, geo, credible audience %
   - Specific deliverables (e.g., "1 Reel colaborativo, 2 Stories")
   - Strategic reason for selection (why they fit the campaign)

4. **Recommended Scenario** - Include:
   - Influencer mix by segment
   - Content plan breakdown (reels, stories, posts, etc.)
   - Projected impressions
   - Budget allocation
   - CPM calculation

5. **Target Strategy** - Psychographic and demographic insights (4-5 points)
6. **Media Strategy** - Platform-specific content approach with rationale
7. **Next Steps** - Timeline with specific phases and deliverables
8. **Recommendations** - Strategic advice for campaign optimization

**TONE & STYLE:**
- Write in sophisticated, insight-driven language
- Use Spanish where culturally appropriate (titles, hashtags, claims)
- Be specific, not generic (avoid "engaging content", use "Instagram Reels featuring first concert stories")
- Think like a premium agency: strategic, creative, data-informed

**RETURN AS JSON:**
{
  "campaignSummary": {
    "budget": "€75,000",
    "territory": "Música y Lifestyle",
    "target": "Hombres y Mujeres 25-65+",
    "period": "Octubre",
    "objective": "Awareness y cobertura (lanzamiento)"
  },
  "creativeIdeas": [
    {
      "title": "Creative concept title",
      "claim": "Powerful tagline or claim",
      "hashtags": ["#HashtagOne", "#HashtagTwo"],
      "execution": "Detailed description of how this would be executed...",
      "extra": "Optional: Additional activation idea"
    }
  ],
  "influencerPool": [
    {
      "category": "For Her & For Him",
      "influencers": [
        {
          "name": "Influencer Name",
          "followers": 194600,
          "engagement": "8%",
          "genderSplit": {"female": 54, "male": 46},
          "geo": "66% España",
          "credibleAudience": "92%",
          "deliverables": ["1 Reel colaborativo", "2 Stories"],
          "reason": "Strategic rationale for this influencer"
        }
      ]
    }
  ],
  "recommendedScenario": {
    "influencerMix": {
      "forHer": ["Name 1", "Name 2"],
      "forHim": ["Name 3", "Name 4"],
      "unisex": ["Name 5"]
    },
    "contentPlan": {
      "reels": 5,
      "stories": 10,
      "posts": 3,
      "tiktoks": 2
    },
    "impressions": "3.5M",
    "budget": "€${brief.budget.toLocaleString()}",
    "cpm": "Calculated CPM"
  },
  "targetStrategy": ["Insight 1", "Insight 2", "..."],
  "mediaStrategy": {
    "platforms": [
      {
        "name": "Instagram",
        "content": ["Content type 1", "Content type 2"],
        "frequency": "3x per week",
        "rationale": "Why this approach works"
      }
    ],
    "overview": "Overall media strategy narrative"
  },
  "nextSteps": [
    {
      "phase": "Discovery & Briefing",
      "duration": "Week 1-2",
      "description": "Specific deliverables and actions"
    }
  ],
  "recommendations": ["Recommendation 1", "Recommendation 2", "..."],
  "confidence": 90
}`;

  try {
    const response = await withRetry(
      () => openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a professional presentation content writer for an influencer marketing agency. Always return valid JSON without markdown formatting."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
      RetryPresets.STANDARD
    );

    const text = response.choices[0]?.message?.content || "{}";
    const content = JSON.parse(text);
    
    // Cache the result
    contentCache.set(cacheKey, content);
    
    logAPIUsage('openai', 'content_generation', {
      tokens: response.usage?.total_tokens,
      cost: (response.usage?.total_tokens || 0) * 0.0000015, // Approximate cost
      model: 'gpt-4o-mini',
      success: true
    });
    
    return content;
  } catch (error) {
    logError(error, {
      function: 'generatePresentationContent',
      clientName: brief.clientName,
      influencerCount: influencers.length
    });
    
    logAPIUsage('openai', 'content_generation', {
      model: 'gpt-4o-mini',
      success: false
    });
    
    throw new OpenAIError(
      "Failed to generate presentation content",
      "content_generation_failed"
    );
  }
};
