import React, { useState, useEffect } from 'react';
import { 
  BarChart3, PackageSearch, Users2, Image, PieChart,
  Loader2, AlertCircle, LogOut,
  Ticket
} from 'lucide-react';

// Page Components (to be imported)
import Analytics from './pages/Analytics';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Slides from './pages/Slides';

import { useAdmin } from './hooks';
import Coupons from './pages/Coupons';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const { token, isInitialized, loading, error, logout } = useAdmin();

  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-6 p-8 rounded-2xl bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
          <div className="relative">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto" />
            <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
          </div>
          <p className="text-gray-300 text-lg font-medium">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center space-y-6 p-8 rounded-2xl bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 max-w-md">
          <div className="relative">
            <AlertCircle className="w-20 h-20 text-red-500 mx-auto" />
            <div className="absolute inset-0 rounded-full bg-red-500/20 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-white">عذراً، حدث خطأ ما</h1>
          <p className="text-gray-400 leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center space-y-6 p-8 rounded-2xl bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 max-w-md">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <LogOut className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">تسجيل الدخول مطلوب</h1>
          <p className="text-gray-400 leading-relaxed">يرجى تسجيل الدخول للوصول إلى لوحة التحكم</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'analytics', icon: PieChart, label: 'التحليلات' },
    { id: 'products', icon: PackageSearch, label: 'المنتجات' },
    { id: 'orders', icon: BarChart3, label: 'الطلبات' },
    { id: 'customers', icon: Users2, label: 'العملاء' },
    { id: 'slides', icon: Image, label: 'العروض' },
    { id: 'coupons', icon: Ticket, label: 'كوبون' }

  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'analytics': return <Analytics />;
      case 'products': return <Products />;
      case 'orders': return <Orders />;
      case 'customers': return <Customers />;
      case 'slides': return <Slides />;
      case 'coupons': return <Coupons />;

      default: return <PieChart />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      {/* Top Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-gray-900/95 backdrop-blur-xl 
                    border-b border-gray-800/50 shadow-2xl shadow-black/20">
        <div className="px-4 py-4">
        
          {/* Tabs */}
          <div className="flex justify-between items-center">
          {tabs.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex flex-col items-center gap-2 py-3 px-4 rounded-xl
                         transition-all duration-300 relative group
                         ${activeTab === id 
                           ? 'text-blue-400 bg-blue-500/10 border border-blue-500/20' 
                           : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'}`}
              >
                <div className="relative">
                  <Icon className={`w-6 h-6 transition-all duration-300
                                ${activeTab === id ? 'scale-110 text-blue-400' : 'group-hover:scale-110'}`} />
                  {activeTab === id && (
                    <div className="absolute -inset-1 bg-blue-500/20 rounded-full blur-sm" />
                  )}
                </div>
                <span className={`text-xs font-medium transition-all duration-300
                              ${activeTab === id 
                                ? 'text-blue-400 transform scale-105' 
                                : 'text-gray-400 group-hover:text-gray-300'}`}>
                  {label}
                </span>
                {activeTab === id && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 
                                rounded-full bg-gradient-to-r from-blue-400 to-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-32 pb-8 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;