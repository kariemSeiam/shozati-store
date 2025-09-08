import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import {
  TrendingUp, Wallet, Users, Package, Calendar, RefreshCw,
  Loader2, AlertCircle, ArrowUpRight, ArrowDownRight, DollarSign,
  ShoppingBag, TrendingDown, Clock, CheckCircle, Ban
} from 'lucide-react';
// Removed lodash import for performance - using native JS alternatives
import { useAnalytics } from '../hooks';
import { AdminCard, AdminButton, AdminStatCard } from '../components/DesignSystem';

const Analytics = () => {
  const {
    analytics,
    period,
    isLoading,
    isRefreshing,
    error,
    updatePeriod,
    refreshAnalytics
  } = useAnalytics();


  const metrics = useMemo(() => {
    if (!analytics) {
      return {
        revenue: { current: 0, growth: 0, color: 'emerald' },
        orders: { current: 0, growth: 0, color: 'blue' },
        avgOrderValue: { current: 0, growth: 0, color: 'blue' },
        customerRetention: { current: 0, growth: 0, color: 'purple' }
      };
    }

    const calculateGrowth = (current, previous) =>
      previous === 0 ? 0 : ((current - previous) / previous) * 100;

    // Safe division to prevent NaN
    const avgOrderValue = analytics.orderCount > 0 ? analytics.totalSales / analytics.orderCount : 0;
    const retentionRate = analytics.retention?.rate || 0;

    return {
      revenue: {
        current: analytics.totalSales || 0,
        growth: calculateGrowth(
          analytics.revenueChart?.[analytics.revenueChart.length - 1]?.revenue || 0,
          analytics.revenueChart?.[analytics.revenueChart.length - 2]?.revenue || 0
        ),
        color: 'emerald'
      },
      orders: {
        current: analytics.orderCount || 0,
        growth: calculateGrowth(
          analytics.orderCount || 0,
          analytics.previousOrderCount || 0
        ),
        color: 'blue'
      },
      avgOrderValue: {
        current: avgOrderValue,
        growth: calculateGrowth(
          avgOrderValue,
          analytics.previousAvgOrderValue || 0
        ),
        color: 'blue'
      },
      customerRetention: {
        current: retentionRate,
        growth: calculateGrowth(
          retentionRate,
          analytics.retention?.previousRate || 0
        ),
        color: 'purple'
      }
    };
  }, [analytics]);

  const orderStatusData = useMemo(() => {
    if (!analytics?.ordersByStatus) return [];

    const colors = {
      pending: '#0ea5e9',
      processing: '#60A5FA',
      delivered: '#34D399',
      cancelled: '#F87171'
    };

    return Object.entries(analytics.ordersByStatus).map(([status, count]) => ({
      status,
      count,
      color: colors[status]
    }));
  }, [analytics?.ordersByStatus]);

  return (
    <div className="min-h-screen bg-neutral-950 pb-20" dir="rtl">
      {/* Header for mobile */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-neutral-800/50">
        <h1 className="text-xl font-bold text-white">التحليلات</h1>
        <AdminButton
          onClick={refreshAnalytics}
          disabled={isRefreshing}
          variant="outline"
          loading={isRefreshing}
          size="sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="text-xs">تحديث</span>
        </AdminButton>
      </div>

      {/* Header for desktop */}
      <div className="hidden md:block bg-gradient-to-b from-neutral-950/95 to-neutral-950 border-b border-neutral-800/50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">التحليلات</h1>
            <p className="text-neutral-400 mt-1">تحليل الأداء والإحصائيات المالية</p>
          </div>
          <AdminButton
            onClick={refreshAnalytics}
            disabled={isRefreshing}
            variant="outline"
            loading={isRefreshing}
            size="md"
          >
            <RefreshCw className="w-4 h-4" />
            <span>تحديث البيانات</span>
          </AdminButton>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} onRetry={refreshAnalytics} />
        ) : (
          <div className="space-y-6">
            {/* Key Metrics Grid - Mobile Optimized */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <AdminStatCard
                title="إجمالي المبيعات"
                value={`${(metrics?.revenue?.current || 0).toLocaleString('ar-EG')} ج.م`}
                icon={Wallet}
                color="success"
                trend={metrics?.revenue?.growth || 0}
              />
              <AdminStatCard
                title="عدد الطلبات"
                value={metrics?.orders?.current || 0}
                icon={Package}
                color="primary"
                trend={metrics?.orders?.growth || 0}
              />
              <AdminStatCard
                title="متوسط قيمة الطلب"
                value={`${(metrics?.avgOrderValue?.current || 0).toLocaleString('ar-EG')} ج.م`}
                icon={ShoppingBag}
                color="warning"
                trend={metrics?.avgOrderValue?.growth || 0}
              />
              <AdminStatCard
                title="معدل الاحتفاظ بالعملاء"
                value={`${(metrics?.customerRetention?.current || 0).toFixed(1)}%`}
                icon={Users}
                color="neutral"
                trend={metrics?.customerRetention?.growth || 0}
              />
            </div>

            {/* Top Products - Mobile Optimized */}
            <TopProducts products={analytics.topProducts} />

            {/* Charts Section - Mobile Stacked */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Order Status Distribution - Mobile Optimized */}
              <ChartCard
                title="توزيع حالات الطلبات"
                icon={Package}
                color="primary"
                chart={
                  orderStatusData.length > 0 ? (
                    <div className="flex items-center justify-center h-[200px] md:h-[250px] bg-neutral-800/30 rounded-xl">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={orderStatusData}
                            dataKey="count"
                            nameKey="status"
                            cx="50%"
                            cy="50%"
                            outerRadius={window.innerWidth < 768 ? 70 : 90}
                            innerRadius={window.innerWidth < 768 ? 40 : 50}
                            paddingAngle={5}
                          >
                            {orderStatusData.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[200px] md:h-[250px] bg-gradient-to-br from-neutral-800/80 to-neutral-800/60 rounded-xl border border-neutral-700/50">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-neutral-700/50 flex items-center justify-center mb-4">
                          <Package className="w-8 h-8 text-neutral-400" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary-500/20 border border-primary-500/30"></div>
                      </div>
                      <h3 className="text-white font-medium mb-1">لا توجد طلبات بعد</h3>
                      <p className="text-neutral-500 text-xs text-center max-w-48 leading-relaxed">
                        سيتم عرض إحصائيات الطلبات هنا عند توفر البيانات
                      </p>
                    </div>
                  )
                }
                footer={
                  orderStatusData.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 md:gap-3 mt-3 md:mt-4">
                      {orderStatusData.map(({ status, count, color }) => (
                        <div key={status} className="flex items-center gap-2" dir="rtl">
                          <span className="text-xs font-bold text-white ml-auto">
                            {count}
                          </span>
                          <span className="text-xs text-neutral-400 truncate">
                            {getStatusLabel(status)}
                          </span>
                          <div
                            className="w-2 h-2 md:w-3 md:h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: color }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : null
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, trend, icon: Icon, color }) => {
  const colors = {
    emerald: {
      bg: 'bg-success-500/10',
      text: 'text-success-400',
      border: 'border-success-500/20',
      iconBg: 'bg-success-500/20'
    },
    blue: {
      bg: 'bg-primary-500/10',
      text: 'text-primary-400',
      border: 'border-primary-500/20',
      iconBg: 'bg-primary-500/20'
    },
    purple: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      border: 'border-purple-500/20',
      iconBg: 'bg-purple-500/20'
    }
  }[color];

  const TrendIcon = trend >= 0 ? ArrowUpRight : ArrowDownRight;
  const trendColor = trend >= 0 ? 'text-success-400' : 'text-danger-400';

  return (
    <div className={`relative overflow-hidden rounded-xl md:rounded-2xl border p-3 md:p-6 
                    bg-neutral-800/50 backdrop-blur-xl hover:bg-neutral-800/70 transition-all duration-300 
                    hover:shadow-xl hover:shadow-black/20 ${colors.border}`}
      dir='rtl'>
      <div className="absolute top-2 md:top-4 left-2 md:left-4">
        <div className={`w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center ${colors.iconBg}`}>
          <Icon className={`w-4 h-4 md:w-6 md:h-6 ${colors.text}`} />
        </div>
      </div>
      <div className="mt-6 md:mt-8">
        <h3 className="text-xs md:text-sm font-medium text-neutral-400 mb-1 md:mb-2 leading-tight">{title}</h3>
        <div className="mt-1 md:mt-2 flex items-baseline gap-1 md:gap-2">
          <span className={`text-lg md:text-3xl font-bold ${colors.text} leading-none`}>{value}</span>
        </div>
        {trend !== undefined && (
          <div className={`mt-2 md:mt-3 flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 rounded-full
                          ${trend >= 0 ? 'bg-success-500/10 border border-success-500/20' : 'bg-danger-500/10 border border-danger-500/20'}`}>
            <TrendIcon className="w-3 h-3 md:w-4 md:h-4" />
            <span className="text-xs md:text-sm font-medium">
              {Math.abs(trend).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const ChartCard = ({ title, chart, footer, icon: Icon, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary-400',
    success: 'bg-success-400',
    warning: 'bg-warning-400',
    danger: 'bg-danger-400',
    neutral: 'bg-neutral-400'
  };

  return (
    <AdminCard variant="glass" padding="md">
      <h3 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6 flex items-center justify-between" dir="rtl">
        <div className="flex items-center gap-2 md:gap-3">
          {Icon && <Icon className="w-5 h-5 text-white" />}
          {title}
        </div>
        <div className={`w-3 h-3 rounded-full ${colorClasses[color]}`}></div>
      </h3>
      {chart}
      {footer}
    </AdminCard>
  );
};

const TopProducts = ({ products }) => (
  <AdminCard variant="glass" padding="md">
    <h3 className="text-base md:text-lg font-bold text-white mb-3 md:mb-4 flex items-center justify-between" dir="rtl">
      <div className="flex items-center gap-2 md:gap-3">
        <Package className="w-5 h-5 text-white" />
        أفضل المنتجات مبيعاً
      </div>
      <div className="w-3 h-3 rounded-full bg-success-400"></div>
    </h3>
    <div className="space-y-2 md:space-y-3">
      {products && products.length > 0 ? (
        products.map((product, index) => (
          <AdminCard
            key={product.id}
            variant="default"
            padding="sm"
            className="hover:border-primary-500/30"
          >
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 
                             flex items-center justify-center flex-shrink-0">
                <span className="text-xs md:text-sm font-bold text-white">#{index + 1}</span>
              </div>
              <div className="flex-1 min-w-0" dir="rtl">
                <h4 className="font-bold text-white truncate mb-1 text-xs md:text-sm">{product.name}</h4>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <Package className="w-3 h-3 text-neutral-400" />
                    <span className="text-xs text-neutral-400">
                      {product.quantity || 0} قطعة
                    </span>
                  </div>
                  <span className="text-primary-400 font-bold text-xs md:text-sm">
                    {(product.revenue || 0).toLocaleString('ar-EG')} جنيه
                  </span>
                </div>
              </div>
            </div>
          </AdminCard>
        ))
      ) : (
        <div className="text-center py-8">
          <Package className="w-12 h-12 text-neutral-500 mx-auto mb-3" />
          <p className="text-neutral-400 text-sm">لا توجد منتجات مبيعة بعد</p>
        </div>
      )}
    </div>
  </AdminCard>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-3 backdrop-blur-xl">
      {label && <p className="text-neutral-400 mb-2 text-sm">{label}</p>}
      {payload.map((item, index) => (
        <p key={index} className="text-white text-sm">
          {typeof item.value === 'number'
            ? item.value.toLocaleString('ar-EG')
            : item.value}
          {item.name === 'revenue' ? ' جنيه' : ''}
        </p>
      ))}
    </div>
  );
};

const LoadingState = () => (
  <div className="flex items-center justify-center py-12">
    <AdminCard variant="glass" padding="lg" className="text-center">
      <div className="relative">
        <Loader2 className="w-12 h-12 text-primary-400 animate-spin mx-auto" />
        <div className="absolute inset-0 rounded-full bg-primary-500/20 animate-ping" />
      </div>
      <p className="text-neutral-300 font-medium mt-4">جاري تحميل البيانات...</p>
    </AdminCard>
  </div>
);

const ErrorState = ({ error, onRetry }) => (
  <div className="text-center py-12">
    <AdminCard variant="glass" padding="lg" className="inline-block max-w-md">
      <div className="relative mb-4">
        <AlertCircle className="w-16 h-16 text-danger-400 mx-auto" />
        <div className="absolute inset-0 rounded-full bg-danger-500/20 animate-pulse" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">عذراً، حدث خطأ ما</h3>
      <p className="text-neutral-400 mb-6 leading-relaxed">{error}</p>
      <AdminButton
        onClick={onRetry}
        variant="primary"
        size="md"
      >
        إعادة المحاولة
      </AdminButton>
    </AdminCard>
  </div>
);

const getStatusLabel = (status) => {
  switch (status) {
    case 'pending':
      return 'معلق';
    case 'processing':
      return 'قيد التنفيذ';
    case 'delivered':
      return 'تم التسليم';
    case 'cancelled':
      return 'ملغي';
    default:
      return 'غير معروف';
  }
};

export default Analytics;