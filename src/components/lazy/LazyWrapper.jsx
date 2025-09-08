import React, { Suspense } from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ message = "جاري التحميل..." }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
    <motion.div
      className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full mb-4"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
    <p className="text-slate-600 font-medium">{message}</p>
  </div>
);

const ErrorBoundary = ({ children, fallback }) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const errorHandler = (error) => {
      console.error('Lazy loading error:', error);
      setHasError(true);
    };

    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) {
    return fallback || (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="text-error-500 text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">حدث خطأ في التحميل</h3>
        <p className="text-slate-600 text-center mb-4">
          فشل في تحميل المكون. يرجى إعادة تحميل الصفحة.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          إعادة تحميل
        </button>
      </div>
    );
  }

  return children;
};

const LazyWrapper = ({ 
  component: Component, 
  loadingMessage, 
  fallback, 
  ...props 
}) => (
  <ErrorBoundary fallback={fallback}>
    <Suspense fallback={<LoadingSpinner message={loadingMessage} />}>
      <Component {...props} />
    </Suspense>
  </ErrorBoundary>
);

export default LazyWrapper;