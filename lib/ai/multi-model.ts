/**
 * Thomas Multi-Model Consensus Engine
 * 
 * Orchestrates 3 AI models (Claude, Gemini, GLM) for trading decisions.
 * Uses voting + confidence weighting for final decisions.
 * 
 * Safety: If models disagree significantly → HOLD
 * Speed: Runs all 3 in parallel
 */

import { analyzeWithClaude, ClaudeResponse } from './providers/claude'
import { analyzeWithGemini, GeminiResponse } from './providers/gemini'
import { analyzeWithGLM, GLMResponse } from './providers/glm'

export type ModelName = 'claude' | 'gemini' | 'glm'
export type Decision = 'BUY' | 'SELL' | 'HOLD'

export interface ModelAnalysis {
  model: ModelName
  decision: Decision
  confidence: number
  reasoning: string
  error?: string
}

export interface ConsensusResult {
  finalDecision: Decision
  finalConfidence: number
  consensusLevel: 'unanimous' | 'majority' | 'split' | 'error'
  analyses: ModelAnalysis[]
  reasoning: string
  shouldExecute: boolean
  executionReason: string
}

// Model weights for consensus (can be adjusted based on performance)
const MODEL_WEIGHTS: Record<ModelName, number> = {
  claude: 0.40,   // Strong reasoning, conservative
  gemini: 0.35,   // Fast, good at patterns
  glm: 0.25,      // Diverse perspective
}

// Minimum confidence thresholds
const THRESHOLDS = {
  EXECUTE_MIN_CONFIDENCE: 75,      // Minimum confidence to consider execution
  UNANIMOUS_BONUS: 15,             // Bonus confidence if all agree
  MAJORITY_REQUIRED: 2,            // At least 2/3 must agree
  SPLIT_PENALTY: 20,               // Confidence penalty when split
}

export async function analyzeWithConsensus(
  assetSymbol: string,
  assetType: 'crypto' | 'stock' | 'cedear',
  marketData: any,
  userRiskProfile: 'conservative' | 'moderate' | 'aggressive',
  wellnessScore: number = 80
): Promise<ConsensusResult> {
  
  const prompt = buildAnalysisPrompt(assetSymbol, assetType, marketData, userRiskProfile, wellnessScore)
  
  // Get API keys from environment
  const claudeKey = process.env.ANTHROPIC_API_KEY
  const glmKey = process.env.GLM_API_KEY

  // Run all models in parallel
  const [claudeResult, geminiResult, glmResult] = await Promise.allSettled([
    claudeKey ? analyzeWithClaude(prompt, claudeKey) : Promise.reject(new Error('No Claude API key')),
    analyzeWithGemini(prompt),
    glmKey ? analyzeWithGLM(prompt, glmKey) : Promise.reject(new Error('No GLM API key')),
  ])

  // Process results
  const analyses: ModelAnalysis[] = []

  if (claudeResult.status === 'fulfilled') {
    analyses.push(claudeResult.value)
  } else {
    analyses.push({
      model: 'claude',
      decision: 'HOLD',
      confidence: 0,
      reasoning: 'Error en análisis',
      error: claudeResult.reason?.message,
    })
  }

  if (geminiResult.status === 'fulfilled') {
    analyses.push(geminiResult.value)
  } else {
    analyses.push({
      model: 'gemini',
      decision: 'HOLD',
      confidence: 0,
      reasoning: 'Error en análisis',
      error: geminiResult.reason?.message,
    })
  }

  if (glmResult.status === 'fulfilled') {
    analyses.push(glmResult.value)
  } else {
    analyses.push({
      model: 'glm',
      decision: 'HOLD',
      confidence: 0,
      reasoning: 'Error en análisis',
      error: glmResult.reason?.message,
    })
  }

  // Calculate consensus
  return calculateConsensus(analyses, userRiskProfile)
}

