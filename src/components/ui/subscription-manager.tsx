'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, CreditCard, Crown, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SubscriptionManagerProps {
  currentTier: string
  creditsBalance: number
  subscription?: {
    status: string
    currentPeriodEnd: Date
    cancelAtPeriodEnd: boolean
  }
}

export function SubscriptionManager({
  currentTier,
  creditsBalance,
  subscription
}: SubscriptionManagerProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleUpgrade = async (plan: 'pro' | 'elite') => {
    setLoading(plan)
    
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })

      const data = await response.json()

      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('Failed to start upgrade process. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const handleManageBilling = async () => {
    setLoading('portal')
    
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to create portal session')
      }
    } catch (error) {
      console.error('Error creating portal session:', error)
      alert('Failed to open billing portal. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const getTierInfo = (tier: string) => {
    switch (tier) {
      case 'pro':
        return { name: 'Pro', color: 'bg-blue-100 text-blue-800', icon: <Zap className="h-4 w-4" /> }
      case 'elite':
        return { name: 'Elite', color: 'bg-purple-100 text-purple-800', icon: <Crown className="h-4 w-4" /> }
      default:
        return { name: 'Free', color: 'bg-gray-100 text-gray-800', icon: null }
    }
  }

  const tierInfo = getTierInfo(currentTier)

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-xl">Current Plan</CardTitle>
              <Badge className={tierInfo.color}>
                <div className="flex items-center gap-1">
                  {tierInfo.icon}
                  {tierInfo.name}
                </div>
              </Badge>
            </div>
            {subscription && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleManageBilling}
                disabled={loading === 'portal'}
              >
                {loading === 'portal' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <CreditCard className="mr-2 h-4 w-4" />
                Manage Billing
              </Button>
            )}
          </div>
          <CardDescription>
            {subscription
              ? `Renews on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
              : 'Your free plan includes basic features'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{creditsBalance}</p>
              <p className="text-sm text-muted-foreground">Credits Available</p>
            </div>
            {subscription?.cancelAtPeriodEnd && (
              <Badge variant="destructive">Canceling Soon</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Options */}
      {currentTier === 'free' && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Pro Plan
              </CardTitle>
              <CardDescription>
                Perfect for serious crypto enthusiasts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-3xl font-bold">$12.99<span className="text-lg font-normal text-muted-foreground">/month</span></div>
                <ul className="space-y-2 text-sm">
                  <li>• 50 AI chat credits/month</li>
                  <li>• Advanced portfolio analytics</li>
                  <li>• AI-powered market insights</li>
                  <li>• Educational academy access</li>
                </ul>
                <Button
                  onClick={() => handleUpgrade('pro')}
                  disabled={loading === 'pro'}
                  className="w-full"
                >
                  {loading === 'pro' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Upgrade to Pro
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-purple-600" />
                Elite Plan
              </CardTitle>
              <CardDescription>
                Professional-grade tools for power users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-3xl font-bold">$24.99<span className="text-lg font-normal text-muted-foreground">/month</span></div>
                <ul className="space-y-2 text-sm">
                  <li>• 150 AI chat credits/month</li>
                  <li>• Advanced AI personas</li>
                  <li>• Comprehensive risk analysis</li>
                  <li>• Exclusive market reports</li>
                </ul>
                <Button
                  onClick={() => handleUpgrade('elite')}
                  disabled={loading === 'elite'}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {loading === 'elite' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Upgrade to Elite
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {currentTier === 'pro' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-purple-600" />
              Elite Plan
            </CardTitle>
            <CardDescription>
              Upgrade to unlock the full power of ChainWise
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">$24.99<span className="text-lg font-normal text-muted-foreground">/month</span></div>
                <p className="text-sm text-muted-foreground mt-1">
                  100 additional credits + advanced AI personas
                </p>
              </div>
              <Button
                onClick={() => handleUpgrade('elite')}
                disabled={loading === 'elite'}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {loading === 'elite' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Upgrade to Elite
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}