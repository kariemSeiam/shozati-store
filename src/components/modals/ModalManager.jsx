import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { ProfileSheet, LocationInputSheet, PhoneVerificationSheet } from '../../ProfileComponent';
import { ProductSheet } from '../../ProductComponent';
import { OrdersView } from '../../OrdersComponent';
import { FavoritesView } from '../../FavoritesComponent';

const ModalManager = React.memo(({
  uiState,
  userInfo,
  isLoading,
  onCloseModal,
  onPhoneVerification,
  onLocationUpdate,
  onProductSelect,
  checkAuthAndProceed
}) => {
  return (
    <AnimatePresence mode="wait">
      {uiState.showProfile && (
        <ProfileSheet
          isOpen={true}
          onClose={() => onCloseModal('showProfile')}
          onOpenOrders={() => {
            onCloseModal('showProfile');
            onCloseModal('showOrders', true);
          }}
          onOpenFavorites={() => {
            onCloseModal('showProfile');
            onCloseModal('showFavorites', true);
          }}
          onOpenLocation={() => {
            onCloseModal('showProfile');
            onCloseModal('showLocation', true);
          }}
          onOpenLogin={() => {
            onCloseModal('showProfile');
            onCloseModal('showLogin', true);
          }}
        />
      )}

      {uiState.selectedProduct && (
        <ProductSheet
          product={uiState.selectedProduct}
          isOpen={true}
          onClose={() => onCloseModal('selectedProduct')}
          checkAuthAndProceed={checkAuthAndProceed}
        />
      )}

      {uiState.showOrders && (
        <OrdersView
          onClose={() => onCloseModal('showOrders')}
          initialOrderId={uiState.newOrderId}
        />
      )}

      {uiState.showFavorites && (
        <FavoritesView
          onClose={() => onCloseModal('showFavorites')}
          onProductSelect={onProductSelect}
          checkAuthAndProceed={checkAuthAndProceed}
        />
      )}

      {uiState.showLogin && (
        <PhoneVerificationSheet
          isOpen={true}
          onClose={() => onCloseModal('showLogin')}
          onVerified={onPhoneVerification}
          isLoading={isLoading}
          isLogin={true}
        />
      )}

      {uiState.showLocation && (
        <LocationInputSheet
          isOpen={true}
          onClose={() => onCloseModal('showLocation')}
          onUpdate={onLocationUpdate}
          initialAddress={userInfo?.addresses?.[0]}
          isLoading={isLoading}
        />
      )}
    </AnimatePresence>
  );
});

ModalManager.displayName = 'ModalManager';

export default ModalManager;