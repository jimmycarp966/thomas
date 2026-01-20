'use server'

import { createClient } from '@/lib/supabase/server'
import { generateTradeAnalysis, generateChatResponse, generateEmbedding } from '@/lib/ai/vertex-client'
import { getWellnessData } from '@/actions/wellness'
import { getAnthropometryData } from '@/actions/anthropometry'
import { getPortfolioValue } from '@/actions/trading'
import { performTrade } from './trading'
import { revalidatePath } from 'next/cache'

export async function generateTradingDecision(formData: FormData) {
  const supabase = await createClient()

  const assetSymbol = formData.get('assetSymbol') as string
  const assetType = formData.get('assetType') as 'crypto' | 'stock' | 'cedear'

  let { data: { user } } = await supabase.auth.getUser()
  // Mock user for single user mode
  if (!user) {
    user = { id: '00000000-0000-0000-0000-000000000001' } as any
  }

  const userId = user!.id

  try {
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
    const currentWellnessScore = wellnessResult.score || 80

    // 3. Generar análisis de IA con XAI y contexto biológico
    const analysis = await generateTradeAnalysis(
      assetSymbol,
      assetType,
      {}, // marketData - would be fetched from trading APIs
      riskProfile,
      currentWellnessScore
    )

    const { data: decision } = await supabase
      .from('trading_decisions')
      .insert({
        user_id: userId,
        asset_symbol: assetSymbol,
        asset_type: assetType,
        decision_type: analysis.decision,
        ai_analysis: analysis,
        suggested_amount: analysis.suggestedEntry,
        suggested_price: analysis.suggestedEntry,
        stop_loss_price: analysis.stopLoss,
        take_profit_price: analysis.takeProfit,
        status: 'pending',
      })
      .select()
      .single()

    revalidatePath('/dashboard')

    // MODO AGÉNTICO: Ejecución autónoma si la confianza es alta
    if (autoExecute && analysis.confidence >= 85 && (analysis.decision === 'BUY' || analysis.decision === 'SELL')) {
      console.log(`[Thomas Agentic] Confianza alta (${analysis.confidence}%). Ejecutando trade autónomo para ${assetSymbol}...`)
      const exchange = assetType === 'crypto' ? 'binance' : 'iol'
      await performTrade(decision.id, exchange)
    }

    return { success: true, decision }
  } catch (error) {
    console.error('Error generating trading decision:', error)
    return { error: 'Failed to generate trading decision' }
  }
}

export async function approveDecision(decisionId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    const { data: decision } = await supabase
      .from('trading_decisions')
      .update({ status: 'approved', decided_at: new Date().toISOString() })
      .eq('id', decisionId)
      .eq('user_id', user.id)
      .select()
      .single()

    revalidatePath('/dashboard')
    return { success: true, decision }
  } catch (error) {
    console.error('Error approving decision:', error)
    return { error: 'Failed to approve decision' }
  }
}

export async function rejectDecision(decisionId: string, feedback: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    const { data: decision } = await supabase
      .from('trading_decisions')
      .update({
        status: 'rejected',
        decided_at: new Date().toISOString(),
        user_feedback: feedback
      })
      .eq('id', decisionId)
      .eq('user_id', user.id)
      .select()
      .single()

    revalidatePath('/dashboard')
    return { success: true, decision }
  } catch (error) {
    console.error('Error rejecting decision:', error)
    return { error: 'Failed to reject decision' }
  }
}

