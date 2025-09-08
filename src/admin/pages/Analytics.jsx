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
    if (!analytics) return null;

    const calculateGrowth = (current, previous) =>
      previous === 0 ? 0 : ((current - previous) / previous) * 100;

    return {
      revenue: {
        current: analytics.totalSales,
        growth: calculateGrowth(
          analytics.revenueChart?.[analytics.revenueChart.length - 1]?.revenue || 0,
          analytics.revenueChart?.[analytics.revenueChart.length - 2]?.revenue || 0
        ),
        color: 'emerald'
      },
      orders: {
        current: analytics.orderCount,
        growth: calculateGrowth(
          analytics.orderCount,
          analytics.previousOrderCount || 0
        ),
        color: 'blue'
      },
      avgOrderValue: {
        current: analytics.totalSales / analytics.orderCount,
        growth: calculateGrowth(
          analytics.totalSales / analytics.orderCount,
          analytics.previousAvgOrderValue || 0
        ),
        color: 'amber'
      },
      customerRetention: {
        current: analytics.retention?.rate || 0,
        growth: calculateGrowth(
          analytics.retention?.rate || 0,
          analytics.retention?.previousRate || 0
        ),
        color: 'purple'
      }
    };
  }, [analytics]);

  const orderStatusData = useMemo(() => {
    if (!analytics?.ordersByStatus) return [];

    const colors = {
      pending: '#FCD34D',
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
    <div className="min-h-screen bg-neutral-950 p-4 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white md:hidden">التحليلات</h1>
        <AdminButton
          onClick={refreshAnalytics}
          disabled={isRefreshing}
          variant="outline"
          loading={isRefreshing}
        >
          <RefreshCw className="w-5 h-5" />
          <span className="text-sm">تحديث</span>
        </AdminButton>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={refreshAnalytics} />
      ) : (
        <div className="space-y-6">
          {/* Key Metrics Grid - Mobile Optimized */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            <AdminStatCard
              title="إجمالي المبيعات"
              value={`${metrics.revenue.current?.toLocaleString('ar-EG')} ج.م`}
              icon={Wallet}
              color="success"
              trend={metrics.revenue.growth}
            />
            <AdminStatCard
              title="عدد الطلبات"
              value={metrics.orders.current}
              icon={Package}
              color="primary"
              trend={metrics.orders.growth}
            />
            <AdminStatCard
              title="متوسط قيمة الطلب"
              value={`${metrics.avgOrderValue.current?.toLocaleString('ar-EG')} ج.م`}
              icon={ShoppingBag}
              color="warning"
              trend={metrics.avgOrderValue.growth}
            />
            <AdminStatCard
              title="معدل الاحتفاظ بالعملاء"
              value={`${metrics.customerRetention.current?.toFixed(1)}%`}
              icon={Users}
              color="neutral"
              trend={metrics.customerRetention.growth}
            />
          </div>

          {/* Top Products - Mobile Optimized */}
          <TopProducts products={analytics.topProducts} />

          {/* Charts Section - Mobile Stacked */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Status Distribution - Mobile Optimized */}
            <ChartCard
              title="توزيع حالات الطلبات"
              chart={
                <div className="flex items-center justify-center h-[250px] md:h-[300px] bg-gray-800/30 rounded-xl">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={window.innerWidth < 768 ? 80 : 100}
                        innerRadius={window.innerWidth < 768 ? 50 : 60}
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
              }
              footer={
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {orderStatusData.map(({ status, count, color }) => (
                    <div key={status} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs md:text-sm text-gray-400 truncate">
                        {getStatusLabel(status)}
                      </span>
                      <span className="text-xs md:text-sm font-bold text-white ml-auto">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};

const MetricCard = ({ title, value, trend, icon: Icon, color }) => {
  const colors = {
    emerald: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/20'
    },
    blue: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border-blue-500/20',
      iconBg: 'bg-blue-500/20'
    },
    amber: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/20',
      iconBg: 'bg-amber-500/20'
    },
    purple: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      border: 'border-purple-500/20',
      iconBg: 'bg-purple-500/20'
    }
  }[color];

  const TrendIcon = trend >= 0 ? ArrowUpRight : ArrowDownRight;
  const trendColor = trend >= 0 ? 'text-emerald-400' : 'text-red-400';

  return (
    <div className={`relative overflow-hidden rounded-xl md:rounded-2xl border p-3 md:p-6 
                    bg-gray-800/50 backdrop-blur-xl hover:bg-gray-800/70 transition-all duration-300 
                    hover:shadow-xl hover:shadow-black/20 ${colors.border}`}
      dir='rtl'>
      <div className="absolute top-2 md:top-4 left-2 md:left-4">
        <div className={`w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center ${colors.iconBg}`}>
          <Icon className={`w-4 h-4 md:w-6 md:h-6 ${colors.text}`} />
        </div>
      </div>
      <div className="mt-6 md:mt-8">
        <h3 className="text-xs md:text-sm font-medium text-gray-400 mb-1 md:mb-2 leading-tight">{title}</h3>
        <div className="mt-1 md:mt-2 flex items-baseline gap-1 md:gap-2">
          <span className={`text-lg md:text-3xl font-bold ${colors.text} leading-none`}>{value}</span>
        </div>
        {trend !== undefined && (
          <div className={`mt-2 md:mt-3 flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 rounded-full
                          ${trend >= 0 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
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

const ChartCard = ({ title, chart, footer }) => (
  <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-black/20">
    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
      {title}
    </h3>
    {chart}
    {footer}
  </div>
);

const TopProducts = ({ products }) => (
  <AdminCard variant="glass" padding="lg">
    <h3 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6 flex items-center gap-3" dir="rtl">
      <div className="w-2 h-2 rounded-full bg-success-400"></div>
      أفضل المنتجات مبيعاً
    </h3>
    <div className="space-y-3 md:space-y-4">
      {products?.map((product, index) => (
        <AdminCard
          key={product.id}
          variant="default"
          padding="md"
          className="hover:border-primary-500/30"
        >
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 
                           flex items-center justify-center flex-shrink-0">
              <span className="text-sm md:text-lg font-bold text-white">#{index + 1}</span>
            </div>
            <div className="flex-1 min-w-0" dir="rtl">
              <h4 className="font-bold text-white truncate mb-1 text-sm md:text-base">{product.name}</h4>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Package className="w-3 h-3 md:w-4 md:h-4 text-neutral-400" />
                  <span className="text-xs md:text-sm text-neutral-400">
                    {product.quantity} قطعة
                  </span>
                </div>
                <span className="text-primary-400 font-bold text-sm md:text-base">
                  {product.revenue.toLocaleString('ar-EG')} جنيه
                </span>
              </div>
            </div>
          </div>
        </AdminCard>
      ))}
    </div>
  </AdminCard>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
      {label && <p className="text-gray-400 mb-2">{label}</p>}
      {payload.map((item, index) => (
        <p key={index} className="text-white">
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
    <div className="text-center space-y-4 p-6 rounded-2xl bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
      <div className="relative">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto" />
        <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
      </div>
      <p className="text-gray-300 font-medium">جاري تحميل البيانات...</p>
    </div>
  </div>
);

const ErrorState = ({ error, onRetry }) => (
  <div className="text-center py-12">
    <div className="inline-block p-6 rounded-2xl bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 max-w-md">
      <div className="relative mb-4">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
        <div className="absolute inset-0 rounded-full bg-red-500/20 animate-pulse" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">عذراً، حدث خطأ ما</h3>
      <p className="text-gray-400 mb-6 leading-relaxed">{error}</p>
      <button
        onClick={onRetry}
        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        إعادة المحاولة
      </button>
    </div>
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