import React from 'react';
import { ShoppingBag } from 'lucide-react';

const EmptyState = React.memo(({ 
  icon: Icon = ShoppingBag,
  title = "لا توجد منتجات",
  description = "لم نتمكن من العثور على منتجات في هذه الفئة",
  actionText = "عرض كل المنتجات",
  onAction
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    <div className="p-4 rounded-full bg-primary-50 mb-4">
      <Icon className="w-16 h-16 text-primary-400" />
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-600 text-center mb-6 max-w-sm">
      {description}
    </p>
    {onAction && (
      <button
        onClick={onAction}
        className="btn-primary"
      >
        {actionText}
      </button>
    )}
  </div>
));

EmptyState.displayName = 'EmptyState';

export default EmptyState;