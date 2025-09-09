import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import {
  Package, User, Lock, ShoppingBag,
  LogIn, Bell, Check, AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { AuthContext } from './hooks';
import { PhoneVerificationSheet } from './ProfileComponent.jsx';

// Enhanced button pattern with more sophisticated design
const ButtonPattern = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" className="absolute inset-0 w-full h-full opacity-10">
    <defs>
      <pattern id="premium-pattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
        <circle cx="5" cy="5" r="0.5" fill="currentColor" />
        <circle cx="0" cy="0" r="0.3" fill="currentColor" />
        <circle cx="10" cy="10" r="0.3" fill="currentColor" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#premium-pattern)" />
  </svg>
);

// Enhanced Action Button with premium styling
const ActionButton = ({ icon: Icon, onClick, isActive, label }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className="relative p-3 rounded-2xl overflow-hidden group hover:scale-105 active:scale-95 transition-transform duration-200"
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-primary-50/50 to-white 
                     backdrop-blur-xl transition-all duration-300" />

      {/* Premium Pattern */}
      <div className="absolute inset-0 text-primary-500/10">
        <ButtonPattern />
      </div>

      {/* Dynamic Gradient Animation */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isHovered ? 'bg-gradient-to-br from-blue-200/20 to-indigo-200/20' : ''
          }`}
      />

      {/* Premium Border Effect */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 rounded-2xl transition-all duration-300 ${isHovered ? 'ring-2 ring-blue-300/30 shadow-lg shadow-blue-200/20' : ''
          }`}
      />

      {/* Enhanced Icon Animation */}
      <div
        className={`relative transition-all duration-300 ${isHovered ? 'scale-110 -translate-y-0.5' : 'scale-100 translate-y-0'
          }`}
      >
        <Icon className={`w-6 h-6 transition-all duration-300
                       ${isHovered ? 'text-primary-600 filter drop-shadow-lg' : 'text-primary-700'}`} />
      </div>

      {/* Label Animation */}
      {label && isHovered && (
        <span
          className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 
                     text-xs font-medium text-primary-600 whitespace-nowrap
                     animate-in fade-in slide-in-from-top-2 duration-300"
        >
          {label}
        </span>
      )}
    </button>
  );
};

// Enhanced Logo with premium effects
const Logo = () => (
  <div
    className="relative px-4 animate-in fade-in slide-in-from-top-5 duration-500"
  >
    <div className="relative inline-block">
      <img
        src="/logo.png"
        alt="Shozati Logo"
        className="h-10 w-auto"
      />
      {/* Premium Glow Effect */}
      <div
        className="absolute -inset-2 bg-gradient-to-r from-primary-500/20 via-primary-400/20 to-primary-500/20 
                   blur-xl opacity-0 rounded-full animate-pulse"
      />
    </div>
  </div>
);

// Enhanced Header Component
export const Header = ({ onOrdersClick, onProfileClick }) => {
  const { isAuthenticated, login } = useContext(AuthContext);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleActionClick = async (action) => {
    if (!isAuthenticated) {
      setShowPhoneVerification(true);
      return;
    }

    if (action === 'orders') {
      onOrdersClick();
    } else if (action === 'profile') {
      onProfileClick();
    }
  };

  const handlePhoneVerification = async (data) => {
    setIsLoading(true);
    try {
      const loginSuccess = await login(data.phone_number);
      if (loginSuccess) {
        setShowPhoneVerification(false);
      }
    } catch (error) {
      toast.error(error.message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header
      className="sticky top-0 z-40 animate-in fade-in slide-in-from-top-5 duration-500"
    >
      {/* Transparent Background */}

      {/* Enhanced Content Layout */}
      <div className="relative px-4 py-2">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <ActionButton
            icon={User}
            onClick={() => handleActionClick('profile')}
            label="Profile"
          />

          <Logo />

          <ActionButton
            icon={Package}
            onClick={() => handleActionClick('orders')}
            label="Orders"
          />
        </div>
      </div>

      {/* Phone Verification Sheet */}
      <PhoneVerificationSheet
        isOpen={showPhoneVerification}
        onClose={() => setShowPhoneVerification(false)}
        onVerified={handlePhoneVerification}
        loading={isLoading}
        isLogin={true}
      />
    </header>
  );
};

export default { Header };