# PARTE 4: SISTEMA DE IA, MEMORIA VECTORIAL Y APIs

## 🤖 CONFIGURACIÓN COMPLETA DE APIs

### 1. Google Vertex AI (Gemini 2.0)

**Setup en Google Cloud:**

```bash
# 1. Instalar Google Cloud CLI
# https://cloud.google.com/sdk/docs/install

# 2. Autenticarse
gcloud auth login

# 3. Configurar proyecto
gcloud config set project YOUR_PROJECT_ID

# 4. Habilitar APIs necesarias
gcloud services enable aiplatform.googleapis.com
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable cloudscheduler.googleapis.com

# 5. Crear service account
gcloud iam service-accounts create ai-trading-assistant \
  --display-name="AI Trading Assistant"

# 6. Dar permisos
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:ai-trading-assistant@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"

# 7. Crear key
gcloud iam service-accounts keys create ./gcp-key.json \
  --iam-account=ai-trading-assistant@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

**Cliente de Vertex AI**

**Archivo: `lib/ai/gemini.ts`**

```typescript
import { VertexAI } from '@google-cloud/vertexai'

const PROJECT_ID = process.env.VERTEX_AI_PROJECT!
const LOCATION = process.env.VERTEX_AI_LOCATION || 'us-central1'

// Inicializar Vertex AI
const vertexAI = new VertexAI({
  project: PROJECT_ID,
  location: LOCATION,
})

const model = 'gemini-2.0-flash-001'

interface GeminiMessage {
  role: 'user' | 'model'
  parts: { text: string }[]
}

interface GeminiRequest {
  contents: GeminiMessage[]
  generationConfig?: {
    temperature?: number
    maxOutputTokens?: number
    topP?: number
    topK?: number
  }
  safetySettings?: any[]
}

export class GeminiClient {
  private generativeModel: any

  constructor() {
    this.generativeModel = vertexAI.preview.getGenerativeModel({
      model: model,
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.7,
        topP: 0.95,
      },
    })
  }

  async generate(request: GeminiRequest): Promise<string> {
    try {
      const result = await this.generativeModel.generateContent({
        contents: request.contents,
        generationConfig: request.generationConfig,
      })

      const response = result.response
      return response.candidates[0].content.parts[0].text
    } catch (error) {
      console.error('Error calling Gemini:', error)
      throw error
    }
  }

  async generateStreaming(
    request: GeminiRequest,
    onChunk: (text: string) => void
  ): Promise<void> {
    try {
      const result = await this.generativeModel.generateContentStream({
        contents: request.contents,
        generationConfig: request.generationConfig,
      })

      for await (const chunk of result.stream) {
        const text = chunk.candidates[0].content.parts[0].text
        if (text) onChunk(text)
      }
    } catch (error) {
      console.error('Error in streaming:', error)
      throw error
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const embeddingModel = vertexAI.preview.getGenerativeModel({
        model: 'text-embedding-004',
      })

      const result = await embeddingModel.embedContent({
        content: { role: 'user', parts: [{ text }] }
      })

      return result.embedding.values
    } catch (error) {
      console.error('Error generating embedding:', error)
      throw error
    }
  }
}

export const gemini = new GeminiClient()
```

### 2. Binance API (Trading de Crypto)

**Instalación:**

```bash
npm install ccxt
```

**Cliente de Binance**

**Archivo: `lib/trading/binance.ts`**

```typescript
import ccxt from 'ccxt'

interface BinanceConfig {
  apiKey?: string
  apiSecret?: string
  testnet?: boolean
}

export class BinanceClient {
  private exchange: ccxt.binance

  constructor(config?: BinanceConfig) {
    this.exchange = new ccxt.binance({
      apiKey: config?.apiKey,
      secret: config?.apiSecret,
      enableRateLimit: true,
      options: {
        defaultType: 'spot',
      },
    })

    if (config?.testnet) {
      this.exchange.setSandboxMode(true)
    }
  }

