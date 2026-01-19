'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getTradingConfig, updateTradingConfig } from '@/actions/trading'

export default function SettingsPage() {
  const [riskProfile, setRiskProfile] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate')
  const [maxTradeAmount, setMaxTradeAmount] = useState(1000)
  const [stopLossPercentage, setStopLossPercentage] = useState(5)
  const [takeProfitPercentage, setTakeProfitPercentage] = useState(10)
  const [autoExecute, setAutoExecute] = useState(false)
  const [binanceApiKey, setBinanceApiKey] = useState('')
  const [binanceApiSecret, setBinanceApiSecret] = useState('')
  const [iolApiKey, setIolApiKey] = useState('')
  const [iolApiSecret, setIolApiSecret] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const { config } = await getTradingConfig()
      console.log('[Thomas UI Debug] Config cargada:', config)
      if (config) {
        setRiskProfile(config.risk_profile)
        setMaxTradeAmount(config.max_trade_amount)
        setStopLossPercentage(config.stop_loss_percentage)
        setTakeProfitPercentage(config.take_profit_percentage)
        setAutoExecute(config.auto_execute)
        setBinanceApiKey(config.binance_api_key || '')
        setBinanceApiSecret(config.binance_api_secret || '')
        setIolApiKey(config.iol_username || config.iol_api_key || '')
        setIolApiSecret(config.iol_password || config.iol_api_secret || '')
      }
    } catch (error) {
      console.error('Error loading config:', error)
    } finally {
      setFetching(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('risk_profile', riskProfile)
      formData.append('max_trade_amount', maxTradeAmount.toString())
      formData.append('stop_loss_percentage', stopLossPercentage.toString())
      formData.append('take_profit_percentage', takeProfitPercentage.toString())
      formData.append('auto_execute', autoExecute.toString())
      formData.append('binance_api_key', binanceApiKey)
      formData.append('binance_api_secret', binanceApiSecret)
      formData.append('iol_username', iolApiKey)
      formData.append('iol_password', iolApiSecret)

      await updateTradingConfig(formData)
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Configuración</h2>
        <p className="text-gray-400">Configura tus preferencias de trading y conexiones API</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-surface-dark border-border-dark">
          <CardHeader>
            <CardTitle className="text-white">Configuración de Trading</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Perfil de Riesgo</label>
              <select
                value={riskProfile}
                onChange={(e) => setRiskProfile(e.target.value as any)}
                className="w-full bg-black/20 border border-border-dark rounded-lg px-3 py-2 text-white"
              >
                <option value="conservative">Conservador</option>
                <option value="moderate">Moderado</option>
                <option value="aggressive">Agresivo</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Monto Máximo de Trade ($)</label>
              <Input
                type="number"
                value={maxTradeAmount}
                onChange={(e) => setMaxTradeAmount(parseFloat(e.target.value) || 0)}
                className="bg-black/20 border-border-dark text-white"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Stop Loss (%)</label>
              <Input
                type="number"
                value={stopLossPercentage}
                onChange={(e) => setStopLossPercentage(parseFloat(e.target.value) || 0)}
                step="0.5"
                className="bg-black/20 border-border-dark text-white"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Take Profit (%)</label>
              <Input
                type="number"
                value={takeProfitPercentage}
                onChange={(e) => setTakeProfitPercentage(parseFloat(e.target.value) || 0)}
                step="0.5"
                className="bg-black/20 border-border-dark text-white"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-400">Ejecutar Trades Automáticamente</label>
              <button
                onClick={() => setAutoExecute(!autoExecute)}
                className={`w-12 h-6 rounded-full transition-colors ${autoExecute ? 'bg-primary' : 'bg-gray-700'
                  }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${autoExecute ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-dark border-border-dark">
          <CardHeader>
            <CardTitle className="text-white">Configuración de API</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Binance</h3>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">API Key</label>
                <Input
                  type="password"
                  value={binanceApiKey}
                  onChange={(e) => setBinanceApiKey(e.target.value)}
                  placeholder="Ingresa tu API Key de Binance"
                  className="bg-black/20 border-border-dark text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">API Secret</label>
                <Input
                  type="password"
                  value={binanceApiSecret}
                  onChange={(e) => setBinanceApiSecret(e.target.value)}
                  placeholder="Ingresa tu API Secret de Binance"
                  className="bg-black/20 border-border-dark text-white"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">IOL Argentina</h3>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">API Key</label>
                <Input
                  type="password"
                  value={iolApiKey}
                  onChange={(e) => setIolApiKey(e.target.value)}
                  placeholder="Ingresa tu API Key de IOL"
                  className="bg-black/20 border-border-dark text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">API Secret</label>
                <Input
                  type="password"
                  value={iolApiSecret}
                  onChange={(e) => setIolApiSecret(e.target.value)}
                  placeholder="Ingresa tu API Secret de IOL"
                  className="bg-black/20 border-border-dark text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-surface-dark border-border-dark">
        <CardHeader>
          <CardTitle className="text-white">Detalles del Perfil de Riesgo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-black/20 rounded-lg">
              <h4 className="font-bold text-emerald-500 mb-2">Conservador</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Posiciones más pequeñas</li>
                <li>• Stop losses más amplios</li>
                <li>• Relación riesgo/recompensa más baja</li>
                <li>• Menos trades</li>
              </ul>
            </div>
            <div className="p-4 bg-black/20 rounded-lg">
              <h4 className="font-bold text-primary mb-2">Moderado</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Enfoque equilibrado</li>
                <li>• Stop losses estándar</li>
                <li>• Riesgo/recompensa moderado</li>
                <li>• Trading regular</li>
              </ul>
            </div>
            <div className="p-4 bg-black/20 rounded-lg">
              <h4 className="font-bold text-red-500 mb-2">Agresivo</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Posiciones más grandes</li>
                <li>• Stop losses más ajustados</li>
                <li>• Riesgo/recompensa más alto</li>
                <li>• Trades más frecuentes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" className="border-border-dark text-gray-400 hover:text-white">
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={loading} className="bg-primary hover:bg-primary-dark">
          {loading ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </div>
    </div>
  )
}
