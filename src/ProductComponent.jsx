import React, { useState, useEffect, useContext, useCallback, memo, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import {
    Heart, Star, Tag, Share2, ChevronDown, Plus, Minus, Check,
    Package, Shield, Clock, X, ArrowRight, Loader2, Palette, Hash,
    Ruler, ShoppingBag, MessageCircle, AlertCircle, ArrowDown,
    ClipboardList, Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { AuthContext, CartContext, useFavorites, useProducts } from './hooks';
import { BottomSheet } from './ProfileComponent.jsx';
import ImageViewer from './ImageViewer';

// Utility functions remain the same...
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-EG', {
        style: 'currency',
        currency: 'EGP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

const calculateDiscount = (basePrice, discountPrice) => {
    if (!discountPrice) return null;
    return Math.round(((basePrice - discountPrice) / basePrice) * 100);
};

// New image preloader utility
const ImagePreloader = {
    _cache: new Set(),

    // Preload a single image and return a promise
    preload(src) {
        if (!src || this._cache.has(src)) return Promise.resolve();

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this._cache.add(src);
                resolve(src);
            };
            img.onerror = reject;
            img.src = src;
        });
    },

    // Simplified batch preload for better performance
    preloadBatch(sources = [], priority = []) {
        if (!sources.length) return Promise.resolve();

        // Only preload priority images to reduce network load
        return Promise.all(priority.map(src => this.preload(src)));
    },

    // Check if an image is already loaded
    isLoaded(src) {
        return this._cache.has(src);
    }
};


export const ColorSelector = memo(({
    variants,
    selectedVariant,
    onVariantSelect,
    showCollapsed = true,
    maxVisible = 10
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasMoreColors = showCollapsed && variants.length > maxVisible;
    const visibleVariants = isExpanded ? variants : variants.slice(0, maxVisible);
    const remainingCount = variants.length - maxVisible;

    // Preload the first image of each variant to ensure smooth color switching
    useEffect(() => {
        // Extract first image from each variant
        const imagesToPreload = variants.map(variant => variant.images[0]);
        ImagePreloader.preloadBatch(imagesToPreload, [selectedVariant?.images[0]]);
    }, [variants, selectedVariant]);

    return (
        <div className="relative">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar py-1 px-1"
                dir='rtl'>
                {visibleVariants.map((variant) => (
                    <motion.button
                        key={variant.id}
                        onClick={() => onVariantSelect(variant)}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className={`relative p-0.5 rounded-full transition-all ${selectedVariant?.id === variant.id
                            ? 'ring-2 ring-primary-500 ring-offset-1 ring-offset-white'
                            : ''
                            }`}
                    >
                        <div
                            className="w-6 h-6 rounded-full border border-neutral-200 shadow-sm"
                            style={{ backgroundColor: variant.colorCode }}
                        />
                        {selectedVariant?.id === variant.id && (
                            <motion.div
                                layoutId="selectedColor"
                                className="absolute inset-0 flex items-center justify-center"
                            >
                                <Check className="w-3 h-3 text-white drop-shadow" />
                            </motion.div>
                        )}
                    </motion.button>
                ))}
                {hasMoreColors && !isExpanded && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsExpanded(true)}
                        className="flex items-center justify-center px-2 py-1 rounded-full 
                            bg-neutral-100 hover:bg-neutral-200 transition-colors border 
                            border-neutral-200 shadow-sm"
                    >
                        <span className="text-xs text-neutral-600">+{remainingCount}</span>
                    </motion.button>
                )}
                {hasMoreColors && isExpanded && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsExpanded(false)}
                        className="flex items-center justify-center px-2 rounded-full 
                            hover:bg-neutral-100 transition-colors"
                    >
                        <ChevronDown className="w-4 h-4 text-neutral-400" />
                    </motion.button>
                )}
            </div>
        </div>
    );
});

const sortSizes = (sizes) => {
    // Common size orders
    const sizeOrder = {
        // Numeric sizes
        '35': 1, '36': 2, '37': 3, '38': 4, '39': 5, '40': 6, '41': 7, '42': 8, '43': 9, '44': 10, '45': 11,
        // Letter sizes
        'XXS': 1, 'XS': 2, 'S': 3, 'M': 4, 'L': 5, 'XL': 6, 'XXL': 7, '2XL': 7, '3XL': 8, '4XL': 9,
        // Arabic sizes
        '٣٥': 1, '٣٦': 2, '٣٧': 3, '٣٨': 4, '٣٩': 5, '٤٠': 6, '٤١': 7, '٤٢': 8, '٤٣': 9, '٤٤': 10, '٤٥': 11
    };

    return [...sizes].sort((a, b) => {
        const sizeA = a.size.toString().toUpperCase();
        const sizeB = b.size.toString().toUpperCase();

        // If both sizes are in our predefined order, use that
        if (sizeOrder[sizeA] !== undefined && sizeOrder[sizeB] !== undefined) {
            return sizeOrder[sizeA] - sizeOrder[sizeB];
        }

        // If sizes are numbers (including string numbers), convert to numbers and compare
        const numA = parseFloat(sizeA);
        const numB = parseFloat(sizeB);
        if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
        }

        // Default to alphabetical sorting
        return sizeA.localeCompare(sizeB);
    });
};