  async getPrice(symbol: string): Promise<number> {
    try {
      const ticker = await this.exchange.fetchTicker(symbol)
      return ticker.last || 0
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error)
      throw error
    }
  }

  async getOHLCV(
    symbol: string,
    timeframe: string = '1h',
    limit: number = 100
  ) {
    try {
      const ohlcv = await this.exchange.fetchOHLCV(symbol, timeframe, undefined, limit)
      return ohlcv.map(candle => ({
        timestamp: candle[0],
        open: candle[1],
        high: candle[2],
        low: candle[3],
        close: candle[4],
        volume: candle[5],
      }))
    } catch (error) {
      console.error(`Error fetching OHLCV for ${symbol}:`, error)
      throw error
    }
  }

  async getTechnicalIndicators(symbol: string) {
    try {
      const ohlcv = await this.getOHLCV(symbol, '1h', 100)
      
      // Calcular indicadores técnicos básicos
      const closes = ohlcv.map(c => c.close)
      const volumes = ohlcv.map(c => c.volume)

      // RSI (Relative Strength Index)
      const rsi = this.calculateRSI(closes, 14)

      // SMA (Simple Moving Average)
      const sma20 = this.calculateSMA(closes, 20)
      const sma50 = this.calculateSMA(closes, 50)

      // Volumen promedio
      const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length
      const currentVolume = volumes[volumes.length - 1]
      const volumeChange = ((currentVolume - avgVolume) / avgVolume) * 100

      return {
        rsi: rsi[rsi.length - 1],
        sma20: sma20[sma20.length - 1],
        sma50: sma50[sma50.length - 1],
        currentPrice: closes[closes.length - 1],
        volumeChange: volumeChange.toFixed(2),
        trend: closes[closes.length - 1] > sma20[sma20.length - 1] ? 'bullish' : 'bearish',
      }
    } catch (error) {
      console.error('Error calculating indicators:', error)
      throw error
    }
  }

  private calculateRSI(prices: number[], period: number = 14): number[] {
    const rsi: number[] = []
    const gains: number[] = []
    const losses: number[] = []

    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1]
      gains.push(change > 0 ? change : 0)
      losses.push(change < 0 ? Math.abs(change) : 0)
    }

    for (let i = period; i < gains.length; i++) {
      const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period
      const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period
      
      const rs = avgGain / avgLoss
      rsi.push(100 - (100 / (1 + rs)))
    }

    return rsi
  }

  private calculateSMA(prices: number[], period: number): number[] {
    const sma: number[] = []
    
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
      sma.push(sum / period)
    }

    return sma
  }

  async createMarketOrder(
    symbol: string,
    side: 'buy' | 'sell',
    amount: number
  ) {
    try {
      const order = await this.exchange.createMarketOrder(symbol, side, amount)
      return order
    } catch (error) {
      console.error('Error creating order:', error)
      throw error
    }
  }

  async createLimitOrder(
    symbol: string,
    side: 'buy' | 'sell',
    amount: number,
    price: number
  ) {
    try {
      const order = await this.exchange.createLimitOrder(symbol, side, amount, price)
      return order
    } catch (error) {
      console.error('Error creating limit order:', error)
      throw error
    }
  }

  async getBalance() {
    try {
      const balance = await this.exchange.fetchBalance()
      return balance
    } catch (error) {
      console.error('Error fetching balance:', error)
      throw error
    }
  }
}

// Instancia pública para obtener precios sin autenticación
export const binancePublic = new BinanceClient()

// Función para crear instancia autenticada
export function createAuthenticatedBinanceClient(apiKey: string, apiSecret: string) {
  return new BinanceClient({ apiKey, apiSecret })
}
```

### 3. Yahoo Finance API (Acciones Argentinas / CEDEARs)

**Instalación:**

```bash
npm install yahoo-finance2
```

**Cliente de Yahoo Finance**

**Archivo: `lib/trading/yahoo-finance.ts`**

```typescript
import yahooFinance from 'yahoo-finance2'

