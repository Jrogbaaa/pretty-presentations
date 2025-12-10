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
    const tier = inf.followers >= 500000 ? 'Macro' : inf.followers >= 100000 ? 'Mid' : 'Micro';
    const engagementQuality = inf.engagement >= 3 ? 'Excellent' : inf.engagement >= 2 ? 'Strong' : 'Good';
    const firstName = inf.name.split(' ')[0];
    
    // Check for filming location in brief
    const brandReqs = brief.brandRequirements || [];
    const additionalNotes = brief.additionalNotes || '';
    const filmingLocation = brandReqs.find(req => req.toLowerCase().includes('location') || req.toLowerCase().includes('filming')) || 
                          (additionalNotes.toLowerCase().includes('location') || additionalNotes.toLowerCase().includes('filming') ? additionalNotes.match(/location[^.]*/i)?.[0] : null);
    
    return `
---

### ${tierEmoji} ${idx + 1}. **${inf.name}**${inf.handle ? ` • [@${inf.handle}]` : ''}${isPlaceholder ? ' _(Not in database)_' : ''}

<table>
<tr>
<td><strong>📊 Reach</strong></td>
<td>${inf.followers.toLocaleString()} followers${isPlaceholder ? ' (estimated)' : ''}</td>
<td><strong>💬 Engagement</strong></td>
<td>${inf.engagement}% (${engagementQuality})${isPlaceholder ? ' (estimated)' : ''}</td>
</tr>
<tr>
<td><strong>📱 Platform</strong></td>
<td>${inf.platform}</td>
<td><strong>🎭 Tier</strong></td>
<td>${tier} Influencer</td>
</tr>
    ${inf.contentCategories.length > 0 ? `<tr>
<td><strong>🎨 Content Focus</strong></td>
<td colspan="3">${inf.contentCategories.slice(0, 4).join(", ")}</td>
</tr>` : ''}
</table>

#### 💡 Why ${firstName}?

**Qualitative Reasoning:**
${filmingLocation ? `**Filming Location:** ${filmingLocation}\n\n` : ''}${inf.rationale || `${firstName} is an excellent fit based on audience alignment, engagement quality, and content style that matches ${brief.clientName}'s brand values.`}

**Quantitative Reasoning:**
- Engagement Rate: ${inf.engagement}% (${engagementQuality}) - ${inf.engagement >= 3 ? 'exceeds industry average' : inf.engagement >= 2 ? 'above industry average' : 'solid performance'}
- Reach: ${inf.followers.toLocaleString()} followers provides significant brand exposure
- Content Alignment: focus on ${inf.contentCategories.slice(0, 2).join(" and ")} aligns with target audience interests

#### 🎬 Recommended Content Strategy

**Deliverables:**
${inf.proposedContent?.map(content => `- 📹 ${content}`).join('\n') || '- 📹 2-3 Instagram Reels (dynamic content, trend-following)\n- 📸 3-4 Instagram Stories (behind-the-scenes, authentic moments)\n- 🖼️ 1 Carousel Post (educational or narrative format)'}

**Content Pillars:**
*[Will be generated by AI based on ${inf.name}'s profile]*`;
  });

  const databaseCount = influencers.filter(inf => inf.id && !inf.id.startsWith('manual-')).length;
  const placeholderCount = influencers.filter(inf => inf.id && inf.id.startsWith('manual-')).length;

  return `## 👥 Manually Requested Influencers

> **Note:** ${databaseCount > 0 ? `${databaseCount} influencer${databaseCount !== 1 ? 's were' : ' was'} found in our database. ` : ''}${placeholderCount > 0 ? `${placeholderCount} influencer${placeholderCount !== 1 ? 's' : ''} ${placeholderCount === 1 ? 'was not found' : 'were not found'} in our database - estimated data and AI-generated rationale provided.` : ''}
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
    return `## 🌟 Recommended Influencer Lineup

