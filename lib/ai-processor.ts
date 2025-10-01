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

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  try {
    const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, ""));
    return parsed;
  } catch (error) {
    console.error("Error parsing AI response:", error);
    
    // Calculate CPM for fallback
    const totalCost = influencers.reduce((sum, inf) => sum + (inf.costEstimate || 0), 0);
    const totalReach = influencers.reduce((sum, inf) => sum + inf.estimatedReach, 0);
    const cpm = totalReach > 0 ? ((totalCost / totalReach) * 1000).toFixed(2) : "0";
    
    // Enhanced fallback content with new structure
    return {
      campaignSummary: {
        budget: `€${brief.budget.toLocaleString()}`,
        territory: brief.contentThemes?.join(" y ") || "Digital Campaign",
        target: brief.targetDemographics.ageRange,
        period: brief.timeline,
        objective: "Awareness y engagement"
      },
      creativeIdeas: [
        {
          title: "Creative Idea: Authentic Storytelling",
          claim: "Historias reales, conexión auténtica",
          hashtags: ["#AuthenticStories", "#RealConnections"],
          execution: "Influencers share personal stories that connect with the brand values, creating emotional resonance with the audience through genuine narrative.",
          extra: "User-generated content campaign encouraging followers to share their own stories"
        },
        {
          title: "Creative Idea: Lifestyle Integration",
          claim: "Tu vida, nuestro producto",
          hashtags: ["#LifestyleIntegration", "#EverydayMoments"],
          execution: "Seamless product integration into daily routines, showing natural usage scenarios that inspire and educate the audience.",
        },
        {
          title: "Creative Idea: Community Building",
          claim: "Juntos somos más",
          hashtags: ["#CommunityFirst", "#TogetherStronger"],
          execution: "Create a sense of community through collaborative content, challenges, and interactive experiences that bring followers together.",
        }
      ],
      influencerPool: [
        {
          category: "Primary Selection",
          influencers: influencers.slice(0, 5).map(inf => ({
            name: inf.name,
            followers: inf.followers,
            engagement: `${inf.engagement}%`,
            genderSplit: { female: 50, male: 50 },
            geo: "España (Primary)",
            credibleAudience: "90%+",
            deliverables: ["1 Reel", "2 Stories", "1 Post"],
            reason: `Strong alignment with brand values and excellent engagement rate of ${inf.engagement}%. Authentic voice that resonates with target audience.`
          }))
        }
      ],
      recommendedScenario: {
        influencerMix: {
          forHer: influencers.slice(0, 2).map(i => i.name),
          forHim: influencers.slice(2, 4).map(i => i.name),
          unisex: influencers.slice(4, 5).map(i => i.name)
        },
        contentPlan: {
          reels: influencers.length,
          stories: influencers.length * 2,
          posts: Math.floor(influencers.length * 0.5),
        },
        impressions: totalReach.toLocaleString(),
        budget: `€${totalCost.toLocaleString()}`,
        cpm: `€${cpm}`
      },
      targetStrategy: [
        `Primary audience: ${brief.targetDemographics.ageRange}, ${brief.targetDemographics.gender}`,
        `Geographic focus: ${brief.targetDemographics.location.join(", ")}`,
        `Key interests: ${brief.targetDemographics.interests.join(", ")}`,
        `Psychographic: Values authenticity, seeks inspiration, engaged with lifestyle content`,
      ],
      mediaStrategy: {
        platforms: brief.platformPreferences.map(p => ({
          name: p,
          content: ["Reels", "Stories", "Collaborative Posts"],
          frequency: "3-4x per week",
          rationale: `${p} offers strong engagement with target demographic and supports varied content formats`
        })),
        overview: "Multi-platform approach prioritizing video content and authentic storytelling to maximize reach and engagement",
      },
      nextSteps: [
        { phase: "Discovery & Briefing", duration: "Week 1-2", description: "Finalize creative concepts, brief influencers, align on content calendar" },
        { phase: "Production", duration: "Week 3-4", description: "Content creation, review cycles, approvals" },
        { phase: "Launch & Amplification", duration: "Week 5", description: "Content goes live, paid amplification begins" },
        { phase: "Optimization & Reporting", duration: "Ongoing", description: "Monitor performance, optimize approach, deliver insights" },
      ],
      recommendations: [
        "Consider paid amplification for top-performing content to extend reach",
        "Build long-term ambassadorships with highest performers",
        "Leverage user-generated content to build community",
        "Test varied content formats to identify what resonates best"
      ],
      confidence: 85,
      // Legacy fields for backward compatibility
      objective: `Drive brand awareness and engagement for ${brief.clientName} through strategic influencer partnerships.`,
      creativeStrategy: [
        "Authentic storytelling aligned with brand values",
        "High-quality visual content optimized for each platform",
        "Mix of educational and entertaining formats",
      ],
      briefSummary: brief.campaignGoals,
      talentRationale: `We've selected ${influencers.length} influencers who align perfectly with your brand values and target audience. Each creator brings a unique voice and engaged community that will amplify your message authentically.`,
    };
  }
};

const generateId = (): string => {
  return `pres_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export { generateId };
