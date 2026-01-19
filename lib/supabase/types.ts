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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string
          created_at?: string
          updated_at?: string
        }
      }
      trading_config: {
        Row: {
          id: string
          user_id: string
          binance_api_key: string | null
          binance_api_secret: string | null
          iol_username: string | null
          iol_password: string | null
          iol_api_key: string | null
          iol_api_secret: string | null
          risk_profile: 'conservative' | 'moderate' | 'aggressive'
          max_trade_amount: number
          allowed_assets: Json
          auto_execute: boolean
          stop_loss_percentage: number
          take_profit_percentage: number
          trading_hours_start: string
          trading_hours_end: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          binance_api_key?: string | null
          binance_api_secret?: string | null
          iol_username?: string | null
          iol_password?: string | null
          iol_api_key?: string | null
          iol_api_secret?: string | null
          risk_profile?: 'conservative' | 'moderate' | 'aggressive'
          max_trade_amount?: number
          allowed_assets?: Json
          auto_execute?: boolean
          stop_loss_percentage?: number
          take_profit_percentage?: number
          trading_hours_start?: string
          trading_hours_end?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          binance_api_key?: string | null
          binance_api_secret?: string | null
          iol_username?: string | null
          iol_password?: string | null
          iol_api_key?: string | null
          iol_api_secret?: string | null
          risk_profile?: 'conservative' | 'moderate' | 'aggressive'
          max_trade_amount?: number
          allowed_assets?: Json
          auto_execute?: boolean
          stop_loss_percentage?: number
          take_profit_percentage?: number
          trading_hours_start?: string
          trading_hours_end?: string
          created_at?: string
          updated_at?: string
        }
      }
      trading_decisions: {
        Row: {
          id: string
          user_id: string
          asset_symbol: string
          asset_type: 'crypto' | 'stock' | 'cedear'
          decision_type: 'BUY' | 'SELL' | 'HOLD'
          ai_analysis: Json
          suggested_amount: number | null
          suggested_price: number | null
          stop_loss_price: number | null
          take_profit_price: number | null
          status: 'pending' | 'approved' | 'rejected' | 'executed' | 'cancelled'
          user_feedback: string | null
          created_at: string
          decided_at: string | null
          embedding: number[] | null
        }
        Insert: {
          id?: string
          user_id: string
          asset_symbol: string
          asset_type: 'crypto' | 'stock' | 'cedear'
          decision_type: 'BUY' | 'SELL' | 'HOLD'
          ai_analysis: Json
          suggested_amount?: number | null
          suggested_price?: number | null
          stop_loss_price?: number | null
          take_profit_price?: number | null
          status?: 'pending' | 'approved' | 'rejected' | 'executed' | 'cancelled'
          user_feedback?: string | null
          created_at?: string
          decided_at?: string | null
          embedding?: number[] | null
        }
        Update: {
          id?: string
          user_id?: string
          asset_symbol?: string
          asset_type?: 'crypto' | 'stock' | 'cedear'
          decision_type?: 'BUY' | 'SELL' | 'HOLD'
          ai_analysis?: Json
          suggested_amount?: number | null
          suggested_price?: number | null
          stop_loss_price?: number | null
          take_profit_price?: number | null
          status?: 'pending' | 'approved' | 'rejected' | 'executed' | 'cancelled'
          user_feedback?: string | null
          created_at?: string
          decided_at?: string | null
          embedding?: number[] | null
        }
      }
      trades: {
        Row: {
          id: string
          user_id: string
          decision_id: string | null
          exchange: string
          asset_symbol: string
          trade_type: 'BUY' | 'SELL'
          quantity: number
          price: number
          total_amount: number
          fees: number
          status: 'pending' | 'executed' | 'failed' | 'cancelled'
          exchange_order_id: string | null
          created_at: string
          executed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          decision_id?: string | null
          exchange: string
          asset_symbol: string
          trade_type: 'BUY' | 'SELL'
          quantity: number
          price: number
          total_amount: number
          fees?: number
          status?: 'pending' | 'executed' | 'failed' | 'cancelled'
          exchange_order_id?: string | null
          created_at?: string
          executed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          decision_id?: string | null
          exchange?: string
          asset_symbol?: string
          trade_type?: 'BUY' | 'SELL'
          quantity?: number
          price?: number
          total_amount?: number
          fees?: number
          status?: 'pending' | 'executed' | 'failed' | 'cancelled'
          exchange_order_id?: string | null
          created_at?: string
          executed_at?: string | null
        }
      }
      trade_results: {
        Row: {
          id: string
          trade_id: string
          user_id: string
          entry_price: number
          exit_price: number | null
          pnl_amount: number | null
          pnl_percentage: number | null
          status: 'open' | 'closed_profit' | 'closed_loss' | 'closed_breakeven'
          ai_evaluation: Json | null
          opened_at: string
          closed_at: string | null
          evaluated_at: string | null
          embedding: number[] | null
        }
        Insert: {
          id?: string
          trade_id: string
          user_id: string
          entry_price: number
          exit_price?: number | null
          pnl_amount?: number | null
          pnl_percentage?: number | null
          status?: 'open' | 'closed_profit' | 'closed_loss' | 'closed_breakeven'
          ai_evaluation?: Json | null
          opened_at?: string
          closed_at?: string | null
          evaluated_at?: string | null
          embedding?: number[] | null
        }
        Update: {
          id?: string
          trade_id?: string
          user_id?: string
          entry_price?: number
          exit_price?: number | null
          pnl_amount?: number | null
          pnl_percentage?: number | null
          status?: 'open' | 'closed_profit' | 'closed_loss' | 'closed_breakeven'
          ai_evaluation?: Json | null
          opened_at?: string
          closed_at?: string | null
          evaluated_at?: string | null
          embedding?: number[] | null
        }
      }
      ai_learnings: {
        Row: {
          id: string
          user_id: string
          learning_type: 'success_pattern' | 'failure_pattern' | 'market_insight' | 'user_preference'
          content: Json
          importance_score: number
          related_decisions: string[]
          related_trades: string[]
          created_at: string
          last_validated_at: string | null
          times_applied: number
          embedding: number[] | null
        }
        Insert: {
          id?: string
          user_id: string
          learning_type: 'success_pattern' | 'failure_pattern' | 'market_insight' | 'user_preference'
          content: Json
          importance_score?: number
          related_decisions?: string[]
          related_trades?: string[]
          created_at?: string
          last_validated_at?: string | null
          times_applied?: number
          embedding?: number[] | null
        }
        Update: {
          id?: string
          user_id?: string
          learning_type?: 'success_pattern' | 'failure_pattern' | 'market_insight' | 'user_preference'
          content?: Json
          importance_score?: number
          related_decisions?: string[]
          related_trades?: string[]
          created_at?: string
          last_validated_at?: string | null
          times_applied?: number
          embedding?: number[] | null
        }
      }
      chat_conversations: {
        Row: {
          id: string
          user_id: string
          title: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          created_at?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          conversation_id: string
          user_id: string
          role: 'user' | 'assistant'
          content: string
          ai_metadata: Json | null
          created_at: string
          embedding: number[] | null
        }
        Insert: {
          id?: string
          conversation_id: string
          user_id: string
          role: 'user' | 'assistant'
          content: string
          ai_metadata?: Json | null
          created_at?: string
          embedding?: number[] | null
        }
        Update: {
          id?: string
          conversation_id?: string
          user_id?: string
          role?: 'user' | 'assistant'
          content?: string
          ai_metadata?: Json | null
          created_at?: string
          embedding?: number[] | null
        }
      }
      wellness_tracking: {
        Row: {
          id: string
          user_id: string
          date: string
          fasting_start: string | null
          fasting_end: string | null
          fasting_hours: number | null
          fasting_completed: boolean
          weight_kg: number | null
          exercise_completed: boolean
          exercise_type: string | null
          exercise_duration_minutes: number | null
          energy_level: number | null
          mood_level: number | null
          sleep_quality: number | null
          sleep_hours: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          fasting_start?: string | null
          fasting_end?: string | null
          fasting_hours?: number | null
          fasting_completed?: boolean
          weight_kg?: number | null
          exercise_completed?: boolean
          exercise_type?: string | null
          exercise_duration_minutes?: number | null
          energy_level?: number | null
          mood_level?: number | null
          sleep_quality?: number | null
          sleep_hours?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          fasting_start?: string | null
          fasting_end?: string | null
          fasting_hours?: number | null
          fasting_completed?: boolean
          weight_kg?: number | null
          exercise_completed?: boolean
          exercise_type?: string | null
          exercise_duration_minutes?: number | null
          energy_level?: number | null
          mood_level?: number | null
          sleep_quality?: number | null
          sleep_hours?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'trade_suggestion' | 'trade_executed' | 'trade_result' | 'wellness_reminder' | 'system'
          title: string
          message: string
          metadata: Json | null
          read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'trade_suggestion' | 'trade_executed' | 'trade_result' | 'wellness_reminder' | 'system'
          title: string
          message: string
          metadata?: Json | null
          read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'trade_suggestion' | 'trade_executed' | 'trade_result' | 'wellness_reminder' | 'system'
          title?: string
          message?: string
          metadata?: Json | null
          read?: boolean
          read_at?: string | null
          created_at?: string
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
      [_ in never]: never
    }
  }
}
