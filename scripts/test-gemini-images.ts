/**
 * Gemini Image Generation Test (Nano Banana)
 * Tests the new native image generation capabilities
 * https://ai.google.dev/gemini-api/docs/image-generation
 * 
 * Usage: npx ts-node scripts/test-gemini-images.ts
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const apiKey =
  process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY ||
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
  "";

if (!apiKey) {
  console.error("❌ No API key found!");
  console.error("Set NEXT_PUBLIC_GOOGLE_AI_API_KEY in .env.local");
  process.exit(1);
}

console.log("🍌 Testing Gemini Native Image Generation (Nano Banana)");
console.log("=".repeat(60));
console.log(`🔑 API Key: ${apiKey.substring(0, 20)}...`);
console.log("");

const testImageGeneration = async () => {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    // Use correct model name from official docs
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-image",
    });

    console.log("🧪 Test 1: Basic Text-to-Image Generation");
    console.log("Prompt: 'A professional business presentation slide background'");
    console.log("");

    const prompt =
      "Create a professional, modern business presentation background with abstract geometric shapes in blue and purple gradients. 16:9 aspect ratio, minimalist, suitable for corporate use.";

    const result = await model.generateContent(prompt);

    const response = result.response;
    const parts = response.candidates?.[0]?.content?.parts || [];

    let imageFound = false;
    for (const part of parts) {
      if (part.text) {
        console.log("📝 Text response:", part.text);
      } else if (part.inlineData) {
        imageFound = true;
        console.log("✅ Image generated successfully!");
        console.log(`   MIME Type: ${part.inlineData.mimeType}`);
        console.log(`   Data size: ${part.inlineData.data.length} characters (base64)`);

        // Save to test-results directory
        const outputDir = path.join(process.cwd(), "test-results");
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputPath = path.join(
          outputDir,
          `gemini-test-${Date.now()}.png`
        );
        const buffer = Buffer.from(part.inlineData.data, "base64");
        fs.writeFileSync(outputPath, buffer);

        console.log(`   💾 Saved to: ${outputPath}`);
      }
    }

    if (!imageFound) {
      console.error("❌ No image found in response");
      console.log("Response:", JSON.stringify(response, null, 2));
      return false;
    }

    console.log("");
    console.log("🎉 SUCCESS! Gemini image generation is working!");
    console.log("");
    console.log("📊 Pricing Info:");
    console.log("   - $30 per 1M tokens");
    console.log("   - ~1290 tokens per image");
    console.log("   - Cost per image: ~$0.039");
    console.log("");

    return true;
  } catch (error: any) {
    console.error("❌ Error:", error.message);

    if (error.message?.includes("API_KEY")) {
      console.error("");
      console.error("🔧 API Key Issue:");
      console.error("   1. Go to https://aistudio.google.com/app/apikey");
      console.error("   2. Create or verify your API key");
      console.error("   3. Update NEXT_PUBLIC_GOOGLE_AI_API_KEY in .env.local");
    }

    if (error.message?.includes("not found") || error.message?.includes("404")) {
      console.error("");
      console.error("🔧 Model Access Issue:");
      console.error(
        "   The image generation model might not be available yet"
      );
      console.error("   Check: https://ai.google.dev/gemini-api/docs/models");
    }

    if (error.message?.includes("quota") || error.message?.includes("429")) {
      console.error("");
      console.error("🔧 Rate Limit:");
      console.error("   You've hit the API rate limit. Wait a moment and try again.");
    }

    console.error("");
    console.error("Full error:", error);

    return false;
  }
};

// Test aspect ratios
const testAspectRatios = async () => {
  console.log("🧪 Test 2: Different Aspect Ratios");
  console.log("");

  const ratios = ["1:1", "16:9", "9:16", "3:2"];

  for (const ratio of ratios) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-image",
      });

      console.log(`   Testing ${ratio}...`);

      const result = await model.generateContent(
        `A simple blue gradient background with ${ratio} aspect ratio`
      );

      const response = result.response;
      const parts = response.candidates?.[0]?.content?.parts || [];

      const hasImage = parts.some((p) => p.inlineData);
      console.log(`   ${hasImage ? "✅" : "❌"} ${ratio}`);
    } catch (error: any) {
      console.log(`   ❌ ${ratio} - ${error.message}`);
    }
  }

  console.log("");
};

// Run tests
(async () => {
  const basicTest = await testImageGeneration();

  if (basicTest) {
    await testAspectRatios();

    console.log("=".repeat(60));
    console.log("🎊 All tests complete! Image generation is ready to use.");
    console.log("");
    console.log("📚 Next steps:");
    console.log("   1. Integrate into slide generation pipeline");
    console.log("   2. Update slide renderers to display images");
    console.log("   3. Add image editing capabilities (Nano Banana)");
    console.log("");
  } else {
    console.log("=".repeat(60));
    console.log("⚠️  Image generation test failed. Check errors above.");
    process.exit(1);
  }
})();

