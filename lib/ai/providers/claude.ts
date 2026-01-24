/**
 * Claude AI Provider (Anthropic)
 * Integrated via Clawdbot connection
 */

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'

export interface ClaudeResponse {
  decision: 'BUY' | 'SELL' | 'HOLD'
  confidence: number
  reasoning: string
  model: 'claude'
}

export async function analyzeWithClaude(
  prompt: string,
  apiKey: string
): Promise<ClaudeResponse> {
  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Claude API error:', error)
      throw new Error(`Claude API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.content[0]?.text || ''

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in Claude response')
    }

    const result = JSON.parse(jsonMatch[0])
    return {
      decision: result.decision,
      confidence: result.confidence,
      reasoning: result.reasoning,
      model: 'claude',
    }
  } catch (error: any) {
    console.error('Error in Claude analysis:', error)
    throw error
  }
}

export async function chatWithClaude(
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  systemPrompt: string,
  apiKey: string
): Promise<string> {
  try {
    const messages = [
      ...history.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user' as const, content: message },
    ]

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: systemPrompt,
        messages,
      }),
    })

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`)
    }

    const data = await response.json()
    return data.content[0]?.text || ''
  } catch (error: any) {
    console.error('Error in Claude chat:', error)
    throw error
  }
}
