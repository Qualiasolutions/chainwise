"use client"

import { cn } from "@/lib/utils"
import { motion, useAnimationControls, AnimatePresence } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import { Check, X, Heart, Star, TrendingUp, TrendingDown, Zap, AlertCircle } from "lucide-react"

interface MicroInteractionProps {
  children: React.ReactNode
  className?: string
  interaction?: "hover" | "tap" | "success" | "error" | "like" | "favorite" | "focus" | "ripple"
  intensity?: "subtle" | "moderate" | "strong"
  duration?: number
  delay?: number
  disabled?: boolean
  onInteractionComplete?: () => void
}

// Animation variants for different interaction types
const interactionVariants = {
  hover: {
    subtle: { scale: 1.02, transition: { duration: 0.2 } },
    moderate: { scale: 1.05, transition: { duration: 0.2 } },
    strong: { scale: 1.1, transition: { duration: 0.2 } }
  },
  tap: {
    subtle: { scale: 0.98, transition: { duration: 0.1 } },
    moderate: { scale: 0.95, transition: { duration: 0.1 } },
    strong: { scale: 0.9, transition: { duration: 0.1 } }
  },
  success: {
    subtle: {
      scale: [1, 1.02, 1],
      backgroundColor: ["var(--background)", "var(--success)", "var(--background)"],
      transition: { duration: 0.3 }
    },
    moderate: {
      scale: [1, 1.05, 1],
      backgroundColor: ["var(--background)", "var(--success)", "var(--background)"],
      transition: { duration: 0.4 }
    },
    strong: {
      scale: [1, 1.1, 1],
      backgroundColor: ["var(--background)", "var(--success)", "var(--background)"],
      transition: { duration: 0.5 }
    }
  },
  error: {
    subtle: {
      x: [-2, 2, -2, 2, 0],
      backgroundColor: ["var(--background)", "var(--destructive)", "var(--background)"],
      transition: { duration: 0.3 }
    },
    moderate: {
      x: [-4, 4, -4, 4, 0],
      backgroundColor: ["var(--background)", "var(--destructive)", "var(--background)"],
      transition: { duration: 0.4 }
    },
    strong: {
      x: [-8, 8, -8, 8, 0],
      backgroundColor: ["var(--background)", "var(--destructive)", "var(--background)"],
      transition: { duration: 0.5 }
    }
  }
}

export function MicroInteraction({
  children,
  className,
  interaction = "hover",
  intensity = "moderate",
  duration = 0.2,
  delay = 0,
  disabled = false,
  onInteractionComplete,
  ...props
}: MicroInteractionProps) {
  const controls = useAnimationControls()
  const [isInteracting, setIsInteracting] = useState(false)

  const triggerInteraction = async () => {
    if (disabled) return

    setIsInteracting(true)

    if (interaction in interactionVariants) {
      await controls.start(interactionVariants[interaction as keyof typeof interactionVariants][intensity])
    }

    setTimeout(() => {
      setIsInteracting(false)
      onInteractionComplete?.()
    }, duration * 1000 + delay * 1000)
  }

  const getInteractionProps = () => {
    switch (interaction) {
      case "hover":
        return {
          whileHover: interactionVariants.hover[intensity],
          transition: { duration, delay }
        }
      case "tap":
        return {
          whileTap: interactionVariants.tap[intensity],
          transition: { duration, delay }
        }
      case "focus":
        return {
          whileFocus: {
            scale: 1.02,
            boxShadow: "0 0 0 2px hsl(var(--primary))",
            transition: { duration, delay }
          }
        }
      default:
        return {}
    }
  }

  return (
    <motion.div
      className={cn("relative", className)}
      animate={controls}
      onClick={["success", "error", "like", "favorite"].includes(interaction) ? triggerInteraction : undefined}
      {...getInteractionProps()}
      {...props}
    >
      {children}

      {/* Ripple effect for tap interactions */}
      {interaction === "ripple" && (
        <RippleEffect disabled={disabled} intensity={intensity} />
      )}
    </motion.div>
  )
}

// Ripple effect component
interface RippleEffectProps {
  disabled?: boolean
  intensity?: "subtle" | "moderate" | "strong"
}

