'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Zap, Crown, Star, X } from "lucide-react"
import Link from "next/link"
import { PricingCard } from "@/components/pricing/PricingCard"
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
      description: "Perfect for getting started with crypto tracking",
      features: [
        "Track up to 1 portfolio with 3 holdings",
        "3 AI chat credits/month (Buddy persona)",
        "Basic market data & price alerts",
        "Up to 3 custom alerts",
        "Basic educational content access",
        "Community access (read-only)",
      ],
      limitations: [
        "No advanced AI personas",
        "No portfolio analysis",
        "No custom reports",
        "Limited support",
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
      description: "Advanced tools for serious crypto enthusiasts",
      features: [
        "Track up to 3 portfolios with 20 holdings each",
        "50 AI chat credits/month",
        "Buddy + Professor AI personas",
        "Advanced portfolio analytics & risk scoring",
        "AI-powered market insights",
        "Up to 10 custom alerts",
        "Weekly AI reports",
        "Full educational academy access",
        "Priority email support",
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
      description: "Professional-grade tools for power users",
      features: [
        "Track up to 10 portfolios with unlimited holdings",
        "200 AI chat credits/month",
        "All AI personas (Buddy, Professor, Trader)",
        "Advanced portfolio analytics & correlation analysis",
        "Unlimited custom alerts with advanced triggers",
        "Weekly + Monthly AI reports",
        "Whale tracking & movement alerts",
        "Social sentiment analysis",
        "Advanced educational content",
        "Priority chat support",
        "Early access to new features",
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