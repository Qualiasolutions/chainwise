import { useEffect, useState, useCallback, useRef } from 'react';
import { cryptoWebSocketService, PriceUpdate } from '@/lib/websocket/crypto-websocket-service';

export interface RealTimePriceData {
  [coinId: string]: {
    price: number;
    change24hPercent: number;
    lastUpdate: number;
    isStale: boolean;
  };
}

export interface UseRealTimePricesOptions {
  updateInterval?: number; // milliseconds
  enabled?: boolean;
}

/**
 * Hook to subscribe to real-time cryptocurrency price updates
 * @param coinIds Array of CoinGecko coin IDs to track (e.g., ['bitcoin', 'ethereum'])
 * @param options Configuration options
 * @returns Current prices, connection status, and control functions
 */
export function useRealTimePrices(
  coinIds: string[],
  options: UseRealTimePricesOptions = {}
) {
  const { updateInterval = 30000, enabled = true } = options;

  const [prices, setPrices] = useState<RealTimePriceData>({});
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Handle price updates
  const handlePriceUpdate = useCallback((updates: PriceUpdate[]) => {
    setPrices(currentPrices => {
      const newPrices = { ...currentPrices };

      updates.forEach(update => {
        newPrices[update.coinId] = {
          price: update.price,
          change24hPercent: update.change24hPercent,
          lastUpdate: update.timestamp,
          isStale: false
        };
      });

      return newPrices;
    });
  }, []);

  // Mark prices as stale after timeout
  useEffect(() => {
    const staleCheckInterval = setInterval(() => {
      const now = Date.now();
      const staleThreshold = updateInterval * 2; // Consider stale if 2x update interval passed

      setPrices(currentPrices => {
        const updatedPrices = { ...currentPrices };
        let hasChanges = false;

        Object.keys(updatedPrices).forEach(coinId => {
          const priceData = updatedPrices[coinId];
          if (now - priceData.lastUpdate > staleThreshold) {
            if (!priceData.isStale) {
              updatedPrices[coinId] = { ...priceData, isStale: true };
              hasChanges = true;
            }
          }
        });

        return hasChanges ? updatedPrices : currentPrices;
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(staleCheckInterval);
  }, [updateInterval]);

  // Subscribe to price updates
  useEffect(() => {
    if (!enabled || coinIds.length === 0) {
      setIsConnected(false);
      return;
    }

    try {
      setError(null);
      setIsConnected(true);

      // Set update interval
      cryptoWebSocketService.setUpdateInterval(updateInterval);

      // Subscribe to updates
      const unsubscribe = cryptoWebSocketService.subscribe(
        coinIds,
        handlePriceUpdate
      );

      unsubscribeRef.current = unsubscribe;

      // Cleanup on unmount or when dependencies change
      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
        setIsConnected(false);
      };
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to connect'));
      setIsConnected(false);
    }
  }, [coinIds.join(','), updateInterval, enabled, handlePriceUpdate]);

  // Force refresh prices now
  const refreshNow = useCallback(async () => {
    try {
      setError(null);
      await cryptoWebSocketService.fetchNow();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh'));
    }
  }, []);

  // Get price for specific coin
  const getPrice = useCallback((coinId: string) => {
    return prices[coinId] || null;
  }, [prices]);

  return {
    prices,
    isConnected,
    error,
    refreshNow,
    getPrice
  };
}

/**
 * Hook for single coin price tracking
 */
export function useRealTimeCoinPrice(
  coinId: string,
  options: UseRealTimePricesOptions = {}
) {
  const { prices, isConnected, error, refreshNow } = useRealTimePrices(
    [coinId],
    options
  );

  return {
    price: prices[coinId]?.price || null,
    change24hPercent: prices[coinId]?.change24hPercent || null,
    lastUpdate: prices[coinId]?.lastUpdate || null,
    isStale: prices[coinId]?.isStale || false,
    isConnected,
    error,
    refreshNow
  };
}
