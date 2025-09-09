import React, { useState, useEffect } from 'react';
import {
  BarChart3, PackageSearch, Users2, Image, PieChart,
  Loader2, AlertCircle, LogOut, Ticket, Menu, X, Home
} from 'lucide-react';

// Page Components (to be imported)
import Analytics from './pages/Analytics';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Slides from './pages/Slides';

import { useAdmin } from './hooks';

// Import ADMIN_PHONE for display purposes
const ADMIN_PHONE = '0000000000';
import Coupons from './pages/Coupons';
import { ADMIN_COLORS } from './components/DesignSystem';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { token, isInitialized, loading, error, logout, login, isAuthenticating } = useAdmin();

  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-center space-y-6 p-8 rounded-2xl bg-neutral-850/50 backdrop-blur-xl border border-neutral-700/50">
          <div className="relative">
            <Loader2 className="w-16 h-16 text-primary-500 animate-spin mx-auto" />
            <div className="absolute inset-0 rounded-full bg-primary-500/20 animate-ping" />
          </div>
          <p className="text-neutral-300 text-lg font-medium" dir="rtl">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="text-center space-y-6 p-8 rounded-2xl bg-neutral-850/50 backdrop-blur-xl border border-neutral-700/50 max-w-md">
          <div className="relative">
            <AlertCircle className="w-20 h-20 text-danger-500 mx-auto" />
            <div className="absolute inset-0 rounded-full bg-danger-500/20 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-white" dir="rtl">خطأ في المصادقة</h1>
          <p className="text-neutral-400 leading-relaxed" dir="rtl">
            {error || 'فشل في تسجيل الدخول كمدير. تأكد من صحة بيانات الاعتماد.'}
          </p>
          <p className="text-xs text-neutral-500" dir="rtl">
            رقم الهاتف: {ADMIN_PHONE}
          </p>
          <button
            onClick={login}
            disabled={isAuthenticating}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isAuthenticating ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول مرة أخرى'}
          </button>
        </div>
      </div>
    );
  }

  if (!token && isInitialized) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="text-center space-y-6 p-8 rounded-2xl bg-neutral-850/50 backdrop-blur-xl border border-neutral-700/50 max-w-md">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
            <LogOut className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white" dir="rtl">تسجيل الدخول مطلوب</h1>
          <p className="text-neutral-400 leading-relaxed" dir="rtl">يرجى تسجيل الدخول للوصول إلى لوحة التحكم</p>
          <button
            onClick={login}
            disabled={isAuthenticating}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isAuthenticating ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
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

  // Close mobile menu when tab changes
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

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
    <div className="min-h-screen bg-neutral-950 text-white overflow-hidden">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 inset-x-0 z-50 bg-neutral-950/95 backdrop-blur-xl 
                        border-b border-neutral-800/50 shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={logout}
            className="p-2 rounded-xl bg-neutral-850/50 hover:bg-danger-500/10 
                     hover:border-danger-500/30 border border-transparent transition-all"
          >
            <LogOut className="w-5 h-5 text-danger-500" />
          </button>

          <h1 className="text-lg font-bold text-white" dir="rtl">
            {tabs.find(tab => tab.id === activeTab)?.label || 'لوحة التحكم'}
          </h1>

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-xl bg-neutral-850/50 hover:bg-neutral-800/50 transition-colors"
          >
            <Menu className="w-6 h-6 text-neutral-400" />
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed right-0 top-0 h-full w-64 bg-neutral-950/95 
                       backdrop-blur-xl border-l border-neutral-800/50 flex-col z-40 overflow-y-auto hide-scrollbar">
        <div className="p-6 border-b border-neutral-800/50">
          <h1 className="text-xl font-bold text-white" dir="rtl">لوحة التحكم</h1>
          <p className="text-sm text-neutral-400 mt-1" dir="rtl">إدارة المتجر</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl
                       transition-all duration-300 group text-left
                       ${activeTab === id
                  ? 'text-primary-400 bg-primary-500/10 border border-primary-500/20'
                  : 'text-neutral-400 hover:text-neutral-300 hover:bg-neutral-850/50'}`}
              dir="rtl"
            >
              <Icon className={`w-5 h-5 transition-all duration-300
                            ${activeTab === id ? 'text-primary-400' : 'group-hover:scale-110'}`} />
              <span className="font-medium">{label}</span>
              {activeTab === id && (
                <div className="ml-auto w-2 h-8 rounded-full bg-gradient-to-b 
                              from-primary-400 to-primary-600" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-neutral-800/50">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                     text-danger-500 hover:bg-danger-500/10 border border-transparent
                     hover:border-danger-500/30 transition-all duration-300"
            dir="rtl"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <nav className="absolute right-0 top-0 h-full w-80 max-w-[85vw] 
                         bg-neutral-950/95 backdrop-blur-xl border-l border-neutral-800/50
                         transform transition-transform duration-300 overflow-y-auto hide-scrollbar">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800/50">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-neutral-850/50 transition-colors"
              >
                <X className="w-6 h-6 text-neutral-400" />
              </button>
              <h2 className="text-lg font-bold text-white" dir="rtl">القائمة</h2>
            </div>

            <div className="px-4 py-6 space-y-2">
              {tabs.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => handleTabChange(id)}
                  className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl
                           transition-all duration-300 text-right
                           ${activeTab === id
                      ? 'text-primary-400 bg-primary-500/10 border border-primary-500/20'
                      : 'text-neutral-400 hover:text-neutral-300 hover:bg-neutral-850/50'}`}
                  dir="rtl"
                >
                  <Icon className={`w-6 h-6 ${activeTab === id ? 'text-primary-400' : ''}`} />
                  <span className="font-medium text-lg">{label}</span>
                </button>
              ))}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-800/50">
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                         text-danger-500 hover:bg-danger-500/10 border border-transparent
                         hover:border-danger-500/30 transition-all duration-300"
                dir="rtl"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">تسجيل الخروج</span>
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Bottom Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-neutral-950/95 
                     backdrop-blur-xl border-t border-neutral-800/50 shadow-2xl">
        <div className="flex justify-around py-2 px-2">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl
                       transition-all duration-300 min-w-0 flex-1 relative
                       ${activeTab === id
                  ? 'text-primary-400 bg-primary-500/10'
                  : 'text-neutral-500 hover:text-neutral-400 hover:bg-neutral-800/30'}`}
              dir="rtl"
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-all duration-300 ${activeTab === id ? 'scale-110' : ''}`} />
                {activeTab === id && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
                )}
              </div>
              <span className="text-xs font-medium truncate w-full text-center leading-tight">
                {label}
              </span>
              {activeTab === id && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 rounded-full bg-gradient-to-r from-primary-400 to-primary-600" />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="md:mr-64 pt-16 md:pt-0 pb-24 md:pb-8 min-h-screen
                     bg-neutral-950 overflow-y-auto hide-scrollbar">
        <div className="min-h-screen" dir="rtl">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;