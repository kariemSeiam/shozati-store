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
// Removed lodash import for performance - using native JS alternatives

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
        const statusCounts = orders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {});
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
        <div className="min-h-screen bg-neutral-950 pb-20">
            {/* Header for mobile */}
            <div className="md:hidden flex items-center justify-between p-4 border-b border-neutral-800/50">
                <h1 className="text-xl font-bold text-white" dir="rtl">الطلبات</h1>
                <span className="text-sm text-neutral-400">
                    {analytics?.totalOrders || 0} طلب
                </span>
            </div>

            {/* Analytics Overview - Mobile Optimized */}
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
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
                    value={(analytics?.avgOrderValue?.toLocaleString('ar-EG') || 0) + ' جنيه'}
                    icon={TrendingUp}
                    color="blue"
                />
                <StatCard
                    title="طلبات معلقة"
                    value={analytics?.pendingOrders || 0}
                    icon={Clock}
                    color="red"
                />
            </div>

            {/* Filters - Mobile Optimized */}
            <div className="sticky top-0 md:top-16 z-30 bg-neutral-950/95 backdrop-blur-xl p-4 space-y-4 
                           border-b border-neutral-800/50">
                <SearchBar
                    value={filters.search}
                    onChange={value => updateFilters({ search: value })}
                />
                <FilterTabs
                    activeStatus={filters.status}
                    onStatusChange={status => updateFilters({ status })}
                />
            </div>

            {/* Orders List - Mobile Optimized */}
            <div className="p-4 space-y-3 md:space-y-4">
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

const StatCard = ({ title, value, icon: Icon, color }) => {
    const colorClasses = {
        emerald: {
            bg: 'bg-emerald-500/10',
            text: 'text-emerald-500',
            border: 'border-emerald-500/20'
        },
        blue: {
            bg: 'bg-blue-500/10',
            text: 'text-blue-500',
            border: 'border-blue-500/20'
        },
        blue: {
            bg: 'bg-blue-500/10',
            text: 'text-blue-500',
            border: 'border-blue-500/20'
        },
        red: {
            bg: 'bg-red-500/10',
            text: 'text-red-500',
            border: 'border-red-500/20'
        }
    }[color];

    return (
        <div className={`relative overflow-hidden rounded-xl md:rounded-2xl p-3 md:p-4 
                        ${colorClasses.bg} border ${colorClasses.border}`}
            dir='rtl'>
            <div className="absolute top-2 md:top-4 left-2 md:left-4">
                <Icon className={`w-5 h-5 md:w-6 md:h-6 ${colorClasses.text}`} />
            </div>
            <div className="mt-5 md:mt-6">
                <h3 className="text-xs md:text-sm font-medium text-neutral-400 leading-tight">{title}</h3>
                <div className="mt-1 md:mt-2">
                    <span className={`text-lg md:text-2xl font-bold ${colorClasses.text}`}>{value}</span>
                </div>
            </div>
        </div>
    );
};

