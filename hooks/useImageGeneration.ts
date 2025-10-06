"use client";

import { useState, useCallback, useEffect } from "react";
import type { Slide, ClientBrief } from "@/types";
import { imageCacheService } from "@/lib/image-cache-service";
import { trackError, trackMetric, trackEvent } from "@/lib/error-tracker";

interface ImageGenerationState {
  isGenerating: boolean;
  progress: number;
  currentSlide: number | null;
  error: string | null;
  generatedImages: Record<string, string>;
  isOnline: boolean;
}

interface UseImageGenerationResult {
  state: ImageGenerationState;
  generateImage: (slide: Slide, brief: ClientBrief) => Promise<string | null>;
  generateAllImages: (slides: Slide[], brief: ClientBrief) => Promise<void>;
  regenerateImage: (slide: Slide, brief: ClientBrief) => Promise<string | null>;
  editImage: (slideId: string, currentImageUrl: string, editPrompt: string) => Promise<string | null>;
  clearCache: () => Promise<void>;
}

export const useImageGeneration = (): UseImageGenerationResult => {
  const [state, setState] = useState<ImageGenerationState>({
    isGenerating: false,
    progress: 0,
    currentSlide: null,
    error: null,
    generatedImages: {},
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
  });

  // Initialize cache on mount
  useEffect(() => {
    imageCacheService.init();
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setState((prev) => ({
        ...prev,
        isOnline: true,
        error: prev.error?.includes("offline") ? null : prev.error,
      }));
    };

    const handleOffline = () => {
      setState((prev) => ({
        ...prev,
        isOnline: false,
        error: "You're offline. Image generation requires an internet connection.",
      }));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  /**
   * Generate image for a single slide
   */
  const generateImage = useCallback(
    async (slide: Slide, brief: ClientBrief): Promise<string | null> => {
      try {
        // Check online status
        if (!navigator.onLine) {
          setState((prev) => ({
            ...prev,
            error: "You're offline. Image generation requires an internet connection.",
          }));
          return null;
        }

        // Check cache first
        const cached = await imageCacheService.get(slide.id);
        if (cached) {
          setState((prev) => ({
            ...prev,
            generatedImages: { ...prev.generatedImages, [slide.id]: cached },
          }));
          return cached;
        }

        setState((prev) => ({
          ...prev,
          isGenerating: true,
          currentSlide: slide.order,
          error: null,
        }));

        const startTime = performance.now();
        const response = await fetch("/api/images/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slideType: slide.type,
            slideContent: slide.content,
            brief,
            aspectRatio: "16:9",
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to generate image: ${response.statusText}`);
        }

        const data = await response.json();
        const imageUrl = data.imageUrl;

        if (imageUrl) {
          // Track performance
          const duration = performance.now() - startTime;
          trackMetric("image_generation_duration", duration, {
            slideType: slide.type,
            success: true,
          });

          // Track event
          trackEvent("image_generated", {
            slideType: slide.type,
            slideId: slide.id,
          });

          // Cache the generated image
          await imageCacheService.set(slide.id, imageUrl, data.prompt || "");

          setState((prev) => ({
            ...prev,
            isGenerating: false,
            currentSlide: null,
            generatedImages: { ...prev.generatedImages, [slide.id]: imageUrl },
          }));

          return imageUrl;
        }

        throw new Error("No image URL in response");
      } catch (error) {
        // Track error
        trackError(error instanceof Error ? error : new Error("Unknown error"), {
          component: "useImageGeneration",
          action: "generateImage",
          slideId: slide.id,
          slideType: slide.type,
        });

        setState((prev) => ({
          ...prev,
          isGenerating: false,
          currentSlide: null,
          error: error instanceof Error ? error.message : "Unknown error",
        }));
        return null;
      }
    },
    []
  );

  /**
   * Generate images for all slides in presentation
   */
  const generateAllImages = useCallback(
    async (slides: Slide[], brief: ClientBrief): Promise<void> => {
      setState((prev) => ({
        ...prev,
        isGenerating: true,
        progress: 0,
        error: null,
      }));

      const slidesNeedingImages = slides.filter(
        (slide) => slide.type !== "index" && !slide.content.images?.length
      );

      for (let i = 0; i < slidesNeedingImages.length; i++) {
        const slide = slidesNeedingImages[i];

        setState((prev) => ({
          ...prev,
          currentSlide: slide.order,
          progress: Math.round(((i + 1) / slidesNeedingImages.length) * 100),
        }));

        await generateImage(slide, brief);

        // Add delay to avoid rate limits
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      setState((prev) => ({
        ...prev,
        isGenerating: false,
        progress: 100,
        currentSlide: null,
      }));
    },
    [generateImage]
  );

  /**
   * Regenerate image (bypasses cache)
   */
  const regenerateImage = useCallback(
    async (slide: Slide, brief: ClientBrief): Promise<string | null> => {
      // Remove from cache first
      await imageCacheService.remove(slide.id);

      // Generate new image
      return generateImage(slide, brief);
    },
    [generateImage]
  );

  /**
   * Edit existing image with new prompt
   */
  const editImage = useCallback(
    async (
      slideId: string,
      currentImageUrl: string,
      editPrompt: string
    ): Promise<string | null> => {
      try {
        setState((prev) => ({
          ...prev,
          isGenerating: true,
          error: null,
        }));

        const response = await fetch("/api/images/edit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentImageUrl,
            editPrompt,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to edit image: ${response.statusText}`);
        }

        const data = await response.json();
        const imageUrl = data.imageUrl;

        if (imageUrl) {
          // Update cache with edited image
          await imageCacheService.set(slideId, imageUrl, editPrompt);

          setState((prev) => ({
            ...prev,
            isGenerating: false,
            generatedImages: { ...prev.generatedImages, [slideId]: imageUrl },
          }));

          return imageUrl;
        }

        throw new Error("No image URL in response");
      } catch (error) {
        // Track error
        trackError(error instanceof Error ? error : new Error("Unknown error"), {
          component: "useImageGeneration",
          action: "editImage",
          slideId,
        });

        setState((prev) => ({
          ...prev,
          isGenerating: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }));
        return null;
      }
    },
    []
  );

  /**
   * Clear all cached images
   */
  const clearCache = useCallback(async () => {
    await imageCacheService.clear();
    setState((prev) => ({
      ...prev,
      generatedImages: {},
    }));
  }, []);

  return {
    state,
    generateImage,
    generateAllImages,
    regenerateImage,
    editImage,
    clearCache,
  };
};
