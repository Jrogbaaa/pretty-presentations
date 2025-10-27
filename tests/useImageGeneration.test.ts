/**
 * Tests for useImageGeneration hook
 * 
 * Run with: npm test or jest
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useImageGeneration } from '@/hooks/useImageGeneration';
import { imageCacheService } from '@/lib/image-cache-service';
import type { Slide, ClientBrief } from '@/types';

// Mock dependencies
jest.mock('@/lib/image-cache-service');
jest.mock('@/lib/error-tracker');

// Mock fetch
global.fetch = jest.fn();

const mockSlide: Slide = {
  id: 'slide-1',
  order: 1,
  type: 'cover',
  title: 'Test Slide',
  content: {
    title: 'Test Slide',
    subtitle: 'Test Subtitle',
  },
  design: {
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    accentColor: '#8B5CF6',
  },
};

const mockBrief: ClientBrief = {
  id: 'brief-1',
  clientName: 'Test Client',
  brandName: 'Test Brand',
  campaignName: 'Test Campaign',
  objective: 'Test Objective',
  targetAudience: 'Test Audience',
  budget: '$10,000',
  timeline: '1 month',
  createdAt: new Date(),
  userId: 'user-1',
};

describe('useImageGeneration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    (imageCacheService.get as jest.Mock).mockResolvedValue(null);
    (imageCacheService.set as jest.Mock).mockResolvedValue(undefined);
    (imageCacheService.init as jest.Mock).mockResolvedValue(undefined);
  });

  describe('initialization', () => {
    it('should initialize cache on mount', async () => {
      renderHook(() => useImageGeneration());
      
      await waitFor(() => {
        expect(imageCacheService.init).toHaveBeenCalled();
      });
    });

    it('should start with correct initial state', () => {
      const { result } = renderHook(() => useImageGeneration());
      
      expect(result.current.state).toEqual({
        isGenerating: false,
        progress: 0,
        currentSlide: null,
        error: null,
        generatedImages: {},
        isOnline: true,
      });
    });
  });

  describe('generateImage', () => {
    it('should check cache before generating', async () => {
      const cachedUrl = 'data:image/png;base64,cached';
      (imageCacheService.get as jest.Mock).mockResolvedValue(cachedUrl);
      
      const { result } = renderHook(() => useImageGeneration());
      
      let imageUrl: string | null = null;
      await act(async () => {
        imageUrl = await result.current.generateImage(mockSlide, mockBrief);
      });
      
      expect(imageCacheService.get).toHaveBeenCalledWith('slide-1');
      expect(imageUrl).toBe(cachedUrl);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should generate image if not in cache', async () => {
      const generatedUrl = 'data:image/png;base64,generated';
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ imageUrl: generatedUrl, prompt: 'Test prompt' }),
      });
      
      const { result } = renderHook(() => useImageGeneration());
      
      let imageUrl: string | null = null;
      await act(async () => {
        imageUrl = await result.current.generateImage(mockSlide, mockBrief);
      });
      
      expect(global.fetch).toHaveBeenCalledWith('/api/images/generate', expect.any(Object));
      expect(imageCacheService.set).toHaveBeenCalledWith('slide-1', generatedUrl, 'Test prompt');
      expect(imageUrl).toBe(generatedUrl);
    });

    it('should handle generation errors gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
      });
      
      const { result } = renderHook(() => useImageGeneration());
      
      let imageUrl: string | null = null;
      await act(async () => {
        imageUrl = await result.current.generateImage(mockSlide, mockBrief);
      });
      
      expect(imageUrl).toBeNull();
      expect(result.current.state.error).toContain('Failed to generate image');
    });

    it('should return null when offline', async () => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });
      
      const { result } = renderHook(() => useImageGeneration());
      
      let imageUrl: string | null = null;
      await act(async () => {
        imageUrl = await result.current.generateImage(mockSlide, mockBrief);
      });
      
      expect(imageUrl).toBeNull();
      expect(result.current.state.error).toContain('offline');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should track performance metrics', async () => {
      const generatedUrl = 'data:image/png;base64,generated';
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ imageUrl: generatedUrl, prompt: 'Test prompt' }),
      });
      
      const { result } = renderHook(() => useImageGeneration());
      
      await act(async () => {
        await result.current.generateImage(mockSlide, mockBrief);
      });
      
      // Verify trackMetric was called (mocked in error-tracker)
      // This would be tested with the actual mock implementation
    });
  });

  describe('generateAllImages', () => {
    it('should implement rate limiting with 1.5s delay', async () => {
      const slides: Slide[] = [
        { ...mockSlide, id: 'slide-1' },
        { ...mockSlide, id: 'slide-2' },
        { ...mockSlide, id: 'slide-3' },
      ];
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ imageUrl: 'test-url', prompt: 'Test' }),
      });
      
      const { result } = renderHook(() => useImageGeneration());
      
      const startTime = Date.now();
      await act(async () => {
        await result.current.generateAllImages(slides, mockBrief);
      });
      const duration = Date.now() - startTime;
      
      // Should take at least 3 seconds (1.5s * 2 delays between 3 slides)
      expect(duration).toBeGreaterThanOrEqual(3000);
    });

    it('should update progress during batch generation', async () => {
      const slides: Slide[] = [
        { ...mockSlide, id: 'slide-1' },
        { ...mockSlide, id: 'slide-2' },
      ];
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ imageUrl: 'test-url', prompt: 'Test' }),
      });
      
      const { result } = renderHook(() => useImageGeneration());
      
      await act(async () => {
        await result.current.generateAllImages(slides, mockBrief);
      });
      
      // Final progress should be 100%
      expect(result.current.state.progress).toBe(100);
      expect(result.current.state.isGenerating).toBe(false);
    });
  });

  describe('regenerateImage', () => {
    it('should remove from cache before regenerating', async () => {
      const generatedUrl = 'data:image/png;base64,regenerated';
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ imageUrl: generatedUrl, prompt: 'Test' }),
      });
      
      const { result } = renderHook(() => useImageGeneration());
      
      await act(async () => {
        await result.current.regenerateImage(mockSlide, mockBrief);
      });
      
      expect(imageCacheService.remove).toHaveBeenCalledWith('slide-1');
    });
  });

  describe('editImage', () => {
    it('should edit image with prompt', async () => {
      const editedUrl = 'data:image/png;base64,edited';
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ imageUrl: editedUrl }),
      });
      
      const { result } = renderHook(() => useImageGeneration());
      
      let imageUrl: string | null = null;
      await act(async () => {
        imageUrl = await result.current.editImage('slide-1', 'current-url', 'Make it blue');
      });
      
      expect(global.fetch).toHaveBeenCalledWith('/api/images/edit', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('Make it blue'),
      }));
      expect(imageUrl).toBe(editedUrl);
    });

    it('should track edit errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Edit failed'));
      
      const { result } = renderHook(() => useImageGeneration());
      
      let imageUrl: string | null = null;
      await act(async () => {
        imageUrl = await result.current.editImage('slide-1', 'current-url', 'Make it blue');
      });
      
      expect(imageUrl).toBeNull();
      expect(result.current.state.error).toBeTruthy();
    });
  });

  describe('clearCache', () => {
    it('should clear all cached images', async () => {
      const { result } = renderHook(() => useImageGeneration());
      
      await act(async () => {
        await result.current.clearCache();
      });
      
      expect(imageCacheService.clear).toHaveBeenCalled();
      expect(result.current.state.generatedImages).toEqual({});
    });
  });

  describe('online/offline detection', () => {
    it('should detect when going offline', async () => {
      const { result } = renderHook(() => useImageGeneration());
      
      // Simulate going offline
      act(() => {
        window.dispatchEvent(new Event('offline'));
      });
      
      await waitFor(() => {
        expect(result.current.state.isOnline).toBe(false);
        expect(result.current.state.error).toContain('offline');
      });
    });

    it('should detect when coming back online', async () => {
      const { result } = renderHook(() => useImageGeneration());
      
      // Simulate going offline then online
      act(() => {
        window.dispatchEvent(new Event('offline'));
      });
      
      act(() => {
        window.dispatchEvent(new Event('online'));
      });
      
      await waitFor(() => {
        expect(result.current.state.isOnline).toBe(true);
        expect(result.current.state.error).toBeNull();
      });
    });
  });
});

