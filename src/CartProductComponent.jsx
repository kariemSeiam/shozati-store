import React, { useState, useContext, useRef, useEffect, useCallback,useMemo  } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  X, ChevronDown, ShoppingBag, Heart, ChevronRight, Share2, Star, Tag, ArrowRight, ArrowLeft,
  Plus, Minus, Clock, Package, AlertCircle, Trash2, Truck, Palette, Check, Loader2, MapPin,Ticket 
} from 'lucide-react';
import { CartContext, AuthContext, useOrders, useCoupons } from './hooks';
import { BottomSheet } from './ProfileComponent';



// Utility function for currency formatting
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};


const CartItem = ({ item, onRemove, onUpdateQuantity }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleQuantityChange = (newQuantity) => {
    setIsUpdating(true);
    if (newQuantity < 1) {
      setShowConfirm(true);
      return;
    }
    onUpdateQuantity(item.cartItemId, newQuantity);
    setTimeout(() => setIsUpdating(false), 300);
  };

  const handleRemove = () => {
    if (showConfirm) {
      onRemove(item.cartItemId);
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group relative bg-white rounded-2xl p-3 sm:p-4 
                border border-gray-100 shadow-sm 
                hover:shadow-lg hover:border-sky-100
                transition-all duration-300"
      dir="rtl"
    >
      {/* Delete Confirmation Overlay */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 rounded-2xl 
                      bg-white/95 backdrop-blur-sm
                      flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-3 p-4 text-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <p className="text-gray-700 font-medium">هل تريد حذف هذا المنتج؟</p>
              <div className="flex gap-2 mt-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRemove}
                  className="px-4 py-2 bg-red-500 text-white rounded-xl
                            font-medium hover:bg-red-600 
                            transition-colors duration-200"
                >
                  تأكيد الحذف
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl
                            font-medium hover:bg-gray-200
                            transition-colors duration-200"
                >
                  إلغاء
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update Indicator */}
      <AnimatePresence>
        {isUpdating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 rounded-2xl bg-sky-50/30 
                      flex items-center justify-center"
          >
            <div className="bg-white/90 p-2 rounded-full shadow-lg">
              <Check className="w-5 h-5 text-sky-500" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex gap-3 sm:gap-4">
        {/* Delete Button - Now on the right */}



        {/* Product Image */}
        <div className="relative flex-none w-20 sm:w-28 aspect-square">
          <div className="relative h-full rounded-xl overflow-hidden 
                         bg-gradient-to-b from-gray-50 to-white
                         ring-1 ring-gray-100 group-hover:ring-sky-100
                         transition-all duration-300">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover transform transition-all 
                         duration-500 group-hover:scale-105"
            />
            <motion.div
              layout
              className="absolute bottom-1.5 left-1.5 
                         bg-white/95 backdrop-blur-sm
                         px-2 py-0.5 text-xs font-semibold
                         text-sky-600 rounded-full shadow-md
                         ring-1 ring-sky-100"
            >
              ×{item.quantity}
            </motion.div>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => !isUpdating && setShowConfirm(true)}
          className=" absolute left-0 top-0 z-10 flex-left p-2 sm:p-2.5 rounded-xl
                     bg-red-50 text-red-500 hover:bg-red-100
                     transition-all duration-300
                     disabled:opacity-50"
          disabled={isUpdating}
          aria-label="حذف المنتج"
        >
          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
        </motion.button>

        {/* Product Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">

          <div className="space-y-1">

            <h3 className="font-bold text-gray-900 
                          group-hover:text-sky-600 
                          transition-colors duration-300
                          text-sm sm:text-base truncate">
              {item.name}
            </h3>
            <div className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-gray-400" />
              <p className="text-xs sm:text-sm text-gray-500">
                {item.size} - {item.colorName}
              </p>
            </div>

            {/* Price Section */}
            <div className="flex items-baseline gap-1.5">
              <motion.span
                layout
                className="text-base sm:text-lg font-bold 
                           bg-gradient-to-l from-sky-600 to-sky-500 
                           bg-clip-text text-transparent"
              >
                {formatCurrency(item.price)}
              </motion.span>
              <span className="text-xs sm:text-sm text-gray-400">/ القطعة</span>
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="flex justify-between items-end 
                         pt-2 sm:pt-3 mt-1 sm:mt-2
                         border-t border-gray-100">
            <div className="flex items-center gap-1 p-1 
                           bg-gray-50 rounded-lg 
                           group-hover:bg-sky-50/50">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuantityChange(item.quantity + 1)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-white 
                           text-gray-600 flex items-center justify-center 
                           shadow-sm hover:bg-sky-50 hover:text-sky-600"
                disabled={isUpdating}
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </motion.button>

              <motion.div layout
                className="w-8 sm:w-10 text-center">
                <span className="text-gray-800 font-semibold 
                                text-sm sm:text-base">
                  {item.quantity}
                </span>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuantityChange(item.quantity - 1)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-white 
                           text-gray-600 flex items-center justify-center 
                           shadow-sm hover:bg-sky-50 hover:text-sky-600
                           disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={item.quantity <= 1 || isUpdating}
              >
                <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </motion.button>
            </div>

            <div className="text-right ">
              <span className="text-xs sm:text-sm text-gray-500">الإجمالي</span>
              <motion.div
                layout
                className="text-base sm:text-lg font-bold 
                           bg-gradient-to-l from-sky-600 to-sky-500 
                           bg-clip-text text-transparent"
              >
                {formatCurrency(item.price * item.quantity)}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
const CouponInput = ({ isProcessing, onApplyCoupon }) => {
  const [couponCode, setCouponCode] = useState('');
  const inputRef = useRef(null);
  const { cartTotal } = useContext(CartContext);
  const {
    validateCoupon,
    currentCoupon,
    validatingCoupon,
    error,
    clearError,
    calculateDiscount,
    clearCoupon
  } = useCoupons();

  // Reset coupon on unmount
  useEffect(() => {
    return () => {
      clearCoupon();
    };
  }, [clearCoupon]);

  // Validate coupon with debounce
  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();
    if (!couponCode.trim() || validatingCoupon || isProcessing) return;

    const result = await validateCoupon(couponCode, cartTotal);
    if (result) {
      const discount = calculateDiscount(cartTotal);
      onApplyCoupon({ ...result, discount });
    }
  }, [couponCode, validatingCoupon, isProcessing, validateCoupon, cartTotal, calculateDiscount, onApplyCoupon]);

  // Auto-format and validate coupon code
  const handleCouponChange = useCallback((e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setCouponCode(value);
    if (error) clearError();
  }, [error, clearError]);

  // Handle coupon removal
  const handleRemoveCoupon = useCallback(() => {
    setCouponCode('');
    clearCoupon();
    onApplyCoupon(null);
  }, [clearCoupon, onApplyCoupon]);

  return (
    <div className="space-y-3" dir="rtl">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={couponCode}
            onChange={handleCouponChange}
            placeholder="أدخل كود الخصم"
            maxLength={8}
            className="w-full px-4 py-3 rounded-xl bg-white border border-sky-100
                     focus:border-sky-500 focus:ring-2 focus:ring-sky-200
                     transition-all duration-300 text-gray-800
                     placeholder:text-gray-400 tracking-wide
                     disabled:opacity-60 disabled:cursor-not-allowed
                     group-hover:border-sky-200"
            disabled={isProcessing || validatingCoupon}
          />
          
          {couponCode && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute left-28 top-1/2 -translate-y-1/2 text-xs text-gray-400"
            >
              {couponCode.length}/8
            </motion.span>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={!couponCode.trim() || isProcessing || validatingCoupon}
            className="absolute left-2 top-2 px-4 py-1.5 bg-sky-500 text-white rounded-lg
                     font-medium hover:bg-sky-600 transition-all duration-300
                     disabled:opacity-50 disabled:cursor-not-allowed
                     hover:shadow-md hover:shadow-sky-100
                     flex items-center gap-2"
          >
            {validatingCoupon ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Ticket className="w-4 h-4" />
            )}
            <span>تطبيق</span>
          </motion.button>
        </div>

        <motion.p
          initial={false}
          animate={{ opacity: couponCode ? 0 : 0.7 }}
          className="absolute -bottom-6 right-2 text-xs text-gray-500 pointer-events-none"
        >
          ادخل كود الخصم الخاص بك للحصول على خصم إضافي
        </motion.p>
      </form>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-red-600 bg-red-50/80 
                     backdrop-blur-sm px-4 py-3 rounded-xl text-sm
                     border border-red-100 shadow-sm"
          >
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </motion.div>
        )}
        
        {currentCoupon && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between gap-2 
                     bg-emerald-50/80 backdrop-blur-sm px-4 py-3 rounded-xl
                     border border-emerald-100 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <Ticket className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-emerald-700">
                  {currentCoupon.discountType === 'percentage' 
                    ? `خصم ${currentCoupon.discountValue}%`
                    : `خصم ${formatCurrency(currentCoupon.discountValue)}`
                  }
                </p>
                <p className="text-sm text-emerald-600">
                  تم تطبيق كود الخصم بنجاح
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-bold text-emerald-600">
                {formatCurrency(calculateDiscount(cartTotal))}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRemoveCoupon}
                className="text-xs text-emerald-600 hover:text-emerald-700
                         underline underline-offset-2"
              >
                إزالة
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const OrderSummary = ({ orderDetails, handleConfirmOrder, onBack, isLoading }) => {
  const { cartTotal, cart } = useContext(CartContext);
  const { currentCoupon, calculateDiscount } = useCoupons();
  const [localCouponData, setLocalCouponData] = useState(null);

  // Memoize calculations with enhanced coupon handling
  const { 
    shippingCost, 
    discount, 
    finalTotal,
    itemsWithDiscount 
  } = useMemo(() => {
    const shipping = cartTotal > 500 ? 0 : 25;
    
    // Use coupon data from local state if available
    const activeCoupon = localCouponData || currentCoupon;
    const discountAmount = activeCoupon ? 
      (activeCoupon.discountType === 'percentage' 
        ? (cartTotal * activeCoupon.discountValue / 100)
        : activeCoupon.discountValue) 
      : 0;
    
    // Calculate per-item discounts
    const itemsWithDisc = cart.map(item => {
      const itemTotal = item.price * item.quantity;
      const itemDiscount = activeCoupon ? 
        (activeCoupon.discountType === 'percentage' 
          ? (itemTotal * activeCoupon.discountValue / 100)
          : (itemTotal / cartTotal) * discountAmount)
        : 0;

      return {
        ...item,
        originalTotal: itemTotal,
        discountAmount: Math.round(itemDiscount * 100) / 100,
        finalTotal: Math.round((itemTotal - itemDiscount) * 100) / 100
      };
    });

    return {
      shippingCost: shipping,
      discount: Math.round(discountAmount * 100) / 100,
      finalTotal: Math.round((cartTotal + shipping - discountAmount) * 100) / 100,
      itemsWithDiscount: itemsWithDisc
    };
  }, [cart, cartTotal, currentCoupon, localCouponData]);

  const handleConfirm = useCallback(() => {
    // Only pass the coupon code to handleConfirmOrder
    handleConfirmOrder(localCouponData?.code || '');
  }, [
    handleConfirmOrder,
    localCouponData,
    cartTotal,
    shippingCost,
    discount,
    finalTotal,
    itemsWithDiscount
  ]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4 font-arabic"
    >
      <div className="bg-gradient-to-br from-white to-sky-50 rounded-3xl p-6 space-y-6
                    border border-sky-100 shadow-sm relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 bg-repeat" />

        {/* Coupon Section */}
        <div className="relative space-y-2" dir="rtl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-sky-100 rounded-full p-2">
                <Ticket className="w-5 h-5 text-sky-600" />
              </div>
              <h4 className="font-bold text-xl text-gray-800">كوبون الخصم</h4>
            </div>
            
          </div>
          
          <CouponInput 
            onApplyCoupon={setLocalCouponData}
            isProcessing={isLoading}
          />
        </div>

        {/* Shipping Address Section */}
        <div className="relative space-y-2 pt-4 border-t border-sky-100" dir="rtl">
            <div className="flex items-center gap-3">
              <div className="bg-sky-100 rounded-full p-2">
                <MapPin className="w-5 h-5 text-sky-600" />
              </div>
              <h4 className="font-bold text-xl text-gray-800">عنوان التوصيل</h4>
            </div>

            <motion.div
              className="bg-white rounded-2xl p-5 space-y-3 border border-sky-100 shadow-sm
                         hover:shadow-md transition-shadow duration-300"
              whileHover={{ scale: 1.01 }}
            >
              <p className="text-gray-800 text-lg leading-relaxed">
                {orderDetails.address.details}
              </p>
              <p className="text-gray-500 flex items-center gap-2">
                <span>{orderDetails.address.governorate}</span>
                <span className="text-sky-500">•</span>
                <span>{orderDetails.address.district}</span>
              </p>
            </motion.div>
          </div>

        {/* Order Details Section */}
        <div className="relative space-y-4 pt-6 border-t border-sky-100" dir="rtl">
          <div className="space-y-4 bg-white rounded-2xl p-5 border border-sky-100">
            {itemsWithDiscount.map((item, index) => (
              <div key={index} className="flex justify-between items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">{item.name}</span>
                    <span className="text-gray-500">×{item.quantity}</span>
                  </div>
                  {item.discountAmount > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-emerald-600"
                    >
                      وفرت {formatCurrency(item.discountAmount)}
                    </motion.div>
                  )}
                </div>
                <div className="text-left">
                  <div className="font-bold text-gray-800">
                    {formatCurrency(item.originalTotal)}
                  </div>
                  {item.discountAmount > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-emerald-600 font-bold"
                    >
                      {formatCurrency(item.finalTotal)}
                    </motion.div>
                  )}
                </div>
              </div>
            ))}

            {/* Totals Section */}
            <div className="space-y-3 pt-4 border-t border-sky-100">
              <div className="flex justify-between text-gray-600">
                <span>المجموع الفرعي</span>
                <span className="font-bold">{formatCurrency(cartTotal)}</span>
              </div>
              
              <div className="flex justify-between text-gray-600">
                <span>رسوم التوصيل</span>
                <span className={`font-bold ${shippingCost === 0 ? 'text-emerald-600' : ''}`}>
                  {shippingCost === 0 ? 'مجاناً' : formatCurrency(shippingCost)}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>الخصم</span>
                  <span className="font-bold">- {formatCurrency(discount)}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t border-gray-100"
              dir='ltr'>
                <span className="text-xl font-bold text-sky-600">
                  {formatCurrency(finalTotal)}
                </span>
                <span className="text-lg text-gray-800">المجموع الكلي</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isLoading}
          onClick={handleConfirm}
          className="w-full bg-gradient-to-r from-sky-500 to-sky-600 
                   text-white rounded-xl py-4 font-bold text-lg
                   disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Check className="w-6 h-6" />
              <span>تأكيد الطلب</span>
            </>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBack}
          className="w-full bg-gray-100 text-gray-700 rounded-xl py-4 
                   font-bold text-lg flex items-center justify-center gap-3"
        >
          <ArrowLeft className="w-6 h-6" />
          <span>العودة للسلة</span>
        </motion.button>
      </div>
    </motion.div>
  );
};


