import React, { useEffect, useRef } from 'react';
import { X, ChevronDown } from 'lucide-react';

// Add global CSS for hiding scrollbars
const hideScrollbarStyles = `
  .hide-scrollbar {
    -ms-overflow-style: none;  /* Internet Explorer 10+ */
    scrollbar-width: none;  /* Firefox */
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;  /* Safari and Chrome */
  }
`;

// Inject the styles
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = hideScrollbarStyles;
    document.head.appendChild(styleSheet);
}

// Unified Responsive Sheet Component
export const ResponsiveSheet = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'default',
    showCloseButton = true,
    showHandle = true,
    className = '',
    maxHeight = '90vh'
}) => {
    const sheetRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // Focus management for accessibility
            if (sheetRef.current) {
                sheetRef.current.focus();
            }
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
        small: 'max-h-[60vh]',
        default: 'max-h-[90vh]',
        large: 'max-h-[95vh]',
        full: 'h-screen'
    };

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Sheet Container */}
            <div className="fixed inset-x-0 bottom-0 transform transition-transform duration-300 ease-out">
                <div
                    ref={sheetRef}
                    className={`
            bg-gradient-to-b from-neutral-950/95 to-neutral-950 backdrop-blur-xl
            rounded-t-[2.5rem] border-t border-neutral-800/50 shadow-2xl
            ${sizeClasses[size]} overflow-y-auto hide-scrollbar
            ${className}
          `}
                    tabIndex={-1}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={title ? "sheet-title" : undefined}
                >
                    {/* Handle */}
                    {showHandle && (
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-12 h-1 rounded-full bg-neutral-700/50" />
                        </div>
                    )}

                    {/* Header */}
                    {title && (
                        <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-neutral-800/50">
                            <h2 id="sheet-title" className="text-lg md:text-xl font-bold text-white" dir="rtl">
                                {title}
                            </h2>
                            {showCloseButton && (
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-xl hover:bg-neutral-800/50 transition-colors"
                                    aria-label="إغلاق"
                                >
                                    <X className="w-5 h-5 text-neutral-400" />
                                </button>
                            )}
                        </div>
                    )}

                    {/* Content */}
                    <div className="px-4 md:px-6 py-4 md:py-6">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Responsive Modal Component for Desktop
export const ResponsiveModal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    className = ''
}) => {
    const modalRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            if (modalRef.current) {
                modalRef.current.focus();
            }
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl',
        full: 'max-w-full mx-4'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                ref={modalRef}
                className={`
          relative bg-neutral-900 rounded-xl md:rounded-2xl border border-neutral-700/50
          w-full ${sizeClasses[size]} max-h-[95vh] overflow-y-auto backdrop-blur-xl hide-scrollbar
          ${className}
        `}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? "modal-title" : undefined}
                dir="rtl"
            >
                {/* Header */}
                {title && (
                    <div className="sticky top-0 bg-neutral-900 border-b border-neutral-800/50 px-4 md:px-6 py-4 flex items-center justify-between z-10">
                        <h2 id="modal-title" className="text-lg md:text-xl font-bold text-white">
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-neutral-800/50 rounded-xl transition-colors"
                            aria-label="إغلاق"
                        >
                            <X className="w-5 h-5 text-neutral-400" />
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="p-4 md:p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

// Responsive Form Field Component
export const ResponsiveFormField = ({
    label,
    children,
    error,
    hint,
    required = false,
    className = ''
}) => {
    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-neutral-400">
                    {label}
                    {required && <span className="text-red-500 mr-1">*</span>}
                </label>
            )}
            {children}
            {hint && (
                <p className="text-xs text-neutral-500">{hint}</p>
            )}
            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}
        </div>
    );
};

