'use client'

import { useEffect, useState } from 'react'
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

  const fetchCreditBalance = async () => {
    if (!session) return
    
    try {
      const response = await fetch('/api/credits/balance')
      if (!response.ok) {
        throw new Error('Failed to fetch credit balance')
      }
      const data = await response.json()
      setCreditBalance(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

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

    // Free tier limitations
    if (creditBalance.tier === 'free') {
      // Add specific free tier restrictions here
      return creditBalance.balance >= requiredCredits
    }

    return creditBalance.balance >= requiredCredits
  }

  useEffect(() => {
    if (!authLoading) {
      fetchCreditBalance()
    }
  }, [session, authLoading])

  return {
    creditBalance,
    loading,
    error,
    spendCredits,
    fetchCreditHistory,
    hasCredits,
    canUseFeature,
    refetchBalance: fetchCreditBalance,
  }
}