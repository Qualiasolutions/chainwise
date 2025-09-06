'use client'

import { useCallback, useState, useEffect } from 'react'
import { useSubscription } from '@/hooks/use-subscription'
import { type AIPersona } from '@/lib/openai-service'

export interface PersonaCost {
  persona: AIPersona
  cost: number
  name: string
  description: string
}

export function useChatCredits() {
  const { creditBalance, subscriptionTier, canUseFeature, refetchBalance } = useSubscription()
  const [isInitializing, setIsInitializing] = useState(true)

  const personaCosts: PersonaCost[] = [
    {
      persona: 'buddy',
      cost: 1,
      name: 'Crypto Buddy',
      description: 'Beginner-friendly guidance'
    },
    {
      persona: 'professor',
      cost: 2, 
      name: 'Crypto Professor',
      description: 'Deep technical analysis'
    },
    {
      persona: 'trader',
      cost: 2,
      name: 'Crypto Trader',
      description: 'Market insights & strategies'
    }
  ]

  // Initialize credits when component mounts
  useEffect(() => {
    const initializeCredits = async () => {
      try {
        const response = await fetch('/api/credits/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
        if (response.ok) {
          const data = await response.json()
          if (data.refreshed) {
            refetchBalance()
          }
        }
      } catch (error) {
        console.error('Failed to initialize credits:', error)
      } finally {
        setIsInitializing(false)
      }
    }

    initializeCredits()
  }, [refetchBalance])

  const canAffordPersona = useCallback((persona: AIPersona): boolean => {
    const personaCost = personaCosts.find(p => p.persona === persona)
    if (!personaCost) return false
    return canUseFeature(`chat_${persona}`, personaCost.cost)
  }, [canUseFeature, personaCosts])

  const getPersonaCost = useCallback((persona: AIPersona): number => {
    const personaCost = personaCosts.find(p => p.persona === persona)
    return personaCost?.cost || 1
  }, [personaCosts])

  const getPersonaInfo = useCallback((persona: AIPersona): PersonaCost | undefined => {
    return personaCosts.find(p => p.persona === persona)
  }, [personaCosts])

  const getCreditStatus = useCallback(() => {
    if (isInitializing) {
      return { status: 'loading', message: 'Initializing credits...' }
    }

    if (!creditBalance) {
      return { status: 'error', message: 'Unable to load credit balance' }
    }

    const balance = creditBalance.balance || 0

    if (balance === 0) {
      return { 
        status: 'empty', 
        message: 'No credits available. Upgrade your subscription to continue chatting.' 
      }
    }

    if (balance < 5) {
      return { 
        status: 'low', 
        message: `Only ${balance} credits remaining. Consider purchasing more credits.` 
      }
    }

    return { 
      status: 'good', 
      message: `${balance} credits available` 
    }
  }, [creditBalance, isInitializing])

  const purchaseCredits = useCallback(async (packSize: 50 | 200 | 500) => {
    try {
      const response = await fetch('/api/credits/purchase-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packSize })
      })

      if (!response.ok) {
        throw new Error('Failed to purchase credits')
      }

      const data = await response.json()
      
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        refetchBalance()
      }
      
      return data
    } catch (error) {
      console.error('Error purchasing credits:', error)
      throw error
    }
  }, [refetchBalance])

  const getSubscriptionLimits = useCallback(() => {
    const limits = {
      free: { monthly: 3, personas: ['buddy'] },
      pro: { monthly: 50, personas: ['buddy', 'professor'] },
      elite: { monthly: 200, personas: ['buddy', 'professor', 'trader'] }
    }

    return limits[subscriptionTier || 'free'] || limits.free
  }, [subscriptionTier])

  const canAccessPersona = useCallback((persona: AIPersona): boolean => {
    const limits = getSubscriptionLimits()
    return limits.personas.includes(persona)
  }, [getSubscriptionLimits])

  return {
    creditBalance: creditBalance?.balance || 0,
    subscriptionTier,
    personaCosts,
    isInitializing,
    canAffordPersona,
    canAccessPersona,
    getPersonaCost,
    getPersonaInfo,
    getCreditStatus,
    purchaseCredits,
    getSubscriptionLimits,
    refetchBalance
  }
}