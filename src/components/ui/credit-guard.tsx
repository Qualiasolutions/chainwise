'use client'

import { ReactNode } from 'react'
import { useSubscription } from '@/hooks/use-subscription'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Zap, Crown, Lock } from 'lucide-react'
import Link from 'next/link'

interface CreditGuardProps {
  children: ReactNode
  requiredCredits: number
  feature: string
  fallback?: ReactNode
  showUpgrade?: boolean
}

export function CreditGuard({
  children,
  requiredCredits,
  feature,
  fallback,
  showUpgrade = true
}: CreditGuardProps) {
  const { creditBalance, loading, canUseFeature } = useSubscription()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!creditBalance || !canUseFeature(feature, requiredCredits)) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-2">
            <div className="p-3 rounded-full bg-amber-100">
              <Lock className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <CardTitle className="text-xl text-amber-800">Credits Required</CardTitle>
          <CardDescription className="text-amber-700">
            This feature requires {requiredCredits} credit{requiredCredits > 1 ? 's' : ''} to use.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 text-center">
          <div className="flex justify-center gap-4 items-center">
            <div>
              <p className="text-2xl font-bold text-amber-800">{creditBalance?.balance || 0}</p>
              <p className="text-sm text-amber-600">Available Credits</p>
            </div>
            <div className="text-amber-500">vs</div>
            <div>
              <p className="text-2xl font-bold text-red-600">{requiredCredits}</p>
              <p className="text-sm text-red-500">Required Credits</p>
            </div>
          </div>

          {showUpgrade && creditBalance?.tier === 'free' && (
            <div className="space-y-3">
              <p className="text-amber-700 font-medium">Upgrade for more credits:</p>
              <div className="grid grid-cols-2 gap-3">
                <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/pricing">
                    <Zap className="mr-2 h-4 w-4" />
                    Pro: 50 Credits
                  </Link>
                </Button>
                <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-700">
                  <Link href="/pricing">
                    <Crown className="mr-2 h-4 w-4" />
                    Elite: 150 Credits
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {creditBalance?.tier !== 'free' && (
            <p className="text-sm text-amber-600">
              Your credits will refresh with your next billing cycle.
            </p>
          )}
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}

interface CreditUsageButtonProps {
  children: ReactNode
  requiredCredits: number
  feature: string
  onClick: () => void
  disabled?: boolean
  className?: string
}

export function CreditUsageButton({
  children,
  requiredCredits,
  feature,
  onClick,
  disabled = false,
  className = ''
}: CreditUsageButtonProps) {
  const { canUseFeature, spendCredits } = useSubscription()

  const handleClick = async () => {
    if (!canUseFeature(feature, requiredCredits)) {
      return
    }

    try {
      await spendCredits(requiredCredits, feature)
      onClick()
    } catch (error) {
      console.error('Failed to spend credits:', error)
      alert('Failed to use feature. Please try again.')
    }
  }

  const isDisabled = disabled || !canUseFeature(feature, requiredCredits)

  return (
    <Button
      onClick={handleClick}
      disabled={isDisabled}
      className={className}
    >
      {children}
      <Badge variant="secondary" className="ml-2">
        {requiredCredits} {requiredCredits === 1 ? 'credit' : 'credits'}
      </Badge>
    </Button>
  )
}