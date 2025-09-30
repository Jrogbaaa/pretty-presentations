import type {
  ClientBrief,
  Slide,
  SlideType,
  SelectedInfluencer,
  SlideDesign,
} from "@/types";
import type { TemplateStyle } from "@/types/templates";
import { generateId } from "./ai-processor";

interface PresentationContent {
  objective: string;
  targetStrategy: string[];
  creativeStrategy: string[];
  briefSummary: string[];
  talentRationale: string;
  mediaStrategy: {
    platforms: Array<{ name: string; content: string[]; frequency: string }>;
    overview: string;
  };
  nextSteps: Array<{ phase: string; duration: string; description: string }>;
  recommendations: string[];
  confidence: number;
}

export const generateTemplateSlides = async (
  brief: ClientBrief,
  influencers: SelectedInfluencer[],
  content: PresentationContent,
  template: TemplateStyle
): Promise<Slide[]> => {
  const slides: Slide[] = [];

  // Create design based on template
  const createDesign = (overrides?: Partial<SlideDesign>): SlideDesign => ({
    backgroundColor: template.colorPalette.background,
    textColor: template.colorPalette.text,
    accentColor: template.colorPalette.accent,
    fontFamily: template.typography.bodyFont,
    layout: "single-column",
    ...overrides,
  });

  // 1. Cover Slide (Template-specific)
  slides.push(createCoverSlide(brief, template, createDesign));

  // 2. Campaign Summary / Index
  slides.push(createSummarySlide(brief, template, createDesign));

  // 3. Objective Slide
  slides.push(createObjectiveSlide(content, template, createDesign));

  // 4. Briefing / Brief Summary Slide
  slides.push(createBriefingSlide(brief, content, template, createDesign));

  // 5. Creative Strategy Slides (can be multiple based on template)
  slides.push(...createCreativeSlides(content, brief, template, createDesign));

  // 6. Target Strategy
  slides.push(createTargetSlide(brief, content, template, createDesign));

  // 7. Talent Strategy
  slides.push(createTalentSlide(influencers, content, template, createDesign));

  // 8. Media Strategy
  slides.push(createMediaSlide(content, brief, template, createDesign));

  // 9. Budget Slide (for Scalpers-style)
  if (template.id === "scalpers-lifestyle") {
    slides.push(createBudgetSlide(influencers, brief, template, createDesign));
  }

  // 10. Next Steps
  slides.push(createNextStepsSlide(content, template, createDesign));

  return slides;
};

// COVER SLIDE
const createCoverSlide = (
  brief: ClientBrief,
  template: TemplateStyle,
  createDesign: (overrides?: Partial<SlideDesign>) => SlideDesign
): Slide => {
  let backgroundColor = template.colorPalette.primary;
  const textColor = template.colorPalette.text;

  // Template-specific styling
  if (template.id === "red-bull-event") {
    backgroundColor = "#0A0E27"; // Dark blue-black
  } else if (template.id === "scalpers-lifestyle") {
    backgroundColor = "#000000"; // Pure black
  }

  return {
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
        day: "numeric",
      }),
      customData: {
        templateStyle: template.id,
        mood: template.mood,
      },
    },
    design: createDesign({
      backgroundColor,
      textColor,
      layout: "single-column",
    }),
  };
};

// SUMMARY SLIDE
const createSummarySlide = (
  brief: ClientBrief,
  template: TemplateStyle,
  createDesign: (overrides?: Partial<SlideDesign>) => SlideDesign
): Slide => {
  const isScalpers = template.id === "scalpers-lifestyle";

  return {
    id: generateId(),
    type: "index" as SlideType,
    order: 1,
    title: isScalpers ? "Campaign Summary" : "Índice",
    content: {
      title: isScalpers ? "Campaign Summary" : "Índice",
      bullets: isScalpers
        ? [] // Scalpers uses key numbers instead
        : [
            "Presentation Objective",
            "Creative Strategy",
            "Target Strategy",
            "Talent Strategy",
            "Media Strategy",
            "Next Steps",
          ],
      customData: {
        keyNumbers: isScalpers
          ? {
              budget: `€${brief.budget.toLocaleString()}`,
              target: brief.targetDemographics.ageRange,
              period: brief.timeline,
              platforms: brief.platformPreferences.join(", "),
            }
          : null,
      },
    },
    design: createDesign({
      layout: isScalpers ? "two-column" : "single-column",
    }),
  };
};

