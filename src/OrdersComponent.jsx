import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Package, MapPin, Clock, RefreshCw, X, Phone, MessageCircle,
  ChevronDown, ArrowLeft, Shield, Check, Search, ChevronRight,
  AlertCircle, Building2, Truck, Star, Navigation, Calendar,
  ShoppingBag, Box, ArrowUpRight
} from 'lucide-react';
import { useOrders } from './hooks';
import { BottomSheet } from './ProfileComponent';

// Enhanced Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: {
      icon: Clock,
      text: 'قيد التنفيذ',
      class: 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-500 border-amber-500/30'
    },
    processing: {
      icon: Package,
      text: 'جاري التجهيز',
      class: 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-500 border-blue-500/30'
    },
    shipping: {
      icon: Truck,
      text: 'في الطريق',
      class: 'bg-gradient-to-r from-indigo-500/20 to-indigo-600/20 text-indigo-500 border-indigo-500/30'
    },
    delivered: {
      icon: Shield,
      text: 'تم التوصيل',
      class: 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-500 border-green-500/30'
    },
    cancelled: {
      icon: X,
      text: 'ملغي',
      class: 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-500 border-red-500/30'
    }
  };

  const config = statusConfig[status] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <div className={`px-4 py-2 rounded-2xl text-sm inline-flex items-center gap-2 border ${config.class}
                    backdrop-blur-xl shadow-lg`}>
      <StatusIcon className="w-4 h-4" />
      <span className="font-medium">{config.text}</span>
    </div>
  );
};

