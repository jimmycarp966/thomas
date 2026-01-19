import functions_framework
from supabase import create_client, Client
from google.cloud import vertexai
import ccxt
import os
import json
from datetime import datetime

def get_supabase_client():
    """Initialize Supabase client"""
    supabase_url = os.environ.get('SUPABASE_URL')
    supabase_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    return create_client(supabase_url, supabase_key)

def init_vertexai():
    """Initialize Vertex AI"""
    try:
        google_cloud_project = os.environ.get('GOOGLE_CLOUD_PROJECT_ID')
        if google_cloud_project:
            vertexai.init(project=google_cloud_project)
            return True
        return False
    except Exception as e:
        print(f"Warning: Could not initialize Vertex AI: {e}")
        return False

@functions_framework.http
def analyze_trading_signal(request):
    """
    Analyze trading signals and generate AI recommendations
    Triggered by cron job or manual invocation
    """
    try:
        # Initialize clients
        supabase = get_supabase_client()
        vertexai_initialized = init_vertexai()
        
        request_json = request.get_json()
        decision_id = request_json.get('decision_id')
        
        if not decision_id:
            return json.dumps({'error': 'decision_id is required'}), 400
        
        # Fetch the trading decision
        decision = supabase.table('trading_decisions').select('*').eq('id', decision_id).execute().data
        
        if not decision:
            return json.dumps({'error': 'Decision not found'}), 404
        
        decision = decision[0]
        
        # Fetch user's trading config
        config = supabase.table('trading_config').select('*').eq('user_id', decision['user_id']).execute().data
        
        if not config:
            return json.dumps({'error': 'User config not found'}), 404
        
        config = config[0]
        
        # Get market data
        market_data = fetch_market_data(decision['asset_symbol'], decision['asset_type'])
        
        # Get user's wellness state
        wellness = get_user_wellness(supabase, decision['user_id'])
        
        # Generate AI analysis
        if vertexai_initialized:
            analysis = generate_ai_analysis(decision, market_data, config, wellness)
        else:
            analysis = {
                'analysis': 'Vertex AI not available',
                'generated_at': datetime.now().isoformat(),
                'market_data': market_data,
                'wellness_state': wellness
            }
        
        # Update decision with analysis
        supabase.table('trading_decisions').update({
            'ai_analysis': analysis,
            'updated_at': datetime.now().isoformat()
        }).eq('id', decision_id).execute()
        
        return json.dumps({
            'success': True,
            'decision_id': decision_id,
            'analysis': analysis
        }), 200
        
    except Exception as e:
        print(f"Error in analyze_trading_signal: {e}"")
        return json.dumps({'error': str(e)}), 500

@functions_framework.http
def execute_trade(request):
    """
    Execute a trade based on an approved decision
    Triggered by cron job or manual invocation
    """
    try:
        # Initialize clients
        supabase = get_supabase_client()
        
        request_json = request.get_json()
        decision_id = request_json.get('decision_id')
        
        if not decision_id:
            return json.dumps({'error': 'decision_id is required'}), 400
        
        # Fetch the trading decision
        decision = supabase.table('trading_decisions').select('*').eq('id', decision_id).execute().data
        
        if not decision:
            return json.dumps({'error': 'Decision not found'}), 404
        
        decision = decision[0]
        
        # Fetch user's trading config
        config = supabase.table('trading_config').select('*').eq('user_id', decision['user_id']).execute().data
        
        if not config:
            return json.dumps({'error': 'User config not found'}), 404
        
        config = config[0]
        
        # Execute trade on appropriate exchange
        trade_result = execute_on_exchange(decision, config)
        
        if trade_result['success']:
            # Create trade record
            trade = supabase.table('trades').insert({
                'user_id': decision['user_id'],
                'decision_id': decision_id,
                'exchange': trade_result['exchange'],
                'asset_symbol': decision['asset_symbol'],
                'trade_type': decision['decision_type'],
                'quantity': decision['suggested_amount'],
                'price': trade_result['price'],
                'total_amount': trade_result['total_amount'],
                'fees': trade_result['fees'],
                'status': 'executed',
                'exchange_order_id': trade_result['order_id'],
                'executed_at': datetime.now().isoformat()
            }).execute().data[0]
            
            # Create trade result record
            supabase.table('trade_results').insert({
                'trade_id': trade['id'],
                'user_id': decision['user_id'],
                'entry_price': trade['price'],
                'status': 'open',
                'opened_at': datetime.now().isoformat()
            }).execute()
            
            # Update decision status
            supabase.table('trading_decisions').update({
                'status': 'executed',
                'decided_at': datetime.now().isoformat()
            }).eq('id', decision_id).execute()
            
            return json.dumps({
                'success': True,
                'trade_id': trade['id'],
                'trade_result': trade_result
            }), 200
        else:
            return json.dumps({
                'error': 'Trade execution failed',
                'details': trade_result
            }), 400
            
    except Exception as e:
        print(f"Error in execute_trade: {e}")
        return json.dumps({'error': str(e)}), 500

@functions_framework.http
def monitor_positions(request):
    """
    Monitor open positions and generate exit signals
    Triggered by cron job every 5 minutes
    """
    try:
        # Initialize clients
        supabase = get_supabase_client()
        
        # Fetch all open trades
        open_trades = supabase.table('trades').select('*').eq('status', 'executed').execute().data
        
        for trade in open_trades:
            # Get trade result
            trade_results = supabase.table('trade_results').select('*').eq('trade_id', trade['id']).eq('status', 'open').execute().data
            
            for result in trade_results:
                # Get current price
                current_price = get_current_price(trade['asset_symbol'], trade['exchange'])
                
                if current_price:
                    pnl_percentage = ((current_price - result['entry_price']) / result['entry_price']) * 100
                    
                    # Check if stop loss or take profit is hit
                    stop_loss_hit = pnl_percentage <= -5
                    take_profit_hit = pnl_percentage >= 10
                    
                    if stop_loss_hit or take_profit_hit:
                        # Close the trade
                        close_trade(supabase, trade, result, current_price, pnl_percentage)
        
        return json.dumps({
            'success': True,
            'monitored_trades': len(open_trades)
        }), 200
        
    except Exception as e:
        print(f"Error in monitor_positions: {e}"")
        return json.dumps({'error': str(e)}), 500

def fetch_market_data(symbol: str, asset_type: str):
    """Fetch market data from appropriate exchange"""
    if asset_type == 'crypto':
        exchange = ccxt.binance()
        ticker = exchange.fetch_ticker(symbol)
        return {
            'price': ticker['last'],
            'change': ticker['percentage'],
            'volume': ticker['quoteVolume'],
            'high': ticker['high'],
            'low': ticker['low']
        }
    else:
        # For stocks/CEDEARs, use Yahoo Finance or other API
        return {
            'price': 0,
            'change': 0,
            'volume': 0,
            'high': 0,
            'low': 0
        }

def get_user_wellness(supabase: Client, user_id: str):
    """Get user's current wellness state"""
    wellness = supabase.table('wellness_tracking').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(1).execute().data
    
    if wellness:
        return wellness[0]
    return None

def generate_ai_analysis(decision: dict, market_data: dict, config: dict, wellness: dict):
    """Generate AI-based trading analysis using Vertex AI"""
    model = vertexai.generative_model('gemini-2.0-flash-exp')
    
    prompt = f"""
    Analyze this trading opportunity and provide a recommendation:
    
    Asset: {decision['asset_symbol']}
    Type: {decision['asset_type']}
    Decision Type: {decision['decision_type']}
    User Risk Profile: {config['risk_profile']}
    
    Market Data:
    - Price: {market_data['price']}
    - Change: {market_data['change']}%
    - Volume: {market_data['volume']}
    - High: {market_data['high']}
    - Low: {market_data['low']}
    
    User Wellness:
    - Wellness Score: {wellness['wellness_score'] if wellness else 'N/A'}
    - Mood: {wellness['mood'] if wellness else 'N/A'}
    - Energy: {wellness['energy'] if wellness else 'N/A'}
    - Fasting Hours: {wellness['fasting_hours'] if wellness else 'N/A'}
    
    Provide a detailed analysis including:
    1. Technical indicators
    2. Risk assessment
    3. Recommendation (BUY/SELL/HOLD)
    4. Confidence level (0-100)
    5. Suggested entry, exit, stop loss, and take profit prices
    6. Reasoning
    
    Consider the user's risk profile and wellness state. If wellness is low, recommend being more conservative.
    """
    
    response = model.generate_content(prompt)
    
    return {
        'analysis': response.text,
        'generated_at': datetime.now().isoformat(),
        'market_data': market_data,
        'wellness_state': wellness
    }

def execute_on_exchange(decision: dict, config: dict):
    """Execute trade on appropriate exchange"""
    try:
        if decision['asset_type'] == 'crypto' and config.get('binance_api_key'):
            exchange = ccxt.binance({
                'apiKey': config['binance_api_key'],
                'secret': config['binance_api_secret']
            })
            
            order_type = 'market' if not decision['suggested_price'] else 'limit'
            side = 'buy' if decision['decision_type'] == 'BUY' else 'sell'
            
            if order_type == 'market':
                order = exchange.create_market_order(decision['asset_symbol'], side, decision['suggested_amount'])
            else:
                order = exchange.create_limit_order(decision['asset_symbol'], side, decision['suggested_amount'], decision['suggested_price'])
            
            return {
                'success': True,
                'exchange': 'binance',
                'order_id': order['id'],
                'price': order['price'] if order_type == 'market' else decision['suggested_price'],
                'total_amount': order['cost'] if order_type == 'market' else (decision['suggested_amount'] * decision['suggested_price']),
                'fees': order['fee']['cost'] if 'fee' in order else 0
            }
        else:
            return {
                'success': False,
                'error': 'Exchange not configured or not supported'
            }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def get_current_price(symbol: str, exchange: str):
    """Get current price for an asset"""
    try:
        if exchange == 'binance':
            ex = ccxt.binance()
            ticker = ex.fetch_ticker(symbol)
            return ticker['last']
        # Add other exchanges as needed
        return None
    except Exception as e:
        print(f"Error fetching price for {symbol}: {e}"")
        return None

def close_trade(supabase: Client, trade: dict, result: dict, current_price: float, pnl_percentage: float):
    """Close a trade and record the result"""
    status = 'closed_profit' if pnl_percentage > 0 else 'closed_loss' if pnl_percentage < 0 else 'closed_breakeven'
    
    # Update trade result
    supabase.table('trade_results').update({
        'exit_price': current_price,
        'pnl_amount': (current_price - result['entry_price']) * trade['quantity'],
        'pnl_percentage': pnl_percentage,
        'status': status,
        'closed_at': datetime.now().isoformat()
    }).eq('id', result['id']).execute()
    
    # Update trade status
    supabase.table('trades').update({
        'status': 'closed'
    }).eq('id', trade['id']).execute()
    
    # Store learning from this trade
    store_learning_from_trade(supabase, trade, result, current_price, pnl_percentage)

def store_learning_from_trade(supabase: Client, trade: dict, result: dict, exit_price: float, pnl_percentage: float):
    """Store learning from trade result for future analysis"""
    learning_type = 'success_pattern' if pnl_percentage > 0 else 'failure_pattern'
    importance_score = min(abs(pnl_percentage) * 10, 100)
    
    supabase.table('ai_learnings').insert({
        'user_id': trade['user_id'],
        'learning_type': learning_type,
        'content': {
            'asset_symbol': trade['asset_symbol'],
            'trade_type': trade['trade_type'],
            'entry_price': result['entry_price'],
            'exit_price': exit_price,
            'pnl_percentage': pnl_percentage,
            'decision_type': trade.get('decision', {}).get('decision_type'),
            'ai_analysis': trade.get('decision', {}).get('ai_analysis')
        },
        'importance_score': importance_score,
        'related_decisions': [trade['decision_id']],
        'related_trades': [trade['id']],
        'created_at': datetime.now().isoformat()
    }).execute()