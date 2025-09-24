"use client"

import { useState, useEffect } from 'react'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'

export interface PortfolioHolding {
  id: string
  symbol: string
  name: string
  amount: number
  purchase_price: number
  purchase_date: string
  current_price: number | null
}

export interface Portfolio {
  id: string
  user_id: string
  name: string
  description: string | null
  is_default: boolean
  total_value: number
  created_at: string
  updated_at: string
  portfolio_holdings: PortfolioHolding[]
  metrics: {
    totalValue: number
    totalInvested: number
    totalPnL: number
    totalPnLPercentage: number
    holdingsCount: number
  }
}

interface PortfolioState {
  portfolios: Portfolio[]
  loading: boolean
  error: string | null
}

export const usePortfolio = () => {
  const { user, profile } = useSupabaseAuth()
  const [portfolioState, setPortfolioState] = useState<PortfolioState>({
    portfolios: [],
    loading: true,
    error: null
  })

  const fetchPortfolios = async (retryCount = 0) => {
    console.log(`🔍 Fetching portfolios (attempt ${retryCount + 1})`, {
      hasUser: !!user,
      hasProfile: !!profile,
      authId: user?.auth_id,
      profileId: profile?.id
    })

    if (!user?.auth_id) {
      console.log('❌ No user auth_id found, cannot fetch portfolios')
      setPortfolioState(prev => ({ ...prev, loading: false, portfolios: [], error: null }))
      return
    }

    try {
      const response = await fetch(`/api/portfolio?auth_id=${encodeURIComponent(user.auth_id)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        // Add credentials to ensure cookies are sent
        credentials: 'same-origin'
      })

      console.log('📡 Portfolio API response:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`

        console.error('❌ Portfolio API error:', { status: response.status, error: errorMessage })
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('✅ Portfolio data received:', {
        portfolioCount: data.portfolios?.length || 0,
        hasDebug: !!data.debug,
        success: data.success,
        fallback: data.fallback
      })

      setPortfolioState({
        portfolios: data.portfolios || [],
        loading: false,
        error: null
      })

    } catch (error: any) {
      console.error(`❌ Error fetching portfolios (attempt ${retryCount + 1}):`, error)

      // Retry logic for transient errors
      if (retryCount < 2 && (
        error.message?.includes('fetch') ||
        error.message?.includes('network') ||
        error.message?.includes('timeout') ||
        error.message?.includes('500') ||
        error.message?.includes('502') ||
        error.message?.includes('503')
      )) {
        const retryDelay = (retryCount + 1) * 2000 // 2s, 4s, 6s
        console.log(`🔄 Retrying portfolio fetch in ${retryDelay}ms...`)

        setTimeout(() => {
          fetchPortfolios(retryCount + 1)
        }, retryDelay)
        return
      }

      setPortfolioState({
        portfolios: [],
        loading: false,
        error: error.message || 'Failed to fetch portfolios'
      })
    }
  }

  const createPortfolio = async (name: string, description?: string, retryCount = 0) => {
    console.log(`🔨 Creating portfolio "${name}" (attempt ${retryCount + 1})`, {
      hasUser: !!user,
      authId: user?.auth_id,
      description: description?.substring(0, 50)
    })

    if (!user?.auth_id) {
      console.log('❌ No user auth_id found, cannot create portfolio')
      throw new Error('User not authenticated')
    }

    try {
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, description, authId: user.auth_id }),
        credentials: 'same-origin'
      })

      console.log('📡 Portfolio creation API response:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`

        console.error('❌ Portfolio creation API error:', { status: response.status, error: errorMessage })
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('✅ Portfolio created successfully:', {
        portfolioId: data.portfolio?.id,
        success: data.success
      })

      // Refresh portfolios after creation
      await fetchPortfolios()

      return data.portfolio
    } catch (error: any) {
      console.error(`❌ Error creating portfolio (attempt ${retryCount + 1}):`, error)

      // Retry logic for transient errors
      if (retryCount < 2 && (
        error.message?.includes('fetch') ||
        error.message?.includes('network') ||
        error.message?.includes('timeout') ||
        error.message?.includes('500') ||
        error.message?.includes('502') ||
        error.message?.includes('503')
      )) {
        const retryDelay = (retryCount + 1) * 2000 // 2s, 4s
        console.log(`🔄 Retrying portfolio creation in ${retryDelay}ms...`)

        await new Promise(resolve => setTimeout(resolve, retryDelay))
        return await createPortfolio(name, description, retryCount + 1)
      }

      throw error
    }
  }

  const getDefaultPortfolio = () => {
    return portfolioState.portfolios.find(p => p.is_default) || portfolioState.portfolios[0] || null
  }

  const getTotalPortfolioValue = () => {
    return portfolioState.portfolios.reduce((total, portfolio) => {
      return total + (portfolio.metrics?.totalValue || 0)
    }, 0)
  }

  const getTotalPortfolioPnL = () => {
    return portfolioState.portfolios.reduce((total, portfolio) => {
      return total + (portfolio.metrics?.totalPnL || 0)
    }, 0)
  }

  const getTotalPortfolioPnLPercentage = () => {
    const totalInvested = portfolioState.portfolios.reduce((total, portfolio) => {
      return total + (portfolio.metrics?.totalInvested || 0)
    }, 0)

    if (totalInvested === 0) return 0

    const totalPnL = getTotalPortfolioPnL()
    return (totalPnL / totalInvested) * 100
  }

  useEffect(() => {
    fetchPortfolios()
  }, [user])

  // Refresh portfolios every 5 minutes to get updated prices
  useEffect(() => {
    if (!user?.auth_id) return

    const interval = setInterval(() => {
      fetchPortfolios()
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [user])

  return {
    ...portfolioState,
    fetchPortfolios,
    createPortfolio,
    getDefaultPortfolio,
    getTotalPortfolioValue,
    getTotalPortfolioPnL,
    getTotalPortfolioPnLPercentage
  }
}