// OBJECTIVE SLIDE
const createObjectiveSlide = (
  content: PresentationContent,
  template: TemplateStyle,
  createDesign: (overrides?: Partial<SlideDesign>) => SlideDesign
): Slide => {
  const isRedBull = template.id === "red-bull-event";

  return {
    id: generateId(),
    type: "objective" as SlideType,
    order: 2,
    title: "Campaign Objective",
    content: {
      title: isRedBull ? "OBJECTIVE" : "Campaign Objective",
      subtitle: template.id === "scalpers-lifestyle" ? "AWARENESS" : undefined,
      body: content.objective,
      customData: {
        layout: isRedBull ? "split" : "centered",
      },
    },
    design: createDesign({
      layout: isRedBull ? "two-column" : "single-column",
    }),
  };
};

// BRIEFING SLIDE
const createBriefingSlide = (
  brief: ClientBrief,
  content: PresentationContent,
  template: TemplateStyle,
  createDesign: (overrides?: Partial<SlideDesign>) => SlideDesign
): Slide => {
  const isRedBull = template.id === "red-bull-event";

  return {
    id: generateId(),
    type: "brief-summary" as SlideType,
    order: 3,
    title: "Briefing",
    content: {
      title: "Briefing",
      bullets: content.briefSummary,
      customData: {
        gridLayout: isRedBull,
        columns: isRedBull
          ? [
              { title: "Goal", items: brief.campaignGoals },
              { title: "Target", items: [brief.targetDemographics.ageRange] },
              { title: "Timing", items: [brief.timeline] },
              { title: "Platforms", items: brief.platformPreferences },
            ]
          : null,
      },
    },
    design: createDesign({
      layout: isRedBull ? "grid" : "single-column",
      backgroundColor: isRedBull ? "#F9FAFB" : template.colorPalette.background,
    }),
  };
};

// CREATIVE STRATEGY SLIDES
const createCreativeSlides = (
  content: PresentationContent,
  brief: ClientBrief,
  template: TemplateStyle,
  createDesign: (overrides?: Partial<SlideDesign>) => SlideDesign
): Slide[] => {
  const slides: Slide[] = [];

  if (template.id === "scalpers-lifestyle") {
    // Create 3 creative idea variations for Scalpers
    const creativeIdeas = [
      {
        title: "Creative Idea: Storytelling",
        subtitle: "First Memory",
        body: '"Mi primer concierto huele a cuero, adrenalina..." - Connect fragrance to powerful memories',
        layout: "single-column" as const,
      },
      {
        title: "Creative Idea: Lifestyle Ritual",
        subtitle: "Morning = Stage",
        body: "Daily routines become performance rituals. The perfume is the warm-up before the show.",
        layout: "two-column" as const,
      },
      {
        title: "Creative Idea: Archetypes",
        subtitle: "Band Roles",
        body: "Each influencer embodies a band member archetype: Vocalist, Guitarist, Drummer",
        layout: "grid" as const,
      },
    ];

    creativeIdeas.forEach((idea, index) => {
      slides.push({
        id: generateId(),
        type: "creative-strategy" as SlideType,
        order: 4 + index,
        title: idea.title,
        content: {
          title: idea.title,
          subtitle: idea.subtitle,
          body: idea.body,
          bullets: index === 0 ? content.creativeStrategy : [],
        },
        design: createDesign({
          layout: idea.layout,
          backgroundColor: "#1A1A1A",
        }),
      });
    });
  } else if (template.id === "red-bull-event") {
    // Single concept slide with full-width photo style
    slides.push({
      id: generateId(),
      type: "creative-strategy" as SlideType,
      order: 4,
      title: "Concept",
      content: {
        title: "Concept",
        bullets: content.creativeStrategy,
        customData: {
          photoStyle: "full-width",
          overlayText: true,
        },
      },
      design: createDesign({
        layout: "single-column",
        backgroundColor: "#001489",
      }),
    });
  } else {
    // Default creative strategy
    slides.push({
      id: generateId(),
      type: "creative-strategy" as SlideType,
      order: 4,
      title: "Creative Strategy",
      content: {
        title: "Creative Strategy",
        subtitle: "Content Approach & Themes",
        bullets: content.creativeStrategy,
      },
      design: createDesign(),
    });
  }

  return slides;
};

