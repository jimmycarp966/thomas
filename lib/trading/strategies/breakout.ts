import { createClient } from '@/lib/supabase/server'
import { createIOLClient } from '../iol-client'

export interface BreakoutSignal {
  symbol: string
  shouldBuy: boolean
  shouldSell: boolean
  confidence: number
  reasoning: string
  indicators: {
    currentPrice: number
    resistance: number
    support: number
    volume: number
    avgVolume: number
    volumeRatio: number
    atr: number
  }
}

export interface BreakoutConfig {
  lookbackPeriod: number
  volumePeriod: number
  volumeThreshold: number
  atrPeriod: number
  atrMultiplier: number
}

const DEFAULT_CONFIG: BreakoutConfig = {
  lookbackPeriod: 20,
  volumePeriod: 20,
  volumeThreshold: 1.5,
  atrPeriod: 14,
  atrMultiplier: 2
}

export async function analyzeBreakout(
  symbol: string,
  config: BreakoutConfig = DEFAULT_CONFIG
): Promise<BreakoutSignal> {
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

  if (historicalData.length < config.lookbackPeriod) {
    return {
      symbol,
      shouldBuy: false,
      shouldSell: false,
      confidence: 0,
      reasoning: 'Insufficient historical data',
      indicators: {
        currentPrice: 0,
        resistance: 0,
        support: 0,
        volume: 0,
        avgVolume: 0,
        volumeRatio: 0,
        atr: 0
      }
    }
  }

  const closes = historicalData.map((d: any) => d.cierre)
  const highs = historicalData.map((d: any) => d.maximo)
  const lows = historicalData.map((d: any) => d.minimo)
  const volumes = historicalData.map((d: any) => d.volumen)

  const currentPrice = closes[closes.length - 1]
  const resistance = Math.max(...highs.slice(-config.lookbackPeriod))
  const support = Math.min(...lows.slice(-config.lookbackPeriod))
  const currentVolume = volumes[volumes.length - 1]
  const avgVolume = volumes.slice(-config.volumePeriod).reduce((a: number, b: number) => a + b, 0) / config.volumePeriod
  const volumeRatio = currentVolume / avgVolume
  const atr = calculateATR(highs, lows, closes, config.atrPeriod)

  let shouldBuy = false
  let shouldSell = false
  let confidence = 0
  let reasoning = ''

  if (currentPrice > resistance && volumeRatio >= config.volumeThreshold) {
    shouldBuy = true
    confidence = 80
    reasoning = `Bullish breakout above resistance (${resistance.toFixed(2)}) with high volume (${volumeRatio.toFixed(1)}x average)`
  } else if (currentPrice < support && volumeRatio >= config.volumeThreshold) {
    shouldSell = true
    confidence = 80
    reasoning = `Bearish breakout below support (${support.toFixed(2)}) with high volume (${volumeRatio.toFixed(1)}x average)`
  } else if (currentPrice > resistance * 0.99 && volumeRatio >= config.volumeThreshold) {
    shouldBuy = true
    confidence = 70
    reasoning = `Near resistance breakout with increasing volume`
  } else if (currentPrice < support * 1.01 && volumeRatio >= config.volumeThreshold) {
    shouldSell = true
    confidence = 70
    reasoning = `Near support breakout with increasing volume`
  }

  return {
    symbol,
    shouldBuy,
    shouldSell,
    confidence,
    reasoning,
    indicators: {
      currentPrice,
      resistance,
      support,
      volume: currentVolume,
      avgVolume,
      volumeRatio,
      atr
    }
  }
}

function calculateATR(highs: number[], lows: number[], closes: number[], period: number): number {
  if (highs.length < period) return 0

  const trueRanges: number[] = []

  for (let i = 1; i < highs.length; i++) {
    const tr = Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    )
    trueRanges.push(tr)
  }

  const slice = trueRanges.slice(-period)
  return slice.reduce((a, b) => a + b, 0) / slice.length
}
