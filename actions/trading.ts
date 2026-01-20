'use server'

import { createClient } from '@/lib/supabase/server'
import { createBinanceClient } from '@/lib/trading/binance-client'
import { createYahooFinanceClient } from '@/lib/trading/yahoo-client'
import { createIOLClient } from '@/lib/trading/iol-client'
import { revalidatePath } from 'next/cache'

export async function executeTrade(formData: FormData) {
  const decisionId = formData.get('decisionId') as string
  const exchange = formData.get('exchange') as 'binance' | 'yahoo' | 'iol'
  return performTrade(decisionId, exchange)
}

export async function performTrade(decisionId: string, exchange: 'binance' | 'yahoo' | 'iol') {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    const { data: decision } = await supabase
      .from('trading_decisions')
      .select('*')
      .eq('id', decisionId)
      .eq('user_id', user.id)
      .single()

    if (!decision) {
      return { error: 'Decision not found' }
    }

    const { data: config } = await supabase
      .from('trading_config')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!config) {
      return { error: 'Trading configuration not found' }
    }

    let tradeResult: any = null

    if (exchange === 'binance' && config.binance_api_key && config.binance_api_secret) {
      const binance = createBinanceClient(config.binance_api_key, config.binance_api_secret)

      const orderType = decision.suggested_price ? 'limit' : 'market'
      const side = decision.decision_type === 'BUY' ? 'buy' : 'sell'

      tradeResult = await binance.createOrder(
        decision.asset_symbol,
        orderType,
        side,
        decision.suggested_amount || 0.001,
        decision.suggested_price || undefined
      )

    } else if (exchange === 'iol' && config.iol_username && config.iol_password) {
      const iol = createIOLClient(
        config.iol_username,
        config.iol_password,
        true
      )

      const operation = decision.decision_type === 'BUY' ? 'Compra' : 'Venta'
      const orderType = decision.suggested_price ? 'Limite' : 'Mercado'

      tradeResult = await iol.createOrder(
        decision.asset_symbol,
        operation,
        decision.suggested_amount || 1,
        decision.suggested_price || undefined,
        orderType,
        'BCBA',
        'T2'
      )
    } else {
      return { error: 'Exchange not configured' }
    }

    const { data: trade } = await supabase
      .from('trades')
      .insert({
        user_id: user.id,
        decision_id: decisionId,
        exchange,
        asset_symbol: decision.asset_symbol,
        trade_type: decision.decision_type,
        quantity: decision.suggested_amount || 0,
        price: decision.suggested_price || 0,
        total_amount: (decision.suggested_amount || 0) * (decision.suggested_price || 0),
        fees: 0,
        status: 'executed',
        exchange_order_id: tradeResult?.id?.toString() || null,
        executed_at: new Date().toISOString(),
      })
      .select()
      .single()

    await supabase
      .from('trading_decisions')
      .update({ status: 'executed', decided_at: new Date().toISOString() })
      .eq('id', decisionId)

    await supabase
      .from('trade_results')
      .insert({
        trade_id: trade.id,
        user_id: user.id,
        entry_price: trade.price,
        status: 'open',
        opened_at: new Date().toISOString(),
      })

    revalidatePath('/dashboard')
    revalidatePath('/trading')
    return { success: true, trade }
  } catch (error) {
    console.error('Error executing trade:', error)
    return { error: 'Failed to execute trade' }
  }
}

