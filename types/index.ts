// Trading Types
export type AssetType = 'crypto' | 'stock' | 'cedear'
export type TradeType = 'BUY' | 'SELL'
export type DecisionType = 'BUY' | 'SELL' | 'HOLD'
export type RiskProfile = 'conservative' | 'moderate' | 'aggressive'
export type Exchange = 'binance' | 'yahoo' | 'iol'

export interface TradingDecision {
  id: string
  user_id: string
  asset_symbol: string
  asset_type: AssetType
  decision_type: DecisionType
  ai_analysis: AIAnalysis
  suggested_amount: number
  suggested_price: number | null
  stop_loss_price: number | null
  take_profit_price: number | null
  status: 'pending' | 'approved' | 'rejected' | 'executed'
  decided_at: string | null
  user_feedback: string | null
  created_at: string
  updated_at: string
}

export interface AIAnalysis {
  decision: DecisionType
  confidence: number
  reasoning: string
  suggestedEntry: number | null
  suggestedExit: number | null
  stopLoss: number | null
  takeProfit: number | null
  current_price?: number
  current_change?: number
}

export interface Trade {
  id: string
  user_id: string
  decision_id: string | null
  exchange: Exchange
  asset_symbol: string
  trade_type: TradeType
  quantity: number
  price: number
  total_amount: number
  fees: number
  status: 'pending' | 'executed' | 'cancelled' | 'closed'
  exchange_order_id: string | null
  executed_at: string | null
  created_at: string
  updated_at: string
}

export interface TradeResult {
  id: string
  trade_id: string
  user_id: string
  entry_price: number
  exit_price: number | null
  pnl_amount: number | null
  pnl_percentage: number | null
  status: 'open' | 'closed_profit' | 'closed_loss' | 'closed_breakeven'
  opened_at: string
  closed_at: string | null
}

export interface TradingConfig {
  id: string
  user_id: string
  binance_api_key: string | null
  binance_api_secret: string | null
  iol_username: string | null
  iol_password: string | null
  iol_api_key: string | null
  iol_api_secret: string | null
  risk_profile: RiskProfile
  max_trade_amount: number
  stop_loss_percentage: number
  take_profit_percentage: number
  auto_execute: boolean
  allowed_assets: AllowedAsset[]
  created_at: string
  updated_at: string
}

export interface AllowedAsset {
  symbol: string
  name: string
  type: AssetType
}

// Wellness Types
export interface WellnessTracking {
  id: string
  user_id: string
  fasting_hours: number
  weight: number | null
  mood: number
  energy: number
  sleep: number
  wellness_score: number
  notes: string | null
  created_at: string
  updated_at: string
}

// Chat Types
export interface ChatConversation {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  conversation_id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  ai_metadata: AIMetadata | null
  created_at: string
}

export interface AIMetadata {
  embedding: number[]
  model: string
  tokens_used: number
}

// AI Learning Types
export type LearningType = 'success_pattern' | 'failure_pattern' | 'market_insight' | 'user_preference'

export interface AILearning {
  id: string
  user_id: string
  learning_type: LearningType
  content: any
  importance_score: number
  related_decisions: string[]
  related_trades: string[]
  embedding: number[]
  created_at: string
  updated_at: string
}

// Notification Types
export type NotificationType = 'trade_executed' | 'trade_closed' | 'ai_suggestion' | 'wellness_reminder' | 'price_alert'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  data: any
  read: boolean
  created_at: string
}

// Profile Types
export interface Profile {
  id: string
  user_id: string
  full_name: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

// Market Data Types
export interface MarketData {
  symbol: string
  price: number
  change: number
  changePercent: number
  high: number
  low: number
  volume: number
  timestamp: number
}

export interface OHLCVData {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Form Types
export interface TradingFormData {
  assetSymbol: string
  assetType: AssetType
  exchange: Exchange
}

export interface SettingsFormData {
  riskProfile: RiskProfile
  maxTradeAmount: number
  stopLossPercentage: number
  takeProfitPercentage: number
  autoExecute: boolean
  binanceApiKey: string
  binanceApiSecret: string
  iolApiKey: string
  iolApiSecret: string
}

export interface WellnessFormData {
  fastingHours: number
  weight: number
  mood: number
  energy: number
  sleep: number
}

// Chart Types
export interface ChartDataPoint {
  x: string | number
  y: number
}

export interface PerformanceChartData {
  date: string
  value: number
  pnl: number
}

// Statistics Types
export interface DashboardStats {
  portfolioValue: number
  totalTrades: number
  winRate: number
  totalPnL: number
  activeTrades: number
  wellnessScore: number
}

// Utility Types
export type Optional<T> = T | null | undefined
export type Nullable<T> = T | null
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
