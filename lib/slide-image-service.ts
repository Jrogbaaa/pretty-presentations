/**
 * Slide Image Service
 * Generates appropriate images for each slide type using Gemini Native Image Generation
 * https://ai.google.dev/gemini-api/docs/image-generation
 */

import type { Slide, ClientBrief } from "@/types";
import { imageModel } from "./firebase";
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
 * Generate an image for a specific slide
 */
export const generateSlideImage = async (
  options: SlideImageOptions
): Promise<string | null> => {
  try {
    const { slideType, slideContent, brief, aspectRatio = "16:9" } = options;

    // Create prompt based on slide type
    const prompt = createPromptForSlide(slideType, slideContent, brief);

    logInfo("Generating image for slide", {
      slideType,
      prompt: prompt.substring(0, 100) + "...",
    });

    // Include aspect ratio in the prompt since config option isn't available in current API
    const fullPrompt = aspectRatio !== "16:9" 
      ? `${prompt}\n\nAspect ratio: ${aspectRatio}` 
      : prompt;

    const result = await imageModel.generateContent(fullPrompt);

    const response = result.response;
    const parts = response.candidates?.[0]?.content?.parts || [];

    // Find image in response
    for (const part of parts) {
      if (part.inlineData) {
        // Convert to base64 data URL for easy use in img tags
        const base64Data = part.inlineData.data;
        const mimeType = part.inlineData.mimeType || "image/png";
        const dataUrl = `data:${mimeType};base64,${base64Data}`;

        logInfo("Image generated successfully", { slideType });
        return dataUrl;
      }
    }

    logError("No image data in response", { slideType });
    return null;
  } catch (error) {
    logError("Error generating slide image", { error, slideType: options.slideType });
    return null;
  }
};

/**
 * Generate images for all slides in a presentation
 */
