export interface TradingIntent {
  action: 'buy' | 'sell' | 'hold' | 'unknown'
  symbol: string | null
  quantity: number | null
  price: number | null
  confidence: number
  reasoning: string
}

export interface MultipleTradingIntents {
  intents: TradingIntent[]
  hasMultipleTrades: boolean
}

export function parseTradingIntent(message: string): TradingIntent {
  const lowerMessage = message.toLowerCase()

  let action: 'buy' | 'sell' | 'hold' | 'unknown' = 'unknown'
  let symbol: string | null = null
  let quantity: number | null = null
  let price: number | null = null
  let confidence = 0
  let reasoning = ''

  // Detectar acción
  if (lowerMessage.includes('compra') || lowerMessage.includes('comprar') || lowerMessage.includes('buy')) {
    action = 'buy'
    confidence += 30
  } else if (lowerMessage.includes('vende') || lowerMessage.includes('vender') || lowerMessage.includes('sell')) {
    action = 'sell'
    confidence += 30
  } else if (lowerMessage.includes('mantener') || lowerMessage.includes('hold') || lowerMessage.includes('esperar')) {
    action = 'hold'
    confidence += 20
  }

  // Detectar confirmación de ejecución
  if (lowerMessage.includes('confirma') || lowerMessage.includes('confirmo') || 
      lowerMessage.includes('procede') || lowerMessage.includes('proceder') ||
      lowerMessage.includes('ejecuta') || lowerMessage.includes('ejecutar') ||
      lowerMessage.includes('completa') || lowerMessage.includes('completar') ||
      lowerMessage.includes('si') || lowerMessage.includes('estoy seguro')) {
    confidence += 20
  }

  // Detectar símbolo (YPF, GGAL, YPFD, etc.)
  const symbolPatterns = [
    /ypf(d)?/i,
    /ggal/i,
    /pamp/i,
    /bma/i,
    /bbar/i,
    /supv/i,
    /txar/i,
    /alua/i,
    /teco2?/i,
    /merval/i
  ]

  for (const pattern of symbolPatterns) {
    const match = message.match(pattern)
    if (match) {
      symbol = match[0].toUpperCase()
      confidence += 20
      break
    }
  }

  // Detectar cantidad ($5000, 5000, etc.)
  const amountPatterns = [
    /\$?(\d+)\s*(pesos|ars|usd)?/i,
    /(\d+)\s*(acciones|acciones)/i,
    /(\d+)\s*(unidades)/i
  ]

  for (const pattern of amountPatterns) {
    const match = message.match(pattern)
    if (match) {
      quantity = parseFloat(match[1])
      confidence += 10
      break
    }
  }

  // Detectar precio
  const pricePatterns = [
    /\$?(\d+\.?\d*)\s*(cada|por acción|precio|@)/i,
    /@?\$?(\d+\.?\d*)/i
  ]

  for (const pattern of pricePatterns) {
    const match = message.match(pattern)
    if (match) {
      price = parseFloat(match[1])
      confidence += 10
      break
    }
  }

  // Generar reasoning
  if (action === 'unknown') {
    reasoning = 'No se detectó una intención de trading clara'
  } else {
    reasoning = `Intención detectada: ${action.toUpperCase()}`
    if (symbol) reasoning += ` ${symbol}`
    if (quantity) reasoning += ` cantidad: ${quantity}`
    if (price) reasoning += ` precio: ${price}`
  }

  return {
    action,
    symbol,
    quantity,
    price,
    confidence: Math.min(confidence, 100),
    reasoning
  }
}

export function parseMultipleTradingIntents(message: string): MultipleTradingIntents {
  const intents: TradingIntent[] = []
  const lowerMessage = message.toLowerCase()

  // Detectar acción global
  let globalAction: 'buy' | 'sell' | 'hold' | 'unknown' = 'unknown'
  if (lowerMessage.includes('compra') || lowerMessage.includes('comprar') || lowerMessage.includes('buy')) {
    globalAction = 'buy'
  } else if (lowerMessage.includes('vende') || lowerMessage.includes('vender') || lowerMessage.includes('sell')) {
    globalAction = 'sell'
  }

  // Detectar confirmación global
  let globalConfidence = 0
  if (lowerMessage.includes('confirma') || lowerMessage.includes('confirmo') || 
      lowerMessage.includes('procede') || lowerMessage.includes('proceder') ||
      lowerMessage.includes('ejecuta') || lowerMessage.includes('ejecutar') ||
      lowerMessage.includes('completa') || lowerMessage.includes('completar') ||
      lowerMessage.includes('si') || lowerMessage.includes('estoy seguro')) {
    globalConfidence += 20
  }

  // Detectar múltiples trades con el formato: "cantidad en simbolo"
  const tradePattern = /(\d+)\s*(en|en\s+la\s+compra\s+de)\s*([a-z]{2,6})/gi
  const matches = [...message.matchAll(tradePattern)]

  if (matches.length > 0) {
    // Se detectaron múltiples trades
    matches.forEach((match) => {
      const quantity = parseFloat(match[1])
      const symbol = match[3].toUpperCase()
      const confidence = globalConfidence + 30 + 20 + 10 // acción + confirmación + símbolo + cantidad

      intents.push({
        action: globalAction,
        symbol,
        quantity,
        price: null,
        confidence: Math.min(confidence, 100),
        reasoning: `Intención detectada: ${globalAction.toUpperCase()} ${symbol} cantidad: ${quantity}`
      })
    })
  } else {
    // No se detectaron múltiples trades, usar el parser simple
    const intent = parseTradingIntent(message)
    intents.push(intent)
  }

  return {
    intents,
    hasMultipleTrades: intents.length > 1
  }
}

export function shouldExecuteTrade(intent: TradingIntent): boolean {
  return (
    intent.action !== 'unknown' &&
    intent.action !== 'hold' &&
    intent.symbol !== null &&
    intent.confidence >= 50
  )
}
