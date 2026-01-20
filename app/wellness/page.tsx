'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getWellnessData, saveWellnessData } from '@/actions/wellness'
import LoadingSpinner from '@/components/LoadingSpinner'
import AnthropometryForm from '@/components/AnthropometryForm'
import DietPlanView from '@/components/wellness/DietPlanView'
import WorkoutPlanView from '@/components/wellness/WorkoutPlanView'

export default function WellnessPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [fastingHours, setFastingHours] = useState(0)
  const [weight, setWeight] = useState(0)
  const [mood, setMood] = useState(5)
  const [energy, setEnergy] = useState(5)
  const [sleep, setSleep] = useState(8)
  const [sleepQuality, setSleepQuality] = useState(5)
  const [exerciseMinutes, setExerciseMinutes] = useState(0)
  const [exerciseIntensity, setExerciseIntensity] = useState<'SEDENTARY' | 'MODERATE' | 'HIGH'>('SEDENTARY')
  const [wellnessScore, setWellnessScore] = useState(0)
  const [activeTab, setActiveTab] = useState<'general' | 'anthropometry' | 'nutrition'>('general')

  useEffect(() => {
    loadWellnessData()
  }, [])

  const loadWellnessData = async () => {
    try {
      const data = await getWellnessData()
      setFastingHours(data.fasting_hours || 0)
      setWeight(data.weight || 0)
      setMood(data.mood || 5)
      setEnergy(data.energy || 5)
      setSleep(data.sleep || 8)
      setSleepQuality(data.sleep_quality || 5)
      setExerciseMinutes(data.exercise_minutes || 0)
      setExerciseIntensity(data.exercise_intensity || 'SEDENTARY')
      setWellnessScore(data.score || 0)
    } catch (error) {
      console.error('Error loading wellness data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateWellnessScore = () => {
    let score = 0

    // 1. Ayuno (Max 20 pts)
    if (fastingHours >= 16) score += 20
    else if (fastingHours >= 12) score += 15
    else if (fastingHours >= 8) score += 10

    // 2. Estado & Energía (Max 25 pts)
    score += (mood / 10) * 12.5
    score += (energy / 10) * 12.5

    // 3. Sueño Pro (Max 20 pts)
    const sleepPoints = (sleep >= 7 && sleep <= 9) ? 12 : (sleep >= 6) ? 8 : 4
    const qualityPoints = (sleepQuality / 10) * 8
    score += sleepPoints + qualityPoints

    // 4. Actividad (Max 25 pts)
    let activityScore = (exerciseMinutes / 60) * 15
    if (exerciseIntensity === 'HIGH') activityScore *= 1.5
    else if (exerciseIntensity === 'MODERATE') activityScore *= 1.2
    score += Math.min(activityScore, 25)

    // 5. Peso/Bio Bonus (Simplificado en frontal)
    if (weight > 0) score += 10

    setWellnessScore(Math.min(Math.round(score), 100))
  }

  useEffect(() => {
    calculateWellnessScore()
  }, [fastingHours, mood, energy, sleep, sleepQuality, weight, exerciseMinutes, exerciseIntensity])

  const getWellnessState = () => {
    if (wellnessScore >= 85) return { state: 'Flujo Máximo', color: 'text-emerald-500', bg: 'bg-emerald-500/20' }
    if (wellnessScore >= 70) return { state: 'Bueno', color: 'text-primary', bg: 'bg-primary/20' }
    if (wellnessScore >= 50) return { state: 'Moderado', color: 'text-yellow-500', bg: 'bg-yellow-500/20' }
    return { state: 'Bajo', color: 'text-red-500', bg: 'bg-red-500/20' }
  }

  const handleSave = async (isAutoSave = false) => {
    if (isAutoSave) {
      setAutoSaving(true)
    } else {
      setSaving(true)
    }
    try {
      const formData = new FormData()
      formData.append('fasting_hours', fastingHours.toString())
      formData.append('mood', mood.toString())
      formData.append('energy', energy.toString())
      formData.append('sleep', sleep.toString())
      formData.append('sleep_quality', sleepQuality.toString())
      formData.append('weight', weight.toString())
      formData.append('exercise_minutes', exerciseMinutes.toString())
      formData.append('exercise_intensity', exerciseIntensity)

      await saveWellnessData(formData)
      setLastSaved(new Date())
    } catch (error) {
      console.error('Error saving wellness data:', error)
    } finally {
      if (isAutoSave) {
        setAutoSaving(false)
      } else {
        setSaving(false)
      }
    }
  }

  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveTimeoutRef.current = setTimeout(() => {
      handleSave(true)
    }, 2000)
  }, [fastingHours, mood, energy, sleep, sleepQuality, weight, exerciseMinutes, exerciseIntensity])

  useEffect(() => {
    if (!loading) {
      debouncedSave()
    }
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [fastingHours, mood, energy, sleep, sleepQuality, weight, exerciseMinutes, exerciseIntensity, loading, debouncedSave])

  const wellnessState = getWellnessState()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Salud y Rendimiento</h2>
          <p className="text-gray-400">Optimiza tu bio-ritmo para alcanzar el máximo desempeño en Thomas</p>
        </div>
        <div className="flex items-center gap-2">
          {autoSaving && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              <span>Guardando automáticamente...</span>
            </div>
          )}
          {lastSaved && !autoSaving && (
            <div className="flex items-center gap-2 text-xs text-emerald-500">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span>Guardado: {lastSaved.toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      </header>

      <div className="flex gap-4 border-b border-border-dark mb-2">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-4 px-2 text-sm font-medium transition-all relative ${activeTab === 'general' ? 'text-primary' : 'text-gray-400 hover:text-white'
            }`}
        >
          Bienestar General
          {activeTab === 'general' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        </button>
        <button
          onClick={() => setActiveTab('anthropometry')}
          className={`pb-4 px-2 text-sm font-medium transition-all relative ${activeTab === 'anthropometry' ? 'text-primary' : 'text-gray-400 hover:text-white'
            }`}
        >
          Perfil Biométrico
          {activeTab === 'anthropometry' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        </button>
        <button
          onClick={() => setActiveTab('nutrition')}
          className={`pb-4 px-2 text-sm font-medium transition-all relative ${activeTab === 'nutrition' ? 'text-primary' : 'text-gray-400 hover:text-white'
            }`}
        >
          Dieta y Entrenamiento
          {activeTab === 'nutrition' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        </button>
      </div>

      {activeTab === 'general' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-surface-dark border-border-dark">
              <CardHeader>
                <CardTitle className="text-white text-lg">Puntuación de Bienestar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-4">
                  <div className="relative w-24 h-24">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path className="text-gray-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"></path>
                      <path className={wellnessState.color} d={`M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831`} fill="none" stroke="currentColor" strokeDasharray={`${wellnessScore}, 100`} strokeWidth="4"></path>
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">
                      {wellnessScore}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-sm font-bold ${wellnessState.color}`}>{wellnessState.state}</span>
                    <span className="text-xs text-gray-400">Estado Mental</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-surface-dark border-border-dark">
              <CardHeader>
                <CardTitle className="text-white text-lg">Ayuno</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Horas de Ayuno</label>
                  <Input
                    type="number"
                    value={fastingHours}
                    onChange={(e) => setFastingHours(parseInt(e.target.value) || 0)}
                    className="bg-black/20 border-border-dark text-white"
                  />
                </div>
                <div className="text-xs text-gray-500">
                  {fastingHours >= 16 ? '🔥 Ventana de ayuno óptima' : fastingHours >= 8 ? '✓ Buen progreso' : '¡Sigue así!'}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-surface-dark border-border-dark">
              <CardHeader>
                <CardTitle className="text-white text-lg">Ánimo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Nivel de Ánimo: {mood}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={mood}
                    onChange={(e) => setMood(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>😔</span>
                  <span>😐</span>
                  <span>😊</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-surface-dark border-border-dark">
              <CardHeader>
                <CardTitle className="text-white text-lg">Energía</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Nivel de Energía: {energy}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={energy}
                    onChange={(e) => setEnergy(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>😴</span>
                  <span>⚡</span>
                  <span>🔥</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-surface-dark border-border-dark overflow-hidden group">
              <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-red-500" />
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg flex items-center justify-between">
                  Ejercicio
                  <span className="text-orange-500 text-xs font-mono">STRENGTH & FLOW</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Minutos Activos</label>
                  <Input
                    type="number"
                    value={exerciseMinutes}
                    onChange={(e) => setExerciseMinutes(parseInt(e.target.value) || 0)}
                    className="bg-black/20 border-border-dark text-white text-xl font-bold"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block text-center">Intensidad</label>
                  <div className="flex gap-2">
                    {['SEDENTARY', 'MODERATE', 'HIGH'].map((intensity) => (
                      <button
                        key={intensity}
                        onClick={() => setExerciseIntensity(intensity as any)}
                        className={`flex-1 py-2 rounded-md text-[10px] font-bold transition-all ${exerciseIntensity === intensity
                          ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20'
                          : 'bg-black/40 text-gray-500 hover:text-gray-300'
                          }`}
                      >
                        {intensity}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-surface-dark border-border-dark overflow-hidden group">
              <div className="h-1 w-full bg-gradient-to-r from-blue-600 to-indigo-600" />
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg flex items-center justify-between">
                  Sueño de Calidad
                  <span className="text-indigo-400 text-xs font-mono">RECOVERY</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-sm text-gray-400 mb-2 block">Horas</label>
                    <Input
                      type="number"
                      value={sleep}
                      onChange={(e) => setSleep(parseFloat(e.target.value) || 0)}
                      step="0.5"
                      className="bg-black/20 border-border-dark text-white font-bold"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm text-gray-400 mb-2 block text-center">Calidad: {sleepQuality}/10</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={sleepQuality}
                      onChange={(e) => setSleepQuality(parseInt(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                </div>
                <div className={`text-[10px] p-2 rounded-md text-center italic ${sleep >= 7 && sleepQuality >= 7 ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20' : 'bg-black/20 text-gray-500'}`}>
                  {sleep >= 7 && sleepQuality >= 7 ? '✨ Regeneración neuronal completa activada' : '⚠️ El sistema requiere mas descanso'}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-surface-dark border-border-dark overflow-hidden relative">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg">Estado Circadiano</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center pt-2">
                  <div className="text-4xl mb-2">
                    {new Date().getHours() < 12 ? '🌅' : new Date().getHours() < 17 ? '☀️' : new Date().getHours() < 21 ? '🌇' : '🌙'}
                  </div>
                  <div className="text-xl font-bold text-white uppercase tracking-widest italic">
                    {new Date().getHours() < 12 ? 'Dawn (Focus)' : new Date().getHours() < 17 ? 'Peak (Execution)' : new Date().getHours() < 21 ? 'Trough (Recovery)' : 'Sleep (Repair)'}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 text-center">
                    {new Date().getHours() < 12 ? 'Ventana ideal para análisis técnico complejo.' : new Date().getHours() < 17 ? 'Máximo desempeño para ejecución y trades.' : 'Fase de asimilación y reducción de luz azul.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-surface-dark border-border-dark">
            <CardHeader>
              <CardTitle className="text-white text-lg">Consejos de Bienestar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-black/20 rounded-lg">
                  <h4 className="font-bold text-white mb-2">🧠 Claridad Mental</h4>
                  <p className="text-sm text-gray-400">
                    Ayunar por 16+ horas puede mejorar el enfoque y la toma de decisiones para el trading.
                  </p>
                </div>
                <div className="p-4 bg-black/20 rounded-lg">
                  <h4 className="font-bold text-white mb-2">😴 Calidad del Sueño</h4>
                  <p className="text-sm text-gray-400">
                    7-9 horas de sueño son cruciales para un rendimiento cognitivo óptimo.
                  </p>
                </div>
                <div className="p-4 bg-black/20 rounded-lg">
                  <h4 className="font-bold text-white mb-2">⚡ Gestión de Energía</h4>
                  <p className="text-sm text-gray-400">
                    Rastrea tus niveles de energía para identificar patrones y optimizar tu horario de trading.
                  </p>
                </div>
                <div className="p-4 bg-black/20 rounded-lg">
                  <h4 className="font-bold text-white mb-2">😊 Conciencia del Ánimo</h4>
                  <p className="text-sm text-gray-400">
                    Evita operar cuando te sientas estresado o emocionalmente inestable.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center mt-4">
            <div className="text-xs text-gray-500">
              Los datos se guardan automáticamente cada 2 segundos
            </div>
            <Button onClick={() => handleSave(false)} disabled={saving} className="bg-primary hover:bg-primary-dark">
              {saving ? 'Guardando...' : 'Guardar Ahora'}
            </Button>
          </div>
        </div>
      ) : activeTab === 'anthropometry' ? (
        <AnthropometryForm />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="xl:col-span-3 space-y-6">
            <DietPlanView />
          </div>
          <div className="xl:col-span-1">
            <WorkoutPlanView />
          </div>
        </div>
      )}
    </div>
  )
}
