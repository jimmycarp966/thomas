/**
 * Thomas AI Providers
 * 
 * Multi-model support for trading analysis:
 * - Claude (Anthropic) - Strong reasoning, conservative
 * - Gemini (Google) - Fast pattern recognition
 * - GLM 4.7 (Zhipu) - Diverse perspective
 */

export { analyzeWithClaude, chatWithClaude } from './claude'
export { analyzeWithGemini } from './gemini'
export { analyzeWithGLM, chatWithGLM } from './glm'

export type { ClaudeResponse } from './claude'
export type { GeminiResponse } from './gemini'
export type { GLMResponse } from './glm'
