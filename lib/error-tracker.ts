/**
 * Error Tracking Service
 * Centralized error tracking and logging for the application
 */

interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  [key: string]: any;
}

interface PerformanceMetric {
  name: string;
  value: number;
  context?: Record<string, any>;
}

class ErrorTracker {
  private isProduction = process.env.NODE_ENV === "production";
  private errorLog: Array<{ timestamp: Date; error: Error; context?: ErrorContext }> = [];

  /**
   * Track an error with context
   */
  trackError(error: Error, context?: ErrorContext): void {
    // Log to console in development
    if (!this.isProduction) {
      console.error("Error tracked:", error, context);
    }

    // Store in memory (useful for debugging)
    this.errorLog.push({
      timestamp: new Date(),
      error,
      context,
    });

    // Keep only last 50 errors
    if (this.errorLog.length > 50) {
      this.errorLog.shift();
    }

    // Send to analytics in production
    if (this.isProduction && typeof window !== "undefined") {
      this.sendToAnalytics("exception", {
        description: error.message,
        stack: error.stack,
        fatal: false,
        ...context,
      });
    }

    // Optionally integrate with services like Sentry
    // if (window.Sentry) {
    //   window.Sentry.captureException(error, { extra: context });
    // }
  }

  /**
   * Track a performance metric
   */
  trackMetric(metric: PerformanceMetric): void {
    if (!this.isProduction) {
      console.log("Metric tracked:", metric);
    }

    if (this.isProduction && typeof window !== "undefined") {
      this.sendToAnalytics("timing_complete", {
        name: metric.name,
        value: Math.round(metric.value),
        ...metric.context,
      });
    }
  }

  /**
   * Track a user event
   */
  trackEvent(eventName: string, properties?: Record<string, any>): void {
    if (!this.isProduction) {
      console.log("Event tracked:", eventName, properties);
    }

    if (this.isProduction && typeof window !== "undefined") {
      this.sendToAnalytics("event", {
        event_category: properties?.category || "user_action",
        event_label: eventName,
        ...properties,
      });
    }
  }

  /**
   * Get recent errors (for debugging)
   */
  getRecentErrors(limit = 10): Array<{ timestamp: Date; error: Error; context?: ErrorContext }> {
    return this.errorLog.slice(-limit);
  }

  /**
   * Clear error log
   */
  clearErrors(): void {
    this.errorLog = [];
  }

  /**
   * Send data to analytics service (Google Analytics, custom endpoint, etc.)
   */
  private sendToAnalytics(type: string, data: Record<string, any>): void {
    // Google Analytics 4
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag(type, data);
    }

    // Custom analytics endpoint (optional)
    // fetch('/api/analytics', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ type, data, timestamp: Date.now() })
    // }).catch(console.error);
  }
}

// Export singleton instance
export const errorTracker = new ErrorTracker();

// Convenience functions
export const trackError = (error: Error, context?: ErrorContext) => 
  errorTracker.trackError(error, context);

export const trackMetric = (name: string, value: number, context?: Record<string, any>) =>
  errorTracker.trackMetric({ name, value, context });

export const trackEvent = (eventName: string, properties?: Record<string, any>) =>
  errorTracker.trackEvent(eventName, properties);

