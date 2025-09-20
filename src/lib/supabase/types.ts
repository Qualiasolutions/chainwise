export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          auth_id: string
          email: string
          full_name: string | null
          bio: string | null
          location: string | null
          website: string | null
          avatar_url: string | null
          tier: 'free' | 'pro' | 'elite'
          credits: number
          monthly_credits: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_id: string
          email: string
          full_name?: string | null
          bio?: string | null
          location?: string | null
          website?: string | null
          avatar_url?: string | null
          tier?: 'free' | 'pro' | 'elite'
          credits?: number
          monthly_credits?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_id?: string
          email?: string
          full_name?: string | null
          bio?: string | null
          location?: string | null
          website?: string | null
          avatar_url?: string | null
          tier?: 'free' | 'pro' | 'elite'
          credits?: number
          monthly_credits?: number
          created_at?: string
          updated_at?: string
        }
      }
      portfolios: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          is_default: boolean
          total_value: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          is_default?: boolean
          total_value?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          is_default?: boolean
          total_value?: number
          created_at?: string
          updated_at?: string
        }
      }
      portfolio_holdings: {
        Row: {
          id: string
          portfolio_id: string
          symbol: string
          name: string
          coin_id: string | null
          amount: number
          purchase_price: number
          purchase_date: string
          current_price: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          portfolio_id: string
          symbol: string
          name: string
          coin_id?: string | null
          amount: number
          purchase_price: number
          purchase_date: string
          current_price?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          portfolio_id?: string
          symbol?: string
          name?: string
          coin_id?: string | null
          amount?: number
          purchase_price?: number
          purchase_date?: string
          current_price?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      ai_chat_sessions: {
        Row: {
          id: string
          user_id: string
          persona: 'buddy' | 'professor' | 'trader'
          messages: Json
          credits_used: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          persona: 'buddy' | 'professor' | 'trader'
          messages?: Json
          credits_used?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          persona?: 'buddy' | 'professor' | 'trader'
          messages?: Json
          credits_used?: number
          created_at?: string
          updated_at?: string
        }
      }
      credit_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: 'usage' | 'refill' | 'bonus' | 'monthly_reset'
          description: string
          ai_persona: 'buddy' | 'professor' | 'trader' | null
          session_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          type: 'usage' | 'refill' | 'bonus' | 'monthly_reset'
          description: string
          ai_persona?: 'buddy' | 'professor' | 'trader' | null
          session_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          type?: 'usage' | 'refill' | 'bonus' | 'monthly_reset'
          description?: string
          ai_persona?: 'buddy' | 'professor' | 'trader' | null
          session_id?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'info' | 'warning' | 'success' | 'error' | 'alert'
          is_read: boolean
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: 'info' | 'warning' | 'success' | 'error' | 'alert'
          is_read?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: 'info' | 'warning' | 'success' | 'error' | 'alert'
          is_read?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      payment_methods: {
        Row: {
          id: string
          user_id: string
          stripe_payment_method_id: string
          type: 'card' | 'bank_account'
          brand: string | null
          last4: string | null
          exp_month: number | null
          exp_year: number | null
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_payment_method_id: string
          type: 'card' | 'bank_account'
          brand?: string | null
          last4?: string | null
          exp_month?: number | null
          exp_year?: number | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_payment_method_id?: string
          type?: 'card' | 'bank_account'
          brand?: string | null
          last4?: string | null
          exp_month?: number | null
          exp_year?: number | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_tier: 'free' | 'pro' | 'elite'
      ai_persona: 'buddy' | 'professor' | 'trader'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type User = Database['public']['Tables']['users']['Row']
export type Portfolio = Database['public']['Tables']['portfolios']['Row']
export type PortfolioHolding = Database['public']['Tables']['portfolio_holdings']['Row']
export type AiChatSession = Database['public']['Tables']['ai_chat_sessions']['Row']
export type CreditTransaction = Database['public']['Tables']['credit_transactions']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type PaymentMethod = Database['public']['Tables']['payment_methods']['Row']

export type UserTier = Database['public']['Enums']['user_tier']
export type AiPersona = Database['public']['Enums']['ai_persona']

// Insert types for creating new records
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type PortfolioInsert = Database['public']['Tables']['portfolios']['Insert']
export type PortfolioHoldingInsert = Database['public']['Tables']['portfolio_holdings']['Insert']
export type AiChatSessionInsert = Database['public']['Tables']['ai_chat_sessions']['Insert']
export type CreditTransactionInsert = Database['public']['Tables']['credit_transactions']['Insert']
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert']
export type PaymentMethodInsert = Database['public']['Tables']['payment_methods']['Insert']

// Update types for modifying existing records
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type PortfolioUpdate = Database['public']['Tables']['portfolios']['Update']
export type PortfolioHoldingUpdate = Database['public']['Tables']['portfolio_holdings']['Update']
export type AiChatSessionUpdate = Database['public']['Tables']['ai_chat_sessions']['Update']
export type CreditTransactionUpdate = Database['public']['Tables']['credit_transactions']['Update']
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update']
export type PaymentMethodUpdate = Database['public']['Tables']['payment_methods']['Update']

// Portfolio metrics types
export interface PortfolioMetrics {
  total_value: number
  total_invested: number
  total_pnl: number
  total_pnl_percentage: number
  holdings_count: number
}

export interface UserPortfolioSummary {
  total_portfolios: number
  total_value: number
  total_invested: number
  total_pnl: number
  total_pnl_percentage: number
  total_holdings: number
}