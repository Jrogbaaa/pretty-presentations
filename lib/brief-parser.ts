/**
 * Client-safe brief parsing utilities
 * These functions run in the browser and don't require server-side AI
 */

/**
 * Extract key information from brief for quick preview
 * This is a lightweight, client-side analysis that doesn't use AI
 */
export const extractBriefSummary = (briefText: string) => {
  const lowerText = briefText.toLowerCase();
  
  // Check for client/brand name
  const hasClient = 
    lowerText.includes("client") || 
    lowerText.includes("brand") ||
    lowerText.includes("company") ||
    lowerText.includes("cliente") ||
    lowerText.includes("marca");
  
  // Check for budget
  const hasBudget = 
    lowerText.includes("budget") ||
    lowerText.includes("€") ||
    lowerText.includes("euro") ||
    lowerText.includes("presupuesto") ||
    /\d+k/.test(lowerText) ||
    /\d+\s*(thousand|mil)/.test(lowerText);
  
  // Check for target audience
  const hasTarget = 
    lowerText.includes("target") ||
    lowerText.includes("audience") ||
    lowerText.includes("demographic") ||
    lowerText.includes("age") ||
    lowerText.includes("gender") ||
    lowerText.includes("audiencia") ||
    lowerText.includes("público");
  
  // Check for timeline
  const hasTimeline = 
    lowerText.includes("timeline") ||
    lowerText.includes("deadline") ||
    lowerText.includes("date") ||
    lowerText.includes("week") ||
    lowerText.includes("month") ||
    lowerText.includes("plazo") ||
    lowerText.includes("fecha");
  
  // Calculate confidence based on completeness
  const checks = [hasClient, hasBudget, hasTarget, hasTimeline];
  const completedChecks = checks.filter(Boolean).length;
  const confidence = Math.round((completedChecks / checks.length) * 100);
  
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
export const SAMPLE_BRIEF = `Brief de Campaña - The Band Perfume

Cliente: The Band
Producto: Lanzamiento nueva línea de perfumes de lujo
Presupuesto: 50,000€

Objetivos de la Campaña:
- Generar awareness sobre el lanzamiento de la nueva colección
- Posicionar The Band como marca premium en el segmento de perfumería de lujo
- Alcanzar 2M de impresiones en redes sociales
- Generar tráfico cualificado a la web de e-commerce

Target:
- Edad: 25-45 años
- Género: 60% mujeres, 40% hombres
- Ubicación: España (Madrid, Barcelona, Valencia)
- Intereses: Moda, lifestyle premium, belleza, tendencias
- Perfil socioeconómico: Medio-alto y alto

Territorio de Contenido:
- Unboxing y first impressions de la colección
- Storytelling sobre las notas olfativas y proceso de creación
- Lifestyle content integrando el perfume en rutinas diarias
- Momentos especiales (eventos, cenas, viajes)

Requerimientos:
- Contenido aspiracional pero auténtico
- Mencionar notas principales del perfume
- Link a la web en stories y bio
- Uso del hashtag #TheBandFragrance
- Tag @thebandofficial en todas las publicaciones

Plataformas Preferidas:
- Instagram (feed + stories + reels)
- TikTok

Timeline:
- Lanzamiento: 15 de octubre
- Duración campaña: 3 semanas
- Primera semana: Teaser content
- Segunda semana: Lanzamiento oficial
- Tercera semana: Testimonials y resultados

Notas Adicionales:
- Urgente: Necesitamos propuesta antes del 5 de octubre
- Confidencialidad: NDA requerido antes de compartir samples
- Looking After You gestionará envío de productos a influencers seleccionados`;
