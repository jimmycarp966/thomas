import { createClient } from '@/lib/supabase/server'
import { generateTradeAnalysis } from './vertex-client'

export interface TradeAnalysis {
  tradeId: string
  symbol: string
  entryPrice: number
  exitPrice: number | null
  pnlPercentage: number | null
  status: 'open' | 'closed_profit' | 'closed_loss' | 'closed_breakeven'
  decisionType: 'BUY' | 'SELL'
  confidence: number | null
  reasoning: string | null
  executedAt: string
}

export interface LearningInsight {
  type: 'success_pattern' | 'failure_pattern' | 'market_insight' | 'user_preference'
  content: {
    pattern: string
    conditions: string[]
    recommendation: string
    confidence: number
  }
  importance: number
}

export interface EvolutionReport {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  avgWinPct: number
  avgLossPct: number
  insights: LearningInsight[]
  parameterAdjustments: {
    stopLossPercentage?: number
    takeProfitPercentage?: number
    confidenceThreshold?: number
    maxPositionSize?: number
  }
}

export async function mirrorTest(
  userId: string = '00000000-0000-0000-0000-000000000001'
): Promise<EvolutionReport> {
  const supabase = await createClient()

  console.log('[SelfEvolution] 🧠 Starting Mirror Test analysis...')

  try {
    const trades = await getTodayTrades(userId)

    if (trades.length === 0) {
      console.log('[SelfEvolution] No trades to analyze today')
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        avgWinPct: 0,
        avgLossPct: 0,
        insights: [],
        parameterAdjustments: {}
      }
    }

    console.log(`[SelfEvolution] Analyzing ${trades.length} trades...`)

    const analysis = await analyzeTradesWithAI(trades)
    const parameterAdjustments = await calculateParameterAdjustments(trades, analysis)

    await saveLearnings(userId, analysis.insights)
    await updateTradingParameters(userId, parameterAdjustments)

    const report: EvolutionReport = {
      totalTrades: trades.length,
      winningTrades: trades.filter(t => t.pnlPercentage && t.pnlPercentage > 0).length,
      losingTrades: trades.filter(t => t.pnlPercentage && t.pnlPercentage < 0).length,
      winRate: calculateWinRate(trades),
      avgWinPct: calculateAverageWin(trades),
      avgLossPct: calculateAverageLoss(trades),
      insights: analysis.insights,
      parameterAdjustments
    }

    await saveEvolutionReport(userId, report)

    console.log('[SelfEvolution] ✅ Mirror Test completed')
    return report
  } catch (error) {
    console.error('[SelfEvolution] Error:', error)
    throw error
  }
}

async function getTodayTrades(userId: string): Promise<TradeAnalysis[]> {
  const supabase = await createClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: trades } = await supabase
    .from('trades')
    .select(`
      *,
      trade_results (
        pnl_percentage,
        status,
        exit_price
      ),
      trading_decisions (
        confidence,
        reasoning
      )
    `)
    .eq('user_id', userId)
    .gte('created_at', today.toISOString())
    .order('created_at', { ascending: false })

  if (!trades) return []

  return trades.map(trade => ({
    tradeId: trade.id,
    symbol: trade.asset_symbol,
    entryPrice: trade.price,
    exitPrice: trade.trade_results?.exit_price || null,
    pnlPercentage: trade.trade_results?.pnl_percentage || null,
    status: trade.trade_results?.status || 'open',
    decisionType: trade.trade_type,
    confidence: (trade as any).trading_decisions?.confidence || null,
    reasoning: (trade as any).trading_decisions?.reasoning || null,
    executedAt: trade.created_at
  }))
}

async function analyzeTradesWithAI(trades: TradeAnalysis[]): Promise<{ insights: LearningInsight[] }> {
  const insights: LearningInsight[] = []

  const winningTrades = trades.filter(t => t.pnlPercentage && t.pnlPercentage > 0)
  const losingTrades = trades.filter(t => t.pnlPercentage && t.pnlPercentage < 0)

  if (winningTrades.length > 0) {
    const avgWinConfidence = winningTrades.reduce((sum, t) => sum + (t.confidence || 0), 0) / winningTrades.length
    const highConfidenceWins = winningTrades.filter(t => (t.confidence || 0) >= 80)

    if (highConfidenceWins.length / winningTrades.length > 0.7) {
      insights.push({
        type: 'success_pattern',
        content: {
          pattern: 'High confidence trades perform better',
          conditions: ['Confidence >= 80%'],
          recommendation: 'Maintain high confidence threshold for new trades',
          confidence: 0.85
        },
        importance: 0.8
      })
    }
  }

  if (losingTrades.length > 0) {
    const consecutiveLosses = findConsecutiveLosses(trades)
    if (consecutiveLosses >= 2) {
      insights.push({
        type: 'failure_pattern',
        content: {
          pattern: 'Consecutive losses detected',
          conditions: ['Multiple trades in a row with negative P&L'],
          recommendation: 'Consider reducing position size or increasing stop-loss',
          confidence: 0.9
        },
        importance: 0.95
      })
    }

    const largeLosses = losingTrades.filter(t => t.pnlPercentage && t.pnlPercentage < -3)
    if (largeLosses.length > 0) {
      insights.push({
        type: 'failure_pattern',
        content: {
          pattern: 'Large losses (>3%) detected',
          conditions: ['Stop-loss not triggered or too wide'],
          recommendation: 'Tighten stop-loss to 2-3% to limit downside',
          confidence: 0.85
        },
        importance: 0.9
      })
    }
  }

  const avgWin = calculateAverageWin(trades)
  const avgLoss = Math.abs(calculateAverageLoss(trades))

  if (avgLoss > avgWin * 1.5) {
    insights.push({
      type: 'failure_pattern',
      content: {
        pattern: 'Risk-reward ratio unfavorable',
        conditions: ['Average loss > 1.5x average win'],
        recommendation: 'Reduce position size or tighten stop-loss',
        confidence: 0.8
      },
      importance: 0.85
    })
  }

  return { insights }
}

