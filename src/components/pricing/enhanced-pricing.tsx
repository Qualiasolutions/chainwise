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
    title: "Free",
    description: "Perfect for crypto beginners - awareness & taste of AI, not full use",
    price: 0,
    period: "month",
    credits: 3,
    features: [
      { text: "1 portfolio (up to 3 coins)", included: true },
      { text: "3 credits per month", included: true },
      { text: "Buddy AI persona only", included: true },
      { text: "Basic portfolio tracking", included: true },
      { text: "3 smart alerts", included: true },
      { text: "Chainwise Academy: 2 intro lessons", included: true },
      { text: "Professor AI persona", included: false },
      { text: "Portfolio analysis", included: false },
      { text: "Whale tracking", included: false }
    ],
    ctaText: "Get Started Free",
    ctaVariant: "outline" as const
  },
  {
    title: "Pro",
    description: "For serious crypto traders - the value-for-money plan for 60-70% of users", 
    price: 12.99,
    period: "month",
    credits: 50,
    features: [
      { text: "3 portfolios (up to 20 coins each)", included: true },
      { text: "50 credits per month", included: true, highlight: true },
      { text: "Buddy + Professor AI personas", included: true },
      { text: "Portfolio analysis (performance, diversification, risk)", included: true },
      { text: "10 smart alerts", included: true },
      { text: "Weekly Pro AI Report (1 included)", included: true },
      { text: "Academy: Beginner + Intermediate courses", included: true },
      { text: "Trader AI persona", included: false },
      { text: "Whale tracking", included: false }
    ],
    ctaText: "Start Pro",
    ctaVariant: "primary" as const
  },
  {
    title: "Elite",
    description: "For premium traders & power users - prestige + VIP tools with exclusive access",
    price: 24.99,
    period: "month",
    credits: 200,
    features: [
      { text: "10 portfolios (unlimited holdings)", included: true, highlight: true },
      { text: "200 credits per month", included: true, highlight: true },
      { text: "All AI personas (Buddy, Professor, Trader)", included: true },
      { text: "Advanced portfolio analytics (correlations & diversification)", included: true },
      { text: "Unlimited custom alerts", included: true },
      { text: "Weekly + Monthly Elite Deep AI Reports", included: true },
      { text: "Basic whale wallet movements", included: true },
      { text: "Basic social sentiment analysis", included: true },
      { text: "Full Academy (Beginner → Advanced + Strategy)", included: true }
    ],
    highlighted: true,
    popular: true,
    ctaText: "Go Elite",
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
              credits={plan.credits}
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