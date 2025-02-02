import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, User, Lock, ShoppingBag,
  LogIn, Bell, Check, AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { AuthContext } from './hooks';
import { PhoneVerificationSheet } from './ProfileComponent.jsx';

// Custom Button Background Pattern
const ButtonPattern = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" className="absolute inset-0 w-full h-full opacity-10">
    <pattern id="button-pattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
      <circle cx="4" cy="4" r="0.5" fill="currentColor" />
    </pattern>
    <rect width="100%" height="100%" fill="url(#button-pattern)" />
  </svg>
);

// Action Button Component
const ActionButton = ({ icon: Icon, onClick, isActive }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative p-2.5 rounded-xl overflow-hidden group"
    >
      {/* Base Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800/80 to-gray-800/50 
                     backdrop-blur-md transition-all duration-300" />

      {/* Pattern Background */}
      <div className="absolute inset-0 text-white/5">
        <ButtonPattern />
      </div>

      {/* Hover Effects */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100"
        animate={{
          background: isHovered
            ? [
              'linear-gradient(45deg, rgba(59, 130, 246, 0.1) 0%, transparent 100%)',
              'linear-gradient(45deg, transparent 0%, rgba(59, 130, 246, 0.1) 100%)'
            ]
            : 'none'
        }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
      />

      {/* Border Glow */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100"
        animate={{
          boxShadow: isHovered
            ? [
              'inset 0 0 0 1px rgba(59, 130, 246, 0.1)',
              'inset 0 0 0 1px rgba(59, 130, 246, 0.2)',
            ]
            : 'none'
        }}
        transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
      />

      {/* Icon */}
      <motion.div
        animate={{
          scale: isHovered ? 1.1 : 1,
          rotate: isHovered ? [0, 5, -5, 0] : 0
        }}
        transition={{
          scale: { duration: 0.2 },
          rotate: { duration: 0.5, repeat: isHovered ? 0 : Infinity }
        }}
        className="relative"
      >
        <Icon className={`w-5 h-5 transition-colors duration-300
                       ${isHovered ? 'text-blue-500' : 'text-gray-400'}`} />
      </motion.div>
    </motion.button>
  );
};

// Modern Logo Component
const Logo = () => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative"
  >
    <h1 className="text-2xl font-bold">
      <span className="relative">
        <span className="bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 
                      bg-clip-text text-transparent">
          Shozti
        </span>
        <motion.div
          className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-blue-400/20 
                     blur-lg opacity-0"
          animate={{
            opacity: [0, 0.5, 0],
            scale: [0.9, 1.1, 0.9]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      </span>
    </h1>
  </motion.div>
);

// Main Header Component
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
      // Attempt login and get user data
      const loginSuccess = await login(data.phone_number);
      
      if (loginSuccess) {
        // Close the phone verification sheet
        setShowPhoneVerification(false);        
        
      }
    } catch (error) {
      toast.error(error.message || 'فشل تسجيل الدخول');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40"
    >
      {/* Glass Background */}
      <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-lg" />

      {/* Content */}
      <div className="relative px-5 py-4">
        <div className="flex justify-between items-center">
          <ActionButton
            icon={User}
            onClick={() => handleActionClick('profile')}
          />

          <Logo />

          <ActionButton
            icon={Package}
            onClick={() => handleActionClick('orders')}
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
    </motion.div>
  );
};

export default { Header };