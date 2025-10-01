import type {
  ClientBrief,
  Slide,
  SlideType,
  SelectedInfluencer,
  SlideDesign,
} from "@/types";
import { generateId } from "./ai-processor";

interface PresentationContent {
  campaignSummary: {
    budget: string;
    territory: string;
    target: string;
    period: string;
    objective: string;
  };
  creativeIdeas: Array<{
    title: string;
    claim: string;
    hashtags: string[];
    execution: string;
    extra?: string;
  }>;
  influencerPool: Array<{
    category: string;
    influencers: Array<{
      name: string;
      followers: number;
      engagement: string;
      genderSplit: { female: number; male: number };
      geo: string;
      credibleAudience: string;
      deliverables: string[];
      reason: string;
    }>;
  }>;
  recommendedScenario: {
    influencerMix: {
      forHer?: string[];
      forHim?: string[];
      unisex?: string[];
    };
    contentPlan: {
      reels?: number;
      stories?: number;
      posts?: number;
      tiktoks?: number;
      [key: string]: number | undefined;
    };
    impressions: string;
    budget: string;
    cpm: string;
  };
  targetStrategy: string[];
  mediaStrategy: {
    platforms: Array<{ 
      name: string; 
      content: string[]; 
      frequency: string;
      rationale?: string;
    }>;
    overview: string;
  };
  nextSteps: Array<{ phase: string; duration: string; description: string }>;
  recommendations: string[];
  confidence: number;
  // Legacy fields for backward compatibility
  objective?: string;
  creativeStrategy?: string[];
  briefSummary?: string[];
  talentRationale?: string;
}

export const generateSlides = async (
  brief: ClientBrief,
  influencers: SelectedInfluencer[],
  content: PresentationContent
): Promise<Slide[]> => {
  const defaultDesign: SlideDesign = {
    backgroundColor: "#FFFFFF",
    layout: "single-column",
    textColor: "#1F2937",
    accentColor: "#3B82F6",
    fontFamily: "Inter, sans-serif",
  };

  const slides: Slide[] = [];

  // 1. Portada (Cover)
  slides.push({
    id: generateId(),
    type: "cover" as SlideType,
    order: 0,
    title: "Portada",
    content: {
      title: brief.campaignGoals[0] || "Campaign Proposal",
      subtitle: brief.clientName,
      body: new Date().toLocaleDateString("es-ES", { 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
      }),
    },
    design: {
      ...defaultDesign,
      backgroundColor: "#111827",
      textColor: "#FFFFFF",
      layout: "single-column",
    },
  });

  // 2. Índice (Index)
  const indexItems = [
    "Presentation Objective",
    "Target Strategy",
    "Creative Strategy",
    "Brief Summary",
    "Talent Strategy",
    "Media Strategy",
    "Next Steps",
  ];
  
  slides.push({
    id: generateId(),
    type: "index" as SlideType,
    order: 1,
    title: "Índice",
    content: {
      title: "Índice",
      bullets: indexItems,
      customData: {
        estimatedReadTime: "10 minutes",
      },
    },
    design: defaultDesign,
  });

  // 3. Presentation Objective
  slides.push({
    id: generateId(),
    type: "objective" as SlideType,
    order: 2,
    title: "Presentation Objective",
    content: {
      title: "Presentation Objective",
      body: content.objective,
      bullets: brief.campaignGoals,
    },
    design: defaultDesign,
  });

  // 4. Target Strategy
  slides.push({
    id: generateId(),
    type: "target-strategy" as SlideType,
    order: 3,
    title: "Target Strategy",
    content: {
      title: "Target Strategy",
      subtitle: "Understanding Your Audience",
      bullets: content.targetStrategy,
      customData: {
        demographics: brief.targetDemographics,
      },
    },
    design: {
      ...defaultDesign,
      layout: "two-column",
    },
  });

  // 5. Creative Strategy
  slides.push({
    id: generateId(),
    type: "creative-strategy" as SlideType,
    order: 4,
    title: "Creative Strategy",
    content: {
      title: "Creative Strategy",
      subtitle: "Content Approach & Themes",
      bullets: content.creativeStrategy,
      customData: {
        themes: brief.contentThemes,
      },
    },
    design: defaultDesign,
  });

  // 6. Brief Summary
  slides.push({
    id: generateId(),
    type: "brief-summary" as SlideType,
    order: 5,
    title: "Brief Summary",
    content: {
      title: "Brief Summary",
      subtitle: "Client Requirements at a Glance",
      bullets: content.briefSummary,
      customData: {
        budget: `€${brief.budget.toLocaleString()}`,
        timeline: brief.timeline,
        platforms: brief.platformPreferences,
      },
    },
    design: {
      ...defaultDesign,
      backgroundColor: "#F3F4F6",
      accentColor: "#10B981",
    },
  });

  // 7. Talent Strategy
  slides.push({
    id: generateId(),
    type: "talent-strategy" as SlideType,
    order: 6,
    title: "Talent Strategy",
    content: {
      title: "Talent Strategy",
      subtitle: "Recommended Influencer Mix",
      body: content.talentRationale,
      influencers: influencers,
      metrics: [
        {
          label: "Total Reach",
          value: influencers.reduce((sum, inf) => sum + inf.estimatedReach, 0).toLocaleString(),
        },
        {
          label: "Total Engagement",
          value: influencers.reduce((sum, inf) => sum + inf.estimatedEngagement, 0).toLocaleString(),
        },
        {
          label: "Avg. Engagement Rate",
          value: `${(influencers.reduce((sum, inf) => sum + inf.engagement, 0) / influencers.length).toFixed(1)}%`,
        },
        {
          label: "Total Investment",
          value: `€${influencers.reduce((sum, inf) => sum + inf.costEstimate, 0).toLocaleString()}`,
        },
      ],
    },
    design: {
      ...defaultDesign,
      layout: "grid",
    },
  });

  // 8. Media Strategy
  slides.push({
    id: generateId(),
    type: "media-strategy" as SlideType,
    order: 7,
    title: "Media Strategy",
    content: {
      title: "Media Strategy",
      subtitle: "Platform Breakdown & Content Plan",
      body: content.mediaStrategy.overview,
      customData: {
        platforms: content.mediaStrategy.platforms,
      },
    },
    design: {
      ...defaultDesign,
      layout: "two-column",
    },
  });

  // 9. Next Steps
  slides.push({
    id: generateId(),
    type: "next-steps" as SlideType,
    order: 8,
    title: "Next Steps",
    content: {
      title: "Next Steps",
      subtitle: "Timeline & Milestones",
      timeline: content.nextSteps,
      customData: {
        contactInfo: {
          agency: "Look After You",
          email: "hello@lookafteryou.agency",
          phone: "+34 XXX XXX XXX",
        },
      },
    },
    design: {
      ...defaultDesign,
      backgroundColor: "#111827",
      textColor: "#FFFFFF",
    },
  });

  return slides;
};
