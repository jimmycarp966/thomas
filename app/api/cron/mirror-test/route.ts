import { NextResponse } from 'next/server'
import { mirrorTest } from '@/lib/ai/self-evolution'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (process.env.NODE_ENV === 'production' && process.env.CRON_SECRET) {
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    console.log('[MirrorTest] 🧠 Starting Mirror Test cron job...')

    const report = await mirrorTest()

    console.log('[MirrorTest] Report:', report)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      report
    })
  } catch (error: any) {
    console.error('[MirrorTest] Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