export const SizeSelector = memo(({ sizes, selectedSize, onSizeSelect }) => {
    // Memoize the sorted sizes to prevent unnecessary re-sorting
    const sortedSizes = useMemo(() => sortSizes(sizes), [sizes]);

    return (
        <div className="grid grid-cols-4 gap-2">
            {sortedSizes.map((sizeObj) => (
                <button
                    key={sizeObj.size}
                    onClick={() => sizeObj.inStock && onSizeSelect(sizeObj)}
                    disabled={!sizeObj.inStock}
                    className={`relative p-4 mb-6 rounded-xl font-bold text-sm transition-all
                        ${sizeObj.inStock
                            ? selectedSize?.size === sizeObj.size
                                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white ring-2 ring-primary-500/50 shadow-lg'
                                : 'bg-white text-slate-800 hover:bg-neutral-50 border border-neutral-200 shadow-sm'
                            : 'bg-neutral-50 text-neutral-400 cursor-not-allowed border border-neutral-200'
                        }`}
                >
                    {sizeObj.size}
                    {!sizeObj.inStock && (
                        <span className="absolute -bottom-6 right-1/2 translate-x-1/2 
                                    text-xs text-rose-500 whitespace-nowrap">
                            نفذت الكمية
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
});

// Set display names for memo components
ColorSelector.displayName = 'ColorSelector';
SizeSelector.displayName = 'SizeSelector';

// Optimized badges component
const Badges = memo(({ rating, tag, tagColor }) => {
    // Function to determine text color based on background
    const getTextColor = (bgColor) => {
        // Convert hex to RGB
        const hex = bgColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        // Calculate luminance
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        return luminance > 0.5 ? 'text-white' : 'text-white';
    };

    // Function to generate lighter and darker shades - memoized
    const shades = useMemo(() => {
        if (!tagColor) return null;

        // Convert to RGB
        const r = parseInt(tagColor.slice(1, 3), 16);
        const g = parseInt(tagColor.slice(3, 5), 16);
        const b = parseInt(tagColor.slice(5, 7), 16);

        // Generate lighter shade (20% lighter)
        const lighter = `rgba(${r + (255 - r) * 0.2}, ${g + (255 - g) * 0.2}, ${b + (255 - b) * 0.2}, 0.9)`;

        // Generate darker shade (20% darker)
        const darker = `rgba(${r * 0.8}, ${g * 0.8}, ${b * 0.8}, 1)`;

        return { lighter, darker };
    }, [tagColor]);

    const textColorClass = useMemo(() =>
        tagColor ? getTextColor(tagColor) : 'text-white'
        , [tagColor]);

    return (
        <div className="absolute top-4 right-3 flex flex-col gap-2 z-10">
            {rating > 0 && (
                <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, type: "spring" }}
                    className="bg-gradient-to-r from-white/95 to-white/85
                       backdrop-blur-md rounded-full px-3 py-1.5
                       shadow-lg shadow-blue-100/30 
                       border border-blue-100/50
                       hover:border-blue-200/60
                       hover:shadow-xl hover:shadow-blue-100/40
                       flex items-center gap-1.5
                       transition-all duration-300"
                >
                    <Star className="w-4 h-4 text-blue-500 fill-blue-400" />
                    <span className="text-sm font-semibold bg-gradient-to-r 
                           from-blue-600 to-blue-500
                           bg-clip-text text-transparent">
                        {rating.toFixed(1)}
                    </span>
                </motion.div>
            )}

            {tag && tagColor && (
                <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, type: "spring" }}
                    className="relative overflow-hidden"
                >
                    <div
                        className="rounded-full px-3 py-1.5 text-sm font-medium
                         shadow-lg backdrop-blur-md
                         hover:shadow-xl transition-all duration-300
                         flex items-center gap-2"
                        style={{
                            background: `linear-gradient(to right, ${tagColor}, ${shades?.lighter})`,
                            boxShadow: `0 4px 6px -1px ${tagColor}20, 0 2px 4px -1px ${tagColor}10`
                        }}
                    >
                        <span className={`relative ${textColorClass}`}>
                            {tag}
                        </span>
                    </div>
                </motion.div>
            )}
        </div>
    );
});

Badges.displayName = 'Badges';

// Optimized LazyImage component with loading state management
const LazyImage = memo(({ src, alt, className, onLoad, fallback = null, loadingClass = "" }) => {
    const [isLoading, setIsLoading] = useState(!ImagePreloader.isLoaded(src));
    const [error, setError] = useState(false);
    const imgRef = useRef(null);

    useEffect(() => {
        setIsLoading(!ImagePreloader.isLoaded(src));
        setError(false);

        const handleLoad = () => {
            setIsLoading(false);
            if (onLoad) onLoad();
        };

        const handleError = () => {
            setIsLoading(false);
            setError(true);
        };

        const imgEl = imgRef.current;
        if (imgEl) {
            imgEl.addEventListener('load', handleLoad);
            imgEl.addEventListener('error', handleError);

            return () => {
                imgEl.removeEventListener('load', handleLoad);
                imgEl.removeEventListener('error', handleError);
            };
        }
    }, [src, onLoad]);

    // Use intersection observer for lazy loading
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    ImagePreloader.preload(src)
                        .then(() => setIsLoading(false))
                        .catch(() => setError(true));
                    observer.disconnect();
                }
            },
            { threshold: 0.1, rootMargin: '200px' }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, [src]);

    return (
        <div className={`relative ${className}`}>
            {isLoading && (
                <div className={`absolute inset-0 flex items-center justify-center bg-neutral-100/50 ${loadingClass}`}>
                    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            <img
                ref={imgRef}
                src={src}
                alt={alt}
                className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                loading="lazy"
            />

            {error && fallback}
        </div>
    );
});

LazyImage.displayName = 'LazyImage';

// Optimized ProductCard component
export const ProductCard = memo(({ product, onSelect, checkAuthAndProceed }) => {
    const { isAuthenticated } = useContext(AuthContext);
    const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isChangingVariant, setIsChangingVariant] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const [showGallery, setShowGallery] = useState(false);
    const [imagesLoaded, setImagesLoaded] = useState({});

    const { getFavoriteStatus, toggleFavorite, isPending } = useFavorites();
    const isFavorite = getFavoriteStatus(product.id);
    const isLoading = isPending(product.id);

    const preloaderTimeoutRef = useRef(null);

    // Enhanced image preloading strategy
    useEffect(() => {
        // Preload the current image immediately
        const currentImage = selectedVariant.images[currentImageIndex];
        ImagePreloader.preload(currentImage);

        // Clear any existing timeout to prevent race conditions
        if (preloaderTimeoutRef.current) {
            clearTimeout(preloaderTimeoutRef.current);
        }

        // Preload next image with a small delay to prioritize current image
        if (selectedVariant.images.length > 1) {
            const nextIndex = (currentImageIndex + 1) % selectedVariant.images.length;
            preloaderTimeoutRef.current = setTimeout(() => {
                ImagePreloader.preload(selectedVariant.images[nextIndex]);
            }, 300);
        }

        return () => {
            if (preloaderTimeoutRef.current) {
                clearTimeout(preloaderTimeoutRef.current);
            }
        };
    }, [selectedVariant, currentImageIndex]);

    // Image rotation timer with optimized checks
    useEffect(() => {
        if (selectedVariant.images.length <= 1 || showGallery || isChangingVariant) {
            return; // No need for interval
        }

        const interval = setInterval(() => {
            setCurrentImageIndex(prev => (prev + 1) % selectedVariant.images.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [selectedVariant.images.length, showGallery, isChangingVariant]);

    // Mark image as loaded
    const handleImageLoad = useCallback((imageUrl) => {
        setImagesLoaded(prev => ({ ...prev, [imageUrl]: true }));
    }, []);

    const handleFavoriteClick = useCallback(async (e) => {
        e.stopPropagation();
        const canProceed = await checkAuthAndProceed({
            requiresAuth: true,
            onSuccess: async () => {
                await toggleFavorite(product.id);
            }
        });
        if (!canProceed) return;
    }, [checkAuthAndProceed, product.id, toggleFavorite]);

    const handlePressStart = useCallback(() => setIsPressed(true), []);
    const handlePressEnd = useCallback(() => setIsPressed(false), []);

    const navigateImage = useCallback((direction) => {
        const newIndex = (currentImageIndex + direction + selectedVariant.images.length) % selectedVariant.images.length;
        setCurrentImageIndex(newIndex);
    }, [currentImageIndex, selectedVariant.images.length]);

    const handleVariantSelect = useCallback((variant) => {
        if (variant.id === selectedVariant.id) return;

        setIsChangingVariant(true);
        // Preload the first image of the new variant
        ImagePreloader.preload(variant.images[0])
            .then(() => {
                setSelectedVariant(variant);
                setCurrentImageIndex(0);
                setTimeout(() => setIsChangingVariant(false), 300);
            })
            .catch(() => {
                // Still switch even if preload fails
                setSelectedVariant(variant);
                setCurrentImageIndex(0);
                setTimeout(() => setIsChangingVariant(false), 300);
            });
    }, [selectedVariant]);

    // Using CSS property will-change to hint the browser about animations
    const cardStyle = {
        willChange: 'transform, opacity'
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            whileHover={{
                scale: 1.02,
                transition: { duration: 0.3, ease: "easeOut" }
            }}
            whileTap={{ scale: 0.98 }}
            onTapStart={handlePressStart}
            onTapEnd={handlePressEnd}
            className="relative overflow-hidden group"
            onClick={() => onSelect(product)}
            style={cardStyle}
        >
            {/* Main Card Container */}
            <div className="relative bg-gradient-to-br from-white via-primary-50/30 to-primary-100/20
                          rounded-3xl border border-primary-100/60 overflow-hidden
                          shadow-lg shadow-primary-100/20 hover:shadow-xl hover:shadow-primary-200/30
                          transition-all duration-500">

                {/* Image Section */}
                <div className="relative aspect-[4/5] overflow-hidden">
                    <motion.div
                        animate={{
                            scale: isPressed ? 1.05 : 1,
                            transition: { duration: 0.4, type: "spring" }
                        }}
                        className="absolute inset-0"
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`${selectedVariant.id}-${currentImageIndex}`}
                                initial={{ opacity: 0, scale: 1.05 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3, type: "spring" }}
                                className="w-full h-full"
                            >
                                <LazyImage
                                    src={selectedVariant.images[currentImageIndex]}
                                    alt={product.name}
                                    className="w-full h-full"
                                    onLoad={() => handleImageLoad(selectedVariant.images[currentImageIndex])}
                                    loadingClass="bg-neutral-100/80"
                                    fallback={
                                        <div className="w-full h-full flex items-center justify-center bg-neutral-100">
                                            <div className="text-neutral-400">صورة غير متوفرة</div>
                                        </div>
                                    }
                                />
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>

                    {/* Premium Glass Effect */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-white/10
                                 backdrop-blur-sm opacity-0 group-hover:opacity-100
                                 transition-all duration-700"
                    />

                    {/* Image Navigation */}
                    {selectedVariant.images.length > 1 && (
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 
                                      flex justify-between px-2 opacity-0 group-hover:opacity-100
                                      transition-opacity duration-300">
                            {[ChevronDown, ChevronDown].map((Icon, idx) => (
                                <motion.button
                                    key={idx}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigateImage(idx === 0 ? -1 : 1);
                                    }}
                                    className="bg-white/80 backdrop-blur-md p-2 rounded-full
                                             shadow-lg shadow-primary-100/30 border border-primary-100/60"
                                >
                                    <Icon className={`w-5 h-5 text-primary-600 ${idx === 0 ? 'rotate-90' : '-rotate-90'}`} />
                                </motion.button>
                            ))}
                        </div>
                    )}

                    <Badges
                        rating={product.rating}
                        tag={product.tag}
                        tagColor={product.tagColor}
                    />

                    {/* Enhanced Favorite Button */}
                    {isAuthenticated && (
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleFavoriteClick}
                            className={`absolute top-3 left-3 p-3 rounded-full z-10
                                      backdrop-blur-md transition-all duration-500
                                      ${isFavorite
                                    ? 'bg-rose-50/90 shadow-lg shadow-rose-200/50'
                                    : 'bg-white/90 shadow-lg shadow-primary-200/30'}`}
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
                            ) : (
                                <Heart
                                    className={`w-5 h-5 transition-all duration-500
                                              ${isFavorite
                                            ? 'text-rose-500 fill-rose-500 scale-110'
                                            : 'text-neutral-600 hover:text-rose-500'}`}
                                />
                            )}
                        </motion.button>
                    )}

                    {/* Color Selector */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10">
                        <motion.div
                            whileHover={{ y: -4 }}
                            className="backdrop-blur-md rounded-full p-1
                                     shadow-sm shadow-primary-100/30 border border-primary-100/50"
                        >
                            <ColorSelector
                                variants={product.variants}
                                selectedVariant={selectedVariant}
                                onVariantSelect={handleVariantSelect}
                                showCollapsed={true}
                                maxVisible={3}
                            />
                        </motion.div>
                    </div>
                </div>

                {/* Product Info Section */}
                <div className="relative px-4 py-2 pt-3 pb-4 space-y-3 bg-white/80 backdrop-blur-md">
                    <motion.div className="relative">
                        <h3 className="font-bold text-base line-clamp-2 text-right
                                     bg-gradient-to-r from-primary-900 to-primary-700
                                     bg-clip-text text-transparent">
                            {product.name}
                        </h3>
                    </motion.div>

                    {/* Price Display */}
                    <div className="flex items-baseline gap-2 justify-end">
                        <motion.span
                            className="text-lg font-bold bg-gradient-to-r 
                                     from-primary-600 to-primary-500
                                     bg-clip-text text-transparent"
                            whileHover={{ scale: 1.05 }}
                        >
                            {formatCurrency(product.discountPrice || product.basePrice)}
                        </motion.span>
                        {product.discountPrice && (
                            <span className="text-sm text-primary-400/90 line-through">
                                {formatCurrency(product.basePrice)}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Touch Ripple Effect - Optimized using CSS transforms only */}
            <motion.div
                className="absolute inset-0 bg-primary-100/20 rounded-3xl pointer-events-none"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                    scale: isPressed ? 1.2 : 0,
                    opacity: isPressed ? 1 : 0
                }}
                transition={{ duration: 0.3, type: "spring" }}
                style={{ willChange: 'transform, opacity' }}
            />
        </motion.div>
    );
});

