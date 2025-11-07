import { z } from 'zod';
import { ValidationError } from '@/types/errors';

/**
 * Zod validation schemas for client brief and related data
 * Ensures data integrity and type safety throughout the application
 */

/**
 * Target demographics schema
 * NOTE: All fields are now optional with smart defaults for better UX
 * The system will suggest adding demographics for best results
 */
export const TargetDemographicsSchema = z.object({
  ageRange: z.string().default('18-65'),
  gender: z.string().default('All genders'),
  location: z.array(z.string()).min(1).default(['Spain']),
  interests: z.array(z.string()).default([]), // Optional - will suggest adding for best results
  psychographics: z.string().optional(),
});

/**
 * Campaign Phase schema for multi-phase campaigns
 */
export const CampaignPhaseSchema = z.object({
  name: z.string(),
  budgetPercentage: z.number().min(0).max(100),
  budgetAmount: z.number().min(0),
  creatorTier: z.enum(['micro', 'mid-tier', 'macro', 'mixed']),
  creatorCount: z.number().int().nonnegative().optional(),
  contentFocus: z.array(z.string()),
  timeline: z.string(),
  constraints: z.array(z.string()).optional(),
  description: z.string().optional(),
});

/**
 * Brief constraints schema
 */
export const BriefConstraintsSchema = z.object({
  maxCPM: z.number().nonnegative().optional(),
  minFollowers: z.number().int().nonnegative().optional(),
  maxFollowers: z.number().int().nonnegative().optional(),
  requiredCategories: z.array(z.string()).optional(),
  excludedCategories: z.array(z.string()).optional(),
  categoryRestrictions: z.array(z.string()).optional(),
  mustHaveVerification: z.boolean().optional(),
  requireEventAttendance: z.boolean().optional(),
  requirePublicSpeaking: z.boolean().optional(),
});

/**
 * Geographic distribution schema
 */
export const GeographicDistributionSchema = z.object({
  cities: z.array(z.string()),
  coreCities: z.array(z.string()).optional(),
  requireDistribution: z.boolean(),
  minPerCity: z.number().int().nonnegative().optional(),
  maxPerCity: z.number().int().nonnegative().optional(),
});

/**
 * Deliverable schema
 */
export const DeliverableSchema = z.object({
  type: z.enum(['social', 'event', 'content-creation', 'speaking', 'ambassador', 'brand-integration']),
  description: z.string(),
  requirements: z.array(z.string()).optional(),
  quantity: z.number().int().positive().optional(),
});

/**
 * Budget scenario schema
 */
export const BudgetScenarioSchema = z.object({
  name: z.string(),
  amount: z.number().int().nonnegative(),
  description: z.string().optional(),
});

/**
 * Campaign history schema
 */
export const CampaignHistorySchema = z.object({
  previousCampaignId: z.string().optional(),
  isFollowUp: z.boolean(),
  wave: z.number().int().nonnegative().optional(),
  successfulInfluencers: z.array(z.string()).optional(),
  performanceData: z.array(z.object({
    influencerId: z.string(),
    reach: z.number(),
    engagement: z.number(),
    conversions: z.number().optional(),
    roi: z.number().optional(),
  })).optional(),
});

/**
 * Client brief schema with comprehensive validation
 */
export const ClientBriefSchema = z.object({
  clientName: z.string()
    .min(1, 'Client name is required')
    .max(200, 'Client name must be less than 200 characters')
    .trim(),
  
  campaignGoals: z.array(z.string().min(1))
    .min(1, 'At least one campaign goal is required')
    .max(10, 'Maximum 10 campaign goals allowed'),
  
  budget: z.number()
    .int('Budget must be a whole number')
    .min(0, 'Budget cannot be negative')
    .max(10000000, 'Budget must be less than 10 million'),
  
  targetDemographics: TargetDemographicsSchema,
  
  brandRequirements: z.array(z.string())
    .default([]),
  
  timeline: z.string()
    .min(1, 'Timeline is required')
    .max(500, 'Timeline must be less than 500 characters'),
  
  platformPreferences: z.array(
    z.enum(['Instagram', 'TikTok', 'YouTube', 'Twitter', 'Facebook', 'LinkedIn', 'Twitch'])
  ).min(1, 'At least one platform is required'),
  
  contentThemes: z.array(z.string()).default([]),
  
  manualInfluencers: z.array(z.string()).default([]).optional(),
  
  additionalNotes: z.string().max(2000, 'Additional notes must be less than 2000 characters').optional(),
  
  templateId: z.enum(['default', 'red-bull-event', 'scalpers-lifestyle']).optional(),
  
  // ENHANCED FIELDS for complex briefs
  isMultiPhase: z.boolean().optional(),
  phases: z.array(CampaignPhaseSchema).optional(),
  constraints: BriefConstraintsSchema.partial().optional(),
  geographicDistribution: GeographicDistributionSchema.partial().optional(),
  deliverables: z.array(DeliverableSchema).optional(),
  budgetScenarios: z.array(BudgetScenarioSchema).optional(),
  campaignHistory: CampaignHistorySchema.partial().optional(),
  targetAudienceType: z.enum(['B2C', 'B2B', 'D2C']).optional(),
  campaignType: z.string().max(100).optional(),
});

