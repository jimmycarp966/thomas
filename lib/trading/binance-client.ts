import ccxt from 'ccxt'

export class BinanceClient {
  private exchange: any

  constructor(apiKey?: string, apiSecret?: string) {
    this.exchange = new ccxt.binance({
      apiKey: apiKey || '',
      secret: apiSecret || '',
      enableRateLimit: true,
      options: {
        defaultType: 'spot',
      },
    })
  }

  async getTicker(symbol: string) {
    try {
      return await this.exchange.fetchTicker(symbol)
    } catch (error) {
      console.error(`Error fetching ticker for ${symbol}:`, error)
      throw error
    }
  }

  async getOHLCV(symbol: string, timeframe: string = '1h', limit: number = 100) {
    try {
      return await this.exchange.fetchOHLCV(symbol, timeframe, undefined, limit)
    } catch (error) {
      console.error(`Error fetching OHLCV for ${symbol}:`, error)
      throw error
    }
  }

  async getBalance() {
    try {
      return await this.exchange.fetchBalance()
    } catch (error) {
      console.error('Error fetching balance:', error)
      throw error
    }
  }

  async createOrder(
    symbol: string,
    type: 'market' | 'limit',
    side: 'buy' | 'sell',
    amount: number,
    price?: number
  ) {
    try {
      if (type === 'market') {
        return await this.exchange.createMarketOrder(symbol, side, amount)
      } else {
        if (!price) {
          throw new Error('Price is required for limit orders')
        }
        return await this.exchange.createLimitOrder(symbol, side, amount, price)
      }
    } catch (error) {
      console.error(`Error creating ${type} ${side} order for ${symbol}:`, error)
      throw error
    }
  }

  async getOpenOrders(symbol?: string) {
    try {
      return await this.exchange.fetchOpenOrders(symbol)
    } catch (error) {
      console.error('Error fetching open orders:', error)
      throw error
    }
  }

  async cancelOrder(orderId: string, symbol: string) {
    try {
      return await this.exchange.cancelOrder(orderId, symbol)
    } catch (error) {
      console.error(`Error cancelling order ${orderId}:`, error)
      throw error
    }
  }

  async getOrder(orderId: string, symbol: string) {
    try {
      return await this.exchange.fetchOrder(orderId, symbol)
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error)
      throw error
    }
  }

  async getAccountInfo() {
    try {
      return await this.exchange.fetchAccountInfo()
    } catch (error) {
      console.error('Error fetching account info:', error)
      throw error
    }
  }
}

export function createBinanceClient(apiKey?: string, apiSecret?: string) {
  return new BinanceClient(apiKey, apiSecret)
}