ProductCard.displayName = 'ProductCard';

// Optimized React.memo with explicit comparison to avoid unnecessary re-renders
const areProductsEqual = (prevProps, nextProps) => {
    // Check if products array references changed
    if (prevProps.products !== nextProps.products) {
        // If length changed, definitely re-render
        if (prevProps.products?.length !== nextProps.products?.length) {
            return false;
        }

        // If product IDs are different, re-render
        for (let i = 0; i < prevProps.products.length; i++) {
            if (prevProps.products[i].id !== nextProps.products[i].id) {
                return false;
            }
        }
    }

    // Compare other props
    return (
        prevProps.loading === nextProps.loading &&
        prevProps.error === nextProps.error &&
        prevProps.onLoadMore === nextProps.onLoadMore &&
        prevProps.onProductSelect === nextProps.onProductSelect &&
        prevProps.checkAuthAndProceed === nextProps.checkAuthAndProceed
    );
};

// Premium Enhanced Product Grid Component with Virtualization for large lists
export const ProductGrid = memo(({ products, loading, error, onLoadMore, onProductSelect, checkAuthAndProceed }) => {
    const observerRef = useRef(null);
    const loadingRef = useRef(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const { refresh } = useProducts();
    const containerRef = useRef(null);
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });

    // Virtualization logic for large product lists
    const isLargeList = products?.length > 20;

    // Use intersection observer for infinite loading
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading) {
                    onLoadMore();
                }
            },
            { threshold: 0.1, rootMargin: '200px' }
        );

        const currentLoadingRef = loadingRef.current;
        if (currentLoadingRef) {
            observer.observe(currentLoadingRef);
        }

        return () => {
            if (currentLoadingRef) {
                observer.unobserve(currentLoadingRef);
            }
        };
    }, [loading, onLoadMore]);

    // Virtualization scroll handler for very large lists
    useEffect(() => {
        if (!isLargeList || !containerRef.current) return;

        const handleScroll = () => {
            if (!containerRef.current) return;

            const scrollTop = window.scrollY;
            const viewportHeight = window.innerHeight;
            const containerTop = containerRef.current.offsetTop;

            // Calculate which items should be visible based on scroll position
            const itemHeight = 350; // Approximate height of a product card
            const buffer = 5; // Number of items to render above/below visible area

            const start = Math.max(0, Math.floor((scrollTop - containerTop) / itemHeight) - buffer);
            const end = Math.min(
                products.length,
                Math.ceil((scrollTop - containerTop + viewportHeight) / itemHeight) + buffer
            );

            setVisibleRange({ start, end });
        };

        // Initial calculation
        handleScroll();

        // Add scroll listener
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, [isLargeList, products?.length]);

    const handleProductSelection = useCallback((product) => {
        setSelectedProduct(product);
    }, []);

    // Determine which products to render - either all or virtualized subset
    const productsToRender = useMemo(() => {
        if (!isLargeList || !products) return products || [];
        return products.slice(visibleRange.start, visibleRange.end);
    }, [products, isLargeList, visibleRange.start, visibleRange.end]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-96 p-8">
                <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-3">حدث خطأ</h3>
                <p className="text-neutral-600 text-center mb-6">{error}</p>
                <button
                    onClick={refresh}
                    className="px-6 py-3 bg-gradient-to-r from-violet-500 to-indigo-500 
                              text-white rounded-xl hover:from-violet-600 hover:to-indigo-600 
                              transition-all duration-300 shadow-lg shadow-indigo-100/50"
                >
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    if (loading && (!products || products.length === 0)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-96 
                          bg-gradient-to-b from-white to-gray-50">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                <p className="text-neutral-600 mt-4 font-medium">جاري تحميل المنتجات...</p>
            </div>
        );
    }

    return (
        <div className="" ref={containerRef}>
            <div className="grid grid-cols-2 gap-6 p-6" style={{
                minHeight: isLargeList ? products.length * (350 / 2) : 'auto' // Approximate height calculation
            }}>
                {/* For virtualized lists, we need placeholder spaces */}
                {isLargeList && visibleRange.start > 0 && (
                    <div style={{ gridColumn: "span 2", height: visibleRange.start * (350 / 2) }} />
                )}

                {productsToRender.map(product => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onSelect={handleProductSelection}
                        checkAuthAndProceed={checkAuthAndProceed}
                    />
                ))}
            </div>

            {/* Premium Loading Indicator */}
            {loading && (
                <div
                    ref={loadingRef}
                    className="flex items-center justify-center p-6"
                >
                    <div className="p-3 bg-white rounded-xl shadow-lg shadow-indigo-100/30">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                    </div>
                </div>
            )}

            {/* Product Sheet */}
            {selectedProduct && (
                <ProductSheet
                    product={selectedProduct}
                    isOpen={!!selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    checkAuthAndProceed={checkAuthAndProceed}
                />
            )}
        </div>
    );
}, areProductsEqual);

