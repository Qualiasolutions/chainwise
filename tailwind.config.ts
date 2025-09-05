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
        // Enhanced crypto color palette inspired by landing page
        crypto: {
          // Primary colors from landing page
          primary: '#4f46e5',     // Main Indigo (--color-indigo-600)
          secondary: '#8b5cf6',   // Main Purple (--color-purple-500)
          accent: '#2563eb',      // Tech Blue (--color-blue-600)
          
          // Extended palette
          'primary-light': '#818cf8',  // Lighter Indigo (--color-indigo-400)
          'primary-dark': '#4338ca',   // Darker Indigo (--color-indigo-700)
          'secondary-light': '#a78bfa', // Lighter Purple (--color-purple-400)
          'secondary-dark': '#7c3aed',  // Darker Purple (--color-purple-600)
          'accent-light': '#60a5fa',   // Lighter Blue (--color-blue-400)
          'accent-cyan': '#22d3ee',    // Tech Cyan (--color-cyan-400)
          
          // Utility colors
          success: '#10b981',     // Green-500
          danger: '#ef4444',      // Red-500
          warning: '#f59e0b',     // Yellow-500 (--color-yellow-500)
          dark: '#000000',        // Pure black from landing page
          light: '#ffffff',       // Pure white from landing page
          
          // Gradient backgrounds
          'gradient-1': 'rgba(79, 70, 229, 0.25)',   // Primary with opacity
          'gradient-2': 'rgba(124, 58, 237, 0.25)',  // Purple with opacity
          'gradient-3': 'rgba(37, 99, 235, 0.2)',    // Blue with opacity
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
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'crypto-gradient': 'linear-gradient(135deg, #4f46e5 0%, #8b5cf6 50%, #2563eb 100%)',
        'crypto-mesh': 'radial-gradient(circle at 25% 25%, #4f46e5 0%, transparent 50%), radial-gradient(circle at 75% 75%, #8b5cf6 0%, transparent 50%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem', 
        'base': '17px',  // Landing page base font size
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
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
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config