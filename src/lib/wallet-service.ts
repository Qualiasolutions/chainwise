import { ethers } from 'ethers';
import axios from 'axios';
import { CryptoService } from './crypto-service';

export interface WalletBalance {
  address: string;
  chain: string;
  tokens: TokenBalance[];
  totalValueUSD: number;
}

export interface TokenBalance {
  symbol: string;
  name: string;
  balance: number;
  decimals: number;
  priceUSD: number;
  valueUSD: number;
  contractAddress?: string;
  logo?: string;
}

export interface ExchangeConnection {
  exchange: string;
  apiKey?: string;
  apiSecret?: string;
  balances?: TokenBalance[];
  totalValueUSD?: number;
}

export class WalletService {
  private static MORALIS_API_KEY = 'YOUR_MORALIS_API_KEY'; // Get from moralis.io
  private static COVALENT_API_KEY = 'YOUR_COVALENT_API_KEY'; // Get from covalenthq.com
  
  static async getWalletBalance(address: string, chain: string = 'ethereum'): Promise<WalletBalance> {
    try {
      // For demo purposes, we'll simulate fetching wallet balances
      // In production, you'd use Moralis, Covalent, or similar APIs
      
      const mockTokens: TokenBalance[] = await this.fetchTokenBalances(address, chain);
      const totalValueUSD = mockTokens.reduce((sum, token) => sum + token.valueUSD, 0);
      
      return {
        address,
        chain,
        tokens: mockTokens,
        totalValueUSD,
      };
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      throw error;
    }
  }
  
  private static async fetchTokenBalances(address: string, chain: string): Promise<TokenBalance[]> {
    // Demo implementation - in production, use real API
    // This would typically call Moralis, Covalent, or Alchemy APIs
    
    try {
      // Simulate fetching ETH balance
      const provider = new ethers.JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/demo');
      const ethBalance = await provider.getBalance(address);
      const ethBalanceFormatted = parseFloat(ethers.formatEther(ethBalance));
      
      // Get current ETH price
      const cryptoData = await CryptoService.getTopCryptos(10);
      const ethData = cryptoData.find(c => c.symbol === 'eth');
      const ethPrice = ethData?.current_price || 0;
      
      const tokens: TokenBalance[] = [];
      
      if (ethBalanceFormatted > 0) {
        tokens.push({
          symbol: 'ETH',
          name: 'Ethereum',
          balance: ethBalanceFormatted,
          decimals: 18,
          priceUSD: ethPrice,
          valueUSD: ethBalanceFormatted * ethPrice,
          logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
        });
      }
      
      // In production, you would also fetch ERC-20 token balances
      // This requires calling token contract methods or using APIs like Moralis
      
      return tokens;
    } catch (error) {
      console.error('Error fetching token balances:', error);
      // Return demo data if real fetch fails
      return this.getDemoTokenBalances();
    }
  }
  
  private static getDemoTokenBalances(): TokenBalance[] {
    // Demo data for demonstration purposes
    return [
      {
        symbol: 'ETH',
        name: 'Ethereum',
        balance: 2.5,
        decimals: 18,
        priceUSD: 2500,
        valueUSD: 6250,
        logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
      },
      {
        symbol: 'USDT',
        name: 'Tether',
        balance: 1000,
        decimals: 6,
        priceUSD: 1,
        valueUSD: 1000,
        contractAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        logo: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
      },
      {
        symbol: 'UNI',
        name: 'Uniswap',
        balance: 50,
        decimals: 18,
        priceUSD: 6.5,
        valueUSD: 325,
        contractAddress: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
        logo: 'https://assets.coingecko.com/coins/images/12504/small/uni.jpg',
      },
    ];
  }
  
  static async connectExchange(exchange: string, credentials: any): Promise<ExchangeConnection> {
    // This would integrate with exchange APIs (Binance, Coinbase, Kraken, etc.)
    // For demo purposes, we'll return mock data
    
    const exchanges: Record<string, () => TokenBalance[]> = {
      binance: () => [
        {
          symbol: 'BTC',
          name: 'Bitcoin',
          balance: 0.5,
          decimals: 8,
          priceUSD: 43000,
          valueUSD: 21500,
          logo: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
        },
        {
          symbol: 'BNB',
          name: 'Binance Coin',
          balance: 10,
          decimals: 18,
          priceUSD: 320,
          valueUSD: 3200,
          logo: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
        },
      ],
      coinbase: () => [
        {
          symbol: 'ETH',
          name: 'Ethereum',
          balance: 1.5,
          decimals: 18,
          priceUSD: 2500,
          valueUSD: 3750,
          logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
        },
        {
          symbol: 'SOL',
          name: 'Solana',
          balance: 20,
          decimals: 9,
          priceUSD: 100,
          valueUSD: 2000,
          logo: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
        },
      ],
      kraken: () => [
        {
          symbol: 'DOT',
          name: 'Polkadot',
          balance: 100,
          decimals: 10,
          priceUSD: 7,
          valueUSD: 700,
          logo: 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png',
        },
      ],
    };
    
    const balances = exchanges[exchange.toLowerCase()]?.() || [];
    const totalValueUSD = balances.reduce((sum, token) => sum + token.valueUSD, 0);
    
    return {
      exchange,
      balances,
      totalValueUSD,
    };
  }
  
  static async getMultiChainBalance(address: string): Promise<WalletBalance[]> {
    const chains = ['ethereum', 'polygon', 'bsc', 'avalanche'];
    const balances = await Promise.all(
      chains.map(chain => this.getWalletBalance(address, chain))
    );
    
    return balances.filter(b => b.totalValueUSD > 0);
  }
  
  static calculateTotalPortfolioValue(
    walletBalances: WalletBalance[],
    exchangeConnections: ExchangeConnection[]
  ): number {
    const walletTotal = walletBalances.reduce((sum, wallet) => sum + wallet.totalValueUSD, 0);
    const exchangeTotal = exchangeConnections.reduce((sum, exchange) => sum + (exchange.totalValueUSD || 0), 0);
    
    return walletTotal + exchangeTotal;
  }
}