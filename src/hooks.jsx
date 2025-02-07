import { useCallback, useEffect, useState, createContext, useRef, useContext } from 'react';
import { toast } from 'react-hot-toast';

// API Base URL
const API_BASE_URL = 'https://shozati.pythonanywhere.com/api';

// Storage Keys
const STORAGE_KEYS = {
    TOKEN: 'token',
    PHONE: 'userPhone',
    AUTH_DATA: 'authData',
};

// Storage Management
const StorageManager = {
    setAuthData: (data) => {
        localStorage.setItem(STORAGE_KEYS.AUTH_DATA, JSON.stringify(data));
    },
    getAuthData: () => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.AUTH_DATA));
        } catch {
            return null;
        }
    },
    setToken: (token) => localStorage.setItem(STORAGE_KEYS.TOKEN, token),
    getToken: () => localStorage.getItem(STORAGE_KEYS.TOKEN),
    setPhone: (phone) => localStorage.setItem(STORAGE_KEYS.PHONE, phone),
    getPhone: () => localStorage.getItem(STORAGE_KEYS.PHONE),
    clearAuth: () => {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.PHONE);
        localStorage.removeItem(STORAGE_KEYS.AUTH_DATA);
    },
};

// API Request Utilities with Caching
const createHeaders = (requiresAuth = false) => {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (requiresAuth) {
        const token = StorageManager.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    return headers;
};

// Global cache object
const apiCache = new Map();

// Utility function to generate cache keys
const generateCacheKey = (endpoint, options) => {
    const { method = 'GET', body } = options;
    const key = `${method}-${endpoint}-${body ? JSON.stringify(body) : ''}`;
    return key;
};

const apiRequest = async (endpoint, options = {}, requiresAuth = false) => {
    const cacheKey = generateCacheKey(endpoint, options);
    const cachedResponse = apiCache.get(cacheKey);
    const now = Date.now();

    // If cached response exists and it's less than 1 second old, return it
    if (cachedResponse && now - cachedResponse.timestamp < 1000) {
        return cachedResponse.data;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                ...options.headers,
                ...createHeaders(requiresAuth),
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Network response was not ok');
        }

        const data = await response.json();

        // Store the response in the cache
        apiCache.set(cacheKey, { data, timestamp: now });

        return data;
    } catch (error) {
        if (error.message === 'Token is invalid or expired') {
            StorageManager.clearAuth();
            window.location.href = '/login';
        }
        throw error;
    }
};

// Auth Context
export const AuthContext = createContext({
    isAuthenticated: false,
    userInfo: null,
    phone: null,
    login: () => { },
    logout: () => { },
    updateProfile: () => { },
    addAddress: () => { },
    updateAddress: () => { },
    loading: true,
});

const generateCartItemId = (productId, variantId, size) => {
    return `${productId}-${variantId}-${size}`;
};

// Cart Context
export const CartContext = createContext({
    cart: [],
    isCartOpen: false,
    setIsCartOpen: () => { },
    addToCart: () => { },
    removeFromCart: () => { },
    updateQuantity: () => { },
    emptyCart: () => { },
    cartTotal: 0,
});

// Utility function to format API errors
const formatError = (error) => {
    if (error?.response?.data?.message) {
        return error.response.data.message;
    }
    return 'An error occurred. Please try again.';
};

