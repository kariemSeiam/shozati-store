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
export const useProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        hasMore: false,
    });

    const fetchProducts = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            const queryString = new URLSearchParams(params).toString();
            const data = await apiRequest(`/products?${queryString}`, {}, true);

            setProducts((prev) =>
                params.page > 1 ? [...prev, ...data.products] : data.products
            );
            setPagination({
                currentPage: data.currentPage,
                totalPages: data.pages,
                hasMore: data.currentPage < data.pages,
            });
        } catch (err) {
            setError(formatError(err));
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    }, []);

    const loadMore = useCallback(() => {
        if (pagination.hasMore && !loading) {
            fetchProducts({ page: pagination.currentPage + 1 });
        }
    }, [pagination.hasMore, pagination.currentPage, loading, fetchProducts]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return { products, loading, error, pagination, fetchProducts, loadMore };
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

    // Synchronous favorite status check
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

        // Check status cache
        const cachedStatus = statusCache.get(productId);
        if (cachedStatus && Date.now() - cachedStatus.timestamp < 30000) {
            return cachedStatus.status;
        }

        return false;
    }, [isAuthenticated, favorites, optimisticUpdates, statusCache]);

    // Fetch all favorites
    const fetchFavorites = useCallback(async () => {
        if (!isAuthenticated) {
            setFavorites([]);
            return;
        }

        try {
            setLoading(true);
            const data = await apiRequest('/favorites', {}, true);

            const updatedFavorites = data.favorites.map((favorite) => ({
                ...favorite,
                isFavorite: optimisticUpdates.get(favorite.id) ?? true
            }));

            setFavorites(updatedFavorites);

            // Update status cache for all favorites
            const newCache = new Map(statusCache);
            updatedFavorites.forEach(favorite => {
                newCache.set(favorite.id, {
                    status: true,
                    timestamp: Date.now()
                });
            });
            setStatusCache(newCache);

        } catch (err) {
            setError(formatError(err));
            toast.error('Failed to load favorites');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, optimisticUpdates]);

    // Toggle favorite status
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

            // Apply optimistic update
            setOptimisticUpdates(prev => new Map(prev).set(productId, !currentStatus));

            const response = await apiRequest(
                '/favorites',
                {
                    method: 'POST',
                    body: JSON.stringify({ product_id: productId })
                },
                true
            );

            // Clear optimistic update
            setOptimisticUpdates(prev => {
                const updated = new Map(prev);
                updated.delete(productId);
                return updated;
            });

            // Update favorites list
            setFavorites(prev => {
                const isNowFavorite = !currentStatus;
                if (isNowFavorite) {
                    const productExists = prev.some(f => f.id === productId);
                    if (!productExists) {
                        return [...prev, { id: productId, isFavorite: true }];
                    }
                    return prev;
                } else {
                    return prev.filter(f => f.id !== productId);
                }
            });

            // Update status cache
            setStatusCache(prev => new Map(prev).set(productId, {
                status: !currentStatus,
                timestamp: Date.now()
            }));

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

    // Check individual product favorite status
    const checkFavoriteStatus = useCallback(async (productId) => {
        if (!isAuthenticated || productId == null || statusRequests.current.has(productId)) {
            return getFavoriteStatus(productId);
        }

        try {
            const promise = apiRequest(`/favorites/${productId}/status`, {}, true);
            statusRequests.current.set(productId, promise);

            const response = await promise;

            setStatusCache(prev => new Map(prev).set(productId, {
                status: response.isFavorite,
                timestamp: Date.now()
            }));

            return response.isFavorite;
        } catch (error) {
            console.error('Error checking favorite status:', error);
            return getFavoriteStatus(productId);
        } finally {
            statusRequests.current.delete(productId);
        }
    }, [isAuthenticated, getFavoriteStatus]);

    // Initialize favorites on auth change
    useEffect(() => {
        if (isAuthenticated) {
            fetchFavorites();
        } else {
            setFavorites([]);
            setStatusCache(new Map());
            setOptimisticUpdates(new Map());
        }
    }, [isAuthenticated, fetchFavorites]);

    return {
        favorites,
        loading,
        error,
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
