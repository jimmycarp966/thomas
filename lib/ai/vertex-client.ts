import { GoogleGenAI } from '@google/genai'
import { CHAT_ASSISTANT_PROMPT, WELLNESS_TRACKING_PROMPT } from './prompts'

const getAIConfig = () => {
  const apiKey = process.env.GOOGLE_API_KEY;
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const project = process.env.GOOGLE_CLOUD_PROJECT_ID;
  const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

  console.log('Thomas AI: [v2.8] Iniciando Configuración (Docs Verified)...');

  // OPCIÓN 1: API KEY (Gemini API - Recomendado para Vercel)
  // IMPORTANTE: Al usar API Key, NO debemos pasar project ni location,
  // y debemos asegurar que vertexai sea false para evitar el endpoint de GCP.
  if (apiKey) {
    console.log('Thomas AI: [v2.7] Usando GOOGLE_API_KEY (Gemini API / AI Studio)');
    return new GoogleGenAI({
      apiKey,
      vertexai: false // Forzar Gemini API, no Vertex
    });
  }

  // OPCIÓN 2: SERVICE ACCOUNT (Vertex AI)
  if (serviceAccountJson) {
    try {
      let rawJson = serviceAccountJson.trim();
      if ((rawJson.startsWith('"') && rawJson.endsWith('"')) || (rawJson.startsWith("'") && rawJson.endsWith("'"))) {
        rawJson = rawJson.substring(1, rawJson.length - 1);
      }

      const credentials = JSON.parse(rawJson);
      let pk = credentials.private_key || credentials.privateKey;

      if (typeof pk === 'string') {
        // Extraer Base64 puro
        let b64 = pk
          .replace(/-----BEGIN PRIVATE KEY-----/g, '')
          .replace(/-----END PRIVATE KEY-----/g, '')
          .replace(/\\n/g, '')
          .replace(/\n/g, '')
          .replace(/\r/g, '')
          .replace(/\s/g, '')
          .trim();

        // CURACIÓN DE BASE64
        const missingPadding = b64.length % 4;
        if (missingPadding > 0) {
          const paddingToAdd = 4 - missingPadding;
          b64 = b64 + '='.repeat(paddingToAdd);
          console.log(`Thomas AI: [v2.7] base64 curada (+${paddingToAdd})`);
        }

        // Reconstrucción PKCS#8
        const lines = b64.match(/.{1,64}/g) || [];
        const perfectPem = [
          '-----BEGIN PRIVATE KEY-----',
          ...lines,
          '-----END PRIVATE KEY-----',
          ''
        ].join('\n');

        credentials.private_key = perfectPem;
        credentials.privateKey = perfectPem;
      }

      const pid = credentials.project_id || project;
      console.log(`Thomas AI: [v2.7] Usando Vertex AI (Project: ${pid})`);

      return new GoogleGenAI({
        vertexai: true,
        project: pid!,
        location: location,
        googleAuthOptions: {
          credentials,
        },
      });
    } catch (e: any) {
      console.error('Thomas AI: [v2.7] ERROR:', e.message);
    }
  }

  console.log('Thomas AI: [v2.7] Fallback: Usando ADC.');
  return new GoogleGenAI({
    vertexai: true,
    project: project!,
    location: location,
  });
};

const ai = getAIConfig();

export async function generateAIResponse(prompt: string): Promise<string> {
  try {
    // Usar modelo estable según documentación oficial
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',  // Modelo estable (sin -exp)
      contents: prompt,
    })
    return response.text || ''
  } catch (error: any) {
    console.error('Thomas AI: Error en generateContent:', error)
    throw new Error(`AI Response failed: ${error.message || 'unknown error'}`)
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Según documentación: contents puede ser string o array
    const response = await ai.models.embedContent({
      model: 'text-embedding-004',
      contents: text,
    })
    // Estructura de respuesta según docs: embeddings[0].values
    const embeddings = response.embeddings
    return embeddings?.[0]?.values || []
  } catch (error: any) {
    console.error('Thomas AI: Error en embedContent:', error)
    throw new Error(`Embedding failed: ${error.message || 'unknown error'}`)
  }
}

