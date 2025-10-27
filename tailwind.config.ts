import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Stripe-inspired Design System
        primary: {
          DEFAULT: '#635BFF',
          hover: '#5851E8',
          active: '#4F47CC',
        },
        secondary: {
          DEFAULT: '#0A2540',
        },
        background: {
          DEFAULT: '#F7F9FC',
          surface: '#FFFFFF',
        },
        border: {
          DEFAULT: '#E3E8EF',
          light: '#F0F4F8',
        },
        text: {
          primary: '#0A2540',
          secondary: '#425466',
          muted: '#697386',
        },
        success: '#00D924',
        warning: '#FFC043',
        error: '#DF1642',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
        '3xl': '48px',
        '4xl': '64px',
      },
      fontSize: {
        'heading-1': ['32px', { lineHeight: '1.3', fontWeight: '600' }],
        'heading-2': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'heading-3': ['18px', { lineHeight: '1.3', fontWeight: '600' }],
        'body-large': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        body: ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-small': ['13px', { lineHeight: '1.5', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '1.5', fontWeight: '400' }],
        label: ['12px', { lineHeight: '1.5', fontWeight: '600', letterSpacing: '0.5px' }],
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(10, 37, 64, 0.1), 0 4px 12px rgba(10, 37, 64, 0.06)',
        'hover': '0 4px 12px rgba(10, 37, 64, 0.08)',
        'elevated': '0 4px 16px rgba(10, 37, 64, 0.12)',
        'modal': '0 8px 32px rgba(10, 37, 64, 0.16)',
        'floating': '0 4px 16px rgba(10, 37, 64, 0.2)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
      },
      borderRadius: {
        DEFAULT: '6px',
        lg: '8px',
        xl: '12px',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};

export default config;

