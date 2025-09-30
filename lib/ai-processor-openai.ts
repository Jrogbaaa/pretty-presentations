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

/**
 * OpenAI-powered AI processor for presentation generation
 * Uses OpenAI for all text generation (more reliable than Google AI)
 * Google Vertex AI is still used for:
 * - Image generation/editing (Gemini 2.0 Flash Exp)
 * - Influencer ranking (in influencer-matcher.ts)
 */

const getOpenAI = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }
  return new OpenAI({ apiKey });
};

export const processBrief = async (
  brief: ClientBrief,
  influencerPool: Influencer[]
): Promise<AIProcessingResponse> => {
  try {
    // Step 1: Extract and validate brief information
    const validationResult = await validateBrief(brief);
    
    if (!validationResult.isValid) {
      return {
        presentation: {} as Presentation,
        recommendations: [],
        warnings: validationResult.warnings,
        confidence: 0,
      };
    }

    // Step 2: Match influencers using AI (uses Vertex AI for ranking)
    const matchedInfluencers = await matchInfluencers(brief, influencerPool);

    // Step 3: Determine or recommend template
    const templateId: TemplateId = brief.templateId || recommendTemplate(
      brief.campaignGoals,
      brief.contentThemes,
      brief.clientName
    );
    const template = getTemplate(templateId);

    // Step 4: Generate presentation content with OpenAI
    const presentationContent = await generatePresentationContent(brief, matchedInfluencers);

    // Step 5: Create slides with template
    const slides = await generateTemplateSlides(
      brief,
      matchedInfluencers,
      presentationContent,
      template
    );

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

    return {
      presentation,
      recommendations: presentationContent.recommendations || [],
      warnings: validationResult.warnings,
      confidence: presentationContent.confidence || 85,
    };
  } catch (error) {
    console.error("Error processing brief with OpenAI:", error);
    throw new Error("Failed to process brief. Please try again.");
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
    const response = await openai.chat.completions.create({
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
    });

    const text = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(text);
    
    return {
      isValid: parsed.completeness >= 70,
      warnings: parsed.warnings || [],
      completeness: parsed.completeness,
    };
  } catch (error) {
    console.error("Error validating brief:", error);
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
  const openai = getOpenAI();
  
  const prompt = `You are a professional presentation writer for Look After You, an influencer talent agency.

Create compelling, professional content for a client presentation based on this brief:

Client: ${brief.clientName}
Campaign Goals: ${brief.campaignGoals.join(", ")}
Budget: €${brief.budget}
Target Audience: ${JSON.stringify(brief.targetDemographics)}
Requirements: ${brief.brandRequirements.join(", ")}
Timeline: ${brief.timeline}
Platforms: ${brief.platformPreferences.join(", ")}

Selected Influencers: ${influencers.map(i => `${i.name} (@${i.handle}) - ${i.followers} followers, ${i.engagement}% engagement`).join("; ")}

Generate content for each section:

1. Presentation Objective (2-3 powerful sentences)
2. Target Strategy (audience insights, 4-5 bullet points)
3. Creative Strategy (content themes and approach, 4-5 bullet points)
4. Brief Summary (condensed highlights, 5-6 key points)
5. Talent Strategy Rationale (why these influencers, 3-4 paragraphs)
6. Media Strategy (platform breakdown and content plan, detailed)
7. Next Steps (timeline with 4-5 phases)
8. Recommendations for client success
9. Overall confidence score (0-100)

Return as JSON with this structure:
{
  "objective": "string",
  "targetStrategy": ["bullet1", "bullet2", ...],
  "creativeStrategy": ["bullet1", "bullet2", ...],
  "briefSummary": ["point1", "point2", ...],
  "talentRationale": "string (detailed paragraph)",
  "mediaStrategy": {
    "platforms": [{"name": "Instagram", "content": ["type1", "type2"], "frequency": "string"}],
    "overview": "string"
  },
  "nextSteps": [{"phase": "string", "description": "string", "timing": "string"}],
  "recommendations": ["rec1", "rec2", ...],
  "confidence": number
}`;

  try {
    const response = await openai.chat.completions.create({
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
    });

    const text = response.choices[0]?.message?.content || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating presentation content:", error);
    throw new Error("Failed to generate presentation content");
  }
};
