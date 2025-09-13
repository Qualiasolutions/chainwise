import { MoralisService } from './moralis-service'

export interface TokenBalance {
  symbol: string
  name: string
  balance: string
  decimals: number
  valueUSD: number
  contractAddress: string
  logo?: string
}

export interface WalletBalance {
  address: string
  chain: string
  tokens: TokenBalance[]
  totalValueUSD: number
}

export interface ExchangeConnection {
  exchange: 'binance' | 'coinbase' | 'kraken' | 'other'
  apiKey: string
  apiSecret?: string
  balances?: TokenBalance[]
  totalValueUSD?: number
}

export class WalletService {
  static async getWalletBalance(address: string, chain: string = 'eth'): Promise<WalletBalance> {
    try {
      // Get real token balances from Moralis
      const tokens = await MoralisService.getWalletTokenBalances(address, chain)
      
      // Get native balance (ETH, MATIC, etc.)
      const nativeBalance = await MoralisService.getNativeBalance(address, chain)
      
      // Add native token to the list
      const nativeToken: TokenBalance = {
        symbol: chain === 'eth' ? 'ETH' : 'NATIVE',
        name: chain === 'eth' ? 'Ethereum' : 'Native Token',
        balance: nativeBalance.formatted,
        decimals: 18,
        valueUSD: 0, // Would need price lookup
        contractAddress: '0x0000000000000000000000000000000000000000'
      }
      
      const allTokens = [nativeToken, ...tokens]
      const totalValueUSD = allTokens.reduce((sum, token) => sum + token.valueUSD, 0)
      
      return {
        address,
        chain,
        tokens: allTokens,
        totalValueUSD,
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error)
      throw error
    }
  }

  static async getWalletTransactions(address: string, chain: string = 'eth', limit: number = 10) {
    try {
      return await MoralisService.getWalletTransactions(address, chain, limit)
    } catch (error) {
      console.error('Error fetching wallet transactions:', error)
      throw error
    }
  }

  static async connectExchange(exchangeData: ExchangeConnection): Promise<ExchangeConnection> {
    try {
      // This would integrate with exchange APIs
      // For now, return the connection data
      return {
        ...exchangeData,
        balances: [], // Would fetch from exchange API
        totalValueUSD: 0
      }
    } catch (error) {
      console.error('Error connecting to exchange:', error)
      throw error
    }
  }

  static validateWalletAddress(address: string): boolean {
    // Basic Ethereum address validation
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  static formatTokenAmount(amount: string, decimals: number): string {
    const value = parseFloat(amount) / Math.pow(10, decimals)
    return value.toFixed(6)
  }

  static async getPortfolioValue(addresses: string[], chains: string[] = ['eth']): Promise<number> {
    try {
      let totalValue = 0
      
      for (const address of addresses) {
        for (const chain of chains) {
          const balance = await this.getWalletBalance(address, chain)
          totalValue += balance.totalValueUSD
        }
      }
      
      return totalValue
    } catch (error) {
      console.error('Error calculating portfolio value:', error)
      return 0
    }
  }
}