// Whale Alert API Service
// https://developer.whale-alert.io/documentation/

const WHALE_ALERT_BASE_URL = 'https://leviathan.whale-alert.io'
const API_KEY = process.env.WHALE_ALERT_API_KEY

if (!API_KEY) {
  console.warn('⚠️ WHALE_ALERT_API_KEY not configured - whale tracking will use fallback data')
}

// Rate limit: 1000 calls/minute
const RATE_LIMIT_DELAY = 60 // ms between calls

interface WhaleAlertTransaction {
  blockchain: string
  symbol: string
  id: string
  transaction_type: string
  hash: string
  from: {
    address: string
    owner?: string
    owner_type?: string
  }
  to: {
    address: string
    owner?: string
    owner_type?: string
  }
  timestamp: number
  amount: number
  amount_usd: number
  transaction_count: number
}

interface WhaleAlertStatus {
  blockchains: {
    name: string
    symbols: string[]
  }[]
}

interface WhaleAlertAddressTransactions {
  transactions: WhaleAlertTransaction[]
  count: number
}

class WhaleAlertAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message)
    this.name = 'WhaleAlertAPIError'
  }
}

export class WhaleAlertAPI {
  private baseUrl: string
  private apiKey: string

  constructor(apiKey?: string) {
    this.baseUrl = WHALE_ALERT_BASE_URL
    this.apiKey = apiKey || API_KEY || ''
  }

