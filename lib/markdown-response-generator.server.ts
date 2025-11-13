"use server";

import OpenAI from "openai";
import type { ClientBrief, SelectedInfluencer, BriefResponse } from "@/types";
import { matchInfluencersServer } from "./influencer-matcher.server";
import { processManualInfluencers } from "./manual-influencer-matcher";
import { withRetry, RetryPresets } from "./retry";
import { logInfo, logError, startTimer } from "./logger";
import { OpenAIError } from "@/types/errors";
import { 
  calculateTieredMetrics, 
  calculateHybridStrategy, 
  extractImpressionGoal 
} from "./tiered-cpm-calculator";
import { detectCampaignStrategy, formatStrategyExplanation } from "./goal-detector";
import { calculateRevenueMetrics, formatRevenueMetrics } from "./revenue-calculator";

/**
 * Generate a comprehensive markdown response for a client brief
 * Includes brief analysis, influencer matches, strategy, and recommendations
 */
export const generateMarkdownResponse = async (
  brief: ClientBrief
): Promise<BriefResponse> => {
  const timer = startTimer('generateMarkdownResponse');
  
  try {
    logInfo('Starting markdown response generation', {
      clientName: brief.clientName,
      budget: brief.budget
    });

    // Step 1: Match influencers (using SERVER SDK for API routes)
    const matchedInfluencers = await matchInfluencersServer(brief);
    
    logInfo('Influencer matching complete for markdown response', {
      matchedCount: matchedInfluencers.length
    });

    // Step 1.5: Process manual influencers
    const manualInfluencers = await processManualInfluencers(brief);
    
    logInfo('Manual influencer processing complete', {
      manualCount: manualInfluencers.length,
      fromDatabase: manualInfluencers.filter(inf => inf.id && !inf.id.startsWith('manual-')).length,
      placeholders: manualInfluencers.filter(inf => inf.id && inf.id.startsWith('manual-')).length,
    });

    // Step 2: Generate comprehensive markdown content
    const markdownContent = await generateMarkdownContent(brief, matchedInfluencers, manualInfluencers);

    // Step 3: Create response object
    const response: BriefResponse = {
      id: generateId(),
      clientName: brief.clientName,
      campaignName: brief.campaignGoals[0] || "Campaign",
      createdAt: new Date(),
      brief,
      markdownContent,
      influencers: [...matchedInfluencers, ...manualInfluencers],
      status: "draft"
    };

    const duration = timer.stop({ success: true });
    logInfo('Markdown response generated successfully', { 
      duration, 
      contentLength: markdownContent.length 
    });

    return response;
  } catch (error) {
    const duration = timer.stop({ success: false });
    logError(error, { 
      function: 'generateMarkdownResponse',
      duration
    });
    throw error;
  }
};

/**
 * Build the manual influencer section
 */
const buildManualInfluencerSection = (
  influencers: SelectedInfluencer[],
  brief: ClientBrief
): string => {
  if (influencers.length === 0) {
    return "";
  }

  const influencerCards = influencers.map((inf, idx) => {
    const isPlaceholder = inf.id.startsWith('manual-');
    const tierEmoji = inf.followers >= 500000 ? '⭐' : inf.followers >= 100000 ? '✨' : '💫';
    const tier = inf.followers >= 500000 ? 'Macro' : inf.followers >= 100000 ? 'Medio' : 'Micro';
    const engagementQuality = inf.engagement >= 3 ? 'Excelente' : inf.engagement >= 2 ? 'Fuerte' : 'Bueno';
    const firstName = inf.name.split(' ')[0];
    
    // Check for filming location in brief
    const brandReqs = brief.brandRequirements || [];
    const additionalNotes = brief.additionalNotes || '';
    const filmingLocation = brandReqs.find(req => req.toLowerCase().includes('location') || req.toLowerCase().includes('filming')) || 
                          (additionalNotes.toLowerCase().includes('location') || additionalNotes.toLowerCase().includes('filming') ? additionalNotes.match(/location[^.]*/i)?.[0] : null);
    
    return `
---

### ${tierEmoji} ${idx + 1}. **${inf.name}**${inf.handle ? ` • [@${inf.handle}]` : ''}${isPlaceholder ? ' _(No en base de datos)_' : ''}

<table>
<tr>
<td><strong>📊 Alcance</strong></td>
<td>${inf.followers.toLocaleString()} seguidores${isPlaceholder ? ' (estimado)' : ''}</td>
<td><strong>💬 Engagement</strong></td>
<td>${inf.engagement}% (${engagementQuality})${isPlaceholder ? ' (estimado)' : ''}</td>
</tr>
<tr>
<td><strong>📱 Plataforma</strong></td>
<td>${inf.platform}</td>
<td><strong>🎭 Tier</strong></td>
<td>Influencer ${tier}</td>
</tr>
    ${inf.contentCategories.length > 0 ? `<tr>
<td><strong>🎨 Enfoque de Contenido</strong></td>
<td colspan="3">${inf.contentCategories.slice(0, 4).join(", ")}</td>
</tr>` : ''}
</table>

#### 💡 ¿Por qué ${firstName}?

**Razonamiento Cualitativo:**
${filmingLocation ? `**Locación de Filmación:** ${filmingLocation}\n\n` : ''}${inf.rationale || `${firstName} es un excelente ajuste basado en alineación de audiencia, calidad de engagement y estilo de contenido que coincide con los valores de marca de ${brief.clientName}.`}

**Razonamiento Cuantitativo:**
- Tasa de Engagement: ${inf.engagement}% (${engagementQuality}) - ${inf.engagement >= 3 ? 'supera el promedio de la industria' : inf.engagement >= 2 ? 'por encima del promedio de la industria' : 'rendimiento sólido'}
- Alcance: ${inf.followers.toLocaleString()} seguidores proporciona exposición significativa de marca
- Alineación de Contenido: enfoque en ${inf.contentCategories.slice(0, 2).join(" y ")} se alinea con intereses de la audiencia objetivo

#### 🎬 Estrategia de Contenido Recomendada

**Entregables:**
${inf.proposedContent?.map(content => `- 📹 ${content}`).join('\n') || '- 📹 2-3 Instagram Reels (contenido dinámico, siguiendo tendencias)\n- 📸 3-4 Instagram Stories (detrás de cámaras, momentos auténticos)\n- 🖼️ 1 Publicación Carrusel (formato educativo o narrativo)'}

**Pilares de Contenido:**
*[Será generado por IA basado en el perfil de ${inf.name}]*`;
  });

  const databaseCount = influencers.filter(inf => inf.id && !inf.id.startsWith('manual-')).length;
  const placeholderCount = influencers.filter(inf => inf.id && inf.id.startsWith('manual-')).length;

  return `## 👥 Influencers Solicitados Manualmente

> **Nota:** ${databaseCount > 0 ? `${databaseCount} influencer${databaseCount !== 1 ? 's fueron' : ' fue'} encontrado${databaseCount !== 1 ? 's' : ''} en nuestra base de datos. ` : ''}${placeholderCount > 0 ? `${placeholderCount} influencer${placeholderCount !== 1 ? 's' : ''} ${placeholderCount === 1 ? 'no fue encontrado' : 'no fueron encontrados'} en nuestra base de datos - datos estimados y justificación generada por IA proporcionados.` : ''}
${influencerCards.join('')}

---`;
};