function RippleEffect({ disabled = false, intensity = "moderate" }: RippleEffectProps) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])
  const nextRippleId = useRef(0)

  const createRipple = (event: React.MouseEvent) => {
    if (disabled) return

    const button = event.currentTarget
    const rect = button.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const newRipple = {
      x,
      y,
      id: nextRippleId.current++
    }

    setRipples(prev => [...prev, newRipple])

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
    }, 600)
  }

  const getSize = () => {
    switch (intensity) {
      case "subtle": return 60
      case "moderate": return 80
      case "strong": return 100
      default: return 80
    }
  }

  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-inherit"
      onMouseDown={createRipple}
    >
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            className="absolute rounded-full bg-primary/20 pointer-events-none"
            style={{
              left: ripple.x - getSize() / 2,
              top: ripple.y - getSize() / 2,
              width: getSize(),
              height: getSize()
            }}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Feedback component for success/error states
interface FeedbackInteractionProps {
  trigger: boolean
  type: "success" | "error" | "warning" | "info"
  message?: string
  icon?: React.ReactNode
  duration?: number
  position?: "top" | "center" | "bottom"
  onComplete?: () => void
}

export function FeedbackInteraction({
  trigger,
  type,
  message,
  icon,
  duration = 2000,
  position = "center",
  onComplete
}: FeedbackInteractionProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (trigger) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        onComplete?.()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [trigger, duration, onComplete])

  const getIcon = () => {
    if (icon) return icon

    switch (type) {
      case "success": return <Check className="w-6 h-6" />
      case "error": return <X className="w-6 h-6" />
      case "warning": return <AlertCircle className="w-6 h-6" />
      case "info": return <Zap className="w-6 h-6" />
      default: return null
    }
  }

  const getColors = () => {
    switch (type) {
      case "success": return "bg-green-500 text-white"
      case "error": return "bg-red-500 text-white"
      case "warning": return "bg-yellow-500 text-black"
      case "info": return "bg-blue-500 text-white"
      default: return "bg-gray-500 text-white"
    }
  }

  const getPosition = () => {
    switch (position) {
      case "top": return "top-4 left-1/2 -translate-x-1/2"
      case "center": return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      case "bottom": return "bottom-4 left-1/2 -translate-x-1/2"
      default: return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn(
            "fixed z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg",
            getColors(),
            getPosition()
          )}
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {getIcon()}
          {message && <span className="text-sm font-medium">{message}</span>}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Favorite/Like button with heart animation
interface LikeButtonProps {
  isLiked: boolean
  onLike: (liked: boolean) => void
  className?: string
  size?: "sm" | "md" | "lg"
  showCount?: boolean
  count?: number
}

export function LikeButton({
  isLiked,
  onLike,
  className,
  size = "md",
  showCount = false,
  count = 0
}: LikeButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  const sizeMap = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  }

  const handleClick = () => {
    setIsAnimating(true)
    onLike(!isLiked)
    setTimeout(() => setIsAnimating(false), 300)
  }

  return (
    <button
      className={cn(
        "flex items-center gap-1 p-1 rounded-full transition-colors",
        "hover:bg-red-50 dark:hover:bg-red-950/20",
        className
      )}
      onClick={handleClick}
    >
      <motion.div
        animate={isAnimating ? {
          scale: [1, 1.3, 1],
          rotate: [0, -10, 10, 0]
        } : {}}
        transition={{ duration: 0.3 }}
      >
        <Heart
          className={cn(
            sizeMap[size],
            isLiked ? "fill-red-500 text-red-500" : "text-gray-400",
            "transition-colors"
          )}
        />
      </motion.div>
      {showCount && (
        <motion.span
          className="text-sm text-gray-600 dark:text-gray-400"
          animate={isAnimating ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          {count}
        </motion.span>
      )}
    </button>
  )
}

// Star rating with micro-interactions
interface StarRatingProps {
  rating: number
  maxRating?: number
  onChange?: (rating: number) => void
  readonly?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export function StarRating({
  rating,
  maxRating = 5,
  onChange,
  readonly = false,
  size = "md",
  className
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)

  const sizeMap = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  }

  return (
    <div className={cn("flex gap-0.5", className)}>
      {Array.from({ length: maxRating }, (_, i) => {
        const starNumber = i + 1
        const isFilled = starNumber <= (hoverRating || rating)

        return (
          <motion.button
            key={i}
            className={cn(
              "transition-colors",
              readonly ? "cursor-default" : "cursor-pointer"
            )}
            whileHover={!readonly ? { scale: 1.1 } : {}}
            whileTap={!readonly ? { scale: 0.95 } : {}}
            onMouseEnter={() => !readonly && setHoverRating(starNumber)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            onClick={() => !readonly && onChange?.(starNumber)}
            disabled={readonly}
          >
            <Star
              className={cn(
                sizeMap[size],
                isFilled ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
                "transition-colors"
              )}
            />
          </motion.button>
        )
      })}
    </div>
  )
}