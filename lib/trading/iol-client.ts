interface TokenResponse {
  access_token: string
  refresh_token: string
  expires_in?: number
  token_type?: string
}

export class IOLClient {
  private username: string
  private password: string
  private baseUrl: string
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private tokenExpiresAt: number | null = null

  constructor(username: string, password: string, useDemo: boolean = false) {
    this.username = username
    this.password = password
    // IOL usa la misma URL para demo y producción
    this.baseUrl = 'https://api.invertironline.com/api/v2'
  }

  /**
   * Autentica con IOL usando username y password
   * Obtiene el access_token y refresh_token
   * NOTA: El endpoint de token está en la raíz, NO en /api/v2/
   */
  async authenticate(): Promise<TokenResponse> {
    try {
      console.log('[IOLClient] ========== START authenticate ==========')
      console.log('[IOLClient] Username:', this.username)
      console.log('[IOLClient] Password:', this.password ? '***CONFIGURADO***' : 'NO CONFIGURADO')

      // El endpoint de autenticación está en la raíz, no en /api/v2/
      const authUrl = 'https://api.invertironline.com/token'

      console.log('[IOLClient] Auth URL:', authUrl)

      const response = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: this.username,
          password: this.password,
          grant_type: 'password',
        }),
      })

      console.log('[IOLClient] Auth Response Status:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        console.error('[IOLClient] Auth Error:', errorText)
        throw new Error(`IOL Authentication failed: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data: TokenResponse = await response.json()

      console.log('[IOLClient] Auth Success - Token received:', !!data.access_token)
      console.log('[IOLClient] Expires in:', data.expires_in, 'seconds')

      // Almacenar tokens
      this.accessToken = data.access_token
      this.refreshToken = data.refresh_token

      // El token expira en 15 minutos (900 segundos)
      const expiresIn = data.expires_in || 900
      this.tokenExpiresAt = Date.now() + (expiresIn * 1000)

      console.log('[IOLClient] ========== END authenticate ==========')

      return data
    } catch (error) {
      console.error('[IOLClient] Authentication error:', error)
      throw error
    }
  }

  /**
   * Renueva el access_token usando el refresh_token
   */
  async refreshAccessToken(): Promise<TokenResponse> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available, need to re-authenticate')
    }

    try {
      // El endpoint de token está en la raíz
      const authUrl = 'https://api.invertironline.com/token'

      const response = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token',
        }),
      })

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status} ${response.statusText}`)
      }

      const data: TokenResponse = await response.json()

      // Actualizar tokens
      this.accessToken = data.access_token
      this.refreshToken = data.refresh_token

      const expiresIn = data.expires_in || 900
      this.tokenExpiresAt = Date.now() + (expiresIn * 1000)

      return data
    } catch (error) {
      console.error('Token refresh error:', error)
      // Si falla el refresh, intentar autenticar de nuevo
      return this.authenticate()
    }
  }

  /**
   * Verifica si el token está vigente y lo renueva si es necesario
   */
  private async ensureValidToken(): Promise<void> {
    const now = Date.now()
    const bufferTime = 60000 // 1 minuto antes de que expire, renovar

    if (!this.accessToken || !this.tokenExpiresAt) {
      await this.authenticate()
      return
    }

    if (this.tokenExpiresAt - now < bufferTime) {
      await this.refreshAccessToken()
    }
  }

  /**
   * Realiza una request autenticada a la API de IOL
   */
  private async request(
    endpoint: string,
    method: string = 'GET',
    body?: any
  ): Promise<any> {
    // Asegurar que tengamos un token válido
    await this.ensureValidToken()

    const url = `${this.baseUrl}${endpoint}`
    const headers: HeadersInit = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    }

    const options: RequestInit = {
      method,
      headers,
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    try {
      const response = await fetch(url, options)

      // Si el token expiró (401), intentar renovar y reintentar
      if (response.status === 401) {
        await this.refreshAccessToken()

        // Reintentar la request con el nuevo token
        options.headers = {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        }

        const retryResponse = await fetch(url, options)
        if (!retryResponse.ok) {
          throw new Error(`IOL API error: ${retryResponse.status} ${retryResponse.statusText}`)
        }
        return await retryResponse.json()
      }

      if (!response.ok) {
        throw new Error(`IOL API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`IOL API request failed:`, error)
      throw error
    }
  }

  async getQuote(ticker: string, mercado: string = 'bCBA') {
    try {
      // El formato correcto es /{mercado}/Titulos/{ticker}/Cotizacion
      return await this.request(`/${mercado}/Titulos/${ticker}/Cotizacion`)
    } catch (error) {
      console.error(`Error fetching quote for ${ticker}:`, error)
      throw error
    }
  }

  async getHistoricalData(
    ticker: string,
    fromDate: string,
    toDate: string,
    timeframe: 'diario' | 'semanal' | 'mensual' = 'diario'
  ) {
    try {
      return await this.request(
        `/Cotizacion/Historica/${ticker}/${fromDate}/${toDate}/${timeframe}`
      )
    } catch (error) {
      console.error(`Error fetching historical data for ${ticker}:`, error)
      throw error
    }
  }

  async getOHLCV(ticker: string, timeframe: string = 'diario', limit: number = 100) {
    try {
      const today = new Date()
      const fromDate = new Date(today)
      fromDate.setDate(today.getDate() - limit)

      const formatDate = (date: Date) => date.toISOString().split('T')[0]

      return await this.getHistoricalData(
        ticker,
        formatDate(fromDate),
        formatDate(today),
        timeframe as any
      )
    } catch (error) {
      console.error(`Error fetching OHLCV for ${ticker}:`, error)
      throw error
    }
  }


  async createOrder(
    ticker: string,
    operation: 'Compra' | 'Venta',
    quantity: number,
    price?: number,
    orderType: 'Limite' | 'Mercado' = 'Limite',
    mercado: string = 'BCBA',
    plazo: string = 'T2',
    validez?: string
  ) {
    try {
      const body: any = {
        ticker,
        operacion: operation,
        cantidad: quantity,
        precio: orderType === 'Limite' ? price : undefined,
        tipoOrden: orderType,
        mercado,
        plazo,
        validez: validez || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }

      return await this.request('/Orden', 'POST', body)
    } catch (error) {
      console.error(`Error creating order for ${ticker}:`, error)
      throw error
    }
  }

  async getOpenOrders() {
    try {
      return await this.request('/Ordenes')
    } catch (error) {
      console.error('Error fetching open orders:', error)
      throw error
    }
  }

  /**
   * Obtiene el historial de órdenes ejecutadas
   * @param fromDate Fecha de inicio (YYYY-MM-DD)
   * @param toDate Fecha de fin (YYYY-MM-DD)
   * @param estado Estado de las órdenes ('todas', 'pendientes', 'terminadas', 'canceladas')
   */
  async getOrderHistory(
    fromDate?: string,
    toDate?: string,
    estado: 'todas' | 'pendientes' | 'terminadas' | 'canceladas' = 'terminadas'
  ) {
    try {
      const today = new Date()
      const thirtyDaysAgo = new Date(today)
      thirtyDaysAgo.setDate(today.getDate() - 30)

      const from = fromDate || thirtyDaysAgo.toISOString().split('T')[0]
      const to = toDate || today.toISOString().split('T')[0]

      // El endpoint de IOL para historial de operaciones
      return await this.request(`/operaciones?filtro.estado=${estado}&filtro.fechaDesde=${from}&filtro.fechaHasta=${to}`)
    } catch (error) {
      console.error('Error fetching order history:', error)
      throw error
    }
  }

  async cancelOrder(orderId: string) {
    try {
      return await this.request(`/Orden/${orderId}`, 'DELETE')
    } catch (error) {
      console.error(`Error cancelling order ${orderId}:`, error)
      throw error
    }
  }

  async getPortfolio() {
    try {
      return await this.request('/Portafolio')
    } catch (error) {
      console.error('Error fetching portfolio:', error)
      throw error
    }
  }

  async getAccountState() {
    try {
      return await this.request('/EstadodeCuenta')
    } catch (error) {
      console.error('Error fetching account state:', error)
      throw error
    }
  }

  async getTechnicalIndicators(ticker: string, indicators: string[] = ['RSI', 'MACD', 'EMA']) {
    console.warn('getTechnicalIndicators() is experimental - endpoint not confirmed in official IOL API v2 documentation')
    try {
      const indicatorsParam = indicators.join(',')
      return await this.request(`/Cotizacion/Indicadores/${ticker}?indicadores=${indicatorsParam}`)
    } catch (error) {
      console.error(`Error fetching technical indicators for ${ticker}:`, error)
      throw error
    }
  }

  async searchInstruments(query: string) {
    try {
      return await this.request(`/Titulos/${query}`)
    } catch (error) {
      console.error(`Error searching instruments for ${query}:`, error)
      throw error
    }
  }

  /**
   * Cierra la sesión y limpia los tokens
   */
  async logout(): Promise<void> {
    this.accessToken = null
    this.refreshToken = null
    this.tokenExpiresAt = null
  }
}

export function createIOLClient(username: string, password: string, useDemo: boolean = false) {
  return new IOLClient(username, password, useDemo)
}
