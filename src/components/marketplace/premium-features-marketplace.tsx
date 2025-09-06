'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useSupabase } from '@/components/providers/supabase-provider'
import { useSubscription } from '@/hooks/use-subscription'
import { 
  TrendingUp, 
  Zap, 
  Crown, 
  Star, 
  BarChart3, 
  FileText, 
  Radio, 
  Eye,
  ShoppingCart,
  CreditCard,
  Loader2
} from 'lucide-react'

interface PremiumFeature {
  id: string
  feature_key: string
  name: string
  description: string
  category: string
  credit_cost: number
  pricing_usd: string | null
  required_tier: 'free' | 'pro' | 'elite'
  metadata: {
    frequency?: string
  }
}

interface FeaturesData {
  user: {
    tier: string
    credits: number
  }
  features: Record<string, PremiumFeature[]>
  totalFeatures: number
}

const categoryIcons: Record<string, JSX.Element> = {
  'analysis': <BarChart3 className="w-5 h-5" />,
  'reports': <FileText className="w-5 h-5" />,
  'signals': <Radio className="w-5 h-5" />,
  'tracking': <Eye className="w-5 h-5" />
}

const categoryNames: Record<string, string> = {
  'analysis': 'Analysis Tools',
  'reports': 'Premium Reports', 
  'signals': 'Trading Signals',
  'tracking': 'Tracking Tools'
}

const tierColors: Record<string, string> = {
  'free': 'bg-gray-100 text-gray-800',
  'pro': 'bg-blue-100 text-blue-800',
  'elite': 'bg-purple-100 text-purple-800'
}

const tierIcons: Record<string, JSX.Element> = {
  'free': <Star className="w-4 h-4" />,
  'pro': <Zap className="w-4 h-4" />,
  'elite': <Crown className="w-4 h-4" />
}

