/**
 * Import Real Spanish Influencers from CSV
 * Source: top 1000 influencers in spain - Sheet1.csv
 * Total: 3,000 influencers (ranked 1-3000)
 * Note: CSV has 8,564 lines but names span multiple lines
 */

import admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// ES module setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

// Initialize Firebase Admin
const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
  console.error('❌ Missing Firebase Admin credentials in .env.local');
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

const db = admin.firestore();

// Path to CSV file
const CSV_PATH = path.resolve(__dirname, '../../..', 'top 1000 influencers in spain  - Sheet1.csv');

/**
 * Parse follower count (e.g., "67M", "10.4M", "542K")
 */
function parseFollowers(followersStr: string): number {
  if (!followersStr) return 0;
  
  const cleaned = followersStr.trim().toUpperCase();
  
  if (cleaned.endsWith('M')) {
    return parseFloat(cleaned) * 1000000;
  } else if (cleaned.endsWith('K')) {
    return parseFloat(cleaned) * 1000;
  }
  
  return parseFloat(cleaned) || 0;
}

/**
 * Parse engagement rate (e.g., "1.65%")
 */
function parseEngagement(engagementStr: string): number {
  if (!engagementStr) return 0;
  
  const cleaned = engagementStr.replace('%', '').trim();
  return parseFloat(cleaned) || 0;
}

/**
 * Extract handle from name field
 * Format: "Name\n@handle" or just "Name"
 */
function extractNameAndHandle(nameField: string): { name: string; handle: string } {
  if (!nameField) return { name: 'Unknown', handle: 'unknown' };
  
  const parts = nameField.split('\n').map(p => p.trim());
  
  if (parts.length >= 2) {
    const name = parts[0];
    const handle = parts[1].replace('@', '');
    return { name, handle };
  }
  
  // Fallback: use name as-is
  return { name: nameField, handle: nameField.toLowerCase().replace(/\s+/g, '_') };
}

/**
 * Parse content categories from GENRE field
 * Format: "BooksLifestyleModeling" → ["Books", "Lifestyle", "Modeling"]
 */
function parseCategories(genreStr: string): string[] {
  if (!genreStr) return ['Lifestyle'];
  
  // Split camelCase: "BooksLifestyle" → ["Books", "Lifestyle"]
  const categories = genreStr
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Insert space before capital letters
    .split(/(?=[A-Z])/) // Split on capital letters
    .filter(c => c.length > 0)
    .map(c => c.trim());
  
  // Common category mappings
  const categoryMap: Record<string, string> = {
    'Soccer': 'Sports',
    'Entertainment and Music': 'Entertainment',
    'Books': 'Literature',
    'Journalist': 'Journalism',
    'Modeling': 'Fashion',
    'Celebrity': 'Entertainment',
    'Personal Finance': 'Finance',
    'Food and Drink': 'Food',
  };
  
  return categories.map(cat => categoryMap[cat] || cat);
}

/**
 * Estimate rate card based on follower count
 */
function estimateRateCard(followers: number): {
  post: number;
  story: number;
  reel: number;
  video: number;
  integration: number;
} {
  // Industry standard: €0.01-0.02 per follower for sponsored posts
  const baseRate = followers * 0.015;
  
  return {
    post: Math.round(baseRate),
    story: Math.round(baseRate * 0.4),
    reel: Math.round(baseRate * 1.3),
    video: Math.round(baseRate * 1.5),
    integration: Math.round(baseRate * 2.5),
  };
}

/**
 * Generate influencer demographics
 */
function generateDemographics(categories: string[], followers: number): {
  ageRange: string;
  gender: string;
  location: string[];
  interests: string[];
  psychographics: string;
} {
  // Age range based on categories
  let ageRange = '25-34'; // Default
  if (categories.some(c => c.includes('Sport') || c.includes('Soccer'))) {
    ageRange = '18-34';
  } else if (categories.some(c => c.includes('Fashion') || c.includes('Beauty'))) {
    ageRange = '18-24';
  } else if (categories.some(c => c.includes('Finance') || c.includes('Business'))) {
    ageRange = '25-44';
  }
  
  // Gender based on categories (simplified)
  let gender = 'Mixed';
  if (categories.some(c => c.includes('Fashion') || c.includes('Beauty'))) {
    gender = 'Female-leaning (60/40)';
  } else if (categories.some(c => c.includes('Sport') || c.includes('Soccer'))) {
    gender = 'Male-leaning (70/30)';
  }
  
  return {
    ageRange,
    gender,
    location: ['Spain', 'España'],
    interests: categories,
    psychographics: `Engaged Spanish audience interested in ${categories.slice(0, 3).join(', ')}`,
  };
}

/**
 * Transform CSV row to Influencer object
 */
function transformToInfluencer(row: string[], index: number): any {
  const [rank, nameField, followersStr, engagementStr, country, genreStr] = row;
  
  const { name, handle } = extractNameAndHandle(nameField);
  const followers = parseFollowers(followersStr);
  const engagement = parseEngagement(engagementStr);
  const categories = parseCategories(genreStr);
  const rateCard = estimateRateCard(followers);
  const demographics = generateDemographics(categories, followers);
  
  return {
    id: `influencer_${index + 1}_${handle.replace(/[^a-z0-9]/gi, '_')}`,
    name,
    handle,
    platform: 'Instagram', // All from this source are Instagram
    profileImage: `https://via.placeholder.com/150?text=${encodeURIComponent(name.charAt(0))}`,
    followers,
    engagement,
    avgViews: Math.round(followers * 0.35), // Estimate 35% reach
    demographics,
    contentCategories: categories,
    previousBrands: [], // Not in CSV, will be empty
    rateCard,
    performance: {
      averageEngagementRate: engagement,
      averageReach: Math.round(followers * 0.35),
      audienceGrowthRate: followers > 1000000 ? 1.5 : 3.0, // Smaller = faster growth
      contentQualityScore: Math.min(9.5, 6 + (engagement * 0.3)), // Higher engagement = higher quality
    },
  };
}

