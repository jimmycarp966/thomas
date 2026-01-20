-- =====================================================
-- MIGRATION: Circuit Breaker
-- =====================================================

-- Agregar campos de configuración del Circuit Breaker a trading_config
ALTER TABLE trading_config
ADD COLUMN IF NOT EXISTS circuit_breaker_config JSONB DEFAULT '{
  "maxConsecutiveLosses": 3,
  "maxDailyLossPct": 5,
  "maxWeeklyLossPct": 10,
  "cooldownHours": 4
}'::jsonb,
ADD COLUMN IF NOT EXISTS circuit_breaker_paused_until TIMESTAMPTZ;

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_trading_config_circuit_breaker ON trading_config(user_id);