/**
 * Build the influencer section with REAL matched influencer data
 * This ensures the actual matched influencers always appear in the response
 */
const buildInfluencerSection = (
  influencers: SelectedInfluencer[],
  brief: ClientBrief
): string => {
  if (influencers.length === 0) {
    return `## 🌟 Lineup de Influencers Recomendado

> **Nota:** No se encontraron influencers para este brief. Por favor ajusta tus criterios (presupuesto, plataformas, temas de contenido, o ubicación) e intenta nuevamente.`;
  }

  const influencerCards = influencers.map((inf, idx) => {
    const tierEmoji = inf.followers >= 500000 ? '⭐' : inf.followers >= 100000 ? '✨' : '💫';
    const tier = inf.followers >= 500000 ? 'Macro' : inf.followers >= 100000 ? 'Medio' : 'Micro';
    const engagementQuality = inf.engagement >= 3 ? 'Excelente' : inf.engagement >= 2 ? 'Fuerte' : 'Bueno';
    const firstName = inf.name.split(' ')[0];
    
    // Check for filming location in brief
    const brandReqs = brief.brandRequirements || [];
    const additionalNotes = brief.additionalNotes || '';
    const filmingLocation = brandReqs.find(req => req.toLowerCase().includes('location') || req.toLowerCase().includes('filming')) || 
                          (additionalNotes.toLowerCase().includes('location') || additionalNotes.toLowerCase().includes('filming') ? additionalNotes.match(/location[^.]*/i)?.[0] : null);
    
    return `
---

### ${tierEmoji} ${idx + 1}. **${inf.name}** • [@${inf.handle}](https://instagram.com/${inf.handle})

<table>
<tr>
<td><strong>📊 Alcance</strong></td>
<td>${inf.followers.toLocaleString()} seguidores</td>
<td><strong>💬 Engagement</strong></td>
<td>${inf.engagement}% (${engagementQuality})</td>
</tr>
<tr>
<td><strong>📱 Plataforma</strong></td>
<td>${inf.platform}</td>
<td><strong>🎭 Tier</strong></td>
<td>Influencer ${tier}</td>
</tr>
<tr>
<td><strong>🎨 Enfoque de Contenido</strong></td>
<td colspan="3">${inf.contentCategories.slice(0, 4).join(", ")}</td>
</tr>
</table>

#### 💡 ¿Por qué ${firstName}?

**Razonamiento Cualitativo:**
${filmingLocation ? `**Locación de Filmación:** ${filmingLocation}\n\n` : ''}${inf.rationale || `${firstName} es un excelente ajuste basado en alineación de audiencia, calidad de engagement y estilo de contenido que coincide con los valores de marca de ${brief.clientName}.`}

**Razonamiento Cuantitativo:**
- Tasa de Engagement: ${inf.engagement}% (${engagementQuality}) - ${inf.engagement >= 3 ? 'supera el promedio de la industria' : inf.engagement >= 2 ? 'por encima del promedio de la industria' : 'rendimiento sólido'}
- Alcance: ${inf.followers.toLocaleString()} seguidores proporciona exposición significativa de marca
- Alineación de Contenido: enfoque en ${inf.contentCategories.slice(0, 2).join(" y ")} se alinea con intereses de la audiencia objetivo

#### 🎬 Estrategia de Contenido Recomendada

**Entregables:**
${inf.proposedContent?.map(content => `- 📹 ${content}`).join('\n') || '- 📹 2-3 Instagram Reels (contenido dinámico, siguiendo tendencias)\n- 📸 3-4 Instagram Stories (detrás de cámaras, momentos auténticos)\n- 🖼️ 1 Publicación Carrusel (formato educativo o narrativo)'}

**Pilares de Contenido:**
*[Será generado por IA basado en el perfil de ${inf.name}]*`;
  }).join('\n');

  return `## 🌟 Lineup de Influencers Recomendado

> **Criterios de Selección:** ${influencers.length === 1 ? 'Este influencer fue seleccionado' : `Estos ${influencers.length} influencers fueron seleccionados`} cuidadosamente de nuestra base de datos de **más de 3,000 creadores españoles verificados** basándose en alineación de audiencia, calidad de engagement, estilo de contenido y ajuste de marca.
${influencerCards}

---`;
};

/**
 * Get example guidance based on brief content to ensure quality, specific responses
 */
