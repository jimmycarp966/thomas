'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitFeedback(
  messageId: string,
  feedback: 'positive' | 'negative',
  comment?: string
) {
  const supabase = await createClient()
  
  try {
    // Actualizar el mensaje con el feedback
    const { data: message } = await supabase
      .from('chat_messages')
      .update({
        user_feedback: feedback,
        user_feedback_comment: comment,
        updated_at: new Date().toISOString(),
      })
      .eq('id', messageId)
      .select()
      .single()

    // Si el feedback es negativo, extraer aprendizaje para mejorar
    if (feedback === 'negative' && comment) {
      await extractLearningFromNegativeFeedback(message.content, comment)
    }

    revalidatePath('/chat')
    return { success: true }
  } catch (error) {
    console.error('Error submitting feedback:', error)
    return { error: 'Failed to submit feedback' }
  }
}

async function extractLearningFromNegativeFeedback(
  aiResponse: string,
  userFeedback: string
): Promise<void> {
  const supabase = await createClient()
  
  try {
    const learningPrompt = `
Analiza el siguiente feedback negativo del usuario sobre una respuesta de IA:

Respuesta de la IA: ${aiResponse}
Feedback del usuario: ${userFeedback}

Extrae 1-2 aprendizajes para mejorar las respuestas futuras en formato JSON:
{
  "learnings": [
    {
      "category": "accuracy" | "clarity" | "relevance" | "tone" | "other",
      "insight": "Descripción del aprendizaje",
      "confidence": 0-100
    }
  ]
}
`

    const { generateChatResponse } = await import('@/lib/ai/vertex-client')
    const response = await generateChatResponse(learningPrompt, [], {})
    
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return
    
    const result = JSON.parse(jsonMatch[0])
    
    for (const learning of result.learnings || []) {
      if (learning.confidence >= 70) {
        await supabase.from('ai_learnings').insert({
          user_id: '00000000-0000-0000-0000-000000000001',
          category: learning.category,
          insight: learning.insight,
          confidence: learning.confidence,
          source: 'user_feedback',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }
    }
  } catch (error) {
    console.error('Error extracting learning from negative feedback:', error)
  }
}

export async function getFeedbackStats() {
  const supabase = await createClient()
  
  try {
    const { count: positiveCount } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_feedback', 'positive')
    
    const { count: negativeCount } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_feedback', 'negative')
    
    return {
      positive: positiveCount || 0,
      negative: negativeCount || 0,
      total: (positiveCount || 0) + (negativeCount || 0),
    }
  } catch (error) {
    console.error('Error getting feedback stats:', error)
    return { positive: 0, negative: 0, total: 0 }
  }
}
