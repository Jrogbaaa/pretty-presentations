/**
 * Influencer Service
 * Handles fetching, caching, and managing influencer data from Firestore
 */

import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  limit,
  orderBy,
  QueryConstraint,
  enableIndexedDbPersistence,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Influencer, Platform } from '@/types';

// Enable offline persistence for better performance
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firestore persistence: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Firestore persistence: Browser not supported');
    }
  });
}

// In-memory cache for frequently accessed influencers
const influencerCache = new Map<string, { data: Influencer; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

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
 * Search influencers with filters
 */
export const searchInfluencers = async (
  filters: InfluencerSearchFilters,
  limitResults = 50
): Promise<Influencer[]> => {
  try {
    const influencersRef = collection(db, 'influencers');
    
    // SIMPLIFIED QUERY: Fetch more results and filter client-side
    // This avoids needing composite indexes
    const constraints: QueryConstraint[] = [];
    
    // Only use simple platform filter if provided
    if (filters.platforms && filters.platforms.length === 1) {
      // Single platform - can use where clause
      constraints.push(where('platform', '==', filters.platforms[0]));
    }
    
    // Fetch more results since we'll filter client-side
    constraints.push(limit(limitResults * 4)); // Fetch 4x more to ensure we have enough after filtering

    const q = query(influencersRef, ...constraints);
    const querySnapshot = await getDocs(q);

    let influencers = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Influencer[];

    // Apply ALL filters client-side
    influencers = applyClientSideFilters(influencers, filters);
    
    // Sort by engagement (client-side)
    influencers.sort((a, b) => b.engagement - a.engagement);
    
    // Limit to requested amount
    return influencers.slice(0, limitResults);
  } catch (error) {
    console.error('Error searching influencers:', error);
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

/**
 * Get influencer by ID with caching
 */
export const getInfluencerById = async (id: string): Promise<Influencer | null> => {
  try {
    // Check cache first
    const cached = influencerCache.get(id);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    // Fetch from Firestore
    const docRef = doc(db, 'influencers', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const influencer = { id: docSnap.id, ...docSnap.data() } as Influencer;
      
      // Update cache
      influencerCache.set(id, { data: influencer, timestamp: Date.now() });
      
      return influencer;
    }

    return null;
  } catch (error) {
    console.error('Error fetching influencer:', error);
    return null;
  }
};

/**
 * Get multiple influencers by IDs
 */
export const getInfluencersByIds = async (ids: string[]): Promise<Influencer[]> => {
  try {
    const promises = ids.map((id) => getInfluencerById(id));
    const results = await Promise.all(promises);
    return results.filter((inf): inf is Influencer => inf !== null);
  } catch (error) {
    console.error('Error fetching influencers by IDs:', error);
    return [];
  }
};

/**
 * Get top influencers by engagement
 */
export const getTopInfluencers = async (limitResults = 20): Promise<Influencer[]> => {
  try {
    const influencersRef = collection(db, 'influencers');
    const q = query(
      influencersRef,
      orderBy('engagement', 'desc'),
      limit(limitResults)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Influencer[];
  } catch (error) {
    console.error('Error fetching top influencers:', error);
    return [];
  }
};

/**
 * Get influencers by platform
 */
export const getInfluencersByPlatform = async (
  platform: Platform,
  limitResults = 50
): Promise<Influencer[]> => {
  try {
    const influencersRef = collection(db, 'influencers');
    const q = query(
      influencersRef,
      where('platform', '==', platform),
      orderBy('followers', 'desc'),
      limit(limitResults)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Influencer[];
  } catch (error) {
    console.error('Error fetching influencers by platform:', error);
    return [];
  }
};

/**
 * Get influencers by content category
 */
export const getInfluencersByCategory = async (
  category: string,
  limitResults = 50
): Promise<Influencer[]> => {
  try {
    const influencersRef = collection(db, 'influencers');
    const q = query(
      influencersRef,
      where('contentCategories', 'array-contains', category),
      orderBy('engagement', 'desc'),
      limit(limitResults)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Influencer[];
  } catch (error) {
    console.error('Error fetching influencers by category:', error);
    return [];
  }
};

/**
 * Get influencer count (for analytics)
 */
export const getInfluencerCount = async (): Promise<number> => {
  try {
    const influencersRef = collection(db, 'influencers');
    const querySnapshot = await getDocs(influencersRef);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting influencer count:', error);
    return 0;
  }
};

/**
 * Clear influencer cache
 */
export const clearInfluencerCache = (): void => {
  influencerCache.clear();
};

/**
 * Prefetch popular influencers for better UX
 */
export const prefetchPopularInfluencers = async (): Promise<void> => {
  try {
    const popular = await getTopInfluencers(50);
    popular.forEach((inf) => {
      influencerCache.set(inf.id, { data: inf, timestamp: Date.now() });
    });
  } catch (error) {
    console.error('Error prefetching influencers:', error);
  }
};