// Custom hook for auth
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Products Hook with Caching
export const useProducts = (config = {}) => {
    // Core States
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [totalProducts, setTotalProducts] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Pagination States
    const [page, setPage] = useState(1);
    const [perPage] = useState(150); // Matching backend limit

    // Filter States
    const [filters, setFilters] = useState({
        category: 'all',
        search: '',
        minPrice: null,
        maxPrice: null,
        size: '',
        color: '',
        code: '',
        sort: 'popular' // Default sort from backend
    });

    // Loading States
    const [loadingStates, setLoadingStates] = useState({
        isLoading: false,
        isCreating: false,
        isUpdating: false,
        isDeleting: false,
        isUploadingImages: false
    });

    // Error States
    const [errors, setErrors] = useState({
        fetchError: null,
        createError: null,
        updateError: null,
        deleteError: null,
        uploadError: null
    });

    // Refs for optimization
    const abortController = useRef(null);
    const cache = useRef(new Map());

    // Helper to update loading states
    const setLoading = useCallback((key, value) => {
        setLoadingStates(prev => ({ ...prev, [key]: value }));
    }, []);

    // Helper to update error states
    const setError = useCallback((key, value) => {
        setErrors(prev => ({ ...prev, [key]: value }));
    }, []);

    // API Request Helper with Error Handling
    const apiRequest = useCallback(async (endpoint, options = {}) => {
        if (abortController.current) {
            abortController.current.abort();
        }
        abortController.current = new AbortController();

        const defaultHeaders = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        try {
            const response = await fetch(`${config.apiBaseUrl || ''}/api${endpoint}`, {
                ...options,
                headers: defaultHeaders,
                signal: abortController.current.signal
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'API request failed');
            }

            return await response.json();
        } catch (error) {
            if (error.name === 'AbortError') return null;
            throw error;
        }
    }, [config.apiBaseUrl]);

    // Generate cache key based on filters and pagination
    const getCacheKey = useCallback((pageNum, filterParams) => {
        return JSON.stringify({ page: pageNum, ...filterParams });
    }, []);

    // Fetch Products with Caching
    const fetchProducts = useCallback(async (pageNum = page, filterParams = filters) => {
        setLoading('isLoading', true);
        setError('fetchError', null);

        const cacheKey = getCacheKey(pageNum, filterParams);
        
        try {
            // Check cache first
            if (cache.current.has(cacheKey)) {
                const cachedData = cache.current.get(cacheKey);
                setProducts(cachedData.products);
                setTotalProducts(cachedData.total);
                setTotalPages(cachedData.pages);
                return cachedData;
            }

            // Build query params
            const queryParams = new URLSearchParams({
                page: pageNum,
                ...(filterParams.category !== 'all' && { category: filterParams.category }),
                ...(filterParams.search && { search: filterParams.search }),
                ...(filterParams.minPrice && { minPrice: filterParams.minPrice }),
                ...(filterParams.maxPrice && { maxPrice: filterParams.maxPrice }),
                ...(filterParams.size && { size: filterParams.size }),
                ...(filterParams.color && { color: filterParams.color }),
                ...(filterParams.code && { code: filterParams.code }),
                ...(filterParams.sort && { sort: filterParams.sort })
            }).toString();

            const response = await apiRequest(`/products?${queryParams}`);
            
            if (response) {
                setProducts(response.products);
                setTotalProducts(response.total);
                setTotalPages(response.pages);
                
                // Cache the results
                cache.current.set(cacheKey, response);
                
                return response;
            }
        } catch (error) {
            setError('fetchError', error.message);
            return null;
        } finally {
            setLoading('isLoading', false);
        }
    }, [apiRequest, filters, getCacheKey, page, setError, setLoading]);

    // Create Product
    const createProduct = useCallback(async (productData) => {
        setLoading('isCreating', true);
        setError('createError', null);

        try {
            const response = await apiRequest('/admin/products', {
                method: 'POST',
                body: JSON.stringify(productData)
            });

            if (response) {
                // Invalidate cache
                cache.current.clear();
                await fetchProducts();
            }
            return response;
        } catch (error) {
            setError('createError', error.message);
            return null;
        } finally {
            setLoading('isCreating', false);
        }
    }, [apiRequest, fetchProducts, setError, setLoading]);

    // Update Product
    const updateProduct = useCallback(async (productId, productData) => {
        setLoading('isUpdating', true);
        setError('updateError', null);

        try {
            const response = await apiRequest(`/admin/products/${productId}`, {
                method: 'PUT',
                body: JSON.stringify(productData)
            });

            if (response) {
                // Invalidate cache
                cache.current.clear();
                await fetchProducts();
            }
            return response;
        } catch (error) {
            setError('updateError', error.message);
            return null;
        } finally {
            setLoading('isUpdating', false);
        }
    }, [apiRequest, fetchProducts, setError, setLoading]);

    // Delete Product
    const deleteProduct = useCallback(async (productId) => {
        setLoading('isDeleting', true);
        setError('deleteError', null);

        try {
            const response = await apiRequest(`/admin/products/${productId}`, {
                method: 'DELETE'
            });

            if (response) {
                // Invalidate cache
                cache.current.clear();
                await fetchProducts();
            }
            return response;
        } catch (error) {
            setError('deleteError', error.message);
            return null;
        } finally {
            setLoading('isDeleting', false);
        }
    }, [apiRequest, fetchProducts, setError, setLoading]);

    // Upload Product Images
    const uploadProductImages = useCallback(async (productCode, colorName, images) => {
        setLoading('isUploadingImages', true);
        setError('uploadError', null);

        try {
            const formData = new FormData();
            formData.append('productCode', productCode);
            formData.append('colorName', colorName);
            
            images.forEach(image => {
                formData.append('images', image);
            });

            const response = await apiRequest('/admin/products/upload-images', {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': undefined // Let browser set correct content type for FormData
                }
            });

            return response?.imageUrls || [];
        } catch (error) {
            setError('uploadError', error.message);
            return [];
        } finally {
            setLoading('isUploadingImages', false);
        }
    }, [apiRequest, setError, setLoading]);

    // Update Product Inventory
    const updateInventory = useCallback(async (productId, inventoryData) => {
        setLoading('isUpdating', true);
        setError('updateError', null);

        try {
            const response = await apiRequest(`/admin/products/${productId}/inventory`, {
                method: 'PUT',
                body: JSON.stringify(inventoryData)
            });

            if (response) {
                // Invalidate cache
                cache.current.clear();
                await fetchProducts();
            }
            return response;
        } catch (error) {
            setError('updateError', error.message);
            return null;
        } finally {
            setLoading('isUpdating', false);
        }
    }, [apiRequest, fetchProducts, setError, setLoading]);

    // Filter Management
    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => {
            const updated = { ...prev, ...newFilters };
            // Reset page when filters change
            if (JSON.stringify(prev) !== JSON.stringify(updated)) {
                setPage(1);
            }
            return updated;
        });
    }, []);

    // Pagination Management
    const nextPage = useCallback(() => {
        if (page < totalPages) {
            setPage(prev => prev + 1);
        }
    }, [page, totalPages]);

    const previousPage = useCallback(() => {
        if (page > 1) {
            setPage(prev => prev - 1);
        }
    }, [page]);

    // Load products when page or filters change
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts, page, filters]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (abortController.current) {
                abortController.current.abort();
            }
            // Clear cache on unmount
            cache.current.clear();
        };
    }, []);

    return {
        // Data
        products,
        selectedProduct,
        totalProducts,
        totalPages,
        page,
        perPage,
        filters,

        // Loading States
        ...loadingStates,

        // Error States
        ...errors,

        // Methods
        setSelectedProduct,
        setPage,
        updateFilters,
        fetchProducts,
        createProduct,
        updateProduct,
        deleteProduct,
        uploadProductImages,
        updateInventory,
        nextPage,
        previousPage,
    };
};

