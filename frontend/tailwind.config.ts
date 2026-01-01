import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ========================================
      // COLORS - Extracted from Figma (Dec 2025)
      // ========================================
      colors: {
        // shadcn/ui semantic colors (CSS variables)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        // ===== Tasktrox Gray Palette =====
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },

        // ===== Page & Surface Colors =====
        page: '#FAFCFE',
        body: '#2E3744',

        // ===== Label/Tag Colors (from Figma) =====
        label: {
          purple: {
            bg: '#F5F3FF',
            text: '#4C1D95',
            border: '#DDD6FE',
          },
          green: {
            bg: '#ECFDF5',
            text: '#064E3B',
            border: '#A7F3D0',
          },
          yellow: {
            bg: '#FFFBEB',
            text: '#78350F',
            border: '#FDE68A',
          },
          blue: {
            bg: '#EFF6FF',
            text: '#3B82F6',
            border: '#BFDBFE',
          },
          pink: {
            bg: '#FDF2F8',
            text: '#831843',
            border: '#FBCFE8',
          },
          red: {
            bg: '#FEF2F2',
            text: '#991B1B',
            border: '#FECACA',
          },
        },

        // ===== Status Colors =====
        success: {
          DEFAULT: '#10B981',
          light: '#ECFDF5',
          dark: '#064E3B',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FFFBEB',
          dark: '#78350F',
        },
        error: {
          DEFAULT: '#EF4444',
          light: '#FEF2F2',
          dark: '#991B1B',
        },
        info: {
          DEFAULT: '#3B82F6',
          light: '#EFF6FF',
          dark: '#1E40AF',
        },

        // ===== Priority Colors =====
        priority: {
          high: {
            bg: '#FEE2E2',
            text: '#991B1B',
          },
          medium: {
            bg: '#FEF3C7',
            text: '#92400E',
          },
          low: {
            bg: '#D1FAE5',
            text: '#065F46',
          },
        },

        // ===== Column Header Colors =====
        column: {
          todo: '#1F2937',
          'in-progress': '#F59E0B',
          'in-review': '#8B5CF6',
          completed: '#10B981',
        },

        // ===== Sidebar Colors =====
        sidebar: {
          bg: '#FFFFFF',
          hover: '#F0F0F0',
          active: '#F0F0F0',
          border: '#F3F4F6',
        },
      },

      // ========================================
      // TYPOGRAPHY - Haffer Font
      // ========================================
      fontFamily: {
        sans: ['var(--font-haffer)', 'system-ui', '-apple-system', 'sans-serif'],
      },

      fontSize: {
        // Normalized from Figma (scale factor 1.197)
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }], // 10px - tiny metadata
        xs: ['0.75rem', { lineHeight: '1rem' }], // 12px - labels, timestamps
        sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px - body text
        base: ['1rem', { lineHeight: '1.5rem' }], // 16px - headings
        lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px - section titles
        xl: ['1.25rem', { lineHeight: '1.75rem' }], // 20px - page titles
        '2xl': ['1.5rem', { lineHeight: '2rem' }], // 24px - large titles
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px - hero text
      },

      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },

      // ========================================
      // SPACING - 4px Base Unit (Figma normalized)
      // ========================================
      spacing: {
        '4.5': '1.125rem', // 18px
        '13': '3.25rem', // 52px
        '15': '3.75rem', // 60px
        '18': '4.5rem', // 72px
        '22': '5.5rem', // 88px
      },

      // ========================================
      // BORDER RADIUS - Normalized from Figma
      // ========================================
      borderRadius: {
        lg: 'var(--radius)', // 12px - cards
        md: 'calc(var(--radius) - 2px)', // 10px
        sm: 'calc(var(--radius) - 4px)', // 8px - buttons
        xs: '4px', // tags
        card: '12px',
        button: '8px',
        input: '6px',
        badge: '6px',
        tag: '4px',
        avatar: '9999px',
      },

      // ========================================
      // SHADOWS - Figma extracted
      // ========================================
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'card-hover':
          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        dropdown:
          '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        modal: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        sidebar: '1px 0 0 0 #F3F4F6',
        'pricing-pro': '0px 64px 60px 0px rgba(170, 105, 255, 0.25)',
      },

      // ========================================
      // LAYOUT WIDTHS
      // ========================================
      width: {
        sidebar: '240px',
        'sidebar-collapsed': '64px',
        'column-min': '280px',
        'column-max': '320px',
      },

      maxWidth: {
        'task-card': '320px',
      },

      minWidth: {
        'task-card': '280px',
      },

      // ========================================
      // KEYFRAMES & ANIMATIONS
      // ========================================
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-out': {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        'slide-up': {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          from: { transform: 'translateY(-10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'slide-out-right': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(100%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-out': 'fade-out 0.2s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-out-right': 'slide-out-right 0.3s ease-out',
        shimmer: 'shimmer 2s linear infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },

      // ========================================
      // TRANSITIONS
      // ========================================
      transitionDuration: {
        DEFAULT: '200ms',
        fast: '150ms',
        slow: '300ms',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
