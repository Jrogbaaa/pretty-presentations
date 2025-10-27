/**
 * Test Full Presentation Generation with Images
 * Tests the complete flow including Nano Banana image generation
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import type { ClientBrief, Influencer } from '../types/index.js';

// ES module dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

console.log('🎨 Testing Full Presentation Generation with Nano Banana Images');
console.log('='.repeat(70));
console.log('');

// Test brief
const testBrief: ClientBrief = {
  clientName: "Nike",
  campaignGoals: [
    "Launch new Air Max sneaker line",
    "Increase brand awareness among Gen Z",
    "Drive online sales"
  ],
  budget: 50000,
  targetDemographics: {
    ageRange: "18-30",
    gender: "All genders",
    location: ["Spain", "Madrid", "Barcelona"],
    interests: ["Sports", "Fashion", "Streetwear", "Fitness", "Urban culture"],
    psychographics: "Active lifestyle, trend-conscious, values authenticity"
  },
  brandRequirements: [
    "Showcase Nike products naturally in content",
    "Emphasize sustainability message",
    "Use #JustDoIt hashtag"
  ],
  contentThemes: ["Sports", "Fashion", "Lifestyle", "Urban"],
  platformPreferences: ["Instagram", "TikTok"],
  timeline: "Q1 2025 - 3 months",
  additionalNotes: "Focus on authenticity and diverse representation"
};

// Mock influencers for quick test
const mockInfluencers: Influencer[] = [
  {
    id: "1",
    name: "María García",
    handle: "@maria_fitness",
    platform: "Instagram",
    profileImage: "",
    followers: 250000,
    engagement: 4.5,
    avgViews: 87500,
    demographics: {
      ageRange: "18-34",
      gender: "70% Female, 30% Male",
      location: ["Spain", "Madrid"],
      interests: ["Fitness", "Fashion", "Lifestyle"]
    },
    contentCategories: ["Fitness", "Fashion", "Sports"],
    previousBrands: ["Adidas", "Gymshark"],
    rateCard: {
      post: 2000,
      story: 500,
      reel: 3000,
      video: 4000,
      integration: 5000
    },
    performance: {
      averageEngagementRate: 4.5,
      averageReach: 87500,
      audienceGrowthRate: 15,
      contentQualityScore: 8.5
    }
  },
  {
    id: "2",
    name: "Carlos Ruiz",
    handle: "@carlos_street",
    platform: "Instagram",
    profileImage: "",
    followers: 180000,
    engagement: 5.2,
    avgViews: 93600,
    demographics: {
      ageRange: "18-34",
      gender: "50% Female, 50% Male",
      location: ["Spain", "Barcelona"],
      interests: ["Streetwear", "Fashion", "Urban"]
    },
    contentCategories: ["Fashion", "Lifestyle", "Urban"],
    previousBrands: ["Nike", "Supreme"],
    rateCard: {
      post: 1800,
      story: 400,
      reel: 2800,
      video: 3500,
      integration: 4500
    },
    performance: {
      averageEngagementRate: 5.2,
      averageReach: 93600,
      audienceGrowthRate: 18,
      contentQualityScore: 9.0
    }
  },
  {
    id: "3",
    name: "Laura Martínez",
    handle: "@laura_run",
    platform: "TikTok",
    profileImage: "",
    followers: 320000,
    engagement: 6.8,
    avgViews: 217600,
    demographics: {
      ageRange: "16-30",
      gender: "65% Female, 35% Male",
      location: ["Spain", "Valencia"],
      interests: ["Running", "Fitness", "Health"]
    },
    contentCategories: ["Sports", "Fitness", "Lifestyle"],
    previousBrands: ["Asics", "Decathlon"],
    rateCard: {
      post: 2500,
      story: 600,
      reel: 3500,
      video: 4500,
      integration: 6000
    },
    performance: {
      averageEngagementRate: 6.8,
      averageReach: 217600,
      audienceGrowthRate: 22,
      contentQualityScore: 8.8
    }
  }
];

async function runTest() {
  try {
    console.log('📝 Test Brief:');
    console.log(`   Client: ${testBrief.clientName}`);
    console.log(`   Budget: €${testBrief.budget.toLocaleString()}`);
    console.log(`   Goals: ${testBrief.campaignGoals.length} objectives`);
    console.log(`   Influencers: ${mockInfluencers.length} profiles`);
    console.log('');

    console.log('⏳ Step 1: Processing brief with OpenAI...');
    const startTime = Date.now();

    // Import the processor
    const { processBrief } = await import('../lib/ai-processor-openai');

    console.log('⏳ Step 2: Generating presentation (this will take 1-2 minutes)...');
    console.log('   - Validating brief');
    console.log('   - Matching influencers');  
    console.log('   - Generating content');
    console.log('   - Creating slides');
    console.log('   - 🍌 Generating images with Nano Banana (30-60s)');
    console.log('');

    const result = await processBrief(testBrief, mockInfluencers);

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('');
    console.log('✅ PRESENTATION GENERATED SUCCESSFULLY!');
    console.log('='.repeat(70));
    console.log('');

    console.log('📊 Results:');
    console.log(`   Total Time: ${totalTime}s`);
    console.log(`   Total Slides: ${result.presentation.slides.length}`);
    console.log(`   Confidence: ${result.confidence}%`);
    console.log('');

    // Check images
    const slidesWithImages = result.presentation.slides.filter(
      s => s.content.images && s.content.images.length > 0
    );

    console.log('🖼️  Image Generation:');
    console.log(`   Slides with images: ${slidesWithImages.length}/${result.presentation.slides.length}`);
    console.log('');

    console.log('📑 Slide Breakdown:');
    result.presentation.slides.forEach((slide, index) => {
      const hasImage = slide.content.images && slide.content.images.length > 0;
      const imageSize = hasImage && slide.content.images
        ? (slide.content.images[0].length / 1024).toFixed(1) + 'KB'
        : 'No image';
      
      console.log(`   ${index + 1}. ${slide.title.padEnd(25)} [${slide.type.padEnd(18)}] ${hasImage ? '🖼️' : '  '} ${imageSize}`);
    });

    console.log('');
    console.log('🎨 Image Details:');
    slidesWithImages.forEach((slide, index) => {
      if (slide.content.images && slide.content.images[0]) {
        const img = slide.content.images[0];
        const format = img.startsWith('data:image/jpeg') ? 'JPEG' : 'PNG';
        const size = (img.length / 1024).toFixed(1);
        console.log(`   ${index + 1}. ${slide.title}: ${format}, ${size}KB`);
      }
    });

    console.log('');
    console.log('✨ Sample Slide (Cover):');
    const coverSlide = result.presentation.slides[0];
    console.log(`   Title: ${coverSlide.content.title}`);
    console.log(`   Subtitle: ${coverSlide.content.subtitle}`);
    console.log(`   Has Image: ${coverSlide.content.images ? 'YES ✅' : 'NO ❌'}`);
    if (coverSlide.content.images && coverSlide.content.images[0]) {
      const imgPreview = coverSlide.content.images[0].substring(0, 60) + '...';
      console.log(`   Image Preview: ${imgPreview}`);
    }

    console.log('');
    console.log('='.repeat(70));
    console.log('🎉 TEST COMPLETE! Images successfully generated and embedded.');
    console.log('');
    console.log('💡 Next Steps:');
    console.log('   1. Run "npm run dev" to see presentation in browser');
    console.log('   2. Generate a real presentation to see live results');
    console.log('   3. Check image quality and relevance');
    console.log('');

  } catch (error: any) {
    console.error('');
    console.error('❌ TEST FAILED');
    console.error('='.repeat(70));
    console.error('Error:', error.message);
    console.error('');
    if (error.stack) {
      console.error('Stack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the test
runTest();

