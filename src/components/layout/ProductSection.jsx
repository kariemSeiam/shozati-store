import React from 'react';
import { ProductGrid } from '../../ProductComponent';
import EmptyState from '../ui/EmptyState';

const ProductSection = React.memo(({
  products,
  productsLoading,
  selectedCategory,
  totalPages,
  loadMore,
  onProductSelect,
  checkAuthAndProceed,
  updateFilters,
  setPage,
  setSelectedCategory
}) => {
  const getCategoryTitle = (category) => {
    switch (category) {
      case 'all': return 'كل المنتجات';
      case 'women': return 'منتجات حريمي';
      case 'men': return 'منتجات رجالي';
      default: return `منتجات ${category}`;
    }
  };

  const getProductsCount = () => {
    if (totalPages > 1) {
      return `${products.length} من ${totalPages * products.length}`;
    }
    return `${products.length} منتج`;
  };


  return (
    <>
      {/* Product Grid Header */}
      <div className="px-6 pt-4 flex items-center justify-between" dir='rtl'>
        <h2 className="text-lg font-bold text-slate-800">
          {getCategoryTitle(selectedCategory)}
        </h2>

        {/* Products count */}
        {products.length > 0 && (
          <div className="text-sm text-slate-600">
            {getProductsCount()}
          </div>
        )}
      </div>

      {/* Empty state or Product Grid */}
      {!productsLoading && products.length === 0 ? (
        <EmptyState
          title="لا توجد منتجات"
          description="لم نتمكن من العثور على منتجات في هذه الفئة"
        />
      ) : (
        <ProductGrid
          products={products}
          loading={productsLoading}
          onLoadMore={loadMore}
          onProductSelect={onProductSelect}
          checkAuthAndProceed={checkAuthAndProceed}
          currentCategory={selectedCategory}
        />
      )}
    </>
  );
});

ProductSection.displayName = 'ProductSection';

export default ProductSection;