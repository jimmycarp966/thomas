'use server'

import { createClient } from '@/lib/supabase/server'

const HARCODED_USER_ID = '00000000-0000-0000-0000-000000000001'

export async function getAnthropometryData() {
    const supabase = await createClient()

    try {
        const { data: anthropometry, error } = await supabase
            .from('anthropometry')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (error || !anthropometry) {
            return {
                weight: 0,
                body_fat_percentage: 0,
                height_cm: 170, // Default
                gender: 'male' as const,
                neck: 0,
                waist: 0,
                hip: 0,
                chest: 0,
                biceps: 0,
                forearm: 0,
                thigh: 0,
                calf: 0
            }
        }

        return anthropometry
    } catch (error) {
        console.error('Error getting anthropometry data:', error)
        return null
    }
}

export async function saveAnthropometryData(data: {
    weight?: number
    body_fat_percentage?: number
    height_cm?: number
    gender?: 'male' | 'female'
    neck?: number
    waist?: number
    hip?: number
    chest?: number
    biceps?: number
    forearm?: number
    thigh?: number
    calf?: number
    notes?: string
}) {
    const supabase = await createClient()

    try {
        const { data: savedData, error } = await supabase
            .from('anthropometry')
            .insert({
                user_id: HARCODED_USER_ID,
                ...data
            })
            .select()
            .single()

        if (error) throw error

        return { success: true, data: savedData }
    } catch (error) {
        console.error('Error saving anthropometry data:', error)
        return { error: 'Failed to save anthropometry data' }
    }
}