const getExampleGuidance = (brief: ClientBrief): string => {
  // Detect industry/category from content themes, client name, or campaign goals
  const contentThemes = brief.contentThemes?.join(' ').toLowerCase() || '';
  const clientName = brief.clientName.toLowerCase();
  const goals = brief.campaignGoals.join(' ').toLowerCase();
  const interests = brief.targetDemographics.interests.join(' ').toLowerCase();
  
  // Determine industry/type
  const isBeauty = contentThemes.includes('fragrance') || contentThemes.includes('perfume') || 
                   clientName.includes('perfume') || goals.includes('perfume');
  const isSpirits = contentThemes.includes('gin') || contentThemes.includes('cocktail') || 
                    contentThemes.includes('spirits') || contentThemes.includes('alcohol') ||
                    clientName.includes('indias') || clientName.includes('spirits');
  const isFood = contentThemes.includes('food') || contentThemes.includes('gastronom') || 
                 contentThemes.includes('culinary') || contentThemes.includes('meal') ||
                 interests.includes('food') || interests.includes('cooking') ||
                 clientName.includes('nostrum') || clientName.includes('food');
  const isHome = contentThemes.includes('home') || contentThemes.includes('furniture') || 
                 contentThemes.includes('decor') || contentThemes.includes('interior') ||
                 clientName.includes('ikea') || goals.includes('home');
  const isFashion = contentThemes.includes('fashion') || contentThemes.includes('style') || 
                    contentThemes.includes('outfit') || contentThemes.includes('wear') ||
                    interests.includes('fashion') || interests.includes('style');
  const isAutomotive = contentThemes.includes('car') || contentThemes.includes('automotive') || 
                       contentThemes.includes('vehicle') || contentThemes.includes('luxury') ||
                       clientName.includes('audi') || clientName.includes('bmw') || 
                       clientName.includes('mercedes') || goals.includes('concesionario') ||
                       goals.includes('test drive');
  
  let industryExamples = '';
  
  if (isBeauty) {
    industryExamples = `
**EXAMPLE FROM SIMILAR CAMPAIGN (Beauty/Fragrance):**

1. **✨ Midnight Serenade Sessions**
   - Create intimate, sensory-driven content featuring the fragrance in evening settings, paired with curated music playlists that match each scent's personality
   - Example: "A candlelit evening routine: pairing The Band Midnight with lo-fi beats, showing how scent creates atmosphere"

2. **🌟 Unboxing the Experience**
   - Transform unboxing into a multi-sensory storytelling moment, emphasizing the premium packaging and first-spray moment
   - Example: "First impressions video: blindfolded scent test revealing which fragrance matches different personality types"

**YOUR TASK:** Generate content pillars THAT ARE SPECIFIC like the examples above. Each theme should:
- Have a unique, memorable name that reflects ${brief.clientName}'s brand identity
- Include concrete, actionable content ideas (not generic descriptions)
- Reference specific formats, settings, or storytelling approaches
- Connect authentically to the brand's values and target audience`;
  } else if (isSpirits) {
    industryExamples = `
**EXAMPLE FROM SIMILAR CAMPAIGN (Spirits):**

**"Tarde con los tuyos" (Afternoon with your people)**
- A concept focusing on authentic social gatherings, friendship moments, and adapting lifestyle content for cold weather indoor settings
- Content showcases gin as part of meaningful social connections
- Example: "Sunday afternoon board games with friends, featuring perfectly crafted gin cocktails"

**YOUR TASK:** Generate content pillars that are SPECIFIC and culturally relevant like this example. Create themes that reflect ${brief.clientName}'s unique positioning and Spanish culture.`;
  } else if (isFood) {
    industryExamples = `
**EXAMPLE FROM SIMILAR CAMPAIGN (Food/Health):**

1. **✨ Gourmet Pairings That Elevate**
   - Explore unique ingredient pairings and gourmet recipes that elevate everyday meals
   - Example: "Chef-inspired combinations featuring premium ingredients for a delightful culinary experience"

2. **🌟 Moments of Enjoyment**
   - Capture authentic moments of enjoyment and consumption in real-life settings
   - Example: "Weekend brunch vibes with friends, featuring the newest product offerings"

**YOUR TASK:** Generate content pillars that are SPECIFIC and aspirational like the examples above. Connect ${brief.clientName} to Spanish food culture and authentic gastronomic experiences.`;
  } else if (isHome) {
    industryExamples = `
**EXAMPLE FROM SIMILAR CAMPAIGN (Home/Furniture):**

1. **✨ First Times That Matter**
   - Core creative direction focusing on emotional connections to "first times" - first apartment, first dinner party, first adult purchase
   - Example: "A series following someone setting up their first real apartment, documenting the emotional journey"

2. **🌟 From Box to Life**
   - Show the transformation process - unboxing, assembly, and the moment it becomes part of daily life
   - Example: "Assembly story: the moment furniture becomes your favorite reading nook"

**YOUR TASK:** Generate content pillars that are SPECIFIC and emotionally resonant like the examples above. Connect ${brief.clientName} to life moments and emotional storytelling.`;
  } else if (isAutomotive) {
    industryExamples = `
**EXAMPLE FROM SIMILAR CAMPAIGN (Automotive/Luxury):**

1. **✨ "Tech Meets Luxury"**
   - Showcase cutting-edge technology features through immersive storytelling
   - Example: "Interactive journey through smart city showcasing virtual cockpit and driver assistance features"

2. **🌟 "Design Excellence"**
   - Celebrate progressive design and craftsmanship through visual storytelling
   - Example: "Gallery-like visual story exploring design elements in artistic settings"

3. **💫 "Experiential Journeys"**
   - Document real experiences and adventures that showcase performance
   - Example: "Weekend escape to hidden destinations highlighting adaptability and reliability"

**YOUR TASK:** Generate content pillars that are SPECIFIC and luxury-focused like the examples above. Connect ${brief.clientName} to innovation, design, and experiential storytelling.`;
  } else if (isFashion) {
    industryExamples = `
**EXAMPLE FROM SIMILAR CAMPAIGN (Fashion):**

1. **✨ Style Stories**
   - Document how fashion pieces integrate into everyday life and personal style narratives
   - Example: "A week in style: showing how versatile pieces adapt from work to weekend"

2. **🌟 Sustainable Style**
   - Connect fashion choices to values and sustainability narratives
   - Example: "Behind the craft: showcasing handcrafted quality and sustainable practices"

**YOUR TASK:** Generate content pillars that are SPECIFIC and style-focused like the examples above. Connect ${brief.clientName} to personal style, values, and authentic fashion moments.`;
  } else {
    // Generic guidance for unknown industries
    industryExamples = `
**QUALITY STANDARDS - Content Pillars Must Be SPECIFIC:**

**❌ AVOID GENERIC PHRASES LIKE:**
- "Fresh & Premium"
- "Authenticity and personal storytelling"
- "Visual appeal aligned with brand aesthetic"
- "Engaging content that drives conversions"

**✅ CREATE SPECIFIC THEMES LIKE:**
- "Midnight Serenade Sessions" (for fragrance: evening routines with curated playlists)
- "Tarde con los tuyos" (for spirits: authentic social gatherings)
- "First Times That Matter" (for furniture: emotional connections to first experiences)
- "Gourmet Pairings That Elevate" (for food: unique ingredient combinations)

**YOUR TASK:** Generate content pillars that:
- Have unique, memorable names reflecting ${brief.clientName}'s brand identity
- Include concrete, actionable content ideas (not generic descriptions)
- Reference specific formats, settings, or storytelling approaches
- Connect authentically to the brand's values and target audience`;
  }
  
  return `
**QUALITY REQUIREMENTS:**

You must generate SPECIFIC, BRAND-ALIGNED content - NOT generic templates. Every section must be tailored to ${brief.clientName}'s unique positioning.

${industryExamples}

**CRITICAL REMINDERS:**
- Executive Summary: Must be specific to ${brief.clientName}, not generic campaign language
- Psychographic Insights: Must reflect the actual target audience, not generic social media user descriptions
- Strategic Recommendations: Must be actionable and specific to ${brief.clientName}'s industry and goals
- Content Pillars: Must have unique names and specific examples, not generic placeholders
`;
};

