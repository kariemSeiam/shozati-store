import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Lock, Sparkles } from 'lucide-react';

// Animation variants 
const buttonVariants = {
  hover: {
    scale: 1.05,
    rotate: [0, -2, 2, 0],
    transition: {
      rotate: {
        repeat: Infinity,
        duration: 1.5,
        repeatType: "reverse"
      }
    }
  },
  tap: { scale: 0.95 }
};

// Shimmer effect (from original code)
const ShimmerEffect = memo(() => (
  <motion.div
    className="absolute inset-0 opacity-30"
    style={{
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
      backgroundSize: '200% 100%'
    }}
    animate={{
      backgroundPosition: ['200% 0', '-200% 0']
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      ease: 'linear'
    }}
  />
));
ShimmerEffect.displayName = 'ShimmerEffect';

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
              <motion.button
                key={category.id}
                variants={buttonVariants}
                whileHover={!category.locked && "hover"}
                whileTap={!category.locked && "tap"}
                onClick={() => !category.locked && onSelect(category.id)}
                className={`relative min-w-max flex items-center gap-2 px-4 py-2.5 rounded-full 
                          text-sm font-medium transition-all duration-300 ${
                  category.locked 
                    ? 'bg-sky-50/30 text-sky-700/50 opacity-80'
                    : selectedCategory === category.id
                      ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-lg shadow-sky-400/25'
                      : 'bg-sky-50/80 text-sky-700 hover:bg-sky-100/80 hover:shadow'
                }`}
                disabled={category.locked}
              >
                {/* Background effects */}
                {selectedCategory === category.id && !category.locked && <ShimmerEffect />}
                {category.locked && (
                  <div className="absolute inset-0 bg-gradient-to-r from-sky-300/5 to-sky-400/5 rounded-full" />
                )}
                
                {/* Icon */}
                <motion.div
                  animate={
                    selectedCategory === category.id && !category.locked
                      ? { 
                          rotate: [0, -10, 10, 0],
                          transition: {
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse"
                          }
                        }
                      : {}
                  }
                >
                  <category.icon className={`w-4 h-4 ${
                    category.locked 
                      ? 'text-sky-400/70' 
                      : selectedCategory === category.id 
                        ? 'text-white' 
                        : 'text-sky-600'
                  }`} />
                </motion.div>
                
                {/* Category Name */}
                <span>{category.name}</span>
                
                {/* Coming Soon Indicator */}
                {category.comingSoon && (
                  <div className="flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-sky-400" />
                    <span className="text-xs text-sky-400">قريباً</span>
                    
                    {/* Subtle Glow Effect for Lock Icon */}
                    <motion.div
                      className="absolute top-[50%] right-[14%] w-6 h-6 bg-sky-400/10 rounded-full blur-md"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.2, 0.4, 0.2]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                      }}
                    />
                  </div>
                )}
                
                {/* Active Indicator */}
                {selectedCategory === category.id && !category.locked && (
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    className="absolute -right-1 -top-1"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </motion.button>
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