ProductGrid.displayName = 'ProductGrid';

// High-performance Product Sheet component
export const ProductSheet = memo(({
    product,
    isOpen,
    onClose,
    checkAuthAndProceed
}) => {
    const { getFavoriteStatus, toggleFavorite, isPending } = useFavorites();
    const isFavorite = getFavoriteStatus(product?.id);
    const isLoading = isPending(product?.id);
    const { addToCart } = useContext(CartContext);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showImageViewer, setShowImageViewer] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(true);

    // Reset state when product changes
    useEffect(() => {
        if (isOpen && product) {
            const initialVariant = product.variants[0];
            setSelectedVariant(initialVariant);
            setSelectedSize(null);
            setQuantity(1);
            setCurrentImageIndex(0);

            // Preload all images for this product to ensure smooth browsing
            if (initialVariant) {
                // First prioritize current variant images
                const currentVariantImages = initialVariant.images || [];
                ImagePreloader.preloadBatch(currentVariantImages, [currentVariantImages[0]]);

                // Then preload first image of each other variant
                const otherVariantImages = product.variants
                    .filter(v => v.id !== initialVariant.id)
                    .map(v => v.images[0]);

                if (otherVariantImages.length > 0) {
                    // Fixed requestIdleCallback implementation
                    if (window.requestIdleCallback) {
                        window.requestIdleCallback(() => {
                            ImagePreloader.preloadBatch(otherVariantImages);
                        });
                    } else {
                        setTimeout(() => {
                            ImagePreloader.preloadBatch(otherVariantImages);
                        }, 1000);
                    }
                }
            }
        }
    }, [isOpen, product]);

    const handleImageLoad = useCallback(() => {
        setIsImageLoading(false);
    }, []);

    const handleFavoriteToggle = useCallback(async () => {
        if (!product) return;

        const canProceed = await checkAuthAndProceed({
            requiresAuth: true,
            onSuccess: async () => {
                await toggleFavorite(product.id);
            }
        });
        if (!canProceed) return;
    }, [checkAuthAndProceed, product, toggleFavorite]);

    const handleVariantSelect = useCallback((variant) => {
        if (!variant || variant.id === selectedVariant?.id) return;

        setIsImageLoading(true);

        // Preload the images of the selected variant
        const imagesToPreload = variant.images || [];
        if (imagesToPreload.length > 0) {
            ImagePreloader.preload(imagesToPreload[0])
                .then(() => {
                    setSelectedVariant(variant);
                    setSelectedSize(null);
                    setCurrentImageIndex(0);
                    setIsImageLoading(false);

                    // Preload the rest of the images after setting the variant
                    if (imagesToPreload.length > 1) {
                        ImagePreloader.preloadBatch(imagesToPreload.slice(1));
                    }
                })
                .catch(() => {
                    // Still set variant even if preload fails
                    setSelectedVariant(variant);
                    setSelectedSize(null);
                    setCurrentImageIndex(0);
                    setIsImageLoading(false);
                });
        } else {
            setSelectedVariant(variant);
            setSelectedSize(null);
            setCurrentImageIndex(0);
            setIsImageLoading(false);
        }
    }, [selectedVariant]);

    const handleAddToCart = useCallback(() => {
        if (!product || !selectedVariant || !selectedSize) {
            toast.error('يرجى اختيار المقاس');
            return;
        }
        addToCart(product, selectedVariant, selectedSize.size, quantity);
        toast.success('تم إضافة المنتج للسلة');
        onClose();
    }, [product, selectedVariant, selectedSize, quantity, addToCart, onClose]);

    if (!product || !isOpen) return null;

    const discountPercentage = calculateDiscount(product.basePrice, product.discountPrice);

    return (
        <>
            <BottomSheet
                isOpen={isOpen}
                onClose={onClose}
                title="تفاصيل المنتج"
            >
                <div className="p-6 space-y-6 bg-neutral-50" dir="rtl">
                    {/* Image Gallery with optimized loading */}
                    <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg">
                        {selectedVariant && (
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`${selectedVariant.id}-${currentImageIndex}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-full h-full"
                                >
                                    <LazyImage
                                        src={selectedVariant.images[currentImageIndex]}
                                        alt={product.name}
                                        className="w-full h-full cursor-zoom-in"
                                        onLoad={handleImageLoad}
                                        loadingClass="bg-neutral-100/80 backdrop-blur-sm"
                                        fallback={
                                            <div className="w-full h-full flex items-center justify-center bg-neutral-100">
                                                <div className="text-neutral-400">صورة غير متوفرة</div>
                                            </div>
                                        }
                                    />
                                    <div
                                        className="absolute inset-0"
                                        onClick={() => setShowImageViewer(true)}
                                    />
                                </motion.div>
                            </AnimatePresence>
                        )}

                        {/* Image Navigation Indicators */}
                        {selectedVariant?.images.length > 1 && (
                            <div className="absolute bottom-4 inset-x-4 flex justify-center gap-2">
                                {selectedVariant.images.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`w-2 h-2 rounded-full transition-all
                                        ${currentImageIndex === index
                                                ? 'bg-primary-500 w-4'
                                                : 'bg-white/80'}`}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Price Badge */}
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm 
                                     rounded-xl p-3 text-right shadow-md">
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(product.discountPrice || product.basePrice)}
                                </span>
                                {product.discountPrice && (
                                    <span className="text-sm text-neutral-400 line-through">
                                        {formatCurrency(product.basePrice)}
                                    </span>
                                )}
                            </div>
                            {discountPercentage && (
                                <div className="flex items-center gap-1 mt-1">
                                    <Tag className="w-4 h-4 text-rose-500" />
                                    <span className="text-rose-500 text-sm font-medium">
                                        خصم {discountPercentage}%
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Favorite Button */}
                        <button
                            onClick={handleFavoriteToggle}
                            className={`absolute top-4 left-4 p-2 rounded-full 
                                backdrop-blur-sm transition-all shadow-md
                                ${isFavorite ? 'bg-rose-100' : 'bg-white/90 hover:bg-rose-50'}`}
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 text-rose-500 animate-spin" />
                            ) : (
                                <Heart
                                    className={`w-5 h-5 transition-transform
                                    ${isFavorite ? 'text-rose-500 fill-rose-500 scale-110' : 'text-neutral-700'}`}
                                />
                            )}
                        </button>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                {product.rating > 0 && (
                                    <div className="flex items-center gap-1">
                                        <Star className="w-5 h-5 text-blue-400 fill-blue-400" />
                                        <span className="text-gray-900 font-bold">
                                            {product.rating.toFixed(1)}
                                        </span>
                                    </div>
                                )}
                                {product.ratingCount > 0 && (
                                    <span className="text-neutral-500 text-sm">
                                        ({product.ratingCount} تقييم)
                                    </span>
                                )}
                            </div>
                            {product.salesCount > 0 && (
                                <span className="text-sm text-neutral-500">
                                    {product.salesCount} عملية شراء
                                </span>
                            )}
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>

                        {product.description && (
                            <p className="text-neutral-600 leading-relaxed">
                                {product.description}
                            </p>
                        )}
                    </div>

                    {/* Color Selection */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Palette className="w-5 h-5 text-primary-500" />
                                <h3 className="font-bold text-gray-900">اللون</h3>
                            </div>
                            <span className="text-sm text-neutral-600">
                                {selectedVariant?.colorName}
                            </span>
                        </div>

                        <ColorSelector
                            variants={product.variants}
                            selectedVariant={selectedVariant}
                            onVariantSelect={handleVariantSelect}
                            showCollapsed={false}
                        />
                    </div>

                    {/* Size Selection */}
                    {selectedVariant?.sizes?.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Ruler className="w-5 h-5 text-primary-500" />
                                    <h3 className="font-bold text-gray-900">المقاس</h3>
                                </div>
                                <span className="text-sm text-neutral-600">
                                    {selectedSize?.size || 'اختر المقاس'}
                                </span>
                            </div>

                            <SizeSelector
                                sizes={selectedVariant.sizes}
                                selectedSize={selectedSize}
                                onSizeSelect={setSelectedSize}
                            />
                        </div>
                    )}

                    {/* Features */}
                    {product.features?.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 p-2">
                                <Check className="w-5 h-5 text-primary-500" />
                                <h3 className="font-bold text-gray-900">مميزات المنتج</h3>
                            </div>

                            <div className="space-y-2">
                                {product.features.map((feature, index) => (
                                    <div key={index} className="bg-white rounded-xl p-3 
                                         flex items-center gap-3 shadow-sm border border-gray-100">
                                        <div className="w-8 h-8 rounded-xl bg-primary-50
                                             flex items-center justify-center flex-shrink-0">
                                            <Check className="w-4 h-4 text-primary-500" />
                                        </div>
                                        <span className="text-neutral-700">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quantity Section */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                        className="w-10 h-10 rounded-xl bg-neutral-50 text-neutral-700 flex items-center justify-center hover:bg-neutral-100 transition-colors border border-neutral-200"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="text-xl font-bold text-gray-900 w-8 text-center">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity(prev => prev + 1)}
                                        className="w-10 h-10 rounded-xl bg-neutral-50 text-neutral-700 flex items-center justify-center hover:bg-neutral-100 transition-colors border border-neutral-200"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-neutral-500">السعر الإجمالي</p>
                                    <span className="text-xl font-bold text-primary-500">
                                        {formatCurrency((product.discountPrice || product.basePrice) * quantity)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Purchase Requirements Section */}
                        <div className="bg-white rounded-xl p-4 space-y-3 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2">
                                <ClipboardList className="w-5 h-5 text-primary-500" />
                                <span className="text-sm font-medium text-gray-900">متطلبات الشراء</span>
                            </div>
                            <div className="flex gap-2 items-center justify-center">
                                <div className={`flex items-center gap-1 px-2 py-1.5 rounded-lg ${selectedVariant ? 'bg-green-50 text-green-600' : 'bg-neutral-50 text-neutral-500'}`}>
                                    <Palette className="w-4 h-4" />
                                    <span className="text-xs">اللون</span>
                                    {selectedVariant && <Check className="w-3.5 h-3.5" />}
                                </div>
                                <div className={`flex items-center gap-1 px-2 py-1.5 rounded-lg ${selectedSize ? 'bg-green-50 text-green-600' : 'bg-neutral-50 text-neutral-500'}`}>
                                    <Ruler className="w-4 h-4" />
                                    <span className="text-xs">المقاس</span>
                                    {selectedSize && <Check className="w-3.5 h-3.5" />}
                                </div>
                                <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-green-50 text-green-600">
                                    <Hash className="w-4 h-4" />
                                    <span className="text-xs">الكمية</span>
                                    <Check className="w-3.5 h-3.5" />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={!selectedSize}
                            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl py-4 font-bold hover:brightness-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            <span>إضافة للسلة</span>
                        </button>
                    </div>

                    {/* Support Section */}
                    <button
                        onClick={() => window.open('https://wa.me/+201033939828', '_blank')}
                        className="w-full bg-success-50 text-success-600 rounded-xl p-4 
                               flex items-center justify-center gap-2 hover:brightness-105 
                               transition-all shadow-sm border border-success-100"
                    >
                        <MessageCircle className="w-5 h-5" />
                        <span>تحتاج مساعدة؟ تواصل معنا</span>
                    </button>
                </div>
            </BottomSheet>

            {/* Image Viewer with preloading */}
            {showImageViewer && selectedVariant && (
                <ImageViewer
                    isOpen={showImageViewer}
                    onClose={() => setShowImageViewer(false)}
                    imageUrl={selectedVariant.images[currentImageIndex]}
                    className="bg-white"
                    onBeforeShow={() => {
                        // Ensure the high resolution image is preloaded
                        return ImagePreloader.preload(selectedVariant.images[currentImageIndex]);
                    }}
                />
            )}
        </>
    );
});

ProductSheet.displayName = 'ProductSheet';

export default {
    ProductCard,
    ProductGrid,
    ProductSheet
};