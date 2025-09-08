import React from 'react';
import { ShoppingBag, Search, Filter } from 'lucide-react';

const EmptyState = React.memo(({
  icon: Icon = ShoppingBag,
  title = "لا توجد منتجات",
  description = "لم نتمكن من العثور على منتجات في هذه الفئة"
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 min-h-[500px] bg-gradient-to-br from-neutral-900/50 via-neutral-800/30 to-neutral-900/50">
    {/* Animated Background Elements - Dark Theme */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-secondary-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-primary-400/10 rounded-full blur-xl animate-pulse delay-500"></div>
    </div>

    {/* Main Content */}
    <div className="relative z-10 flex flex-col items-center text-center max-w-md mx-auto">
      {/* Icon Container with Project Theme */}
      <div className="relative mb-8">
        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-primary-500/20 via-primary-400/20 to-primary-600/20 
                      flex items-center justify-center shadow-2xl shadow-primary-500/20 border border-primary-500/30
                      backdrop-blur-sm">
          <Icon className="w-14 h-14 text-primary-400" />
        </div>

        {/* Floating Elements - Project Colors */}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full 
                      flex items-center justify-center shadow-lg animate-bounce">
          <Search className="w-3 h-3 text-white" />
        </div>
        <div className="absolute -bottom-2 -left-2 w-5 h-5 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full 
                      flex items-center justify-center shadow-lg animate-bounce delay-300">
          <Filter className="w-2.5 h-2.5 text-white" />
        </div>
      </div>

      {/* Text Content - Dark Theme Typography */}
      <div className="space-y-4">
        <h3 className="text-3xl font-bold text-white leading-tight">
          {title}
        </h3>
        <p className="text-neutral-300 text-lg leading-relaxed max-w-sm mx-auto">
          {description}
        </p>
      </div>

      {/* Decorative Line - Dark Theme Primary Color */}
      <div className="mt-8 w-24 h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent rounded-full"></div>
    </div>
  </div>
));

EmptyState.displayName = 'EmptyState';

export default EmptyState;