import { model } from "./firebase";
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

    // Step 2: Match influencers using AI
    const matchedInfluencers = await matchInfluencers(brief, influencerPool);

    // Step 3: Determine or recommend template
    const templateId: TemplateId = brief.templateId || recommendTemplate(
      brief.campaignGoals,
      brief.contentThemes,
      brief.clientName
    );
    const template = getTemplate(templateId);

    // Step 4: Generate presentation content with AI
    const presentationContent = await generatePresentationContent(brief, matchedInfluencers);

    // Step 5: Create slides with template
    const slides = await generateTemplateSlides(
      brief,
      matchedInfluencers,
      presentationContent,
      template
    );

    // Step 6: Assemble presentation
    const presentation: Presentation = {
      id: generateId(),
      clientName: brief.clientName,
      campaignName: brief.campaignGoals[0] || "Campaign",
      createdAt: new Date(),
      updatedAt: new Date(),
      slides,
      brief,
      status: "draft",
      templateId: templateId,
    };

    return {
      presentation,
      recommendations: presentationContent.recommendations,
      warnings: validationResult.warnings,
      confidence: presentationContent.confidence,
    };
  } catch (error) {
    console.error("Error processing brief:", error);
    throw error;
  }
};

const validateBrief = async (brief: ClientBrief) => {
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

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  
  try {
    const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, ""));
    return {
      isValid: parsed.completeness >= 70,
      warnings: parsed.warnings || [],
      completeness: parsed.completeness,
    };
  } catch {
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
  "nextSteps": [{"phase": "string", "duration": "string", "description": "string"}],
  "recommendations": ["rec1", "rec2", ...],
  "confidence": number
}

Write in professional, persuasive Spanish-influenced English. Be specific and data-driven.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  try {
    const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, ""));
    return parsed;
  } catch (error) {
    console.error("Error parsing AI response:", error);
    // Fallback content
    return {
      objective: `Drive brand awareness and engagement for ${brief.clientName} through strategic influencer partnerships.`,
      targetStrategy: [
        `Primary audience: ${brief.targetDemographics.ageRange}, ${brief.targetDemographics.gender}`,
        `Geographic focus: ${brief.targetDemographics.location.join(", ")}`,
        `Key interests: ${brief.targetDemographics.interests.join(", ")}`,
      ],
      creativeStrategy: [
        "Authentic storytelling aligned with brand values",
        "High-quality visual content optimized for each platform",
        "Mix of educational and entertaining formats",
      ],
      briefSummary: brief.campaignGoals,
      talentRationale: `We've selected ${influencers.length} influencers who align perfectly with your brand values and target audience.`,
      mediaStrategy: {
        platforms: brief.platformPreferences.map(p => ({
          name: p,
          content: ["Posts", "Stories", "Reels"],
          frequency: "3x per week",
        })),
        overview: "Multi-platform approach for maximum reach",
      },
      nextSteps: [
        { phase: "Approval", duration: "1 week", description: "Review and approve talent selection" },
        { phase: "Production", duration: "2 weeks", description: "Content creation and review" },
        { phase: "Launch", duration: "1 week", description: "Content goes live across platforms" },
        { phase: "Optimization", duration: "Ongoing", description: "Monitor and optimize performance" },
      ],
      recommendations: [
        "Consider paid amplification for top-performing content",
        "Build long-term relationships with top performers",
      ],
      confidence: 85,
    };
  }
};

const generateId = (): string => {
  return `pres_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export { generateId };
