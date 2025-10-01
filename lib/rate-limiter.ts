import { RateLimitError } from "@/types/errors";

/**
 * Simple in-memory rate limiter using sliding window algorithm
 * For production, consider using Redis or a dedicated rate limiting service
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RequestRecord {
  timestamps: number[];
  lastCleanup: number;
}

/**
 * In-memory storage for rate limit tracking
 * Note: This will be reset on server restart
 * For production with multiple instances, use Redis
 */
const requestStore = new Map<string, RequestRecord>();

/**
 * Cleanup interval (5 minutes)
 */
const CLEANUP_INTERVAL = 5 * 60 * 1000;

/**
 * Default rate limit configurations
 */
export const RateLimitPresets = {
  /** Very strict: 5 requests per minute */
  STRICT: {
    maxRequests: 5,
    windowMs: 60 * 1000
  },
  
  /** Standard: 10 requests per minute */
  STANDARD: {
    maxRequests: 10,
    windowMs: 60 * 1000
  },
  
  /** Moderate: 30 requests per minute */
  MODERATE: {
    maxRequests: 30,
    windowMs: 60 * 1000
  },
  
  /** Generous: 100 requests per minute */
  GENEROUS: {
    maxRequests: 100,
    windowMs: 60 * 1000
  },
  
  /** Per-hour limit: 500 requests per hour */
  HOURLY: {
    maxRequests: 500,
    windowMs: 60 * 60 * 1000
  }
} as const;

/**
 * Clean up old timestamps from a record
 */
const cleanupRecord = (record: RequestRecord, windowMs: number, now: number): void => {
  const cutoff = now - windowMs;
  record.timestamps = record.timestamps.filter(timestamp => timestamp > cutoff);
  record.lastCleanup = now;
};

/**
 * Periodic cleanup of old records to prevent memory leaks
 */
const scheduleCleanup = (): void => {
  setInterval(() => {
    const now = Date.now();
    const recordsToDelete: string[] = [];
    
    for (const [key, record] of requestStore.entries()) {
      // Remove records that haven't been used in 1 hour
      if (now - record.lastCleanup > 60 * 60 * 1000) {
        recordsToDelete.push(key);
      }
    }
    
    recordsToDelete.forEach(key => requestStore.delete(key));
    
    if (recordsToDelete.length > 0) {
      console.log(`Rate limiter: Cleaned up ${recordsToDelete.length} old records`);
    }
  }, CLEANUP_INTERVAL);
};

// Start cleanup on module load (only in Node.js environment)
if (typeof window === 'undefined') {
  scheduleCleanup();
}

/**
 * Check if a request should be rate limited
 * 
 * @param identifier - Unique identifier (e.g., user ID, IP address, API key)
 * @param config - Rate limit configuration
 * @returns true if request is allowed, false if rate limited
 * 
 * @example
 * ```typescript
 * const allowed = checkRateLimit(userId, RateLimitPresets.STANDARD);
 * if (!allowed) {
 *   throw new RateLimitError('Too many requests');
 * }
 * ```
 */
export const checkRateLimit = (
  identifier: string,
  config: RateLimitConfig = RateLimitPresets.STANDARD
): boolean => {
  const now = Date.now();
  
  // Get or create record
  let record = requestStore.get(identifier);
  if (!record) {
    record = {
      timestamps: [],
      lastCleanup: now
    };
    requestStore.set(identifier, record);
  }
  
  // Cleanup old timestamps
  cleanupRecord(record, config.windowMs, now);
  
  // Check if limit is exceeded
  if (record.timestamps.length >= config.maxRequests) {
    return false;
  }
  
  // Add current timestamp
  record.timestamps.push(now);
  
  return true;
};

/**
 * Check rate limit and throw error if exceeded
 * 
 * @param identifier - Unique identifier
 * @param config - Rate limit configuration
 * @throws RateLimitError if rate limit is exceeded
 * 
 * @example
 * ```typescript
 * await enforceRateLimit(userId, RateLimitPresets.STANDARD);
 * // Proceeds if allowed, throws if rate limited
 * ```
 */
export const enforceRateLimit = (
  identifier: string,
  config: RateLimitConfig = RateLimitPresets.STANDARD
): void => {
  const allowed = checkRateLimit(identifier, config);
  
  if (!allowed) {
    const record = requestStore.get(identifier);
    const oldestTimestamp = record?.timestamps[0] || Date.now();
    const retryAfter = Math.ceil((oldestTimestamp + config.windowMs - Date.now()) / 1000);
    
    throw new RateLimitError(
      `Rate limit exceeded. Maximum ${config.maxRequests} requests per ${config.windowMs / 1000} seconds.`,
      Math.max(retryAfter, 1)
    );
  }
};

/**
 * Get remaining requests for an identifier
 * 
 * @param identifier - Unique identifier
 * @param config - Rate limit configuration
 * @returns Number of remaining requests allowed
 */
export const getRemainingRequests = (
  identifier: string,
  config: RateLimitConfig = RateLimitPresets.STANDARD
): number => {
  const record = requestStore.get(identifier);
  if (!record) {
    return config.maxRequests;
  }
  
  const now = Date.now();
  cleanupRecord(record, config.windowMs, now);
  
  return Math.max(0, config.maxRequests - record.timestamps.length);
};

/**
 * Get time until next request is allowed (in seconds)
 * 
 * @param identifier - Unique identifier
 * @param config - Rate limit configuration
 * @returns Seconds until next request is allowed, or 0 if allowed now
 */
export const getRetryAfter = (
  identifier: string,
  config: RateLimitConfig = RateLimitPresets.STANDARD
): number => {
  const record = requestStore.get(identifier);
  if (!record || record.timestamps.length < config.maxRequests) {
    return 0;
  }
  
  const now = Date.now();
  cleanupRecord(record, config.windowMs, now);
  
  if (record.timestamps.length < config.maxRequests) {
    return 0;
  }
  
  const oldestTimestamp = record.timestamps[0];
  const retryAfter = oldestTimestamp + config.windowMs - now;
  
  return Math.max(0, Math.ceil(retryAfter / 1000));
};

/**
 * Reset rate limit for an identifier (useful for testing or admin overrides)
 * 
 * @param identifier - Unique identifier to reset
 */
export const resetRateLimit = (identifier: string): void => {
  requestStore.delete(identifier);
};

/**
 * Get rate limit status for an identifier
 * 
 * @param identifier - Unique identifier
 * @param config - Rate limit configuration
 * @returns Status object with detailed information
 */
export const getRateLimitStatus = (
  identifier: string,
  config: RateLimitConfig = RateLimitPresets.STANDARD
) => {
  const record = requestStore.get(identifier);
  
  if (!record) {
    return {
      allowed: true,
      remaining: config.maxRequests,
      limit: config.maxRequests,
      retryAfter: 0,
      resetAt: null as Date | null
    };
  }
  
  const now = Date.now();
  cleanupRecord(record, config.windowMs, now);
  
  const remaining = Math.max(0, config.maxRequests - record.timestamps.length);
  const allowed = remaining > 0;
  const retryAfter = allowed ? 0 : getRetryAfter(identifier, config);
  const resetAt = record.timestamps[0] 
    ? new Date(record.timestamps[0] + config.windowMs)
    : null;
  
  return {
    allowed,
    remaining,
    limit: config.maxRequests,
    retryAfter,
    resetAt
  };
};

