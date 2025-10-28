/**
 * Import 4000+ Spanish Influencers from CSV to Firestore
 * Avoids duplicates by checking existing handles
 */

import admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

const db = admin.firestore();

interface CSVRow {
  Rank: string;
  'Name ': string;
  Followers: string;
  'Engagement Rate': string;
  Country: string;
  GENRE: string;
  Details: string;
  'Instagram Handle': string;
}

/**
 * Parse follower count (e.g., "71.3M" -> 71300000, "500K" -> 500000)
 */
function parseFollowers(followers: string): number {
  if (!followers) return 0;
  
  const clean = followers.trim().toUpperCase();
  
  if (clean.endsWith('M')) {
    return Math.round(parseFloat(clean) * 1000000);
  } else if (clean.endsWith('K')) {
    return Math.round(parseFloat(clean) * 1000);
  } else {
    return parseInt(clean.replace(/[^0-9]/g, '')) || 0;
  }
}

/**
 * Parse engagement rate (e.g., "4.67%" -> 4.67)
 */
function parseEngagement(rate: string): number {
  if (!rate) return 0;
  return parseFloat(rate.replace('%', '')) || 0;
}

/**
 * Parse Instagram handle (remove @ if present)
 */
function parseHandle(handle: string): string {
  if (!handle) return '';
  return handle.trim().replace('@', '');
}

/**
 * Parse genres/categories
 */
function parseCategories(genre: string): string[] {
  if (!genre) return ['General'];
  
  // Split by capital letters (e.g., "BooksLifestyleModeling" -> ["Books", "Lifestyle", "Modeling"])
  const categories = genre
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(/\s+/)
    .filter(cat => cat.length > 1);
  
  return categories.length > 0 ? categories : ['General'];
}

/**
 * Estimate rate card based on followers
 */
function estimateRateCard(followers: number) {
  const baseRate = Math.max(100, Math.round(followers * 0.015)); // ~1.5% of followers
  
  return {
    post: baseRate,
    story: Math.round(baseRate * 0.3),
    reel: Math.round(baseRate * 1.5),
    video: Math.round(baseRate * 2),
    integration: Math.round(baseRate * 4)
  };
}

/**
 * Transform CSV row to Influencer document
 */
