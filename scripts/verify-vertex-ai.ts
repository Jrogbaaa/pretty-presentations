/**
 * Vertex AI Setup Verification Script
 * 
 * This script checks your Vertex AI configuration and helps diagnose issues.
 * Run with: npx ts-node scripts/verify-vertex-ai.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_VERTEX_AI_LOCATION',
  'NEXT_PUBLIC_VERTEX_AI_MODEL',
];

const OPTIONAL_ENV_VARS = [
  'NEXT_PUBLIC_VERTEX_AI_IMAGE_MODEL',
];

console.log('🔍 Vertex AI Configuration Check\n');
console.log('=' .repeat(50));

// Check environment variables
console.log('\n📋 Environment Variables:\n');

let allRequired = true;
REQUIRED_ENV_VARS.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}${value.length > 20 ? '...' : ''}`);
  } else {
    console.log(`❌ ${varName}: MISSING`);
    allRequired = false;
  }
});

OPTIONAL_ENV_VARS.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}${value.length > 20 ? '...' : ''}`);
  } else {
    console.log(`⚠️  ${varName}: Not set (optional)`);
  }
});

if (!allRequired) {
  console.log('\n❌ Missing required environment variables!');
  console.log('Add them to your .env.local file\n');
  process.exit(1);
}

// Project info
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const location = process.env.NEXT_PUBLIC_VERTEX_AI_LOCATION;
const model = process.env.NEXT_PUBLIC_VERTEX_AI_MODEL;

console.log('\n' + '='.repeat(50));
console.log('\n🎯 Configuration Summary:\n');
console.log(`Project ID: ${projectId}`);
console.log(`Location: ${location}`);
console.log(`Model: ${model}`);

console.log('\n' + '='.repeat(50));
console.log('\n🔗 Important Links:\n');

console.log(`1️⃣  Enable Vertex AI API:`);
console.log(`   https://console.cloud.google.com/apis/library/aiplatform.googleapis.com?project=${projectId}\n`);

console.log(`2️⃣  Enable Generative Language API:`);
console.log(`   https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com?project=${projectId}\n`);

console.log(`3️⃣  Check APIs Dashboard:`);
console.log(`   https://console.cloud.google.com/apis/dashboard?project=${projectId}\n`);

console.log(`4️⃣  Check Firebase Billing:`);
console.log(`   https://console.firebase.google.com/project/${projectId}/usage\n`);

console.log(`5️⃣  Vertex AI Documentation:`);
console.log(`   https://cloud.google.com/vertex-ai/docs/start/introduction-unified-platform\n`);

console.log('=' .repeat(50));
console.log('\n📝 Next Steps:\n');

console.log('1. Click the links above to enable the required APIs');
console.log('2. Ensure your Firebase project is on the Blaze (Pay-as-you-go) plan');
console.log('3. Wait 2-5 minutes after enabling APIs');
console.log('4. Restart your dev server: npm run dev');
console.log('5. Try parsing a brief again\n');

console.log('=' .repeat(50));
console.log('\n💡 Common Issues:\n');

console.log('❌ 404 Error → Vertex AI API not enabled');
console.log('   Solution: Enable API at link #1 above\n');

console.log('❌ 403 Permission Error → Billing not enabled or wrong permissions');
console.log('   Solution: Upgrade to Blaze plan at link #4 above\n');

console.log('❌ Invalid Location → Location not supported');
console.log(`   Current: ${location}`);
console.log('   Try: us-central1, europe-west1, or asia-northeast1\n');

console.log('=' .repeat(50));
console.log('\n✅ Configuration check complete!\n');

// Test Firebase import (basic check)
try {
  console.log('🧪 Testing Firebase import...\n');
  
  // Dynamic import to avoid initialization
  import('../lib/firebase').then(() => {
    console.log('✅ Firebase module imported successfully');
    console.log('\n⚠️  Note: This only checks imports, not API access.');
    console.log('To test API access, try parsing a brief in the app.\n');
  }).catch((error) => {
    console.log('❌ Firebase import failed:');
    console.log(error.message);
    console.log('\nCheck your Firebase configuration in lib/firebase.ts\n');
  });
} catch (error) {
  console.log('❌ Failed to test Firebase import');
  if (error instanceof Error) {
    console.log(error.message);
  }
}
