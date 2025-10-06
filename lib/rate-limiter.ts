/**
 * Rate Limiter
 * Prevents abuse of API endpoints by limiting requests per IP/user
 */

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits = new Map<string, RateLimitEntry>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig = { windowMs: 60000, maxRequests: 10 }) {
    this.config = config;
    
    // Clean up expired entries every minute
    if (typeof setInterval !== "undefined") {
      setInterval(() => this.cleanup(), 60000);
    }
  }

  /**
   * Check if request should be rate limited
   * Returns true if allowed, false if rate limited
   */
  checkLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.limits.get(identifier);

    // No entry or expired - allow and create new entry
    if (!entry || now >= entry.resetTime) {
      this.limits.set(identifier, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });

      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs,
      };
    }

    // Entry exists and not expired
    if (entry.count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    // Increment count
    entry.count++;
    this.limits.set(identifier, entry);

    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now >= entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }

  /**
   * Reset limit for a specific identifier
   */
  reset(identifier: string): void {
    this.limits.delete(identifier);
  }

  /**
   * Clear all limits
   */
  clearAll(): void {
    this.limits.clear();
  }
}

// Preset configurations for common rate limit scenarios
export const RateLimitPresets = {
  // Brief parsing: 20 requests per minute (generous for form submissions)
  briefParsing: { windowMs: 60000, maxRequests: 20 },
  
  // Image generation: 10 requests per minute (expensive operation)
  imageGeneration: { windowMs: 60000, maxRequests: 10 },
  
  // Image editing: 20 requests per minute (less expensive than generation)
  imageEditing: { windowMs: 60000, maxRequests: 20 },
  
  // Presentation generation: 5 requests per minute (very expensive)
  presentationGeneration: { windowMs: 60000, maxRequests: 5 },
  
  // Generic API: 30 requests per minute
  api: { windowMs: 60000, maxRequests: 30 },
};

// Create different rate limiters for different endpoints
export const imageGenerationLimiter = new RateLimiter(RateLimitPresets.imageGeneration);
export const imageEditLimiter = new RateLimiter(RateLimitPresets.imageEditing);
export const briefParsingLimiter = new RateLimiter(RateLimitPresets.briefParsing);

/**
 * Get client identifier from request
 * Uses IP address or user ID if available
 */
export const getClientIdentifier = (request: Request): string => {
  // Try to get IP from headers
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }

  // Fallback to a generic identifier (not ideal for production)
  return "anonymous";
};

/**
 * Enforce rate limit and throw error if exceeded
 * Helper function for server actions that need rate limiting
 */
export const enforceRateLimit = (
  limiter: RateLimiter,
  identifier: string,
  operation: string = "operation"
): void => {
  const result = limiter.checkLimit(identifier);
  
  if (!result.allowed) {
    const resetDate = new Date(result.resetTime);
    throw new Error(
      `Rate limit exceeded for ${operation}. Please try again after ${resetDate.toLocaleTimeString()}.`
    );
  }
};

