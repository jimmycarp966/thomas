import { createClient } from '@/lib/supabase/server'
import { createIOLClient } from '@/lib/trading/iol-client'

interface Position {
    id: string
    user_id: string
    symbol: string
    exchange: string
    entry_price: number
    quantity: number
    stop_loss_pct: number
    take_profit_pct: number
    trailing_stop_pct: number
    highest_price: number | null
}

interface MonitorResult {
    positionId: string
    symbol: string
    action: 'none' | 'stop_loss' | 'take_profit' | 'trailing_stop'
    currentPrice: number
    pnl?: number
}

export async function monitorPositions(): Promise<MonitorResult[]> {
    const supabase = await createClient()
    const results: MonitorResult[] = []

    console.log('[PositionMonitor] Iniciando monitoreo de posiciones...')

    // 1. Obtener configuración de IOL
    const { data: config } = await supabase
        .from('trading_config')
        .select('iol_username, iol_password')
        .limit(1)
        .maybeSingle()

    if (!config?.iol_username || !config?.iol_password) {
        console.log('[PositionMonitor] No hay credenciales de IOL configuradas')
        return results
    }

    // 2. Obtener posiciones abiertas
    const { data: positions, error } = await supabase
        .from('active_positions')
        .select('*')
        .eq('status', 'open')

    if (error || !positions || positions.length === 0) {
        console.log('[PositionMonitor] No hay posiciones abiertas')
        return results
    }

    console.log(`[PositionMonitor] Monitoreando ${positions.length} posiciones...`)

    // 3. Crear cliente IOL
    const iol = createIOLClient(config.iol_username, config.iol_password, false)

    // 4. Para cada posición, verificar stops
    for (const pos of positions as Position[]) {
        try {
            const quote = await iol.getQuote(pos.symbol)
            if (!quote?.ultimoPrecio) continue

            const currentPrice = quote.ultimoPrecio
            const entryPrice = Number(pos.entry_price)
            const stopLossPct = Number(pos.stop_loss_pct) / 100
            const takeProfitPct = Number(pos.take_profit_pct) / 100
            const trailingStopPct = Number(pos.trailing_stop_pct) / 100
            const highestPrice = pos.highest_price ? Number(pos.highest_price) : entryPrice

            let action: MonitorResult['action'] = 'none'
            let closePrice = currentPrice
            let pnl = 0

            // Calcular precios de activación
            const stopLossPrice = entryPrice * (1 - stopLossPct)
            const takeProfitPrice = entryPrice * (1 + takeProfitPct)
            const trailingStopPrice = highestPrice * (1 - trailingStopPct)

            // Actualizar highest_price si el precio subió
            if (currentPrice > highestPrice) {
                await supabase
                    .from('active_positions')
                    .update({ highest_price: currentPrice })
                    .eq('id', pos.id)
            }

            // Verificar condiciones de venta
            if (currentPrice <= stopLossPrice) {
                action = 'stop_loss'
                pnl = (currentPrice - entryPrice) * Number(pos.quantity)
                console.log(`[PositionMonitor] 🔴 STOP LOSS activado para ${pos.symbol} @ $${currentPrice}`)
            } else if (currentPrice >= takeProfitPrice) {
                action = 'take_profit'
                pnl = (currentPrice - entryPrice) * Number(pos.quantity)
                console.log(`[PositionMonitor] 🟢 TAKE PROFIT alcanzado para ${pos.symbol} @ $${currentPrice}`)
            } else if (currentPrice <= trailingStopPrice && currentPrice > stopLossPrice) {
                action = 'trailing_stop'
                pnl = (currentPrice - entryPrice) * Number(pos.quantity)
                console.log(`[PositionMonitor] 🟡 TRAILING STOP activado para ${pos.symbol} @ $${currentPrice}`)
            }

            // Si hay acción, cerrar posición
            if (action !== 'none') {
                await supabase
                    .from('active_positions')
                    .update({
                        status: 'closed',
                        closed_at: new Date().toISOString(),
                        close_reason: action,
                        close_price: closePrice,
                        pnl: pnl
                    })
                    .eq('id', pos.id)

                // Ejecutar venta en IOL
                try {
                    await iol.placeSellOrder(pos.symbol, Number(pos.quantity), currentPrice)
                    console.log(`[PositionMonitor] Orden de venta ejecutada para ${pos.symbol}`)
                } catch (sellError) {
                    console.error(`[PositionMonitor] Error al vender ${pos.symbol}:`, sellError)
                }

                // Crear notificación
                await supabase.from('notifications').insert({
                    user_id: pos.user_id,
                    type: 'trade_alert',
                    title: `${action.replace('_', ' ').toUpperCase()} - ${pos.symbol}`,
                    message: `Posición cerrada @ $${currentPrice.toFixed(2)}. P&L: $${pnl.toFixed(2)}`,
                    read: false
                })
            }

            results.push({
                positionId: pos.id,
                symbol: pos.symbol,
                action,
                currentPrice,
                pnl: action !== 'none' ? pnl : undefined
            })
        } catch (err) {
            console.error(`[PositionMonitor] Error monitoreando ${pos.symbol}:`, err)
        }
    }

    console.log(`[PositionMonitor] Monitoreo completado. ${results.filter(r => r.action !== 'none').length} acciones ejecutadas.`)
    return results
}
