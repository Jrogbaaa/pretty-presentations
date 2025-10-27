/**
 * Tests for Image Generation API Endpoints
 * 
 * Run with: npm test or jest
 */

import { NextRequest } from 'next/server';
import { POST as generatePost } from '@/app/api/images/generate/route';
import { POST as editPost } from '@/app/api/images/edit/route';

// Mock dependencies
jest.mock('@/lib/replicate-image-service');
jest.mock('@/lib/rate-limiter');

import { generateSlideImage, editSlideImage } from '@/lib/replicate-image-service';
import { imageGenerationLimiter, imageEditLimiter, getClientIdentifier } from '@/lib/rate-limiter';

describe('POST /api/images/generate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default: allow requests
    (imageGenerationLimiter.checkLimit as jest.Mock).mockReturnValue({
      allowed: true,
      remaining: 9,
      resetTime: Date.now() + 60000,
    });
    
    (getClientIdentifier as jest.Mock).mockReturnValue('test-client-ip');
  });

  it('should return 400 if required fields are missing', async () => {
    const request = new NextRequest('http://localhost/api/images/generate', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await generatePost(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeTruthy();
  });

  it('should validate request with Zod schema', async () => {
    const invalidData = {
      slideType: '', // Invalid: empty string
      slideContent: {},
      brief: {}, // Invalid: missing required fields
    };

    const request = new NextRequest('http://localhost/api/images/generate', {
      method: 'POST',
      body: JSON.stringify(invalidData),
    });

    const response = await generatePost(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Invalid request data');
    expect(data.details).toBeDefined();
  });

  it('should generate image successfully', async () => {
    const mockImageUrl = 'data:image/png;base64,generated';
    (generateSlideImage as jest.Mock).mockResolvedValue(mockImageUrl);

    const validData = {
      slideType: 'cover',
      slideContent: {
        title: 'Test Slide',
        subtitle: 'Test Subtitle',
      },
      brief: {
        clientName: 'Test Client',
        brandName: 'Test Brand',
        campaignName: 'Test Campaign',
      },
      aspectRatio: '16:9',
    };

    const request = new NextRequest('http://localhost/api/images/generate', {
      method: 'POST',
      body: JSON.stringify(validData),
    });

    const response = await generatePost(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.imageUrl).toBe(mockImageUrl);
    expect(data.prompt).toBeTruthy();
    expect(generateSlideImage).toHaveBeenCalledWith(expect.objectContaining({
      slideType: 'cover',
      aspectRatio: '16:9',
    }));
  });

  it('should return 429 when rate limited', async () => {
    (imageGenerationLimiter.checkLimit as jest.Mock).mockReturnValue({
      allowed: false,
      remaining: 0,
      resetTime: Date.now() + 30000,
    });

    const validData = {
      slideType: 'cover',
      slideContent: { title: 'Test' },
      brief: {
        clientName: 'Test',
        brandName: 'Test',
        campaignName: 'Test',
      },
    };

    const request = new NextRequest('http://localhost/api/images/generate', {
      method: 'POST',
      body: JSON.stringify(validData),
    });

    const response = await generatePost(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toContain('Rate limit exceeded');
    expect(response.headers.get('X-RateLimit-Limit')).toBe('10');
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
  });

  it('should return 500 if image generation fails', async () => {
    (generateSlideImage as jest.Mock).mockResolvedValue(null);

    const validData = {
      slideType: 'cover',
      slideContent: { title: 'Test' },
      brief: {
        clientName: 'Test',
        brandName: 'Test',
        campaignName: 'Test',
      },
    };

    const request = new NextRequest('http://localhost/api/images/generate', {
      method: 'POST',
      body: JSON.stringify(validData),
    });

    const response = await generatePost(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBeTruthy();
  });

  it('should handle errors gracefully', async () => {
    (generateSlideImage as jest.Mock).mockRejectedValue(new Error('Replicate API error'));

    const validData = {
      slideType: 'cover',
      slideContent: { title: 'Test' },
      brief: {
        clientName: 'Test',
        brandName: 'Test',
        campaignName: 'Test',
      },
    };

    const request = new NextRequest('http://localhost/api/images/generate', {
      method: 'POST',
      body: JSON.stringify(validData),
    });

    const response = await generatePost(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBeTruthy();
  });

  it('should include rate limit headers in success response', async () => {
    const mockImageUrl = 'data:image/png;base64,generated';
    (generateSlideImage as jest.Mock).mockResolvedValue(mockImageUrl);

    const validData = {
      slideType: 'cover',
      slideContent: { title: 'Test' },
      brief: {
        clientName: 'Test',
        brandName: 'Test',
        campaignName: 'Test',
      },
    };

    const request = new NextRequest('http://localhost/api/images/generate', {
      method: 'POST',
      body: JSON.stringify(validData),
    });

    const response = await generatePost(request);

    expect(response.headers.get('X-RateLimit-Limit')).toBe('10');
    expect(response.headers.get('X-RateLimit-Remaining')).toBeTruthy();
  });
});

describe('POST /api/images/edit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default: allow requests
    (imageEditLimiter.checkLimit as jest.Mock).mockReturnValue({
      allowed: true,
      remaining: 19,
      resetTime: Date.now() + 60000,
    });
    
    (getClientIdentifier as jest.Mock).mockReturnValue('test-client-ip');
  });

  it('should return 400 if required fields are missing', async () => {
    const request = new NextRequest('http://localhost/api/images/edit', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await editPost(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeTruthy();
  });

  it('should validate edit prompt length', async () => {
    const tooLongPrompt = 'a'.repeat(501); // Over 500 chars
    const invalidData = {
      currentImageUrl: 'http://example.com/image.png',
      editPrompt: tooLongPrompt,
    };

    const request = new NextRequest('http://localhost/api/images/edit', {
      method: 'POST',
      body: JSON.stringify(invalidData),
    });

    const response = await editPost(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Invalid request data');
  });

  it('should edit image successfully', async () => {
    const mockEditedUrl = 'data:image/png;base64,edited';
    (editSlideImage as jest.Mock).mockResolvedValue(mockEditedUrl);

    const validData = {
      currentImageUrl: 'data:image/png;base64,current',
      editPrompt: 'Make it more vibrant',
    };

    const request = new NextRequest('http://localhost/api/images/edit', {
      method: 'POST',
      body: JSON.stringify(validData),
    });

    const response = await editPost(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.imageUrl).toBe(mockEditedUrl);
    expect(editSlideImage).toHaveBeenCalledWith(validData.currentImageUrl, validData.editPrompt);
  });

  it('should return 429 when rate limited', async () => {
    (imageEditLimiter.checkLimit as jest.Mock).mockReturnValue({
      allowed: false,
      remaining: 0,
      resetTime: Date.now() + 30000,
    });

    const validData = {
      currentImageUrl: 'data:image/png;base64,current',
      editPrompt: 'Make it blue',
    };

    const request = new NextRequest('http://localhost/api/images/edit', {
      method: 'POST',
      body: JSON.stringify(validData),
    });

    const response = await editPost(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toContain('Rate limit exceeded');
    expect(response.headers.get('X-RateLimit-Limit')).toBe('20');
  });

  it('should return 500 if edit fails', async () => {
    (editSlideImage as jest.Mock).mockResolvedValue(null);

    const validData = {
      currentImageUrl: 'data:image/png;base64,current',
      editPrompt: 'Make it red',
    };

    const request = new NextRequest('http://localhost/api/images/edit', {
      method: 'POST',
      body: JSON.stringify(validData),
    });

    const response = await editPost(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBeTruthy();
  });

  it('should include rate limit headers', async () => {
    const mockEditedUrl = 'data:image/png;base64,edited';
    (editSlideImage as jest.Mock).mockResolvedValue(mockEditedUrl);

    const validData = {
      currentImageUrl: 'data:image/png;base64,current',
      editPrompt: 'Make it colorful',
    };

    const request = new NextRequest('http://localhost/api/images/edit', {
      method: 'POST',
      body: JSON.stringify(validData),
    });

    const response = await editPost(request);

    expect(response.headers.get('X-RateLimit-Limit')).toBe('20');
    expect(response.headers.get('X-RateLimit-Remaining')).toBeTruthy();
  });
});

