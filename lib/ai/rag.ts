import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from './vertex-client'

export interface SimilarDecision {
  id: string
  asset_symbol: string
  decision_type: 'BUY' | 'SELL' | 'HOLD'
  confidence: number
  reasoning: string
  similarity: number
}

export interface RelevantLearning {
  id: string
  learning_type: 'success_pattern' | 'failure_pattern' | 'market_insight' | 'user_preference'
  content: any
  importance_score: number
  similarity: number
}

export async function searchSimilarDecisions(
  userId: string,
  assetSymbol: string,
  assetType: 'crypto' | 'stock' | 'cedear',
  limit: number = 5
): Promise<SimilarDecision[]> {
  const supabase = await createClient()

  try {
    const query = `
      SELECT 
        id,
        asset_symbol,
        decision_type,
        confidence,
        ai_analysis->>'reasoning' as reasoning,
        1 - (embedding <=> (
          SELECT embedding 
          FROM trading_decisions 
          WHERE asset_symbol = $1 
            AND asset_type = $2 
            AND user_id = $3 
            AND embedding IS NOT NULL
          LIMIT 1
        )) as similarity
      FROM trading_decisions
      WHERE user_id = $3
        AND asset_type = $2
        AND embedding IS NOT NULL
        AND id NOT IN (
          SELECT id 
          FROM trading_decisions 
          WHERE asset_symbol = $1 
            AND asset_type = $2 
            AND user_id = $3
          LIMIT 1
        )
      ORDER BY similarity DESC
      LIMIT $4
    `

    const { data, error } = await supabase.rpc('match_similar_decisions', {
      query_asset_symbol: assetSymbol,
      query_asset_type: assetType,
      query_user_id: userId,
      match_limit: limit,
    })

    if (error) {
      console.error('Error searching similar decisions:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in searchSimilarDecisions:', error)
    return []
  }
}

export async function searchRelevantLearnings(
  userId: string,
  context: string,
  limit: number = 5
): Promise<RelevantLearning[]> {
  const supabase = await createClient()

  try {
    const embedding = await generateEmbedding(context)

    const { data, error } = await supabase.rpc('match_relevant_learnings', {
      query_embedding: embedding,
      query_user_id: userId,
      match_limit: limit,
    })

    if (error) {
      console.error('Error searching relevant learnings:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in searchRelevantLearnings:', error)
    return []
  }
}

export async function storeDecisionWithEmbedding(
  userId: string,
  decisionId: string,
  reasoning: string
): Promise<void> {
  const supabase = await createClient()

  try {
    const embedding = await generateEmbedding(reasoning)

    await supabase
      .from('trading_decisions')
      .update({ embedding })
      .eq('id', decisionId)
      .eq('user_id', userId)
  } catch (error) {
    console.error('Error storing decision with embedding:', error)
  }
}

export async function storeLearningWithEmbedding(
  userId: string,
  learningType: 'success_pattern' | 'failure_pattern' | 'market_insight' | 'user_preference',
  content: any,
  importanceScore: number = 50,
  relatedDecisions: string[] = [],
  relatedTrades: string[] = []
): Promise<void> {
  const supabase = await createClient()

  try {
    const contentString = JSON.stringify(content)
    const embedding = await generateEmbedding(contentString)

    await supabase.from('ai_learnings').insert({
      user_id: userId,
      learning_type: learningType,
      content,
      importance_score: importanceScore,
      related_decisions: relatedDecisions,
      related_trades: relatedTrades,
      embedding,
    })
  } catch (error) {
    console.error('Error storing learning with embedding:', error)
  }
}

export async function generateContextualAnalysis(
  userId: string,
  assetSymbol: string,
  assetType: 'crypto' | 'stock' | 'cedear',
  marketData: any
): Promise<string> {
  const similarDecisions = await searchSimilarDecisions(userId, assetSymbol, assetType, 3)
  const relevantLearnings = await searchRelevantLearnings(userId, `Trading ${assetSymbol} ${assetType}`, 3)

  let context = ''

  if (similarDecisions.length > 0) {
    context += '\n\n## Similar Past Decisions:\n'
    similarDecisions.forEach((decision, index) => {
      context += `\n${index + 1}. ${decision.decision_type} ${decision.asset_symbol} (${Math.round(decision.similarity * 100)}% similar)\n`
      context += `   Confidence: ${decision.confidence}%\n`
      context += `   Reasoning: ${decision.reasoning}\n`
    })
  }

  if (relevantLearnings.length > 0) {
    context += '\n\n## Relevant Learnings:\n'
    relevantLearnings.forEach((learning, index) => {
      context += `\n${index + 1}. ${learning.learning_type} (Importance: ${learning.importance_score})\n`
      context += `   ${JSON.stringify(learning.content).substring(0, 200)}...\n`
    })
  }

  return context
}

export async function learnFromTradeResult(
  userId: string,
  tradeResultId: string
): Promise<void> {
  const supabase = await createClient()

  try {
    const { data: tradeResult } = await supabase
      .from('trade_results')
      .select(`
        *,
        trades (
          asset_symbol,
          trade_type,
          decision_id,
          trading_decisions (
            decision_type,
            ai_analysis
          )
        )
      `)
      .eq('id', tradeResultId)
      .eq('user_id', userId)
      .single()

    if (!tradeResult) {
      return
    }

    const pnlPercentage = tradeResult.pnl_percentage || 0
    const isProfitable = pnlPercentage > 0

    const learningType = isProfitable ? 'success_pattern' : 'failure_pattern'
    const importanceScore = Math.min(Math.abs(pnlPercentage) * 10, 100)

    const content = {
      asset_symbol: tradeResult.trades?.asset_symbol,
      trade_type: tradeResult.trades?.trade_type,
      entry_price: tradeResult.entry_price,
      exit_price: tradeResult.exit_price,
      pnl_percentage: pnlPercentage,
      decision_type: tradeResult.trades?.trading_decisions?.decision_type,
      ai_analysis: tradeResult.trades?.trading_decisions?.ai_analysis,
    }

    await storeLearningWithEmbedding(
      userId,
      learningType,
      content,
      importanceScore,
      tradeResult.trades?.decision_id ? [tradeResult.trades.decision_id] : [],
      [tradeResult.trade_id]
    )
  } catch (error) {
    console.error('Error learning from trade result:', error)
  }
}
