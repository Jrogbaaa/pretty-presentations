/**
 * Import Influencer Database Script
 * Imports influencer data from LAYAI repository into Firestore
 * 
 * Usage: npx ts-node scripts/import-influencers.ts
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// ES module dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Initialize app
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

const db = admin.firestore();

interface RawInfluencerData {
  [key: string]: any;
}

/**
 * Transform raw influencer data to match our schema
 */
const transformInfluencerData = (raw: RawInfluencerData): any => {
  return {
    id: raw.id || generateId(raw.handle),
    name: raw.name || raw.fullName || '',
    handle: (raw.handle || raw.id || '').replace('@', ''),
    platform: raw.platform || 'Instagram',
    profileImage: raw.profileImage || raw.avatar || raw.photo || `https://unavatar.io/instagram/${raw.handle || raw.id}`,
    
    // Metrics (LAYAI uses followerCount and engagementRate)
    followers: parseInt(String(raw.followerCount || raw.followers || raw.followersCount || 0)),
    engagement: parseFloat(String((raw.engagementRate || raw.engagement || 0) * 100)), // Convert to percentage
    avgViews: parseInt(String(raw.avgViews || raw.averageViews || raw.views || Math.floor((raw.followerCount || 0) * 0.1))),
    
    // Demographics (LAYAI structure)
    demographics: {
      ageRange: raw.demographics?.ageRange || raw.ageRange || '18-34',
      gender: raw.demographics?.gender || raw.gender || 'Mixed',
      location: Array.isArray(raw.demographics?.location)
        ? raw.demographics.location
        : raw.location
        ? [raw.location]
        : raw.country
        ? [raw.country]
        : ['Spain'],
      interests: Array.isArray(raw.demographics?.interests)
        ? raw.demographics.interests
        : raw.niche
        ? raw.niche
        : raw.interests
        ? [raw.interests]
        : [],
      psychographics: raw.demographics?.psychographics || raw.originalGenres || '',
    },
    
    // Content (LAYAI uses 'niche' field)
    contentCategories: Array.isArray(raw.niche)
      ? raw.niche
      : Array.isArray(raw.contentCategories)
      ? raw.contentCategories
      : raw.categories
      ? raw.categories
      : ['Lifestyle'],
    previousBrands: Array.isArray(raw.previousBrands)
      ? raw.previousBrands
      : raw.brands
      ? raw.brands
      : [],
    
    // Pricing (estimate based on follower count if not provided)
    rateCard: {
      post: Math.floor(raw.rateCard?.post || raw.postRate || estimatePostRate(raw.followerCount || raw.followers || 0)),
      story: Math.floor(raw.rateCard?.story || raw.storyRate || estimatePostRate(raw.followerCount || raw.followers || 0) * 0.25),
      reel: Math.floor(raw.rateCard?.reel || raw.reelRate || estimatePostRate(raw.followerCount || raw.followers || 0) * 1.5),
      video: Math.floor(raw.rateCard?.video || raw.videoRate || estimatePostRate(raw.followerCount || raw.followers || 0) * 2),
      integration: Math.floor(raw.rateCard?.integration || raw.integrationRate || estimatePostRate(raw.followerCount || raw.followers || 0) * 3),
    },
    
    // Performance
    performance: {
      averageEngagementRate: parseFloat(
        raw.performance?.averageEngagementRate || raw.engagement || 0
      ),
      averageReach: parseInt(raw.performance?.averageReach || raw.reach || 0),
      audienceGrowthRate: parseFloat(raw.performance?.audienceGrowthRate || raw.growthRate || 0),
      contentQualityScore: parseFloat(raw.performance?.contentQualityScore || raw.qualityScore || 0),
    },
    
    // Additional fields
    verified: raw.verified || false,
    authenticityScore: raw.authenticityScore || null,
    contactEmail: raw.contactEmail || raw.email || null,
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    dataSource: 'LAYAI',
  };
};