  /**
   * Make authenticated request to Whale Alert API
   */
  private async request<T>(endpoint: string): Promise<T> {
    if (!this.apiKey) {
      throw new WhaleAlertAPIError('Whale Alert API key not configured', 401)
    }

    const url = `${this.baseUrl}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${this.apiKey}`

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 60 } // Cache for 1 minute
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new WhaleAlertAPIError(
          `Whale Alert API error: ${response.statusText}`,
          response.status,
          errorText
        )
      }

      const data = await response.json()

      // Add small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY))

      return data
    } catch (error: any) {
      if (error instanceof WhaleAlertAPIError) {
        throw error
      }
      throw new WhaleAlertAPIError(
        `Failed to fetch from Whale Alert: ${error.message}`,
        500,
        error
      )
    }
  }

  /**
   * Get list of supported blockchains and currencies
   */
  async getStatus(): Promise<WhaleAlertStatus> {
    return this.request<WhaleAlertStatus>('/status')
  }

  /**
   * Get transactions for a specific blockchain
   * @param blockchain - Blockchain name (e.g., 'bitcoin', 'ethereum')
   * @param options - Query options
   */
  async getTransactions(
    blockchain: string,
    options?: {
      start?: number // Unix timestamp
      end?: number // Unix timestamp
      limit?: number // Max 256
      min_value?: number // Minimum USD value
    }
  ): Promise<WhaleAlertTransaction[]> {
    let endpoint = `/v1/${blockchain.toLowerCase()}/transactions?`

    if (options?.start) endpoint += `start=${options.start}&`
    if (options?.end) endpoint += `end=${options.end}&`
    if (options?.limit) endpoint += `limit=${Math.min(options.limit, 256)}&`
    if (options?.min_value) endpoint += `min_value=${options.min_value}&`

    const response = await this.request<{ transactions: WhaleAlertTransaction[] }>(endpoint)
    return response.transactions || []
  }

  /**
   * Get transaction details by hash
   * @param blockchain - Blockchain name
   * @param hash - Transaction hash
   */
  async getTransaction(
    blockchain: string,
    hash: string
  ): Promise<WhaleAlertTransaction | null> {
    try {
      const endpoint = `/v1/${blockchain.toLowerCase()}/transaction/${hash}`
      return await this.request<WhaleAlertTransaction>(endpoint)
    } catch (error) {
      console.error(`Failed to fetch transaction ${hash}:`, error)
      return null
    }
  }

  /**
   * Get transactions for a specific address
   * @param blockchain - Blockchain name
   * @param address - Wallet address
   * @param options - Query options (limited to last 30 days)
   */
  async getAddressTransactions(
    blockchain: string,
    address: string,
    options?: {
      start?: number // Unix timestamp (max 30 days ago)
      end?: number // Unix timestamp
      limit?: number // Max 256
    }
  ): Promise<WhaleAlertTransaction[]> {
    let endpoint = `/v1/${blockchain.toLowerCase()}/address/${address}/transactions?`

    if (options?.start) endpoint += `start=${options.start}&`
    if (options?.end) endpoint += `end=${options.end}&`
    if (options?.limit) endpoint += `limit=${Math.min(options.limit, 256)}&`

    try {
      const response = await this.request<{ transactions: WhaleAlertTransaction[] }>(endpoint)
      return response.transactions || []
    } catch (error) {
      console.error(`Failed to fetch transactions for address ${address}:`, error)
      return []
    }
  }

  /**
   * Detect blockchain type from address format
   */
  detectBlockchain(address: string): string {
    // Bitcoin address patterns
    if (address.match(/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/)) {
      return 'bitcoin'
    }
    if (address.match(/^bc1[a-z0-9]{39,87}$/i)) {
      return 'bitcoin' // Bech32 format
    }

    // Ethereum address pattern
    if (address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return 'ethereum'
    }

    // Tron address pattern
    if (address.match(/^T[A-Za-z1-9]{33}$/)) {
      return 'tron'
    }

    throw new WhaleAlertAPIError(`Unable to detect blockchain for address: ${address}`, 400)
  }

  /**
   * Get transactions for multiple addresses across different blockchains
   * @param addresses - Array of wallet addresses
   * @param timePeriod - Time period ('1h', '24h', '7d', '30d')
   */
  async getMultiAddressTransactions(
    addresses: string[],
    timePeriod: '1h' | '24h' | '7d' | '30d' = '24h'
  ): Promise<{
    [address: string]: {
      blockchain: string
      transactions: WhaleAlertTransaction[]
      totalValue: number
      transactionCount: number
    }
  }> {
    const now = Math.floor(Date.now() / 1000)
    const periodSeconds: Record<typeof timePeriod, number> = {
      '1h': 3600,
      '24h': 86400,
      '7d': 604800,
      '30d': 2592000
    }

    const start = now - periodSeconds[timePeriod]
    const results: any = {}

    for (const address of addresses) {
      try {
        const blockchain = this.detectBlockchain(address)
        const transactions = await this.getAddressTransactions(blockchain, address, {
          start,
          end: now,
          limit: 256
        })

        const totalValue = transactions.reduce((sum, tx) => sum + (tx.amount_usd || 0), 0)

        results[address] = {
          blockchain,
          transactions,
          totalValue,
          transactionCount: transactions.length
        }
      } catch (error) {
        console.error(`Failed to fetch transactions for ${address}:`, error)
        results[address] = {
          blockchain: 'unknown',
          transactions: [],
          totalValue: 0,
          transactionCount: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }

    return results
  }

  /**
   * Format transaction for display
   */
  formatTransaction(tx: WhaleAlertTransaction) {
    return {
      transaction_hash: tx.hash,
      transaction_type: tx.transaction_type,
      token_symbol: tx.symbol,
      amount: tx.amount,
      usd_value: tx.amount_usd,
      from_address: tx.from.address,
      from_owner: tx.from.owner || 'Unknown',
      to_address: tx.to.address,
      to_owner: tx.to.owner || 'Unknown',
      exchange: tx.from.owner_type === 'exchange' ? tx.from.owner : (tx.to.owner_type === 'exchange' ? tx.to.owner : null),
      timestamp: new Date(tx.timestamp * 1000).toISOString(),
      blockchain: tx.blockchain
    }
  }
}

// Export singleton instance
export const whaleAlertAPI = new WhaleAlertAPI()

// Export types
export type { WhaleAlertTransaction, WhaleAlertStatus }
export { WhaleAlertAPIError }
