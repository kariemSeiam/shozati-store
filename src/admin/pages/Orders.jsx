import React, { useState, useMemo } from 'react';
import {
    Search, MapPin, Phone, Copy, MessageCircle, Package,
    CircleDollarSign, Clock, CheckCircle, Ban, RefreshCw,
    ChevronDown, Share2, X, AlertCircle, Filter, Calendar,
    Truck, ArrowUpRight, Wallet, TrendingUp,
    Printer,
    Receipt
} from 'lucide-react';
import { useOrders } from '../hooks';
import _ from 'lodash';

const Orders = () => {
    const {
        orders,
        totalOrders,
        selectedOrder,
        page,
        totalPages,
        filters,
        isLoading,
        error,
        setSelectedOrder,
        updateFilters,
        updateOrderStatus,
        nextPage,
        previousPage,
    } = useOrders();

    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Calculate analytics
    const analytics = useMemo(() => {
        if (!orders.length) return null;

        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        const statusCounts = _.countBy(orders, 'status');
        const avgOrderValue = totalRevenue / orders.length;

        return {
            totalRevenue,
            totalOrders: orders.length,
            pendingOrders: statusCounts['pending'] || 0,
            processingOrders: statusCounts['processing'] || 0,
            avgOrderValue
        };
    }, [orders]);

    return (
        <div className="min-h-screen bg-gray-900 pb-20">
            {/* Analytics Overview */}
            <div className="p-4 pt-0 grid grid-cols-2 gap-4">
                <StatCard
                    title="إجمالي المبيعات"
                    value={(analytics?.totalRevenue?.toLocaleString('ar-EG') || 0) + ' جنيه'}
                    icon={Wallet}
                    color="emerald"
                />
                <StatCard
                    title="عدد الطلبات"
                    value={analytics?.totalOrders || 0}
                    icon={Package}
                    color="blue"
                />
                <StatCard
                    title="متوسط قيمة الطلب"
                    value={ (analytics?.avgOrderValue?.toLocaleString('ar-EG')||0) + ' جنيه'}
                    icon={TrendingUp}
                    color="amber"
                />
                <StatCard
                    title="طلبات معلقة"
                    value={analytics?.pendingOrders || 0}
                    icon={Clock}
                    color="red"
                />
            </div>

            {/* Filters */}
            <div className="sticky top-0 z-30 bg-gray-900/95 backdrop-blur-sm p-4 space-y-4">
                <SearchBar
                    value={filters.search}
                    onChange={value => updateFilters({ search: value })}
                />
                <FilterTabs
                    activeStatus={filters.status}
                    onStatusChange={status => updateFilters({ status })}
                />
            </div>

            {/* Orders List */}
            <div className="p-4 space-y-4">
                {isLoading ? (
                    <LoadingState />
                ) : error ? (
                    <ErrorState message={error} />
                ) : orders.length === 0 ? (
                    <EmptyState />
                ) : (
                    orders.map(order => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            onClick={() => {
                                setSelectedOrder(order);
                                setIsDetailsOpen(true);
                            }}
                        />
                    ))
                )}
            </div>

            {/* Order Details Sheet */}
            {selectedOrder && (
                <OrderDetailsSheet
                    order={selectedOrder}
                    isOpen={isDetailsOpen}
                    onClose={() => {
                        setIsDetailsOpen(false);
                        setSelectedOrder(null);
                    }}
                    onUpdateStatus={updateOrderStatus}
                />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    onNext={nextPage}
                    onPrevious={previousPage}
                />
            )}
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className={`relative overflow-hidden hide-scrollbar rounded-2xl p-4 
                  bg-${color}-500/10 border border-${color}-500/20`}
                  dir='rtl'>
        <div className="absolute top-4 left-4">
            <Icon className={`w-6 h-6 text-${color}-500`} />
        </div>
        <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-400">{title}</h3>
            <div className="mt-2">
                <span className={`text-2xl font-bold text-${color}-500`}>{value}</span>
            </div>
        </div>
    </div>
);

