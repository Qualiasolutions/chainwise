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
      accounts: {
        Row: {
          access_token: string | null
          created_at: string | null
          expires_at: number | null
          id: string
          id_token: string | null
          provider: string
          provider_account_id: string
          refresh_token: string | null
          scope: string | null
          session_state: string | null
          token_type: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string | null
          expires_at?: number | null
          id: string
          id_token?: string | null
          provider: string
          provider_account_id: string
          refresh_token?: string | null
          scope?: string | null
          session_state?: string | null
          token_type?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string | null
          expires_at?: number | null
          id?: string
          id_token?: string | null
          provider?: string
          provider_account_id?: string
          refresh_token?: string | null
          scope?: string | null
          session_state?: string | null
          token_type?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
      }
      ai_chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role?: string
          session_id?: string
        }
      }
      ai_chat_sessions: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          persona: string
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          persona: string
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          persona?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
      }
      ai_reports: {
        Row: {
          content: string
          created_at: string | null
          credits_cost: number | null
          generated_at: string | null
          id: string
          metadata: Json | null
          report_type: string
          title: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          credits_cost?: number | null
          generated_at?: string | null
          id?: string
          metadata?: Json | null
          report_type: string
          title: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          credits_cost?: number | null
          generated_at?: string | null
          id?: string
          metadata?: Json | null
          report_type?: string
          title?: string
          user_id?: string
        }
      }
      certificates: {
        Row: {
          certificate_id: string
          course_id: string
          id: string
          issued_at: string | null
          metadata: Json | null
          user_id: string
        }
        Insert: {
          certificate_id: string
          course_id: string
          id?: string
          issued_at?: string | null
          metadata?: Json | null
          user_id: string
        }
        Update: {
          certificate_id?: string
          course_id?: string
          id?: string
          issued_at?: string | null
          metadata?: Json | null
          user_id?: string
        }
      }
      course_enrollments: {
        Row: {
          course_id: string
          enrolled_at: string | null
          id: string
          last_accessed_at: string | null
          progress: number | null
          user_id: string
        }
        Insert: {
          course_id: string
          enrolled_at?: string | null
          id?: string
          last_accessed_at?: string | null
          progress?: number | null
          user_id: string
        }
        Update: {
          course_id?: string
          enrolled_at?: string | null
          id?: string
          last_accessed_at?: string | null
          progress?: number | null
          user_id?: string
        }
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          feature_used: string | null
          id: string
          metadata: Json | null
          stripe_payment_intent_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          feature_used?: string | null
          id?: string
          metadata?: Json | null
          stripe_payment_intent_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          feature_used?: string | null
          id?: string
          metadata?: Json | null
          stripe_payment_intent_id?: string | null
          transaction_type?: string
          user_id?: string
        }
      }
      lesson_completions: {
        Row: {
          completed_at: string | null
          course_id: string
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          id?: string
          lesson_id?: string
          user_id?: string
        }
      }
      mission_completions: {
        Row: {
          completed_at: string | null
          credits_awarded: number | null
          id: string
          mission_id: string
          points_awarded: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          credits_awarded?: number | null
          id?: string
          mission_id: string
          points_awarded: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          credits_awarded?: number | null
          id?: string
          mission_id?: string
          points_awarded?: number
          user_id?: string
        }
      }
      notifications: {
        Row: {
          channel: string
          created_at: string | null
          expires_at: string | null
          id: string
          message: string
          metadata: Json | null
          priority: string | null
          read: boolean | null
          status: string
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          channel: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          priority?: string | null
          read?: boolean | null
          status: string
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          channel?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          priority?: string | null
          read?: boolean | null
          status?: string
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
      }
      portfolio_holdings: {
        Row: {
          amount: number
          average_purchase_price_usd: number
          created_at: string | null
          crypto_id: string
          current_price_usd: number | null
          current_value_usd: number | null
          first_purchase_date: string | null
          id: string
          last_updated: string | null
          name: string
          portfolio_id: string
          profit_loss_percentage: number | null
          profit_loss_usd: number | null
          symbol: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          average_purchase_price_usd: number
          created_at?: string | null
          crypto_id: string
          current_price_usd?: number | null
          current_value_usd?: number | null
          first_purchase_date?: string | null
          id?: string
          last_updated?: string | null
          name: string
          portfolio_id: string
          profit_loss_percentage?: number | null
          profit_loss_usd?: number | null
          symbol: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          average_purchase_price_usd?: number
          created_at?: string | null
          crypto_id?: string
          current_price_usd?: number | null
          current_value_usd?: number | null
          first_purchase_date?: string | null
          id?: string
          last_updated?: string | null
          name?: string
          portfolio_id?: string
          profit_loss_percentage?: number | null
          profit_loss_usd?: number | null
          symbol?: string
          updated_at?: string | null
        }
      }
      portfolios: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          last_updated: string | null
          name: string | null
          total_cost_usd: number | null
          total_value_usd: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          last_updated?: string | null
          name?: string | null
          total_cost_usd?: number | null
          total_value_usd?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          last_updated?: string | null
          name?: string | null
          total_cost_usd?: number | null
          total_value_usd?: number | null
          updated_at?: string | null
          user_id?: string
        }
      }
      sessions: {
        Row: {
          created_at: string | null
          expires: string
          id: string
          session_token: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires: string
          id: string
          session_token: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires?: string
          id?: string
          session_token?: string
          user_id?: string
        }
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string
          current_period_start: string
          id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string | null
          tier: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end: string
          current_period_start: string
          id?: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id?: string | null
          tier: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string | null
          user_id?: string
        }
      }
      user_achievements: {
        Row: {
          achievement_id: string
          awarded_at: string | null
          id: string
          points: number
          user_id: string
        }
        Insert: {
          achievement_id: string
          awarded_at?: string | null
          id?: string
          points: number
          user_id: string
        }
        Update: {
          achievement_id?: string
          awarded_at?: string | null
          id?: string
          points?: number
          user_id?: string
        }
      }
      user_activity_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
      }
      user_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          crypto_id: string
          id: string
          is_active: boolean | null
          last_triggered: string | null
          metadata: Json | null
          target_value: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          crypto_id: string
          id?: string
          is_active?: boolean | null
          last_triggered?: string | null
          metadata?: Json | null
          target_value?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          crypto_id?: string
          id?: string
          is_active?: boolean | null
          last_triggered?: string | null
          metadata?: Json | null
          target_value?: number | null
          updated_at?: string | null
          user_id?: string
        }
      }
      users: {
        Row: {
          created_at: string | null
          credits_balance: number | null
          deleted_at: string | null
          email: string
          id: string
          image: string | null
          name: string | null
          onboarding_completed: boolean | null
          preferences: Json | null
          subscription_tier: string | null
          total_points: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          credits_balance?: number | null
          deleted_at?: string | null
          email: string
          id?: string
          image?: string | null
          name?: string | null
          onboarding_completed?: boolean | null
          preferences?: Json | null
          subscription_tier?: string | null
          total_points?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          credits_balance?: number | null
          deleted_at?: string | null
          email?: string
          id?: string
          image?: string | null
          name?: string | null
          onboarding_completed?: boolean | null
          preferences?: Json | null
          subscription_tier?: string | null
          total_points?: number | null
          updated_at?: string | null
        }
      }
      verification_tokens: {
        Row: {
          created_at: string | null
          expires: string
          identifier: string
          token: string
        }
        Insert: {
          created_at?: string | null
          expires: string
          identifier: string
          token: string
        }
        Update: {
          created_at?: string | null
          expires?: string
          identifier?: string
          token?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      spend_credits: {
        Args: {
          credit_amount: number
          feature_name: string
          transaction_description: string
          user_id: string
        }
        Returns: Json
      }
      update_portfolio_totals: {
        Args: { portfolio_id_param: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}