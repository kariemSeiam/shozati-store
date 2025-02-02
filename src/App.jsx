import React, { useState, useEffect, useContext, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
  Heart,
  ShoppingCart,
  Lock, Sparkles, Star
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

const FloatingActions = ({ onFavoritesClick, onCartClick }) => {
  const { cart } = useContext(CartContext);

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-4">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onFavoritesClick}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center shadow-lg shadow-red-500/25"
      >
        <Heart className="w-6 h-6 text-white" />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onCartClick}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25 relative"
      >
        <ShoppingCart className="w-6 h-6 text-white" />
        <AnimatePresence mode='wait'>
          {cart?.length > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-sm font-bold flex items-center justify-center"
            >
              {cart.length}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

const CategorySelector = ({ selectedCategory, onSelect }) => {
  return (
    <div className="px-3 py-1.5">
      <div className="flex gap-4 bg-gray-900/40 p-1 rounded-2xl backdrop-blur-sm">
        <button
          onClick={() => onSelect('women')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${selectedCategory === 'women'
            ? 'bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 text-white shadow-lg shadow-blue-500/20 scale-[1.02]'
            : 'bg-gray-800/30 text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
            }`}
        >
          <span className="flex items-center justify-center gap-2">
            حريمي
            {selectedCategory === 'women' && (
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            )}
          </span>
        </button>

        <button
          disabled
          className="relative flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-800/20 text-gray-500 overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 " />

          <div className="relative flex items-center justify-center gap-2">
            <span>رجالي</span>
            <Lock className="w-3.5 h-3.5 opacity-70" />
          </div>

          <div className="absolute -top-0.5 -right-0.5">
            <div className="relative">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-spin blur-sm opacity-30" />
              <div className="relative bg-gray-900/90 text-blue-400 text-[10px] py-0.5 px-1.5 rounded-full font-medium">
                قريباً
              </div>
            </div>
          </div>

          <div className="absolute inset-0 rounded-xl ring-1 ring-white/5" />
        </button>
      </div>
    </div>
  );
};

const MainContent = () => {
  const { userInfo, isAuthenticated, login, updateAddress, addAddress } = useContext(AuthContext);
  const { isCartOpen, setIsCartOpen } = useContext(CartContext);
  const { products, loading: productsLoading, loadMore } = useProducts();
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
    checkAuthAndProceed({
      requiresAuth: true,
      requiresAddress: true,
      onSuccess: () => {
        setIsCartOpen(true);
      }
    });
  }, [checkAuthAndProceed, setIsCartOpen]);

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

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Toaster position="top-center" />

      {/* Main Layout */}
      <Header
        onOrdersClick={handleOrdersClick}
        onProfileClick={handleProfileClick}
      />

      <CategorySelector
        selectedCategory={uiState.selectedCategory}
        onSelect={(category) =>
          setUiState(prev => ({ ...prev, selectedCategory: category }))
        }
      />

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


const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <MainContent />
      </CartProvider>
    </AuthProvider>
  );
};

export default App;