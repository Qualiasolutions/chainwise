// MCP Supabase Helper Functions
// This module provides abstracted database operations using Supabase MCP tools
// Replaces direct supabase client calls with MCP-based operations

import { SUPABASE_PROJECT_ID } from './client'
import type {
  User,
  Portfolio,
  PortfolioHolding,
  AiChatSession,
  CreditTransaction,
  Notification,
  PaymentMethod,
  UserInsert,
  PortfolioInsert,
  PortfolioHoldingInsert,
  AiChatSessionInsert,
  CreditTransactionInsert,
  NotificationInsert,
  PaymentMethodInsert,
  UserUpdate,
  PortfolioUpdate,
  PortfolioHoldingUpdate,
  PortfolioMetrics,
  UserPortfolioSummary
} from './types'

// MCP Error types
interface MCPError {
  code: string
  message: string
  details?: any
}

// MCP Response wrapper
interface MCPResponse<T> {
  data: T | null
  error: MCPError | null
}

export class MCPSupabaseClient {
  private projectId: string

  constructor(projectId: string = SUPABASE_PROJECT_ID) {
    this.projectId = projectId
  }

  // Utility method to get the appropriate Supabase client based on context
  private async getSupabaseClient() {
    try {
      // Check if we're in a server environment
      if (typeof window === 'undefined') {
        // Server-side: use route handler client for API routes
        const { cookies } = await import('next/headers')
        const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs')
        return createRouteHandlerClient({ cookies })
      } else {
        // Client-side: use browser client
        const { createClientComponentClient } = await import('@supabase/auth-helpers-nextjs')
        return createClientComponentClient()
      }
    } catch (error) {
      console.error('Error creating Supabase client:', error)
      // Fallback to direct client import
      const { supabase } = await import('./client')
      return supabase
    }
  }

  // Utility method to execute MCP SQL queries
  private async executeMCPQuery<T>(query: string, params: any[] = []): Promise<MCPResponse<T>> {
    try {
      // Import MCP tools dynamically to avoid bundling issues
      const { mcp__supabase__execute_sql } = await import('@/lib/mcp-tools')

      const result = await mcp__supabase__execute_sql({
        project_id: this.projectId,
        query: query
      })

      return {
        data: result as T,
        error: null
      }
    } catch (error: any) {
      return {
        data: null,
        error: {
          code: 'MCP_ERROR',
          message: error.message || 'Unknown MCP error',
          details: error
        }
      }
    }
  }

  // Utility method for handling MCP responses
  private handleMCPResponse<T>(response: MCPResponse<T>): T {
    if (response.error) {
      throw new Error(`MCP Error (${response.error.code}): ${response.error.message}`)
    }
    return response.data!
  }

