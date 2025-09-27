// Real-time cryptocurrency data hook for live updates
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { cryptoAPI, CryptoData } from '@/lib/crypto-api'

export interface LiveCryptoHookOptions {
  updateIntervalMs?: number
  autoStart?: boolean
  coinIds?: string[]
  limit?: number
}

export function useLiveCryptoData(options: LiveCryptoHookOptions = {}) {
  const {
    updateIntervalMs = 30000, // 30 seconds default
    autoStart = true,
    coinIds = [],
    limit = 50
  } = options

  const [cryptoData, setCryptoData] = useState<CryptoData[]>([])
  const [prices, setPrices] = useState<Record<string, Record<string, number>>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [isLive, setIsLive] = useState(false)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)

  // Fetch initial data
  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let data: CryptoData[]
      if (coinIds.length > 0) {
        // Fetch specific coins
        const specificCoins = await Promise.all(
          coinIds.map(id => cryptoAPI.getCrypto(id).catch(() => null))
        )
        data = specificCoins.filter(Boolean) as CryptoData[]
      } else {
        // Fetch top coins
        data = await cryptoAPI.getLiveMarketData(limit)
      }

      if (mountedRef.current) {
        setCryptoData(data)
        setLastUpdate(new Date())
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to fetch crypto data')
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [coinIds, limit])

  // Update live prices
  const updateLivePrices = useCallback(async () => {
    try {
      const currentCoinIds = coinIds.length > 0 ? coinIds : cryptoData.map(coin => coin.id)
      if (currentCoinIds.length === 0) return

      const livePrices = await cryptoAPI.getLivePrices(currentCoinIds)

      if (mountedRef.current) {
        setPrices(livePrices)
        setLastUpdate(new Date())

        // Update crypto data with new prices
        setCryptoData(prevData =>
          prevData.map(coin => {
            const priceData = livePrices[coin.id]
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
      }
    } catch (err) {
      console.error('Error updating live prices:', err)
      if (mountedRef.current) {
        setError('Failed to update live prices')
      }
    }
  }, [coinIds, cryptoData])

  // Start live updates
  const startLiveUpdates = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    setIsLive(true)

    // Update immediately
    updateLivePrices()

    // Set up interval for regular updates
    intervalRef.current = setInterval(updateLivePrices, updateIntervalMs)
  }, [updateLivePrices, updateIntervalMs])

  // Stop live updates
  const stopLiveUpdates = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsLive(false)
  }, [])

  // Refresh data manually
  const refreshData = useCallback(async () => {
    await fetchInitialData()
    if (isLive) {
      updateLivePrices()
    }
  }, [fetchInitialData, updateLivePrices, isLive])

  // Initialize on mount
  useEffect(() => {
    fetchInitialData()

    if (autoStart) {
      // Start live updates after initial data load
      const timer = setTimeout(() => {
        if (mountedRef.current && !loading) {
          startLiveUpdates()
        }
      }, 2000) // Wait 2 seconds for initial data

      return () => clearTimeout(timer)
    }
  }, [fetchInitialData, autoStart, startLiveUpdates, loading])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
      stopLiveUpdates()
    }
  }, [stopLiveUpdates])

  return {
    cryptoData,
    prices,
    loading,
    error,
    lastUpdate,
    isLive,
    startLiveUpdates,
    stopLiveUpdates,
    refreshData,
    // Helper functions
    getCoinPrice: (coinId: string) => prices[coinId]?.usd || 0,
    getCoinChange: (coinId: string) => prices[coinId]?.usd_24h_change || 0,
    isDataStale: lastUpdate ? Date.now() - lastUpdate.getTime() > updateIntervalMs * 2 : true
  }
}

// Hook for monitoring specific coins with callbacks
export function useLivePriceMonitoring(coinIds: string[], callback?: (prices: Record<string, Record<string, number>>) => void) {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [lastPrices, setLastPrices] = useState<Record<string, Record<string, number>>>({})

  const startMonitoring = useCallback(() => {
    if (coinIds.length === 0) return

    cryptoAPI.startLivePriceMonitoring(coinIds, 30000)
    setIsMonitoring(true)

    // Subscribe to price updates
    const updateHandler = (prices: Record<string, Record<string, number>>) => {
      setLastPrices(prices)
      callback?.(prices)
    }

    // Set up price subscription (mock for now - would use WebSocket in production)
    const interval = setInterval(async () => {
      try {
        const prices = await cryptoAPI.getLivePrices(coinIds)
        updateHandler(prices)
      } catch (error) {
        console.error('Price monitoring error:', error)
      }
    }, 30000)

    return () => {
      clearInterval(interval)
      cryptoAPI.stopLivePriceMonitoring()
      setIsMonitoring(false)
    }
  }, [coinIds, callback])

  const stopMonitoring = useCallback(() => {
    cryptoAPI.stopLivePriceMonitoring()
    setIsMonitoring(false)
  }, [])

  return {
    isMonitoring,
    lastPrices,
    startMonitoring,
    stopMonitoring
  }
}