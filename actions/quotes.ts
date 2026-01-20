'use server'

import { createClient } from '@/lib/supabase/server'
import { createIOLClient } from '@/lib/trading/iol-client'
import { createBinanceClient } from '@/lib/trading/binance-client'

export type QuoteData = {
    symbol: string
    price: number
    change: number
    changePercent: number
    high: number
    low: number
    volume: number
    exchange: 'iol' | 'binance'
    assetType: string
    lastUpdate: string
}

/**
 * Obtiene cotizaciones en tiempo real de los activos.
 */
export async function getLiveQuotes(): Promise<{ quotes: QuoteData[], error?: string }> {
    console.log('[Quotes] ========== START getLiveQuotes ==========')
    const supabase = await createClient()

    try {
        console.log('[Quotes] Fetching trading config...')
        const { data: config } = await supabase
            .from('trading_config')
            .select('*')
            .limit(1)
            .maybeSingle()

        console.log('[Quotes] Config result:', config ? 'found' : 'null')
        if (config) {
            console.log('[Quotes] Config keys:', Object.keys(config))
        }

        const quotes: QuoteData[] = []

        // Cotizaciones de IOL (Mercado Argentino)
        console.log('[Quotes] Checking IOL config:', {
            hasUsername: !!config?.iol_username,
            hasPassword: !!config?.iol_password,
            hasApiKey: !!config?.iol_api_key,
            hasApiSecret: !!config?.iol_api_secret,
            usernameValue: config?.iol_username,
            configExists: !!config
        })

        if ((config?.iol_username) && (config?.iol_password)) {
            console.log('[Quotes] IOL credentials found, attempting to fetch quotes...')
            try {
                const iol = createIOLClient(
                    config.iol_username,
                    config.iol_password,
                    true
                )

                // Obtener portafolio para saber qué activos tiene
                console.log('[Quotes] Fetching IOL portfolio...')
                const portfolio = await iol.getPortfolio()
                console.log('[Quotes] IOL portfolio result:', portfolio ? 'success' : 'null', portfolio?.activos?.length || 0, 'assets')

                if (portfolio?.activos) {
                    for (const asset of portfolio.activos) {
                        const ticker = asset.titulo?.simbolo
                        if (!ticker) continue

                        try {
                            const quote = await iol.getQuote(ticker)
                            quotes.push({
                                symbol: ticker,
                                price: quote?.ultimoPrecio || asset.valorActual || 0,
                                change: quote?.variacion || 0,
                                changePercent: quote?.variacionPorcentual || 0,
                                high: quote?.maximo || 0,
                                low: quote?.minimo || 0,
                                volume: quote?.volumen || 0,
                                exchange: 'iol',
                                assetType: asset.titulo?.tipo || 'stock',
                                lastUpdate: new Date().toISOString(),
                            })
                        } catch (e) {
                            // Si falla una cotización individual, continuar con las demás
                            console.error(`Error fetching quote for ${ticker}:`, e)
                        }
                    }
                }

                // Agregar algunos activos populares si no hay portafolio
                if (quotes.filter(q => q.exchange === 'iol').length === 0) {
                    console.log('[Quotes] No portfolio assets, fetching popular tickers...')
                    const popularTickers = ['GGAL', 'YPFD', 'PAMP', 'BMA', 'BBAR']
                    for (const ticker of popularTickers) {
                        try {
                            const quote = await iol.getQuote(ticker)
                            console.log(`[Quotes] ${ticker} quote:`, quote ? 'success' : 'null')
                            if (quote) {
                                quotes.push({
                                    symbol: ticker,
                                    price: quote.ultimoPrecio || 0,
                                    change: quote.variacion || 0,
                                    changePercent: quote.variacionPorcentual || 0,
                                    high: quote.maximo || 0,
                                    low: quote.minimo || 0,
                                    volume: quote.volumen || 0,
                                    exchange: 'iol',
                                    assetType: 'stock',
                                    lastUpdate: new Date().toISOString(),
                                })
                            }
                        } catch (e) {
                            console.error(`Error fetching popular ticker ${ticker}:`, e)
                        }
                    }
                }
                console.log('[Quotes] IOL quotes fetched:', quotes.filter(q => q.exchange === 'iol').length)
            } catch (error) {
                console.error('[Quotes] Error fetching IOL quotes:', error)
            }
        } else {
            console.log('[Quotes] IOL credentials NOT found in config')
        }

        // Cotizaciones de Binance (Crypto)
        if (config?.binance_api_key && config?.binance_api_secret) {
            try {
                const binance = createBinanceClient(config.binance_api_key, config.binance_api_secret)

                // Cryptos populares
                const cryptoSymbols = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT']

                for (const symbol of cryptoSymbols) {
                    try {
                        const ticker = await binance.getTicker(symbol)
                        quotes.push({
                            symbol: symbol.replace('/USDT', ''),
                            price: ticker?.last || 0,
                            change: ticker?.change || 0,
                            changePercent: ticker?.percentage || 0,
                            high: ticker?.high || 0,
                            low: ticker?.low || 0,
                            volume: ticker?.baseVolume || 0,
                            exchange: 'binance',
                            assetType: 'crypto',
                            lastUpdate: new Date().toISOString(),
                        })
                    } catch (e) {
                        console.error(`Error fetching crypto ${symbol}:`, e)
                    }
                }
            } catch (error) {
                console.error('Error fetching Binance quotes:', error)
            }
        } else {
            // Si no hay API de Binance, usar cotizaciones públicas (sin auth)
            try {
                const binance = createBinanceClient()
                const cryptoSymbols = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT']

                for (const symbol of cryptoSymbols) {
                    try {
                        const ticker = await binance.getTicker(symbol)
                        quotes.push({
                            symbol: symbol.replace('/USDT', ''),
                            price: ticker?.last || 0,
                            change: ticker?.change || 0,
                            changePercent: ticker?.percentage || 0,
                            high: ticker?.high || 0,
                            low: ticker?.low || 0,
                            volume: ticker?.baseVolume || 0,
                            exchange: 'binance',
                            assetType: 'crypto',
                            lastUpdate: new Date().toISOString(),
                        })
                    } catch (e) {
                        console.error(`Error fetching public crypto ${symbol}:`, e)
                    }
                }
            } catch (error) {
                console.error('Error fetching public Binance quotes:', error)
            }
        }

        return { quotes }
    } catch (error) {
        console.error('Error getting live quotes:', error)
        return { quotes: [], error: 'Failed to fetch quotes' }
    }
}

