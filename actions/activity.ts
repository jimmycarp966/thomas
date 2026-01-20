'use server'

import { createClient } from '@/lib/supabase/server'

export type ActivityEvent = {
    id: string
    type: 'trade' | 'decision' | 'learning' | 'notification' | 'chat'
    title: string
    description: string
    timestamp: string
    metadata: any
    icon: string
    color: string
}

/**
 * Obtiene un feed unificado de actividad de Thomas.
 * Combina trades, decisiones de trading, aprendizajes y notificaciones.
 */
export async function getActivityFeed(limit: number = 50): Promise<{ events: ActivityEvent[] }> {
    const supabase = await createClient()

    try {
        // Obtener trades
        const { data: trades } = await supabase
            .from('trades')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit)

        // Obtener decisiones de trading
        const { data: decisions } = await supabase
            .from('trading_decisions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit)

        // Obtener aprendizajes de la IA
        const { data: learnings } = await supabase
            .from('ai_learnings')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit)

        // Obtener notificaciones
        const { data: notifications } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit)

        // Obtener mensajes del chat
        const { data: chatMessages } = await supabase
            .from('chat_messages')
            .select(`
                *,
                chat_conversations (
                    title
                )
            `)
            .order('created_at', { ascending: false })
            .limit(limit)

        // Mapear a formato unificado
        const events: ActivityEvent[] = []

        // Trades
        trades?.forEach((trade) => {
            events.push({
                id: trade.id,
                type: 'trade',
                title: `${trade.trade_type === 'BUY' ? 'Compra' : 'Venta'} de ${trade.asset_symbol}`,
                description: `${trade.quantity} unidades a $${trade.price?.toFixed(2)} en ${trade.exchange.toUpperCase()}`,
                timestamp: trade.created_at,
                metadata: trade,
                icon: trade.trade_type === 'BUY' ? 'trending_up' : 'trending_down',
                color: trade.trade_type === 'BUY' ? 'text-emerald-500' : 'text-red-500',
            })
        })

        // Decisiones
        decisions?.forEach((decision) => {
            events.push({
                id: decision.id,
                type: 'decision',
                title: `Análisis: ${decision.decision_type} ${decision.asset_symbol}`,
                description: decision.ai_analysis?.reasoning?.slice(0, 100) + '...' || 'Sin detalles',
                timestamp: decision.created_at,
                metadata: decision,
                icon: 'auto_awesome',
                color: 'text-primary',
            })
        })

        // Aprendizajes
        learnings?.forEach((learning) => {
            const typeLabels: Record<string, string> = {
                success_pattern: 'Patrón de Éxito',
                failure_pattern: 'Patrón de Fallo',
                market_insight: 'Insight de Mercado',
                user_preference: 'Preferencia del Usuario',
            }
            events.push({
                id: learning.id,
                type: 'learning',
                title: `🧠 ${typeLabels[learning.learning_type] || 'Aprendizaje'}`,
                description: learning.content?.summary || JSON.stringify(learning.content).slice(0, 80),
                timestamp: learning.created_at,
                metadata: learning,
                icon: 'psychology',
                color: 'text-purple-500',
            })
        })

        // Notificaciones
        notifications?.forEach((notif) => {
            events.push({
                id: notif.id,
                type: 'notification',
                title: notif.title,
                description: notif.message,
                timestamp: notif.created_at,
                metadata: notif,
                icon: 'notifications',
                color: notif.read ? 'text-gray-400' : 'text-yellow-500',
            })
        })

        // Mensajes del chat
        chatMessages?.forEach((msg: any) => {
            const isUser = msg.role === 'user'
            const conversationTitle = (msg.chat_conversations as any)?.title || 'Nueva conversación'
            events.push({
                id: msg.id,
                type: 'chat',
                title: isUser ? `💬 Tú: ${conversationTitle}` : `🤖 Thomas: ${conversationTitle}`,
                description: msg.content?.slice(0, 100) + (msg.content?.length > 100 ? '...' : ''),
                timestamp: msg.created_at,
                metadata: msg,
                icon: isUser ? 'person' : 'smart_toy',
                color: isUser ? 'text-blue-500' : 'text-primary',
            })
        })

        // Ordenar por timestamp descendente
        events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

        return { events: events.slice(0, limit) }
    } catch (error) {
        console.error('Error fetching activity feed:', error)
        return { events: [] }
    }
}
