import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oxzozdqncwvbbgcmjiwi.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94em96ZHFuY3d2YmJnY21qaXdpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODcwMDIyMSwiZXhwIjoyMDg0Mjc2MjF9.9G-92Czu1IM1JX8Awy5Mx_KOgJbNNmP1yOENcUN-k7Y'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function listAllTables() {
  try {
    console.log('📋 Listando tablas en la base de datos...\n')

    // Listar todos los usuarios de auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.error('❌ Error obteniendo usuarios de auth:', authError)
    } else {
      console.log(`✅ Encontrados ${authUsers.users.length} usuarios en auth.users:\n`)
      for (const user of authUsers.users) {
        console.log(`👤 Auth User ID: ${user.id}`)
        console.log(`   Email: ${user.email}`)
        console.log(`   Created: ${user.created_at}`)
        console.log('')
      }
    }

    // Listar perfiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at')

    if (profilesError) {
      console.error('❌ Error obteniendo perfiles:', profilesError)
    } else {
      console.log(`\n✅ Encontrados ${profiles.length} perfiles en profiles:\n`)
      for (const profile of profiles) {
        console.log(`👤 Profile ID: ${profile.id}`)
        console.log(`   Email: ${profile.email}`)
        console.log(`   Nombre: ${profile.full_name || 'N/A'}`)
        console.log(`   Creado: ${profile.created_at}`)
        console.log('')
      }
    }

    // Listar configuraciones de trading
    const { data: configs, error: configsError } = await supabase
      .from('trading_config')
      .select('user_id, iol_username, iol_password, binance_api_key, updated_at')

    if (configsError) {
      console.error('❌ Error obteniendo configuraciones:', configsError)
    } else {
      console.log(`\n✅ Encontradas ${configs.length} configuraciones en trading_config:\n`)
      for (const config of configs) {
        console.log(`📊 Config ID: ${config.user_id}`)
        console.log(`   IOL Username: ${config.iol_username || '❌ NO CONFIGURADO'}`)
        console.log(`   IOL Password: ${config.iol_password ? '✅ CONFIGURADO' : '❌ NO CONFIGURADO'}`)
        console.log(`   Binance API Key: ${config.binance_api_key ? '✅ CONFIGURADO' : '❌ NO CONFIGURADO'}`)
        console.log(`   Actualizado: ${config.updated_at}`)
        console.log('')
      }
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

listAllTables()
