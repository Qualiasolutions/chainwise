"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface SmartSkeletonProps {
  className?: string
  variant?: "text" | "circular" | "rectangular" | "card" | "table" | "crypto-card" | "chart"
  lines?: number
  width?: string | number
  height?: string | number
  animated?: boolean
}

// Enhanced shimmer animation with modern gradients
const shimmerVariants = {
  initial: { x: "-100%" },
  animate: {
    x: "100%",
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: "easeInOut"
    }
  }
}

// Pulse animation for static elements
const pulseVariants = {
  initial: { opacity: 0.6 },
  animate: {
    opacity: [0.6, 0.8, 0.6],
    transition: {
      repeat: Infinity,
      duration: 2,
      ease: "easeInOut"
    }
  }
}

export function SmartSkeleton({
  className,
  variant = "rectangular",
  lines = 1,
  width,
  height,
  animated = true,
  ...props
}: SmartSkeletonProps) {
  const baseClasses = "relative overflow-hidden bg-gradient-to-r from-muted/50 via-muted/80 to-muted/50 rounded-md"

  // Shimmer overlay component
  const ShimmerOverlay = () => (
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
      variants={animated ? shimmerVariants : {}}
      initial="initial"
      animate="animate"
    />
  )

  // Variant-specific rendering
  switch (variant) {
    case "text":
      return (
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <motion.div
              key={i}
              className={cn(
                baseClasses,
                "h-4",
                i === lines - 1 && lines > 1 ? "w-3/4" : "w-full",
                className
              )}
              variants={animated ? pulseVariants : {}}
              initial="initial"
              animate="animate"
              style={{ width, height }}
              {...props}
            >
              {animated && <ShimmerOverlay />}
            </motion.div>
          ))}
        </div>
      )

    case "circular":
      return (
        <motion.div
          className={cn(
            baseClasses,
            "rounded-full",
            "w-12 h-12",
            className
          )}
          variants={animated ? pulseVariants : {}}
          initial="initial"
          animate="animate"
          style={{ width, height }}
          {...props}
        >
          {animated && <ShimmerOverlay />}
        </motion.div>
      )

    case "card":
      return (
        <motion.div
          className={cn(
            "rounded-lg border border-border/50 p-4 space-y-4",
            className
          )}
          variants={animated ? pulseVariants : {}}
          initial="initial"
          animate="animate"
          {...props}
        >
          {/* Card header */}
          <div className="flex items-center space-x-3">
            <div className={cn(baseClasses, "w-12 h-12 rounded-full")}>
              {animated && <ShimmerOverlay />}
            </div>
            <div className="space-y-2 flex-1">
              <div className={cn(baseClasses, "h-4 w-3/4")}>
                {animated && <ShimmerOverlay />}
              </div>
              <div className={cn(baseClasses, "h-3 w-1/2")}>
                {animated && <ShimmerOverlay />}
              </div>
            </div>
          </div>

          {/* Card content */}
          <div className="space-y-2">
            <div className={cn(baseClasses, "h-3 w-full")}>
              {animated && <ShimmerOverlay />}
            </div>
            <div className={cn(baseClasses, "h-3 w-5/6")}>
              {animated && <ShimmerOverlay />}
            </div>
            <div className={cn(baseClasses, "h-3 w-4/6")}>
              {animated && <ShimmerOverlay />}
            </div>
          </div>
        </motion.div>
      )

    case "crypto-card":
      return (
        <motion.div
          className={cn(
            "rounded-lg border border-border/50 p-4 space-y-4",
            className
          )}
          variants={animated ? pulseVariants : {}}
          initial="initial"
          animate="animate"
          {...props}
        >
          {/* Crypto header with icon and price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn(baseClasses, "w-10 h-10 rounded-full")}>
                {animated && <ShimmerOverlay />}
              </div>
              <div className="space-y-1">
                <div className={cn(baseClasses, "h-4 w-16")}>
                  {animated && <ShimmerOverlay />}
                </div>
                <div className={cn(baseClasses, "h-3 w-12")}>
                  {animated && <ShimmerOverlay />}
                </div>
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className={cn(baseClasses, "h-5 w-20")}>
                {animated && <ShimmerOverlay />}
              </div>
              <div className={cn(baseClasses, "h-3 w-16")}>
                {animated && <ShimmerOverlay />}
              </div>
            </div>
          </div>

          {/* Mini chart area */}
          <div className={cn(baseClasses, "h-16 w-full rounded")}>
            {animated && <ShimmerOverlay />}
          </div>
        </motion.div>
      )

    case "chart":
      return (
        <motion.div
          className={cn(
            "rounded-lg border border-border/50 p-4 space-y-4",
            className
          )}
          variants={animated ? pulseVariants : {}}
          initial="initial"
          animate="animate"
          {...props}
        >
          {/* Chart header */}
          <div className="flex items-center justify-between">
            <div className={cn(baseClasses, "h-5 w-32")}>
              {animated && <ShimmerOverlay />}
            </div>
            <div className={cn(baseClasses, "h-4 w-20")}>
              {animated && <ShimmerOverlay />}
            </div>
          </div>

          {/* Chart area with gradient bars */}
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-end space-x-1 h-8">
                {Array.from({ length: 12 }).map((_, j) => (
                  <div
                    key={j}
                    className={cn(baseClasses, "flex-1")}
                    style={{ height: `${Math.random() * 100}%` }}
                  >
                    {animated && <ShimmerOverlay />}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </motion.div>
      )

    case "table":
      return (
        <motion.div
          className={cn("space-y-3", className)}
          variants={animated ? pulseVariants : {}}
          initial="initial"
          animate="animate"
          {...props}
        >
          {/* Table header */}
          <div className="flex space-x-4 pb-2 border-b border-border/50">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={cn(baseClasses, "h-4 flex-1")}>
                {animated && <ShimmerOverlay />}
              </div>
            ))}
          </div>

          {/* Table rows */}
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className="flex space-x-4 py-2">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className={cn(baseClasses, "h-4 flex-1")}>
                  {animated && <ShimmerOverlay />}
                </div>
              ))}
            </div>
          ))}
        </motion.div>
      )

    default: // rectangular
      return (
        <motion.div
          className={cn(
            baseClasses,
            "h-4 w-full",
            className
          )}
          variants={animated ? pulseVariants : {}}
          initial="initial"
          animate="animate"
          style={{ width, height }}
          {...props}
        >
          {animated && <ShimmerOverlay />}
        </motion.div>
      )
  }
}

// Convenience components for common use cases
export const SkeletonText = (props: Omit<SmartSkeletonProps, "variant">) => (
  <SmartSkeleton variant="text" {...props} />
)

export const SkeletonCard = (props: Omit<SmartSkeletonProps, "variant">) => (
  <SmartSkeleton variant="card" {...props} />
)

export const SkeletonCryptoCard = (props: Omit<SmartSkeletonProps, "variant">) => (
  <SmartSkeleton variant="crypto-card" {...props} />
)

export const SkeletonChart = (props: Omit<SmartSkeletonProps, "variant">) => (
  <SmartSkeleton variant="chart" {...props} />
)

export const SkeletonTable = (props: Omit<SmartSkeletonProps, "variant">) => (
  <SmartSkeleton variant="table" {...props} />
)

export const SkeletonAvatar = (props: Omit<SmartSkeletonProps, "variant">) => (
  <SmartSkeleton variant="circular" {...props} />
)