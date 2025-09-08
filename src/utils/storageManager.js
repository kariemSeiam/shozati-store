// Enhanced Storage Manager with error handling and validation
export const STORAGE_KEYS = {
  TOKEN: 'token',
  PHONE: 'userPhone',
  AUTH_DATA: 'authData',
  CART: 'cart',
  FAVORITES: 'favorites',
  SETTINGS: 'appSettings'
};

export const StorageManager = {
  // Auth-related storage
  setAuthData: (data) => {
    try {
      if (data && typeof data === 'object') {
        localStorage.setItem(STORAGE_KEYS.AUTH_DATA, JSON.stringify(data));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to save auth data:', error);
      return false;
    }
  },

  getAuthData: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUTH_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to retrieve auth data:', error);
      return null;
    }
  },

  setToken: (token) => {
    try {
      if (typeof token === 'string' && token.trim()) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to save token:', error);
      return false;
    }
  },

  getToken: () => {
    try {
      return localStorage.getItem(STORAGE_KEYS.TOKEN);
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      return null;
    }
  },

  setPhone: (phone) => {
    try {
      if (typeof phone === 'string' && phone.trim()) {
        localStorage.setItem(STORAGE_KEYS.PHONE, phone);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to save phone:', error);
      return false;
    }
  },

  getPhone: () => {
    try {
      return localStorage.getItem(STORAGE_KEYS.PHONE);
    } catch (error) {
      console.error('Failed to retrieve phone:', error);
      return null;
    }
  },

  // Cart storage
  setCart: (cart) => {
    try {
      if (Array.isArray(cart)) {
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to save cart:', error);
      return false;
    }
  },

  getCart: () => {
    try {
      const cart = localStorage.getItem(STORAGE_KEYS.CART);
      return cart ? JSON.parse(cart) : [];
    } catch (error) {
      console.error('Failed to retrieve cart:', error);
      return [];
    }
  },

  // Favorites storage
  setFavorites: (favorites) => {
    try {
      if (Array.isArray(favorites)) {
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to save favorites:', error);
      return false;
    }
  },

  getFavorites: () => {
    try {
      const favorites = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Failed to retrieve favorites:', error);
      return [];
    }
  },

  // Settings storage
  setSettings: (settings) => {
    try {
      if (settings && typeof settings === 'object') {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to save settings:', error);
      return false;
    }
  },

  getSettings: () => {
    try {
      const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return settings ? JSON.parse(settings) : {};
    } catch (error) {
      console.error('Failed to retrieve settings:', error);
      return {};
    }
  },

  // Clear auth-related data
  clearAuth: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.PHONE);
      localStorage.removeItem(STORAGE_KEYS.AUTH_DATA);
      return true;
    } catch (error) {
      console.error('Failed to clear auth data:', error);
      return false;
    }
  },

  // Clear all app data
  clearAll: () => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Failed to clear all data:', error);
      return false;
    }
  },

  // Check if storage is available
  isStorageAvailable: () => {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  },

  // Get storage usage info
  getStorageInfo: () => {
    if (!StorageManager.isStorageAvailable()) {
      return { available: false };
    }

    try {
      const used = new Blob(Object.values(localStorage)).size;
      const quota = 5 * 1024 * 1024; // 5MB typical quota
      
      return {
        available: true,
        used,
        quota,
        remaining: quota - used,
        usage: ((used / quota) * 100).toFixed(2) + '%'
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { available: true, error: error.message };
    }
  }
};