import React from 'react';
import { AlertCircle } from 'lucide-react';

// Unified Design System for Admin Panel
// Following clean design standards with consistent theme colors

// Color Palette
export const ADMIN_COLORS = {
    // Primary colors - Clean Blue
    primary: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#0ea5e9', // Main blue
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c4a6e',
        950: '#082f49'
    },

    // Status colors
    success: {
        50: '#ecfdf5',
        100: '#d1fae5',
        200: '#a7f3d0',
        300: '#6ee7b7',
        400: '#34d399',
        500: '#10b981', // Main green
        600: '#059669',
        700: '#047857',
        800: '#065f46',
        900: '#064e3b',
    },

    warning: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#0ea5e9', // Main blue
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c4a6e',
    },

    danger: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444', // Main red
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
    },

    // Neutral colors (gray scale)
    neutral: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        850: '#1a1f2e', // Custom darker shade
        900: '#111827',
        950: '#0d1117', // Custom darkest shade
    }
};

// Spacing scale
export const SPACING = {
    xs: '0.25rem', // 4px
    sm: '0.5rem',  // 8px
    md: '0.75rem', // 12px
    lg: '1rem',    // 16px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '2rem',   // 32px
    '4xl': '2.5rem', // 40px
    '5xl': '3rem',   // 48px
};

// Border radius scale
export const RADIUS = {
    sm: '0.375rem', // 6px
    md: '0.5rem',   // 8px
    lg: '0.75rem',  // 12px
    xl: '1rem',     // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
};

// Unified Card Component
export const AdminCard = ({
    children,
    className = '',
    variant = 'default',
    padding = 'lg',
    hover = true,
    ...props
}) => {
    const variants = {
        default: 'bg-neutral-850/50 border-neutral-700/50',
        elevated: 'bg-neutral-850/70 border-neutral-700/70 shadow-xl shadow-black/20',
        outline: 'bg-transparent border-neutral-700/50',
        glass: 'bg-neutral-850/30 border-neutral-700/30 backdrop-blur-xl',
    };

    const paddings = {
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-4 md:p-6',
        xl: 'p-6 md:p-8',
    };

    const hoverEffect = hover
        ? 'hover:bg-neutral-850/70 hover:border-neutral-600/50 hover:shadow-xl hover:shadow-black/10'
        : '';

    return (
        <div
            className={`
        relative overflow-hidden rounded-xl md:rounded-2xl border
        backdrop-blur-xl transition-all duration-300
        ${variants[variant]}
        ${paddings[padding]}
        ${hoverEffect}
        ${className}
      `}
            dir="rtl"
            {...props}
        >
            {children}
        </div>
    );
};

