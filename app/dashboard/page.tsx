'use client'

import { useState, useEffect } from 'react'
import { getDashboardStats, getPendingDecisions, getRecentTrades, getDetailedPortfolio } from '@/actions/trading'
import { getWellnessData } from '@/actions/wellness'
import { getAnthropometryData } from '@/actions/anthropometry'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [decisions, setDecisions] = useState<any[]>([])
  const [trades, setTrades] = useState<any[]>([])
  const [wellness, setWellness] = useState<any>(null)
  const [anthropometry, setAnthropometry] = useState<any>(null)
  const [portfolioAssets, setPortfolioAssets] = useState<any[]>([])

  const currentDate = new Date().toLocaleDateString('es-AR', { weekday: 'long', month: 'long', day: 'numeric' })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [statsData, decisionsData, tradesData, wellnessData, anthropometryData, portfolioData] = await Promise.all([
        getDashboardStats(),
        getPendingDecisions(),
        getRecentTrades(),
        getWellnessData(),
        getAnthropometryData(),
        getDetailedPortfolio()
      ])
      setStats(statsData)
      setDecisions(decisionsData.decisions || [])
      setTrades(tradesData.trades || [])
      setWellness(wellnessData)
      setAnthropometry(anthropometryData)
      setPortfolioAssets(portfolioData.assets || [])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getWellnessState = (score: number) => {
    if (score >= 85) return { state: 'Flujo Máximo', color: 'text-emerald-500' }
    if (score >= 70) return { state: 'Bueno', color: 'text-primary' }
    if (score >= 50) return { state: 'Moderado', color: 'text-yellow-500' }
    return { state: 'Bajo', color: 'text-red-500' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <LoadingSpinner />
      </div>
    )
  }

  const wellnessState = wellness ? getWellnessState(wellness.score || 0) : { state: 'Cargando...', color: 'text-gray-400' }

  // Calcular composición por tipo de activo
  const assetDistribution = portfolioAssets.reduce((acc: any, asset: any) => {
    const type = (asset.assetType === 'Cash' || asset.assetType === 'Efectivo') ? 'Liquidez' : (asset.assetType || 'Otros')
    if (!acc[type]) acc[type] = 0
    acc[type] += asset.totalValue || 0
    return acc
  }, {})

  const totalPortfolioValue = Object.values(assetDistribution).reduce((a: any, b: any) => a + b, 0) as number
  const distributionArray = Object.entries(assetDistribution)
    .map(([name, value]) => ({
      name,
      value: value as number,
      percentage: totalPortfolioValue > 0 ? ((value as number) / totalPortfolioValue) * 100 : 0
    }))
    .sort((a, b) => b.value - a.value)

  const availableCash = portfolioAssets
    .filter(a => a.assetType === 'Cash')
    .reduce((sum, a) => sum + (a.totalValue || 0), 0)

  const colors = ['bg-primary', 'bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500']

  return (
    <>
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none z-0"></div>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Resumen del Dashboard</h2>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Mercado Abierto
            </span>
            <span className="text-gray-600">|</span>
            <span>{currentDate}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {anthropometry && (
            <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-surface-dark border border-border-dark rounded-xl">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Bio-Perfil</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-bold text-white">{anthropometry.weight} kg</span>
                  <span className="text-[10px] text-emerald-500">{anthropometry.body_fat_percentage}% Grasa</span>
                </div>
              </div>
              <div className="w-px h-8 bg-border-dark"></div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Cintura</span>
                <span className="text-sm font-bold text-white">{anthropometry.waist} cm</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 bg-surface-dark border border-border-dark p-2 pr-6 rounded-full">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
                <path className="text-gray-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"></path>
                <path className={wellnessState.color} d={`M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831`} fill="none" stroke="currentColor" strokeDasharray={`${wellness?.score || 0}, 100`} strokeWidth="4"></path>
              </svg>
              <span className="absolute text-[10px] font-bold">{wellness?.score || 0}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">Wellness Score</span>
              <span className={`text-[10px] ${wellnessState.color}`}>{wellnessState.state}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-surface-dark border border-border-dark hover:border-primary/30 transition-colors group">
          <div className="flex justify-between items-start mb-2">
            <p className="text-gray-400 text-sm font-medium">Patrimonio Total</p>
            <span className="material-symbols-outlined text-gray-600 group-hover:text-primary transition-colors text-lg">account_balance_wallet</span>
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight mb-1">${totalPortfolioValue?.toFixed(2) || '0.00'}</h3>
          <div className={`flex items-center gap-1 text-xs font-medium ${stats?.portfolioChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            <span className="material-symbols-outlined text-sm">{stats?.portfolioChange >= 0 ? 'trending_up' : 'trending_down'}</span>
            <span>{stats?.portfolioChange >= 0 ? '+' : ''}{stats?.portfolioChange?.toFixed(2) || '0.00'}%</span>
            <span className="text-gray-500 ml-1">vs ayer</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-surface-dark border border-border-dark hover:border-primary/30 transition-colors group">
          <div className="flex justify-between items-start mb-2">
            <p className="text-gray-400 text-sm font-medium">Dinero Disponible</p>
            <span className="material-symbols-outlined text-gray-600 group-hover:text-primary transition-colors text-lg">account_balance</span>
          </div>
          <h3 className="text-2xl font-bold text-emerald-500 tracking-tight mb-1">${availableCash?.toFixed(2) || '0.00'}</h3>
          <div className="flex items-center gap-1 text-gray-400 text-[10px] font-medium uppercase tracking-wider">
            <span>Listo para operar</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-surface-dark border border-border-dark hover:border-primary/30 transition-colors group">
          <div className="flex justify-between items-start mb-2">
            <p className="text-gray-400 text-sm font-medium">P&L Diario</p>
            <span className="material-symbols-outlined text-gray-600 group-hover:text-primary transition-colors text-lg">payments</span>
          </div>
          <h3 className={`text-2xl font-bold tracking-tight mb-1 ${stats?.dailyPnL >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {stats?.dailyPnL >= 0 ? '+' : ''}${stats?.dailyPnL?.toFixed(2) || '0.00'}
          </h3>
          <div className={`flex items-center gap-1 text-xs font-medium ${stats?.dailyPnLPercentage >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            <span className="material-symbols-outlined text-sm">{stats?.dailyPnLPercentage >= 0 ? 'trending_up' : 'trending_down'}</span>
            <span>{stats?.dailyPnLPercentage >= 0 ? '+' : ''}{stats?.dailyPnLPercentage?.toFixed(2) || '0.00'}%</span>
            <span className="text-gray-500 ml-1">retorno diario</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-surface-dark border border-border-dark hover:border-primary/30 transition-colors group">
          <div className="flex justify-between items-start mb-2">
            <p className="text-gray-400 text-sm font-medium">Trades Activos</p>
            <span className="material-symbols-outlined text-gray-600 group-hover:text-primary transition-colors text-lg">bolt</span>
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight mb-1">{stats?.activeTrades || 0}</h3>
          <div className="flex items-center gap-1 text-gray-400 text-xs font-medium">
            <span>{stats?.longTrades || 0} Long, {stats?.shortTrades || 0} Short</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-surface-dark border border-border-dark hover:border-primary/30 transition-colors group">
          <div className="flex justify-between items-start mb-2">
            <p className="text-gray-400 text-sm font-medium">Tasa de Éxito</p>
            <span className="material-symbols-outlined text-gray-600 group-hover:text-primary transition-colors text-lg">trophy</span>
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight mb-1">{stats?.winRate || 0}%</h3>
          <div className={`flex items-center gap-1 text-xs font-medium ${stats?.winRateChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            <span className="material-symbols-outlined text-sm">{stats?.winRateChange >= 0 ? 'arrow_upward' : 'arrow_downward'}</span>
            <span>{stats?.winRateChange >= 0 ? '+' : ''}{stats?.winRateChange || 0}%</span>
            <span className="text-gray-500 ml-1">últimos 30 días</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-3 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Sugerencias de IA Pendientes</h3>
            <button className="text-xs text-primary hover:text-white transition-colors flex items-center gap-1">
              Ver Historial <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          {decisions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No hay sugerencias de IA pendientes
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {decisions.map((decision) => (
                <div key={decision.id} className={`p-5 rounded-xl border flex flex-col sm:flex-row gap-5 relative overflow-hidden group ${decision.ai_analysis?.confidence > 80 ? 'bg-surface-light border-primary/30 ai-glow' : 'bg-surface-dark border-border-dark hover:border-gray-600 transition-colors'}`}>
                  <div className="flex-1 flex flex-col justify-between gap-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${decision.asset_type === 'crypto' ? 'bg-[#f7931a]/20' : decision.asset_type === 'stock' ? 'bg-blue-500/20' : 'bg-purple-500/20'}`}>
                          <span className={`material-symbols-outlined ${decision.asset_type === 'crypto' ? 'text-[#f7931a]' : decision.asset_type === 'stock' ? 'text-blue-500' : 'text-purple-500'}`}>
                            {decision.asset_type === 'crypto' ? 'currency_bitcoin' : decision.asset_type === 'stock' ? 'show_chart' : 'token'}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white">{decision.asset_symbol}</h4>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${decision.decision_type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                              {decision.decision_type === 'BUY' ? 'Long' : 'Short'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">Entry: ${decision.suggested_price?.toFixed(2) || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-2xl font-bold text-primary">{decision.ai_analysis?.confidence || 0}%</span>
                        <span className="text-[10px] text-gray-500 uppercase font-semibold">Confianza</span>
                      </div>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-primary text-sm mt-0.5">auto_awesome</span>
                        <p className="text-sm text-gray-300 leading-relaxed"><span className="text-primary font-semibold">Lógica:</span> {decision.ai_analysis?.reasoning || 'Sin análisis disponible'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="xl:col-span-3 grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 p-6 rounded-xl bg-surface-dark border border-border-dark flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Rendimiento</h3>
              <p className="text-xs text-gray-400">Ganancia Neta Últimos 30 Días</p>
            </div>
            <div className="flex bg-black/30 rounded-lg p-1">
              <button className="px-3 py-1 text-xs font-medium text-white bg-primary/20 rounded">30D</button>
              <button className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-white transition-colors">1S</button>
              <button className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-white transition-colors">1A</button>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-around h-full gap-8">
            {/* Gráfico SVG Simple */}
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                {distributionArray.reduce((acc: any[], item, idx) => {
                  const prevTotal = acc.length > 0 ? acc[acc.length - 1].total : 0
                  acc.push({ ...item, offset: prevTotal, total: prevTotal + item.percentage })
                  return acc
                }, []).map((item, idx) => (
                  <circle
                    key={idx}
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="none"
                    className={`stroke-current ${idx === 0 ? 'text-primary' : idx === 1 ? 'text-emerald-500' : idx === 2 ? 'text-blue-500' : 'text-purple-500'}`}
                    strokeWidth="3"
                    strokeDasharray={`${item.percentage} ${100 - item.percentage}`}
                    strokeDashoffset={-item.offset}
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Total</span>
                <span className="text-sm font-bold text-white">${totalPortfolioValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            </div>

            {/* Leyenda */}
            <div className="flex flex-col gap-3 min-w-[150px]">
              {distributionArray.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-primary' : idx === 1 ? 'bg-emerald-500' : idx === 2 ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                    <span className="text-xs text-gray-300 font-medium">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-white">{item.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="xl:col-span-1 p-0 rounded-xl bg-surface-dark border border-border-dark flex flex-col overflow-hidden h-[400px]">
          <div className="p-6 pb-4 border-b border-border-dark flex justify-between items-center bg-surface-dark">
            <h3 className="text-lg font-bold text-white">Inventario (IOL)</h3>
            <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded font-bold">REAL TIME</span>
          </div>
          <div className="overflow-y-auto flex-1 p-2">
            {portfolioAssets.filter(a => a.exchange === 'iol').length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No hay activos en IOL
              </div>
            ) : (
              <table className="w-full text-left text-sm border-separate border-spacing-y-1">
                <thead className="text-xs text-gray-500 font-medium">
                  <tr>
                    <th className="px-4 py-2 font-medium">Activo</th>
                    <th className="px-4 py-2 font-medium">Cant.</th>
                    <th className="px-4 py-2 font-medium text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {portfolioAssets.filter(a => a.exchange === 'iol').map((asset, idx) => (
                    <tr key={idx} className="group">
                      <td className="px-4 py-3 bg-white/[0.02] group-hover:bg-white/[0.04] rounded-l-lg transition-colors border-l-2 border-transparent group-hover:border-primary">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{asset.symbol}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 bg-white/[0.02] group-hover:bg-white/[0.04] transition-colors text-gray-300">
                        {asset.quantity}
                      </td>
                      <td className="px-4 py-3 bg-white/[0.02] group-hover:bg-white/[0.04] rounded-r-lg transition-colors text-right font-bold text-white">
                        ${asset.totalValue?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
