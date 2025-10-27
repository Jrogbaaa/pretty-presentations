// Test different model names to find one that works
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const modelsToTry = [
  "gemini-pro",
  "gemini-1.5-pro",
  "gemini-1.5-flash",
  "gemini-1.5-pro-latest",
  "gemini-1.5-flash-latest",
  "models/gemini-pro",
  "models/gemini-1.5-flash",
];

console.log('🧪 Testing different model names...\n');

async function testModels() {
  for (const modelName of modelsToTry) {
    try {
      console.log(`Testing: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say hello in 3 words");
      const response = result.response;
      const text = response.text();
      
      console.log(`✅ SUCCESS with model: ${modelName}`);
      console.log(`   Response: ${text}`);
      console.log(`\n🎉 USE THIS MODEL NAME: ${modelName}\n`);
      return modelName;
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message.split('\n')[0]}`);
    }
  }
  
  console.log('\n❌ None of the models worked.');
  console.log('\nThis means:');
  console.log('1. The Generative Language API is not enabled');
  console.log('2. Or permissions haven\'t propagated yet (wait 5 minutes)');
  console.log('3. Or you need to create a NEW API key\n');
  console.log('Try creating a fresh API key at: https://aistudio.google.com/app/apikey');
  console.log('Select "Create API key in new project"\n');
}

testModels();
