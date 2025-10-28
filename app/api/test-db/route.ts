import { NextResponse } from 'next/server';
import { searchInfluencers } from '@/lib/influencer-service';

export async function GET() {
  try {
    console.log('🧪 Testing database connection...');
    
    const influencers = await searchInfluencers({
      platforms: ['Instagram'],
      locations: ['Spain'],
      contentCategories: ['Fashion'],
    }, 10);
    
    console.log(`✅ Found ${influencers.length} influencers`);
    
    return NextResponse.json({
      success: true,
      count: influencers.length,
      sample: influencers.slice(0, 3).map(inf => ({
        name: inf.name,
        handle: inf.handle,
        followers: inf.followers,
        engagement: inf.engagement
      }))
    });
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

