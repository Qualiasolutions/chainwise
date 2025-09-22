"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Loader2, Bitcoin, TrendingUp, Zap } from "lucide-react"

interface AnimatedLoaderProps {
  className?: string
  variant?: "spinner" | "dots" | "pulse" | "bars" | "crypto" | "orbit" | "wave" | "gradient"
  size?: "sm" | "md" | "lg" | "xl"
  speed?: "slow" | "normal" | "fast"
  color?: "primary" | "secondary" | "accent" | "muted"
}

const sizeMap = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12"
}

const speedMap = {
  slow: 2,
  normal: 1.5,
  fast: 1
}

const colorMap = {
  primary: "text-primary",
  secondary: "text-secondary",
  accent: "text-accent",
  muted: "text-muted-foreground"
}

export function AnimatedLoader({
  className,
  variant = "spinner",
  size = "md",
  speed = "normal",
  color = "primary",
  ...props
}: AnimatedLoaderProps) {
  const duration = speedMap[speed]
  const sizeClass = sizeMap[size]
  const colorClass = colorMap[color]

  switch (variant) {
    case "spinner":
      return (
        <motion.div
          className={cn(sizeClass, colorClass, className)}
          animate={{ rotate: 360 }}
          transition={{
            duration,
            repeat: Infinity,
            ease: "linear"
          }}
          {...props}
        >
          <Loader2 className="w-full h-full" />
        </motion.div>
      )

    case "dots":
      return (
        <div className={cn("flex space-x-1", className)} {...props}>
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              className={cn(
                "rounded-full bg-current",
                size === "sm" ? "w-1.5 h-1.5" :
                size === "md" ? "w-2 h-2" :
                size === "lg" ? "w-3 h-3" : "w-4 h-4",
                colorClass
              )}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: duration * 0.8,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      )

    case "pulse":
      return (
        <motion.div
          className={cn(
            "rounded-full bg-current",
            sizeClass,
            colorClass,
            className
          )}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: duration,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          {...props}
        />
      )

    case "bars":
      return (
        <div className={cn("flex items-end space-x-0.5", className)} {...props}>
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              className={cn(
                "bg-current rounded-sm",
                size === "sm" ? "w-0.5" :
                size === "md" ? "w-1" :
                size === "lg" ? "w-1.5" : "w-2",
                colorClass
              )}
              animate={{
                height: [
                  size === "sm" ? "4px" :
                  size === "md" ? "8px" :
                  size === "lg" ? "12px" : "16px",
                  size === "sm" ? "16px" :
                  size === "md" ? "24px" :
                  size === "lg" ? "32px" : "48px",
                  size === "sm" ? "4px" :
                  size === "md" ? "8px" :
                  size === "lg" ? "12px" : "16px"
                ]
              }}
              transition={{
                duration: duration * 0.6,
                repeat: Infinity,
                delay: i * 0.1
              }}
            />
          ))}
        </div>
      )

    case "crypto":
      return (
        <div className={cn("relative", sizeClass, className)} {...props}>
          {/* Rotating outer ring */}
          <motion.div
            className={cn(
              "absolute inset-0 border-2 border-transparent border-t-current rounded-full",
              colorClass
            )}
            animate={{ rotate: 360 }}
            transition={{
              duration: duration,
              repeat: Infinity,
              ease: "linear"
            }}
          />

          {/* Bitcoin icon in center */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: duration * 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Bitcoin className={cn("w-1/2 h-1/2", colorClass)} />
          </motion.div>
        </div>
      )

    case "orbit":
      return (
        <div className={cn("relative", sizeClass, className)} {...props}>
          {/* Central dot */}
          <div className={cn(
            "absolute inset-0 flex items-center justify-center"
          )}>
            <div className={cn(
              "rounded-full bg-current",
              size === "sm" ? "w-1 h-1" :
              size === "md" ? "w-1.5 h-1.5" :
              size === "lg" ? "w-2 h-2" : "w-3 h-3",
              colorClass
            )} />
          </div>

          {/* Orbiting dots */}
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{
                duration: duration * (1 + i * 0.5),
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <div className={cn(
                "absolute rounded-full bg-current",
                size === "sm" ? "w-0.5 h-0.5 top-0 left-1/2 -translate-x-1/2" :
                size === "md" ? "w-1 h-1 top-0 left-1/2 -translate-x-1/2" :
                size === "lg" ? "w-1.5 h-1.5 top-0 left-1/2 -translate-x-1/2" :
                "w-2 h-2 top-0 left-1/2 -translate-x-1/2",
                colorClass
              )} />
            </motion.div>
          ))}
        </div>
      )

    case "wave":
      return (
        <div className={cn("flex items-center space-x-0.5", className)} {...props}>
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className={cn(
                "bg-current rounded-full",
                size === "sm" ? "w-0.5 h-8" :
                size === "md" ? "w-1 h-12" :
                size === "lg" ? "w-1.5 h-16" : "w-2 h-20",
                colorClass
              )}
              animate={{
                scaleY: [0.3, 1, 0.3]
              }}
              transition={{
                duration: duration,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )

    case "gradient":
      return (
        <motion.div
          className={cn(
            "rounded-full relative overflow-hidden",
            sizeClass,
            className
          )}
          {...props}
        >
          {/* Background circle */}
          <div className="absolute inset-0 bg-muted/30 rounded-full" />

          {/* Animated gradient */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-current to-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              duration: duration,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              background: `conic-gradient(from 0deg, transparent, ${
                color === "primary" ? "hsl(var(--primary))" :
                color === "secondary" ? "hsl(var(--secondary))" :
                color === "accent" ? "hsl(var(--accent))" :
                "hsl(var(--muted-foreground))"
              }, transparent)`
            }}
          />
        </motion.div>
      )

    default:
      return (
        <motion.div
          className={cn(sizeClass, colorClass, className)}
          animate={{ rotate: 360 }}
          transition={{
            duration,
            repeat: Infinity,
            ease: "linear"
          }}
          {...props}
        >
          <Loader2 className="w-full h-full" />
        </motion.div>
      )
  }
}

// Loading overlay component for full-screen loading
interface LoadingOverlayProps {
  isLoading: boolean
  variant?: AnimatedLoaderProps["variant"]
  size?: AnimatedLoaderProps["size"]
  message?: string
  className?: string
}

export function LoadingOverlay({
  isLoading,
  variant = "crypto",
  size = "lg",
  message = "Loading...",
  className
}: LoadingOverlayProps) {
  if (!isLoading) return null

  return (
    <motion.div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        "bg-background/80 backdrop-blur-sm",
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex flex-col items-center space-y-4">
        <AnimatedLoader variant={variant} size={size} />
        {message && (
          <motion.p
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {message}
          </motion.p>
        )}
      </div>
    </motion.div>
  )
}

// Loading button state
interface LoadingButtonProps {
  isLoading: boolean
  children: React.ReactNode
  loadingText?: string
  variant?: AnimatedLoaderProps["variant"]
  className?: string
}

export function LoadingButton({
  isLoading,
  children,
  loadingText = "Loading...",
  variant = "spinner",
  className,
  ...props
}: LoadingButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading && <AnimatedLoader variant={variant} size="sm" />}
      {isLoading ? loadingText : children}
    </button>
  )
}