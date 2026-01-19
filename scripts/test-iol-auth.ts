const IOL_USERNAME = 'adani.romano@gmail.com'
const IOL_PASSWORD = 'Pastelito673!!!'

async function testIOLAuthentication() {
  console.log('🔐 Probando autenticación con IOL...')
  console.log('Username:', IOL_USERNAME)
  console.log('Password:', IOL_PASSWORD ? '***CONFIGURADO***' : 'NO CONFIGURADO')

  try {
    const authUrl = 'https://api.invertironline.com/token'

    console.log('\n📡 Enviando petición al endpoint:', authUrl)

    const response = await fetch(authUrl, {
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

    console.log('\n📊 Status:', response.status, response.statusText)
    console.log('Headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('\n❌ Error de autenticación:')
      console.error('Status:', response.status)
      console.error('StatusText:', response.statusText)
      console.error('ErrorText:', errorText)
      return
    }

    const data = await response.json()
    console.log('\n✅ Autenticación exitosa!')
    console.log('Access Token:', data.access_token ? '***TOKEN RECIBIDO***' : 'NO TOKEN')
    console.log('Refresh Token:', data.refresh_token ? '***REFRESH TOKEN RECIBIDO***' : 'NO REFRESH TOKEN')
    console.log('Expires In:', data.expires_in || 900, 'segundos')
    console.log('Token Type:', data.token_type || 'Bearer')

    return data
  } catch (error) {
    console.error('\n❌ Error en la petición:', error)
  }
}

testIOLAuthentication()
