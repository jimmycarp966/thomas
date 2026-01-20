import { createClient } from '@/lib/supabase/server'

export enum TrustLevel {
  NOVICE = 1,
  APPRENTICE = 2,
  TRADER = 3,
  EXPERT = 4
}

export interface TrustLadderConfig {
  level: TrustLevel
  requirements: {
    minTrades: number
    minWinRate: number
  }
  permissions: {
    canExecuteTrades: boolean
    maxTradeAmount: number
    requiresApproval: boolean
    canUseMultipleStrategies: boolean
    canAutoAdjustParameters: boolean
  }
}

const TRUST_LADDER: Record<TrustLevel, TrustLadderConfig> = {
  [TrustLevel.NOVICE]: {
    level: TrustLevel.NOVICE,
    requirements: {
      minTrades: 0,
      minWinRate: 0
    },
    permissions: {
      canExecuteTrades: false,
      maxTradeAmount: 0,
      requiresApproval: true,
      canUseMultipleStrategies: false,
      canAutoAdjustParameters: false
    }
  },
  [TrustLevel.APPRENTICE]: {
    level: TrustLevel.APPRENTICE,
    requirements: {
      minTrades: 10,
      minWinRate: 50
    },
    permissions: {
      canExecuteTrades: true,
      maxTradeAmount: 500,
      requiresApproval: false,
      canUseMultipleStrategies: false,
      canAutoAdjustParameters: false
    }
  },
  [TrustLevel.TRADER]: {
    level: TrustLevel.TRADER,
    requirements: {
      minTrades: 50,
      minWinRate: 55
    },
    permissions: {
      canExecuteTrades: true,
      maxTradeAmount: 2000,
      requiresApproval: false,
      canUseMultipleStrategies: true,
      canAutoAdjustParameters: false
    }
  },
  [TrustLevel.EXPERT]: {
    level: TrustLevel.EXPERT,
    requirements: {
      minTrades: 100,
      minWinRate: 60
    },
    permissions: {
      canExecuteTrades: true,
      maxTradeAmount: Infinity,
      requiresApproval: false,
      canUseMultipleStrategies: true,
      canAutoAdjustParameters: true
    }
  }
}

export async function getTrustLevel(
  userId: string = '00000000-0000-0000-0000-000000000001'
): Promise<TrustLadderConfig> {
  const supabase = await createClient()

  const { data: config } = await supabase
    .from('trading_config')
    .select('trust_level')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()

  const currentLevel = config?.trust_level ? Number(config.trust_level) : TrustLevel.NOVICE

  return TRUST_LADDER[currentLevel as TrustLevel] || TRUST_LADDER[TrustLevel.NOVICE]
}

export async function evaluateTrustLevel(
  userId: string = '00000000-0000-0000-0000-000000000001'
): Promise<{ current: TrustLadderConfig; new: TrustLadderConfig | null; reason: string }> {
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

  if (!trades || trades.length === 0) {
    const current = TRUST_LADDER[TrustLevel.NOVICE]
    return {
      current,
      new: null,
      reason: 'No trades yet - starting at Novice level'
    }
  }

  const totalTrades = trades.length
  const closedTrades = trades.filter(t => t.trade_results?.status !== 'open')

  if (closedTrades.length === 0) {
    const current = TRUST_LADDER[TrustLevel.NOVICE]
    return {
      current,
      new: null,
      reason: 'No closed trades yet - remaining at Novice level'
    }
  }

  const winningTrades = closedTrades.filter(t => t.trade_results?.pnl_percentage && t.trade_results.pnl_percentage > 0)
  const winRate = (winningTrades.length / closedTrades.length) * 100

  const current = await getTrustLevel(userId)

  let newLevel: TrustLadderConfig | null = null
  let reason = `Current level: ${getLevelName(current.level)}. Win rate: ${winRate.toFixed(1)}% (${closedTrades.length} trades)`

  if (totalTrades >= 100 && winRate >= 60) {
    if (current.level < TrustLevel.EXPERT) {
      newLevel = TRUST_LADDER[TrustLevel.EXPERT]
      reason = `🎉 Promoted to EXPERT! Win rate: ${winRate.toFixed(1)}%, Trades: ${totalTrades}`
    }
  } else if (totalTrades >= 50 && winRate >= 55) {
    if (current.level < TrustLevel.TRADER) {
      newLevel = TRUST_LADDER[TrustLevel.TRADER]
      reason = `📈 Promoted to TRADER! Win rate: ${winRate.toFixed(1)}%, Trades: ${totalTrades}`
    }
  } else if (totalTrades >= 10 && winRate >= 50) {
    if (current.level < TrustLevel.APPRENTICE) {
      newLevel = TRUST_LADDER[TrustLevel.APPRENTICE]
      reason = `🌟 Promoted to APPRENTICE! Win rate: ${winRate.toFixed(1)}%, Trades: ${totalTrades}`
    }
  } else if (current.level > TrustLevel.NOVICE && winRate < 45 && closedTrades.length >= 20) {
    newLevel = TRUST_LADDER[TrustLevel.NOVICE]
    reason = `⚠️ Demoted to NOVICE due to poor performance. Win rate: ${winRate.toFixed(1)}%`
  }

  if (newLevel) {
    await updateTrustLevel(userId, newLevel.level)
  }

  return {
    current,
    new: newLevel,
    reason
  }
}

