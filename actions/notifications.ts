'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type NotificationType = 'trade_suggestion' | 'trade_executed' | 'trade_result' | 'wellness_reminder' | 'system'

/**
 * Crea una nueva notificación en la base de datos.
 */
export async function createNotification(
    type: NotificationType,
    title: string,
    message: string,
    metadata?: any,
    userId?: string
) {
    const supabase = await createClient()

    try {
        // Obtener user_id si no se proporciona
        let finalUserId = userId
        if (!finalUserId) {
            const { data: config } = await supabase
                .from('trading_config')
                .select('user_id')
                .limit(1)
                .maybeSingle()
            finalUserId = config?.user_id || '00000000-0000-0000-0000-000000000001'
        }

        const { data, error } = await supabase
            .from('notifications')
            .insert({
                user_id: finalUserId,
                type,
                title,
                message,
                metadata,
                read: false,
            })
            .select()
            .single()

        if (error) throw error

        return { notification: data }
    } catch (error) {
        console.error('Error creating notification:', error)
        return { error: 'Failed to create notification' }
    }
}

/**
 * Obtiene todas las notificaciones del usuario.
 */
export async function getNotifications(limit: number = 20) {
    const supabase = await createClient()

    try {
        const { data: notifications, error } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) throw error

        return { notifications }
    } catch (error) {
        console.error('Error fetching notifications:', error)
        return { notifications: [] }
    }
}

/**
 * Obtiene el contador de notificaciones no leídas.
 */
export async function getUnreadCount() {
    const supabase = await createClient()

    try {
        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('read', false)

        if (error) throw error

        return { count: count || 0 }
    } catch (error) {
        console.error('Error getting unread count:', error)
        return { count: 0 }
    }
}

/**
 * Marca una notificación como leída.
 */
export async function markAsRead(notificationId: string) {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true, read_at: new Date().toISOString() })
            .eq('id', notificationId)

        if (error) throw error

        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        console.error('Error marking notification as read:', error)
        return { error: 'Failed to mark as read' }
    }
}

/**
 * Marca todas las notificaciones como leídas.
 */
export async function markAllAsRead() {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true, read_at: new Date().toISOString() })
            .eq('read', false)

        if (error) throw error

        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        console.error('Error marking all as read:', error)
        return { error: 'Failed to mark all as read' }
    }
}
