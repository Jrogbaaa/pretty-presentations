// Quick test of Google AI API
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;

if (!apiKey) {
  console.error('❌ NEXT_PUBLIC_GOOGLE_AI_API_KEY not found in .env.local');
  process.exit(1);
}

console.log('🔑 API Key found:', apiKey.substring(0, 20) + '...\n');

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

console.log('🧪 Testing Google AI API...\n');

async function testAPI() {
  try {
    const result = await model.generateContent("Say 'Hello from Google AI!' in JSON format: {message: string}");
    const response = result.response;
    const text = response.text();
    
    console.log('✅ API Response received!');
    console.log('📝 Response:', text);
    console.log('\n🎉 SUCCESS! The Google AI API is working!\n');
    
    // Test brief parsing
    console.log('🧪 Testing brief parsing...\n');
    const briefResult = await model.generateContent(`Parse this brief: "Client: Nike, Budget: 50000 euros, Target: 18-35, Goal: Brand awareness". Return JSON: {clientName: string, budget: number}`);
    const briefResponse = briefResult.response;
    const briefText = briefResponse.text();
    console.log('✅ Brief parsing response:', briefText);
    console.log('\n🎉 Brief parsing works too!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('API_KEY_INVALID')) {
      console.error('\n❌ The API key appears to be invalid. Please check:');
      console.error('1. Go to https://aistudio.google.com/app/apikey');
      console.error('2. Create a new API key');
      console.error('3. Update NEXT_PUBLIC_GOOGLE_AI_API_KEY in .env.local\n');
    }
    process.exit(1);
  }
}

testAPI();
