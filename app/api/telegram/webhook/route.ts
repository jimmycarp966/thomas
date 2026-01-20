import { NextResponse } from 'next/server'
import { handleTelegramUpdate } from '@/lib/telegram/bot'

export async function POST(request: Request) {
  const body = await request.json()

  try {
    await handleTelegramUpdate(body)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[TelegramWebhook] Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN

  if (!token) {
    return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN not configured' }, { status: 500 })
  }

  const url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/telegram/webhook`

  const { TelegramBot } = await import('@/lib/telegram/bot')
  const bot = new TelegramBot(token)

  const success = await bot.setWebhook(url)

  if (success) {
    return NextResponse.json({ success: true, webhookUrl: url })
  } else {
    return NextResponse.json({ success: false, error: 'Failed to set webhook' }, { status: 500 })
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