export async function getDetailedPortfolio() {
  const supabase = await createClient()

  try {
    const { data: config } = await supabase
      .from('trading_config')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (!config) {
      return { assets: [] }
    }

    const assets: any[] = []

    // IOL Assets & Cash
    if (config.iol_username && config.iol_password) {
      try {
        const iol = createIOLClient(
          config.iol_username,
          config.iol_password,
          true
        )

        // Peticiones en paralelo para mayor velocidad
        const [portfolio, accountState] = await Promise.all([
          iol.getPortfolio(),
          iol.getAccountState()
        ])

        // 1. Agregar activos (Títulos)
        if (portfolio?.activos) {
          portfolio.activos.forEach((asset: any) => {
            assets.push({
              symbol: asset.titulo.simbolo,
              quantity: asset.cantidad,
              lastPrice: asset.valuo,
              totalValue: asset.valorActual * asset.cantidad,
              exchange: 'iol',
              assetType: asset.titulo.tipo
            })
          })
        }

        // 2. Agregar efectivo (Liquidez IOL)
        if (accountState?.cuentas) {
          accountState.cuentas.forEach((cuenta: any) => {
            if (cuenta.disponible > 0) {
              const symbol = cuenta.moneda === 'Peso Argentino' ? 'ARS' : 'USD'
              assets.push({
                symbol: symbol,
                quantity: cuenta.disponible,
                lastPrice: 1,
                totalValue: cuenta.disponible,
                exchange: 'iol',
                assetType: 'Cash'
              })
            }
          })
        }
      } catch (error) {
        console.error('Error fetching IOL portfolio details:', error)
      }
    }

    // Binance Assets & Liquidity
    if (config.binance_api_key && config.binance_api_secret) {
      try {
        const binance = createBinanceClient(config.binance_api_key, config.binance_api_secret)
        const balance = await binance.getBalance()

        Object.entries(balance).forEach(([symbol, data]: [string, any]) => {
          if (data.total > 0) {
            assets.push({
              symbol: symbol,
              quantity: data.total,
              lastPrice: 0, // Simplified
              totalValue: data.total, // Simplified valuation for now
              exchange: 'binance',
              assetType: (symbol === 'USDT' || symbol === 'USDC' || symbol === 'BUSD') ? 'Cash' : 'crypto'
            })
          }
        })
      } catch (error) {
        console.error('Error fetching Binance balance details:', error)
      }
    }

    return { assets }
  } catch (error) {
    console.error('Error getting detailed portfolio:', error)
    return { error: 'Failed to get detailed portfolio' }
  }
}

export async function getPortfolioValue() {
  try {
    const { assets, error } = await getDetailedPortfolio()
    if (error) throw new Error(error)

    const totalValue = assets?.reduce((sum: number, asset: any) => sum + (asset.totalValue || 0), 0) || 0
    return { portfolioValue: totalValue }
  } catch (error) {
    console.error('Error getting portfolio value:', error)
    return { portfolioValue: 0 }
  }
}

export async function getRecentTrades(limit: number = 10) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    const { data: trades } = await supabase
      .from('trades')
      .select(`
        *,
        trade_results (
          pnl_percentage,
          status
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    return { trades }
  } catch (error) {
    console.error('Error fetching recent trades:', error)
    return { error: 'Failed to fetch recent trades' }
  }
}

export async function getActiveTrades() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    const { data: trades } = await supabase
      .from('trades')
      .select(`
        *,
        trade_results (
          pnl_percentage,
          status
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'executed')
      .order('created_at', { ascending: false })
      .limit(10)

    const activeTrades = trades?.filter(trade =>
      trade.trade_results?.status === 'open'
    ) || []

    return { trades: activeTrades }
  } catch (error) {
    console.error('Error fetching active trades:', error)
    return { error: 'Failed to fetch active trades' }
  }
}

export async function closeTrade(tradeId: string, exitPrice: number) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    const { data: trade } = await supabase
      .from('trades')
      .select('*')
      .eq('id', tradeId)
      .eq('user_id', user.id)
      .single()

    if (!trade) {
      return { error: 'Trade not found' }
    }

    const { data: tradeResult } = await supabase
      .from('trade_results')
      .select('*')
      .eq('trade_id', tradeId)
      .single()

    if (!tradeResult) {
      return { error: 'Trade result not found' }
    }

    const pnlAmount = (exitPrice - tradeResult.entry_price) * trade.quantity
    const pnlPercentage = ((exitPrice - tradeResult.entry_price) / tradeResult.entry_price) * 100

    let status: 'open' | 'closed_profit' | 'closed_loss' | 'closed_breakeven' = 'closed_breakeven'
    if (pnlPercentage > 0) status = 'closed_profit'
    else if (pnlPercentage < 0) status = 'closed_loss'

    const { data: updatedResult } = await supabase
      .from('trade_results')
      .update({
        exit_price: exitPrice,
        pnl_amount: pnlAmount,
        pnl_percentage: pnlPercentage,
        status,
        closed_at: new Date().toISOString(),
      })
      .eq('id', tradeResult.id)
      .select()
      .single()

    revalidatePath('/trading')
    return { success: true, tradeResult: updatedResult }
  } catch (error) {
    console.error('Error closing trade:', error)
    return { error: 'Failed to close trade' }
  }
}

