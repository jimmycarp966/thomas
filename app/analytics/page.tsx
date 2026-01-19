'use client'

import { useState, useEffect } from 'react'
import { getRecentTrades, getActiveTrades } from '@/actions/trading'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [trades, setTrades] = useState<any[]>([])
  const [activeTrades, setActiveTrades] = useState<any[]>([])

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const [recentData, activeData] = await Promise.all([
        getRecentTrades(),
        getActiveTrades()
      ])
      setTrades(recentData.trades || [])
      setActiveTrades(activeData.trades || [])
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = () => {
    const closedTrades = trades.filter(t => t.trade_results?.status !== 'open')
    const winningTrades = closedTrades.filter(t => t.trade_results?.pnl_percentage > 0)
    const losingTrades = closedTrades.filter(t => t.trade_results?.pnl_percentage < 0)
    
    const totalPnL = closedTrades.reduce((sum, t) => sum + (t.trade_results?.pnl_amount || 0), 0)
    const winRate = closedTrades.length > 0 ? Math.round((winningTrades.length / closedTrades.length) * 100) : 0
    
    const avgWin = winningTrades.length > 0 
      ? winningTrades.reduce((sum, t) => sum + (t.trade_results?.pnl_amount || 0), 0) / winningTrades.length 
      : 0
    
    const avgLoss = losingTrades.length > 0 
      ? losingTrades.reduce((sum, t) => sum + (t.trade_results?.pnl_amount || 0), 0) / losingTrades.length 
      : 0

    return {
      totalTrades: closedTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      totalPnL,
      winRate,
      avgWin,
      avgLoss,
      profitFactor: avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : 0
    }
  }

  const stats = calculateStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Analytics</h2>
        <p className="text-gray-400">Análisis detallado de tu rendimiento de trading</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-surface-dark border-border-dark">
          <CardHeader>
            <CardTitle className="text-white text-lg">Total de Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.totalTrades}</div>
            <div className="text-sm text-gray-400 mt-1">
              {stats.winningTrades} ganadores, {stats.losingTrades} perdedores
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-dark border-border-dark">
          <CardHeader>
            <CardTitle className="text-white text-lg">P&L Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${stats.totalPnL >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {stats.totalPnL >= 0 ? '+' : ''}${stats.totalPnL.toFixed(2)}
            </div>
            <div className="text-sm text-gray-400 mt-1">Ganancia/Pérdida neta</div>
          </CardContent>
        </Card>

        <Card className="bg-surface-dark border-border-dark">
          <CardHeader>
            <CardTitle className="text-white text-lg">Tasa de Éxito</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.winRate}%</div>
            <div className="text-sm text-gray-400 mt-1">Porcentaje de trades ganadores</div>
          </CardContent>
        </Card>

        <Card className="bg-surface-dark border-border-dark">
          <CardHeader>
            <CardTitle className="text-white text-lg">Factor de Beneficio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.profitFactor.toFixed(2)}</div>
            <div className="text-sm text-gray-400 mt-1">Ganancia promedio / Pérdida promedio</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-surface-dark border-border-dark">
          <CardHeader>
            <CardTitle className="text-white">Estadísticas de Ganancias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Ganancia Promedio</span>
                <span className={`font-semibold ${stats.avgWin >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  ${stats.avgWin.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Pérdida Promedio</span>
                <span className={`font-semibold ${stats.avgLoss >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  ${stats.avgLoss.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-dark border-border-dark">
          <CardHeader>
            <CardTitle className="text-white">Trades Activos</CardTitle>
          </CardHeader>
          <CardContent>
            {activeTrades.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No hay trades activos
              </div>
            ) : (
              <div className="space-y-3">
                {activeTrades.map((trade) => (
                  <div key={trade.id} className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                    <div>
                      <div className="font-bold text-white">{trade.asset_symbol}</div>
                      <div className="text-xs text-gray-400">
                        {trade.trade_type === 'BUY' ? 'Compra' : 'Venta'} @ ${trade.price?.toFixed(2)}
                      </div>
                    </div>
                    <div className={`text-sm font-semibold ${trade.trade_results?.pnl_percentage >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {trade.trade_results?.pnl_percentage ? `${trade.trade_results.pnl_percentage.toFixed(2)}%` : '0%'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-surface-dark border-border-dark">
        <CardHeader>
          <CardTitle className="text-white">Historial de Trades</CardTitle>
        </CardHeader>
        <CardContent>
          {trades.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No hay trades registrados
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-border-dark">
                    <th className="pb-3">Activo</th>
                    <th className="pb-3">Tipo</th>
                    <th className="pb-3">Precio</th>
                    <th className="pb-3">Cantidad</th>
                    <th className="pb-3">P&L</th>
                    <th className="pb-3">Estado</th>
                    <th className="pb-3">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade) => (
                    <tr key={trade.id} className="border-b border-border-dark/50">
                      <td className="py-3 text-white font-medium">{trade.asset_symbol}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          trade.trade_type === 'BUY' 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {trade.trade_type === 'BUY' ? 'Compra' : 'Venta'}
                        </span>
                      </td>
                      <td className="py-3 text-gray-300">${trade.price?.toFixed(2)}</td>
                      <td className="py-3 text-gray-300">{trade.quantity}</td>
                      <td className={`py-3 font-semibold ${
                        trade.trade_results?.pnl_percentage >= 0 ? 'text-emerald-500' : 'text-red-500'
                      }`}>
                        {trade.trade_results?.pnl_percentage 
                          ? `${trade.trade_results.pnl_percentage.toFixed(2)}%` 
                          : '-'}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          trade.status === 'executed' 
                            ? 'bg-primary/20 text-primary' 
                            : 'bg-gray-700/50 text-gray-400'
                        }`}>
                          {trade.status === 'executed' ? 'Ejecutado' : trade.status}
                        </span>
                      </td>
                      <td className="py-3 text-gray-400">
                        {new Date(trade.created_at).toLocaleDateString('es-AR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
