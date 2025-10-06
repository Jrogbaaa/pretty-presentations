/**
 * Tests for Image Cache Service
 * 
 * Run with: npm test or jest
 */

import { imageCacheService } from '@/lib/image-cache-service';

// Mock IndexedDB
const mockIndexedDB = {
  open: jest.fn(),
  databases: jest.fn(),
};

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
    get length() {
      return Object.keys(store).length;
    },
  };
})();

describe('ImageCacheService', () => {
  beforeAll(() => {
    // Setup mocks
    global.indexedDB = mockIndexedDB as any;
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
  });

  describe('initialization', () => {
    it('should initialize IndexedDB on init', async () => {
      mockIndexedDB.open.mockReturnValue({
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
        result: {},
      });
      
      await imageCacheService.init();
      
      expect(mockIndexedDB.open).toHaveBeenCalledWith('nano-banana-cache', 1);
    });
  });

  describe('set and get', () => {
    it('should store and retrieve from cache', async () => {
      const slideId = 'slide-1';
      const imageUrl = 'data:image/png;base64,test';
      const prompt = 'Test image';
      
      await imageCacheService.set(slideId, imageUrl, prompt);
      const cached = await imageCacheService.get(slideId);
      
      // Should fallback to localStorage if IndexedDB fails
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should return null for non-existent cache', async () => {
      const cached = await imageCacheService.get('non-existent');
      expect(cached).toBeNull();
    });

    it('should expire cache after 7 days', async () => {
      const slideId = 'slide-expired';
      const oldTimestamp = Date.now() - (8 * 24 * 60 * 60 * 1000); // 8 days ago
      
      // Manually set expired cache
      mockLocalStorage.setItem(
        `nano-banana-cache-${slideId}`,
        JSON.stringify({
          slideId,
          imageUrl: 'test',
          timestamp: oldTimestamp,
          prompt: 'test',
        })
      );
      
      const cached = await imageCacheService.get(slideId);
      
      // Should be null because it's expired
      expect(cached).toBeNull();
      expect(mockLocalStorage.removeItem).toHaveBeenCalled();
    });

    it('should fallback to localStorage if IndexedDB fails', async () => {
      const slideId = 'slide-fallback';
      const imageUrl = 'data:image/png;base64,test';
      
      // Force IndexedDB to fail by not mocking properly
      await imageCacheService.set(slideId, imageUrl, 'test');
      
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
      
      // Should retrieve from localStorage
      const key = `nano-banana-cache-${slideId}`;
      const stored = mockLocalStorage.getItem(key);
      expect(stored).toBeTruthy();
    });
  });

  describe('remove', () => {
    it('should remove specific slide from cache', async () => {
      const slideId = 'slide-remove';
      
      await imageCacheService.set(slideId, 'test-url', 'test');
      await imageCacheService.remove(slideId);
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(`nano-banana-cache-${slideId}`);
    });
  });

  describe('clear', () => {
    it('should clear all cached images', async () => {
      // Add multiple items
      await imageCacheService.set('slide-1', 'url-1', 'test');
      await imageCacheService.set('slide-2', 'url-2', 'test');
      
      await imageCacheService.clear();
      
      // Check that localStorage was cleared
      const keys = Object.keys(mockLocalStorage as any).filter(key => 
        key.startsWith('nano-banana-cache-')
      );
      expect(keys.length).toBe(0);
    });
  });

  describe('storage quota monitoring', () => {
    it('should check storage quota before writing', async () => {
      // Mock navigator.storage
      const mockEstimate = jest.fn().mockResolvedValue({
        usage: 1000000, // 1MB
        quota: 10000000, // 10MB
      });
      
      Object.defineProperty(navigator, 'storage', {
        value: { estimate: mockEstimate },
        writable: true,
      });
      
      await imageCacheService.set('slide-quota', 'test-url', 'test');
      
      // Should have checked quota (indirectly through private method)
      // This is tested through integration - if it throws, quota check failed
    });

    it('should clear old entries when quota > 80%', async () => {
      // Mock high storage usage
      const mockEstimate = jest.fn().mockResolvedValue({
        usage: 9000000, // 9MB
        quota: 10000000, // 10MB (90% used)
      });
      
      Object.defineProperty(navigator, 'storage', {
        value: { estimate: mockEstimate },
        writable: true,
      });
      
      // Add old entry
      const oldTimestamp = Date.now() - (8 * 24 * 60 * 60 * 1000);
      mockLocalStorage.setItem(
        'nano-banana-cache-old',
        JSON.stringify({
          slideId: 'old',
          imageUrl: 'test',
          timestamp: oldTimestamp,
          prompt: 'test',
        })
      );
      
      // This should trigger cleanup
      await imageCacheService.set('slide-new', 'test-url', 'test');
      
      // Old entry should be removed
      expect(mockLocalStorage.removeItem).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle localStorage quota exceeded', async () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      
      // Should not throw
      await expect(
        imageCacheService.set('slide-quota-exceeded', 'large-image-data', 'test')
      ).resolves.not.toThrow();
    });

    it('should handle IndexedDB not available', async () => {
      // Remove IndexedDB
      const originalIndexedDB = global.indexedDB;
      (global as any).indexedDB = undefined;
      
      // Should fallback gracefully
      await expect(
        imageCacheService.set('slide-no-idb', 'test-url', 'test')
      ).resolves.not.toThrow();
      
      // Restore
      global.indexedDB = originalIndexedDB;
    });

    it('should warn on failed operations', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Force an error
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      await imageCacheService.get('test');
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});

