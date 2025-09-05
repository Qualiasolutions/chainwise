export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  sparkline_in_7d?: {
    price: number[];
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface Portfolio {
  id: string;
  userId: string;
  holdings: PortfolioHolding[];
  totalValue: number;
  totalCost: number;
  profitLoss: number;
  profitLossPercentage: number;
  lastUpdated: Date;
}

export interface PortfolioHolding {
  id: string;
  cryptoId: string;
  symbol: string;
  name: string;
  amount: number;
  purchasePrice: number;
  currentPrice: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercentage: number;
  purchaseDate: Date;
}

export interface MarketStats {
  totalMarketCap: number;
  totalVolume: number;
  marketCapChangePercentage24h: number;
  bitcoinDominance: number;
  topGainers: CryptoData[];
  topLosers: CryptoData[];
}

export interface ChartData {
  time: string;
  price: number;
  volume?: number;
}