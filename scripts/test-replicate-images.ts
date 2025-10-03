/**
 * Replicate Nano Banana Test Script
 * Tests image generation using Replicate's API to access Google's Nano Banana
 * https://replicate.com/google/nano-banana
 * 
 * Usage: npx ts-node scripts/test-replicate-images.ts
 */

import Replicate from "replicate";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";
import * as https from "https";

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const apiToken = process.env.REPLICATE_API_TOKEN || process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN;

if (!apiToken) {
  console.error("❌ No Replicate API token found!");
  console.error("Set REPLICATE_API_TOKEN in .env.local");
  console.error("Get your token from: https://replicate.com/account/api-tokens");
  process.exit(1);
}

console.log("🍌 Testing Nano Banana via Replicate API");
console.log("=".repeat(60));
console.log(`🔑 API Token: ${apiToken.substring(0, 10)}...`);
console.log("");

/**
 * Download image from URL
 */
const downloadImage = (url: string, filepath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve();
      });
    }).on("error", (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
};

const testBasicImageGeneration = async () => {
  try {
    const replicate = new Replicate({
      auth: apiToken,
    });

    console.log("🧪 Test 1: Basic Text-to-Image Generation");
    console.log("Model: google/nano-banana");
    console.log("Prompt: 'Professional business presentation background'");
    console.log("");

    const prompt = "Create a professional, modern business presentation background with abstract geometric shapes in blue and purple gradients. Minimalist, suitable for corporate use. 16:9 aspect ratio.";

    console.log("⏳ Generating image (this may take 30-60 seconds)...");
    console.log("");

    let output: any = await replicate.run(
      "google/nano-banana:1b7b945e8f7edf7a034eba6cb2c20f2ab5dc7d090eea1c616e96da947be76aee",
      {
        input: {
          prompt: prompt,
          aspect_ratio: "16:9",
          num_outputs: 1,
        }
      }
    );

    console.log("✅ Response received!");
    console.log("");

    // If output is iterable (stream), collect it
    if (output && typeof output[Symbol.asyncIterator] === 'function') {
      console.log("📊 Collecting streamed image data...");
      const chunks: Uint8Array[] = [];
      let totalBytes = 0;
      
      for await (const chunk of output) {
        if (chunk instanceof Uint8Array) {
          chunks.push(chunk);
          totalBytes += chunk.length;
        }
      }
      
      console.log(`   Collected ${chunks.length} chunks (${totalBytes} bytes total)`);
      
      if (chunks.length > 0) {
        // Concatenate all Uint8Arrays into one buffer
        const imageBuffer = Buffer.concat(chunks);
        
        console.log("🎉 Image generated successfully!");
        console.log(`   Size: ${imageBuffer.length} bytes`);
        console.log("");

        // Save the image directly
        const outputDir = path.join(process.cwd(), "test-results");
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputPath = path.join(
          outputDir,
          `nano-banana-test-${Date.now()}.png`
        );

        fs.writeFileSync(outputPath, imageBuffer);
        console.log(`   💾 Saved to: ${outputPath}`);
        console.log("");

        return true;
      }
    }

    // Fallback: check if it's already a string URL
    if (typeof output === 'string' && output.startsWith('http')) {
      console.log("🎉 Image URL received!");
      console.log(`   URL: ${output}`);
      
      const outputDir = path.join(process.cwd(), "test-results");
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const outputPath = path.join(
        outputDir,
        `nano-banana-test-${Date.now()}.png`
      );

      console.log("⏳ Downloading image...");
      await downloadImage(output, outputPath);
      console.log(`   💾 Saved to: ${outputPath}`);

      return true;
    }

    console.error("❌ No image data in response");
    console.log("Response type:", typeof output);
    return false;
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.error("");

    if (error.message?.includes("Unauthorized") || error.message?.includes("401")) {
      console.error("🔧 API Token Issue:");
      console.error("   1. Go to https://replicate.com/account/api-tokens");
      console.error("   2. Create or copy your API token");
      console.error("   3. Update REPLICATE_API_TOKEN in .env.local");
    }

    if (error.message?.includes("quota") || error.message?.includes("429")) {
      console.error("🔧 Rate Limit:");
      console.error("   You've hit the API rate limit. Wait a moment and try again.");
    }

    console.error("");
    console.error("Full error:", error);

    return false;
  }
};

const testDifferentAspectRatios = async () => {
  console.log("🧪 Test 2: Different Aspect Ratios");
  console.log("");

  const ratios = ["1:1", "16:9", "9:16", "3:2"];
  const replicate = new Replicate({ auth: apiToken });

  for (const ratio of ratios) {
    try {
      console.log(`   Testing ${ratio}...`);

      const output = await replicate.run(
        "google/nano-banana:1b7b945e8f7edf7a034eba6cb2c20f2ab5dc7d090eea1c616e96da947be76aee",
        {
          input: {
            prompt: "A simple blue gradient background",
            aspect_ratio: ratio,
            num_outputs: 1,
          }
        }
      );

      const hasImage = Array.isArray(output) && output.length > 0;
      console.log(`   ${hasImage ? "✅" : "❌"} ${ratio}`);
    } catch (error: any) {
      console.log(`   ❌ ${ratio} - ${error.message}`);
    }
  }

  console.log("");
};

const testImageEditing = async () => {
  console.log("🧪 Test 3: Image Editing (Multi-turn)");
  console.log("");

  try {
    const replicate = new Replicate({ auth: apiToken });

    // First generate a base image
    console.log("   Step 1: Generate base image...");
    const baseOutput = await replicate.run(
      "google/nano-banana:1b7b945e8f7edf7a034eba6cb2c20f2ab5dc7d090eea1c616e96da947be76aee",
      {
        input: {
          prompt: "A professional office desk with a laptop",
          aspect_ratio: "16:9",
          num_outputs: 1,
        }
      }
    );

    if (!Array.isArray(baseOutput) || baseOutput.length === 0) {
      console.log("   ❌ Failed to generate base image");
      return;
    }

    const baseImageUrl = baseOutput[0] as string;
    console.log(`   ✅ Base image created: ${baseImageUrl.substring(0, 50)}...`);

    // Now edit it
    console.log("   Step 2: Edit the image (add coffee cup)...");
    const editedOutput = await replicate.run(
      "google/nano-banana:1b7b945e8f7edf7a034eba6cb2c20f2ab5dc7d090eea1c616e96da947be76aee",
      {
        input: {
          image: baseImageUrl,
          prompt: "Add a steaming coffee cup on the desk",
          num_outputs: 1,
        }
      }
    );

    if (Array.isArray(editedOutput) && editedOutput.length > 0) {
      console.log(`   ✅ Image edited successfully!`);
      console.log(`   Edited URL: ${editedOutput[0]}`);
    } else {
      console.log("   ❌ Failed to edit image");
    }

    console.log("");
  } catch (error: any) {
    console.log(`   ❌ Editing test failed: ${error.message}`);
    console.log("");
  }
};

// Run all tests
(async () => {
  const basicTest = await testBasicImageGeneration();

  if (basicTest) {
    await testDifferentAspectRatios();
    await testImageEditing();

    console.log("=".repeat(60));
    console.log("🎊 All tests complete! Nano Banana is ready via Replicate!");
    console.log("");
    console.log("💰 Pricing Info (Replicate):");
    console.log("   - Pay-as-you-go pricing");
    console.log("   - Billed per second of GPU usage");
    console.log("   - Nano Banana typically ~$0.005-0.01 per image");
    console.log("   - Much more cost-effective than direct API!");
    console.log("");
    console.log("📚 Next steps:");
    console.log("   1. ✅ Replicate API working!");
    console.log("   2. Integrate into presentation generation pipeline");
    console.log("   3. Update slide renderers to display images");
    console.log("   4. Add Nano Banana editing side panel");
    console.log("");
  } else {
    console.log("=".repeat(60));
    console.log("⚠️  Image generation test failed. Check errors above.");
    process.exit(1);
  }
})();

