import Moralis from 'moralis'

export class MoralisService {
  private static isInitialized = false

  static async initialize() {
    if (this.isInitialized) return

    const apiKey = process.env.MORALIS_API_KEY
    if (!apiKey) {
      throw new Error('MORALIS_API_KEY environment variable is required')
    }

    await Moralis.start({ apiKey })
    this.isInitialized = true
  }

  static async getWalletTokenBalances(address: string, chain = 'eth') {
    await this.initialize()

    try {
      const response = await Moralis.EvmApi.token.getWalletTokenBalances({
        address,
        chain,
      })

      return response.raw.map((token: any) => ({
        symbol: token.symbol || 'UNKNOWN',
        name: token.name || 'Unknown Token',
        balance: token.balance,
        decimals: token.decimals,
        valueUSD: parseFloat(token.usd_value || '0'),
        contractAddress: token.token_address,
        logo: token.logo
      }))
    } catch (error) {
      console.error('Error fetching wallet token balances:', error)
      throw error
    }
  }

  static async getNativeBalance(address: string, chain = 'eth') {
    await this.initialize()

    try {
      const response = await Moralis.EvmApi.balance.getNativeBalance({
        address,
        chain,
      })

      return {
        balance: response.raw.balance,
        formatted: Moralis.Units.fromWei(response.raw.balance),
      }
    } catch (error) {
      console.error('Error fetching native balance:', error)
      throw error
    }
  }

  static async getTokenPrice(addresses: string[], chain = 'eth') {
    await this.initialize()

    try {
      const response = await Moralis.EvmApi.token.getTokenPrice({
        address: addresses[0], // For now, handle single token
        chain,
      })

      return response.raw
    } catch (error) {
      console.error('Error fetching token price:', error)
      throw error
    }
  }

  static async getWalletTransactions(address: string, chain = 'eth', limit = 10) {
    await this.initialize()

    try {
      const response = await Moralis.EvmApi.transaction.getWalletTransactions({
        address,
        chain,
        limit,
      })

      return response.raw.result.map((tx: any) => ({
        hash: tx.hash,
        from: tx.from_address,
        to: tx.to_address,
        value: tx.value,
        blockTimestamp: tx.block_timestamp,
        gasPrice: tx.gas_price,
        gasUsed: tx.gas_used,
      }))
    } catch (error) {
      console.error('Error fetching wallet transactions:', error)
      throw error
    }
  }
}
