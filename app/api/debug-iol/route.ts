import { createClient } from '@/lib/supabase/server'
import { createIOLClient } from '@/lib/trading/iol-client'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()
    const results: any = { steps: [] }

    try {
        // Step 1: Get config
        const { data: config, error: configError } = await supabase
            .from('trading_config')
            .select('*')
            .limit(1)
            .maybeSingle()

        results.steps.push({
            step: 'fetch_config',
            success: !!config,
            hasUsername: !!config?.iol_username,
            hasPassword: !!config?.iol_password,
            error: configError?.message
        })

        if (!config?.iol_username || !config?.iol_password) {
            return NextResponse.json({ ...results, error: 'Missing IOL credentials' })
        }

        // Step 2: Create IOL client
        const iol = createIOLClient(config.iol_username, config.iol_password, true)
        results.steps.push({ step: 'create_client', success: true })

        // Step 3: Try to get portfolio
        try {
            const portfolio = await iol.getPortfolio()
            results.steps.push({
                step: 'get_portfolio',
                success: true,
                activeCount: portfolio?.activos?.length || 0,
                portfolioSample: portfolio?.activos?.slice(0, 2) || null
            })
        } catch (portfolioError: any) {
            results.steps.push({
                step: 'get_portfolio',
                success: false,
                error: portfolioError?.message || String(portfolioError)
            })
        }

        // Step 4: Try to get a quote
        try {
            const quote = await iol.getQuote('GGAL')
            results.steps.push({
                step: 'get_quote_GGAL',
                success: true,
                quote: {
                    ultimoPrecio: quote?.ultimoPrecio,
                    variacion: quote?.variacion,
                    variacionPorcentual: quote?.variacionPorcentual
                }
            })
        } catch (quoteError: any) {
            results.steps.push({
                step: 'get_quote_GGAL',
                success: false,
                error: quoteError?.message || String(quoteError)
            })
        }

        return NextResponse.json(results)
    } catch (error: any) {
        return NextResponse.json({
            ...results,
            error: error?.message || String(error)
        })
    }
}
