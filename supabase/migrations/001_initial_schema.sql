-- =====================================================
-- EXTENSIONES
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- =====================================================
-- TABLA: profiles
-- =====================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'America/Argentina/Buenos_Aires',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLA: trading_config
-- =====================================================
CREATE TABLE trading_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Exchange API keys (encriptadas)
  binance_api_key TEXT,
  binance_api_secret TEXT,
  iol_api_key TEXT,
  iol_api_secret TEXT,
  
  -- Preferencias
  risk_profile TEXT CHECK (risk_profile IN ('conservative', 'moderate', 'aggressive')) DEFAULT 'moderate',
  max_trade_amount DECIMAL(10, 2) DEFAULT 100.00,
  allowed_assets JSONB DEFAULT '["BTC", "ETH", "SOL"]'::jsonb,
  auto_execute BOOLEAN DEFAULT false,
  stop_loss_percentage DECIMAL(5, 2) DEFAULT 5.00,
  take_profit_percentage DECIMAL(5, 2) DEFAULT 10.00,
  
  -- Horarios
  trading_hours_start TIME DEFAULT '09:00:00',
  trading_hours_end TIME DEFAULT '18:00:00',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- =====================================================
-- TABLA: trading_decisions
-- =====================================================
CREATE TABLE trading_decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  asset_symbol TEXT NOT NULL,
  asset_type TEXT CHECK (asset_type IN ('crypto', 'stock', 'cedear')) NOT NULL,
  decision_type TEXT CHECK (decision_type IN ('BUY', 'SELL', 'HOLD')) NOT NULL,
  
  ai_analysis JSONB NOT NULL,
  suggested_amount DECIMAL(10, 2),
  suggested_price DECIMAL(10, 4),
  stop_loss_price DECIMAL(10, 4),
  take_profit_price DECIMAL(10, 4),
  
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'executed', 'cancelled')) DEFAULT 'pending',
  user_feedback TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  decided_at TIMESTAMPTZ,
  
  embedding vector(768)
);

CREATE INDEX idx_trading_decisions_user ON trading_decisions(user_id);
CREATE INDEX idx_trading_decisions_status ON trading_decisions(status);

-- =====================================================
-- TABLA: trades
-- =====================================================
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  decision_id UUID REFERENCES trading_decisions(id) ON DELETE SET NULL,
  
  exchange TEXT NOT NULL,
  asset_symbol TEXT NOT NULL,
  trade_type TEXT CHECK (trade_type IN ('BUY', 'SELL')) NOT NULL,
  
  quantity DECIMAL(18, 8) NOT NULL,
  price DECIMAL(10, 4) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  fees DECIMAL(10, 4) DEFAULT 0,
  
  status TEXT CHECK (status IN ('pending', 'executed', 'failed', 'cancelled')) DEFAULT 'pending',
  exchange_order_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  executed_at TIMESTAMPTZ
);

CREATE INDEX idx_trades_user ON trades(user_id);
CREATE INDEX idx_trades_decision ON trades(decision_id);

-- =====================================================
-- TABLA: trade_results
-- =====================================================
CREATE TABLE trade_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trade_id UUID REFERENCES trades(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  entry_price DECIMAL(10, 4) NOT NULL,
  exit_price DECIMAL(10, 4),
  pnl_amount DECIMAL(10, 2),
  pnl_percentage DECIMAL(5, 2),
  
  status TEXT CHECK (status IN ('open', 'closed_profit', 'closed_loss', 'closed_breakeven')) DEFAULT 'open',
  
  ai_evaluation JSONB,
  
  opened_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  evaluated_at TIMESTAMPTZ,
  
  embedding vector(768),
  
  UNIQUE(trade_id)
);

CREATE INDEX idx_trade_results_user ON trade_results(user_id);

-- =====================================================
-- TABLA: ai_learnings
-- =====================================================
CREATE TABLE ai_learnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  learning_type TEXT CHECK (learning_type IN ('success_pattern', 'failure_pattern', 'market_insight', 'user_preference')) NOT NULL,
  content JSONB NOT NULL,
  importance_score DECIMAL(3, 2) DEFAULT 0.50,
  
  related_decisions UUID[] DEFAULT '{}',
  related_trades UUID[] DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_validated_at TIMESTAMPTZ,
  times_applied INTEGER DEFAULT 0,
  
  embedding vector(768)
);

CREATE INDEX idx_ai_learnings_user ON ai_learnings(user_id);
CREATE INDEX idx_ai_learnings_importance ON ai_learnings(importance_score DESC);

-- =====================================================
-- TABLA: chat_conversations
-- =====================================================
CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  title TEXT DEFAULT 'Nueva conversación',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_conversations_user ON chat_conversations(user_id);

-- =====================================================
-- TABLA: chat_messages
-- =====================================================
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
  content TEXT NOT NULL,
  ai_metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  embedding vector(768)
);

CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id);

-- =====================================================
-- TABLA: wellness_tracking
-- =====================================================
CREATE TABLE wellness_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  date DATE NOT NULL,
  
  fasting_start TIMESTAMPTZ,
  fasting_end TIMESTAMPTZ,
  fasting_hours DECIMAL(4, 2),
  fasting_completed BOOLEAN DEFAULT false,
  
  weight_kg DECIMAL(5, 2),
  
  exercise_completed BOOLEAN DEFAULT false,
  exercise_type TEXT,
  exercise_duration_minutes INTEGER,
  
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  mood_level INTEGER CHECK (mood_level BETWEEN 1 AND 10),
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 10),
  sleep_hours DECIMAL(3, 1),
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

CREATE INDEX idx_wellness_user_date ON wellness_tracking(user_id, date DESC);

-- =====================================================
-- TABLA: notifications
-- =====================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  type TEXT CHECK (type IN ('trade_suggestion', 'trade_executed', 'trade_result', 'wellness_reminder', 'system')) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read, created_at DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trading_config_updated_at
  BEFORE UPDATE ON trading_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wellness_tracking_updated_at
  BEFORE UPDATE ON wellness_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_conversations_updated_at
  BEFORE UPDATE ON chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
