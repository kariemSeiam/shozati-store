import { useCallback, useContext, useState } from 'react';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../hooks';

export const useAuthActions = () => {
  const { isAuthenticated, userInfo, login, updateAddress, addAddress } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

  const checkAuthAndProceed = useCallback((options = {}) => {
    const {
      requiresAuth = true,
      requiresAddress = false,
      onSuccess,
      onNotAuthenticated,
      onNoAddress
    } = options;

    if (requiresAuth && !isAuthenticated) {
      if (onNotAuthenticated) {
        onNotAuthenticated();
      }
      return false;
    }

    if (requiresAddress && !userInfo?.addresses?.length) {
      if (onNoAddress) {
        onNoAddress();
      } else {
        toast.error('يرجى إضافة عنوان التوصيل أولاً');
      }
      return false;
    }

    if (onSuccess) {
      onSuccess();
    }

    return true;
  }, [isAuthenticated, userInfo?.addresses]);

  const handlePhoneVerification = useCallback(async (data) => {
    setIsLoading(true);
    try {
      const loginSuccess = await login(data.phone_number);
      
      if (loginSuccess) {
        return { success: true };
      }
    } catch (error) {
      toast.error(error.message || 'فشل تسجيل الدخول');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  const handleLocationUpdate = useCallback(async (data) => {
    setIsLoading(true);
    try {
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
      toast.success('تم تحديث العنوان بنجاح');
      return { success: true };
    } catch (error) {
      toast.error(error.message || 'فشل تحديث العنوان');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [userInfo?.addresses, updateAddress, addAddress]);

  return {
    checkAuthAndProceed,
    handlePhoneVerification,
    handleLocationUpdate,
    isLoading,
    isAuthenticated,
    userInfo
  };
};