function findConsecutiveLosses(trades: TradeAnalysis[]): number {
  let maxConsecutive = 0
  let currentConsecutive = 0

  for (const trade of trades) {
    if (trade.pnlPercentage && trade.pnlPercentage < 0) {
      currentConsecutive++
      maxConsecutive = Math.max(maxConsecutive, currentConsecutive)
    } else {
      currentConsecutive = 0
    }
  }

  return maxConsecutive
}

async function calculateParameterAdjustments(
  trades: TradeAnalysis[],
  analysis: { insights: LearningInsight[] }
): Promise<EvolutionReport['parameterAdjustments']> {
  const adjustments: EvolutionReport['parameterAdjustments'] = {}

  const supabase = await createClient()
  const { data: config } = await supabase
    .from('trading_config')
    .select('stop_loss_percentage, take_profit_percentage, max_trade_amount')
    .limit(1)
    .maybeSingle()

  if (!config) return adjustments

  const currentStopLoss = Number(config.stop_loss_percentage) || 5
  const currentTakeProfit = Number(config.take_profit_percentage) || 10

  const losingTrades = trades.filter(t => t.pnlPercentage && t.pnlPercentage < 0)
  const largeLosses = losingTrades.filter(t => t.pnlPercentage && t.pnlPercentage < -3)

  if (largeLosses.length > 0) {
    adjustments.stopLossPercentage = Math.max(2, currentStopLoss - 1)
  }

  const avgWin = calculateAverageWin(trades)
  const avgLoss = Math.abs(calculateAverageLoss(trades))

  if (avgLoss > avgWin * 1.5) {
    adjustments.stopLossPercentage = Math.max(2, currentStopLoss - 1)
    adjustments.maxPositionSize = (config.max_trade_amount || 1000) * 0.8
  }

  const highConfidenceInsight = analysis.insights.find(i => 
    i.type === 'success_pattern' && 
    i.content.pattern === 'High confidence trades perform better'
  )

  if (highConfidenceInsight) {
    adjustments.confidenceThreshold = 80
  }

  return adjustments
}

async function saveLearnings(userId: string, insights: LearningInsight[]): Promise<void> {
  const supabase = await createClient()

  for (const insight of insights) {
    await supabase.from('ai_learnings').insert({
      user_id: userId,
      learning_type: insight.type,
      content: insight.content,
      importance_score: insight.importance,
      created_at: new Date().toISOString()
    })
  }

  console.log(`[SelfEvolution] Saved ${insights.length} learnings`)
}

async function updateTradingParameters(
  userId: string,
  adjustments: EvolutionReport['parameterAdjustments']
): Promise<void> {
  const supabase = await createClient()

  if (Object.keys(adjustments).length === 0) {
    console.log('[SelfEvolution] No parameter adjustments needed')
    return
  }

  const updateData: any = {}

  if (adjustments.stopLossPercentage) {
    updateData.stop_loss_percentage = adjustments.stopLossPercentage
  }
  if (adjustments.takeProfitPercentage) {
    updateData.take_profit_percentage = adjustments.takeProfitPercentage
  }
  if (adjustments.maxPositionSize) {
    updateData.max_trade_amount = adjustments.maxPositionSize
  }

  await supabase
    .from('trading_config')
    .update(updateData)
    .eq('user_id', userId)

  console.log('[SelfEvolution] Updated trading parameters:', updateData)
}

async function saveEvolutionReport(userId: string, report: EvolutionReport): Promise<void> {
  const supabase = await createClient()

  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'evolution_report',
    title: '🧠 Mirror Test Report',
    message: `Win Rate: ${report.winRate.toFixed(1)}% | Trades: ${report.totalTrades} | Insights: ${report.insights.length}`,
    read: false
  })

  console.log('[SelfEvolution] Evolution report saved')
}

function calculateWinRate(trades: TradeAnalysis[]): number {
  const closedTrades = trades.filter(t => t.pnlPercentage !== null)
  if (closedTrades.length === 0) return 0

  const winningTrades = closedTrades.filter(t => t.pnlPercentage && t.pnlPercentage > 0)
  return (winningTrades.length / closedTrades.length) * 100
}

function calculateAverageWin(trades: TradeAnalysis[]): number {
  const winningTrades = trades.filter(t => t.pnlPercentage && t.pnlPercentage > 0)
  if (winningTrades.length === 0) return 0

  return winningTrades.reduce((sum, t) => sum + t.pnlPercentage!, 0) / winningTrades.length
}

function calculateAverageLoss(trades: TradeAnalysis[]): number {
  const losingTrades = trades.filter(t => t.pnlPercentage && t.pnlPercentage < 0)
  if (losingTrades.length === 0) return 0

  return losingTrades.reduce((sum, t) => sum + t.pnlPercentage!, 0) / losingTrades.length
}