/**
 * Reflect on and refine generated markdown content
 * This second-pass improves quality, specificity, and brand alignment
 */
const refineMarkdownContent = async (
  initialContent: string,
  brief: ClientBrief,
  influencers: SelectedInfluencer[]
): Promise<string> => {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    logError('OpenAI API key missing for reflection, returning initial content', {});
    return initialContent; // Graceful degradation
  }

  const openai = new OpenAI({ apiKey });

  // Detect industry for specific quality checks
  const contentThemes = brief.contentThemes?.join(' ').toLowerCase() || '';
  const clientName = brief.clientName.toLowerCase();
  const goals = brief.campaignGoals.join(' ').toLowerCase();

  const hasSalesGoal = brief.campaignGoals.some(g => {
    const lower = g.toLowerCase();
    return lower.includes('ventas') || lower.includes('sales') || lower.includes('conversión') || lower.includes('revenue');
  });
  
  const reflectionPrompt = `Eres un estratega de negocios senior revisando una propuesta de sistema de generación de ingresos. Tu tarea es asegurar que esta propuesta genere resultados empresariales medibles (ventas, conversiones, ingresos) - no solo métricas de vanidad.

**MENTALIDAD CRÍTICA: Este es un SISTEMA DE GENERACIÓN DE INGRESOS, no una herramienta de recomendación de contenido.**

**IMPORTANTE: TODA TU RESPUESTA DEBE SER EN ESPAÑOL.**

**PROPUESTA ORIGINAL:**
${initialContent}

**CONTEXTO DEL CLIENTE:**
- Cliente: ${brief.clientName}
- Industria: ${contentThemes}
- Objetivos de Campaña: ${brief.campaignGoals.join(', ')}
- Audiencia Objetivo: ${brief.targetDemographics.ageRange}, ${brief.targetDemographics.gender}
- Presupuesto: €${brief.budget.toLocaleString()}
${hasSalesGoal ? '- **OBJETIVO PRINCIPAL:** Generar ventas e ingresos (no solo contenido)' : ''}

**LISTA DE VERIFICACIÓN DE CALIDAD - Identifica y corrige estos problemas:**

❌ **Lenguaje Genérico de "Marketing de Influencers"** - Reemplaza frases como:
   - "Fresco y Premium", "Autenticidad y storytelling" → Usa tácticas específicas vinculadas a acciones de conversión
   - "Atractivo visual alineado con la estética de marca" → Explica cómo los visuales impulsan la intención de compra
   - "Contenido atractivo que genera conversiones" → Especifica QUÉ acciones de engagement llevan a QUÉ resultados empresariales
   - "Crear contenido genuino y cercano" → Define genuino en términos de confianza del cliente y comportamiento de compra

❌ **Lógica Empresarial Ausente** - Cada recomendación debe responder:
   - ¿CÓMO generará esto ingresos/ventas/conversiones?
   - ¿QUÉ cambio de comportamiento del cliente crea esto?
   - ¿POR QUÉ este enfoque es más efectivo que las alternativas?
   ${hasSalesGoal ? '- ¿CUÁL es el ROIS esperado (Retorno de Inversión en Influencers)?' : ''}

❌ **Pilares de Contenido Vagos** - Cada pilar debe:
   - Tener un nombre único y memorable vinculado a la propuesta de valor de ${brief.clientName} (no "Activación en Redes Sociales")
   - Explicar el gatillo psicológico que activa (urgencia, prueba social, confianza, aspiración)
   - Especificar la etapa del customer journey que aborda (awareness → consideración → compra)
   - Definir criterios de éxito medibles

❌ **Recomendaciones No Accionables** - Deben ser:
   - Específicas para la industria y posicionamiento competitivo de ${brief.clientName}
   - Incluir tácticas concretas con métricas de éxito claras
   - Referenciar principios de marketing probados (escasez, autoridad, prueba social, etc.)
   - Explicar el ROI esperado o impacto empresarial

❌ **Resumen Ejecutivo Tipo Plantilla** - Debe:
   - Comenzar con el problema empresarial que ${brief.clientName} está resolviendo
   - Cuantificar el resultado esperado (ej., "proyectado para generar €${(brief.budget * 2.5).toLocaleString()} en ingresos")
   - Referenciar elementos específicos de campaña y su justificación estratégica
   - Sonar como si fuera escrito por alguien que entiende el mercado de ${brief.clientName}

**TU TAREA:**
1. Lee la propuesta con una LENTE EMPRESARIAL (no una lente creativa)
2. Pregunta: "¿Esto generará ingresos?" para cada sección
3. Reemplaza el lenguaje de marketing superficial con copy estratégico enfocado en resultados
4. Cuantifica los resultados esperados donde sea posible (ROIS, tasas de conversión, ingresos)
5. Asegúrate de que la propuesta se sienta como un plan de inversión en ingresos, no como una pieza de portafolio creativo
6. Mantén todas las secciones estratégicas fuertes sin cambios

**ESTÁNDARES CRÍTICOS:**
- **Enfoque en Ingresos:** Cada táctica debe tener una línea clara hacia resultados empresariales
- **Profundidad Estratégica:** Referencias a psicología del marketing, posicionamiento competitivo, customer journey
- **Cuantificación:** Usa números y proyecciones (incluso si son estimadas) para construir el caso de negocio
- **Específico para la Marca:** ${brief.clientName} debe mencionarse frecuentemente con tácticas específicas de contexto
${hasSalesGoal ? '- **Claridad del ROIS:** Si esta es una campaña de ventas, el ROIS y las proyecciones de ingresos deben estar al frente y al centro' : ''}

Devuelve la propuesta mejorada COMPLETA en formato markdown. Si una sección ya es excelente, mantenla exactamente como está.`;

  try {
    const timer = startTimer('refineMarkdownContent');
    
    const response = await withRetry(
      () => openai.chat.completions.create({
        model: "gpt-4o-mini", // Faster and cheaper for refinement
        messages: [
          {
            role: "system",
            content: "Eres un estratega de negocios senior que refina propuestas de marketing para generar resultados de ingresos medibles. Enfócate en profundidad estratégica, proyecciones cuantificables y lógica empresarial clara. Este es un sistema de generación de ingresos, no un portafolio creativo. Devuelve solo contenido en markdown sin texto envolvente. TODO EL CONTENIDO DEBE SER EN ESPAÑOL."
          },
          {
            role: "user",
            content: reflectionPrompt
          }
        ],
        temperature: 0.6, // Slightly lower for more focused refinement
        max_tokens: 5000 // Allow for comprehensive refinement
      }),
      RetryPresets.STANDARD
    );

    let refinedMarkdown = response.choices[0]?.message?.content || initialContent;
    
    // Remove any code block wrappers
    refinedMarkdown = refinedMarkdown.replace(/^```markdown\n?/g, '').replace(/\n?```$/g, '');
    refinedMarkdown = refinedMarkdown.replace(/^```\n?/g, '').replace(/\n?```$/g, '');
    refinedMarkdown = refinedMarkdown.trim();

    const duration = timer.stop({ success: true });
    
    logInfo('Markdown content refined', {
      duration,
      originalLength: initialContent.length,
      refinedLength: refinedMarkdown.length,
      lengthDelta: refinedMarkdown.length - initialContent.length,
      tokens: response.usage?.total_tokens
    });

    return refinedMarkdown;
  } catch (error) {
    logError(error, { 
      function: 'refineMarkdownContent',
      fallbackToInitial: true 
    });
    
    // Graceful degradation: return initial content if refinement fails
    return initialContent;
  }
};

