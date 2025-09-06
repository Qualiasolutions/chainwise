"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const neonButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
  {
    variants: {
      variant: {
        primary: "bg-gradient-to-r from-[#4f46e5] to-[#8b5cf6] text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] border border-[#4f46e5]/50",
        secondary: "bg-gradient-to-r from-[#8b5cf6] to-[#2563eb] text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] border border-[#8b5cf6]/50",
        success: "bg-gradient-to-r from-[#10b981] to-[#059669] text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] border border-[#10b981]/50",
        warning: "bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-white shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] border border-[#f59e0b]/50",
        error: "bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] border border-[#ef4444]/50",
        ghost: "text-[#4f46e5] hover:bg-[#4f46e5]/10 hover:shadow-[0_0_20px_rgba(79,70,229,0.2)] border border-[#4f46e5]/20 hover:border-[#4f46e5]/40",
        outline: "border-2 border-[#4f46e5] text-[#4f46e5] hover:bg-[#4f46e5] hover:text-white hover:shadow-[0_0_20px_rgba(79,70,229,0.4)]"
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-10 px-4 py-2",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg"
      },
      glow: {
        none: "",
        subtle: "hover:shadow-[0_0_15px_rgba(79,70,229,0.3)]",
        medium: "hover:shadow-[0_0_25px_rgba(79,70,229,0.4)]",
        intense: "hover:shadow-[0_0_40px_rgba(79,70,229,0.6)] shadow-[0_0_20px_rgba(79,70,229,0.3)]"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      glow: "medium"
    },
  }
)

interface NeonButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof neonButtonVariants> {
  asChild?: boolean
  animated?: boolean
  ripple?: boolean
}

const NeonButton = React.forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ className, variant, size, glow, asChild = false, animated = true, ripple = true, children, ...props }, ref) => {
    const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number }>>([])
    
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple) {
        const button = event.currentTarget
        const rect = button.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        
        const newRipple = {
          id: Date.now(),
          x,
          y
        }
        
        setRipples(prev => [...prev, newRipple])
        
        // Remove ripple after animation
        setTimeout(() => {
          setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
        }, 600)
      }
      
      props.onClick?.(event)
    }

    const buttonVariants = {
      initial: { scale: 1 },
      hover: { 
        scale: 1.05,
        transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
      },
      tap: { 
        scale: 0.95,
        transition: { duration: 0.1 }
      }
    }

    const Comp = asChild ? Slot : animated ? motion.button : "button"
    const animationProps = animated && !asChild ? {
      variants: buttonVariants,
      initial: "initial",
      whileHover: "hover",
      whileTap: "tap"
    } : {}

    return (
      <Comp
        className={cn(neonButtonVariants({ variant, size, glow, className }))}
        ref={ref}
        onClick={handleClick}
        {...animationProps}
        {...props}
      >
        {/* Animated background shimmer */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
          animate={{
            x: ["0%", "200%"]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1.5,
            ease: "linear"
          }}
        />
        
        {/* Ripple effects */}
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute bg-white/30 rounded-full pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
        
        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
      </Comp>
    )
  }
)

NeonButton.displayName = "NeonButton"

export { NeonButton, neonButtonVariants }