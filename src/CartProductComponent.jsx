import React, { useState, useContext, useRef, useEffect ,useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  X, ChevronDown, ShoppingBag, Heart, ChevronRight, Share2, Star, Tag,ArrowRight ,ArrowLeft ,
  Plus, Minus, Clock, Package, Shield, ExternalLink, Ruler, Palette, Check, Loader2
} from 'lucide-react';
import { CartContext, AuthContext, useOrders } from './hooks';
import { BottomSheet } from './ProfileComponent';



// Utility function for currency formatting
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP'
  }).format(amount);
};

// Color Selector Component
const ColorSelector = ({ variants, selectedVariant, onVariantSelect }) => {
  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar py-2">
      {variants.map((variant) => (
        <button
          key={variant.id}
          onClick={() => onVariantSelect(variant)}
          className={`group relative p-0.5 rounded-full transition-all 
                   duration-300 ${selectedVariant?.id === variant.id
            ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900'
            : ''}`}
        >
          <div
            className="w-8 h-8 rounded-full border-2 border-gray-700 
                     group-hover:border-gray-500 transition-colors"
            style={{ backgroundColor: variant.colorCode }}
          />
          {selectedVariant?.id === variant.id && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Check className="w-4 h-4 text-white drop-shadow-lg" />
            </div>
          )}
          <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 
                        text-xs text-gray-400 opacity-0 group-hover:opacity-100 
                        transition-opacity whitespace-nowrap">
            {variant.colorName}
          </span>
        </button>
      ))}
    </div>
  );
};

// Size Selector Component
const SizeSelector = ({ sizes, selectedSize, onSizeSelect }) => {
  return (
    <div className="grid grid-cols-4 gap-2">
      {sizes.map((sizeObj) => (
        <button
          key={sizeObj.size}
          onClick={() => onSizeSelect(sizeObj)}
          disabled={!sizeObj.inStock}
          className={`relative p-3 rounded-xl font-bold text-sm transition-all
            ${sizeObj.inStock 
              ? selectedSize?.size === sizeObj.size
                ? 'bg-blue-500 text-white ring-2 ring-blue-500/50'
                : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700'
              : 'bg-gray-800/30 text-gray-500 cursor-not-allowed'
            }`}
        >
          {sizeObj.size}
          {!sizeObj.inStock && (
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 
                         text-xs text-red-500 whitespace-nowrap">
              نفذت الكمية
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

const CartItem = ({ item, onRemove, onUpdateQuantity }) => {
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) {
      onRemove(item.id);
      return;
    }
    onUpdateQuantity(item.id, newQuantity);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300"
    >
      <div className="flex gap-4">
        <div className="relative w-24 h-24 rounded-xl overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-1 right-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs text-white">
            {item.quantity}×
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onRemove(item.id)}
              className="p-1.5 rounded-full hover:bg-red-500/10 transition-colors"
            >
              <X className="w-4 h-4 text-red-500" />
            </motion.button>
            
            <div className="text-right">
              <h4 className="font-bold text-white group-hover:text-blue-500 transition-colors">
                {item.name}
              </h4>
              <p className="text-sm text-gray-400">
                {item.colorName} - {item.size}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center mt-3">
            <span className="font-bold text-blue-500">
              {formatCurrency(item.price.toFixed(2))}
            </span>
            
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleQuantityChange(item.quantity - 1)}
                className="w-8 h-8 rounded-lg bg-gray-800 text-white flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </motion.button>
              
              <span className="text-white font-medium w-6 text-center">
                {item.quantity}
              </span>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleQuantityChange(item.quantity + 1)}
                className="w-8 h-8 rounded-lg bg-gray-800 text-white flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const OrderSummary = ({ orderDetails, onConfirm, onBack, isLoading }) => {
  const { cartTotal } = useContext(CartContext);
  const shippingCost = cartTotal > 500 ? 0 : 25;
  const finalTotal = cartTotal + shippingCost;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4 font-arabic"
    >
      {/* Enhanced Islamic/Arabic Design Card */}
      <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-lg rounded-2xl p-6 pt-0 space-y-4 border border-gray-700/50 relative overflow-hidden">
        {/* Islamic Pattern Overlay */}
        <div className="absolute inset-0 opacity-5 bg-[url('/pattern-arabic.svg')] bg-repeat" />
        
        {/* Content */}
        <div className="relative">
          {/* Shipping Address */}
          <div className="space-y-4" 
          dir='rtl'>
            <h4 className="font-bold text-xl text-white font-arabic">عنوان التوصيل</h4>
            <div className="bg-gray-900/70 rounded-xl p-4 space-y-2 border border-gray-700/30">
              <p className="text-gray-200 text-lg">{orderDetails.address.details}</p>
              <p className="text-gray-400">
                {orderDetails.address.governorate} - {orderDetails.address.district}
              </p>
            </div>
          </div>

          {/* Cost Breakdown with Arabic styling */}
          <div className="space-y-4 mt-6 pt-6 border-t border-gray-700/30"
          dir='rtl'>
            <div className="space-y-3">
              <div className="flex justify-between text-base">
                <span className="text-gray-300">المجموع الفرعي</span>
                <span className="text-white font-bold font-arabic">{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-gray-300">رسوم التوصيل</span>
                <span className="text-blue-400 font-bold font-arabic">
                  {shippingCost === 0 ? 'مجاناً' : formatCurrency(shippingCost)}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-gray-700/30"
            dir='ltr'>
              <span className="text-2xl font-bold text-white font-arabic">{formatCurrency(finalTotal)}</span>
              <span className="text-xl text-gray-300">المجموع الكلي</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Arabic Action Buttons */}
      <div className="space-y-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isLoading}
          onClick={onConfirm}
          className="w-full bg-gradient-to-l from-blue-600 to-blue-500 text-white rounded-xl py-4 font-bold text-lg hover:brightness-110 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Check className="w-6 h-6" />
              <span className="font-arabic">تأكيد الطلب</span>
            </>
          )}
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBack}
          className="w-full bg-gray-800/50 text-white rounded-xl py-4 font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 hover:bg-gray-700/50"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="font-arabic">العودة للسلة</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

const OrderSuccess = ({ orderId, onViewOrders ,emptyCart}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center py-12 space-y-6"
  >
    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500/20 to-green-500/10 mx-auto flex items-center justify-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
      >
        <Check className="w-12 h-12 text-green-500" />
      </motion.div>
    </div>
    
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white p-2">
        تم تأكيد طلبك بنجاح
      </h3>

    </div>

    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => {
        emptyCart();
        onViewOrders();
      }}
      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl px-8 py-3 font-bold hover:brightness-110 transition-all duration-300"
    >
      متابعة الطلب
    </motion.button>
  </motion.div>
);

