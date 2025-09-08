import React, { useState, useEffect, useMemo } from 'react';
import {
    Ticket, Plus, Search, Filter, Calendar, Ban, PieChart,
    Settings, PercentIcon, DollarSign, Users, Clock, CheckCircle,
    X, ChevronDown, Edit3, Copy, AlertCircle, Loader2, ArrowUpRight,
    TrendingUp, BadgePercent, Wallet, CircleDollarSign
} from 'lucide-react';
import { useCoupons } from '../hooks';
import {
    AdminCard,
    AdminButton,
    AdminInput,
    AdminSelect,
    AdminTextarea,
    AdminStatCard,
    AdminModal,
    ADMIN_COLORS
} from '../components/DesignSystem';

const Coupons = () => {
    const {
        coupons,
        totalCoupons,
        selectedCoupon,
        couponStats,
        page,
        totalPages,
        filters,
        isLoading,
        isCreating,
        isUpdating,
        isDeleting,
        isLoadingStats,
        error,
        setSelectedCoupon,
        updateFilters,
        createCoupon,
        updateCoupon,
        deleteCoupon,
        nextPage,
        previousPage,
    } = useCoupons();

    const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
    const [isStatsSheetOpen, setIsStatsSheetOpen] = useState(false);

    return (
        <div className="min-h-screen bg-neutral-950 pb-20">
            {/* Header for mobile */}
            <div className="md:hidden flex items-center justify-between p-4 border-b border-neutral-800/50">
                <h1 className="text-xl font-bold text-white" dir="rtl">القسائم</h1>
                <span className="text-sm text-neutral-400">
                    {totalCoupons} قسيمة
                </span>
            </div>

            {/* Stats Overview */}
            {couponStats && (
                <div className="p-4 grid grid-cols-2 gap-4">
                    <AdminStatCard
                        title="القسائم النشطة"
                        value={couponStats.activeCoupons}
                        icon={Ticket}
                        color="success"
                    />
                    <AdminStatCard
                        title="إجمالي التوفير"
                        value={`${couponStats.totalDiscountGiven.toLocaleString('ar-EG')} جنيه`}
                        icon={Wallet}
                        color="primary"
                    />
                    <AdminStatCard
                        title="معدل الاستخدام"
                        value={`${((couponStats.totalUsedCoupons / couponStats.totalCoupons) * 100).toFixed(1)}%`}
                        icon={TrendingUp}
                        color="warning"
                    />
                    <AdminStatCard
                        title="قسائم منتهية"
                        value={couponStats.expiredCoupons}
                        icon={Ban}
                        color="danger"
                    />
                </div>
            )}

            {/* Actions Bar */}
            <div className="sticky top-0 z-30 bg-neutral-950/95 backdrop-blur-sm p-4 space-y-4 border-b border-neutral-800/50">
                {/* Search */}
                <div className="relative">
                    <input
                        type="text"
                        value={filters.search}
                        onChange={e => updateFilters({ search: e.target.value })}
                        placeholder="ابحث برمز القسيمة أو رقم الهاتف..."
                        className="w-full h-12 bg-gray-800/50 rounded-xl px-12 text-white text-right
                     border border-gray-700/50 focus:border-blue-500/50
                     focus:ring-2 focus:ring-blue-500/50
                     placeholder:text-gray-500"
                        dir="rtl"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    {filters.search && (
                        <button
                            onClick={() => updateFilters({ search: '' })}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full
                       hover:bg-gray-700/50 transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto hide-scrollbar py-2" dir="rtl">
                    {[
                        { id: 'all', label: 'الكل', icon: Ticket },
                        { id: 'active', label: 'نشط', icon: CheckCircle },
                        { id: 'expired', label: 'منتهي', icon: Clock },
                        { id: 'percentage', label: 'نسبة مئوية', icon: PercentIcon },
                        { id: 'fixed', label: 'قيمة ثابتة', icon: DollarSign },
                        { id: 'specific', label: 'مستخدمين محددين', icon: Users }
                    ].map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => updateFilters({ type: id })}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm
                       whitespace-nowrap transition-colors
                       ${filters.type === id
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'}`}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{label}</span>
                        </button>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsCreateSheetOpen(true)}
                        className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl
                     bg-blue-500 text-white font-medium hover:bg-blue-600
                     transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        <span>إنشاء قسيمة</span>
                    </button>
                    <button
                        onClick={() => setIsStatsSheetOpen(true)}
                        className="p-3 rounded-xl bg-gray-800/50 text-gray-400
                     hover:bg-gray-700/50 transition-colors"
                    >
                        <PieChart className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Coupons List */}
            <div className="p-4 space-y-4">
                {isLoading ? (
                    <LoadingState />
                ) : error ? (
                    <ErrorState message={error} />
                ) : coupons.length === 0 ? (
                    <EmptyState />
                ) : (
                    coupons.map(coupon => (
                        <CouponCard
                            key={coupon.id}
                            coupon={coupon}
                            onClick={() => setSelectedCoupon(coupon)}
                            onEdit={() => {/* Handle edit */ }}
                            onDelete={() => deleteCoupon(coupon.id)}
                        />
                    ))
                )}
            </div>

            {/* Create Coupon Sheet */}
            {isCreateSheetOpen && (
                <CreateCouponSheet
                    isOpen={isCreateSheetOpen}
                    onClose={() => setIsCreateSheetOpen(false)}
                    onCreate={createCoupon}
                    isCreating={isCreating}
                />
            )}

            {/* Coupon Details Sheet */}
            {selectedCoupon && (
                <CouponDetailsSheet
                    coupon={selectedCoupon}
                    isOpen={!!selectedCoupon}
                    onClose={() => setSelectedCoupon(null)}
                    onUpdate={updateCoupon}
                    onDelete={deleteCoupon}
                    isUpdating={isUpdating}
                    isDeleting={isDeleting}
                />
            )}

            {/* Stats Sheet */}
            {isStatsSheetOpen && (
                <StatsSheet
                    stats={couponStats}
                    isOpen={isStatsSheetOpen}
                    onClose={() => setIsStatsSheetOpen(false)}
                    isLoading={isLoadingStats}
                />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="fixed bottom-0 inset-x-0 bg-gray-900/95 backdrop-blur-xl 
                      border-t border-gray-800/50 p-4">
                    <div className="flex justify-between items-center max-w-lg mx-auto">
                        <button
                            onClick={previousPage}
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
                            onClick={nextPage}
                            disabled={page >= totalPages}
                            className="p-2 rounded-xl bg-gray-800/50 text-gray-400
                      disabled:opacity-50 disabled:cursor-not-allowed
                      hover:bg-gray-700/50 transition-colors"
                        >
                            التالي
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className={`relative overflow-hidden rounded-2xl p-4 
                 bg-${color}-500/10 border border-${color}-500/20`}>
        <div className="absolute top-4 right-4">
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

const CouponCard = ({ coupon, onClick, onEdit, onDelete }) => {
    const isExpired = new Date(coupon.endDate) < new Date();
    const isActive = coupon.status === 'active' && !isExpired;

    const copyCode = async (e) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(coupon.code);
            // Add toast notification here
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    };

    return (
        <div
            onClick={onClick}
            className="group bg-gray-800/30 rounded-2xl p-4 space-y-4 cursor-pointer
               border border-gray-700/50 hover:border-blue-500/30
               transition-all duration-300"
        >
            <div className="flex justify-between items-start">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm
                      ${isActive
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-red-500/10 text-red-500'}`}>
                    {isActive ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    <span>{isActive ? 'نشط' : 'منتهي'}</span>
                </div>

                <div className="text-right">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={copyCode}
                            className="p-1 rounded-lg bg-gray-800/50 hover:bg-blue-500/10
                       border border-transparent hover:border-blue-500/30
                       transition-all duration-300"
                        >
                            <Copy className="w-4 h-4 text-blue-500" />
                        </button>
                        <h3 className="font-bold text-white group-hover:text-blue-500
                         transition-colors">
                            {coupon.code}
                        </h3>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                        {new Date(coupon.endDate).toLocaleDateString('ar-EG')}
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                <div className="flex items-center gap-2">
                    {coupon.discountType === 'percentage' ? (
                        <PercentIcon className="w-5 h-5 text-blue-500" />
                    ) : (
                        <DollarSign className="w-5 h-5 text-blue-500" />
                    )}
                    <span className="text-white font-medium">
                        {coupon.discountValue}
                        {coupon.discountType === 'percentage' ? '%' : ' جنيه'}
                    </span>
                </div>

                <div className="flex items-center gap-2 text-gray-400">
                    <Users className="w-5 h-5" />
                    <span>{coupon.usedCount}/{coupon.maxUses || '∞'}</span>
                </div>
            </div>
        </div>
    );
};

// Sheet Components for Coupon Management
const CreateCouponSheet = ({ isOpen, onClose, onCreate, isCreating }) => {
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        maxUses: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        specificUsers: []
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await onCreate(formData);
            onClose();
        } catch (err) {
            console.error('Error creating coupon:', err);
        }
    };

    return (
        <Sheet isOpen={isOpen} onClose={onClose}>
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <button
                        onClick={onClose}
                        className="p-2 -m-2 rounded-full hover:bg-gray-800/50 transition-colors"
                    >
                        <ChevronDown className="w-6 h-6 text-gray-400" />
                    </button>
                    <h2 className="text-xl font-bold text-white">إنشاء قسيمة جديدة</h2>
                    <div className="w-10" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Coupon Code */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-400">
                            رمز القسيمة
                        </label>
                        <input
                            type="text"
                            value={formData.code}
                            onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            placeholder="SALE2025"
                            className="w-full h-12 bg-gray-800/50 rounded-xl px-4 text-white
                         border border-gray-700/50 focus:border-blue-500/50
                         focus:ring-2 focus:ring-blue-500/50"
                            dir="ltr"
                        />
                        <p className="text-xs text-gray-500">
                            اتركه فارغاً لإنشاء رمز تلقائي
                        </p>
                    </div>

                    {/* Discount Type & Value */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-400">
                                نوع الخصم
                            </label>
                            <select
                                value={formData.discountType}
                                onChange={e => setFormData({ ...formData, discountType: e.target.value })}
                                className="w-full h-12 bg-gray-800/50 rounded-xl px-4 text-white
                           border border-gray-700/50 focus:border-blue-500/50
                           focus:ring-2 focus:ring-blue-500/50"
                            >
                                <option value="percentage">نسبة مئوية</option>
                                <option value="fixed">قيمة ثابتة</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-400">
                                قيمة الخصم
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={formData.discountValue}
                                    onChange={e => setFormData({ ...formData, discountValue: e.target.value })}
                                    placeholder={formData.discountType === 'percentage' ? '10' : '100'}
                                    className="w-full h-12 bg-gray-800/50 rounded-xl px-4 text-white
                             border border-gray-700/50 focus:border-blue-500/50
                             focus:ring-2 focus:ring-blue-500/50"
                                />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    {formData.discountType === 'percentage' ? '%' : 'جنيه'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Usage Limit */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-400">
                            الحد الأقصى للاستخدام
                        </label>
                        <input
                            type="number"
                            value={formData.maxUses}
                            onChange={e => setFormData({ ...formData, maxUses: e.target.value })}
                            placeholder="اتركه فارغاً للاستخدام غير المحدود"
                            className="w-full h-12 bg-gray-800/50 rounded-xl px-4 text-white
                         border border-gray-700/50 focus:border-blue-500/50
                         focus:ring-2 focus:ring-blue-500/50"
                        />
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-400">
                                تاريخ البدء
                            </label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full h-12 bg-gray-800/50 rounded-xl px-4 text-white
                           border border-gray-700/50 focus:border-blue-500/50
                           focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-400">
                                تاريخ الانتهاء
                            </label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                className="w-full h-12 bg-gray-800/50 rounded-xl px-4 text-white
                           border border-gray-700/50 focus:border-blue-500/50
                           focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>
                    </div>

                    {/* Specific Users */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-medium text-gray-400">
                                مستخدمين محددين
                            </h3>
                            <button
                                type="button"
                                onClick={() => setFormData({
                                    ...formData,
                                    specificUsers: [...formData.specificUsers, { phone: '', maxUses: '' }]
                                })}
                                className="text-sm text-blue-500 hover:text-blue-400 transition-colors"
                            >
                                إضافة مستخدم
                            </button>
                        </div>
                        {formData.specificUsers.map((user, index) => (
                            <div key={index} className="flex gap-4">
                                <input
                                    type="tel"
                                    value={user.phone}
                                    onChange={e => {
                                        const newUsers = [...formData.specificUsers];
                                        newUsers[index].phone = e.target.value;
                                        setFormData({ ...formData, specificUsers: newUsers });
                                    }}
                                    placeholder="رقم الهاتف"
                                    className="flex-1 h-12 bg-gray-800/50 rounded-xl px-4 text-white
                             border border-gray-700/50 focus:border-blue-500/50
                             focus:ring-2 focus:ring-blue-500/50"
                                    dir="ltr"
                                />
                                <input
                                    type="number"
                                    value={user.maxUses}
                                    onChange={e => {
                                        const newUsers = [...formData.specificUsers];
                                        newUsers[index].maxUses = e.target.value;
                                        setFormData({ ...formData, specificUsers: newUsers });
                                    }}
                                    placeholder="عدد مرات الاستخدام"
                                    className="w-32 h-12 bg-gray-800/50 rounded-xl px-4 text-white
                             border border-gray-700/50 focus:border-blue-500/50
                             focus:ring-2 focus:ring-blue-500/50"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newUsers = formData.specificUsers.filter((_, i) => i !== index);
                                        setFormData({ ...formData, specificUsers: newUsers });
                                    }}
                                    className="p-3 rounded-xl bg-red-500/10 text-red-500
                             hover:bg-red-500/20 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isCreating}
                        className="w-full p-4 rounded-xl bg-blue-500 text-white font-medium
                       hover:bg-blue-600 transition-colors disabled:opacity-50
                       disabled:cursor-not-allowed"
                    >
                        {isCreating ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>جاري الإنشاء...</span>
                            </div>
                        ) : (
                            'إنشاء القسيمة'
                        )}
                    </button>
                </form>
            </div>
        </Sheet>
    );
};

const CouponDetailsSheet = ({
    coupon,
    isOpen,
    onClose,
    onUpdate,
    onDelete,
    isUpdating,
    isDeleting
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(coupon);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await onUpdate(coupon.id, formData);
            setIsEditing(false);
        } catch (err) {
            console.error('Error updating coupon:', err);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('هل أنت متأكد من حذف هذه القسيمة؟')) {
            try {
                await onDelete(coupon.id);
                onClose();
            } catch (err) {
                console.error('Error deleting coupon:', err);
            }
        }
    };

    const copyCode = async () => {
        try {
            await navigator.clipboard.writeText(coupon.code);
            // Add toast notification here
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    };

    return (
        <Sheet isOpen={isOpen} onClose={onClose}>
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <button
                        onClick={onClose}
                        className="p-2 -m-2 rounded-full hover:bg-gray-800/50 transition-colors"
                    >
                        <ChevronDown className="w-6 h-6 text-gray-400" />
                    </button>
                    <h2 className="text-xl font-bold text-white">تفاصيل القسيمة</h2>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="p-2 -m-2 rounded-full hover:bg-gray-800/50 transition-colors"
                    >
                        <Edit3 className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                {isEditing ? (
                    <form onSubmit={handleUpdate} className="space-y-6">
                        {/* Edit Form - Similar to Create Form */}
                        {/* Submit Buttons */}
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={isUpdating}
                                className="flex-1 p-4 rounded-xl bg-blue-500 text-white font-medium
                           hover:bg-blue-600 transition-colors disabled:opacity-50
                           disabled:cursor-not-allowed"
                            >
                                {isUpdating ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>جاري التحديث...</span>
                                    </div>
                                ) : (
                                    'حفظ التغييرات'
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="p-4 rounded-xl bg-gray-800/50 text-gray-400
                           hover:bg-gray-700/50 transition-colors"
                            >
                                إلغاء
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        {/* Coupon Code */}
                        <div className="bg-gray-800/30 rounded-2xl p-4">
                            <div className="flex justify-between items-center">
                                <button
                                    onClick={copyCode}
                                    className="p-2 rounded-xl bg-gray-800/50 hover:bg-blue-500/10
                             border border-transparent hover:border-blue-500/30
                             transition-all duration-300"
                                >
                                    <Copy className="w-5 h-5 text-blue-500" />
                                </button>
                                <div className="text-right">
                                    <h3 className="text-2xl font-bold text-white">{coupon.code}</h3>
                                    <p className="text-sm text-gray-400 mt-1">رمز القسيمة</p>
                                </div>
                            </div>
                        </div>

                        {/* Discount Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-800/30 rounded-2xl p-4">
                                <div className="flex items-center gap-2">
                                    {coupon.discountType === 'percentage' ? (
                                        <PercentIcon className="w-5 h-5 text-blue-500" />
                                    ) : (
                                        <DollarSign className="w-5 h-5 text-blue-500" />
                                    )}
                                    <span className="text-lg font-bold text-white">
                                        {coupon.discountValue}
                                        {coupon.discountType === 'percentage' ? '%' : ' جنيه'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400 mt-1">قيمة الخصم</p>
                            </div>
                            <div className="bg-gray-800/30 rounded-2xl p-4">
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5 text-blue-500" />
                                    <span className="text-lg font-bold text-white">
                                        {coupon.usedCount}/{coupon.maxUses || '∞'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400 mt-1">عدد مرات الاستخدام</p>
                            </div>
                        </div>

                        {/* Date Range */}
                        <div className="bg-gray-800/30 rounded-2xl p-4 space-y-4">
                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-blue-500 mt-1" />
                                <div className="flex-1">
                                    <h4 className="font-medium text-white">المدة الزمنية</h4>
                                    <div className="mt-2 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">تاريخ البدء:</span>
                                            <span className="text-white">
                                                {new Date(coupon.startDate).toLocaleDateString('ar-EG')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">تاريخ الانتهاء:</span>
                                            <span className="text-white">
                                                {new Date(coupon.endDate).toLocaleDateString('ar-EG')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Usage Statistics */}
                        <div className="bg-gray-800/30 rounded-2xl p-4 space-y-4">
                            <h4 className="font-medium text-white">إحصائيات الاستخدام</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-400">إجمالي التوفير</p>
                                    <p className="text-lg font-bold text-blue-500">
                                        {coupon.totalDiscountGiven?.toLocaleString('ar-EG')} جنيه
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-400">متوسط التوفير</p>
                                    <p className="text-lg font-bold text-blue-500">
                                        {(coupon.totalDiscountGiven / coupon.usedCount || 0).toLocaleString('ar-EG')} جنيه
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Usage */}
                        {coupon.recentUsage?.length > 0 && (
                            <div className="space-y-4">
                                <h4 className="font-medium text-white">آخر الاستخدامات</h4>
                                <div className="space-y-3">
                                    {coupon.recentUsage.map((usage, index) => (
                                        <div key={index} className="bg-gray-800/30 rounded-xl p-3 flex justify-between items-center">
                                            <span className="text-blue-500 font-medium">
                                                {usage.discountAmount.toLocaleString('ar-EG')} جنيه
                                            </span>
                                            <div className="text-right">
                                                <p className="text-sm text-white">{usage.orderId}</p>
                                                <p className="text-xs text-gray-400">
                                                    {new Date(usage.usedAt).toLocaleString('ar-EG')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Specific Users */}
                        {coupon.specificUsers?.length > 0 && (
                            <div className="space-y-4">
                                <h4 className="font-medium text-white">المستخدمون المحددون</h4>
                                <div className="space-y-3">
                                    {coupon.specificUsers.map((user, index) => (
                                        <div key={index} className="bg-gray-800/30 rounded-xl p-3 flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-5 h-5 text-blue-500" />
                                                <span className="text-white">{user.usedCount}/{user.maxUses || '∞'}</span>
                                            </div>
                                            <span className="text-gray-400 dir-ltr">{user.phone}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Delete Button */}
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="w-full p-4 rounded-xl bg-red-500/10 text-red-500
                         hover:bg-red-500/20 transition-colors disabled:opacity-50
                         disabled:cursor-not-allowed"
                        >
                            {isDeleting ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>جاري الحذف...</span>
                                </div>
                            ) : (
                                'حذف القسيمة'
                            )}
                        </button>
                    </>
                )}
            </div>
        </Sheet>
    );
};

const StatsSheet = ({ stats, isOpen, onClose, isLoading }) => {
    if (!stats && !isLoading) return null;

    return (
        <Sheet isOpen={isOpen} onClose={onClose}>
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <button
                        onClick={onClose}
                        className="p-2 -m-2 rounded-full hover:bg-gray-800/50 transition-colors"
                    >
                        <ChevronDown className="w-6 h-6 text-gray-400" />
                    </button>
                    <h2 className="text-xl font-bold text-white">إحصائيات القسائم</h2>
                    <div className="w-10" />
                </div>

                {isLoading ? (
                    <LoadingState />
                ) : (
                    <>
                        {/* Overview Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <StatCard
                                title="القسائم النشطة"
                                value={stats.activeCoupons}
                                icon={CheckCircle}
                                color="emerald"
                            />
                            <StatCard
                                title="إجمالي التوفير"
                                value={`${stats.totalDiscountGiven.toLocaleString('ar-EG')} جنيه`}
                                icon={CircleDollarSign}
                                color="blue"
                            />
                            <StatCard
                                title="معدل الاستخدام"
                                value={`${((stats.totalUsedCoupons / stats.totalCoupons) * 100).toFixed(1)}%`}
                                icon={TrendingUp}
                                color="amber"
                            />
                            <StatCard
                                title="قسائم منتهية"
                                value={stats.expiredCoupons}
                                icon={Ban}
                                color="red"
                            />
                        </div>

                        {/* Type Distribution */}
                        <div className="bg-gray-800/30 rounded-2xl p-4 space-y-4">
                            <h4 className="font-medium text-white">توزيع أنواع القسائم</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">نسبة مئوية</span>
                                        <span className="text-white">{stats.couponsByType.percentage}</span>
                                    </div>
                                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full"
                                            style={{
                                                width: `${(stats.couponsByType.percentage / stats.totalCoupons) * 100}%`
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">قيمة ثابتة</span>
                                        <span className="text-white">{stats.couponsByType.fixed}</span>
                                    </div>
                                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-500 rounded-full"
                                            style={{
                                                width: `${(stats.couponsByType.fixed / stats.totalCoupons) * 100}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activities */}
                        {stats.recentActivities?.length > 0 && (
                            <div className="space-y-4">
                                <h4 className="font-medium text-white">آخر النشاطات</h4>
                                <div className="space-y-3">
                                    {stats.recentActivities.map((activity, index) => (
                                        <div key={index} className="bg-gray-800/30 rounded-xl p-3 flex justify-between items-center">
                                            <span className="text-blue-500 font-medium">
                                                {activity.discountAmount.toLocaleString('ar-EG')} جنيه
                                            </span>
                                            <div className="text-right">
                                                <p className="text-sm text-white">{activity.couponCode}</p>
                                                <p className="text-xs text-gray-400 dir-ltr">{activity.userPhone}</p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(activity.usedAt).toLocaleString('ar-EG')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Sheet>
    );
};

// Optimized Sheet component for admin panels
const Sheet = React.memo(({ isOpen, onClose, children }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            <div
                className="absolute inset-0 bg-black/60"
                onClick={onClose}
                style={{ backdropFilter: 'blur(4px)' }}
            />
            <div
                className="fixed inset-x-0 bottom-0"
                style={{
                    transform: 'translateY(0)',
                    willChange: 'transform'
                }}
            >
                <div className="bg-gradient-to-b from-secondary-900/95 to-secondary-900 
                        rounded-t-[2.5rem] border-t border-secondary-800/50 shadow-2xl
                        max-h-[90vh] overflow-y-auto hide-scrollbar">
                    {/* Simplified Handle */}
                    <div className="flex justify-center pt-3 pb-1">
                        <div className="w-12 h-1 rounded-full bg-secondary-700/50" />
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
});

const LoadingState = () => (
    <div className="flex items-center justify-center py-12">
        <div className="space-y-4 text-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
            <p className="text-gray-400">جاري تحميل القسائم...</p>
        </div>
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
        <Ticket className="w-16 h-16 text-gray-700 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">لا توجد قسائم</h3>
        <p className="text-gray-400">قم بإنشاء قسيمة جديدة للبدء</p>
    </div>
);

export default Coupons;