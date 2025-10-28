import { createHash } from 'crypto';

/**
 * Simple in-memory cache with LRU eviction
 * For production with multiple instances, use Redis or Memcached
 */

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  hits: number;
}

interface CacheOptions {
  maxSize?: number;
  ttlMs?: number;
  enableLogging?: boolean;
}

const DEFAULT_OPTIONS = {
  maxSize: 100,
  ttlMs: 60 * 60 * 1000, // 1 hour
  enableLogging: false
};

/**
 * Generic cache class with LRU eviction
 */
class Cache<T> {
  private store: Map<string, CacheEntry<T>>;
  private options: Required<CacheOptions>;
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    evictions: 0
  };

  constructor(options: CacheOptions = {}) {
    this.store = new Map();
    this.options = { ...DEFAULT_OPTIONS, ...options };
    
    // Periodic cleanup of expired entries
    if (typeof window === 'undefined') {
      this.scheduleCleanup();
    }
  }

  /**
   * Generate a cache key from any input
   */
  private generateKey(input: unknown): string {
    const str = typeof input === 'string' ? input : JSON.stringify(input);
    return createHash('sha256').update(str).digest('hex');
  }

  /**
   * Check if an entry is expired
   */
  private isExpired(entry: CacheEntry<T>): boolean {
    const age = Date.now() - entry.timestamp;
    return age > this.options.ttlMs;
  }

  /**
   * Evict least recently used entry if cache is full
   */
  private evictLRU(): void {
    if (this.store.size < this.options.maxSize) {
      return;
    }

    let lruKey: string | null = null;
    let lruTimestamp = Infinity;

    for (const [key, entry] of this.store.entries()) {
      if (entry.timestamp < lruTimestamp) {
        lruTimestamp = entry.timestamp;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.store.delete(lruKey);
      this.stats.evictions++;
      
      if (this.options.enableLogging) {
        console.log(`Cache: Evicted LRU entry (key: ${lruKey.substring(0, 8)}...)`);
      }
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.store.entries()) {
      if (this.isExpired(entry)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.store.delete(key));

    if (keysToDelete.length > 0 && this.options.enableLogging) {
      console.log(`Cache: Cleaned up ${keysToDelete.length} expired entries`);
    }
  }

  /**
   * Schedule periodic cleanup
   */
  private scheduleCleanup(): void {
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Get a value from cache
   */
  get(key: string | unknown): T | undefined {
    const cacheKey = typeof key === 'string' ? key : this.generateKey(key);
    const entry = this.store.get(cacheKey);

    if (!entry) {
      this.stats.misses++;
      return undefined;
    }

    if (this.isExpired(entry)) {
      this.store.delete(cacheKey);
      this.stats.misses++;
      return undefined;
    }

    // Update access time and hit count
    entry.timestamp = Date.now();
    entry.hits++;
    this.stats.hits++;

    if (this.options.enableLogging) {
      console.log(`Cache HIT: ${cacheKey.substring(0, 8)}... (${entry.hits} hits)`);
    }

    return entry.value;
  }

  /**
   * Set a value in cache
   */
  set(key: string | unknown, value: T): void {
    const cacheKey = typeof key === 'string' ? key : this.generateKey(key);
    
    // Evict LRU if necessary
    this.evictLRU();

    this.store.set(cacheKey, {
      value,
      timestamp: Date.now(),
      hits: 0
    });

    this.stats.sets++;

    if (this.options.enableLogging) {
      console.log(`Cache SET: ${cacheKey.substring(0, 8)}... (size: ${this.store.size})`);
    }
  }

  /**
   * Check if a key exists in cache (without updating access time)
   */
  has(key: string | unknown): boolean {
    const cacheKey = typeof key === 'string' ? key : this.generateKey(key);
    const entry = this.store.get(cacheKey);
    
    if (!entry) {
      return false;
    }

    if (this.isExpired(entry)) {
      this.store.delete(cacheKey);
      return false;
    }

    return true;
  }

  /**
   * Delete a specific key from cache
   */
  delete(key: string | unknown): boolean {
    const cacheKey = typeof key === 'string' ? key : this.generateKey(key);
    return this.store.delete(cacheKey);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.store.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0
    };
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0
      ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100
      : 0;

    return {
      size: this.store.size,
      maxSize: this.options.maxSize,
      ...this.stats,
      hitRate: hitRate.toFixed(2) + '%'
    };
  }

  /**
   * Get or set a value (with lazy computation)
   */
  async getOrSet(key: string | unknown, factory: () => Promise<T>): Promise<T> {
    const cached = this.get(key);
    
    if (cached !== undefined) {
      return cached;
    }

    const value = await factory();
    this.set(key, value);
    
    return value;
  }
}

/**
 * Create a cache instance with type safety
 */
export const createCache = <T>(options?: CacheOptions): Cache<T> => {
  return new Cache<T>(options);
};

// Pre-configured cache instances for different use cases

/**
 * Cache for AI brief parsing results
 * TTL: 1 hour, Max size: 50 entries
 */
export const briefCache = createCache<Record<string, unknown>>({
  maxSize: 50,
  ttlMs: 60 * 60 * 1000,
  enableLogging: process.env.NODE_ENV === 'development'
});

/**
 * Cache for AI presentation content generation
 * TTL: 30 minutes, Max size: 100 entries
 */
export const contentCache = createCache<Record<string, unknown>>({
  maxSize: 100,
  ttlMs: 30 * 60 * 1000,
  enableLogging: process.env.NODE_ENV === 'development'
});

/**
 * Cache for influencer data
 * TTL: 1 hour, Max size: 200 entries
 */
export const influencerCache = createCache<Record<string, unknown>>({
  maxSize: 200,
  ttlMs: 60 * 60 * 1000,
  enableLogging: process.env.NODE_ENV === 'development'
});

/**
 * Generate a stable cache key from a brief text
 */
export const getBriefCacheKey = (briefText: string): string => {
  return createHash('sha256').update(briefText.trim().toLowerCase()).digest('hex');
};

/**
 * Generate a stable cache key from a ClientBrief object
 */
export const getContentCacheKey = (brief: Record<string, unknown>): string => {
  const normalized = {
    clientName: brief.clientName,
    campaignGoals: Array.isArray(brief.campaignGoals) ? brief.campaignGoals.sort() : brief.campaignGoals,
    budget: brief.budget,
    targetDemographics: brief.targetDemographics
  };
  return createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
};

/**
 * Wrapper to add caching to any async function
 */
export const withCache = <Args extends unknown[], Result>(
  cache: Cache<Result>,
  keyGenerator: (...args: Args) => string,
  fn: (...args: Args) => Promise<Result>
) => {
  return async (...args: Args): Promise<Result> => {
    const key = keyGenerator(...args);
    return cache.getOrSet(key, () => fn(...args));
  };
};

/**
 * Export Cache class for custom instances
 */
export { Cache };
export type { CacheOptions, CacheEntry };

