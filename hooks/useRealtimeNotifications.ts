'use client'

import { useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { getNotifications, getUnreadCount } from '@/actions/notifications'

type Notification = {
    id: string
    type: string
    title: string
    message: string
    read: boolean
    created_at: string
    metadata: any
}

export function useRealtimeNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(true)

    // Cargar notificaciones iniciales
    const loadNotifications = useCallback(async () => {
        try {
            const [notifResult, countResult] = await Promise.all([
                getNotifications(20),
                getUnreadCount(),
            ])
            setNotifications(notifResult.notifications || [])
            setUnreadCount(countResult.count || 0)
        } catch (error) {
            console.error('Error loading notifications:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadNotifications()

        // Crear cliente de Supabase para el browser
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // Suscribirse a cambios en la tabla notifications
        const channel = supabase
            .channel('notifications-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                },
                (payload) => {
                    console.log('🔔 Nueva notificación:', payload.new)
                    const newNotification = payload.new as Notification
                    setNotifications((prev) => [newNotification, ...prev])
                    setUnreadCount((prev) => prev + 1)
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'notifications',
                },
                (payload) => {
                    const updated = payload.new as Notification
                    setNotifications((prev) =>
                        prev.map((n) => (n.id === updated.id ? updated : n))
                    )
                    // Recalcular unread count
                    loadNotifications()
                }
            )
            .subscribe()

        // Cleanup
        return () => {
            supabase.removeChannel(channel)
        }
    }, [loadNotifications])

    return {
        notifications,
        unreadCount,
        loading,
        refresh: loadNotifications,
    }
}
