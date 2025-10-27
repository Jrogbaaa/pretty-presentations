import type { Brand, BrandProfile } from '@/types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || '');

// In-memory cache for brands
let brandsCache: Brand[] | null = null;

/**
 * Load brands from CSV file
 */
export async function loadBrands(): Promise<Brand[]> {
  // Return cached brands if available
  if (brandsCache) {
    return brandsCache;
  }

  try {
    // Load brands from CSV file (server-side)
    const csvPath = path.join(process.cwd(), 'data', 'brands.csv');
    const csvText = fs.readFileSync(csvPath, 'utf-8');
    
    // Parse CSV
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    
    const brands: Brand[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = parseCSVLine(line);
      if (values.length !== headers.length) continue;
      
      const brand: Brand = {
        name: values[0],
        industry: values[1],
        description: values[2],
        targetAge: values[3],
        targetGender: values[4],
        targetInterests: values[5].split(',').map(s => s.trim()),
        contentThemes: values[6].split(',').map(s => s.trim()),
      };
      
      brands.push(brand);
    }
    
    brandsCache = brands;
    return brands;
  } catch (error) {
    console.error('Error loading brands:', error);
    return [];
  }
}

/**
 * Parse a CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

/**
 * Search for a brand by exact name match
 */
export async function searchBrandByName(brandName: string): Promise<Brand | null> {
  const brands = await loadBrands();
  const normalizedSearch = brandName.toLowerCase().trim();
  
  return brands.find(brand => 
    brand.name.toLowerCase() === normalizedSearch
  ) || null;
}

/**
 * Find similar brands using AI
 */
export async function findSimilarBrands(
  brandName: string,
  briefContext?: string
): Promise<BrandProfile[]> {
  const brands = await loadBrands();
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `You are a brand intelligence expert. Analyze the following brand and find similar brands from our database.

Brand to Analyze: "${brandName}"
${briefContext ? `Context: ${briefContext}` : ''}

Available Brands Database (name, industry, description):
${brands.map(b => `- ${b.name} (${b.industry}): ${b.description}`).join('\n')}

Task: Find the TOP 5 most similar brands from the database that match the characteristics of "${brandName}".

Consider:
1. Industry/sector similarity
2. Target demographic overlap
3. Brand positioning and values
4. Product/service type
5. Market segment

Return ONLY a JSON array with this exact structure:
[
  {
    "brandName": "exact brand name from database",
    "matchScore": 95,
    "reason": "brief explanation why this brand is similar"
  }
]

Return ONLY valid JSON, no other text.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = response.match(/\[\s*{[\s\S]*}\s*\]/);
    if (!jsonMatch) {
      console.error('No JSON found in AI response:', response);
      return [];
    }
    
    const similarBrandsData = JSON.parse(jsonMatch[0]);
    
    // Enrich with full brand data
    const similarBrands: BrandProfile[] = [];
    
    for (const item of similarBrandsData) {
      const brand = brands.find(b => 
        b.name.toLowerCase() === item.brandName.toLowerCase()
      );
      
      if (brand) {
        similarBrands.push({
          ...brand,
          matchScore: item.matchScore,
          matchReason: item.reason,
        });
      }
    }
    
    return similarBrands;
  } catch (error) {
    console.error('Error finding similar brands:', error);
    return [];
  }
}

/**
 * Get brand profile with AI-enhanced classification
 */
export async function getBrandProfile(
  brandName: string,
  briefContext?: string
): Promise<BrandProfile | null> {
  // First try exact match
  const exactMatch = await searchBrandByName(brandName);
  
  if (exactMatch) {
    return {
      ...exactMatch,
      matchScore: 100,
      matchReason: 'Exact match in database',
    };
  }
  
  // If no exact match, find similar brands
  const similarBrands = await findSimilarBrands(brandName, briefContext);
  
  if (similarBrands.length === 0) {
    return null;
  }
  
  // Return the best match with context that it's similar
  const bestMatch = similarBrands[0];
  return {
    ...bestMatch,
    similarBrands: similarBrands.slice(1).map(b => b.name),
    matchReason: `Similar to ${brandName}. ${bestMatch.matchReason}`,
  };
}

/**
 * Get all brands in a specific industry
 */
export async function getBrandsByIndustry(industry: string): Promise<Brand[]> {
  const brands = await loadBrands();
  const normalizedIndustry = industry.toLowerCase();
  
  return brands.filter(brand =>
    brand.industry.toLowerCase().includes(normalizedIndustry)
  );
}

/**
 * Search brands by multiple criteria
 */
export async function searchBrands(criteria: {
  industry?: string;
  targetGender?: string;
  interests?: string[];
}): Promise<Brand[]> {
  const brands = await loadBrands();
  
  return brands.filter(brand => {
    // Industry filter
    if (criteria.industry && !brand.industry.toLowerCase().includes(criteria.industry.toLowerCase())) {
      return false;
    }
    
    // Gender filter
    if (criteria.targetGender && 
        brand.targetGender.toLowerCase() !== 'mixed' && 
        brand.targetGender.toLowerCase() !== criteria.targetGender.toLowerCase()) {
      return false;
    }
    
    // Interests filter
    if (criteria.interests && criteria.interests.length > 0) {
      const hasMatchingInterest = criteria.interests.some(interest =>
        brand.targetInterests.some(brandInterest =>
          brandInterest.toLowerCase().includes(interest.toLowerCase())
        )
      );
      
      if (!hasMatchingInterest) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Clear brands cache (useful for testing or data updates)
 */
export function clearBrandsCache(): void {
  brandsCache = null;
}

