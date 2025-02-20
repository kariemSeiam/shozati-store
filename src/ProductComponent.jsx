import React, { useState, useEffect, useContext, useCallback, memo, useRef, useMemo } from 'react';
import { motion, AnimatePresence ,useMotionValue  } from 'framer-motion';
import {
    Heart, Star, Tag, Share2, ChevronDown, Plus, Minus, Check,
    Package, Shield, Clock, X, ArrowRight, Loader2, Palette,Hash ,
    Ruler, ShoppingBag, MessageCircle, AlertCircle, ArrowDown,
    ClipboardList,Eye 
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
                        className={`relative p-0.5 rounded-full transition-all ${
                            selectedVariant?.id === variant.id
                                ? 'ring-2 ring-sky-500 ring-offset-1 ring-offset-white'
                                : ''
                        }`}
                    >
                        <div
                            className="w-6 h-6 rounded-full border border-gray-200 shadow-sm"
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
                            bg-gray-100 hover:bg-gray-200 transition-colors border 
                            border-gray-200 shadow-sm"
                    >
                        <span className="text-xs text-gray-600">+{remainingCount}</span>
                    </motion.button>
                )}
                {hasMoreColors && isExpanded && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsExpanded(false)}
                        className="flex items-center justify-center px-2 rounded-full 
                            hover:bg-gray-100 transition-colors"
                    >
                        <ChevronRight className="w-4 h-4 text-gray-400" />
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
                                ? 'bg-sky-500 text-white ring-2 ring-sky-500/50 shadow-md'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
                            : 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-100'
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


