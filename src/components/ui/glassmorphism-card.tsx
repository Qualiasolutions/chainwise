"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface GlassmorphismCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: "default" | "subtle" | "strong"
  glowColor?: string
  animated?: boolean
}

const GlassmorphismCard = React.forwardRef<HTMLDivElement, GlassmorphismCardProps>(
  ({ className, children, variant = "default", glowColor, animated = true, ...props }, ref) => {
    const variants = {
      default: "bg-white/10 border-white/20 backdrop-blur-md",
      subtle: "bg-white/5 border-white/10 backdrop-blur-sm", 
      strong: "bg-white/20 border-white/30 backdrop-blur-lg"
    }

    const cardVariants = {
      initial: { 
        opacity: 0, 
        y: 20,
        scale: 0.95
      },
      animate: { 
        opacity: 1, 
        y: 0,
        scale: 1,
        transition: {
          duration: 0.5,
          ease: [0.16, 1, 0.3, 1]
        }
      },
      hover: {
        y: -8,
        scale: 1.02,
        transition: {
          duration: 0.3,
          ease: [0.16, 1, 0.3, 1]
        }
      }
    }

    const Component = animated ? motion.div : "div"
    const animationProps = animated ? {
      initial: "initial",
      animate: "animate",
      whileHover: "hover",
      variants: cardVariants
    } : {}

    return (
      <Component
        ref={ref}
        className={cn(
          // Base glassmorphism styles
          "relative rounded-2xl border",
          variants[variant],
          // Shadow and glow effects
          "shadow-2xl shadow-black/20",
          glowColor && `shadow-[0_0_30px_-5px_${glowColor}]`,
          // Interactive states
          "transition-all duration-300 ease-out",
          "hover:bg-white/15 hover:border-white/25",
          "hover:shadow-3xl hover:shadow-black/30",
          // Default glow for ChainWise brand
          !glowColor && "hover:shadow-[0_0_40px_-5px_rgba(79,70,229,0.3)]",
          className
        )}
        style={{
          background: `linear-gradient(135deg, 
            rgba(255, 255, 255, ${variant === 'strong' ? '0.2' : variant === 'subtle' ? '0.05' : '0.1'}) 0%, 
            rgba(255, 255, 255, ${variant === 'strong' ? '0.1' : variant === 'subtle' ? '0.02' : '0.05'}) 100%)`,
          backdropFilter: `blur(${variant === 'strong' ? '20px' : variant === 'subtle' ? '8px' : '12px'})`,
          WebkitBackdropFilter: `blur(${variant === 'strong' ? '20px' : variant === 'subtle' ? '8px' : '12px'})`
        }}
        {...animationProps}
        {...props}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-transparent to-black/5 pointer-events-none" />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </Component>
    )
  }
)

GlassmorphismCard.displayName = "GlassmorphismCard"

export { GlassmorphismCard }