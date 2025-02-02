import React, { useState, useRef, useEffect, useContext ,useMemo,useCallback  } from 'react';
import { toast } from 'react-hot-toast';
import {
    User, LogOut, Edit2, MapPin, Phone, Building2, Navigation2,
    AlertCircle, Check, Heart, Package, Loader2, MessageCircle,
    Facebook, Instagram, Clock, ArrowRight, Copy, ExternalLink,Shield ,
    Store, HelpCircle, ShoppingBag, X, LogIn, ArrowLeft,Star ,Truck 
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthContext, useOrders, useFavorites } from './hooks';

// Base BottomSheet Component
export const BottomSheet = ({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    maxHeight = '90vh',
    hideSupport = false // Optional prop to hide support button
  }) => {
    const [showSupport, setShowSupport] = useState(false);
    const sheetRef = useRef(null);
    const contentRef = useRef(null);
  
    useEffect(() => {
      const handleEscapeKey = (event) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };
  
      if (isOpen) {
        document.addEventListener('keydown', handleEscapeKey);
        document.body.style.overflow = 'hidden';
      }
  
      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
        document.body.style.overflow = 'auto';
      };
    }, [isOpen, onClose]);
  
    const handleBackdropClick = (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    };
  
    if (!isOpen) return null;
  
    return (
      <>
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleBackdropClick}
          >
            <motion.div 
              className="fixed inset-x-0 bottom-0 transform"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ 
                type: "spring", 
                damping: 25, 
                stiffness: 350,
                mass: 0.8 
              }}
            >
              <div 
                ref={sheetRef}
                className={`bg-gray-900 rounded-t-3xl max-h-[${maxHeight}] flex flex-col
                         overflow-hidden shadow-xl border-t border-gray-800/50`}
              >
                {/* Drag Handle */}
                <div className="absolute inset-x-0 top-0 h-7 flex justify-center 
                             items-start cursor-grab active:cursor-grabbing">
                  <div className="w-12 h-1 rounded-full bg-gray-800 mt-3" />
                </div>
                
                {/* Header */}
                <div className="pt-8 px-4 pb-4 border-b border-gray-800 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={onClose}
                      className="p-2 rounded-xl bg-gray-800/80 text-gray-400 
                               hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
  
                    <h3 className="text-xl font-bold text-white">{title}</h3>
  
                    {!hideSupport && (
                      <button
                        onClick={() => setShowSupport(true)}
                        className="p-2 rounded-xl bg-gray-800/80 text-gray-400 
                                 hover:bg-gray-700 transition-colors group"
                      >
                        <MessageCircle className="w-5 h-5 group-hover:text-blue-500 
                                           transition-colors" />
                      </button>
                    )}
                    {hideSupport && <div className="w-9 h-9" />} {/* Spacer */}
                  </div>
                </div>
  
                {/* Scrollable Content */}
                <motion.div 
                  ref={contentRef}
                  className="overflow-y-auto overscroll-contain hide-scrollbar flex-1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {children}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
  
        {/* Support Sheet */}
        <SupportSheet
          isOpen={showSupport}
          onClose={() => setShowSupport(false)}
        />
      </>
    );
  };

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
    // Handle initial modal state based on props
    useEffect(() => {
        if (onOpenLocation) {
            setShowLocationInput(true);
        } else if (onOpenLogin) {
            setShowPhoneUpdate(true);
        }
    }, [onOpenLocation, onOpenLogin]);

    const defaultAddress = userInfo?.addresses?.[0];

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

    // Stats Data
    const statsData = useMemo(() => [
        {
            icon: Package,
            label: 'طلباتي',
            count: userInfo?.ordersCount || 0,
            onClick: onOpenOrders,
            color: 'from-blue-500/20 to-blue-600/20'
        },
        {
            icon: Heart,
            label: 'المفضلة',
            count: userInfo?.favoritesCount || 0,
            onClick: onOpenFavorites,
            color: 'from-red-500/20 to-pink-500/20'
        }
    ], [userInfo?.ordersCount, userInfo?.favoritesCount, onOpenOrders, onOpenFavorites]);

    // Profile Sections Data
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

    useEffect(() => {
        if (onOpenLocation) {
            setShowLocationInput(false);
        }
        if (onOpenLogin) {
            setShowPhoneUpdate(false);
        }
    }, []);

    return (
        <>
            <BottomSheet isOpen={isOpen} onClose={onClose} title="الملف الشخصي">
                <div className="divide-y divide-gray-800">
                    {/* Profile Header */}
                    <div className="p-6 space-y-6">
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 
                           flex items-center justify-center mb-4">
                                <User className="w-12 h-12 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white">
                                {userInfo?.name || 'مستخدم جديد'}
                            </h3>
                            <p className="text-gray-400">{userInfo?.phone}</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {statsData.map((stat, index) => (
                                <button
                                    key={index}
                                    onClick={stat.onClick}
                                    className={`bg-gradient-to-br ${stat.color} rounded-xl p-4 
                           hover:brightness-110 transition-all duration-300 
                           transform hover:-translate-y-0.5`}
                                >
                                    <stat.icon className="w-6 h-6 text-white mx-auto mb-2" />
                                    <p className="text-sm text-white mb-1">{stat.label}</p>
                                    <p className="text-2xl font-bold text-white">{stat.count}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Profile Sections */}
                    <div className="p-6 space-y-4">
                        {profileSections.map(section => (
                            <div
                                key={section.id}
                                className="group bg-gray-800/50 rounded-xl p-4 border border-gray-700
                         hover:border-blue-500/30 transition-all duration-300"
                            >
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={section.onEdit}
                                        className="p-2 rounded-full bg-gray-800/50 hover:bg-blue-500/10
                             transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4 text-blue-500" />
                                    </button>

                                    <div className="flex items-center gap-3 text-right">
                                        <div>
                                            <p className="text-sm text-gray-400">{section.title}</p>
                                            <p className="font-bold text-white group-hover:text-blue-500
                                transition-colors">{section.value}</p>
                                            {section.details && (
                                                <p className="text-sm text-gray-500 mt-1">{section.details}</p>
                                            )}
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-gray-800/50 
                                flex items-center justify-center">
                                            <section.icon className="w-5 h-5 text-blue-500" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Support & Actions */}
                    <div className="p-6 space-y-4"
                    dir='rtl'>
                        <button
                            onClick={() => setShowSupport(true)}
                            className="w-full bg-gradient-to-r from-blue-500/10 to-blue-600/10 
                       rounded-xl p-4 flex items-center justify-between
                       hover:brightness-110 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/20 
                             flex items-center justify-center">
                                    <HelpCircle className="w-5 h-5 text-blue-500" />
                                </div>
                                <span className="font-bold text-white">الدعم والمساعدة</span>
                            </div>
                            <ArrowLeft className="w-5 h-5 text-gray-400" />
                        </button>

                        <button
                            onClick={handleLogout}
                            className="w-full bg-red-500/10 text-red-500 rounded-xl py-4 
                       font-bold hover:bg-red-500/20 transition-all duration-300 
                       flex items-center justify-center gap-2"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>تسجيل الخروج</span>
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
const SupportSheet = ({ isOpen, onClose }) => {
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
            color: 'bg-rose-500/10 text-rose-500'
        },
        {
            icon: Star,
            title: 'جودة مضمونة',
            description: 'منتجات أصلية 100% مع ضمان الجودة',
            color: 'bg-amber-500/10 text-amber-500'
        },
        {
            icon: Truck,
            title: 'توصيل سريع',
            description: 'شحن لجميع المحافظات خلال 2-4 أيام',
            color: 'bg-green-500/10 text-green-500'
        },
        {
            icon: Shield,
            title: 'ضمان الاسترجاع',
            description: 'استرجاع مجاني خلال 14 يوم',
            color: 'bg-blue-500/10 text-blue-500'
        }
    ];

    const socialLinks = [
        {
            name: 'Facebook',
            icon: Facebook,
            color: 'bg-blue-500/10 text-blue-500',
            url: 'https://facebook.com/shozati'
        },
        {
            name: 'Instagram',
            icon: Instagram,
            color: 'bg-pink-500/10 text-pink-500',
            url: 'https://instagram.com/shozati'
        },
        {
            name: 'TikTok',
            icon: () => (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/>
                </svg>
            ),
            color: 'bg-gray-500/10 text-gray-200',
            url: 'https://tiktok.com/@shozati'
        }
    ];

    const contactActions = [
        {
            icon: MessageCircle,
            label: 'تحدث معنا',
            color: 'bg-green-500/10 text-green-500',
            onClick: handleWhatsApp
        },
        {
            icon: Phone,
            label: 'اتصل بنا',
            color: 'bg-blue-500/10 text-blue-500',
            onClick: handleCall
        },
        {
            icon: Copy,
            label: 'نسخ الرقم',
            color: 'bg-purple-500/10 text-purple-500',
            onClick: handleCopyNumber
        }
    ];

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose} title="مركز المساعدة | شوزاتي" hideSupport={true}>
            <div className="p-6 space-y-8" dir="rtl">
                {/* About Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                        <Store className="w-6 h-6 text-rose-500" />
                        <h4 className="text-lg font-bold text-white">مرحباً بك في شوزاتي</h4>
                    </div>
                    <p className="text-gray-400 leading-relaxed">
                        نحن متخصصون في تقديم أرقى تشكيلات الأحذية العصرية بجودة استثنائية وأسعار منافسة.
                        نسعى دائماً لتقديم تجربة تسوق فريدة مع خدمة عملاء احترافية على مدار الساعة.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={`${feature.color} rounded-xl p-4 space-y-2`}
                        >
                            <feature.icon className="w-6 h-6" />
                            <h5 className="font-bold text-white">{feature.title}</h5>
                            <p className="text-sm text-gray-300">{feature.description}</p>
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
                            hover:brightness-110 transition-all duration-300`}
                        >
                            <action.icon className="w-6 h-6" />
                            <span className="text-sm text-white text-center whitespace-nowrap">
                                {action.label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                    <h4 className="font-bold text-white">تابعنا على مواقع التواصل</h4>
                    <div className="grid grid-cols-3 gap-3">
                        {socialLinks.map((social, index) => (
                            <a
                                key={index}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${social.color} rounded-xl p-4 flex flex-col items-center gap-2
                                hover:brightness-110 transition-all duration-300`}
                            >
                                <social.icon className="w-6 h-6" />
                                <span className="text-sm font-medium text-white">{social.name}</span>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Working Hours */}
                <div className="bg-gradient-to-r from-rose-500/10 to-purple-500/10 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <Clock className="w-6 h-6 text-rose-500" />
                        <div>
                            <h4 className="font-bold text-white mb-1">مواعيد العمل</h4>
                            <p className="text-sm text-gray-400">
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
const NameInputSheet = ({ isOpen, onClose, onUpdate, initialName = '' }) => {
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
                            className="w-full bg-gray-800 text-white rounded-xl p-4 
                       text-right text-lg
                       focus:ring-4 focus:ring-blue-500/50 border-none"
                        />
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={!name.trim() || isLoading}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white 
                     rounded-xl py-4 font-bold uppercase tracking-wider
                     disabled:opacity-50 disabled:cursor-not-allowed
                     hover:from-blue-600 hover:to-blue-700 
                     transition-all duration-300 transform hover:-translate-y-0.5"
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
            <div className="p-6 space-y-6"
            dir='rtl'>
                {/* Progress Steps */}
                <div className="flex justify-center">
                    {steps.map((s, i) => (
                        <div key={s.id} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center
                           ${step === s.id ? 'bg-blue-500' :
                                    step > s.id ? 'bg-blue-500/50' : 'bg-gray-800'}`}>
                                {step > s.id ? (
                                    <Check className="w-4 h-4 text-white" />
                                ) : (
                                    s.id
                                )}
                            </div>
                            {i < steps.length - 1 && (
                                <div className={`h-0.5 w-16 
                              ${step > s.id ? 'bg-blue-500/50' : 'bg-gray-800'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Current Step Content */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        {React.createElement(steps[step - 1].icon, {
                            className: "w-6 h-6 text-blue-500"
                        })}
                        <h3 className="text-xl font-bold text-white">
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
                        className="w-full bg-gray-800 text-white rounded-xl p-4
                     text-right focus:ring-4 focus:ring-blue-500/50 border-none"
                    />
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-3">
                    {step > 1 && (
                        <button
                            onClick={() => setStep(prev => prev - 1)}
                            className="flex-1 bg-gray-800 text-white rounded-xl py-3
                       hover:bg-gray-700 transition-colors"
                        >
                            السابق
                        </button>
                    )}
                    <button
                        onClick={handleNext}
                        disabled={!formData[steps[step - 1].field] || isLoading}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 
                     text-white rounded-xl py-3 font-bold disabled:opacity-50
                     hover:brightness-110 transition-all duration-300"
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

// Phone Verification Sheet Component
export const PhoneVerificationSheet = ({
    isOpen,
    onClose,
    onVerified,
    loading: externalLoading,
    savedPhone = '',
    isLogin = false // New prop to determine the sheet's purpose
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
                    ${isLogin 
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                        : 'bg-gradient-to-br from-blue-500 to-blue-600'}`}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    {isLogin ? (
                        <LogIn className="w-12 h-12 text-white relative z-10" />
                    ) : (
                        <Phone className="w-12 h-12 text-white relative z-10" />
                    )}
                </div>

                {/* Title and Description */}
                <div className="text-center">
                    <h4 className="text-xl font-bold text-white mb-2">
                        {isLogin ? 'مرحباً بك' : 'تحديث رقم الهاتف'}
                    </h4>
                    <p className="text-gray-400 mb-2">
                        {isLogin 
                            ? 'قم بإدخال رقم هاتفك للمتابعة' 
                            : 'أدخل رقم هاتفك الجديد'}
                    </p>
                    <p className={`text-sm ${isLogin ? 'text-blue-500' : 'text-blue-500'}`}>
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
                            className={`w-full bg-gray-800 text-white rounded-xl p-4 
                                text-center text-xl tracking-wide
                                focus:ring-4 border-none
                                ${isLogin 
                                    ? 'focus:ring-blue-500/50' 
                                    : 'focus:ring-blue-500/50'}`}
                            dir="ltr"
                        />
                        {phone && (
                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                {isValidPhone ? (
                                    <Check className="w-6 h-6 text-blue-500 animate-pulse" />
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
                        className={`w-full text-white rounded-xl py-4 font-bold 
                            uppercase tracking-wider disabled:opacity-50 
                            disabled:cursor-not-allowed transition-all duration-300 
                            transform hover:-translate-y-0.5
                            ${isLogin 
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' 
                                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'}`}
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