// TARGET STRATEGY
const createTargetSlide = (
  brief: ClientBrief,
  content: PresentationContent,
  template: TemplateStyle,
  createDesign: (overrides?: Partial<SlideDesign>) => SlideDesign
): Slide => {
  return {
    id: generateId(),
    type: "target-strategy" as SlideType,
    order: 7,
    title: "Target Strategy",
    content: {
      title: "Target Strategy",
      subtitle: "Understanding Your Audience",
      bullets: content.targetStrategy,
      customData: {
        demographics: brief.targetDemographics,
      },
    },
    design: createDesign({
      layout: "two-column",
    }),
  };
};

// TALENT STRATEGY
const createTalentSlide = (
  influencers: SelectedInfluencer[],
  content: PresentationContent,
  template: TemplateStyle,
  createDesign: (overrides?: Partial<SlideDesign>) => SlideDesign
): Slide => {
  const isScalpers = template.id === "scalpers-lifestyle";

  return {
    id: generateId(),
    type: "talent-strategy" as SlideType,
    order: 8,
    title: isScalpers ? "Influencer Pool" : "Talent Strategy",
    content: {
      title: isScalpers ? "Influencer Pool" : "Talent Strategy",
      subtitle: isScalpers ? "Her & Him" : "Recommended Influencer Mix",
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
      customData: {
        layoutStyle: isScalpers ? "profile-rows" : "grid-cards",
      },
    },
    design: createDesign({
      layout: isScalpers ? "two-column" : "grid",
    }),
  };
};

// MEDIA STRATEGY
const createMediaSlide = (
  content: PresentationContent,
  brief: ClientBrief,
  template: TemplateStyle,
  createDesign: (overrides?: Partial<SlideDesign>) => SlideDesign
): Slide => {
  return {
    id: generateId(),
    type: "media-strategy" as SlideType,
    order: 9,
    title: "Media Strategy",
    content: {
      title: "Media Strategy",
      subtitle: "Platform Breakdown & Content Plan",
      body: content.mediaStrategy.overview,
      customData: {
        platforms: content.mediaStrategy.platforms,
      },
    },
    design: createDesign({
      layout: "two-column",
    }),
  };
};

// BUDGET SLIDE (Scalpers-specific)
const createBudgetSlide = (
  influencers: SelectedInfluencer[],
  brief: ClientBrief,
  template: TemplateStyle,
  createDesign: (overrides?: Partial<SlideDesign>) => SlideDesign
): Slide => {
  const totalCost = influencers.reduce((sum, inf) => sum + inf.costEstimate, 0);
  const totalImpressions = influencers.reduce((sum, inf) => sum + inf.estimatedReach, 0);
  const cpm = ((totalCost / totalImpressions) * 1000).toFixed(2);

  return {
    id: generateId(),
    type: "brief-summary" as SlideType,
    order: 10,
    title: "Budget",
    content: {
      title: "Budget",
      customData: {
        budgetTable: {
          totalCost: `€${totalCost.toLocaleString()}`,
          deliverables: `${influencers.length} influencers, ${influencers.length * 3} pieces of content`,
          impressions: totalImpressions.toLocaleString(),
          cpm: `€${cpm}`,
        },
      },
    },
    design: createDesign({
      backgroundColor: "#000000",
      textColor: "#FFFFFF",
      layout: "single-column",
    }),
  };
};

// NEXT STEPS
const createNextStepsSlide = (
  content: PresentationContent,
  template: TemplateStyle,
  createDesign: (overrides?: Partial<SlideDesign>) => SlideDesign
): Slide => {
  const isRedBull = template.id === "red-bull-event";

  return {
    id: generateId(),
    type: "next-steps" as SlideType,
    order: 11,
    title: isRedBull ? "Event Flow" : "Next Steps",
    content: {
      title: isRedBull ? "Event Flow" : "Next Steps",
      subtitle: isRedBull ? "Timeline & Phases" : "Timeline & Milestones",
      timeline: content.nextSteps,
      customData: {
        contactInfo: {
          agency: "Look After You",
          email: "hello@lookafteryou.agency",
          phone: "+34 XXX XXX XXX",
        },
        flowStyle: isRedBull ? "horizontal-timeline" : "vertical-phases",
      },
    },
    design: createDesign({
      backgroundColor:
        template.id === "scalpers-lifestyle"
          ? "#000000"
          : template.id === "red-bull-event"
          ? "#0A0E27"
          : "#111827",
      textColor: "#FFFFFF",
    }),
  };
};
