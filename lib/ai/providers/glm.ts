/**
 * GLM 4.7 Provider (Zhipu AI)
 * Chinese AI model for diverse perspective
 */

const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'

export interface GLMResponse {
  decision: 'BUY' | 'SELL' | 'HOLD'
  confidence: number
  reasoning: string
  model: 'glm'
}

export async function analyzeWithGLM(
  prompt: string,
  apiKey: string
): Promise<GLMResponse> {
  try {
    const response = await fetch(ZHIPU_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'glm-4-plus',
        messages: [
          {
            role: 'system',
            content: 'You are Thomas, an expert AI trading analyst. Always respond in Spanish with detailed technical analysis. Return your analysis as valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('GLM API error:', error)
      throw new Error(`GLM API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in GLM response')
    }

    const result = JSON.parse(jsonMatch[0])
    return {
      decision: result.decision,
      confidence: result.confidence,
      reasoning: result.reasoning,
      model: 'glm',
    }
  } catch (error: any) {
    console.error('Error in GLM analysis:', error)
    throw error
  }
}

export async function chatWithGLM(
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  systemPrompt: string,
  apiKey: string
): Promise<string> {
  try {
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...history.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user' as const, content: message },
    ]

    const response = await fetch(ZHIPU_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'glm-4-plus',
        messages,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    })

    if (!response.ok) {
      throw new Error(`GLM API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || ''
  } catch (error: any) {
    console.error('Error in GLM chat:', error)
    throw error
  }
}
