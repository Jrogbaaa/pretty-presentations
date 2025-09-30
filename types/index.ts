import type { TemplateId } from "./templates";

// Presentation Types
export interface Presentation {
  id: string;
  clientName: string;
  campaignName: string;
  createdAt: Date;
  updatedAt: Date;
  slides: Slide[];
  brief: ClientBrief;
  status: "draft" | "in-review" | "approved" | "delivered";
  templateId: TemplateId;
}

export interface ClientBrief {
  clientName: string;
  campaignGoals: string[];
  budget: number;
  targetDemographics: Demographics;
  brandRequirements: string[];
  timeline: string;
  platformPreferences: Platform[];
  contentThemes: string[];
  additionalNotes?: string;
  templateId?: TemplateId;
}

export interface Demographics {
  ageRange: string;
  gender: string;
  location: string[];
  interests: string[];
  psychographics?: string;
}

export type Platform = "Instagram" | "TikTok" | "YouTube" | "Twitter" | "Facebook" | "LinkedIn" | "Twitch";

// Slide Types
export type SlideType =
  | "cover"
  | "index"
  | "objective"
  | "target-strategy"
  | "creative-strategy"
  | "brief-summary"
  | "talent-strategy"
  | "media-strategy"
  | "next-steps";

export interface Slide {
  id: string;
  type: SlideType;
  order: number;
  title: string;
  content: SlideContent;
  design: SlideDesign;
}

export interface SlideContent {
  title?: string;
  subtitle?: string;
  body?: string;
  bullets?: string[];
  images?: string[];
  influencers?: SelectedInfluencer[];
  metrics?: Metric[];
  timeline?: TimelineItem[];
  customData?: Record<string, any>;
}

export interface SlideDesign {
  backgroundColor: string;
  backgroundImage?: string;
  layout: "single-column" | "two-column" | "three-column" | "grid" | "custom";
  textColor: string;
  accentColor: string;
  fontFamily: string;
}

// Influencer Types
export interface Influencer {
  id: string;
  name: string;
  handle: string;
  platform: Platform;
  profileImage: string;
  followers: number;
  engagement: number;
  avgViews: number;
  demographics: Demographics;
  contentCategories: string[];
  previousBrands: string[];
  rateCard: RateCard;
  performance: PerformanceMetrics;
}

export interface SelectedInfluencer extends Influencer {
  rationale: string;
  proposedContent: string[];
  estimatedReach: number;
  estimatedEngagement: number;
  costEstimate: number;
}

export interface RateCard {
  post: number;
  story: number;
  reel: number;
  video: number;
  integration: number;
}

export interface PerformanceMetrics {
  averageEngagementRate: number;
  averageReach: number;
  audienceGrowthRate: number;
  contentQualityScore: number;
}

export interface Metric {
  label: string;
  value: string | number;
  icon?: string;
}

export interface TimelineItem {
  phase: string;
  duration: string;
  description: string;
  date?: string;
}

// Editor Types
export interface EditorElement {
  id: string;
  type: "text" | "image" | "shape" | "influencer-card" | "chart";
  position: { x: number; y: number };
  size: { width: number; height: number };
  content: any;
  style: React.CSSProperties;
  locked?: boolean;
}

export interface EditorState {
  selectedSlide: number;
  selectedElement: string | null;
  zoom: number;
  history: Presentation[];
  historyIndex: number;
}

// AI Processing Types
export interface AIProcessingRequest {
  brief: ClientBrief;
  influencerPool: Influencer[];
  templates: string[];
}

export interface AIProcessingResponse {
  presentation: Presentation;
  recommendations: string[];
  warnings: string[];
  confidence: number;
}

// Export Types
export type ExportFormat = "pdf" | "pptx" | "google-slides" | "png" | "json";

export interface ExportOptions {
  format: ExportFormat;
  quality: "low" | "medium" | "high";
  includeNotes: boolean;
  includeMetadata: boolean;
}
