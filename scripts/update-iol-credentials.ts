import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridos')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updateIOLCredentials() {
  try {
    // Obtener el user_id del usuario
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'adani.romano@gmail.com')
      .single()

    if (!profile) {
      console.error('No se encontró el perfil del usuario')
      return
    }

    console.log('User ID:', profile.id)

    // Actualizar las credenciales de IOL
    const { error } = await supabase
      .from('trading_config')
      .update({
        iol_username: 'adani.romano@gmail.com',
        iol_password: 'Pastelito673!!!',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', profile.id)

    if (error) {
      console.error('Error actualizando credenciales:', error)
      return
    }

    console.log('✅ Credenciales de IOL actualizadas correctamente')

    // Verificar la actualización
    const { data: config } = await supabase
      .from('trading_config')
      .select('iol_username, updated_at')
      .eq('user_id', profile.id)
      .single()

    console.log('Configuración actualizada:', config)
  } catch (error) {
    console.error('Error:', error)
  }
}

updateIOLCredentials()
