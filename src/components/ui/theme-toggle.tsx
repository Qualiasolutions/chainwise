'use client'

import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'button' | 'switch'
}

export function ThemeToggle({ className, size = 'md', variant = 'button' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6'
  }

  if (variant === 'switch') {
    return (
      <motion.button
        onClick={toggleTheme}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-chainwise-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800",
          theme === 'dark' 
            ? "bg-chainwise-primary-600" 
            : "bg-chainwise-neutral-300",
          className
        )}
        whileTap={{ scale: 0.95 }}
      >
        <span className="sr-only">Toggle theme</span>
        <motion.div
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition-transform flex items-center justify-center",
            theme === 'dark' ? "translate-x-6" : "translate-x-1"
          )}
          layout
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        >
          <motion.div
            key={theme}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.2 }}
          >
            {theme === 'dark' ? (
              <Moon className="w-2.5 h-2.5 text-chainwise-primary-600" />
            ) : (
              <Sun className="w-2.5 h-2.5 text-chainwise-warning-500" />
            )}
          </motion.div>
        </motion.div>
      </motion.button>
    )
  }

  return (
    <motion.button
      onClick={toggleTheme}
      className={cn(
        "relative rounded-xl border border-chainwise-neutral-300/20 backdrop-blur-xl transition-all duration-300 flex items-center justify-center group overflow-hidden",
        sizeClasses[size],
        theme === 'dark'
          ? "bg-gradient-to-br from-chainwise-neutral-800/40 to-chainwise-neutral-900/40 text-chainwise-warning-400 hover:bg-chainwise-neutral-700/50"
          : "bg-gradient-to-br from-white/80 to-chainwise-neutral-50/80 text-chainwise-primary-600 hover:bg-white/90",
        "hover:scale-105 hover:shadow-lg hover:border-chainwise-primary-400/30",
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {/* Background Glow Effect */}
      <motion.div
        className={cn(
          "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          theme === 'dark'
            ? "bg-gradient-to-br from-chainwise-warning-500/10 to-chainwise-warning-600/10"
            : "bg-gradient-to-br from-chainwise-primary-500/10 to-chainwise-primary-600/10"
        )}
      />

      {/* Icon Container */}
      <motion.div
        key={theme}
        initial={{ rotate: -90, scale: 0 }}
        animate={{ rotate: 0, scale: 1 }}
        exit={{ rotate: 90, scale: 0 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20
        }}
        className="relative z-10"
      >
        {theme === 'dark' ? (
          <Sun className={cn(iconSizes[size], "drop-shadow-sm")} />
        ) : (
          <Moon className={cn(iconSizes[size], "drop-shadow-sm")} />
        )}
      </motion.div>

      {/* Shimmer Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
        style={{ width: '200%' }}
      />
    </motion.button>
  )
}

// Compact version for mobile/tight spaces
export function CompactThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <motion.button
      onClick={toggleTheme}
      className={cn(
        "p-2 rounded-lg transition-colors",
        theme === 'dark'
          ? "text-chainwise-warning-400 hover:bg-chainwise-neutral-800/50"
          : "text-chainwise-primary-600 hover:bg-chainwise-neutral-100/50",
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -180, scale: 0 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {theme === 'dark' ? (
          <Sun className="w-4 h-4" />
        ) : (
          <Moon className="w-4 h-4" />
        )}
      </motion.div>
    </motion.button>
  )
}
