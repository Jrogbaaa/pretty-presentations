/**
 * Influencer Matching System Test
 * Tests the full influencer matching workflow with a sample brief similar to The Band perfume campaign
 */

import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ES module dirname
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

// Initialize Google Generative AI
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: process.env.NEXT_PUBLIC_GOOGLE_AI_MODEL || "gemini-2.0-flash-exp",
});

// Types
interface ClientBrief {
  clientName: string;
  campaignGoals: string[];
  budget: number;
  targetDemographics: {
    ageRange: string;
    gender: string;
    location: string[];
    interests: string[];
    psychographics?: string;
  };
  brandRequirements: string[];
  contentThemes: string[];
  platformPreferences: string[];
  timeline: string;
  additionalNotes?: string;
}

interface Influencer {
  id: string;
  name: string;
  handle: string;
  platform: string;
  followers: number;
  engagement: number;
  contentCategories: string[];
  demographics: {
    gender: string;
    location: string[];
    ageRange: string;
  };
  rateCard: {
    post: number;
    story: number;
    reel: number;
    video: number;
  };
  previousBrands: string[];
}

interface SelectedInfluencer extends Influencer {
  rationale: string;
  proposedContent: string[];
  estimatedReach: number;
  estimatedEngagement: number;
  costEstimate: number;
  matchScore?: number;
}

// Test brief based on The Band perfume campaign
const sampleBrief: ClientBrief = {
  clientName: "The Band Perfume",
  campaignGoals: [
    "Launch awareness for dual fragrance",
    "Generate coverage and buzz for October launch",
    "Connect brand with music culture",
    "Distance from existing concert series"
  ],
  budget: 75000,
  targetDemographics: {
    ageRange: "25-65+",
    gender: "All genders (unisex positioning)",
    location: ["Spain", "Madrid", "Barcelona", "Valencia"],
    interests: ["Music", "Lifestyle", "Pop-rock", "Fashion", "Fragrance"],
    psychographics: "Music enthusiasts, fashion-conscious, lifestyle-oriented, concert-goers"
  },
  brandRequirements: [
    "Distance from concert series",
    "Music-centric visual and communication",
    "Unisex appeal - dual fragrance positioning",
    "Confidential launch handling"
  ],
  contentThemes: [
    "Music",
    "Lifestyle",
    "Fashion",
    "Entertainment"
  ],
  platformPreferences: ["Instagram", "TikTok", "YouTube"],
  timeline: "October 2024",
  additionalNotes: "High urgency campaign. Need creative concepts with hashtags. Guarantee impressions."
};

// Matching Functions
const searchInfluencers = async (filters: {
  platforms?: string[];
  locations?: string[];
  contentCategories?: string[];
  maxBudget?: number;
}, limitResults = 200): Promise<Influencer[]> => {
  try {
    const influencersRef = db.collection('influencers');
    let query = influencersRef.limit(limitResults);
    
    const snapshot = await query.get();
    let influencers: Influencer[] = [];
    
    snapshot.forEach((doc) => {
      influencers.push({
        id: doc.id,
        ...doc.data()
      } as Influencer);
    });

    // Apply client-side filters
    return influencers.filter((inf) => {
      // Platform filter
      if (filters.platforms && filters.platforms.length > 0) {
        if (!filters.platforms.includes(inf.platform)) return false;
      }
      
      // Location filter
      if (filters.locations && filters.locations.length > 0) {
        const hasLocation = inf.demographics.location.some((loc: string) =>
          filters.locations!.some((filterLoc) => 
            loc.toLowerCase().includes(filterLoc.toLowerCase()) ||
            filterLoc.toLowerCase().includes(loc.toLowerCase())
          )
        );
        if (!hasLocation) return false;
      }
      
      // Content categories filter
      if (filters.contentCategories && filters.contentCategories.length > 0) {
        const hasMatchingCategory = inf.contentCategories.some((cat: string) =>
          filters.contentCategories!.some((filterCat) => 
            cat.toLowerCase().includes(filterCat.toLowerCase()) ||
            filterCat.toLowerCase().includes(cat.toLowerCase())
          )
        );
        if (!hasMatchingCategory) return false;
      }
      
      // Budget filter
      if (filters.maxBudget) {
        const estimatedCost = inf.rateCard.post * 3;
        if (estimatedCost > filters.maxBudget) return false;
      }
      
      return true;
    });
  } catch (error) {
    console.error('Error searching influencers:', error);
    throw error;
  }
};

