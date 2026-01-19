'use server'

import { createClient } from '@/lib/supabase/server'
import { createIOLClient } from '@/lib/trading/iol-client'
import { revalidatePath } from 'next/cache'

/**
 * Sincroniza el historial de órdenes ejecutadas de IOL con la tabla `trades` de Supabase.
 * Evita duplicados usando `exchange_order_id`.
 */
export async function syncIOLTrades() {
    const supabase = await createClient()

    try {
        // Obtener configuración
        const { data: config } = await supabase
            .from('trading_config')
            .select('*')
            .limit(1)
            .maybeSingle()

        if (!config || (!config.iol_username || !config.iol_password)) {
            return { error: 'IOL no está configurado', synced: 0 }
        }

        const iol = createIOLClient(
            config.iol_username,
            config.iol_password,
            true
        )

        // Obtener historial de órdenes ejecutadas (últimos 30 días)
        const orderHistory = await iol.getOrderHistory()

        if (!orderHistory || !Array.isArray(orderHistory)) {
            return { error: 'No se pudo obtener el historial de IOL', synced: 0 }
        }

        let syncedCount = 0
        const userId = config.user_id

        for (const order of orderHistory) {
            // Verificar si ya existe este trade
            const { data: existing } = await supabase
                .from('trades')
                .select('id')
                .eq('exchange_order_id', order.numero?.toString() || order.id?.toString())
                .maybeSingle()

            if (existing) {
                continue // Ya sincronizado
            }

            // Mapear datos de IOL a nuestra estructura
            const tradeData = {
                user_id: userId,
                exchange: 'iol',
                asset_symbol: order.simbolo || order.titulo?.simbolo || 'UNKNOWN',
                trade_type: order.tipo === 'Compra' ? 'BUY' : 'SELL',
                quantity: order.cantidad || 0,
                price: order.precio || order.precioPromedio || 0,
                total_amount: (order.cantidad || 0) * (order.precio || order.precioPromedio || 0),
                fees: order.aranceles || 0,
                status: order.estado === 'terminada' ? 'executed' : 'pending',
                exchange_order_id: order.numero?.toString() || order.id?.toString(),
                executed_at: order.fechaOrden || new Date().toISOString(),
            }

            const { error: insertError } = await supabase
                .from('trades')
                .insert(tradeData)

            if (!insertError) {
                syncedCount++

                // Crear notificación para el nuevo trade sincronizado
                await supabase.from('notifications').insert({
                    user_id: userId,
                    type: 'trade_executed',
                    title: `Trade Sincronizado: ${tradeData.trade_type} ${tradeData.asset_symbol}`,
                    message: `Se sincronizó una operación de ${tradeData.trade_type === 'BUY' ? 'compra' : 'venta'} de ${tradeData.quantity} ${tradeData.asset_symbol} a $${tradeData.price.toFixed(2)}`,
                    metadata: { trade: tradeData },
                })
            }
        }

        revalidatePath('/trading')
        revalidatePath('/activity')
        revalidatePath('/dashboard')

        return { success: true, synced: syncedCount, total: orderHistory.length }
    } catch (error) {
        console.error('Error syncing IOL trades:', error)
        return { error: 'Error al sincronizar trades de IOL', synced: 0 }
    }
}

/**
 * Obtiene la fecha de la última sincronización de IOL.
 */
export async function getLastSyncTime() {
    const supabase = await createClient()

    try {
        const { data: lastTrade } = await supabase
            .from('trades')
            .select('created_at')
            .eq('exchange', 'iol')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        return { lastSync: lastTrade?.created_at || null }
    } catch (error) {
        console.error('Error getting last sync time:', error)
        return { lastSync: null }
    }
}