// Helper component for cost breakdown items
const CostItem = ({ label, value, valueClass = 'text-gray-800' }) => (
  <div className="flex justify-between text-base items-center">
    <span className="text-gray-600">{label}</span>
    <span className={`font-bold ${valueClass}`}>{value}</span>
  </div>
);

const OrderSuccess = ({ orderId, onViewOrders, emptyCart }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center py-12 space-y-6"
  >
    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 mx-auto flex items-center justify-center shadow-md">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
      >
        <Check className="w-12 h-12 text-emerald-500" />
      </motion.div>
    </div>

    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-800 p-2">
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
      className="bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-xl px-8 py-3 font-bold hover:shadow-lg hover:brightness-105 transition-all duration-300"
    >
      متابعة الطلب
    </motion.button>
  </motion.div>
);


const EmptyCart = () => (
  <div className="text-center py-12 space-y-4 bg-sky-50 rounded-xl">
    <div className="w-24 h-24 rounded-full bg-sky-100 mx-auto flex items-center justify-center">
      <ShoppingBag className="w-12 h-12 text-sky-600" />
    </div>
    <h3 className="text-xl font-bold text-gray-800">السلة فارغة</h3>
    <p className="text-gray-600">لم تقم بإضافة أي منتجات للسلة بعد</p>
  </div>
);

