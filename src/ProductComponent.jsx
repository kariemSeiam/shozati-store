import React, { useState, useEffect, useContext, useCallback, memo, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart, Star, Tag, Share2, ChevronDown, Plus, Minus, Check,
    Package, Shield, Clock, X, ArrowRight, Loader2, Palette,
    Ruler, ShoppingBag, MessageCircle, AlertCircle, ArrowDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { AuthContext, CartContext, useFavorites, useProducts } from './hooks';
import { BottomSheet } from './ProfileComponent.jsx';
import ImageViewer from './ImageViewer';

// Utility functions remain the same...
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-EG', {
        style: 'currency',
        currency: 'EGP'
    }).format(amount);
};

const calculateDiscount = (basePrice, discountPrice) => {
    if (!discountPrice) return null;
    return Math.round(((basePrice - discountPrice) / basePrice) * 100);
};


// Memoized Badge Component
const Badge = memo(({ icon: Icon, text, color, className = '' }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`px-2 py-1 rounded-full backdrop-blur-sm flex items-center gap-1 
                text-white text-sm font-medium ${className}`}
    >
        <Icon className="w-4 h-4" />
        <span>{text}</span>
    </motion.div>
));

const ColorSelector = memo(({
    variants,
    selectedVariant,
    onVariantSelect,
    showCollapsed = true, // New prop to control collapse behavior
    maxVisible = 10 // New prop to control how many colors to show initially
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
                        className={`relative p-0.5 rounded-full transition-all ${selectedVariant?.id === variant.id
                                ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900'
                                : ''
                            }`}
                    >
                        <div
                            className="w-6 h-6 rounded-full border border-gray-700"
                            style={{ backgroundColor: variant.colorCode }}
                        />
                        {selectedVariant?.id === variant.id && (
                            <motion.div
                                layoutId="selectedColor"
                                className="absolute inset-0 flex items-center justify-center"
                            >
                                <Check className="w-3 h-3 text-white drop-shadow-lg" />
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
                        className="flex items-center justify-center px-2 py-1 rounded-full bg-gray-800 
                       hover:bg-gray-700 transition-colors border border-gray-700"
                    >
                        <span className="text-xs text-gray-300">+{remainingCount}</span>
                    </motion.button>
                )}

                {hasMoreColors && isExpanded && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsExpanded(false)}
                        className="flex items-center justify-center px-2 rounded-full 
                       hover:bg-gray-800/50 transition-colors"
                       
                    >
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                    </motion.button>
                )}
            </div>
        </div>
    );
});

// Prevent memo warning
ColorSelector.displayName = 'ColorSelector';

