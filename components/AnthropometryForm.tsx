import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getAnthropometryData, saveAnthropometryData } from '@/actions/anthropometry'
import LoadingSpinner from '@/components/LoadingSpinner'
import { calculateBodyFatPercentage, calculateBMI, getBMICategory } from '@/lib/wellness-utils'
import { Label } from '@/components/ui/label'
import { User, UserRound } from 'lucide-react'

export default function AnthropometryForm() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [data, setData] = useState({
        weight: 0,
        height_cm: 170,
        gender: 'male' as 'male' | 'female',
        body_fat_percentage: 0,
        neck: 0,
        waist: 0,
        hip: 0,
        chest: 0,
        biceps: 0,
        forearm: 0,
        thigh: 0,
        calf: 0,
        notes: ''
    })

    const [calculatedFat, setCalculatedFat] = useState(0)
    const [bmi, setBmi] = useState(0)

    useEffect(() => {
        loadData()
    }, [])

    // Recalcular métricas cuando cambian las medidas clave
    useEffect(() => {
        const fat = calculateBodyFatPercentage({
            gender: data.gender,
            height: data.height_cm,
            neck: data.neck,
            waist: data.waist,
            hip: data.hip
        })
        setCalculatedFat(Math.round(fat * 10) / 10)

        const bmiVal = calculateBMI(data.weight, data.height_cm)
        setBmi(Math.round(bmiVal * 10) / 10)
    }, [data.weight, data.height_cm, data.gender, data.neck, data.waist, data.hip])

    const loadData = async () => {
        try {
            const result = await getAnthropometryData()
            if (result) {
                setData({
                    weight: result.weight || 0,
                    height_cm: result.height_cm || 170,
                    gender: result.gender || 'male',
                    body_fat_percentage: result.body_fat_percentage || 0,
                    neck: result.neck || 0,
                    waist: result.waist || 0,
                    hip: result.hip || 0,
                    chest: result.chest || 0,
                    biceps: result.biceps || 0,
                    forearm: result.forearm || 0,
                    thigh: result.thigh || 0,
                    calf: result.calf || 0,
                    notes: result.notes || ''
                })
            }
        } catch (error) {
            console.error('Error loading anthropometry data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        setData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }))
    }

    const handleGenderChange = (val: string) => {
        setData(prev => ({ ...prev, gender: val as 'male' | 'female' }))
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            // Guardamos el porcentaje calculado automáticamente
            const finalData = {
                ...data,
                body_fat_percentage: calculatedFat > 0 ? calculatedFat : data.body_fat_percentage
            }
            const result = await saveAnthropometryData(finalData)
            if (result.success) {
                alert('Medidas guardadas con éxito')
            }
        } catch (error) {
            console.error('Error saving data:', error)
            alert('Error al guardar datos. ¿Ejecutaste el script SQL?')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <LoadingSpinner />

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-surface-dark border-border-dark">
                <CardHeader className="pb-2">
                    <CardTitle className="text-white text-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">straighten</span>
                            Medidas Corporales (cm)
                        </div>
                        <div className="flex items-center gap-2 bg-black/40 p-1 rounded-lg border border-border-dark/50">
                            <button
                                onClick={() => handleGenderChange('male')}
                                className={`flex items-center gap-1 px-3 py-1 rounded-md text-[10px] font-bold transition-all ${data.gender === 'male' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <User size={12} /> H
                            </button>
                            <button
                                onClick={() => handleGenderChange('female')}
                                className={`flex items-center gap-1 px-3 py-1 rounded-md text-[10px] font-bold transition-all ${data.gender === 'female' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <UserRound size={12} /> M
                            </button>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="bg-black/20 p-4 rounded-lg border border-border-dark/30 space-y-4">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Medidas de Cálculo (Marina)</p>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Altura (cm)</label>
                                <Input name="height_cm" type="number" value={data.height_cm} onChange={handleChange} className="bg-black/40 border-border-dark text-white focus:border-primary" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Cuello</label>
                                <Input name="neck" type="number" value={data.neck} onChange={handleChange} className="bg-black/40 border-border-dark text-white focus:border-primary" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Cintura (Navel)</label>
                                <Input name="waist" type="number" value={data.waist} onChange={handleChange} className="bg-black/40 border-border-dark text-white focus:border-primary" />
                            </div>
                            {data.gender === 'female' && (
                                <div className="animate-in fade-in duration-500">
                                    <label className="text-xs text-gray-400 mb-1 block">Cadera (Máximo)</label>
                                    <Input name="hip" type="number" value={data.hip} onChange={handleChange} className="bg-black/40 border-border-dark text-white border-primary/50" />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Pecho</label>
                            <Input name="chest" type="number" value={data.chest} onChange={handleChange} className="bg-black/20 border-border-dark text-white" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Otras Medidas</p>
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Bíceps</label>
                            <Input name="biceps" type="number" value={data.biceps} onChange={handleChange} className="bg-black/20 border-border-dark text-white" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Antebrazo</label>
                            <Input name="forearm" type="number" value={data.forearm} onChange={handleChange} className="bg-black/20 border-border-dark text-white" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Muslo</label>
                            <Input name="thigh" type="number" value={data.thigh} onChange={handleChange} className="bg-black/20 border-border-dark text-white" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Pantorrilla</label>
                            <Input name="calf" type="number" value={data.calf} onChange={handleChange} className="bg-black/20 border-border-dark text-white" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-6">
                <Card className="bg-surface-dark border-border-dark overflow-hidden group">
                    <div className="h-1 bg-gradient-to-r from-primary/50 to-primary"></div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-white text-lg flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">analytics</span>
                            Análisis Biométrico
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-border-dark/50">
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase font-bold">Grasa Corporal</p>
                                <p className="text-2xl font-black text-white">{calculatedFat}%</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-gray-500 uppercase font-bold">Fórmula</p>
                                <p className="text-xs text-primary font-medium">U.S. Navy</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-border-dark/50">
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase font-bold">IMC</p>
                                <p className="text-xl font-bold text-white">{bmi}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-gray-500 uppercase font-bold">Estado</p>
                                <p className={`text-xs font-bold ${bmi >= 18.5 && bmi < 25 ? 'text-green-400' : 'text-orange-400'}`}>
                                    {getBMICategory(bmi)}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-gray-400 block">Peso Actual (kg)</label>
                            <Input name="weight" type="number" value={data.weight} onChange={handleChange} step="0.1" className="bg-black/40 border-border-dark text-white text-lg font-bold h-12 focus:border-primary" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-surface-dark border-border-dark">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-white text-lg flex items-center gap-2">
                            <span className="material-symbols-outlined text-gray-400">notes</span>
                            Notas y Guardado
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <textarea
                                name="notes"
                                value={data.notes}
                                onChange={handleChange}
                                className="w-full min-h-[80px] bg-black/20 border border-border-dark rounded-md p-3 text-white text-sm focus:border-primary/50 outline-none transition-colors"
                                placeholder="Notas sobre tu progreso o sensaciones..."
                            />
                        </div>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-bold h-12 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {saving ? (
                                <div className="flex items-center gap-2">
                                    <LoadingSpinner size="sm" />
                                    <span>Guardando...</span>
                                </div>
                            ) : 'Actualizar Perfil de Thomas'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
