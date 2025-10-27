/**
 * Firebase Write Throttler
 * Prevents resource exhaustion by batching and throttling Firestore writes
 * Based on LAYAI implementation: 15 writes per 1.5 seconds
 */

interface ThrottlerConfig {
  writesPerInterval: number;
  interval: number; // milliseconds
}

interface QueuedWrite {
  operation: () => Promise<void>;
  priority: 'high' | 'normal' | 'low';
  resolve: (value: void) => void;
  reject: (error: Error) => void;
}

export class FirebaseThrottler {
  private queue: QueuedWrite[] = [];
  private writesInCurrentInterval = 0;
  private config: ThrottlerConfig;
  private isProcessing = false;
  private intervalTimeout: NodeJS.Timeout | null = null;

  constructor(config: ThrottlerConfig = { writesPerInterval: 15, interval: 1500 }) {
    this.config = config;
  }

  /**
   * Add a write operation to the queue
   */
  public async addWrite(
    operation: () => Promise<void>,
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.queue.push({ operation, priority, resolve, reject });
      this.sortQueue();
      this.processQueue();
    });
  }

  /**
   * Get current queue status
   */
  public getStatus() {
    return {
      queueSize: this.queue.length,
      writesInCurrentInterval: this.writesInCurrentInterval,
      maxWritesPerInterval: this.config.writesPerInterval,
      isProcessing: this.isProcessing,
      health: this.queue.length < 100 ? 'healthy' : this.queue.length < 500 ? 'warning' : 'critical',
    };
  }

  /**
   * Force flush all queued writes (use with caution)
   */
  public async flush(): Promise<void> {
    const promises = this.queue.map(item => item.operation());
    this.queue = [];
    await Promise.all(promises);
    this.writesInCurrentInterval = 0;
  }

  /**
   * Update throttler configuration
   */
  public updateConfig(config: Partial<ThrottlerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  private sortQueue(): void {
    const priorityOrder = { high: 0, normal: 1, low: 2 };
    this.queue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      // Check if we've exceeded the write limit for this interval
      if (this.writesInCurrentInterval >= this.config.writesPerInterval) {
        await this.waitForNextInterval();
      }

      const item = this.queue.shift();
      if (!item) break;

      try {
        await this.executeWithRetry(item.operation);
        this.writesInCurrentInterval++;
        item.resolve();
      } catch (error) {
        item.reject(error as Error);
      }
    }

    this.isProcessing = false;
  }

  private async executeWithRetry(
    operation: () => Promise<void>,
    maxRetries = 3
  ): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        await operation();
        return;
      } catch (error) {
        lastError = error as Error;
        
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error('Operation failed after retries');
  }

  private async waitForNextInterval(): Promise<void> {
    return new Promise(resolve => {
      if (this.intervalTimeout) {
        clearTimeout(this.intervalTimeout);
      }

      this.intervalTimeout = setTimeout(() => {
        this.writesInCurrentInterval = 0;
        resolve();
      }, this.config.interval);
    });
  }
}

// Singleton instance
export const defaultThrottler = new FirebaseThrottler();
