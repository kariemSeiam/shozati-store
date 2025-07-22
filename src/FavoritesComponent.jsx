import React, { useState, useRef, useCallback } from 'react';
import { Heart, X, Loader2 } from 'lucide-react';
import { useFavorites } from './hooks';
import { ProductCard } from './ProductComponent';
import { motion, AnimatePresence } from 'framer-motion';

export const FavoritesView = ({ onClose, onProductSelect, checkAuthAndProceed }) => {
  const { favorites, loading, loadMore, pagination, error } = useFavorites();
  const [isExiting, setIsExiting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const loadingRef = useRef(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(onClose, 200);
  }, [onClose]);

  if (loading && favorites.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-white z-40 flex items-center justify-center"
      >
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-primary-200 
                       animate-spin border-t-primary-500 shadow-lg" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Heart className="w-6 h-6 text-primary-500" />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-white z-40"
    >
      <div className="h-full flex flex-col">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm">
          <div className="px-4 py-4">
            <div className="flex justify-between items-center">
              <motion.button 
                onClick={handleClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl bg-gray-50 text-slate-600 
                         hover:bg-gray-100 hover:text-slate-800 transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </motion.button>
              <h2 className="text-2xl font-bold text-slate-800">المفضلة</h2>
              <div className="w-10" /> {/* Spacer for alignment */}
            </div>
          </div>
        </div>

        <motion.div 
          className="flex-1 overflow-auto pb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="p-4 space-y-4">
            {favorites.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {favorites.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelect={() => {
                        setSelectedProduct(product);
                        onProductSelect?.(product);
                      }}
                      checkAuthAndProceed={checkAuthAndProceed}
                    />
                  ))}
                </div>
                
                {loading && (
                  <div className="flex justify-center py-4">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full border-3 border-primary-200 
                                   animate-spin border-t-primary-500" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Heart className="w-4 h-4 text-primary-500" />
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <motion.div 
                className="text-center py-12"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-50 to-white 
                             mx-auto mb-6 flex items-center justify-center relative overflow-hidden
                             border border-primary-200 shadow-lg shadow-primary-200/20">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary-400/20 to-primary-400/0 
                               animate-spin-slow rounded-full" />
                  <Heart className="w-12 h-12 text-primary-500 relative z-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  قائمة المفضلة فارغة
                </h3>
                <p className="text-slate-600 mb-6">
                  اكتشف منتجاتنا وأضف ما يعجبك إلى المفضلة
                </p>
                <motion.button 
                  onClick={handleClose}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary"
                >
                  تسوق الآن
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {selectedProduct && (
        <ProductSheet
          product={selectedProduct}
          isOpen={true}
          onClose={() => setSelectedProduct(null)}
          checkAuthAndProceed={checkAuthAndProceed}
        />
      )}
    </motion.div>
  );
};

export default FavoritesView;