export async function generateTradeAnalysis(
  assetSymbol: string,
  assetType: 'crypto' | 'stock' | 'cedear',
  marketData: any,
  userRiskProfile: 'conservative' | 'moderate' | 'aggressive',
  wellnessScore: number = 80
): Promise<{
  decision: 'BUY' | 'SELL' | 'HOLD'
  confidence: number
  reasoning: string
  riskRewardRatio: number | null
  suggestedEntry: number | null
  suggestedExit: number | null
  stopLoss: number | null
  takeProfit: number | null
}> {
  const prompt = `
You are Thomas, a state-of-the-art AI Trading Agent (2025 Edition). Analyze the following trading opportunity with extreme precision, considering the user's BIOLOGICAL state as well.

Asset: ${assetSymbol}
Type: ${assetType}
User Risk Profile: ${userRiskProfile}
User Wellness Score: ${wellnessScore}/100 

BIOLOGICAL CONTEXT:
- If Wellness Score < 60: The user might be stressed, tired or in a low energy state. Be EXTREMELY conservative.
- If Wellness Score > 85: The user is in "Maximum Flow". You can be more decisive, but always following the risk profile.

Market Data:
${JSON.stringify(marketData, null, 2)}

Provide a structured trading recommendation in JSON format. 
IMPORTANT: The "reasoning" must be in SPANISH, detailed, and follow Explainable AI (XAI) principles (explain the "why" behind indicators and sentiment).

Response Format:
{
  "decision": "BUY" | "SELL" | "HOLD",
  "confidence": number (0-100),
  "reasoning": "Explicación detallada en español incluyendo análisis técnico, sentimiento y gestión de riesgo.",
  "riskRewardRatio": number | null,
  "suggestedEntry": number | null,
  "suggestedExit": number | null,
  "stopLoss": number | null,
  "takeProfit": number | null
}

Analysis Checklist:
1. Technical Indicators: RSI, MACD, EMA(20, 50, 200), Bollinger Bands.
2. Volume Analysis: Volume trends vs price action.
3. Market Structure: Support/Resistance levels and trend phase.
4. XAI Rationale: If decision is BUY/SELL, explain the convergence of factors. If HOLD, explain what is missing for a confirmation.
5. Risk Management: Align suggestions with the "${userRiskProfile}" profile.
6. Biological Feedback: Explicitly mention how the current Wellness Score (${wellnessScore}) influenced the caution or decisiveness of this analysis. Explain to the user if the strategy was tightened due to low wellness or optimized for "Flow".

Be conservative. Only suggest trades with high confidence (80%+ is preferred for BUY/SELL).
  `

  const response = await generateAIResponse(prompt)

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const result = JSON.parse(jsonMatch[0])
    return result
  } catch (error) {
    console.error('Error parsing AI response:', error)
    throw new Error('Failed to parse AI response')
  }
}

export async function generateChatResponse(
  message: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  context?: {
    recentTrades?: any[]
    portfolioValue?: number
    wellnessScore?: number
    anthropometry?: any
    relevantContext?: string
    recentActivity?: string
    marketData?: string  // NUEVO: Cotizaciones en tiempo real de IOL
  }
): Promise<string> {
  const contextPrompt = context ? `
User Context:
- Portfolio Value: $${context.portfolioValue?.toFixed(2) || 'N/A'}
- Wellness Score: ${context.wellnessScore || 'N/A'}
${context.anthropometry ? `
- Biometric Data:
  * Weight: ${context.anthropometry.weight} kg
  * Body Fat: ${context.anthropometry.body_fat_percentage}%
  * Measurements: Neck ${context.anthropometry.neck}cm, Waist ${context.anthropometry.waist}cm, Hip ${context.anthropometry.hip}cm, Chest ${context.anthropometry.chest}cm
  * Last Update: ${context.anthropometry.created_at}
` : ''}
- Recent Trades: ${context.recentTrades?.length || 0}
${context.relevantContext ? `- Relevant Context from Previous Conversations:\n${context.relevantContext}` : ''}
${context.recentActivity ? `
MY RECENT ACTIVITY (Thomas's own actions):
${context.recentActivity}
Use this information to naturally mention what I've been doing if relevant to the conversation.
` : ''}
${context.marketData ? `
MARKET DATA (USE THIS FOR RECOMMENDATIONS):
${context.marketData}
Usa estos precios REALES para tus análisis y recomendaciones. Son datos en tiempo real de IOL.
` : ''}

` : ''

  const historyPrompt = conversationHistory
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n')

  const systemPrompt = message.toLowerCase().includes('salud') ||
    message.toLowerCase().includes('dieta') ||
    message.toLowerCase().includes('ejercicio') ||
    message.toLowerCase().includes('bienestar') ||
    message.toLowerCase().includes('ayuno') ||
    message.toLowerCase().includes('grasa') ||
    message.toLowerCase().includes('medida')
    ? WELLNESS_TRACKING_PROMPT
    : CHAT_ASSISTANT_PROMPT

  const prompt = `
${systemPrompt}

${contextPrompt}

Conversation History:
${historyPrompt}

User: ${message}

Provide a helpful, concise response in SPANISH. If the user asks about trading, be cautious and always remind them of the risks involved.
  `

  return generateAIResponse(prompt)
}
