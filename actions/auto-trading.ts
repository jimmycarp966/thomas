'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function enableAutoTrading(config: {
  maxDailyLoss: number
  maxTradeAmount: number
  requireConfirmation: boolean
  allowedStrategies: string[]
}) {
  const supabase = await createClient()
  
  try {
    await supabase
      .from('trading_config')
      .update({
        auto_execute: true,
        max_daily_loss: config.maxDailyLoss,
        max_trade_amount: config.maxTradeAmount,
        require_confirmation: config.requireConfirmation,
        allowed_strategies: config.allowedStrategies,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', '00000000-0000-0000-0000-000000000001')

    revalidatePath('/settings')
    return { success: true }
  } catch (error) {
    console.error('Error enabling auto trading:', error)
    return { error: 'Failed to enable auto trading' }
  }
}

export async function disableAutoTrading() {
  const supabase = await createClient()
  
  try {
    await supabase
      .from('trading_config')
      .update({
        auto_execute: false,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', '00000000-0000-0000-0000-000000000001')

    revalidatePath('/settings')
    return { success: true }
  } catch (error) {
    console.error('Error disabling auto trading:', error)
    return { error: 'Failed to disable auto trading' }
  }
}

export async function checkDailyLimits(): Promise<{ canTrade: boolean; reason?: string }> {
  const supabase = await createClient()
  
  try {
    const { data: config } = await supabase
      .from('trading_config')
      .select('max_daily_loss, auto_execute')
      .eq('user_id', '00000000-0000-0000-0000-000000000001')
      .single()

    if (!config || !config.auto_execute) {
      return { canTrade: false, reason: 'Auto trading is not enabled' }
    }

    // Calcular pérdidas del día actual
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: todayTrades } = await supabase
      .from('trades')
      .select('pnl')
      .eq('user_id', '00000000-0000-0000-0000-000000000001')
      .gte('executed_at', today.toISOString())
      .lt('pnl', 0)

    const dailyLoss = todayTrades?.reduce((sum, t) => sum + Math.abs(t.pnl || 0), 0) || 0

    if (dailyLoss >= config.max_daily_loss) {
      return { canTrade: false, reason: `Daily loss limit reached: $${dailyLoss} / $${config.max_daily_loss}` }
    }

    return { canTrade: true }
  } catch (error) {
    console.error('Error checking daily limits:', error)
    return { canTrade: false, reason: 'Error checking limits' }
  }
}

export async function executePendingDecisions() {
  const supabase = await createClient()
  
  try {
    // Verificar límites diarios
    const limits = await checkDailyLimits()
    if (!limits.canTrade) {
      console.log('Cannot execute decisions:', limits.reason)
      return { success: false, reason: limits.reason }
    }

    // Obtener configuración de trading
    const { data: config } = await supabase
      .from('trading_config')
      .select('*')
      .eq('user_id', '00000000-0000-0000-0000-000000000001')
      .single()

    if (!config || !config.auto_execute || config.require_confirmation) {
      return { success: false, reason: 'Auto trading requires confirmation' }
    }

    // Obtener decisiones pendientes
    const { data: pendingDecisions } = await supabase
      .from('trading_decisions')
      .select('*')
      .eq('user_id', '00000000-0000-0000-0000-000000000001')
      .eq('status', 'pending')
      .gte('confidence', 80)
      .order('created_at', { ascending: true })
      .limit(5)

    if (!pendingDecisions || pendingDecisions.length === 0) {
      return { success: true, executed: 0 }
    }

    let executed = 0
    for (const decision of pendingDecisions) {
      try {
        // Verificar si la estrategia está permitida
        if (!config.allowed_strategies.includes(decision.decision_type)) {
          console.log(`Strategy ${decision.decision_type} not allowed`)
          continue
        }

        // Verificar límites de trade
        if (decision.suggested_amount > config.max_trade_amount) {
          console.log(`Trade amount exceeds limit: ${decision.suggested_amount} > ${config.max_trade_amount}`)
          continue
        }

        // Ejecutar el trade
        const { executeTrade } = await import('./trading')
        const formData = new FormData()
        formData.append('decisionId', decision.id)
        formData.append('exchange', 'binance')

        const result = await executeTrade(formData)

        if (result.success) {
          executed++
          console.log(`Executed trade for ${decision.asset_symbol}`)
        } else {
          console.error(`Failed to execute trade:`, result.error)
        }
      } catch (error) {
        console.error(`Error executing decision ${decision.id}:`, error)
      }
    }

    revalidatePath('/dashboard')
    return { success: true, executed }
  } catch (error) {
    console.error('Error executing pending decisions:', error)
    return { success: false, error: 'Failed to execute decisions' }
  }
}

export async function setStopLoss(tradeId: string, stopLossPrice: number) {
  const supabase = await createClient()
  
  try {
    await supabase
      .from('trades')
      .update({
        stop_loss_price: stopLossPrice,
        updated_at: new Date().toISOString(),
      })
      .eq('id', tradeId)

    revalidatePath('/trading')
    return { success: true }
  } catch (error) {
    console.error('Error setting stop loss:', error)
    return { error: 'Failed to set stop loss' }
  }
}

export async function setTakeProfit(tradeId: string, takeProfitPrice: number) {
  const supabase = await createClient()
  
  try {
    await supabase
      .from('trades')
      .update({
        take_profit_price: takeProfitPrice,
        updated_at: new Date().toISOString(),
      })
      .eq('id', tradeId)

    revalidatePath('/trading')
    return { success: true }
  } catch (error) {
    console.error('Error setting take profit:', error)
    return { error: 'Failed to set take profit' }
  }
}

export async function checkStopLossAndTakeProfit() {
  const supabase = await createClient()
  
  try {
    // Obtener trades activos
    const { data: activeTrades } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', '00000000-0000-0000-0000-000000000001')
      .eq('status', 'active')
      .not('stop_loss_price', 'is', null)

    if (!activeTrades || activeTrades.length === 0) {
      return { success: true, closed: 0 }
    }

    let closed = 0
    for (const trade of activeTrades) {
      try {
        // Obtener precio actual del activo
        const { getMarketData } = await import('./trading')
        const marketDataResult = await getMarketData(trade.asset_symbol, trade.asset_type)

        if (!marketDataResult || 'error' in marketDataResult) {
          console.log(`Cannot get market data for ${trade.asset_symbol}`)
          continue
        }

        const currentPrice = marketDataResult.marketData?.price || 0

        // Verificar stop loss
        if (trade.stop_loss_price && currentPrice <= trade.stop_loss_price) {
          console.log(`Stop loss triggered for ${trade.asset_symbol} at $${currentPrice}`)
          await closeTrade(trade.id, currentPrice, 'stop_loss')
          closed++
          continue
        }

        // Verificar take profit
        if (trade.take_profit_price && currentPrice >= trade.take_profit_price) {
          console.log(`Take profit triggered for ${trade.asset_symbol} at $${currentPrice}`)
          await closeTrade(trade.id, currentPrice, 'take_profit')
          closed++
          continue
        }
      } catch (error) {
        console.error(`Error checking stop loss/take profit for trade ${trade.id}:`, error)
      }
    }

    revalidatePath('/trading')
    return { success: true, closed }
  } catch (error) {
    console.error('Error checking stop loss and take profit:', error)
    return { success: false, error: 'Failed to check stop loss and take profit' }
  }
}

async function closeTrade(
  tradeId: string,
  exitPrice: number,
  reason: 'stop_loss' | 'take_profit' | 'manual'
): Promise<void> {
  const supabase = await createClient()
  
  try {
    const { data: trade } = await supabase
      .from('trades')
      .select('*')
      .eq('id', tradeId)
      .single()

    if (!trade) return

    const pnl = (exitPrice - trade.price) * trade.quantity * (trade.trade_type === 'BUY' ? 1 : -1)

    await supabase
      .from('trades')
      .update({
        status: 'closed',
        closed_price: exitPrice,
        pnl,
        result: pnl > 0 ? 'profit' : pnl < 0 ? 'loss' : 'breakeven',
        closed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', tradeId)

    // Registrar el resultado para aprendizaje
    const { recordTradeResult } = await import('./trading-learning')
    await recordTradeResult(tradeId, pnl > 0 ? 'profit' : pnl < 0 ? 'loss' : 'breakeven', pnl, `Closed by ${reason}`)
  } catch (error) {
    console.error('Error closing trade:', error)
  }
}
