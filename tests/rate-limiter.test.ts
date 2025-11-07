/**
 * Rate Limiter Unit Tests
 * Tests for the RateLimiter class to ensure proper rate limiting behavior
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RateLimiter, RateLimitPresets } from '@/lib/rate-limiter';

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter({
      windowMs: 60000, // 1 minute
      maxRequests: 5
    });
  });

  describe('checkLimit', () => {
    it('should allow requests within limit', () => {
      const result1 = limiter.checkLimit('user1');
      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(4);

      const result2 = limiter.checkLimit('user1');
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(3);
    });

    it('should block requests after limit is reached', () => {
      // Make 5 requests (the limit)
      for (let i = 0; i < 5; i++) {
        const result = limiter.checkLimit('user1');
        expect(result.allowed).toBe(true);
      }

      // 6th request should be blocked
      const blockedResult = limiter.checkLimit('user1');
      expect(blockedResult.allowed).toBe(false);
      expect(blockedResult.remaining).toBe(0);
    });

    it('should track different identifiers separately', () => {
      // User 1 makes 5 requests
      for (let i = 0; i < 5; i++) {
        limiter.checkLimit('user1');
      }

      // User 1 should be blocked
      const user1Result = limiter.checkLimit('user1');
      expect(user1Result.allowed).toBe(false);

      // User 2 should still be allowed
      const user2Result = limiter.checkLimit('user2');
      expect(user2Result.allowed).toBe(true);
      expect(user2Result.remaining).toBe(4);
    });

    it('should reset after time window expires', () => {
      vi.useFakeTimers();
      
      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        limiter.checkLimit('user1');
      }

      // Should be blocked
      expect(limiter.checkLimit('user1').allowed).toBe(false);

      // Advance time by 61 seconds (past the window)
      vi.advanceTimersByTime(61000);

      // Should be allowed again
      const result = limiter.checkLimit('user1');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);

      vi.useRealTimers();
    });

    it('should return correct resetTime', () => {
      const beforeTime = Date.now();
      const result = limiter.checkLimit('user1');
      const afterTime = Date.now();

      expect(result.resetTime).toBeGreaterThanOrEqual(beforeTime + 60000);
      expect(result.resetTime).toBeLessThanOrEqual(afterTime + 60000);
    });
  });

  describe('reset', () => {
    it('should reset limit for specific identifier', () => {
      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        limiter.checkLimit('user1');
      }

      // Should be blocked
      expect(limiter.checkLimit('user1').allowed).toBe(false);

      // Reset
      limiter.reset('user1');

      // Should be allowed again
      const result = limiter.checkLimit('user1');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('should only reset specified identifier', () => {
      // Both users make requests
      limiter.checkLimit('user1');
      limiter.checkLimit('user2');

      // Reset only user1
      limiter.reset('user1');

      // User1 should have full limit
      const user1Result = limiter.checkLimit('user1');
      expect(user1Result.remaining).toBe(4);

      // User2 should have 3 remaining (already made 1)
      const user2Result = limiter.checkLimit('user2');
      expect(user2Result.remaining).toBe(3);
    });
  });

  describe('clearAll', () => {
    it('should clear all limits', () => {
      // Multiple users make requests
      limiter.checkLimit('user1');
      limiter.checkLimit('user2');
      limiter.checkLimit('user3');

      // Clear all
      limiter.clearAll();

      // All users should have full limit
      expect(limiter.checkLimit('user1').remaining).toBe(4);
      expect(limiter.checkLimit('user2').remaining).toBe(4);
      expect(limiter.checkLimit('user3').remaining).toBe(4);
    });
  });

  describe('RateLimitPresets', () => {
    it('should have correct configuration for text response', () => {
      const textLimiter = new RateLimiter(RateLimitPresets.presentationGeneration);
      
      // Should allow 5 requests
      for (let i = 0; i < 5; i++) {
        const result = textLimiter.checkLimit('user1');
        expect(result.allowed).toBe(true);
      }

      // 6th should be blocked
      const blockedResult = textLimiter.checkLimit('user1');
      expect(blockedResult.allowed).toBe(false);
    });

    it('should have correct configuration for image generation', () => {
      const imageLimiter = new RateLimiter(RateLimitPresets.imageGeneration);
      
      // Should allow 10 requests
      for (let i = 0; i < 10; i++) {
        const result = imageLimiter.checkLimit('user1');
        expect(result.allowed).toBe(true);
      }

      // 11th should be blocked
      const blockedResult = imageLimiter.checkLimit('user1');
      expect(blockedResult.allowed).toBe(false);
    });
  });

  describe('cleanup', () => {
    it('should remove expired entries', () => {
      vi.useFakeTimers();
      
      // Make requests
      limiter.checkLimit('user1');
      limiter.checkLimit('user2');

      // Advance time by 61 seconds (past the window)
      vi.advanceTimersByTime(61000);

      // Trigger cleanup by making a new request after expiry
      limiter.checkLimit('user3');

      // Both old users should have fresh limits (cleanup happened)
      const user1Result = limiter.checkLimit('user1');
      const user2Result = limiter.checkLimit('user2');

      expect(user1Result.remaining).toBe(4); // Fresh limit
      expect(user2Result.remaining).toBe(4); // Fresh limit

      vi.useRealTimers();
    });
  });

  describe('edge cases', () => {
    it('should handle maxRequests of 1', () => {
      const strictLimiter = new RateLimiter({
        windowMs: 60000,
        maxRequests: 1
      });

      // First request allowed
      const result1 = strictLimiter.checkLimit('user1');
      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(0);

      // Second request blocked
      const result2 = strictLimiter.checkLimit('user1');
      expect(result2.allowed).toBe(false);
    });

    it('should handle very short time windows', () => {
      vi.useFakeTimers();
      
      const shortLimiter = new RateLimiter({
        windowMs: 1000, // 1 second
        maxRequests: 3
      });

      // Make 3 requests
      for (let i = 0; i < 3; i++) {
        shortLimiter.checkLimit('user1');
      }

      // Should be blocked
      expect(shortLimiter.checkLimit('user1').allowed).toBe(false);

      // Advance 1.1 seconds
      vi.advanceTimersByTime(1100);

      // Should be allowed again
      expect(shortLimiter.checkLimit('user1').allowed).toBe(true);

      vi.useRealTimers();
    });

    it('should handle empty identifier', () => {
      const result = limiter.checkLimit('');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });
  });
});

