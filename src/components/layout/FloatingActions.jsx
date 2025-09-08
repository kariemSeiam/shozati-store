import React, { useContext } from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { CartContext } from '../../hooks';
import QuantityBadge from '../ui/QuantityBadge';

const FloatingActions = React.memo(({ onFavoritesClick, onCartClick }) => {
  const { cart } = useContext(CartContext);
  const cartQuantity = React.useMemo(() => 
    cart?.reduce((total, item) => total + item.quantity, 0) || 0, 
    [cart]
  );

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-20" role="group" aria-label="Floating actions">
      <button
        onClick={onFavoritesClick}
        className="w-14 h-14 rounded-full bg-gradient-primary 
                   flex items-center justify-center shadow-floating
                   hover:scale-105 active:scale-95 transition-transform duration-200"
        aria-label="Favorites"
      >
        <Heart className="w-6 h-6 text-white" />
      </button>

      <button
        onClick={onCartClick}
        className="relative w-14 h-14 rounded-full bg-gradient-primary 
                   flex items-center justify-center shadow-floating
                   hover:scale-105 active:scale-95 transition-transform duration-200"
        aria-label={`Cart with ${cartQuantity} items`}
      >
        <ShoppingCart className="w-6 h-6 text-white" />
        
        {cartQuantity > 0 && (
          <QuantityBadge quantity={cartQuantity} />
        )}
      </button>
    </div>
  );
});

FloatingActions.displayName = 'FloatingActions';

export default FloatingActions;