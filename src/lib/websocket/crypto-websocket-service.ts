/**
 * Crypto WebSocket Service
 * Provides real-time cryptocurrency price updates using polling as fallback
 * (CoinGecko doesn't provide WebSocket API in free tier, so we use smart polling)
 */

import { cryptoDataService } from '../crypto-data-service';

export type PriceUpdate = {
  symbol: string;
  coinId: string;
  price: number;
  change24h: number;
  change24hPercent: number;
  timestamp: number;
};

export type PriceUpdateCallback = (updates: PriceUpdate[]) => void;

class CryptoWebSocketService {
  private subscribers: Map<string, Set<PriceUpdateCallback>> = new Map();
  private pollingInterval: NodeJS.Timeout | null = null;
  private trackedCoins: Set<string> = new Set();
  private isActive = false;
  private updateIntervalMs = 30000; // 30 seconds (respects CoinGecko rate limits)
  private lastPrices: Map<string, number> = new Map();

  /**
   * Subscribe to price updates for specific coins
   */
  subscribe(coinIds: string[], callback: PriceUpdateCallback): () => void {
    const subscriptionId = crypto.randomUUID();

    // Add coins to tracking
    coinIds.forEach(id => this.trackedCoins.add(id.toLowerCase()));

    // Store callback
    if (!this.subscribers.has(subscriptionId)) {
      this.subscribers.set(subscriptionId, new Set());
    }
    this.subscribers.get(subscriptionId)!.add(callback);

    // Start polling if not already active
    if (!this.isActive) {
      this.start();
    }

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(subscriptionId);

      // Stop polling if no more subscribers
      if (this.subscribers.size === 0) {
        this.stop();
      }
    };
  }

  /**
   * Add coins to track
   */
  trackCoins(coinIds: string[]) {
    coinIds.forEach(id => this.trackedCoins.add(id.toLowerCase()));
  }

  /**
   * Remove coins from tracking
   */
  untrackCoins(coinIds: string[]) {
    coinIds.forEach(id => this.trackedCoins.delete(id.toLowerCase()));
  }

  /**
   * Start polling for price updates
   */
  private start() {
    if (this.isActive) return;

    this.isActive = true;
    console.log('🔄 Starting real-time price updates');

    // Fetch immediately
    this.fetchAndNotify();

    // Then poll at intervals
    this.pollingInterval = setInterval(() => {
      this.fetchAndNotify();
    }, this.updateIntervalMs);
  }

  /**
   * Stop polling
   */
  private stop() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isActive = false;
    console.log('⏸️  Stopped real-time price updates');
  }

  /**
   * Fetch current prices and notify subscribers
   */
  private async fetchAndNotify() {
    if (this.trackedCoins.size === 0) return;

    try {
      const coinIds = Array.from(this.trackedCoins);
      const prices = await cryptoDataService.getBulkPrices(coinIds);

      const updates: PriceUpdate[] = [];

      for (const [coinId, data] of Object.entries(prices)) {
        const lastPrice = this.lastPrices.get(coinId);
        const currentPrice = data.usd;

        // Only notify if price changed
        if (lastPrice !== currentPrice) {
          updates.push({
            symbol: coinId.toUpperCase(),
            coinId,
            price: currentPrice,
            change24h: data.usd_24h_change || 0,
            change24hPercent: data.usd_24h_change || 0,
            timestamp: Date.now()
          });

          this.lastPrices.set(coinId, currentPrice);
        }
      }

      // Notify all subscribers if there are updates
      if (updates.length > 0) {
        console.log(`📊 Price updates for ${updates.length} coins`);
        this.notifySubscribers(updates);
      }
    } catch (error) {
      console.error('Failed to fetch price updates:', error);
    }
  }

  /**
   * Notify all subscribers of price updates
   */
  private notifySubscribers(updates: PriceUpdate[]) {
    this.subscribers.forEach(callbackSet => {
      callbackSet.forEach(callback => {
        try {
          callback(updates);
        } catch (error) {
          console.error('Subscriber callback error:', error);
        }
      });
    });
  }

  /**
   * Set update interval (in milliseconds)
   */
  setUpdateInterval(ms: number) {
    // Minimum 10 seconds to respect API rate limits
    this.updateIntervalMs = Math.max(10000, ms);

    // Restart with new interval if active
    if (this.isActive) {
      this.stop();
      this.start();
    }
  }

  /**
   * Get current update interval
   */
  getUpdateInterval(): number {
    return this.updateIntervalMs;
  }

  /**
   * Force fetch now (respects rate limits)
   */
  async fetchNow() {
    await this.fetchAndNotify();
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.isActive;
  }

  /**
   * Get tracked coins
   */
  getTrackedCoins(): string[] {
    return Array.from(this.trackedCoins);
  }

  /**
   * Get subscriber count
   */
  getSubscriberCount(): number {
    return this.subscribers.size;
  }
}

// Export singleton instance
export const cryptoWebSocketService = new CryptoWebSocketService();
