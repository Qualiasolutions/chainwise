"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface Enhanced3DCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: "default" | "premium" | "subtle" | "elevated"
  glowColor?: string
  interactive?: boolean
  depth?: "shallow" | "medium" | "deep"
  tiltEffect?: boolean
}

const Enhanced3DCard = React.forwardRef<HTMLDivElement, Enhanced3DCardProps>(
  ({ 
    className, 
    children, 
    variant = "default", 
    glowColor = "rgba(139,92,246,0.4)", 
    interactive = true,
    depth = "medium",
    tiltEffect = true,
    ...props 
  }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false)

    const depthConfig = {
      shallow: {
        blur: "8px",
        shadow: "0 4px 20px rgba(0,0,0,0.1)",
        hoverShadow: "0 12px 40px rgba(0,0,0,0.15)",
        transform: "translateY(-2px) scale(1.01)"
      },
      medium: {
        blur: "16px",
        shadow: "0 8px 32px rgba(0,0,0,0.12)",
        hoverShadow: "0 20px 60px rgba(0,0,0,0.2)",
        transform: "translateY(-4px) scale(1.02)"
      },
      deep: {
        blur: "24px",
        shadow: "0 16px 48px rgba(0,0,0,0.15)",
        hoverShadow: "0 32px 80px rgba(0,0,0,0.25)",
        transform: "translateY(-6px) scale(1.03)"
      }
    }

    const variantStyles = {
      default: {
        background: "rgba(255, 255, 255, 0.1)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        hoverBackground: "rgba(255, 255, 255, 0.15)"
      },
      premium: {
        background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(79, 70, 229, 0.1) 100%)",
        border: "1px solid rgba(139, 92, 246, 0.3)",
        hoverBackground: "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(79, 70, 229, 0.15) 100%)"
      },
      subtle: {
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        hoverBackground: "rgba(255, 255, 255, 0.08)"
      },
      elevated: {
        background: "rgba(255, 255, 255, 0.2)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        hoverBackground: "rgba(255, 255, 255, 0.25)"
      }
    }

    const currentVariant = variantStyles[variant]
    const currentDepth = depthConfig[depth]

    const cardVariants = {
      initial: { 
        opacity: 0, 
        y: 20,
        scale: 0.95,
        rotateX: 0,
        rotateY: 0
      },
      animate: { 
        opacity: 1, 
        y: 0,
        scale: 1,
        rotateX: 0,
        rotateY: 0,
        transition: {
          duration: 0.6,
          ease: [0.16, 1, 0.3, 1],
          staggerChildren: 0.1
        }
      },
      hover: {
        y: tiltEffect ? -6 : -4,
        scale: 1.02,
        transition: {
          duration: 0.3,
          ease: [0.16, 1, 0.3, 1]
        }
      }
    }

    const childVariants = {
      initial: { opacity: 0, y: 10 },
      animate: { 
        opacity: 1, 
        y: 0,
        transition: {
          duration: 0.4,
          ease: [0.16, 1, 0.3, 1]
        }
      }
    }

    const Component = interactive ? motion.div : "div"
    const animationProps = interactive ? {
      initial: "initial",
      animate: "animate",
      whileHover: "hover",
      variants: cardVariants,
      onHoverStart: () => setIsHovered(true),
      onHoverEnd: () => setIsHovered(false)
    } : {}

    return (
      <Component
        ref={ref}
        className={cn(
          // Base styles
          "relative rounded-2xl overflow-hidden",
          "transition-all duration-500 ease-out",
          "transform-gpu will-change-transform",
          // 3D perspective
          tiltEffect && "perspective-1000",
          className
        )}
        style={{
          background: isHovered ? currentVariant.hoverBackground : currentVariant.background,
          border: currentVariant.border,
          backdropFilter: `blur(${currentDepth.blur}) saturate(180%)`,
          WebkitBackdropFilter: `blur(${currentDepth.blur}) saturate(180%)`,
          boxShadow: `${isHovered ? currentDepth.hoverShadow : currentDepth.shadow}, 0 0 0 1px rgba(255,255,255,0.05)`,
          transformStyle: tiltEffect ? "preserve-3d" : "flat"
        }}
        {...animationProps}
        {...props}
      >
        {/* Enhanced gradient overlays */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Primary gradient */}
          <div 
            className="absolute inset-0 opacity-60"
            style={{
              background: `linear-gradient(135deg, 
                rgba(255,255,255,0.1) 0%, 
                transparent 50%, 
                rgba(0,0,0,0.05) 100%)`
            }}
          />
          
          {/* Glow effect */}
          <div 
            className={cn(
              "absolute inset-0 rounded-2xl transition-opacity duration-500",
              isHovered ? "opacity-100" : "opacity-0"
            )}
            style={{
              background: `radial-gradient(
                600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
                ${glowColor} 0%,
                transparent 40%
              )`
            }}
          />

          {/* Shimmer effect */}
          <div 
            className={cn(
              "absolute inset-0 rounded-2xl transition-all duration-700",
              isHovered && "animate-shimmer"
            )}
            style={{
              background: `linear-gradient(
                110deg, 
                transparent 40%, 
                rgba(255,255,255,0.1) 50%, 
                transparent 60%
              )`,
              backgroundSize: "200% 100%"
            }}
          />
        </div>

        {/* Border highlight */}
        <div 
          className={cn(
            "absolute inset-0 rounded-2xl pointer-events-none transition-all duration-500",
            "before:absolute before:inset-0 before:rounded-2xl before:p-[1px]",
            "before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
            "before:mask-composite:exclude before:[mask:linear-gradient(white,white)_content-box,linear-gradient(white,white)]",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Content container with 3D transform */}
        <motion.div 
          variants={childVariants}
          className="relative z-10 h-full"
          style={{
            transform: tiltEffect && isHovered ? "translateZ(20px)" : "translateZ(0)"
          }}
        >
          {children}
        </motion.div>

        {/* Interactive ripple effect */}
        {interactive && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            initial={{ scale: 0, opacity: 0 }}
            animate={isHovered ? { scale: 1, opacity: 0.1 } : { scale: 0, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`
            }}
          />
        )}
      </Component>
    )
  }
)

Enhanced3DCard.displayName = "Enhanced3DCard"

export { Enhanced3DCard }