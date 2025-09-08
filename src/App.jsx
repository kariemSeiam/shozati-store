import React, { useEffect, useContext, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Toaster } from 'react-hot-toast';

// Core Components
import { AuthProvider, CartContext, CartProvider } from './hooks';
import { Header } from './HeaderComponent';
import PromotionalSlider from './PromotionalSlider';
import { CartSheet } from './CartProductComponent';
import HorizontalCategoryScroller from './HorizontalCategoryScroller';
import { useProducts, useSlides } from './hooks';

// Extracted Components
import FloatingActions from './components/layout/FloatingActions';
import ProductSection from './components/layout/ProductSection';
import ModalManager from './components/modals/ModalManager';

// Custom Hooks
import { useUIState } from './hooks/useUIState';
import { useAuthActions } from './hooks/useAuthActions';
import { useCategoryHandler } from './hooks/useCategoryHandler';



const MainContent = ({ productCode }) => {
  const { setIsCartOpen } = useContext(CartContext);
  
  // Custom hooks for cleaner state management
  const { 
    uiState, 
    closeModal, 
    openModal, 
    selectCategory, 
    selectProduct, 
    setOrderId 
  } = useUIState({ selectedCategory: 'all' });

  const {
    checkAuthAndProceed,
    handlePhoneVerification,
    handleLocationUpdate,
    isLoading,
    isAuthenticated,
    userInfo
  } = useAuthActions();

  const { 
    products, 
    loading: productsLoading, 
    loadMore,
    updateFilters,
    setPage,
    totalPages
  } = useProducts({
    initialFilters: productCode ? { code: productCode } : { category: 'all' }
  });

  const { slides, loading: slidesLoading } = useSlides();
  
  const { handleCategorySelect } = useCategoryHandler({
    updateFilters,
    setPage,
    selectCategory
  });

  // Event Handlers
  const handleProfileClick = useCallback(() => {
    openModal('showProfile');
  }, [openModal]);

  const handleOrdersClick = useCallback(() => {
    if (!isAuthenticated) {
      openModal('showLogin');
      return;
    }
    
    checkAuthAndProceed({
      requiresAuth: true,
      requiresAddress: true,
      onSuccess: () => openModal('showOrders'),
      onNoAddress: () => openModal('showLocation')
    });
  }, [checkAuthAndProceed, isAuthenticated, openModal]);

  const handleFavoritesClick = useCallback(() => {
    if (!isAuthenticated) {
      openModal('showLogin');
      return;
    }
    openModal('showFavorites');
  }, [isAuthenticated, openModal]);

  const handleCartClick = useCallback(() => {
    setIsCartOpen(true);
  }, [setIsCartOpen]);

  const handleProductSelect = useCallback((product) => {
    selectProduct(product);
  }, [selectProduct]);

  const handleOrderCreated = useCallback((orderId) => {
    setOrderId(orderId);
  }, [setOrderId]);

  // Enhanced modal close handler
  const handleModalClose = useCallback((modalType) => {
    closeModal(modalType);
  }, [closeModal]);

  // Enhanced phone verification handler
  const handlePhoneVerificationSuccess = useCallback(async (data) => {
    try {
      const result = await handlePhoneVerification(data);
      if (result.success) {
        closeModal('showLogin');
      }
    } catch {
      // Error already handled in useAuthActions
    }
  }, [handlePhoneVerification, closeModal]);

  // Enhanced location update handler
  const handleLocationUpdateSuccess = useCallback(async (data) => {
    try {
      const result = await handleLocationUpdate(data);
      if (result.success) {
        closeModal('showLocation');
      }
    } catch {
      // Error already handled in useAuthActions
    }
  }, [handleLocationUpdate, closeModal]);

  // Effect to handle initial product code
  useEffect(() => {
    if (productCode && products.length > 0) {
      const matchingProduct = products.find(p => p.code === productCode);
      if (matchingProduct) {
        selectProduct(matchingProduct);
      }
    }
  }, [productCode, products, selectProduct]);
  


  return (
    <div className="min-h-screen bg-white">
      <Toaster 
        position="top-center"
        toastOptions={{
          className: 'bg-white backdrop-blur-xl border border-gray-200 rounded-2xl px-6 py-4 shadow-lg',
          duration: 3000,
          style: {
            color: '#1e293b',
            fontSize: '14px',
            fontWeight: '500'
          }
        }} 
      />

      {/* Premium Header */}
      <header>
        <Header
          onOrdersClick={handleOrdersClick}
          onProfileClick={handleProfileClick}
        />
      </header>

      {/* Category Navigation */}
      <nav className="sticky top-0 z-10 bg-white/95 backdrop-blur-xl border-b border-gray-200">
        <HorizontalCategoryScroller
          selectedCategory={uiState.selectedCategory}
          onSelect={handleCategorySelect}
        />
      </nav>

      <main className="pb-24">
        {/* Promotional Slider */}
        <div className='p-4 pt-2 pb-2'>
          <PromotionalSlider
            slides={slides}
            loading={slidesLoading}
            onSelect={handleProductSelect}
          />
        </div>

        {/* Product Section */}
        <ProductSection
          products={products}
          productsLoading={productsLoading}
          selectedCategory={uiState.selectedCategory}
          totalPages={totalPages}
          loadMore={loadMore}
          onProductSelect={handleProductSelect}
          checkAuthAndProceed={checkAuthAndProceed}
          updateFilters={updateFilters}
          setPage={setPage}
          setSelectedCategory={selectCategory}
        />
      </main>

      {/* Floating Actions */}
      <FloatingActions
        onFavoritesClick={handleFavoritesClick}
        onCartClick={handleCartClick}
      />

      {/* Cart Sheet */}
      <CartSheet
        onOrderCreated={handleOrderCreated}
        checkAuthAndProceed={checkAuthAndProceed}
      />

      {/* Modal Manager */}
      <ModalManager
        uiState={uiState}
        userInfo={userInfo}
        isLoading={isLoading}
        onCloseModal={handleModalClose}
        onPhoneVerification={handlePhoneVerificationSuccess}
        onLocationUpdate={handleLocationUpdateSuccess}
        onProductSelect={handleProductSelect}
        checkAuthAndProceed={checkAuthAndProceed}
      />
    </div>
  );
};

MainContent.propTypes = {
  productCode: PropTypes.string
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

App.propTypes = {
  productCode: PropTypes.string
};

export default App;