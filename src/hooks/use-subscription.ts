'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'

interface CreditBalance {
  balance: number
  tier: string
}

interface CreditTransaction {
  id: string
  transactionType: string
  amount: number
  featureUsed: string | null
  description: string | null
  createdAt: string
}

interface CreditHistory {
  transactions: CreditTransaction[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export function useSubscription() {
  const { session, loading: authLoading } = useSupabase()
  const [creditBalance, setCreditBalance] = useState<CreditBalance | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCreditBalance = useCallback(async (retryCount = 0) => {
    if (!session) return
    
    try {
      const response = await fetch('/api/credits/balance')
      if (!response.ok) {
        if (response.status === 401 && retryCount < 2) {
          // Auth might have expired, wait and retry
          await new Promise(resolve => setTimeout(resolve, 1000))
          return fetchCreditBalance(retryCount + 1)
        }
        throw new Error(`Failed to fetch credit balance: ${response.status}`)
      }
      const data = await response.json()
      setCreditBalance(data)
      setError(null) // Clear any previous errors
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Credit balance fetch error:', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [session])

  const spendCredits = async (amount: number, featureUsed: string, description?: string) => {
    try {
      const response = await fetch('/api/credits/spend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, featureUsed, description }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to spend credits')
      }

      const data = await response.json()
      
      // Update local state
      if (creditBalance) {
        setCreditBalance({
          ...creditBalance,
          balance: data.newBalance,
        })
      }

      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to spend credits')
    }
  }

  const fetchCreditHistory = async (page = 1, limit = 20): Promise<CreditHistory> => {
    const response = await fetch(`/api/credits/history?page=${page}&limit=${limit}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch credit history')
    }

    return response.json()
  }

  const hasCredits = (amount: number): boolean => {
    return creditBalance ? creditBalance.balance >= amount : false
  }

  const canUseFeature = (feature: string, requiredCredits: number): boolean => {
    if (!session) return false
    if (!creditBalance) return false

    // Check subscription tier restrictions for chat features
    if (feature.includes('chat_professor') && creditBalance.tier === 'free') {
      return false
    }
    
    if (feature.includes('chat_trader') && (creditBalance.tier === 'free' || creditBalance.tier === 'pro')) {
      return false
    }

    // Check if user has enough credits
    return creditBalance.balance >= requiredCredits
  }

  useEffect(() => {
    if (!authLoading) {
      fetchCreditBalance()
    }
  }, [session, authLoading, fetchCreditBalance])

  return {
    creditBalance,
    subscriptionTier: creditBalance?.tier || 'free',
    loading,
    error,
    spendCredits,
    fetchCreditHistory,
    hasCredits,
    canUseFeature,
    refetchBalance: fetchCreditBalance,
  }
}