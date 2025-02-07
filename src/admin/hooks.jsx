import { useState, useEffect, useCallback, useRef } from 'react';

// Constants
const API_BASE_URL = 'https://shozati.pythonanywhere.com/api';
const API_BASE_URL1 = 'http://localhost:5000/api';

const ADMIN_PHONE = '0000000000';

// Types
export const OrderStatus = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
};

// Enhanced Admin Hook
export const useAdmin = () => {
    // Authentication States
    const [token, setToken] = useState(localStorage.getItem('adminToken'));
    const [isInitialized, setIsInitialized] = useState(false);

    // Loading States
    const [loading, setLoading] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    // Error States
    const [error, setError] = useState(null);
    const [authError, setAuthError] = useState(null);

    // Request Control
    const abortController = useRef(null);

    // Authentication
    const login = async () => {
        setIsAuthenticating(true);
        setAuthError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: ADMIN_PHONE }),
            });

            if (!response.ok) throw new Error('Authentication failed');

            const data = await response.json();
            setToken(data.token);
            localStorage.setItem('adminToken', data.token);
            return data;
        } catch (err) {
            setAuthError(err.message);
            throw err;
        } finally {
            setIsAuthenticating(false);
        }
    };

    const logout = useCallback(() => {
        localStorage.removeItem('adminToken');
        setToken(null);
        setIsInitialized(false);
    }, []);

    // Initialize authentication
    useEffect(() => {
        const initializeAuth = async () => {
            if (!token && !isInitialized) {
                try {
                    await login();
                } catch (err) {
                    console.error('Initial authentication failed:', err);
                }
            }
            setIsInitialized(true);
        };

        initializeAuth();
    }, [token, isInitialized]);

    // Modified useAdmin hook apiCall implementation
    const apiCall = useCallback(async (endpoint, options = {}) => {
        if (abortController.current) {
            abortController.current.abort();
        }
        abortController.current = new AbortController();

        const makeRequest = async (token) => {
            let headers = {
                'Authorization': `Bearer ${token}`,
                ...options.headers
            };

            // Only add Content-Type: application/json if we're not sending FormData
            if (!(options.body instanceof FormData)) {
                headers['Content-Type'] = 'application/json';
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers,
                signal: abortController.current.signal,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || errorData.error || 'API request failed');
            }

            return await response.json();
        };

        try {
            return await makeRequest(token);
        } catch (error) {
            if (error.name === 'AbortError') return null;

            if (error.message.includes('Token')) {
                try {
                    const authData = await login();
                    return await makeRequest(authData.token);
                } catch (loginError) {
                    throw new Error('Re-authentication failed');
                }
            }
            throw error;
        }
    }, [token]);



    return {
        // States
        token,
        isInitialized,
        loading,
        isAuthenticating,
        error,
        authError,

        // Methods
        setLoading,
        setError,
        login,
        logout,
        apiCall,
    };
};