// Unified Button Component
export const AdminButton = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    disabled = false,
    loading = false,
    className = '',
    ...props
}) => {
    const variants = {
        primary: `
      bg-primary-500 text-white border-primary-500
      hover:bg-primary-600 hover:border-primary-600
      focus:ring-primary-500/50
    `,
        secondary: `
      bg-neutral-800/50 text-neutral-300 border-neutral-700/50
      hover:bg-neutral-700/50 hover:border-neutral-600/50 hover:text-white
      focus:ring-neutral-500/50
    `,
        success: `
      bg-success-500 text-white border-success-500
      hover:bg-success-600 hover:border-success-600
      focus:ring-success-500/50
    `,
        warning: `
      bg-warning-500 text-white border-warning-500
      hover:bg-warning-600 hover:border-warning-600
      focus:ring-warning-500/50
    `,
        danger: `
      bg-danger-500 text-white border-danger-500
      hover:bg-danger-600 hover:border-danger-600
      focus:ring-danger-500/50
    `,
        ghost: `
      bg-transparent text-neutral-400 border-transparent
      hover:bg-neutral-800/50 hover:text-white hover:border-neutral-700/50
      focus:ring-neutral-500/50
    `,
        outline: `
      bg-transparent text-primary-400 border-primary-500/50
      hover:bg-primary-500/10 hover:border-primary-500 hover:text-primary-300
      focus:ring-primary-500/50
    `,
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
        xl: 'px-8 py-4 text-lg',
    };

    return (
        <button
            className={`
        inline-flex items-center justify-center gap-2 rounded-xl
        border font-medium transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-current
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
            disabled={disabled || loading}
            dir="rtl"
            {...props}
        >
            {loading && (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            {children}
        </button>
    );
};

// Unified Input Component
export const AdminInput = React.forwardRef(({
    label,
    error,
    hint,
    type = 'text',
    size = 'md',
    fullWidth = true,
    className = '',
    ...props
}, ref) => {
    const sizes = {
        sm: 'h-10 px-3 text-sm',
        md: 'h-12 px-4 text-sm',
        lg: 'h-14 px-5 text-base',
    };

    return (
        <div className={`space-y-2 ${fullWidth ? 'w-full' : ''}`}>
            {label && (
                <label className="block text-sm font-medium text-neutral-300">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                type={type}
                className={`
          w-full rounded-xl border backdrop-blur-sm transition-all duration-300
          !bg-neutral-800/70 !text-white placeholder:text-neutral-400
          ${error
                        ? 'border-danger-500/50 focus:border-danger-500 focus:ring-danger-500/20'
                        : 'border-neutral-700/50 focus:border-primary-500/50 focus:ring-primary-500/20'
                    }
          focus:outline-none focus:ring-2
          ${sizes[size]}
          ${type === 'color' ? 'p-1 !bg-transparent' : ''}
          ${className}
        `}
                dir="rtl"
                {...props}
            />
            {hint && !error && (
                <p className="text-xs text-neutral-500">{hint}</p>
            )}
            {error && (
                <div className="flex items-center gap-2 text-danger-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
});

AdminInput.displayName = 'AdminInput';

// Unified Select Component
export const AdminSelect = ({
    label,
    error,
    hint,
    options = [],
    size = 'md',
    fullWidth = true,
    className = '',
    placeholder = 'اختر...',
    ...props
}) => {
    const sizes = {
        sm: 'h-10 px-3 text-sm',
        md: 'h-12 px-4 text-sm',
        lg: 'h-14 px-5 text-base',
    };

    return (
        <div className={`space-y-2 ${fullWidth ? 'w-full' : ''}`}>
            {label && (
                <label className="block text-sm font-medium text-neutral-300">
                    {label}
                </label>
            )}
            <select
                className={`
          w-full rounded-xl border backdrop-blur-sm transition-all duration-300
          !bg-neutral-800/70 !text-white
          ${error
                        ? 'border-danger-500/50 focus:border-danger-500 focus:ring-danger-500/20'
                        : 'border-neutral-700/50 focus:border-primary-500/50 focus:ring-primary-500/20'
                    }
          focus:outline-none focus:ring-2
          ${sizes[size]}
          ${className}
        `}
                dir="rtl"
                {...props}
            >
                <option value="">{placeholder}</option>
                {options.map(({ value, label }) => (
                    <option key={value} value={value}>
                        {label}
                    </option>
                ))}
            </select>
            {hint && !error && (
                <p className="text-xs text-neutral-500">{hint}</p>
            )}
            {error && (
                <div className="flex items-center gap-2 text-danger-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

// Unified Textarea Component
export const AdminTextarea = ({
    label,
    error,
    hint,
    rows = 4,
    fullWidth = true,
    className = '',
    ...props
}) => {
    return (
        <div className={`space-y-2 ${fullWidth ? 'w-full' : ''}`}>
            {label && (
                <label className="block text-sm font-medium text-neutral-300">
                    {label}
                </label>
            )}
            <textarea
                rows={rows}
                className={`
          w-full rounded-xl border backdrop-blur-sm transition-all duration-300 resize-none
          !bg-neutral-800/70 !text-white placeholder:text-neutral-400 p-4
          ${error
                        ? 'border-danger-500/50 focus:border-danger-500 focus:ring-danger-500/20'
                        : 'border-neutral-700/50 focus:border-primary-500/50 focus:ring-primary-500/20'
                    }
          focus:outline-none focus:ring-2
          ${className}
        `}
                dir="rtl"
                {...props}
            />
            {hint && !error && (
                <p className="text-xs text-neutral-500">{hint}</p>
            )}
            {error && (
                <div className="flex items-center gap-2 text-danger-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

// Unified Stat Card Component
export const AdminStatCard = ({ title, value, icon: Icon, color = 'primary', trend, subtitle }) => {
    const colorVariants = {
        primary: {
            bg: 'bg-primary-500/10',
            text: 'text-primary-400',
            border: 'border-primary-500/20',
            iconBg: 'bg-primary-500/20'
        },
        success: {
            bg: 'bg-success-500/10',
            text: 'text-success-400',
            border: 'border-success-500/20',
            iconBg: 'bg-success-500/20'
        },
        warning: {
            bg: 'bg-warning-500/10',
            text: 'text-warning-400',
            border: 'border-warning-500/20',
            iconBg: 'bg-warning-500/20'
        },
        danger: {
            bg: 'bg-danger-500/10',
            text: 'text-danger-400',
            border: 'border-danger-500/20',
            iconBg: 'bg-danger-500/20'
        },
        neutral: {
            bg: 'bg-neutral-500/10',
            text: 'text-neutral-400',
            border: 'border-neutral-500/20',
            iconBg: 'bg-neutral-500/20'
        }
    };

    const colors = colorVariants[color];

    return (
        <AdminCard
            className={`${colors.border} ${colors.bg} hover:shadow-lg hover:shadow-black/20`}
            variant="glass"
            padding="md"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0" dir="rtl">
                    <h3 className="text-xs font-medium text-neutral-400 mb-1 leading-tight truncate">
                        {title}
                    </h3>
                    <div className="flex items-baseline gap-1">
                        <span className={`text-lg font-bold ${colors.text} leading-none`}>
                            {value}
                        </span>
                        {subtitle && (
                            <span className="text-xs text-neutral-500">{subtitle}</span>
                        )}
                    </div>
                    {trend !== undefined && (
                        <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                          ${trend >= 0
                                ? 'bg-success-500/10 border border-success-500/20 text-success-400'
                                : 'bg-danger-500/10 border border-danger-500/20 text-danger-400'
                            }`}>
                            <span>{trend >= 0 ? '↗' : '↘'}</span>
                            <span>{Math.abs(trend).toFixed(1)}%</span>
                        </div>
                    )}
                </div>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors.iconBg} flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${colors.text}`} />
                </div>
            </div>
        </AdminCard>
    );
};

// Unified Modal Component
export const AdminModal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'lg',
    fullScreen = false
}) => {
    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className={`
        relative bg-neutral-900 rounded-xl md:rounded-2xl border border-neutral-700/50
        w-full ${fullScreen ? 'h-full md:max-h-[95vh]' : sizes[size]} 
        overflow-y-auto backdrop-blur-xl
      `}
                dir="rtl"
            >
                {title && (
                    <div className="sticky top-0 bg-neutral-900 border-b border-neutral-800/50 px-4 md:px-6 py-4 flex items-center justify-between">
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-neutral-800/50 rounded-xl transition-colors"
                        >
                            <span className="sr-only">إغلاق</span>
                            ✕
                        </button>
                        <h2 className="text-lg md:text-xl font-bold text-white">
                            {title}
                        </h2>
                    </div>
                )}
                <div className="p-4 md:p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default {
    ADMIN_COLORS,
    SPACING,
    RADIUS,
    AdminCard,
    AdminButton,
    AdminInput,
    AdminSelect,
    AdminTextarea,
    AdminStatCard,
    AdminModal,
};
