import { toast } from 'react-hot-toast';
import { globalCache } from './cacheManager';
import { StorageManager } from './storageManager';

// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://shozati.pythonanywhere.com/api',
  DEV_URL: 'http://127.0.0.1:5004/api',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 // 1 second
};

// Request timeout utility
const withTimeout = (promise, timeout = API_CONFIG.TIMEOUT) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
};

// Retry utility
const withRetry = async (fn, attempts = API_CONFIG.RETRY_ATTEMPTS, delay = API_CONFIG.RETRY_DELAY) => {
  try {
    return await fn();
  } catch (error) {
    if (attempts <= 1) throw error;
    
    // Don't retry on client errors (4xx)
    if (error.status >= 400 && error.status < 500) {
      throw error;
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, attempts - 1, delay * 1.5); // Exponential backoff
  }
};

// Request deduplication
const pendingRequests = new Map();

const createHeaders = (requiresAuth = false) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (requiresAuth) {
    const token = StorageManager.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Enhanced API request with caching, retry, and deduplication
export const apiRequest = async (endpoint, options = {}, requiresAuth = false, cacheOptions = {}) => {
  const { 
    useCache = true, 
    cacheTTL = 5 * 60 * 1000, // 5 minutes
    forceRefresh = false 
  } = cacheOptions;
  
  const cacheKey = globalCache.generateKey(endpoint, options);
  
  // Check cache first (only for GET requests unless explicitly requested)
  if (useCache && !forceRefresh && (!options.method || options.method === 'GET')) {
    const cachedData = globalCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }

  // Request deduplication - prevent multiple identical requests
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }

  const requestPromise = withRetry(async () => {
    const response = await withTimeout(
      fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        ...options,
        credentials: 'include',
        mode: 'cors',
        headers: {
          ...createHeaders(requiresAuth),
          ...options.headers,
        },
      })
    );

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If JSON parsing fails, use the status text
        errorMessage = response.statusText || errorMessage;
      }
      
      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    const data = await response.json();
    
    // Cache successful responses
    if (useCache && (!options.method || options.method === 'GET')) {
      globalCache.set(cacheKey, data, cacheTTL);
    }
    
    return data;
  });

  // Store pending request
  pendingRequests.set(cacheKey, requestPromise);

  try {
    const result = await requestPromise;
    return result;
  } catch (error) {
    // Handle authentication errors
    if (error.status === 401) {
      StorageManager.clearAuth();
      toast.error('Session expired. Please login again.');
      // Optionally redirect to login
      // window.location.href = '/login';
    } else if (error.status >= 500) {
      toast.error('Server error. Please try again later.');
    }
    
    console.error('API Request Error:', {
      endpoint,
      error: error.message,
      status: error.status
    });
    
    throw error;
  } finally {
    // Remove from pending requests
    pendingRequests.delete(cacheKey);
  }
};

// Utility to invalidate cache
export const invalidateCache = (pattern) => {
  if (typeof pattern === 'string') {
    globalCache.delete(pattern);
  } else if (pattern instanceof RegExp) {
    // Clear cache entries matching pattern
    for (const key of globalCache.cache.keys()) {
      if (pattern.test(key)) {
        globalCache.delete(key);
      }
    }
  }
};

// Utility to clear all cache
export const clearAllCache = () => {
  globalCache.clear();
};

// Batch request utility
export const batchRequest = async (requests) => {
  try {
    return await Promise.allSettled(
      requests.map(({ endpoint, options, requiresAuth, cacheOptions }) =>
        apiRequest(endpoint, options, requiresAuth, cacheOptions)
      )
    );
  } catch (error) {
    console.error('Batch request error:', error);
    throw error;
  }
};