> **Note:** No influencers were found for this brief. Please adjust your criteria (budget, platforms, content themes, or location) and try again.`;
  }

  const influencerCards = influencers.map((inf, idx) => {
    const tierEmoji = inf.followers >= 500000 ? '⭐' : inf.followers >= 100000 ? '✨' : '💫';
    const tier = inf.followers >= 500000 ? 'Macro' : inf.followers >= 100000 ? 'Mid' : 'Micro';
    const engagementQuality = inf.engagement >= 3 ? 'Excellent' : inf.engagement >= 2 ? 'Strong' : 'Good';
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
<td><strong>📊 Reach</strong></td>
<td>${inf.followers.toLocaleString()} followers</td>
<td><strong>💬 Engagement</strong></td>
<td>${inf.engagement}% (${engagementQuality})</td>
</tr>
<tr>
<td><strong>📱 Platform</strong></td>
<td>${inf.platform}</td>
<td><strong>🎭 Tier</strong></td>
<td>${tier} Influencer</td>
</tr>
<tr>
<td><strong>🎨 Content Focus</strong></td>
<td colspan="3">${inf.contentCategories.slice(0, 4).join(", ")}</td>
</tr>
</table>

#### 💡 Why ${firstName}?

**Qualitative Reasoning:**
${filmingLocation ? `**Filming Location:** ${filmingLocation}\n\n` : ''}${inf.rationale || `${firstName} is an excellent fit based on audience alignment, engagement quality, and content style that matches ${brief.clientName}'s brand values.`}

**Quantitative Reasoning:**
- Engagement Rate: ${inf.engagement}% (${engagementQuality}) - ${inf.engagement >= 3 ? 'exceeds industry average' : inf.engagement >= 2 ? 'above industry average' : 'solid performance'}
- Reach: ${inf.followers.toLocaleString()} followers provides significant brand exposure
- Content Alignment: focus on ${inf.contentCategories.slice(0, 2).join(" and ")} aligns with target audience interests

#### 🎬 Recommended Content Strategy

**Deliverables:**
${inf.proposedContent?.map(content => `- 📹 ${content}`).join('\n') || '- 📹 2-3 Instagram Reels (dynamic content, trend-following)\n- 📸 3-4 Instagram Stories (behind-the-scenes, authentic moments)\n- 🖼️ 1 Carousel Post (educational or narrative format)'}

**Content Pillars:**
*[Will be generated by AI based on ${inf.name}'s profile]*`;
  }).join('\n');

  return `## 🌟 Recommended Influencer Lineup

> **Selection Criteria:** ${influencers.length === 1 ? 'This influencer was selected' : `These ${influencers.length} influencers were selected`} carefully from our database of **over 3,000 verified Spanish creators** based on audience alignment, engagement quality, content style, and brand fit.
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
  
  const reflectionPrompt = `You are a senior business strategist reviewing a revenue generation system proposal. Your task is to ensure this proposal generates measurable business results (sales, conversions, revenue) - not just vanity metrics.

**CRITICAL MINDSET: This is a REVENUE GENERATION SYSTEM, not a content recommendation tool.**

**IMPORTANT: YOUR ENTIRE RESPONSE MUST BE IN ENGLISH.**

**ORIGINAL PROPOSAL:**
${initialContent}

**CLIENT CONTEXT:**
- Client: ${brief.clientName}
- Industry: ${contentThemes}
- Campaign Goals: ${brief.campaignGoals.join(', ')}
- Target Audience: ${brief.targetDemographics.ageRange}, ${brief.targetDemographics.gender}
- Budget: €${brief.budget.toLocaleString()}
${hasSalesGoal ? '- **PRIMARY OBJECTIVE:** Generate sales and revenue (not just content)' : ''}

**QUALITY CHECKLIST - Identify and fix these issues:**

❌ **Generic "Influencer Marketing" Language** - Replace phrases like:
   - "Fresh & Premium", "Authenticity and storytelling" → Use specific tactics linked to conversion actions
   - "Visual appeal aligned with brand aesthetic" → Explain how visuals drive purchase intent
   - "Engaging content that drives conversions" → Specify WHAT engagement actions lead to WHAT business results
   - "Create genuine and relatable content" → Define genuine in terms of customer trust and purchase behavior

❌ **Missing Business Logic** - Each recommendation must answer:
   - HOW will this generate revenue/sales/conversions?
   - WHAT customer behavior change does this create?
   - WHY is this approach more effective than alternatives?
   ${hasSalesGoal ? '- WHAT is the expected ROIS (Return on Influencer Spend)?' : ''}

❌ **Vague Content Pillars** - Each pillar must:
   - Have a unique, memorable name tied to ${brief.clientName}'s value proposition (not "Social Media Activation")
   - Explain the psychological trigger it activates (urgency, social proof, trust, aspiration)
   - Specify which customer journey stage it addresses (awareness → consideration → purchase)
   - Define measurable success criteria

