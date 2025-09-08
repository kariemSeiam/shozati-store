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
                className={`relative min-w-max flex items-center gap-2 px-4 py-2.5 rounded-2xl 
                          text-sm font-medium transition-all duration-300 overflow-hidden backdrop-blur-sm
                          ${category.locked
                    ? 'bg-primary-50/40 text-primary-600/60 opacity-70'
                    : selectedCategory === category.id
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 border border-primary-400/30'
                      : 'bg-white/70 text-slate-700 hover:bg-white/90 hover:shadow-md border border-neutral-200/50 hover:border-primary-200/50'
                  } ${!category.locked ? 'hover:scale-105 active:scale-95' : ''}`}
                disabled={category.locked}
              >
                {/* Background Pattern for Active Button */}
                {selectedCategory === category.id && !category.locked && (
                  <div className="absolute inset-0 bg-pattern-dots opacity-10"></div>
                )}
                {/* Icon */}
                <category.icon className={`w-4 h-4 relative z-10 transition-all duration-300 ${category.locked
                  ? 'text-primary-400/70'
                  : selectedCategory === category.id
                    ? 'text-white drop-shadow-sm'
                    : 'text-primary-600'
                  }`} />

                {/* Category Name */}
                <span className="relative z-10 font-medium">{category.name}</span>

                {/* Coming Soon Indicator */}
                {category.comingSoon && (
                  <div className="flex items-center gap-1 relative z-10">
                    <Lock className="w-3.5 h-3.5 text-primary-400" />
                    <span className="text-xs text-primary-400 font-medium">قريباً</span>
                  </div>
                )}

                {/* Enhanced Active Indicator */}
                {selectedCategory === category.id && !category.locked && (
                  <>
                    <div className="absolute -right-1 -top-1 z-20">
                      <Sparkles className="w-4 h-4 text-white drop-shadow-sm animate-pulse" />
                    </div>
                    {/* Subtle glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-400/20 to-primary-600/20 rounded-2xl blur-sm"></div>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Subtle Fade Edges */}
      <div className="absolute top-0 right-0 w-12 h-full bg-gradient-to-l from-white/30 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 w-12 h-full bg-gradient-to-r from-white/30 to-transparent pointer-events-none" />
    </div>
  );
});

HorizontalCategoryScroller.displayName = 'HorizontalCategoryScroller';

export default HorizontalCategoryScroller;