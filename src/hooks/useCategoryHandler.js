import { useCallback } from 'react';
import { toast } from 'react-hot-toast';

export const useCategoryHandler = ({ updateFilters, setPage, selectCategory }) => {
  const handleCategorySelect = useCallback((category) => {
    selectCategory(category);
    
    // Update filters to trigger a product fetch with the selected category
    updateFilters({ 
      category: category === 'all' ? '' : category,
      // Reset other filters when changing categories for a clean slate
      search: '',
      minPrice: null,
      maxPrice: null,
      size: '',
      color: ''
    });
    
    // Return to the first page when changing categories
    setPage(1);
    
    // Show loading toast to improve UX for slower connections
    const categoryNames = {
      'women': 'حريمي',
      'men': 'رجالي',
      'all': 'كل المنتجات'
    };
    
    const categoryName = categoryNames[category] || category;
    
    toast.loading(`جاري تحميل ${categoryName}...`, {
      id: 'category-loading',
      duration: 1000
    });
  }, [updateFilters, setPage, selectCategory]);

  return { handleCategorySelect };
};