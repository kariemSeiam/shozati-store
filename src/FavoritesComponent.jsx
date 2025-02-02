import React, { useState, useRef, useCallback } from 'react';
import { Heart, X, Loader2 } from 'lucide-react';
import { useFavorites } from './hooks';
import { ProductCard } from './ProductComponent';

// Intersection Observer component for infinite scroll
const LoadingTrigger = ({ onIntersect }) => {
  const triggerRef = useRef(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onIntersect();
        }
      },
      { threshold: 0.1 }
    );

    if (triggerRef.current) {
      observer.observe(triggerRef.current);
    }

    return () => {
      if (triggerRef.current) {
        observer.unobserve(triggerRef.current);
      }
    };
  }, [onIntersect]);

  return <div ref={triggerRef} className="h-4 w-full" />;
};

export const FavoritesView = ({ onClose, onProductSelect, checkAuthAndProceed }) => {
  const { 
    favorites, 
    loading, 
    loadMore, 
    pagination,
    error 
  } = useFavorites();
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const loadingRef = useRef(false);

  const handleLoadMore = useCallback(() => {
    if (!loading && !loadingRef.current && pagination.hasMore) {
      loadingRef.current = true;
      loadMore().finally(() => {
        loadingRef.current = false;
      });
    }
  }, [loading, loadMore, pagination.hasMore]);

  // Show initial loading state
  if (loading && favorites.length === 0) {
    return (
      <div className="fixed inset-0 bg-gray-900 z-40 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 z-40">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
          <div className="px-4 py-4">
            <div className="flex justify-between items-center">
              <button 
                onClick={onClose} 
                className="p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-white">المفضلة</h2>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto pb-8">
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
                
                {/* Loading trigger for infinite scroll */}
                {pagination.hasMore && (
                  <LoadingTrigger onIntersect={handleLoadMore} />
                )}
                
                {/* Loading indicator */}
                {loading && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
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
                  onClick={onClose}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl px-8 py-3 font-bold hover:brightness-110 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-blue-500/25"
                >
                  تسوق الآن
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Details Sheet */}
      {selectedProduct && (
        <ProductSheet
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          checkAuthAndProceed={checkAuthAndProceed}
        />
      )}
    </div>
  );
};

export default FavoritesView;