import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // 1. Buscar trades ejecutados hace 24 horas que están abiertos
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const { data: openResults, error: fetchError } = await supabase
      .from('trade_results')
      .select(`
        *,
        trades!inner(*)
      `)
      .eq('status', 'open')
      .lt('trades.executed_at', twentyFourHoursAgo)

    if (fetchError) throw fetchError

    if (!openResults || openResults.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No trades to evaluate' }),
        { status: 200 }
      )
    }

    const evaluatedTrades = []

    // 2. Evaluar cada trade
    for (const result of openResults) {
      const trade = result.trades

      // 3. Obtener precio actual del asset
      const currentPrice = await getCurrentPrice(trade.asset_symbol, trade.exchange)

      if (!currentPrice) {
        console.error(`Could not get current price for ${trade.asset_symbol}`)
        continue
      }

      // 4. Calcular P&L
      let pnlAmount = 0
      if (trade.trade_type === 'BUY') {
        pnlAmount = currentPrice - result.entry_price
      } else {
        pnlAmount = result.entry_price - currentPrice
      }

      const pnlPercentage = (pnlAmount / result.entry_price) * 100

      // 5. Determinar status del trade
      let status = 'closed_breakeven'
      if (pnlAmount > 0) {
        status = 'closed_profit'
      } else if (pnlAmount < 0) {
        status = 'closed_loss'
      }

      // 6. Generar evaluación con IA
      const aiEvaluation = await generateTradeEvaluation(
        trade,
        result,
        currentPrice,
        pnlPercentage,
        status
      )

      // 7. Actualizar resultado del trade
      await supabase
        .from('trade_results')
        .update({
          exit_price: currentPrice,
          pnl_amount: pnlAmount,
          pnl_percentage: pnlPercentage,
          status: status,
          ai_evaluation: aiEvaluation,
          closed_at: new Date().toISOString(),
          evaluated_at: new Date().toISOString(),
        })
        .eq('id', result.id)

      // 8. Crear aprendizaje si es relevante
      if (aiEvaluation.confidence_in_learning > 0.6) {
        await supabase.from('ai_learnings').insert({
          user_id: trade.user_id,
          learning_type: aiEvaluation.success 
            ? 'success_pattern' 
            : 'failure_pattern',
          content: {
            pattern: aiEvaluation.lessons_learned,
            trade_details: {
              asset: trade.asset_symbol,
              decision: trade.trade_type,
              result: status,
              pnl_percentage: pnlPercentage
            },
            analysis: aiEvaluation.analysis,
            recommendations: aiEvaluation.recommendations
          },
          importance_score: aiEvaluation.confidence_in_learning,
          related_trades: [trade.id],
        })
      }

      // 9. Notificar usuario
      await supabase.from('notifications').insert({
        user_id: trade.user_id,
        type: 'trade_result',
        title: `Trade ${status.replace('closed_', '')}: ${trade.asset_symbol}`,
        message: `P&L: ${pnlPercentage.toFixed(2)}%. ${aiEvaluation.analysis.substring(0, 100)}...`,
        metadata: { trade_id: trade.id }
      })

      evaluatedTrades.push(trade.id)
    }

    return new Response(
      JSON.stringify({ success: true, evaluated: evaluatedTrades.length }),
      { status: 200 }
    )

  } catch (error) {
    console.error('Error in evaluate-trades:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    )
  }
})

async function getCurrentPrice(symbol: string, exchange: string): Promise<number | null> {
  try {
    // Para crypto (Binance)
    if (exchange === 'binance') {
      const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`)
      const data = await response.json()
      return parseFloat(data.price)
    }
    
    // Para stocks (Yahoo Finance)
    const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`)
    const data = await response.json()
    const price = data.chart.result[0].meta.regularMarketPrice
    return price
    
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error)
    return null
  }
}

async function generateTradeEvaluation(
  trade: any,
  result: any,
  currentPrice: number,
  pnlPercentage: number,
  status: string
): Promise<any> {
  try {
    // Obtener la decisión original
    const decision = await getDecision(trade.decision_id)
    
    const prompt = `
Analiza el siguiente trade ejecutado y proporciona una reflexión crítica para mejorar futuras decisiones.

DECISIÓN ORIGINAL:
${decision ? JSON.stringify(decision.ai_analysis, null, 2) : 'No disponible'}

TRADE EJECUTADO:
- Asset: ${trade.asset_symbol}
- Tipo: ${trade.trade_type}
- Exchange: ${trade.exchange}
- Precio entrada: $${result.entry_price}
- Precio salida: $${currentPrice}
- P&L: ${pnlPercentage.toFixed(2)}%

RESULTADO: ${status}

Analiza en profundidad:
1. ¿La predicción fue correcta? ¿Por qué sí o por qué no?
2. ¿Qué indicadores fueron precisos/imprecisos?
3. ¿Qué factores externos no se consideraron?
4. ¿Qué aprendizaje concreto se puede extraer?
5. ¿Se debe ajustar la estrategia para casos similares?

Responde en formato JSON:

{
  "success": true/false,
  "analysis": "Análisis detallado de lo que pasó...",
  "lessons_learned": "Lecciones específicas y accionables...",
  "mistakes": "Errores cometidos..." o null,
  "confidence_in_learning": 0.8,
  "recommendations": "Ajustes específicos para el futuro..."
}

IMPORTANTE: Responde SOLO con el JSON, sin texto adicional.
`

    // Aquí se podría llamar a Vertex AI, pero por ahora usamos una evaluación simple
    const evaluation = {
      success: status === 'closed_profit',
      analysis: `Trade ${status} con P&L de ${pnlPercentage.toFixed(2)}%. ${status === 'closed_profit' ? 'El trade fue exitoso' : 'El trade resultó en pérdida'}.`,
      lessons_learned: status === 'closed_profit' 
        ? 'Mantener la estrategia actual para este tipo de configuración de mercado.'
        : 'Revisar los indicadores utilizados y considerar ajustar el timing de entrada.',
      mistakes: status === 'closed_loss' ? 'Posible entrada prematura o falta de confirmación de tendencia.' : null,
      confidence_in_learning: Math.min(Math.abs(pnlPercentage) / 10, 1),
      recommendations: status === 'closed_profit'
        ? 'Continuar monitoreando este patrón de mercado para futuras oportunidades.'
        : 'Aumentar el rigor en el análisis técnico antes de entrar en posiciones similares.'
    }

    return evaluation
    
  } catch (error) {
    console.error('Error generating trade evaluation:', error)
    return {
      success: status === 'closed_profit',
      analysis: 'No se pudo generar evaluación detallada.',
      lessons_learned: 'Revisar manualmente este trade.',
      mistakes: null,
      confidence_in_learning: 0.5,
      recommendations: 'Revisar manualmente este trade.'
    }
  }
}

async function getDecision(decisionId: string): Promise<any> {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    const { data, error } = await supabase
      .from('trading_decisions')
      .select('*')
      .eq('id', decisionId)
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching decision:', error)
    return null
  }
}
