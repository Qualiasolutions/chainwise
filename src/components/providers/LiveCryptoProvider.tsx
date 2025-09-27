// Global Live Cryptocurrency Data Provider
'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { cryptoAPI, CryptoData } from '@/lib/crypto-api'

interface LiveCryptoContextType {
  topCoins: CryptoData[]
  allCoinsData: Array<{id: string, symbol: string, name: string}>
  livePrices: Record<string, Record<string, number>>
  globalData: {
    totalMarketCap: number
    btcDominance: number
    totalVolume: number
    marketCapChange24h: number
  }
  isLoading: boolean
  lastUpdate: Date | null
  error: string | null
  refreshData: () => Promise<void>
  getCoinPrice: (coinId: string) => number
  getCoinChange24h: (coinId: string) => number
  isLiveMode: boolean
  toggleLiveMode: () => void
}

const LiveCryptoContext = createContext<LiveCryptoContextType | null>(null)

interface LiveCryptoProviderProps {
  children: ReactNode
  updateInterval?: number
  topCoinsLimit?: number
}

export function LiveCryptoProvider({
  children,
  updateInterval = 30000, // 30 seconds
  topCoinsLimit = 100
}: LiveCryptoProviderProps) {
  const [topCoins, setTopCoins] = useState<CryptoData[]>([])
  const [allCoinsData, setAllCoinsData] = useState<Array<{id: string, symbol: string, name: string}>>([])
  const [livePrices, setLivePrices] = useState<Record<string, Record<string, number>>>({})
  const [globalData, setGlobalData] = useState({
    totalMarketCap: 0,
    btcDominance: 0,
    totalVolume: 0,
    marketCapChange24h: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLiveMode, setIsLiveMode] = useState(true)
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)

  // Fetch all coins list (static data, rarely changes)
  const fetchAllCoins = async () => {
    try {
      const coins = await cryptoAPI.getAllCoins()
      setAllCoinsData(coins)
    } catch (err) {
      console.error('Error fetching all coins:', err)
    }
  }

  // Fetch comprehensive dashboard data
  const fetchDashboardData = async () => {
    try {
      setError(null)
      const data = await cryptoAPI.getDashboardData()

      setTopCoins(data.topCoins)
      setGlobalData({
        totalMarketCap: data.totalMarketCap,
        btcDominance: data.btcDominance,
        totalVolume: data.globalData?.total_volume?.usd || 0,
        marketCapChange24h: data.globalData?.market_cap_change_percentage_24h_usd || 0
      })
      setLastUpdate(new Date())
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch crypto data')
    }
  }

  // Update live prices for all top coins
  const updateLivePrices = async () => {
    if (topCoins.length === 0) return

    try {
      const coinIds = topCoins.map(coin => coin.id)
      const prices = await cryptoAPI.getLivePrices(coinIds)

      setLivePrices(prices)

      // Update top coins with new prices
      setTopCoins(prevCoins =>
        prevCoins.map(coin => {
          const priceData = prices[coin.id]
          if (priceData?.usd) {
            return {
              ...coin,
              current_price: priceData.usd,
              price_change_percentage_24h: priceData.usd_24h_change || coin.price_change_percentage_24h,
              market_cap: priceData.usd_market_cap || coin.market_cap,
              total_volume: priceData.usd_24h_vol || coin.total_volume,
              last_updated: new Date().toISOString()
            }
          }
          return coin
        })
      )

      setLastUpdate(new Date())
      setError(null)
    } catch (err) {
      console.error('Error updating live prices:', err)
      setError('Failed to update live prices')
    }
  }

  // Initial data load
  const refreshData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        fetchDashboardData(),
        fetchAllCoins()
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Start/stop live updates
  const startLiveUpdates = () => {
    if (intervalId) {
      clearInterval(intervalId)
    }

    const id = setInterval(() => {
      if (isLiveMode) {
        updateLivePrices()
      }
    }, updateInterval)

    setIntervalId(id)
  }

  const stopLiveUpdates = () => {
    if (intervalId) {
      clearInterval(intervalId)
      setIntervalId(null)
    }
  }

  // Toggle live mode
  const toggleLiveMode = () => {
    setIsLiveMode(prev => {
      const newMode = !prev
      if (newMode) {
        startLiveUpdates()
      } else {
        stopLiveUpdates()
      }
      return newMode
    })
  }

  // Helper functions
  const getCoinPrice = (coinId: string): number => {
    return livePrices[coinId]?.usd || topCoins.find(coin => coin.id === coinId)?.current_price || 0
  }

  const getCoinChange24h = (coinId: string): number => {
    return livePrices[coinId]?.usd_24h_change || topCoins.find(coin => coin.id === coinId)?.price_change_percentage_24h || 0
  }

  // Initialize on mount
  useEffect(() => {
    refreshData()
  }, [])

  // Start live updates when data is loaded and live mode is on
  useEffect(() => {
    if (!isLoading && isLiveMode && topCoins.length > 0) {
      startLiveUpdates()
    } else {
      stopLiveUpdates()
    }

    return () => stopLiveUpdates()
  }, [isLoading, isLiveMode, topCoins.length])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLiveUpdates()
    }
  }, [])

  const contextValue: LiveCryptoContextType = {
    topCoins,
    allCoinsData,
    livePrices,
    globalData,
    isLoading,
    lastUpdate,
    error,
    refreshData,
    getCoinPrice,
    getCoinChange24h,
    isLiveMode,
    toggleLiveMode
  }

  return (
    <LiveCryptoContext.Provider value={contextValue}>
      {children}
    </LiveCryptoContext.Provider>
  )
}

// Hook to use the live crypto context
export function useLiveCrypto() {
  const context = useContext(LiveCryptoContext)
  if (!context) {
    throw new Error('useLiveCrypto must be used within a LiveCryptoProvider')
  }
  return context
}

// Live price indicator component
export function LivePriceIndicator() {
  const { isLiveMode, lastUpdate, error, toggleLiveMode } = useLiveCrypto()

  return (
    <div className="flex items-center space-x-2 text-sm">
      <button
        onClick={toggleLiveMode}
        className={`flex items-center space-x-1 px-2 py-1 rounded-full transition-colors ${
          isLiveMode
            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
        }`}
      >
        <div className={`w-2 h-2 rounded-full ${
          isLiveMode ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
        }`} />
        <span>{isLiveMode ? 'LIVE' : 'PAUSED'}</span>
      </button>

      {lastUpdate && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Updated {lastUpdate.toLocaleTimeString()}
        </span>
      )}

      {error && (
        <span className="text-xs text-red-500" title={error}>
          ⚠️ Error
        </span>
      )}
    </div>
  )
}