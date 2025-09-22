"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useState, useRef, useEffect } from "react"

interface GlassmorphismCardProps {
  children: React.ReactNode
  className?: string
  variant?: "default" | "intense" | "subtle" | "neon" | "frost"
  hover?: boolean
  tilt?: boolean
  glow?: boolean
  border?: boolean
  blur?: "sm" | "md" | "lg" | "xl"
  opacity?: number
  gradient?: boolean
  animated?: boolean
}

const variantStyles = {
  default: {
    backdrop: "backdrop-blur-md",
    background: "bg-white/10 dark:bg-white/5",
    border: "border border-white/20 dark:border-white/10",
    shadow: "shadow-xl shadow-black/5"
  },
  intense: {
    backdrop: "backdrop-blur-xl",
    background: "bg-white/20 dark:bg-white/10",
    border: "border border-white/30 dark:border-white/20",
    shadow: "shadow-2xl shadow-black/10"
  },
  subtle: {
    backdrop: "backdrop-blur-sm",
    background: "bg-white/5 dark:bg-white/3",
    border: "border border-white/10 dark:border-white/5",
    shadow: "shadow-lg shadow-black/3"
  },
  neon: {
    backdrop: "backdrop-blur-lg",
    background: "bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-cyan-500/10",
    border: "border border-purple-500/30 dark:border-purple-400/20",
    shadow: "shadow-xl shadow-purple-500/10"
  },
  frost: {
    backdrop: "backdrop-blur-lg backdrop-saturate-150",
    background: "bg-white/15 dark:bg-white/8",
    border: "border border-white/25 dark:border-white/15",
    shadow: "shadow-xl shadow-black/5"
  }
}

const blurMap = {
  sm: "backdrop-blur-sm",
  md: "backdrop-blur-md",
  lg: "backdrop-blur-lg",
  xl: "backdrop-blur-xl"
}

export function GlassmorphismCard({
  children,
  className,
  variant = "default",
  hover = true,
  tilt = false,
  glow = false,
  border = true,
  blur = "md",
  opacity,
  gradient = false,
  animated = true,
  ...props
}: GlassmorphismCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  const styles = variantStyles[variant]

  // Handle mouse movement for tilt effect
  useEffect(() => {
    if (!tilt || !cardRef.current) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return

      const rect = cardRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const rotateX = (y - centerY) / 10
      const rotateY = (centerX - x) / 10

      setMousePosition({ x: rotateY, y: rotateX })
    }

    const handleMouseLeave = () => {
      setMousePosition({ x: 0, y: 0 })
    }

    if (isHovered) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [isHovered, tilt])

  const getCustomStyles = () => {
    let customBg = styles.background
    if (opacity !== undefined) {
      customBg = `bg-white/${Math.round(opacity * 100)} dark:bg-white/${Math.round(opacity * 50)}`
    }
    return customBg
  }

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "relative rounded-xl overflow-hidden",
        blur !== "md" ? blurMap[blur] : styles.backdrop,
        getCustomStyles(),
        border && styles.border,
        styles.shadow,
        glow && "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300",
        glow && isHovered && "before:opacity-100",
        gradient && "bg-gradient-to-br from-white/10 via-transparent to-white/5",
        className
      )}
      style={{
        transform: tilt ? `perspective(1000px) rotateX(${mousePosition.y}deg) rotateY(${mousePosition.x}deg)` : undefined
      }}
      animate={animated ? {
        scale: hover && isHovered ? 1.02 : 1,
        y: hover && isHovered ? -2 : 0
      } : {}}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {/* Animated border gradient */}
      {glow && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{
            background: `conic-gradient(from 0deg at 50% 50%, transparent, ${
              variant === "neon" ? "rgba(168, 85, 247, 0.4)" : "rgba(255, 255, 255, 0.2)"
            }, transparent)`
          }}
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Hover light effect */}
      {hover && (
        <motion.div
          className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x + 50}% ${mousePosition.y + 50}%, rgba(255, 255, 255, 0.1) 0%, transparent 70%)`
          }}
          animate={{
            opacity: isHovered ? 1 : 0
          }}
          transition={{ duration: 0.2 }}
        />
      )}
    </motion.div>
  )
}

// Specialized card variants
export function CryptoGlassCard({
  children,
  className,
  ...props
}: Omit<GlassmorphismCardProps, "variant">) {
  return (
    <GlassmorphismCard
      variant="neon"
      glow
      tilt
      className={cn("p-6", className)}
      {...props}
    >
      {children}
    </GlassmorphismCard>
  )
}

export function DashboardGlassCard({
  children,
  className,
  ...props
}: Omit<GlassmorphismCardProps, "variant">) {
  return (
    <GlassmorphismCard
      variant="frost"
      hover
      className={cn("p-4", className)}
      {...props}
    >
      {children}
    </GlassmorphismCard>
  )
}

export function HeroGlassCard({
  children,
  className,
  ...props
}: Omit<GlassmorphismCardProps, "variant">) {
  return (
    <GlassmorphismCard
      variant="intense"
      glow
      gradient
      className={cn("p-8", className)}
      {...props}
    >
      {children}
    </GlassmorphismCard>
  )
}

// Glass navigation component
interface GlassNavProps {
  children: React.ReactNode
  className?: string
  position?: "top" | "bottom" | "left" | "right"
  floating?: boolean
}

export function GlassNav({
  children,
  className,
  position = "top",
  floating = false,
  ...props
}: GlassNavProps) {
  const positionStyles = {
    top: floating ? "top-4 left-1/2 -translate-x-1/2" : "top-0 left-0 right-0",
    bottom: floating ? "bottom-4 left-1/2 -translate-x-1/2" : "bottom-0 left-0 right-0",
    left: floating ? "left-4 top-1/2 -translate-y-1/2" : "left-0 top-0 bottom-0",
    right: floating ? "right-4 top-1/2 -translate-y-1/2" : "right-0 top-0 bottom-0"
  }

  return (
    <motion.nav
      className={cn(
        "fixed z-50",
        positionStyles[position],
        floating && "rounded-xl",
        className
      )}
      initial={{ opacity: 0, y: position === "top" ? -20 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      <GlassmorphismCard
        variant="frost"
        blur="lg"
        className={cn(
          "px-4 py-2",
          !floating && "rounded-none"
        )}
      >
        {children}
      </GlassmorphismCard>
    </motion.nav>
  )
}

// Glass modal/dialog backdrop
interface GlassBackdropProps {
  children: React.ReactNode
  className?: string
  blur?: GlassmorphismCardProps["blur"]
  onClick?: () => void
}

export function GlassBackdrop({
  children,
  className,
  blur = "lg",
  onClick,
  ...props
}: GlassBackdropProps) {
  return (
    <motion.div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        blurMap[blur],
        "bg-black/20",
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClick}
      {...props}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}