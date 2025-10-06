/**
 * Replicate Image Service - Nano Banana (Gemini 2.5 Flash Image)
 * Uses Replicate API to access Google's Nano Banana image generation model
 * https://replicate.com/google/nano-banana
 */

import Replicate from "replicate";
import type { Slide, ClientBrief } from "@/types";
import { logInfo, logError } from "./logger";

export interface SlideImageOptions {
  slideType: string;
  slideContent: {
    title?: string;
    subtitle?: string;
    body?: string;
    bullets?: string[];
  };
  brief: ClientBrief;
  aspectRatio?: "1:1" | "16:9" | "9:16" | "3:2" | "4:3";
}

/**
 * Get Replicate client instance
 */
const getReplicateClient = () => {
  const apiToken = process.env.REPLICATE_API_TOKEN || process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN;
  
  if (!apiToken) {
    throw new Error("REPLICATE_API_TOKEN not found in environment variables");
  }
  
  return new Replicate({
    auth: apiToken,
  });
};

/**
 * Create a timeout promise that rejects after the specified duration
 */
const createTimeout = (ms: number, message: string) => {
  return new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms);
  });
};

/**
 * Generate an image for a specific slide using Nano Banana
 */
export const generateSlideImage = async (
  options: SlideImageOptions
): Promise<string | null> => {
  try {
    const { slideType, slideContent, brief, aspectRatio = "16:9" } = options;
    const replicate = getReplicateClient();

    // Create prompt based on slide type
    const prompt = createPromptForSlide(slideType, slideContent, brief, aspectRatio);

    logInfo("Generating image with Nano Banana", {
      slideType,
      model: "google/nano-banana",
      prompt: prompt.substring(0, 100) + "...",
    });

    // Run Nano Banana model with 60-second timeout
    // Using specific version hash from Replicate
    const replicateCall = replicate.run(
      "google/nano-banana:1b7b945e8f7edf7a034eba6cb2c20f2ab5dc7d090eea1c616e96da947be76aee",
      {
        input: {
          prompt: prompt,
          aspect_ratio: aspectRatio,
          num_outputs: 1,
        }
      }
    );

    // Add 60-second timeout to prevent hanging
    let output: any = await Promise.race([
      replicateCall,
      createTimeout(60000, `Image generation timeout after 60s for ${slideType}`)
    ]);

    // Handle streaming response (Replicate streams binary image data)
    if (output && typeof output[Symbol.asyncIterator] === 'function') {
      const chunks: Uint8Array[] = [];
      let totalBytes = 0;
      
      for await (const chunk of output) {
        if (chunk instanceof Uint8Array) {
          chunks.push(chunk);
          totalBytes += chunk.length;
        }
      }
      
      if (chunks.length > 0) {
        // Concatenate all chunks into single buffer
        const imageBuffer = Buffer.concat(chunks);
        
        // Convert to base64 data URL for easy embedding
        const base64Data = imageBuffer.toString('base64');
        const mimeType = imageBuffer[0] === 0xFF && imageBuffer[1] === 0xD8 ? 'image/jpeg' : 'image/png';
        const dataUrl = `data:${mimeType};base64,${base64Data}`;
        
        logInfo("Image generated successfully via Replicate", { 
          slideType,
          size: `${totalBytes} bytes`,
          chunks: chunks.length
        });
        
        return dataUrl;
      }
    }

    // Fallback: check if it's a URL string
    if (typeof output === 'string' && output.startsWith('http')) {
      logInfo("Image URL received from Replicate", { slideType, url: output.substring(0, 50) + "..." });
      return output;
    }

    logError("No image data in Replicate response", { slideType });
    return null;
  } catch (error) {
    logError("Error generating slide image via Replicate", { 
      error, 
      slideType: options.slideType 
    });
    return null;
  }
};

/**
 * Generate images for all slides in a presentation
 * Now uses parallel processing with a 2-minute overall timeout
 */
