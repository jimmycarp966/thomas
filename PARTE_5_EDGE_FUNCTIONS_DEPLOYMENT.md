# PARTE 5: EDGE FUNCTIONS, CLOUD FUNCTIONS Y DEPLOYMENT

## ⚡ SUPABASE EDGE FUNCTIONS

### 1. Edge Function: Análisis de Mercado (Cron Job cada 1 hora)

**Archivo: `supabase/functions/analyze-market/index.ts`**

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const CLOUD_FUNCTION_ANALYZE_URL = Deno.env.get('CLOUD_FUNCTION_ANALYZE_URL')!

serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // 1. Obtener usuarios con trading activo
    const { data: configs, error: configError } = await supabase
      .from('trading_config')
      .select('user_id, allowed_assets, risk_profile, max_trade_amount')
      .eq('auto_execute', true)

    if (configError) throw configError

    if (!configs || configs.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No active users' }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    const results = []

    // 2. Para cada usuario, analizar sus assets
    for (const config of configs) {
      const assets = config.allowed_assets as string[]

      for (const asset of assets) {
        // 3. Llamar a Cloud Function de Python para análisis
        const analysisResponse = await fetch(CLOUD_FUNCTION_ANALYZE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: config.user_id,
            asset_symbol: asset,
            risk_profile: config.risk_profile,
            max_trade_amount: config.max_trade_amount,
          })
        })

        if (!analysisResponse.ok) {
          console.error(`Error analyzing ${asset} for user ${config.user_id}`)
          continue
        }

        const analysis = await analysisResponse.json()

        // 4. Si hay recomendación de BUY o SELL, guardarla
        if (analysis.decision !== 'HOLD') {
          const { error: insertError } = await supabase
            .from('trading_decisions')
            .insert({
              user_id: config.user_id,
              asset_symbol: asset,
              asset_type: analysis.asset_type,
              decision_type: analysis.decision,
              ai_analysis: analysis.ai_analysis,
              suggested_amount: analysis.suggested_amount,
              suggested_price: analysis.suggested_price,
              stop_loss_price: analysis.stop_loss,
              take_profit_price: analysis.take_profit,
              status: 'pending',
              embedding: analysis.embedding,
            })

          if (insertError) {
            console.error('Error saving decision:', insertError)
            continue
          }

          // 5. Crear notificación
          await supabase.from('notifications').insert({
            user_id: config.user_id,
            type: 'trade_suggestion',
            title: `Nueva sugerencia: ${analysis.decision} ${asset}`,
            message: `Confianza: ${(analysis.ai_analysis.confidence * 100).toFixed(0)}%. ${analysis.ai_analysis.reasoning.substring(0, 100)}...`,
            metadata: { asset, decision: analysis.decision }
          })

          results.push({ user_id: config.user_id, asset, decision: analysis.decision })
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, analyzed: results.length, details: results }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Error in analyze-market:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
```

### 2. Edge Function: Evaluar Resultados de Trades

**Archivo: `supabase/functions/evaluate-trades/index.ts`**

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const CLOUD_FUNCTION_EVALUATE_URL = Deno.env.get('CLOUD_FUNCTION_EVALUATE_URL')!

serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // 1. Buscar trades ejecutados hace 24 horas que están abiertos
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const { data: openResults, error: fetchError } = await supabase
      .from('trade_results')
      .select(`
        *,
        trades!inner(*)
      `)
      .eq('status', 'open')
      .lt('trades.executed_at', twentyFourHoursAgo)

    if (fetchError) throw fetchError

    if (!openResults || openResults.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No trades to evaluate' }),
        { status: 200 }
      )
    }

    const evaluatedTrades = []

    // 2. Evaluar cada trade
    for (const result of openResults) {
      const trade = result.trades

      // 3. Llamar a Cloud Function para evaluación
      const evaluationResponse = await fetch(CLOUD_FUNCTION_EVALUATE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trade_id: trade.id,
          user_id: trade.user_id,
          asset_symbol: trade.asset_symbol,
          entry_price: result.entry_price,
          trade_type: trade.trade_type,
        })
      })

      if (!evaluationResponse.ok) {
        console.error(`Error evaluating trade ${trade.id}`)
        continue
      }

      const evaluation = await evaluationResponse.json()

      // 4. Actualizar resultado del trade
      await supabase
        .from('trade_results')
        .update({
          exit_price: evaluation.current_price,
          pnl_amount: evaluation.pnl_amount,
          pnl_percentage: evaluation.pnl_percentage,
          status: evaluation.status,
          ai_evaluation: evaluation.ai_evaluation,
          closed_at: new Date().toISOString(),
          evaluated_at: new Date().toISOString(),
        })
        .eq('id', result.id)

      // 5. Crear aprendizaje si es relevante
      if (evaluation.ai_evaluation.confidence_in_learning > 0.6) {
        await supabase.from('ai_learnings').insert({
          user_id: trade.user_id,
          learning_type: evaluation.ai_evaluation.success 
            ? 'success_pattern' 
            : 'failure_pattern',
          content: {
            pattern: evaluation.ai_evaluation.lessons_learned,
            trade_details: {
              asset: trade.asset_symbol,
              decision: trade.trade_type,
              result: evaluation.status,
              pnl_percentage: evaluation.pnl_percentage
            },
          },
          importance_score: evaluation.ai_evaluation.confidence_in_learning,
          related_trades: [trade.id],
          embedding: evaluation.embedding,
        })
      }

      // 6. Notificar usuario
      await supabase.from('notifications').insert({
        user_id: trade.user_id,
        type: 'trade_result',
        title: `Trade ${evaluation.status.replace('closed_', '')}: ${trade.asset_symbol}`,
        message: `P&L: ${evaluation.pnl_percentage.toFixed(2)}%. ${evaluation.ai_evaluation.analysis.substring(0, 100)}...`,
        metadata: { trade_id: trade.id }
      })

      evaluatedTrades.push(trade.id)
    }

    return new Response(
      JSON.stringify({ success: true, evaluated: evaluatedTrades.length }),
      { status: 200 }
    )

  } catch (error) {
    console.error('Error in evaluate-trades:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    )
  }
})
```

