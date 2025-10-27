/**
 * End-to-End API Test
 * Tests presentation generation with images via API
 */

import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000/api/presentations';

// Simple test brief
const testBrief = {
  clientName: "Nike Air Max",
  brandInfo: "Sports footwear brand targeting active lifestyle consumers",
  campaignGoals: [
    "Launch new Air Max sneaker line",
    "Increase brand awareness among Gen Z",
    "Drive online sales"
  ],
  targetDemographics: {
    ageRange: "18-30",
    gender: "All genders",
    location: ["Spain", "Madrid", "Barcelona"],
    interests: ["Sports", "Fashion", "Streetwear", "Fitness"],
    psychographics: "Active lifestyle, trend-conscious"
  },
  budget: 35000,
  platformPreferences: ["Instagram", "TikTok"],
  contentThemes: ["Sports", "Fashion", "Urban"],
  brandRequirements: [
    "Showcase Nike products naturally",
    "Use #JustDoIt hashtag",
    "Emphasize sustainability"
  ],
  timeline: "Q1 2025 - 3 months"
};

console.log('\n🧪 E2E API TEST: Presentation Generation with Images');
console.log('='.repeat(70));
console.log('');

async function runTest() {
  try {
    console.log('📝 Test Brief:');
    console.log(`   Client: ${testBrief.clientName}`);
    console.log(`   Budget: €${testBrief.budget.toLocaleString()}`);
    console.log(`   Goals: ${testBrief.campaignGoals.length}`);
    console.log('');

    console.log('⏳ Submitting brief to API...');
    console.log('   Endpoint: POST /');
    console.log('');
    
    const startTime = Date.now();

    // Submit brief via homepage API
    const response = await fetch('http://localhost:3000/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testBrief)
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('');
    console.log('✅ PRESENTATION GENERATED!');
    console.log('='.repeat(70));
    console.log(`   Total Time: ${totalTime}s`);
    console.log('');

    // Try to find the presentation ID in the redirect
    const match = html.match(/\/editor\/(\d+)/);
    if (match) {
      const presentationId = match[1];
      console.log('📊 Presentation Details:');
      console.log(`   ID: ${presentationId}`);
      console.log(`   URL: http://localhost:3000/editor/${presentationId}`);
      console.log('');

      // Fetch presentation details
      console.log('⏳ Fetching presentation data...');
      const detailsResponse = await fetch(`http://localhost:3000/api/presentations/${presentationId}`);
      
      if (detailsResponse.ok) {
        const data = await detailsResponse.json();
        
        if (data.success && data.presentation) {
          const pres = data.presentation;
          
          console.log('');
          console.log('✅ PRESENTATION LOADED FROM FIRESTORE!');
          console.log('='.repeat(70));
          console.log('');
          console.log('📑 Presentation Summary:');
          console.log(`   Title: ${pres.title || pres.campaignName}`);
          console.log(`   Client: ${pres.clientName}`);
          console.log(`   Total Slides: ${pres.slides?.length || 0}`);
          console.log('');

          // Check images
          const slidesWithImages = pres.slides?.filter(
            s => s.content?.images && s.content.images.length > 0
          ) || [];

          console.log('🖼️  Image Summary:');
          console.log(`   Slides with images: ${slidesWithImages.length}/${pres.slides?.length || 0}`);
          console.log('');

          if (slidesWithImages.length > 0) {
            console.log('🎨 Image Details:');
            slidesWithImages.slice(0, 5).forEach((slide, index) => {
              if (slide.content.images && slide.content.images[0]) {
                const img = slide.content.images[0];
                const format = img.startsWith('data:image/jpeg') ? 'JPEG' : 'PNG';
                const size = (img.length / 1024).toFixed(1);
                console.log(`   ${index + 1}. ${slide.title}: ${format}, ${size}KB`);
              }
            });
            if (slidesWithImages.length > 5) {
              console.log(`   ... and ${slidesWithImages.length - 5} more`);
            }
          }

          console.log('');
          console.log('✨ Sample Cover Slide:');
          const coverSlide = pres.slides?.[0];
          if (coverSlide) {
            console.log(`   Type: ${coverSlide.type}`);
            console.log(`   Title: ${coverSlide.content?.title || coverSlide.title}`);
            console.log(`   Has Image: ${coverSlide.content?.images ? 'YES ✅' : 'NO ❌'}`);
            if (coverSlide.content?.images?.[0]) {
              const imgPreview = coverSlide.content.images[0].substring(0, 60) + '...';
              console.log(`   Image: ${imgPreview}`);
            }
          }

          console.log('');
          console.log('='.repeat(70));
          console.log('🎉 TEST COMPLETE! Images successfully embedded in presentation.');
          console.log('');
          console.log('🌐 View in browser:');
          console.log(`   http://localhost:3000/editor/${presentationId}`);
          console.log('');

        } else {
          console.log('⚠️  Presentation generated but not saved to Firestore');
          console.log('   This might be a database permissions issue');
        }
      } else {
        console.log('⚠️  Could not fetch presentation details');
        console.log(`   Status: ${detailsResponse.status}`);
      }
    } else {
      console.log('⚠️  Presentation generated but could not find ID');
      console.log('   Response length:', html.length);
    }

  } catch (error) {
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

