'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getActiveDiet, generateWeeklyDiet } from '@/actions/health.actions'
import LoadingSpinner from '@/components/LoadingSpinner'
import { ChefHat, Flame, Brain, Sparkles, ChevronRight, ChevronLeft, Info } from 'lucide-react'

export default function DietPlanView() {
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [diet, setDiet] = useState<any>(null)
    const [activeDay, setActiveDay] = useState('monday')

    const days = [
        { id: 'monday', label: 'L' },
        { id: 'tuesday', label: 'M' },
        { id: 'wednesday', label: 'Mi' },
        { id: 'thursday', label: 'J' },
        { id: 'friday', label: 'V' },
        { id: 'saturday', label: 'S' },
        { id: 'sunday', label: 'D' }
    ]

    useEffect(() => {
        loadDiet()
    }, [])

    const loadDiet = async () => {
        setLoading(true)
        const data = await getActiveDiet()
        if (data) setDiet(data)
        setLoading(false)
    }

    const handleGenerate = async () => {
        setGenerating(true)
        const result = await generateWeeklyDiet()
        if (result.success) {
            setDiet(result.data)
        } else {
            alert(result.error || 'Error al generar la dieta')
        }
        setGenerating(false)
    }

    if (loading) return <LoadingSpinner />

    if (!diet) {
        return (
            <Card className="bg-surface-dark border-border-dark border-dashed border-2 py-12">
                <CardContent className="flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                        <ChefHat size={40} className="text-primary" />
                    </div>
                    <div className="max-w-md">
                        <h3 className="text-xl font-bold text-white mb-2">Tu Plan de Bio-Nutrition está listo</h3>
                        <p className="text-gray-400 text-sm">
                            Thomas usará tus datos biométricos actuales para diseñar una dieta semanal optimizada para tu claridad mental y quema de grasa.
                        </p>
                    </div>
                    <Button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="bg-primary hover:bg-primary-dark text-white font-bold px-8 h-12 rounded-full"
                    >
                        {generating ? 'IA Analizando Datos...' : 'Generar Mi Plan Thomas'}
                    </Button>
                </CardContent>
            </Card>
        )
    }

    const currentDayMeals = diet.meals[activeDay] || {}

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Bento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="md:col-span-2 bg-surface-dark border-border-dark overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Sparkles size={120} className="text-primary" />
                    </div>
                    <CardHeader className="pb-2">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Plan Activo de Bio-Rendimiento</p>
                        <CardTitle className="text-2xl font-black text-white">{diet.plan_name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4 mt-2">
                            <div className="flex items-center gap-2 bg-black/40 p-2 px-3 rounded-lg border border-border-dark/50">
                                <Flame size={16} className="text-orange-500" />
                                <div>
                                    <p className="text-[9px] text-gray-500 uppercase font-bold">Calorías Obj.</p>
                                    <p className="text-sm font-bold text-white">{diet.calories_target} kcal</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-black/40 p-2 px-3 rounded-lg border border-border-dark/50">
                                <Brain size={16} className="text-blue-400" />
                                <div>
                                    <p className="text-[9px] text-gray-500 uppercase font-bold">Foco Cognitivo</p>
                                    <p className="text-sm font-bold text-white">Máximo</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-primary/5 border-primary/20 flex flex-col justify-center p-6 text-center">
                    <p className="text-xs text-primary font-bold uppercase mb-2">Macros Diarios</p>
                    <div className="flex justify-around items-end h-16 gap-2">
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-4 bg-primary/40 rounded-t-sm" style={{ height: '80%' }}></div>
                            <span className="text-[9px] text-gray-400">P: {diet.macros_target?.protein}g</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-4 bg-primary/20 rounded-t-sm" style={{ height: '60%' }}></div>
                            <span className="text-[9px] text-gray-400">C: {diet.macros_target?.carbs}g</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-4 bg-primary/10 rounded-t-sm" style={{ height: '40%' }}></div>
                            <span className="text-[9px] text-gray-400">G: {diet.macros_target?.fats}g</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Selector de Días */}
            <div className="flex justify-between items-center bg-surface-dark border border-border-dark p-1 rounded-xl">
                {days.map((day) => (
                    <button
                        key={day.id}
                        onClick={() => setActiveDay(day.id)}
                        className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all ${activeDay === day.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        {day.label}
                    </button>
                ))}
            </div>

            {/* Meals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['breakfast', 'lunch', 'snack', 'dinner'].map((mealKey) => {
                    const meal = currentDayMeals[mealKey] || {}
                    const icons: any = {
                        breakfast: 'coffee',
                        lunch: 'restaurant',
                        snack: 'bolt',
                        dinner: 'nights_stay'
                    }
                    const labels: any = {
                        breakfast: 'Desayuno',
                        lunch: 'Almuerzo',
                        snack: 'Merienda / Snack Trading',
                        dinner: 'Cena'
                    }

                    return (
                        <Card key={mealKey} className="bg-surface-dark border-border-dark hover:border-primary/50 transition-colors group">
                            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-lg">{icons[mealKey]}</span>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{labels[mealKey]}</span>
                                </div>
                                <div className="text-[10px] text-gray-500 font-mono">
                                    {meal.calories} kcal | {meal.p}P {meal.c}C {meal.f}G
                                </div>
                            </CardHeader>
                            <CardContent>
                                <h4 className="text-lg font-bold text-white mb-1">{meal.name}</h4>
                                <p className="text-xs text-gray-400 line-clamp-2 italic">{meal.description}</p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <div className="flex gap-4 justify-between items-center text-[10px] text-gray-500 border-t border-border-dark/50 pt-4">
                <div className="flex items-center gap-1">
                    <Info size={12} /> Sugerencia: Planifica tus comidas antes de iniciar tu sesión de trading.
                </div>
                <Button variant="ghost" size="sm" onClick={handleGenerate} className="text-[10px] text-primary hover:bg-primary/10">
                    Regenerar Plan Completo
                </Button>
            </div>
        </div>
    )
}