export class YahooFinanceClient {
  async getQuote(symbol: string) {
    try {
      // Para acciones argentinas en Yahoo Finance, el sufijo es .BA
      // Ejemplo: GGAL.BA, YPF.BA
      const quote = await yahooFinance.quote(`${symbol}.BA`)
      
      return {
        symbol: symbol,
        price: quote.regularMarketPrice,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        volume: quote.regularMarketVolume,
        marketCap: quote.marketCap,
        high: quote.regularMarketDayHigh,
        low: quote.regularMarketDayLow,
      }
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error)
      throw error
    }
  }

  async getHistoricalData(
    symbol: string,
    period1: Date,
    period2: Date = new Date()
  ) {
    try {
      const history = await yahooFinance.historical(`${symbol}.BA`, {
        period1,
        period2,
        interval: '1d',
      })

      return history.map(h => ({
        date: h.date,
        open: h.open,
        high: h.high,
        low: h.low,
        close: h.close,
        volume: h.volume,
      }))
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error)
      throw error
    }
  }

  async getTechnicalIndicators(symbol: string) {
    try {
      const period1 = new Date()
      period1.setDate(period1.getDate() - 100)

      const history = await this.getHistoricalData(symbol, period1)
      const closes = history.map(h => h.close)
      const volumes = history.map(h => h.volume)

      // Calcular indicadores
      const sma20 = this.calculateSMA(closes, 20)
      const sma50 = this.calculateSMA(closes, 50)
      const rsi = this.calculateRSI(closes, 14)

      const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length
      const currentVolume = volumes[volumes.length - 1]
      const volumeChange = ((currentVolume - avgVolume) / avgVolume) * 100

      return {
        currentPrice: closes[closes.length - 1],
        sma20: sma20[sma20.length - 1],
        sma50: sma50[sma50.length - 1],
        rsi: rsi[rsi.length - 1],
        volumeChange: volumeChange.toFixed(2),
        trend: closes[closes.length - 1] > sma20[sma20.length - 1] ? 'bullish' : 'bearish',
      }
    } catch (error) {
      console.error('Error calculating indicators:', error)
      throw error
    }
  }

  private calculateSMA(prices: number[], period: number): number[] {
    const sma: number[] = []
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
      sma.push(sum / period)
    }
    return sma
  }

  private calculateRSI(prices: number[], period: number = 14): number[] {
    const rsi: number[] = []
    const gains: number[] = []
    const losses: number[] = []

    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1]
      gains.push(change > 0 ? change : 0)
      losses.push(change < 0 ? Math.abs(change) : 0)
    }

    for (let i = period; i < gains.length; i++) {
      const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period
      const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period
      const rs = avgGain / avgLoss
      rsi.push(100 - (100 / (1 + rs)))
    }

    return rsi
  }
}

export const yahooFinance = new YahooFinanceClient()
```

---

## 🧠 SISTEMA DE MEMORIA VECTORIAL

**Archivo: `lib/ai/memory.ts`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { gemini } from './gemini'

export class MemorySystem {
  /**
   * Genera embedding de un texto usando Gemini
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      return await gemini.generateEmbedding(text)
    } catch (error) {
      console.error('Error generating embedding:', error)
      throw error
    }
  }

  /**
   * Busca decisiones de trading similares
   */
  async findSimilarDecisions(
    query: string,
    userId: string,
    threshold: number = 0.7,
    limit: number = 10
  ) {
    const supabase = await createClient()
    const embedding = await this.generateEmbedding(query)

    const { data, error } = await supabase.rpc('match_similar_decisions', {
      query_embedding: embedding,
      match_threshold: threshold,
      match_count: limit,
      p_user_id: userId
    })

    if (error) {
      console.error('Error finding similar decisions:', error)
      return []
    }

    return data || []
  }

  /**
   * Busca aprendizajes relevantes
   */
  async findRelevantLearnings(
    query: string,
    userId: string,
    threshold: number = 0.7,
    limit: number = 5
  ) {
    const supabase = await createClient()
    const embedding = await this.generateEmbedding(query)

    const { data, error } = await supabase.rpc('match_relevant_learnings', {
      query_embedding: embedding,
      match_threshold: threshold,
      match_count: limit,
      p_user_id: userId
    })

    if (error) {
      console.error('Error finding relevant learnings:', error)
      return []
    }

    return data || []
  }

  /**
   * Guarda una decisión con su embedding
   */
  async saveDecisionWithEmbedding(
    decision: any,
    userId: string
  ) {
    const supabase = await createClient()
    
    const text = `
      Decision: ${decision.decision_type} ${decision.asset_symbol}
      Reasoning: ${decision.ai_analysis.reasoning}
      Indicators: ${JSON.stringify(decision.ai_analysis.indicators_used)}
      Risk: ${decision.ai_analysis.risk_assessment}
    `
    
    const embedding = await this.generateEmbedding(text)

    const { data, error } = await supabase
      .from('trading_decisions')
      .insert({
        ...decision,
        user_id: userId,
        embedding
      })
      .select()

    if (error) throw error
    return data
  }

  /**
   * Guarda un aprendizaje con su embedding
   */
  async saveLearningWithEmbedding(
    learning: any,
    userId: string
  ) {
    const supabase = await createClient()
    
    const text = `
      Type: ${learning.learning_type}
      Pattern: ${learning.content.pattern}
      Context: ${JSON.stringify(learning.content)}
    `
    
    const embedding = await this.generateEmbedding(text)

    const { data, error } = await supabase
      .from('ai_learnings')
      .insert({
        ...learning,
        user_id: userId,
        embedding
      })
      .select()

    if (error) throw error
    return data
  }
}

export const memorySystem = new MemorySystem()
```

