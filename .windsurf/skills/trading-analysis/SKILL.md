---
name: trading-analysis
description: Analyze trading assets using Gemini AI with market data and technical indicators. Use when analyzing crypto, stocks, or other trading assets.
---

# Trading Analysis Skill

When analyzing trading assets, follow this process:

## Prerequisites

1. **Market Data Access**
   - Binance API for crypto
   - Yahoo Finance for stocks/ETFs
   - IOL Argentina for Argentine market

2. **AI Integration**
   - Google Vertex AI (Gemini 2.0)
   - Technical indicators calculation
   - Risk assessment

## Analysis Process

### Step 1: Gather Market Data
```typescript
// Fetch market data
const marketData = await getMarketData(assetSymbol, assetType);

// Calculate technical indicators
const indicators = {
  rsi: calculateRSI(marketData),
  sma: calculateSMA(marketData),
  volume: marketData.volume,
  price: marketData.currentPrice
};
```

### Step 2: Generate AI Analysis
```typescript
const analysis = await generateTradeAnalysis(
  assetSymbol,
  assetType,
  marketData,
  riskProfile,
  wellnessScore
);
```

### Step 3: Risk Assessment
- Check user's risk profile (conservative/moderate/aggressive)
- Verify wellness score (avoid trading when score < 50)
- Calculate position sizing based on portfolio
- Set stop-loss and take-profit levels

### Step 4: Decision Making
```typescript
const decision = {
  type: 'BUY' | 'SELL' | 'HOLD',
  confidence: 0-100,
  reasoning: analysis.reasoning,
  suggestedEntry: analysis.suggestedEntry,
  stopLoss: analysis.stopLoss,
  takeProfit: analysis.takeProfit
};
```

## Technical Indicators

### RSI (Relative Strength Index)
- **Oversold**: RSI < 30 (potential buy signal)
- **Overbought**: RSI > 70 (potential sell signal)
- **Neutral**: RSI between 30-70

### SMA (Simple Moving Average)
- **Golden Cross**: 50-day SMA crosses above 200-day SMA (bullish)
- **Death Cross**: 50-day SMA crosses below 200-day SMA (bearish)

### Volume Analysis
- High volume confirms trend strength
- Low volume suggests weak trend

## Risk Management

### Position Sizing
```typescript
const positionSize = (portfolioValue * riskPercentage) / (entryPrice - stopLoss);
```

### Stop-Loss Rules
- Conservative: 2-3% below entry
- Moderate: 3-5% below entry
- Aggressive: 5-8% below entry

### Take-Profit Rules
- Conservative: 1.5x risk
- Moderate: 2x risk
- Aggressive: 3x risk

## Wellness Integration

**Critical Rule**: Do not suggest trades when wellness score < 50

```typescript
if (wellnessScore < 50) {
  return {
    decision: 'HOLD',
    reasoning: 'Wellness score too low for trading',
    confidence: 100
  };
}
```

## Output Format

```typescript
{
  assetSymbol: string,
  assetType: 'crypto' | 'stock' | 'cedear',
  decision: 'BUY' | 'SELL' | 'HOLD',
  confidence: number,
  suggestedEntry: number,
  stopLoss: number,
  takeProfit: number,
  reasoning: string,
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
}
```

## Checklist

Before generating trading recommendation:
- [ ] Market data is current (within last 5 minutes)
- [ ] Technical indicators are calculated correctly
- [ ] User's risk profile is verified
- [ ] Wellness score is adequate (> 50)
- [ ] Position sizing is appropriate
- [ ] Stop-loss and take-profit are set
- [ ] Decision is logged for future learning

## Best Practices

1. **Never Guarantee Profits**: Always include risk disclaimer
2. **Educate User**: Explain reasoning behind recommendation
3. **Diversify**: Suggest diversification, not concentration
4. **Learn from Results**: Track outcomes for continuous improvement
5. **Respect Limits**: Follow user's risk tolerance and capital constraints