❌ **Non-Actionable Recommendations** - Must be:
   - Specific to ${brief.clientName}'s industry and competitive positioning
   - Include concrete tactics with clear success metrics
   - Reference proven marketing principles (scarcity, authority, social proof, etc.)
   - Explain expected ROI or business impact

❌ **Template-Style Executive Summary** - Must:
   - Start with the business problem ${brief.clientName} is solving
   - Quantify expected outcome (e.g., "projected to generate €${(brief.budget * 2.5).toLocaleString()} in revenue")
   - Reference specific campaign elements and their strategic rationale
   - Sound like it was written by someone who understands ${brief.clientName}'s market

**YOUR TASK:**
1. Read the proposal with a BUSINESS LENS (not a creative lens)
2. Ask: "Will this generate revenue?" for each section
3. Replace surface-level marketing language with results-focused strategic copy
4. Quantify expected results where possible (ROIS, conversion rates, revenue)
5. Ensure the proposal feels like a revenue investment plan, not a creative portfolio piece
6. Keep all strong strategic sections unchanged

**CRITICAL STANDARDS:**
- **Revenue Focus:** Each tactic must have a clear line to business results
- **Strategic Depth:** References to marketing psychology, competitive positioning, customer journey
- **Quantification:** Use numbers and projections (even if estimated) to build the business case
- **Brand-Specific:** ${brief.clientName} should be mentioned frequently with context-specific tactics
${hasSalesGoal ? '- **ROIS Clarity:** If this is a sales campaign, ROIS and revenue projections must be front and center' : ''}

Return the COMPLETE improved proposal in markdown format. If a section is already excellent, keep it exactly as is.`;

  try {
    const timer = startTimer('refineMarkdownContent');
    
    const response = await withRetry(
      () => openai.chat.completions.create({
        model: "gpt-4o-mini", // Faster and cheaper for refinement
        messages: [
          {
            role: "system",
            content: "You are a senior business strategist who refines marketing proposals to generate measurable revenue results. Focus on strategic depth, quantifiable projections, and clear business logic. This is a revenue generation system, not a creative portfolio. Return only markdown content without wrapper text. ALL CONTENT MUST BE IN ENGLISH."
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

  // Build additional context section if provided
  const additionalContextSection = brief.additionalContext && brief.additionalContext.length > 0
    ? `\n**ADDITIONAL CONTEXT (from uploaded files/documents):**\n${brief.additionalContext.map((ctx, idx) => 
        `--- ${ctx.name} (${ctx.type}) ---\n${ctx.content.substring(0, 5000)}${ctx.content.length > 5000 ? '\n[Content truncated...]' : ''}\n`
      ).join('\n')}\n`
    : '';

  const prompt = `You are a senior strategist at an elite influencer marketing agency. Generate a professional markdown document that analyzes this brief and provides strategic recommendations.

**CRITICAL: ALL CONTENT MUST BE GENERATED IN ENGLISH**

**QUALITY STANDARDS:**
${exampleGuidance}

**CLIENT BRIEF:**
Client: ${brief.clientName}
Campaign Goals: ${brief.campaignGoals.join(", ")}
Target Audience: ${brief.targetDemographics.ageRange}, ${brief.targetDemographics.gender}, ${brief.targetDemographics.location.join(", ")}
Interests: ${brief.targetDemographics.interests.join(", ")}
Timeline: ${brief.timeline}
Platforms: ${brief.platformPreferences.join(", ")}
Content Themes: ${brief.contentThemes?.join(", ") || "General"}
${brief.additionalNotes ? `Additional Notes: ${brief.additionalNotes}` : ""}
${additionalContextSection}

**SUMMARY OF SELECTED INFLUENCERS:**
${influencers.map((inf, idx) => `
${idx + 1}. **${inf.name}** (@${inf.handle})
   - Followers: ${inf.followers.toLocaleString()}
   - Engagement: ${inf.engagement}%
   - Content Focus: ${inf.contentCategories.slice(0, 3).join(", ")}
   - Platform: ${inf.platform}
   - Rationale: ${inf.rationale || 'Excellent fit based on audience alignment'}
`).join('\n')}

