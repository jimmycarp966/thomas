-- =====================================================
-- CONFIGURAR CREDENCIALES DE IOL
-- =====================================================
-- Este script actualiza las credenciales de IOL para el usuario

-- Actualizar las credenciales de IOL
UPDATE trading_config
SET
    iol_username = 'adani.romano@gmail.com',
    iol_password = 'Pastelito673!!!',
    updated_at = NOW()
WHERE user_id = (
    SELECT id FROM profiles
    WHERE email = 'adani.romano@gmail.com'
    LIMIT 1
);

-- Verificar la actualización
SELECT
    id,
    user_id,
    iol_username,
    iol_password,
    updated_at
FROM trading_config
WHERE iol_username = 'adani.romano@gmail.com';
