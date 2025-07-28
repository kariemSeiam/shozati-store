import React, { useState, useRef, useEffect, useContext ,useMemo,useCallback ,memo } from 'react';
import { toast } from 'react-hot-toast';
import {
    User, LogOut, Edit2, MapPin, Phone, Building2, Navigation2,
    AlertCircle, Check, Heart, Package, Loader2, MessageCircle,
    Facebook, Instagram, Clock, ArrowRight, Copy, ExternalLink,Shield ,
    Store, HelpCircle, ShoppingBag, X, LogIn, ArrowLeft,Star ,Truck, 
    Sparkles
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthContext } from './hooks';


// Ultra-optimized animation variants for maximum performance
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.15, ease: "easeIn" } }
};

const sheetVariants = {
  hidden: { 
    y: '100%',
    transition: { duration: 0.15, ease: [0.4, 0, 1, 1] }
  },
  visible: { 
    y: 0,
    transition: {
      type: "tween",
      duration: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

// Memoized Header Component
const SheetHeader = memo(({ onClose, title, hideSupport, onSupportClick }) => (
  <div className="pt-8 px-4 pb-4 border-b border-gray-200 flex-shrink-0">
    <div className="flex items-center justify-between">
      <button
        onClick={onClose}
        className="p-2 rounded-xl bg-gray-50 text-slate-600 hover:bg-gray-100 hover:text-slate-800 transition-all duration-200"
      >
        <X className="w-5 h-5" />
      </button>

      <h3 className="text-xl font-bold text-slate-800">{title}</h3>

      {!hideSupport ? (
        <button
          onClick={onSupportClick}
          className="p-2 rounded-xl bg-gray-50 text-slate-600 hover:bg-gray-100 hover:text-slate-800 transition-all duration-200"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
      ) : (
        <div className="w-9 h-9" />
      )}
    </div>
  </div>
));

// Ultra high-performance BottomSheet Component
export const BottomSheet = memo(({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxHeight = '90vh',
  hideSupport = false
}) => {
  const [showSupport, setShowSupport] = useState(false);
  const sheetRef = useRef(null);
  
  // Memoize handlers to prevent re-renders
  const handleSupportClick = useCallback(() => {
    setShowSupport(true);
  }, []);

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Performance optimization: Prevent scroll on body when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px'; // Prevent layout shift
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  // Memoize content to prevent unnecessary re-renders
  const memoizedChildren = useMemo(() => children, [children]);

  // Early return if not open to prevent unnecessary renders
  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key="backdrop"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 bg-slate-900/20 z-50"
          onClick={handleBackdropClick}
          style={{ 
            backdropFilter: 'blur(1px)', // Reduced blur for better performance
            WebkitBackdropFilter: 'blur(1px)',
            willChange: 'opacity',
            transform: 'translateZ(0)' // Force GPU acceleration
          }}
        >
          <motion.div 
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-x-0 bottom-0"
            style={{ 
              willChange: 'transform',
              transform: 'translateZ(0)', // Force GPU layer
              backfaceVisibility: 'hidden' // Optimize 3D transforms
            }}
          >
            <div 
              className="bg-white rounded-t-3xl flex flex-col overflow-hidden shadow-xl"
              style={{
                maxHeight,
                background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
                transform: 'translateZ(0)', // Force hardware acceleration
                isolation: 'isolate' // Create stacking context for better compositing
              }}
            >
              {/* Simplified drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-12 h-1 rounded-full bg-gray-300" />
              </div>
              
              {/* Optimized Header */}
              <SheetHeader 
                onClose={onClose}
                title={title}
                hideSupport={hideSupport}
                onSupportClick={handleSupportClick}
              />

              {/* Ultra performance-optimized content area */}
              <div 
                ref={sheetRef}
                className="overflow-y-auto overscroll-contain hide-scrollbar flex-1"
                style={{ 
                  contain: 'layout style paint size',
                  contentVisibility: 'auto',
                  willChange: 'scroll-position'
                }}
              >
                {memoizedChildren}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Support Sheet - only render when needed */}
      {showSupport && (
        <SupportSheet
          isOpen={showSupport}
          onClose={() => setShowSupport(false)}
        />
      )}
    </>
  );
});


// Profile Sheet Component with API Integration
export const ProfileSheet = ({ isOpen, onClose, onOpenOrders, onOpenFavorites, onOpenLogin, onOpenLocation }) => {
    const { userInfo, updateProfile, addAddress, updateAddress, logout } = useContext(AuthContext);
    const [showNameInput, setShowNameInput] = useState(false);
    const [showLocationInput, setShowLocationInput] = useState(false);
    const [showPhoneUpdate, setShowPhoneUpdate] = useState(false);
    const [showSupport, setShowSupport] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { isAuthenticated, login } = useContext(AuthContext);
    const [showPhoneVerification, setShowPhoneVerification] = useState(false);

    // Removed useEffect that was automatically opening phone update
    // These functions should only be called when user clicks on specific sections

    const defaultAddress = userInfo?.addresses?.[0];

    const handlePhoneVerification = async (data) => {
        setIsLoading(true);
        try {
            const loginSuccess = await login(data.phone_number);
            if (loginSuccess) {
                setShowPhoneVerification(false);
            }
        } catch (error) {
            toast.error(error.message || 'فشل تسجيل الدخول');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const statsData = useMemo(() => [
        {
            icon: Package,
            label: 'طلباتي',
            count: userInfo?.ordersCount || 0,
            onClick: onOpenOrders,
            color: 'from-sky-400/20 to-sky-500/20'
        },
        {
            icon: Heart,
            label: 'المفضلة',
            count: userInfo?.favoritesCount || 0,
            onClick: onOpenFavorites,
            color: 'from-rose-400/20 to-rose-500/20'
        }
    ], [userInfo?.ordersCount, userInfo?.favoritesCount, onOpenOrders, onOpenFavorites]);

    const profileSections = useMemo(() => [
        {
            id: 'name',
            icon: User,
            title: "الاسم",
            value: userInfo?.name || 'اضغط لإضافة اسم',
            onEdit: () => setShowNameInput(true)
        },
        {
            id: 'phone',
            icon: Phone,
            title: "رقم الهاتف",
            value: userInfo?.phone || '',
            onEdit: () => setShowPhoneUpdate(true)
        },
        {
            id: 'location',
            icon: MapPin,
            title: "عنوان التوصيل",
            value: defaultAddress ?
                `${defaultAddress.district}، ${defaultAddress.governorate}` :
                "اضغط لإضافة عنوان",
            details: defaultAddress?.details,
            onEdit: () => setShowLocationInput(true)
        }
    ], [userInfo, defaultAddress]);

    const handleNameUpdate = useCallback(async (data) => {
        try {
            setIsLoading(true);
            await updateProfile(data);
        } finally {
            setIsLoading(false);
        }
    }, [updateProfile]);

    const handleAddressUpdate = useCallback(async (data) => {
        try {
            setIsLoading(true);
            if (userInfo?.addresses?.length > 0) {
                await updateAddress(userInfo.addresses[0].id, {
                    ...data,
                    is_default: true
                });
            } else {
                await addAddress({
                    ...data,
                    is_default: true
                });
            }
        } finally {
            setIsLoading(false);
        }
    }, [userInfo?.addresses, updateAddress, addAddress]);

    const handleLogout = useCallback(() => {
        logout();
        onClose();
        toast.success('تم تسجيل الخروج بنجاح');
    }, [logout, onClose]);

    return (
        <>
          <BottomSheet isOpen={isOpen} onClose={onClose} title="الملف الشخصي">
            <div className="divide-y divide-slate-100/30">
              {/* Innovative Profile Header */}
              <div className="relative px-4 pt-8 pb-6 overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute inset-0 bg-gradient-to-b from-sky-50/80 to-white" />
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-sky-500/10 to-indigo-500/10 
                  transform -skew-y-6" />
                <div className="absolute top-20 right-0 w-32 h-32 bg-gradient-to-br from-sky-400/20 to-transparent 
                  rounded-full blur-2xl" />
                <div className="absolute top-10 left-0 w-24 h-24 bg-gradient-to-br from-indigo-400/20 to-transparent 
                  rounded-full blur-xl" />
    
                <div className="relative flex flex-col items-center">
                  {/* Innovative Avatar Container */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-indigo-400 
                      rounded-full blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                    
                    {/* Orbital rings animation */}
                    <div className="absolute inset-0 rounded-full border border-sky-200/40 
                      animate-[spin_8s_linear_infinite]" />
                    <div className="absolute inset-2 rounded-full border border-indigo-200/40 
                      animate-[spin_12s_linear_infinite_reverse]" />
                    
                    {/* Main avatar */}
                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-sky-400 via-blue-400 to-indigo-400 
                      shadow-lg shadow-sky-200/50 flex items-center justify-center 
                      ring-2 ring-white ring-offset-2 ring-offset-sky-50 transform transition-all duration-300 
                      group-hover:scale-105 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-br from-sky-600/10 via-transparent to-indigo-600/10" />
                      <User className="w-12 h-12 text-white/95 relative z-10" />
                      
                      {/* Sparkle effects */}
                      <Sparkles className="absolute top-2 right-2 w-3 h-3 text-white/70 animate-pulse" />
                      <Star className="absolute bottom-2 left-2 w-3 h-3 text-white/70 animate-pulse delay-300" />
                    </div>
    
                    {/* Edit button removed - no functionality implemented */}
                  </div>
    
                  {/* Creative text treatment */}
                  <div className="relative mt-4 text-center">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-slate-800 via-sky-700 to-slate-800 
                      bg-clip-text text-transparent">
                      {userInfo?.name || 'مستخدم جديد'}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">{userInfo?.phone}</p>
                  </div>
                </div>
    
                {/* Innovative Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                  {statsData.map((stat, index) => (
                    <button
                      key={index}
                      onClick={stat.onClick}
                      className="group relative overflow-hidden rounded-xl p-3 
                        bg-white/80 backdrop-blur-sm border border-slate-100 shadow-md 
                        hover:shadow-lg hover:border-sky-100 transition-all duration-300 
                        transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      {/* Decorative elements */}
                      <div className="absolute inset-0 bg-gradient-to-br from-sky-400/5 to-indigo-400/5 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r 
                        from-sky-400 via-blue-400 to-indigo-400 scale-x-0 group-hover:scale-x-100 
                        transition-transform duration-300 origin-left" />
                      
                      <div className="relative">
                        <div className="w-6 h-6 mx-auto mb-2 relative">
                          <div className="absolute inset-0 bg-sky-100 rounded-full scale-0 
                            group-hover:scale-100 transition-transform duration-300" />
                          <stat.icon className="w-full h-full text-sky-500 relative z-10 
                            transform group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <p className="text-xs font-medium text-slate-600 mb-1">{stat.label}</p>
                        <p className="text-lg font-bold bg-gradient-to-br from-slate-800 to-slate-600 
                          bg-clip-text text-transparent transform group-hover:scale-105 
                          transition-transform duration-300">{stat.count}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
    
              {/* Creative Profile Sections */}
              <div className="relative px-4 py-4 space-y-3">
                <div className="absolute inset-0 bg-gradient-to-b from-white to-slate-50/50" />
                
                {profileSections.map(section => (
                  <div
                    key={section.id}
                    className="group bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-slate-100
                      hover:border-sky-100 hover:shadow-lg transition-all duration-300
                      relative overflow-hidden"
                  >
                    {/* Decorative background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-50 to-indigo-50 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-400/5 via-transparent to-indigo-400/5 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="relative flex items-center justify-between">
                      <button
                        onClick={section.onEdit}
                        className="p-2 rounded-lg bg-sky-50 hover:bg-sky-100
                          transition-all duration-300 group-hover:shadow-sm group"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-sky-500 group-hover:rotate-12 transition-transform" />
                      </button>
    
                      <div className="flex items-center gap-3 text-right">
                        <div className="transform group-hover:translate-x-1 transition-transform duration-300">
                          <p className="text-xs font-medium text-slate-500 mb-1">{section.title}</p>
                          <p className="text-sm font-bold text-slate-800 group-hover:text-sky-500
                            transition-colors">{section.value}</p>
                          {section.details && (
                            <p className="text-xs text-slate-400 mt-1">{section.details}</p>
                          )}
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-100 to-indigo-100 
                          flex items-center justify-center group-hover:scale-105 transition-transform
                          shadow-sm group-hover:shadow-md relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent" />
                          <section.icon className="w-5 h-5 text-sky-500 relative z-10 
                            transform group-hover:rotate-12 transition-transform duration-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
    
              {/* Creative Support & Actions */}
              <div className="relative p-4 space-y-3" dir="rtl">
                <button
                  onClick={() => setShowSupport(true)}
                  className="w-full bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 
                    rounded-xl p-4 flex items-center justify-between group
                    hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-sky-100/50 to-indigo-100/50 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-100 to-indigo-100 
                      flex items-center justify-center group-hover:scale-105 transition-transform
                      shadow-sm group-hover:shadow-md relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent" />
                      <HelpCircle className="w-5 h-5 text-sky-500 relative z-10 
                        transform group-hover:rotate-12 transition-transform duration-300" />
                    </div>
                    <span className="font-bold text-base bg-gradient-to-br from-slate-800 to-slate-600 
                      bg-clip-text text-transparent group-hover:translate-x-1 transition-transform duration-300">
                      الدعم والمساعدة
                    </span>
                  </div>
                  <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:translate-x-2 
                    transition-transform duration-300" />
                </button>
    
                <button
                  onClick={handleLogout}
                  className="w-full bg-gradient-to-r from-rose-50 to-rose-100/80 text-rose-500 
                    rounded-xl py-3 px-4 font-bold hover:shadow-lg active:bg-rose-200 
                    transition-all duration-300 flex items-center justify-center gap-2
                    relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-100 to-rose-200/50 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <LogOut className="w-5 h-5 relative transform group-hover:rotate-12 
                    transition-transform duration-300" />
                  <span className="text-base relative group-hover:translate-x-0.5 
                    transition-transform duration-300">تسجيل الخروج</span>
                </button>
              </div>
            </div>
          </BottomSheet>
    
          {/* Additional Sheets */}
          <NameInputSheet
            isOpen={showNameInput}
            onClose={() => setShowNameInput(false)}
            onUpdate={handleNameUpdate}
            initialName={userInfo?.name || ''}
          />
    
          <LocationInputSheet
            isOpen={showLocationInput}
            onClose={() => setShowLocationInput(false)}
            onUpdate={handleAddressUpdate}
            initialAddress={defaultAddress}
          />
    
          <PhoneVerificationSheet
            isOpen={showPhoneUpdate}
            onClose={() => setShowPhoneUpdate(false)}
            onVerified={handlePhoneVerification}
            savedPhone={userInfo?.phone || ''}
          />
    
          <SupportSheet
            isOpen={showSupport}
            onClose={() => setShowSupport(false)}
          />
        </>
      );
    };

// Support & About Sheet Component
export const SupportSheet = ({ isOpen, onClose }) => {
    const handleCopyNumber = () => {
        navigator.clipboard.writeText('+201033939828');
        toast.success('تم نسخ رقم الهاتف');
    };

    const handleWhatsApp = () => {
        window.open('https://wa.me/+201033939828', '_blank');
    };

    const handleCall = () => {
        window.open('tel:+201033939828', '_blank');
    };

    const features = [
        {
            icon: ShoppingBag,
            title: 'تشكيلة واسعة',
            description: 'أحدث موديلات الأحذية العصرية للرجال والنساء',
            color: 'bg-rose-100 text-rose-600'
        },
        {
            icon: Star,
            title: 'جودة مضمونة',
            description: 'منتجات أصلية 100% مع ضمان الجودة',
            color: 'bg-sky-100 text-sky-600'
        },
        {
            icon: Truck,
            title: 'توصيل سريع',
            description: 'شحن لجميع المحافظات خلال 2-4 أيام',
            color: 'bg-green-100 text-green-600'
        },
        {
            icon: Shield,
            title: 'ضمان الاسترجاع',
            description: 'استرجاع مجاني خلال 14 يوم',
            color: 'bg-sky-100 text-sky-600'
        }
    ];

    const socialLinks = [
        {
            name: 'Facebook',
            icon: Facebook,
            color: 'bg-sky-100 text-sky-600',
            url: 'https://facebook.com/shozati'
        },
        {
            name: 'Instagram',
            icon: Instagram,
            color: 'bg-pink-100 text-pink-600',
            url: 'https://instagram.com/shozati'
        },
        {
            name: 'TikTok',
            icon: () => (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/>
                </svg>
            ),
            color: 'bg-gray-100 text-gray-600',
            url: 'https://tiktok.com/@shozati'
        }
    ];

    const contactActions = [
        {
            icon: MessageCircle,
            label: 'تحدث معنا',
            color: 'bg-green-100 text-green-600',
            onClick: handleWhatsApp
        },
        {
            icon: Phone,
            label: 'اتصل بنا',
            color: 'bg-sky-100 text-sky-600',
            onClick: handleCall
        },
        {
            icon: Copy,
            label: 'نسخ الرقم',
            color: 'bg-purple-100 text-purple-600',
            onClick: handleCopyNumber
        }
    ];

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose} title="مركز المساعدة | Trendy Corner" hideSupport={true}>
            <div className="p-6 space-y-8" dir="rtl">
                {/* About Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                        <Store className="w-6 h-6 text-rose-600" />
                        <h4 className="text-lg font-bold text-sky-800">مرحباً بك في Trendy Corner</h4>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                        نحن متخصصون في تقديم أرقى تشكيلات الأحذية العصرية بجودة استثنائية وأسعار منافسة.
                        نسعى دائماً لتقديم تجربة تسوق فريدة مع خدمة عملاء احترافية على مدار الساعة.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={`${feature.color} rounded-xl p-4 space-y-2 shadow-sm`}
                        >
                            <feature.icon className="w-6 h-6" />
                            <h5 className="font-bold text-sky-800">{feature.title}</h5>
                            <p className="text-sm text-slate-600">{feature.description}</p>
                        </div>
                    ))}
                </div>

                {/* Contact Actions */}
                <div className="grid grid-cols-3 gap-3">
                    {contactActions.map((action, index) => (
                        <button
                            key={index}
                            onClick={action.onClick}
                            className={`${action.color} rounded-xl p-4 flex flex-col items-center gap-2 
                            hover:brightness-105 transition-all duration-300 shadow-sm hover:shadow-md`}
                        >
                            <action.icon className="w-6 h-6" />
                            <span className="text-sm text-sky-800 text-center whitespace-nowrap">
                                {action.label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                    <h4 className="font-bold text-sky-800">تابعنا على مواقع التواصل</h4>
                    <div className="grid grid-cols-3 gap-3">
                        {socialLinks.map((social, index) => (
                            <a
                                key={index}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${social.color} rounded-xl p-4 flex flex-col items-center gap-2
                                hover:brightness-105 transition-all duration-300 shadow-sm hover:shadow-md`}
                            >
                                <social.icon className="w-6 h-6" />
                                <span className="text-sm font-medium text-sky-800">{social.name}</span>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Working Hours */}
                <div className="bg-gradient-to-r from-rose-100 to-purple-100 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <Clock className="w-6 h-6 text-rose-600" />
                        <div>
                            <h4 className="font-bold text-sky-800 mb-1">مواعيد العمل</h4>
                            <p className="text-sm text-slate-600">
                                طوال أيام الأسبوع
                                <br />
                                من 10 صباحاً حتى 11 مساءً
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </BottomSheet>
    );
};

// Name Input Sheet Component
export const NameInputSheet = ({ isOpen, onClose, onUpdate, initialName = '' }) => {
    const [name, setName] = useState(initialName);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setName(initialName);
    }, [initialName, isOpen]);

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast.error('يرجى إدخال الاسم');
            return;
        }

        try {
            setIsLoading(true);
            await onUpdate({ name });
            toast.success('تم تحديث الاسم بنجاح');
            onClose();
        } catch (error) {
            console.error('Failed to update name:', error);
            toast.error(error.message || 'فشل تحديث الاسم');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose} title="تحديث الاسم">
            <div className="p-6 space-y-6">
                {/* Input Field */}
                <div className="space-y-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="أدخل اسمك"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-sky-50 text-sky-800 rounded-xl p-4 
                                   text-right text-lg border border-sky-100
                                   focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500
                                   placeholder-sky-400 transition-all duration-300"
                        />
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={!name.trim() || isLoading}
                        className="w-full bg-gradient-to-r from-sky-500 to-sky-600 text-white 
                                 rounded-xl py-4 font-bold uppercase tracking-wider
                                 disabled:opacity-50 disabled:cursor-not-allowed
                                 hover:from-sky-500 hover:to-sky-600 
                                 transition-all duration-300 transform hover:-translate-y-0.5
                                 shadow-sm hover:shadow-md"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>جاري التحديث...</span>
                            </div>
                        ) : (
                            'تحديث الاسم'
                        )}
                    </button>
                </div>
            </div>
        </BottomSheet>
    );
};

// Location Input Sheet Component
export const LocationInputSheet = ({ isOpen, onClose, onUpdate, initialAddress = null }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        governorate: initialAddress?.governorate || '',
        district: initialAddress?.district || '',
        details: initialAddress?.details || ''
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setFormData({
                governorate: initialAddress?.governorate || '',
                district: initialAddress?.district || '',
                details: initialAddress?.details || ''
            });
        }
    }, [isOpen, initialAddress]);

    const steps = [
        {
            id: 1,
            field: 'governorate',
            label: 'المحافظة',
            icon: MapPin,
            placeholder: 'اختر المحافظة'
        },
        {
            id: 2,
            field: 'district',
            label: 'المدينة',
            icon: Building2,
            placeholder: 'اختر المدينة'
        },
        {
            id: 3,
            field: 'details',
            label: 'العنوان بالتفصيل',
            icon: Navigation2,
            placeholder: 'ادخل العنوان بالتفصيل'
        }
    ];

    const handleNext = async () => {
        if (step < steps.length) {
            setStep(prev => prev + 1);
        } else {
            try {
                setIsLoading(true);
                await onUpdate(formData);
                onClose();
            } catch (error) {
                console.error('Failed to update address:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose} title="تحديث العنوان">
            <div className="p-6 space-y-6" dir="rtl">
                {/* Progress Steps */}
                <div className="flex justify-center">
                    {steps.map((s, i) => (
                        <div key={s.id} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center
                                       ${step === s.id ? 'bg-sky-500 text-white' :
                                    step > s.id ? 'bg-sky-200 text-sky-600' : 'bg-sky-50 text-sky-400'}`}>
                                {step > s.id ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    s.id
                                )}
                            </div>
                            {i < steps.length - 1 && (
                                <div className={`h-0.5 w-16 
                                          ${step > s.id ? 'bg-sky-200' : 'bg-sky-50'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Current Step Content */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        {React.createElement(steps[step - 1].icon, {
                            className: "w-6 h-6 text-sky-500"
                        })}
                        <h3 className="text-xl font-bold text-sky-800">
                            {steps[step - 1].label}
                        </h3>
                    </div>

                    <input
                        type="text"
                        value={formData[steps[step - 1].field]}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            [steps[step - 1].field]: e.target.value
                        }))}
                        placeholder={steps[step - 1].placeholder}
                        className="w-full bg-sky-50 text-sky-800 rounded-xl p-4
                                 text-right border border-sky-100
                                 focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500
                                 placeholder-sky-400 transition-all duration-300"
                    />
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-3">
                    {step > 1 && (
                        <button
                            onClick={() => setStep(prev => prev - 1)}
                            className="flex-1 bg-sky-50 text-sky-700 rounded-xl py-3
                                   hover:bg-sky-100 transition-colors border border-sky-100"
                        >
                            السابق
                        </button>
                    )}
                    <button
                        onClick={handleNext}
                        disabled={!formData[steps[step - 1].field] || isLoading}
                        className="flex-1 bg-gradient-to-r from-sky-500 to-sky-600 
                                 text-white rounded-xl py-3 font-bold disabled:opacity-50
                                 hover:from-sky-500 hover:to-sky-600 
                                 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>جاري الحفظ...</span>
                            </div>
                        ) : (
                            step === steps.length ? 'حفظ' : 'التالي'
                        )}
                    </button>
                </div>
            </div>
        </BottomSheet>
    );
};

export const PhoneVerificationSheet = ({
    isOpen,
    onClose,
    onVerified,
    loading: externalLoading,
    savedPhone = '',
    isLogin = false
}) => {
    const [phone, setPhone] = useState(savedPhone);
    const [isLoading, setIsLoading] = useState(false);
    const [isValidPhone, setIsValidPhone] = useState(false);

    useEffect(() => {
        const isValid = /^01[0125][0-9]{8}$/.test(phone);
        setIsValidPhone(isValid);
    }, [phone]);

    const handleSubmit = async () => {
        try {
            setIsLoading(true);
            await onVerified({ phone_number: phone });
            toast.success(isLogin ? 'تم تسجيل الدخول بنجاح' : 'تم تحديث رقم الهاتف بنجاح');
            onClose();
        } catch (error) {
            console.error('Phone verification failed:', error);
            toast.error(error.message || (isLogin ? 'فشل تسجيل الدخول' : 'فشل تحديث رقم الهاتف'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <BottomSheet 
            isOpen={isOpen} 
            onClose={onClose} 
            title={isLogin ? "تسجيل الدخول" : "تحديث رقم الهاتف"}
            hideSupport={isLogin}
        >
            <div className="p-6 space-y-8">
                {/* Header Icon */}
                <div className={`w-24 h-24 rounded-full mx-auto 
                    flex items-center justify-center relative overflow-hidden
                    bg-gradient-to-br from-sky-400 to-sky-500 shadow-md`}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-sky-900/10 to-transparent" />
                    {isLogin ? (
                        <LogIn className="w-12 h-12 text-white relative z-10" />
                    ) : (
                        <Phone className="w-12 h-12 text-white relative z-10" />
                    )}
                </div>

                {/* Title and Description */}
                <div className="text-center">
                    <h4 className="text-xl font-bold text-sky-800 mb-2">
                        {isLogin ? 'مرحباً بك' : 'تحديث رقم الهاتف'}
                    </h4>
                    <p className="text-slate-500 mb-2">
                        {isLogin 
                            ? 'قم بإدخال رقم هاتفك للمتابعة' 
                            : 'أدخل رقم هاتفك الجديد'}
                    </p>
                    <p className="text-sm text-sky-500">
                        يفضل إدخال رقم الواتساب لتسهيل التواصل
                    </p>
                </div>

                {/* Phone Input */}
                <div className="space-y-4">
                    <div className="relative">
                        <input
                            type="tel"
                            placeholder="01xxxxxxxxx"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-sky-50 text-sky-800 rounded-xl p-4 
                                text-center text-xl tracking-wide border border-sky-100
                                focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500
                                placeholder-sky-300 transition-all duration-300"
                            dir="ltr"
                        />
                        {phone && (
                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                {isValidPhone ? (
                                    <Check className="w-6 h-6 text-green-500 animate-pulse" />
                                ) : (
                                    <AlertCircle className="w-6 h-6 text-red-500 animate-pulse" />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={!isValidPhone || isLoading || externalLoading}
                        className="w-full text-white rounded-xl py-4 font-bold 
                            uppercase tracking-wider disabled:opacity-50 
                            disabled:cursor-not-allowed transition-all duration-300 
                            transform hover:-translate-y-0.5 shadow-sm hover:shadow-md
                            bg-gradient-to-r from-sky-500 to-sky-600 
                            hover:from-sky-500 hover:to-sky-600"
                    >
                        {isLoading || externalLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>
                                    {isLogin ? 'جاري تسجيل الدخول...' : 'جاري التحديث...'}
                                </span>
                            </div>
                        ) : (
                            isLogin ? 'تسجيل الدخول' : 'تحديث رقم الهاتف'
                        )}
                    </button>
                </div>
            </div>
        </BottomSheet>
    );
};

export default {
    ProfileSheet,
    NameInputSheet,
    LocationInputSheet,
    PhoneVerificationSheet,
    SupportSheet
};