import axios from 'axios';
import { CryptoData, MarketStats } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_COINGECKO_API_URL || 'https://api.coingecko.com/api/v3';

export class CryptoService {
  static async getTopCryptos(limit = 20): Promise<CryptoData[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: limit,
          page: 1,
          sparkline: true,
          price_change_percentage: '24h',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      return [];
    }
  }

  static async getCryptoById(id: string): Promise<CryptoData | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/coins/${id}`, {
        params: {
          localization: false,
          tickers: false,
          market_data: true,
          community_data: false,
          developer_data: false,
        },
      });
      
      const data = response.data;
      return {
        id: data.id,
        symbol: data.symbol,
        name: data.name,
        image: data.image.large,
        current_price: data.market_data.current_price.usd,
        market_cap: data.market_data.market_cap.usd,
        market_cap_rank: data.market_cap_rank,
        price_change_percentage_24h: data.market_data.price_change_percentage_24h,
        total_volume: data.market_data.total_volume.usd,
        high_24h: data.market_data.high_24h.usd,
        low_24h: data.market_data.low_24h.usd,
      };
    } catch (error) {
      console.error('Error fetching crypto by id:', error);
      return null;
    }
  }

  static async searchCrypto(query: string): Promise<CryptoData[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/search`, {
        params: { query },
      });
      
      const coinIds = response.data.coins.slice(0, 10).map((coin: any) => coin.id);
      
      if (coinIds.length === 0) return [];
      
      const marketData = await axios.get(`${API_BASE_URL}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          ids: coinIds.join(','),
          order: 'market_cap_desc',
          sparkline: false,
        },
      });
      
      return marketData.data;
    } catch (error) {
      console.error('Error searching crypto:', error);
      return [];
    }
  }

  static async getMarketStats(): Promise<MarketStats | null> {
    try {
      const [globalData, topCryptos] = await Promise.all([
        axios.get(`${API_BASE_URL}/global`),
        this.getTopCryptos(100),
      ]);

      const topGainers = [...topCryptos]
        .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
        .slice(0, 5);
      
      const topLosers = [...topCryptos]
        .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
        .slice(0, 5);

      return {
        totalMarketCap: globalData.data.data.total_market_cap.usd,
        totalVolume: globalData.data.data.total_volume.usd,
        marketCapChangePercentage24h: globalData.data.data.market_cap_change_percentage_24h_usd,
        bitcoinDominance: globalData.data.data.market_cap_percentage.btc,
        topGainers,
        topLosers,
      };
    } catch (error) {
      console.error('Error fetching market stats:', error);
      return null;
    }
  }

  static async getMultipleCryptos(cryptoIds: string[]): Promise<CryptoData[]> {
    try {
      if (cryptoIds.length === 0) return [];
      
      const response = await axios.get(`${API_BASE_URL}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          ids: cryptoIds.join(','),
          order: 'market_cap_desc',
          sparkline: false,
          price_change_percentage: '24h',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching multiple crypto data:', error);
      return [];
    }
  }

  static async getCurrentPrice(cryptoId: string): Promise<number | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/simple/price`, {
        params: {
          ids: cryptoId,
          vs_currencies: 'usd',
          include_24hr_change: true,
        },
      });
      
      const data = response.data[cryptoId];
      return data ? data.usd : null;
    } catch (error) {
      console.error('Error fetching current price:', error);
      return null;
    }
  }

  static async getCurrentPrices(cryptoIds: string[]): Promise<Record<string, { price: number; change24h: number }>> {
    try {
      if (cryptoIds.length === 0) return {};
      
      const response = await axios.get(`${API_BASE_URL}/simple/price`, {
        params: {
          ids: cryptoIds.join(','),
          vs_currencies: 'usd',
          include_24hr_change: true,
        },
      });
      
      const result: Record<string, { price: number; change24h: number }> = {};
      for (const [id, data] of Object.entries(response.data as Record<string, any>)) {
        result[id] = {
          price: data.usd,
          change24h: data.usd_24h_change || 0,
        };
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching current prices:', error);
      return {};
    }
  }

  static async getPriceHistory(coinId: string, days: number = 7): Promise<ChartData[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/coins/${coinId}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days,
        },
      });

      return response.data.prices.map(([timestamp, price]: [number, number]) => ({
        time: new Date(timestamp).toLocaleDateString(),
        price,
      }));
    } catch (error) {
      console.error('Error fetching price history:', error);
      return [];
    }
  }
}

interface ChartData {
  time: string;
  price: number;
}