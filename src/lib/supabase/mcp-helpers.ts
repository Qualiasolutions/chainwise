// MCP Supabase Helper Functions
// This module provides abstracted database operations using Supabase MCP tools
// Replaces direct supabase client calls with MCP-based operations

// Use environment variable directly to avoid client initialization
const SUPABASE_PROJECT_ID = 'vmnuzwoocympormyizsc'

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
        const cookieStore = await cookies()
        return createRouteHandlerClient({ cookies: () => cookieStore })
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
          .from('profiles')
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
          INSERT INTO profiles (auth_id, email, full_name, bio, location, website, avatar_url, tier, credits, monthly_credits)
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
            ${userData.monthly_credits || 3}
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
      const supabase = await this.getSupabaseClient()

      const { data, error } = await supabase
        .from('profiles')
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
      console.log('📊 MCPSupabaseClient: Fetching portfolios for user:', userId)

      // Get portfolios with holdings using direct Supabase query
      const supabase = await this.getSupabaseClient()

      const { data: portfolios, error } = await supabase
        .from('portfolios')
        .select(`
          *,
          portfolio_holdings (
            id,
            symbol,
            name,
            amount,
            purchase_price,
            purchase_date,
            current_price
          )
        `)
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true })

      if (error) {
        console.error('❌ MCP: Error fetching portfolios:', error)
        throw error
      }

      console.log('✅ MCP: Fetched portfolios:', portfolios?.length || 0)
      return portfolios || []
    } catch (error: any) {
      console.error('❌ MCP: Error in getUserPortfolios:', error)
      throw new Error(`Failed to fetch portfolios: ${error.message}`)
    }
  }

  async createPortfolio(portfolioData: PortfolioInsert): Promise<Portfolio> {
    try {
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
      const supabase = await this.getSupabaseClient()

      const { data, error } = await supabase
        .rpc('record_credit_usage', {
          user_uuid: userId,
          credits_spent: creditsSpent,
          description_text: description,
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
      const supabase = await this.getSupabaseClient()

      const { data, error } = await supabase
        .from('profiles')
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

  // ============================
  // AI Chat Session Operations
  // ============================

  /**
   * Get all chat sessions for a user
   */
  async getChatSessions(userId: string, options?: {
    includeArchived?: boolean,
    limit?: number,
    offset?: number
  }): Promise<AiChatSession[]> {
    try {
      const supabase = await this.getSupabaseClient()
      const { includeArchived = false, limit = 20, offset = 0 } = options || {}

      let query = supabase
        .from('ai_chat_sessions')
        .select('*')
        .eq('user_id', userId)

      if (!includeArchived) {
        query = query.eq('is_archived', false)
      }

      const { data, error } = await query
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Error fetching chat sessions:', error)
      return []
    }
  }

  /**
   * Get a single chat session with full messages
   */
  async getChatSession(sessionId: string, userId: string): Promise<AiChatSession | null> {
    try {
      const supabase = await this.getSupabaseClient()

      const { data, error } = await supabase
        .from('ai_chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .eq('is_archived', false)
        .single()

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('Error fetching chat session:', error)
      return null
    }
  }

  /**
   * Search chat sessions by text query
   */
  async searchChatSessions(
    userId: string,
    searchQuery: string,
    options?: { limit?: number, offset?: number }
  ): Promise<AiChatSession[]> {
    try {
      const supabase = await this.getSupabaseClient()
      const { limit = 20, offset = 0 } = options || {}

      const { data, error } = await supabase
        .rpc('search_chat_sessions', {
          p_user_id: userId,
          p_search_query: searchQuery,
          p_limit: limit,
          p_offset: offset
        })

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Error searching chat sessions:', error)
      // Fallback to client-side search if function doesn't exist
      const sessions = await this.getChatSessions(userId, { limit: 100 })
      const query = searchQuery.toLowerCase()
      return sessions.filter(s =>
        s.title?.toLowerCase().includes(query) ||
        s.last_message_preview?.toLowerCase().includes(query)
      ).slice(offset, offset + limit)
    }
  }

  /**
   * Create a new chat session
   */
  async createChatSession(sessionData: AiChatSessionInsert): Promise<AiChatSession> {
    try {
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

  /**
   * Update an existing chat session
   */
  async updateChatSession(
    sessionId: string,
    userId: string,
    updates: Partial<AiChatSession>
  ): Promise<AiChatSession | null> {
    try {
      const supabase = await this.getSupabaseClient()

      const { data, error } = await supabase
        .from('ai_chat_sessions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', sessionId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('Error updating chat session:', error)
      return null
    }
  }

  /**
   * Add messages to an existing chat session
   */
  async addMessagesToSession(
    sessionId: string,
    userId: string,
    newMessages: any[]
  ): Promise<AiChatSession | null> {
    try {
      const supabase = await this.getSupabaseClient()

      // Get current session
      const session = await this.getChatSession(sessionId, userId)
      if (!session) return null

      // Append new messages
      const currentMessages = Array.isArray(session.messages) ? session.messages : []
      const updatedMessages = [...currentMessages, ...newMessages]

      // Update session with new messages
      return await this.updateChatSession(sessionId, userId, {
        messages: updatedMessages as any
      })
    } catch (error: any) {
      console.error('Error adding messages to session:', error)
      return null
    }
  }

  /**
   * Delete a chat session (permanent delete)
   */
  async deleteChatSession(sessionId: string, userId: string): Promise<boolean> {
    try {
      const supabase = await this.getSupabaseClient()

      const { error } = await supabase
        .from('ai_chat_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', userId)

      if (error) throw error
      return true
    } catch (error: any) {
      console.error('Error deleting chat session:', error)
      return false
    }
  }

  /**
   * Archive a chat session (soft delete)
   */
  async archiveChatSession(sessionId: string, userId: string): Promise<boolean> {
    try {
      const supabase = await this.getSupabaseClient()

      const { error } = await supabase
        .rpc('archive_chat_session', {
          p_session_id: sessionId,
          p_user_id: userId
        })

      if (error) throw error
      return true
    } catch (error: any) {
      console.error('Error archiving chat session:', error)
      // Fallback to direct update
      try {
        await this.updateChatSession(sessionId, userId, { is_archived: true })
        return true
      } catch {
        return false
      }
    }
  }

  /**
   * Toggle favorite status of a chat session
   */
  async toggleChatFavorite(sessionId: string, userId: string): Promise<boolean> {
    try {
      const supabase = await this.getSupabaseClient()

      const { error } = await supabase
        .rpc('toggle_chat_favorite', {
          p_session_id: sessionId,
          p_user_id: userId
        })

      if (error) throw error
      return true
    } catch (error: any) {
      console.error('Error toggling chat favorite:', error)
      // Fallback to manual toggle
      try {
        const session = await this.getChatSession(sessionId, userId)
        if (!session) return false
        await this.updateChatSession(sessionId, userId, {
          is_favorite: !session.is_favorite
        })
        return true
      } catch {
        return false
      }
    }
  }

  /**
   * Get favorite chat sessions
   */
  async getFavoriteChatSessions(userId: string, limit: number = 10): Promise<AiChatSession[]> {
    try {
      const supabase = await this.getSupabaseClient()

      const { data, error } = await supabase
        .from('ai_chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_favorite', true)
        .eq('is_archived', false)
        .order('updated_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Error fetching favorite chat sessions:', error)
      return []
    }
  }

  /**
   * Get recent chat sessions grouped by persona
   */
  async getChatSessionsByPersona(userId: string): Promise<Record<string, AiChatSession[]>> {
    try {
      const sessions = await this.getChatSessions(userId, { limit: 50 })

      const grouped: Record<string, AiChatSession[]> = {
        buddy: [],
        professor: [],
        trader: []
      }

      sessions.forEach(session => {
        const persona = session.persona?.toLowerCase() || 'buddy'
        if (grouped[persona]) {
          grouped[persona].push(session)
        }
      })

      return grouped
    } catch (error: any) {
      console.error('Error grouping chat sessions by persona:', error)
      return { buddy: [], professor: [], trader: [] }
    }
  }
}

// Export singleton instance
export const mcpSupabase = new MCPSupabaseClient()