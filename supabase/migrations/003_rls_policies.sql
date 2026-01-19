-- =====================================================
-- HABILITAR RLS
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_learnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS: profiles
-- =====================================================
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- POLÍTICAS: trading_config
-- =====================================================
CREATE POLICY "Users can view own config" ON trading_config
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own config" ON trading_config
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own config" ON trading_config
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS: trading_decisions
-- =====================================================
CREATE POLICY "Users can view own decisions" ON trading_decisions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own decisions" ON trading_decisions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own decisions" ON trading_decisions
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS: trades
-- =====================================================
CREATE POLICY "Users can view own trades" ON trades
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades" ON trades
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades" ON trades
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS: trade_results
-- =====================================================
CREATE POLICY "Users can view own results" ON trade_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own results" ON trade_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own results" ON trade_results
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS: ai_learnings
-- =====================================================
CREATE POLICY "Users can view own learnings" ON ai_learnings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learnings" ON ai_learnings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own learnings" ON ai_learnings
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS: chat_conversations
-- =====================================================
CREATE POLICY "Users can view own conversations" ON chat_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" ON chat_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON chat_conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" ON chat_conversations
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS: chat_messages
-- =====================================================
CREATE POLICY "Users can view own messages" ON chat_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS: wellness_tracking
-- =====================================================
CREATE POLICY "Users can view own wellness" ON wellness_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wellness" ON wellness_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wellness" ON wellness_tracking
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS: notifications
-- =====================================================
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);
