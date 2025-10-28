import { NextRequest, NextResponse } from "next/server";
import { generateMarkdownResponse } from "@/lib/markdown-response-generator.server";
import type { ClientBrief, Platform } from "@/types";

/**
 * Sanitize string input to prevent injection attacks
 */
const sanitizeString = (input: string, maxLength: number = 1000): string => {
  if (!input) return "";
  
  // Trim and limit length
  let sanitized = input.trim().slice(0, maxLength);
  
  // Remove potentially dangerous characters but keep valid punctuation
  // Allow: letters, numbers, spaces, common punctuation, accented characters
  sanitized = sanitized.replace(/[<>{}\\]/g, "");
  
  return sanitized;
};

/**
 * Sanitize array of strings
 */
const sanitizeArray = (input: unknown, maxLength: number = 50): string[] => {
  if (!Array.isArray(input)) return [];
  
  return input
    .filter((item): item is string => typeof item === "string")
    .slice(0, maxLength) // Limit array size
    .map((item) => sanitizeString(item, 200));
};

/**
 * Sanitize and validate the client brief input
 */
const sanitizeBrief = (input: any): ClientBrief => {
  // Sanitize basic fields
  const clientName = sanitizeString(input.clientName || "", 200);
  const campaignGoals = sanitizeArray(input.campaignGoals);
  const brandRequirements = sanitizeArray(input.brandRequirements);
  const contentThemes = sanitizeArray(input.contentThemes);
  const additionalNotes = sanitizeString(input.additionalNotes || "", 2000);
  const timeline = sanitizeString(input.timeline || "", 200);
  
  // Sanitize budget (ensure it's a positive number)
  let budget = Number(input.budget) || 0;
  if (budget < 0 || budget > 10000000) { // Max 10M budget
    budget = 0;
  }
  
  // Sanitize platform preferences
  const validPlatforms: Platform[] = ["Instagram", "TikTok", "YouTube", "Twitter", "Facebook", "LinkedIn", "Twitch"];
  const platformPreferences = sanitizeArray(input.platformPreferences)
    .filter((platform): platform is Platform => (validPlatforms as readonly string[]).includes(platform));
  
  // Sanitize demographics
  const targetDemographics = {
    ageRange: sanitizeString(input.targetDemographics?.ageRange || "18-65", 50),
    gender: sanitizeString(input.targetDemographics?.gender || "All genders", 50),
    location: sanitizeArray(input.targetDemographics?.location || ["Spain"]),
    interests: sanitizeArray(input.targetDemographics?.interests || []),
    psychographics: sanitizeString(input.targetDemographics?.psychographics || "", 500)
  };
  
  return {
    clientName,
    campaignGoals,
    budget,
    targetDemographics,
    brandRequirements,
    timeline,
    platformPreferences,
    contentThemes,
    additionalNotes,
    templateId: input.templateId || "modern"
  };
};

/**
 * POST /api/generate-text-response
 * Generate a text-based influencer recommendation response
 */
export async function POST(request: NextRequest) {
  try {
    const rawInput = await request.json();
    
    // Sanitize and validate input
    const brief = sanitizeBrief(rawInput);

    // Validate sanitized brief
    if (!brief.budget || brief.budget === 0) {
      return NextResponse.json(
        { error: "Budget is required and must be greater than 0" },
        { status: 400 }
      );
    }

    if (!brief.clientName || !brief.campaignGoals?.length) {
      return NextResponse.json(
        { error: "Client name and at least one campaign goal are required" },
        { status: 400 }
      );
    }

    // Generate markdown response with influencer matching
    const response = await generateMarkdownResponse(brief);

    return NextResponse.json({ 
      success: true, 
      response 
    });
  } catch (error) {
    console.error("Error generating text response:", error);
    
    // Don't leak internal error details
    return NextResponse.json(
      { 
        error: "Unable to generate response. Please check your input and try again." 
      },
      { status: 500 }
    );
  }
}