const EmptyCart = () => (
  <div className="text-center py-12 space-y-4">
    <div className="w-24 h-24 rounded-full bg-gray-800/50 mx-auto flex items-center justify-center">
      <ShoppingBag className="w-12 h-12 text-gray-600" />
    </div>
    <h3 className="text-xl font-bold text-white">السلة فارغة</h3>
    <p className="text-gray-400">لم تقم بإضافة أي منتجات للسلة بعد</p>
  </div>
);

export const CartSheet = ({ onOrderCreated ,checkAuthAndProceed}) => {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen,
    removeFromCart,
    updateQuantity ,
    emptyCart
  } = useContext(CartContext);
  
  const { userInfo } = useContext(AuthContext);
  const { createOrder } = useOrders();

  const [orderState, setOrderState] = useState({
    isProcessing: false,
    confirmation: {
      show: false,
      orderId: null,
      success: false,
      total: 0
    },
    error: null
  });

  const handleCheckout = useCallback(() => {
    if (!userInfo?.addresses?.length) {
      toast.error('الرجاء إضافة عنوان التوصيل أولاً');
      return;
    }

    setOrderState(prev => ({
      ...prev,
      confirmation: {
        show: true,
        orderId: null,
        success: false,
        total: 0
      }
    }));
  }, [userInfo?.addresses]);

  const handleConfirmOrder = useCallback(async () => {
    try {
      setOrderState(prev => ({
        ...prev,
        isProcessing: true,
        error: null
      }));

      const orderData = {
        items: cart.map(item => ({
          variant_id: item.variantId,
          size: item.size,
          quantity: item.quantity
        })),
        addressId: userInfo.addresses[0].id
      };

      const response = await createOrder(orderData);

      if (response.success) {
        setOrderState(prev => ({
          ...prev,
          isProcessing: false,
          confirmation: {
            show: true,
            orderId: response.order.id,
            success: true,
            total: response.order.total
          }
        }));
        toast.success('تم إنشاء طلبك بنجاح');
        
      } else {
        setOrderState(prev => ({
          ...prev,
          isProcessing: false,
          error: response.error
        }));
        toast.error(response.error);
      }
    } catch (error) {
      setOrderState(prev => ({
        ...prev,
        isProcessing: false,
        error: error.message
      }));
      toast.error(error.message);
    }
  }, [cart, userInfo?.addresses, createOrder]);

  const handleBack = useCallback(() => {
    setOrderState(prev => ({
      ...prev,
      confirmation: {
        show: false,
        orderId: null,
        success: false,
        total: 0
      }
    }));
  }, []);

  const handleViewOrders = useCallback(() => {
    setIsCartOpen(false);
    
    // Reset order state to initial values
    setOrderState({
      isProcessing: false,
      confirmation: {
        show: false,
        orderId: null,
        success: false,
        total: 0
      },
      error: null
    });
    
    onOrderCreated(orderState.confirmation.orderId);
  }, [orderState.confirmation.orderId, onOrderCreated, setIsCartOpen]);

  return (
    <BottomSheet
      isOpen={isCartOpen}
      onClose={() => setIsCartOpen(false)}
      title="سلة التسوق"
    >
      <div className="p-4">
        <AnimatePresence mode="wait">
          {orderState.confirmation.success ? (
            <OrderSuccess
              orderId={orderState.confirmation.orderId}
              onViewOrders={handleViewOrders}
              emptyCart={emptyCart}
            />
          ) : orderState.confirmation.show ? (
            <OrderSummary
              orderDetails={{
                address: userInfo.addresses[0],
                items: cart,
                error: orderState.error
              }}
              onConfirm={handleConfirmOrder}
              onBack={handleBack}
              isLoading={orderState.isProcessing}
            />
          ) : cart.length === 0 ? (
            <EmptyCart />
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <CartItem
                  key={`${item.id}-${item.variantId}-${item.size}`}
                  item={item}
                  onRemove={removeFromCart}
                  onUpdateQuantity={updateQuantity}
                />
              ))}
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl py-4 font-bold hover:brightness-110 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>متابعة الشراء</span>
              </motion.button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </BottomSheet>
  );
};

