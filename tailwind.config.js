/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'bg-[#FAFAFA]',
        card: 'bg-white',
        cardHover: 'bg-gray-50',
        accent: 'from-blue-500 to-blue-600',
        accentSolid: 'bg-blue-500',
        text: 'text-gray-900',
        textSecondary: 'text-gray-600',
        border: 'border-gray-100',
        shadow: 'shadow-sm'
      },
      fontFamily: {
        tajawal: ['Tajawal', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}