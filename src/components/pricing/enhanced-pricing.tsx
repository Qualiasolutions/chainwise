"use client"

import React from "react"
import { SparklesText } from "@/components/magicui/sparkles-text"
import { PricingCard } from "@/components/ui/pricing-card"
import { BackgroundGradient } from "@/components/ui/background-gradient"
import { cn } from "@/lib/utils"

interface EnhancedPricingProps {
  className?: string
}

const pricingPlans = [
  {
    title: "Starter",
    description: "Perfect for crypto beginners",
    price: 0,
    period: "month",
    features: [
      { text: "Basic portfolio tracking", included: true },
      { text: "5 AI assistant queries/day", included: true },
      { text: "Price alerts", included: true },
      { text: "Basic analytics", included: true },
      { text: "Advanced AI personas", included: false },
      { text: "Portfolio optimization", included: false },
      { text: "Custom alerts", included: false },
      { text: "Premium support", included: false }
    ],
    ctaText: "Get Started Free",
    ctaVariant: "outline" as const
  },
  {
    title: "Pro",
    description: "For serious crypto traders", 
    price: 29,
    originalPrice: 49,
    discount: "40% OFF",
    period: "month",
    features: [
      { text: "Advanced portfolio tracking", included: true, highlight: true },
      { text: "100 AI assistant queries/day", included: true, highlight: true },
      { text: "Custom price alerts", included: true },
      { text: "Advanced analytics & insights", included: true },
      { text: "5 AI trading personas", included: true },
      { text: "Portfolio optimization", included: true },
      { text: "Whale tracking", included: true },
      { text: "Priority support", included: false }
    ],
    highlighted: true,
    popular: true,
    ctaText: "Start Pro Trial",
    ctaVariant: "primary" as const
  },
  {
    title: "Enterprise",
    description: "For institutional traders",
    price: 199,
    period: "month", 
    features: [
      { text: "Unlimited everything", included: true, highlight: true },
      { text: "Unlimited AI queries", included: true, highlight: true },
      { text: "Custom AI training", included: true },
      { text: "Advanced risk management", included: true },
      { text: "All AI personas + custom", included: true },
      { text: "API access", included: true },
      { text: "White-label options", included: true },
      { text: "24/7 dedicated support", included: true }
    ],
    ctaText: "Contact Sales",
    ctaVariant: "secondary" as const
  }
]

export default function EnhancedPricing({ className }: EnhancedPricingProps) {
  return (
    <BackgroundGradient className={cn("py-20", className)}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <SparklesText
            className="text-4xl md:text-5xl font-bold mb-6"
            colors={{
              first: "#4f46e5",
              second: "#8b5cf6"
            }}
            sparklesCount={12}
          >
            Choose Your Plan
          </SparklesText>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Unlock the full potential of AI-powered crypto trading with our flexible pricing options
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <PricingCard
              key={plan.title}
              title={plan.title}
              description={plan.description}
              price={plan.price}
              originalPrice={plan.originalPrice}
              discount={plan.discount}
              period={plan.period}
              features={plan.features}
              highlighted={plan.highlighted}
              popular={plan.popular}
              ctaText={plan.ctaText}
              ctaVariant={plan.ctaVariant}
              onCtaClick={() => console.log(`Selected ${plan.title} plan`)}
              animated={true}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-400 mb-4">
            All plans include our AI-powered insights and 14-day free trial
          </p>
          <p className="text-sm text-gray-500">
            Questions? <span className="text-[#4f46e5] hover:text-[#8b5cf6] cursor-pointer">Contact our sales team</span>
          </p>
        </div>
      </div>
    </BackgroundGradient>
  )
}