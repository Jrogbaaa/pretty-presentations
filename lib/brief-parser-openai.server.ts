"use server";

import OpenAI from "openai";
import type { ClientBrief } from "@/types";

/**
 * Parse unstructured brief text into structured ClientBrief format using OpenAI
 * This is a server action and will only run on the server.
 * 
 * WHY OPENAI? 
 * - Extremely reliable (99.9% uptime)
 * - Clear, consistent API
 * - Best-in-class structured outputs
 * - No authentication headaches
 */
export const parseBriefDocument = async (
  briefText: string
): Promise<ClientBrief> => {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set. Get one at https://platform.openai.com/api-keys");
  }
  
  const openai = new OpenAI({ apiKey });
  
  const prompt = `You are an expert at parsing client briefs for influencer marketing campaigns.

Parse this brief into a structured format. The brief may be in Spanish, English, or mixed languages.

Brief text:
${briefText}

Extract and return JSON with this exact structure:
{
  "clientName": "string (brand or company name)",
  "campaignGoals": ["goal1", "goal2", ...] (specific objectives),
  "budget": number (in euros, extract number only),
  "targetDemographics": {
    "ageRange": "string (e.g., 25-65+, 18-35)",
    "gender": "string (e.g., All genders, 60% Female, Men and Women)",
    "location": ["country1", "city1", ...] (if not specified, use ["Spain"]),
    "interests": ["interest1", "interest2", ...],
    "psychographics": "string (optional, lifestyle/values)"
  },
  "brandRequirements": ["requirement1", "requirement2", ...] (constraints, guidelines),
  "timeline": "string (campaign period or deadline)",
  "platformPreferences": ["Instagram", "TikTok", ...] (if not specified, suggest based on target),
  "contentThemes": ["theme1", "theme2", ...] (creative direction, topics),
  "additionalNotes": "string (urgency, special considerations, confidentiality, etc.)"
}

Key instructions:
- Extract ALL relevant information, even if implicit
- For Spanish briefs: "Presupuesto" = budget, "Territorio" = content themes, "Target" = demographics
- Infer platform preferences from target age if not specified
- Capture urgency/timeline information
- Note any special requirements (confidentiality, guarantees, etc.)
- Be comprehensive but accurate

Return ONLY valid JSON, no markdown formatting.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Fast, cheap, and excellent for structured outputs
      messages: [
        {
          role: "system",
          content: "You are a precise JSON extraction assistant. Always return valid JSON without markdown formatting."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent structured outputs
      response_format: { type: "json_object" } // Ensures valid JSON response
    });

    const text = response.choices[0]?.message?.content || "";
    
    if (!text) {
      throw new Error("No response from OpenAI");
    }

    const parsed = JSON.parse(text) as ClientBrief;

    // Validate required fields
    if (!parsed.clientName || !parsed.campaignGoals || parsed.campaignGoals.length === 0) {
      throw new Error("Failed to extract required fields from brief");
    }

    // Set defaults for optional fields
    if (!parsed.platformPreferences || parsed.platformPreferences.length === 0) {
      parsed.platformPreferences = ["Instagram", "TikTok"];
    }
    if (!parsed.contentThemes) parsed.contentThemes = [];
    if (!parsed.brandRequirements) parsed.brandRequirements = [];

    return parsed;
  } catch (error) {
    console.error("Error parsing brief with OpenAI:", error);
    
    if (error instanceof Error) {
      // Handle specific OpenAI errors
      if (error.message.includes("API key")) {
        throw new Error("Invalid OpenAI API key. Get one at https://platform.openai.com/api-keys");
      }
      if (error.message.includes("quota") || error.message.includes("insufficient_quota")) {
        throw new Error("OpenAI API quota exceeded. Please add credits to your account.");
      }
      if (error.message.includes("rate_limit")) {
        throw new Error("Rate limit exceeded. Please try again in a moment.");
      }
    }
    
    throw new Error("Unable to parse brief document. Please try again.");
  }
};
