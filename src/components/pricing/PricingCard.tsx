'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, Loader2 } from "lucide-react"
import { useSupabase } from "@/components/providers/supabase-provider"
import { useSubscription } from "@/hooks/use-subscription"
import { useState } from "react"

interface PricingPlan {
  id: 'free' | 'pro' | 'elite'
  name: string
  price: string
  period: string
  description: string
  features: string[]
  limitations?: string[]
  popular?: boolean
  icon: React.ReactNode
  color: string
}

interface PricingCardProps {
  plan: PricingPlan
  currentTier?: string
}

export function PricingCard({ plan, currentTier }: PricingCardProps) {
  const { session, user } = useSupabase()
  const { creditBalance } = useSubscription()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isCurrentPlan = currentTier === plan.id
  const isAuthenticated = !!session
  const canUpgrade = !isCurrentPlan && (!currentTier || getCurrentTierIndex() < getPlanIndex(plan.id))
  const canDowngrade = !isCurrentPlan && currentTier && getCurrentTierIndex() > getPlanIndex(plan.id)

  function getCurrentTierIndex(): number {
    if (!currentTier) return -1
    return ['free', 'pro', 'elite'].indexOf(currentTier)
  }

  function getPlanIndex(planId: string): number {
    return ['free', 'pro', 'elite'].indexOf(planId)
  }

  const handleSubscribe = async () => {
    if (plan.id === 'free') {
      window.location.href = '/auth/signup'
      return
    }

    if (!isAuthenticated) {
      window.location.href = `/auth/signup?plan=${plan.id}`
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plan.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to access billing portal')
      }

      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const getButtonText = () => {
    if (isCurrentPlan) {
      return plan.id === 'free' ? 'Current Plan' : 'Manage Subscription'
    }
    
    if (plan.id === 'free') {
      return 'Get Started Free'
    }
    
    if (canUpgrade) {
      return `Upgrade to ${plan.name}`
    }
    
    if (canDowngrade) {
      return `Downgrade to ${plan.name}`
    }
    
    return `Choose ${plan.name}`
  }

  const getButtonAction = () => {
    if (isCurrentPlan && plan.id !== 'free') {
      return handleManageSubscription
    }
    return handleSubscribe
  }

  return (
    <Card className={`relative ${plan.color} ${plan.popular ? 'scale-105 shadow-2xl' : 'shadow-lg'} ${isCurrentPlan ? 'ring-2 ring-blue-500' : ''}`}>
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-blue-600 text-white px-4 py-1">Most Popular</Badge>
        </div>
      )}
      
      {isCurrentPlan && (
        <div className="absolute -top-4 right-4">
          <Badge className="bg-green-600 text-white px-3 py-1">Current Plan</Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-2">
        <div className="flex justify-center mb-4">
          <div className={`p-3 rounded-full ${
            plan.name === 'Free' ? 'bg-gray-100' : 
            plan.name === 'Pro' ? 'bg-blue-100' : 
            'bg-purple-100'
          }`}>
            {plan.icon}
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
          <span className="text-gray-600">/{plan.period}</span>
        </div>
        <CardDescription className="text-center mt-2">
          {plan.description}
        </CardDescription>
        
        {/* Show current credits for authenticated users */}
        {isAuthenticated && isCurrentPlan && plan.id !== 'free' && creditBalance && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>{creditBalance.balance}</strong> credits remaining
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-4">
        <Button 
          onClick={getButtonAction()}
          disabled={loading || (isCurrentPlan && plan.id === 'free')}
          className={`w-full mb-6 ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
          variant={plan.popular ? "default" : "outline"}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {getButtonText()}
        </Button>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          {plan.features.map((feature) => (
            <div key={feature} className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
          
          {plan.limitations && plan.limitations.map((limitation) => (
            <div key={limitation} className="flex items-start gap-3 opacity-60">
              <X className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-600 text-sm">{limitation}</span>
            </div>
          ))}
        </div>

        {/* Feature comparison */}
        {plan.id === 'pro' && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Everything in Free, plus advanced features
            </p>
          </div>
        )}
        
        {plan.id === 'elite' && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Everything in Pro, plus premium features
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}