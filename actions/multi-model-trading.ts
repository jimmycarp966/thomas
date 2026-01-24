'use server'

import { createClient } from '@/lib/supabase/server'
import { analyzeWithConsensus, ConsensusResult } from '@/lib/ai/multi-model'
import { getWellnessData } from '@/actions/wellness'
import { performTrade } from './trading'
import { revalidatePath } from 'next/cache'

/**
 * Generate a trading decision using Multi-Model Consensus (Claude + Gemini + GLM)
 * This is the new brain of Thomas - 3 AI models vote on every decision
 */
export async function generateMultiModelDecision(formData: FormData) {
  const supabase = await createClient()

  const assetSymbol = formData.get('assetSymbol') as string
  const assetType = formData.get('assetType') as 'crypto' | 'stock' | 'cedear'
  const marketData = JSON.parse(formData.get('marketData') as string || '{}')

  const userId = '00000000-0000-0000-0000-000000000001'

  try {
    console.log(`[Thomas Multi-Brain] 🧠 Iniciando análisis de ${assetSymbol}...`)

    // Get user configuration
    const [configResult, wellnessResult] = await Promise.all([
      supabase
        .from('trading_config')
        .select('risk_profile, auto_execute')
        .limit(1)
        .maybeSingle(),
      getWellnessData()
    ])

    const riskProfile = configResult.data?.risk_profile || 'moderate'
    const autoExecute = configResult.data?.auto_execute || false
    const wellnessScore = wellnessResult.score || 80

    console.log(`[Thomas Multi-Brain] Config: Risk=${riskProfile}, Auto=${autoExecute}, Wellness=${wellnessScore}`)

    // Run multi-model consensus analysis
    const consensus = await analyzeWithConsensus(
      assetSymbol,
      assetType,
      marketData,
      riskProfile,
      wellnessScore
    )

    console.log(`[Thomas Multi-Brain] Consensus: ${consensus.consensusLevel} → ${consensus.finalDecision} (${consensus.finalConfidence}%)`)

    // Log each model's vote
    for (const analysis of consensus.analyses) {
      const emoji = analysis.model === 'claude' ? '🟣' : 
                    analysis.model === 'gemini' ? '🔵' : '🟢'
      console.log(`[Thomas Multi-Brain] ${emoji} ${analysis.model}: ${analysis.decision} (${analysis.confidence}%)`)
    }

    // Save decision to database
    const { data: decision, error: insertError } = await supabase
      .from('trading_decisions')
      .insert({
        user_id: userId,
        asset_symbol: assetSymbol,
        asset_type: assetType,
        decision_type: consensus.finalDecision,
        ai_analysis: {
          ...consensus,
          multi_model: true,
          models_used: consensus.analyses.map(a => a.model),
        },
        suggested_amount: null,
        suggested_price: null,
        stop_loss_price: null,
        take_profit_price: null,
        status: consensus.shouldExecute ? 'approved' : 'pending',
        confidence: consensus.finalConfidence,
      })
      .select()
      .single()

    if (insertError) {
      console.error('[Thomas Multi-Brain] Error saving decision:', insertError)
      throw insertError
    }

    // Send WhatsApp notification
    await notifyOwner(consensus, assetSymbol)

    // Auto-execute if conditions are met
    if (autoExecute && consensus.shouldExecute) {
      console.log(`[Thomas Multi-Brain] 🚀 Auto-executing trade for ${assetSymbol}...`)
      const exchange = assetType === 'crypto' ? 'binance' : 'iol'
      const tradeResult = await performTrade(decision.id, exchange)
      
      if (tradeResult.success) {
        console.log(`[Thomas Multi-Brain] ✅ Trade executed successfully!`)
        await notifyTradeExecution(consensus, assetSymbol, tradeResult.trade)
      } else {
        console.log(`[Thomas Multi-Brain] ❌ Trade execution failed:`, tradeResult.error)
      }
    }

    revalidatePath('/dashboard')
    revalidatePath('/trading')

    return { success: true, decision, consensus }
  } catch (error: any) {
    console.error('[Thomas Multi-Brain] Error:', error)
    return { error: error.message || 'Multi-model analysis failed' }
  }
}

