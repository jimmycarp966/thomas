'use server'

import { createClient } from '@/lib/supabase/server'
import { generateTradeAnalysis, generateChatResponse, generateEmbedding } from '@/lib/ai/vertex-client'
import { getWellnessData } from '@/actions/wellness'
import { getAnthropometryData } from '@/actions/anthropometry'
import { getPortfolioValue } from '@/actions/trading'
import { getLiveQuotes } from '@/actions/quotes'
import { performTrade } from './trading'
import { revalidatePath } from 'next/cache'
import { parseTradingIntent, shouldExecuteTrade, TradingIntent, parseMultipleTradingIntents } from '@/lib/ai/trading-intent-parser'
import { getCircuitBreakerStatus } from '@/lib/trading/circuit-breaker'
import { checkTradePermission, getTrustLevel } from '@/lib/trading/trust-ladder'
import { sendTradeNotification, sendAlertNotification } from '@/lib/telegram/bot'

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
    const [wellness, anthropometry, portfolio, liveQuotesResult] = await Promise.all([
      getWellnessData(),
      getAnthropometryData(),
      getPortfolioValue(),
      getLiveQuotes()
    ])

    // Construir contexto de mercado con precios reales
    let marketContext = ''
    if (liveQuotesResult.quotes && liveQuotesResult.quotes.length > 0) {
      marketContext = 'COTIZACIONES EN TIEMPO REAL (IOL):\n'
      liveQuotesResult.quotes.forEach((q) => {
        const changeSign = q.changePercent >= 0 ? '+' : ''
        marketContext += `- ${q.symbol}: $${q.price.toFixed(2)} (${changeSign}${q.changePercent.toFixed(2)}%) | Max: $${q.high.toFixed(2)} | Min: $${q.low.toFixed(2)}\n`
      })
    }

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
        marketData: marketContext,  // NUEVO: Cotizaciones en tiempo real
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

    // Detectar y ejecutar comandos de trading
    let multipleIntents = parseMultipleTradingIntents(message)
    console.log('[Thomas Chat] ========== START TRADING INTENT DETECTION ==========')
    console.log('[Thomas Chat] User message:', message)
    console.log('[Thomas Chat] Parsed intents:', JSON.stringify(multipleIntents, null, 2))
    
    // Si no se detectaron intenciones claras, analizar el contexto de la conversación
    if (!multipleIntents.hasMultipleTrades && multipleIntents.intents.length === 1 && multipleIntents.intents[0].symbol === null) {
      console.log('[Thomas Chat] No symbol detected in message, analyzing conversation context...')
      
      // Buscar símbolo en la respuesta previa de Thomas
      const lastAssistantMessage = messages?.filter((m: any) => m.role === 'assistant').pop()
      console.log('[Thomas Chat] Last assistant message found:', !!lastAssistantMessage)
      
      if (lastAssistantMessage) {
        console.log('[Thomas Chat] Last assistant message content:', lastAssistantMessage.content.substring(0, 200))
        
        // Buscar símbolo en la respuesta de Thomas
        const symbolPatterns = [
          /ypf(d)?/i,
          /ggal/i,
          /pamp/i,
          /bma/i,
          /bbar/i,
          /supv/i,
          /txar/i,
          /alua/i,
          /teco2?/i,
          /merval/i
        ]
        
        console.log('[Thomas Chat] Searching for symbols in last assistant message...')
        
        for (const pattern of symbolPatterns) {
          const match = lastAssistantMessage.content.match(pattern)
          console.log(`[Thomas Chat] Testing pattern: ${pattern} -> Match: ${!!match}`)
          if (match) {
            const symbol = match[0].toUpperCase()
            const intent = multipleIntents.intents[0]
            intent.symbol = symbol
            intent.confidence += 20 // Aumentar confianza por encontrar símbolo en contexto
            intent.reasoning += ` (contexto: ${symbol})`
            console.log('[Thomas Chat] ✅ Symbol found in context:', symbol)
            console.log('[Thomas Chat] Updated intent:', JSON.stringify(intent, null, 2))
            break
          }
        }
        
        if (!multipleIntents.intents[0].symbol) {
          console.log('[Thomas Chat] ❌ No symbol found in context')
        }
      } else {
        console.log('[Thomas Chat] ❌ No assistant message found in conversation')
      }
    } else {
      console.log('[Thomas Chat] Symbol already detected or multiple trades detected')
    }

    console.log('[Thomas Chat] Final intents after context analysis:', JSON.stringify(multipleIntents, null, 2))
    console.log('[Thomas Chat] ========== END TRADING INTENT DETECTION ==========')

    if (multipleIntents.hasMultipleTrades) {
      // Ejecutar múltiples trades
      console.log('[Thomas Chat] Executing multiple trades:', multipleIntents.intents.length)
      
      const tradeResults: any[] = []
      
      for (const intent of multipleIntents.intents) {
        console.log('[Thomas Chat] Checking if should execute trade:', JSON.stringify(intent, null, 2))
        console.log('[Thomas Chat] shouldExecuteTrade result:', shouldExecuteTrade(intent))
        if (shouldExecuteTrade(intent)) {
          console.log('[Thomas Chat] ✅ Trade execution approved, executing...')
          const result = await executeSingleTrade(intent, supabase, conversationIdToUse || '', response)
          if (result) {
            tradeResults.push(result)
          }
        } else {
          console.log('[Thomas Chat] ❌ Trade execution NOT approved')
        }
      }
      
      // Si se ejecutaron trades, actualizar la respuesta
      if (tradeResults.length > 0) {
        const tradeConfirmation = tradeResults.map(r => 
          `\n\n✅ **Trade Ejecutado Exitosamente**\n- ${r.action.toUpperCase()} ${r.symbol}\n- Cantidad: ${r.quantity}\n- Precio: $${r.price.toFixed(2)}\n- Total: $${r.total.toFixed(2)}`
        ).join('\n')
        
        // Actualizar el mensaje de Thomas
        await supabase
          .from('chat_messages')
          .update({ content: response + tradeConfirmation })
          .eq('id', (await supabase.from('chat_messages').select('id').eq('conversation_id', conversationIdToUse).eq('role', 'assistant').order('created_at', { ascending: false }).limit(1).single()).data?.id)
        
        revalidatePath('/dashboard')
        revalidatePath('/trading')
      }
    } else {
      // Ejecutar un solo trade
      const intent = multipleIntents.intents[0]
      console.log('[Thomas Chat] Checking if should execute single trade:', JSON.stringify(intent, null, 2))
      console.log('[Thomas Chat] shouldExecuteTrade result:', shouldExecuteTrade(intent))
      if (shouldExecuteTrade(intent)) {
        console.log('[Thomas Chat] ✅ Single trade execution approved, executing...')
        await executeSingleTrade(intent, supabase, conversationIdToUse || '', response)
      } else {
        console.log('[Thomas Chat] ❌ Single trade execution NOT approved')
      }
    }

    revalidatePath('/chat')
    return { success: true, response, conversationId: conversationIdToUse }
  } catch (error: any) {
    console.error('Error sending chat message:', error)
    return { error: error.message || 'failed to send message' }
  }
}

