const IOL_USERNAME = 'adani.romano@gmail.com'
const IOL_PASSWORD = 'Pastelito673!!!'

async function testIOLEndpoints() {
  console.log('🔐 Autenticando con IOL...')
  
  // Primero autenticar
  const authResponse = await fetch('https://api.invertironline.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      username: IOL_USERNAME,
      password: IOL_PASSWORD,
      grant_type: 'password',
    }),
  })

  if (!authResponse.ok) {
    console.error('❌ Error de autenticación:', authResponse.status)
    return
  }

  const authData = await authResponse.json()
  const token = authData.access_token
  console.log('✅ Autenticación exitosa!')

  // Endpoints a probar
  const endpoints = [
    '/bCBA/Titulos/GGAL/Cotizacion',
    '/bCBA/Titulos/GGAL',
    '/Titulos/GGAL/Cotizacion',
    '/Cotizacion/bCBA/GGAL',
    '/bCBA/Cotizaciones/GGAL',
    '/Cotizacion/GGAL',  // El que estamos usando actualmente
  ]

  const baseUrl = 'https://api.invertironline.com/api/v2'

  for (const endpoint of endpoints) {
    const url = `${baseUrl}${endpoint}`
    console.log(`\n📡 Probando: ${endpoint}`)
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      console.log(`   Status: ${response.status} ${response.statusText}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('   ✅ ÉXITO! Respuesta:', JSON.stringify(data).substring(0, 200) + '...')
      } else {
        const errorText = await response.text().catch(() => '')
        console.log('   ❌ Error:', errorText.substring(0, 100))
      }
    } catch (error: any) {
      console.log('   ❌ Exception:', error.message)
    }
  }
}

testIOLEndpoints()