/**
 * Generate markdown content using OpenAI
 */
const generateMarkdownContent = async (
  brief: ClientBrief,
  influencers: SelectedInfluencer[],
  manualInfluencers: SelectedInfluencer[]
): Promise<string> => {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new OpenAIError(
      "OPENAI_API_KEY environment variable is not set",
      "missing_api_key"
    );
  }

  const openai = new OpenAI({ apiKey });

  // Build the actual influencer sections with REAL DATA first
  const influencerSection = buildInfluencerSection(influencers, brief);
  const manualInfluencerSection = buildManualInfluencerSection(manualInfluencers, brief);

  // Get example guidance based on industry/content themes
  const exampleGuidance = getExampleGuidance(brief);

  const prompt = `Eres un estratega senior en una agencia de marketing de influencers de élite. Genera un documento profesional en markdown que analice este brief y proporcione recomendaciones estratégicas.

**CRÍTICO: TODO EL CONTENIDO DEBE SER GENERADO EN ESPAÑOL**

**ESTÁNDARES DE CALIDAD:**
${exampleGuidance}

**BRIEF DEL CLIENTE:**
Cliente: ${brief.clientName}
Objetivos de Campaña: ${brief.campaignGoals.join(", ")}
Audiencia Objetivo: ${brief.targetDemographics.ageRange}, ${brief.targetDemographics.gender}, ${brief.targetDemographics.location.join(", ")}
Intereses: ${brief.targetDemographics.interests.join(", ")}
Timeline: ${brief.timeline}
Plataformas: ${brief.platformPreferences.join(", ")}
Temas de Contenido: ${brief.contentThemes?.join(", ") || "General"}
${brief.additionalNotes ? `Notas Adicionales: ${brief.additionalNotes}` : ""}

**RESUMEN DE INFLUENCERS SELECCIONADOS:**
${influencers.map((inf, idx) => `
${idx + 1}. **${inf.name}** (@${inf.handle})
   - Seguidores: ${inf.followers.toLocaleString()}
   - Engagement: ${inf.engagement}%
   - Enfoque de Contenido: ${inf.contentCategories.slice(0, 3).join(", ")}
   - Plataforma: ${inf.platform}
   - Justificación: ${inf.rationale || 'Excelente ajuste basado en alineación de audiencia'}
`).join('\n')}

**CRÍTICO:** Después de cada sección de influencer en el documento, DEBES generar 2-3 pilares de contenido ESPECÍFICOS y ÚNICOS adaptados al perfil de ese influencer. Observa su Enfoque de Contenido, estilo de engagement y número de seguidores para crear recomendaciones únicas. NO uses frases genéricas como "Autenticidad y storytelling personal" o "Atractivo visual alineado con la estética de marca". Cada influencer debe tener pilares diferentes basados en su estilo de contenido único.

**INSTRUCCIONES:**
Crea un documento en markdown completo, bellamente formateado, con jerarquía visual excepcional y secciones claras:

# 🎯 ${brief.clientName} - Propuesta de Marketing de Influencers

> **Timeline:** ${brief.timeline} | **Plataformas:** ${brief.platformPreferences.join(", ")}

---

## 📋 Resumen Ejecutivo

Proporciona una descripción general convincente de 3-4 oraciones que:
- Destaque la estrategia central de la campaña
- Defina la audiencia objetivo
- Describa los resultados empresariales esperados
- Establezca un tono aspiracional pero alcanzable

---

## 📊 Análisis del Brief de Campaña

### 🎯 Objetivos de Campaña

${brief.campaignGoals.map((goal, idx) => `${idx + 1}. **${goal}**`).join('\n')}

---

## 🎯 Estrategia de Campaña e Impacto en Ingresos

${(() => {
  const strategy = detectCampaignStrategy(brief);
  const strategyExplanation = formatStrategyExplanation(strategy, brief);
  
  // If it's a sales/revenue campaign, show revenue projections
  if (strategy.goalType === 'sales') {
    const revenueMetrics = calculateRevenueMetrics(
      influencers,
      brief.budget,
      {
        contentThemes: brief.contentThemes,
        campaignGoals: brief.campaignGoals,
        clientName: brief.clientName
      }
    );
    
    return `### 💰 Enfoque Orientado a Ingresos

${strategyExplanation}

${formatRevenueMetrics(revenueMetrics)}