export function PremiumFeaturesMarketplace() {
  const [featuresData, setFeaturesData] = useState<FeaturesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasingFeature, setPurchasingFeature] = useState<string | null>(null)
  const { session } = useSupabase()
  const { creditBalance, refreshCreditBalance } = useSubscription()
  // toast imported from sonner

  useEffect(() => {
    if (session) {
      fetchFeatures()
    }
  }, [session])

  const fetchFeatures = async () => {
    try {
      const response = await fetch('/api/premium-features')
      const data = await response.json()
      
      if (data.success) {
        setFeaturesData(data)
      } else {
        throw new Error(data.error || 'Failed to fetch features')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load premium features',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const canAccessFeature = (feature: PremiumFeature) => {
    if (!featuresData) return false
    
    const tierOrder = { 'free': 0, 'pro': 1, 'elite': 2 }
    const userTierLevel = tierOrder[featuresData.user.tier as keyof typeof tierOrder] || 0
    const requiredTierLevel = tierOrder[feature.required_tier as keyof typeof tierOrder] || 0
    
    return userTierLevel >= requiredTierLevel
  }

  const handlePurchaseWithCredits = async (feature: PremiumFeature) => {
    if (!feature.credit_cost || feature.credit_cost <= 0) {
      toast({
        title: 'Not Available',
        description: 'This feature cannot be purchased with credits',
        variant: 'destructive'
      })
      return
    }

    if (!featuresData || featuresData.user.credits < feature.credit_cost) {
      toast({
        title: 'Insufficient Credits',
        description: `You need ${feature.credit_cost} credits but only have ${featuresData?.user.credits || 0}`,
        variant: 'destructive'
      })
      return
    }

    setPurchasingFeature(feature.id)
    
    try {
      const response = await fetch('/api/premium-features/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          featureId: feature.id,
          purchaseType: 'credits'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast({
          title: 'Success!',
          description: data.message,
        })
        
        // Refresh user credits
        await refreshCreditBalance()
        
        // Update local state
        setFeaturesData(prev => prev ? {
          ...prev,
          user: {
            ...prev.user,
            credits: data.remainingCredits
          }
        } : null)
        
      } else {
        throw new Error(data.error || 'Purchase failed')
      }
    } catch (error: any) {
      toast({
        title: 'Purchase Failed',
        description: error.message || 'Something went wrong',
        variant: 'destructive'
      })
    } finally {
      setPurchasingFeature(null)
    }
  }

  const handlePurchaseWithUSD = async (feature: PremiumFeature) => {
    if (!feature.pricing_usd) {
      toast({
        title: 'Not Available',
        description: 'This feature cannot be purchased with USD',
        variant: 'destructive'
      })
      return
    }

    setPurchasingFeature(feature.id)
    
    try {
      const response = await fetch('/api/premium-features/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          featureId: feature.id,
          purchaseType: 'usd'
        })
      })

      const data = await response.json()
      
      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        throw new Error(data.error || 'Failed to create checkout session')
      }
    } catch (error: any) {
      toast({
        title: 'Checkout Failed',
        description: error.message || 'Something went wrong',
        variant: 'destructive'
      })
      setPurchasingFeature(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!featuresData) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Failed to load premium features</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Premium Features Marketplace
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Unlock advanced AI-powered tools and analysis with our premium features. 
          Pay with credits or purchase individual features.
        </p>
        
        <div className="flex items-center justify-center gap-4 mt-6">
          <Badge variant="outline" className="text-lg px-4 py-2">
            <TrendingUp className="w-5 h-5 mr-2" />
            {featuresData.user.credits} Credits Available
          </Badge>
          <Badge className={tierColors[featuresData.user.tier]} variant="outline">
            {tierIcons[featuresData.user.tier]}
            <span className="ml-1 capitalize">{featuresData.user.tier}</span>
          </Badge>
        </div>
      </div>

      {/* Features by Category */}
      {Object.entries(featuresData.features).map(([category, features]) => (
        <div key={category} className="space-y-6">
          <div className="flex items-center gap-3">
            {categoryIcons[category]}
            <h2 className="text-2xl font-semibold text-gray-900">
              {categoryNames[category] || category}
            </h2>
            <Badge variant="secondary">{features.length} features</Badge>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const hasAccess = canAccessFeature(feature)
              const isPurchasing = purchasingFeature === feature.id
              
              return (
                <Card key={feature.id} className={`relative shadow-lg border-0 hover:shadow-xl transition-all duration-300 ${!hasAccess ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-gray-900 dark:text-white">{feature.name}</CardTitle>
                        <CardDescription className="mt-1 text-gray-600 dark:text-gray-400">
                          {feature.description}
                        </CardDescription>
                      </div>
                      <Badge className={tierColors[feature.required_tier]} variant="outline">
                        {tierIcons[feature.required_tier]}
                        <span className="ml-1 capitalize">{feature.required_tier}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {/* Pricing Info */}
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          {feature.credit_cost > 0 && (
                            <div className="flex items-center gap-1">
                              <Zap className="w-4 h-4 text-yellow-500" />
                              <span className="font-semibold">{feature.credit_cost} credits</span>
                            </div>
                          )}
                          {feature.pricing_usd && (
                            <div className="flex items-center gap-1">
                              <CreditCard className="w-4 h-4 text-green-500" />
                              <span className="font-semibold">${feature.pricing_usd}</span>
                            </div>
                          )}
                        </div>
                        {feature.metadata?.frequency && (
                          <Badge variant="secondary" className="text-xs">
                            {feature.metadata.frequency.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>

                      <Separator />
                      
                      {/* Purchase Buttons */}
                      {!hasAccess ? (
                        <Button disabled className="w-full">
                          Requires {feature.required_tier} Subscription
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          {feature.credit_cost > 0 && (
                            <Button
                              onClick={() => handlePurchaseWithCredits(feature)}
                              disabled={isPurchasing || featuresData.user.credits < feature.credit_cost}
                              className="w-full"
                              variant="default"
                            >
                              {isPurchasing ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <ShoppingCart className="w-4 h-4 mr-2" />
                              )}
                              Use {feature.credit_cost} Credits
                            </Button>
                          )}
                          
                          {feature.pricing_usd && (
                            <Button
                              onClick={() => handlePurchaseWithUSD(feature)}
                              disabled={isPurchasing}
                              className="w-full"
                              variant="outline"
                            >
                              {isPurchasing ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <CreditCard className="w-4 h-4 mr-2" />
                              )}
                              Pay ${feature.pricing_usd}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}