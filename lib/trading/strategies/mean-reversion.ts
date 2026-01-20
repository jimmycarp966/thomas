import { createClient } from '@/lib/supabase/server'
import { createIOLClient } from '../iol-client'

export interface MeanReversionSignal {
  symbol: string
  shouldBuy: boolean
  shouldSell: boolean
  confidence: number
  reasoning: string
  indicators: {
    rsi: number
    bollingerUpper: number
    bollingerLower: number
    bollingerMiddle: number
    currentPrice: number
    deviation: number
  }
}

export interface MeanReversionConfig {
  rsiPeriod: number
  rsiOverbought: number
  rsiOversold: number
  bollingerPeriod: number
  bollingerStdDev: number
}

const DEFAULT_CONFIG: MeanReversionConfig = {
  rsiPeriod: 14,
  rsiOverbought: 70,
  rsiOversold: 30,
  bollingerPeriod: 20,
  bollingerStdDev: 2
}

export async function analyzeMeanReversion(
  symbol: string,
  config: MeanReversionConfig = DEFAULT_CONFIG
): Promise<MeanReversionSignal> {
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

  if (historicalData.length < config.bollingerPeriod) {
    return {
      symbol,
      shouldBuy: false,
      shouldSell: false,
      confidence: 0,
      reasoning: 'Insufficient historical data',
      indicators: {
        rsi: 50,
        bollingerUpper: 0,
        bollingerLower: 0,
        bollingerMiddle: 0,
        currentPrice: 0,
        deviation: 0
      }
    }
  }

  const closes = historicalData.map((d: any) => d.cierre)
  const currentPrice = closes[closes.length - 1]

  const rsi = calculateRSI(closes, config.rsiPeriod)
  const bollinger = calculateBollingerBands(closes, config.bollingerPeriod, config.bollingerStdDev)

  const deviation = (currentPrice - bollinger.middle) / bollinger.middle * 100

  let shouldBuy = false
  let shouldSell = false
  let confidence = 0
  let reasoning = ''

  if (currentPrice <= bollinger.lower && rsi < config.rsiOversold) {
    shouldBuy = true
    confidence = 85
    reasoning = `Price below lower Bollinger Band (${bollinger.lower.toFixed(2)}) and RSI oversold (${rsi.toFixed(1)})`
  } else if (currentPrice >= bollinger.upper && rsi > config.rsiOverbought) {
    shouldSell = true
    confidence = 85
    reasoning = `Price above upper Bollinger Band (${bollinger.upper.toFixed(2)}) and RSI overbought (${rsi.toFixed(1)})`
  } else if (rsi < config.rsiOversold && deviation < -2) {
    shouldBuy = true
    confidence = 75
    reasoning = `Oversold condition with price ${deviation.toFixed(2)}% below mean`
  } else if (rsi > config.rsiOverbought && deviation > 2) {
    shouldSell = true
    confidence = 75
    reasoning = `Overbought condition with price ${deviation.toFixed(2)}% above mean`
  }

  return {
    symbol,
    shouldBuy,
    shouldSell,
    confidence,
    reasoning,
    indicators: {
      rsi,
      bollingerUpper: bollinger.upper,
      bollingerLower: bollinger.lower,
      bollingerMiddle: bollinger.middle,
      currentPrice,
      deviation
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

function calculateBollingerBands(
  closes: number[],
  period: number,
  stdDev: number
): { upper: number; middle: number; lower: number } {
  const slice = closes.slice(-period)
  const middle = slice.reduce((a, b) => a + b, 0) / period

  const variance = slice.reduce((sum, price) => sum + Math.pow(price - middle, 2), 0) / period
  const std = Math.sqrt(variance)

  return {
    upper: middle + (std * stdDev),
    middle,
    lower: middle - (std * stdDev)
  }
}