### Configurar Cron Jobs

**Archivo: `supabase/functions/_shared/cron.ts`**

En Supabase Dashboard:
1. Ir a "Edge Functions" → "Cron Jobs"
2. Crear nuevo cron job:
   - Nombre: `analyze-market-hourly`
   - Schedule: `0 * * * *` (cada hora)
   - Function: `analyze-market`

3. Crear segundo cron job:
   - Nombre: `evaluate-trades-daily`
   - Schedule: `0 0 * * *` (cada día a medianoche)
   - Function: `evaluate-trades`

---

## 🐍 GOOGLE CLOUD FUNCTIONS (PYTHON)

### 1. Cloud Function: Análisis de Assets con IA

**Archivo: `google-cloud/analyze-asset/main.py`**

```python
import functions_framework
import json
import os
from google.cloud import aiplatform
import ccxt
import yfinance as yf
import numpy as np

# Inicializar Vertex AI
PROJECT_ID = os.environ.get('GCP_PROJECT_ID')
LOCATION = os.environ.get('GCP_LOCATION', 'us-central1')
aiplatform.init(project=PROJECT_ID, location=LOCATION)

@functions_framework.http
def analyze_asset(request):
    """
    Analiza un asset (crypto o stock) y genera recomendación usando Gemini
    """
    try:
        request_json = request.get_json()
        
        user_id = request_json.get('user_id')
        asset_symbol = request_json.get('asset_symbol')
        risk_profile = request_json.get('risk_profile', 'moderate')
        max_trade_amount = request_json.get('max_trade_amount', 100)
        
        # Determinar tipo de asset
        asset_type = 'crypto' if '/' in asset_symbol or asset_symbol in ['BTC', 'ETH', 'SOL'] else 'stock'
        
        # Obtener datos de mercado
        if asset_type == 'crypto':
            market_data = get_crypto_data(asset_symbol)
        else:
            market_data = get_stock_data(asset_symbol)
        
        # Calcular indicadores técnicos
        indicators = calculate_indicators(market_data)
        
        # Generar análisis con Gemini
        analysis = generate_ai_analysis(
            asset_symbol,
            asset_type,
            indicators,
            risk_profile,
            max_trade_amount
        )
        
        # Generar embedding para memoria vectorial
        embedding = generate_embedding(
            f"Decision: {analysis['decision']} {asset_symbol}. Reasoning: {analysis['ai_analysis']['reasoning']}"
        )
        
        return json.dumps({
            'decision': analysis['decision'],
            'asset_type': asset_type,
            'ai_analysis': analysis['ai_analysis'],
            'suggested_amount': analysis['suggested_amount'],
            'suggested_price': indicators['current_price'],
            'stop_loss': analysis['stop_loss'],
            'take_profit': analysis['take_profit'],
            'embedding': embedding
        }), 200, {'Content-Type': 'application/json'}
        
    except Exception as e:
        return json.dumps({'error': str(e)}), 500, {'Content-Type': 'application/json'}

def get_crypto_data(symbol):
    """Obtiene datos de crypto desde Binance"""
    exchange = ccxt.binance()
    
    # Si el símbolo no tiene par, añadir /USDT
    if '/' not in symbol:
        symbol = f"{symbol}/USDT"
    
    ohlcv = exchange.fetch_ohlcv(symbol, '1h', limit=100)
    
    return {
        'symbol': symbol,
        'ohlcv': ohlcv,
        'current_price': exchange.fetch_ticker(symbol)['last']
    }

def get_stock_data(symbol):
    """Obtiene datos de stocks desde Yahoo Finance"""
    # Para acciones argentinas
    ticker = yf.Ticker(f"{symbol}.BA")
    
    hist = ticker.history(period='100d', interval='1d')
    
    return {
        'symbol': symbol,
        'ohlcv': hist.to_dict('records'),
        'current_price': hist['Close'].iloc[-1]
    }

def calculate_indicators(market_data):
    """Calcula indicadores técnicos"""
    ohlcv = market_data['ohlcv']
    
    # Extraer precios de cierre
    closes = [candle[4] if isinstance(candle, list) else candle['Close'] for candle in ohlcv]
    closes = np.array(closes)
    
    # RSI
    rsi = calculate_rsi(closes, 14)
    
    # SMAs
    sma20 = np.mean(closes[-20:])
    sma50 = np.mean(closes[-50:])
    
    # Volumen
    volumes = [candle[5] if isinstance(candle, list) else candle['Volume'] for candle in ohlcv]
    avg_volume = np.mean(volumes)
    current_volume = volumes[-1]
    volume_change = ((current_volume - avg_volume) / avg_volume) * 100
    
    # Tendencia
    trend = 'bullish' if closes[-1] > sma20 else 'bearish'
    
    return {
        'current_price': float(closes[-1]),
        'rsi': float(rsi[-1]),
        'sma20': float(sma20),
        'sma50': float(sma50),
        'volume_change': float(volume_change),
        'trend': trend
    }

def calculate_rsi(prices, period=14):
    """Calcula RSI"""
    deltas = np.diff(prices)
    gains = np.where(deltas > 0, deltas, 0)
    losses = np.where(deltas < 0, -deltas, 0)
    
    avg_gains = np.convolve(gains, np.ones(period)/period, mode='valid')
    avg_losses = np.convolve(losses, np.ones(period)/period, mode='valid')
    
    rs = avg_gains / (avg_losses + 1e-10)
    rsi = 100 - (100 / (1 + rs))
    
    return rsi

def generate_ai_analysis(asset_symbol, asset_type, indicators, risk_profile, max_trade_amount):
    """Genera análisis usando Gemini"""
    from vertexai.generative_models import GenerativeModel
    
    model = GenerativeModel("gemini-2.0-flash-001")
    
    prompt = f"""
Analiza el siguiente asset y proporciona una recomendación de trading.

Asset: {asset_symbol} ({asset_type})
Precio actual: ${indicators['current_price']}
RSI: {indicators['rsi']}
SMA20: ${indicators['sma20']}
SMA50: ${indicators['sma50']}
Cambio de volumen: {indicators['volume_change']}%
Tendencia: {indicators['trend']}

Perfil de riesgo del usuario: {risk_profile}
Capital máximo por trade: ${max_trade_amount}

Proporciona tu análisis en el siguiente formato JSON:

{{
  "decision": "BUY" | "SELL" | "HOLD",
  "confidence": 0.85,
  "reasoning": "Explicación detallada basada en indicadores...",
  "risk_assessment": "low" | "medium" | "high",
  "indicators_used": ["RSI", "SMA", "Volume"]
}}

IMPORTANTE: Responde SOLO con el JSON, sin texto adicional.
"""
    
    response = model.generate_content(prompt)
    analysis_text = response.text.strip()
    
    # Limpiar posibles backticks de markdown
    if analysis_text.startswith('```'):
        analysis_text = analysis_text.split('```')[1]
        if analysis_text.startswith('json'):
            analysis_text = analysis_text[4:]
        analysis_text = analysis_text.strip()
    
    analysis = json.loads(analysis_text)
    
    # Calcular precios de stop loss y take profit
    current_price = indicators['current_price']
    
    if analysis['decision'] == 'BUY':
        stop_loss = current_price * 0.95  # 5% abajo
        take_profit = current_price * 1.10  # 10% arriba
    elif analysis['decision'] == 'SELL':
        stop_loss = current_price * 1.05
        take_profit = current_price * 0.90
    else:
        stop_loss = None
        take_profit = None
    
    # Calcular monto sugerido basado en confianza y riesgo
    confidence_multiplier = analysis['confidence']
    risk_multipliers = {'conservative': 0.5, 'moderate': 0.75, 'aggressive': 1.0}
    suggested_amount = max_trade_amount * confidence_multiplier * risk_multipliers.get(risk_profile, 0.75)
    
    return {
        'decision': analysis['decision'],
        'ai_analysis': analysis,
        'suggested_amount': round(suggested_amount, 2),
        'stop_loss': round(stop_loss, 2) if stop_loss else None,
        'take_profit': round(take_profit, 2) if take_profit else None,
    }