async function executeSingleTrade(
  intent: TradingIntent,
  supabase: any,
  conversationId: string,
  response: string
): Promise<any> {
  console.log('[Thomas Chat] Executing single trade:', intent)

  try {
    // Verificar Circuit Breaker
    const circuitBreakerStatus = await getCircuitBreakerStatus()
    if (circuitBreakerStatus.isTradingPaused) {
      console.log('[Thomas Chat] ❌ Circuit Breaker activado, no se ejecuta trade')
      await sendAlertNotification(
        '🛑 Circuit Breaker Activado',
        `No se pudo ejecutar el trade: ${circuitBreakerStatus.pauseReason}`
      )
      return null
    }

    // Verificar Trust Ladder
    const trustLevel = await getTrustLevel()
    const tradeAmount = intent.quantity || 1000

    const permission = await checkTradePermission('00000000-0000-0000-0000-000000000001', tradeAmount)

    if (!permission.allowed) {
      console.log('[Thomas Chat] ❌ Trust Ladder no permite ejecutar trade:', permission.reason)
      await sendAlertNotification(
        '🔒 Trust Ladder',
        `No se pudo ejecutar el trade: ${permission.reason}. Nivel actual: ${trustLevel.level}`
      )
      return null
    }

    // Crear decisión de trading
    const { data: decision } = await supabase
      .from('trading_decisions')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000001',
        asset_symbol: intent.symbol!,
        asset_type: 'stock',
        decision_type: intent.action === 'buy' ? 'BUY' : 'SELL',
        ai_analysis: {
          reasoning: intent.reasoning,
          confidence: intent.confidence,
          source: 'chat_command'
        },
        suggested_amount: intent.quantity || 1000,
        suggested_price: intent.price || 0,
        stop_loss_price: intent.price ? intent.price * 0.95 : 0,
        take_profit_price: intent.price ? intent.price * 1.1 : 0,
        status: 'approved',
        decided_at: new Date().toISOString()
      })
      .select()
      .single()

    if (!decision) {
      console.log('[Thomas Chat] ❌ Error creando decisión de trading')
      return null
    }

    console.log('[Thomas Chat] Ejecutando trade desde chat...', decision)

    // Ejecutar trade
    const tradeResult = await performTrade(decision.id, 'iol')

    if (tradeResult.success) {
      console.log('[Thomas Chat] ✅ Trade ejecutado exitosamente:', tradeResult.trade)

      // Notificar por Telegram
      await sendTradeNotification(
        intent.symbol!,
        intent.action === 'buy' ? 'BUY' : 'SELL',
        tradeResult.trade.price,
        tradeResult.trade.quantity,
        intent.confidence
      )

      return {
        action: intent.action,
        symbol: intent.symbol,
        quantity: tradeResult.trade.quantity,
        price: tradeResult.trade.price,
        total: tradeResult.trade.total_amount
      }
    } else {
      console.log('[Thomas Chat] ❌ Error ejecutando trade:', tradeResult.error)
      await sendAlertNotification(
        '❌ Error Ejecutando Trade',
        `No se pudo ejecutar el trade: ${tradeResult.error}`
      )
      return null
    }
  } catch (error) {
    console.error('[Thomas Chat] Error ejecutando trade desde chat:', error)
    await sendAlertNotification(
      '❌ Error en Ejecución de Trade',
      `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`
    )
    return null
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