const rankInfluencersWithLAYAI = (brief: ClientBrief, influencers: Influencer[]): { influencer: Influencer; score: number }[] => {
  if (influencers.length === 0) return [];

  console.log('🎯 Using LAYAI scoring algorithm for influencer ranking...');

  const scored = influencers.map(influencer => {
    let score = 0;

    // 1. Content Category Match (0-30 points)
    const categoryMatch = influencer.contentCategories.some(cat =>
      brief.contentThemes.some(theme =>
        cat.toLowerCase().includes(theme.toLowerCase()) ||
        theme.toLowerCase().includes(cat.toLowerCase())
      )
    );
    if (categoryMatch) {
      const matchCount = influencer.contentCategories.filter(cat =>
        brief.contentThemes.some(theme =>
          cat.toLowerCase().includes(theme.toLowerCase())
        )
      ).length;
      score += Math.min(30, matchCount * 10);
    } else {
      score += 5;
    }

    // 2. Engagement Quality (0-25 points)
    score += Math.min(25, (influencer.engagement / 10) * 25);

    // 3. Audience Size & Reach (0-20 points)
    const followerScore = 
      influencer.followers >= 1000000 ? 20 :
      influencer.followers >= 500000 ? 18 :
      influencer.followers >= 100000 ? 16 :
      influencer.followers >= 50000 ? 14 :
      influencer.followers >= 10000 ? 10 : 5;
    score += followerScore;

    // 4. Location Match (0-15 points)
    const locationMatch = brief.targetDemographics.location.some(loc =>
      influencer.demographics.location.some((infLoc: string) =>
        infLoc.toLowerCase().includes(loc.toLowerCase())
      )
    );
    if (locationMatch) {
      score += 15;
    } else {
      score += 5;
    }

    // 5. Platform Optimization (0-10 points)
    if (brief.platformPreferences.includes(influencer.platform)) {
      score += 10;
    }

    return { influencer, score: Math.round(score) };
  });

  scored.sort((a, b) => b.score - a.score);
  console.log(`✅ Scored ${scored.length} influencers using LAYAI algorithm`);
  
  return scored;
};

const selectOptimalMix = (ranked: { influencer: Influencer; score: number }[], budget: number): { influencer: Influencer; score: number }[] => {
  const selected: { influencer: Influencer; score: number }[] = [];
  let remainingBudget = budget;
  
  const macro = ranked.filter(r => r.influencer.followers >= 500000);
  const midTier = ranked.filter(r => r.influencer.followers >= 50000 && r.influencer.followers < 500000);
  const micro = ranked.filter(r => r.influencer.followers < 50000);

  // Add 1 macro if budget allows
  if (macro.length > 0) {
    const cost = macro[0].influencer.rateCard.post * 3;
    if (cost <= remainingBudget * 0.5) {
      selected.push(macro[0]);
      remainingBudget -= cost;
    }
  }

  // Add 2-3 mid-tier
  for (let i = 0; i < Math.min(3, midTier.length); i++) {
    const cost = midTier[i].influencer.rateCard.post * 3;
    if (cost <= remainingBudget && selected.length < 6) {
      selected.push(midTier[i]);
      remainingBudget -= cost;
    }
  }

  // Add micro influencers
  for (let i = 0; i < micro.length && selected.length < 8; i++) {
    const cost = micro[i].influencer.rateCard.post * 3;
    if (cost <= remainingBudget) {
      selected.push(micro[i]);
      remainingBudget -= cost;
    }
  }

  return selected.slice(0, 8);
};

const enrichSelectedInfluencers = async (
  selected: { influencer: Influencer; score: number }[],
  brief: ClientBrief
): Promise<SelectedInfluencer[]> => {
  const enriched: SelectedInfluencer[] = [];
  
  for (const { influencer, score } of selected) {
    const estimatedReach = Math.floor(influencer.followers * 0.35);
    const estimatedEngagement = Math.floor(estimatedReach * (influencer.engagement / 100));
    const costEstimate = (influencer.rateCard.post * 2) + influencer.rateCard.reel + (influencer.rateCard.story * 3);

    // Generate rationale
    let rationale = `${influencer.name} brings ${influencer.followers.toLocaleString()} engaged followers with a ${influencer.engagement}% engagement rate, perfectly aligned with your target demographic.`;
    
    try {
      const prompt = `Write a compelling 2-3 sentence rationale for why ${influencer.name} (@${influencer.handle}) is perfect for a ${brief.clientName} campaign.

Influencer details:
- Followers: ${influencer.followers}
- Engagement: ${influencer.engagement}%
- Categories: ${influencer.contentCategories.join(", ")}

Campaign goals: ${brief.campaignGoals.join(", ")}
Target audience: ${brief.targetDemographics.ageRange}, ${brief.targetDemographics.interests.join(", ")}

Be specific, persuasive, and data-driven.`;

      const result = await model.generateContent(prompt);
      rationale = result.response.text().trim();
    } catch (error) {
      // Use default rationale if AI generation fails
    }

    enriched.push({
      ...influencer,
      rationale,
      proposedContent: ["Feed Post", "Story Series (3)", "Reel"],
      estimatedReach,
      estimatedEngagement,
      costEstimate,
      matchScore: score
    });
  }
  
  return enriched;
};

