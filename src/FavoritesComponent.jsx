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
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xl border-b border-neutral-200 shadow-sm">
          <div className="px-4 py-4">
            <div className="flex justify-between items-center">
              <motion.button
                onClick={handleClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl bg-neutral-50 text-slate-600 
                         hover:bg-neutral-100 hover:text-slate-800 transition-all duration-200"
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
                className="flex flex-col items-center justify-center py-16 px-6 min-h-[400px] bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 rounded-2xl"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
                  <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-primary-100/20 rounded-full blur-2xl animate-pulse"></div>
                  <div className="absolute bottom-1/4 right-1/4 w-20 h-20 bg-primary-200/20 rounded-full blur-xl animate-pulse delay-1000"></div>
                </div>

                {/* Main Content */}
                <div className="relative z-10 flex flex-col items-center text-center max-w-sm mx-auto">
                  {/* Icon Container */}
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/10 via-primary-400/10 to-primary-600/10 
                                  flex items-center justify-center shadow-xl shadow-primary-500/10 border border-primary-200/30
                                  backdrop-blur-sm">
                      <Heart className="w-10 h-10 text-primary-600" />
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-neutral-800 leading-tight">
                      قائمة المفضلة فارغة
                    </h3>
                    <p className="text-neutral-600 text-base leading-relaxed">
                      اكتشف منتجاتنا وأضف ما يعجبك إلى المفضلة
                    </p>
                  </div>

                  {/* Decorative Line */}
                  <div className="mt-6 w-16 h-0.5 bg-gradient-to-r from-transparent via-primary-400 to-transparent rounded-full"></div>

                  {/* Action Button */}
                  <motion.button
                    onClick={handleClose}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-6 btn-primary"
                  >
                    تسوق الآن
                  </motion.button>
                </div>
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