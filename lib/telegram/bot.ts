import { createClient } from '@/lib/supabase/server'

const TELEGRAM_API_URL = 'https://api.telegram.org'

export interface TelegramMessage {
  chat_id: string | number
  text: string
  parse_mode?: 'Markdown' | 'HTML'
  disable_notification?: boolean
}

export interface TelegramCommand {
  command: string
  description: string
}

export class TelegramBot {
  private token: string

  constructor(token: string) {
    this.token = token
  }

  async sendMessage(message: TelegramMessage): Promise<boolean> {
    try {
      const response = await fetch(`${TELEGRAM_API_URL}/bot${this.token}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      })

      const data = await response.json()

      if (!data.ok) {
        console.error('[TelegramBot] Error sending message:', data)
        return false
      }

      return true
    } catch (error) {
      console.error('[TelegramBot] Error sending message:', error)
      return false
    }
  }

  async setWebhook(url: string): Promise<boolean> {
    try {
      const response = await fetch(`${TELEGRAM_API_URL}/bot${this.token}/setWebhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      })

      const data = await response.json()

      if (!data.ok) {
        console.error('[TelegramBot] Error setting webhook:', data)
        return false
      }

      console.log('[TelegramBot] Webhook set successfully')
      return true
    } catch (error) {
      console.error('[TelegramBot] Error setting webhook:', error)
      return false
    }
  }

  async getWebhookInfo(): Promise<any> {
    try {
      const response = await fetch(`${TELEGRAM_API_URL}/bot${this.token}/getWebhookInfo`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('[TelegramBot] Error getting webhook info:', error)
      return null
    }
  }

  async deleteWebhook(): Promise<boolean> {
    try {
      const response = await fetch(`${TELEGRAM_API_URL}/bot${this.token}/deleteWebhook`, {
        method: 'POST'
      })

      const data = await response.json()

      if (!data.ok) {
        console.error('[TelegramBot] Error deleting webhook:', data)
        return false
      }

      console.log('[TelegramBot] Webhook deleted successfully')
      return true
    } catch (error) {
      console.error('[TelegramBot] Error deleting webhook:', error)
      return false
    }
  }

  async setMyCommands(commands: TelegramCommand[]): Promise<boolean> {
    try {
      const response = await fetch(`${TELEGRAM_API_URL}/bot${this.token}/setMyCommands`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ commands })
      })

      const data = await response.json()

      if (!data.ok) {
        console.error('[TelegramBot] Error setting commands:', data)
        return false
      }

      console.log('[TelegramBot] Commands set successfully')
      return true
    } catch (error) {
      console.error('[TelegramBot] Error setting commands:', error)
      return false
    }
  }
}

export async function handleTelegramUpdate(update: any): Promise<void> {
  const supabase = await createClient()

  const message = update.message || update.edited_message
  if (!message) return

  const chatId = message.chat.id
  const text = message.text

  if (!text) return

  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) {
    console.error('[TelegramBot] TELEGRAM_BOT_TOKEN not configured')
    return
  }

  const bot = new TelegramBot(token)

  if (text.startsWith('/')) {
    await handleCommand(text, chatId, bot)
  } else {
    await handleChatMessage(text, chatId, bot)
  }
}

