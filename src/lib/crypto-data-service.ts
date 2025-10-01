// Real-time Crypto Data Service for AI Integration
import { cryptoAPI } from './crypto-api'

export interface MarketData {
  bitcoin: {
    price: number
    change24h: number
    change24hPercent: number
    marketCap: number
    volume: number
    high24h: number
    low24h: number
    ath: number
    athChange: number
  }
  ethereum: {
    price: number
    change24h: number
    change24hPercent: number
    marketCap: number
    volume: number
    high24h: number
    low24h: number
    ath: number
    athChange: number
  }
  marketSentiment: {
    dominanceBTC: number
    totalMarketCap: number
    fearGreedIndex?: number
    trendingSentiment: 'bullish' | 'bearish' | 'neutral'
  }
  topMovers: Array<{
    symbol: string
    name: string
    price: number
    change24hPercent: number
  }>
  lastUpdated: string
}

export interface TechnicalAnalysis {
  support: number
  resistance: number
  trend: 'bullish' | 'bearish' | 'neutral'
  riskReward: string
  recommendation: 'buy' | 'sell' | 'hold'
  timeframe: string
}

class CryptoDataService {
  private marketDataCache: MarketData | null = null
  private lastFetch: number = 0
  private readonly CACHE_DURATION = 2 * 60 * 1000 // 2 minutes cache

  async getCurrentMarketData(): Promise<MarketData> {
    const now = Date.now()

    // Return cached data if still fresh (within 2 minutes)
    if (this.marketDataCache && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.marketDataCache
    }

    try {
      console.log('🔄 Fetching fresh market data for AI...')

      // Fetch top cryptocurrencies
      const topCryptos = await cryptoAPI.getTopCryptos(10)
      const bitcoin = topCryptos.find(c => c.id === 'bitcoin')
      const ethereum = topCryptos.find(c => c.id === 'ethereum')

      if (!bitcoin || !ethereum) {
        throw new Error('Could not fetch Bitcoin or Ethereum data')
      }

      // Calculate market sentiment
      const totalMarketCap = topCryptos.reduce((sum, crypto) => sum + crypto.market_cap, 0)
      const dominanceBTC = (bitcoin.market_cap / totalMarketCap) * 100

      // Determine trending sentiment based on top 5 cryptos performance
      const topFiveChanges = topCryptos.slice(0, 5).map(c => c.price_change_percentage_24h)
      const avgChange = topFiveChanges.reduce((sum, change) => sum + change, 0) / topFiveChanges.length
      const trendingSentiment = avgChange > 2 ? 'bullish' : avgChange < -2 ? 'bearish' : 'neutral'

      // Get top movers (highest gainers from top 20)
      const topMovers = topCryptos
        .slice(0, 20)
        .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
        .slice(0, 5)
        .map(crypto => ({
          symbol: crypto.symbol.toUpperCase(),
          name: crypto.name,
          price: crypto.current_price,
          change24hPercent: crypto.price_change_percentage_24h
        }))

      this.marketDataCache = {
        bitcoin: {
          price: bitcoin.current_price,
          change24h: bitcoin.price_change_24h,
          change24hPercent: bitcoin.price_change_percentage_24h,
          marketCap: bitcoin.market_cap,
          volume: bitcoin.total_volume,
          high24h: bitcoin.high_24h,
          low24h: bitcoin.low_24h,
          ath: bitcoin.ath,
          athChange: bitcoin.ath_change_percentage
        },
        ethereum: {
          price: ethereum.current_price,
          change24h: ethereum.price_change_24h,
          change24hPercent: ethereum.price_change_percentage_24h,
          marketCap: ethereum.market_cap,
          volume: ethereum.total_volume,
          high24h: ethereum.high_24h,
          low24h: ethereum.low_24h,
          ath: ethereum.ath,
          athChange: ethereum.ath_change_percentage
        },
        marketSentiment: {
          dominanceBTC: Math.round(dominanceBTC * 100) / 100,
          totalMarketCap: totalMarketCap,
          trendingSentiment
        },
        topMovers,
        lastUpdated: new Date().toISOString()
      }

      this.lastFetch = now
      console.log('✅ Fresh market data cached for AI responses')

      return this.marketDataCache
    } catch (error) {
      console.error('❌ Error fetching market data:', error)

      // Return fallback data if API fails
      return this.getFallbackMarketData()
    }
  }