def generate_embedding(text):
    """Genera embedding usando Vertex AI"""
    from vertexai.language_models import TextEmbeddingModel
    
    model = TextEmbeddingModel.from_pretrained("text-embedding-004")
    embeddings = model.get_embeddings([text])
    
    return embeddings[0].values
```

**Archivo: `google-cloud/analyze-asset/requirements.txt`**

```txt
functions-framework==3.*
google-cloud-aiplatform==1.38.0
ccxt==4.1.0
yfinance==0.2.32
numpy==1.24.3
```

**Archivo: `google-cloud/analyze-asset/deploy.sh`**

```bash
#!/bin/bash

gcloud functions deploy analyze-asset \
  --gen2 \
  --runtime=python311 \
  --region=us-central1 \
  --source=. \
  --entry-point=analyze_asset \
  --trigger-http \
  --allow-unauthenticated \
  --set-env-vars GCP_PROJECT_ID=YOUR_PROJECT_ID,GCP_LOCATION=us-central1 \
  --memory=512MB \
  --timeout=60s
```

### 2. Cloud Function: Evaluar Trade

**Archivo: `google-cloud/evaluate-trade/main.py`**

```python
import functions_framework
import json
import os
from google.cloud import aiplatform
import ccxt
import yfinance as yf

PROJECT_ID = os.environ.get('GCP_PROJECT_ID')
LOCATION = os.environ.get('GCP_LOCATION', 'us-central1')
aiplatform.init(project=PROJECT_ID, location=LOCATION)

