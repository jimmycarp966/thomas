import { NextResponse } from 'next/server'
import { monitorPositions } from '@/lib/trading/position-monitor'

// Este endpoint es llamado por Vercel Cron cada 5 minutos
// para verificar stop-loss, take-profit y trailing stops
export async function GET(request: Request) {
    // Verificar que viene de Vercel Cron (seguridad)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // En desarrollo, permitir sin token
        if (process.env.NODE_ENV === 'production' && !process.env.CRON_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
    }

    try {
        console.log('[Cron] Monitor de posiciones iniciado...')
        const results = await monitorPositions()

        const actionsExecuted = results.filter(r => r.action !== 'none')

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            positionsChecked: results.length,
            actionsExecuted: actionsExecuted.length,
            details: actionsExecuted
        })
    } catch (error: any) {
        console.error('[Cron] Error en monitor de posiciones:', error)
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
