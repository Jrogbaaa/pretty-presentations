import { model } from "./firebase";
import type { ClientBrief } from "@/types";

/**
 * Parse unstructured brief text into structured ClientBrief format
 * Handles briefs in English, Spanish, or mixed languages
 */
export const parseBriefDocument = async (briefText: string): Promise<ClientBrief> => {
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

Return only the JSON, no explanation.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up JSON response
    const jsonText = text.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(jsonText) as ClientBrief;
    
    // Validate required fields
    if (!parsed.clientName || !parsed.campaignGoals || parsed.campaignGoals.length === 0) {
      throw new Error("Failed to extract required fields from brief");
    }
    
    // Set defaults for missing optional fields
    if (!parsed.platformPreferences || parsed.platformPreferences.length === 0) {
      parsed.platformPreferences = ["Instagram", "TikTok"];
    }
    
    if (!parsed.contentThemes) {
      parsed.contentThemes = [];
    }
    
    if (!parsed.brandRequirements) {
      parsed.brandRequirements = [];
    }
    
    return parsed;
  } catch (error) {
    console.error("Error parsing brief:", error);
    throw new Error("Unable to parse brief document. Please check the format and try again.");
  }
};

/**
 * Extract key information from brief for quick preview
 */
export const extractBriefSummary = (briefText: string): {
  hasClient: boolean;
  hasBudget: boolean;
  hasTarget: boolean;
  hasTimeline: boolean;
  confidence: number;
} => {
  const hasClient = /client|cliente|brand|marca/i.test(briefText);
  const hasBudget = /budget|presupuesto|€|eur|\d+k/i.test(briefText);
  const hasTarget = /target|objetivo|audience|demographics/i.test(briefText);
  const hasTimeline = /timeline|periodo|deadline|fecha|date/i.test(briefText);
  
  const confidence = [hasClient, hasBudget, hasTarget, hasTimeline]
    .filter(Boolean).length * 25;
  
  return {
    hasClient,
    hasBudget,
    hasTarget,
    hasTimeline,
    confidence,
  };
};

/**
 * Sample brief for testing
 */
export const SAMPLE_BRIEF = `Van a contar con un grupo de música para llevar a cabo una serie de conciertos de pop-rock bajo el sello de The band.

La Brand manager nos pide que nos alejemos de esos conciertos que ya tienen. Buscan una idea creativa de influencia que les ayude a hacerse eco del lanzamiento del perfume cuya principal característica es que, bajo un mismo nombre, está la versión de hombre y la de mujer… y que a nivel visual y comunicación todo gira en torno a música.

Presupuesto: 75k€
Territorio: Música y Lifestyle
Target: mujeres y hombres 25-65+
Periodo: octubre
Objetivo: Awareness y cobertura es un lanzamiento
KPI: Impresiones. Garantía de las impresiones que nos deis

Ojo.. seamos discretos porfa con la poca info del docu.. ya que es un lanzamiento.

¿Qué necesitamos de vosotros?
1. Idea creativa: un claim, un hashtag, un hilo conductor que enlace las publicaciones de todos los talents elegidos.
2. Una primera selección de talentos que encajen con la marca y brief.
3. Una planificación de publicaciones con estimación de impresiones.

Lo necesitamos para el martes 2/9, ¿lo veis factible?`;
