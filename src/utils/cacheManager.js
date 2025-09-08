// Enhanced Cache Manager with TTL and cleanup
export class CacheManager {
  constructor(defaultTTL = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
    this.cleanupInterval = setInterval(this.cleanup.bind(this), 60 * 1000); // Cleanup every minute
  }

  generateKey(endpoint, options = {}) {
    const { method = 'GET', body } = options;
    return `${method}-${endpoint}-${body ? JSON.stringify(body) : ''}`;
  }

  set(key, data, ttl = this.defaultTTL) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  has(key) {
    return !!this.get(key);
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.cache) {
      if (now - value.timestamp > value.ttl) {
        this.cache.delete(key);
      }
    }
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    let valid = 0, expired = 0;

    for (const [, value] of this.cache) {
      if (now - value.timestamp <= value.ttl) {
        valid++;
      } else {
        expired++;
      }
    }

    return {
      total: this.cache.size,
      valid,
      expired
    };
  }
}

// Global cache instance
export const globalCache = new CacheManager();