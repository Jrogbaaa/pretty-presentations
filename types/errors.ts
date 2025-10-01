/**
 * Custom error types for better error handling throughout the application
 */

export class OpenAIError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'OpenAIError';
    Object.setPrototypeOf(this, OpenAIError.prototype);
  }
}

export class VertexAIError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'VertexAIError';
    Object.setPrototypeOf(this, VertexAIError.prototype);
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public fields: string[]
  ) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class RateLimitError extends Error {
  constructor(
    message: string,
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

export class CacheError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CacheError';
    Object.setPrototypeOf(this, CacheError.prototype);
  }
}

export class FirestoreError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'FirestoreError';
    Object.setPrototypeOf(this, FirestoreError.prototype);
  }
}

/**
 * Type guard to check if error is an OpenAI error
 */
export const isOpenAIError = (error: unknown): error is OpenAIError => {
  return error instanceof OpenAIError;
};

/**
 * Type guard to check if error is a Vertex AI error
 */
export const isVertexAIError = (error: unknown): error is VertexAIError => {
  return error instanceof VertexAIError;
};

/**
 * Type guard to check if error is a validation error
 */
export const isValidationError = (error: unknown): error is ValidationError => {
  return error instanceof ValidationError;
};

/**
 * Type guard to check if error is a rate limit error
 */
export const isRateLimitError = (error: unknown): error is RateLimitError => {
  return error instanceof RateLimitError;
};

/**
 * Extract user-friendly error message from any error type
 */
export const getUserFriendlyError = (error: unknown): string => {
  if (isOpenAIError(error)) {
    if (error.code === 'insufficient_quota') {
      return 'AI service quota exceeded. Please contact support.';
    }
    if (error.code === 'rate_limit_exceeded') {
      return 'Too many requests. Please try again in a moment.';
    }
    if (error.code === 'invalid_api_key') {
      return 'AI service configuration error. Please contact support.';
    }
    return 'AI processing failed. Please try again.';
  }
  
  if (isVertexAIError(error)) {
    if (error.code === 'permission_denied') {
      return 'AI service access denied. Please contact support.';
    }
    if (error.code === 'not_found') {
      return 'AI service not available. Please contact support.';
    }
    return 'Image generation failed. Please try again.';
  }
  
  if (isValidationError(error)) {
    return `Please check: ${error.fields.join(', ')}`;
  }
  
  if (isRateLimitError(error)) {
    const retryMsg = error.retryAfter 
      ? ` Please try again in ${error.retryAfter} seconds.`
      : ' Please try again later.';
    return `Too many requests.${retryMsg}`;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

