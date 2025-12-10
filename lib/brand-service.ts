import type { Brand, BrandProfile } from '@/types';
import fs from 'fs';
import path from 'path';

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
 * Find similar brands using text-based matching
 * Matches based on industry, interests, and content themes
 */
export async function findSimilarBrands(
  brandName: string,
  briefContext?: string
): Promise<BrandProfile[]> {
  const brands = await loadBrands();
  
  // Extract keywords from brand name and context
  const searchTerms = [
    ...brandName.toLowerCase().split(/\s+/),
    ...(briefContext?.toLowerCase().split(/\s+/) || [])
  ].filter(term => term.length > 2);
  
  // Score each brand based on keyword matches
  const scoredBrands = brands.map(brand => {
    let score = 0;
    const matchReasons: string[] = [];
    
    // Check industry match
    for (const term of searchTerms) {
      if (brand.industry.toLowerCase().includes(term)) {
        score += 30;
        matchReasons.push(`Industry: ${brand.industry}`);
        break;
      }
    }
    
    // Check description match
    for (const term of searchTerms) {
      if (brand.description.toLowerCase().includes(term)) {
        score += 20;
        matchReasons.push('Description match');
        break;
      }
    }
    
    // Check interests match
    const matchingInterests = brand.targetInterests.filter(interest =>
      searchTerms.some(term => interest.toLowerCase().includes(term))
    );
    if (matchingInterests.length > 0) {
      score += matchingInterests.length * 10;
      matchReasons.push(`Interests: ${matchingInterests.join(', ')}`);
    }
    
    // Check content themes match
    const matchingThemes = brand.contentThemes.filter(theme =>
      searchTerms.some(term => theme.toLowerCase().includes(term))
    );
    if (matchingThemes.length > 0) {
      score += matchingThemes.length * 10;
      matchReasons.push(`Themes: ${matchingThemes.join(', ')}`);
    }
    
    return {
      brand,
      score,
      reason: matchReasons.join('; ') || 'General match'
    };
  });
  
  // Sort by score and take top 5
  const topBrands = scoredBrands
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  
  return topBrands.map(item => ({
    ...item.brand,
    matchScore: Math.min(item.score, 100),
    matchReason: item.reason,
  }));
}

/**
 * Get brand profile with classification
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