**Por qué los Nano-Influencers Superan en E-Commerce:**
- **Mayor Confianza:** Las comunidades pequeñas y comprometidas perciben las recomendaciones como consejos auténticos de un amigo, no como anuncios
- **Mejor Engagement:** Tasas de engagement del 12-18% vs 2-4% para macro-influencers
- **Menor Fraude:** Porcentajes de audiencia creíble del 85-95% vs 60-75% para cuentas más grandes
- **Eficiencia de Costes:** €200-500 por publicación vs €5,000-20,000 para macro, permitiendo más alianzas con creadores

---`;
  } else if (strategy.goalType === 'awareness') {
    return `### 📢 Enfoque en Awareness

${strategyExplanation}

Este enfoque equilibrado prioriza el alcance mientras mantiene la autenticidad a través de una mezcla estratégica de niveles de influencers. Asignamos el ${(strategy.macroWeight * 100).toFixed(0)}% del presupuesto a macro-influencers para máxima entrega de impresiones.

---`;
  } else {
    return `### 🎯 Enfoque Estratégico

${strategyExplanation}

---`;
  }
})()}

[INFLUENCER_SECTION_PLACEHOLDER]

---

## 💡 Estrategia Creativa y Dirección de Contenido

### 🎨 Pilares de Contenido Estratégicos

${brief.contentThemes && brief.contentThemes.length > 0 ? `**Nota:** Las siguientes ideas creativas se basan en conceptos proporcionados en el brief, expandidos y refinados para su implementación.\n\n` : ''}Crea 3-4 temas de contenido convincentes que conecten auténticamente a ${brief.clientName} con la audiencia objetivo. ${brief.contentThemes && brief.contentThemes.length > 0 ? `Si se proporcionaron ideas creativas en el brief, incorpóralas y amplíalas aquí.` : ''}

**IMPORTANTE:** Cada tema debe ser ESPECÍFICO, ALINEADO CON LA MARCA y CULTURALMENTE RELEVANTE. Usa nombres únicos y memorables que reflejen la identidad de marca de ${brief.clientName} y los objetivos de campaña. Cada tema debe tener 3-4 líneas de extensión, explicando cómo se conecta con la marca y la audiencia objetivo. Incluye hashtags para cada tema. El primer tema debe ser más largo y detallado, explicando cómo sentimos que podría conectar mejor con la audiencia.

**NO USES FRASES GENÉRICAS COMO:**
- "Fresco y Premium"
- "Autenticidad y storytelling personal" 
- "Atractivo visual alineado con la estética de marca"

**EN SU LUGAR, CREA TEMAS ESPECÍFICOS COMO:**
- "Sesiones de Serenata a Medianoche" (para fragancias: rutinas nocturnas con playlists curadas)
- "Tarde con los tuyos" (para bebidas espirituosas: reuniones sociales auténticas)
- "Primeras Veces que Importan" (para muebles: conexiones emocionales con primeras experiencias)

Para cada tema (expande a 3-4 líneas cada uno, añade hashtags):
1. **✨ [Nombre de Tema Único que Refleje la Marca]**
   - Escribe 3-4 líneas explicando cómo este tema conecta a ${brief.clientName} con la audiencia objetivo, por qué es efectivo, y cómo podría conectar mejor. Sé específico sobre el enfoque narrativo, formatos de contenido y relevancia cultural.
   - **Hashtags:** #HashtagUno #HashtagDos #HashtagTres

2. **🌟 [Nombre de Tema Único que Refleje la Marca]**
   - Escribe 3-4 líneas explicando cómo este tema conecta a ${brief.clientName} con la audiencia objetivo, por qué es efectivo, y cómo podría conectar mejor. Sé específico sobre el enfoque narrativo, formatos de contenido y relevancia cultural.
   - **Hashtags:** #HashtagUno #HashtagDos #HashtagTres

3. **💫 [Nombre de Tema Único que Refleje la Marca]**
   - Escribe 3-4 líneas explicando cómo este tema conecta a ${brief.clientName} con la audiencia objetivo, por qué es efectivo, y cómo podría conectar mejor. Sé específico sobre el enfoque narrativo, formatos de contenido y relevancia cultural.
   - **Hashtags:** #HashtagUno #HashtagDos #HashtagTres

4. **🎯 [Nombre de Tema Único que Refleje la Marca]** *(Opcional pero recomendado)*
   - Escribe 3-4 líneas explicando cómo este tema conecta a ${brief.clientName} con la audiencia objetivo, por qué es efectivo, y cómo podría conectar mejor. Sé específico sobre el enfoque narrativo, formatos de contenido y relevancia cultural.
   - **Hashtags:** #HashtagUno #HashtagDos #HashtagTres

### 📅 Plan de Distribución de Contenido

**Calendario Tentativo:**

<table>
<tr>
<th>Plataforma</th>
<th>Formato</th>
<th>Objetivo Principal</th>
<th>Estilo de Contenido</th>
</tr>
<tr>
<td><strong>Instagram</strong></td>
<td>Reels</td>
<td>Generar awareness y engagement</td>
<td>Adelanto</td>
</tr>
<tr>
<td><strong>Instagram</strong></td>
<td>Stories</td>
<td>Construir conexión y urgencia</td>
<td>Historia completa</td>
</tr>
<tr>
<td><strong>${brief.platformPreferences[1] || brief.platformPreferences[0] || 'TikTok'}</strong></td>
<td>Video corto</td>
<td>Potencial viral y alcance</td>
<td>Entretenimiento primero, nativo de la plataforma</td>
</tr>
<tr>
<td><strong>Todas las Plataformas</strong></td>
<td>Carrusel/Estático</td>
<td>Educación y profundidad</td>
<td>Visuales de alta calidad, storytelling detallado</td>
</tr>
</table>

---

## 📈 Proyecciones de Rendimiento y KPIs

### 🎯 Rendimiento Estimado de Campaña

Basado en análisis de engagement por niveles y tasas de alcance basadas en evidencia:

${(() => {
  const tieredMetrics = calculateTieredMetrics(influencers);
  const impressionGoal = extractImpressionGoal(brief);
  
  // Check if we need hybrid strategy
  if (impressionGoal && impressionGoal > tieredMetrics.totalImpressions * 1.2) {
    // Client has an impression goal that organic reach can't meet
    const hybridStrategy = calculateHybridStrategy(tieredMetrics, impressionGoal);
    
    return `
**⚠️ CONFLICTO ESTRATÉGICO DETECTADO:**