export const useProducts = (config = {}) => {
    // Core States
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [totalProducts, setTotalProducts] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [uploadProgress, setUploadProgress] = useState({});

    // Pagination States
    const [page, setPage] = useState(1);
    const [perPage] = useState(config.perPage || 150);

    // Filter States
    const [filters, setFilters] = useState({
        category: 'all',
        search: '',
        minPrice: null,
        maxPrice: null,
        size: '',
        color: '',
        code: '',
        sort: ''
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

    const { apiCall } = useAdmin();
    const abortController = useRef(null);
    const cache = useRef(new Map());
    const uploadQueue = useRef([]);

    // Helper Functions
    const setLoading = useCallback((key, value) => {
        setLoadingStates(prev => ({ ...prev, [key]: value }));
    }, []);

    const setError = useCallback((key, value) => {
        setErrors(prev => ({ ...prev, [key]: value }));
    }, []);

    const clearCache = useCallback(() => {
        cache.current.clear();
    }, []);



    // Fetch Products with Advanced Caching
    const fetchProducts = useCallback(async (pageNum = page, filterParams = filters) => {
        if (abortController.current) {
            abortController.current.abort();
        }
        abortController.current = new AbortController();

        setLoading('isLoading', true);
        setError('fetchError', null);

        const cacheKey = JSON.stringify({ page: pageNum, ...filterParams });

        try {
            // Check cache first
            if (cache.current.has(cacheKey)) {
                const cachedData = cache.current.get(cacheKey);
                setProducts(cachedData.products);
                setTotalProducts(cachedData.total);
                setTotalPages(cachedData.pages);
                return cachedData;
            }

            const queryParams = new URLSearchParams({
                page: pageNum,
                perPage,
                ...(filterParams.category !== 'all' && { category: filterParams.category }),
                ...(filterParams.search && { search: filterParams.search }),
                ...(filterParams.minPrice && { minPrice: filterParams.minPrice }),
                ...(filterParams.maxPrice && { maxPrice: filterParams.maxPrice }),
                ...(filterParams.size && { size: filterParams.size }),
                ...(filterParams.color && { color: filterParams.color }),
                ...(filterParams.code && { code: filterParams.code }),
                sort: filterParams.sort
            });

            const response = await apiCall(`/products?${queryParams}`, {
                signal: abortController.current.signal
            });

            if (response) {
                setProducts(response.products);
                setTotalProducts(response.total);
                setTotalPages(response.pages);
                cache.current.set(cacheKey, response);
                return response;
            }

        } catch (error) {
            if (error.name === 'AbortError') return;
            setError('fetchError', error.message);
            return null;
        } finally {
            setLoading('isLoading', false);
        }
    }, [apiCall, filters, page, perPage, setError, setLoading]);

    // Fixed uploadProductImages implementation
    const uploadProductImages = useCallback(async (productCode, colorName, files, onProgress) => {
        setLoading('isUploadingImages', true);
        setError('uploadError', null);

        try {
            const uploadedUrls = [];

            for (let i = 0; i < files.length; i++) {
                const formData = new FormData();
                formData.append('productCode', productCode);
                formData.append('colorName', colorName);
                formData.append('image', files[i]);

                // Important: Don't set Content-Type header, let browser set it with boundary
                const response = await apiCall('/admin/products/upload-images', {
                    method: 'POST',
                    body: formData,
                    // Remove Content-Type header completely
                    headers: {},
                    onUploadProgress: (progressEvent) => {
                        const progress = (progressEvent.loaded / progressEvent.total) * 100;
                        onProgress?.((i / files.length * 100) + (progress / files.length));
                    }
                });

                if (response?.imageUrls?.[0]) {
                    uploadedUrls.push(response.imageUrls[0]);
                }
            }

            return uploadedUrls;
        } catch (error) {
            setError('uploadError', error.message);
            return [];
        } finally {
            setLoading('isUploadingImages', false);
        }
    }, [apiCall, setError, setLoading]);



    // Create Product with Image Upload Queue
    const createProduct = useCallback(async (productData, imageFiles) => {
        setLoading('isCreating', true);
        setError('createError', null);

        try {
            // First create the product without images
            const productResponse = await apiCall('/admin/products', {
                method: 'POST',
                body: JSON.stringify({
                    ...productData,
                    variants: productData.variants.map(variant => ({
                        ...variant,
                        images: [] // Clear images initially
                    }))
                })
            });

            if (!productResponse) {
                throw new Error('Failed to create product');
            }

            // Upload images for each variant
            const variantsWithImages = await Promise.all(
                productData.variants.map(async (variant, index) => {
                    if (!imageFiles[index]?.length) return variant;

                    const uploadedUrls = await uploadProductImages(
                        productResponse.code,
                        variant.colorName,
                        imageFiles[index],
                        (progress) => {
                            setUploadProgress(prev => ({
                                ...prev,
                                [`${index}`]: progress
                            }));
                        }
                    );

                    return {
                        ...variant,
                        images: uploadedUrls
                    };
                })
            );

            // Update product with image URLs
            const updatedProduct = await apiCall(`/admin/products/${productResponse.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    ...productData,
                    variants: variantsWithImages
                })
            });

            // Clear cache and refetch
            cache.current.clear();
            await fetchProducts();

            return updatedProduct;
        } catch (error) {
            setError('createError', error.message);
            return null;
        } finally {
            setLoading('isCreating', false);
            setUploadProgress({});
        }
    }, [apiCall, fetchProducts, setError, setLoading, uploadProductImages]);

    // Update Product with Image Upload Queue
    const updateProduct = useCallback(async (productId, productData, imageFiles) => {
        setLoading('isUpdating', true);
        setError('updateError', null);

        try {
            // Upload new images for variants
            const variantsWithImages = await Promise.all(
                productData.variants.map(async (variant, index) => {
                    if (!imageFiles[index]?.length) return variant;

                    const uploadedUrls = await uploadProductImages(
                        productData.code,
                        variant.colorName,
                        imageFiles[index],
                        (progress) => {
                            setUploadProgress(prev => ({
                                ...prev,
                                [`${index}`]: progress
                            }));
                        }
                    );

                    return {
                        ...variant,
                        images: [...variant.images, ...uploadedUrls]
                    };
                })
            );

            // Update product with all data including new image URLs
            const response = await apiCall(`/admin/products/${productId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    ...productData,
                    variants: variantsWithImages
                })
            });

            if (response) {
                cache.current.clear();
                await fetchProducts();
            }

            return response;
        } catch (error) {
            setError('updateError', error.message);
            return null;
        } finally {
            setLoading('isUpdating', false);
            setUploadProgress({});
        }
    }, [apiCall, fetchProducts, setError, setLoading, uploadProductImages]);




    const deleteProduct = useCallback(async (productId) => {
        setLoading('isDeleting', true);
        setError('deleteError', null);

        try {
            const response = await apiCall(`/admin/products/${productId}`, {
                method: 'DELETE'
            });

            if (response) {
                clearCache();
                await fetchProducts();
            }
            return response;
        } catch (error) {
            setError('deleteError', error.message);
            return null;
        } finally {
            setLoading('isDeleting', false);
        }
    }, [apiCall, clearCache, fetchProducts, setError, setLoading]);
    // Update Inventory
    const updateInventory = useCallback(async (productId, inventoryData) => {
        setLoading('isUpdating', true);
        setError('updateError', null);

        try {
            const response = await apiCall(`/admin/products/${productId}/inventory`, {
                method: 'PUT',
                body: JSON.stringify(inventoryData)
            });

            if (response) {
                clearCache();
                await fetchProducts();
            }
            return response;
        } catch (error) {
            setError('updateError', error.message);
            return null;
        } finally {
            setLoading('isUpdating', false);
        }
    }, [apiCall, clearCache, fetchProducts, setError, setLoading]);

    // Filter Management
    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => {
            const updated = { ...prev, ...newFilters };
            if (JSON.stringify(prev) !== JSON.stringify(updated)) {
                setPage(1); // Reset to first page when filters change
            }
            return updated;
        });
    }, []);

    // Pagination
    const nextPage = useCallback(() => {
        if (page < totalPages) setPage(prev => prev + 1);
    }, [page, totalPages]);

    const previousPage = useCallback(() => {
        if (page > 1) setPage(prev => prev - 1);
    }, [page]);

    // Load products on mount and when dependencies change
    useEffect(() => {
        fetchProducts();
        return () => {
            if (abortController.current) {
                abortController.current.abort();
            }
        };
    }, [fetchProducts, page, filters]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearCache();
            if (abortController.current) {
                abortController.current.abort();
            }
        };
    }, [clearCache]);

    return {
        // Data States
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
        updateInventory,
        uploadProgress,
        uploadProductImages,
        nextPage,
        previousPage,
        clearCache,
    };
};

