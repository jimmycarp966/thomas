import { createClient } from '@/lib/supabase/server'
import { createIOLClient } from '../iol-client'

export interface DCASignal {
  symbol: string
  shouldBuy: boolean
  amount: number
  reasoning: string
  indicators: {
    currentPrice: number
    avgPurchasePrice: number
    totalInvested: number
    totalShares: number
    deviationFromAvg: number
    lastPurchaseDate: string | null
    daysSinceLastPurchase: number
  }
}

export interface DCAConfig {
  weeklyAmount: number
  minDaysBetweenPurchases: number
  maxPriceDeviation: number
  maxTotalInvestment: number
}

const DEFAULT_CONFIG: DCAConfig = {
  weeklyAmount: 100,
  minDaysBetweenPurchases: 7,
  maxPriceDeviation: 10,
  maxTotalInvestment: 10000
}

export async function analyzeDCA(
  symbol: string,
  config: DCAConfig = DEFAULT_CONFIG
): Promise<DCASignal> {
  const supabase = await createClient()

  const { data: tradingConfig } = await supabase
    .from('trading_config')
    .select('iol_username, iol_password, max_trade_amount')
    .limit(1)
    .maybeSingle()

  if (!tradingConfig?.iol_username || !tradingConfig?.iol_password) {
    throw new Error('IOL not configured')
  }

  const iol = createIOLClient(tradingConfig.iol_username, tradingConfig.iol_password, false)

  const quote = await iol.getQuote(symbol)
  if (!quote) {
    throw new Error(`Could not fetch quote for ${symbol}`)
  }

  const currentPrice = quote.ultimoPrecio

  const { data: trades } = await supabase
    .from('trades')
    .select('*')
    .eq('asset_symbol', symbol)
    .eq('trade_type', 'BUY')
    .order('created_at', { ascending: false })

  const { data: activePositions } = await supabase
    .from('active_positions')
    .select('*')
    .eq('symbol', symbol)
    .eq('status', 'open')
    .limit(1)
    .maybeSingle()

  let totalInvested = 0
  let totalShares = 0
  let lastPurchaseDate: string | null = null

  if (trades) {
    for (const trade of trades) {
      totalInvested += trade.total_amount
      totalShares += trade.quantity

      if (!lastPurchaseDate || new Date(trade.created_at) > new Date(lastPurchaseDate)) {
        lastPurchaseDate = trade.created_at
      }
    }
  }

  const avgPurchasePrice = totalShares > 0 ? totalInvested / totalShares : 0
  const deviationFromAvg = avgPurchasePrice > 0 ? ((currentPrice - avgPurchasePrice) / avgPurchasePrice) * 100 : 0

  const daysSinceLastPurchase = lastPurchaseDate
    ? Math.floor((Date.now() - new Date(lastPurchaseDate).getTime()) / (1000 * 60 * 60 * 24))
    : 999

  let shouldBuy = false
  let amount = 0
  let reasoning = ''

  const weeklyAmount = config.weeklyAmount
  const maxTotalInvestment = config.maxTotalInvestment || tradingConfig?.max_trade_amount || 1000

  if (totalInvested >= maxTotalInvestment) {
    reasoning = `Maximum investment reached ($${totalInvested.toFixed(2)})`
  } else if (daysSinceLastPurchase < config.minDaysBetweenPurchases) {
    reasoning = `Too soon since last purchase (${daysSinceLastPurchase} days ago)`
  } else if (Math.abs(deviationFromAvg) > config.maxPriceDeviation && deviationFromAvg > 0) {
    reasoning = `Price too high (${deviationFromAvg.toFixed(1)}% above average)`
  } else {
    shouldBuy = true
    amount = Math.min(weeklyAmount, maxTotalInvestment - totalInvested)

    if (deviationFromAvg < -2) {
      amount *= 1.2
      reasoning = `Price below average (${deviationFromAvg.toFixed(1)}%), buying 20% more`
    } else if (deviationFromAvg < 0) {
      reasoning = `Price slightly below average (${deviationFromAvg.toFixed(1)}%)`
    } else {
      reasoning = `Regular DCA purchase`
    }

    amount = Math.floor(amount)
  }

  return {
    symbol,
    shouldBuy,
    amount,
    reasoning,
    indicators: {
      currentPrice,
      avgPurchasePrice,
      totalInvested,
      totalShares,
      deviationFromAvg,
      lastPurchaseDate,
      daysSinceLastPurchase
    }
  }
}

export async function getDCAPortfolio(
  symbols: string[],
  config: DCAConfig = DEFAULT_CONFIG
): Promise<DCASignal[]> {
  const signals: DCASignal[] = []

  for (const symbol of symbols) {
    try {
      const signal = await analyzeDCA(symbol, config)
      signals.push(signal)
    } catch (error) {
      console.error(`[DCA] Error analyzing ${symbol}:`, error)
    }
  }

  return signals
}
