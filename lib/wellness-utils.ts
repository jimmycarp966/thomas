/**
 * Utilidades para cálculos de salud y bienestar.
 */

export interface BodyMeasurements {
    gender: 'male' | 'female'
    height: number // cm
    waist: number // cm
    neck: number // cm
    hip?: number // cm (solo requerido para mujeres)
}

/**
 * Calcula el porcentaje de grasa corporal usando la fórmula de la Marina de EE.UU. (Metric version)
 * 
 * Para Hombres:
 * % Gasa = 495 / (1.0324 - 0.19077 * log10(cintura - cuello) + 0.15456 * log10(altura)) - 450
 * 
 * Para Mujeres:
 * % Gasa = 495 / (1.29579 - 0.35004 * log10(cintura + cadera - cuello) + 0.22100 * log10(altura)) - 450
 */
export function calculateBodyFatPercentage(data: BodyMeasurements): number {
    const { gender, height, waist, neck, hip } = data

    try {
        if (gender === 'male') {
            const result = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450
            return isFinite(result) ? Math.max(2, Math.min(60, result)) : 0
        } else {
            if (!hip) return 0
            const result = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450
            return isFinite(result) ? Math.max(5, Math.min(70, result)) : 0
        }
    } catch (error) {
        console.error('Error calculating body fat:', error)
        return 0
    }
}

/**
 * Calcula el Índice de Masa Corporal (IMC)
 */
export function calculateBMI(weight: number, height: number): number {
    if (height <= 0) return 0
    const heightInMeters = height / 100
    return weight / (heightInMeters * heightInMeters)
}

/**
 * Categoriza el IMC
 */
export function getBMICategory(bmi: number): string {
    if (bmi < 18.5) return 'Bajo peso'
    if (bmi < 25) return 'Peso normal'
    if (bmi < 30) return 'Sobrepeso'
    return 'Obesidad'
}
