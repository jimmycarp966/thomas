import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oxzozdqncwvbbgcmjiwi.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94em96ZHFuY3d2YmJnY21qaXdpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODcwMDIyMSwiZXhwIjoyMDg0Mjc2MjF9.9G-92Czu1IM1JX8Awy5Mx_KOgJbNNmP1yOENcUN-k7Y'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function listUsersAndConfig() {
  try {
    console.log('📋 Listando todos los usuarios y configuraciones...\n')

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at')
      .order('created_at', { ascending: false })

    if (!profiles || profiles.length === 0) {
      console.error('❌ No se encontraron perfiles de usuarios')
      return
    }

    console.log(`✅ Encontrados ${profiles.length} usuarios:\n`)

    for (const profile of profiles) {
      console.log(`👤 Usuario: ${profile.email}`)
      console.log(`   ID: ${profile.id}`)
      console.log(`   Nombre: ${profile.full_name || 'N/A'}`)
      console.log(`   Creado: ${profile.created_at}`)

      const { data: config } = await supabase
        .from('trading_config')
        .select('iol_username, iol_password, binance_api_key, updated_at')
        .eq('user_id', profile.id)
        .maybeSingle()

      if (config) {
        console.log(`   📊 Configuración de trading:`)
        console.log(`      IOL Username: ${config.iol_username || '❌ NO CONFIGURADO'}`)
        console.log(`      IOL Password: ${config.iol_password ? '✅ CONFIGURADO' : '❌ NO CONFIGURADO'}`)
        console.log(`      Binance API Key: ${config.binance_api_key ? '✅ CONFIGURADO' : '❌ NO CONFIGURADO'}`)
        console.log(`      Actualizado: ${config.updated_at}`)
      } else {
        console.log(`   📊 Configuración de trading: ❌ NO CONFIGURADA`)
      }
      console.log('')
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

listUsersAndConfig()
