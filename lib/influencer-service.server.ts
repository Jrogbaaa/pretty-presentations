/**
 * Server-Side Influencer Service
 * Uses Firebase Admin SDK for API routes
 */

import { adminDb } from './firebase-admin';
import type { Influencer, Platform } from '@/types';

export interface InfluencerSearchFilters {
  platforms?: Platform[];
  minFollowers?: number;
  maxFollowers?: number;
  minEngagement?: number;
  maxEngagement?: number;
  locations?: string[];
  contentCategories?: string[];
  gender?: string;
  ageRange?: string;
  maxBudget?: number;
}

/**
 * Search influencers with filters (Server-side with Admin SDK)
 */
export const searchInfluencersServer = async (
  filters: InfluencerSearchFilters,
  limitResults = 50
): Promise<Influencer[]> => {
  try {
    const influencersRef = adminDb.collection('influencers');
    
    // Build query
    let query: FirebaseFirestore.Query = influencersRef;
    
    // Only use simple platform filter if provided
    if (filters.platforms && filters.platforms.length === 1) {
      query = query.where('platform', '==', filters.platforms[0]);
    }
    
    // Fetch more results since we'll filter client-side
    query = query.limit(limitResults * 4);

    const querySnapshot = await query.get();

    let influencers = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Influencer[];

    // Apply ALL filters client-side
    influencers = applyClientSideFilters(influencers, filters);
    
    // FALLBACK 1: If we got 0 results, try again without content category filter
    if (influencers.length === 0 && filters.contentCategories && filters.contentCategories.length > 0) {
      console.log('⚠️  [SERVER] 0 influencers with content category filter. Retrying without categories...');
      const relaxedFilters = { ...filters, contentCategories: undefined };
      influencers = applyClientSideFilters(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Influencer[],
        relaxedFilters
      );
      console.log(`✅ [SERVER] Retry found ${influencers.length} influencers without category filter`);
    }
    
    // FALLBACK 2: If still 0 results and platform filter exists, try expanding platforms
    if (influencers.length === 0 && filters.platforms && filters.platforms.length > 0) {
      console.log('⚠️  [SERVER] 0 influencers with platform filter. Retrying with Instagram added...');
      const expandedFilters = { 
        ...filters, 
        platforms: [...filters.platforms, 'Instagram'] as Platform[],
        contentCategories: undefined // Also remove content categories
      };
      influencers = applyClientSideFilters(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Influencer[],
        expandedFilters
      );
      console.log(`✅ [SERVER] Retry with Instagram found ${influencers.length} influencers`);
    }
    
    // Sort by engagement (client-side)
    influencers.sort((a, b) => b.engagement - a.engagement);
    
    // Limit to requested amount
    return influencers.slice(0, limitResults);
  } catch (error) {
    console.error('Error searching influencers (server-side):', error);
    throw error;
  }
};

/**
 * Apply filters that can't be done in Firestore queries
 */
const applyClientSideFilters = (
  influencers: Influencer[],
  filters: InfluencerSearchFilters
): Influencer[] => {
  return influencers.filter((influencer) => {
    // Platform filter (if multiple platforms or not filtered by query)
    if (filters.platforms && filters.platforms.length > 0) {
      if (!filters.platforms.includes(influencer.platform)) return false;
    }
    
    // Content categories filter
    if (filters.contentCategories && filters.contentCategories.length > 0) {
      const hasMatchingCategory = influencer.contentCategories.some((cat) =>
        filters.contentCategories!.some((filterCat) => 
          cat.toLowerCase().includes(filterCat.toLowerCase()) ||
          filterCat.toLowerCase().includes(cat.toLowerCase())
        )
      );
      if (!hasMatchingCategory) return false;
    }
    
    // Follower range
    if (filters.minFollowers && influencer.followers < filters.minFollowers) {
      return false;
    }
    if (filters.maxFollowers && influencer.followers > filters.maxFollowers) {
      return false;
    }
    
    // Engagement rate
    if (filters.minEngagement && influencer.engagement < filters.minEngagement) {
      return false;
    }
    if (filters.maxEngagement && influencer.engagement > filters.maxEngagement) {
      return false;
    }
    
    // Location filter
    if (filters.locations && filters.locations.length > 0) {
      const hasLocation = influencer.demographics.location.some((loc) =>
        filters.locations!.some((filterLoc) => loc.toLowerCase().includes(filterLoc.toLowerCase()))
      );
      if (!hasLocation) return false;
    }

    // Gender filter
    if (filters.gender) {
      const genderMatch = influencer.demographics.gender
        .toLowerCase()
        .includes(filters.gender.toLowerCase());
      if (!genderMatch) return false;
    }

    // Age range filter
    if (filters.ageRange) {
      if (influencer.demographics.ageRange !== filters.ageRange) return false;
    }

    // Budget filter (based on post rate)
    if (filters.maxBudget) {
      const estimatedCost = influencer.rateCard.post * 3; // Rough estimate
      if (estimatedCost > filters.maxBudget) return false;
    }

    return true;
  });
};