function transformInfluencer(row: CSVRow, index: number) {
  const handle = parseHandle(row['Instagram Handle']);
  const followers = parseFollowers(row.Followers);
  const engagement = parseEngagement(row['Engagement Rate']);
  const categories = parseCategories(row.GENRE);
  
  return {
    id: `inf_${handle.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    name: row['Name '].trim(),
    handle: handle,
    platform: 'Instagram',
    followers: followers,
    engagement: engagement,
    avgViews: Math.round(followers * 0.1), // Estimate 10% of followers
    
    demographics: {
      ageRange: '25-34', // Default, could be enhanced
      gender: 'Mixed',
      location: ['Spain', row.Country || 'España'],
      interests: categories,
      psychographics: row.Details || 'Spanish influencer'
    },
    
    contentCategories: categories,
    previousBrands: [], // Could be extracted from Details if available
    
    rateCard: estimateRateCard(followers),
    
    performance: {
      averageEngagementRate: engagement,
      averageReach: Math.round(followers * 0.35),
      audienceGrowthRate: 2.0, // Default 2% monthly growth
      contentQualityScore: Math.min(10, 5 + (engagement / 2)) // Score based on engagement
    },
    
    // Metadata
    rank: parseInt(row.Rank) || index + 1,
    country: row.Country || 'Spain',
    details: row.Details || '',
    imported: new Date(),
    source: 'top_4000_csv'
  };
}

/**
 * Check which handles already exist in database
 */
async function getExistingHandles(): Promise<Set<string>> {
  console.log('📊 Checking existing influencers in database...');
  
  const snapshot = await db.collection('influencers').get();
  const handles = new Set<string>();
  
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    if (data.handle) {
      handles.add(data.handle.toLowerCase());
    }
  });
  
  console.log(`✅ Found ${handles.size} existing influencers\n`);
  return handles;
}

/**
 * Main import function
 */
async function importInfluencers() {
  console.log('\n' + '═'.repeat(70));
  console.log('📥 IMPORTING 4000+ SPANISH INFLUENCERS');
  console.log('═'.repeat(70) + '\n');

  try {
    // Read CSV file
    const csvPath = '/Users/JackEllis/Desktop/top 4000 influencers in spain  - Influencers.csv';
    console.log(`📂 Reading CSV file: ${csvPath}\n`);
    
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }) as CSVRow[];
    
    console.log(`✅ Parsed ${records.length} records from CSV\n`);
    
    // Get existing handles
    const existingHandles = await getExistingHandles();
    
    // Transform influencers
    console.log('🔄 Transforming influencer data...\n');
    const allInfluencers = records.map((row, index) => transformInfluencer(row, index));
    
    // Filter out duplicates
    const newInfluencers = allInfluencers.filter(inf => {
      const handle = inf.handle.toLowerCase();
      return handle && !existingHandles.has(handle);
    });
    
    console.log(`📊 Statistics:`);
    console.log(`   Total in CSV: ${allInfluencers.length}`);
    console.log(`   Already in DB: ${allInfluencers.length - newInfluencers.length}`);
    console.log(`   New to import: ${newInfluencers.length}\n`);
    
    if (newInfluencers.length === 0) {
      console.log('✅ All influencers already in database. Nothing to import!\n');
      return;
    }
    
    // Confirm import
    console.log(`⚠️  About to import ${newInfluencers.length} new influencers to Firestore`);
    console.log(`   This will add to the existing ${existingHandles.size} influencers\n`);
    
    // Import in batches
    console.log('📤 Importing to Firestore...\n');
    const BATCH_SIZE = 450;
    let imported = 0;
    let skipped = 0;
    
    for (let i = 0; i < newInfluencers.length; i += BATCH_SIZE) {
      const batch = db.batch();
      const chunk = newInfluencers.slice(i, i + BATCH_SIZE);
      
      chunk.forEach(influencer => {
        try {
          const docRef = db.collection('influencers').doc(influencer.id);
          batch.set(docRef, influencer);
          imported++;
        } catch (error) {
          console.warn(`⚠️  Skipped ${influencer.name}: ${error}`);
          skipped++;
        }
      });
      
      await batch.commit();
      
      const progress = ((imported / newInfluencers.length) * 100).toFixed(1);
      console.log(`  ✅ Imported ${imported}/${newInfluencers.length} (${progress}%)`);
    }
    
    console.log('\n✅ Import complete!\n');
    
    // Update metadata
    await db.collection('metadata').doc('influencers').set({
      totalCount: existingHandles.size + imported,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      dataSource: 'CSV: top 4000 influencers in spain + previous imports',
      version: '2.0',
      realData: true,
      imported: {
        new: imported,
        skipped: skipped,
        existing: existingHandles.size
      }
    });
    
    console.log('✅ Metadata updated\n');
    
    // Verify final count
    console.log('🔍 Verifying final count...');
    const verifySnapshot = await db.collection('influencers').count().get();
    const finalCount = verifySnapshot.data().count;
    
    console.log(`✅ Verified: ${finalCount} total influencers in database\n`);
    
    // Show statistics
    console.log('═'.repeat(70));
    console.log('📊 FINAL STATISTICS');
    console.log('═'.repeat(70));
    console.log(`Total in Database: ${finalCount}`);
    console.log(`Previously Existed: ${existingHandles.size}`);
    console.log(`Newly Imported: ${imported}`);
    console.log(`Skipped/Errors: ${skipped}`);
    console.log(`Platform: Instagram (100%)`);
    console.log(`Country: Spain`);
    console.log(`Data Source: Top 4000+ Spanish Influencers CSV`);
    console.log('═'.repeat(70) + '\n');
    
    // Show sample of new imports
    if (newInfluencers.length > 0) {
      console.log('📝 Sample of newly imported influencers:\n');
      newInfluencers.slice(0, 5).forEach((inf, idx) => {
        console.log(`${idx + 1}. ${inf.name} (@${inf.handle})`);
        console.log(`   Rank: #${inf.rank}`);
        console.log(`   Followers: ${inf.followers.toLocaleString()}`);
        console.log(`   Engagement: ${inf.engagement}%`);
        console.log(`   Categories: ${inf.contentCategories.join(', ')}`);
        console.log('');
      });
    }
    
    console.log('✅ Import process completed successfully!\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ ERROR during import:', error);
    process.exit(1);
  }
}

// Run import
importInfluencers();

