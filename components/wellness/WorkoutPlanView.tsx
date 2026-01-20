'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getActiveWorkout, generateWorkoutPlan } from '@/actions/health.actions'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Dumbbell, Trophy, Zap, ListChecks } from 'lucide-react'

export default function WorkoutPlanView() {
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [workout, setWorkout] = useState<any>(null)

    useEffect(() => {
        loadWorkout()
    }, [])

    const loadWorkout = async () => {
        setLoading(true)
        const data = await getActiveWorkout()
        if (data) setWorkout(data)
        setLoading(false)
    }

    const handleGenerate = async () => {
        setGenerating(true)
        const result = await generateWorkoutPlan()
        if (result.success) {
            setWorkout(result.data)
        } else {
            alert(result.error || 'Error al generar el entrenamiento')
        }
        setGenerating(false)
    }

    if (loading) return <LoadingSpinner />

    if (!workout) {
        return (
            <Card className="bg-surface-dark border-border-dark border-dashed border-2 p-6 h-full flex flex-col items-center justify-center text-center">
                <Dumbbell size={32} className="text-gray-600 mb-4" />
                <h3 className="text-sm font-bold text-white mb-2">Entrenamiento de Fuerza</h3>
                <p className="text-[11px] text-gray-500 mb-4">Potencia tu metabolismo para quemar grasa mientras no estás operando.</p>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerate}
                    disabled={generating}
                    className="border-primary text-primary hover:bg-primary/10 text-[10px] font-bold h-8 rounded-full"
                >
                    {generating ? 'Diseñando...' : 'Obtener Rutina'}
                </Button>
            </Card>
        )
    }

    return (
        <Card className="bg-surface-dark border-border-dark h-full overflow-hidden flex flex-col group">
            <div className="h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center mb-1">
                    <p className="text-[9px] font-bold text-orange-500 uppercase tracking-widest">Thomas Home Fitness</p>
                    <Trophy size={14} className="text-yellow-500/50" />
                </div>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                    <ListChecks size={20} className="text-orange-500" />
                    Rutina Pro
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-4 overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-orange-500/20">
                {workout.exercises.map((dayGroup: any, idx: number) => (
                    <div key={idx} className="space-y-3">
                        <div className="flex items-center gap-2 border-b border-border-dark/30 pb-1">
                            <Zap size={12} className="text-yellow-500" />
                            <h4 className="text-xs font-black text-white uppercase">{dayGroup.day}</h4>
                        </div>
                        <div className="space-y-2">
                            {dayGroup.list.map((ex: any, exIdx: number) => (
                                <div key={exIdx} className="bg-black/20 p-2 rounded-lg border border-border-dark/30 hover:border-orange-500/30 transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                        <h5 className="text-[11px] font-bold text-white">{ex.name}</h5>
                                        <span className="text-[9px] font-mono text-orange-400 bg-orange-500/10 px-1.5 rounded">{ex.sets}x{ex.reps}</span>
                                    </div>
                                    <p className="text-[9px] text-gray-500 line-clamp-1 group-hover:line-clamp-none transition-all">{ex.instructions}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </CardContent>
            <div className="p-4 pt-2 mt-auto">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerate}
                    className="w-full text-[9px] text-gray-500 hover:text-primary transition-colors h-6"
                >
                    Actualizar Rutina (Gemini 2.0)
                </Button>
            </div>
        </Card>
    )
}
