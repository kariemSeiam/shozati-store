/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './index.html'
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      colors: {
        // Primary Colors - Modern Creative Purple-Blue (40% of elements)
        primary: {
          50: '#f0f4ff',   // Very light purple-blue
          100: '#e0e7ff',  // Light purple-blue
          200: '#c7d2fe',  // Soft purple-blue
          300: '#a5b4fc',  // Medium light purple-blue
          400: '#818cf8',  // Medium purple-blue
          500: '#6366f1',  // Main brand indigo
          600: '#4f46e5',  // Darker indigo
          700: '#4338ca',  // Dark indigo
          800: '#3730a3',  // Very dark indigo
          900: '#312e81',  // Deep indigo
          950: '#1e1b4b'   // Darkest indigo
        },
        
        // Secondary Colors - Modern Teal-Cyan (30% of elements)
        secondary: {
          50: '#f0fdfa',   // Very light teal
          100: '#ccfbf1',  // Light teal
          200: '#99f6e4',  // Soft teal
          300: '#5eead4',  // Medium light teal
          400: '#2dd4bf',  // Medium teal
          500: '#14b8a6',  // Main teal
          600: '#0d9488',  // Darker teal
          700: '#0f766e',  // Dark teal
          800: '#115e59',  // Very dark teal
          900: '#134e4a',  // Deep teal
          950: '#042f2e'   // Darkest teal
        },
        
        // Success Colors - Clean Green (replacing emerald-*)
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // Main success green
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16'
        },
        
        // Warning Colors - Warm Amber
        warning: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407'
        },
        
        // Error Colors - Clean Red
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a'
        },
        
        // Neutral Colors - Modern Dark Theme (20% of elements)
        neutral: {
          50: '#fafafa',   // Pure white
          100: '#f5f5f5',  // Very light gray
          200: '#e5e5e5',  // Light gray
          300: '#d4d4d4',  // Medium light gray
          400: '#a3a3a3',  // Medium gray
          500: '#737373',  // Main gray
          600: '#525252',  // Darker gray
          700: '#404040',  // Dark gray
          800: '#262626',  // Very dark gray
          900: '#171717',  // Deep dark gray
          950: '#0a0a0a'   // Darkest gray
        },
        
        // Background Colors - Modern Dark Theme
        background: {
          DEFAULT: '#0a0a0a',    // Pure black
          secondary: '#171717',  // Very dark gray
          tertiary: '#262626',   // Dark gray
          muted: '#404040'       // Medium dark gray
        },
        
        // Accent Colors - Complementary (10% of elements)
        accent: {
          50: '#fef3c7',   // Light amber
          100: '#fde68a',  // Soft amber
          200: '#fcd34d',  // Medium amber
          300: '#fbbf24',  // Amber
          400: '#f59e0b',  // Dark amber
          500: '#d97706',  // Main amber
          600: '#b45309',  // Darker amber
          700: '#92400e',  // Dark amber
          800: '#78350f',  // Very dark amber
          900: '#451a03',  // Deep amber
          950: '#292524'   // Darkest amber
        },
        
        // Surface Colors for cards and components - Dark Theme
        surface: {
          DEFAULT: '#171717',     // Dark gray
          elevated: '#262626',    // Darker gray
          hover: '#404040',       // Medium dark gray
          border: '#525252',      // Medium gray
          'border-hover': '#737373' // Light gray
        },
        
        // Text Colors with perfect contrast - Dark Theme
        text: {
          primary: '#ffffff',     // Pure white
          secondary: '#f5f5f5',   // Very light gray
          tertiary: '#d4d4d4',    // Light gray
          muted: '#a3a3a3',       // Medium gray
          disabled: '#737373',    // Dark gray
          inverse: '#0a0a0a'      // Black
        }
      },
      
      // Enhanced Typography
      fontFamily: {
        cairo: ['Cairo Play', 'sans-serif'],
        display: ['Cairo Play', 'sans-serif'],
        body: ['Cairo Play', 'sans-serif'],
        sans: ['Cairo Play', 'sans-serif']
      },
      
      // Modern Spacing Scale
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem'
      },
      
      // Clean Shadow System
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'floating': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'glow-primary': '0 0 20px rgba(14, 165, 233, 0.15)',
        'glow-primary-light': '0 0 20px rgba(56, 189, 248, 0.15)'
      },
      
      // Modern Border Radius
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem'
      },
      
      // Enhanced Animations
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-in-out',
        'slide-down': 'slideDown 0.3s ease-in-out',
        'scale-in': 'scaleIn 0.2s ease-in-out',
        'bounce-subtle': 'bounceSubtle 2s infinite',
        'pulse-soft': 'pulseSoft 2s infinite',
        'shimmer': 'shimmer 2s infinite'
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' }
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' }
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' }
        }
      },
      
      // Clean Gradient System - Modern Dark Theme
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        'gradient-primary-light': 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
        'gradient-surface': 'linear-gradient(135deg, #171717 0%, #262626 100%)',
        'gradient-overlay': 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(79, 70, 229, 0.05) 100%)',
        'gradient-accent': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0a0a0a 0%, #171717 100%)',
        'gradient-card': 'linear-gradient(135deg, #262626 0%, #404040 100%)',
        'shimmer-gradient': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}