// Enhanced Orders Hook
export const useOrders = () => {
    // Data States
    const [orders, setOrders] = useState([]);
    const [totalOrders, setTotalOrders] = useState(0);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Pagination States
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [perPage, setPerPage] = useState(20);

    // Filter States
    const [filters, setFilters] = useState({
        status: 'all',
        startDate: null,
        endDate: null,
        search: '',
    });

    // Loading States
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    // Error States
    const [error, setError] = useState(null);
    const [updateStatusError, setUpdateStatusError] = useState(null);

    const { apiCall } = useAdmin();
    const previousOrders = useRef([]);

    // Load orders with pagination and filtering
    const loadOrders = useCallback(async (pageNum = page, filterParams = filters) => {
        setIsLoading(true);
        setError(null);

        try {
            const queryParams = new URLSearchParams({
                page: pageNum,
                perPage,
                ...filterParams,
                ...(filterParams.startDate && { startDate: filterParams.startDate.toISOString() }),
                ...(filterParams.endDate && { endDate: filterParams.endDate.toISOString() }),
            }).toString();

            const response = await apiCall(`/admin/orders?${queryParams}`);
            if (response?.orders) {
                setOrders(response.orders);
                setTotalOrders(response.total);
                setTotalPages(response.pages);
                previousOrders.current = response.orders;
            }
            return response;
        } catch (error) {
            setError(error.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [apiCall, page, perPage, filters]);

    // Update order status with optimistic update
    const updateOrderStatus = useCallback(async (orderId, status) => {
        setIsUpdatingStatus(true);
        setUpdateStatusError(null);

        // Store current state for rollback
        const previousState = [...orders];

        try {
            // Optimistic update
            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, status } : order
            ));

            const response = await apiCall(`/admin/orders/${orderId}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status }),
            });

            if (!response) {
                // Rollback on error
                setOrders(previousState);
                throw new Error('Failed to update order status');
            }

            await loadOrders(); // Refresh orders to get updated data
            return response;
        } catch (error) {
            setUpdateStatusError(error.message);
            setOrders(previousState);
            return null;
        } finally {
            setIsUpdatingStatus(false);
        }
    }, [apiCall, orders, loadOrders]);

    // Filter management
    const updateFilters = useCallback((newFilters) => {
        setFilters(current => ({ ...current, ...newFilters }));
        setPage(1); // Reset to first page when filters change
    }, []);

    // Pagination management
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

    // Load orders when page or filters change
    useEffect(() => {
        loadOrders();
    }, [page, filters, loadOrders]);

    return {
        // Data states
        orders,
        totalOrders,
        selectedOrder,

        // Pagination states
        page,
        totalPages,
        perPage,

        // Filter states
        filters,

        // Loading states
        isLoading,
        isUpdatingStatus,

        // Error states
        error,
        updateStatusError,

        // Methods
        setSelectedOrder,
        setPage,
        setPerPage,
        updateFilters,
        loadOrders,
        updateOrderStatus,
        nextPage,
        previousPage,
    };
};

// Enhanced Customers Hook
export const useCustomers = () => {
    // Data States
    const [customers, setCustomers] = useState([]);
    const [totalCustomers, setTotalCustomers] = useState(0);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // Pagination States
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [perPage, setPerPage] = useState(20);

    // Search State
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Loading States
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    // Error States
    const [error, setError] = useState(null);
    const [detailsError, setDetailsError] = useState(null);

    const { apiCall } = useAdmin();
    const searchDebounceTimer = useRef(null);

    // Debounce search
    useEffect(() => {
        if (searchDebounceTimer.current) {
            clearTimeout(searchDebounceTimer.current);
        }

        searchDebounceTimer.current = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset to first page when search changes
        }, 300);

        return () => {
            if (searchDebounceTimer.current) {
                clearTimeout(searchDebounceTimer.current);
            }
        };
    }, [search]);

    // Load customers with search and pagination
    const loadCustomers = useCallback(async (pageNum = page, searchQuery = debouncedSearch) => {
        setIsLoading(true);
        setError(null);

        try {
            const queryParams = new URLSearchParams({
                page: pageNum,
                perPage,
                search: searchQuery,
            }).toString();

            const response = await apiCall(`/admin/customers?${queryParams}`);
            if (response?.customers) {
                setCustomers(response.customers);
                setTotalCustomers(response.total);
                setTotalPages(response.pages);
            }
            return response;
        } catch (error) {
            setError(error.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [apiCall, page, perPage, debouncedSearch]);

    // Load customer details
    const loadCustomerDetails = useCallback(async (customerId) => {
        setIsLoadingDetails(true);
        setDetailsError(null);

        try {
            const response = await apiCall(`/admin/customers/${customerId}`);
            if (response) {
                setSelectedCustomer(response);
            }
            return response;
        } catch (error) {
            setDetailsError(error.message);
            return null;
        } finally {
            setIsLoadingDetails(false);
        }
    }, [apiCall]);

    // Pagination management
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

    // Load customers when page or search changes
    useEffect(() => {
        loadCustomers();
    }, [page, debouncedSearch, loadCustomers]);

    return {
        // Data states
        customers,
        totalCustomers,
        selectedCustomer,

        // Pagination states
        page,
        totalPages,
        perPage,

        // Search state
        search,

        // Loading states
        isLoading,
        isLoadingDetails,

        // Error states
        error,
        detailsError,

        // Methods
        setSelectedCustomer,
        setPage,
        setPerPage,
        setSearch,
        loadCustomers,
        loadCustomerDetails,
        nextPage,
        previousPage,
    };
};

// Enhanced Slides Hook
export const useSlides = () => {
    const [slides, setSlides] = useState([]);
    const [selectedSlide, setSelectedSlide] = useState(null);
    const [slideOrder, setSlideOrder] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isReordering, setIsReordering] = useState(false);
    const [isTogglingStatus, setIsTogglingStatus] = useState(false);
    const [error, setError] = useState(null);
    const [createError, setCreateError] = useState(null);
    const [updateError, setUpdateError] = useState(null);
    const [deleteError, setDeleteError] = useState(null);

    const { apiCall } = useAdmin();
    const previousSlides = useRef([]);

    // Load slides
    const loadSlides = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiCall('/admin/slides');
            if (response) {
                setSlides(response);
                setSlideOrder(response.map(slide => slide.id));
                previousSlides.current = response;
            }
            return response;
        } catch (error) {
            setError(error.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [apiCall]);

    // Toggle slide status
    const toggleSlideStatus = useCallback(async (slideId) => {
        setIsTogglingStatus(true);
        setUpdateError(null);

        const slideIndex = slides.findIndex(slide => slide.id === slideId);
        if (slideIndex === -1) return;

        const slide = slides[slideIndex];
        const newStatus = slide.status === 'active' ? 'inactive' : 'active';

        // Optimistic update
        const updatedSlides = [...slides];
        updatedSlides[slideIndex] = { ...slide, status: newStatus };
        setSlides(updatedSlides);

        try {
            const response = await apiCall(`/admin/slides/${slideId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response) {
                setSlides(slides);
                throw new Error('Failed to update slide status');
            }

            return response;
        } catch (error) {
            setUpdateError(error.message);
            setSlides(slides);
            return null;
        } finally {
            setIsTogglingStatus(false);
        }
    }, [apiCall, slides]);

    // Update slide
    const updateSlide = useCallback(async (slideId, slideData) => {
        setIsUpdating(true);
        setUpdateError(null);
        const previousState = [...slides];
        const slideIndex = slides.findIndex(slide => slide.id === slideId);

        try {
            let requestBody;
            let headers = {};

            // Check if we're dealing with a file upload
            if (slideData.image instanceof File) {
                const formData = new FormData();
                Object.entries(slideData).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        formData.append(key, value);
                    }
                });
                requestBody = formData;
                // Let the browser set the correct content-type with boundary
                headers = {};
            } else {
                // For non-file updates, use JSON
                requestBody = JSON.stringify(slideData);
                headers = {
                    'Content-Type': 'application/json'
                };
            }

            // Optimistic update for non-file data
            if (slideIndex !== -1) {
                const updatedSlide = { ...slides[slideIndex], ...slideData };
                const updatedSlides = [...slides];
                updatedSlides[slideIndex] = updatedSlide;
                setSlides(updatedSlides);
            }

            const response = await apiCall(`/admin/slides/${slideId}`, {
                method: 'PUT',
                headers,
                body: requestBody
            });

            if (!response) {
                setSlides(previousState);
                throw new Error('Failed to update slide');
            }

            await loadSlides();
            return response;
        } catch (error) {
            setUpdateError(error.message);
            setSlides(previousState);
            return null;
        } finally {
            setIsUpdating(false);
        }
    }, [apiCall, slides, loadSlides]);


    const makeAPICall = async (endpoint, method, body, headers = {}) => {
        const defaultHeaders = {
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            'Access-Control-Allow-Credentials': 'true'
        };

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method,
            body,
            credentials: 'include',
            headers: { ...defaultHeaders, ...headers }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `Request failed with status ${response.status}`);
        }

        return data;
    };

    // Create slide
    const createSlide = useCallback(async (slideData) => {
        setIsCreating(true);
        setCreateError(null);

        try {
            const formData = new FormData();

            // Append other fields
            Object.entries(slideData).forEach(([key, value]) => {
                if (key !== 'image' && value !== undefined) {
                    formData.append(key, value);
                }
            });

            // Append image file
            if (slideData.image instanceof File) {
                formData.append('image', slideData.image, slideData.image.name);
            }


            // Debug log
            console.log('Form Data Contents:');
            for (let [key, value] of formData.entries()) {
                console.log(key, value instanceof File ? `File: ${value.name} (${value.type})` : value);
            }




            const data = await makeAPICall('/admin/slides', 'POST', formData);

            if (!data) {
                throw new Error(data.message || 'Failed to create slide');
            }

            if (data) {
                await loadSlides();
                return data;
            }
            return null;
        } catch (error) {
            console.error('Create slide error:', error);
            setCreateError(error.message);
            return null;
        } finally {
            setIsCreating(false);
        }
    }, [loadSlides]);

    // Delete slide
    const deleteSlide = useCallback(async (slideId) => {
        setIsDeleting(true);
        setDeleteError(null);
        const previousState = [...slides];

        try {
            setSlides(slides.filter(slide => slide.id !== slideId));
            setSlideOrder(slideOrder.filter(id => id !== slideId));

            const response = await apiCall(`/admin/slides/${slideId}`, {
                method: 'DELETE'
            });

            if (!response) {
                setSlides(previousState);
                setSlideOrder(previousState.map(slide => slide.id));
                throw new Error('Failed to delete slide');
            }

            return response;
        } catch (error) {
            setDeleteError(error.message);
            setSlides(previousState);
            setSlideOrder(previousState.map(slide => slide.id));
            return null;
        } finally {
            setIsDeleting(false);
        }
    }, [apiCall, slides, slideOrder]);

    useEffect(() => {
        loadSlides();
    }, [loadSlides]);

    return {
        slides,
        selectedSlide,
        slideOrder,
        isLoading,
        isCreating,
        isUpdating,
        isDeleting,
        isReordering,
        isTogglingStatus,
        error,
        createError,
        updateError,
        deleteError,
        setSelectedSlide,
        loadSlides,
        createSlide,
        toggleSlideStatus,
        updateSlide,
        deleteSlide,
    };
};

