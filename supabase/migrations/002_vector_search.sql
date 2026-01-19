-- =====================================================
-- ÍNDICES VECTORIALES
-- =====================================================
CREATE INDEX idx_trading_decisions_embedding 
  ON trading_decisions 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX idx_trade_results_embedding 
  ON trade_results 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX idx_ai_learnings_embedding 
  ON ai_learnings 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX idx_chat_messages_embedding 
  ON chat_messages 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- =====================================================
-- FUNCIÓN: match_similar_decisions
-- =====================================================
CREATE OR REPLACE FUNCTION match_similar_decisions(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  p_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  asset_symbol text,
  decision_type text,
  ai_analysis jsonb,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    asset_symbol,
    decision_type,
    ai_analysis,
    1 - (embedding <=> query_embedding) as similarity
  FROM trading_decisions
  WHERE 
    (p_user_id IS NULL OR user_id = p_user_id)
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;

-- =====================================================
-- FUNCIÓN: match_relevant_learnings
-- =====================================================
CREATE OR REPLACE FUNCTION match_relevant_learnings(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  p_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  learning_type text,
  content jsonb,
  importance_score decimal,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    learning_type,
    content,
    importance_score,
    1 - (embedding <=> query_embedding) as similarity
  FROM ai_learnings
  WHERE 
    (p_user_id IS NULL OR user_id = p_user_id)
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY 
    importance_score DESC,
    embedding <=> query_embedding
  LIMIT match_count;
$$;
