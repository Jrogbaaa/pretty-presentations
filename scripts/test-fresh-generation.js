/**
 * Fresh Generation Test
 * Forces fresh presentation generation with unique brief
 */

import fetch from 'node-fetch';

// Unique brief to avoid cache
const uniqueBrief = {
  clientName: `Tesla Model Y ${Date.now()}`,
  brandInfo: "Electric vehicle manufacturer targeting eco-conscious luxury consumers",
  campaignGoals: [
    "Launch Model Y in Spanish market",
    "Build sustainable mobility awareness",
    "Drive test drive bookings"
  ],
  targetDemographics: {
    ageRange: "30-50",
    gender: "All genders",
    location: ["Spain", "Madrid", "Barcelona", "Valencia"],
    interests: ["Technology", "Sustainability", "Luxury", "Innovation"],
    psychographics: "Eco-conscious, tech-savvy, high-income professionals"
  },
  budget: 75000,
  platformPreferences: ["Instagram", "YouTube"],
  contentThemes: ["Technology", "Sustainability", "Luxury", "Innovation"],
  brandRequirements: [
    "Highlight autonomous driving features",
    "Emphasize zero emissions message",
    "Show family-friendly spacious interior"
  ],
  timeline: "Q2 2025 - 4 months"
};

console.log('\n🚀 FRESH GENERATION TEST: Tesla Campaign');
console.log('='.repeat(70));
console.log('');
console.log('📝 Unique Brief ID:', uniqueBrief.clientName);
console.log('   Budget: €75,000');
console.log('   Expected time: ~2 minutes');
console.log('');
console.log('⏳ Starting generation...');
console.log('');

const startTime = Date.now();
let lastUpdate = startTime;

// Progress indicator
const progressInterval = setInterval(() => {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  process.stdout.write(`\r   ⏱️  Elapsed: ${elapsed}s...`);
}, 1000);

async function runTest() {
  try {
    const response = await fetch('http://localhost:3000/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(uniqueBrief)
    });

    clearInterval(progressInterval);
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\r' + ' '.repeat(50)); // Clear progress line

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    console.log('');
    console.log('✅ GENERATION COMPLETE!');
    console.log('='.repeat(70));
    console.log(`   Total Time: ${totalTime}s`);
    console.log('');

    // Check if it was actually generated or cached
    if (parseFloat(totalTime) < 10) {
      console.log('⚠️  WARNING: Response was too fast (< 10s)');
      console.log('   This might be cached or failed silently');
      console.log('');
    }

    // Try to extract presentation ID
    const match = html.match(/\/editor\/(\d+)/);
    if (match) {
      const presentationId = match[1];
      console.log('📊 Presentation Created:');
      console.log(`   ID: ${presentationId}`);
      console.log(`   Editor URL: http://localhost:3000/editor/${presentationId}`);
      console.log('');

      // Wait a moment for Firestore to save
      console.log('⏳ Waiting for Firestore save...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Fetch the presentation
      console.log('⏳ Fetching presentation data...');
      const detailsResponse = await fetch(`http://localhost:3000/api/presentations/${presentationId}`);
      
      if (detailsResponse.ok) {
        const data = await detailsResponse.json();
        
        if (data.success && data.presentation) {
          const pres = data.presentation;
          
          console.log('');
          console.log('✅ PRESENTATION SAVED TO FIRESTORE!');
          console.log('='.repeat(70));
          console.log('');
          console.log('📑 Details:');
          console.log(`   Campaign: ${pres.campaignName || pres.title}`);
          console.log(`   Client: ${pres.clientName}`);
          console.log(`   Slides: ${pres.slides?.length || 0}`);
          console.log(`   Influencers: ${pres.selectedInfluencers?.length || 0}`);
          console.log('');

          // Check for images
          const slidesWithImages = pres.slides?.filter(
            s => s.content?.images && s.content.images.length > 0
          ) || [];

          console.log('🖼️  IMAGE GENERATION RESULTS:');
          console.log('='.repeat(70));
          console.log(`   Total slides: ${pres.slides?.length || 0}`);
          console.log(`   Slides with images: ${slidesWithImages.length}`);
          console.log(`   Success rate: ${((slidesWithImages.length / (pres.slides?.length || 1)) * 100).toFixed(0)}%`);
          console.log('');

          if (slidesWithImages.length > 0) {
            console.log('🎨 Image Breakdown:');
            console.log('');
            slidesWithImages.forEach((slide, index) => {
              if (slide.content.images && slide.content.images[0]) {
                const img = slide.content.images[0];
                const format = img.startsWith('data:image/jpeg') ? 'JPEG' : 'PNG';
                const size = (img.length / 1024).toFixed(1);
                const truncatedTitle = slide.title.length > 30 
                  ? slide.title.substring(0, 27) + '...'
                  : slide.title;
                console.log(`   ${(index + 1).toString().padStart(2)}. ${truncatedTitle.padEnd(30)} ${format.padEnd(4)} ${size.padStart(6)}KB`);
              }
            });
            console.log('');

            // Sample image preview
            const coverSlide = pres.slides?.find(s => s.type === 'cover');
            if (coverSlide?.content?.images?.[0]) {
              console.log('📸 Cover Slide Image:');
              const img = coverSlide.content.images[0];
              console.log(`   Format: ${img.startsWith('data:image/jpeg') ? 'JPEG' : 'PNG'}`);
              console.log(`   Size: ${(img.length / 1024).toFixed(1)}KB`);
              console.log(`   Data URL: ${img.substring(0, 50)}...`);
              console.log('');
            }

            console.log('='.repeat(70));
            console.log('🎉 SUCCESS! Images generated and embedded!');
            console.log('');
            console.log('🌐 View the presentation:');
            console.log(`   http://localhost:3000/editor/${presentationId}`);
            console.log('');
            console.log('✨ What to check:');
            console.log('   ✓ Cover slide has hero background image');
            console.log('   ✓ Content slides have subtle backgrounds');
            console.log('   ✓ Text is readable with good contrast');
            console.log('   ✓ Images match the campaign theme');
            console.log('');

          } else {
            console.log('⚠️  NO IMAGES FOUND!');
            console.log('   Check server logs for image generation errors');
            console.log('');
          }

        } else {
          console.log('');
          console.log('❌ PRESENTATION NOT SAVED TO FIRESTORE');
          console.log('   Check database permissions and server logs');
          console.log('');
        }
      } else {
        const errorText = await detailsResponse.text();
        console.log('');
        console.log('❌ FAILED TO FETCH PRESENTATION');
        console.log(`   Status: ${detailsResponse.status}`);
        console.log(`   Response: ${errorText.substring(0, 200)}`);
        console.log('');
      }
    } else {
      console.log('⚠️  Could not extract presentation ID from response');
      console.log('   Response preview:', html.substring(0, 500));
    }

  } catch (error) {
    clearInterval(progressInterval);
    console.log('');
    console.log('❌ TEST FAILED');
    console.log('='.repeat(70));
    console.error('Error:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause.message);
    }
    console.log('');
    process.exit(1);
  }
}

runTest();

