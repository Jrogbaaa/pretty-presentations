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

IMPORTANT: These are REAL EMAIL BRIEFS, not polished documents. They contain:
- Conversational greetings and sign-offs (ignore these)
- Information scattered throughout paragraphs
- Emojis, informal language, and casual Spanish business communication
- External links (WeTransfer, Instagram, TikTok) - note them but don't try to access
- References to previous campaigns or meetings
- Incomplete information (this is normal, don't fabricate)
- Multiple topics mixed together

Extract the BUSINESS INFORMATION and ignore pleasantries, greetings, and conversational elements.

Brief text:
${briefText}

Extract and return JSON with this exact structure:
{
  "clientName": "string (brand or company name, may include partnerships like 'IKEA + Museum')",
  "campaignGoals": ["goal1", "goal2", ...] (specific objectives),
  "budget": number (in euros, extract number only. If multiple scenarios mentioned, use the first/lower one. If not specified or TBD, use 0),
  "targetDemographics": {
    "ageRange": "string (e.g., 25-65+, 18-35)",
    "gender": "string (e.g., All genders, 60% Female, Men and Women)",
    "location": ["country1", "city1", ...] (if not specified, use ["Spain"])",
    "interests": ["interest1", "interest2", ...],
    "psychographics": "string (optional, lifestyle/values)"
  },
  "brandRequirements": ["requirement1", "requirement2", ...] (constraints, guidelines, CPM/CPV limits, in-store requirements, embargo constraints),
  "timeline": "string (campaign period or deadline, note if TBD/uncertain)",
  "platformPreferences": ["Instagram", "TikTok", ...] (if not specified, suggest based on target)",
  "contentThemes": ["theme1", "theme2", ...] (creative direction, topics)",
  "additionalNotes": "string (urgency, special considerations, specific creator names, previous campaign references, multi-phase details, event components, budget scenarios)"
}

CRITICAL PARSING RULES:

1. EMAIL FORMAT HANDLING:
   - IGNORE: Greetings ("Hola Gema", "¿Cómo estás?"), sign-offs ("Abrazo", "Mil gracias"), pleasantries
   - EXTRACT: Budget figures, dates, creator names, deliverables, campaign concepts
   - NOTE: External links (mention in additionalNotes but don't access)

2. SPANISH AGENCY TERMINOLOGY:
   - "oleada" = wave/campaign iteration
   - "contrastar" = confirm/validate (means unconfirmed at this stage)
   - "PDM" = presentation deadline
   - "PTE" = pending/to be confirmed
   - "Presupuesto" = budget
   - "Territorio" = content themes/territory
   - "Target" = target audience
   - "Periodo" = timeline/period
   - "Objetivo" = goal/objective
   - "porfi" = por favor (please, informal)

3. BUDGET HANDLING:
   - Extract number only (convert "111.800€" to 111800)
   - If multiple scenarios ("30.000€ or 50.000€"), use lower/first number
   - If "€39,000 + €5,000 boost", calculate total (44000)
   - If budget not specified/TBD, use 0 and note in additionalNotes
   - CPM/CPV constraints go in brandRequirements (e.g., "Max CPM €20")

4. MULTI-PHASE CAMPAIGNS:
   - If phases mentioned (Phase 1/2/3, Teaser/Reveal/Launch), extract ALL phases
   - Note phase timing, budget allocation percentages, and distinct strategies
   - Include in contentThemes and additionalNotes with phase breakdown

5. INCOMPLETE INFORMATION (NORMAL):
   - Timeline says "probably October" or "dates TBD" = note uncertainty
   - Budget "not confirmed" = use 0, note in additionalNotes
   - "Brief pending" or "details coming" = extract what exists, note incompleteness
   - DO NOT fabricate missing information

6. CREATOR/TALENT MENTIONS:
   - Extract specific names requested (with Instagram handles if provided)
   - Note if creators are suggestions vs. requirements
   - Note any rejected names ("X said no")
   - Include in additionalNotes with context

7. CAMPAIGN TYPES TO IDENTIFY:
   - B2B vs B2C (if targeting businesses, note this)
   - Event-based (physical attendance required)
   - Social amplification only
   - Multi-phase strategies
   - Follow-up campaigns (Wave 2, etc.)
   - Institutional partnerships (museums, etc.)

8. SPECIAL REQUIREMENTS:
   - In-store filming percentages (e.g., "30% must film in IKEA")
   - Embargo constraints (can't show product until X date)
   - Geographic distribution needs
   - CPM/CPV limits (add to brandRequirements)
   - Category restrictions (e.g., "must work with alcohol brands")

9. TARGET DEMOGRAPHICS:
   - If event speakers mentioned separately from audience, note both
   - Extract both who sees content AND who creates it if different
   - B2B campaigns: include business type in interests

10. ADDITIONAL NOTES SHOULD CAPTURE:
    - Specific creator names and their deliverables
    - Multi-budget scenarios ("Also provide €50k scenario")
    - Event components and attendance requirements
    - Previous campaign references
    - Rejected options
    - Pending confirmations
    - Celebrity collaborations
    - Template references
    - Reference to attached files/links

Be comprehensive but accurate. Extract signal from noise. If information is missing, acknowledge it - don't invent it.
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
