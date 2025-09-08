import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    Search, MapPin, Phone, Copy, MessageCircle, ChevronRight, ChevronLeft,
    Package, CircleDollarSign, AlertCircle, Loader2, Calendar, TrendingUp,
    Users, Filter, Building2, ArrowUpRight, Wallet, Clock, MapPinned
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useCustomers } from '../hooks';
import {
    AdminCard,
    AdminButton,
    AdminInput,
    AdminStatCard,
    ADMIN_COLORS
} from '../components/DesignSystem';
// Removed lodash import for performance - using native JS alternatives

const Customers = () => {
    const {
        customers,
        totalCustomers,
        selectedCustomer,
        page,
        totalPages,
        search,
        isLoading,
        error,
        setSelectedCustomer,
        setSearch,
        nextPage,
        previousPage,
    } = useCustomers();

    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    // In your main component
    const [filters, setFilters] = useState({
        spendingRange: [],  // Now an array instead of single value
        orderCount: [],
        location: [],
        dateRange: []
    });


    // Example usage
    <FilterButton
        label="مستوى الإنفاق"
        options={[
            { value: 'low', label: 'منخفض (≤ 1000)' },
            { value: 'medium', label: '(1000-5000)' },
            { value: 'high', label: 'مرتفع (> 5000)' }
        ]}
        values={filters.spendingRange}  // Pass array of values
        onChange={(newValues) => setFilters(prev => ({
            ...prev,
            spendingRange: newValues
        }))}
        icon={Wallet}
    />

    // Advanced Analytics Calculations
    const analytics = useMemo(() => {
        if (!customers.length) return null;

        // Spending Distribution
        const spendingRanges = {
            low: { min: 0, max: 1000, count: 0, total: 0 },
            medium: { min: 1001, max: 5000, count: 0, total: 0 },
            high: { min: 5001, max: Infinity, count: 0, total: 0 }
        };

        // Location Distribution
        const locationData = {};

        // Order Frequency
        const orderFrequency = {
            new: { min: 0, max: 1, count: 0 },
            regular: { min: 2, max: 5, count: 0 },
            loyal: { min: 6, max: Infinity, count: 0 }
        };

        // Customer Lifecycle
        const customerAges = {};

        customers.forEach(customer => {
            // Spending Analysis
            const spent = customer.totalSpent || 0;
            if (spent <= spendingRanges.low.max) {
                spendingRanges.low.count++;
                spendingRanges.low.total += spent;
            } else if (spent <= spendingRanges.medium.max) {
                spendingRanges.medium.count++;
                spendingRanges.medium.total += spent;
            } else {
                spendingRanges.high.count++;
                spendingRanges.high.total += spent;
            }

            // Location Analysis
            if (customer.addresses?.[0]?.governorate) {
                const gov = customer.addresses[0].governorate;
                locationData[gov] = (locationData[gov] || 0) + 1;
            }

            // Order Frequency Analysis
            const orderCount = customer.orderCount || 0;
            if (orderCount <= orderFrequency.new.max) {
                orderFrequency.new.count++;
            } else if (orderCount <= orderFrequency.regular.max) {
                orderFrequency.regular.count++;
            } else {
                orderFrequency.loyal.count++;
            }

            // Customer Age Analysis
            const monthsOld = Math.floor(
                (new Date() - new Date(customer.createdAt)) / (1000 * 60 * 60 * 24 * 30)
            );
            const ageKey = Math.floor(monthsOld / 3) * 3; // Group by quarters
            customerAges[ageKey] = (customerAges[ageKey] || 0) + 1;
        });

        return {
            spendingRanges,
            locationData: Object.entries(locationData).map(([name, value]) => ({
                name,
                value
            })),
            orderFrequency,
            customerAges: Object.entries(customerAges)
                .map(([months, count]) => ({
                    months: `${months}-${parseInt(months) + 3} شهور`,
                    count
                }))
                .sort((a, b) => parseInt(a.months) - parseInt(b.months))
        };
    }, [customers]);

    // Update your filter logic
    const filteredCustomers = useMemo(() => {
        if (!customers.length) return [];

        return customers.filter(customer => {
            // In your filter logic
            const matchesSpending = filters.spendingRange.length === 0 || filters.spendingRange.some(range => {
                switch (range) {
                    case 'low': return customer.totalSpent <= 1000;
                    case 'medium': return customer.totalSpent > 1000 && customer.totalSpent <= 5000;
                    case 'high': return customer.totalSpent > 5000;
                    default: return true;
                }
            });

            const matchesOrders = filters.orderCount.length === 0 || filters.orderCount.some(range => {
                switch (range) {
                    case 'new': return customer.orderCount <= 1;
                    case 'regular': return customer.orderCount > 1 && customer.orderCount <= 5;
                    case 'loyal': return customer.orderCount > 5;
                    default: return true;
                }
            });

            const matchesLocation = filters.location.length === 0 ||
                filters.location.includes(customer.addresses?.[0]?.governorate);

            const matchesDate = filters.dateRange.length === 0 || filters.dateRange.some(range => {
                switch (range) {
                    case 'recent':
                        return (new Date() - new Date(customer.createdAt)) / (1000 * 60 * 60 * 24) <= 30;
                    default: return true;
                }
            });

            return matchesSpending && matchesOrders && matchesLocation && matchesDate;
        });
    }, [customers, filters]);

    return (
        <div className="min-h-screen bg-neutral-950 pb-20">
            {/* Header for mobile */}
            <div className="md:hidden flex items-center justify-between p-4 border-b border-neutral-800/50">
                <h1 className="text-xl font-bold text-white" dir="rtl">العملاء</h1>
                <span className="text-sm text-neutral-400">
                    {totalCustomers} عميل
                </span>
            </div>

            {/* Header for desktop */}
            <div className="hidden md:block bg-gradient-to-b from-neutral-950/95 to-neutral-950 border-b border-neutral-800/50 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">إدارة العملاء</h1>
                        <p className="text-neutral-400 mt-1">إدارة وتحليل بيانات العملاء والمبيعات</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-neutral-400">
                            إجمالي العملاء: {totalCustomers}
                        </span>
                    </div>
                </div>
            </div>

            {/* Analytics Dashboard */}
            <div className="p-4 space-y-6 pt-0">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                    <AdminStatCard
                        title="إجمالي العملاء"
                        value={totalCustomers}
                        icon={Users}
                        color="primary"
                    />
                    <AdminStatCard
                        title="عملاء جدد"
                        value={analytics?.orderFrequency.new.count || 0}
                        subtitle="آخر 30 يوم"
                        icon={Users}
                        color="success"
                    />
                </div>

                {analytics && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Customer Segmentation */}
                        <div className="bg-gray-800/30 rounded-2xl p-4 border border-gray-700/50">
                            <h3 className="text-lg font-bold text-white mb-4">تصنيف العملاء</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'عملاء جدد', value: analytics.orderFrequency.new.count },
                                                { name: 'عملاء منتظمون', value: analytics.orderFrequency.regular.count },
                                                { name: 'عملاء مخلصون', value: analytics.orderFrequency.loyal.count }
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            dataKey="value"
                                        >
                                            <Cell fill="#10B981" />
                                            <Cell fill="#3B82F6" />
                                            <Cell fill="#0ea5e9" />
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Geographic Distribution */}
                        <div className="bg-gray-800/30 rounded-2xl p-4 border border-gray-700/50">
                            <h3 className="text-lg font-bold text-white mb-4">التوزيع الجغرافي</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analytics.locationData}>
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="value" fill="#3B82F6" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Search and Filters */}
            <div className="sticky top-0 z-30 bg-neutral-950/95 backdrop-blur-sm p-4 space-y-4 border-b border-neutral-800/50">
                <div className="relative">
                    <AdminInput
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder=""
                        hint="ابحث برقم الهاتف أو العنوان..."
                        className="pr-12"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>

                {/* Advanced Filters */}
                <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                    <FilterButton
                        label="مستوى الإنفاق"
                        options={[
                            { value: 'low', label: 'منخفض (≤ 1000)' },
                            { value: 'medium', label: '(1000-5000)' },
                            { value: 'high', label: 'مرتفع (> 5000)' }
                        ]}
                        values={filters.spendingRange}  // Changed from value to values
                        onChange={(newValues) => setFilters(prev => ({
                            ...prev,
                            spendingRange: newValues
                        }))}
                        icon={Wallet}
                    />
                    <FilterButton
                        label="عدد الطلبات"
                        options={[
                            { value: 'new', label: 'جديد (≤ 1)' },
                            { value: 'regular', label: 'منتظم (2-5)' },
                            { value: 'loyal', label: 'مخلص (> 5)' }
                        ]}
                        values={filters.orderCount}  // Changed from value to values
                        onChange={(newValues) => setFilters(prev => ({
                            ...prev,
                            orderCount: newValues
                        }))}
                        icon={Package}
                    />
                    {analytics && (
                        <FilterButton
                            label="المنطقة"
                            options={[
                                ...analytics.locationData.map(loc => ({
                                    value: loc.name,
                                    label: loc.name
                                }))
                            ]}
                            values={filters.location}  // Changed from value to values
                            onChange={(newValues) => setFilters(prev => ({
                                ...prev,
                                location: newValues
                            }))}
                            icon={MapPinned}
                        />
                    )}
                    <FilterButton
                        label="تاريخ التسجيل"
                        options={[
                            { value: 'recent', label: 'آخر 30 يوم' }
                        ]}
                        values={filters.dateRange}  // Changed from value to values
                        onChange={(newValues) => setFilters(prev => ({
                            ...prev,
                            dateRange: newValues
                        }))}
                        icon={Calendar}
                    />
                </div>
            </div>

            {/* Customers List */}
            <div className="p-4 space-y-4"
                dir='rtl'>
                {isLoading ? (
                    <LoadingState />
                ) : filteredCustomers.length === 0 ? (
                    <EmptyState />
                ) : (
                    filteredCustomers.map((customer) => (
                        <CustomerCard
                            key={customer.id}
                            customer={customer}
                            onClick={() => {
                                setSelectedCustomer(customer);
                                setIsDetailsOpen(true);
                            }}
                        />
                    ))
                )}
            </div>

            {/* Customer Details Sheet */}
            {selectedCustomer && (
                <CustomerDetailsSheet
                    customer={selectedCustomer}
                    isOpen={isDetailsOpen}
                    onClose={() => {
                        setIsDetailsOpen(false);
                        setSelectedCustomer(null);
                    }}
                    analytics={analytics}
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

// Reusable Components (StatCard, CustomerCard, etc.)
const StatCard = ({ title, value, icon: Icon, trend, subtitle, color = 'emerald' }) => {
    const colors = {
        emerald: 'bg-success-500/10 text-success-500 border-success-500/20',
        blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    };

    return (
        <div className={`relative overflow-hidden rounded-2xl border p-4 ${colors[color]}`}
            dir='rtl'>
            <div className="absolute top-4 left-4">
                <Icon className="w-6 h-6" />
            </div>
            <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-400">{title}</h3>
                <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{value}</span>
                    {subtitle && <span className="text-sm text-gray-400">{subtitle}</span>}
                </div>
                {trend && (
                    <div className="mt-2 flex items-center gap-1">
                        <ArrowUpRight className="w-4 h-4" />
                        <span className="text-sm">{trend}% زيادة</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const CustomerCard = ({ customer, onClick }) => {
    const handleCopyPhone = async (e) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(customer.phone);
            // Add toast notification here
        } catch (err) {
            console.error('Failed to copy phone number:', err);
        }
    };

    const getCustomerTier = () => {
        const orderCount = customer.orderCount || 0;
        if (orderCount > 5) return { label: 'عميل مخلص', color: 'text-blue-500' };
        if (orderCount > 1) return { label: 'عميل منتظم', color: 'text-blue-500' };
        return { label: 'عميل جديد', color: 'text-success-500' };
    };

    const tier = getCustomerTier();

    return (
        <div
            onClick={onClick}
            className="bg-gradient-to-br from-gray-800/40 to-gray-800/20 
               rounded-2xl p-4 border border-gray-700/50 space-y-4 
               hover:border-blue-500/30 transition-all duration-300 cursor-pointer"
            dir='ltr'

        >
            {/* Header with Customer Info */}
            <div className="flex justify-between items-start">
                <div className="flex gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(`https://wa.me/${customer.phone}`, '_blank');
                        }}
                        className="p-2 rounded-xl bg-gray-800/50 hover:bg-green-500/10
                    border border-transparent hover:border-green-500/30
                    transition-all duration-300"
                    >
                        <MessageCircle className="w-5 h-5 text-green-500" />
                    </button>
                    <a
                        href={`tel:${customer.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-xl bg-gray-800/50 hover:bg-blue-500/10
                    border border-transparent hover:border-blue-500/30
                    transition-all duration-300"
                    >
                        <Phone className="w-5 h-5 text-blue-500" />
                    </a>
                    <button
                        onClick={handleCopyPhone}
                        className="p-2 rounded-xl bg-gray-800/50 hover:bg-blue-500/10
                    border border-transparent hover:border-blue-500/30
                    transition-all duration-300"
                    >
                        <Copy className="w-5 h-5 text-blue-500" />
                    </button>
                </div>
                <div className="text-right">
                    <div className="flex items-center justify-end gap-2">
                        <h3 className="text-lg font-bold text-white" dir="ltr">
                            {customer.phone}
                        </h3>
                        <span className={`text-sm ${tier.color}`}>
                            {tier.label}
                        </span>
                    </div>
                    <p className="text-sm text-gray-400">
                        {new Date(customer.createdAt).toLocaleDateString('ar-EG')}
                    </p>
                </div>
            </div>

            {/* Address */}
            {customer.addresses?.[0] && (
                <div className="flex items-start gap-3"
                    dir='rtl'>
                    <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div className="flex-1 text-right">
                        <p className="text-white">{customer.addresses[0].governorate}</p>
                        <p className="text-sm text-gray-400">{customer.addresses[0].district}</p>
                        {customer.addresses[0].details && (
                            <p className="text-sm text-gray-500">{customer.addresses[0].details}</p>
                        )}
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700/50">
                <div className="space-y-1"
                    dir='rtl'>
                    <div className="flex items-center gap-2"
                        dir='rtl'>
                        <Package className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-400">الطلبات</span>
                    </div>
                    <p className="text-lg font-bold text-white pr-4">{customer.orderCount || 0}</p>
                </div>
                <div className="space-y-1 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <span className="text-sm text-gray-400">إجمالي المشتريات</span>
                        <CircleDollarSign className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-lg font-bold text-blue-500 pr-4">
                        {(customer.totalSpent || 0).toLocaleString('ar-EG')} جنيه
                    </p>
                </div>
            </div>
        </div>
    );
};

const FilterButton = ({ label, options, values = [], onChange, icon: Icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const filterRef = useRef(null);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle selection toggle
    const handleFilterSelect = (selectedValue) => {
        const newValues = values.includes(selectedValue)
            ? values.filter(v => v !== selectedValue)
            : [...values, selectedValue];
        onChange(newValues);
    };

    // Reset selections
    const handleReset = () => {
        onChange([]);
        setIsOpen(false);
    };

    // Render selection count
    const renderSelectionCount = () => {
        if (values.length === 0) return null;
        return (
            <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 border border-blue-500/20">
                {values.length}
            </span>
        );
    };

    // Render checkbox
    const renderCheckbox = (isSelected) => (
        <div className={`w-5 h-5 rounded border flex items-center justify-center
                      transition-colors duration-200
                      ${isSelected
                ? 'border-blue-500 bg-blue-500'
                : 'border-gray-600'}`}>
            {isSelected && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            )}
        </div>
    );

    return (
        <div className="relative" ref={filterRef}>
            {/* Filter Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl
                     transition-all duration-200 whitespace-nowrap
                     ${isOpen
                        ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                        : values.length > 0
                            ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                            : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'}`}
            >
                {Icon && <Icon className="w-4 h-4" />}
                <div className="flex items-center gap-2">
                    <span>{label}</span>
                    {renderSelectionCount()}
                </div>
            </button>

            {/* Mobile Bottom Sheet */}
            <div className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300
                      ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)} />

                <div className={`fixed inset-x-0 bottom-0 transform transition-transform duration-500 ease-out
                        ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                    <div className="bg-gradient-to-b from-neutral-950/95 to-neutral-950 backdrop-blur-xl
                         rounded-t-[2.5rem] border-t border-neutral-800/50 shadow-2xl
                         max-h-[80vh] overflow-y-auto hide-scrollbar">
                        {/* Handle */}
                        <div className="absolute inset-x-0 top-0 h-7 flex justify-center items-start">
                            <div className="w-12 h-1 rounded-full bg-neutral-700/50 mt-3" />
                        </div>

                        <div className="px-6 pt-8 pb-6">
                            <h3 className="text-lg font-bold text-white mb-4">{label}</h3>
                            <div className="grid grid-cols-1 gap-2">
                                {options.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleFilterSelect(option.value)}
                                        className={`flex items-center gap-3 p-4 rounded-xl
                               transition-all duration-200
                               ${values.includes(option.value)
                                                ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                                                : 'bg-gray-800/30 text-gray-400 hover:bg-gray-700/50'}`}
                                    >
                                        {renderCheckbox(values.includes(option.value))}
                                        <span className="flex-1 text-right">{option.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-4 flex gap-2">
                                <button
                                    onClick={handleReset}
                                    className="flex-1 py-3 rounded-xl bg-gray-800/50 text-gray-400
                             hover:bg-gray-700/50 transition-colors"
                                >
                                    إعادة تعيين
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 py-3 rounded-xl bg-blue-500 text-white
                             hover:bg-blue-600 transition-colors"
                                >
                                    تطبيق
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-gray-800
                       rounded-xl shadow-xl border border-gray-700/50 
                       hidden md:block">
                    <div className="py-2">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleFilterSelect(option.value)}
                                className={`w-full flex items-center gap-3 px-4 py-3
                           transition-colors
                           ${values.includes(option.value)
                                        ? 'text-blue-500 bg-blue-500/10'
                                        : 'text-gray-400 hover:bg-gray-700/50'}`}
                            >
                                {renderCheckbox(values.includes(option.value))}
                                <span className="flex-1 text-right">{option.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Desktop Action Buttons */}
                    <div className="border-t border-gray-700/50 p-2 flex gap-2">
                        <button
                            onClick={handleReset}
                            className="flex-1 py-2 rounded-lg bg-gray-800/50 text-gray-400
                         hover:bg-gray-700/50 transition-colors text-sm"
                        >
                            إعادة تعيين
                        </button>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="flex-1 py-2 rounded-lg bg-blue-500 text-white
                         hover:bg-blue-600 transition-colors text-sm"
                        >
                            تطبيق
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const CustomerDetailsSheet = ({ customer, isOpen, onClose, analytics }) => {
    if (!customer) return null;

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getCustomerAgeText = () => {
        const months = Math.floor(
            (new Date() - new Date(customer.createdAt)) / (1000 * 60 * 60 * 24 * 30)
        );
        if (months < 1) return 'أقل من شهر';
        if (months === 1) return 'شهر واحد';
        if (months < 12) return `${months} أشهر`;
        const years = Math.floor(months / 12);
        return `${years} ${years === 1 ? 'سنة' : 'سنوات'}`;
    };

    return (
        <div className={`fixed inset-0 z-50 transition-opacity duration-300
                  ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className={`fixed inset-x-0 bottom-0 transform transition-transform duration-500
                    ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="bg-gradient-to-b from-neutral-950/95 to-neutral-950 backdrop-blur-xl
                     rounded-t-[2.5rem] border-t border-neutral-800/50 shadow-2xl
                     max-h-[90vh] overflow-y-auto hide-scrollbar"
                    dir='rtl'>
                    <div className="px-6 py-8 space-y-6">
                        {/* Header */}
                        <div className="flex justify-between items-start"
                            dir='ltr'>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-gray-800/50 transition-colors"
                            >
                                ×
                            </button>
                            <div className="text-right"
                            >
                                <h2 className="text-xl font-bold text-white">تفاصيل العميل</h2>
                                <p className="text-sm text-gray-400">
                                    عميل منذ {getCustomerAgeText()}
                                </p>
                            </div>
                        </div>

                        {/* Customer Overview */}
                        <div className="grid grid-cols-2 gap-4">
                            <StatCard
                                title="إجمالي الطلبات"
                                value={customer.orderCount || 0}
                                icon={Package}
                                color="blue"
                            />
                            <StatCard
                                title="إجمالي المشتريات"
                                value={`${(customer.totalSpent || 0).toLocaleString('ar-EG')} جنيه`}
                                icon={CircleDollarSign}
                                color="emerald"
                            />
                        </div>

                        {/* Contact Information */}
                        <div className="bg-gray-800/30 rounded-2xl p-4 space-y-4">
                            <h3 className="font-bold text-white">معلومات الاتصال</h3>
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-blue-500" />
                                <span className="text-white" dir="ltr">{customer.phone}</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => window.open(`https://wa.me/${customer.phone}`, '_blank')}
                                    className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl
                          bg-green-500/10 text-green-500 hover:bg-green-500/20
                          transition-colors"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    <span>واتساب</span>
                                </button>
                                <button
                                    onClick={() => window.open(`tel:${customer.phone}`)}
                                    className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl
                          bg-blue-500/10 text-blue-500 hover:bg-blue-500/20
                          transition-colors"
                                >
                                    <Phone className="w-5 h-5" />
                                    <span>اتصال</span>
                                </button>
                            </div>
                        </div>

                        {/* Addresses */}
                        {customer.addresses?.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="font-bold text-white">العناوين</h3>
                                {customer.addresses.map((address, index) => (
                                    <div
                                        key={index}
                                        className="bg-gray-800/30 rounded-xl p-4 space-y-2"
                                    >
                                        <p className="text-white">{address.governorate}</p>
                                        <p className="text-gray-400">{address.district}</p>
                                        {address.details && (
                                            <p className="text-sm text-gray-500">{address.details}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Pagination = ({ page, totalPages, onNext, onPrevious }) => (
    <div className="fixed bottom-0 inset-x-0 bg-neutral-950/95 backdrop-blur-xl 
                border-t border-neutral-800/50 p-4">
        <div className="flex justify-between items-center">
            <button
                onClick={onPrevious}
                disabled={page === 1}
                className="p-2 rounded-xl bg-gray-800/50 text-gray-400
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-gray-400">
                صفحة {page} من {totalPages}
            </span>
            <button
                onClick={onNext}
                disabled={page === totalPages}
                className="p-2 rounded-xl bg-gray-800/50 text-gray-400
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    </div>
);

const LoadingState = () => (
    <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
);

const EmptyState = () => (
    <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 
                      flex items-center justify-center mb-8 shadow-2xl shadow-black/20 border border-neutral-800/50">
            <Users className="w-12 h-12 text-blue-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">لا يوجد عملاء</h3>
        <p className="text-neutral-400 text-lg max-w-md mx-auto leading-relaxed">
            لم يتم العثور على عملاء يطابقون معايير البحث
        </p>
    </div>
);

export default Customers;