/**
 * Parse CSV file
 */
function parseCSV(filePath: string): string[][] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim().length > 0);
  
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let inQuotes = false;
  let currentField = '';
  
  for (const line of lines) {
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        currentRow.push(currentField.trim());
        currentField = '';
      } else {
        currentField += char;
      }
    }
    
    if (!inQuotes) {
      currentRow.push(currentField.trim());
      if (currentRow.length > 0) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += '\n';
    }
  }
  
  return rows;
}

/**
 * Import influencers to Firestore in batches
 */
async function importInfluencers() {
  console.log('\n' + '═'.repeat(70));
  console.log('📊 IMPORTING REAL SPANISH INFLUENCERS');
  console.log('═'.repeat(70) + '\n');
  
  // Check if CSV exists
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`❌ CSV file not found: ${CSV_PATH}`);
    console.log('\nExpected location: /Users/JackEllis/Desktop/top 1000 influencers in spain  - Sheet1.csv');
    process.exit(1);
  }
  
  console.log(`📁 Reading CSV: ${CSV_PATH}\n`);
  
  // Parse CSV
  const rows = parseCSV(CSV_PATH);
  const dataRows = rows.slice(1); // Skip header
  
  console.log(`✅ Parsed ${dataRows.length} rows\n`);
  
  // Transform to influencers
  console.log('🔄 Transforming data...');
  const influencers = dataRows.map((row, index) => transformToInfluencer(row, index));
  
  console.log(`✅ Transformed ${influencers.length} influencers\n`);
  
  // Show sample
  console.log('📋 Sample influencers:\n');
  influencers.slice(0, 3).forEach((inf, idx) => {
    console.log(`${idx + 1}. ${inf.name} (@${inf.handle})`);
    console.log(`   Followers: ${inf.followers.toLocaleString()}`);
    console.log(`   Engagement: ${inf.engagement}%`);
    console.log(`   Categories: ${inf.contentCategories.join(', ')}`);
    console.log(`   Rate (Post): €${inf.rateCard.post.toLocaleString()}`);
    console.log('');
  });
  
  // Clear existing collection
  console.log('🗑️  Clearing existing influencers collection...');
  const existingSnapshot = await db.collection('influencers').limit(500).get();
  
  if (!existingSnapshot.empty) {
    const batch = db.batch();
    existingSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.log(`✅ Deleted ${existingSnapshot.size} old records\n`);
  } else {
    console.log('✅ Collection is empty\n');
  }
  
  // Import in batches (Firestore limit: 500 operations per batch)
  console.log('📤 Importing to Firestore...\n');
  const BATCH_SIZE = 450; // Safe limit
  let imported = 0;
  
  for (let i = 0; i < influencers.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = influencers.slice(i, i + BATCH_SIZE);
    
    chunk.forEach(influencer => {
      const docRef = db.collection('influencers').doc(influencer.id);
      batch.set(docRef, influencer);
    });
    
    await batch.commit();
    imported += chunk.length;
    
    const progress = ((imported / influencers.length) * 100).toFixed(1);
    console.log(`  ✅ Imported ${imported}/${influencers.length} (${progress}%)`);
  }
  
  console.log('\n✅ Import complete!\n');
  
  // Update metadata
  await db.collection('metadata').doc('influencers').set({
    totalCount: influencers.length,
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    dataSource: 'CSV: top 1000 influencers in spain - Sheet1.csv',
    version: '1.3.1',
    realData: true,
  });
  
  console.log('✅ Metadata updated\n');
  
  // Verify import
  console.log('🔍 Verifying import...');
  const verifySnapshot = await db.collection('influencers').count().get();
  const actualCount = verifySnapshot.data().count;
  
  console.log(`✅ Verified: ${actualCount} influencers in database\n`);
  
  if (actualCount !== influencers.length) {
    console.log(`⚠️  WARNING: Count mismatch! Expected ${influencers.length}, got ${actualCount}`);
  }
  
  // Show statistics
  console.log('═'.repeat(70));
  console.log('📊 IMPORT STATISTICS');
  console.log('═'.repeat(70));
  console.log(`Total Imported: ${actualCount}`);
  console.log(`Platform: Instagram (100%)`);
  console.log(`Country: Spain`);
  console.log(`Data Source: Real influencer database CSV`);
  console.log(`Follower Range: ${Math.min(...influencers.map(i => i.followers)).toLocaleString()} - ${Math.max(...influencers.map(i => i.followers)).toLocaleString()}`);
  console.log(`Avg Engagement: ${(influencers.reduce((sum, i) => sum + i.engagement, 0) / influencers.length).toFixed(2)}%`);
  console.log('═'.repeat(70) + '\n');
  
  console.log('🎉 Real Spanish influencers are now in your database!');
  console.log('🚀 Ready to use in presentations\n');
}

// Run import
importInfluencers()
  .then(() => {
    console.log('✅ Import completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  });

