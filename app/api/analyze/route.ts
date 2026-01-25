import { NextResponse } from 'next/server'
import { analyzeWithConsensus, ConsensusResult } from '@/lib/ai/multi-model'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Manual Multi-Model Analysis API
 * Allows triggering analysis via WhatsApp or web interface
 * FIXED: Proper typing and use of body.assetSymbol
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { assetSymbol, assetType, marketData } = body

    // Fallback market data if not provided
    const defaultMarketData: any = marketData || {
      symbol: assetSymbol,
      price: 15000,
      change: 120,
      changePercent: 0.8,
      volume: 50000000,
      high: 15400,
      low: 14600,
      previousClose: 14800,
      rsi: 72.5,
      ma50: 14900,
      ma200: 14850,
      ema200: 14850,
      bollingerUpper: 15100,
      bollingerMiddle: 14950,
      bollingerLower: 14700,
      macd: 7.2,
      atr: 14,
      cci: 5.8,
      stochK: 24,
      stochD: 20,
      williamsR: 85,
      williamsPercentR: 70,
      momentum: 100,
      momentumPercent: -14,
      marketPhase: 'neutral',
    }

    // Get user's risk profile and wellness score
    // For now, use defaults
    const riskProfile: 'moderate'
    const wellnessScore = 80

    const consensus = await analyzeWithConsensus(
      assetSymbol,
      assetType,
      defaultMarketData,
      riskProfile,
      wellnessScore
    )

    // Store decision (for history)
    const supabase = await createClient()
    await supabase.from('trading_decisions').insert({
      user_id: '00000000-0000-0000-000000001',
      asset_symbol: assetSymbol,
      asset_type: assetType,
      decision_type: consensus.finalDecision,
      ai_analysis: {
        ...consensus,
        source: 'manual_web',
        requested_at: new Date().toISOString(),
      },
      suggested_price: consensus.analyses.find((a: any) => a.model === 'gemini')?.suggestedEntry || null,
      stop_loss_price: null,
      take_profit_price: null,
      confidence: consensus.finalConfidence,
      status: consensus.shouldExecute ? 'approved' : 'pending',
      created_at: new Date().toISOString(),
    })

    revalidatePath('/dashboard')

    return NextResponse.json({
      success: true,
      consensus,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('[API: Analyze] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Analysis failed' },
      { status: 500 }
    )
  }
}