Tu brief solicita **${impressionGoal.toLocaleString()} impresiones**, pero el equipo de influencers seleccionado puede entregar orgánicamente **${tieredMetrics.totalImpressions.toLocaleString()} impresiones** (**${hybridStrategy.shortfallPercentage.toFixed(0)}% de déficit**).

No puedes lograr todos los objetivos de campaña solo con alcance orgánico. Recomendamos una **Estrategia Híbrida** que separa la creación de contenido de la distribución de medios.

---

### 💡 Recomendado: Estrategia Híbrida

<table>
<tr>
<th>Métrica</th>
<th>Impresiones Totales</th>
<th>CPM Combinado</th>
</tr>
<tr>
<td><strong>TOTAL</strong></td>
<td><strong>${hybridStrategy.totalImpressions.toLocaleString()}</strong></td>
<td><strong>€${hybridStrategy.blendedCPM.toFixed(2)}</strong></td>
</tr>
</table>

**Desglose de Campaña:**
- **Presupuesto Total Requerido:** €${hybridStrategy.totalBudget.toFixed(2)}
- **Fase 1 (Contenido y Autenticidad):** €${hybridStrategy.organicBudget.toFixed(2)} → ${hybridStrategy.organicImpressions.toLocaleString()} impresiones orgánicas
- **Fase 2 (Amplificación Pagada):** €${hybridStrategy.paidAmplificationBudget.toFixed(2)} → ${hybridStrategy.paidAmplificationImpressions.toLocaleString()} impresiones pagadas
- **Enfoque de Calidad:** ${tieredMetrics.highROIPercentage.toFixed(0)}% del presupuesto de contenido en Tier 1 y 2 (influencers que generan conversión)

**Por qué Funciona Esto:**
1. **Fase 1 - Creación de Contenido (€${hybridStrategy.organicBudget.toFixed(2)}):** Asociarse con ${tieredMetrics.totalInfluencers} influencers de alto engagement para crear contenido auténtico y creíble que genere conversiones reales y confianza en la marca.

2. **Fase 2 - Amplificación Pagada (€${hybridStrategy.paidAmplificationBudget.toFixed(2)}):** Usar Anuncios de Influencers Autorizados para amplificar ese contenido auténtico a ${hybridStrategy.paidAmplificationImpressions.toLocaleString()} personas adicionales a €${hybridStrategy.paidCPM.toFixed(2)} CPM.

**Resultado:** Obtienes la **autenticidad** de los influencers Tier 1 Y el **alcance masivo** de una campaña de ${impressionGoal.toLocaleString()} impresiones.

**Rendimiento Orgánico por Tier:**
${tieredMetrics.tiers.map(tier => 
  `- **${tier.tierLabel}:** ${tier.influencers.length} influencers | ${tier.estimatedImpressions.toLocaleString()} impresiones orgánicas | €${tier.strategicCPM.toFixed(2)} CPM`
).join('\n')}`;
  } else {
    // Standard organic-only projection
    return `<table>
<tr>
<th>Impresiones Totales</th>
<th>CPM Combinado</th>
</tr>
<tr>
<td>${tieredMetrics.totalImpressions.toLocaleString()}</td>
<td>€${tieredMetrics.blendedCPM.toFixed(2)}</td>
</tr>
</table>

**Desglose de Campaña:**
- **Presupuesto Total (Implícito):** €${tieredMetrics.totalBudget.toFixed(2)}
- **Enfoque de Calidad:** ${tieredMetrics.highROIPercentage.toFixed(0)}% del presupuesto en Tier 1 y 2 (influencers que generan conversión)
${impressionGoal ? `- **Objetivo de Impresiones:** ${impressionGoal.toLocaleString()} (✅ **Alcanzable** con alcance orgánico)` : ''}

