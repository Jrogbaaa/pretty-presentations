import type { ClientBrief, SelectedInfluencer, BrandProfile } from '@/types';
import { getBrandProfile, searchBrands } from './brand-service';
import OpenAI from 'openai';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

/**
 * Main entry point: Match brand to influencers using brand intelligence
 */
export async function matchBrandToInfluencers(
  brandName: string,
  brief: ClientBrief,
  influencerPool: SelectedInfluencer[]
): Promise<{
  brandProfile: BrandProfile | null;
  enhancedBrief: ClientBrief;
  suggestions: string[];
}> {
  // Get brand profile (exact match or similar)
  const brandProfile = await getBrandProfile(
    brandName,
    JSON.stringify(brief)
  );
  
  if (!brandProfile) {
    console.warn(`No brand profile found for: ${brandName}`);
    return {
      brandProfile: null,
      enhancedBrief: brief,
      suggestions: [
        `No brand profile found for "${brandName}". Using brief details only.`,
        'Consider adding this brand to the database for better matching in future campaigns.'
      ],
    };
  }
  
  // Enhance the brief with brand intelligence
  const enhancedBrief = await enhanceBriefWithBrandData(brief, brandProfile);
  
  // Generate brand-specific suggestions
  const suggestions = await generateBrandSuggestions(brandProfile, brief);
  
  return {
    brandProfile,
    enhancedBrief,
    suggestions,
  };
}

/**
 * Enhance client brief with brand profile data
 */
async function enhanceBriefWithBrandData(
  brief: ClientBrief,
  brandProfile: BrandProfile
): Promise<ClientBrief> {
  const enhanced = { ...brief };
  
  // Merge brand target interests with brief interests
  const combinedInterests = [
    ...new Set([
      ...enhanced.targetDemographics.interests,
      ...brandProfile.targetInterests,
    ])
  ];
  
  // Merge content themes with brand themes
  const combinedThemes = [
    ...new Set([
      ...enhanced.contentThemes,
      ...brandProfile.contentThemes,
    ])
  ];
  
  // Update brief with brand intelligence
  enhanced.targetDemographics = {
    ...enhanced.targetDemographics,
    interests: combinedInterests,
  };
  
  enhanced.contentThemes = combinedThemes;
  
  // Add brand context to additional notes
  const brandContext = `
Brand Profile: ${brandProfile.name} (${brandProfile.industry})
Brand Description: ${brandProfile.description}
Target Age: ${brandProfile.targetAge}
Target Gender: ${brandProfile.targetGender}
${brandProfile.similarBrands ? `Similar Brands: ${brandProfile.similarBrands.join(', ')}` : ''}
${brandProfile.matchReason ? `Match Context: ${brandProfile.matchReason}` : ''}
`.trim();
  
  enhanced.additionalNotes = enhanced.additionalNotes
    ? `${enhanced.additionalNotes}\n\n${brandContext}`
    : brandContext;
  
  return enhanced;
}

/**
 * Generate AI-powered brand-specific suggestions
 * Uses data-driven fallbacks, optionally enhanced with OpenAI
 */
async function generateBrandSuggestions(
  brandProfile: BrandProfile,
  brief: ClientBrief
): Promise<string[]> {
  // Smart data-driven fallback suggestions
  const fallbackSuggestions = [
    `Prioritize influencers with ${brandProfile.targetInterests.slice(0, 2).join(' and ')} content focus`,
    `Align content themes with: ${brandProfile.contentThemes.slice(0, 3).join(', ')}`,
    `Target ${brandProfile.targetAge} ${brandProfile.targetGender} demographic`,
    `Focus on ${brief.platformPreferences.join(' and ')} for maximum reach`,
  ];

  // Only use OpenAI if API key is configured
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.length < 20) {
    return fallbackSuggestions;
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a brand strategy expert. Provide specific, actionable suggestions as a JSON array of strings.'
        },
        {
          role: 'user',
          content: `Brand: ${brandProfile.name} (${brandProfile.industry})
${brandProfile.description}
Target: ${brandProfile.targetAge} ${brandProfile.targetGender}
Interests: ${brandProfile.targetInterests.join(', ')}
Content Themes: ${brandProfile.contentThemes.join(', ')}

Campaign Goals: ${brief.campaignGoals.join(', ')}
Budget: €${brief.budget}
Demographics: ${brief.targetDemographics.ageRange}, ${brief.targetDemographics.gender}, ${brief.targetDemographics.location.join(', ')}
Platforms: ${brief.platformPreferences.join(', ')}

Provide 4-6 specific suggestions for influencer selection and campaign strategy.
Return ONLY a JSON array of strings: ["suggestion 1", "suggestion 2", ...]`
        }
      ],
      temperature: 0.7,
      max_tokens: 400,
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      const jsonMatch = content.match(/\[\s*"[\s\S]*"\s*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }
    
    return fallbackSuggestions;
  } catch (error) {
    // Silently return fallback suggestions - no need to log API issues
    return fallbackSuggestions;
  }
}