@functions_framework.http
def evaluate_trade(request):
    """
    Evalúa el resultado de un trade y genera reflexión con IA
    """
    try:
        request_json = request.get_json()
        
        trade_id = request_json.get('trade_id')
        user_id = request_json.get('user_id')
        asset_symbol = request_json.get('asset_symbol')
        entry_price = request_json.get('entry_price')
        trade_type = request_json.get('trade_type')
        
        # Obtener precio actual
        current_price = get_current_price(asset_symbol)
        
        # Calcular P&L
        if trade_type == 'BUY':
            pnl_amount = current_price - entry_price
        else:  # SELL
            pnl_amount = entry_price - current_price
        
        pnl_percentage = (pnl_amount / entry_price) * 100
        
        # Determinar status
        if pnl_amount > 0:
            status = 'closed_profit'
        elif pnl_amount < 0:
            status = 'closed_loss'
        else:
            status = 'closed_breakeven'
        
        # Generar reflexión con IA
        ai_evaluation = generate_trade_reflection(
            asset_symbol,
            trade_type,
            entry_price,
            current_price,
            pnl_percentage,
            status
        )
        
        # Generar embedding
        embedding = generate_embedding(
            f"Trade {status}: {asset_symbol} {trade_type}. P&L: {pnl_percentage:.2f}%. Lesson: {ai_evaluation.get('lessons_learned', '')}"
        )
        
        return json.dumps({
            'current_price': current_price,
            'pnl_amount': round(pnl_amount, 2),
            'pnl_percentage': round(pnl_percentage, 2),
            'status': status,
            'ai_evaluation': ai_evaluation,
            'embedding': embedding
        }), 200, {'Content-Type': 'application/json'}
        
    except Exception as e:
        return json.dumps({'error': str(e)}), 500, {'Content-Type': 'application/json'}

