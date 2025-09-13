"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Enhanced3DCard } from "./enhanced-3d-card"

interface ModernChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  title?: string
  description?: string
  isLoading?: boolean
  error?: string | null
  height?: string | number
  variant?: "default" | "premium" | "subtle"
  showGridlines?: boolean
  glowIntensity?: "low" | "medium" | "high"
}

const ModernChartContainer = React.forwardRef<HTMLDivElement, ModernChartContainerProps>(
  ({ 
    className, 
    children, 
    title,
    description,
    isLoading = false,
    error = null,
    height = "300px",
    variant = "default",
    showGridlines = true,
    glowIntensity = "medium",
    ...props 
  }, ref) => {

    const glowColors = {
      low: "rgba(139,92,246,0.2)",
      medium: "rgba(139,92,246,0.4)", 
      high: "rgba(139,92,246,0.6)"
    }

    const containerVariants = {
      initial: { opacity: 0 },
      animate: { 
        opacity: 1,
        transition: {
          duration: 0.6,
          staggerChildren: 0.1
        }
      }
    }

    const headerVariants = {
      initial: { opacity: 0, y: -10 },
      animate: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
      }
    }

    const chartVariants = {
      initial: { opacity: 0, scale: 0.95 },
      animate: { 
        opacity: 1, 
        scale: 1,
        transition: { 
          duration: 0.6, 
          ease: [0.16, 1, 0.3, 1],
          delay: 0.2
        }
      }
    }

    if (error) {
      return (
        <Enhanced3DCard 
          variant="subtle" 
          className={cn("p-6", className)}
          glowColor="rgba(239,68,68,0.3)"
        >
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Chart Error</h3>
            <p className="text-sm text-gray-300">{error}</p>
          </div>
        </Enhanced3DCard>
      )
    }

    return (
      <Enhanced3DCard 
        ref={ref}
        variant={variant}
        glowColor={glowColors[glowIntensity]}
        className={cn("overflow-hidden", className)}
        {...props}
      >
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="h-full flex flex-col"
        >
          {/* Header */}
          {(title || description) && (
            <motion.div 
              variants={headerVariants}
              className="px-6 pt-6 pb-4 border-b border-white/10"
            >
              {title && (
                <h3 className="text-lg font-semibold text-white mb-1">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-sm text-gray-300">
                  {description}
                </p>
              )}
            </motion.div>
          )}

          {/* Chart Content */}
          <motion.div 
            variants={chartVariants}
            className="flex-1 p-6 relative"
            style={{ minHeight: typeof height === 'string' ? height : `${height}px` }}
          >
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                  <motion.div
                    className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="text-sm text-gray-300">Loading chart...</span>
                </div>
              </div>
            ) : (
              <>
                {/* Gridlines overlay */}
                {showGridlines && (
                  <div className="absolute inset-0 pointer-events-none opacity-20">
                    <svg className="w-full h-full">
                      <defs>
                        <pattern
                          id="grid-pattern"
                          width="40"
                          height="40"
                          patternUnits="userSpaceOnUse"
                        >
                          <path
                            d="M 40 0 L 0 0 0 40"
                            fill="none"
                            stroke="rgba(139,92,246,0.3)"
                            strokeWidth="1"
                          />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                    </svg>
                  </div>
                )}

                {/* Chart content */}
                <div className="relative z-10 h-full">
                  {children}
                </div>

                {/* Ambient glow for active charts */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.3, 0] }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 1
                  }}
                  style={{
                    background: `radial-gradient(ellipse at center, ${glowColors[glowIntensity]} 0%, transparent 70%)`
                  }}
                />
              </>
            )}
          </motion.div>
        </motion.div>
      </Enhanced3DCard>
    )
  }
)

ModernChartContainer.displayName = "ModernChartContainer"

export { ModernChartContainer }