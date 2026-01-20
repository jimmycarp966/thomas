import { createIOLClient } from './iol-client'

export interface OHLCVData {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface BacktestTrade {
  entryDate: string
  exitDate: string | null
  symbol: string
  entryPrice: number
  exitPrice: number | null
  quantity: number
  pnl: number | null
  pnlPercentage: number | null
  type: 'BUY' | 'SELL'
  reason: string
}

export interface BacktestResult {
  symbol: string
  strategy: string
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  totalReturn: number
  maxDrawdown: number
  sharpeRatio: number
  avgWin: number
  avgLoss: number
  profitFactor: number
  trades: BacktestTrade[]
  isApproved: boolean
}

export interface StrategyConfig {
  name: string
  stopLossPct: number
  takeProfitPct: number
  confidenceThreshold: number
  maxPositionSize: number
}

const DEFAULT_STRATEGY: StrategyConfig = {
  name: 'default',
  stopLossPct: 5,
  takeProfitPct: 10,
  confidenceThreshold: 75,
  maxPositionSize: 1000
}

export async function runBacktest(
  symbol: string,
  historicalData: OHLCVData[],
  strategy: StrategyConfig = DEFAULT_STRATEGY
): Promise<BacktestResult> {
  console.log(`[Backtester] Running backtest for ${symbol} with ${historicalData.length} candles...`)

  const trades: BacktestTrade[] = []
  let currentPosition: BacktestTrade | null = null

  for (let i = 0; i < historicalData.length; i++) {
    const candle = historicalData[i]
    const prevCandle = i > 0 ? historicalData[i - 1] : null

    if (!prevCandle) continue

    if (!currentPosition) {
      const signal = generateEntrySignal(candle, prevCandle, strategy)

      if (signal.shouldEnter && signal.confidence >= strategy.confidenceThreshold) {
        const quantity = Math.min(strategy.maxPositionSize / candle.close, 100)

        currentPosition = {
          entryDate: new Date(candle.timestamp).toISOString(),
          exitDate: null,
          symbol,
          entryPrice: candle.close,
          exitPrice: null,
          quantity,
          pnl: null,
          pnlPercentage: null,
          type: signal.type,
          reason: signal.reason
        }
      }
    } else {
      const exitSignal = generateExitSignal(
        currentPosition,
        candle,
        strategy
      )

      if (exitSignal.shouldExit) {
        currentPosition.exitDate = new Date(candle.timestamp).toISOString()
        currentPosition.exitPrice = candle.close
        currentPosition.pnl = (candle.close - currentPosition.entryPrice) * currentPosition.quantity
        currentPosition.pnlPercentage = ((candle.close - currentPosition.entryPrice) / currentPosition.entryPrice) * 100
        currentPosition.reason = exitSignal.reason

        trades.push({ ...currentPosition })
        currentPosition = null
      }
    }
  }

  const result = calculateMetrics(trades, strategy)
  result.isApproved = result.sharpeRatio >= 1.0 && result.winRate >= 50

  console.log(`[Backtester] ${symbol} - Sharpe: ${result.sharpeRatio.toFixed(2)}, Win Rate: ${result.winRate.toFixed(1)}%, Approved: ${result.isApproved}`)

  return result
}

interface EntrySignal {
  shouldEnter: boolean
  type: 'BUY' | 'SELL'
  confidence: number
  reason: string
}

function generateEntrySignal(
  candle: OHLCVData,
  prevCandle: OHLCVData,
  strategy: StrategyConfig
): EntrySignal {
  const priceChange = ((candle.close - prevCandle.close) / prevCandle.close) * 100
  const volumeChange = ((candle.volume - prevCandle.volume) / prevCandle.volume) * 100

  const rsi = calculateRSI([prevCandle, candle], 14)
  const sma20 = calculateSMA([candle], 20)
  const sma50 = calculateSMA([candle], 50)

  let confidence = 0
  let type: 'BUY' | 'SELL' = 'BUY'
  let reason = ''

  if (priceChange > 2 && volumeChange > 20 && rsi < 70) {
    confidence = 80
    type = 'BUY'
    reason = 'Strong upward momentum with volume'
  } else if (priceChange < -2 && volumeChange > 20 && rsi > 30) {
    confidence = 80
    type = 'SELL'
    reason = 'Strong downward momentum with volume'
  } else if (sma20 > sma50 && priceChange > 0.5) {
    confidence = 70
    type = 'BUY'
    reason = 'Golden cross with upward movement'
  } else if (sma20 < sma50 && priceChange < -0.5) {
    confidence = 70
    type = 'SELL'
    reason = 'Death cross with downward movement'
  } else if (rsi < 30 && priceChange > 0) {
    confidence = 75
    type = 'BUY'
    reason = 'Oversold condition with reversal'
  } else if (rsi > 70 && priceChange < 0) {
    confidence = 75
    type = 'SELL'
    reason = 'Overbought condition with reversal'
  }

  return {
    shouldEnter: confidence >= strategy.confidenceThreshold,
    type,
    confidence,
    reason
  }
}

interface ExitSignal {
  shouldExit: boolean
  reason: string
}

function generateExitSignal(
  position: BacktestTrade,
  candle: OHLCVData,
  strategy: StrategyConfig
): ExitSignal {
  const pnlPercentage = ((candle.close - position.entryPrice) / position.entryPrice) * 100

  if (pnlPercentage <= -strategy.stopLossPct) {
    return {
      shouldExit: true,
      reason: `Stop loss hit at ${pnlPercentage.toFixed(2)}%`
    }
  }

  if (pnlPercentage >= strategy.takeProfitPct) {
    return {
      shouldExit: true,
      reason: `Take profit reached at ${pnlPercentage.toFixed(2)}%`
    }
  }

  return {
    shouldExit: false,
    reason: ''
  }
}

function calculateMetrics(trades: BacktestTrade[], strategy: StrategyConfig): BacktestResult {
  const totalTrades = trades.length
  const winningTrades = trades.filter(t => t.pnlPercentage && t.pnlPercentage > 0)
  const losingTrades = trades.filter(t => t.pnlPercentage && t.pnlPercentage < 0)

  const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0

  const totalReturn = trades.reduce((sum, t) => sum + (t.pnl || 0), 0)

  const avgWin = winningTrades.length > 0
    ? winningTrades.reduce((sum, t) => sum + (t.pnlPercentage || 0), 0) / winningTrades.length
    : 0

  const avgLoss = losingTrades.length > 0
    ? losingTrades.reduce((sum, t) => sum + (t.pnlPercentage || 0), 0) / losingTrades.length
    : 0

  const profitFactor = Math.abs(avgLoss) > 0
    ? Math.abs(avgWin / avgLoss)
    : 0

  const maxDrawdown = calculateMaxDrawdown(trades)
  const sharpeRatio = calculateSharpeRatio(trades)

  return {
    symbol: trades[0]?.symbol || '',
    strategy: strategy.name,
    totalTrades,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    winRate,
    totalReturn,
    maxDrawdown,
    sharpeRatio,
    avgWin,
    avgLoss,
    profitFactor,
    trades,
    isApproved: false
  }
}

function calculateMaxDrawdown(trades: BacktestTrade[]): number {
  if (trades.length === 0) return 0

  let peak = 0
  let maxDrawdown = 0
  let cumulativeReturn = 0

  for (const trade of trades) {
    cumulativeReturn += trade.pnl || 0

    if (cumulativeReturn > peak) {
      peak = cumulativeReturn
    }

    const drawdown = peak > 0 ? ((peak - cumulativeReturn) / peak) * 100 : 0
    maxDrawdown = Math.max(maxDrawdown, drawdown)
  }

  return maxDrawdown
}

function calculateSharpeRatio(trades: BacktestTrade[]): number {
  if (trades.length < 2) return 0

  const returns = trades.map(t => t.pnlPercentage || 0)

  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
  const stdDev = Math.sqrt(variance)

  const riskFreeRate = 2

  return stdDev > 0 ? (avgReturn - riskFreeRate) / stdDev : 0
}

function calculateRSI(candles: OHLCVData[], period: number): number {
  if (candles.length < period) return 50

  let gains = 0
  let losses = 0

  for (let i = candles.length - period; i < candles.length; i++) {
    const change = candles[i].close - candles[i - 1].close

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

function calculateSMA(candles: OHLCVData[], period: number): number {
  if (candles.length < period) return candles[candles.length - 1]?.close || 0

  const sum = candles.slice(-period).reduce((acc, c) => acc + c.close, 0)
  return sum / period
}

export async function fetchHistoricalData(
  symbol: string,
  months: number = 6
): Promise<OHLCVData[]> {
  const supabase = await (await import('@/lib/supabase/server')).createClient()

  const { data: config } = await supabase
    .from('trading_config')
    .select('iol_username, iol_password')
    .limit(1)
    .maybeSingle()

  if (!config?.iol_username || !config?.iol_password) {
    throw new Error('IOL not configured')
  }

  const iol = createIOLClient(config.iol_username, config.iol_password, false)

  const endDate = new Date()
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - months)

  const data = await iol.getHistoricalData(symbol, startDate.toISOString(), endDate.toISOString())

  return data.map((d: any) => ({
    timestamp: new Date(d.fecha).getTime(),
    open: d.apertura,
    high: d.maximo,
    low: d.minimo,
    close: d.cierre,
    volume: d.volumen
  }))
}

export async function runMultipleBacktests(
  symbols: string[],
  strategy: StrategyConfig = DEFAULT_STRATEGY
): Promise<BacktestResult[]> {
  const results: BacktestResult[] = []

  for (const symbol of symbols) {
    try {
      const historicalData = await fetchHistoricalData(symbol)
      const result = await runBacktest(symbol, historicalData, strategy)
      results.push(result)
    } catch (error) {
      console.error(`[Backtester] Error backtesting ${symbol}:`, error)
    }
  }

  return results
}