export const generateImagesForSlides = async (
  slides: Slide[],
  brief: ClientBrief
): Promise<Slide[]> => {
  logInfo("Starting Nano Banana image generation for all slides", { 
    count: slides.length 
  });

  const updatedSlides = [...slides];

  // Generate images in parallel for better performance
  const imagePromises = updatedSlides.map(async (slide, index) => {
    // Skip slides that shouldn't have images
    if (shouldSkipImage(slide.type)) {
      logInfo(`Skipping image for slide ${index + 1}`, { type: slide.type });
      return { index, imageUrl: null };
    }

    try {
      const imageUrl = await generateSlideImage({
        slideType: slide.type,
        slideContent: slide.content,
        brief,
        aspectRatio: "16:9",
      });

      if (imageUrl) {
        logInfo(`✅ Image added to slide ${index + 1}/${slides.length}`, {
          type: slide.type,
        });
      } else {
        logInfo(`⚠️ No image generated for slide ${index + 1}`, {
          type: slide.type,
        });
      }
      
      return { index, imageUrl };
    } catch (error) {
      logError(`Failed to generate image for slide ${index + 1}`, {
        error,
        type: slide.type,
      });
      return { index, imageUrl: null };
    }
  });

  // Wait for all images with a 2-minute overall timeout
  try {
    const results = await Promise.race([
      Promise.all(imagePromises),
      createTimeout(120000, 'Overall image generation timeout after 2 minutes')
    ]) as Array<{ index: number; imageUrl: string | null }>;

    // Apply results to slides
    results.forEach(({ index, imageUrl }) => {
      if (imageUrl) {
        updatedSlides[index] = {
          ...updatedSlides[index],
          content: {
            ...updatedSlides[index].content,
            images: [imageUrl],
          },
        };
      }
    });
  } catch (error) {
    logError('Image generation timed out or failed', { error });
    // Continue with slides without images
  }

  const imagesGenerated = updatedSlides.filter((s) => s.content.images?.length).length;
  
  logInfo("Nano Banana image generation complete", {
    total: slides.length,
    withImages: imagesGenerated,
    skipped: slides.length - imagesGenerated,
  });

  return updatedSlides;
};

/**
 * Create appropriate prompt for each slide type
 */
const createPromptForSlide = (
  slideType: string,
  content: SlideImageOptions["slideContent"],
  brief: ClientBrief,
  aspectRatio: string
): string => {
  const brandName = brief.clientName;
  const themes = brief.contentThemes.join(", ");
  const platforms = brief.platformPreferences.join(", ");

  switch (slideType) {
    case "cover":
      return `Create a stunning professional presentation cover image for ${brandName}. 
Style: Modern, corporate, premium, eye-catching
Theme: ${themes}
Mood: Confident, aspirational, professional
Visual elements: Abstract geometric patterns, gradient overlays, clean minimalist design
Colors: Sophisticated gradients in blues, purples, or brand-appropriate colors
Quality: Ultra-high quality, photorealistic rendering
Format: ${aspectRatio} aspect ratio, suitable for presentation slides
Important: No text, no logos (will be overlaid separately). Focus on creating a visually stunning background.`;

    case "objective":
      return `Create a professional business strategy image representing campaign objectives and goals.
Theme: Achievement, success, business excellence, strategic thinking
Style: Corporate, modern, clean, professional
Mood: Inspiring, goal-oriented, forward-thinking
Visual elements: Abstract representations of growth, targets, upward trends, success metrics
Colors: Professional palette - blues, greens, warm neutrals
Quality: High-end business photography or sophisticated abstract art
Format: ${aspectRatio} aspect ratio
Important: No text. Clean, minimal, suitable for corporate presentation.`;

    case "target-strategy":
      return `Create an image representing diverse target audience and demographics.
Audience profile: ${brief.targetDemographics.ageRange}, ${brief.targetDemographics.gender}
Interests: ${brief.targetDemographics.interests.join(", ")}
Style: Inclusive, diverse, modern, professional lifestyle
Mood: Authentic, relatable, aspirational
Visual elements: Diverse people, community, connection, modern lifestyle, authentic moments
Colors: Warm, inviting, human-centric palette
Quality: High-end lifestyle photography
Format: ${aspectRatio} aspect ratio
Important: Show diversity and inclusion. Professional but approachable. No text.`;

    case "creative-strategy":
      return `Create an inspiring creative workspace image representing content creation and innovation.
Campaign themes: ${themes}
Style: Creative, modern, dynamic, inspiring
Mood: Innovative, energetic, creative flow
Visual elements: Modern workspace, content creation tools, digital media, creative process, innovation
Colors: Vibrant but professional - pops of color with clean aesthetics
Quality: High-end creative workspace photography
Format: ${aspectRatio} aspect ratio
Important: Inspire creativity. Show modern content creation environment. No text.`;

    case "talent-strategy":
      return `Create a dynamic image representing social media influencers and digital content creation.
Platforms: ${platforms}
Style: Modern, social media aesthetic, engaging, digital-native
Mood: Energetic, authentic, connected, influential
Visual elements: Content creation, social media, digital influence, engagement, modern communication
Colors: Platform-inspired gradients (Instagram purples, TikTok vibes), contemporary and bold
Quality: High-end social media/digital photography
Format: ${aspectRatio} aspect ratio
Important: Capture the essence of social media influence. Professional but authentic. No specific people. No text.`;

    case "media-strategy":
      return `Create an image representing digital media ecosystem and social platforms.
Platforms: ${platforms}
Style: Tech-forward, digital, sleek, modern, connected
Mood: Innovative, networked, digital-first
Visual elements: Digital communication, social networks, media channels, connectivity, technology
Colors: Tech-inspired gradients, modern digital palette
Quality: High-end tech/digital photography or abstract tech art
Format: ${aspectRatio} aspect ratio
Important: Show digital connectivity and media ecosystem. No logos or branded elements. No text.`;

    case "brief-summary":
      return `Create a professional image representing campaign brief and strategic planning.
Brand: ${brandName}
Budget: €${brief.budget.toLocaleString()}
Style: Organized, professional, strategic, corporate
Mood: Clear, focused, strategic
Visual elements: Planning, organization, strategy documents, business planning, structured thinking
Colors: Clean, professional, organized palette
Quality: High-end business photography
Format: ${aspectRatio} aspect ratio
Important: Convey organization and strategic thinking. Professional setting. No text.`;

    case "next-steps":
      return `Create an inspiring image representing forward momentum and future progress.
Style: Future-focused, optimistic, actionable, forward-moving
Mood: Inspiring, positive, progressive, motivating
Visual elements: Path forward, journey, progress, action, forward movement, new horizons
Colors: Hopeful, forward-looking palette - blues, greens, sunrise/sunset tones
Quality: High-end inspirational photography
Format: ${aspectRatio} aspect ratio
Important: Create sense of forward motion and exciting future. Inspiring ending slide. No text.`;

    default:
      return `Create a clean, professional business presentation background.
Style: Minimal, corporate, modern, unobtrusive
Mood: Professional, clean, focused
Visual elements: Abstract geometric patterns, subtle gradients
Colors: Neutral with subtle accent colors
Quality: High-end corporate design
Format: ${aspectRatio} aspect ratio
Important: Clean background suitable for overlaying business content. No text.`;
  }
};

