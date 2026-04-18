import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    borderRadius: {
      none: '0px',
      sm: '2px',
      DEFAULT: '4px',
      md: '6px',
      lg: '8px',
      xl: '10px',
      '2xl': '12px',
      '3xl': '14px',
      '4xl': '16px',
      '5xl': '20px',
      full: '9999px',
    },
    extend: {
      fontFamily: {
        display: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        paper: {
          50: '#ffffff',
          100: '#fdfbf5',
          200: '#f8f2e4',
          300: '#f1e6cf',
          400: '#e8d7b4',
        },
        canvas: '#fbf6ee',
        ink: {
          DEFAULT: '#1a2e22',
          soft: '#2f4236',
          muted: '#55665a',
          faint: '#8a9890',
        },
        sage: {
          50: '#eef5ee',
          100: '#d6e7d5',
          200: '#afd0b3',
          300: '#7fae87',
          400: '#4e8e6b',
          500: '#2c6a4e',
          600: '#1f4934',
          700: '#17382b',
          800: '#102a20',
          900: '#0b1f17',
        },
        amber: {
          50: '#fdf7e7',
          100: '#fbecc4',
          200: '#f4d98a',
          300: '#e9b96b',
          400: '#d9a24d',
          500: '#b88237',
        },
        rose: {
          soft: '#f3d1d9',
          DEFAULT: '#e0a3b2',
          deep: '#b86c7c',
        },
        forest: {
          50: '#fffaf0',
          100: '#d6e7d5',
          200: '#afd0b3',
          300: '#7fae87',
          400: '#4e8e6b',
          500: '#2c6a4e',
          600: '#1f4934',
          700: '#17382b',
          800: '#102a20',
          900: '#0b1f17',
          950: '#081610',
        },
        'amber-glow': '#f4d98a',
        'plum-soft': '#c9bddf',
      },
      boxShadow: {
        paper: '0 1px 2px rgba(15, 23, 42, 0.05), 0 12px 24px -18px rgba(15, 23, 42, 0.18)',
        soft: '0 1px 2px rgba(15, 23, 42, 0.06), 0 8px 18px -14px rgba(15, 23, 42, 0.2)',
        warm: '0 12px 28px -18px rgba(217, 162, 77, 0.26)',
        glow: '0 0 30px -12px rgba(233, 185, 107, 0.28)',
        card: '0 1px 2px rgba(15, 23, 42, 0.06), 0 18px 32px -22px rgba(15, 23, 42, 0.2)',
        ring: '0 0 0 1px rgba(26, 46, 34, 0.06)',
        glowGreen: '0 10px 24px -16px rgba(127, 174, 135, 0.42)',
      },
      backgroundImage: {
        'canvas-gradient':
          'radial-gradient(ellipse at top, #fffaf0 0%, #fbf6ee 45%, #f4ecd9 100%)',
        'morning':
          'linear-gradient(180deg, #fffaf0 0%, #fbf6ee 60%, #f1e6cf 100%)',
        'forest-light':
          'linear-gradient(180deg, #eaf1eb 0%, #d6e7d5 100%)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        float: 'float 5s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