/**
 * Obtiene la cotización de un activo específico.
 */
export async function getQuote(symbol: string, exchange: 'iol' | 'binance'): Promise<QuoteData | null> {
    const supabase = await createClient()

    try {
        const { data: config } = await supabase
            .from('trading_config')
            .select('*')
            .limit(1)
            .maybeSingle()

        if (exchange === 'iol') {
            if (!config?.iol_username || !config?.iol_password) return null

            const iol = createIOLClient(
                config.iol_username,
                config.iol_password,
                true
            )

            const quote = await iol.getQuote(symbol)
            if (!quote) return null

            return {
                symbol,
                price: quote.ultimoPrecio || 0,
                change: quote.variacion || 0,
                changePercent: quote.variacionPorcentual || 0,
                high: quote.maximo || 0,
                low: quote.minimo || 0,
                volume: quote.volumen || 0,
                exchange: 'iol',
                assetType: 'stock',
                lastUpdate: new Date().toISOString(),
            }
        } else {
            const binance = createBinanceClient(config?.binance_api_key, config?.binance_api_secret)
            const ticker = await binance.getTicker(`${symbol}/USDT`)

            return {
                symbol,
                price: ticker?.last || 0,
                change: ticker?.change || 0,
                changePercent: ticker?.percentage || 0,
                high: ticker?.high || 0,
                low: ticker?.low || 0,
                volume: ticker?.baseVolume || 0,
                exchange: 'binance',
                assetType: 'crypto',
                lastUpdate: new Date().toISOString(),
            }
        }
    } catch (error) {
        console.error(`Error getting quote for ${symbol}:`, error)
        return null
    }
}
