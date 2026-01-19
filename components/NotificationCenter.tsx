'use client'

import { useState, useRef, useEffect } from 'react'
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications'
import { markAsRead, markAllAsRead } from '@/actions/notifications'

export default function NotificationCenter() {
    const { notifications, unreadCount, loading, refresh } = useRealtimeNotifications()
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleMarkAsRead = async (id: string) => {
        await markAsRead(id)
        refresh()
    }

    const handleMarkAllAsRead = async () => {
        await markAllAsRead()
        refresh()
    }

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)

        if (minutes < 1) return 'Ahora'
        if (minutes < 60) return `${minutes}m`
        if (hours < 24) return `${hours}h`
        return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'trade_executed':
                return 'swap_horiz'
            case 'trade_suggestion':
                return 'auto_awesome'
            case 'trade_result':
                return 'trending_up'
            case 'wellness_reminder':
                return 'self_improvement'
            default:
                return 'notifications'
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Botón del icono */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
            >
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 max-h-[70vh] bg-surface-dark border border-border-dark rounded-xl shadow-2xl overflow-hidden z-50">
                    {/* Header */}
                    <div className="p-4 border-b border-border-dark flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">Notificaciones</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs text-primary hover:text-white transition-colors"
                            >
                                Marcar todo como leído
                            </button>
                        )}
                    </div>

                    {/* Lista */}
                    <div className="overflow-y-auto max-h-[50vh]">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">
                                <span className="material-symbols-outlined animate-spin">sync</span>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <span className="material-symbols-outlined text-3xl mb-2">notifications_off</span>
                                <p className="text-xs">Sin notificaciones</p>
                            </div>
                        ) : (
                            notifications.slice(0, 10).map((notif) => (
                                <div
                                    key={notif.id}
                                    onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                                    className={`p-4 border-b border-border-dark/50 hover:bg-white/[0.02] cursor-pointer transition-colors ${!notif.read ? 'bg-primary/5' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${notif.read ? 'bg-gray-700' : 'bg-primary/20'
                                                }`}
                                        >
                                            <span
                                                className={`material-symbols-outlined text-sm ${notif.read ? 'text-gray-400' : 'text-primary'
                                                    }`}
                                            >
                                                {getIcon(notif.type)}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4
                                                    className={`text-xs font-medium line-clamp-1 ${notif.read ? 'text-gray-400' : 'text-white'
                                                        }`}
                                                >
                                                    {notif.title}
                                                </h4>
                                                <span className="text-[10px] text-gray-500 whitespace-nowrap">
                                                    {formatTime(notif.created_at)}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">{notif.message}</p>
                                        </div>
                                        {!notif.read && (
                                            <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1"></div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-border-dark">
                            <a
                                href="/activity"
                                className="block text-center text-xs text-primary hover:text-white transition-colors"
                            >
                                Ver toda la actividad →
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
