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
    // Short timeout to allow exit animation to play
    setTimeout(onClose, 200);
  }, [onClose]);

  if (loading && favorites.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gray-900 z-40 flex items-center justify-center"
      >
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-gray-900 z-40"
    >
      <div className="h-full flex flex-col">
        <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
          <div className="px-4 py-4">
            <div className="flex justify-between items-center">
              <button 
                onClick={handleClose}
                className="p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-white">المفضلة</h2>
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
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
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
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 mx-auto mb-6 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-blue-500/0 animate-spin-slow rounded-full" />
                  <Heart className="w-12 h-12 text-blue-500 relative z-10" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  قائمة المفضلة فارغة
                </h3>
                <p className="text-gray-400 mb-6">
                  اكتشف منتجاتنا وأضف ما يعجبك إلى المفضلة
                </p>
                <button 
                  onClick={handleClose}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl px-8 py-3 font-bold hover:brightness-110 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-blue-500/25"
                >
                  تسوق الآن
                </button>
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