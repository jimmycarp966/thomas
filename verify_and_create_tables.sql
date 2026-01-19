-- =====================================================
-- VERIFICAR Y CREAR TABLAS DE CHAT SI NO EXISTEN
-- Ejecutar este archivo en el SQL Editor de Supabase
-- =====================================================

-- Verificar si la tabla chat_conversations existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'chat_conversations'
  ) THEN
    -- Crear tabla chat_conversations
    CREATE TABLE chat_conversations (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
      
      title TEXT DEFAULT 'Nueva conversación',
      
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Crear índice
    CREATE INDEX idx_chat_conversations_user ON chat_conversations(user_id);
    
    -- Crear trigger para updated_at
    CREATE TRIGGER update_chat_conversations_updated_at
      BEFORE UPDATE ON chat_conversations
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
      
    RAISE NOTICE 'Tabla chat_conversations creada exitosamente';
  ELSE
    RAISE NOTICE 'La tabla chat_conversations ya existe';
  END IF;
END $$;

-- Verificar si la tabla chat_messages existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'chat_messages'
  ) THEN
    -- Crear tabla chat_messages
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
    
    -- Crear índices
    CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id);
    CREATE INDEX idx_chat_messages_embedding 
      ON chat_messages 
      USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100);
    
    RAISE NOTICE 'Tabla chat_messages creada exitosamente';
  ELSE
    RAISE NOTICE 'La tabla chat_messages ya existe';
  END IF;
END $$;

-- Verificar si las políticas RLS existen y crearlas si no existen
DO $$
BEGIN
  -- Verificar si la política para chat_conversations existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chat_conversations' 
    AND policyname = 'Users can view own conversations'
  ) THEN
    CREATE POLICY "Users can view own conversations" ON chat_conversations
      FOR SELECT USING (user_id = '00000000-0000-0000-0000-000000000001');

    CREATE POLICY "Users can insert own conversations" ON chat_conversations
      FOR INSERT WITH CHECK (user_id = '00000000-0000-0000-0000-000000000001');

    CREATE POLICY "Users can update own conversations" ON chat_conversations
      FOR UPDATE USING (user_id = '00000000-0000-0000-0000-000000000001');

    CREATE POLICY "Users can delete own conversations" ON chat_conversations
      FOR DELETE USING (user_id = '00000000-0000-0000-0000-000000000001');
      
    RAISE NOTICE 'Políticas RLS para chat_conversations creadas';
  END IF;

  -- Verificar si la política para chat_messages existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chat_messages' 
    AND policyname = 'Users can view own messages'
  ) THEN
    CREATE POLICY "Users can view own messages" ON chat_messages
      FOR SELECT USING (user_id = '00000000-0000-0000-0000-000000000001');

    CREATE POLICY "Users can insert own messages" ON chat_messages
      FOR INSERT WITH CHECK (user_id = '00000000-0000-0000-0000-000000000001');

    RAISE NOTICE 'Políticas RLS para chat_messages creadas';
  END IF;
END $$;

-- =====================================================
-- VERIFICAR TABLAS CREADAS
-- =====================================================
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('chat_conversations', 'chat_messages')
ORDER BY table_name;
