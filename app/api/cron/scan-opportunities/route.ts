import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createIOLClient } from '@/lib/trading/iol-client'
import { generateTradeAnalysis } from '@/lib/ai/vertex-client'
import { getCircuitBreakerStatus } from '@/lib/trading/circuit-breaker'

// Escanea el mercado y compra automáticamente si encuentra oportunidades
export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization')
    if (process.env.NODE_ENV === 'production' && process.env.CRON_SECRET) {
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
    }

    const supabase = await createClient()
    const results: any[] = []

    try {
        console.log('[ScanOpportunities] Iniciando escaneo del mercado argentino...')

        // 1. Obtener configuración
        const { data: config } = await supabase
            .from('trading_config')
            .select('*')
            .limit(1)
            .maybeSingle()

        if (!config?.iol_username || !config?.iol_password) {
            return NextResponse.json({ error: 'IOL not configured' }, { status: 400 })
        }

        if (!config.auto_execute) {
            console.log('[ScanOpportunities] Auto-trading deshabilitado')
            return NextResponse.json({
                success: true,
                message: 'Auto-trading disabled',
                scanned: 0
            })
        }

        const circuitBreakerStatus = await getCircuitBreakerStatus()
        if (circuitBreakerStatus.isTradingPaused) {
            console.log(`[ScanOpportunities] 🛑 Circuit Breaker activado: ${circuitBreakerStatus.pauseReason}`)
            return NextResponse.json({
                success: true,
                message: 'Trading paused by circuit breaker',
                pausedReason: circuitBreakerStatus.pauseReason,
                pausedUntil: circuitBreakerStatus.pauseUntil,
                scanned: 0
            })
        }

        console.log(`[ScanOpportunities] Circuit Breaker OK - ${circuitBreakerStatus.consecutiveLosses} consecutive losses, ${circuitBreakerStatus.dailyLossPct.toFixed(2)}% daily loss`)

        // 2. Obtener portfolio para calcular límites
        const iol = createIOLClient(config.iol_username, config.iol_password, false)
        const portfolio = await iol.getPortfolio()
        const portfolioValue = portfolio?.total || 0
        const maxPositionValue = portfolioValue * 0.2 // Máximo 20% por posición

        // 3. Obtener posiciones actuales
        const { data: openPositions } = await supabase
            .from('active_positions')
            .select('symbol')
            .eq('status', 'open')
            .eq('user_id', '00000000-0000-0000-0000-000000000001')

        const currentSymbols = openPositions?.map(p => p.symbol) || []

        // 4. Escanear acciones populares que no tenemos
        const watchlist = ['GGAL', 'YPF', 'YPFD', 'PAMP', 'BMA', 'BBAR', 'SUPV', 'TXAR', 'ALUA', 'TECO2']
        const toAnalyze = watchlist.filter(s => !currentSymbols.includes(s))

        console.log(`[ScanOpportunities] Analizando ${toAnalyze.length} activos...`)

        for (const symbol of toAnalyze.slice(0, 3)) { // Máximo 3 por ejecución
            try {
                const quote = await iol.getQuote(symbol)
                if (!quote) continue

                // Crear datos de mercado para el análisis
                const marketData = {
                    symbol,
                    price: quote.ultimoPrecio,
                    change: quote.variacion,
                    changePercent: quote.variacionPorcentual,
                    high: quote.maximo,
                    low: quote.minimo,
                    volume: quote.volumen,
                    previousClose: quote.apertura
                }

                // Analizar con IA
                const analysis = await generateTradeAnalysis(
                    symbol,
                    'stock',
                    marketData,
                    config.risk_profile || 'moderate',
                    80 // wellness score default
                )

                console.log(`[ScanOpportunities] ${symbol}: ${analysis.decision} (${analysis.confidence}%)`)

                // Solo comprar si confianza >= 75% y es BUY
                if (analysis.decision === 'BUY' && analysis.confidence >= 75) {
                    const entryPrice = quote.ultimoPrecio
                    const quantity = Math.floor(maxPositionValue / entryPrice)

                    if (quantity > 0 && entryPrice * quantity <= maxPositionValue) {
                        console.log(`[ScanOpportunities] 🟢 AUTO-COMPRA: ${symbol} x${quantity} @ $${entryPrice}`)

                        // Ejecutar compra
                        try {
                            await iol.placeBuyOrder(symbol, quantity, entryPrice)

                            // Registrar posición
                            await supabase.from('active_positions').insert({
                                user_id: '00000000-0000-0000-0000-000000000001',
                                symbol,
                                exchange: 'iol',
                                entry_price: entryPrice,
                                quantity,
                                stop_loss_pct: 5,
                                take_profit_pct: 10,
                                trailing_stop_pct: 5,
                                highest_price: entryPrice,
                                status: 'open'
                            })

                            // Notificar
                            await supabase.from('notifications').insert({
                                user_id: '00000000-0000-0000-0000-000000000001',
                                type: 'trade_executed',
                                title: `AUTO-COMPRA: ${symbol}`,
                                message: `Compra automática: ${quantity} acciones @ $${entryPrice.toFixed(2)}. Confianza: ${analysis.confidence}%. Stop-loss: -5%. Take-profit: +10%.`,
                                read: false
                            })

                            results.push({
                                symbol,
                                action: 'BUY',
                                quantity,
                                price: entryPrice,
                                confidence: analysis.confidence,
                                reasoning: analysis.reasoning
                            })
                        } catch (buyError: any) {
                            console.error(`[ScanOpportunities] Error comprando ${symbol}:`, buyError)
                        }
                    }
                }
            } catch (err) {
                console.error(`[ScanOpportunities] Error analizando ${symbol}:`, err)
            }
        }

        console.log(`[ScanOpportunities] Escaneo completado. ${results.length} compras ejecutadas.`)

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            scanned: toAnalyze.length,
            purchased: results.length,
            details: results
        })
    } catch (error: any) {
        console.error('[ScanOpportunities] Error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