export async function sendChatMessage(conversationId: string | null, message: string) {
  const supabase = await createClient()

  try {
    let conversationIdToUse = conversationId

    if (!conversationIdToUse) {
      const { data: newConversation, error: insertError } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000001',
          title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        })
        .select()
        .single()

      if (insertError || !newConversation) {
        console.error('Error creating conversation:', insertError)
        return { error: 'Failed to create conversation' }
      }

      conversationIdToUse = newConversation.id
    }

    const userEmbedding = await generateEmbedding(message)

    await supabase.from('chat_messages').insert({
      conversation_id: conversationIdToUse,
      user_id: '00000000-0000-0000-0000-000000000001',
      role: 'user',
      content: message,
      embedding: userEmbedding,
    })

    // RAG: Recuperar información relevante de conversaciones anteriores
    const relevantContext = await retrieveRelevantContext(message)

    const { data: messages } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('conversation_id', conversationIdToUse)
      .order('created_at', { ascending: true })
      .limit(10)

    const conversationHistory = messages?.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })) || []

    // Recuperar datos de contexto real
    const [wellness, anthropometry, portfolio] = await Promise.all([
      getWellnessData(),
      getAnthropometryData(),
      getPortfolioValue()
    ])

    // Recuperar actividad reciente de Thomas
    const [recentTrades, recentDecisions, recentLearnings] = await Promise.all([
      supabase.from('trades').select('*').order('created_at', { ascending: false }).limit(3),
      supabase.from('trading_decisions').select('*').order('created_at', { ascending: false }).limit(2),
      supabase.from('ai_learnings').select('*').order('created_at', { ascending: false }).limit(2),
    ])

    // Construir resumen de actividad reciente
    let recentActivitySummary = ''
    if (recentTrades.data && recentTrades.data.length > 0) {
      recentActivitySummary += `TRADES RECIENTES:\n`
      recentTrades.data.forEach((t: any) => {
        recentActivitySummary += `- ${t.trade_type} ${t.asset_symbol} x${t.quantity} @ $${t.price} (${t.exchange})\n`
      })
    }
    if (recentDecisions.data && recentDecisions.data.length > 0) {
      recentActivitySummary += `\nANÁLISIS RECIENTES:\n`
      recentDecisions.data.forEach((d: any) => {
        recentActivitySummary += `- ${d.decision_type} ${d.asset_symbol}: ${d.ai_analysis?.reasoning?.slice(0, 80) || 'Sin detalles'}...\n`
      })
    }
    if (recentLearnings.data && recentLearnings.data.length > 0) {
      recentActivitySummary += `\nAPRENDIZAJES RECIENTES:\n`
      recentLearnings.data.forEach((l: any) => {
        recentActivitySummary += `- [${l.learning_type}] ${l.content?.summary || JSON.stringify(l.content).slice(0, 60)}\n`
      })
    }

    const response = await generateChatResponse(
      message,
      conversationHistory,
      {
        portfolioValue: portfolio.portfolioValue || 0,
        wellnessScore: wellness.score || 0,
        anthropometry: anthropometry,
        relevantContext,
        recentActivity: recentActivitySummary,
      }
    )

    const embedding = await generateEmbedding(response)

    await supabase.from('chat_messages').insert({
      conversation_id: conversationIdToUse,
      user_id: '00000000-0000-0000-0000-000000000001',
      role: 'assistant',
      content: response,
      embedding: embedding, // Corregido: usar columna embedding
    })

    // Guardar aprendizajes automáticamente
    await extractAndSaveLearning(message, response, conversationIdToUse)

    revalidatePath('/chat')
    return { success: true, response, conversationId: conversationIdToUse }
  } catch (error: any) {
    console.error('Error sending chat message:', error)
    return { error: error.message || 'failed to send message' }
  }
}

async function retrieveRelevantContext(query: string): Promise<string> {
  const supabase = await createClient()

  try {
    // Generar embedding de la consulta
    const queryEmbedding = await generateEmbedding(query)

    // Buscar mensajes relevantes usando búsqueda vectorial
    const { data: relevantMessages } = await supabase
      .rpc('match_chat_messages', {
        p_embedding: queryEmbedding,
        p_user_id: '00000000-0000-0000-0000-000000000001',
        p_match_threshold: 0.7,
        p_match_limit: 5
      })

    if (!relevantMessages || relevantMessages.length === 0) {
      return ''
    }

    // Combinar el contexto relevante
    const context = relevantMessages
      .map((msg: { content: string }) => msg.content)
      .join('\n\n')

    return context
  } catch (error) {
    console.error('Error retrieving relevant context:', error)
    return ''
  }
}

async function extractAndSaveLearning(
  userMessage: string,
  aiResponse: string,
  conversationId: string | null
): Promise<void> {
  const supabase = await createClient()

  if (!conversationId) return

  try {
    // Extraer aprendizajes importantes de la conversación
    const learningPrompt = `
Analiza la siguiente conversación y extrae aprendizajes importantes sobre trading, estrategias, o patrones:

Usuario: ${userMessage}
IA: ${aiResponse}

Extrae 1-3 aprendizajes importantes en formato JSON:
{
  "learnings": [
    {
      "learning_type": "success_pattern" | "failure_pattern" | "market_insight" | "user_preference" | "other",
      "insight": "Descripción del aprendizaje",
      "confidence": 0-100
    }
  ]
}
`

    const response = await generateChatResponse(learningPrompt, [], {})

    // Parsear la respuesta JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return

    const result = JSON.parse(jsonMatch[0])

    // Guardar aprendizajes en la base de datos
    for (const learning of result.learnings || []) {
      if (learning.confidence >= 70) {
        await supabase.from('ai_learnings').insert({
          user_id: '00000000-0000-0000-0000-000000000001',
          learning_type: learning.learning_type,
          content: { insight: learning.insight },
          importance_score: learning.confidence,
          source: 'chat_conversation',
          source_id: conversationId,
          created_at: new Date().toISOString(),
        })
      }
    }
  } catch (error) {
    console.error('Error extracting and saving learning:', error)
  }
}
