-- =====================================================
-- CREAR CONFIGURACIÓN DE TRADING PARA USUARIO
-- =====================================================
-- Este script crea el registro de configuración de trading para el usuario
-- y configura las credenciales de IOL

-- Primero, verificar que el perfil existe
SELECT id, email FROM profiles WHERE email = 'adani.romano@gmail.com';

-- Crear el registro de configuración de trading con las credenciales de IOL
INSERT INTO trading_config (
    user_id,
    iol_username,
    iol_password,
    risk_profile,
    max_trade_amount,
    stop_loss_percentage,
    take_profit_percentage,
    auto_execute,
    allowed_assets,
    trading_hours_start,
    trading_hours_end
)
SELECT
    id,
    'adani.romano@gmail.com' as iol_username,
    'Pastelito673!!!' as iol_password,
    'moderate' as risk_profile,
    1000.00 as max_trade_amount,
    5.00 as stop_loss_percentage,
    10.00 as take_profit_percentage,
    false as auto_execute,
    '["BTC", "ETH", "SOL"]'::jsonb as allowed_assets,
    '09:00:00' as trading_hours_start,
    '18:00:00' as trading_hours_end
FROM profiles
WHERE email = 'adani.romano@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM trading_config WHERE user_id = profiles.id
);

-- Verificar que se creó correctamente
SELECT
    tc.id,
    tc.user_id,
    p.email,
    tc.iol_username,
    CASE
        WHEN tc.iol_password IS NOT NULL THEN '✅ CONFIGURADO'
        ELSE '❌ NO CONFIGURADO'
    END as iol_password_status,
    tc.updated_at
FROM trading_config tc
JOIN profiles p ON p.id = tc.user_id
WHERE p.email = 'adani.romano@gmail.com';
