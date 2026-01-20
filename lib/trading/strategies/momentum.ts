import { createClient } from '@/lib/supabase/server'
import { createIOLClient } from '../iol-client'

export interface MomentumSignal {
  symbol: string
  shouldBuy: boolean
  shouldSell: boolean
  confidence: number
  reasoning: string
  indicators: {
    rsi: number
    macd: number
    momentum: number
    trend: 'bullish' | 'bearish' | 'neutral'
  }
}

export interface MomentumConfig {
  rsiPeriod: number
  rsiOverbought: number
  rsiOversold: number
  momentumPeriod: number
  momentumThreshold: number
  macdFast: number
  macdSlow: number
  macdSignal: number
}

const DEFAULT_CONFIG: MomentumConfig = {
  rsiPeriod: 14,
  rsiOverbought: 70,
  rsiOversold: 30,
  momentumPeriod: 10,
  momentumThreshold: 2,
  macdFast: 12,
  macdSlow: 26,
  macdSignal: 9
}

export async function analyzeMomentum(
  symbol: string,
  config: MomentumConfig = DEFAULT_CONFIG
): Promise<MomentumSignal> {
  const supabase = await createClient()

  const { data: tradingConfig } = await supabase
    .from('trading_config')
    .select('iol_username, iol_password')
    .limit(1)
    .maybeSingle()

  if (!tradingConfig?.iol_username || !tradingConfig?.iol_password) {
    throw new Error('IOL not configured')
  }

  const iol = createIOLClient(tradingConfig.iol_username, tradingConfig.iol_password, false)

  const endDate = new Date()
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - 3)

  const historicalData = await iol.getHistoricalData(symbol, startDate.toISOString(), endDate.toISOString())

  if (historicalData.length < config.momentumPeriod) {
    return {
      symbol,
      shouldBuy: false,
      shouldSell: false,
      confidence: 0,
      reasoning: 'Insufficient historical data',
      indicators: {
        rsi: 50,
        macd: 0,
        momentum: 0,
        trend: 'neutral'
      }
    }
  }

  const closes = historicalData.map((d: any) => d.cierre)
  const highs = historicalData.map((d: any) => d.maximo)
  const lows = historicalData.map((d: any) => d.minimo)

  const rsi = calculateRSI(closes, config.rsiPeriod)
  const macd = calculateMACD(closes, config.macdFast, config.macdSlow, config.macdSignal)
  const momentum = calculateMomentum(closes, config.momentumPeriod)
  const trend = determineTrend(closes, 20)

  let shouldBuy = false
  let shouldSell = false
  let confidence = 0
  let reasoning = ''

  if (trend === 'bullish' && rsi < config.rsiOverbought && momentum > config.momentumThreshold) {
    shouldBuy = true
    confidence = 80
    reasoning = `Strong bullish momentum with RSI at ${rsi.toFixed(1)} and momentum at ${momentum.toFixed(2)}`
  } else if (trend === 'bearish' && rsi > config.rsiOversold && momentum < -config.momentumThreshold) {
    shouldSell = true
    confidence = 80
    reasoning = `Strong bearish momentum with RSI at ${rsi.toFixed(1)} and momentum at ${momentum.toFixed(2)}`
  } else if (rsi < config.rsiOversold && momentum > 0) {
    shouldBuy = true
    confidence = 70
    reasoning = `Oversold condition with positive momentum`
  } else if (rsi > config.rsiOverbought && momentum < 0) {
    shouldSell = true
    confidence = 70
    reasoning = `Overbought condition with negative momentum`
  }

  return {
    symbol,
    shouldBuy,
    shouldSell,
    confidence,
    reasoning,
    indicators: {
      rsi,
      macd,
      momentum,
      trend
    }
  }
}

function calculateRSI(closes: number[], period: number): number {
  if (closes.length < period) return 50

  let gains = 0
  let losses = 0

  for (let i = closes.length - period; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1]

    if (change > 0) {
      gains += change
    } else {
      losses += Math.abs(change)
    }
  }

  const avgGain = gains / period
  const avgLoss = losses / period

  if (avgLoss === 0) return 100

  const rs = avgGain / avgLoss
  return 100 - (100 / (1 + rs))
}

function calculateMACD(closes: number[], fast: number, slow: number, signal: number): number {
  if (closes.length < slow) return 0

  const emaFast = calculateEMA(closes, fast)
  const emaSlow = calculateEMA(closes, slow)

  const macdLine = emaFast - emaSlow

  return macdLine
}

function calculateEMA(data: number[], period: number): number {
  if (data.length < period) return data[data.length - 1]

  const multiplier = 2 / (period + 1)
  let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period

  for (let i = period; i < data.length; i++) {
    ema = (data[i] - ema) * multiplier + ema
  }

  return ema
}

function calculateMomentum(closes: number[], period: number): number {
  if (closes.length < period) return 0

  const currentPrice = closes[closes.length - 1]
  const pastPrice = closes[closes.length - 1 - period]

  return ((currentPrice - pastPrice) / pastPrice) * 100
}

function determineTrend(closes: number[], period: number): 'bullish' | 'bearish' | 'neutral' {
  if (closes.length < period) return 'neutral'

  const currentPrice = closes[closes.length - 1]
  const sma = closes.slice(-period).reduce((a, b) => a + b, 0) / period

  const change = ((currentPrice - sma) / sma) * 100

  if (change > 1) return 'bullish'
  if (change < -1) return 'bearish'
  return 'neutral'
}