/**
 * Determine if a slide type should skip image generation
 */
const shouldSkipImage = (slideType: string): boolean => {
  // Index slides typically don't need images as they're just a table of contents
  return slideType === "index";
};

/**
 * Edit an existing slide image using Nano Banana's editing capabilities
 * (For future Nano Banana side panel feature)
 */
export const editSlideImage = async (
  currentImageUrl: string,
  editPrompt: string
): Promise<string | null> => {
  try {
    const replicate = getReplicateClient();

    logInfo("Editing image with Nano Banana", {
      editPrompt: editPrompt.substring(0, 100) + "...",
    });

    // Nano Banana supports image editing with input image + prompt
    let output: any = await replicate.run(
      "google/nano-banana:1b7b945e8f7edf7a034eba6cb2c20f2ab5dc7d090eea1c616e96da947be76aee",
      {
        input: {
          image: currentImageUrl,
          prompt: editPrompt,
          num_outputs: 1,
        }
      }
    );

    // Handle streaming response
    if (output && typeof output[Symbol.asyncIterator] === 'function') {
      const chunks: Uint8Array[] = [];
      
      for await (const chunk of output) {
        if (chunk instanceof Uint8Array) {
          chunks.push(chunk);
        }
      }
      
      if (chunks.length > 0) {
        const imageBuffer = Buffer.concat(chunks);
        const base64Data = imageBuffer.toString('base64');
        const mimeType = imageBuffer[0] === 0xFF && imageBuffer[1] === 0xD8 ? 'image/jpeg' : 'image/png';
        const dataUrl = `data:${mimeType};base64,${base64Data}`;
        
        logInfo("Image edited successfully");
        return dataUrl;
      }
    }

    // Fallback for URL
    if (typeof output === 'string' && output.startsWith('http')) {
      return output;
    }

    return null;
  } catch (error) {
    logError("Error editing image with Nano Banana", { error });
    return null;
  }
};

/**
 * Generate multiple variations of an image
 * Useful for A/B testing or giving the user options
 */
export const generateImageVariations = async (
  prompt: string,
  count: number = 3
): Promise<string[]> => {
  try {
    const replicate = getReplicateClient();

    let output: any = await replicate.run(
      "google/nano-banana:1b7b945e8f7edf7a034eba6cb2c20f2ab5dc7d090eea1c616e96da947be76aee",
      {
        input: {
          prompt: prompt,
          num_outputs: count,
          aspect_ratio: "16:9",
        }
      }
    );

    // Handle streaming - for multiple outputs, collect all
    if (output && typeof output[Symbol.asyncIterator] === 'function') {
      const results: string[] = [];
      const chunks: Uint8Array[] = [];
      
      for await (const chunk of output) {
        if (chunk instanceof Uint8Array) {
          chunks.push(chunk);
        }
      }
      
      // For now, concatenate all into one image
      // TODO: Handle multiple outputs if needed
      if (chunks.length > 0) {
        const imageBuffer = Buffer.concat(chunks);
        const base64Data = imageBuffer.toString('base64');
        const mimeType = imageBuffer[0] === 0xFF && imageBuffer[1] === 0xD8 ? 'image/jpeg' : 'image/png';
        const dataUrl = `data:${mimeType};base64,${base64Data}`;
        results.push(dataUrl);
      }
      
      return results;
    }

    return [];
  } catch (error) {
    logError("Error generating image variations", { error });
    return [];
  }
};

