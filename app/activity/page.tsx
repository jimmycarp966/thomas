'use client'

import { useState, useEffect } from 'react'
import { getActivityFeed, ActivityEvent } from '@/actions/activity'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function ActivityPage() {
    const [loading, setLoading] = useState(true)
    const [events, setEvents] = useState<ActivityEvent[]>([])
    const [filter, setFilter] = useState<'all' | 'trade' | 'decision' | 'learning' | 'notification' | 'chat'>('all')

    useEffect(() => {
        loadActivity()
    }, [])

    const loadActivity = async () => {
        try {
            const { events: activityEvents } = await getActivityFeed(100)
            setEvents(activityEvents)
        } catch (error) {
            console.error('Error loading activity:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredEvents = filter === 'all' ? events : events.filter((e) => e.type === filter)

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (minutes < 1) return 'Ahora mismo'
        if (minutes < 60) return `Hace ${minutes}m`
        if (hours < 24) return `Hace ${hours}h`
        if (days < 7) return `Hace ${days}d`
        return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                <LoadingSpinner />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            <header>
                <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Timeline de Thomas</h2>
                <p className="text-gray-400">Historial completo de actividad, análisis y aprendizajes</p>
            </header>

            {/* Filtros */}
            <div className="flex flex-wrap gap-2">
                {[
                    { key: 'all', label: 'Todo', icon: 'apps' },
                    { key: 'trade', label: 'Trades', icon: 'swap_horiz' },
                    { key: 'decision', label: 'Análisis', icon: 'auto_awesome' },
                    { key: 'learning', label: 'Aprendizajes', icon: 'psychology' },
                    { key: 'notification', label: 'Alertas', icon: 'notifications' },
                    { key: 'chat', label: 'Chat', icon: 'chat' },
                ].map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key as any)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter === f.key
                                ? 'bg-primary text-white'
                                : 'bg-surface-dark border border-border-dark text-gray-400 hover:text-white hover:border-gray-500'
                            }`}
                    >
                        <span className="material-symbols-outlined text-sm">{f.icon}</span>
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Timeline */}
            <div className="relative">
                {/* Línea vertical */}
                <div className="absolute left-4 top-0 bottom-0 w-px bg-border-dark"></div>

                {filteredEvents.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <span className="material-symbols-outlined text-4xl mb-2">history</span>
                        <p>No hay actividad registrada</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredEvents.map((event, idx) => (
                            <div key={event.id} className="relative pl-10 group">
                                {/* Punto en la línea */}
                                <div
                                    className={`absolute left-2 top-3 w-4 h-4 rounded-full border-2 border-background-dark ${event.type === 'trade'
                                            ? 'bg-emerald-500'
                                            : event.type === 'decision'
                                                ? 'bg-primary'
                                                : event.type === 'learning'
                                                    ? 'bg-purple-500'
                                                    : event.type === 'chat'
                                                        ? 'bg-blue-500'
                                                        : 'bg-yellow-500'
                                        }`}
                                ></div>

                                {/* Card del evento */}
                                <div className="p-4 rounded-xl bg-surface-dark border border-border-dark hover:border-gray-600 transition-all group-hover:translate-x-1">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center ${event.type === 'trade'
                                                        ? 'bg-emerald-500/20'
                                                        : event.type === 'decision'
                                                            ? 'bg-primary/20'
                                                            : event.type === 'learning'
                                                                ? 'bg-purple-500/20'
                                                                : event.type === 'chat'
                                                                    ? 'bg-blue-500/20'
                                                                    : 'bg-yellow-500/20'
                                                    }`}
                                            >
                                                <span className={`material-symbols-outlined text-lg ${event.color}`}>
                                                    {event.icon}
                                                </span>
                                            </div>
                                            <div>
                                                <h4 className="text-white font-medium text-sm">{event.title}</h4>
                                                <p className="text-gray-400 text-xs mt-0.5 line-clamp-2">{event.description}</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-gray-500 whitespace-nowrap">{formatTime(event.timestamp)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
