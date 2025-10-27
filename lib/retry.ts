import { OpenAIError, VertexAIError, RateLimitError } from "@/types/errors";

/**
 * Retry configuration options
 */
interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableErrors?: string[];
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableErrors: [
    'rate_limit_exceeded',
    'timeout',
    'network_error',
    'service_unavailable',
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND'
  ]
};

/**
 * Check if an error is retryable
 */
const isRetryableError = (error: unknown, retryableErrors: string[]): boolean => {
  if (error instanceof OpenAIError || error instanceof VertexAIError) {
    return retryableErrors.includes(error.code);
  }
  
  if (error instanceof RateLimitError) {
    return true;
  }
  
  if (error instanceof Error) {
    return retryableErrors.some(code => 
      error.message.toLowerCase().includes(code.toLowerCase())
    );
  }
  
  return false;
};

/**
 * Calculate delay with exponential backoff
 */
const calculateDelay = (
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  backoffMultiplier: number
): number => {
  const delay = initialDelay * Math.pow(backoffMultiplier, attempt);
  return Math.min(delay, maxDelay);
};

/**
 * Sleep for a specified duration
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Execute a function with retry logic and exponential backoff
 * 
 * @param fn - The async function to execute
 * @param options - Retry configuration options
 * @returns Promise resolving to the function result
 * @throws The last error if all retries are exhausted
 * 
 * @example
 * ```typescript
 * const result = await withRetry(
 *   () => openai.chat.completions.create({ ... }),
 *   { maxRetries: 3, initialDelay: 1000 }
 * );
 * ```
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: unknown;
  
  for (let attempt = 0; attempt < opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry if it's not a retryable error
      if (!isRetryableError(error, opts.retryableErrors)) {
        throw error;
      }
      
      // Don't retry on the last attempt
      if (attempt === opts.maxRetries - 1) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = calculateDelay(
        attempt,
        opts.initialDelay,
        opts.maxDelay,
        opts.backoffMultiplier
      );
      
      console.log(
        `Retry attempt ${attempt + 1}/${opts.maxRetries} after ${delay}ms`,
        error instanceof Error ? error.message : 'Unknown error'
      );
      
      await sleep(delay);
    }
  }
  
  // All retries exhausted, throw the last error
  throw lastError;
};

/**
 * Execute a function with retry logic, with custom retry condition
 * 
 * @param fn - The async function to execute
 * @param shouldRetry - Function to determine if error should be retried
 * @param options - Retry configuration options
 * @returns Promise resolving to the function result
 * 
 * @example
 * ```typescript
 * const result = await withCustomRetry(
 *   () => fetchData(),
 *   (error) => error.statusCode === 503,
 *   { maxRetries: 5 }
 * );
 * ```
 */
export const withCustomRetry = async <T>(
  fn: () => Promise<T>,
  shouldRetry: (error: unknown, attempt: number) => boolean,
  options: RetryOptions = {}
): Promise<T> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: unknown;
  
  for (let attempt = 0; attempt < opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Check custom retry condition
      if (!shouldRetry(error, attempt)) {
        throw error;
      }
      
      // Don't retry on the last attempt
      if (attempt === opts.maxRetries - 1) {
        break;
      }
      
      const delay = calculateDelay(
        attempt,
        opts.initialDelay,
        opts.maxDelay,
        opts.backoffMultiplier
      );
      
      console.log(`Custom retry attempt ${attempt + 1}/${opts.maxRetries} after ${delay}ms`);
      
      await sleep(delay);
    }
  }
  
  throw lastError;
};

/**
 * Retry configuration presets for common scenarios
 */
export const RetryPresets = {
  /** Fast retry for user-facing operations (3 attempts, 500ms initial) */
  FAST: {
    maxRetries: 3,
    initialDelay: 500,
    maxDelay: 2000,
    backoffMultiplier: 1.5
  },
  
  /** Standard retry for most operations (3 attempts, 1s initial) */
  STANDARD: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 5000,
    backoffMultiplier: 2
  },
  
  /** Aggressive retry for critical operations (5 attempts, 2s initial) */
  AGGRESSIVE: {
    maxRetries: 5,
    initialDelay: 2000,
    maxDelay: 10000,
    backoffMultiplier: 2
  },
  
  /** Patient retry for background jobs (10 attempts, 5s initial) */
  PATIENT: {
    maxRetries: 10,
    initialDelay: 5000,
    maxDelay: 30000,
    backoffMultiplier: 1.5
  }
} as const;

