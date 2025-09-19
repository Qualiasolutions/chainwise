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
  const { user } = useSupabaseAuth()
  const [portfolioState, setPortfolioState] = useState<PortfolioState>({
    portfolios: [],
    loading: true,
    error: null
  })

  const fetchPortfolios = async () => {
    if (!user) {
      setPortfolioState(prev => ({ ...prev, loading: false, portfolios: [] }))
      return
    }

    try {
      const response = await fetch('/api/portfolio')

      if (!response.ok) {
        throw new Error('Failed to fetch portfolios')
      }

      const data = await response.json()

      setPortfolioState({
        portfolios: data.portfolios || [],
        loading: false,
        error: null
      })
    } catch (error: any) {
      console.error('Error fetching portfolios:', error)
      setPortfolioState({
        portfolios: [],
        loading: false,
        error: error.message || 'Failed to fetch portfolios'
      })
    }
  }

  const createPortfolio = async (name: string, description?: string) => {
    try {
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, description })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create portfolio')
      }

      const data = await response.json()

      // Refresh portfolios after creation
      await fetchPortfolios()

      return data.portfolio
    } catch (error: any) {
      console.error('Error creating portfolio:', error)
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