'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import { useSubscription } from '@/hooks/use-subscription'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Zap, Crown, Lock, Star, TrendingUp, AlertCircle } from 'lucide-react'
import Link from 'next/link'

type SubscriptionTier = 'free' | 'pro' | 'elite'

interface TierGuardProps {
  children: ReactNode
  requiredTier: SubscriptionTier
  feature: string
  fallback?: ReactNode
  showUpgradeCard?: boolean
}

interface TierLimits {
  portfolios?: number
  alerts?: number
  holdings?: number
  personas?: string[]
  reports?: boolean
}

interface TierLimitGuardProps {
  children: ReactNode
  currentUsage: number
  maxAllowed: number
  feature: string
  usageType: 'portfolios' | 'alerts' | 'holdings'
}

const TIER_INFO = {
  free: {
    name: 'Free',
    icon: <Star className="w-5 h-5" />,
    color: 'bg-gray-100 text-gray-800',
    limits: {
      portfolios: 1,
      holdings: 3,
      alerts: 3,
      personas: ['Buddy'],
      reports: false
    }
  },
  pro: {
    name: 'Pro',
    icon: <Zap className="w-5 h-5" />,
    color: 'bg-blue-100 text-blue-800',
    price: '$12.99/month',
    limits: {
      portfolios: 3,
      holdings: 20,
      alerts: 10,
      personas: ['Buddy', 'Professor'],
      reports: true
    }
  },
  elite: {
    name: 'Elite',
    icon: <Crown className="w-5 h-5" />,
    color: 'bg-purple-100 text-purple-800',
    price: '$24.99/month',
    limits: {
      portfolios: 10,
      holdings: -1, // Unlimited
      alerts: -1, // Unlimited
      personas: ['Buddy', 'Professor', 'Trader'],
      reports: true
    }
  }
}

export function TierGuard({ 
  children, 
  requiredTier, 
  feature, 
  fallback,
  showUpgradeCard = true 
}: TierGuardProps) {
  const { session } = useSupabase()
  const { creditBalance, loading } = useSubscription()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader className="text-center">
          <Lock className="w-8 h-8 text-amber-600 mx-auto mb-2" />
          <CardTitle className="text-amber-800">Sign In Required</CardTitle>
          <CardDescription className="text-amber-700">
            Please sign in to access {feature}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const currentTier = (creditBalance?.tier || 'free') as SubscriptionTier
  const tierOrder: SubscriptionTier[] = ['free', 'pro', 'elite']
  const currentTierIndex = tierOrder.indexOf(currentTier)
  const requiredTierIndex = tierOrder.indexOf(requiredTier)

  const hasAccess = currentTierIndex >= requiredTierIndex

  if (hasAccess) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  if (!showUpgradeCard) {
    return null
  }

  const requiredTierInfo = TIER_INFO[requiredTier]

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-3">
          <div className="p-3 rounded-full bg-blue-100">
            <Lock className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <CardTitle className="text-xl text-blue-800">
          {requiredTierInfo.name} Feature
        </CardTitle>
        <CardDescription className="text-blue-700">
          {feature} requires a {requiredTierInfo.name} subscription or higher
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <Badge className={requiredTierInfo.color}>
            {requiredTierInfo.icon}
            <span className="ml-1">{requiredTierInfo.name}</span>
            {requiredTierInfo.price && (
              <span className="ml-2 text-sm">- {requiredTierInfo.price}</span>
            )}
          </Badge>
        </div>

        <div className="text-center space-y-3">
          <p className="text-blue-700 text-sm">
            Upgrade to unlock this feature and many more premium tools
          </p>
          
          <div className="grid grid-cols-1 gap-2">
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/pricing">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Pricing & Upgrade
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function TierLimitGuard({ 
  children, 
  currentUsage, 
  maxAllowed, 
  feature,
  usageType 
}: TierLimitGuardProps) {
  const { creditBalance } = useSubscription()
  
  // If unlimited (maxAllowed = -1), always allow
  if (maxAllowed === -1) {
    return <>{children}</>
  }
  
  // If under the limit, allow
  if (currentUsage < maxAllowed) {
    return <>{children}</>
  }

  const currentTier = (creditBalance?.tier || 'free') as SubscriptionTier
  const suggestedTier = usageType === 'portfolios' && currentTier === 'free' ? 'pro' : 'elite'
  const suggestedTierInfo = TIER_INFO[suggestedTier]

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-3">
          <div className="p-3 rounded-full bg-orange-100">
            <AlertCircle className="w-6 h-6 text-orange-600" />
          </div>
        </div>
        <CardTitle className="text-xl text-orange-800">
          {usageType.charAt(0).toUpperCase() + usageType.slice(1)} Limit Reached
        </CardTitle>
        <CardDescription className="text-orange-700">
          You've reached your limit of {maxAllowed} {usageType}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4 text-center">
        <div className="flex justify-center items-center gap-2">
          <span className="text-orange-800 font-medium">
            Current: {currentUsage}/{maxAllowed}
          </span>
        </div>

        <p className="text-orange-700 text-sm">
          Upgrade to {suggestedTierInfo.name} to get more {usageType}
        </p>
        
        <Button asChild className="bg-orange-600 hover:bg-orange-700 w-full">
          <Link href="/pricing">
            {suggestedTierInfo.icon}
            <span className="ml-2">Upgrade to {suggestedTierInfo.name}</span>
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

// Portfolio limit guard
export function PortfolioLimitGuard({ 
  children, 
  currentCount 
}: { 
  children: ReactNode
  currentCount: number 
}) {
  const { creditBalance } = useSubscription()
  const tier = (creditBalance?.tier || 'free') as SubscriptionTier
  const limits = TIER_INFO[tier].limits
  
  return (
    <TierLimitGuard
      currentUsage={currentCount}
      maxAllowed={limits.portfolios}
      feature="Create Portfolio"
      usageType="portfolios"
    >
      {children}
    </TierLimitGuard>
  )
}

// Alert limit guard  
export function AlertLimitGuard({ 
  children, 
  currentCount 
}: { 
  children: ReactNode
  currentCount: number 
}) {
  const { creditBalance } = useSubscription()
  const tier = (creditBalance?.tier || 'free') as SubscriptionTier
  const limits = TIER_INFO[tier].limits
  
  return (
    <TierLimitGuard
      currentUsage={currentCount}
      maxAllowed={limits.alerts}
      feature="Create Alert"
      usageType="alerts"
    >
      {children}
    </TierLimitGuard>
  )
}

// AI Persona guard
export function AIPersonaGuard({ 
  children,
  persona,
  fallback
}: { 
  children: ReactNode
  persona: 'buddy' | 'professor' | 'trader'
  fallback?: ReactNode
}) {
  const { creditBalance } = useSubscription()
  const tier = (creditBalance?.tier || 'free') as SubscriptionTier
  const limits = TIER_INFO[tier].limits
  
  const personaNames = {
    buddy: 'Buddy',
    professor: 'Professor', 
    trader: 'Trader'
  }
  
  const hasAccess = limits.personas?.includes(personaNames[persona])
  
  if (hasAccess) {
    return <>{children}</>
  }

  const requiredTier = persona === 'professor' ? 'pro' : 'elite'
  
  return (
    <TierGuard
      requiredTier={requiredTier}
      feature={`${personaNames[persona]} AI Persona`}
      fallback={fallback}
    >
      {children}
    </TierGuard>
  )
}