**CRITICAL:** After each influencer section in the document, you MUST generate 2-3 SPECIFIC and UNIQUE content pillars tailored to that influencer's profile. Look at their Content Focus, engagement style, and follower count to create unique recommendations. DO NOT use generic phrases like "Authenticity and personal storytelling" or "Visual appeal aligned with brand aesthetic". Each influencer must have different pillars based on their unique content style.

**INSTRUCTIONS:**
Create a complete, beautifully formatted markdown document with exceptional visual hierarchy and clear sections:

# 🎯 ${brief.clientName} - Influencer Marketing Proposal

> **Timeline:** ${brief.timeline} | **Platforms:** ${brief.platformPreferences.join(", ")}

---

## 📋 Executive Summary

Provide a compelling 3-4 sentence overview that:
- Highlights the campaign's core strategy
- Defines the target audience
- Describes expected business outcomes
- Establishes an aspirational yet achievable tone

---

## 📊 Campaign Brief Analysis

### 🎯 Campaign Goals

${brief.campaignGoals.map((goal, idx) => `${idx + 1}. **${goal}**`).join('\n')}

---

## 🎯 Campaign Strategy & Revenue Impact

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
    
    return `### 💰 Revenue-Oriented Approach

${strategyExplanation}

${formatRevenueMetrics(revenueMetrics)}

**Why Nano-Influencers Excel in E-Commerce:**
- **Higher Trust:** Small, engaged communities perceive recommendations as authentic advice from a friend, not as ads
- **Better Engagement:** Engagement rates of 12-18% vs 2-4% for macro-influencers
- **Lower Fraud:** Credible audience percentages of 85-95% vs 60-75% for larger accounts
- **Cost Efficiency:** €200-500 per post vs €5,000-20,000 for macro, allowing more creator partnerships

---`;
  } else if (strategy.goalType === 'awareness') {
    return `### 📢 Awareness-Focused Approach

${strategyExplanation}

This balanced approach prioritizes reach while maintaining authenticity through a strategic mix of influencer tiers. We allocate ${(strategy.macroWeight * 100).toFixed(0)}% of the budget to macro-influencers for maximum impression delivery.

---`;
  } else {
    return `### 🎯 Strategic Approach

${strategyExplanation}

---`;
  }
})()}

[INFLUENCER_SECTION_PLACEHOLDER]

---

## 💡 Creative Strategy & Content Direction

### 🎨 Strategic Content Pillars

${brief.contentThemes && brief.contentThemes.length > 0 ? `**Note:** The following creative ideas are based on concepts provided in the brief, expanded and refined for implementation.\n\n` : ''}Create 3-4 compelling content themes that authentically connect ${brief.clientName} with the target audience. ${brief.contentThemes && brief.contentThemes.length > 0 ? `If creative ideas were provided in the brief, incorporate and expand on them here.` : ''}

**IMPORTANT:** Each theme must be SPECIFIC, BRAND-ALIGNED, and CULTURALLY RELEVANT. Use unique, memorable names that reflect ${brief.clientName}'s brand identity and campaign goals. Each theme should have 3-4 lines of extension, explaining how it connects with the brand and target audience. Include hashtags for each theme. The first theme should be longer and more detailed, explaining how we feel it could best connect with the audience.

**DO NOT USE GENERIC PHRASES LIKE:**
- "Fresh & Premium"
- "Authenticity and personal storytelling" 
- "Visual appeal aligned with brand aesthetic"

**INSTEAD, CREATE SPECIFIC THEMES LIKE:**
- "Midnight Serenade Sessions" (for fragrances: evening routines with curated playlists)
- "Tarde con los tuyos" (for spirits: authentic social gatherings)
- "First Times That Matter" (for furniture: emotional connections to first experiences)

For each theme (expand to 3-4 lines each, add hashtags):
1. **✨ [Unique Theme Name Reflecting the Brand]**
   - Write 3-4 lines explaining how this theme connects ${brief.clientName} with the target audience, why it's effective, and how it could connect best. Be specific about narrative approach, content formats, and cultural relevance.
   - **Hashtags:** #HashtagOne #HashtagTwo #HashtagThree

2. **🌟 [Unique Theme Name Reflecting the Brand]**
   - Write 3-4 lines explaining how this theme connects ${brief.clientName} with the target audience, why it's effective, and how it could connect best. Be specific about narrative approach, content formats, and cultural relevance.
   - **Hashtags:** #HashtagOne #HashtagTwo #HashtagThree

