import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Lock, Sparkles } from 'lucide-react';

// Simplified animation variants for better performance
const buttonVariants = {
  hover: { scale: 1.02 },
  tap: { scale: 0.98 }
};

// Enhanced Category Chip Scroller
const HorizontalCategoryScroller = memo(({ selectedCategory, onSelect }) => {
  const categories = useMemo(() => [
    {
      id: 'all',
      name: 'الكل',
      icon: ShoppingBag,
      locked: false,
      comingSoon: false
    },
    {
      id: 'women',
      name: 'حريمي',
      icon: ShoppingBag,
      locked: false,
      comingSoon: false
    },
    {
      id: 'men',
      name: 'رجالي',
      icon: ShoppingBag,
      locked: false,
      comingSoon: false
    },
    {
      id: 'bags',
      name: 'شنط',
      icon: ShoppingBag,
      locked: true,
      comingSoon: true
    },
    {
      id: 'accessories',
      name: 'إكسسوارات',
      icon: ShoppingBag,
      locked: true,
      comingSoon: true
    }
  ], []);

  return (
    <div className="relative"
    dir='rtl'>
      {/* Horizontal Scroller Container */}
      <div className="px-4 pt-3 pb-1">
        <div className="overflow-x-auto hide-scrollbar">
          <div className="flex gap-2 pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => !category.locked && onSelect(category.id)}
                className={`relative min-w-max flex items-center gap-2 px-4 py-2.5 rounded-full 
                          text-sm font-medium transition-all duration-200 ${
                  category.locked 
                    ? 'bg-primary-50/30 text-primary-600/50 opacity-80'
                    : selectedCategory === category.id
                      ? 'bg-gradient-primary text-white shadow-lg'
                      : 'bg-gray-50 text-slate-700 hover:bg-gray-100 hover:shadow-sm'
                } ${!category.locked ? 'hover:scale-102 active:scale-98' : ''}`}
                disabled={category.locked}
              >
                {/* Icon */}
                <category.icon className={`w-4 h-4 ${
                  category.locked 
                    ? 'text-primary-400/70' 
                    : selectedCategory === category.id 
                      ? 'text-white' 
                      : 'text-primary-600'
                }`} />
                
                {/* Category Name */}
                <span>{category.name}</span>
                
                {/* Coming Soon Indicator */}
                {category.comingSoon && (
                  <div className="flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-primary-400" />
                    <span className="text-xs text-primary-400">قريباً</span>
                  </div>
                )}
                
                {/* Active Indicator */}
                {selectedCategory === category.id && !category.locked && (
                  <div className="absolute -right-1 -top-1">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Fade Edges */}
      <div className="absolute top-0 right-0 w-12 h-full bg-gradient-to-l from-white to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 w-12 h-full bg-gradient-to-r from-white to-transparent pointer-events-none" />
    </div>
  );
});

HorizontalCategoryScroller.displayName = 'HorizontalCategoryScroller';

export default HorizontalCategoryScroller;