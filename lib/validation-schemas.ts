/**
 * Validation Schemas
 * Zod schemas for API request validation
 */

import { z } from "zod";

/**
 * Slide Content Schema
 */
export const SlideContentSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  body: z.string().optional(),
  bullets: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  customData: z.any().optional(),
});

/**
 * Client Brief Schema (simplified for image generation)
 */
export const ClientBriefSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  brandName: z.string().min(1, "Brand name is required"),
  campaignName: z.string().min(1, "Campaign name is required"),
  objective: z.string().optional(),
  targetAudience: z.string().optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
});

/**
 * Image Generation Request Schema
 */
export const GenerateImageRequestSchema = z.object({
  slideType: z.string().min(1).max(50, "Slide type must be 50 characters or less"),
  slideContent: SlideContentSchema,
  brief: ClientBriefSchema,
  aspectRatio: z.enum(["1:1", "16:9", "9:16", "3:2", "4:3"]).optional().default("16:9"),
});

/**
 * Image Edit Request Schema
 */
export const EditImageRequestSchema = z.object({
  currentImageUrl: z.string().url("Current image URL must be valid").or(z.string().startsWith("data:")),
  editPrompt: z.string().min(1, "Edit prompt is required").max(500, "Edit prompt must be 500 characters or less"),
});

// Export types
export type GenerateImageRequest = z.infer<typeof GenerateImageRequestSchema>;
export type EditImageRequest = z.infer<typeof EditImageRequestSchema>;

