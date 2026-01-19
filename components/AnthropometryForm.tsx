'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getAnthropometryData, saveAnthropometryData } from '@/actions/anthropometry'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function AnthropometryForm() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [data, setData] = useState({
        weight: 0,
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

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const result = await getAnthropometryData()
            if (result) {
                setData({
                    weight: result.weight || 0,
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

    const handleSave = async () => {
        setSaving(true)
        try {
            const result = await saveAnthropometryData(data)
            if (result.success) {
                alert('Medidas guardadas con éxito')
            }
        } catch (error) {
            console.error('Error saving data:', error)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <LoadingSpinner />

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-surface-dark border-border-dark">
                <CardHeader>
                    <CardTitle className="text-white text-xl flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">straighten</span>
                        Medidas Corporales (cm)
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Cuello</label>
                            <Input name="neck" type="number" value={data.neck} onChange={handleChange} className="bg-black/20 border-border-dark text-white" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Cintura</label>
                            <Input name="waist" type="number" value={data.waist} onChange={handleChange} className="bg-black/20 border-border-dark text-white" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Cadera</label>
                            <Input name="hip" type="number" value={data.hip} onChange={handleChange} className="bg-black/20 border-border-dark text-white" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Pecho</label>
                            <Input name="chest" type="number" value={data.chest} onChange={handleChange} className="bg-black/20 border-border-dark text-white" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Bíceps</label>
                            <Input name="biceps" type="number" value={data.biceps} onChange={handleChange} className="bg-black/20 border-border-dark text-white" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Antebrazo</label>
                            <Input name="forearm" type="number" value={data.forearm} onChange={handleChange} className="bg-black/20 border-border-dark text-white" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Muslo</label>
                            <Input name="thigh" type="number" value={data.thigh} onChange={handleChange} className="bg-black/20 border-border-dark text-white" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Pantorrilla</label>
                            <Input name="calf" type="number" value={data.calf} onChange={handleChange} className="bg-black/20 border-border-dark text-white" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-surface-dark border-border-dark">
                <CardHeader>
                    <CardTitle className="text-white text-xl flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">monitor_weight</span>
                        Composición
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">Peso (kg)</label>
                        <Input name="weight" type="number" value={data.weight} onChange={handleChange} step="0.1" className="bg-black/20 border-border-dark text-white" />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">% Grasa Corporal</label>
                        <Input name="body_fat_percentage" type="number" value={data.body_fat_percentage} onChange={handleChange} step="0.1" className="bg-black/20 border-border-dark text-white" />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">Notas</label>
                        <textarea
                            name="notes"
                            value={data.notes}
                            onChange={handleChange}
                            className="w-full min-h-[100px] bg-black/20 border border-border-dark rounded-md p-2 text-white text-sm"
                            placeholder="Notas sobre tu progreso..."
                        />
                    </div>
                    <Button onClick={handleSave} disabled={saving} className="w-full bg-primary hover:bg-primary-dark">
                        {saving ? 'Guardando...' : 'Actualizar Perfil Biométrico'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
