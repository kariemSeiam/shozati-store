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
import RamadanCountdown from './RamadanCountdown';
import PromotionalSlider from './PromotionalSlider';
import { OrdersView } from './OrdersComponent';
import { FavoritesView } from './FavoritesComponent';
import { useProducts, useSlides } from './hooks';
import { CartSheet } from './CartProductComponent';


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

// Enhanced Category Selector
const CategorySelector = ({ selectedCategory, onSelect }) => {
  return (
    <div className="px-4 py-2">
      <div className="flex gap-4 bg-gradient-to-r from-sky-50/90 to-white/90 p-1.5 rounded-2xl 
                    backdrop-blur-md shadow-lg shadow-sky-100/50">
        {/* Women's Category */}
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={() => onSelect('women')}
          className={`relative flex-1 py-3 rounded-xl text-sm font-medium overflow-hidden
                     transition-all duration-300 ${
            selectedCategory === 'women'
              ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-lg shadow-sky-400/25'
              : 'bg-sky-50/50 text-sky-700 hover:bg-sky-100/50'
          }`}
        >
          {selectedCategory === 'women' && <ShimmerEffect />}
          <span className="relative flex items-center justify-center gap-2">
            حريمي
            {selectedCategory === 'women' && (
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
            )}
          </span>
        </motion.button>

        {/* Men's Category (Locked) */}
        <button
          disabled
          className="relative flex-1 py-3 rounded-xl text-sm font-medium bg-sky-50/30 
                     text-sky-700/50 overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-sky-300/5 to-sky-400/5" />
          <div className="relative flex items-center justify-center gap-2">
            <span>رجالي</span>
            <Lock className="w-4 h-4 opacity-70" />
          </div>

          {/* Coming Soon Badge */}
          <div className="absolute -top-1 -right-1">
            <div className="relative">
              <motion.div
                className="absolute -inset-1.5 bg-gradient-to-r from-sky-500 to-sky-600 
                           rounded-full blur-sm opacity-30"
                animate={{
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, repeatType: "reverse" }
                }}
              />
              <div className="relative bg-sky-50/95 text-sky-600 text-[10px] py-0.5 px-2 
                            rounded-full font-medium shadow-sm">
                قريباً
              </div>
            </div>
          </div>
          <div className="absolute inset-0 rounded-xl ring-1 ring-sky-200/20" />
        </button>
      </div>
    </div>
  );
};

// Enhanced Subcategory Selector
const SubcategorySelector = ({ onSelect }) => {
  const [selectedType, setSelectedType] = useState('casual');

  const bagTypes = [
    {
      id: 'casual',
      name: 'شنط كاجوال',
      icon: ShoppingBasket,
      available: true
    },
    {
      id: 'evening',
      name: 'شنط سهرة',
      icon: PackageSearch,
      available: true
    },
    {
      id: 'travel',
      name: 'شنط سفر',
      icon: Luggage,
      available: false,
      comingSoon: true
    }
  ];

  return (
    <div className="px-4 py-2">
      <div className="relative overflow-hidden">
        {/* Category Label */}
        <div className="mb-2 flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-sky-600" />
          <span className="text-sm font-medium text-sky-900">الشنط</span>
        </div>

        {/* Subcategory List */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {bagTypes.map((type) => (
            <motion.button
              key={type.id}
              onClick={() => type.available && onSelect?.(type.id)}
              variants={buttonVariants}
              whileHover={type.available ? "hover" : {}}
              whileTap={type.available ? "tap" : {}}
              className={`relative flex-none px-4 py-2 rounded-xl text-sm font-medium 
                         transition-all duration-300 ${
                type.available
                  ? selectedType === type.id
                    ? 'bg-gradient-to-r from-sky-500/10 to-sky-600/10 text-sky-600'
                    : 'hover:bg-sky-50 text-sky-700'
                  : 'opacity-80'
              }`}
            >
              {selectedType === type.id && <ShimmerEffect />}
              
              <div className="relative flex items-center gap-2">
                <motion.div
                  animate={
                    selectedType === type.id
                      ? {
                          rotate: [0, -10, 10, 0],
                          transition: {
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse"
                          }
                        }
                      : {}
                  }
                >
                  <type.icon className={`w-4 h-4 ${
                    type.available 
                      ? selectedType === type.id 
                        ? 'text-sky-500' 
                        : 'text-sky-600'
                      : 'text-sky-400'
                  }`} />
                </motion.div>

                <span>{type.name}</span>

                {!type.available && type.comingSoon && (
                  <div className="relative">
                    <GlowEffect color="bg-sky-400/20" scale={0.2} />
                    <Lock className="w-3.5 h-3.5 text-sky-400" />
                  </div>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Fade Edges */}
        <div className="absolute top-0 right-0 w-12 h-full bg-gradient-to-l from-white to-transparent pointer-events-none" />
        <div className="absolute top-0 left-0 w-12 h-full bg-gradient-to-r from-white to-transparent pointer-events-none" />
      </div>
    </div>
  );
};


const MainContent = ({ productCode }) => {
  const { userInfo, isAuthenticated, login, updateAddress, addAddress } = useContext(AuthContext);
  const { isCartOpen, setIsCartOpen } = useContext(CartContext);
  const { products, loading: productsLoading, loadMore } = useProducts({
    initialFilters: productCode ? { code: productCode } : {}
  });
  const { slides, loading: slidesLoading } = useSlides();
  
  const [isLoading, setIsLoading] = useState(false);

  const [uiState, setUiState] = useState({
    selectedCategory: 'women',
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

     {/* Category Navigation */}
     <nav>
        <CategorySelector
          selectedCategory={uiState.selectedCategory}
          onSelect={(category) =>
            setUiState(prev => ({ ...prev, selectedCategory: category }))
          }
        />
      </nav>

      <main className="pb-24">
        <RamadanCountdown />

        <div className= 'p-4 pt-2 pb-2'>
        <PromotionalSlider
          slides={slides}
          loading={slidesLoading}
          onSelect={handleProductSelect}
        />
        </div>

        <ProductGrid
          products={products}
          loading={productsLoading}
          onLoadMore={loadMore}
          onProductSelect={handleProductSelect}
          checkAuthAndProceed={checkAuthAndProceed}
        />
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