---

## 📝 SISTEMA DE PROMPTS

**Archivo: `lib/ai/prompts.ts`**

```typescript
export const SYSTEM_PROMPTS = {
  trading_analysis: (
    userProfile: any,
    marketData: any,
    pastLearnings: any[]
  ) => `
Eres un asistente experto en trading. Analiza el mercado y proporciona recomendaciones basadas en:

1. Datos de mercado actuales
2. Perfil de riesgo del usuario
3. Aprendizajes previos de trades exitosos y fallidos

PERFIL DEL USUARIO:
- Nivel de riesgo: ${userProfile.risk_profile}
- Capital máximo por trade: $${userProfile.max_trade_amount}
- Assets permitidos: ${userProfile.allowed_assets.join(', ')}

DATOS DE MERCADO:
${JSON.stringify(marketData, null, 2)}

APRENDIZAJES PREVIOS:
${pastLearnings.length > 0 
  ? pastLearnings.map(l => `- ${l.content.pattern} (Confianza: ${l.importance_score})`).join('\n')
  : 'Sin aprendizajes previos aún'
}

Por favor analiza y proporciona tu recomendación en el siguiente formato JSON:

{
  "decision": "BUY" | "SELL" | "HOLD",
  "confidence": 0.85,
  "reasoning": "Explicación detallada basada en indicadores técnicos...",
  "suggested_price": 45000,
  "stop_loss": 43000,
  "take_profit": 49000,
  "risk_assessment": "low" | "medium" | "high",
  "indicators_used": ["RSI", "MACD", "Volume"],
  "similar_past_patterns": []
}

IMPORTANTE: Responde SOLO con el JSON, sin texto adicional.
`,

  chat_assistant: (
    userContext: any,
    recentTrades: any[],
    wellnessData: any
  ) => `
Eres un asistente personal de IA especializado en:
1. Trading y análisis de mercado
2. Ayuno intermitente y bienestar
3. Análisis de portfolio y rendimiento

CONTEXTO DEL USUARIO:
- Portfolio actual: $${userContext.totalPortfolio}
- Trades activos: ${userContext.activeTrades}
- Win rate: ${userContext.winRate}%

TRADES RECIENTES:
${recentTrades.length > 0
  ? recentTrades.map(t => `- ${t.asset_symbol}: ${t.trade_type} a $${t.price} (${t.status})`).join('\n')
  : 'Sin trades recientes'
}

BIENESTAR:
${wellnessData 
  ? `- Último ayuno: ${wellnessData.fasting_hours || 0}h
- Peso actual: ${wellnessData.weight_kg || 'No registrado'}kg`
  : 'Sin datos de bienestar registrados'
}

Responde de manera conversacional, amigable y útil. Puedes:
- Analizar el portfolio del usuario
- Explicar decisiones de trading pasadas
- Dar consejos sobre bienestar
- Responder preguntas sobre el mercado

Si el usuario te pide ejecutar una acción (ej: "compra BTC"), confirma los detalles antes de proceder.
`,

  trade_reflection: (
    trade: any,
    decision: any,
    result: any
  ) => `
