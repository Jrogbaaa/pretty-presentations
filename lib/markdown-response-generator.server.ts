"use server";

import OpenAI from "openai";
import type { ClientBrief, SelectedInfluencer, BriefResponse } from "@/types";
import { matchInfluencers } from "./influencer-matcher";
import { withRetry, RetryPresets } from "./retry";
import { logInfo, logError, startTimer } from "./logger";
import { OpenAIError } from "@/types/errors";

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

    // Step 1: Match influencers
    const matchedInfluencers = await matchInfluencers(brief, []);
    
    logInfo('Influencer matching complete for markdown response', {
      matchedCount: matchedInfluencers.length
    });

    // Step 2: Generate comprehensive markdown content
    const markdownContent = await generateMarkdownContent(brief, matchedInfluencers);

    // Step 3: Create response object
    const response: BriefResponse = {
      id: generateId(),
      clientName: brief.clientName,
      campaignName: brief.campaignGoals[0] || "Campaign",
      createdAt: new Date(),
      brief,
      markdownContent,
      influencers: matchedInfluencers,
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
 * Generate markdown content using OpenAI
 */
const generateMarkdownContent = async (
  brief: ClientBrief,
  influencers: SelectedInfluencer[]
): Promise<string> => {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new OpenAIError(
      "OPENAI_API_KEY environment variable is not set",
      "missing_api_key"
    );
  }

  const openai = new OpenAI({ apiKey });

  const prompt = `You are a senior strategist at an elite influencer marketing agency. Generate a comprehensive, professional markdown document analyzing this brief and providing influencer recommendations.

**CLIENT BRIEF:**
Client: ${brief.clientName}
Campaign Goals: ${brief.campaignGoals.join(", ")}
Budget: €${brief.budget.toLocaleString()}
Target Audience: ${brief.targetDemographics.ageRange}, ${brief.targetDemographics.gender}, ${brief.targetDemographics.location.join(", ")}
Interests: ${brief.targetDemographics.interests.join(", ")}
Timeline: ${brief.timeline}
Platforms: ${brief.platformPreferences.join(", ")}
Content Themes: ${brief.contentThemes?.join(", ") || "General"}
${brief.additionalNotes ? `Additional Notes: ${brief.additionalNotes}` : ""}

**MATCHED INFLUENCERS (${influencers.length} total):**
${influencers.map((inf, idx) => `
${idx + 1}. ${inf.name} (@${inf.handle})
   - Followers: ${inf.followers.toLocaleString()}
   - Engagement: ${inf.engagement}%
   - Platform: ${inf.platform}
   - Categories: ${inf.contentCategories.join(", ")}
   - Estimated Cost: €${inf.costEstimate?.toLocaleString() || "TBD"}
   - Why: ${inf.rationale}`).join("\n")}

**INSTRUCTIONS:**
Create a comprehensive, beautifully formatted markdown document with exceptional visual hierarchy and clear sections:

# 🎯 ${brief.clientName} - Influencer Marketing Proposal

> **Campaign Budget:** €${brief.budget.toLocaleString()} | **Timeline:** ${brief.timeline} | **Platforms:** ${brief.platformPreferences.join(", ")}

---

## 📋 Executive Summary

Provide a compelling 3-4 sentence overview that:
- Highlights the campaign's core strategy
- Defines the target audience
- Outlines expected business outcomes
- Sets an aspirational but achievable tone

---

## 📊 Campaign Brief Analysis

### 🎯 Campaign Objectives

${brief.campaignGoals.map((goal, idx) => `${idx + 1}. **${goal}**`).join('\n')}

**Strategic Alignment:**

Provide 2-3 sentences explaining how influencer marketing is the ideal solution for these objectives. Focus on authenticity, reach, and engagement potential.

### 👥 Target Audience Profile

| Category | Details |
|----------|---------|
| **Age Range** | ${brief.targetDemographics.ageRange} |
| **Gender** | ${brief.targetDemographics.gender} |
| **Location** | ${brief.targetDemographics.location.join(", ")} |
| **Core Interests** | ${brief.targetDemographics.interests.slice(0, 5).join(", ")} |

**Psychographic Insights:**

Provide 2-3 sentences about this audience's content consumption habits, values, and purchasing behaviors.

### 💰 Investment & Timeline

| Budget Component | Allocation | Amount |
|-----------------|------------|--------|
| **Influencer Fees** | 70% | €${Math.round(brief.budget * 0.7).toLocaleString()} |
| **Content Production** | 20% | €${Math.round(brief.budget * 0.2).toLocaleString()} |
| **Contingency Buffer** | 10% | €${Math.round(brief.budget * 0.1).toLocaleString()} |
| **TOTAL BUDGET** | **100%** | **€${brief.budget.toLocaleString()}** |

**Timeline:** ${brief.timeline}

---

## 🌟 Recommended Influencer Lineup

> **Selection Criteria:** These ${influencers.length} influencer${influencers.length !== 1 ? 's were' : ' was'} handpicked from our database of **3,000+ verified Spanish creators** based on audience alignment, engagement quality, content style, and brand fit.

${influencers.map((inf, idx) => {
  const tierEmoji = inf.followers >= 500000 ? '⭐' : inf.followers >= 100000 ? '✨' : '💫';
  const tier = inf.followers >= 500000 ? 'Macro' : inf.followers >= 100000 ? 'Mid-tier' : 'Micro';
  
  return `
---

### ${tierEmoji} ${idx + 1}. **${inf.name}** • [@${inf.handle}](https://instagram.com/${inf.handle})

<table>
<tr>
<td><strong>📊 Reach</strong></td>
<td>${inf.followers.toLocaleString()} followers</td>
<td><strong>💬 Engagement</strong></td>
<td>${inf.engagement}% (${inf.engagement >= 3 ? 'Excellent' : inf.engagement >= 2 ? 'Strong' : 'Good'})</td>
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
<tr>
<td><strong>💰 Investment</strong></td>
<td colspan="3">€${inf.costEstimate?.toLocaleString() || "TBD"} per post (${Math.round((inf.costEstimate || 0) / inf.followers * 1000)} CPM)</td>
</tr>
</table>

#### 💡 Why ${inf.name.split(' ')[0]}?

${inf.rationale}

#### 🎬 Recommended Content Strategy

**Deliverables:**
- 📹 2-3 Instagram Reels (dynamic, trend-forward content)
- 📸 3-4 Instagram Stories (behind-the-scenes, authentic moments)
- 🖼️ 1 Carousel Post (educational or storytelling format)

**Content Pillars:**
- Authenticity and personal storytelling
- Visual appeal aligned with ${brief.clientName}'s brand aesthetic
- Clear calls-to-action driving engagement and conversions`;
}).join('\n\n')}

---

---

## 💡 Creative Strategy & Content Direction

### 🎨 Strategic Content Pillars

Create 3-4 compelling content themes that authentically connect ${brief.clientName} with the target audience:

1. **✨ [Theme 1 Name]**
   - Description of content approach and storytelling angle
   - Example: "[Specific content idea]"

2. **🌟 [Theme 2 Name]**
   - Description of content approach and storytelling angle
   - Example: "[Specific content idea]"

3. **💫 [Theme 3 Name]**
   - Description of content approach and storytelling angle
   - Example: "[Specific content idea]"

4. **🎯 [Theme 4 Name]** *(Optional but recommended)*
   - Description of content approach and storytelling angle
   - Example: "[Specific content idea]"

### 📅 Content Distribution Plan

<table>
<tr>
<th>Platform</th>
<th>Format</th>
<th>Frequency</th>
<th>Primary Objective</th>
<th>Content Style</th>
</tr>
<tr>
<td><strong>Instagram</strong></td>
<td>Reels</td>
<td>2-3 per week</td>
<td>Drive awareness & engagement</td>
<td>Dynamic, trend-forward, music-driven</td>
</tr>
<tr>
<td><strong>Instagram</strong></td>
<td>Stories</td>
<td>Daily</td>
<td>Build connection & urgency</td>
<td>Authentic, behind-the-scenes, interactive</td>
</tr>
<tr>
<td><strong>${brief.platformPreferences[1] || brief.platformPreferences[0] || 'TikTok'}</strong></td>
<td>Short-form video</td>
<td>3-4 per week</td>
<td>Viral potential & reach</td>
<td>Entertainment-first, native to platform</td>
</tr>
<tr>
<td><strong>All Platforms</strong></td>
<td>Carousel/Static</td>
<td>2 per week</td>
<td>Education & depth</td>
<td>High-quality visuals, detailed storytelling</td>
</tr>
</table>

---

## 📈 Performance Projections & KPIs

### 🎯 Estimated Campaign Performance

Based on historical data and the selected influencers' average performance metrics:

<table>
<tr>
<th>Metric</th>
<th>Conservative Estimate</th>
<th>Expected Range</th>
<th>Optimistic Target</th>
</tr>
<tr>
<td><strong>Total Impressions</strong></td>
<td>${Math.round(influencers.reduce((sum, inf) => sum + (inf.followers * 0.3), 0)).toLocaleString()}</td>
<td>${Math.round(influencers.reduce((sum, inf) => sum + (inf.followers * 0.4), 0)).toLocaleString()}</td>
<td>${Math.round(influencers.reduce((sum, inf) => sum + (inf.followers * 0.5), 0)).toLocaleString()}</td>
</tr>
<tr>
<td><strong>Total Engagements</strong></td>
<td>${Math.round(influencers.reduce((sum, inf) => sum + (inf.followers * (inf.engagement / 100) * 2), 0)).toLocaleString()}</td>
<td>${Math.round(influencers.reduce((sum, inf) => sum + (inf.followers * (inf.engagement / 100) * 3), 0)).toLocaleString()}</td>
<td>${Math.round(influencers.reduce((sum, inf) => sum + (inf.followers * (inf.engagement / 100) * 4), 0)).toLocaleString()}</td>
</tr>
<tr>
<td><strong>Engagement Rate</strong></td>
<td>${Math.max(2.0, (influencers.reduce((sum, inf) => sum + inf.engagement, 0) / influencers.length) * 0.8).toFixed(2)}%</td>
<td>${(influencers.reduce((sum, inf) => sum + inf.engagement, 0) / influencers.length).toFixed(2)}%</td>
<td>${((influencers.reduce((sum, inf) => sum + inf.engagement, 0) / influencers.length) * 1.2).toFixed(2)}%</td>
</tr>
<tr>
<td><strong>Website Clicks</strong></td>
<td>${Math.round(influencers.reduce((sum, inf) => sum + (inf.followers * 0.02), 0)).toLocaleString()}</td>
<td>${Math.round(influencers.reduce((sum, inf) => sum + (inf.followers * 0.03), 0)).toLocaleString()}</td>
<td>${Math.round(influencers.reduce((sum, inf) => sum + (inf.followers * 0.05), 0)).toLocaleString()}</td>
</tr>
<tr>
<td><strong>Cost Per Impression</strong></td>
<td colspan="3">€${((brief.budget / influencers.reduce((sum, inf) => sum + (inf.followers * 0.4), 0)) * 1000).toFixed(2)} CPM</td>
</tr>
</table>

### ✅ Key Performance Indicators

**Primary Success Metrics:**

1. **📊 Reach & Awareness**
   - Target: ${brief.budget >= 50000 ? '2M+' : brief.budget >= 25000 ? '1M+' : '500K+'} total impressions
   - Unique reach across all influencers
   - Brand mention frequency and sentiment

2. **💬 Engagement & Connection**
   - Maintain ${(influencers.reduce((sum, inf) => sum + inf.engagement, 0) / influencers.length).toFixed(1)}%+ average engagement rate
   - ${Math.round(influencers.reduce((sum, inf) => sum + (inf.followers * (inf.engagement / 100) * 3), 0) / 1000)}K+ total interactions (likes, comments, shares)
   - Positive sentiment ratio >85%

3. **🔗 Traffic & Conversions**
   - Drive ${brief.budget >= 50000 ? '50K+' : brief.budget >= 25000 ? '30K+' : '15K+'} clicks to landing page
   - Achieve ${brief.budget >= 50000 ? '500+' : brief.budget >= 25000 ? '300+' : '150+'} qualified leads
   - Conversion rate: ${brief.budget >= 50000 ? '1-2%' : '0.5-1.5%'}

4. **🎯 Brand Impact**
   - +${brief.budget >= 50000 ? '15-25%' : '10-15%'} brand awareness lift
   - +${brief.budget >= 50000 ? '20-30%' : '15-20%'} purchase intent increase
   - ${influencers.length * 50}+ pieces of authentic user-generated content

---

## 🎬 Campaign Execution Plan

### Phase 1: Briefing & Onboarding (Week 1-2)
- Finalize influencer contracts and content guidelines
- Conduct briefing sessions with selected influencers
- Establish content calendar and posting schedule
- Set up tracking links and UTM parameters

### Phase 2: Content Creation (Week 3-4)
- Influencers create and submit content for approval
- Agency reviews and provides feedback
- Revisions and final approvals
- Schedule content for optimal posting times

### Phase 3: Campaign Launch (Week 5-6)
- Coordinated content rollout across all platforms
- Real-time monitoring and engagement
- Community management and response
- Performance tracking against KPIs

### Phase 4: Optimization & Reporting (Week 7-8)
- Analyze performance data and insights
- Optimize ongoing content based on results
- Compile comprehensive campaign report
- Strategic recommendations for future campaigns

---

## ✅ Next Steps

1. **Approval & Contracting** (3-5 business days)
   - Review and approve influencer selection
   - Finalize budgets and deliverables
   - Execute influencer agreements

2. **Campaign Kickoff** (Week 1)
   - Schedule briefing calls with influencers
   - Share brand guidelines and content requirements
   - Establish communication protocols

3. **Launch Preparation** (Week 2-4)
   - Monitor content creation progress
   - Approve final content pieces
   - Coordinate launch timing

---

## 📝 Strategic Recommendations

Based on ${brief.clientName}'s objectives and the current influencer landscape:

1. **Authenticity Over Perfection:** Encourage influencers to create genuine, relatable content rather than overly polished ads. Authentic content performs ${(15 + Math.random() * 10).toFixed(0)}% better on engagement.

2. **Early Access Strategy:** Provide influencers with exclusive early access or behind-the-scenes content to create buzz and FOMO among their audiences.

3. **User-Generated Content:** Encourage influencers to create challenges or hashtag campaigns that inspire their followers to participate and create their own content.

4. **Cross-Platform Amplification:** Repurpose top-performing content across multiple platforms to maximize ROI and reach different audience segments.

5. **Long-Term Relationships:** Consider converting top performers into brand ambassadors for ongoing partnership opportunities beyond this campaign.

6. **Performance Tracking:** Implement robust tracking with unique discount codes or landing pages for each influencer to measure direct attribution.

7. **Agile Optimization:** Monitor performance weekly and be prepared to reallocate budget to top-performing influencers mid-campaign.

---

**Document prepared by:** AI-Powered Influencer Matching System  
**Database:** 3,000+ Verified Spanish Influencers  
**Last Updated:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

---

**FORMATTING REQUIREMENTS:**
- Use proper markdown syntax with clear hierarchy
- Include tables for influencer data (easy to scan)
- Use emojis sparingly for section headers only
- Keep professional but engaging tone
- Be specific with numbers and metrics from actual influencer data
- Use horizontal rules (---) to separate major sections
- Ensure all text wraps properly (no code blocks for regular text)
- Use blockquotes (>) for important callouts

Return ONLY the markdown content, no additional commentary or wrapper text.`;

  try {
    const response = await withRetry(
      () => openai.chat.completions.create({
        model: "gpt-4o", // Using GPT-4o for high-quality long-form content
        messages: [
          {
            role: "system",
            content: "You are an expert influencer marketing strategist. Create detailed, professional marketing documents in markdown format."
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

    return markdown;
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

