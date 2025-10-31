import type { ClientBrief, SelectedInfluencer, BrandProfile } from '@/types';
import { getBrandProfile, searchBrands } from './brand-service';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI (using non-public env var for server-side security)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

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
 */
async function generateBrandSuggestions(
  brandProfile: BrandProfile,
  brief: ClientBrief
): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `You are a brand marketing strategist. Given the following brand and campaign brief, provide specific actionable suggestions for influencer selection and campaign strategy.

Brand: ${brandProfile.name}
Industry: ${brandProfile.industry}
Description: ${brandProfile.description}
Target Demographics: ${brandProfile.targetAge}, ${brandProfile.targetGender}
Target Interests: ${brandProfile.targetInterests.join(', ')}
Content Themes: ${brandProfile.contentThemes.join(', ')}
${brandProfile.matchScore !== 100 ? `Note: This is a ${brandProfile.matchScore}% match - ${brandProfile.matchReason}` : ''}

Campaign Goals: ${brief.campaignGoals.join(', ')}
Budget: €${brief.budget}
Target Demographics: ${brief.targetDemographics.ageRange}, ${brief.targetDemographics.gender}, ${brief.targetDemographics.location.join(', ')}
Platforms: ${brief.platformPreferences.join(', ')}

Provide 4-6 specific, actionable suggestions for:
1. Types of influencers to prioritize
2. Content angles that align with brand identity
3. Campaign execution tips
4. Potential pitfalls to avoid

Return as a JSON array of strings:
["suggestion 1", "suggestion 2", ...]

Return ONLY valid JSON, no other text.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = response.match(/\[\s*"[\s\S]*"\s*\]/);
    if (!jsonMatch) {
      console.error('No JSON found in AI response:', response);
      return [
        `Focus on influencers with ${brandProfile.targetInterests.slice(0, 2).join(' and ')} content`,
        `Align content themes with: ${brandProfile.contentThemes.slice(0, 3).join(', ')}`,
        `Target ${brandProfile.targetAge} ${brandProfile.targetGender} audience`,
      ];
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error generating brand suggestions:', error);
    return [
      `Focus on influencers with ${brandProfile.targetInterests.slice(0, 2).join(' and ')} content`,
      `Align content themes with: ${brandProfile.contentThemes.slice(0, 3).join(', ')}`,
      `Target ${brandProfile.targetAge} ${brandProfile.targetGender} audience`,
    ];
  }
}

/**
 * Identify brand category for unknown brands
 */
export async function identifyBrandCategory(
  brandName: string,
  briefContext?: string
): Promise<{
  industry: string;
  suggestedInterests: string[];
  confidence: number;
}> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `You are a brand classification expert. Analyze the following brand and determine its industry and target interests.

Brand Name: "${brandName}"
${briefContext ? `Context: ${briefContext}` : ''}

Task: Classify this brand into an industry category and identify key target interests.

Common industries: Fashion & Retail, Food & Grocery, Sports & Fitness, Beauty & Cosmetics, Electronics & Technology, Automotive, Food & Restaurant, Financial Services, Telecommunications, Energy & Fuel, Hospitality & Tourism, Transportation, Home & Decor, Home Improvement

Common interests: Fashion, Shopping, Sports, Fitness, Food, Technology, Gaming, Travel, Beauty, Wellness, Lifestyle, Business, etc.

Return ONLY a JSON object with this exact structure:
{
  "industry": "category name",
  "suggestedInterests": ["interest1", "interest2", "interest3"],
  "confidence": 85
}

Return ONLY valid JSON, no other text.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = response.match(/\{\s*"industry"[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in AI response:', response);
      return {
        industry: 'Unknown',
        suggestedInterests: [],
        confidence: 0,
      };
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error identifying brand category:', error);
    return {
      industry: 'Unknown',
      suggestedInterests: [],
      confidence: 0,
    };
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