3. **💫 [Unique Theme Name Reflecting the Brand]**
   - Write 3-4 lines explaining how this theme connects ${brief.clientName} with the target audience, why it's effective, and how it could connect best. Be specific about narrative approach, content formats, and cultural relevance.
   - **Hashtags:** #HashtagOne #HashtagTwo #HashtagThree

4. **🎯 [Unique Theme Name Reflecting the Brand]** *(Optional but recommended)*
   - Write 3-4 lines explaining how this theme connects ${brief.clientName} with the target audience, why it's effective, and how it could connect best. Be specific about narrative approach, content formats, and cultural relevance.
   - **Hashtags:** #HashtagOne #HashtagTwo #HashtagThree

### 📅 Content Distribution Plan

**Tentative Schedule:**

<table>
<tr>
<th>Platform</th>
<th>Format</th>
<th>Primary Goal</th>
<th>Content Style</th>
</tr>
<tr>
<td><strong>Instagram</strong></td>
<td>Reels</td>
<td>Generate awareness and engagement</td>
<td>Teaser</td>
</tr>
<tr>
<td><strong>Instagram</strong></td>
<td>Stories</td>
<td>Build connection and urgency</td>
<td>Full story</td>
</tr>
<tr>
<td><strong>${brief.platformPreferences[1] || brief.platformPreferences[0] || 'TikTok'}</strong></td>
<td>Short video</td>
<td>Viral potential and reach</td>
<td>Entertainment first, platform-native</td>
</tr>
<tr>
<td><strong>All Platforms</strong></td>
<td>Carousel/Static</td>
<td>Education and depth</td>
<td>High-quality visuals, detailed storytelling</td>
</tr>
</table>

---

## 📈 Performance Projections & KPIs

### 🎯 Estimated Campaign Performance

Based on tier-based engagement analysis and evidence-based reach rates:

${(() => {
  const tieredMetrics = calculateTieredMetrics(influencers);
  const impressionGoal = extractImpressionGoal(brief);
  
  // Check if we need hybrid strategy
  if (impressionGoal && impressionGoal > tieredMetrics.totalImpressions * 1.2) {
    // Client has an impression goal that organic reach can't meet
    const hybridStrategy = calculateHybridStrategy(tieredMetrics, impressionGoal);
    
    return `
**⚠️ STRATEGIC CONFLICT DETECTED:**

Your brief requests **${impressionGoal.toLocaleString()} impressions**, but the selected influencer team can organically deliver **${tieredMetrics.totalImpressions.toLocaleString()} impressions** (**${hybridStrategy.shortfallPercentage.toFixed(0)}% shortfall**).

You cannot achieve all campaign objectives with organic reach alone. We recommend a **Hybrid Strategy** that separates content creation from media distribution.

---

### 💡 Recommended: Hybrid Strategy

<table>
<tr>
<th>Metric</th>
<th>Total Impressions</th>
<th>Blended CPM</th>
</tr>
<tr>
<td><strong>TOTAL</strong></td>
<td><strong>${hybridStrategy.totalImpressions.toLocaleString()}</strong></td>
<td><strong>€${hybridStrategy.blendedCPM.toFixed(2)}</strong></td>
</tr>
</table>

**Campaign Breakdown:**
- **Total Budget Required:** €${hybridStrategy.totalBudget.toFixed(2)}
- **Phase 1 (Content & Authenticity):** €${hybridStrategy.organicBudget.toFixed(2)} → ${hybridStrategy.organicImpressions.toLocaleString()} organic impressions
- **Phase 2 (Paid Amplification):** €${hybridStrategy.paidAmplificationBudget.toFixed(2)} → ${hybridStrategy.paidAmplificationImpressions.toLocaleString()} paid impressions
- **Quality Focus:** ${tieredMetrics.highROIPercentage.toFixed(0)}% of content budget on Tier 1 & 2 (conversion-driving influencers)

**Why This Works:**
1. **Phase 1 - Content Creation (€${hybridStrategy.organicBudget.toFixed(2)}):** Partner with ${tieredMetrics.totalInfluencers} high-engagement influencers to create authentic, credible content that drives real conversions and brand trust.

2. **Phase 2 - Paid Amplification (€${hybridStrategy.paidAmplificationBudget.toFixed(2)}):** Use Whitelisted Influencer Ads to amplify that authentic content to ${hybridStrategy.paidAmplificationImpressions.toLocaleString()} additional people at €${hybridStrategy.paidCPM.toFixed(2)} CPM.

**Result:** You get the **authenticity** of Tier 1 influencers AND the **massive reach** of a ${impressionGoal.toLocaleString()}-impression campaign.

**Organic Performance by Tier:**
${tieredMetrics.tiers.map(tier => 
  `- **${tier.tierLabel}:** ${tier.influencers.length} influencers | ${tier.estimatedImpressions.toLocaleString()} organic impressions | €${tier.strategicCPM.toFixed(2)} CPM`
).join('\n')}`;
  } else {
    // Standard organic-only projection
    return `<table>
<tr>
<th>Total Impressions</th>
<th>Blended CPM</th>
</tr>
<tr>
<td>${tieredMetrics.totalImpressions.toLocaleString()}</td>
<td>€${tieredMetrics.blendedCPM.toFixed(2)}</td>
</tr>
</table>

**Campaign Breakdown:**
- **Total Budget (Implied):** €${tieredMetrics.totalBudget.toFixed(2)}
- **Quality Focus:** ${tieredMetrics.highROIPercentage.toFixed(0)}% of budget on Tier 1 & 2 (conversion-driving influencers)
${impressionGoal ? `- **Impression Goal:** ${impressionGoal.toLocaleString()} (✅ **Achievable** with organic reach)` : ''}

**Performance by Tier:**
${tieredMetrics.tiers.map(tier => 
  `- **${tier.tierLabel}:** ${tier.influencers.length} influencers | ${tier.estimatedImpressions.toLocaleString()} impressions | €${tier.strategicCPM.toFixed(2)} CPM`
).join('\n')}`;
  }
})()}

