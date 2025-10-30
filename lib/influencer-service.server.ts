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
    console.log('🔍 [SERVER] Starting influencer search with filters:', JSON.stringify(filters, null, 2));
    
    const influencersRef = adminDb.collection('influencers');
    
    // Build query
    let query: FirebaseFirestore.Query = influencersRef;
    
    // Only use simple platform filter if provided and exactly 1 platform
    if (filters.platforms && filters.platforms.length === 1) {
      query = query.where('platform', '==', filters.platforms[0]);
      console.log(`📱 [SERVER] Applied platform filter: ${filters.platforms[0]}`);
    } else if (filters.platforms && filters.platforms.length > 1) {
      console.log(`📱 [SERVER] Multiple platforms requested (${filters.platforms.length}), will filter client-side`);
    } else {
      console.log('📱 [SERVER] No platform filter applied');
    }
    
    // Fetch more results since we'll filter client-side
    // If multiple platforms or no platform filter, fetch even more to ensure we have enough after filtering
    const fetchLimit = (!filters.platforms || filters.platforms.length > 1)
      ? limitResults * 10  // Fetch 10x more if multiple platforms or no filter
      : limitResults * 6;   // Fetch 6x more if single platform
    
    query = query.limit(fetchLimit);

    const querySnapshot = await query.get();
    console.log(`📊 [SERVER] Fetched ${querySnapshot.docs.length} documents from Firestore (limit: ${fetchLimit})`);

    // If initial query returned 0 docs and we had a platform filter, retry without platform filter
    let finalSnapshot = querySnapshot;
    if (querySnapshot.docs.length === 0 && filters.platforms && filters.platforms.length === 1) {
      console.warn('⚠️  [SERVER] Initial query with platform filter returned 0 documents. Retrying without platform filter...');
      const fallbackQuery = influencersRef.limit(fetchLimit);
      const fallbackSnapshot = await fallbackQuery.get();
      console.log(`📊 [SERVER] Fallback query fetched ${fallbackSnapshot.docs.length} documents`);
      
      if (fallbackSnapshot.docs.length > 0) {
        finalSnapshot = fallbackSnapshot;
      } else {
        console.warn('⚠️  [SERVER] WARNING: Even without platform filter, query returned 0 documents!');
        console.warn('   This could indicate:');
        console.warn('   1. Database connection issue');
        console.warn('   2. Collection "influencers" is empty');
      }
    } else if (querySnapshot.docs.length === 0) {
      console.warn('⚠️  [SERVER] WARNING: Query returned 0 documents from Firestore!');
      console.warn('   This could indicate:');
      console.warn('   1. Database connection issue');
      console.warn('   2. Collection "influencers" is empty');
    }

    let influencers = finalSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      } as Influencer;
    });
    
    console.log(`📋 [SERVER] Mapped ${influencers.length} influencers from documents`);

    // Apply ALL filters client-side
    console.log(`🔍 [SERVER] Applying client-side filters to ${influencers.length} influencers...`);
    influencers = applyClientSideFilters(influencers, filters);
    console.log(`✅ [SERVER] After client-side filtering: ${influencers.length} influencers match`);
    
    // FALLBACK 1: If we got 0 results, try again without content category filter
    if (influencers.length === 0 && filters.contentCategories && filters.contentCategories.length > 0) {
      console.log('⚠️  [SERVER] 0 influencers with content category filter. Retrying without categories...');
      const relaxedFilters = { ...filters, contentCategories: undefined };
      influencers = applyClientSideFilters(
        finalSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Influencer[],
        relaxedFilters
      );
      console.log(`✅ [SERVER] Retry found ${influencers.length} influencers without category filter`);
    }
    
    // FALLBACK 2: If still 0 results and location filter exists, try without location filter
    if (influencers.length === 0 && filters.locations && filters.locations.length > 0) {
      console.log('⚠️  [SERVER] 0 influencers with location filter. Retrying without location filter...');
      const relaxedFilters = { ...filters, locations: undefined };
      influencers = applyClientSideFilters(
        finalSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Influencer[],
        relaxedFilters
      );
      console.log(`✅ [SERVER] Retry without location filter found ${influencers.length} influencers`);
    }
    
    // FALLBACK 3: If still 0 results and platform filter exists, try expanding platforms
    if (influencers.length === 0 && filters.platforms && filters.platforms.length > 0) {
      console.log('⚠️  [SERVER] 0 influencers with platform filter. Retrying with Instagram added...');
      const expandedFilters = { 
        ...filters, 
        platforms: [...filters.platforms, 'Instagram'] as Platform[],
        contentCategories: undefined, // Also remove content categories
        locations: undefined // Also remove location filter
      };
      influencers = applyClientSideFilters(
        finalSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Influencer[],
        expandedFilters
      );
      console.log(`✅ [SERVER] Retry with Instagram found ${influencers.length} influencers`);
    }
    
    // FALLBACK 4: If still 0 results, try with minimal filters (only platform and budget)
    if (influencers.length === 0) {
      console.log('⚠️  [SERVER] 0 influencers after all fallbacks. Trying with minimal filters (platform + budget only)...');
      const minimalFilters = {
        platforms: filters.platforms,
        maxBudget: filters.maxBudget
      };
      influencers = applyClientSideFilters(
        finalSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Influencer[],
        minimalFilters
      );
      console.log(`✅ [SERVER] Minimal filters found ${influencers.length} influencers`);
    }
    
    // FALLBACK 5: Last resort - return top influencers by engagement regardless of filters
    if (influencers.length === 0) {
      console.log('⚠️  [SERVER] CRITICAL: 0 influencers after all filters. Returning top influencers by engagement...');
      influencers = finalSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Influencer[];
      influencers.sort((a, b) => b.engagement - a.engagement);
      influencers = influencers.slice(0, limitResults);
      console.log(`✅ [SERVER] Fallback returned ${influencers.length} top influencers by engagement`);
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
    
    // Location filter - bidirectional matching (checks if location contains filter or vice versa)
    if (filters.locations && filters.locations.length > 0) {
      const hasLocation = influencer.demographics.location.some((loc) =>
        filters.locations!.some((filterLoc) => 
          loc.toLowerCase().includes(filterLoc.toLowerCase()) ||
          filterLoc.toLowerCase().includes(loc.toLowerCase())
        )
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

