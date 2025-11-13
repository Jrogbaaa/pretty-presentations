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
    // NOTE: matchInfluencers now automatically includes brand intelligence!
    // It looks up the brand in the database (218+ brands) and enhances the brief
    // For unknown brands, AI finds similar brands and uses their profile
    timer.lap('matching-start');
    const matchedInfluencers = await matchInfluencers(brief, influencerPool);
    timer.lap('matching-complete');
    
    logInfo('Influencer matching complete', {
      matchedCount: matchedInfluencers.length,
      totalBudget: matchedInfluencers.reduce((sum, inf) => sum + (inf.costEstimate || 0), 0),
      brandIntelligenceUsed: brief.additionalNotes?.includes('Brand Profile:') || false
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
    let slides = await generateTemplateSlides(
      brief,
      matchedInfluencers,
      presentationContent,
      template
    );
    timer.lap('slide-generation-complete');

    // Step 5.5: Generate images for slides using Nano Banana
    timer.lap('image-generation-start');
    try {
      const { generateImagesForSlides } = await import('./replicate-image-service');
      slides = await generateImagesForSlides(slides, brief);
      logInfo('Image generation complete', {
        slidesWithImages: slides.filter(s => s.content.images?.length).length,
        totalSlides: slides.length
      });
    } catch (error) {
      logError('Image generation failed, continuing without images', { error });
      // Continue without images if generation fails
    }
    timer.lap('image-generation-complete');

    // Step 6: Create presentation object
    const presentation: Presentation = {
      id: Date.now().toString(),
      campaignName: brief.campaignGoals?.[0] || "Influencer Campaign",
      clientName: brief.clientName,
      createdAt: new Date(),
      updatedAt: new Date(),
      slides,
      brief,
      status: "draft",
      templateId: brief.templateId || "default",
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

/**
 * Reflect on and refine generated presentation content
 * This second-pass improves quality, specificity, and creative depth
 */
const refinePresentationContent = async (
  initialContent: any,
  brief: ClientBrief,
  influencers: SelectedInfluencer[]
): Promise<any> => {
  const openai = getOpenAI();

  const hasSalesGoal = brief.campaignGoals.some(g => {
    const lower = g.toLowerCase();
    return lower.includes('ventas') || lower.includes('sales') || lower.includes('conversión') || lower.includes('revenue');
  });
  
  const reflectionPrompt = `You are a senior business strategist reviewing a campaign presentation. Your task is to ensure this presentation demonstrates clear business value and revenue potential - not just creative concepts.

**CRITICAL MINDSET: This is a REVENUE GENERATION SYSTEM, not a creative showcase.**

**ORIGINAL CONTENT (JSON):**
${JSON.stringify(initialContent, null, 2)}

**CLIENT CONTEXT:**
- Client: ${brief.clientName}
- Campaign Goals: ${brief.campaignGoals.join(', ')}
- Budget: €${brief.budget.toLocaleString()}
- Target Audience: ${brief.targetDemographics.ageRange}, ${brief.targetDemographics.gender}
- Content Themes: ${brief.contentThemes?.join(', ') || 'General'}
${hasSalesGoal ? '- **PRIMARY OBJECTIVE:** Drive measurable sales and revenue outcomes' : ''}

**MATCHED INFLUENCERS:**
${influencers.map(i => `- ${i.name} (@${i.handle}): ${i.followers.toLocaleString()} followers, ${i.engagement}% ER`).join('\n')}

**QUALITY ISSUES TO FIX:**

❌ **Generic Creative Ideas Without Business Logic** - Each creative idea must:
   - Have a unique, memorable title tied to ${brief.clientName}'s value proposition (not "Social Media Campaign")
   - Include a compelling claim/tagline that triggers a buying behavior (urgency, social proof, trust)
   - Feature detailed execution with clear conversion path (awareness → consideration → purchase)
   - Explain HOW this drives revenue/conversions, not just engagement
   - Reference specific content formats and their psychological impact on customers

❌ **Template-like Campaign Summary Missing Strategic Context** - Must:
   - Start with the business problem ${brief.clientName} is solving
   - Quantify expected outcomes (projected revenue, ROIS, conversion rates)
   - Reflect actual campaign goals with measurable success criteria
   - Sound like a business investment proposal, not a creative brief

❌ **Vague Target Strategy Without Behavioral Insights** - Each insight must:
   - Explain the target's buying behavior and decision-making process
   - Reference psychographic insights (values, fears, aspirations that drive purchases)
   - Connect to specific marketing psychology principles (scarcity, authority, social proof)
   - Explain HOW this insight translates to conversions

❌ **Generic Recommendations Without ROI Context** - Must:
   - Be specific to ${brief.clientName}'s industry and competitive positioning
   - Include concrete tactics with expected business impact
   - Reference proven marketing principles and why they work for ${brief.clientName}
   - Quantify expected outcomes (even if estimated)

❌ **Weak Influencer Rationales Missing Strategic Value** - Each influencer's "reason" must:
   - Explain their strategic fit for ${brief.clientName}'s business goals
   - Reference their specific audience's buying behavior and trust level
   - Connect to campaign goals with clear conversion logic
   - Explain WHY this influencer will drive revenue (not just engagement)

**YOUR TASK:**
1. Review each section with a BUSINESS LENS (not a creative lens)
2. Ask: "How does this drive revenue for ${brief.clientName}?" for every element
3. Rewrite weak sections to emphasize business outcomes and strategic value
4. Quantify expected outcomes wherever possible
5. Ensure the presentation feels like a revenue investment proposal
6. Keep strong, strategic sections unchanged

**CRITICAL STANDARDS:**
- **Revenue Focus:** Every creative idea must have a clear path to conversions/sales
- **Strategic Depth:** Reference customer psychology, competitive positioning, conversion tactics
- **Quantification:** Include projected outcomes (ROIS, conversion rates, revenue estimates)
- **Brand-Specific:** ${brief.clientName}-specific tactics that couldn't apply to any generic brand
- **Business Language:** Sound like a strategist presenting to a CFO, not a creative to a CMO
${hasSalesGoal ? '- **ROIS Emphasis:** For sales campaigns, every section should reinforce revenue potential' : ''}

Return the COMPLETE improved JSON structure. Maintain exact same JSON schema and structure.`;

  try {
    const timer = startTimer('refinePresentationContent');
    
    const response = await withRetry(
      () => openai.chat.completions.create({
        model: "gpt-4o-mini", // Faster and cheaper for refinement
        messages: [
          {
            role: "system",
            content: "You are a senior business strategist who refines campaign presentations to demonstrate clear revenue potential and business value. Focus on strategic depth, quantifiable outcomes, and conversion logic. This is a revenue generation system, not a creative portfolio. Always return valid JSON without markdown formatting."
          },
          {
            role: "user",
            content: reflectionPrompt
          }
        ],
        temperature: 0.7, // Maintain creativity in refinement
        response_format: { type: "json_object" }
      }),
      RetryPresets.STANDARD
    );

    const text = response.choices[0]?.message?.content || JSON.stringify(initialContent);
    const refinedContent = JSON.parse(text);
    
    const duration = timer.stop({ success: true });
    
    logInfo('Presentation content refined', {
      duration,
      tokens: response.usage?.total_tokens,
      hasCreativeIdeas: !!refinedContent.creativeIdeas,
      creativeIdeasCount: refinedContent.creativeIdeas?.length || 0
    });

    logAPIUsage('openai', 'content_refinement', {
      tokens: response.usage?.total_tokens,
      cost: (response.usage?.total_tokens || 0) * 0.0000015,
      model: 'gpt-4o-mini',
      success: true
    });

    return refinedContent;
  } catch (error) {
    logError(error, { 
      function: 'refinePresentationContent',
      fallbackToInitial: true 
    });
    
    logAPIUsage('openai', 'content_refinement', {
      model: 'gpt-4o-mini',
      success: false
    });
    
    // Graceful degradation: return initial content if refinement fails
    return initialContent;
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
  
  // Extract brand intelligence if available
  const hasBrandIntelligence = brief.additionalNotes?.includes('Brand Profile:');
  const brandContext = hasBrandIntelligence ? `\n\n**BRAND INTELLIGENCE:**
${brief.additionalNotes}

This brand intelligence was automatically retrieved from our database of 218+ Spanish brands and should inform your creative strategy and influencer selection rationale.` : '';
  
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
Content Themes: ${brief.contentThemes?.join(", ") || "Lifestyle, Authenticity, Aspiration"}${brandContext}

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
   - Detailed profile with: name, Instagram handle (@username), followers, ER%, gender split, geo, credible audience %
   - Specific deliverables (e.g., "1 Reel colaborativo, 2 Stories")
   - Strategic reason for selection (why they fit the campaign)
   - IMPORTANT: Always include the Instagram handle for each influencer

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
- ${hasBrandIntelligence ? 'IMPORTANT: Leverage the brand intelligence provided above to create highly relevant, brand-aligned creative concepts and justify influencer selections based on brand identity and target audience' : 'Use available brief information to create relevant creative concepts'}

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
          "handle": "@instagramhandle",
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
    
    logAPIUsage('openai', 'content_generation', {
      tokens: response.usage?.total_tokens,
      cost: (response.usage?.total_tokens || 0) * 0.0000015, // Approximate cost
      model: 'gpt-4o-mini',
      success: true
    });
    
    // Step 2: Reflection & Refinement
    // Run the content through a second LLM pass to improve quality and specificity
    logInfo('Starting presentation content refinement (second pass)', {
      hasCreativeIdeas: !!content.creativeIdeas,
      creativeIdeasCount: content.creativeIdeas?.length || 0
    });
    
    const refinedContent = await refinePresentationContent(content, brief, influencers);
    
    // Cache the refined result
    contentCache.set(cacheKey, refinedContent);
    
    return refinedContent;
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
