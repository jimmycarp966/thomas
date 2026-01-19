-- =====================================================
-- VERIFICAR CREDENCIALES DE IOL
-- =====================================================
-- Este script verifica que las credenciales de IOL estén configuradas correctamente

SELECT
    tc.id,
    tc.user_id,
    p.email,
    tc.iol_username,
    CASE
        WHEN tc.iol_password IS NOT NULL THEN '✅ CONFIGURADO'
        ELSE '❌ NO CONFIGURADO'
    END as iol_password_status,
    tc.iol_api_key,
    tc.iol_api_secret,
    tc.updated_at
FROM trading_config tc
JOIN profiles p ON p.id = tc.user_id
WHERE p.email = 'adani.romano@gmail.com';
