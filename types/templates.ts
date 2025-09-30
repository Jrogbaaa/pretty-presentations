/**
 * Presentation Template System
 * Defines template styles, layouts, and design guidelines
 */

export type TemplateId = "default" | "red-bull-event" | "scalpers-lifestyle";

export interface TemplateStyle {
  id: TemplateId;
  name: string;
  description: string;
  mood: string;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    textLight: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    headingStyle: "bold" | "light" | "serif" | "display";
    bodyStyle: "clean" | "editorial" | "modern";
  };
  imagery: {
    style: string;
    composition: string;
    treatment: string;
  };
  slideLayouts: {
    cover: CoverLayoutType;
    content: ContentLayoutType;
    talent: TalentLayoutType;
  };
}

export type CoverLayoutType = "hero-centered" | "hero-overlay" | "split-screen" | "minimal";
export type ContentLayoutType = "grid" | "split" | "full-bleed" | "editorial";
export type TalentLayoutType = "grid-cards" | "profile-rows" | "hero-grid" | "minimal-list";

// Red Bull Event Template
export const RED_BULL_EVENT_TEMPLATE: TemplateStyle = {
  id: "red-bull-event",
  name: "Red Bull Event Experiential",
  description: "Energetic, action-heavy event storytelling with bold visuals and dynamic layouts",
  mood: "Energetic, adrenaline, urban-sports, high-energy",
  colorPalette: {
    primary: "#001489", // Deep blue
    secondary: "#8A8D8F", // Metallic silver/grey
    accent: "#FFC906", // Red Bull yellow
    background: "#0A0E27", // Dark blue-black
    text: "#FFFFFF",
    textLight: "#E5E7EB",
  },
  typography: {
    headingFont: "Inter, -apple-system, sans-serif",
    bodyFont: "Inter, -apple-system, sans-serif",
    headingStyle: "bold",
    bodyStyle: "modern",
  },
  imagery: {
    style: "Full-bleed action photography, rooftop skylines, branded event renders",
    composition: "Dynamic, motion-focused, wide-angle shots",
    treatment: "High contrast, vibrant, bold overlays",
  },
  slideLayouts: {
    cover: "hero-overlay",
    content: "grid",
    talent: "grid-cards",
  },
};

// Scalpers Lifestyle Template
export const SCALPERS_LIFESTYLE_TEMPLATE: TemplateStyle = {
  id: "scalpers-lifestyle",
  name: "Scalpers Lifestyle Product Launch",
  description: "Premium, fashion-forward with editorial minimalism and influencer focus",
  mood: "Premium, fashion-forward, rebellious rock-band energy",
  colorPalette: {
    primary: "#000000", // Black
    secondary: "#4A3728", // Leather brown
    accent: "#A78BFA", // Purple stage light
    background: "#1A1A1A", // Charcoal
    text: "#FFFFFF",
    textLight: "#D1D5DB",
  },
  typography: {
    headingFont: "Georgia, serif",
    bodyFont: "Inter, -apple-system, sans-serif",
    headingStyle: "serif",
    bodyStyle: "editorial",
  },
  imagery: {
    style: "High-contrast portraits, influencer band aesthetic, moody backstage photography",
    composition: "Editorial splits, centered product shots, lifestyle grids",
    treatment: "Monochrome with selective color, dramatic lighting, sharp focus",
  },
  slideLayouts: {
    cover: "minimal",
    content: "editorial",
    talent: "profile-rows",
  },
};

// Default Template (Current Implementation)
export const DEFAULT_TEMPLATE: TemplateStyle = {
  id: "default",
  name: "Look After You Standard",
  description: "Clean, professional presentation with balanced layouts and universal appeal",
  mood: "Professional, modern, versatile",
  colorPalette: {
    primary: "#3B82F6", // Blue
    secondary: "#8B5CF6", // Purple
    accent: "#10B981", // Green
    background: "#FFFFFF",
    text: "#1F2937",
    textLight: "#6B7280",
  },
  typography: {
    headingFont: "Inter, sans-serif",
    bodyFont: "Inter, sans-serif",
    headingStyle: "bold",
    bodyStyle: "clean",
  },
  imagery: {
    style: "Clean, professional, brand-appropriate",
    composition: "Balanced, clear hierarchy",
    treatment: "Natural, accessible",
  },
  slideLayouts: {
    cover: "hero-centered",
    content: "split",
    talent: "grid-cards",
  },
};

// Template Registry
export const TEMPLATES: Record<TemplateId, TemplateStyle> = {
  default: DEFAULT_TEMPLATE,
  "red-bull-event": RED_BULL_EVENT_TEMPLATE,
  "scalpers-lifestyle": SCALPERS_LIFESTYLE_TEMPLATE,
};

// Template Selection Helper
export const getTemplate = (id: TemplateId): TemplateStyle => {
  return TEMPLATES[id] || DEFAULT_TEMPLATE;
};

// Template Recommendations based on brief content
export const recommendTemplate = (
  campaignGoals: string[],
  contentThemes: string[],
  clientName: string
): TemplateId => {
  const allText = [...campaignGoals, ...contentThemes, clientName].join(" ").toLowerCase();

  // Red Bull Event indicators
  if (
    allText.includes("event") ||
    allText.includes("experience") ||
    allText.includes("activation") ||
    allText.includes("sports") ||
    allText.includes("concert") ||
    allText.includes("festival") ||
    allText.includes("tournament")
  ) {
    return "red-bull-event";
  }

  // Scalpers Lifestyle indicators
  if (
    allText.includes("fashion") ||
    allText.includes("lifestyle") ||
    allText.includes("luxury") ||
    allText.includes("premium") ||
    allText.includes("perfume") ||
    allText.includes("fragrance") ||
    allText.includes("style") ||
    allText.includes("music") ||
    allText.includes("band")
  ) {
    return "scalpers-lifestyle";
  }

  return "default";
};