**Rendimiento por Tier:**
${tieredMetrics.tiers.map(tier => 
  `- **${tier.tierLabel}:** ${tier.influencers.length} influencers | ${tier.estimatedImpressions.toLocaleString()} impresiones | €${tier.strategicCPM.toFixed(2)} CPM`
).join('\n')}`;
  }
})()}

### ✅ Indicadores Clave de Rendimiento

**Métricas Principales de Éxito:**

1. **📊 Alcance y Awareness**
   - Rango de impresiones esperadas basado en el alcance de influencers
   - Alcance único en todos los influencers
   - Frecuencia de menciones de marca y sentimiento

2. **💬 Engagement y Conexión**
   - Mantener ${(influencers.reduce((sum, inf) => sum + inf.engagement, 0) / influencers.length).toFixed(1)}%+ tasa de engagement promedio
   - Interacciones esperadas basadas en tasas de engagement
   - Ratio de sentimiento positivo >85%

3. **🔗 Tráfico y Conversiones**
   - Generar clics a la página de destino
   - Lograr leads cualificados
   - Monitorear tasas de conversión

4. **🎯 Impacto de Marca**
   - Incremento en awareness de marca
   - Aumento en intención de compra
   - ${influencers.length * 50}+ piezas de contenido auténtico generado por usuarios

---

## 📝 Recomendaciones Estratégicas

Basado en los objetivos de ${brief.clientName} y el panorama actual de influencers, proporciona 4-6 recomendaciones ESPECÍFICAS y ACCIONABLES adaptadas a la industria y objetivos de campaña de ${brief.clientName}.

**CRÍTICO:** Estas recomendaciones deben ser ESPECÍFICAS para ${brief.clientName}, NO consejos genéricos de marketing de influencers.

**EJEMPLO DE BUENA RECOMENDACIÓN:**
"Para Pikolinos: Asociarse con artesanos españoles que se alineen con la narrativa de calzado hecho a mano. Crear serie 'Detrás del Oficio' mostrando artesanos hábiles, conectando la marca con el auténtico patrimonio artesanal español."

**EJEMPLO DE MALA RECOMENDACIÓN (EVITAR):**
"Autenticidad sobre Perfección: Animar a los influencers a crear contenido genuino y cercano."

Genera recomendaciones que:
- Sean específicas para la industria y posicionamiento de marca de ${brief.clientName}
- Referencien tácticas o enfoques concretos
- Se conecten con los objetivos de campaña: ${brief.campaignGoals.join(', ')}
- Incluyan próximos pasos accionables cuando sea relevante

---

**REQUISITOS DE FORMATO:**
- Usa sintaxis markdown apropiada con jerarquía clara
- Incluye tablas para datos de influencers (fáciles de escanear)
- Usa emojis con moderación solo para encabezados de sección
- Mantén un tono profesional pero atractivo
- Sé específico con números y métricas de datos reales de influencers
- Usa reglas horizontales (---) para separar secciones principales
- Asegura que todo el texto se ajuste correctamente (sin bloques de código para texto regular)
- Usa blockquotes (>) para destacados importantes

Devuelve SOLO el contenido en markdown, sin comentarios adicionales ni texto envolvente.`;

  try {
    const response = await withRetry(
      () => openai.chat.completions.create({
        model: "gpt-4o", // Using GPT-4o for high-quality long-form content
        messages: [
          {
            role: "system",
            content: "Eres un estratega experto en marketing de influencers. Crea documentos de marketing detallados y profesionales en formato markdown. TODO EL CONTENIDO DEBE SER GENERADO COMPLETAMENTE EN ESPAÑOL."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      }),
      RetryPresets.STANDARD
    );

    let markdown = response.choices[0]?.message?.content || "";
    
    if (!markdown) {
      throw new OpenAIError("No content generated", "empty_response");
    }

    // Remove any code block wrappers that OpenAI might add
    markdown = markdown.replace(/^```markdown\n?/g, '').replace(/\n?```$/g, '');
    markdown = markdown.replace(/^```\n?/g, '').replace(/\n?```$/g, '');
    markdown = markdown.trim();

    // Inject the REAL influencer sections with actual matched data
    if (manualInfluencerSection) {
      // If manual influencers exist, check if manual placeholder exists
      const hadManualPlaceholder = markdown.includes('[MANUAL_INFLUENCER_SECTION_PLACEHOLDER]');
      
      if (hadManualPlaceholder) {
        // Replace manual placeholder with manual section
        markdown = markdown.replace('[MANUAL_INFLUENCER_SECTION_PLACEHOLDER]', manualInfluencerSection);
        // Replace algorithm placeholder with only algorithm section (manual already inserted)
        markdown = markdown.replace('[INFLUENCER_SECTION_PLACEHOLDER]', influencerSection);
      } else {
        // No manual placeholder found, combine both sections at algorithm placeholder
        markdown = markdown.replace('[INFLUENCER_SECTION_PLACEHOLDER]', manualInfluencerSection + '\n\n' + influencerSection);
      }
    } else {
      // Only algorithm-matched influencers
      markdown = markdown.replace('[INFLUENCER_SECTION_PLACEHOLDER]', influencerSection);
    }

    // Post-process: Replace content pillar placeholders with AI-generated content
    // The AI should have generated content pillars in the response after reviewing influencer summaries
    // Extract them and insert into influencer sections
    for (let i = 0; i < influencers.length; i++) {
      const inf = influencers[i];
      const placeholderPattern = new RegExp(`\\*\\[Will be generated by AI based on ${inf.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'s profile\\]\\*`, 'g');
      
      // Try to find AI-generated content pillars for this influencer in the markdown
      // Look for patterns like "Content Pillars:" followed by bullet points after influencer sections
      // For now, generate basic pillars based on influencer profile
      const contentCategories = inf.contentCategories.slice(0, 3);
      const pillar1 = contentCategories[0] ? `- **${contentCategories[0].split(',')[0].trim()}**: Leverage ${inf.name}'s expertise in ${contentCategories[0].split(',')[0].trim().toLowerCase()} to showcase ${brief.clientName}'s brand alignment` : '';
      const pillar2 = contentCategories[1] ? `- **${contentCategories[1].split(',')[0].trim()}**: Create authentic content that resonates with ${inf.name}'s ${inf.followers >= 100000 ? 'engaged' : 'growing'} audience` : '';
      const pillar3 = inf.engagement > 50 ? `- **High-Engagement Storytelling**: Utilize ${inf.name}'s exceptional ${inf.engagement}% engagement rate for maximum impact` : '';
      
      const generatedPillars = [pillar1, pillar2, pillar3].filter(p => p).join('\n');
      
      if (generatedPillars) {
        markdown = markdown.replace(placeholderPattern, generatedPillars);
      }
    }

    // Post-process: Remove footer and "Strategic Alignment" section if AI generated them
    // Remove footer lines
    markdown = markdown.replace(/\*\*Document prepared by:\*\*.*$/gm, '');
    markdown = markdown.replace(/\*\*Database:\*\*.*$/gm, '');
    markdown = markdown.replace(/\*\*Last Updated:\*\*.*$/gm, '');
    markdown = markdown.replace(/AI-Powered Influencer Matching System.*$/gm, '');
    markdown = markdown.replace(/3,000\+ Verified Spanish Influencers.*$/gm, '');
    
    // Remove "Strategic Alignment" section if AI generated it
    markdown = markdown.replace(/\*\*Strategic Alignment:\*\*\s*\n\n[\s\S]*?(?=\n---|\n##|$)/g, '');
    
    // Clean up any double horizontal rules
    markdown = markdown.replace(/\n---\n---\n/g, '\n---\n');
    markdown = markdown.trim();

    // Step 2: Reflection & Refinement
    // Run the content through a second LLM pass to improve quality and specificity
    logInfo('Starting markdown refinement (second pass)', {
      initialLength: markdown.length
    });
    
    const refinedMarkdown = await refineMarkdownContent(markdown, brief, influencers);
    
    return refinedMarkdown;
  } catch (error) {
    logError(error, { function: 'generateMarkdownContent' });
    
    // Don't leak internal error details to client
    if (error instanceof Error) {
      // Only log sensitive details internally, return safe error to client
      if (error.message.includes("API key") || error.message.includes("401")) {
        throw new OpenAIError(
          "AI service configuration error. Please contact support.",
          "invalid_api_key"
        );
      }
      if (error.message.includes("quota") || error.message.includes("429")) {
        throw new OpenAIError(
          "Service temporarily unavailable. Please try again later.",
          "insufficient_quota"
        );
      }
      if (error.message.includes("timeout")) {
        throw new OpenAIError(
          "Request timed out. Please try again.",
          "timeout"
        );
      }
    }
    
    // Generic error message that doesn't leak implementation details
    throw new OpenAIError(
      "Unable to generate recommendations at this time. Please try again.",
      "generation_failed"
    );
  }
};

/**
 * Generate a unique ID
 */
const generateId = (): string => {
  return `response-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

