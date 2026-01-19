-- =====================================================
-- CREAR FUNCIONES RAG PARA BÚSQUEDA VECTORIAL
-- Ejecutar este archivo en el SQL Editor de Supabase
-- =====================================================

-- Función para buscar mensajes relevantes usando búsqueda vectorial
CREATE OR REPLACE FUNCTION match_chat_messages(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  conversation_id UUID,
  role TEXT,
  content TEXT,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cm.id,
    cm.conversation_id,
    cm.role,
    cm.content,
    1 - (cm.embedding <=> query_embedding) as similarity
  FROM chat_messages cm
  WHERE cm.role = 'assistant'
    AND cm.embedding IS NOT NULL
    AND 1 - (cm.embedding <=> query_embedding) >= match_threshold
  ORDER BY cm.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Función para buscar aprendizajes relevantes
CREATE OR REPLACE FUNCTION match_learnings(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  category TEXT,
  insight TEXT,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.category,
    al.insight,
    1 - (al.embedding <=> query_embedding) as similarity
  FROM ai_learnings al
  WHERE al.embedding IS NOT NULL
    AND 1 - (al.embedding <=> query_embedding) >= match_threshold
  ORDER BY al.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Función para generar embedding para un texto
CREATE OR REPLACE FUNCTION generate_text_embedding(text_content TEXT)
RETURNS vector(768)
LANGUAGE plpgsql
AS $$
DECLARE
  embedding_result vector(768);
BEGIN
  -- Esta función requiere que tengas una función externa para generar embeddings
  -- Por ahora, devuelve NULL. Deberías integrar esto con Vertex AI o similar.
  RETURN NULL;
END;
$$;

-- =====================================================
-- VERIFICAR FUNCIONES CREADAS
-- =====================================================
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('match_chat_messages', 'match_learnings', 'generate_text_embedding')
ORDER BY routine_name;
