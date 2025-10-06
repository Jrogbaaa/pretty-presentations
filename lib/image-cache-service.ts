/**
 * Image Cache Service
 * Caches generated images in localStorage and IndexedDB for performance
 */

interface CachedImage {
  slideId: string;
  imageUrl: string;
  timestamp: number;
  prompt: string;
}

const CACHE_KEY_PREFIX = "nano-banana-cache-";
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

class ImageCacheService {
  private dbName = "nano-banana-cache";
  private storeName = "images";
  private db: IDBDatabase | null = null;

  /**
   * Initialize IndexedDB
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined") {
        resolve();
        return;
      }

      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: "slideId" });
        }
      };
    });
  }

  /**
   * Get cached image for a slide
   */
  async get(slideId: string): Promise<string | null> {
    // Try IndexedDB first (for large base64 images)
    try {
      const cached = await this.getFromIndexedDB(slideId);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.imageUrl;
      }
    } catch (error) {
      console.warn("IndexedDB cache read failed:", error);
    }

    // Fallback to localStorage
    try {
      const localStorageKey = `${CACHE_KEY_PREFIX}${slideId}`;
      const cached = localStorage.getItem(localStorageKey);
      if (cached) {
        const data: CachedImage = JSON.parse(cached);
        if (Date.now() - data.timestamp < CACHE_DURATION) {
          return data.imageUrl;
        } else {
          localStorage.removeItem(localStorageKey);
        }
      }
    } catch (error) {
      console.warn("localStorage cache read failed:", error);
    }

    return null;
  }

  /**
   * Set cached image for a slide
   */
  async set(slideId: string, imageUrl: string, prompt: string): Promise<void> {
    // Check storage quota before writing
    await this.checkStorageQuota();

    const cachedImage: CachedImage = {
      slideId,
      imageUrl,
      timestamp: Date.now(),
      prompt,
    };

    // Try IndexedDB first (better for large data)
    try {
      await this.setInIndexedDB(cachedImage);
    } catch (error) {
      console.warn("IndexedDB cache write failed:", error);
      
      // Fallback to localStorage
      try {
        const localStorageKey = `${CACHE_KEY_PREFIX}${slideId}`;
        localStorage.setItem(localStorageKey, JSON.stringify(cachedImage));
      } catch (localStorageError) {
        console.warn("localStorage cache write failed:", localStorageError);
      }
    }
  }

  /**
   * Clear all cached images
   */
  async clear(): Promise<void> {
    // Clear IndexedDB
    try {
      await this.clearIndexedDB();
    } catch (error) {
      console.warn("Failed to clear IndexedDB cache:", error);
    }

    // Clear localStorage
    try {
      Object.keys(localStorage)
        .filter((key) => key.startsWith(CACHE_KEY_PREFIX))
        .forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.warn("Failed to clear localStorage cache:", error);
    }
  }

  /**
   * Remove specific slide from cache
   */
  async remove(slideId: string): Promise<void> {
    // Remove from IndexedDB
    try {
      await this.removeFromIndexedDB(slideId);
    } catch (error) {
      console.warn("Failed to remove from IndexedDB:", error);
    }

    // Remove from localStorage
    try {
      const localStorageKey = `${CACHE_KEY_PREFIX}${slideId}`;
      localStorage.removeItem(localStorageKey);
    } catch (error) {
      console.warn("Failed to remove from localStorage:", error);
    }
  }

  // IndexedDB helper methods
  private async getFromIndexedDB(slideId: string): Promise<CachedImage | null> {
    if (!this.db) await this.init();
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.get(slideId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  private async setInIndexedDB(cachedImage: CachedImage): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) throw new Error("IndexedDB not available");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.put(cachedImage);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async removeFromIndexedDB(slideId: string): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(slideId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async clearIndexedDB(): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Check storage quota and clear old entries if needed
   */
  private async checkStorageQuota(): Promise<void> {
    if (typeof navigator === "undefined" || !("storage" in navigator)) {
      return;
    }

    try {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 1;
      const percentUsed = (usage / quota) * 100;

      // If over 80% usage, clear old entries
      if (percentUsed > 80) {
        console.warn(`Storage quota at ${percentUsed.toFixed(1)}%, clearing old cache entries`);
        await this.clearOldEntries();
      }
    } catch (error) {
      console.warn("Failed to check storage quota:", error);
    }
  }

  /**
   * Clear entries older than cache duration
   */
  private async clearOldEntries(): Promise<void> {
    const now = Date.now();

    // Clear from IndexedDB
    try {
      if (!this.db) await this.init();
      if (this.db) {
        const transaction = this.db.transaction([this.storeName], "readwrite");
        const store = transaction.objectStore(this.storeName);
        const request = store.openCursor();

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            const cached: CachedImage = cursor.value;
            if (now - cached.timestamp > CACHE_DURATION) {
              cursor.delete();
            }
            cursor.continue();
          }
        };
      }
    } catch (error) {
      console.warn("Failed to clear old IndexedDB entries:", error);
    }

    // Clear from localStorage
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(CACHE_KEY_PREFIX)) {
          const cached = localStorage.getItem(key);
          if (cached) {
            const data: CachedImage = JSON.parse(cached);
            if (now - data.timestamp > CACHE_DURATION) {
              keysToRemove.push(key);
            }
          }
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.warn("Failed to clear old localStorage entries:", error);
    }
  }
}

// Export singleton instance
export const imageCacheService = new ImageCacheService();
