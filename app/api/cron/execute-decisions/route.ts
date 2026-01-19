import { NextResponse } from 'next/server'
import { executePendingDecisions, checkStopLossAndTakeProfit } from '@/actions/auto-trading'

export async function GET(request: Request) {
  // Verificar que la solicitud viene de un cron job (usando un secreto)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Ejecutar decisiones pendientes
    const decisionsResult = await executePendingDecisions()

    // Verificar stop loss y take profit
    const stopLossResult = await checkStopLossAndTakeProfit()

    return NextResponse.json({
      success: true,
      decisions: decisionsResult,
      stopLoss: stopLossResult,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in cron job:', error)
    return NextResponse.json(
      { error: 'Failed to execute cron job' },
      { status: 500 }
    )
  }
}
