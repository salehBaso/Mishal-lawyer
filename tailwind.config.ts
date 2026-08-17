import type { Config } from 'tailwindcss';

/**
 * Design System — شركة مشعل الجهني للمحاماة والاستشارات
 * فلسفة الألوان: فحمي / عاجي / ذهبي هادئ / رمادي راقٍ — بدون ألوان صاخبة.
 * كل الألوان معرّفة كـ design tokens حتى يسهل تبديل الهوية لاحقًا (multi-tenant theming).
 */
const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        charcoal: {
          950: '#0B0C0E',
          900: '#121316',
          800: '#1B1D21',
          700: '#26282D',
          600: '#34373E',
          500: '#4A4E57',
        },
        ivory: {
          50: '#FFFFFF',
          100: '#FBF9F5',
          200: '#F6F2EA',
          300: '#EFE9DC',
        },
        gold: {
          400: '#C9A24B',
          500: '#B4923F',
          600: '#96772F',
          700: '#7A5F26',
        },
        neutral: {
          50: '#F7F7F6',
          100: '#EFEFED',
          200: '#DFDFDC',
          300: '#C7C7C2',
          400: '#A3A29B',
          500: '#7E7D75',
          600: '#5E5D57',
          700: '#454440',
          800: '#2E2D2A',
          900: '#1C1B19',
        },
        success: '#3F6B4C',
        warning: '#A5761F',
        danger: '#8C3B34',
        info: '#39566B',
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
      },
      fontFamily: {
        arabic: ['var(--font-arabic)', 'Tahoma', 'sans-serif'],
        display: ['var(--font-arabic-display)', 'Tahoma', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '10px',
        lg: '16px',
        xl: '22px',
      },
      boxShadow: {
        subtle: '0 1px 2px rgba(11,12,14,0.04), 0 1px 1px rgba(11,12,14,0.03)',
        card: '0 4px 16px rgba(11,12,14,0.06), 0 1px 3px rgba(11,12,14,0.04)',
        elevated: '0 12px 32px rgba(11,12,14,0.14)',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [require('tailwindcss-rtl')],
};

export default config;
