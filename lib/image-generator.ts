/**
 * Image Generation & Editing with Gemini
 * Uses Gemini 2.0 Flash Exp for native image generation
 */

import { imageModel } from "./firebase";

export interface ImageGenerationOptions {
  prompt: string;
  aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3";
  style?: "photorealistic" | "artistic" | "minimalist" | "professional" | "vibrant";
}

export interface ImageEditingOptions {
  baseImage: string | Blob; // Base64 or Blob
  prompt: string;
  operation?: "add" | "remove" | "modify" | "style-transfer";
}

/**
 * Generate an image from text prompt
 * Based on: https://ai.google.dev/gemini-api/docs/image-generation
 */
export const generateImage = async (
  options: ImageGenerationOptions
): Promise<Blob | null> => {
  try {
    const { prompt, aspectRatio = "16:9", style = "professional" } = options;

    // Enhance prompt with style and aspect ratio guidance
    const enhancedPrompt = `${prompt}. 
Style: ${style}, high quality, professional.
Aspect ratio: ${aspectRatio}.
Make it suitable for a professional business presentation.`;

    const result = await imageModel.generateContent(enhancedPrompt);
    const response = result.response;

    // Extract image data from response
    const parts = response.candidates?.[0]?.content?.parts || [];
    
    for (const part of parts) {
      if (part.inlineData) {
        // Convert base64 to Blob
        const base64Data = part.inlineData.data;
        const binaryData = atob(base64Data);
        const bytes = new Uint8Array(binaryData.length);
        
        for (let i = 0; i < binaryData.length; i++) {
          bytes[i] = binaryData.charCodeAt(i);
        }
        
        return new Blob([bytes], { type: part.inlineData.mimeType || "image/png" });
      }
    }

    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};

/**
 * Edit an existing image with text instructions
 */
export const editImage = async (
  options: ImageEditingOptions
): Promise<Blob | null> => {
  try {
    const { baseImage, prompt, operation = "modify" } = options;

    // Convert image to base64 if it's a Blob
    let base64Image: string;
    
    if (baseImage instanceof Blob) {
      base64Image = await blobToBase64(baseImage);
    } else {
      base64Image = baseImage;
    }

    // Create multimodal prompt with image and instructions
    const enhancedPrompt = `${getOperationPrompt(operation)} ${prompt}`;

    const result = await imageModel.generateContent([
      {
        inlineData: {
          mimeType: "image/png",
          data: base64Image.replace(/^data:image\/\w+;base64,/, ""),
        },
      },
      { text: enhancedPrompt },
    ]);

    const response = result.response;
    const parts = response.candidates?.[0]?.content?.parts || [];
    
    for (const part of parts) {
      if (part.inlineData) {
        const base64Data = part.inlineData.data;
        const binaryData = atob(base64Data);
        const bytes = new Uint8Array(binaryData.length);
        
        for (let i = 0; i < binaryData.length; i++) {
          bytes[i] = binaryData.charCodeAt(i);
        }
        
        return new Blob([bytes], { type: part.inlineData.mimeType || "image/png" });
      }
    }

    return null;
  } catch (error) {
    console.error("Error editing image:", error);
    return null;
  }
};

/**
 * Generate a custom slide background
 */
export const generateSlideBackground = async (
  theme: string,
  colors: string[]
): Promise<Blob | null> => {
  const prompt = `Create a professional presentation slide background.
Theme: ${theme}
Colors: ${colors.join(", ")}
Style: Clean, modern, minimal, suitable for business presentations.
Requirements:
- Abstract geometric patterns
- Gradient overlay
- Professional and elegant
- 16:9 aspect ratio
- Leave center area clear for text content`;

  return generateImage({
    prompt,
    aspectRatio: "16:9",
    style: "professional",
  });
};

/**
 * Generate brand logo or icon
 */
export const generateBrandGraphic = async (
  description: string,
  style: "modern" | "classic" | "minimal" | "bold" = "modern"
): Promise<Blob | null> => {
  const prompt = `Create a professional ${style} brand graphic.
Description: ${description}
Style: Clean, scalable, suitable for business use.
Requirements:
- Vector-style appearance
- Clear and recognizable
- Professional quality
- Transparent or white background
- 1:1 aspect ratio`;

  return generateImage({
    prompt,
    aspectRatio: "1:1",
    style: "professional",
  });
};

// Helper functions

const getOperationPrompt = (operation: string): string => {
  const prompts = {
    add: "Add the following elements to this image:",
    remove: "Remove the following elements from this image:",
    modify: "Modify this image as follows:",
    "style-transfer": "Apply the following style to this image:",
  };
  
  return prompts[operation as keyof typeof prompts] || prompts.modify;
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Save generated image to Firebase Storage
 */
export const saveGeneratedImage = async (
  imageBlob: Blob,
  path: string
): Promise<string> => {
  const { storage } = await import("./firebase");
  const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");

  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, imageBlob);
  return getDownloadURL(storageRef);
};

/**
 * Generate and save a presentation background
 */
export const generateAndSaveBackground = async (
  presentationId: string,
  theme: string,
  colors: string[]
): Promise<string | null> => {
  const imageBlob = await generateSlideBackground(theme, colors);
  
  if (!imageBlob) {
    return null;
  }

  const path = `presentations/${presentationId}/backgrounds/${Date.now()}.png`;
  return saveGeneratedImage(imageBlob, path);
};
