import yahooFinance from 'yahoo-finance2'

export class YahooFinanceClient {
  async getQuote(symbol: string) {
    try {
      return await yahooFinance.quote(symbol)
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error)
      throw error
    }
  }

  async getHistorical(
    symbol: string,
    period: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | '10y' | 'ytd' | 'max' = '1mo',
    interval: '1m' | '2m' | '5m' | '15m' | '30m' | '60m' | '90m' | '1h' | '1d' | '5d' | '1wk' | '1mo' | '3mo' = '1d'
  ) {
    try {
      return await yahooFinance.historical(symbol, {
        period,
        interval,
      })
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error)
      throw error
    }
  }

  async getMultipleQuotes(symbols: string[]) {
    try {
      const quotes = await Promise.all(
        symbols.map(symbol => this.getQuote(symbol))
      )
      return quotes
    } catch (error) {
      console.error('Error fetching multiple quotes:', error)
      throw error
    }
  }

  async search(query: string) {
    try {
      return await yahooFinance.search(query)
    } catch (error) {
      console.error(`Error searching for ${query}:`, error)
      throw error
    }
  }

  async getChart(symbol: string, interval: string = '1d', range: string = '1mo') {
    try {
      return await yahooFinance.chart(symbol, {
        interval,
        range,
      })
    } catch (error) {
      console.error(`Error fetching chart for ${symbol}:`, error)
      throw error
    }
  }

  async getArgentinianStocks(symbols: string[]) {
    try {
      return await this.getMultipleQuotes(symbols.map(s => `${s}.BA`))
    } catch (error) {
      console.error('Error fetching Argentinean stocks:', error)
      throw error
    }
  }
}

export function createYahooFinanceClient() {
  return new YahooFinanceClient()
}
