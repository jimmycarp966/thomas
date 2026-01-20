'use server'

import { createClient } from '@/lib/supabase/server'
import { generateAIResponse } from '@/lib/ai/vertex-client'
import { getAnthropometryData } from './anthropometry'

const HARCODED_USER_ID = '00000000-0000-0000-0000-000000000001'

export async function generateWeeklyDiet() {
    const supabase = await createClient()
    const anthro = await getAnthropometryData()

    if (!anthro) {
        return { error: 'Se necesitan datos antropométricos para generar una dieta personalizada.' }
    }

    const { weight, height_cm, gender, body_fat_percentage, neck, waist, hip } = anthro

    const prompt = `
    Eres Thomas Health AI, un experto en nutrición y rendimiento para traders. 
    Tu objetivo es diseñar una dieta semanal que maximice la claridad mental, el "Flow" de trading y la quema de grasa.

    DATOS DEL USUARIO:
    - Peso: ${weight} kg
    - Altura: ${height_cm} cm
    - Género: ${gender}
    - % Grasa Corporal: ${body_fat_percentage}%
    - Medidas clave: Cuello ${neck}cm, Cintura ${waist}cm ${hip ? `, Cadera ${hip}cm` : ''}

    REQUERIMIENTOS:
    1. Enfócate en alimentos con bajo índice glucémico para evitar caídas de energía durante el trading.
    2. Incluye suplementos sugeridos para el cerebro (Omega-3, Magnesio, etc.).
    3. La estructura debe ser de 7 días (Lunes a Domingo).
    4. Cada día debe tener: Desayuno, Almuerzo, Merienda (Snack de Trading) y Cena.

    RESPONDE EXCLUSIVAMENTE EN FORMATO JSON con esta estructura:
    {
      "plan_name": "Plan de Bio-Rendimiento Thomas",
      "calories_target": 2200,
      "macros_target": { "protein": 180, "carbs": 150, "fats": 70 },
      "meals": {
        "monday": {
          "breakfast": { "name": "...", "description": "...", "calories": 0, "p": 0, "c": 0, "f": 0 },
          "lunch": { ... },
          "snack": { ... },
          "dinner": { ... }
        },
        ... (resto de días en inglés: tuesday, wednesday, thursday, friday, saturday, sunday)
      },
      "recommendations": ["...", "..."]
    }
    `

    try {
        const response = await generateAIResponse(prompt)
        const jsonMatch = response.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error('No se pudo generar el formato JSON')

        const dietData = JSON.parse(jsonMatch[0])

        // Guardar en la base de datos
        const { data: savedDiet, error } = await supabase
            .from('health_diets')
            .insert({
                user_id: HARCODED_USER_ID,
                plan_name: dietData.plan_name,
                meals: dietData.meals,
                calories_target: dietData.calories_target,
                macros_target: dietData.macros_target,
                is_active: true
            })
            .select()
            .single()

        if (error) throw error

        return { success: true, data: savedDiet }
    } catch (error) {
        console.error('Error in generateWeeklyDiet:', error)
        return { error: 'Error al generar la dieta con IA.' }
    }
}

export async function getActiveDiet() {
    const supabase = await createClient()
    try {
        const { data, error } = await supabase
            .from('health_diets')
            .select('*')
            .eq('user_id', HARCODED_USER_ID)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (error && error.code !== 'PGRST116') throw error
        return data || null
    } catch (error) {
        console.error('Error getting active diet:', error)
        return null
    }
}

export async function generateWorkoutPlan() {
    const supabase = await createClient()
    const anthro = await getAnthropometryData()

    if (!anthro) {
        return { error: 'Se necesitan datos antropométricos para generar un plan de entrenamiento.' }
    }

    const { weight, body_fat_percentage, gender } = anthro

    const prompt = `
    Eres Thomas Fitness Coach. Diseña una rutina de fuerza EN CASA (sin equipo pesado, máximo mancuernas ajustables o peso corporal) enfocada en quema de grasa y mantenimiento muscular.

    DATOS: Peso ${weight}kg, % Grasa ${body_fat_percentage}%, Género ${gender}.

    RESPONDE EN JSON:
    {
      "plan_name": "Rutina de Fuerza Thomas Home",
      "difficulty": "Intermediate",
      "exercises": [
        {
           "day": "Día 1: Empuje + Core",
           "list": [
             { "name": "Flexiones", "sets": "4", "reps": "12-15", "instructions": "..." },
             ...
           ]
        },
        ...
      ]
    }
    `

    try {
        const response = await generateAIResponse(prompt)
        const jsonMatch = response.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error('No JSON')

        const workoutData = JSON.parse(jsonMatch[0])

        const { data: savedWorkout, error } = await supabase
            .from('health_workouts')
            .insert({
                user_id: HARCODED_USER_ID,
                plan_name: workoutData.plan_name,
                exercises: workoutData.exercises,
                difficulty: workoutData.difficulty
            })
            .select()
            .single()

        if (error) throw error
        return { success: true, data: savedWorkout }
    } catch (error) {
        console.error('Error in generateWorkoutPlan:', error)
        return { error: 'Error al generar el entrenamiento.' }
    }
}

export async function getActiveWorkout() {
    const supabase = await createClient()
    try {
        const { data, error } = await supabase
            .from('health_workouts')
            .select('*')
            .eq('user_id', HARCODED_USER_ID)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (error && error.code !== 'PGRST116') throw error
        return data || null
    } catch (error) {
        console.error('Error getting active workout:', error)
        return null
    }
}