export async function updateTrustLevel(
  userId: string,
  level: TrustLevel
): Promise<void> {
  const supabase = await createClient()

  await supabase
    .from('trading_config')
    .update({ trust_level: level })
    .eq('user_id', userId)

  const levelName = getLevelName(level)

  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'trust_level_change',
    title: `🏆 Trust Level Updated: ${levelName}`,
    message: `Thomas is now at ${levelName} level with new permissions.`,
    read: false
  })

  console.log(`[TrustLadder] Updated to level ${level} (${levelName})`)
}

export async function checkTradePermission(
  userId: string,
  amount: number
): Promise<{ allowed: boolean; reason: string; maxAmount: number }> {
  const trustConfig = await getTrustLevel(userId)

  if (!trustConfig.permissions.canExecuteTrades) {
    return {
      allowed: false,
      reason: 'Trading not allowed at current trust level. Need more experience.',
      maxAmount: 0
    }
  }

  if (amount > trustConfig.permissions.maxTradeAmount) {
    return {
      allowed: false,
      reason: `Trade amount exceeds maximum allowed ($${trustConfig.permissions.maxTradeAmount}). Current trust level: ${getLevelName(trustConfig.level)}`,
      maxAmount: trustConfig.permissions.maxTradeAmount
    }
  }

  return {
    allowed: true,
    reason: 'Trade approved',
    maxAmount: trustConfig.permissions.maxTradeAmount
  }
}

function getLevelName(level: TrustLevel): string {
  switch (level) {
    case TrustLevel.NOVICE:
      return 'Novice'
    case TrustLevel.APPRENTICE:
      return 'Apprentice'
    case TrustLevel.TRADER:
      return 'Trader'
    case TrustLevel.EXPERT:
      return 'Expert'
    default:
      return 'Unknown'
  }
}

export async function getTrustLevelSummary(
  userId: string = '00000000-0000-0000-0000-000000000001'
): Promise<{
  currentLevel: TrustLadderConfig
  progress: {
    trades: number
    requiredTrades: number
    winRate: number
    requiredWinRate: number
    nextLevel: TrustLadderConfig | null
  }
}> {
  const supabase = await createClient()

  const current = await getTrustLevel(userId)

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

  const totalTrades = trades?.length || 0
  const closedTrades = trades?.filter(t => t.trade_results?.status !== 'open') || []
  const winningTrades = closedTrades.filter(t => t.trade_results?.pnl_percentage && t.trade_results.pnl_percentage > 0)
  const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0

  let nextLevel: TrustLadderConfig | null = null

  if (current.level < TrustLevel.EXPERT) {
    const nextLevelNum = current.level + 1
    nextLevel = TRUST_LADDER[nextLevelNum as TrustLevel]
  }

  return {
    currentLevel: current,
    progress: {
      trades: totalTrades,
      requiredTrades: nextLevel?.requirements.minTrades || 0,
      winRate,
      requiredWinRate: nextLevel?.requirements.minWinRate || 0,
      nextLevel
    }
  }
}
