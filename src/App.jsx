import React, { useState, useEffect, useContext, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
  Heart,
  ShoppingCart, Briefcase, ShoppingBasket,
  Lock, Sparkles, Star,PackageSearch ,ShoppingBag ,
  Luggage
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { AuthContext, AuthProvider, CartContext, CartProvider } from './hooks';
import { Header } from './HeaderComponent';
import { ProductGrid, ProductSheet } from './ProductComponent';
import { LocationInputSheet, PhoneVerificationSheet, ProfileSheet } from './ProfileComponent';
import PromotionalSlider from './PromotionalSlider';
import { OrdersView } from './OrdersComponent';
import { FavoritesView } from './FavoritesComponent';
import { useProducts, useSlides } from './hooks';
import { CartSheet } from './CartProductComponent';
import HorizontalCategoryScroller from './HorizontalCategoryScroller';


// Premium Animation Variants
const buttonVariants = {
  hover: {
    scale: 1.05,
    rotate: [0, -3, 3, 0],
    transition: {
      rotate: {
        repeat: Infinity,
        duration: 2,
        repeatType: "reverse"
      }
    }
  },
  tap: { scale: 0.95 }
};

// Shared Components
const GlowEffect = ({ color, scale = 1 }) => (
  <motion.div
    className={`absolute inset-0 rounded-full blur-xl ${color}`}
    animate={{
      opacity: [0.3, 0.6, 0.3],
      scale: [0.85 * scale, 1.1 * scale, 0.85 * scale],
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      repeatType: "reverse"
    }}
  />
);

const ShimmerEffect = () => (
  <motion.div
    className="absolute inset-0 opacity-30"
    style={{
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
      backgroundSize: '200% 100%'
    }}
    animate={{
      backgroundPosition: ['200% 0', '-200% 0']
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      ease: 'linear'
    }}
  />
);


const badgeVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 20 }
  },
  exit: { 
    scale: 0, 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};
// Reusable components
const ButtonGlow = () => (
  <div className="absolute inset-0 bg-sky-400/20 blur-xl rounded-full" />
);

const ButtonHighlight = () => (
  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
);