export const CartSheet = ({ onOrderCreated, checkAuthAndProceed }) => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
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
    checkAuthAndProceed({
      requiresAuth: true,
      requiresAddress: true,
      onSuccess: () => {
        setOrderState(prev => ({
          ...prev,
          confirmation: {
            show: true,
            orderId: null,
            success: false,
            total: 0
          }
        }));
      }
    });
  }, [checkAuthAndProceed]);

  const handleConfirmOrder = useCallback(async (couponCode) => {
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
            addressId: userInfo.addresses[0].id,
            coupon: couponCode || 0 // Add the coupon code to the order data
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
                    total: response.order.total, // This will now include the coupon discount
                    coupon: response.order.coupon // Store coupon details if needed
                }
            }));
            toast.success('تم إنشاء طلبك بنجاح', {
                style: {
                    background: '#EFF6FF',
                    color: '#1E40AF'
                }
            });
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
      className="bg-white"
    >
      <div className="p-4">
        <AnimatePresence mode="wait">
          {orderState.confirmation.success ? (
            <OrderSuccess
              orderId={orderState.confirmation.orderId}
              onViewOrders={handleViewOrders}
              emptyCart={emptyCart}
              className="bg-white shadow-lg rounded-xl p-6"
            />
          ) : orderState.confirmation.show ? (
            <OrderSummary
              orderDetails={{
                address: userInfo.addresses[0],
                items: cart,
                error: orderState.error
              }}
              handleConfirmOrder={handleConfirmOrder}
              onBack={handleBack}
              isLoading={orderState.isProcessing}
              className="bg-white shadow-lg rounded-xl p-6"
            />
          ) : cart.length === 0 ? (
            <EmptyCart />
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                {cart.map(item => (
                  <CartItem
                    key={`${item.id}-${item.variantId}-${item.size}`}
                    item={item}
                    onRemove={removeFromCart}
                    onUpdateQuantity={updateQuantity}
                  />
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-xl py-4 font-bold hover:shadow-lg hover:brightness-105 transition-all duration-300 flex items-center justify-center gap-2"
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