### ✅ Key Performance Indicators

**Primary Success Metrics:**

1. **📊 Reach & Awareness**
   - Expected impression range based on influencer reach
   - Unique reach across all influencers
   - Brand mention frequency and sentiment

2. **💬 Engagement & Connection**
   - Maintain ${(influencers.reduce((sum, inf) => sum + inf.engagement, 0) / influencers.length).toFixed(1)}%+ average engagement rate
   - Expected interactions based on engagement rates
   - Positive sentiment ratio >85%

3. **🔗 Traffic & Conversions**
   - Generate clicks to landing page
   - Achieve qualified leads
   - Monitor conversion rates

4. **🎯 Brand Impact**
   - Increase in brand awareness
   - Growth in purchase intent
   - ${influencers.length * 50}+ pieces of authentic user-generated content

---

## 📝 Strategic Recommendations

Based on ${brief.clientName}'s objectives and the current influencer landscape, provide 4-6 SPECIFIC and ACTIONABLE recommendations tailored to ${brief.clientName}'s industry and campaign goals.

**CRITICAL:** These recommendations must be SPECIFIC to ${brief.clientName}, NOT generic influencer marketing advice.

**EXAMPLE OF GOOD RECOMMENDATION:**
"For Pikolinos: Partner with Spanish artisans who align with the handcrafted footwear narrative. Create a 'Behind the Craft' series showcasing skilled artisans, connecting the brand with authentic Spanish artisanal heritage."

**EXAMPLE OF BAD RECOMMENDATION (AVOID):**
"Authenticity over Perfection: Encourage influencers to create genuine and relatable content."

Generate recommendations that:
- Are specific to ${brief.clientName}'s industry and brand positioning
- Reference concrete tactics or approaches
- Connect with campaign goals: ${brief.campaignGoals.join(', ')}
- Include actionable next steps when relevant

---

**FORMAT REQUIREMENTS:**
- Use appropriate markdown syntax with clear hierarchy
- Include tables for influencer data (easy to scan)
- Use emojis sparingly, only for section headers
- Maintain a professional yet engaging tone
- Be specific with numbers and metrics from real influencer data
- Use horizontal rules (---) to separate main sections
- Ensure all text wraps properly (no code blocks for regular text)
- Use blockquotes (>) for important highlights

Return ONLY the markdown content, without additional comments or wrapper text.`;

  try {
    const response = await withRetry(
      () => openai.chat.completions.create({
        model: "gpt-4o", // Using GPT-4o for high-quality long-form content
        messages: [
          {
            role: "system",
            content: "You are an expert influencer marketing strategist. Create detailed and professional marketing documents in markdown format. ALL CONTENT MUST BE GENERATED COMPLETELY IN ENGLISH."
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