const SearchBar = ({ value, onChange }) => (
    <div className="relative">
        <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="ابحث برقم الطلب أو رقم الهاتف..."
            className="w-full h-12 bg-neutral-800/50 rounded-xl px-12 text-white text-right
                 border border-neutral-700/50 focus:border-blue-500/50
                 focus:ring-2 focus:ring-blue-500/50
                 placeholder:text-neutral-500"
            dir="rtl"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        {value && (
            <button
                onClick={() => onChange('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full
                   hover:bg-neutral-700/50 transition-colors"
            >
                <X className="w-4 h-4 text-neutral-400" />
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
                            : 'bg-neutral-800/50 text-neutral-400 hover:bg-neutral-700/50'}`}
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
        pending: { icon: Clock, color: 'text-blue-500', bgColor: 'bg-blue-500/10', label: 'معلق' },
        processing: { icon: RefreshCw, color: 'text-blue-500', bgColor: 'bg-blue-500/10', label: 'قيد التنفيذ' },
        delivered: { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-500/10', label: 'تم التسليم' },
        cancelled: { icon: Ban, color: 'text-red-500', bgColor: 'bg-red-500/10', label: 'ملغي' }
    }[order.status] || { icon: Package, color: 'text-neutral-500', bgColor: 'bg-neutral-500/10', label: 'غير معروف' };

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
            className="group bg-neutral-800/30 rounded-xl md:rounded-2xl p-3 md:p-4 space-y-3 md:space-y-4 cursor-pointer
                  border border-neutral-700/50 hover:border-blue-500/30
                  transition-all duration-300 relative overflow-hidden"
        >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-800/0 to-neutral-800/50 opacity-0 
                      group-hover:opacity-100 transition-opacity duration-500" />

            {/* Content */}
            <div className="relative">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 md:gap-4">
                    <div className={`flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-full self-start
                          ${statusConfig.color} ${statusConfig.bgColor} border border-transparent
                          transition-all duration-300 group-hover:border-current/20`}>
                        <StatusIcon className={`w-3 h-3 md:w-4 md:h-4 ${order.status === 'processing' ? 'group-hover:animate-spin' : ''}`} />
                        <span className="text-xs md:text-sm font-medium">{statusConfig.label}</span>
                    </div>

                    <div className="text-right flex-1 min-w-0">
                        {name && (
                            <h3 className="font-bold text-white text-sm md:text-base truncate group-hover:text-blue-500
                             transition-colors duration-300">
                                {name}
                            </h3>
                        )}
                        {phone && (
                            <p className="text-xs md:text-sm text-neutral-400 mt-0.5" dir="ltr">
                                {phone}
                            </p>
                        )}
                        {createdAt && (
                            <p className="text-xs text-neutral-500 mt-1">
                                {new Date(createdAt).toLocaleString('ar-EG', {
                                    weekday: 'short',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: 'numeric'
                                })}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-neutral-700/50 mt-3 md:mt-4">
                    <div className="flex gap-1 md:gap-2">
                        {phone && (
                            <>
                                <button
                                    onClick={handleWhatsAppClick}
                                    className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-neutral-800/50 hover:bg-green-500/10
                            border border-transparent hover:border-green-500/30
                            transition-all duration-300 group/btn"
                                    title="واتساب"
                                >
                                    <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500 transition-transform duration-300
                                          group-hover/btn:scale-110" />
                                </button>
                                <button
                                    onClick={handlePhoneClick}
                                    className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-neutral-800/50 hover:bg-blue-500/10
                            border border-transparent hover:border-blue-500/30
                            transition-all duration-300 group/btn"
                                    title="اتصال"
                                >
                                    <Phone className="w-4 h-4 md:w-5 md:h-5 text-blue-500 transition-transform duration-300
                                  group-hover/btn:scale-110" />
                                </button>
                                <button
                                    onClick={handleCopyPhoneNumber}
                                    className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-neutral-800/50 hover:bg-blue-500/10
                            border border-transparent hover:border-blue-500/30
                            transition-all duration-300 group/btn"
                                    title="نسخ رقم الهاتف"
                                >
                                    <Copy className="w-4 h-4 md:w-5 md:h-5 text-blue-500 transition-transform duration-300
                                 group-hover/btn:scale-110" />
                                </button>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="text-right">
                            <span className="block font-bold text-blue-500 text-sm md:text-lg">
                                {total.toLocaleString('ar-EG')} جنيه
                            </span>
                            {order.items?.length > 0 && (
                                <span className="text-xs text-neutral-400">
                                    {order.items.length} منتج
                                </span>
                            )}
                        </div>
                        <Package className="w-4 h-4 md:w-5 md:h-5 text-neutral-400 group-hover:text-blue-500
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
                <div className="bg-gradient-to-b from-neutral-950/95 to-neutral-950 backdrop-blur-xl
                        rounded-t-[2.5rem] border-t border-neutral-800/50 shadow-2xl
                        max-h-[90vh] overflow-y-auto hide-scrollbar">
                    <div className="px-4 md:px-6 py-6 md:py-8 space-y-4 md:space-y-6">
                        {/* Order Header */}
                        <div className="flex justify-between items-center">
                            <button onClick={onClose}
                                className="p-2 -m-2 rounded-full hover:bg-neutral-850/50 transition-colors">
                                <ChevronDown className="w-6 h-6 text-neutral-400" />
                            </button>
                            <div className="text-center flex-1">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm
                                bg-neutral-850/50">
                                    <StatusIcon status={order.status} className="w-4 h-4" />
                                    <span>{getStatusLabel(order.status)}</span>
                                </div>
                            </div>
                            <button onClick={handleShare}
                                className="p-2 -m-2 rounded-full hover:bg-neutral-850/50 transition-colors">
                                <Share2 className="w-6 h-6 text-neutral-400" />
                            </button>
                        </div>

                        {/* Customer Info */}
                        <div className="bg-neutral-850/30 rounded-xl md:rounded-2xl p-3 md:p-4 border border-neutral-700/30">
                            <div className="flex items-center justify-between">
                                <h4 className="text-base md:text-lg font-bold text-white">معلومات العميل</h4>
                                <span className="text-xs md:text-sm text-neutral-400" dir="ltr">{phone}</span>
                            </div>

                            <div className="flex gap-2 mt-3 md:mt-4">
                                <button onClick={() => window.open(`https://wa.me/${phone}`, '_blank')}
                                    className="flex-1 flex items-center justify-center gap-2 p-2.5 md:p-3 rounded-lg md:rounded-xl
                                   bg-neutral-800/50 hover:bg-green-500/10 border border-transparent
                                   hover:border-green-500/30 transition-all duration-300">
                                    <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                                    <span className="text-xs md:text-sm text-neutral-400">واتساب</span>
                                </button>
                                <button onClick={() => window.open(`tel:${phone}`, '_blank')}
                                    className="flex-1 flex items-center justify-center gap-2 p-2.5 md:p-3 rounded-lg md:rounded-xl
                                   bg-neutral-800/50 hover:bg-blue-500/10 border border-transparent
                                   hover:border-blue-500/30 transition-all duration-300">
                                    <Phone className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
                                    <span className="text-xs md:text-sm text-neutral-400">اتصال</span>
                                </button>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between"
                                dir='rtl'>
                                <h4 className="text-lg font-bold text-white">المنتجات</h4>
                                <span className="text-sm text-neutral-400">{items.length} منتج</span>
                            </div>

                            <div className="space-y-3">
                                {items.map((item, index) => (
                                    <div key={index}
                                        className="bg-neutral-800/30 rounded-xl p-3 flex gap-3">
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
                                                <span className="text-sm text-neutral-400">
                                                    المقاس: {item.size}
                                                </span>
                                                <span className="text-sm text-neutral-400">
                                                    اللون: {item.variant}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-neutral-800/30 rounded-2xl p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-blue-500 font-bold">
                                    {subtotal.toLocaleString('ar-EG')} جنيه
                                </span>
                                <span className="text-neutral-400">المجموع</span>
                            </div>

                            {(order.shipping != 0) && (
                                <div className="flex justify-between items-center">
                                    <span className="text-green-500 font-bold">
                                        {order.shipping.toLocaleString('ar-EG')} جنيه
                                    </span>
                                    <span className="text-neutral-400">الشحن</span>
                                </div>
                            )}

                            <div className="h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />

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
                                        bg-gradient-to-b from-neutral-700 to-transparent" />
                                            )}

                                            <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center
                                      ${step.completed ? 'bg-blue-500' : 'bg-neutral-700'}`}>
                                                <StatusIcon status={step.status} className="w-4 h-4 text-white" />
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-neutral-400">
                                                        {new Date(step.timestamp).toLocaleString('ar-EG')}
                                                    </span>
                                                    <span className="font-medium text-white">
                                                        {getStatusLabel(step.status)}
                                                    </span>
                                                </div>
                                                {step.description && (
                                                    <p className="text-sm text-neutral-500 mt-1">{step.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Status Actions */}
                        <div className="grid grid-cols-2 gap-2 md:gap-3">
                            {[
                                { status: 'pending', label: 'تعليق', icon: Clock, color: 'blue' },
                                { status: 'processing', label: 'معالجة', icon: RefreshCw, color: 'blue' },
                                { status: 'delivered', label: 'تسليم', icon: CheckCircle, color: 'green' },
                                { status: 'cancelled', label: 'إلغاء', icon: Ban, color: 'red' }
                            ].map(({ status, label, icon: Icon, color }) => {
                                const colorClasses = {
                                    blue: { text: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
                                    blue: { text: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
                                    green: { text: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30' },
                                    red: { text: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' }
                                }[color];

                                return (
                                    <button
                                        key={status}
                                        onClick={() => onUpdateStatus(order.id, status)}
                                        disabled={order.status === status}
                                        className={`flex items-center justify-center gap-1.5 md:gap-2 p-2.5 md:p-3 
                                               rounded-lg md:rounded-xl font-medium transition-all duration-300 group
                                               ${order.status === status
                                                ? 'bg-neutral-800/50 text-neutral-500 cursor-not-allowed'
                                                : `bg-neutral-800/30 hover:${colorClasses.bg} 
                                                  border border-transparent hover:${colorClasses.border}`}`}
                                    >
                                        <Icon className={`w-4 h-4 md:w-5 md:h-5 ${order.status === status
                                            ? 'text-neutral-500'
                                            : `${colorClasses.text} 
                                              ${status === 'processing' ? 'group-hover:animate-spin' : ''}`}`} />
                                        <span className={`text-xs md:text-sm ${order.status === status
                                            ? 'text-neutral-500'
                                            : `text-neutral-400 group-hover:${colorClasses.text}`}`}>
                                            {label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                    </div>

                </div>

            </div>
            {/*        <div className="fixed bottom-0 inset-x-0 bg-neutral-900/95 backdrop-blur-xl 
                  border-t border-neutral-800/50 p-4">
    <div className="grid grid-cols-3 gap-2">
      <button
        onClick={() => printOrder('A4')}
        className="flex items-center justify-center gap-2 p-3 rounded-xl
                  bg-neutral-800/30 hover:bg-blue-500/10 border border-transparent 
                  hover:border-blue-500/30 transition-all duration-300 group"
      >
        <Printer className="w-5 h-5 text-blue-500" />
        <span className="text-sm text-neutral-400 group-hover:text-blue-500">
          طباعة A4
        </span>
      </button>

      <button
        onClick={() => printOrder('A5')}
        className="flex items-center justify-center gap-2 p-3 rounded-xl
                  bg-neutral-800/30 hover:bg-green-500/10 border border-transparent 
                  hover:border-green-500/30 transition-all duration-300 group"
      >
        <Printer className="w-5 h-5 text-green-500" />
        <span className="text-sm text-neutral-400 group-hover:text-green-500">
          طباعة A5
        </span>
      </button>

      <button
        onClick={() => printOrder('receipt')}
        className="flex items-center justify-center gap-2 p-3 rounded-xl
                  bg-neutral-800/30 hover:bg-blue-500/10 border border-transparent 
                  hover:border-blue-500/30 transition-all duration-300 group"
      >
        <Receipt className="w-5 h-5 text-blue-500" />
        <span className="text-sm text-neutral-400 group-hover:text-blue-500">
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
        <p className="text-neutral-400">{message}</p>
    </div>
);

const EmptyState = () => (
    <div className="text-center py-12">
        <Package className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">لا توجد طلبات</h3>
        <p className="text-neutral-400">لم يتم العثور على طلبات تطابق معايير البحث</p>
    </div>
);

const Pagination = ({ page, totalPages, onNext, onPrevious }) => (
    <div className="fixed bottom-0 inset-x-0 bg-neutral-900/95 backdrop-blur-xl 
                  border-t border-neutral-800/50 p-4">
        <div className="flex justify-between items-center max-w-lg mx-auto">
            <button
                onClick={onPrevious}
                disabled={page <= 1}
                className="p-2 rounded-xl bg-neutral-800/50 text-neutral-400
                  disabled:opacity-50 disabled:cursor-not-allowed
                  hover:bg-neutral-700/50 transition-colors"
            >
                السابق
            </button>
            <span className="text-neutral-400">
                صفحة {page} من {totalPages}
            </span>
            <button
                onClick={onNext}
                disabled={page >= totalPages}
                className="p-2 rounded-xl bg-neutral-800/50 text-neutral-400
                  disabled:opacity-50 disabled:cursor-not-allowed
                  hover:bg-neutral-700/50 transition-colors"
            >
                التالي
            </button>
        </div>
    </div>
);

export default Orders;