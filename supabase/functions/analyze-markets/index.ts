import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async (req: Request) => {
  try {
    const { data: users } = await supabase
      .from('trading_config')
      .select('user_id, binance_api_key, binance_api_secret, iol_api_key, iol_api_secret')
      .not('binance_api_key', 'is', null)
      .not('binance_api_secret', 'is', null)

    for (const user of users || []) {
      try {
        await analyzeUserMarket(user.user_id, user.binance_api_key!, user.binance_api_secret!)
      } catch (error) {
        console.error(`Error analyzing market for user ${user.user_id}:`, error)
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Market analysis completed' }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in analyze-markets function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

async function analyzeUserMarket(userId: string, apiKey: string, apiSecret: string) {
  const { data: config } = await supabase
    .from('trading_config')
    .select('allowed_assets, risk_profile')
    .eq('user_id', userId)
    .single()

  if (!config) return

  for (const asset of config.allowed_assets || []) {
    try {
      const marketData = await fetchBinanceData(asset.symbol, apiKey, apiSecret)
      
      const { data: existingDecision } = await supabase
        .from('trading_decisions')
        .select('*')
        .eq('user_id', userId)
        .eq('asset_symbol', asset.symbol)
        .eq('status', 'pending')
        .single()

      if (existingDecision) {
        await supabase
          .from('trading_decisions')
          .update({
            ai_analysis: {
              ...existingDecision.ai_analysis,
              current_price: marketData.price,
              current_change: marketData.change,
            },
          })
          .eq('id', existingDecision.id)
      }
    } catch (error) {
      console.error(`Error analyzing asset ${asset.symbol}:`, error)
    }
  }
}

async function fetchBinanceData(symbol: string, apiKey: string, apiSecret: string) {
  const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
  const data = await response.json()
  
  return {
    symbol: data.symbol,
    price: parseFloat(data.lastPrice),
    change: parseFloat(data.priceChangePercent),
    volume: parseFloat(data.volume),
    high: parseFloat(data.highPrice),
    low: parseFloat(data.lowPrice),
  }
}