  // User Operations
  async getUserByAuthId(authId: string): Promise<User | null> {
    try {
      // Check if we're in server context (API route)
      if (typeof window === 'undefined') {
        // Server-side: Use direct Supabase client instead of API call
        const supabase = await this.getSupabaseClient()

        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', authId)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('Database error fetching user:', error)
          return null
        }

        return data || null
      } else {
        // Client-side: Use API route
        const response = await fetch('/api/users/by-auth-id', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ authId })
        })

        if (!response.ok) {
          console.error('API Error fetching user:', await response.text())
          return null
        }

        const data = await response.json()
        return data.user || null
      }
    } catch (error: any) {
      console.error('Error fetching user by auth ID:', error)
      return null
    }
  }

  async createUser(userData: UserInsert): Promise<User> {
    try {
      // Check if we're in server context (API route)
      if (typeof window === 'undefined') {
        // Server-side: Use MCP call directly
        const query = `
          INSERT INTO users (auth_id, email, full_name, bio, location, website, avatar_url, tier, credits, monthly_credits, created_at, updated_at)
          VALUES (
            '${userData.auth_id}',
            '${userData.email}',
            ${userData.full_name ? `'${userData.full_name.replace(/'/g, "''")}'` : 'NULL'},
            ${userData.bio ? `'${userData.bio.replace(/'/g, "''")}'` : 'NULL'},
            ${userData.location ? `'${userData.location.replace(/'/g, "''")}'` : 'NULL'},
            ${userData.website ? `'${userData.website}'` : 'NULL'},
            ${userData.avatar_url ? `'${userData.avatar_url}'` : 'NULL'},
            '${userData.tier || 'free'}',
            ${userData.credits || 3},
            ${userData.monthly_credits || 3},
            NOW(),
            NOW()
          )
          RETURNING *;
        `

        const response = await this.executeMCPQuery<User[]>(query)
        const result = this.handleMCPResponse(response)

        if (result && Array.isArray(result) && result.length > 0) {
          return result[0]
        }

        throw new Error('Failed to create user - no data returned')
      } else {
        // Client-side: Use API route
        const response = await fetch('/api/users/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userData })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create user')
        }

        const data = await response.json()
        return data.user
      }
    } catch (error: any) {
      console.error('Error creating user:', error)
      throw new Error(`Failed to create user: ${error.message}`)
    }
  }

  async updateUser(userId: string, updates: UserUpdate): Promise<User> {
    try {
      // TODO: Replace with MCP call when available
      const supabase = await this.getSupabaseClient()

      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('Error updating user:', error)
      throw new Error(`Failed to update user: ${error.message}`)
    }
  }

  // Portfolio Operations
  async getUserPortfolios(userId: string): Promise<Portfolio[]> {
    try {
      // TODO: Replace with MCP call when available
      const supabase = await this.getSupabaseClient()

      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Error fetching user portfolios:', error)
      throw new Error(`Failed to fetch portfolios: ${error.message}`)
    }
  }

  async createPortfolio(portfolioData: PortfolioInsert): Promise<Portfolio> {
    try {
      // TODO: Replace with MCP call when available
      const supabase = await this.getSupabaseClient()

      const { data, error } = await supabase
        .from('portfolios')
        .insert(portfolioData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('Error creating portfolio:', error)
      throw new Error(`Failed to create portfolio: ${error.message}`)
    }
  }

  async getPortfolioById(portfolioId: string): Promise<Portfolio | null> {
    try {
      // TODO: Replace with MCP call when available
      const supabase = await this.getSupabaseClient()

      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('id', portfolioId)
        .single()

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('Error fetching portfolio by ID:', error)
      return null
    }
  }

  async getPortfolioHoldings(portfolioId: string): Promise<PortfolioHolding[]> {
    try {
      // TODO: Replace with MCP call when available
      const supabase = await this.getSupabaseClient()

      const { data, error } = await supabase
        .from('portfolio_holdings')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Error fetching portfolio holdings:', error)
      throw new Error(`Failed to fetch portfolio holdings: ${error.message}`)
    }
  }

  async addPortfolioHolding(holdingData: PortfolioHoldingInsert): Promise<PortfolioHolding> {
    try {
      // TODO: Replace with MCP call when available
      const supabase = await this.getSupabaseClient()

      const { data, error } = await supabase
        .from('portfolio_holdings')
        .insert(holdingData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('Error adding portfolio holding:', error)
      throw new Error(`Failed to add portfolio holding: ${error.message}`)
    }
  }

  async updatePortfolioHolding(holdingId: string, updates: PortfolioHoldingUpdate): Promise<PortfolioHolding> {
    try {
      // TODO: Replace with MCP call when available
      const supabase = await this.getSupabaseClient()

      const { data, error } = await supabase
        .from('portfolio_holdings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', holdingId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('Error updating portfolio holding:', error)
      throw new Error(`Failed to update portfolio holding: ${error.message}`)
    }
  }

  async deletePortfolioHolding(holdingId: string): Promise<boolean> {
    try {
      // TODO: Replace with MCP call when available
      const supabase = await this.getSupabaseClient()

      const { error } = await supabase
        .from('portfolio_holdings')
        .delete()
        .eq('id', holdingId)

      if (error) throw error
      return true
    } catch (error: any) {
      console.error('Error deleting portfolio holding:', error)
      return false
    }
  }


  // AI Chat Operations
  async createChatSession(sessionData: AiChatSessionInsert): Promise<AiChatSession> {
    try {
      // TODO: Replace with MCP call when available
      const supabase = await this.getSupabaseClient()

      const { data, error } = await supabase
        .from('ai_chat_sessions')
        .insert(sessionData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('Error creating chat session:', error)
      throw new Error(`Failed to create chat session: ${error.message}`)
    }
  }

  async updateChatSession(sessionId: string, messages: unknown[], creditsUsed: number): Promise<AiChatSession> {
    try {
      // TODO: Replace with MCP call when available
      const supabase = await this.getSupabaseClient()

      const { data, error } = await supabase
        .from('ai_chat_sessions')
        .update({
          messages: messages as any,
          credits_used: creditsUsed,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('Error updating chat session:', error)
      throw new Error(`Failed to update chat session: ${error.message}`)
    }
  }


  // Alert Operations
  async getUserAlerts(userId: string) {
    try {
      // TODO: Replace with MCP call when available
      // Note: user_alerts table would need to be created first
      console.warn('getUserAlerts: user_alerts table not yet implemented')
      return []
    } catch (error: any) {
      console.error('Error fetching user alerts:', error)
      return []
    }
  }

  async createAlert(userId: string, symbol: string, alertType: string, targetValue: number) {
    try {
      // TODO: Replace with MCP call when available
      // Note: user_alerts table would need to be created first
      console.warn('createAlert: user_alerts table not yet implemented')
      return null
    } catch (error: any) {
      console.error('Error creating alert:', error)
      return null
    }
  }

  // Notification Operations
  async getUserNotifications(userId: string, unreadOnly: boolean = false): Promise<Notification[]> {
    try {
      // TODO: Replace with MCP call when available
      const supabase = await this.getSupabaseClient()

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (unreadOnly) {
        query = query.eq('is_read', false)
      } else {
        query = query.limit(50)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Error fetching user notifications:', error)
      throw new Error(`Failed to fetch user notifications: ${error.message}`)
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      // TODO: Replace with MCP call when available
      const supabase = await this.getSupabaseClient()

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId)

      if (error) throw error
      return true
    } catch (error: any) {
      console.error('Error marking notification as read:', error)
      return false
    }
  }

  // Credit Transaction Operations
  async getCreditTransactions(userId: string, limit: number = 50): Promise<CreditTransaction[]> {
    try {
      // TODO: Replace with MCP call when available
      const supabase = await this.getSupabaseClient()

      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Error fetching credit transactions:', error)
      throw new Error(`Failed to fetch credit transactions: ${error.message}`)
    }
  }

  async createCreditTransaction(transactionData: CreditTransactionInsert): Promise<CreditTransaction> {
    try {
      // TODO: Replace with MCP call when available
      const supabase = await this.getSupabaseClient()

      const { data, error } = await supabase
        .from('credit_transactions')
        .insert(transactionData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('Error creating credit transaction:', error)
      throw new Error(`Failed to create credit transaction: ${error.message}`)
    }
  }

  // Payment Methods Operations
  async getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      // TODO: Replace with MCP call when available
      const supabase = await this.getSupabaseClient()

      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Error fetching payment methods:', error)
      throw new Error(`Failed to fetch payment methods: ${error.message}`)
    }
  }

  async createPaymentMethod(paymentMethodData: PaymentMethodInsert): Promise<PaymentMethod> {
    try {
      // TODO: Replace with MCP call when available
      const supabase = await this.getSupabaseClient()

      const { data, error } = await supabase
        .from('payment_methods')
        .insert(paymentMethodData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('Error creating payment method:', error)
      throw new Error(`Failed to create payment method: ${error.message}`)
    }
  }

  // Portfolio Analytics Operations
  async getPortfolioMetrics(portfolioId: string): Promise<PortfolioMetrics> {
    try {
      // TODO: Replace with MCP call when available
      const supabase = await this.getSupabaseClient()

      const { data, error } = await supabase
        .rpc('get_portfolio_metrics', { portfolio_uuid: portfolioId })

      if (error) throw error
      return data[0] || {
        total_value: 0,
        total_invested: 0,
        total_pnl: 0,
        total_pnl_percentage: 0,
        holdings_count: 0
      }
    } catch (error: any) {
      console.error('Error fetching portfolio metrics:', error)
      throw new Error(`Failed to fetch portfolio metrics: ${error.message}`)
    }
  }

  async getUserPortfolioSummary(userId: string): Promise<UserPortfolioSummary> {
    try {
      // TODO: Replace with MCP call when available
      const supabase = await this.getSupabaseClient()

      const { data, error } = await supabase
        .rpc('get_user_portfolio_summary', { user_uuid: userId })

      if (error) throw error
      return data[0] || {
        total_portfolios: 0,
        total_value: 0,
        total_invested: 0,
        total_pnl: 0,
        total_pnl_percentage: 0,
        total_holdings: 0
      }
    } catch (error: any) {
      console.error('Error fetching user portfolio summary:', error)
      throw new Error(`Failed to fetch user portfolio summary: ${error.message}`)
    }
  }

  // Credit Management Operations
  async recordCreditUsage(
    userId: string,
    creditsSpent: number,
    description: string,
    persona?: string,
    sessionId?: string
  ): Promise<boolean> {
    try {
      // TODO: Replace with MCP call when available
      const supabase = await this.getSupabaseClient()

      const { data, error } = await supabase
        .rpc('record_credit_usage', {
          user_uuid: userId,
          credits_spent: creditsSpent,
          usage_description: description,
          persona_used: persona,
          session_uuid: sessionId
        })

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('Error recording credit usage:', error)
      return false
    }
  }

  async refillUserCredits(
    userId: string,
    creditsToAdd: number,
    refillType: 'monthly_reset' | 'refill' | 'bonus' = 'monthly_reset'
  ): Promise<boolean> {
    try {
      // TODO: Replace with MCP call when available
      const supabase = await this.getSupabaseClient()

      const { data, error } = await supabase
        .rpc('refill_user_credits', {
          user_uuid: userId,
          credits_to_add: creditsToAdd,
          refill_type: refillType
        })

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('Error refilling user credits:', error)
      return false
    }
  }

  // Alias for backward compatibility and cleaner API
  async deductCredits(
    userId: string,
    creditsToDeduct: number,
    description: string,
    metadata?: any
  ): Promise<boolean> {
    return this.recordCreditUsage(userId, creditsToDeduct, description)
  }

  // Create a credit transaction log entry
  async logCreditTransaction(
    userId: string,
    amount: number,
    type: 'debit' | 'credit',
    description: string,
    metadata?: any
  ): Promise<CreditTransaction | null> {
    try {
      const transactionData: CreditTransactionInsert = {
        user_id: userId,
        amount: type === 'debit' ? -Math.abs(amount) : Math.abs(amount),
        type,
        description,
        metadata: metadata ? JSON.stringify(metadata) : null
      }

      return await this.createCreditTransaction(transactionData)
    } catch (error: any) {
      console.error('Error logging credit transaction:', error)
      return null
    }
  }

  // Get user by ID (alias for getUserByAuthId with different parameter)
  async getUserById(userId: string): Promise<User | null> {
    try {
      // TODO: Replace with MCP call when available
      const supabase = await this.getSupabaseClient()

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('Error getting user by ID:', error)
      return null
    }
  }
}

// Export singleton instance
export const mcpSupabase = new MCPSupabaseClient()