/**
 * Identify brand category for unknown brands
 * Uses OpenAI for classification
 */
export async function identifyBrandCategory(
  brandName: string,
  briefContext?: string
): Promise<{
  industry: string;
  suggestedInterests: string[];
  confidence: number;
}> {
  const fallback = {
    industry: 'Unknown',
    suggestedInterests: [],
    confidence: 0,
  };

  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.length < 20) {
    return fallback;
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'system',
        content: 'You are a brand classification expert. Return ONLY valid JSON.'
      }, {
        role: 'user',
        content: `Classify this brand:

Brand: "${brandName}"
${briefContext ? `Context: ${briefContext}` : ''}

Industries: Fashion & Retail, Food & Grocery, Sports & Fitness, Beauty & Cosmetics, Electronics & Technology, Automotive, Financial Services, Telecommunications, Energy & Fuel, Hospitality & Tourism, Home & Decor, Home Improvement

Interests: Fashion, Shopping, Sports, Fitness, Food, Technology, Gaming, Travel, Beauty, Wellness, Lifestyle, Business

Return ONLY this JSON:
{
  "industry": "category",
  "suggestedInterests": ["interest1", "interest2", "interest3"],
  "confidence": 85
}`
      }],
      temperature: 0.5,
      max_tokens: 200,
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      const jsonMatch = content.match(/\{\s*"industry"[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }
    
    return fallback;
  } catch (error) {
    return fallback;
  }
}

/**
 * Find relevant influencers based on brand profile
 */
export async function findRelevantInfluencers(
  brandProfile: BrandProfile,
  brief: ClientBrief,
  influencerPool: SelectedInfluencer[]
): Promise<SelectedInfluencer[]> {
  // Filter influencers based on brand profile
  const relevant = influencerPool.filter(influencer => {
    // Check if influencer's content matches brand interests
    const hasMatchingInterests = brandProfile.targetInterests.some(interest =>
      influencer.contentCategories.some(category =>
        category.toLowerCase().includes(interest.toLowerCase()) ||
        interest.toLowerCase().includes(category.toLowerCase())
      )
    );
    
    // Check if influencer has worked with similar brands
    const hasWorkedWithSimilarBrands = brandProfile.similarBrands?.some(similarBrand =>
      influencer.previousBrands.some(previousBrand =>
        previousBrand.toLowerCase().includes(similarBrand.toLowerCase())
      )
    ) || false;
    
    // Check demographic alignment
    const ageMatches = influencer.demographics.ageRange === brandProfile.targetAge ||
      influencer.demographics.ageRange.includes(brandProfile.targetAge.split('-')[0]);
    
    const genderMatches = brandProfile.targetGender === 'Mixed' ||
      influencer.demographics.gender === brandProfile.targetGender ||
      influencer.demographics.gender === 'Mixed';
    
    // Return influencers with at least 2 matching criteria
    const matchCount = [
      hasMatchingInterests,
      hasWorkedWithSimilarBrands,
      ageMatches && genderMatches
    ].filter(Boolean).length;
    
    return matchCount >= 2;
  });
  
  return relevant;
}

/**
 * Get brand intelligence summary for reporting
 */
export async function getBrandIntelligenceSummary(
  brandName: string,
  brief: ClientBrief
): Promise<{
  brandFound: boolean;
  brandProfile: BrandProfile | null;
  matchQuality: 'exact' | 'similar' | 'none';
  recommendations: string[];
}> {
  const brandProfile = await getBrandProfile(brandName, JSON.stringify(brief));
  
  if (!brandProfile) {
    // Try to identify the category for unknown brands
    const category = await identifyBrandCategory(brandName, JSON.stringify(brief));
    
    return {
      brandFound: false,
      brandProfile: null,
      matchQuality: 'none',
      recommendations: [
        `"${brandName}" not found in database (${category.confidence}% confident it's in ${category.industry})`,
        `Suggested focus: ${category.suggestedInterests.join(', ')} influencers`,
        'Using brief details only for influencer matching',
        'Consider adding this brand to database for future campaigns',
      ],
    };
  }
  
  const matchQuality = brandProfile.matchScore === 100 ? 'exact' : 'similar';
  const suggestions = await generateBrandSuggestions(brandProfile, brief);
  
  return {
    brandFound: true,
    brandProfile,
    matchQuality,
    recommendations: [
      `Brand profile: ${brandProfile.name} (${brandProfile.industry})`,
      `Match quality: ${matchQuality} (${brandProfile.matchScore}%)`,
      ...suggestions.slice(0, 3),
    ],
  };
}

