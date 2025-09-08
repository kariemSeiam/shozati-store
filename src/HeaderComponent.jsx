import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <motion.button
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative p-3 rounded-2xl overflow-hidden group"
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-primary-50/50 to-white 
                     backdrop-blur-xl transition-all duration-300" />

      {/* Premium Pattern */}
      <div className="absolute inset-0 text-primary-500/10">
        <ButtonPattern />
      </div>

      {/* Dynamic Gradient Animation */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100"
        animate={{
          background: isHovered
            ? [
              'linear-gradient(45deg, rgba(14, 165, 233, 0.15) 0%, transparent 100%)',
              'linear-gradient(45deg, transparent 0%, rgba(56, 189, 248, 0.15) 100%)'
            ]
            : 'none'
        }}
        transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse" }}
      />

      {/* Premium Border Effect */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 rounded-2xl"
        animate={{
          boxShadow: isHovered
            ? [
              'inset 0 0 0 1px rgba(14, 165, 233, 0.3), 0 4px 12px rgba(14, 165, 233, 0.1)',
              'inset 0 0 0 1px rgba(56, 189, 248, 0.3), 0 4px 12px rgba(56, 189, 248, 0.1)',
            ]
            : 'none'
        }}
        transition={{ duration: 1.8, repeat: Infinity, repeatType: "reverse" }}
      />

      {/* Enhanced Icon Animation */}
      <motion.div
        animate={{
          scale: isHovered ? 1.15 : 1,
          rotate: isHovered ? [0, 8, -8, 0] : 0,
          y: isHovered ? -2 : 0
        }}
        transition={{
          scale: { duration: 0.3, ease: "easeOut" },
          rotate: { duration: 0.6, ease: "easeInOut" },
          y: { duration: 0.2 }
        }}
        className="relative"
      >
        <Icon className={`w-6 h-6 transition-all duration-300
                       ${isHovered ? 'text-primary-600 filter drop-shadow-lg' : 'text-primary-700'}`} />
      </motion.div>

      {/* Label Animation */}
      {label && (
        <AnimatePresence>
          {isHovered && (
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 
                         text-xs font-medium text-primary-600 whitespace-nowrap"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      )}
    </motion.button>
  );
};

// Enhanced Logo with premium effects
const Logo = () => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative px-4"
  >
    <div className="relative inline-block">
      <img
        src="/logo.png"
        alt="Shozati Logo"
        className="h-10 w-auto"
      />
      {/* Premium Glow Effect */}
      <motion.div
        className="absolute -inset-2 bg-gradient-to-r from-primary-500/20 via-primary-400/20 to-primary-500/20 
                   blur-xl opacity-0 rounded-full"
        animate={{
          opacity: [0, 0.6, 0],
          scale: [0.9, 1.1, 0.9],
          rotate: [0, 5, 0]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
    </div>
  </motion.div>
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
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40"
    >
      {/* Premium Glass Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-50/95 via-white/90 to-primary-50/95 
                    backdrop-blur-lg shadow-lg shadow-primary-100/50" />

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
    </motion.header>
  );
};

export default { Header };