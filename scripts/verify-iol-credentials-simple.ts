import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oxzozdqncwvbbgcmjiwi.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94em96ZHFuY3d2YmJnY21qaXdpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODcwMDIyMSwiZXhwIjoyMDg0Mjc2MjF9.9G-92Czu1IM1JX8Awy5Mx_KOgJbNNmP1yOENcUN-k7Y'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyIOLCredentials() {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'adani.romano@gmail.com')
      .single()

    if (!profile) {
      console.error('❌ No se encontró el perfil del usuario')
      return
    }

    console.log('✅ User ID encontrado:', profile.id)

    const { data: config, error } = await supabase
      .from('trading_config')
      .select('user_id, iol_username, iol_password, iol_api_key, iol_api_secret, updated_at')
      .eq('user_id', profile.id)
      .single()

    if (error) {
      console.error('❌ Error obteniendo configuración:', error)
      return
    }

    if (!config) {
      console.error('❌ No se encontró configuración de trading')
      return
    }

    console.log('\n📋 Configuración actual de IOL:')
    console.log('----------------------------------------')
    console.log('User ID:', config.user_id)
    console.log('IOL Username:', config.iol_username || '❌ NO CONFIGURADO')
    console.log('IOL Password:', config.iol_password ? '✅ CONFIGURADO' : '❌ NO CONFIGURADO')
    console.log('IOL API Key:', config.iol_api_key || 'NULL')
    console.log('IOL API Secret:', config.iol_api_secret || 'NULL')
    console.log('Updated At:', config.updated_at)
    console.log('----------------------------------------')

    if (!config.iol_username || !config.iol_password) {
      console.error('\n❌ ERROR: Las credenciales de IOL no están configuradas correctamente')
      console.error('Se necesita iol_username y iol_password')
    } else {
      console.log('\n✅ Las credenciales de IOL están configuradas')
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

verifyIOLCredentials()
