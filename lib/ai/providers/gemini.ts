/**
 * Gemini Provider (Google)
 * Wrapper around existing vertex-client for consistency
 */

import { generateAIResponse } from '../vertex-client'

export interface GeminiResponse {
  decision: 'BUY' | 'SELL' | 'HOLD'
  confidence: number
  reasoning: string
  model: 'gemini'
}

export async function analyzeWithGemini(prompt: string): Promise<GeminiResponse> {
  try {
    const response = await generateAIResponse(prompt)

    // Parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in Gemini response')
    }

    const result = JSON.parse(jsonMatch[0])
    return {
      decision: result.decision,
      confidence: result.confidence,
      reasoning: result.reasoning,
      model: 'gemini',
    }
  } catch (error: any) {
    console.error('Error in Gemini analysis:', error)
    throw error
  }
}