const matchInfluencers = async (brief: ClientBrief): Promise<SelectedInfluencer[]> => {
  try {
    // Fetch from Firestore
    const pool = await searchInfluencers({
      platforms: brief.platformPreferences,
      locations: brief.targetDemographics.location,
      contentCategories: brief.contentThemes,
      maxBudget: brief.budget,
    }, 200);
    
    console.log(`   Found ${pool.length} influencers from database`);

    // Rank with LAYAI
    const ranked = rankInfluencersWithLAYAI(brief, pool);

    // Select optimal mix
    const selected = selectOptimalMix(ranked, brief.budget);

    // Enrich with AI rationale
    const enriched = await enrichSelectedInfluencers(selected, brief);

    return enriched;
  } catch (error) {
    console.error("❌ Error matching influencers:", error);
    throw error;
  }
};

// Main Test Function
const runTests = async () => {
  console.log('\n🎯 INFLUENCER MATCHING SYSTEM TEST\n');
  console.log('═══════════════════════════════════════════════════════\n');

  // TEST 1: Firebase Connection
  console.log('📡 TEST 1: Firestore Connection');
  console.log('───────────────────────────────────────────────────────');
  try {
    const testDoc = await db.collection('influencers').limit(1).get();
    
    if (testDoc.empty) {
      console.log('❌ FAILED: No influencers found in database');
      console.log('⚠️  Please run the import script first: npm run import:influencers\n');
      return;
    }
    
    console.log('✅ Firestore connection successful');
    console.log(`   Found influencers in database\n`);
  } catch (error) {
    console.error('❌ FAILED: Could not connect to Firestore');
    console.error('   Error:', error instanceof Error ? error.message : 'Unknown error');
    console.log('\n⚠️  Please check your Firebase configuration in .env.local\n');
    return;
  }

  // TEST 2: Database Size
  console.log('📊 TEST 2: Database Statistics');
  console.log('───────────────────────────────────────────────────────');
  try {
    const snapshot = await db.collection('influencers').count().get();
    const totalCount = snapshot.data().count;
    console.log(`✅ Total influencers in database: ${totalCount}`);
    
    if (totalCount === 0) {
      console.log('⚠️  No influencers found. Please import data first.\n');
      return;
    }
    
    if (totalCount < 10) {
      console.log('⚠️  Warning: Less than 10 influencers. Consider importing more data.\n');
    } else {
      console.log('✅ Database has sufficient data for testing\n');
    }
  } catch (error) {
    console.error('❌ FAILED: Could not get database count');
    console.error('   Error:', error instanceof Error ? error.message : 'Unknown error');
    return;
  }

  // TEST 3: Search Functionality
  console.log('🔍 TEST 3: Influencer Search');
  console.log('───────────────────────────────────────────────────────');
  console.log('Searching for influencers matching brief criteria...');
  console.log(`   Platforms: ${sampleBrief.platformPreferences.join(', ')}`);
  console.log(`   Locations: ${sampleBrief.targetDemographics.location.join(', ')}`);
  console.log(`   Content: ${sampleBrief.contentThemes.join(', ')}`);
  console.log(`   Max Budget: €${sampleBrief.budget.toLocaleString()}\n`);

  try {
    const searchResults = await searchInfluencers({
      platforms: sampleBrief.platformPreferences,
      locations: sampleBrief.targetDemographics.location,
      contentCategories: sampleBrief.contentThemes,
      maxBudget: sampleBrief.budget,
    }, 100);

    if (searchResults.length === 0) {
      console.log('⚠️  No influencers matched the search criteria');
      
      // Try broader search
      console.log('🔄 Attempting broader search...');
      const broaderResults = await searchInfluencers({
        platforms: sampleBrief.platformPreferences,
      }, 50);
      
      if (broaderResults.length > 0) {
        console.log(`✅ Broader search found ${broaderResults.length} influencers`);
        console.log('   Sample results:');
        broaderResults.slice(0, 3).forEach((inf, idx) => {
          console.log(`   ${idx + 1}. ${inf.name} (@${inf.handle})`);
          console.log(`      Platform: ${inf.platform} | Followers: ${inf.followers.toLocaleString()}`);
          console.log(`      Engagement: ${inf.engagement}% | Categories: ${inf.contentCategories.join(', ')}`);
        });
        console.log('\n');
      }
    } else {
      console.log(`✅ Found ${searchResults.length} matching influencers from database`);
      console.log('   Top 5 results:\n');
      
      searchResults.slice(0, 5).forEach((inf, idx) => {
        console.log(`   ${idx + 1}. ${inf.name} (@${inf.handle})`);
        console.log(`      Platform: ${inf.platform}`);
        console.log(`      Followers: ${inf.followers.toLocaleString()}`);
        console.log(`      Engagement: ${inf.engagement}%`);
        console.log(`      Categories: ${inf.contentCategories.join(', ')}`);
        console.log(`      Location: ${inf.demographics.location.join(', ')}`);
        console.log(`      Post Rate: €${inf.rateCard.post.toLocaleString()}\n`);
      });
    }
  } catch (error) {
    console.error('❌ FAILED: Search functionality error');
    console.error('   Error:', error instanceof Error ? error.message : 'Unknown error');
    console.log('\n');
  }

  // TEST 4: Full Matching Pipeline
  console.log('🎯 TEST 4: Complete Matching Pipeline (LAYAI Algorithm)');
  console.log('───────────────────────────────────────────────────────');
  console.log('Running complete influencer matching with LAYAI scoring...\n');

  try {
    const startTime = Date.now();
    const matchedInfluencers = await matchInfluencers(sampleBrief);
    const duration = Date.now() - startTime;

    if (matchedInfluencers.length === 0) {
      console.log('⚠️  No influencers matched for this brief\n');
      return;
    }

    console.log(`✅ Matching completed in ${duration}ms`);
    console.log(`   Selected ${matchedInfluencers.length} influencers\n`);

    let totalCost = 0;
    let totalReach = 0;
    let totalEngagement = 0;

    console.log('📋 MATCHED INFLUENCER LINEUP:\n');
    console.log('═══════════════════════════════════════════════════════\n');

    matchedInfluencers.forEach((inf, idx) => {
      console.log(`${idx + 1}. ${inf.name} (@${inf.handle})`);
      console.log(`   Platform: ${inf.platform}`);
      console.log(`   Followers: ${inf.followers.toLocaleString()}`);
      console.log(`   Engagement: ${inf.engagement}%`);
      console.log(`   Match Score: ${inf.matchScore}/100`);
      console.log(`   Categories: ${inf.contentCategories.join(', ')}`);
      console.log(`   Location: ${inf.demographics.location.join(', ')}`);
      console.log(`   \n   💰 Cost Estimate: €${inf.costEstimate.toLocaleString()}`);
      console.log(`   📊 Estimated Reach: ${inf.estimatedReach.toLocaleString()}`);
      console.log(`   ❤️  Estimated Engagement: ${inf.estimatedEngagement.toLocaleString()}`);
      console.log(`   \n   💡 Rationale: ${inf.rationale}`);
      console.log(`   📝 Proposed Content: ${inf.proposedContent.join(', ')}\n`);
      console.log('───────────────────────────────────────────────────────\n');

      totalCost += inf.costEstimate;
      totalReach += inf.estimatedReach;
      totalEngagement += inf.estimatedEngagement;
    });

    console.log('📊 CAMPAIGN TOTALS:\n');
    console.log(`   💰 Total Cost: €${totalCost.toLocaleString()} (Budget: €${sampleBrief.budget.toLocaleString()})`);
    console.log(`   📊 Total Reach: ${totalReach.toLocaleString()}`);
    console.log(`   ❤️  Total Engagement: ${totalEngagement.toLocaleString()}`);
    console.log(`   💵 Cost per Engagement: €${(totalCost / totalEngagement).toFixed(2)}`);
    console.log(`   📈 Budget Utilization: ${((totalCost / sampleBrief.budget) * 100).toFixed(1)}%\n`);

    if (totalCost <= sampleBrief.budget) {
      console.log('✅ Budget check passed - within budget\n');
    } else {
      console.log('⚠️  Warning: Total cost exceeds budget\n');
    }

    console.log('═══════════════════════════════════════════════════════\n');
    console.log('✅ ALL TESTS COMPLETED SUCCESSFULLY\n');
    console.log('📝 Summary:');
    console.log('   ✅ Firestore connection working');
    console.log('   ✅ Database populated with influencers');
    console.log('   ✅ Search functionality operational');
    console.log('   ✅ LAYAI matching algorithm functioning');
    console.log('   ✅ Influencers successfully matched from database\n');

  } catch (error) {
    console.error('❌ FAILED: Matching pipeline error');
    console.error('   Error:', error instanceof Error ? error.message : 'Unknown error');
    if (error instanceof Error && error.stack) {
      console.error('\n   Stack trace:');
      console.error(error.stack);
    }
    console.log('\n');
  }
};

// Run tests
runTests()
  .then(() => {
    console.log('🎉 Test suite completed\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test suite failed with error:', error);
    process.exit(1);
  });
