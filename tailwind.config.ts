import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Unified ChainWise Design System Colors
        chainwise: {
          // Primary Brand Colors - Consistent throughout app
          primary: {
            50: '#eef2ff',
            100: '#e0e7ff', 
            200: '#c7d2fe',
            300: '#a5b4fc',
            400: '#818cf8',
            500: '#6366f1',  // Main brand color
            600: '#4f46e5',  // Primary CTA color
            700: '#4338ca',  // Hover state
            800: '#3730a3',
            900: '#312e81',
            950: '#1e1b4b',
          },
          
          // Secondary Purple Palette
          secondary: {
            50: '#f5f3ff',
            100: '#ede9fe',
            200: '#ddd6fe', 
            300: '#c4b5fd',
            400: '#a78bfa',  // Light accent
            500: '#8b5cf6',  // Main secondary
            600: '#7c3aed',  // Secondary CTA
            700: '#6d28d9',  // Hover state
            800: '#5b21b6',
            900: '#4c1d95',
            950: '#2e1065',
          },
          
          // Accent Blue Palette
          accent: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd', 
            400: '#60a5fa',  // Light blue accent
            500: '#3b82f6',
            600: '#2563eb',  // Main accent color
            700: '#1d4ed8',  // Accent hover
            800: '#1e40af',
            900: '#1e3a8a',
            950: '#172554',
          },
          
          // Semantic Colors
          success: {
            50: '#ecfdf5',
            500: '#10b981',  // Success state
            600: '#059669',  // Success hover
            900: '#064e3b',
          },
          
          error: {
            50: '#fef2f2', 
            500: '#ef4444',  // Error state
            600: '#dc2626',  // Error hover
            900: '#7f1d1d',
          },
          
          warning: {
            50: '#fffbeb',
            500: '#f59e0b',  // Warning state  
            600: '#d97706',  // Warning hover
            900: '#78350f',
          },
          
          // Neutral Grays - Consistent UI elements
          neutral: {
            0: '#ffffff',    // Pure white
            50: '#fafafa',   // Background light
            100: '#f5f5f5',  // Background subtle
            200: '#e5e5e5',  // Border light
            300: '#d4d4d4',  // Border default
            400: '#a3a3a3',  // Text muted
            500: '#737373',  // Text secondary
            600: '#525252',  // Text primary
            700: '#404040',  // Text strong
            800: '#262626',  // Text emphasis
            900: '#171717',  // Text maximum
            950: '#0a0a0a',  // Pure black (rare usage)
          },
        },
        
        // shadcn/ui compatible colors
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
      },
      animation: {
        // Existing animations
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        
        // New animations from landing page
        'background-pulse-1': 'backgroundPulse1 12s infinite ease-in-out',
        'background-pulse-2': 'backgroundPulse2 14s infinite ease-in-out alternate',
        'moving-grid': 'movingGrid 20s linear infinite',
        'scale-up': 'scaleUp 0.3s ease-out',
        'float': 'float 6s ease-in-out infinite',
        
        // UI animations
        'slide-in-from-top': 'slideInFromTop 0.3s ease-out',
        'slide-in-from-right': 'slideInFromRight 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 2s infinite',
        
        // Spotlight animation
        'spotlight': 'spotlight 2s ease .75s 1 forwards',
        
        // Aceternity animations
        'move-border': 'move-border 4s linear infinite',
        'background-position-spin': 'background-position-spin 3000ms infinite alternate',
        'sparkles': 'sparkles 3s ease-in-out infinite',
        'beam': 'beam 2s ease-in-out infinite alternate',
        'meteor': 'meteor 5s linear infinite',
        
        // Premium glass-morphism animations
        'spin-slow': 'spin 8s linear infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite alternate',
        'glass-float': 'glass-float 4s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
      },
      keyframes: {
        // Existing keyframes
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        
        // Landing page inspired keyframes
        backgroundPulse1: {
          '0%, 100%': { opacity: '0.25' },
          '50%': { opacity: '0.35' },
        },
        backgroundPulse2: {
          '0%, 100%': { opacity: '0.15' },
          '50%': { opacity: '0.25' },
        },
        movingGrid: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '100px 100px' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.85)', opacity: '0.5' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideInFromTop: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInFromRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        spotlight: {
          '0%': { opacity: '0', transform: 'translate(-72%, -62%) scale(0.5)' },
          '100%': { opacity: '1', transform: 'translate(-50%, -40%) scale(1)' },
        },
        // Aceternity keyframes
        'move-border': {
          '0%': { transform: 'translate(0, 0) rotate(0deg)' },
          '100%': { transform: 'translate(100%, 100%) rotate(360deg)' },
        },
        'background-position-spin': {
          '0%': { backgroundPosition: 'top center' },
          '100%': { backgroundPosition: 'bottom center' },
        },
        sparkles: {
          '0%, 100%': { opacity: '0', transform: 'scale(0.5)' },
          '50%': { opacity: '1', transform: 'scale(1)' },
        },
        beam: {
          '0%': { transform: 'translateX(-100%) skewX(-45deg)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateX(100%) skewX(-45deg)', opacity: '0' },
        },
        meteor: {
          '0%': { transform: 'rotate(315deg) translateX(0)', opacity: '1' },
          '70%': { opacity: '1' },
          '100%': { transform: 'rotate(315deg) translateX(-500px)', opacity: '0' },
        },
        // Premium glass-morphism keyframes
        'glow-pulse': {
          '0%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(139, 92, 246, 0.6), 0 0 60px rgba(139, 92, 246, 0.3)' },
        },
        'glass-float': {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%': { transform: 'translateY(-8px) scale(1.02)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'crypto-gradient': 'linear-gradient(135deg, #4f46e5 0%, #8b5cf6 50%, #2563eb 100%)',
        'crypto-mesh': 'radial-gradient(circle at 25% 25%, #4f46e5 0%, transparent 50%), radial-gradient(circle at 75% 75%, #8b5cf6 0%, transparent 50%)',
        'chainwise-gradient': 'linear-gradient(135deg, #4f46e5 0%, #8b5cf6 50%, #2563eb 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Unified Typography Scale - Mobile-First & Accessible
        'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],     // 16px - WCAG baseline
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
        '5xl': ['3rem', { lineHeight: '1.15' }],        // 48px - Display
        '6xl': ['3.75rem', { lineHeight: '1.15' }],     // 60px - Hero
        '7xl': ['4.5rem', { lineHeight: '1.15' }],      // 72px - Hero Large
      },
      
      screens: {
        // Mobile-First Responsive Strategy
        'xs': '475px',   // Small phones
        'sm': '640px',   // Large phones  
        'md': '768px',   // Tablets
        'lg': '1024px',  // Laptops
        'xl': '1280px',  // Desktops
        '2xl': '1536px', // Large desktops
        
        // Custom utility breakpoints
        'mobile': {'max': '767px'}, // Mobile-only styles
        'tablet': {'min': '768px', 'max': '1023px'}, // Tablet-only
        'desktop': {'min': '1024px'}, // Desktop and up
      },
      borderRadius: {
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'crypto': '0 4px 6px -1px rgba(79, 70, 229, 0.1), 0 2px 4px -1px rgba(79, 70, 229, 0.06)',
        'crypto-lg': '0 10px 15px -3px rgba(79, 70, 229, 0.1), 0 4px 6px -2px rgba(79, 70, 229, 0.05)',
        'glow': '0 0 20px rgba(79, 70, 229, 0.3)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.3)',
        'brand': '0 4px 6px -1px rgba(79, 70, 229, 0.1), 0 2px 4px -1px rgba(79, 70, 229, 0.06)',
        'brand-lg': '0 10px 15px -3px rgba(79, 70, 229, 0.1), 0 4px 6px -2px rgba(79, 70, 229, 0.05)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config