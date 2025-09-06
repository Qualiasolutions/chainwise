"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Check, Star, Zap, Crown } from "lucide-react"
import { cn } from "@/lib/utils"
import { GlassmorphismCard } from "./glassmorphism-card"
import { NeonButton } from "./neon-button"
import { Badge } from "./badge"

interface PricingFeature {
  text: string
  included: boolean
  highlight?: boolean
}

interface PricingCardProps {
  title: string
  description: string
  price: number | string
  period?: string
  originalPrice?: number
  discount?: string
  features: PricingFeature[]
  highlighted?: boolean
  popular?: boolean
  ctaText?: string
  ctaVariant?: "primary" | "secondary" | "success" | "warning" | "error" | "ghost" | "outline"
  onCtaClick?: () => void
  className?: string
  animated?: boolean
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  description,
  price,
  period = "month",
  originalPrice,
  discount,
  features,
  highlighted = false,
  popular = false,
  ctaText = "Get Started",
  ctaVariant = "primary",
  onCtaClick,
  className,
  animated = true
}) => {
  const cardVariants = {
    initial: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
        delay: highlighted ? 0.2 : 0
      }
    },
    hover: {
      y: -12,
      scale: highlighted ? 1.05 : 1.02,
      transition: {
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  }

  const getIcon = () => {
    if (title.toLowerCase().includes("enterprise") || title.toLowerCase().includes("premium")) {
      return <Crown className="h-6 w-6 text-yellow-400" />
    }
    if (title.toLowerCase().includes("pro") || highlighted) {
      return <Zap className="h-6 w-6 text-purple-400" />
    }
    return <Star className="h-5 w-5 text-blue-400" />
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      className={cn(
        "relative",
        highlighted && "transform scale-105 z-10",
        className
      )}
    >
      {/* Popular badge */}
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
          <Badge 
            variant="default" 
            className="bg-gradient-to-r from-[#4f46e5] to-[#8b5cf6] text-white shadow-lg px-4 py-1.5 text-sm font-semibold"
          >
            Most Popular
          </Badge>
        </div>
      )}

      {/* Discount badge */}
      {discount && (
        <div className="absolute -top-3 -right-3 z-20">
          <Badge 
            variant="default" 
            className="bg-gradient-to-r from-[#10b981] to-[#059669] text-white shadow-lg px-3 py-1 text-xs font-bold rounded-full"
          >
            {discount}
          </Badge>
        </div>
      )}

      <GlassmorphismCard
        variant={highlighted ? "strong" : "default"}
        glowColor={highlighted ? "rgba(79,70,229,0.4)" : undefined}
        animated={false}
        className={cn(
          "p-8 h-full flex flex-col",
          highlighted && "border-[#4f46e5]/40 bg-gradient-to-b from-[#4f46e5]/10 to-transparent"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          {getIcon()}
          <div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-sm text-gray-300">{description}</p>
          </div>
        </div>

        {/* Pricing */}
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            {typeof price === 'string' ? (
              <span className="text-3xl font-bold text-white">{price}</span>
            ) : (
              <>
                <span className="text-4xl font-bold text-white">${price}</span>
                <span className="text-gray-400">/{period}</span>
              </>
            )}
            {originalPrice && (
              <span className="text-lg text-gray-500 line-through ml-2">
                ${originalPrice}
              </span>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="flex-1 mb-8">
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className={cn(
                  "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5",
                  feature.included 
                    ? "bg-gradient-to-r from-[#10b981] to-[#059669]" 
                    : "bg-gray-600"
                )}>
                  {feature.included ? (
                    <Check className="h-3 w-3 text-white" />
                  ) : (
                    <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  )}
                </div>
                <span className={cn(
                  "text-sm",
                  feature.included ? "text-gray-200" : "text-gray-500",
                  feature.highlight && "font-semibold text-white"
                )}>
                  {feature.text}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* CTA Button */}
        <NeonButton
          variant={highlighted ? ctaVariant : "outline"}
          size="lg"
          className="w-full"
          onClick={onCtaClick}
          glow={highlighted ? "intense" : "medium"}
        >
          {ctaText}
        </NeonButton>
      </GlassmorphismCard>
    </motion.div>
  )
}

export { PricingCard }