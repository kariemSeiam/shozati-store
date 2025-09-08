import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Package, MapPin, Clock, RefreshCw, X, Phone, MessageCircle,
  ChevronDown, ArrowLeft, Shield, Check, Search, ChevronRight,
  AlertCircle, Building2, Truck, Star, Navigation, Calendar,
  ShoppingBag, Box, ArrowUpRight, Tag
} from 'lucide-react';
import { useOrders } from './hooks';
import { BottomSheet } from './ProfileComponent';

// Enhanced Status Badge Component with Premium Light Theme
const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: {
      icon: Clock,
      text: 'قيد التنفيذ',
      class: 'bg-gradient-to-r from-primary-50 to-primary-100 text-primary-600 border-primary-200',
      iconClass: 'text-primary-500',
      shadowClass: 'shadow-primary-200/20'
    },
    processing: {
      icon: Package,
      text: 'جاري التجهيز',
      class: 'bg-gradient-to-r from-primary-50 to-primary-100 text-primary-600 border-primary-200',
      iconClass: 'text-primary-500',
      shadowClass: 'shadow-primary-200/20'
    },
    shipping: {
      icon: Truck,
      text: 'في الطريق',
      class: 'bg-gradient-to-r from-warning-50 to-warning-100 text-warning-600 border-warning-200',
      iconClass: 'text-primary-500',
      shadowClass: 'shadow-warning-200/20'
    },
    delivered: {
      icon: Shield,
      text: 'تم التوصيل',
      class: 'bg-gradient-to-r from-success-50 to-success-100 text-success-600 border-success-200',
      iconClass: 'text-success-500',
      shadowClass: 'shadow-success-200/20'
    },
    cancelled: {
      icon: X,
      text: 'ملغي',
      class: 'bg-gradient-to-r from-error-50 to-error-100 text-error-600 border-error-200',
      iconClass: 'text-error-500',
      shadowClass: 'shadow-error-200/20'
    }
  };

  const config = statusConfig[status] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <div className={`px-4 py-2 rounded-2xl text-sm inline-flex items-center gap-2 
                    border shadow-sm hover:shadow-md transition-all duration-300
                    backdrop-blur-xl ${config.class} ${config.shadowClass}`}>
      <StatusIcon className={`w-4 h-4 ${config.iconClass}`} />
      <span className="font-medium">{config.text}</span>
    </div>
  );
};

// Modern Order Card with Premium Light Theme
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
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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
      <div className="relative overflow-hidden backdrop-blur-xl rounded-3xl 
                    border border-neutral-200 bg-gradient-to-b from-white to-gray-50 p-5
                    hover:border-gray-300 hover:shadow-lg
                    transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/20 to-indigo-100/20 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <StatusBadge status={order.status} />
            <div className="flex items-center gap-2 text-primary-600">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{formatDate(order.createdAt)}</span>
            </div>
          </div>

          {/* Items Preview */}
          <div className="flex gap-3 mb-6 overflow-x-auto hide-scrollbar py-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="relative flex-shrink-0 group/item">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-primary-200
                              group-hover:border-primary-300 transition-all duration-500
                              shadow-sm group-hover:shadow-md">
                  <img
                    src={item.image || 'http://localhost:5000/uploads/3fdf62c5-d260-4c86-8a24-617fe4035232.png'}
                    alt={item.productName}
                    className="w-full h-full object-cover transform group-hover/item:scale-110 
                             transition-transform duration-500"
                  />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full 
                              bg-gradient-to-r from-primary-500 to-primary-600
                              flex items-center justify-center text-xs font-bold text-white
                              shadow-md shadow-primary-400/25">
                  {item.quantity}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t border-primary-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary-100">
                <ShoppingBag className="w-4 h-4 text-primary-500" />
              </div>
              <span className="text-primary-600 text-sm">{order.totalQuantity} منتج</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary-500 font-bold text-lg">
                {formatCurrency(order.total)}
              </span>
              <ArrowUpRight className="w-4 h-4 text-primary-500 transform 
                                     group-hover:translate-x-1 group-hover:-translate-y-1
                                     transition-transform duration-300" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Ultra Modern Timeline Component with Premium Design
