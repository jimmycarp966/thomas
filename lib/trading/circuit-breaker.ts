import { createClient } from '@/lib/supabase/server'

export interface CircuitBreakerConfig {
  maxConsecutiveLosses: number
  maxDailyLossPct: number
  maxWeeklyLossPct: number
  cooldownHours: number
}

export interface CircuitBreakerStatus {
  isTradingPaused: boolean
  pauseReason: string | null
  pauseUntil: string | null
  consecutiveLosses: number
  dailyLossPct: number
  weeklyLossPct: number
  cooldownRemaining: number | null
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  maxConsecutiveLosses: 3,
  maxDailyLossPct: 5,
  maxWeeklyLossPct: 10,
  cooldownHours: 4
}

export async function getCircuitBreakerStatus(
  userId: string = '00000000-0000-0000-0000-000000000001'
): Promise<CircuitBreakerStatus> {
  const supabase = await createClient()

  try {
    const { data: config } = await supabase
      .from('trading_config')
      .select('circuit_breaker_config, circuit_breaker_paused_until')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle()

    const cbConfig = config?.circuit_breaker_config as CircuitBreakerConfig || DEFAULT_CONFIG
    const pausedUntil = config?.circuit_breaker_paused_until

    const now = new Date()
    let isTradingPaused = false
    let pauseReason: string | null = null
    let cooldownRemaining: number | null = null

    if (pausedUntil) {
      const pauseDate = new Date(pausedUntil)
      if (now < pauseDate) {
        isTradingPaused = true
        pauseReason = 'Cooldown period active'
        cooldownRemaining = Math.floor((pauseDate.getTime() - now.getTime()) / (1000 * 60 * 60))
      } else {
        await clearCircuitBreaker(userId)
      }
    }

    const consecutiveLosses = await getConsecutiveLosses(userId)
    const dailyLossPct = await getDailyLossPct(userId)
    const weeklyLossPct = await getWeeklyLossPct(userId)

    if (!isTradingPaused) {
      if (consecutiveLosses >= cbConfig.maxConsecutiveLosses) {
        isTradingPaused = true
        pauseReason = `${consecutiveLosses} consecutive losses`
        await triggerCircuitBreaker(userId, `${consecutiveLosses} consecutive losses`, cbConfig.cooldownHours)
      } else if (dailyLossPct <= -cbConfig.maxDailyLossPct) {
        isTradingPaused = true
        pauseReason = `Daily loss of ${dailyLossPct.toFixed(2)}%`
        await triggerCircuitBreaker(userId, `Daily loss of ${dailyLossPct.toFixed(2)}%`, 24)
      } else if (weeklyLossPct <= -cbConfig.maxWeeklyLossPct) {
        isTradingPaused = true
        pauseReason = `Weekly loss of ${weeklyLossPct.toFixed(2)}%`
        await triggerCircuitBreaker(userId, `Weekly loss of ${weeklyLossPct.toFixed(2)}%`, 48)
      }
    }

    return {
      isTradingPaused,
      pauseReason,
      pauseUntil: pausedUntil,
      consecutiveLosses,
      dailyLossPct,
      weeklyLossPct,
      cooldownRemaining
    }
  } catch (error) {
    console.error('[CircuitBreaker] Error getting status:', error)
    return {
      isTradingPaused: false,
      pauseReason: null,
      pauseUntil: null,
      consecutiveLosses: 0,
      dailyLossPct: 0,
      weeklyLossPct: 0,
      cooldownRemaining: null
    }
  }
}

async function getConsecutiveLosses(userId: string): Promise<number> {
  const supabase = await createClient()

  const { data: trades } = await supabase
    .from('trades')
    .select(`
      *,
      trade_results (
        pnl_percentage,
        status
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (!trades) return 0

  let consecutiveLosses = 0
  for (const trade of trades) {
    const pnl = trade.trade_results?.pnl_percentage
    if (pnl !== null && pnl !== undefined && pnl < 0) {
      consecutiveLosses++
    } else {
      break
    }
  }

  return consecutiveLosses
}

async function getDailyLossPct(userId: string): Promise<number> {
  const supabase = await createClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: trades } = await supabase
    .from('trades')
    .select(`
      *,
      trade_results (
        pnl_amount,
        status
      )
    `)
    .eq('user_id', userId)
    .gte('created_at', today.toISOString())

  if (!trades) return 0

  const totalPnL = trades.reduce((sum, trade) => {
    return sum + (trade.trade_results?.pnl_amount || 0)
  }, 0)

  const { data: portfolio } = await supabase
    .from('trading_config')
    .select('max_trade_amount')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()

  const portfolioValue = portfolio?.max_trade_amount || 1000

  return (totalPnL / portfolioValue) * 100
}

async function getWeeklyLossPct(userId: string): Promise<number> {
  const supabase = await createClient()

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const { data: trades } = await supabase
    .from('trades')
    .select(`
      *,
      trade_results (
        pnl_amount,
        status
      )
    `)
    .eq('user_id', userId)
    .gte('created_at', weekAgo.toISOString())

  if (!trades) return 0

  const totalPnL = trades.reduce((sum, trade) => {
    return sum + (trade.trade_results?.pnl_amount || 0)
  }, 0)

  const { data: portfolio } = await supabase
    .from('trading_config')
    .select('max_trade_amount')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()

  const portfolioValue = portfolio?.max_trade_amount || 1000

  return (totalPnL / portfolioValue) * 100
}

async function triggerCircuitBreaker(
  userId: string,
  reason: string,
  hours: number
): Promise<void> {
  const supabase = await createClient()

  const pauseUntil = new Date()
  pauseUntil.setHours(pauseUntil.getHours() + hours)

  await supabase
    .from('trading_config')
    .update({
      circuit_breaker_paused_until: pauseUntil.toISOString()
    })
    .eq('user_id', userId)

  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'circuit_breaker',
    title: '🛑 Circuit Breaker Activated',
    message: `Trading paused until ${pauseUntil.toLocaleString()}. Reason: ${reason}.`,
    read: false
  })

  console.log(`[CircuitBreaker] 🛑 Activated: ${reason}. Paused until ${pauseUntil.toISOString()}`)
}

async function clearCircuitBreaker(userId: string): Promise<void> {
  const supabase = await createClient()

  await supabase
    .from('trading_config')
    .update({
      circuit_breaker_paused_until: null
    })
    .eq('user_id', userId)

  console.log('[CircuitBreaker] ✅ Cleared - trading resumed')
}

export async function updateCircuitBreakerConfig(
  userId: string,
  config: Partial<CircuitBreakerConfig>
): Promise<void> {
  const supabase = await createClient()

  const { data: current } = await supabase
    .from('trading_config')
    .select('circuit_breaker_config')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()

  const currentConfig = (current?.circuit_breaker_config as CircuitBreakerConfig) || DEFAULT_CONFIG

  await supabase
    .from('trading_config')
    .update({
      circuit_breaker_config: {
        ...currentConfig,
        ...config
      }
    })
    .eq('user_id', userId)
}