/**
 * Generate consistent ID from handle
 * Firestore doesn't allow IDs starting/ending with "__" (reserved)
 */
const generateId = (handle: string): string => {
  const cleaned = handle
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')  // Replace special chars with underscore
    .replace(/^_+|_+$/g, '')      // Remove leading/trailing underscores
    .replace(/_{2,}/g, '_');      // Replace multiple underscores with single
  
  return `inf_${cleaned || 'unknown'}`;
};

/**
 * Estimate post rate based on follower count (EUR)
 * Industry standard: €0.01-0.02 per follower for nano/micro, less for macro
 */
const estimatePostRate = (followers: number): number => {
  if (followers < 10000) {
    // Nano: €0.01 per follower
    return Math.floor(followers * 0.01);
  } else if (followers < 100000) {
    // Micro: €0.008 per follower
    return Math.floor(followers * 0.008);
  } else if (followers < 500000) {
    // Mid-tier: €0.006 per follower
    return Math.floor(followers * 0.006);
  } else if (followers < 1000000) {
    // Macro: €0.004 per follower
    return Math.floor(followers * 0.004);
  } else {
    // Mega: €0.002 per follower
    return Math.floor(followers * 0.002);
  }
};

/**
 * Batch write to Firestore with throttling
 */
const batchWrite = async (
  data: any[],
  batchSize = 500,
  delayMs = 1500
): Promise<void> => {
  const totalBatches = Math.ceil(data.length / batchSize);
  
  for (let i = 0; i < totalBatches; i++) {
    const batch = db.batch();
    const start = i * batchSize;
    const end = Math.min(start + batchSize, data.length);
    const items = data.slice(start, end);
    
    console.log(`Processing batch ${i + 1}/${totalBatches} (${items.length} items)...`);
    
    items.forEach((item) => {
      const docRef = db.collection('influencers').doc(item.id);
      batch.set(docRef, item, { merge: true });
    });
    
    try {
      await batch.commit();
      console.log(`✅ Batch ${i + 1} committed successfully`);
      
      // Throttle to prevent resource exhaustion (LAYAI: 15 writes per 1.5s)
      if (i < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      console.error(`❌ Error committing batch ${i + 1}:`, error);
      throw error;
    }
  }
};

/**
 * Main import function
 */
const importInfluencers = async () => {
  try {
    console.log('🚀 Starting influencer import...\n');
    
    // Check for data file
    const dataPath = path.join(process.cwd(), 'data', 'influencers.json');
    
    if (!fs.existsSync(dataPath)) {
      console.error('❌ Data file not found:', dataPath);
      console.log('\n📝 Please ensure you have the influencer data file at:');
      console.log('   data/influencers.json\n');
      console.log('💡 You can obtain this file from the LAYAI repository:');
      console.log('   https://github.com/Jrogbaaa/LAYAI\n');
      process.exit(1);
    }
    
    // Read and parse data
    console.log('📖 Reading influencer data...');
    const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    
    const influencers = Array.isArray(rawData) ? rawData : [rawData];
    console.log(`✅ Found ${influencers.length} influencers\n`);
    
    // Transform data
    console.log('🔄 Transforming data...');
    const transformedData = influencers.map(transformInfluencerData);
    console.log(`✅ Transformed ${transformedData.length} records\n`);
    
    // Import to Firestore
    console.log('💾 Importing to Firestore...');
    await batchWrite(transformedData);
    
    console.log('\n✨ Import completed successfully!');
    console.log(`📊 Total influencers imported: ${transformedData.length}`);
    
    // Create metadata document
    await db.collection('metadata').doc('influencers').set({
      totalCount: transformedData.length,
      lastImported: admin.firestore.FieldValue.serverTimestamp(),
      dataSource: 'LAYAI',
      version: '1.0',
    });
    
    console.log('📝 Metadata updated');
    
  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  }
};

// Run import (ES module - always execute)
importInfluencers()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });

export { importInfluencers, transformInfluencerData };
