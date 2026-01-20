'use server'

import { createClient } from '@/lib/supabase/server'

export async function getWellnessData() {
  const supabase = await createClient()

  try {
    const { data: wellness } = await supabase
      .from('wellness_tracking')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!wellness) {
      return {
        score: 0,
        fasting_hours: 0,
        mood: 5,
        energy: 5,
        sleep: 8,
        weight: 0
      }
    }

    return {
      score: wellness.wellness_score || 0,
      fasting_hours: wellness.fasting_hours || 0,
      mood: wellness.mood || 5,
      energy: wellness.energy || 5,
      sleep: wellness.sleep || 8,
      sleep_quality: wellness.sleep_quality || 5,
      weight: wellness.weight || 0,
      exercise_minutes: wellness.exercise_minutes || 0,
      exercise_intensity: wellness.exercise_intensity || 'SEDENTARY'
    }
  } catch (error) {
    console.error('Error getting wellness data:', error)
    return {
      score: 0,
      fasting_hours: 0,
      mood: 5,
      energy: 5,
      sleep: 8,
      weight: 0
    }
  }
}

export async function getWellnessHistory(days: number = 30) {
  const supabase = await createClient()

  try {
    const { data: wellnessHistory } = await supabase
      .from('wellness_tracking')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(days)

    if (!wellnessHistory || wellnessHistory.length === 0) {
      return []
    }

    return wellnessHistory.map((w: any) => ({
      date: w.created_at,
      score: w.wellness_score || 0,
      fasting_hours: w.fasting_hours || 0,
      mood: w.mood || 5,
      energy: w.energy || 5,
      sleep: w.sleep || 8,
      sleep_quality: w.sleep_quality || 5,
      weight: w.weight || 0,
      exercise_minutes: w.exercise_minutes || 0,
      exercise_intensity: w.exercise_intensity || 'SEDENTARY'
    }))
  } catch (error) {
    console.error('Error getting wellness history:', error)
    return []
  }
}

export async function saveWellnessData(formData: FormData) {
  const supabase = await createClient()

  try {
    const fastingHours = parseInt(formData.get('fasting_hours') as string) || 0
    const mood = parseInt(formData.get('mood') as string) || 5
    const energy = parseInt(formData.get('energy') as string) || 5
    const sleep = parseFloat(formData.get('sleep') as string) || 8
    const sleepQuality = parseInt(formData.get('sleep_quality') as string) || 5
    const weight = parseFloat(formData.get('weight') as string) || 0
    const exerciseMinutes = parseInt(formData.get('exercise_minutes') as string) || 0
    const exerciseIntensity = formData.get('exercise_intensity') as 'SEDENTARY' | 'MODERATE' | 'HIGH' || 'SEDENTARY'

    // Recuperar antropometría para bonus en score (Waist-to-Hip Ratio)
    const { data: anthro } = await supabase
      .from('anthropometry')
      .select('waist, hip')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    let score = 0

    // 1. Ayuno (Max 20 pts)
    if (fastingHours >= 16) score += 20
    else if (fastingHours >= 14) score += 18
    else if (fastingHours >= 12) score += 15
    else if (fastingHours >= 10) score += 10

    // 2. Estado Mental & Energía (Max 25 pts)
    score += (mood / 10) * 12.5
    score += (energy / 10) * 12.5

    // 3. Sueño Pro (Max 20 pts)
    const sleepPoints = (sleep >= 7 && sleep <= 9) ? 12 : (sleep >= 6) ? 8 : 4
    const qualityPoints = (sleepQuality / 10) * 8
    score += sleepPoints + qualityPoints

    // 4. Actividad & Cardio (Max 25 pts)
    let activityScore = (exerciseMinutes / 60) * 15 // Base 60 min = 15 pts
    if (exerciseIntensity === 'HIGH') activityScore *= 1.5
    else if (exerciseIntensity === 'MODERATE') activityScore *= 1.2
    score += Math.min(activityScore, 25)

    // 5. Bonus Biométrico (Max 10 pts)
    if (anthro && anthro.waist > 0 && anthro.hip > 0) {
      const whr = anthro.waist / anthro.hip
      if (whr <= 0.9) score += 10 // Salud cardiovascular óptima
      else if (whr <= 0.95) score += 5
    } else if (weight > 0) {
      score += 5
    }

    score = Math.min(Math.round(score), 100)

    await supabase
      .from('wellness_tracking')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000001',
        fasting_hours: fastingHours,
        mood,
        energy,
        sleep,
        sleep_quality: sleepQuality,
        weight,
        exercise_minutes: exerciseMinutes,
        exercise_intensity: exerciseIntensity,
        wellness_score: score
      })

    return { success: true, score }
  } catch (error) {
    console.error('Error saving wellness data:', error)
    return { error: 'Failed to save wellness data' }
  }
}