async function handleCommand(command: string, chatId: number, bot: TelegramBot): Promise<void> {
  const supabase = await createClient()

  const parts = command.split(' ')
  const cmd = parts[0].toLowerCase()

  try {
    switch (cmd) {
      case '/start': {
        await bot.sendMessage({
          chat_id: chatId,
          text: `🤖 *Thomas Trading Bot*

Welcome! I'm your AI trading assistant.

Available commands:
/status - Get portfolio status
/pause - Pause auto-trading
/resume - Resume auto-trading
/report - Get daily report
/help - Show this message`,
          parse_mode: 'Markdown'
        })
        break
      }

      case '/help': {
        await bot.sendMessage({
          chat_id: chatId,
          text: `📋 *Available Commands*

/status - Get current portfolio status
/pause - Pause automatic trading
/resume - Resume automatic trading
/report - Get daily trading report
/help - Show this help message`,
          parse_mode: 'Markdown'
        })
        break
      }

      case '/status': {
        const { data: portfolio } = await supabase
          .from('trading_config')
          .select('*')
          .limit(1)
          .maybeSingle()

        const { data: positions } = await supabase
          .from('active_positions')
          .select('*')
          .eq('status', 'open')

        const { data: trades } = await supabase
          .from('trades')
          .select(`
            *,
            trade_results (
              pnl_percentage,
              status
            )
          `)
          .order('created_at', { ascending: false })
          .limit(5)

        const activePositions = positions?.length || 0
        const recentTrades = trades || []

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const todayTrades = recentTrades.filter(t => new Date(t.created_at) >= today)
        const dailyPnL = todayTrades.reduce((sum, t) => sum + (t.trade_results?.pnl_amount || 0), 0)

        await bot.sendMessage({
          chat_id: chatId,
          text: `📊 *Portfolio Status*

💰 Active Positions: ${activePositions}
📈 Today's P&L: $${dailyPnL.toFixed(2)}
🔄 Auto-trading: ${portfolio?.auto_execute ? '✅ Enabled' : '❌ Disabled'}

Recent trades: ${recentTrades.length}`,
          parse_mode: 'Markdown'
        })
        break
      }

      case '/pause': {
        await supabase
          .from('trading_config')
          .update({ auto_execute: false })
          .limit(1)

        await bot.sendMessage({
          chat_id: chatId,
          text: '🛑 Auto-trading has been paused.'
        })
        break
      }

      case '/resume': {
        await supabase
          .from('trading_config')
          .update({ auto_execute: true })
          .limit(1)

        await bot.sendMessage({
          chat_id: chatId,
          text: '▶️ Auto-trading has been resumed.'
        })
        break
      }

      case '/report': {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const { data: trades } = await supabase
          .from('trades')
          .select(`
            *,
            trade_results (
              pnl_percentage,
              status
            )
          `)
          .gte('created_at', today.toISOString())

        const winningTrades = trades?.filter(t => t.trade_results?.pnl_percentage && t.trade_results.pnl_percentage > 0) || []
        const losingTrades = trades?.filter(t => t.trade_results?.pnl_percentage && t.trade_results.pnl_percentage < 0) || []

        const totalPnL = trades?.reduce((sum, t) => sum + (t.trade_results?.pnl_amount || 0), 0) || 0
        const winRate = trades && trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0

        await bot.sendMessage({
          chat_id: chatId,
          text: `📋 *Daily Report*

📊 Total Trades: ${trades?.length || 0}
✅ Winning: ${winningTrades.length}
❌ Losing: ${losingTrades.length}
📈 Win Rate: ${winRate.toFixed(1)}%
💰 Total P&L: $${totalPnL.toFixed(2)}`,
          parse_mode: 'Markdown'
        })
        break
      }

      default: {
        await bot.sendMessage({
          chat_id: chatId,
          text: '❓ Unknown command. Type /help for available commands.'
        })
        break
      }
    }
  } catch (error) {
    console.error('[TelegramBot] Error handling command:', error)
    await bot.sendMessage({
      chat_id: chatId,
      text: '❌ Error processing command. Please try again.'
    })
  }
}

async function handleChatMessage(text: string, chatId: number, bot: TelegramBot): Promise<void> {
  await bot.sendMessage({
    chat_id: chatId,
    text: '💬 I can only process commands. Type /help for available commands.'
  })
}

export async function sendTradeNotification(
  symbol: string,
  type: 'BUY' | 'SELL',
  price: number,
  quantity: number,
  confidence: number
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.log('[TelegramBot] Telegram not configured, skipping notification')
    return
  }

  const bot = new TelegramBot(token)

  const emoji = type === 'BUY' ? '🟢' : '🔴'
  const action = type === 'BUY' ? 'BUY' : 'SELL'

  await bot.sendMessage({
    chat_id: chatId,
    text: `${emoji} *${action}: ${symbol}*

💰 Price: $${price.toFixed(2)}
📊 Quantity: ${quantity}
🎯 Confidence: ${confidence.toFixed(0)}%

Executed at ${new Date().toLocaleString()}`,
    parse_mode: 'Markdown'
  })
}

export async function sendAlertNotification(
  title: string,
  message: string
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.log('[TelegramBot] Telegram not configured, skipping notification')
    return
  }

  const bot = new TelegramBot(token)

  await bot.sendMessage({
    chat_id: chatId,
    text: `🚨 *${title}*

${message}

Time: ${new Date().toLocaleString()}`,
    parse_mode: 'Markdown'
  })
}
