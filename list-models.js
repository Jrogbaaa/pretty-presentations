// List available models
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;

if (!apiKey) {
  console.error('❌ API Key not found');
  process.exit(1);
}

console.log('🔑 API Key:', apiKey.substring(0, 20) + '...\n');

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    console.log('📋 Fetching available models...\n');
    
    const models = await genAI.listModels();
    
    console.log('✅ Available models:\n');
    for await (const model of models) {
      console.log(`  - ${model.name}`);
      console.log(`    Display Name: ${model.displayName}`);
      console.log(`    Supported: ${model.supportedGenerationMethods.join(', ')}`);
      console.log('');
    }
  } catch (error) {
    console.error('❌ Error listing models:');
    console.error(error.message);
    console.error('\nThis might mean:');
    console.error('1. The API key is invalid');
    console.error('2. The Generative Language API is not enabled for your project');
    console.error('\nTo fix:');
    console.error('- Go to: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com');
    console.error('- Enable the API');
    console.error('- Wait 2-5 minutes and try again');
  }
}

listModels();