const OrderTimeline = ({ steps }) => {
  const statusIcons = {
    'pending': Clock,
    'processing': Package,
    'shipping': Truck,
    'delivered': Shield,
    'cancelled': X
  };

  // Sort steps by timestamp and add visual indicators
  const sortedSteps = useMemo(() => {
    return [...steps]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .map((step, index, array) => ({
        ...step,
        isLatest: index === 0,
        isOldest: index === array.length - 1
      }));
  }, [steps]);

  return (
    <div className="relative py-4 px-4">
      {/* Premium Animated Timeline Line */}
      <div className="absolute right-12 w-0 overflow-hidden h-full">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-300/0 via-primary-400/50 to-primary-300/0" />
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-primary-300/0 via-primary-400 to-primary-300/0"
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

      {/* Enhanced Timeline Steps */}
      {sortedSteps.map((step, index) => {
        const isCompleted = step.completed;
        const isLast = index === sortedSteps.length - 1;
        const StatusIcon = statusIcons[step.status] || Clock;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.15 }}
            className={`relative ${!isLast ? 'mb-6' : ''}`}
          >
            <div className="relative flex gap-6">
              {/* Ultra Premium Step Indicator */}
              <div className="relative">
                <motion.div
                  className={`w-8 h-8 rounded-xl relative z-10
                           flex items-center justify-center
                           transition-all duration-500 
                           border-2 ${isCompleted
                      ? 'bg-gradient-to-br from-primary-400 to-primary-500 border-primary-300'
                      : 'bg-gradient-to-br from-white to-primary-50 border-primary-200'
                    }
                           'ring-4 ring-primary-200/50'
                           shadow-lg shadow-primary-200/20 hover:shadow-xl hover:shadow-primary-300/30`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <StatusIcon className={`w-4 h-4 text-primary-400`} />
                </motion.div>

                {/* Time Connection Line */}
                {!isLast && (
                  <div className="absolute top-8 right-4 bottom-0 w-px bg-gradient-to-b from-primary-200 to-transparent" />
                )}
              </div>

              {/* Premium Content Box */}
              <motion.div
                className={`flex-1 p-4 rounded-2xl backdrop-blur-xl
                         border transition-all duration-300
                         ${isCompleted
                    ? 'bg-gradient-to-br from-primary-50 to-white border-primary-200'
                    : 'bg-gradient-to-br from-primary-50 to-white border-primary-200'
                  }
                         ${step.isLatest ? 'shadow-lg shadow-primary-200/30' : 'shadow-lg shadow-primary-200/30'}
                         hover:shadow-xl hover:shadow-primary-300/20
                         group`}
                whileHover={{ scale: 1.02, x: 5 }}
                transition={{ duration: 0.2 }}
              >
                {/* Enhanced Status Badge */}
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full mb-2
                              text-sm font-medium backdrop-blur-xl
                              ${isCompleted
                    ? 'bg-gradient-to-r from-primary-100 to-primary-50 text-primary-600'
                    : 'bg-gradient-to-r from-primary-100 to-primary-50 text-primary-600'
                  }
                              shadow-sm group-hover:shadow-md transition-all duration-300`}>
                  <div className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-primary-500 animate-pulse' : 'bg-primary-500 animate-pulse'
                    }`} />
                  <span>{step.description}</span>

                </div>

                {/* Enhanced Timestamp */}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className={`w-4 h-4 ${isCompleted ? 'text-primary-500' : 'text-slate-400'}`} />
                  <span className={`${isCompleted ? 'text-primary-900' : 'text-slate-500'} text-sm`}>
                    {new Intl.DateTimeFormat('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }).format(new Date(step.timestamp))}
                  </span>
                </div>

                {/* Time Elapsed (for non-latest steps) */}
                {!step.isLatest && (
                  <div className="mt-2 text-xs text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatTimeAgo(step.timestamp)}
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// Utility function to format time ago
const formatTimeAgo = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 0) return `${diffInDays} days ago`;
  if (diffInHours > 0) return `${diffInHours} hours ago`;
  if (diffInMinutes > 0) return `${diffInMinutes} minutes ago`;
  return 'Just now';
};

// Premium Support Actions
const SupportActions = () => {
  const actions = [
    {
      icon: MessageCircle,
      label: 'محادثة واتساب',
      color: 'text-primary-600',
      gradient: 'from-primary-50/80 via-primary-100/50 to-white',
      onClick: () => window.open('https://wa.me/+201033939828', '_blank')
    },
    {
      icon: Phone,
      label: 'اتصل بنا',
      color: 'text-primary-600',
      gradient: 'from-primary-50/80 via-primary-100/50 to-white',
      onClick: () => window.open('tel:+201033939828', '_blank')
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4 p-6 pt-0">
      {actions.map((action, index) => (
        <motion.button
          key={index}
          whileHover={{ scale: 1.03, y: -3 }}
          whileTap={{ scale: 0.97 }}
          onClick={action.onClick}
          className={`bg-gradient-to-br ${action.gradient} 
                     rounded-2xl p-4 flex flex-col items-center gap-3
                     border border-primary-200/60 backdrop-blur-xl 
                     shadow-lg shadow-primary-200/30
                     hover:shadow-xl hover:border-primary-300/60
                     transition-all duration-300 group`}
        >
          <motion.div
            className={`p-3 rounded-xl bg-gradient-to-br from-white to-primary-50 ${action.color}
                       group-hover:scale-110 transition-all duration-300 
                       shadow-md shadow-primary-200/40 ring-1 ring-primary-100`}
            whileHover={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
          >
            <action.icon className="w-6 h-6" />
          </motion.div>
          <span className="text-sm text-primary-900 font-medium">{action.label}</span>
        </motion.button>
      ))}
    </div>
  );
};

// Premium Order Details Content
const OrderDetailsContent = ({ order, onCancel }) => {
  if (!order) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-8 pt-8 pb-0" dir="rtl">
      {order.tracking && order.tracking.length > 0 && (
        <OrderTimeline steps={order.tracking} />
      )}

      <div className="px-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-primary-900">المنتجات</h3>
          <span className="text-sm text-primary-600">
            {order.totalQuantity} منتج
          </span>
        </div>

        <div className="space-y-4" dir="ltr">
          {order.items.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-gradient-to-br from-primary-50 via-white to-primary-50
                       backdrop-blur-xl rounded-2xl p-4 border border-primary-200
                       shadow-lg shadow-primary-200/20 hover:shadow-xl 
                       hover:shadow-primary-300/20 transition-all duration-300"
            >
              <div className="flex gap-4">
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-primary-200
                              group-hover:border-primary-300 transition-all duration-300 shadow-md">
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-full h-full object-cover transform group-hover:scale-110 
                             transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-900/30 to-transparent" />
                  <div className="absolute bottom-2 right-2 bg-primary-900/40 backdrop-blur-md
                                rounded-full px-2 py-1 text-xs text-white shadow-lg">
                    {item.quantity}×
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-bold text-primary-500">
                      {formatCurrency(item.totalPrice)}
                    </span>
                    <div className="text-right">
                      <h4 className="font-bold text-primary-900 mb-1">{item.productName}</h4>
                      <p className="text-sm text-primary-600">{item.variant}</p>
                      <p className="text-sm text-primary-400 mt-1">{item.size}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="px-6">
        <div className="bg-gradient-to-br from-primary-50 via-white to-primary-50 backdrop-blur-xl
                     rounded-2xl p-5 border border-primary-200 space-y-4 shadow-lg shadow-primary-200/20
                     hover:shadow-xl hover:shadow-primary-300/20 transition-all duration-300">
          <div className="flex justify-between items-center">
            <span className="text-primary-600">المجموع</span>
            <span className="text-primary-900">{formatCurrency(order.subtotal)}</span>
          </div>

          {order.coupon && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-teal-500" />
                <span className="text-teal-600">كوبون {order.coupon.code}</span>
                <span className="text-sm text-teal-500">
                  ({order.coupon.discountType === 'percentage' ? `${order.coupon.discountValue}%` : formatCurrency(order.coupon.discountValue)})
                </span>
              </div>
              <span className="text-teal-500 font-medium">
                - {formatCurrency(order.discount)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-primary-600">الشحن</span>
            <span className="text-primary-500 font-medium">
              {order.shippingFee === 0 ? 'مجاناً' : formatCurrency(order.shippingFee)}
            </span>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-primary-200 to-transparent" />

          <div className="flex justify-between items-center">
            <span className="font-bold text-primary-900">الإجمالي</span>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 
                           bg-clip-text text-transparent">
              {formatCurrency(order.total)}
            </span>
          </div>
        </div>
      </div>

      {['pending', 'processing'].includes(order.status) && (
        <div className="px-6 pt-4 pb-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onCancel(order.id)}
            className="w-full bg-gradient-to-r from-rose-50 to-rose-100
                         text-rose-600 rounded-2xl py-4 px-6 font-medium
                         shadow-lg shadow-rose-200/20 hover:shadow-xl
                         hover:shadow-rose-300/20 transition-all duration-300
                         border border-rose-200 backdrop-blur-xl"
          >
            إلغاء الطلب
          </motion.button>
        </div>
      )}

      <SupportActions />
    </div>
  );
};


export const OrdersView = ({ onClose, initialOrderId = null }) => {
  const { orders, loading, error, fetchOrders, cancelOrder } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isFiltersVisible, setIsFiltersVisible] = useState(true);
  const lastScrollPosition = useRef(0);


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
        className="fixed inset-0 bg-white z-50 flex items-center justify-center"
      >
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-primary-300/30 
                       animate-spin border-t-primary-500 shadow-lg" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="w-6 h-6 text-primary-500" />
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
        className="fixed inset-0 bg-white z-50 flex items-center justify-center p-4"
        dir="rtl"
      >
        <div className="max-w-md w-full bg-gradient-to-br from-white to-primary-50 backdrop-blur-xl 
                     rounded-3xl p-8 border border-primary-200 text-center shadow-xl shadow-primary-200/20">
          <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-primary-900 mb-2">حدث خطأ</h3>
          <p className="text-primary-600 mb-6">{error}</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchOrders}
            className="bg-gradient-to-r from-primary-500 to-primary-600 text-white 
                     rounded-xl px-6 py-3 font-medium shadow-lg shadow-primary-500/25 
                     hover:shadow-xl hover:shadow-primary-500/30 
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
      <div className="fixed inset-0 bg-white z-40">
        <div className="h-full flex flex-col">
          {/* Enhanced Header */}
          <motion.div
            className="sticky top-0 z-10 bg-white/95 backdrop-blur-xl border-b border-primary-100
                      shadow-sm"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="px-4 py-4">
              <div className="flex justify-between items-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="p-2 rounded-xl bg-primary-50 text-primary-500 
                           hover:bg-primary-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
                <h2 className="text-xl font-bold text-primary-900">طلباتي</h2>
                <div className="w-9" />
              </div>
            </div>

            {/* Premium Filter Tabs */}
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
                              shadow-sm ${filterStatus === tab.id
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium shadow-lg shadow-primary-500/25'
                        : 'bg-primary-50 text-primary-600 hover:bg-primary-100'}`}
                  >
                    {tab.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Orders List with Enhanced Styling */}
          <div className="flex-1 overflow-auto hide-scrollbar">
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
                    className="flex flex-col items-center justify-center py-16 px-6 min-h-[400px] bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 rounded-2xl"
                  >
                    {/* Animated Background Elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
                      <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-primary-100/20 rounded-full blur-2xl animate-pulse"></div>
                      <div className="absolute bottom-1/4 right-1/4 w-20 h-20 bg-primary-200/20 rounded-full blur-xl animate-pulse delay-1000"></div>
                    </div>

                    {/* Main Content */}
                    <div className="relative z-10 flex flex-col items-center text-center max-w-sm mx-auto">
                      {/* Icon Container */}
                      <div className="relative mb-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/10 via-primary-400/10 to-primary-600/10 
                                      flex items-center justify-center shadow-xl shadow-primary-500/10 border border-primary-200/30
                                      backdrop-blur-sm">
                          <Package className="w-10 h-10 text-primary-600" />
                        </div>
                      </div>

                      {/* Text Content */}
                      <div className="space-y-3">
                        <h3 className="text-2xl font-bold text-neutral-800 leading-tight">لا توجد طلبات</h3>
                        <p className="text-neutral-600 text-base leading-relaxed">
                          ابدأ التسوق الآن واستمتع بمجموعتنا المميزة
                        </p>
                      </div>

                      {/* Decorative Line */}
                      <div className="mt-6 w-16 h-0.5 bg-gradient-to-r from-transparent via-primary-400 to-transparent rounded-full"></div>

                      {/* Action Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onClose}
                        className="mt-6 bg-gradient-to-r from-primary-500 to-primary-600 
                                 text-white rounded-2xl px-8 py-3 font-medium
                                 shadow-lg shadow-primary-500/25 hover:shadow-xl 
                                 hover:shadow-primary-500/30 transition-all duration-300"
                      >
                        تسوق الآن
                      </motion.button>
                    </div>
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