def get_current_price(symbol):
    """Obtiene precio actual del asset"""
    try:
        # Intentar primero como crypto
        exchange = ccxt.binance()
        if '/' not in symbol:
            symbol = f"{symbol}/USDT"
        ticker = exchange.fetch_ticker(symbol)
        return ticker['last']
    except:
        # Si falla, intentar como stock
        ticker = yf.Ticker(f"{symbol}.BA")
        return ticker.history(period='1d')['Close'].iloc[-1]

def generate_trade_reflection(asset_symbol, trade_type, entry_price, exit_price, pnl_percentage, status):
    """Genera reflexión sobre el trade usando Gemini"""
    from vertexai.generative_models import GenerativeModel
    
    model = GenerativeModel("gemini-2.0-flash-001")
    
    prompt = f"""
Analiza el siguiente trade ejecutado y proporciona una reflexión crítica.

Asset: {asset_symbol}
Tipo: {trade_type}
Precio entrada: ${entry_price}
Precio salida: ${exit_price}
P&L: {pnl_percentage:.2f}%
Resultado: {status}

Analiza:
1. ¿Fue una buena decisión? ¿Por qué?
2. ¿Qué factores influyeron en el resultado?
3. ¿Qué aprendizaje específico se puede extraer?
4. ¿Recomendaciones para trades similares en el futuro?

Responde en formato JSON:

{{
  "success": true/false,
  "analysis": "Análisis detallado...",
  "lessons_learned": "Lecciones específicas...",
  "mistakes": "Errores..." o null,
  "confidence_in_learning": 0.8,
  "recommendations": "Recomendaciones..."
}}

IMPORTANTE: Responde SOLO con el JSON.
"""
    
    response = model.generate_content(prompt)
    evaluation_text = response.text.strip()
    
    # Limpiar markdown
    if evaluation_text.startswith('```'):
        evaluation_text = evaluation_text.split('```')[1]
        if evaluation_text.startswith('json'):
            evaluation_text = evaluation_text[4:]
        evaluation_text = evaluation_text.strip()
    
    return json.loads(evaluation_text)