const QuantityBadge = ({ quantity }) => (
  <div className="absolute -top-2 -right-2">
    <motion.div
      variants={badgeVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative"
    >
      <ButtonGlow />
      <div className="relative w-6 h-6 rounded-full bg-gradient-to-r from-sky-600 to-sky-700
                    flex items-center justify-center">
        <span className="text-white text-xs font-bold">
          {quantity > 99 ? '99+' : quantity}
        </span>
      </div>
    </motion.div>
  </div>
);

const FloatingActions = ({ onFavoritesClick, onCartClick }) => {
  const { cart } = useContext(CartContext);
  const cartQuantity = cart?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-20" role="group" aria-label="Floating actions">
      <motion.button
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={onFavoritesClick}
        className="relative w-14 h-14 rounded-full bg-gradient-to-r from-sky-500 to-sky-600 
                   flex items-center justify-center shadow-lg group"
        aria-label="Favorites"
      >
        <ButtonGlow />
        <ButtonHighlight />
        <Heart className="w-6 h-6 text-white" />
      </motion.button>

      <motion.button
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={onCartClick}
        className="relative w-14 h-14 rounded-full bg-gradient-to-r from-sky-500 to-sky-600 
                   flex items-center justify-center shadow-lg group"
        aria-label={`Cart with ${cartQuantity} items`}
      >
        <ButtonGlow />
        <ButtonHighlight />
        <ShoppingCart className="w-6 h-6 text-white" />
        
        <AnimatePresence>
          {cartQuantity > 0 && (
            <QuantityBadge quantity={cartQuantity} />
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};



const MainContent = ({ productCode }) => {
  const { userInfo, isAuthenticated, login, updateAddress, addAddress } = useContext(AuthContext);
  const { isCartOpen, setIsCartOpen } = useContext(CartContext);
  const { 
    products, 
    loading: productsLoading, 
    loadMore,
    updateFilters,
    filters,
    setPage,
    page,
    totalPages
  } = useProducts({
    initialFilters: productCode ? { code: productCode } : { category: 'all' } // Default to all products
  });
  const { slides, loading: slidesLoading } = useSlides();
  
  const [isLoading, setIsLoading] = useState(false);

  const [uiState, setUiState] = useState({
    selectedCategory: 'all',
    showProfile: false,
    showOrders: false,
    showFavorites: false,
    showLogin: false,
    showLocation: false,
    selectedProduct: null,
    newOrderId: null
  });

  const handlePhoneVerification = async (data) => {
    setIsLoading(true);
    try {
      const loginSuccess = await login(data.phone_number);
      
      if (loginSuccess) {
        setUiState(prev => ({ ...prev, showLogin: false }));
      }
    } catch (error) {
      toast.error(error.message || 'فشل تسجيل الدخول');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationUpdate = async (data) => {
    setIsLoading(true);
    try {
      if (userInfo?.addresses?.length > 0) {
        await updateAddress(userInfo.addresses[0].id, {
          ...data,
          is_default: true
        });
      } else {
        await addAddress({
          ...data,
          is_default: true
        });
      }
      setUiState(prev => ({ ...prev, showLocation: false }));
      toast.success('تم تحديث العنوان بنجاح');
    } catch (error) {
      toast.error(error.message || 'فشل تحديث العنوان');
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuthAndProceed = useCallback((options = {}) => {
    const {
      requiresAuth = true,
      requiresAddress = false,
      onSuccess,
      onNotAuthenticated,
      onNoAddress
    } = options;

    if (requiresAuth && !isAuthenticated) {
      if (onNotAuthenticated) {
        onNotAuthenticated();
      } else {
        setUiState(prev => ({ ...prev, showLogin: true }));
      }
      return false;
    }

    if (requiresAddress && !userInfo?.addresses?.length) {
      if (onNoAddress) {
        onNoAddress();
      } else {
        toast.error('يرجى إضافة عنوان التوصيل أولاً');
        setUiState(prev => ({ ...prev, showLocation: true }));
      }
      return false;
    }

    if (onSuccess) {
      onSuccess();
    }

    return true;
  }, [isAuthenticated, userInfo?.addresses]);

  const handleProfileClick = useCallback(() => {
    setUiState(prev => ({ ...prev, showProfile: true }));
  }, []);

  const handleOrdersClick = useCallback(() => {
    if (!isAuthenticated) {
      setUiState(prev => ({ ...prev, showLogin: true }));
      return;
    }
    
    checkAuthAndProceed({
      requiresAuth: true,
      requiresAddress: true,
      onSuccess: () => {
        setUiState(prev => ({ ...prev, showOrders: true }));
      }
    });
  }, [checkAuthAndProceed, isAuthenticated]);

  const handleFavoritesClick = useCallback(() => {
    if (!isAuthenticated) {
      
      setUiState(prev => ({ ...prev, showLogin: true }));
      return;
    }

    setUiState(prev => ({ ...prev, showFavorites: true }));
  }, [isAuthenticated]);

  const handleCartClick = useCallback(() => {
    setIsCartOpen(true);
  }, [setIsCartOpen]);

  const handleProductSelect = useCallback((product) => {
    setUiState(prev => ({ ...prev, selectedProduct: product }));
  }, []);

  const handleOrderCreated = useCallback((orderId) => {
    setUiState(prev => ({
      ...prev,
      newOrderId: orderId,
      showOrders: true
    }));
  }, []);

    // Enhanced category selection handler for the horizontal chip scroller
    const handleCategorySelect = useCallback((category) => {
      setUiState(prev => ({ ...prev, selectedCategory: category }));
      
      // Update filters to trigger a product fetch with the selected category
      updateFilters({ 
        category: category === 'all' ? '' : category, // 'all' means no category filter
        // Reset other filters when changing categories for a clean slate
        search: '',
        minPrice: null,
        maxPrice: null,
        size: '',
        color: ''
      });
      
      // Return to the first page when changing categories
      setPage(1);
      
      // Show loading toast to improve UX for slower connections
      let categoryName;
      switch(category) {
        case 'women': categoryName = 'حريمي'; break;
        case 'men': categoryName = 'رجالي'; break;
        case 'all': categoryName = 'كل المنتجات'; break;
        default: categoryName = category;
      }
      
      toast.loading(`جاري تحميل ${categoryName}...`, {
        id: 'category-loading',
        duration: 1000
      });
    }, [updateFilters, setPage]);

  const handleModalClose = useCallback((modalType) => {
    setUiState(prev => ({
      ...prev,
      [modalType]: false,
      ...(modalType === 'showOrders' ? { newOrderId: null } : {})
    }));
  }, []);

  // Effect to handle initial product code
  useEffect(() => {
    const handleInitialProductCode = async () => {
      if (productCode && products.length > 0) {
        // Find the product with matching code
        const matchingProduct = products.find(p => p.code === productCode);
        if (matchingProduct) {
          setUiState(prev => ({ ...prev, selectedProduct: matchingProduct }));
        }
      }
    };

    handleInitialProductCode();
  }, [productCode, products]);
  


  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-sky-50">
      <Toaster 
        position="top-center"
        toastOptions={{
          className: 'bg-white shadow-xl rounded-xl px-4 py-3',
          duration: 3000,
        }} 
      />

    {/* Premium Header */}
    <header >
        <Header
          onOrdersClick={handleOrdersClick}
          onProfileClick={handleProfileClick}
        />
      </header>

     {/* NEW: Horizontal Category Scroller - replaces both category and subcategory selectors */}
     <nav className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm shadow-sm">
        <HorizontalCategoryScroller
          selectedCategory={uiState.selectedCategory}
          onSelect={handleCategorySelect}
        />
      </nav>

      <main className="pb-24">
        
        <div className= 'p-4 pt-2 pb-2'>
        <PromotionalSlider
          slides={slides}
          loading={slidesLoading}
          onSelect={handleProductSelect}
        />
        </div>

       {/* Product Grid with Category Indicator */}
       <div className="px-6 pt-4 flex items-center justify-between" dir='rtl'>
          <h2 className="text-lg font-bold text-sky-900">
            {uiState.selectedCategory === 'all' 
              ? 'كل المنتجات' 
              : uiState.selectedCategory === 'women' 
                ? 'منتجات حريمي' 
                : uiState.selectedCategory === 'men' 
                  ? 'منتجات رجالي'
                  : `منتجات ${uiState.selectedCategory}`}
          </h2>
          
          {/* Products count */}
          {products.length > 0 && (
            <div className="text-sm text-sky-600">
              {totalPages > 1 ? `${products.length} من ${totalPages * products.length}` : `${products.length} منتج`}
            </div>
          )}
        </div>

        {/* Empty state message when no products are found */}
        {!productsLoading && products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <ShoppingBag className="w-16 h-16 text-sky-200 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد منتجات</h3>
            <p className="text-gray-600 text-center mb-6">
              لم نتمكن من العثور على منتجات في هذه الفئة
            </p>
            <button
              onClick={() => {
                // Reset filters to show all products
                updateFilters({ 
                  category: '',
                  subcategory: '',
                  search: '' 
                });
                setUiState(prev => ({ ...prev, selectedCategory: 'all' }));
              }}
              className="px-6 py-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600 
                        transition-all duration-300 shadow-lg"
            >
              عرض كل المنتجات
            </button>
          </div>
        ) : (
          <ProductGrid
            products={products}
            loading={productsLoading}
            onLoadMore={loadMore}
            onProductSelect={handleProductSelect}
            checkAuthAndProceed={checkAuthAndProceed}
            currentCategory={uiState.selectedCategory}
          />
        )}
      </main>

      <FloatingActions
        onFavoritesClick={handleFavoritesClick}
        onCartClick={handleCartClick}
      />

      {/* Bottom Sheets */}
      <CartSheet
        onOrderCreated={handleOrderCreated}
        checkAuthAndProceed={checkAuthAndProceed}
      />

      <AnimatePresence mode="wait">
        {uiState.showProfile && (
          <ProfileSheet
            isOpen={true}
            onClose={() => handleModalClose('showProfile')}
            onOpenOrders={() => {
              handleModalClose('showProfile');
              setUiState(prev => ({ ...prev, showOrders: true }));
            }}
            onOpenFavorites={() => {
              handleModalClose('showProfile');
              setUiState(prev => ({ ...prev, showFavorites: true }));
            }}
            onOpenLocation={() => {
              handleModalClose('showProfile');
              setUiState(prev => ({ ...prev, showLocation: true }));
            }}
            onOpenLogin={() => {
              handleModalClose('showProfile');
              setUiState(prev => ({ ...prev, showLogin: true }));
            }}
          />
        )}

        {uiState.selectedProduct && (
          <ProductSheet
            product={uiState.selectedProduct}
            isOpen={true}
            onClose={() => handleModalClose('selectedProduct')}
            checkAuthAndProceed={checkAuthAndProceed}
          />
        )}

        {uiState.showOrders && (
          <OrdersView
            onClose={() => handleModalClose('showOrders')}
            initialOrderId={uiState.newOrderId}
          />
        )}

        {uiState.showFavorites && (
          <FavoritesView
            onClose={() => handleModalClose('showFavorites')}
            onProductSelect={handleProductSelect}
            checkAuthAndProceed={checkAuthAndProceed}
          />
        )}

        {uiState.showLogin && (
          <PhoneVerificationSheet
            isOpen={true}
            onClose={() => handleModalClose('showLogin')}
            onVerified={handlePhoneVerification}
            isLoading={isLoading}
            isLogin={true}
          />
        )}

        {uiState.showLocation && (
          <LocationInputSheet
            isOpen={true}
            onClose={() => handleModalClose('showLocation')}
            onUpdate={handleLocationUpdate}
            initialAddress={userInfo?.addresses?.[0]}
            isLoading={isLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
};


const App = ({ productCode }) => {
  return (
    <AuthProvider>
      <CartProvider>
        <MainContent productCode={productCode} />
      </CartProvider>
    </AuthProvider>
  );
};

export default App;