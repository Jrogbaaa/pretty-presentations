/**
 * Presenton Adapter
 * Transforms ClientBrief and influencer data into Presenton-compatible format
 */

import type { ClientBrief, SelectedInfluencer, Presentation } from "@/types";
import {
  formatBriefForPresenton,
  mapInfluencersToSlides,
  generateWithPresenton,
  type PresentonGenerateRequest,
} from "./presenton-api";
import { logInfo, logError } from "./logger";

/**
 * Generate comprehensive content string from brief and influencers
 * This creates a rich, detailed prompt for Presenton to work with
 */
const buildPresentonContent = (
  brief: ClientBrief,
  influencers: SelectedInfluencer[]
): string => {
  const sections: string[] = [];
  
  // Header
  sections.push(`# ${brief.clientName} - Influencer Marketing Campaign Proposal`);
  sections.push("");
  sections.push("---");
  sections.push("");
  
  // Executive Summary
  sections.push("## Executive Summary");
  sections.push("");
  sections.push(`This proposal outlines an influencer marketing campaign for ${brief.clientName} with a budget of €${brief.budget.toLocaleString()}.`);
  
  if (brief.campaignGoals.length > 0) {
    sections.push(`The campaign aims to ${brief.campaignGoals[0].toLowerCase()}.`);
  }
  
  sections.push("");
  sections.push("---");
  sections.push("");
  
  // Campaign Objectives
  if (brief.campaignGoals.length > 0) {
    sections.push("## Campaign Objectives");
    sections.push("");
    brief.campaignGoals.forEach((goal, idx) => {
      sections.push(`${idx + 1}. ${goal}`);
    });
    sections.push("");
    sections.push("---");
    sections.push("");
  }
  
  // Target Audience
  sections.push("## Target Audience");
  sections.push("");
  
  if (brief.targetDemographics.ageRange) {
    sections.push(`**Age Range:** ${brief.targetDemographics.ageRange}`);
  }
  
  if (brief.targetDemographics.gender) {
    sections.push(`**Gender:** ${brief.targetDemographics.gender}`);
  }
  
  if (brief.targetDemographics.location?.length > 0) {
    sections.push(`**Location:** ${brief.targetDemographics.location.join(", ")}`);
  }
  
  if (brief.targetDemographics.interests?.length > 0) {
    sections.push("");
    sections.push("**Key Interests:**");
    brief.targetDemographics.interests.forEach((interest) => {
      sections.push(`- ${interest}`);
    });
  }
  
  if (brief.targetDemographics.psychographics) {
    sections.push("");
    sections.push("**Psychographic Profile:**");
    sections.push(brief.targetDemographics.psychographics);
  }
  
  sections.push("");
  sections.push("---");
  sections.push("");
  
  // Platform Strategy
  if (brief.platformPreferences.length > 0) {
    sections.push("## Platform Strategy");
    sections.push("");
    sections.push("The campaign will focus on the following platforms:");
    sections.push("");
    brief.platformPreferences.forEach((platform) => {
      sections.push(`- **${platform}**`);
    });
    sections.push("");
    sections.push("---");
    sections.push("");
  }
  
  // Creative Strategy
  if (brief.contentThemes.length > 0) {
    sections.push("## Creative Strategy");
    sections.push("");
    sections.push("Content will focus on these key themes:");
    sections.push("");
    brief.contentThemes.forEach((theme, idx) => {
      sections.push(`${idx + 1}. **${theme}**`);
    });
    sections.push("");
    sections.push("---");
    sections.push("");
  }
  
  // Talent Strategy - Recommended Influencers
  if (influencers.length > 0) {
    sections.push("## Talent Strategy");
    sections.push("");
    sections.push("### Recommended Influencers");
    sections.push("");
    
    // Group by tier
    const macro = influencers.filter(inf => inf.followers >= 500000);
    const midTier = influencers.filter(inf => inf.followers >= 100000 && inf.followers < 500000);
    const micro = influencers.filter(inf => inf.followers < 100000);
    
    if (macro.length > 0) {
      sections.push("#### Macro Influencers (500K+ followers)");
      sections.push("");
      macro.forEach((inf) => {
        sections.push(`**${inf.name}** (@${inf.handle || inf.name.toLowerCase().replace(/\s+/g, "")})`);
        sections.push(`- ${inf.followers.toLocaleString()} followers`);
        sections.push(`- ${inf.engagement.toFixed(2)}% engagement rate`);
        sections.push(`- Platform: ${inf.platform}`);
        
        if (inf.contentCategories && inf.contentCategories.length > 0) {
          sections.push(`- Content focus: ${inf.contentCategories.slice(0, 3).join(", ")}`);
        }
        
        if (inf.rationale) {
          sections.push(`- **Why ${inf.name.split(" ")[0]}:** ${inf.rationale}`);
        }
        
        if (inf.costEstimate) {
          sections.push(`- Estimated cost: €${inf.costEstimate.toLocaleString()}`);
        }
        
        sections.push("");
      });
    }
    
    if (midTier.length > 0) {
      sections.push("#### Mid-Tier Influencers (100K-500K followers)");
      sections.push("");
      midTier.forEach((inf) => {
        sections.push(`**${inf.name}** (@${inf.handle || inf.name.toLowerCase().replace(/\s+/g, "")})`);
        sections.push(`- ${inf.followers.toLocaleString()} followers`);
        sections.push(`- ${inf.engagement.toFixed(2)}% engagement rate`);
        sections.push(`- Platform: ${inf.platform}`);
        
        if (inf.contentCategories && inf.contentCategories.length > 0) {
          sections.push(`- Content focus: ${inf.contentCategories.slice(0, 3).join(", ")}`);
        }
        
        if (inf.rationale) {
          sections.push(`- **Why ${inf.name.split(" ")[0]}:** ${inf.rationale}`);
        }
        
        if (inf.costEstimate) {
          sections.push(`- Estimated cost: €${inf.costEstimate.toLocaleString()}`);
        }
        
        sections.push("");
      });
    }
    
    if (micro.length > 0) {
      sections.push("#### Micro Influencers (<100K followers)");
      sections.push("");
      micro.forEach((inf) => {
        sections.push(`**${inf.name}** (@${inf.handle || inf.name.toLowerCase().replace(/\s+/g, "")})`);
        sections.push(`- ${inf.followers.toLocaleString()} followers`);
        sections.push(`- ${inf.engagement.toFixed(2)}% engagement rate`);
        sections.push(`- Platform: ${inf.platform}`);
        
        if (inf.contentCategories && inf.contentCategories.length > 0) {
          sections.push(`- Content focus: ${inf.contentCategories.slice(0, 3).join(", ")}`);
        }
        
        if (inf.rationale) {
          sections.push(`- **Why ${inf.name.split(" ")[0]}:** ${inf.rationale}`);
        }
        
        if (inf.costEstimate) {
          sections.push(`- Estimated cost: €${inf.costEstimate.toLocaleString()}`);
        }
        
        sections.push("");
      });
    }
    
    sections.push("---");
    sections.push("");
  }
  
  // Budget & ROI Projections
  sections.push("## Investment & Expected Results");
  sections.push("");
  sections.push(`**Total Budget:** €${brief.budget.toLocaleString()}`);
  sections.push("");
  
  if (influencers.length > 0) {
    const totalCost = influencers.reduce((sum, inf) => sum + (inf.costEstimate || 0), 0);
    const totalReach = influencers.reduce((sum, inf) => sum + (inf.estimatedReach || 0), 0);
    const totalEngagement = influencers.reduce((sum, inf) => sum + (inf.estimatedEngagement || 0), 0);
    
    sections.push("**Projected Performance:**");
    sections.push(`- Total Investment: €${totalCost.toLocaleString()}`);
    sections.push(`- Estimated Reach: ${totalReach.toLocaleString()} people`);
    sections.push(`- Expected Engagement: ${totalEngagement.toLocaleString()} interactions`);
    sections.push("");
  }
  
  sections.push("---");
  sections.push("");
  
  // Timeline
  if (brief.timeline) {
    sections.push("## Timeline");
    sections.push("");
    sections.push(brief.timeline);
    sections.push("");
    sections.push("---");
    sections.push("");
  }
  
  // Brand Requirements
  if (brief.brandRequirements && brief.brandRequirements.length > 0) {
    sections.push("## Brand Guidelines & Requirements");
    sections.push("");
    brief.brandRequirements.forEach((req) => {
      sections.push(`- ${req}`);
    });
    sections.push("");
    sections.push("---");
    sections.push("");
  }
  
  // Additional Notes
  if (brief.additionalNotes) {
    sections.push("## Additional Considerations");
    sections.push("");
    sections.push(brief.additionalNotes);
    sections.push("");
    sections.push("---");
    sections.push("");
  }
  
  // Next Steps
  sections.push("## Next Steps");
  sections.push("");
  sections.push("1. **Review & Approval:** Review this proposal and provide feedback");
  sections.push("2. **Influencer Outreach:** Begin negotiations with selected influencers");
  sections.push("3. **Content Planning:** Develop detailed content briefs and schedules");
  sections.push("4. **Campaign Launch:** Execute campaign according to timeline");
  sections.push("5. **Performance Monitoring:** Track KPIs and optimize throughout campaign");
  sections.push("");
  
  return sections.join("\n");
};