def generate_embedding(text):
    """Genera embedding"""
    from vertexai.language_models import TextEmbeddingModel
    
    model = TextEmbeddingModel.from_pretrained("text-embedding-004")
    embeddings = model.get_embeddings([text])
    
    return embeddings[0].values
```

**Archivo: `google-cloud/evaluate-trade/requirements.txt`**

```txt
functions-framework==3.*
google-cloud-aiplatform==1.38.0
ccxt==4.1.0
yfinance==0.2.32
```

### 3. Cloud Function: Ejecutar Trade

**Archivo: `google-cloud/execute-trade/main.py`**

```python
import functions_framework
import json
import ccxt

@functions_framework.http
def execute_trade(request):
    """
    Ejecuta un trade en Binance
    """
    try:
        request_json = request.get_json()
        
        api_key = request_json.get('api_key')
        api_secret = request_json.get('api_secret')
        symbol = request_json.get('symbol')
        side = request_json.get('side')  # 'buy' o 'sell'
        amount = request_json.get('amount')  # en USD
        order_type = request_json.get('order_type', 'market')  # 'market' o 'limit'
        price = request_json.get('price')  # solo para limit orders
        
        # Inicializar exchange
        exchange = ccxt.binance({
            'apiKey': api_key,
            'secret': api_secret,
            'enableRateLimit': True,
        })
        
        # Convertir símbolo
        if '/' not in symbol:
            symbol = f"{symbol}/USDT"
        
        # Calcular cantidad en base al monto USD
        ticker = exchange.fetch_ticker(symbol)
        current_price = ticker['last']
        quantity = amount / current_price
        
        # Ejecutar orden
        if order_type == 'market':
            order = exchange.create_market_order(symbol, side, quantity)
        else:  # limit
            order = exchange.create_limit_order(symbol, side, quantity, price)
        
        return json.dumps({
            'success': True,
            'order_id': order['id'],
            'symbol': symbol,
            'side': side,
            'quantity': quantity,
            'price': order.get('price', current_price),
            'status': order['status'],
        }), 200, {'Content-Type': 'application/json'}
        
    except Exception as e:
        return json.dumps({
            'success': False,
            'error': str(e)
        }), 500, {'Content-Type': 'application/json'}
```

---

## 🚀 DEPLOYMENT

### 1. Deploy en Vercel

```bash
# Desde la raíz del proyecto
npm install -g vercel
vercel login
vercel

# Configurar variables de entorno en Vercel Dashboard:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - VERTEX_AI_PROJECT
# - VERTEX_AI_LOCATION
# - CLOUD_FUNCTION_ANALYZE_URL
# - CLOUD_FUNCTION_EVALUATE_URL
# - CLOUD_FUNCTION_EXECUTE_TRADE_URL
```

### 2. Deploy Edge Functions en Supabase

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link al proyecto
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy analyze-market
supabase functions deploy evaluate-trades

# Configurar secrets
supabase secrets set CLOUD_FUNCTION_ANALYZE_URL=https://...
supabase secrets set CLOUD_FUNCTION_EVALUATE_URL=https://...
```

### 3. Deploy Cloud Functions en Google Cloud

```bash
cd google-cloud/analyze-asset
chmod +x deploy.sh
./deploy.sh

cd ../evaluate-trade
chmod +x deploy.sh
./deploy.sh

cd ../execute-trade
chmod +x deploy.sh
./deploy.sh
```

---

## ✅ CHECKLIST FINAL

### Pre-Deploy
- [ ] Todas las variables de entorno configuradas
- [ ] Supabase migrations ejecutadas
- [ ] Google Cloud APIs habilitadas
- [ ] Service accounts creados
- [ ] Binance API keys configuradas (testnet primero)