  generateTechnicalAnalysis(symbol: string, price: number, change24hPercent: number, high24h: number, low24h: number): TechnicalAnalysis {
    // Simple technical analysis based on price action
    const currentRange = high24h - low24h
    const pricePosition = (price - low24h) / currentRange

    // Calculate support and resistance levels
    const support = low24h * 0.995 // Slightly below 24h low
    const resistance = high24h * 1.005 // Slightly above 24h high

    // Determine trend
    let trend: 'bullish' | 'bearish' | 'neutral'
    if (change24hPercent > 3) trend = 'bullish'
    else if (change24hPercent < -3) trend = 'bearish'
    else trend = 'neutral'

    // Calculate risk-reward based on position in range
    const upside = (resistance - price) / price * 100
    const downside = (price - support) / price * 100
    const riskReward = `1:${Math.round((upside / Math.max(downside, 1)) * 10) / 10}`

    // Generate recommendation
    let recommendation: 'buy' | 'sell' | 'hold'
    if (trend === 'bullish' && pricePosition < 0.7) recommendation = 'buy'
    else if (trend === 'bearish' && pricePosition > 0.3) recommendation = 'sell'
    else recommendation = 'hold'

    return {
      support: Math.round(support * 100) / 100,
      resistance: Math.round(resistance * 100) / 100,
      trend,
      riskReward,
      recommendation,
      timeframe: '24h'
    }
  }

  formatMarketDataForAI(data: MarketData, persona: 'buddy' | 'professor' | 'trader'): string {
    const btc = data.bitcoin
    const eth = data.ethereum
    const sentiment = data.marketSentiment

    if (persona === 'buddy') {
      return `CURRENT CRYPTO MARKET (Live Data):
💰 Bitcoin: $${btc.price.toLocaleString()} (${btc.change24hPercent >= 0 ? '+' : ''}${btc.change24hPercent.toFixed(2)}% today)
💎 Ethereum: $${eth.price.toLocaleString()} (${eth.change24hPercent >= 0 ? '+' : ''}${eth.change24hPercent.toFixed(2)}% today)
📊 Market Mood: ${sentiment.trendingSentiment}
🔥 Today's Top Movers: ${data.topMovers.slice(0, 3).map(m => `${m.symbol} ${m.change24hPercent >= 0 ? '+' : ''}${m.change24hPercent.toFixed(1)}%`).join(', ')}
⏰ Updated: ${new Date(data.lastUpdated).toLocaleTimeString()}`
    }

    if (persona === 'professor') {
      return `MARKET ANALYSIS DATA (Real-Time):
Bitcoin: $${btc.price.toLocaleString()} | 24h: ${btc.change24hPercent >= 0 ? '+' : ''}${btc.change24hPercent.toFixed(2)}% | Vol: $${(btc.volume / 1e9).toFixed(1)}B
Ethereum: $${eth.price.toLocaleString()} | 24h: ${eth.change24hPercent >= 0 ? '+' : ''}${eth.change24hPercent.toFixed(2)}% | Vol: $${(eth.volume / 1e9).toFixed(1)}B
Market Cap: $${(sentiment.totalMarketCap / 1e12).toFixed(2)}T | BTC Dominance: ${sentiment.dominanceBTC}%
Sentiment: ${sentiment.trendingSentiment.toUpperCase()}
Data as of: ${new Date(data.lastUpdated).toLocaleTimeString()}`
    }

    if (persona === 'trader') {
      const btcTA = this.generateTechnicalAnalysis('BTC', btc.price, btc.change24hPercent, btc.high24h, btc.low24h)
      const ethTA = this.generateTechnicalAnalysis('ETH', eth.price, eth.change24hPercent, eth.high24h, eth.low24h)

      return `TRADING DATA (Live):
BTC: $${btc.price.toLocaleString()} | ${btc.change24hPercent >= 0 ? '+' : ''}${btc.change24hPercent.toFixed(2)}% | S: $${btcTA.support.toLocaleString()} | R: $${btcTA.resistance.toLocaleString()} | ${btcTA.trend.toUpperCase()} | R/R: ${btcTA.riskReward}
ETH: $${eth.price.toLocaleString()} | ${eth.change24hPercent >= 0 ? '+' : ''}${eth.change24hPercent.toFixed(2)}% | S: $${ethTA.support.toLocaleString()} | R: $${ethTA.resistance.toLocaleString()} | ${ethTA.trend.toUpperCase()} | R/R: ${ethTA.riskReward}
Sentiment: ${sentiment.trendingSentiment.toUpperCase()} | Movers: ${data.topMovers.slice(0, 2).map(m => `${m.symbol} ${m.change24hPercent >= 0 ? '+' : ''}${m.change24hPercent.toFixed(1)}%`).join(', ')}
Timestamp: ${new Date(data.lastUpdated).toLocaleTimeString()}`
    }

    return ''
  }