// Orders Hook with Caching
export const useOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        hasMore: false,
    });

    const { isAuthenticated } = useContext(AuthContext);

    const fetchOrders = useCallback(
        async (page = 1) => {
            if (!isAuthenticated) {
                setOrders([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const data = await apiRequest(
                    `/orders?page=${page}`,
                    {},
                    true
                );

                setOrders((prev) =>
                    page > 1 ? [...prev, ...data.orders] : data.orders
                );
                setPagination({
                    currentPage: data.currentPage,
                    totalPages: data.pages,
                    hasMore: data.currentPage < data.pages,
                });
            } catch (err) {
                setError(formatError(err));
                toast.error('Failed to load orders');
            } finally {
                setLoading(false);
            }
        },
        [isAuthenticated]
    );

    const createOrder = useCallback(
        async (orderData) => {
            if (!isAuthenticated) {
                toast.error('Please login first');
                return { success: false, error: 'Authentication required' };
            }

            try {
                const response = await apiRequest(
                    '/orders',
                    {
                        method: 'POST',
                        body: JSON.stringify(orderData),
                    },
                    true
                );

                setOrders((prev) => [response.order, ...prev]);
                return { success: true, order: response.order };
            } catch (err) {
                toast.error(formatError(err));
                return { success: false, error: formatError(err) };
            }
        },
        [isAuthenticated]
    );

    const cancelOrder = useCallback(
        async (orderId) => {
            if (!isAuthenticated) {
                toast.error('Please login first');
                return false;
            }

            try {
                await apiRequest(
                    `/orders/${orderId}/cancel`,
                    {
                        method: 'POST',
                    },
                    true
                );

                setOrders((prev) =>
                    prev.map((order) =>
                        order.id === orderId
                            ? { ...order, status: 'cancelled' }
                            : order
                    )
                );

                return true;
            } catch (err) {
                toast.error(formatError(err));
                return false;
            }
        },
        [isAuthenticated]
    );

    useEffect(() => {
        if (isAuthenticated) {
            fetchOrders();
        } else {
            setOrders([]);
            setLoading(false);
        }
    }, [fetchOrders, isAuthenticated]);

    return {
        orders,
        loading,
        error,
        pagination,
        createOrder,
        cancelOrder,
        fetchOrders,
    };
};

// Product Details Hook with Caching
export const useProductDetails = (productId) => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProductDetails = useCallback(async () => {
        if (!productId) return;

        try {
            setLoading(true);
            const data = await apiRequest(`/products/${productId}`, {}, true);
            setProduct(data);
        } catch (err) {
            setError(formatError(err));
            toast.error('Failed to load product details');
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        fetchProductDetails();
    }, [fetchProductDetails]);

    return { product, loading, error };
};

// Slides Hook with Caching
export const useSlides = () => {
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSlides = useCallback(async () => {
        try {
            setLoading(true);
            const data = await apiRequest('/slides', {}, false);
            setSlides(data);
        } catch (err) {
            setError(formatError(err));
            toast.error('Failed to load slides');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSlides();
    }, [fetchSlides]);

    return { slides, loading, error };
};

export const useFavorites = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [optimisticUpdates, setOptimisticUpdates] = useState(new Map());
    const [statusCache, setStatusCache] = useState(new Map());

    const { isAuthenticated } = useContext(AuthContext);
    const pendingOperations = useRef(new Set());
    const statusRequests = useRef(new Map());

    // Enhanced cache system
    const cache = useRef({
        favorites: {
            data: null,
            timestamp: 0,
            promise: null,
            requestCount: 0,
            maxCachedRequests: 6
        },
        status: new Map()
    });

    // Synchronous favorite status check with cache integration
    const getFavoriteStatus = useCallback((productId) => {
        if (!isAuthenticated || productId == null) return false;

        // Check optimistic updates first
        const optimisticStatus = optimisticUpdates.get(productId);
        if (optimisticStatus !== undefined) {
            return optimisticStatus;
        }

        // Check if product is in favorites list
        const inFavoritesList = favorites.some(f => f.id === productId);
        if (inFavoritesList) {
            return true;
        }

        // Check status cache with enhanced caching
        const cachedStatus = cache.current.status.get(productId);
        if (cachedStatus && 
            cachedStatus.requestCount < cache.current.favorites.maxCachedRequests) {
            cache.current.status.set(productId, {
                ...cachedStatus,
                requestCount: cachedStatus.requestCount + 1
            });
            return cachedStatus.status;
        }

        return false;
    }, [isAuthenticated, favorites, optimisticUpdates]);

    // Main fetch function with enhanced caching
    const fetchFavorites = useCallback(async () => {
        if (!isAuthenticated) {
            setFavorites([]);
            return;
        }

        const favoritesCache = cache.current.favorites;

        // Return ongoing promise if exists
        if (favoritesCache.promise) {
            return favoritesCache.promise;
        }

        // Use cached data if within request limit
        if (favoritesCache.data && 
            favoritesCache.requestCount < favoritesCache.maxCachedRequests) {
            favoritesCache.requestCount++;
            setFavorites(favoritesCache.data);
            return Promise.resolve(favoritesCache.data);
        }

        try {
            setLoading(true);

            const fetchPromise = (async () => {
                try {
                    const data = await apiRequest('/favorites', {}, true);
                    
                    const currentOptimisticUpdates = optimisticUpdates;
                    
                    const updatedFavorites = data.favorites.map((favorite) => ({
                        ...favorite,
                        isFavorite: currentOptimisticUpdates.get(favorite.id) ?? true
                    }));

                    // Reset cache with new data
                    cache.current.favorites = {
                        data: updatedFavorites,
                        timestamp: Date.now(),
                        promise: null,
                        requestCount: 1,
                        maxCachedRequests: 6
                    };
                    
                    setFavorites(updatedFavorites);
                    
                    // Update status cache
                    updatedFavorites.forEach(favorite => {
                        cache.current.status.set(favorite.id, {
                            status: true,
                            timestamp: Date.now(),
                            requestCount: 1
                        });
                    });

                    return updatedFavorites;
                } catch (err) {
                    setError(formatError(err));
                    toast.error('Failed to load favorites');
                    throw err;
                } finally {
                    setLoading(false);
                    cache.current.favorites.promise = null;
                }
            })();

            cache.current.favorites.promise = fetchPromise;
            return fetchPromise;

        } catch (err) {
            setError(formatError(err));
            toast.error('Failed to load favorites');
            cache.current.favorites.promise = null;
        }
    }, [isAuthenticated, optimisticUpdates]);

    // Toggle favorite with cache integration
    const toggleFavorite = useCallback(async (productId) => {
        if (!isAuthenticated) {
            toast.error('Please login first');
            return false;
        }

        if (pendingOperations.current.has(productId)) {
            return false;
        }

        try {
            pendingOperations.current.add(productId);
            const currentStatus = getFavoriteStatus(productId);

            // Optimistic update
            setOptimisticUpdates(prev => new Map(prev).set(productId, !currentStatus));

            const response = await apiRequest(`/favorites/${productId}`, {
                method: !currentStatus ? 'POST' : 'DELETE'
            }, true);

            // Clear optimistic update
            setOptimisticUpdates(prev => {
                const updated = new Map(prev);
                updated.delete(productId);
                return updated;
            });

            // Update favorites list and cache
            setFavorites(prev => {
                const isNowFavorite = !currentStatus;
                const newFavorites = isNowFavorite
                    ? [...prev, { id: productId, isFavorite: true }]
                    : prev.filter(f => f.id !== productId);

                // Update cache
                cache.current.favorites = {
                    ...cache.current.favorites,
                    data: newFavorites,
                    requestCount: 1 // Reset counter on update
                };

                return newFavorites;
            });

            // Update status cache
            cache.current.status.set(productId, {
                status: !currentStatus,
                timestamp: Date.now(),
                requestCount: 1
            });

            return true;
        } catch (err) {
            // Revert optimistic update
            setOptimisticUpdates(prev => {
                const updated = new Map(prev);
                updated.delete(productId);
                return updated;
            });
            toast.error(formatError(err));
            return false;
        } finally {
            pendingOperations.current.delete(productId);
        }
    }, [isAuthenticated, getFavoriteStatus]);

    // Check status with cache integration
    const checkFavoriteStatus = useCallback(async (productId) => {
        if (!isAuthenticated || productId == null || statusRequests.current.has(productId)) {
            return getFavoriteStatus(productId);
        }

        try {
            const promise = apiRequest(`/favorites/${productId}/status`, {}, true);
            statusRequests.current.set(productId, promise);

            const response = await promise;

            // Update cache with new status
            cache.current.status.set(productId, {
                status: response.isFavorite,
                timestamp: Date.now(),
                requestCount: 1
            });

            return response.isFavorite;
        } catch (error) {
            console.error('Error checking favorite status:', error);
            return getFavoriteStatus(productId);
        } finally {
            statusRequests.current.delete(productId);
        }
    }, [isAuthenticated, getFavoriteStatus]);

    // Force refresh cache
    const forceFetchFavorites = useCallback(async () => {
        cache.current.favorites.requestCount = cache.current.favorites.maxCachedRequests;
        return fetchFavorites();
    }, [fetchFavorites]);

    // Reset cache on logout
    useEffect(() => {
        if (!isAuthenticated) {
            cache.current = {
                favorites: {
                    data: null,
                    timestamp: 0,
                    promise: null,
                    requestCount: 0,
                    maxCachedRequests: 6
                },
                status: new Map()
            };
            setFavorites([]);
        }
    }, [isAuthenticated]);

    // Initialize favorites on mount if authenticated
    useEffect(() => {
        if (isAuthenticated) {
            fetchFavorites();
        }
    }, [isAuthenticated, fetchFavorites]);

    return {
        favorites,
        loading,
        error,
        fetchFavorites,
        forceFetchFavorites,
        getFavoriteStatus,
        checkFavoriteStatus,
        toggleFavorite,
        isPending: (productId) => pendingOperations.current.has(productId)
    };
};

// Auth Provider Component with Caching
export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [phone, setPhone] = useState(StorageManager.getPhone());
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (shouldRetryWithStoredPhone = true) => {
        try {
            const data = await apiRequest('/profile', {}, true);
            setUserInfo(data);
            setIsAuthenticated(true);
            StorageManager.setAuthData({ ...data, phone });
        } catch (err) {
            StorageManager.clearAuth();
            setIsAuthenticated(false);

            if (shouldRetryWithStoredPhone) {
                const storedPhone = StorageManager.getPhone();
                if (storedPhone) {
                    await login(storedPhone);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = StorageManager.getToken();
        const storedPhone = StorageManager.getPhone();
        const authData = StorageManager.getAuthData();

        if (token && authData) {
            setUserInfo(authData);
            setPhone(storedPhone);
            setIsAuthenticated(true);
            fetchProfile();
        } else if (storedPhone) {
            login(storedPhone);
        } else {
            StorageManager.clearAuth();
            setLoading(false);
        }
    }, []);

    const login = async (phoneNumber) => {
        try {
            const loginData = await apiRequest(
                '/auth/login',
                {
                    method: 'POST',
                    body: JSON.stringify({ phone: phoneNumber }),
                },
                false
            );

            if (!loginData.token) {
                throw new Error('Login failed - no token received');
            }

            StorageManager.setToken(loginData.token);
            StorageManager.setPhone(phoneNumber);
            setPhone(phoneNumber);

            try {
                const [profileData, ordersData, favoritesData] =
                    await Promise.all([
                        apiRequest('/profile', {}, true),
                        apiRequest('/orders', {}, true),
                        apiRequest('/favorites', {}, true),
                    ]);

                const enhancedUserInfo = {
                    ...profileData,
                    ordersCount: ordersData.total || 0,
                    favoritesCount: favoritesData.total || 0,
                    orders: ordersData.orders || [],
                    favorites: favoritesData.favorites || [],
                    addresses: profileData.addresses || [],
                    phone: phoneNumber,
                };

                setUserInfo(enhancedUserInfo);
                StorageManager.setAuthData(enhancedUserInfo);
                setIsAuthenticated(true);
                return true;
            } catch (error) {
                console.error(
                    'Error fetching complete profile data:',
                    error
                );

                const basicUserInfo = {
                    ...loginData.user,
                    ordersCount: 0,
                    favoritesCount: 0,
                    orders: [],
                    favorites: [],
                    addresses: [],
                    phone: phoneNumber,
                };

                setUserInfo(basicUserInfo);
                StorageManager.setAuthData(basicUserInfo);
                setIsAuthenticated(true);

                toast.warning(
                    'Logged in, but some data could not be loaded'
                );
                return true;
            }
        } catch (err) {
            StorageManager.clearAuth();
            setIsAuthenticated(false);
            setUserInfo(null);
            setPhone(null);

            toast.error(formatError(err));
            return false;
        }
    };

    const logout = () => {
        StorageManager.clearAuth();
        setIsAuthenticated(false);
        setUserInfo(null);
        setPhone(null);
    };

    const updateProfile = async (data) => {
        try {
            const response = await apiRequest(
                '/profile',
                {
                    method: 'PUT',
                    body: JSON.stringify(data),
                },
                true
            );

            const updatedUserInfo = { ...userInfo, ...response.user };
            setUserInfo(updatedUserInfo);
            StorageManager.setAuthData(updatedUserInfo);
            return true;
        } catch (err) {
            toast.error(formatError(err));
            return false;
        }
    };

    const addAddress = async (data) => {
        try {
            const response = await apiRequest(
                '/addresses',
                {
                    method: 'POST',
                    body: JSON.stringify(data),
                },
                true
            );

            const updatedUserInfo = {
                ...userInfo,
                addresses: [...(userInfo.addresses || []), response.address],
            };
            setUserInfo(updatedUserInfo);
            StorageManager.setAuthData(updatedUserInfo);

            return true;
        } catch (err) {
            toast.error(formatError(err));
            return false;
        }
    };

    const updateAddress = async (addressId, data) => {
        try {
            const response = await apiRequest(
                `/addresses/${addressId}`,
                {
                    method: 'PUT',
                    body: JSON.stringify(data),
                },
                true
            );

            const updatedUserInfo = {
                ...userInfo,
                addresses: userInfo.addresses.map((addr) =>
                    addr.id === addressId ? response.address : addr
                ),
            };
            setUserInfo(updatedUserInfo);
            StorageManager.setAuthData(updatedUserInfo);

            return true;
        } catch (err) {
            toast.error(formatError(err));
            return false;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                userInfo,
                phone,
                login,
                logout,
                updateProfile,
                addAddress,
                updateAddress,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Cart Provider Component
export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });
    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const cartTotal = cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    const addToCart = (product, variant, size, quantity = 1) => {
        setCart((prev) => {
            const cartItemId = generateCartItemId(product.id, variant.id, size);

            const existingItem = prev.find(
                (item) => item.cartItemId === cartItemId
            );

            if (existingItem) {
                return prev.map((item) =>
                    item.cartItemId === cartItemId
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }

            return [
                ...prev,
                {
                    id: product.id,
                    cartItemId,
                    name: product.name,
                    price: product.discountPrice || product.basePrice,
                    image: variant.images[0],
                    variantId: variant.id,
                    colorName: variant.colorName,
                    size,
                    quantity,
                },
            ];
        });

        setIsCartOpen(true);
    };

    const removeFromCart = (cartItemId) => {
        setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
    };

    const updateQuantity = (cartItemId, quantity) => {
        if (quantity < 1) {
            removeFromCart(cartItemId);
            return;
        }
        setCart((prev) =>
            prev.map((item) =>
                item.cartItemId === cartItemId ? { ...item, quantity } : item
            )
        );
    };

    const emptyCart = () => {
        setCart([]);
        setIsCartOpen(false);
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                isCartOpen,
                setIsCartOpen,
                addToCart,
                removeFromCart,
                updateQuantity,
                emptyCart,
                cartTotal,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export default {
    useProducts,
    useProductDetails,
    useSlides,
    useOrders,
    useFavorites,
    AuthContext,
    AuthProvider,
    CartContext,
    CartProvider,
    formatError,
};