### Deploy
- [ ] Next.js app deployada en Vercel
- [ ] Edge Functions deployadas en Supabase
- [ ] Cloud Functions deployadas en Google Cloud
- [ ] Cron jobs configurados

### Post-Deploy
- [ ] Probar flujo de registro/login
- [ ] Probar análisis de mercado manual
- [ ] Verificar que los cron jobs se ejecutan
- [ ] Probar chat con IA
- [ ] Probar tracker de bienestar
- [ ] Verificar notificaciones

### Testing
- [ ] Crear usuario de prueba
- [ ] Configurar trading en modo testnet
- [ ] Esperar análisis automático (1 hora)
- [ ] Aprobar una sugerencia
- [ ] Verificar ejecución del trade
- [ ] Esperar evaluación (24 horas)
- [ ] Verificar que se creó un aprendizaje

---

## 📚 DOCUMENTACIÓN ADICIONAL

### README.md del Proyecto

```markdown
# AI Trading & Wellness Assistant

Asistente personal de IA para trading inteligente, chat conversacional y tracking de bienestar.

## 🚀 Features

- **Trading Inteligente**: Análisis automático con Gemini 2.0
- **Aprendizaje Continuo**: La IA mejora con cada decisión
- **Chat IA**: Conversa sobre trading y bienestar
- **Tracker de Bienestar**: Ayuno intermitente, peso, ejercicio

## 🛠️ Stack

- Next.js 15 + TypeScript
- Supabase (Postgres + Vector Search)
- Google Vertex AI (Gemini 2.0)
- Binance API + Yahoo Finance

## 📦 Instalación

\`\`\`bash
npm install
cp .env.example .env.local
# Completar variables de entorno
npm run dev
\`\`\`

## 🗄️ Database Setup

\`\`\`bash
supabase db reset
# O ejecutar migrations manualmente
\`\`\`

## 🌐 Deploy

\`\`\`bash
vercel
\`\`\`

## 📖 Más info

Ver archivos PARTE_*.md para documentación completa.
```

---

## 🎓 PRÓXIMOS PASOS SUGERIDOS

1. **Fase 1**: MVP funcional (4-6 semanas)
   - Setup completo del proyecto
   - Autenticación y perfiles
   - Dashboard básico
   - Análisis manual de 1 asset

2. **Fase 2**: Automatización (2-3 semanas)
   - Edge Functions + Cron Jobs
   - Análisis automático cada hora
   - Sistema de notificaciones
   - Ejecución automática de trades

3. **Fase 3**: Aprendizaje (2-3 semanas)
   - Sistema de memoria vectorial
   - Reflexión automática
   - Aprendizajes guardados
   - Mejora continua

4. **Fase 4**: Bienestar + Chat (1-2 semanas)
   - Chat con IA completamente funcional
   - Tracker de ayuno
   - Métricas de salud
   - Integración completa

5. **Fase 5**: Refinamiento (ongoing)
   - UI/UX mejorado con Google Stitch
   - Más exchanges (forex, etc)
   - Telegram bot (opcional)
   - Más indicadores técnicos

---

**FIN DE PARTE 5**

---

# 🎉 PROMPT COMPLETO FINALIZADO

Este mega-prompt contiene TODO lo necesario para que Claude Code construya el asistente de IA de trading de principio a fin.

**Archivos del prompt:**
1. PARTE_1_ESTRUCTURA_Y_SETUP.md
2. PARTE_2_BACKEND_Y_SERVER_ACTIONS.md
3. PARTE_3_COMPONENTES_UI_Y_PAGINAS.md
4. PARTE_4_SISTEMA_IA_Y_APIS.md
5. PARTE_5_EDGE_FUNCTIONS_DEPLOYMENT.md (este archivo)

**Para usar con Claude Code:**
Simplemente pásale estos 5 archivos y pídele que construya el proyecto completo siguiendo las instrucciones paso a paso.

¡Buena suerte con tu asistente de IA! 🚀
