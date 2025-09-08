import { useState, useCallback } from 'react';

const initialUIState = {
  selectedCategory: 'all',
  showProfile: false,
  showOrders: false,
  showFavorites: false,
  showLogin: false,
  showLocation: false,
  selectedProduct: null,
  newOrderId: null
};

export const useUIState = (initialState = {}) => {
  const [uiState, setUiState] = useState({
    ...initialUIState,
    ...initialState
  });

  const updateUIState = useCallback((updates) => {
    setUiState(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleModal = useCallback((modalType, isOpen) => {
    setUiState(prev => ({ ...prev, [modalType]: isOpen }));
  }, []);

  const closeModal = useCallback((modalType) => {
    setUiState(prev => ({
      ...prev,
      [modalType]: false,
      ...(modalType === 'showOrders' ? { newOrderId: null } : {}),
      ...(modalType === 'selectedProduct' ? { selectedProduct: null } : {})
    }));
  }, []);

  const openModal = useCallback((modalType, data = {}) => {
    setUiState(prev => ({ ...prev, [modalType]: true, ...data }));
  }, []);

  const selectCategory = useCallback((category) => {
    setUiState(prev => ({ ...prev, selectedCategory: category }));
  }, []);

  const selectProduct = useCallback((product) => {
    setUiState(prev => ({ ...prev, selectedProduct: product }));
  }, []);

  const setOrderId = useCallback((orderId) => {
    setUiState(prev => ({ ...prev, newOrderId: orderId, showOrders: true }));
  }, []);

  const resetToDefault = useCallback(() => {
    setUiState(initialUIState);
  }, []);

  return {
    uiState,
    updateUIState,
    toggleModal,
    closeModal,
    openModal,
    selectCategory,
    selectProduct,
    setOrderId,
    resetToDefault
  };
};