// Size Selector Component  
const SizeSelector = memo(({ sizes, selectedSize, onSizeSelect }) => {
    return (
        <div className="grid grid-cols-4 gap-2">
            {sizes.map((sizeObj) => (
                <button
                    key={sizeObj.size}
                    onClick={() => sizeObj.inStock && onSizeSelect(sizeObj)}
                    disabled={!sizeObj.inStock}
                    className={`relative p-4 mb-2 rounded-xl font-bold text-sm transition-all
                        ${sizeObj.inStock
                            ? selectedSize?.size === sizeObj.size
                                ? 'bg-blue-500 text-white ring-2 ring-blue-500/50'
                                : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700'
                            : 'bg-gray-800/30 text-gray-500 cursor-not-allowed'}`}
                >
                    {sizeObj.size}
                    {!sizeObj.inStock && (
                        <span className="absolute -bottom-6 right-1/2 translate-x-1/2 
                                    text-xs text-red-500 whitespace-nowrap">
                            نفذت الكمية
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
});

// Enhanced Product Card Component
export const ProductCard = memo(({ product, onSelect, checkAuthAndProceed }) => {

    const { getFavoriteStatus, toggleFavorite, isPending } = useFavorites();
    const { isAuthenticated } = useContext(AuthContext);
    const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isChangingVariant, setIsChangingVariant] = useState(false);

    const isFavorite = getFavoriteStatus(product.id);
    const isLoading = isPending(product.id);
    // Image rotation interval
    useEffect(() => {
        if (selectedVariant.images.length > 1) {
            const interval = setInterval(() => {
                setCurrentImageIndex(prev => (prev + 1) % selectedVariant.images.length);
            }, 1500);
            return () => clearInterval(interval);
        }
    }, [selectedVariant]);

    // Handle favorite toggle
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

    const discountPercentage = calculateDiscount(product.basePrice, product.discountPrice);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="group bg-gradient-to-r from-gray-800/50 to-gray-800/30 
                    rounded-2xl border border-gray-700/50 hover:border-blue-500/30 
                    transition-all duration-300 cursor-pointer overflow-hidden"
            onClick={() => onSelect(product)}
        >
            {/* Image Container */}
            <div className="relative aspect-square">
                <motion.img
                    key={`${selectedVariant.id}-${currentImageIndex}`}
                    src={selectedVariant.images[currentImageIndex]}
                    alt={product.name}
                    className={`w-full h-full object-cover transition-opacity duration-300
                            ${isChangingVariant ? 'opacity-0' : 'opacity-100'}`}
                />

                {/* Overlay with badges and actions */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 
                            via-transparent to-transparent pointer-events-none" />

                {/* Badges */}
                <div className="absolute top-3 right-3 grid gap-2 z-1">
                    {product.rating > 0 && (
                        <Badge
                            icon={Star}
                            text={product.rating.toFixed(1)}
                            className="bg-black/50 text-yellow-500"
                        />
                    )}
                    {discountPercentage && (
                        <Badge
                            icon={Tag}
                            text={`${discountPercentage}%-`}
                            className="bg-red-500/80"
                        />
                    )}
                </div>

                {isAuthenticated && (
                    <button
                        onClick={handleFavoriteClick}
                        className={`absolute top-3 left-3 p-2 rounded-full 
                                backdrop-blur-sm transition-all z-20
                                ${isFavorite ? 'bg-red-500/20' : 'bg-black/50 hover:bg-red-500/20'}`}
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
                        ) : (
                            <Heart
                                className={`w-5 h-5 transition-transform
                                        ${isFavorite ? 'text-red-500 fill-red-500 scale-110' : 'text-white'}`}
                            />
                        )}
                    </button>
                )}

                {/* Color Selector */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-8">
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
                        maxVisible={2}
                    />
                </div>
            </div>

            {/* Product Info */}
            <div className="p-4 space-y-3">
                <h3 className="font-bold text-white text-lg line-clamp-2 
                            group-hover:text-blue-500 transition-colors text-right">
                    {product.name}
                </h3>

                <div className="flex items-baseline gap-2 justify-end">
                    <span className="text-lg font-bold text-blue-500">
                        {formatCurrency(product.discountPrice || product.basePrice)}
                    </span>
                    {product.discountPrice && (
                        <span className="text-sm text-gray-400 line-through">
                            {formatCurrency(product.basePrice)}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
});

// Product Grid Component
// Enhanced Product Grid Component
export const ProductGrid = memo(({ products, loading, error, onLoadMore, onProductSelect, checkAuthAndProceed }) => {
    const observerRef = useRef(null);
    const loadingRef = useRef(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const { refresh } = useProducts();


    // Handle infinite scroll
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

    // Error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-96 p-4">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">حدث خطأ</h3>
                <p className="text-gray-400 text-center mb-4">{error}</p>
                <button
                    onClick={refresh}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    // Initial loading state
    if (loading && (!products || products.length === 0)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-96">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                <p className="text-gray-400 mt-4">جاري تحميل المنتجات...</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-2 gap-4 p-4">
                <AnimatePresence>
                    {products.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onSelect={handleProductSelection}
                            checkAuthAndProceed={checkAuthAndProceed}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {/* Loading indicator */}
            {loading && (
                <div
                    ref={loadingRef}
                    className="flex items-center justify-center p-4"
                >
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
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


        </>
    );
});


// Product Sheet Component
// Enhanced Product Sheet Component
export const ProductSheet = memo(({
    product,
    isOpen,
    onClose,
    checkAuthAndProceed
}) => {
    const { getFavoriteStatus, toggleFavorite, isPending } = useFavorites();
    const { addToCart } = useContext(CartContext);
    const [selectedVariant, setSelectedVariant] = useState(product?.variants[0]);
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showImageViewer, setShowImageViewer] = useState(false);

    // Reset state when product changes
    useEffect(() => {
        if (isOpen && product) {
            setSelectedVariant(product.variants[0]);
            setSelectedSize(null);
            setQuantity(1);
            setCurrentImageIndex(0);
        }
    }, [isOpen, product]);

    const isFavorite = getFavoriteStatus(product?.id);
    const isLoading = isPending(product?.id);

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

        const canProceed = checkAuthAndProceed({
            requiresAuth: true,
            requiresAddress: true,
            onSuccess: () => {
                addToCart(product, selectedVariant, selectedSize.size, quantity);
                toast.success('تم إضافة المنتج للسلة');
                onClose();
            }
        });

        if (!canProceed) return;
    }, [
        product,
        selectedVariant,
        selectedSize,
        quantity,
        addToCart,
        onClose,
        checkAuthAndProceed
    ]);

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
                {/* Sheet Content */}
                <div className="p-6 space-y-6" dir="rtl">
                    {/* Image Gallery */}
                    <div className="relative aspect-square rounded-2xl overflow-hidden">
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
                                                ? 'bg-white w-4'
                                                : 'bg-white/50'}`}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Price Badge */}
                        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm 
                                     rounded-xl p-3 text-right">
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-white">
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
                                    <Tag className="w-4 h-4 text-red-500" />
                                    <span className="text-red-500 text-sm font-medium">
                                        خصم {discountPercentage}%
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Favorite Button */}
                        {/* Favorite Button */}
                        <button
                            onClick={handleFavoriteToggle}
                            className={`absolute top-4 left-4 p-2 rounded-full 
                                backdrop-blur-sm transition-all
                                ${isFavorite ? 'bg-red-500/20' : 'bg-black/50 hover:bg-red-500/20'}`}
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
                            ) : (
                                <Heart
                                    className={`w-5 h-5 transition-transform
                                ${isFavorite ? 'text-red-500 fill-red-500 scale-110' : 'text-white'}`}
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
                                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                        <span className="text-white font-bold">
                                            {product.rating.toFixed(1)}
                                        </span>
                                    </div>
                                )}
                                {product.ratingCount > 0 && (
                                    <span className="text-gray-400 text-sm">
                                        ({product.ratingCount} تقييم)
                                    </span>
                                )}
                            </div>
                            {product.salesCount > 0 && (
                                <span className="text-sm text-gray-400">
                                    {product.salesCount} عملية شراء
                                </span>
                            )}
                        </div>

                        <h1 className="text-2xl font-bold text-white">{product.name}</h1>

                        {product.description && (
                            <p className="text-gray-400 leading-relaxed">
                                {product.description}
                            </p>
                        )}
                    </div>

                    {/* Color Selection */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Palette className="w-5 h-5 text-blue-500" />
                                <h3 className="font-bold text-white">اللون</h3>
                            </div>
                            <span className="text-sm text-gray-400">
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
                                    <Ruler className="w-5 h-5 text-blue-500" />
                                    <h3 className="font-bold text-white">المقاس</h3>
                                </div>
                                <span className="text-sm text-gray-400">
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
                                <Check className="w-5 h-5 text-blue-500" />
                                <h3 className="font-bold text-white">مميزات المنتج</h3>
                            </div>

                            <div className="space-y-2">
                                {product.features.map((feature, index) => (
                                    <div key={index} className="bg-gray-800/50 rounded-xl p-3 
                                         flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 
                                             flex items-center justify-center flex-shrink-0">
                                            <Check className="w-4 h-4 text-blue-500" />
                                        </div>
                                        <span className="text-gray-300">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quantity & Add to Cart */}
                    <div className="space-y-4">
                        <div className="bg-gray-800/50 rounded-xl p-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                        className="w-10 h-10 rounded-xl bg-gray-800 text-white 
                                             flex items-center justify-center hover:bg-gray-700 
                                             transition-colors"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="text-xl font-bold text-white w-8 text-center">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity(prev => prev + 1)}
                                        className="w-10 h-10 rounded-xl bg-gray-800 text-white 
                                             flex items-center justify-center hover:bg-gray-700 
                                             transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-400">السعر الإجمالي</p>
                                    <span className="text-xl font-bold text-blue-500">
                                        {formatCurrency((product.discountPrice || product.basePrice) * quantity)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={handleAddToCart}
                            disabled={!selectedSize}
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 
                                   text-white rounded-xl py-4 font-bold hover:brightness-110 
                                   transition-all duration-300 disabled:opacity-50 
                                   disabled:cursor-not-allowed flex items-center 
                                   justify-center gap-2"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            <span>إضافة للسلة</span>
                        </button>
                    </div>

                    {/* Support Section */}
                    <button
                        onClick={() => window.open('https://wa.me/+201033939828', '_blank')}
                        className="w-full bg-green-500/10 text-green-500 rounded-xl p-4 
                               flex items-center justify-center gap-2 hover:brightness-110 
                               transition-all"
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