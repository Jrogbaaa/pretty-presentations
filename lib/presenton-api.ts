/**
 * Presenton API Service
 * Handles communication with the Presenton Docker container
 */

import { logInfo, logError } from "./logger";

export interface PresentonConfig {
  apiUrl: string;
  enabled: boolean;
}

export interface PresentonGenerateRequest {
  content: string;
  slides_markdown?: string[] | null;
  instructions?: string | null;
  tone?: "default" | "casual" | "professional" | "funny" | "educational" | "sales_pitch";
  verbosity?: "concise" | "standard" | "text-heavy";
  web_search?: boolean;
  n_slides?: number;
  language?: string;
  template?: string;
  include_table_of_contents?: boolean;
  include_title_slide?: boolean;
  files?: string[] | null;
  export_as?: "pptx" | "pdf";
}

export interface PresentonGenerateResponse {
  presentation_id: string;
  path: string;
  edit_path: string;
}

/**
 * Get Presenton configuration from environment variables
 */
export const getPresentonConfig = (): PresentonConfig => {
  const apiUrl = process.env.PRESENTON_API_URL || "http://localhost:5001";
  const enabled = process.env.NEXT_PUBLIC_ENABLE_PRESENTON === "true";
  
  return { apiUrl, enabled };
};

/**
 * Check if Presenton is available and running
 */
export const checkPresentonAvailable = async (): Promise<boolean> => {
  const config = getPresentonConfig();
  
  if (!config.enabled) {
    logInfo("Presenton integration is disabled");
    return false;
  }
  
  try {
    const response = await fetch(`${config.apiUrl}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    
    const isAvailable = response.ok;
    
    if (isAvailable) {
      logInfo("Presenton is available and running", { apiUrl: config.apiUrl });
    } else {
      logError("Presenton health check failed", { 
        status: response.status,
        statusText: response.statusText 
      });
    }
    
    return isAvailable;
  } catch (error) {
    logError("Failed to connect to Presenton", { 
      error,
      apiUrl: config.apiUrl 
    });
    return false;
  }
};

/**
 * Generate presentation using Presenton API
 */
export const generateWithPresenton = async (
  request: PresentonGenerateRequest
): Promise<PresentonGenerateResponse> => {
  const config = getPresentonConfig();
  
  if (!config.enabled) {
    throw new Error("Presenton integration is not enabled");
  }
  
  logInfo("Generating presentation with Presenton", {
    contentLength: request.content.length,
    slides: request.n_slides,
    language: request.language,
  });
  
  try {
    const response = await fetch(`${config.apiUrl}/api/v1/ppt/presentation/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(120000), // 2 minute timeout for generation
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Presenton API error (${response.status}): ${errorText}`
      );
    }
    
    const result: PresentonGenerateResponse = await response.json();
    
    logInfo("Presenton generation successful", {
      presentationId: result.presentation_id,
    });
    
    return result;
  } catch (error) {
    logError("Presenton generation failed", { error });
    throw error;
  }
};

/**
 * Download presentation file from Presenton
 */
export const downloadPresentonFile = async (
  filePath: string
): Promise<Blob> => {
  const config = getPresentonConfig();
  
  try {
    // Presenton returns a local file path, we need to download it
    // The path is relative to Presenton's app_data directory
    const response = await fetch(`${config.apiUrl}/download${filePath}`, {
      method: "GET",
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });
    
    if (!response.ok) {
      throw new Error(
        `Failed to download presentation (${response.status}): ${response.statusText}`
      );
    }
    
    const blob = await response.blob();
    
    logInfo("Presentation file downloaded", {
      size: blob.size,
      type: blob.type,
    });
    
    return blob;
  } catch (error) {
    logError("Failed to download presentation file", { error, filePath });
    throw error;
  }
};

/**
 * Format brief content for Presenton
 * Converts our ClientBrief format into a plain text prompt
 */
export const formatBriefForPresenton = (
  clientName: string,
  campaignGoals: string[],
  targetDemographics: any,
  budget: number,
  platformPreferences: string[],
  contentThemes: string[],
  additionalNotes?: string
): string => {
  const parts: string[] = [];
  
  parts.push(`# ${clientName} - Influencer Marketing Campaign`);
  parts.push("");
  
  if (campaignGoals.length > 0) {
    parts.push("## Campaign Objectives");
    campaignGoals.forEach((goal) => parts.push(`- ${goal}`));
    parts.push("");
  }
  
  if (budget > 0) {
    parts.push(`## Budget: €${budget.toLocaleString()}`);
    parts.push("");
  }
  
  if (targetDemographics) {
    parts.push("## Target Audience");
    if (targetDemographics.ageRange) {
      parts.push(`- Age Range: ${targetDemographics.ageRange}`);
    }
    if (targetDemographics.gender) {
      parts.push(`- Gender: ${targetDemographics.gender}`);
    }
    if (targetDemographics.location?.length > 0) {
      parts.push(`- Location: ${targetDemographics.location.join(", ")}`);
    }
    if (targetDemographics.interests?.length > 0) {
      parts.push(`- Interests: ${targetDemographics.interests.join(", ")}`);
    }
    parts.push("");
  }
  
  if (platformPreferences.length > 0) {
    parts.push("## Platforms");
    parts.push(platformPreferences.join(", "));
    parts.push("");
  }
  
  if (contentThemes.length > 0) {
    parts.push("## Content Themes");
    contentThemes.forEach((theme) => parts.push(`- ${theme}`));
    parts.push("");
  }
  
  if (additionalNotes) {
    parts.push("## Additional Notes");
    parts.push(additionalNotes);
    parts.push("");
  }
  
  return parts.join("\n");
};

/**
 * Map influencer data into presentation content
 * Formats selected influencers as markdown slides
 */
export const mapInfluencersToSlides = (
  influencers: any[]
): string[] => {
  const slides: string[] = [];
  
  // Create talent strategy slide
  let talentSlide = "# Talent Strategy\n\n";
  talentSlide += "## Recommended Influencers\n\n";
  
  influencers.forEach((inf, idx) => {
    talentSlide += `### ${idx + 1}. ${inf.name}\n`;
    talentSlide += `- **Followers:** ${inf.followers.toLocaleString()}\n`;
    talentSlide += `- **Engagement Rate:** ${inf.engagement.toFixed(2)}%\n`;
    talentSlide += `- **Platform:** ${inf.platform}\n`;
    
    if (inf.contentCategories?.length > 0) {
      talentSlide += `- **Content:** ${inf.contentCategories.join(", ")}\n`;
    }
    
    if (inf.rationale) {
      talentSlide += `- **Why:** ${inf.rationale}\n`;
    }
    
    talentSlide += "\n";
  });
  
  slides.push(talentSlide);
  
  return slides;
};