export const generateImagesForSlides = async (
  slides: Slide[],
  brief: ClientBrief
): Promise<Slide[]> => {
  logInfo("Starting image generation for all slides", { count: slides.length });

  const updatedSlides = [...slides];

  for (let i = 0; i < updatedSlides.length; i++) {
    const slide = updatedSlides[i];

    // Skip slides that shouldn't have images
    if (shouldSkipImage(slide.type)) {
      continue;
    }

    try {
      const imageUrl = await generateSlideImage({
        slideType: slide.type,
        slideContent: slide.content,
        brief,
        aspectRatio: "16:9",
      });

      if (imageUrl) {
        // Add image to slide content
        updatedSlides[i] = {
          ...slide,
          content: {
            ...slide.content,
            images: [imageUrl],
          },
        };

        logInfo(`Image added to slide ${i + 1}/${slides.length}`, {
          type: slide.type,
        });
      }
    } catch (error) {
      logError(`Failed to generate image for slide ${i + 1}`, {
        error,
        type: slide.type,
      });
      // Continue with other slides even if one fails
    }

    // Add small delay to avoid rate limits
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  logInfo("Image generation complete", {
    total: slides.length,
    withImages: updatedSlides.filter((s) => s.content.images?.length).length,
  });

  return updatedSlides;
};

/**
 * Create appropriate prompt for each slide type
 */
const createPromptForSlide = (
  slideType: string,
  content: SlideImageOptions["slideContent"],
  brief: ClientBrief
): string => {
  const brandName = brief.clientName;
  const themes = brief.contentThemes.join(", ");
  const platforms = brief.platformPreferences.join(", ");

  switch (slideType) {
    case "cover":
      return `Create a professional, eye-catching presentation cover image for ${brandName}. 
Style: Modern, corporate, premium quality. 
Theme: ${themes}
Colors: Use brand-appropriate gradients (blues, purples, or based on ${themes}).
Requirements:
- Clean, minimalist design
- Abstract geometric patterns
- Suitable for business presentation
- 16:9 aspect ratio
- Professional photography style
- No text or logos (will be added separately)`;

    case "objective":
      return `Create a professional business strategy image representing campaign objectives.
Theme: Achievement, goals, business success
Style: Corporate, professional, modern
Elements: Abstract representation of business goals, upward growth, success metrics
Colors: Professional blues, greens, or warm neutrals
Requirements:
- Clean and minimal
- Suitable for corporate presentation
- No text
- Professional photography or abstract geometric style`;

    case "target-strategy":
      return `Create an image representing target audience and demographics.
Audience: ${brief.targetDemographics.ageRange}, ${brief.targetDemographics.gender}
Interests: ${brief.targetDemographics.interests.join(", ")}
Style: Diverse, inclusive, professional
Elements: People, community, connection, diversity
Requirements:
- Diverse representation
- Professional setting
- Modern lifestyle photography
- Warm, inviting colors
- No text`;

    case "creative-strategy":
      return `Create a creative workspace or content creation image.
Theme: ${themes}
Style: Creative, modern, inspiring
Elements: Content creation, creativity, innovation, digital media
Colors: Vibrant but professional
Requirements:
- Creative workspace aesthetics
- Modern content creation tools
- Professional photography
- Inspiring and dynamic
- No text`;

    case "talent-strategy":
      return `Create an image representing social media and influencer marketing.
Platforms: ${platforms}
Style: Modern, social media aesthetic, engaging
Elements: Social media, content creation, digital influence, engagement
Colors: Platform-inspired (Instagram gradients, TikTok vibes)
Requirements:
- Modern social media aesthetic
- Professional but approachable
- Dynamic and engaging
- No specific people or branded elements
- No text`;

    case "media-strategy":
      return `Create an image representing digital media and social platforms.
Platforms: ${platforms}
Style: Tech-forward, digital, modern
Elements: Digital communication, social networks, media channels
Colors: Tech-inspired gradients, modern palette
Requirements:
- Digital and tech-focused
- Clean and professional
- Abstract representation of connectivity
- No logos or branded elements
- No text`;

    case "brief-summary":
      return `Create a professional image for campaign brief overview.
Brand: ${brandName}
Budget: €${brief.budget.toLocaleString()}
Style: Corporate, summary, organized
Elements: Organization, planning, strategy documents
Colors: Professional and clean
Requirements:
- Business professional
- Clean and organized aesthetic
- Modern office or planning visuals
- No text`;

    case "next-steps":
      return `Create an image representing forward momentum and next steps.
Style: Future-focused, actionable, positive
Elements: Road ahead, journey, progress, action items
Colors: Hopeful, forward-looking (blues, greens)
Requirements:
- Inspiring and actionable
- Professional
- Clear path or progression visual
- No text`;

    default:
      return `Create a clean, professional business presentation background.
Style: Minimal, corporate, modern
Colors: Neutral with subtle accent colors
Requirements:
- Clean and unobtrusive
- Suitable for business content
- Abstract geometric patterns
- Professional grade
- No text`;
  }
};

/**
 * Determine if a slide type should skip image generation
 */
const shouldSkipImage = (slideType: string): boolean => {
  // Index slides typically don't need images
  return slideType === "index";
};

/**
 * Edit an existing slide image using Gemini's editing capabilities
 * (For future Nano Banana side panel)
 */
export const editSlideImage = async (
  currentImageUrl: string,
  editPrompt: string
): Promise<string | null> => {
  try {
    // Convert data URL to base64
    const base64Data = currentImageUrl.replace(
      /^data:image\/\w+;base64,/,
      ""
    );

    const result = await imageModel.generateContent([
      {
        inlineData: {
          mimeType: "image/png",
          data: base64Data,
        },
      },
      editPrompt,
    ]);

    const response = result.response;
    const parts = response.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
      if (part.inlineData) {
        const mimeType = part.inlineData.mimeType || "image/png";
        return `data:${mimeType};base64,${part.inlineData.data}`;
      }
    }

    return null;
  } catch (error) {
    logError("Error editing slide image", { error });
    return null;
  }
};

