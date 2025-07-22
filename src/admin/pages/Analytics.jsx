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
    <div className="min-h-screen bg-secondary-900 pr-4 pl-4 space-y-4" dir="rtl">
      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={refreshAnalytics} />
      ) : (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="إجمالي المبيعات"
              value={`${metrics.revenue.current?.toLocaleString('ar-EG')} ج.م`}
              icon={Wallet}
              color={metrics.revenue.color}
            />
            <MetricCard
              title="عدد الطلبات"
              value={metrics.orders.current}
              icon={Package}
              color={metrics.orders.color}
            />
            <MetricCard
              title="متوسط قيمة الطلب"
              value={`${metrics.avgOrderValue.current?.toLocaleString('ar-EG')} ج.م`}
              icon={ShoppingBag}
              color={metrics.avgOrderValue.color}
            />
            <MetricCard
              title="معدل الاحتفاظ بالعملاء"
              value={`${metrics.customerRetention.current?.toFixed(1)}%`}
              icon={Users}
              color={metrics.customerRetention.color}
            />
          </div>

          {/* Top Products */}
          <TopProducts products={analytics.topProducts} />

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Status Distribution */}
            <ChartCard
              title="توزيع حالات الطلبات"
              chart={
                <div className="flex items-center justify-center h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={60}
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
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {orderStatusData.map(({ status, count, color }) => (
                    <div key={status} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-sm text-gray-400">
                        {getStatusLabel(status)}
                      </span>
                      <span className="text-sm font-bold text-white">
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
      text: 'text-emerald-500',
      border: 'border-emerald-500/20'
    },
    blue: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-500',
      border: 'border-blue-500/20'
    },
    amber: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-500',
      border: 'border-amber-500/20'
    },
    purple: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-500',
      border: 'border-purple-500/20'
    }
  }[color];

  const TrendIcon = trend >= 0 ? ArrowUpRight : ArrowDownRight;
  const trendColor = trend >= 0 ? 'text-emerald-500' : 'text-red-500';

  return (
    <div className={`relative overflow-hidden rounded-2xl border p-6 ${colors.bg} ${colors.border}`}
    dir='rtl'>
      <div className="absolute top-4 left-4">
        <Icon className={`w-6 h-6 ${colors.text}`} />
      </div>
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className={`text-2xl font-bold ${colors.text}`}>{value}</span>
        </div>
        {trend !== undefined && (
          <div className={`mt-2 flex items-center gap-1 ${trendColor}`}>
            <TrendIcon className="w-4 h-4" />
            <span className="text-sm font-medium">
              {Math.abs(trend).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const ChartCard = ({ title, chart, footer }) => (
  <div className="bg-gray-800/30 rounded-2xl p-4 border border-gray-700/50">
    <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
    {chart}
    {footer}
  </div>
);

const TopProducts = ({ products }) => (
  <div className="bg-gray-800/30 rounded-2xl p-4 border border-gray-700/50">
    <h3 className="text-lg font-bold text-white mb-4">أفضل المنتجات مبيعاً</h3>
    <div className="space-y-4">
      {products?.map((product, index) => (
        <div
          key={product.id}
          className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-xl
                   hover:bg-gray-700/30 transition-colors"
        >
          <span className="text-2xl font-bold text-blue-500">#{index + 1}</span>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white truncate">{product.name}</h4>
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">
                  {product.quantity} قطعة
                </span>
              </div>
              <span className="text-blue-500 font-bold">
                {product.revenue.toLocaleString('ar-EG')} جنيه
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
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
    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
  </div>
);

const ErrorState = ({ error, onRetry }) => (
  <div className="text-center py-12">
    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
    <h3 className="text-xl font-bold text-white mb-2">عذراً، حدث خطأ ما</h3>
    <p className="text-gray-400 mb-4">{error}</p>
    <button
      onClick={onRetry}
      className="px-6 py-2 bg-blue-500 text-white font-bold
                   hover:bg-blue-600 transition-colors"
    >
      إعادة المحاولة
    </button>
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