/**
 * Generate presentation using Presenton with full brief and influencer data
 */
export const generatePresentationWithPresenton = async (
  brief: ClientBrief,
  influencers: SelectedInfluencer[]
): Promise<{ presentationId: string; filePath: string; editPath: string }> => {
  try {
    logInfo("Starting Presenton presentation generation", {
      clientName: brief.clientName,
      influencerCount: influencers.length,
      budget: brief.budget,
    });
    
    // Build comprehensive content
    const content = buildPresentonContent(brief, influencers);
    
    // Prepare Presenton request
    const request: PresentonGenerateRequest = {
      content,
      tone: "professional",
      verbosity: "standard",
      web_search: false,
      n_slides: 10, // Standard presentation length
      language: "English", // Default to English, can be made configurable
      template: "general", // Use Presenton's general template
      include_table_of_contents: true,
      include_title_slide: true,
      export_as: "pptx",
    };
    
    // Generate with Presenton
    const result = await generateWithPresenton(request);
    
    logInfo("Presenton generation successful", {
      presentationId: result.presentation_id,
      path: result.path,
    });
    
    return {
      presentationId: result.presentation_id,
      filePath: result.path,
      editPath: result.edit_path,
    };
  } catch (error) {
    logError("Failed to generate presentation with Presenton", {
      error,
      clientName: brief.clientName,
    });
    throw new Error(
      `Presenton generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

/**
 * Build instructions for Presenton based on brief requirements
 */
export const buildPresentonInstructions = (brief: ClientBrief): string => {
  const instructions: string[] = [];
  
  instructions.push("Create a professional influencer marketing campaign proposal.");
  instructions.push(`The presentation is for ${brief.clientName}.`);
  
  if (brief.brandRequirements && brief.brandRequirements.length > 0) {
    instructions.push("Ensure the following brand requirements are met:");
    brief.brandRequirements.forEach((req) => {
      instructions.push(`- ${req}`);
    });
  }
  
  instructions.push("Use a professional, agency-quality design with clear hierarchy.");
  instructions.push("Include data visualizations where appropriate.");
  instructions.push("Make the presentation visually engaging with relevant imagery.");
  
  return instructions.join(" ");
};

