'use client'

import { useState, useEffect, useCallback } from 'react'
import { executeTrade, getActiveTrades, getRecentTrades } from '@/actions/trading'
import { syncIOLTrades, getLastSyncTime } from '@/actions/sync'
import { getLiveQuotes, QuoteData } from '@/actions/quotes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function TradingPage() {
  const [symbol, setSymbol] = useState('')
  const [assetType, setAssetType] = useState<'crypto' | 'stock' | 'cedear'>('crypto')
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [activeTrades, setActiveTrades] = useState<any[]>([])
  const [recentTrades, setRecentTrades] = useState<any[]>([])
  const [quotes, setQuotes] = useState<QuoteData[]>([])
  const [loadingQuotes, setLoadingQuotes] = useState(true)

  useEffect(() => {
    loadTrades()
    loadLastSync()
    loadQuotes()

    // Auto-refresh quotes cada 30 segundos
    const interval = setInterval(loadQuotes, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadQuotes = useCallback(async () => {
    try {
      const { quotes: q } = await getLiveQuotes()
      setQuotes(q)
    } catch (error) {
      console.error('Error loading quotes:', error)
    } finally {
      setLoadingQuotes(false)
    }
  }, [])

  const loadLastSync = async () => {
    const { lastSync: ls } = await getLastSyncTime()
    setLastSync(ls)
  }

  const handleSyncIOL = async () => {
    setSyncing(true)
    try {
      const result = await syncIOLTrades()
      if (result.success) {
        alert(`¡Sincronizado! ${result.synced} nuevos trades de ${result.total} encontrados.`)
        await loadTrades()
        await loadLastSync()
      } else {
        alert(result.error || 'Error al sincronizar')
      }
    } catch (error) {
      console.error('Error syncing IOL:', error)
    } finally {
      setSyncing(false)
    }
  }

  const handleExecuteTrade = async () => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('decisionId', '1')
      formData.append('exchange', assetType === 'crypto' ? 'binance' : 'iol')
      await executeTrade(formData)
      await loadTrades()
    } catch (error) {
      console.error('Error executing trade:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTrades = async () => {
    const active = await getActiveTrades()
    const recent = await getRecentTrades()
    setActiveTrades(active.trades || [])
    setRecentTrades(recent.trades || [])
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Trading</h2>
          <p className="text-gray-400">Ejecuta y gestiona tus trades</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-gray-500">
            Última sincronización: {lastSync ? new Date(lastSync).toLocaleString('es-AR') : 'Nunca'}
          </div>
          <Button
            onClick={handleSyncIOL}
            disabled={syncing}
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-white"
          >
            <span className="material-symbols-outlined text-sm mr-1">{syncing ? 'sync' : 'cloud_sync'}</span>
            {syncing ? 'Sincronizando...' : 'Sincronizar IOL'}
          </Button>
        </div>
      </header>

      {/* Cotizaciones en Tiempo Real */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* IOL - Mercado Argentino */}
        <Card className="bg-surface-dark border-border-dark">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500">flag</span>
                Mercado Argentino (IOL)
              </CardTitle>
              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-bold">LIVE</span>
            </div>
          </CardHeader>
          <CardContent>
            {loadingQuotes ? (
              <div className="text-center py-4 text-gray-500">Cargando cotizaciones...</div>
            ) : quotes.filter(q => q.exchange === 'iol').length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <span className="material-symbols-outlined text-2xl mb-2">link_off</span>
                <p className="text-xs">Configura IOL en Ajustes para ver cotizaciones</p>
              </div>
            ) : (
              <div className="space-y-2">
                {quotes.filter(q => q.exchange === 'iol').map((quote) => (
                  <div key={quote.symbol} className="flex items-center justify-between p-3 bg-black/20 rounded-lg hover:bg-black/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-400">{quote.symbol.slice(0, 2)}</span>
                      </div>
                      <div>
                        <span className="font-bold text-white text-sm">{quote.symbol}</span>
                        <span className="text-[10px] text-gray-500 ml-2">{quote.assetType}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white">${quote.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
                      <div className={`text-xs font-medium ${quote.changePercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {quote.changePercent >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Binance - Crypto */}
        <Card className="bg-surface-dark border-border-dark">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#f7931a]">currency_bitcoin</span>
                Crypto (Binance)
              </CardTitle>
              <span className="text-[10px] bg-[#f7931a]/20 text-[#f7931a] px-2 py-0.5 rounded font-bold">LIVE</span>
            </div>
          </CardHeader>
          <CardContent>
            {loadingQuotes ? (
              <div className="text-center py-4 text-gray-500">Cargando cotizaciones...</div>
            ) : quotes.filter(q => q.exchange === 'binance').length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <span className="material-symbols-outlined text-2xl mb-2">link_off</span>
                <p className="text-xs">Configura Binance en Ajustes para ver cotizaciones</p>
              </div>
            ) : (
              <div className="space-y-2">
                {quotes.filter(q => q.exchange === 'binance').map((quote) => (
                  <div key={quote.symbol} className="flex items-center justify-between p-3 bg-black/20 rounded-lg hover:bg-black/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#f7931a]/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-[#f7931a]">{quote.symbol.slice(0, 3)}</span>
                      </div>
                      <div>
                        <span className="font-bold text-white text-sm">{quote.symbol}</span>
                        <span className="text-[10px] text-gray-500 ml-2">USDT</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white">${quote.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                      <div className={`text-xs font-medium ${quote.changePercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {quote.changePercent >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-surface-dark border-border-dark">
          <CardHeader>
            <CardTitle className="text-white">Nuevo Trade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Tipo de Activo</label>
              <select
                value={assetType}
                onChange={(e) => setAssetType(e.target.value as any)}
                className="w-full bg-black/20 border border-border-dark rounded-lg px-3 py-2 text-white"
              >
                <option value="crypto">Crypto</option>
                <option value="stock">Stock</option>
                <option value="cedear">CEDEAR</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Símbolo</label>
              <Input
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder={assetType === 'crypto' ? 'BTC/USDT' : 'AAPL'}
                className="bg-black/20 border-border-dark text-white"
              />
            </div>
            <Button
              onClick={handleExecuteTrade}
              disabled={loading || !symbol}
              className="w-full bg-primary hover:bg-primary-dark"
            >
              {loading ? 'Ejecutando...' : 'Ejecutar Trade'}
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 bg-surface-dark border-border-dark">
          <CardHeader>
            <CardTitle className="text-white">Trades Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-400">Símbolo</TableHead>
                  <TableHead className="text-gray-400">Tipo</TableHead>
                  <TableHead className="text-gray-400">Precio</TableHead>
                  <TableHead className="text-gray-400">P&L</TableHead>
                  <TableHead className="text-gray-400">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeTrades.map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell className="text-white">{trade.asset_symbol}</TableCell>
                    <TableCell>
                      <Badge variant={trade.trade_type === 'BUY' ? 'default' : 'destructive'}>
                        {trade.trade_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white">${trade.price?.toFixed(2)}</TableCell>
                    <TableCell className={trade.trade_results?.pnl_percentage >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                      {trade.trade_results?.pnl_percentage?.toFixed(2)}%
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{trade.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {activeTrades.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                      No hay trades activos
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-surface-dark border-border-dark">
        <CardHeader>
          <CardTitle className="text-white">Trades Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-400">Símbolo</TableHead>
                <TableHead className="text-gray-400">Tipo</TableHead>
                <TableHead className="text-gray-400">Precio</TableHead>
                <TableHead className="text-gray-400">Cantidad</TableHead>
                <TableHead className="text-gray-400">P&L</TableHead>
                <TableHead className="text-gray-400">Estado</TableHead>
                <TableHead className="text-gray-400">Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTrades.map((trade) => (
                <TableRow key={trade.id}>
                  <TableCell className="text-white">{trade.asset_symbol}</TableCell>
                  <TableCell>
                    <Badge variant={trade.trade_type === 'BUY' ? 'default' : 'destructive'}>
                      {trade.trade_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white">${trade.price?.toFixed(2)}</TableCell>
                  <TableCell className="text-white">{trade.quantity}</TableCell>
                  <TableCell className={trade.trade_results?.pnl_percentage >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                    {trade.trade_results?.pnl_percentage ? `${trade.trade_results.pnl_percentage.toFixed(2)}%` : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{trade.status}</Badge>
                  </TableCell>
                  <TableCell className="text-gray-400">
                    {new Date(trade.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {recentTrades.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                    No hay trades recientes
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