  private getFallbackMarketData(): MarketData {
    // Fallback data when API fails
    const now = new Date().toISOString()

    return {
      bitcoin: {
        price: 112869,
        change24h: 1450,
        change24hPercent: 1.3,
        marketCap: 2232000000000,
        volume: 28500000000,
        high24h: 115000,
        low24h: 110000,
        ath: 115000,
        athChange: -1.8
      },
      ethereum: {
        price: 4423,
        change24h: 25,
        change24hPercent: 0.57,
        marketCap: 532000000000,
        volume: 15200000000,
        high24h: 4450,
        low24h: 4380,
        ath: 4878,
        athChange: -9.3
      },
      marketSentiment: {
        dominanceBTC: 54.5,
        totalMarketCap: 2800000000000,
        trendingSentiment: 'neutral'
      },
      topMovers: [
        { symbol: 'BTC', name: 'Bitcoin', price: 112869, change24hPercent: 1.3 },
        { symbol: 'ETH', name: 'Ethereum', price: 4423, change24hPercent: 0.57 },
        { symbol: 'SOL', name: 'Solana', price: 256, change24hPercent: 2.1 }
      ],
      lastUpdated: now
    }
  }

  // Method to get specific crypto price for direct questions
  async getCryptoPrice(symbol: string): Promise<{ price: number; change24hPercent: number; name: string } | null> {
    try {
      const cryptoMap: Record<string, string> = {
        'btc': 'bitcoin',
        'bitcoin': 'bitcoin',
        'eth': 'ethereum',
        'ethereum': 'ethereum',
        'bnb': 'binancecoin',
        'sol': 'solana',
        'solana': 'solana',
        'ada': 'cardano',
        'cardano': 'cardano',
        'xrp': 'ripple'
      }

      const cryptoId = cryptoMap[symbol.toLowerCase()]
      if (!cryptoId) return null

      const crypto = await cryptoAPI.getCrypto(cryptoId)
      return {
        price: crypto.current_price,
        change24hPercent: crypto.price_change_percentage_24h,
        name: crypto.name
      }
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error)
      return null
    }
  }

  // Method to get bulk prices for WebSocket service
  async getBulkPrices(coinIds: string[]): Promise<Record<string, any>> {
    try {
      // Use CoinGecko's simple/price endpoint for bulk fetching
      const prices = await cryptoAPI.getSimplePrice(coinIds, ['usd'])
      return prices
    } catch (error) {
      console.error('Error fetching bulk prices:', error)
      return {}
    }
  }
}

export const cryptoDataService = new CryptoDataService()