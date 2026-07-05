/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: '#E5E7EB',
        background: '#FFFFFF',
        foreground: '#111827',
        muted: '#6B7280',
        accent: '#2563EB',
        success: '#16A34A',
        danger: '#DC2626',
        warning: '#D97706',
        'accent-light': '#EFF6FF',
        'hover-bg': '#F9FAFB',
        'active-bg': '#F3F4F6',
      },
      fontFamily: {
        sans: ['Calibri', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px' }],
        xs: ['11px', { lineHeight: '16px' }],
        sm: ['12px', { lineHeight: '18px' }],
        base: ['13px', { lineHeight: '20px' }],
        lg: ['14px', { lineHeight: '22px' }],
        xl: ['16px', { lineHeight: '24px' }],
        '2xl': ['18px', { lineHeight: '28px' }],
        '3xl': ['20px', { lineHeight: '30px' }],
      },
      borderRadius: {
        DEFAULT: '6px',
        sm: '4px',
        md: '6px',
        lg: '8px',
      },
      spacing: {
        '0.5': '2px',
        '1': '4px',
        '1.5': '6px',
        '2': '8px',
        '2.5': '10px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.06)',
        'elevated': '0 2px 8px 0 rgba(0, 0, 0, 0.08)',
        'drawer': '-4px 0 16px 0 rgba(0, 0, 0, 0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 150ms ease-out',
        'slide-in-right': 'slideInRight 200ms ease-out',
        'slide-in-up': 'slideInUp 150ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