Analiza el siguiente trade y proporciona una reflexión crítica para mejorar futuras decisiones.

DECISIÓN ORIGINAL:
${JSON.stringify(decision.ai_analysis, null, 2)}

TRADE EJECUTADO:
- Asset: ${trade.asset_symbol}
- Tipo: ${trade.trade_type}
- Precio entrada: $${result.entry_price}
- Precio salida: $${result.exit_price || 'Aún abierto'}
- P&L: ${result.pnl_percentage || 0}%

RESULTADO: ${result.status}

Analiza en profundidad:
1. ¿La predicción fue correcta? ¿Por qué sí o por qué no?
2. ¿Qué indicadores fueron precisos/imprecisos?
3. ¿Qué factores externos no se consideraron?
4. ¿Qué aprendizaje concreto se puede extraer?
5. ¿Se debe ajustar la estrategia para casos similares?

Responde en formato JSON:

{
  "success": true/false,
  "analysis": "Análisis detallado de lo que pasó...",
  "lessons_learned": "Lecciones específicas y accionables...",
  "mistakes": "Errores cometidos..." o null,
  "confidence_in_learning": 0.8,
  "recommendations": "Ajustes específicos para el futuro..."
}

IMPORTANTE: Responde SOLO con el JSON, sin texto adicional.
`,

  market_summary: (assets: string[]) => `
Proporciona un resumen breve del estado actual del mercado para los siguientes assets: ${assets.join(', ')}.

Para cada asset menciona:
- Tendencia general (alcista/bajista/lateral)
- Factores clave que están afectando el precio
- Niveles de soporte/resistencia importantes

Mantén el resumen conciso (máximo 3-4 líneas por asset).
`,
}
```

---

## 🔄 SISTEMA DE ANÁLISIS DE TRADING

**Archivo: `lib/trading/analysis.ts`**

```typescript
import { binancePublic } from './binance'
import { yahooFinance } from './yahoo-finance'
import { gemini } from '../ai/gemini'
import { memorySystem } from '../ai/memory'
import { SYSTEM_PROMPTS } from '../ai/prompts'

export async function analyzeAsset(
  symbol: string,
  assetType: 'crypto' | 'stock',
  userId: string,
  userProfile: any
) {
  try {
    // 1. Obtener datos de mercado
    let marketData: any

    if (assetType === 'crypto') {
      const price = await binancePublic.getPrice(`${symbol}/USDT`)
      const indicators = await binancePublic.getTechnicalIndicators(`${symbol}/USDT`)
      
      marketData = {
        symbol,
        type: 'crypto',
        currentPrice: price,
        ...indicators
      }
    } else {
      const quote = await yahooFinance.getQuote(symbol)
      const indicators = await yahooFinance.getTechnicalIndicators(symbol)
      
      marketData = {
        symbol,
        type: 'stock',
        currentPrice: quote.price,
        ...indicators
      }
    }

    // 2. Buscar aprendizajes relevantes del pasado
    const queryText = `Analizar ${symbol} ${assetType} con RSI ${marketData.rsi} y tendencia ${marketData.trend}`
    const pastLearnings = await memorySystem.findRelevantLearnings(
      queryText,
      userId,
      0.7,
      5
    )

    // 3. Generar análisis con Gemini
    const prompt = SYSTEM_PROMPTS.trading_analysis(
      userProfile,
      marketData,
      pastLearnings
    )

    const response = await gemini.generate({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.2, // Baja temperatura para mayor consistencia
        maxOutputTokens: 1024,
      }
    })

    // 4. Parsear respuesta JSON
    const analysisResult = JSON.parse(response)

    return {
      marketData,
      analysis: analysisResult,
      pastLearnings
    }

  } catch (error) {
    console.error('Error analyzing asset:', error)
    throw error
  }
}

export async function evaluateTradeResult(
  tradeId: string,
  userId: string
) {
  try {
    // Obtener datos del trade, decisión y resultado
    // (Esto debería venir de Supabase)
    const trade = {} // Placeholder
    const decision = {} // Placeholder
    const result = {} // Placeholder

    // Generar reflexión con Gemini
    const prompt = SYSTEM_PROMPTS.trade_reflection(trade, decision, result)

    const response = await gemini.generate({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
      }
    })

    const evaluation = JSON.parse(response)

    // Si la confianza es alta, guardar como aprendizaje
    if (evaluation.confidence_in_learning > 0.6) {
      await memorySystem.saveLearningWithEmbedding(
        {
          learning_type: evaluation.success ? 'success_pattern' : 'failure_pattern',
          content: {
            pattern: evaluation.lessons_learned,
            analysis: evaluation.analysis,
            recommendations: evaluation.recommendations,
          },
          importance_score: evaluation.confidence_in_learning,
          related_trades: [tradeId]
        },
        userId
      )
    }

    return evaluation
  } catch (error) {
    console.error('Error evaluating trade:', error)
    throw error
  }
}
```

