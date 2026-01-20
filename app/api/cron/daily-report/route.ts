import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createIOLClient } from '@/lib/trading/iol-client'

// Genera un reporte diario del portfolio y operaciones
export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization')
    if (process.env.NODE_ENV === 'production' && process.env.CRON_SECRET) {
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
    }

    const supabase = await createClient()
    const userId = '00000000-0000-0000-0000-000000000001'

    try {
        console.log('[DailyReport] Generando reporte diario...')

        // 1. Obtener configuración y portfolio
        const { data: config } = await supabase
            .from('trading_config')
            .select('iol_username, iol_password')
            .limit(1)
            .maybeSingle()

        let portfolioValue = 0
        let portfolioChange = 0

        if (config?.iol_username && config?.iol_password) {
            const iol = createIOLClient(config.iol_username, config.iol_password, false)
            const portfolio = await iol.getPortfolio()
            portfolioValue = portfolio?.total || 0
            portfolioChange = portfolio?.variacionDiaria || 0
        }

        // 2. Obtener operaciones del día
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const { data: todayTrades } = await supabase
            .from('active_positions')
            .select('*')
            .gte('created_at', today.toISOString())
            .eq('user_id', userId)

        const { data: closedToday } = await supabase
            .from('active_positions')
            .select('*')
            .gte('closed_at', today.toISOString())
            .eq('user_id', userId)
            .eq('status', 'closed')

        // 3. Obtener posiciones abiertas
        const { data: openPositions } = await supabase
            .from('active_positions')
            .select('*')
            .eq('status', 'open')
            .eq('user_id', userId)

        // 4. Calcular P&L del día
        const todayPnL = closedToday?.reduce((sum, p) => sum + (Number(p.pnl) || 0), 0) || 0

        // 5. Construir mensaje del reporte
        let reportMessage = `📊 **REPORTE DIARIO DE THOMAS**\n`
        reportMessage += `Fecha: ${new Date().toLocaleDateString('es-AR')}\n\n`

        reportMessage += `💰 **PORTFOLIO**\n`
        reportMessage += `- Valor total: $${portfolioValue.toFixed(2)}\n`
        reportMessage += `- Cambio del día: ${portfolioChange >= 0 ? '+' : ''}${portfolioChange.toFixed(2)}%\n\n`

        reportMessage += `📈 **ACTIVIDAD DEL DÍA**\n`
        reportMessage += `- Compras ejecutadas: ${todayTrades?.length || 0}\n`
        reportMessage += `- Posiciones cerradas: ${closedToday?.length || 0}\n`
        reportMessage += `- P&L del día: $${todayPnL >= 0 ? '+' : ''}${todayPnL.toFixed(2)}\n\n`

        if (openPositions && openPositions.length > 0) {
            reportMessage += `📍 **POSICIONES ABIERTAS (${openPositions.length})**\n`
            for (const pos of openPositions) {
                const stopPrice = Number(pos.entry_price) * (1 - Number(pos.stop_loss_pct) / 100)
                const tpPrice = Number(pos.entry_price) * (1 + Number(pos.take_profit_pct) / 100)
                reportMessage += `- ${pos.symbol}: ${pos.quantity} @ $${Number(pos.entry_price).toFixed(2)}\n`
                reportMessage += `  Stop: $${stopPrice.toFixed(2)} | TP: $${tpPrice.toFixed(2)}\n`
            }
        } else {
            reportMessage += `📍 No hay posiciones abiertas actualmente.\n`
        }

        // 6. Guardar notificación con el reporte
        await supabase.from('notifications').insert({
            user_id: userId,
            type: 'daily_report',
            title: '📊 Reporte Diario',
            message: reportMessage,
            read: false
        })

        // 7. Guardar en chat para que Thomas "recuerde" el reporte
        await supabase.from('chat_messages').insert({
            conversation_id: null, // Sin conversación específica
            user_id: userId,
            role: 'assistant',
            content: reportMessage
        })

        console.log('[DailyReport] Reporte generado y guardado.')

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            report: {
                portfolioValue,
                portfolioChange,
                todayBuys: todayTrades?.length || 0,
                todaySells: closedToday?.length || 0,
                todayPnL,
                openPositions: openPositions?.length || 0
            }
        })
    } catch (error: any) {
        console.error('[DailyReport] Error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