/**
 * Type inference from Zod schema
 */
export type ValidatedClientBrief = z.infer<typeof ClientBriefSchema>;

/**
 * Validate a client brief and return typed result
 * 
 * @param data - Data to validate
 * @returns Validated ClientBrief
 * @throws ValidationError with detailed field errors
 */
export const validateClientBrief = (data: unknown): ValidatedClientBrief => {
  try {
    return ClientBriefSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      );
      
      throw new ValidationError(
        `Validation failed: ${fieldErrors.join('; ')}`,
        error.errors.map(err => err.path.join('.'))
      );
    }
    throw error;
  }
};

/**
 * Safe validation that returns result object instead of throwing
 * 
 * @param data - Data to validate
 * @returns Object with success flag and data or errors
 */
export const safeValidateClientBrief = (data: unknown): {
  success: boolean;
  data?: ValidatedClientBrief;
  errors?: string[];
} => {
  const result = ClientBriefSchema.safeParse(data);
  
  if (result.success) {
    return {
      success: true,
      data: result.data
    };
  }
  
  return {
    success: false,
    errors: result.error.errors.map(err => 
      `${err.path.join('.')}: ${err.message}`
    )
  };
};

/**
 * Partial validation for form fields (allows incomplete data during editing)
 */
export const PartialClientBriefSchema = ClientBriefSchema.partial();

/**
 * Validate a single field
 * 
 * @param field - Field name to validate
 * @param value - Value to validate
 * @returns Validation result
 */
export const validateField = (field: keyof z.infer<typeof ClientBriefSchema>, value: unknown): {
  valid: boolean;
  error?: string;
} => {
  try {
    const fieldSchema = ClientBriefSchema.shape[field];
    if (!fieldSchema) {
      return { valid: false, error: 'Invalid field name' };
    }
    
    fieldSchema.parse(value);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        error: error.errors[0]?.message || 'Validation failed'
      };
    }
    return { valid: false, error: 'Validation failed' };
  }
};

/**
 * Sanitize and normalize brief data
 * 
 * @param data - Raw data to sanitize
 * @returns Sanitized data ready for validation
 */
export const sanitizeBriefData = (data: Record<string, unknown>): Record<string, unknown> => {
  return {
    ...data,
    clientName: typeof data.clientName === 'string' ? data.clientName.trim() : data.clientName,
    budget: typeof data.budget === 'string' ? parseInt(data.budget, 10) : data.budget,
    campaignGoals: Array.isArray(data.campaignGoals) 
      ? data.campaignGoals.filter((g: unknown) => typeof g === 'string' && g.trim().length > 0)
      : data.campaignGoals,
    brandRequirements: Array.isArray(data.brandRequirements)
      ? data.brandRequirements.filter((r: unknown) => typeof r === 'string' && r.trim().length > 0)
      : [],
    contentThemes: Array.isArray(data.contentThemes)
      ? data.contentThemes.filter((t: unknown) => typeof t === 'string' && t.trim().length > 0)
      : [],
    manualInfluencers: Array.isArray(data.manualInfluencers)
      ? data.manualInfluencers.filter((i: unknown) => typeof i === 'string' && i.trim().length > 0)
      : [],
    additionalNotes: typeof data.additionalNotes === 'string' ? data.additionalNotes.trim() || undefined : undefined,
  };
};

/**
 * Email validation schema
 */
export const EmailSchema = z.string()
  .email('Invalid email address')
  .toLowerCase()
  .trim();

/**
 * URL validation schema
 */
export const URLSchema = z.string()
  .url('Invalid URL')
  .trim();

/**
 * Phone number validation schema (international format)
 */
export const PhoneSchema = z.string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');

/**
 * Rate card validation schema
 */
export const RateCardSchema = z.object({
  post: z.number().positive(),
  story: z.number().positive(),
  reel: z.number().positive(),
  video: z.number().positive(),
});

/**
 * Influencer validation schema
 */
export const InfluencerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  handle: z.string().min(1),
  platform: z.enum(['Instagram', 'TikTok', 'YouTube', 'Twitter', 'Facebook', 'LinkedIn', 'Twitch']),
  followers: z.number().int().nonnegative(),
  engagement: z.number().nonnegative().max(100),
  contentCategories: z.array(z.string()).min(1),
  demographics: z.object({
    ageRange: z.string(),
    gender: z.string(),
    location: z.array(z.string()),
  }),
  rateCard: RateCardSchema,
  imageUrl: z.string().url().optional(),
  previousBrands: z.array(z.string()).default([]),
  verified: z.boolean().default(false),
});

/**
 * Export all schemas for reuse
 */
export const schemas = {
  ClientBriefSchema,
  PartialClientBriefSchema,
  TargetDemographicsSchema,
  EmailSchema,
  URLSchema,
  PhoneSchema,
  RateCardSchema,
  InfluencerSchema,
};

