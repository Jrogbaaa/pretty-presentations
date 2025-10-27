/**
 * Query Calzedonia Group Influencers (<500K followers)
 * For pitch presentation - Tuesday 14:00 deadline
 */

import { searchInfluencers } from './pretty-presentations/lib/influencer-service';
import type { Influencer } from './pretty-presentations/types';

interface BrandInfluencerRecommendation {
  brand: string;
  positioning: string;
  recommendedInfluencers: Influencer[];
}

const queryCalzedoniaInfluencers = async (): Promise<void> => {
  console.log('🔍 Querying Firestore for Calzedonia Group influencers...\n');

  // ===== CALZEDONIA =====
  // Hosiery/Legwear - Feminine, Accessible Elegance
  console.log('📊 CALZEDONIA - Fashion & Lifestyle (Feminine, Accessible)');
  const calzedoniaInfluencers = await searchInfluencers({
    platforms: ['Instagram'],
    locations: ['Spain', 'España', 'Madrid', 'Barcelona'],
    contentCategories: ['Fashion', 'Lifestyle', 'Beauty'],
    maxFollowers: 500000,
    minEngagement: 2.0, // Good engagement rate
  }, 20);
  
  console.log(`✅ Found ${calzedoniaInfluencers.length} matches`);
  displayInfluencers(calzedoniaInfluencers);
  console.log('\n---\n');

  // ===== INTIMISSIMI =====
  // Lingerie - Feminine, Sensual, Quality
  console.log('📊 INTIMISSIMI - Fashion & Beauty (Feminine, Sensual)');
  const intimissimiInfluencers = await searchInfluencers({
    platforms: ['Instagram'],
    locations: ['Spain', 'España', 'Madrid', 'Barcelona'],
    contentCategories: ['Fashion', 'Beauty', 'Lifestyle'],
    gender: 'Female',
    maxFollowers: 500000,
    minEngagement: 2.5, // Higher engagement for premium positioning
  }, 20);
  
  console.log(`✅ Found ${intimissimiInfluencers.length} matches`);
  displayInfluencers(intimissimiInfluencers);
  console.log('\n---\n');

  // ===== TEZENIS =====
  // Casual Underwear/Beachwear - Young, Playful, Accessible
  console.log('📊 TEZENIS - Lifestyle & Fashion (Young, Playful)');
  const tezenisInfluencers = await searchInfluencers({
    platforms: ['Instagram', 'TikTok'],
    locations: ['Spain', 'España', 'Madrid', 'Barcelona'],
    contentCategories: ['Lifestyle', 'Fashion', 'Travel'],
    ageRange: '18-24', // Younger demographic
    maxFollowers: 500000,
    minEngagement: 3.0, // Higher engagement for younger creators
  }, 20);
  
  console.log(`✅ Found ${tezenisInfluencers.length} matches`);
  displayInfluencers(tezenisInfluencers);
  console.log('\n---\n');

  // ===== FALCONERI =====
  // Cashmere/Knitwear - Luxury, Timeless, Sophisticated
  console.log('📊 FALCONERI - Fashion & Luxury (Sophisticated, Timeless)');
  const falconeriInfluencers = await searchInfluencers({
    platforms: ['Instagram'],
    locations: ['Spain', 'España', 'Madrid', 'Barcelona'],
    contentCategories: ['Fashion', 'Luxury', 'Lifestyle'],
    maxFollowers: 500000,
    minEngagement: 2.0,
  }, 20);
  
  console.log(`✅ Found ${falconeriInfluencers.length} matches`);
  displayInfluencers(falconeriInfluencers);
  console.log('\n---\n');

  // ===== IUMAN =====
  // Men's Underwear - Masculine, Athletic, Quality
  console.log('📊 IUMAN - Male Lifestyle & Fitness (Athletic, Quality)');
  const iumanInfluencers = await searchInfluencers({
    platforms: ['Instagram'],
    locations: ['Spain', 'España', 'Madrid', 'Barcelona'],
    contentCategories: ['Fitness', 'Sports', 'Lifestyle', 'Fashion'],
    gender: 'Male',
    maxFollowers: 500000,
    minEngagement: 2.0,
  }, 20);
  
  console.log(`✅ Found ${iumanInfluencers.length} matches`);
  displayInfluencers(iumanInfluencers);
  console.log('\n---\n');

  // ===== SUMMARY =====
  console.log('📋 SUMMARY FOR PITCH DECK:');
  console.log(`\nTotal influencers found (<500K followers):`);
  console.log(`  • Calzedonia: ${calzedoniaInfluencers.length} options`);
  console.log(`  • Intimissimi: ${intimissimiInfluencers.length} options`);
  console.log(`  • Tezenis: ${tezenisInfluencers.length} options`);
  console.log(`  • Falconeri: ${falconeriInfluencers.length} options`);
  console.log(`  • Iuman: ${iumanInfluencers.length} options`);
  
  console.log('\n💡 Next Steps:');
  console.log('  1. Select 1 primary ambassador per brand');
  console.log('  2. Create detailed profile slide for each');
  console.log('  3. Add overlap & brand affinity data');
  console.log('  4. Develop activation strategy');
  console.log('  5. Create alternative profiles slide');
  console.log('\n⏰ Deadline: Tuesday 14:00');
};

const displayInfluencers = (influencers: Influencer[]): void => {
  influencers.slice(0, 10).forEach((inf, index) => {
    const followersK = Math.round(inf.followers / 1000);
    console.log(`   ${index + 1}. @${inf.handle} - ${inf.name}`);
    console.log(`      ${followersK}K followers | ${inf.engagement.toFixed(2)}% engagement`);
    console.log(`      Categories: ${inf.contentCategories.join(', ')}`);
    console.log(`      Rate: €${inf.rateCard.post.toLocaleString()} per post`);
    console.log('');
  });
  
  if (influencers.length > 10) {
    console.log(`   ... and ${influencers.length - 10} more`);
  }
};

// Run the query
queryCalzedoniaInfluencers().catch((error) => {
  console.error('❌ Error querying influencers:', error);
  process.exit(1);
});

