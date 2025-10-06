"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ClientBrief } from "@/types";

/**
 * Parse unstructured brief text into structured ClientBrief format using Google AI (Gemini)
 * This is a server action and will only run on the server.
 */
export const parseBriefDocument = async (
  briefText: string
): Promise<ClientBrief> => {
  // Initialize Google AI with API key (much simpler than Vertex AI!)
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  
  if (!apiKey) {
    throw new Error("GOOGLE_AI_API_KEY environment variable is not set");
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash", // Updated to latest Gemini model
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 2048,
    }
  });
  
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
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonText = text.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(jsonText) as ClientBrief;

    if (!parsed.clientName || !parsed.campaignGoals || parsed.campaignGoals.length === 0) {
      throw new Error("Failed to extract required fields from brief");
    }

    if (!parsed.platformPreferences || parsed.platformPreferences.length === 0) {
      parsed.platformPreferences = ["Instagram", "TikTok"];
    }
    if (!parsed.contentThemes) parsed.contentThemes = [];
    if (!parsed.brandRequirements) parsed.brandRequirements = [];

    return parsed;
  } catch (error) {
    console.error("Error parsing brief with Google AI:", error);
    if (error instanceof Error) {
      if (error.message.includes("API_KEY") || error.message.includes("invalid")) {
        throw new Error("Invalid Google AI API key. Please check your GOOGLE_AI_API_KEY environment variable.");
      }
      if (error.message.includes("quota") || error.message.includes("429")) {
        throw new Error("API quota exceeded. Please try again later.");
      }
    }
    throw new Error("Unable to parse brief document. The AI model could not process the text.");
  }
};
