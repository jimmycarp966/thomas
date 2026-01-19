-- =====================================================
-- FIX IOL AUTHENTICATION - ADD USERNAME AND PASSWORD FIELDS
-- =====================================================
-- Issue: IOL API uses username/password authentication, not API keys
-- Reference: https://github.com/msap-uai/API-Invertironline
-- Endpoint: POST https://api.invertironline.com/token
-- Body: username=MIUSUARIO&password=MICONTRASEÑA&grant_type=password

-- Add iol_username and iol_password fields
ALTER TABLE trading_config
ADD COLUMN IF NOT EXISTS iol_username TEXT,
ADD COLUMN IF NOT EXISTS iol_password TEXT;

-- Comment to clarify the usage
COMMENT ON COLUMN trading_config.iol_username IS 'IOL account username for authentication (NOT API key)';
COMMENT ON COLUMN trading_config.iol_password IS 'IOL account password for authentication (NOT API secret)';
COMMENT ON COLUMN trading_config.iol_api_key IS 'DEPRECATED: IOL uses username/password, not API keys';
COMMENT ON COLUMN trading_config.iol_api_secret IS 'DEPRECATED: IOL uses username/password, not API secrets';