// Modern Order Card
const OrderCard = ({ order, onSelect }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ar-EG', {
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group cursor-pointer"
      onClick={() => onSelect(order)}
    >
      <div className="relative overflow-hidden backdrop-blur-xl rounded-3xl border border-gray-800/50
                    bg-gradient-to-b from-gray-800/40 to-gray-900/40 p-5
                    hover:border-blue-500/30 transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 opacity-0 
                      group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <StatusBadge status={order.status} />
            <div className="flex items-center gap-2 text-gray-400">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{formatDate(order.createdAt)}</span>
            </div>
          </div>

          {/* Items Preview */}
          <div className="flex gap-3 mb-6 overflow-x-auto hide-scrollbar py-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="relative flex-shrink-0 group/item">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-gray-700/50 
                              group-hover:border-blue-500/30 transition-all duration-500">
                  <img 
                    src={item.image || 'http://localhost:5000/uploads/3fdf62c5-d260-4c86-8a24-617fe4035232.png'} 
                    alt={item.productName}
                    className="w-full h-full object-cover transform group-hover/item:scale-110 
                             transition-transform duration-500"
                  />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full 
                              bg-gradient-to-r from-blue-500 to-blue-600
                              flex items-center justify-center text-xs font-bold text-white
                              shadow-lg shadow-blue-500/25">
                  {item.quantity}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10">
                <ShoppingBag className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-gray-400 text-sm">{order.totalQuantity} منتج</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-500 font-bold text-lg">
                {formatCurrency(order.total)}
              </span>
              <ArrowUpRight className="w-4 h-4 text-blue-500 transform 
                                     group-hover:translate-x-1 group-hover:-translate-y-1
                                     transition-transform duration-300" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Ultra Modern Timeline Component
const OrderTimeline = ({ steps }) => {
  const statusIcons = {
    'pending': Clock,
    'processing': Package,
    'shipping': Truck,
    'delivered': Shield,
    'cancelled': X
  };

  return (
    <div className="relative py-4 px-4">
      {/* Animated Background Line */}
      <div className="absolute right-12 w-[2px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/0 via-blue-500/50 to-blue-500/0" />
        <motion.div 
          className="absolute inset-0 bg-gradient-to-b from-blue-500/0 via-blue-500 to-blue-500/0"
          animate={{
            y: ["0%", "200%"],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Steps */}
      {steps.map((step, index) => {
        const isCompleted = step.completed;
        const isLast = index === steps.length - 1;
        const StatusIcon = statusIcons[step.status] || Clock;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.15 }}
            className={`relative ${!isLast ? 'mb-6' : ''}`}
          >
            {/* Content Container */}
            <div className="relative flex gap-6">
              {/* Step Indicator */}
              <div className="relative">
                <motion.div
                  className={`w-8 h-8 rounded-xl relative  z-10
                           flex items-center justify-center
                           transition-colors duration-500 
                           border-2 ${
                             isCompleted 
                               ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400' 
                               : 'bg-gray-800/80 border-gray-700'
                           }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <StatusIcon className={`w-4 h-4 ${isCompleted ? 'text-white' : 'text-gray-400'}`} />
                </motion.div>

                {/* Animated Glow Effect */}
                {isCompleted && (
                  <>
                    <motion.div
                      className="absolute inset-0 right-[-8px] bg-blue-500/30 rounded-xl blur-md"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.2, 0.5]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <motion.div
                      className="absolute inset-0 right-[-8px] rounded-xl"
                      style={{
                        background: 'conic-gradient(from 90deg at 50% 50%, #3B82F6 0%, transparent 60%, transparent 100%)'
                      }}
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  </>
                )}
              </div>

              {/* Content Box */}
              <motion.div 
                className={`flex-1 p-4 rounded-2xl backdrop-blur-sm
                         border transition-all duration-300
                         ${isCompleted 
                           ? 'bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40' 
                           : 'bg-gray-800/40 border-gray-700/50 hover:border-gray-600/50'
                         }`}
                whileHover={{ scale: 1.02, x: 5 }}
                transition={{ duration: 0.2 }}
              >
                {/* Status Badge */}
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full mb-2
                              text-sm font-medium ${
                                isCompleted 
                                  ? 'bg-blue-500/20 text-blue-400' 
                                  : 'bg-gray-800/50 text-gray-400'
                              }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    isCompleted ? 'bg-blue-400 animate-pulse' : 'bg-gray-500'
                  }`} />
                  <span>{step.description}</span>
                </div>

                {/* Timestamp */}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className={`w-4 h-4 ${isCompleted ? 'text-blue-400' : 'text-gray-500'}`} />
                  <span className={`${isCompleted ? 'text-gray-300' : 'text-gray-500'} text-sm`}>
                    {new Intl.DateTimeFormat('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }).format(new Date(step.timestamp))}
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// Modern Support Actions
const SupportActions = () => {
  const actions = [
    {
      icon: MessageCircle,
      label: 'محادثة واتساب',
      color: 'text-green-500',
      bgColor: 'bg-gradient-to-r from-green-500/10 to-green-600/10',
      borderColor: 'border-green-500/20',
      onClick: () => window.open('https://wa.me/+201033939828', '_blank')
    },
    {
      icon: Phone,
      label: 'اتصل بنا',
      color: 'text-blue-500',
      bgColor: 'bg-gradient-to-r from-blue-500/10 to-blue-600/10',
      borderColor: 'border-blue-500/20',
      onClick: () => window.open('tel:+201033939828', '_blank')
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {actions.map((action, index) => (
        <motion.button
          key={index}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={action.onClick}
          className={`${action.bgColor} rounded-2xl p-4 flex flex-col items-center gap-3
                     border ${action.borderColor} backdrop-blur-xl
                     hover:brightness-110 transition-all duration-300 group`}
        >
          <div className={`p-3 rounded-xl ${action.bgColor} ${action.color}
                        group-hover:scale-110 transition-transform duration-300`}>
            <action.icon className="w-6 h-6" />
          </div>
          <span className="text-sm text-white font-medium">{action.label}</span>
        </motion.button>
      ))}
    </div>
  );
};

// Order Details Content
const OrderDetailsContent = ({ order, onCancel }) => {
  if (!order) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount);
  };

  return (
    <div className="space-y-8 pt-8"
    dir='rtl'>

      {order.tracking && order.tracking.length > 0 && (
        <OrderTimeline steps={order.tracking} />
      )}

      <div className="px-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">المنتجات</h3>
          <span className="text-sm text-gray-400">
            {order.totalQuantity} منتج
          </span>
        </div>

        <div className="space-y-4"
        dir='ltr'>
          {order.items.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-gradient-to-b from-gray-800/40 to-gray-900/40 
                       backdrop-blur-xl rounded-2xl p-4 border border-gray-700/50"
            >
              <div className="flex gap-4">
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-700/50
                              group-hover:border-blue-500/30 transition-all duration-300">
                  <img
                    src={item.image || 'http://localhost:5000/uploads/3fdf62c5-d260-4c86-8a24-617fe4035232.png'}
                    alt={item.productName}
                    className="w-full h-full object-cover transform group-hover:scale-110 
                             transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-md
                                rounded-full px-2 py-1 text-xs text-white">
                    {item.quantity}×
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-bold text-blue-500">
                      {formatCurrency(item.totalPrice)}
                    </span>
                    <div className="text-right">
                      <h4 className="font-bold text-white mb-1">{item.productName}</h4>
                      <p className="text-sm text-gray-400">{item.variant}</p>
                      <p className="text-sm text-gray-500 mt-1">{item.size}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="px-6">
        <div className="bg-gradient-to-b from-gray-800/40 to-gray-900/40 backdrop-blur-xl
                     rounded-2xl p-5 border border-gray-700/50 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">المجموع</span>
            <span className="text-white">{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">الشحن</span>
            <span className="text-green-500">{order.shippingFee === 0 ? 'مجاناً' : formatCurrency(order.shippingFee)}</span>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent" />
          <div className="flex justify-between items-center">
            <span className="font-bold text-white">الإجمالي</span>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 
                           bg-clip-text text-transparent">
              {formatCurrency(order.total)}
            </span>
          </div>
        </div>
      </div>

      {['pending', 'processing'].includes(order.status) && (
        <div className="px-6 pt-4 pb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onCancel(order.id)}
            className="w-full bg-gradient-to-r from-red-500/10 to-red-600/10
                         text-red-500 rounded-2xl py-4 px-6 font-medium
                         hover:brightness-110 transition-all duration-300
                         border border-red-500/20 backdrop-blur-xl"
          >
            إلغاء الطلب
          </motion.button>
        </div>
      )}
    </div>
  );
};

export const OrdersView = ({ onClose, initialOrderId = null }) => {
  const { orders, loading, error, fetchOrders, cancelOrder } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isFiltersVisible, setIsFiltersVisible] = useState(true);
  const lastScrollPosition = useRef(0);

  // Handle scroll to hide/show filters
  const handleScroll = (e) => {
    const currentScroll = e.target.scrollTop;
    if (currentScroll > lastScrollPosition.current && currentScroll > 100) {
      setIsFiltersVisible(false);
    } else {
      setIsFiltersVisible(true);
    }
    lastScrollPosition.current = currentScroll;
  };

  useEffect(() => {
    if (initialOrderId && orders.length) {
      const order = orders.find(o => o.id === initialOrderId);
      if (order) setSelectedOrder(order);
    }
  }, [orders, initialOrderId]);

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center"
      >
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-blue-500/30 
                       animate-spin border-t-blue-500" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="w-6 h-6 text-blue-500" />
          </div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center p-4"
        dir='rtl'
      >
        <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-xl rounded-3xl p-8 
                     border border-gray-700/50 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">حدث خطأ</h3>
          <p className="text-gray-400 mb-6">{error}</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchOrders}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white 
                     rounded-xl px-6 py-3 font-medium hover:brightness-110 
                     transition-all duration-300"
          >
            إعادة المحاولة
          </motion.button>
        </div>
      </motion.div>
    );
  }

  const filteredOrders = orders.filter(order =>
    filterStatus === 'all' || order.status === filterStatus
  );

  const filterTabs = [
    { id: 'all', label: 'الكل' },
    { id: 'pending', label: 'قيد التنفيذ' },
    { id: 'processing', label: 'جاري التجهيز' },
    { id: 'shipping', label: 'في الطريق' },
    { id: 'delivered', label: 'تم التوصيل' },
    { id: 'cancelled', label: 'ملغي' }
  ];

  return (
    <>
      <div className="fixed inset-0 bg-gray-900 z-40"
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <motion.div 
            className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800/50"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="px-4 py-4">
              <div className="flex justify-between items-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="p-2 rounded-xl bg-gray-800/80 text-gray-400 
                           hover:bg-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
                <h2 className="text-xl font-bold text-white">طلباتي</h2>
                <div className="w-9" /> {/* Spacer */}
              </div>
            </div>

            {/* Filter Tabs */}
            <motion.div 
              className="px-4 pb-4 overflow-hidden"
              animate={{ height: isFiltersVisible ? 'auto' : 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex gap-2 overflow-x-auto hide-scrollbar py-1">
                {filterTabs.map((tab, index) => (
                  <motion.button
                    key={tab.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setFilterStatus(tab.id)}
                    className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-all
                              ${filterStatus === tab.id
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium'
                                : 'bg-gray-800/80 text-gray-400 hover:bg-gray-700'}`}
                  >
                    {tab.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Orders List */}
          <div className="flex-1 overflow-auto hide-scrollbar" >
            <div className="px-4 py-4 space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <OrderCard
                        order={order}
                        onSelect={setSelectedOrder}
                      />
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16"
                  >
                    <div className="w-24 h-24 mx-auto mb-6 relative">
                      <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" />
                      <div className="relative w-full h-full rounded-full bg-gradient-to-b 
                                  from-gray-800 to-gray-900 flex items-center justify-center
                                  border border-gray-700/50">
                        <Package className="w-12 h-12 text-blue-500" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">لا توجد طلبات</h3>
                    <p className="text-gray-400 mb-8">
                      ابدأ التسوق الآن واستمتع بمجموعتنا المميزة
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onClose}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 
                               text-white rounded-2xl px-8 py-3 font-medium
                               hover:brightness-110 transition-all duration-300
                               shadow-lg shadow-blue-500/25"
                    >
                      تسوق الآن
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sheet for Order Details */}
      <BottomSheet
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title="تفاصيل الطلب"
      >
        <OrderDetailsContent
          order={selectedOrder}
          onCancel={cancelOrder}
        />
      </BottomSheet>

    </>
  );
};