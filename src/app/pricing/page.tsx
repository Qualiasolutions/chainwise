'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Zap, Crown, Star, X } from "lucide-react"
import Link from "next/link"
import { PricingCard } from "@/components/pricing/PricingCard"
import { CreditPacks } from "@/components/ui/credit-packs"
import { useSupabase } from "@/components/providers/supabase-provider"
import { useSubscription } from "@/hooks/use-subscription"

export default function PricingPage() {
  const { session } = useSupabase()
  const { creditBalance } = useSubscription()
  
  const plans = [
    {
      id: 'free' as const,
      name: "Free",
      price: "$0",
      period: "forever", 
      description: "Awareness & a taste of AI, not full use",
      features: [
        "Buddy persona (basic Q&A)",
        "Live prices (top 10 coins only)",
        "Portfolio tracking (up to 3 coins)",
        "Coin comparisons (2 Max)",
        "Daily generic news (no personalization)",
        "ChainWise Academy: 2 intro lessons",
        "ChainWise Community access",
        "3 credits/month (to test premium features)"
      ],
      limitations: [
        "No advanced AI personas (Professor/Trader)",
        "No portfolio analysis or insights",
        "No custom reports or deep analysis",
        "Limited to basic features only",
      ],
      popular: false,
      icon: <Star className="h-6 w-6" />,
      color: "border-gray-200",
    },
    {
      id: 'pro' as const,
      name: "Pro",
      price: "$12.99",
      period: "per month",
      description: "The value-for-money plan. 60-70% of users will land here",
      features: [
        "Buddy + Professor personas",
        "Unlimited coin comparisons",
        "ChainWise Community access",
        "Daily personalized insights",
        "Portfolio tracking (up to 20 coins)",
        "Portfolio analysis (basic: performance, diversification, risk score)",
        "Smart alerts (up to 10: price, %, volume, drawdown)",
        "Scam/risk checks (basic red flags)",
        "Weekly Pro AI Report (1 included)",
        "ChainWise Academy: Beginner + Intermediate courses",
        "Gamified missions & badges",
        "50 credits/month"
      ],
      popular: true,
      icon: <Zap className="h-6 w-6" />,
      color: "border-blue-500",
    },
    {
      id: 'elite' as const,
      name: "Elite",
      price: "$24.99",
      period: "per month",
      description: "Prestige + VIP tools → for serious traders & power users",
      features: [
        "Everything in Pro",
        "Trader persona (advanced strategies, bull/bear scenarios)",
        "Unlimited custom alerts",
        "Advanced portfolio analysis (correlations & diversification)",
        "Basic social sentiment index (bullish/bearish overview)",
        "Basic thematic baskets (AI coins, DeFi, etc.)",
        "Monthly Elite Deep AI Report (1 included)",
        "ChainWise Academy: Full (Beginner → Advanced + Strategy lessons)",
        "Early access to new features",
        "Priority support",
        "200 credits/month"
      ],
      popular: false,
      icon: <Crown className="h-6 w-6" />,
      color: "border-purple-500",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Choose Your <span className="text-blue-600">ChainWise</span> Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From free portfolio tracking to professional-grade AI-powered crypto analysis.
            Start free and upgrade as you grow.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <PricingCard 
              key={plan.name} 
              plan={plan} 
              currentTier={creditBalance?.tier || (session ? 'free' : undefined)} 
            />
          ))}
        </div>

        {/* Credit Packs Section */}
        {session && (
          <div className="mt-24">
            <div className="border-t border-gray-200 pt-16">
              <CreditPacks />
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-24 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Frequently Asked Questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-2">How do AI credits work?</h3>
              <p className="text-gray-600">
                Credits are used for AI-powered features like chat interactions, market analysis, 
                and portfolio insights. They reset monthly with your subscription.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600">
                Yes! All plans can be canceled anytime. You&apos;ll retain access to paid features 
                until the end of your billing period.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept all major credit cards, debit cards, and PayPal through our 
                secure Stripe payment processing.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Is there a free trial?</h3>
              <p className="text-gray-600">
                The Free plan is available forever! Pro and Elite plans offer full refunds 
                within 30 days if you&apos;re not satisfied.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}