---

## 📊 TIPOS TYPESCRIPT

**Archivo: `types/trading.ts`**

```typescript
export interface TradingConfig {
  id: string
  user_id: string
  binance_api_key?: string
  binance_api_secret?: string
  risk_profile: 'conservative' | 'moderate' | 'aggressive'
  max_trade_amount: number
  allowed_assets: string[]
  auto_execute: boolean
  stop_loss_percentage: number
  take_profit_percentage: number
  trading_hours_start: string
  trading_hours_end: string
  created_at: string
  updated_at: string
}

export interface TradingDecision {
  id: string
  user_id: string
  asset_symbol: string
  asset_type: 'crypto' | 'stock' | 'cedear'
  decision_type: 'BUY' | 'SELL' | 'HOLD'
  ai_analysis: {
    confidence: number
    reasoning: string
    suggested_price: number
    stop_loss: number
    take_profit: number
    risk_assessment: 'low' | 'medium' | 'high'
    indicators_used: string[]
    similar_past_patterns?: string[]
  }
  suggested_amount: number
  suggested_price: number
  stop_loss_price: number
  take_profit_price: number
  status: 'pending' | 'approved' | 'rejected' | 'executed' | 'cancelled'
  user_feedback?: string
  created_at: string
  decided_at?: string
}

export interface Trade {
  id: string
  user_id: string
  decision_id?: string
  exchange: string
  asset_symbol: string
  trade_type: 'BUY' | 'SELL'
  quantity: number
  price: number
  total_amount: number
  fees: number
  status: 'pending' | 'executed' | 'failed' | 'cancelled'
  exchange_order_id?: string
  created_at: string
  executed_at?: string
}

export interface TradeResult {
  id: string
  trade_id: string
  user_id: string
  entry_price: number
  exit_price?: number
  pnl_amount?: number
  pnl_percentage?: number
  status: 'open' | 'closed_profit' | 'closed_loss' | 'closed_breakeven'
  ai_evaluation?: {
    success: boolean
    analysis: string
    lessons_learned: string
    mistakes?: string
    confidence_in_learning: number
    recommendations: string
  }
  opened_at: string
  closed_at?: string
  evaluated_at?: string
}

export interface AILearning {
  id: string
  user_id: string
  learning_type: 'success_pattern' | 'failure_pattern' | 'market_insight' | 'user_preference'
  content: {
    pattern: string
    [key: string]: any
  }
  importance_score: number
  related_decisions: string[]
  related_trades: string[]
  created_at: string
  last_validated_at?: string
  times_applied: number
}
```

**Archivo: `types/chat.ts`**

```typescript
export interface ChatConversation {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  conversation_id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  ai_metadata?: {
    model: string
    tokens_used?: number
    context_used?: string[]
    actions_triggered?: string[]
  }
  created_at: string
}
```

**Archivo: `types/wellness.ts`**

```typescript
export interface WellnessTracking {
  id: string
  user_id: string
  date: string
  fasting_start?: string
  fasting_end?: string
  fasting_hours?: number
  fasting_completed: boolean
  weight_kg?: number
  exercise_completed: boolean
  exercise_type?: string
  exercise_duration_minutes?: number
  energy_level?: number
  mood_level?: number
  sleep_quality?: number
  sleep_hours?: number
  notes?: string
  created_at: string
  updated_at: string
}
```

---

**FIN DE PARTE 4**

> Continuar con **PARTE 5**: Edge Functions, Cloud Functions (Python) y Deployment
