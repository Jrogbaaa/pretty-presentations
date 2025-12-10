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

// Brief Response (Text-based output)
export interface BriefResponse {
  id: string;
  clientName: string;
  campaignName: string;
  createdAt: Date;
  brief: ClientBrief;
  markdownContent: string;
  influencers: SelectedInfluencer[];
  status: "draft" | "delivered";
}

// Campaign Phase for multi-phase campaigns (e.g., IKEA GREJSIMOJS: Rumor → Revelation → Rush)
export interface CampaignPhase {
  name: string;
  budgetPercentage: number;
  budgetAmount: number;
  creatorTier: "micro" | "mid-tier" | "macro" | "mixed";
  creatorCount?: number; // Optional: may not always be specified in brief
  contentFocus: string[];
  timeline: string;
  constraints?: string[]; // e.g., "embargo: no product reveals"
  description?: string;
}

// Hard constraints for brief enforcement
export interface BriefConstraints {
  maxCPM?: number; // Maximum cost per thousand impressions (e.g., Puerto de Indias: €20)
  minFollowers?: number;
  maxFollowers?: number;
  requiredCategories?: string[];
  excludedCategories?: string[];
  categoryRestrictions?: string[]; // e.g., "must be willing to work with spirits/alcohol"
  mustHaveVerification?: boolean;
  requireEventAttendance?: boolean; // PYD Halloween: physical attendance required
  requirePublicSpeaking?: boolean; // Square: must be able to speak at events
}

// Geographic distribution requirements
export interface GeographicDistribution {
  cities?: string[]; // Optional: may not always be specified
  coreCities?: string[]; // Priority cities (e.g., Square: Madrid and Barcelona are core)
  requireDistribution?: boolean; // Optional: defaults to false if not specified
  minPerCity?: number;
  maxPerCity?: number;
}

// Deliverable types beyond social media
export interface Deliverable {
  type: "social" | "event" | "content-creation" | "speaking" | "ambassador" | "brand-integration";
  description: string;
  requirements?: string[];
  quantity?: number;
}

// Budget scenarios for multi-budget briefs
export interface BudgetScenario {
  name: string; // e.g., "Scenario 1", "Conservative", "Aggressive"
  amount: number;
  description?: string;
}

// Campaign history for follow-up campaigns
export interface CampaignHistory {
  previousCampaignId?: string;
  isFollowUp?: boolean; // Optional: defaults to false if not specified
  wave?: number;
  successfulInfluencers?: string[]; // IDs or handles of well-performing creators
  performanceData?: Array<{
    influencerId: string;
    reach: number;
    engagement: number;
    conversions?: number;
    roi?: number;
  }>;
}

// Influencer requirements extracted from brief
// e.g., "2 macros (1 chica, 1 chico) + 6 mids (3 chicas, 3 chicos)"
export interface InfluencerTierRequirement {
  tier: "macro" | "mid" | "micro" | "nano";
  count: number;
  gender?: {
    male: number;
    female: number;
  };
}

export interface LocationDistribution {
  city: string;
  percentage: number;
}

export interface InfluencerRequirements {
  totalCount?: number;
  breakdown?: InfluencerTierRequirement[];
  locationDistribution?: LocationDistribution[];
  // Additional requirements
  proposedMultiplier?: number; // e.g., "propose double" = 2x
  notes?: string; // Any special requirements not captured above
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
  manualInfluencers?: string[];
  uploadedImages?: Array<{
    id: string;
    url: string;
    name: string;
    description?: string;
  }>;
  
  // Additional context from uploaded files (PDFs, presentations, etc.)
  additionalContext?: Array<{
    id: string;
    name: string;
    type: "pdf" | "text" | "presentation";
    content: string; // Extracted text content
  }>;
  
  // ENHANCED FIELDS for complex briefs
  isMultiPhase?: boolean;
  phases?: CampaignPhase[];
  constraints?: BriefConstraints;
  geographicDistribution?: GeographicDistribution;
  deliverables?: Deliverable[];
  budgetScenarios?: BudgetScenario[];
  campaignHistory?: CampaignHistory;
  targetAudienceType?: "B2C" | "B2B" | "D2C";
  campaignType?: string; // e.g., "Product Launch", "Brand Awareness", "Event-based"
  
  // Influencer requirements extracted from brief
  influencerRequirements?: InfluencerRequirements;
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
  customData?: Record<string, unknown>;
}

export interface SlideDesign {
  backgroundColor: string;
  backgroundImage?: string;
  layout: "single-column" | "two-column" | "three-column" | "grid" | "custom";
  textColor: string;
  accentColor: string;
  fontFamily: string;
}

// Influencer capabilities beyond social media
export interface InfluencerCapabilities {
  eventAppearances: boolean;
  publicSpeaking: boolean;
  contentCreation: boolean;
  longTermAmbassador: boolean;
  brandIntegration: boolean;
}

// Professional background (for B2B campaigns like Square)
export interface ProfessionalBackground {
  isEntrepreneur: boolean;
  businessType?: string; // e.g., "restaurant owner", "tech founder"
  businessName?: string;
  yearsInBusiness?: number;
  industryExpertise?: string[];
}

// Category preferences and restrictions
export interface CategoryPreferences {
  willingToWorkWith: string[]; // e.g., ["fashion", "beauty", "tech"]
  notWillingToWorkWith: string[]; // e.g., ["alcohol", "gambling", "pharma"]
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
  
  // ENHANCED FIELDS for complex scenarios
  capabilities?: InfluencerCapabilities;
  professionalBackground?: ProfessionalBackground;
  categoryPreferences?: CategoryPreferences;
  celebrityScore?: number; // 0-100, mainstream recognition level
  audienceType?: "consumer" | "business" | "mixed";
  cpm?: number; // Cost per thousand impressions (calculated or stored)
}

export interface SelectedInfluencer extends Influencer {
  rationale: string;
  proposedContent: string[];
  estimatedReach: number;
  estimatedEngagement: number;
  costEstimate: number;
  matchScore?: number;
  // Tiered performance metrics
  tier?: 'tier-1' | 'tier-2' | 'tier-3';
  tierLabel?: string;
  strategicCPM?: number;
  reachRate?: number;
  tierImpressions?: number;
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
  content: Record<string, unknown>;
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

// Brand Types
export interface Brand {
  name: string;
  industry: string;
  description: string;
  targetAge: string;
  targetGender: string;
  targetInterests: string[];
  contentThemes: string[];
}

export interface BrandProfile extends Brand {
  similarBrands?: string[];
  matchScore?: number;
  matchReason?: string;
}

// Export Types
export type ExportFormat = "pdf" | "pptx" | "google-slides" | "png" | "json";

export interface ExportOptions {
  format: ExportFormat;
  quality: "low" | "medium" | "high";
  includeNotes: boolean;
  includeMetadata: boolean;
}
