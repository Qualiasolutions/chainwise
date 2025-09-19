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

export type UserTier = Database['public']['Enums']['user_tier']
export type AiPersona = Database['public']['Enums']['ai_persona']

// Insert types for creating new records
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type PortfolioInsert = Database['public']['Tables']['portfolios']['Insert']
export type PortfolioHoldingInsert = Database['public']['Tables']['portfolio_holdings']['Insert']
export type AiChatSessionInsert = Database['public']['Tables']['ai_chat_sessions']['Insert']

// Update types for modifying existing records
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type PortfolioUpdate = Database['public']['Tables']['portfolios']['Update']
export type PortfolioHoldingUpdate = Database['public']['Tables']['portfolio_holdings']['Update']
export type AiChatSessionUpdate = Database['public']['Tables']['ai_chat_sessions']['Update']