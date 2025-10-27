/**
 * Centralized logging and observability utilities
 * In production, integrate with Sentry, DataDog, or similar
 */

import { getUserFriendlyError } from '@/types/errors';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

interface PerformanceMetric {
  operation: string;
  duration: number;
  metadata?: LogContext;
}

/**
 * Configuration for logger
 */
const config = {
  minLevel: (process.env.NODE_ENV === 'production' ? 'info' : 'debug') as LogLevel,
  enableConsole: true,
  enableAnalytics: typeof window !== 'undefined' && process.env.NODE_ENV === 'production',
  enableSentry: false // Set to true when Sentry is configured
};

const logLevels: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

/**
 * Check if log level should be logged
 */
const shouldLog = (level: LogLevel): boolean => {
  return logLevels[level] >= logLevels[config.minLevel];
};

/**
 * Format log message with timestamp and level
 */
const formatMessage = (level: LogLevel, message: string, context?: LogContext): string => {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` ${JSON.stringify(context)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
};

/**
 * Log to console with appropriate method
 */
const logToConsole = (level: LogLevel, message: string, context?: LogContext): void => {
  if (!config.enableConsole || !shouldLog(level)) {
    return;
  }

  const formatted = formatMessage(level, message, context);
  
  switch (level) {
    case 'debug':
      console.debug(formatted);
      break;
    case 'info':
      console.info(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    case 'error':
      console.error(formatted);
      break;
  }
};

/**
 * Log to analytics service (Firebase Analytics, etc.)
 */
const logToAnalytics = async (
  eventName: string,
  params: Record<string, unknown>
): Promise<void> => {
  if (!config.enableAnalytics) {
    return;
  }

  try {
    // Dynamically import Firebase analytics only when needed
    const { analytics } = await import('./firebase');
    const { logEvent } = await import('firebase/analytics');
    
    logEvent(analytics, eventName, params);
  } catch (error) {
    // Silently fail if analytics is not available
    console.debug('Analytics not available:', error);
  }
};

/**
 * Log to error tracking service (Sentry, etc.)
 */
const logToErrorTracking = (
  error: Error
): void => {
  if (!config.enableSentry) {
    return;
  }

  try {
    // When Sentry is configured, uncomment:
    // import * as Sentry from '@sentry/nextjs';
    // Sentry.captureException(error);
    console.debug('Error tracking not configured:', error.message);
  } catch (err) {
    console.debug('Error tracking failed:', err);
  }
};

/**
 * Debug log (development only)
 */
export const logDebug = (message: string, context?: LogContext): void => {
  logToConsole('debug', message, context);
};

/**
 * Info log (general information)
 */
export const logInfo = (message: string, context?: LogContext): void => {
  logToConsole('info', message, context);
  
  if (config.enableAnalytics) {
    logToAnalytics('app_info', {
      message,
      ...context
    });
  }
};

/**
 * Warning log
 */
export const logWarn = (message: string, context?: LogContext): void => {
  logToConsole('warn', message, context);
  
  if (config.enableAnalytics) {
    logToAnalytics('app_warning', {
      message,
      ...context
    });
  }
};

/**
 * Error log with full context
 */
export const logError = (
  error: Error | unknown,
  context?: LogContext
): void => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const userFriendlyMessage = getUserFriendlyError(error);
  
  logToConsole('error', errorMessage, {
    ...context,
    userFriendlyMessage,
    stack: error instanceof Error ? error.stack : undefined
  });
  
  if (error instanceof Error) {
    logToErrorTracking(error, context);
  }
  
  if (config.enableAnalytics) {
    logToAnalytics('app_error', {
      error_message: errorMessage,
      user_friendly_message: userFriendlyMessage,
      ...context
    });
  }
};

/**
 * Log performance metrics
 */
export const logPerformance = (metric: PerformanceMetric): void => {
  logToConsole('info', `Performance: ${metric.operation}`, {
    duration_ms: metric.duration,
    ...metric.metadata
  });
  
  if (config.enableAnalytics) {
    logToAnalytics('performance_metric', {
      operation: metric.operation,
      duration_ms: metric.duration,
      ...metric.metadata
    });
  }
};

/**
 * Track API usage and costs
 */
export const logAPIUsage = (
  provider: 'openai' | 'vertex' | 'firebase',
  operation: string,
  metadata?: {
    tokens?: number;
    cost?: number;
    model?: string;
    success?: boolean;
    duration?: number;
  }
): void => {
  logToConsole('info', `API Usage: ${provider}/${operation}`, metadata);
  
  if (config.enableAnalytics) {
    logToAnalytics('api_usage', {
      provider,
      operation,
      ...metadata
    });
  }
};

/**
 * Track user actions
 */
export const logUserAction = (
  action: string,
  metadata?: LogContext
): void => {
  logToConsole('info', `User Action: ${action}`, metadata);
  
  if (config.enableAnalytics) {
    logToAnalytics('user_action', {
      action,
      ...metadata
    });
  }
};

/**
 * Measure execution time of a function
 */
export const measurePerformance = async <T>(
  operation: string,
  fn: () => Promise<T>,
  metadata?: LogContext
): Promise<T> => {
  const startTime = performance.now();
  
  try {
    const result = await fn();
    const duration = performance.now() - startTime;
    
    logPerformance({
      operation,
      duration,
      metadata: { ...metadata, success: true }
    });
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    
    logPerformance({
      operation,
      duration,
      metadata: { ...metadata, success: false }
    });
    
    throw error;
  }
};

/**
 * Create a performance timer
 */
export const startTimer = (operation: string) => {
  const startTime = performance.now();
  
  return {
    stop: (metadata?: LogContext) => {
      const duration = performance.now() - startTime;
      logPerformance({ operation, duration, metadata });
      return duration;
    },
    
    lap: (label: string) => {
      const duration = performance.now() - startTime;
      logDebug(`${operation} - ${label}`, { duration_ms: duration });
      return duration;
    }
  };
};

/**
 * Log brief processing start
 */
export const logBriefProcessingStart = (briefText: string): void => {
  logInfo('Brief processing started', {
    brief_length: briefText.length,
    timestamp: Date.now()
  });
};

/**
 * Log brief processing completion
 */
export const logBriefProcessingComplete = (
  duration: number,
  success: boolean,
  metadata?: LogContext
): void => {
  logInfo('Brief processing completed', {
    duration_ms: duration,
    success,
    ...metadata
  });
  
  logAPIUsage('openai', 'brief_parsing', {
    duration,
    success,
    ...metadata
  });
};

/**
 * Log presentation generation
 */
export const logPresentationGeneration = (
  clientName: string,
  slideCount: number,
  duration: number
): void => {
  logInfo('Presentation generated', {
    client_name: clientName,
    slide_count: slideCount,
    duration_ms: duration
  });
  
  logUserAction('generate_presentation', {
    client_name: clientName,
    slide_count: slideCount
  });
};

/**
 * Log cache statistics periodically
 */
export const logCacheStats = (cacheName: string, stats: Record<string, unknown>): void => {
  logDebug(`Cache stats: ${cacheName}`, stats);
};

/**
 * Export configuration for testing
 */
export const getLoggerConfig = () => ({ ...config });

/**
 * Update logger configuration
 */
export const updateLoggerConfig = (updates: Partial<typeof config>): void => {
  Object.assign(config, updates);
};