const SearchBar = ({ value, onChange }) => (
    <div className="relative">
        <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="ابحث برقم الطلب أو رقم الهاتف..."
            className="w-full h-12 bg-gray-800/50 rounded-xl px-12 text-white text-right
                 border border-gray-700/50 focus:border-blue-500/50
                 focus:ring-2 focus:ring-blue-500/50
                 placeholder:text-gray-500"
            dir="rtl"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        {value && (
            <button
                onClick={() => onChange('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full
                   hover:bg-gray-700/50 transition-colors"
            >
                <X className="w-4 h-4 text-gray-400" />
            </button>
        )}
    </div>
);

const FilterTabs = ({ activeStatus, onStatusChange }) => {
    const statuses = [
        { id: 'all', label: 'الكل', icon: Package },
        { id: 'pending', label: 'معلق', icon: Clock },
        { id: 'processing', label: 'قيد التنفيذ', icon: RefreshCw },
        { id: 'delivered', label: 'تم التسليم', icon: CheckCircle },
        { id: 'cancelled', label: 'ملغي', icon: Ban }
    ];

    return (
        <div className="flex gap-2 overflow-x-auto hide-scrollbar py-2" dir="rtl">
            {statuses.map(({ id, label, icon: Icon }) => (
                <button
                    key={id}
                    onClick={() => onStatusChange(id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm
                     whitespace-nowrap transition-colors
                     ${activeStatus === id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'}`}
                >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                </button>
            ))}
        </div>
    );
};

const OrderCard = ({ order, onClick }) => {
    const statusConfig = {
        pending: { icon: Clock, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10', label: 'معلق' },
        processing: { icon: RefreshCw, color: 'text-blue-500', bgColor: 'bg-blue-500/10', label: 'قيد التنفيذ' },
        delivered: { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-500/10', label: 'تم التسليم' },
        cancelled: { icon: Ban, color: 'text-red-500', bgColor: 'bg-red-500/10', label: 'ملغي' }
    }[order.status] || { icon: Package, color: 'text-gray-500', bgColor: 'bg-gray-500/10', label: 'غير معروف' };

    const StatusIcon = statusConfig.icon;
    const phone = order.userPhone || order.user?.phone_number;
    const name = order.userName || order.user?.name;
    const total = order.total || 0;
    const createdAt = order.createdAt || order.created_at;

    const handleCopyPhoneNumber = async (e) => {
        e.stopPropagation();
        if (!phone) return;
        try {
            await navigator.clipboard.writeText(phone);
            // Add toast notification here
        } catch (err) {
            console.error('Failed to copy phone number:', err);
        }
    };

    const handleWhatsAppClick = (e) => {
        e.stopPropagation();
        if (!phone) return;
        window.open(`https://wa.me/${phone}`, '_blank');
    };

    const handlePhoneClick = (e) => {
        e.stopPropagation();
        if (!phone) return;
        window.open(`tel:${phone}`, '_blank');
    };

    return (
        <div
            onClick={onClick}
            className="group bg-gray-800/30 rounded-2xl p-4 space-y-4 cursor-pointer
                  border border-gray-700/50 hover:border-blue-500/30
                  transition-all duration-300 relative overflow-hidden hide-scrollbar"
        >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800/0 to-gray-800/50 opacity-0 
                      group-hover:opacity-100 transition-opacity duration-500" />

            {/* Content */}
            <div className="relative">
                <div className="flex justify-between items-start gap-4">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full
                          ${statusConfig.color} ${statusConfig.bgColor} border border-transparent
                          transition-all duration-300 group-hover:border-current/20`}>
                        <StatusIcon className={`w-4 h-4 ${status === 'processing' ? 'group-hover:animate-spin' : ''}`} />
                        <span className="text-sm font-medium">{statusConfig.label}</span>
                    </div>

                    <div className="text-right flex-1 min-w-0">
                        {name && (
                            <h3 className="font-bold text-white truncate group-hover:text-blue-500
                             transition-colors duration-300">
                                {name}
                            </h3>
                        )}
                        {phone && (
                            <p className="text-sm text-gray-400 mt-0.5 dir-ltr">
                                {phone}
                            </p>
                        )}
                        {createdAt && (
                            <p className="text-xs text-gray-500 mt-1">
                                {new Date(createdAt).toLocaleString('ar-EG', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: 'numeric'
                                })}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-700/50 mt-4">
                    <div className="flex gap-2">
                        {phone && (
                            <>
                                <button
                                    onClick={handleWhatsAppClick}
                                    className="p-2 rounded-xl bg-gray-800/50 hover:bg-green-500/10
                            border border-transparent hover:border-green-500/30
                            transition-all duration-300 group/btn"
                                    title="واتساب"
                                >
                                    <MessageCircle className="w-5 h-5 text-green-500 transition-transform duration-300
                                          group-hover/btn:scale-110" />
                                </button>
                                <button
                                    onClick={handlePhoneClick}
                                    className="p-2 rounded-xl bg-gray-800/50 hover:bg-blue-500/10
                            border border-transparent hover:border-blue-500/30
                            transition-all duration-300 group/btn"
                                    title="اتصال"
                                >
                                    <Phone className="w-5 h-5 text-blue-500 transition-transform duration-300
                                  group-hover/btn:scale-110" />
                                </button>
                                <button
                                    onClick={handleCopyPhoneNumber}
                                    className="p-2 rounded-xl bg-gray-800/50 hover:bg-blue-500/10
                            border border-transparent hover:border-blue-500/30
                            transition-all duration-300 group/btn"
                                    title="نسخ رقم الهاتف"
                                >
                                    <Copy className="w-5 h-5 text-blue-500 transition-transform duration-300
                                 group-hover/btn:scale-110" />
                                </button>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="text-right">
                            <span className="block font-bold text-blue-500 text-lg">
                                {total.toLocaleString('ar-EG')} جنيه
                            </span>
                            {order.items?.length > 0 && (
                                <span className="text-xs text-gray-400">
                                    {order.items.length} منتج
                                </span>
                            )}
                        </div>
                        <Package className="w-5 h-5 text-gray-400 group-hover:text-blue-500
                              transition-colors duration-300" />
                    </div>
                </div>
            </div>
        </div>
    );

};

const OrderDetailsSheet = ({ order, isOpen, onClose, onUpdateStatus }) => {
    if (!order) return null;

    const phone = order.userPhone || order.user?.phone_number;
    const items = order.items || [];
    const total = order.total || 0;
    const subtotal = order.subtotal || 0;
    const tracking = order.tracking || [];

    const handleShare = async () => {
        const text = `
  طلب من: ${phone}
  المنتجات:
  ${items.map(item => `• ${item.productName || item.name}
     ${item.quantity}× - المقاس: ${item.size} - اللون: ${item.variant}
     السعر: ${(item.price * item.quantity).toLocaleString('ar-EG')} جنيه`).join('\n')}
  
  الإجمالي: ${total.toLocaleString('ar-EG')} جنيه
  التاريخ: ${new Date(order.createdAt).toLocaleString('ar-EG')}`.trim();

        try {
            if (navigator.share) {
                await navigator.share({ text });
            } else {
                await navigator.clipboard.writeText(text);
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Error sharing:', err);
            }
        }
    };

    const generateOrderHTML = (format = 'A5') => {
        const sizes = {
            A4: { width: '210mm', height: '297mm' },
            A5: { width: '148mm', height: '210mm' },
            receipt: { width: '80mm', height: 'auto' }
        };

        const html = `
          <!DOCTYPE html>
          <html dir="rtl">
          <head>
            <meta charset="UTF-8">
            <style>
              @page {
                size: ${sizes[format].width} ${sizes[format].height};
                margin: 0;
              }
              @media print {
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
              }
              body {
                font-family: system-ui, -apple-system, sans-serif;
                margin: 0;
                padding: ${format === 'receipt' ? '10mm' : '20mm'};
                width: ${sizes[format].width};
                box-sizing: border-box;
              }
              .header {
                text-align: center;
                border-bottom: 1px solid #000;
                padding-bottom: 10px;
                margin-bottom: 20px;
              }
              .qr-code {
                text-align: center;
                margin: 10px 0;
              }
              .items {
                border-collapse: collapse;
                width: 100%;
                margin: 20px 0;
              }
              .items th, .items td {
                border: 1px solid #000;
                padding: 8px;
                text-align: right;
              }
              .summary {
                margin-top: 20px;
                border-top: 1px solid #000;
                padding-top: 10px;
              }
              .contact {
                display: flex;
                justify-content: space-between;
                margin-top: 20px;
              }
              .barcode {
                text-align: center;
                margin: 20px 0;
                font-family: 'Libre Barcode 39', cursive;
                font-size: 40px;
              }
              @media print {
                .no-print {
                  display: none;
                }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0;">أمر توصيل # ORD-0001</h1>
              <p style="margin: 5px 0;">${new Date(order.createdAt).toLocaleString('ar-EG')}</p>
            </div>
    
            <div class="contact">
              <div>
                <strong>رقم العميل:</strong>
                <p style="margin: 5px 0;" dir="ltr">${phone}</p>
              </div>
              <div style="text-align: left;">
                <strong>حالة الطلب:</strong>
                <p style="margin: 5px 0;">${getStatusLabel(order.status)}</p>
              </div>
            </div>
    
            <table class="items">
              <thead>
                <tr>
                  <th>المنتج</th>
                  <th>المقاس</th>
                  <th>اللون</th>
                  <th>الكمية</th>
                  <th>السعر</th>
                  <th>الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                ${items.map(item => `
                  <tr>
                    <td>${item.productName || item.name}</td>
                    <td>${item.size}</td>
                    <td>${item.variant}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price.toLocaleString('ar-EG')}</td>
                    <td>${(item.price * item.quantity).toLocaleString('ar-EG')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
    
            <div class="summary">
              <div style="display: flex; justify-content: space-between;">
                <strong>المجموع:</strong>
                <span>${subtotal.toLocaleString('ar-EG')} جنيه</span>
              </div>
              ${order.shipping ? `
                <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                  <strong>الشحن:</strong>
                  <span>${order.shipping.toLocaleString('ar-EG')} جنيه</span>
                </div>
              ` : ''}
              <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 1.2em;">
                <strong>الإجمالي:</strong>
                <strong>${total.toLocaleString('ar-EG')} جنيه</strong>
              </div>
            </div>
    
            <div class="barcode">
              *ORD-0001*
            </div>
    
            <div class="qr-code">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`Order # ORD-0001\nPhone: ${phone}\nTotal: ${total} EGP`)}" />
            </div>
          </body>
          </html>
        `;

        return html;
    };

    const printOrder = (format) => {
        const html = generateOrderHTML(format);
        const printWindow = window.open('', 'PRINT', `height=${format === 'receipt' ? '800' : '600'},width=600`);

        printWindow.document.write(html);
        printWindow.document.close();

        // Wait for images to load
        printWindow.onload = function () {
            printWindow.focus();
            printWindow.print();
            printWindow.onafterprint = function () {
                printWindow.close();
            };
        };
    };

    return (
        <div className={`fixed inset-0 z-50 transition-opacity duration-300
                      ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className={`fixed inset-x-0 bottom-0 transform transition-transform duration-500 
                        ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="bg-gradient-to-b from-gray-900/95 to-gray-900 backdrop-blur-xl
                        rounded-t-[2.5rem] border-t border-gray-800/50 shadow-2xl
                        max-h-[90vh] overflow-y-auto hide-scrollbar">
                    <div className="px-6 py-8 space-y-6">
                        {/* Order Header */}
                        <div className="flex justify-between items-center">
                            <button onClick={onClose}
                                className="p-2 -m-2 rounded-full hover:bg-gray-800/50 transition-colors">
                                <ChevronDown className="w-6 h-6 text-gray-400" />
                            </button>
                            <div className="text-center flex-1">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm
                                bg-gray-800/50">
                                    <StatusIcon status={order.status} className="w-4 h-4" />
                                    <span>{getStatusLabel(order.status)}</span>
                                </div>
                            </div>
                            <button onClick={handleShare}
                                className="p-2 -m-2 rounded-full hover:bg-gray-800/50 transition-colors">
                                <Share2 className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        {/* Customer Info */}
                        <div className="bg-gray-800/30 rounded-2xl p-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-lg font-bold text-white">معلومات العميل</h4>
                                <span className="text-sm text-gray-400" dir="ltr">{phone}</span>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <button onClick={() => window.open(`https://wa.me/${phone}`, '_blank')}
                                    className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl
                                   bg-gray-800/50 hover:bg-green-500/10 border border-transparent
                                   hover:border-green-500/30 transition-all duration-300">
                                    <MessageCircle className="w-5 h-5 text-green-500" />
                                    <span className="text-sm text-gray-400">واتساب</span>
                                </button>
                                <button onClick={() => window.open(`tel:${phone}`, '_blank')}
                                    className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl
                                   bg-gray-800/50 hover:bg-blue-500/10 border border-transparent
                                   hover:border-blue-500/30 transition-all duration-300">
                                    <Phone className="w-5 h-5 text-blue-500" />
                                    <span className="text-sm text-gray-400">اتصال</span>
                                </button>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between"
                            dir='rtl'>
                                <h4 className="text-lg font-bold text-white">المنتجات</h4>
                                <span className="text-sm text-gray-400">{items.length} منتج</span>
                            </div>

                            <div className="space-y-3">
                                {items.map((item, index) => (
                                    <div key={index}
                                        className="bg-gray-800/30 rounded-xl p-3 flex gap-3">
                                        <div className="relative w-16 h-16 rounded-lg overflow-hidden hide-scrollbar group">
                                            <img src={item.image} alt={item.productName}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                            <span className="absolute bottom-1 right-1 text-xs bg-black/50 text-white
                                       px-1.5 py-0.5 rounded-full">
                                                {item.quantity}×
                                            </span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2">
                                                <span className="text-blue-500 font-bold whitespace-nowrap">
                                                    {(item.price * item.quantity).toLocaleString('ar-EG')} جنيه
                                                </span>
                                                <h4 className="font-medium text-white text-right truncate">
                                                    {item.productName || item.name}
                                                </h4>
                                            </div>
                                            <div className="mt-1 flex justify-end items-center gap-3">
                                                <span className="text-sm text-gray-400">
                                                    المقاس: {item.size}
                                                </span>
                                                <span className="text-sm text-gray-400">
                                                    اللون: {item.variant}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-gray-800/30 rounded-2xl p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-blue-500 font-bold">
                                    {subtotal.toLocaleString('ar-EG')} جنيه
                                </span>
                                <span className="text-gray-400">المجموع</span>
                            </div>

                            {(order.shipping != 0) && (
                                <div className="flex justify-between items-center">
                                    <span className="text-green-500 font-bold">
                                        {order.shipping.toLocaleString('ar-EG')} جنيه
                                    </span>
                                    <span className="text-gray-400">الشحن</span>
                                </div>
                            )}

                            <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />

                            <div className="flex justify-between items-center">
                                <span className="text-xl font-bold text-white">
                                    {total.toLocaleString('ar-EG')} جنيه
                                </span>
                                <span className="text-lg font-bold text-white">الإجمالي</span>
                            </div>
                        </div>

                        {/* Status Timeline */}
                        {tracking.length > 0 && (
                            <div className="space-y-4"
                           >
                                <h4 className="text-lg font-bold text-white"
                                 dir='rtl'>تتبع الطلب</h4>
                                <div className="relative space-y-4"
                                >
                                    {tracking.map((step, index) => (
                                        <div key={index} className="flex items-start gap-4">
                                            {index !== tracking.length - 1 && (
                                                <div className="absolute top-8 bottom-0 left-4 w-px 
                                        bg-gradient-to-b from-gray-700 to-transparent" />
                                            )}

                                            <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center
                                      ${step.completed ? 'bg-blue-500' : 'bg-gray-700'}`}>
                                                <StatusIcon status={step.status} className="w-4 h-4 text-white" />
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-400">
                                                        {new Date(step.timestamp).toLocaleString('ar-EG')}
                                                    </span>
                                                    <span className="font-medium text-white">
                                                        {getStatusLabel(step.status)}
                                                    </span>
                                                </div>
                                                {step.description && (
                                                    <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Status Actions */}
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { status: 'pending', label: 'تعليق', icon: Clock, color: 'yellow' },
                                { status: 'processing', label: 'معالجة', icon: RefreshCw, color: 'blue' },
                                { status: 'delivered', label: 'تسليم', icon: CheckCircle, color: 'green' },
                                { status: 'cancelled', label: 'إلغاء', icon: Ban, color: 'red' }
                            ].map(({ status, label, icon: Icon, color }) => (
                                <button
                                    key={status}
                                    onClick={() => onUpdateStatus(order.id, status)}
                                    disabled={order.status === status}
                                    className={`flex items-center justify-center gap-2 p-3 rounded-xl font-medium 
                               transition-all duration-300 group
                               ${order.status === status
                                            ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
                                            : `bg-gray-800/30 hover:bg-${color}-500/10 
                                    border border-transparent hover:border-${color}-500/30`}`}>
                                    <Icon className={`w-5 h-5 ${order.status === status
                                        ? 'text-gray-500'
                                        : `text-${color}-500 
                                        ${status === 'processing' ? 'group-hover:animate-spin' : ''}`}`} />
                                    <span className={`text-sm ${order.status === status
                                        ? 'text-gray-500'
                                        : `text-gray-400 group-hover:text-${color}-500`}`}>
                                        {label}
                                    </span>
                                </button>
                            ))}

                        </div>

                    </div>

                </div>

            </div>
            {/*        <div className="fixed bottom-0 inset-x-0 bg-gray-900/95 backdrop-blur-xl 
                  border-t border-gray-800/50 p-4">
    <div className="grid grid-cols-3 gap-2">
      <button
        onClick={() => printOrder('A4')}
        className="flex items-center justify-center gap-2 p-3 rounded-xl
                  bg-gray-800/30 hover:bg-blue-500/10 border border-transparent 
                  hover:border-blue-500/30 transition-all duration-300 group"
      >
        <Printer className="w-5 h-5 text-blue-500" />
        <span className="text-sm text-gray-400 group-hover:text-blue-500">
          طباعة A4
        </span>
      </button>

      <button
        onClick={() => printOrder('A5')}
        className="flex items-center justify-center gap-2 p-3 rounded-xl
                  bg-gray-800/30 hover:bg-green-500/10 border border-transparent 
                  hover:border-green-500/30 transition-all duration-300 group"
      >
        <Printer className="w-5 h-5 text-green-500" />
        <span className="text-sm text-gray-400 group-hover:text-green-500">
          طباعة A5
        </span>
      </button>

      <button
        onClick={() => printOrder('receipt')}
        className="flex items-center justify-center gap-2 p-3 rounded-xl
                  bg-gray-800/30 hover:bg-amber-500/10 border border-transparent 
                  hover:border-amber-500/30 transition-all duration-300 group"
      >
        <Receipt className="w-5 h-5 text-amber-500" />
        <span className="text-sm text-gray-400 group-hover:text-amber-500">
          طباعة إيصال
        </span>
      </button>
    </div>
  </div>*/}
        </div>
    );
};

// Helper Components
const StatusIcon = ({ status }) => {
    const icons = {
        pending: Clock,
        processing: RefreshCw,
        delivered: CheckCircle,
        cancelled: Ban
    };
    const Icon = icons[status] || Package;
    return <Icon className="w-5 h-5" />;
};

const getStatusLabel = (status) => {
    const labels = {
        pending: 'معلق',
        processing: 'قيد التنفيذ',
        delivered: 'تم التسليم',
        cancelled: 'ملغي'
    };
    return labels[status] || 'غير معروف';
};

const LoadingState = () => (
    <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 
                    border-t-transparent rounded-full" />
    </div>
);

const ErrorState = ({ message }) => (
    <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">حدث خطأ</h3>
        <p className="text-gray-400">{message}</p>
    </div>
);

const EmptyState = () => (
    <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-700 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">لا توجد طلبات</h3>
        <p className="text-gray-400">لم يتم العثور على طلبات تطابق معايير البحث</p>
    </div>
);

const Pagination = ({ page, totalPages, onNext, onPrevious }) => (
    <div className="fixed bottom-0 inset-x-0 bg-gray-900/95 backdrop-blur-xl 
                  border-t border-gray-800/50 p-4">
        <div className="flex justify-between items-center max-w-lg mx-auto">
            <button
                onClick={onPrevious}
                disabled={page <= 1}
                className="p-2 rounded-xl bg-gray-800/50 text-gray-400
                  disabled:opacity-50 disabled:cursor-not-allowed
                  hover:bg-gray-700/50 transition-colors"
            >
                السابق
            </button>
            <span className="text-gray-400">
                صفحة {page} من {totalPages}
            </span>
            <button
                onClick={onNext}
                disabled={page >= totalPages}
                className="p-2 rounded-xl bg-gray-800/50 text-gray-400
                  disabled:opacity-50 disabled:cursor-not-allowed
                  hover:bg-gray-700/50 transition-colors"
            >
                التالي
            </button>
        </div>
    </div>
);

export default Orders;