// Enhanced Analytics Hook
export const useAnalytics = () => {
    // Data States
    const [analytics, setAnalytics] = useState({
        totalSales: 0,
        orderCount: 0,
        topProducts: [],
        revenueChart: [],
    });

    // Time Period States
    const [period, setPeriod] = useState('week');
    const [customDateRange, setCustomDateRange] = useState({
        startDate: null,
        endDate: null,
    });

    // Loading States
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Error States
    const [error, setError] = useState(null);

    const { apiCall } = useAdmin();
    const refreshInterval = useRef(null);
    const autoRefreshEnabled = useRef(true);

    // Load analytics data
    const loadAnalytics = useCallback(async (selectedPeriod = period) => {
        setIsLoading(true);
        setError(null);

        try {
            const queryParams = new URLSearchParams({
                period: selectedPeriod,
                ...(customDateRange.startDate && { startDate: customDateRange.startDate.toISOString() }),
                ...(customDateRange.endDate && { endDate: customDateRange.endDate.toISOString() }),
            }).toString();

            const response = await apiCall(`/admin/analytics/dashboard?${queryParams}`);
            if (response) {
                setAnalytics(response);
            }
            return response;
        } catch (error) {
            setError(error.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [apiCall, period, customDateRange]);

    // Refresh analytics data
    const refreshAnalytics = useCallback(async () => {
        if (isRefreshing) return;

        setIsRefreshing(true);
        try {
            await loadAnalytics();
        } finally {
            setIsRefreshing(false);
        }
    }, [loadAnalytics, isRefreshing]);

    // Toggle auto-refresh
    const toggleAutoRefresh = useCallback((enabled) => {
        autoRefreshEnabled.current = enabled;
        if (!enabled && refreshInterval.current) {
            clearInterval(refreshInterval.current);
            refreshInterval.current = null;
        } else if (enabled && !refreshInterval.current) {
            refreshInterval.current = setInterval(refreshAnalytics, 300000); // 5 minutes
        }
    }, [refreshAnalytics]);

    // Update period with optional custom date range
    const updatePeriod = useCallback((newPeriod, dateRange = null) => {
        setPeriod(newPeriod);
        if (dateRange) {
            setCustomDateRange(dateRange);
        }
    }, []);

    // Set up auto-refresh
    useEffect(() => {
        if (autoRefreshEnabled.current) {
            refreshInterval.current = setInterval(refreshAnalytics, 300000); // 5 minutes
        }

        // Load initial analytics
        loadAnalytics();

        return () => {
            if (refreshInterval.current) {
                clearInterval(refreshInterval.current);
            }
        };
    }, [loadAnalytics, refreshAnalytics]);

    // Clear interval when period changes
    useEffect(() => {
        if (refreshInterval.current) {
            clearInterval(refreshInterval.current);
        }
        if (autoRefreshEnabled.current) {
            refreshInterval.current = setInterval(refreshAnalytics, 300000);
        }
    }, [period, refreshAnalytics]);

    return {
        // Data states
        analytics,
        period,
        customDateRange,

        // Loading states
        isLoading,
        isRefreshing,

        // Error state
        error,

        // Methods
        loadAnalytics,
        refreshAnalytics,
        toggleAutoRefresh,
        updatePeriod,
        setCustomDateRange,
    };
};