// Responsive Input Component
export const ResponsiveInput = ({
    type = 'text',
    name,
    value,
    onChange,
    placeholder,
    error,
    hint,
    required = false,
    className = '',
    ...props
}) => {
    return (
        <ResponsiveFormField label={name} error={error} hint={hint} required={required}>
            <input
                type={type}
                value={value || ''}
                onChange={onChange}
                placeholder={placeholder}
                className={`
          w-full h-12 px-4 rounded-xl !text-white placeholder:!text-neutral-500
          !bg-neutral-800/70 !border-neutral-700/50 
          focus:!border-blue-500/50 focus:ring-2 focus:ring-blue-500/20
          transition-all duration-200
          ${error ? '!border-red-500/50' : ''}
          ${className}
        `}
                style={{
                    backgroundColor: 'rgb(38 38 38 / 0.7)',
                    color: 'white',
                    borderColor: 'rgb(64 64 64 / 0.5)'
                }}
                {...props}
            />
        </ResponsiveFormField>
    );
};

// Responsive Select Component
export const ResponsiveSelect = ({
    name,
    value,
    onChange,
    options = [],
    placeholder = 'اختر...',
    error,
    hint,
    required = false,
    className = '',
    ...props
}) => {
    return (
        <ResponsiveFormField label={name} error={error} hint={hint} required={required}>
            <div className="relative">
                <select
                    value={value || ''}
                    onChange={onChange}
                    className={`
          w-full h-12 px-4 pr-10 rounded-xl !text-white
          !bg-neutral-800/70 !border-neutral-700/50 
          focus:!border-blue-500/50 focus:ring-2 focus:ring-blue-500/20
          transition-all duration-200 appearance-none
          ${error ? '!border-red-500/50' : ''}
          ${className}
        `}
                    style={{
                        backgroundColor: 'rgb(38 38 38 / 0.7)',
                        color: 'white',
                        borderColor: 'rgb(64 64 64 / 0.5)'
                    }}
                    {...props}
                >
                    <option value="" disabled>{placeholder}</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
            </div>
        </ResponsiveFormField>
    );
};

// Responsive Textarea Component
export const ResponsiveTextarea = ({
    name,
    value,
    onChange,
    placeholder,
    error,
    hint,
    required = false,
    rows = 4,
    className = '',
    ...props
}) => {
    return (
        <ResponsiveFormField label={name} error={error} hint={hint} required={required}>
            <textarea
                value={value || ''}
                onChange={onChange}
                placeholder={placeholder}
                rows={rows}
                className={`
          w-full px-4 py-3 rounded-xl !text-white placeholder:!text-neutral-500
          !bg-neutral-800/70 !border-neutral-700/50 
          focus:!border-blue-500/50 focus:ring-2 focus:ring-blue-500/20
          transition-all duration-200 resize-none
          ${error ? '!border-red-500/50' : ''}
          ${className}
        `}
                style={{
                    backgroundColor: 'rgb(38 38 38 / 0.7)',
                    color: 'white',
                    borderColor: 'rgb(64 64 64 / 0.5)'
                }}
                {...props}
            />
        </ResponsiveFormField>
    );
};

// Responsive Button Group Component
export const ResponsiveButtonGroup = ({
    children,
    className = '',
    direction = 'row'
}) => {
    return (
        <div className={`
      flex gap-3 ${direction === 'column' ? 'flex-col' : 'flex-col sm:flex-row'}
      sm:justify-end
      ${className}
    `}>
            {children}
        </div>
    );
};

// Responsive Grid Component
export const ResponsiveGrid = ({
    children,
    cols = 1,
    className = ''
}) => {
    const gridClasses = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
    };

    return (
        <div className={`grid ${gridClasses[cols]} gap-4 ${className}`}>
            {children}
        </div>
    );
};

// Utility function to handle null/undefined values
export const getDefaultValue = (value, defaultValue = '') => {
    if (value === null || value === undefined || value === '') {
        return defaultValue;
    }
    return value;
};

// Utility function to format numbers with default
export const formatNumber = (value, defaultValue = 0) => {
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
};

// Utility function to format currency
export const formatCurrency = (value, currency = 'جنيه', defaultValue = '0') => {
    const num = formatNumber(value, 0);
    return `${num.toLocaleString('ar-EG')} ${currency}`;
};

// All components are exported as named exports above