/**
 * Analyze an asset with multi-model consensus without executing
 * Use this for manual analysis requests
 */
export async function analyzeAssetMultiModel(
  assetSymbol: string,
  assetType: 'crypto' | 'stock' | 'cedear',
  marketData: any = {}
): Promise<ConsensusResult | { error: string }> {
  const supabase = await createClient()

  try {
    const [configResult, wellnessResult] = await Promise.all([
      supabase.from('trading_config').select('risk_profile').limit(1).maybeSingle(),
      getWellnessData()
    ])

    const riskProfile = configResult.data?.risk_profile || 'moderate'
    const wellnessScore = wellnessResult.score || 80

    const consensus = await analyzeWithConsensus(
      assetSymbol,
      assetType,
      marketData,
      riskProfile,
      wellnessScore
    )

    return consensus
  } catch (error: any) {
    console.error('[Thomas Multi-Brain] Analysis error:', error)
    return { error: error.message || 'Analysis failed' }
  }
}

/**
 * Send WhatsApp notification about analysis result
 */
async function notifyOwner(consensus: ConsensusResult, assetSymbol: string): Promise<void> {
  try {
    const ownerPhone = process.env.OWNER_WHATSAPP
    if (!ownerPhone) {
      console.log('[Thomas Multi-Brain] No OWNER_WHATSAPP configured, skipping notification')
      return
    }

    const emoji = consensus.finalDecision === 'BUY' ? '🟢' :
                  consensus.finalDecision === 'SELL' ? '🔴' : '🟡'

    const message = `${emoji} *Thomas Multi-Brain Analysis*

*Asset:* ${assetSymbol}
*Decision:* ${consensus.finalDecision}
*Confidence:* ${consensus.finalConfidence}%
*Consensus:* ${consensus.consensusLevel}

*Model Votes:*
${consensus.analyses.map(a => {
  const icon = a.model === 'claude' ? '🟣' : a.model === 'gemini' ? '🔵' : '🟢'
  return `${icon} ${a.model}: ${a.decision} (${a.confidence}%)`
}).join('\n')}

*Execute:* ${consensus.shouldExecute ? '✅ YES' : '❌ NO'}
*Reason:* ${consensus.executionReason}`

    // For now, log the message - will integrate with Clawdbot webhook
    console.log('[Thomas Multi-Brain] Would send notification:', message)
    
    // TODO: Integrate with Clawdbot webhook
    // await fetch(process.env.CLAWDBOT_WEBHOOK_URL, { ... })
    
  } catch (error) {
    console.error('[Thomas Multi-Brain] Notification error:', error)
  }
}

/**
 * Notify when a trade is executed
 */
async function notifyTradeExecution(
  consensus: ConsensusResult, 
  assetSymbol: string, 
  trade: any
): Promise<void> {
  try {
    const message = `🚀 *Trade Executed!*

*Asset:* ${assetSymbol}
*Action:* ${consensus.finalDecision}
*Quantity:* ${trade.quantity}
*Price:* $${trade.price}
*Total:* $${trade.total_amount}

*Consensus:* ${consensus.consensusLevel} (${consensus.finalConfidence}%)`

    console.log('[Thomas Multi-Brain] Trade notification:', message)
    
  } catch (error) {
    console.error('[Thomas Multi-Brain] Trade notification error:', error)
  }
}

/**
 * Get summary of recent multi-model decisions
 */
export async function getMultiModelHistory(limit: number = 10) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('trading_decisions')
      .select('*')
      .eq('user_id', '00000000-0000-0000-0000-000000000001')
      .not('ai_analysis->multi_model', 'is', null)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return { success: true, decisions: data }
  } catch (error: any) {
    console.error('[Thomas Multi-Brain] History error:', error)
    return { error: error.message }
  }
}
