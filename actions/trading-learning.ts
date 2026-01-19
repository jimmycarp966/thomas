'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function recordTradeResult(
  tradeId: string,
  result: 'profit' | 'loss' | 'breakeven',
  actualProfitLoss: number,
  notes?: string
) {
  const supabase = await createClient()
  
  try {
    // Actualizar el trade con el resultado
    const { data: trade } = await supabase
      .from('trades')
      .update({
        pnl: actualProfitLoss,
        result,
        notes,
        closed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', tradeId)
      .select()
      .single()

    // Extraer aprendizaje del resultado del trade
    await extractLearningFromTradeResult(trade)

    revalidatePath('/trading')
    return { success: true }
  } catch (error) {
    console.error('Error recording trade result:', error)
    return { error: 'Failed to record trade result' }
  }
}

async function extractLearningFromTradeResult(trade: any): Promise<void> {
  const supabase = await createClient()
  
  try {
    const { generateChatResponse } = await import('@/lib/ai/vertex-client')
    
    const learningPrompt = `
Analiza el siguiente resultado de trade y extrae aprendizajes importantes:

Símbolo: ${trade.asset_symbol}
Tipo de Trade: ${trade.trade_type}
Precio de Entrada: ${trade.price}
Precio de Salida: ${trade.closed_price || 'N/A'}
Resultado: ${trade.result}
P&L: $${trade.pnl}
Notas: ${trade.notes || 'N/A'}

Extrae 1-3 aprendizajes importantes en formato JSON:
{
  "learnings": [
    {
      "category": "entry_timing" | "exit_strategy" | "risk_management" | "market_conditions" | "other",
      "insight": "Descripción del aprendizaje",
      "confidence": 0-100
    }
  ]
}
`

    const response = await generateChatResponse(learningPrompt, [], {})
    
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return
    
    const result = JSON.parse(jsonMatch[0])
    
    for (const learning of result.learnings || []) {
      if (learning.confidence >= 70) {
        await supabase.from('ai_learnings').insert({
          user_id: '00000000-0000-0000-0000-000000000001',
          category: learning.category,
          insight: learning.insight,
          confidence: learning.confidence,
          source: 'trade_result',
          source_id: trade.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }
    }
  } catch (error) {
    console.error('Error extracting learning from trade result:', error)
  }
}

export async function getTradingPerformanceStats() {
  const supabase = await createClient()
  
  try {
    const { data: trades } = await supabase
      .from('trades')
      .select('result, pnl, trade_type, asset_symbol')
      .eq('user_id', '00000000-0000-0000-0000-000000000001')
      .not('result', 'is', null)
    
    if (!trades || trades.length === 0) {
      return {
        totalTrades: 0,
        profitableTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalPnL: 0,
        avgPnL: 0,
      }
    }
    
    const profitableTrades = trades.filter(t => t.result === 'profit').length
    const losingTrades = trades.filter(t => t.result === 'loss').length
    const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0)
    
    return {
      totalTrades: trades.length,
      profitableTrades,
      losingTrades,
      winRate: (profitableTrades / trades.length) * 100,
      totalPnL,
      avgPnL: totalPnL / trades.length,
    }
  } catch (error) {
    console.error('Error getting trading performance stats:', error)
    return {
      totalTrades: 0,
      profitableTrades: 0,
      losingTrades: 0,
      winRate: 0,
      totalPnL: 0,
      avgPnL: 0,
    }
  }
}

export async function getRecommendationsBasedOnHistory() {
  const supabase = await createClient()
  
  try {
    const { data: learnings } = await supabase
      .from('ai_learnings')
      .select('category, insight, confidence')
      .eq('user_id', '00000000-0000-0000-0000-000000000001')
      .gte('confidence', 80)
      .order('confidence', { ascending: false })
      .limit(10)
    
    return learnings || []
  } catch (error) {
    console.error('Error getting recommendations:', error)
    return []
  }
}
