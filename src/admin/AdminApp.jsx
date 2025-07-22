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
      <div className="min-h-screen bg-secondary-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto" />
          <p className="text-secondary-400 text-lg">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-secondary-900 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-error-500 mx-auto" />
          <h1 className="text-xl font-bold text-white">عذراً، حدث خطأ ما</h1>
          <p className="text-secondary-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-secondary-900 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">تسجيل الدخول مطلوب</h1>
          <p className="text-secondary-400">يرجى تسجيل الدخول للوصول إلى لوحة التحكم</p>
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
    <div className="min-h-screen bg-secondary-900 text-white relative">
      {/* Top Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-secondary-900/95 backdrop-blur-xl 
                    border-b border-secondary-800/50">
        <div className="px-4 py-3">
        
          {/* Tabs */}
          <div className="flex justify-between items-center">
          {tabs.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex flex-col items-center gap-2 py-2 px-2 rounded-xl
                         transition-all duration-300 relative group
                         ${activeTab === id 
                           ? 'text-primary-500' 
                           : 'text-secondary-400 hover:text-secondary-300'}`}
              >
                <div className="relative">
                  <Icon className={`w-6 h-6 transition-transform duration-300
                                ${activeTab === id ? 'scale-110' : 'group-hover:scale-110'}`} />
                </div>
                <span className={`text-xs font-medium transition-all duration-300
                              ${activeTab === id 
                                ? 'text-blue-500 transform scale-105' 
                                : 'text-gray-400 group-hover:text-gray-300'}`}>
                  {label}
                </span>
                {activeTab === id && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 
                                rounded-full bg-blue-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-28 pb-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;