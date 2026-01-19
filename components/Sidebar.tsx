'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', icon: 'dashboard', label: 'Panel' },
    { href: '/trading', icon: 'candlestick_chart', label: 'Trades' },
    { href: '/analytics', icon: 'monitoring', label: 'Analítica' },
    { href: '/activity', icon: 'history', label: 'Timeline' },
    { href: '/chat', icon: 'chat', label: 'Chat IA' },
    { href: '/wellness', icon: 'self_improvement', label: 'Bienestar' },
  ]

  return (
    <aside className="w-64 h-full bg-[#101010] border-r border-border-dark flex flex-col justify-between shrink-0 z-20">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-black flex items-center justify-center border border-primary/30 shadow-[0_0_15px_-3px_rgba(0,122,122,0.4)]">
            <span className="material-symbols-outlined text-white" style={{ fontSize: '24px' }}>
              psychology
            </span>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight">Thomas</h1>
            <p className="text-xs text-gray-400 font-medium">Asistente Pro</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                  ? 'bg-primary/10 border border-primary/20 text-white'
                  : 'hover:bg-white/5 text-gray-400 hover:text-white'
                  }`}
              >
                <span className={`material-symbols-outlined ${isActive ? 'text-primary group-hover:text-white' : ''} transition-colors`}>
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="p-6">
        <div className="flex flex-col gap-1 border-t border-border-dark pt-4">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all"
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="text-sm font-medium">Configuración</span>
          </Link>
          <div className="flex items-center gap-3 px-4 py-3 mt-2 rounded-lg bg-surface-dark border border-border-dark">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center text-xs font-bold text-white">
              D
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">Daniel</span>
              <span className="text-[10px] text-gray-400">Propietario</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