// Product View Sheet Component
export const ProductViewSheet = ({ product, isOpen, onClose }) => {
  const { addToCart } = useContext(CartContext);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (isOpen && product) {
      setSelectedVariant(product.variants[0]);
      setSelectedSize(null);
      setQuantity(1);
      setCurrentImageIndex(0);
    }
  }, [isOpen, product]);

  if (!product || !isOpen) return null;

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('الرجاء اختيار المقاس');
      return;
    }

    addToCart(product, selectedVariant, selectedSize.size, quantity);
    toast.success('تم إضافة المنتج للسلة');
    onClose();
  };

  const handleShare = async (platform) => {
    const shareText = `🔥 ${product.name}\n\n` +
      `💰 ${formatCurrency(product.discountPrice || product.basePrice)}\n` +
      (product.discountPrice ? `🏷️ بدلاً من ${formatCurrency(product.basePrice)}\n` : '') +
      `\n${product.description}\n\n` +
      `✨ المميزات:\n${product.features.map(f => `✅ ${f}`).join('\n')}`;

    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`);
    } else if (platform === 'copy') {
      await navigator.clipboard.writeText(shareText);
      toast.success('تم نسخ تفاصيل المنتج');
    }
    setShowShareOptions(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50">
      <div className="fixed inset-x-0 bottom-0 transform transition-transform 
                    duration-300 ease-in-out">
        <div className="bg-gradient-to-b from-gray-900/95 to-gray-900 
                     backdrop-blur-xl rounded-t-3xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-800/50 transition-colors"
              >
                <ChevronDown className="w-6 h-6 text-gray-400" />
              </button>
              <h3 className="text-xl font-bold text-white">تفاصيل المنتج</h3>
              <button
                onClick={() => setShowShareOptions(true)}
                className="p-2 rounded-full hover:bg-gray-800/50 transition-colors"
              >
                <Share2 className="w-6 h-6 text-blue-500" />
              </button>
            </div>

            {/* Image Gallery */}
            <div className="relative aspect-square rounded-2xl overflow-hidden">
              <img
                src={selectedVariant?.images[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300"
              />

              {/* Image Navigation */}
              {selectedVariant?.images.length > 1 && (
                <div className="absolute bottom-4 inset-x-4 flex justify-center gap-2">
                  {selectedVariant.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        currentImageIndex === index
                          ? 'bg-white w-4'
                          : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Price Badge */}
              <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm 
                           rounded-xl p-3 text-right">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">
                    {formatCurrency(product.discountPrice || product.basePrice)}
                  </span>
                  {product.discountPrice && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatCurrency(product.basePrice)}
                    </span>
                  )}
                </div>
                {product.discountPrice && (
                  <div className="flex items-center gap-1 mt-1">
                    <Tag className="w-4 h-4 text-red-500" />
                    <span className="text-red-500 text-sm font-medium">
                      خصم {Math.round(((product.basePrice - product.discountPrice) / product.basePrice) * 100)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="absolute top-4 left-4 flex gap-2">
                <button
                  onClick={() => setShowShareOptions(true)}
                  className="p-2 rounded-full bg-black/50 backdrop-blur-sm 
                           hover:bg-blue-500/20 transition-colors"
                >
                  <Share2 className="w-5 h-5 text-blue-500" />
                </button>
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {product.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="text-white font-bold">
                        {product.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                  {product.ratingCount > 0 && (
                    <span className="text-gray-400 text-sm">
                      ({product.ratingCount} تقييم)
                    </span>
                  )}
                </div>
                {product.salesCount > 0 && (
                  <span className="text-sm text-gray-400">
                    {product.salesCount} عملية شراء
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold text-white">{product.name}</h1>

              {product.description && (
                <p className="text-gray-400 leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>

            {/* Color Selection */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-white">اللون</h3>
                <span className="text-sm text-gray-400">
                  {selectedVariant?.colorName}
                </span>
              </div>
              <ColorSelector
                variants={product.variants}
                selectedVariant={selectedVariant}
                onVariantSelect={(variant) => {
                  setSelectedVariant(variant);
                  setSelectedSize(null);
                  setCurrentImageIndex(0);
                }}
              />
            </div>

            {/* Size Selection */}
            {selectedVariant?.sizes.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-white">المقاس</h3>
                  {selectedSize && (
                    <span className="text-sm text-gray-400">
                      {selectedSize.size}
                    </span>
                  )}
                </div>
                <SizeSelector
                  sizes={selectedVariant.sizes}
                  selectedSize={selectedSize}
                  onSizeSelect={setSelectedSize}
                />
              </div>
            )}

            {/* Features */}
            {product.features?.length > 0 && (
              <div className="space-y-3 pt-4">
                <h3 className="font-bold text-white">مميزات المنتج</h3>
                <div className="space-y-2">
                  {product.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-500/10 
                                  flex-shrink-0 flex items-center justify-center 
                                  mt-0.5">
                        <Check className="w-3 h-3 text-blue-500" />
                      </div>
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="w-10 h-10 rounded-xl bg-gray-800 text-white 
                               flex items-center justify-center hover:bg-gray-700 
                               transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-xl font-bold text-white w-8 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(prev => prev + 1)}
                      className="w-10 h-10 rounded-xl bg-gray-800 text-white 
                               flex items-center justify-center hover:bg-gray-700 
                               transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">السعر الإجمالي</p>
                    <span className="text-xl font-bold text-blue-500">
                      {formatCurrency((product.discountPrice || product.basePrice) * quantity)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!selectedSize}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 
                         text-white rounded-xl py-4 font-bold hover:brightness-110 
                         transition-all duration-300 disabled:opacity-50 
                         disabled:cursor-not-allowed flex items-center 
                         justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>إضافة للسلة</span>
              </button>
            </div>

            
          </div>
        </div>
      </div>

      {/* Share Options Sheet */}
      {showShareOptions && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] 
                     flex items-end justify-center">
          <div className="bg-gray-900 w-full max-w-lg rounded-t-3xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setShowShareOptions(false)}
                className="p-2 rounded-full hover:bg-gray-800/50 transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
              <h3 className="text-xl font-bold text-white">مشاركة المنتج</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleShare('whatsapp')}
                className="bg-green-500/10 text-green-500 rounded-xl p-4 flex 
                         flex-col items-center gap-2 hover:brightness-110 
                         transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex 
                             items-center justify-center">
                  <Share2 className="w-6 h-6" />
                </div>
                <span>مشاركة على واتساب</span>
              </button>

              <button
                onClick={() => handleShare('copy')}
                className="bg-gray-800 text-gray-300 rounded-xl p-4 flex 
                         flex-col items-center gap-2 hover:brightness-110 
                         transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-gray-700 flex 
                             items-center justify-center">
                  <ExternalLink className="w-6 h-6" />
                </div>
                <span>نسخ الرابط</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};