export async function getMarketData(symbol: string, assetType: 'crypto' | 'stock' | 'cedear') {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    const { data: config } = await supabase
      .from('trading_config')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!config) {
      return { error: 'Trading configuration not found' }
    }

    let marketData: any = {}

    if (assetType === 'crypto' && config.binance_api_key && config.binance_api_secret) {
      const binance = createBinanceClient(config.binance_api_key, config.binance_api_secret)
      const ticker = await binance.getTicker(symbol)
      const ohlcv = await binance.getOHLCV(symbol, '1h', 100)

      marketData = {
        symbol,
        price: ticker.last,
        change: ticker.change,
        changePercent: ticker.percentage,
        high: ticker.high,
        low: ticker.low,
        volume: ticker.quoteVolume,
        ohlcv,
      }
    } else if (assetType === 'stock' || assetType === 'cedear') {
      const yahoo = createYahooFinanceClient()
      const quote = await yahoo.getQuote(symbol) as any
      const historical = await yahoo.getHistorical(symbol, '1mo', '1d')

      marketData = {
        symbol,
        price: quote?.regularMarketPrice || 0,
        change: quote?.regularMarketChange || 0,
        changePercent: quote?.regularMarketChangePercent || 0,
        high: quote?.regularMarketDayHigh || 0,
        low: quote?.regularMarketDayLow || 0,
        volume: quote?.regularMarketVolume || 0,
        historical,
      }
    }

    return { marketData }
  } catch (error) {
    console.error('Error fetching market data:', error)
    return { error: 'Failed to fetch market data' }
  }
}

export async function getDashboardStats() {
  const supabase = await createClient()

  try {
    const { data: trades } = await supabase
      .from('trades')
      .select(`
        *,
        trade_results (
          pnl_percentage,
          status
        )
      `)
      .order('created_at', { ascending: false })

    const activeTrades = trades?.filter(t => t.trade_results?.status === 'open') || []
    const longTrades = activeTrades.filter(t => t.trade_type === 'BUY').length
    const shortTrades = activeTrades.filter(t => t.trade_type === 'SELL').length

    const closedTrades = trades?.filter(t => t.trade_results?.status !== 'open') || []
    const winningTrades = closedTrades.filter(t => t.trade_results?.pnl_percentage > 0).length
    const winRate = closedTrades.length > 0 ? Math.round((winningTrades / closedTrades.length) * 100) : 0

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayTrades = trades?.filter(t => new Date(t.created_at) >= today) || []
    const dailyPnL = todayTrades.reduce((sum, t) => sum + (t.trade_results?.pnl_amount || 0), 0)

    const portfolioValue = await getPortfolioValue()

    return {
      portfolioValue: portfolioValue.portfolioValue || 0,
      portfolioChange: 0,
      dailyPnL,
      dailyPnLPercentage: 0,
      activeTrades: activeTrades.length,
      longTrades,
      shortTrades,
      winRate,
      winRateChange: 0
    }
  } catch (error) {
    console.error('Error getting dashboard stats:', error)
    return {
      portfolioValue: 0,
      portfolioChange: 0,
      dailyPnL: 0,
      dailyPnLPercentage: 0,
      activeTrades: 0,
      longTrades: 0,
      shortTrades: 0,
      winRate: 0,
      winRateChange: 0
    }
  }
}

export async function getPendingDecisions() {
  const supabase = await createClient()

  try {
    const { data: decisions } = await supabase
      .from('trading_decisions')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(10)

    return { decisions: decisions || [] }
  } catch (error) {
    console.error('Error fetching pending decisions:', error)
    return { decisions: [] }
  }
}

export async function updateTradingConfig(formData: FormData) {
  const supabase = await createClient()

  try {
    const { data: existingConfig } = await supabase
      .from('trading_config')
      .select('id')
      .limit(1)
      .maybeSingle()

    const configData = {
      risk_profile: formData.get('risk_profile') as any || 'moderate',
      max_trade_amount: parseFloat(formData.get('max_trade_amount') as string) || 1000,
      stop_loss_percentage: parseFloat(formData.get('stop_loss_percentage') as string) || 5,
      take_profit_percentage: parseFloat(formData.get('take_profit_percentage') as string) || 10,
      auto_execute: formData.get('auto_execute') === 'true',
      binance_api_key: formData.get('binance_api_key') as string || null,
      binance_api_secret: formData.get('binance_api_secret') as string || null,
      iol_username: formData.get('iol_username') as string || null,
      iol_password: formData.get('iol_password') as string || null,
    }

    if (existingConfig) {
      await supabase
        .from('trading_config')
        .update(configData)
        .eq('id', existingConfig.id)
    } else {
      await supabase
        .from('trading_config')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000001',
          ...configData,
        })
    }

    revalidatePath('/settings')
    return { success: true }
  } catch (error) {
    console.error('Error updating trading config:', error)
    return { error: 'Failed' }
  }
}

export async function getTradingConfig() {
  const supabase = await createClient()
  try {
    const { data: config } = await supabase
      .from('trading_config')
      .select('*')
      .limit(1)
      .maybeSingle()

    return { config }
  } catch (error) {
    console.error('Error fetching config:', error)
    return { config: null }
  }
}