const Badges = ({ rating, tag, tagColor }) => {
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
  
    // Function to generate lighter and darker shades
    const generateShades = (hex) => {
      // Convert to RGB
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      
      // Generate lighter shade (20% lighter)
      const lighter = `rgba(${r + (255 - r) * 0.2}, ${g + (255 - g) * 0.2}, ${b + (255 - b) * 0.2}, 0.9)`;
      
      // Generate darker shade (20% darker)
      const darker = `rgba(${r * 0.8}, ${g * 0.8}, ${b * 0.8}, 1)`;
      
      return { lighter, darker };
    };
  
    const shades = tagColor ? generateShades(tagColor) : null;
    const textColorClass = tagColor ? getTextColor(tagColor) : 'text-white';
  
    return (
      <div className="absolute top-4 right-3 flex flex-col gap-2 z-10">
        {rating > 0 && (
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-white/95 to-white/85
                       backdrop-blur-md rounded-full px-3 py-1.5
                       shadow-lg shadow-amber-100/30 
                       border border-amber-100/50
                       hover:border-amber-200/60
                       hover:shadow-xl hover:shadow-amber-100/40
                       flex items-center gap-1.5
                       transition-all duration-300"
          >
            <div className="relative">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <motion.div
                className="absolute inset-0 text-amber-400/50"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
            </div>
            <span className="text-sm font-semibold bg-gradient-to-r 
                           from-amber-600 to-amber-500
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
            className="relative overflow-hidden"
          >
            <div
              className="rounded-full px-3 py-1.5 text-sm font-medium
                         shadow-lg backdrop-blur-md
                         hover:shadow-xl transition-all duration-300
                         flex items-center gap-2"
              style={{
                background: `linear-gradient(to right, ${tagColor}, ${shades.lighter})`,
                boxShadow: `0 4px 6px -1px ${tagColor}20, 0 2px 4px -1px ${tagColor}10`
              }}
            >
              <motion.div
                className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(to right, ${shades.darker}, ${tagColor})`
                }}
              />
              <span className={`relative ${textColorClass}`}>
                {tag}
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                animate={{
                  x: ['0%', '100%', '0%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  
export const ProductCard = memo(({ product, onSelect, checkAuthAndProceed }) => {
    const { isAuthenticated } = useContext(AuthContext);
    const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isChangingVariant, setIsChangingVariant] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const [showGallery, setShowGallery] = useState(false);

    const { getFavoriteStatus, toggleFavorite, isPending } = useFavorites();
    const isFavorite = getFavoriteStatus(product.id);
    const isLoading = isPending(product.id);

    // Enhanced motion values for sophisticated animations
    const glassOpacity = useMotionValue(0);
    const glassScale = useMotionValue(1);
    const hoverScale = useMotionValue(1);

    useEffect(() => {
        if (selectedVariant.images.length > 1) {
            const interval = setInterval(() => {
                if (!showGallery) {
                    setCurrentImageIndex(prev => (prev + 1) % selectedVariant.images.length);
                }
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [selectedVariant.images.length, showGallery]);

    const handleFavoriteClick = async (e) => {
        e.stopPropagation();
        const canProceed = await checkAuthAndProceed({
            requiresAuth: true,
            onSuccess: async () => {
                await toggleFavorite(product.id);
            }
        });
        if (!canProceed) return;
    };

    const handlePressStart = () => setIsPressed(true);
    const handlePressEnd = () => setIsPressed(false);

    const navigateImage = (direction) => {
        const newIndex = (currentImageIndex + direction + selectedVariant.images.length) % selectedVariant.images.length;
        setCurrentImageIndex(newIndex);
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
        >
            {/* Main Card Container */}
            <div className="relative bg-gradient-to-br from-white via-sky-50/30 to-sky-100/20
                          rounded-3xl border border-sky-100/60 overflow-hidden
                          shadow-lg shadow-sky-100/20 hover:shadow-xl hover:shadow-sky-200/30
                          transition-all duration-500">
                
                {/* Image Section */}
                <div className="relative aspect-[4/5] overflow-hidden">
                    <motion.div
                        animate={{
                            scale: isPressed ? 1.05 : 1,
                            transition: { duration: 0.4 }
                        }}
                        className="absolute inset-0"
                    >
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={`${selectedVariant.id}-${currentImageIndex}`}
                                src={selectedVariant.images[currentImageIndex]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                initial={{ opacity: 0, scale: 1.1 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.4 }}
                            />
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
                            {[ChevronLeft, ChevronRight].map((Icon, idx) => (
                                <motion.button
                                    key={idx}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigateImage(idx === 0 ? -1 : 1);
                                    }}
                                    className="bg-white/80 backdrop-blur-md p-2 rounded-full
                                             shadow-lg shadow-sky-100/30 border border-sky-100/60"
                                >
                                    <Icon className="w-5 h-5 text-sky-600" />
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
                                        : 'bg-white/90 shadow-lg shadow-sky-200/30'}`}
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 text-sky-500 animate-spin" />
                            ) : (
                                <Heart
                                    className={`w-5 h-5 transition-all duration-500
                                              ${isFavorite 
                                                ? 'text-rose-500 fill-rose-500 scale-110' 
                                                : 'text-gray-600 hover:text-rose-500'}`}
                                />
                            )}
                        </motion.button>
                    )}

                    {/* Color Selector */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10">
                        <motion.div
                            whileHover={{ y: -4 }}
                            className="backdrop-blur-md rounded-full p-1
                                     shadow-sm shadow-sky-100/30 border border-sky-100/50"
                        >
                            <ColorSelector
                                variants={product.variants}
                                selectedVariant={selectedVariant}
                                onVariantSelect={(variant) => {
                                    setIsChangingVariant(true);
                                    setSelectedVariant(variant);
                                    setCurrentImageIndex(0);
                                    setTimeout(() => setIsChangingVariant(false), 300);
                                }}
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
                                     bg-gradient-to-r from-sky-900 to-sky-700
                                     bg-clip-text text-transparent">
                            {product.name}
                        </h3>
                    </motion.div>

                    {/* Price Display */}
                    <div className="flex items-baseline gap-2  justify-end">
                        <motion.span 
                            className="text-lg font-bold bg-gradient-to-r 
                                     from-sky-600 to-sky-500
                                     bg-clip-text text-transparent"
                            whileHover={{ scale: 1.05 }}
                        >
                            {formatCurrency(product.discountPrice || product.basePrice)}
                        </motion.span>
                        {product.discountPrice && (
                            <span className="text-sm text-sky-400/90 line-through">
                                {formatCurrency(product.basePrice)}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Touch Ripple Effect */}
            <motion.div
                className="absolute inset-0 bg-sky-100/20 rounded-3xl pointer-events-none"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                    scale: isPressed ? 1.2 : 0,
                    opacity: isPressed ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
            />
        </motion.div>
    );
});
// Premium Enhanced Product Grid Component
export const ProductGrid = memo(({ products, loading, error, onLoadMore, onProductSelect, checkAuthAndProceed }) => {
    const observerRef = useRef(null);
    const loadingRef = useRef(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const { refresh } = useProducts();

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading) {
                    onLoadMore();
                }
            },
            { threshold: 0.1 }
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

    const handleProductSelection = useCallback((product) => {
        setSelectedProduct(product);
    }, []);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-96 p-8 
                          ">
                <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-3">حدث خطأ</h3>
                <p className="text-gray-600 text-center mb-6">{error}</p>
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
                <p className="text-gray-600 mt-4 font-medium">جاري تحميل المنتجات...</p>
            </div>
        );
    }

    return (
        <div className="">
            <div className="grid grid-cols-2 gap-6 p-6">
                {products.map(product => (
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
});


export const ProductSheet = memo(({
    product,
    isOpen,
    onClose,
    checkAuthAndProceed
}) => {
    const { getFavoriteStatus, toggleFavorite, isPending } = useFavorites();
    const isFavorite = getFavoriteStatus(product.id);
    const isLoading = isPending(product.id);
    const { addToCart } = useContext(CartContext);
    const [selectedVariant, setSelectedVariant] = useState(product?.variants[0]);
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showImageViewer, setShowImageViewer] = useState(false);

    useEffect(() => {
        if (isOpen && product) {
            setSelectedVariant(product.variants[0]);
            setSelectedSize(null);
            setQuantity(1);
            setCurrentImageIndex(0);
        }
    }, [isOpen, product]);

    const handleFavoriteToggle = async () => {
        const canProceed = await checkAuthAndProceed({
            requiresAuth: true,
            onSuccess: async () => {
                await toggleFavorite(product.id);
            }
        });
        if (!canProceed) return;
    };

    const handleAddToCart = useCallback(() => {
        if (!selectedSize) {
            toast.error('يرجى اختيار المقاس');
            return;
        }
        addToCart(product, selectedVariant, selectedSize.size, quantity);
        toast.success('تم إضافة المنتج للسلة');
        onClose();
    }, [product, selectedVariant, selectedSize, quantity, addToCart, onClose]);

    if (!product || !isOpen) return null;

    const discountPercentage = useMemo(() =>
        calculateDiscount(product.basePrice, product.discountPrice),
        [product.basePrice, product.discountPrice]
    );

    return (
        <>
            <BottomSheet
                isOpen={isOpen}
                onClose={onClose}
                title="تفاصيل المنتج"
            >
                <div className="p-6 space-y-6 bg-gray-50" dir="rtl">
                    {/* Image Gallery */}
                    <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg">
                        <img
                            src={selectedVariant?.images[currentImageIndex]}
                            alt={product.name}
                            onClick={() => setShowImageViewer(true)}
                            className="w-full h-full object-cover cursor-zoom-in"
                        />

                        {/* Image Navigation */}
                        {selectedVariant?.images.length > 1 && (
                            <div className="absolute bottom-4 inset-x-4 flex justify-center gap-2">
                                {selectedVariant.images.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`w-2 h-2 rounded-full transition-all
                                        ${currentImageIndex === index
                                                ? 'bg-sky-500 w-4'
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
                                    <span className="text-sm text-gray-400 line-through">
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
                                    ${isFavorite ? 'text-rose-500 fill-rose-500 scale-110' : 'text-gray-700'}`}
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
                                        <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                                        <span className="text-gray-900 font-bold">
                                            {product.rating.toFixed(1)}
                                        </span>
                                    </div>
                                )}
                                {product.ratingCount > 0 && (
                                    <span className="text-gray-500 text-sm">
                                        ({product.ratingCount} تقييم)
                                    </span>
                                )}
                            </div>
                            {product.salesCount > 0 && (
                                <span className="text-sm text-gray-500">
                                    {product.salesCount} عملية شراء
                                </span>
                            )}
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>

                        {product.description && (
                            <p className="text-gray-600 leading-relaxed">
                                {product.description}
                            </p>
                        )}
                    </div>

                    {/* Color Selection */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Palette className="w-5 h-5 text-sky-500" />
                                <h3 className="font-bold text-gray-900">اللون</h3>
                            </div>
                            <span className="text-sm text-gray-600">
                                {selectedVariant?.colorName}
                            </span>
                        </div>

                        <ColorSelector
                            variants={product.variants}
                            selectedVariant={selectedVariant}
                            onVariantSelect={(variant) => {
                                setSelectedVariant(variant);
                                setSelectedSize(null);
                                setCurrentImageIndex(0);
                            }}
                            showCollapsed={false}
                        />
                    </div>

                    {/* Size Selection */}
                    {selectedVariant?.sizes.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Ruler className="w-5 h-5 text-sky-500" />
                                    <h3 className="font-bold text-gray-900">المقاس</h3>
                                </div>
                                <span className="text-sm text-gray-600">
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
                                <Check className="w-5 h-5 text-sky-500" />
                                <h3 className="font-bold text-gray-900">مميزات المنتج</h3>
                            </div>

                            <div className="space-y-2">
                                {product.features.map((feature, index) => (
                                    <div key={index} className="bg-white rounded-xl p-3 
                                         flex items-center gap-3 shadow-sm border border-gray-100">
                                        <div className="w-8 h-8 rounded-xl bg-sky-50
                                             flex items-center justify-center flex-shrink-0">
                                            <Check className="w-4 h-4 text-sky-500" />
                                        </div>
                                        <span className="text-gray-700">{feature}</span>
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
                                        className="w-10 h-10 rounded-xl bg-gray-50 text-gray-700 flex items-center justify-center hover:bg-gray-100 transition-colors border border-gray-200"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="text-xl font-bold text-gray-900 w-8 text-center">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity(prev => prev + 1)}
                                        className="w-10 h-10 rounded-xl bg-gray-50 text-gray-700 flex items-center justify-center hover:bg-gray-100 transition-colors border border-gray-200"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">السعر الإجمالي</p>
                                    <span className="text-xl font-bold text-sky-500">
                                        {formatCurrency((product.discountPrice || product.basePrice) * quantity)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Purchase Requirements Section */}
                        <div className="bg-white rounded-xl p-4 space-y-3 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2">
                                <ClipboardList className="w-5 h-5 text-sky-500" />
                                <span className="text-sm font-medium text-gray-900">متطلبات الشراء</span>
                            </div>
                            <div className="flex gap-2 items-center justify-center">
                                <div className={`flex items-center gap-1 px-2 py-1.5 rounded-lg ${selectedVariant ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'}`}>
                                    <Palette className="w-4 h-4" />
                                    <span className="text-xs">اللون</span>
                                    {selectedVariant && <Check className="w-3.5 h-3.5" />}
                                </div>
                                <div className={`flex items-center gap-1 px-2 py-1.5 rounded-lg ${selectedSize ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'}`}>
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
                            className="w-full bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-xl py-4 font-bold hover:brightness-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            <span>إضافة للسلة</span>
                        </button>
                    </div>

                    {/* Support Section */}
                    <button
                        onClick={() => window.open('https://wa.me/+201033939828', '_blank')}
                        className="w-full bg-emerald-50 text-emerald-600 rounded-xl p-4 
                               flex items-center justify-center gap-2 hover:brightness-105 
                               transition-all shadow-sm border border-emerald-100"
                    >
                        <MessageCircle className="w-5 h-5" />
                        <span>تحتاج مساعدة؟ تواصل معنا</span>
                    </button>
                </div>
            </BottomSheet>

            {/* Image Viewer */}
            {showImageViewer && (
                <ImageViewer
                    isOpen={showImageViewer}
                    onClose={() => setShowImageViewer(false)}
                    imageUrl={selectedVariant?.images[currentImageIndex]}
                    className="bg-white"
                />
            )}
        </>
    );
});

export default {
    ProductCard,
    ProductGrid,
    ProductSheet
};