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
Create a comprehensive, well-formatted markdown document with clear visual hierarchy:

# 🎯 ${brief.clientName} - Influencer Marketing Proposal

## 📋 Executive Summary

Brief overview (3-4 sentences) highlighting the campaign strategy, target audience, and expected outcomes.

---

## 📊 Brief Analysis

### Campaign Objectives

${brief.campaignGoals.map(goal => `- ${goal}`).join('\n')}

Provide 2-3 sentences of strategic analysis about how these objectives align with influencer marketing.

### Target Audience Profile

**Demographics:**
- Age Range: ${brief.targetDemographics.ageRange}
- Gender: ${brief.targetDemographics.gender}
- Location: ${brief.targetDemographics.location.join(", ")}

**Interests & Behaviors:**
${brief.targetDemographics.interests.map(interest => `- ${interest}`).join('\n')}

**Platform Preferences:**
${brief.platformPreferences.map(platform => `- ${platform}`).join('\n')}

### Budget & Timeline

- **Total Budget:** €${brief.budget.toLocaleString()}
- **Timeline:** ${brief.timeline}
- **Budget Allocation:** Provide breakdown (e.g., 70% influencer fees, 20% content production, 10% contingency)

---

## 🌟 Matched Influencers

> These ${influencers.length} influencers were selected from our database of 3,000+ Spanish influencers based on audience alignment, engagement quality, and brand fit.

${influencers.map((inf, idx) => `
### ${idx + 1}. ${inf.name} • @${inf.handle}

| Metric | Value |
|--------|-------|
| **Followers** | ${inf.followers.toLocaleString()} |
| **Engagement Rate** | ${inf.engagement}% |
| **Platform** | ${inf.platform} |
| **Categories** | ${inf.contentCategories.join(", ")} |
| **Estimated Cost** | €${inf.costEstimate?.toLocaleString() || "TBD"} per post |

**Why This Influencer:**

${inf.rationale}

**Recommended Content Mix:**
- 2-3 Instagram Reels showcasing [specific content]
- 3-4 Stories with swipe-up links
- 1 carousel post highlighting key features

---`).join('\n\n')}

---

## 💡 Creative Strategy

### Content Themes

Provide 3-4 content pillars that align with ${brief.clientName}'s brand and the campaign objectives:

1. **[Theme 1 Name]:** Description of content approach
2. **[Theme 2 Name]:** Description of content approach
3. **[Theme 3 Name]:** Description of content approach

### Recommended Content Mix

| Platform | Content Type | Frequency | Purpose |
|----------|-------------|-----------|---------|
| Instagram | Reels | 2-3 per week | Drive awareness & engagement |
| Instagram | Stories | Daily | Build connection & urgency |
| ${brief.platformPreferences[0] || 'TikTok'} | Short-form video | 3-4 per week | Viral potential & reach |

---

## 📈 Projected Performance

### Estimated Reach & Engagement

Based on the matched influencers' average performance:

- **Total Projected Impressions:** ${Math.round(influencers.reduce((sum, inf) => sum + (inf.followers * 0.3), 0)).toLocaleString()} - ${Math.round(influencers.reduce((sum, inf) => sum + (inf.followers * 0.5), 0)).toLocaleString()}
- **Estimated Engagement Rate:** ${(influencers.reduce((sum, inf) => sum + inf.engagement, 0) / influencers.length).toFixed(2)}% average
- **Expected Total Engagements:** ${Math.round(influencers.reduce((sum, inf) => sum + (inf.followers * (inf.engagement / 100) * 3), 0)).toLocaleString()}+
- **Estimated CPM:** €${((brief.budget / influencers.reduce((sum, inf) => sum + (inf.followers * 0.4), 0)) * 1000).toFixed(2)}

### Success Metrics

**Primary KPIs:**
- Reach: Target 2M+ impressions
- Engagement: Maintain ${(influencers.reduce((sum, inf) => sum + inf.engagement, 0) / influencers.length).toFixed(1)}%+ average ER
- Website Traffic: Drive 50K+ clicks to landing page
- Conversion: Achieve ${brief.budget > 50000 ? '500+' : '200+'} qualified leads

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

    const markdown = response.choices[0]?.message?.content || "";
    
    if (!markdown) {
      throw new OpenAIError("No content generated", "empty_response");
    }

    return markdown;
  } catch (error) {
    logError(error, { function: 'generateMarkdownContent' });
    
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        throw new OpenAIError(
          "Invalid OpenAI API key",
          "invalid_api_key"
        );
      }
      if (error.message.includes("quota")) {
        throw new OpenAIError(
          "OpenAI API quota exceeded",
          "insufficient_quota"
        );
      }
    }
    
    throw new OpenAIError(
      "Failed to generate markdown response",
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

