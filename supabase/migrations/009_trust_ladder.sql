-- =====================================================
-- MIGRATION: Trust Ladder
-- =====================================================

-- Agregar campo de nivel de confianza a trading_config
ALTER TABLE trading_config
ADD COLUMN IF NOT EXISTS trust_level INTEGER DEFAULT 1 CHECK (trust_level IN (1, 2, 3, 4));

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_trading_config_trust_level ON trading_config(user_id, trust_level);
