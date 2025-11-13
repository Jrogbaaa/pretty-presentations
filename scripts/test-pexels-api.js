/**
 * Test Pexels API Key
 * Run with: node scripts/test-pexels-api.js
 */

const https = require('https');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

console.log('🔍 Testing Pexels API Key...\n');

if (!PEXELS_API_KEY) {
  console.error('❌ PEXELS_API_KEY not found in .env.local');
  console.log('\nPlease add to .env.local:');
  console.log('PEXELS_API_KEY=Pux7oVSdxB6fTC1yMupWzMYRDKQk2Gc3PLFg4dm9i7egeQMjHm9HcG16');
  process.exit(1);
}

console.log(`✓ API Key found: ${PEXELS_API_KEY.substring(0, 10)}...`);
console.log('\n📡 Making test request to Pexels API...\n');

const options = {
  hostname: 'api.pexels.com',
  path: '/v1/search?query=business&per_page=1',
  method: 'GET',
  headers: {
    'Authorization': PEXELS_API_KEY
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    
    if (res.statusCode === 200) {
      const result = JSON.parse(data);
      console.log('\n✅ SUCCESS! Pexels API is working correctly\n');
      console.log('API Response:');
      console.log(`  - Total results: ${result.total_results}`);
      console.log(`  - Photos returned: ${result.photos?.length || 0}`);
      if (result.photos && result.photos.length > 0) {
        console.log(`  - Sample photo: ${result.photos[0].url}`);
        console.log(`  - Photographer: ${result.photos[0].photographer}`);
      }
      console.log('\n🎉 Your Pexels API key is valid and working!');
    } else if (res.statusCode === 401) {
      console.error('\n❌ AUTHENTICATION FAILED');
      console.error('The API key is invalid or expired.');
      console.error('\nPlease verify your key at: https://www.pexels.com/api/');
    } else {
      console.error(`\n❌ ERROR: Received status code ${res.statusCode}`);
      console.error('Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('\n❌ NETWORK ERROR');
  console.error('Could not connect to Pexels API:', error.message);
  console.error('\nPlease check your internet connection.');
});

req.end();

