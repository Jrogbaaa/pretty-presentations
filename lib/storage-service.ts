/**
 * Firebase Storage Service
 * Handles uploading images to Firebase Storage
 */

import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { logInfo, logError } from './logger';

/**
 * Upload a base64 image to Firebase Storage
 * @param base64Data - Base64 data URL (data:image/png;base64,...)
 * @param path - Storage path (e.g., "presentations/123/slide-1.png")
 * @returns Public download URL
 */
export const uploadBase64Image = async (
  base64Data: string,
  path: string
): Promise<string> => {
  try {
    // Extract the base64 content and mime type
    const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      throw new Error('Invalid base64 data URL format');
    }

    const mimeType = matches[1];
    const base64Content = matches[2];

    // Convert base64 to Uint8Array
    const binaryString = atob(base64Content);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create storage reference
    const storageRef = ref(storage, path);

    // Upload with metadata
    const metadata = {
      contentType: mimeType,
      cacheControl: 'public, max-age=31536000', // Cache for 1 year
    };

    await uploadBytes(storageRef, bytes, metadata);

    // Get public download URL
    const downloadURL = await getDownloadURL(storageRef);

    logInfo('Image uploaded to Firebase Storage', {
      path,
      size: bytes.length,
      mimeType,
    });

    return downloadURL;
  } catch (error) {
    logError('Failed to upload image to Firebase Storage', { error, path });
    throw error;
  }
};

/**
 * Upload multiple base64 images in parallel
 * @param images - Array of base64 data URLs
 * @param basePath - Base storage path (e.g., "presentations/123")
 * @returns Array of public download URLs
 */
export const uploadImages = async (
  images: string[],
  basePath: string
): Promise<string[]> => {
  const uploadPromises = images.map((image, index) => {
    const extension = image.startsWith('data:image/jpeg') ? 'jpg' : 'png';
    const path = `${basePath}/image-${index}.${extension}`;
    return uploadBase64Image(image, path);
  });

  return Promise.all(uploadPromises);
};

/**
 * Upload all slide images for a presentation
 * Converts base64 data URLs to Firebase Storage URLs
 * @param slides - Array of slides with base64 images
 * @param presentationId - Presentation ID for storage path
 * @returns Updated slides with Storage URLs instead of base64
 */
export const uploadSlideImages = async (
  slides: any[],
  presentationId: string
): Promise<any[]> => {
  const startTime = Date.now();
  let uploadedCount = 0;

  logInfo('Starting slide image upload to Storage', {
    presentationId,
    totalSlides: slides.length,
  });

  const updatedSlides = await Promise.all(
    slides.map(async (slide, slideIndex) => {
      if (!slide.content?.images || slide.content.images.length === 0) {
        return slide;
      }

      try {
        // Upload all images for this slide
        const imageUrls = await Promise.all(
          slide.content.images.map(async (imageData: string, imgIndex: number) => {
            // Skip if already a URL (not base64)
            if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
              return imageData;
            }

            const extension = imageData.startsWith('data:image/jpeg') ? 'jpg' : 'png';
            const path = `presentations/${presentationId}/slide-${slideIndex}-img-${imgIndex}.${extension}`;
            
            const url = await uploadBase64Image(imageData, path);
            uploadedCount++;
            return url;
          })
        );

        return {
          ...slide,
          content: {
            ...slide.content,
            images: imageUrls,
          },
        };
      } catch (error) {
        logError('Failed to upload images for slide', {
          error,
          slideIndex,
          slideType: slide.type,
        });
        // Return slide without images if upload fails
        return {
          ...slide,
          content: {
            ...slide.content,
            images: [],
          },
        };
      }
    })
  );

  const duration = Date.now() - startTime;
  logInfo('Slide image upload complete', {
    presentationId,
    uploadedCount,
    duration,
  });

  return updatedSlides;
};