function calculateConsensus(
  analyses: ModelAnalysis[],
  riskProfile: 'conservative' | 'moderate' | 'aggressive'
): ConsensusResult {
  
  // Count valid analyses (no errors)
  const validAnalyses = analyses.filter(a => !a.error)
  
  if (validAnalyses.length === 0) {
    return {
      finalDecision: 'HOLD',
      finalConfidence: 0,
      consensusLevel: 'error',
      analyses,
      reasoning: 'Todos los modelos fallaron. No se puede tomar decisión.',
      shouldExecute: false,
      executionReason: 'Error en todos los modelos de IA',
    }
  }

  // Count votes
  const votes: Record<Decision, number> = { BUY: 0, SELL: 0, HOLD: 0 }
  const weightedConfidence: Record<Decision, number> = { BUY: 0, SELL: 0, HOLD: 0 }

  for (const analysis of validAnalyses) {
    const weight = MODEL_WEIGHTS[analysis.model]
    votes[analysis.decision]++
    weightedConfidence[analysis.decision] += analysis.confidence * weight
  }

  // Determine winning decision
  let winningDecision: Decision = 'HOLD'
  let maxVotes = 0

  for (const decision of ['BUY', 'SELL', 'HOLD'] as Decision[]) {
    if (votes[decision] > maxVotes) {
      maxVotes = votes[decision]
      winningDecision = decision
    }
  }

  // Calculate consensus level
  let consensusLevel: 'unanimous' | 'majority' | 'split'
  if (maxVotes === validAnalyses.length) {
    consensusLevel = 'unanimous'
  } else if (maxVotes >= THRESHOLDS.MAJORITY_REQUIRED) {
    consensusLevel = 'majority'
  } else {
    consensusLevel = 'split'
  }

  // Calculate final confidence
  let finalConfidence = 0
  const totalWeight = validAnalyses.reduce((sum, a) => sum + MODEL_WEIGHTS[a.model], 0)
  
  for (const analysis of validAnalyses) {
    if (analysis.decision === winningDecision) {
      finalConfidence += (analysis.confidence * MODEL_WEIGHTS[analysis.model]) / totalWeight
    }
  }

  // Apply consensus bonuses/penalties
  if (consensusLevel === 'unanimous') {
    finalConfidence = Math.min(100, finalConfidence + THRESHOLDS.UNANIMOUS_BONUS)
  } else if (consensusLevel === 'split') {
    finalConfidence = Math.max(0, finalConfidence - THRESHOLDS.SPLIT_PENALTY)
    winningDecision = 'HOLD' // Safety: don't trade on split
  }

  // Determine if we should execute
  let shouldExecute = false
  let executionReason = ''

  if (winningDecision === 'HOLD') {
    shouldExecute = false
    executionReason = 'Decisión de mantener posición actual'
  } else if (consensusLevel === 'split') {
    shouldExecute = false
    executionReason = 'Los modelos no llegaron a consenso. Manteniendo posición por seguridad.'
  } else if (finalConfidence < THRESHOLDS.EXECUTE_MIN_CONFIDENCE) {
    shouldExecute = false
    executionReason = `Confianza insuficiente (${finalConfidence.toFixed(0)}% < ${THRESHOLDS.EXECUTE_MIN_CONFIDENCE}%)`
  } else {
    // Check risk profile
    const riskThresholds = {
      conservative: 85,
      moderate: 75,
      aggressive: 65,
    }
    
    if (finalConfidence >= riskThresholds[riskProfile]) {
      shouldExecute = true
      executionReason = `Consenso ${consensusLevel} con ${finalConfidence.toFixed(0)}% confianza`
    } else {
      shouldExecute = false
      executionReason = `Confianza por debajo del umbral para perfil ${riskProfile}`
    }
  }

  // Build combined reasoning
  const reasoning = buildCombinedReasoning(analyses, winningDecision, consensusLevel)

  return {
    finalDecision: winningDecision,
    finalConfidence: Math.round(finalConfidence),
    consensusLevel,
    analyses,
    reasoning,
    shouldExecute,
    executionReason,
  }
}

function buildAnalysisPrompt(
  assetSymbol: string,
  assetType: 'crypto' | 'stock' | 'cedear',
  marketData: any,
  riskProfile: string,
  wellnessScore: number
): string {
  return `
You are Thomas, an expert AI Trading Analyst. Analyze this opportunity with precision.

Asset: ${assetSymbol}
Type: ${assetType}
Risk Profile: ${riskProfile}
Wellness Score: ${wellnessScore}/100

Market Data:
${JSON.stringify(marketData, null, 2)}

Respond ONLY with valid JSON in this exact format:
{
  "decision": "BUY" | "SELL" | "HOLD",
  "confidence": <number 0-100>,
  "reasoning": "<detailed analysis in SPANISH>"
}

Analysis requirements:
1. Technical indicators (RSI, MACD, EMAs, Bollinger)
2. Volume analysis
3. Support/Resistance levels
4. Risk/reward assessment
5. Consider wellness score for risk tolerance

Be conservative. Only high-confidence calls (80%+) for BUY/SELL.
`
}

function buildCombinedReasoning(
  analyses: ModelAnalysis[],
  finalDecision: Decision,
  consensusLevel: string
): string {
  const validAnalyses = analyses.filter(a => !a.error)
  
  let reasoning = `## Análisis Multi-Modelo (${consensusLevel.toUpperCase()})\n\n`
  reasoning += `**Decisión Final: ${finalDecision}**\n\n`
  
  for (const analysis of validAnalyses) {
    const emoji = analysis.model === 'claude' ? '🟣' : 
                  analysis.model === 'gemini' ? '🔵' : '🟢'
    reasoning += `### ${emoji} ${analysis.model.toUpperCase()}: ${analysis.decision} (${analysis.confidence}%)\n`
    reasoning += `${analysis.reasoning}\n\n`
  }

  const errors = analyses.filter(a => a.error)
  if (errors.length > 0) {
    reasoning += `### ⚠️ Errores\n`
    for (const err of errors) {
      reasoning += `- ${err.model}: ${err.error}\n`
    }
  }

  return reasoning
}

// Export types for use in other modules
export type { ClaudeResponse, GeminiResponse, GLMResponse }
