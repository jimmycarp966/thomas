# Thomas v2 - Features Inspiradas en JARVIS

## 🎯 Objetivo
Implementar las mejores prácticas de JARVIS para convertir a Thomas en un trader más inteligente, seguro y autónomo.

---

## 📋 Roadmap de Implementación

### Fase 1: Seguridad (Prioridad Alta)

#### 1.1 Circuit Breaker
**Descripción:** Pausar trading automáticamente para proteger el capital.

**Triggers:**
- 3 pérdidas consecutivas → Pausa 4 horas
- -5% del portfolio en un día → Pausa hasta mañana
- -10% semanal → Pausa + notificación urgente

**Implementación:**
```typescript
// lib/trading/circuit-breaker.ts
interface CircuitBreakerConfig {
  maxConsecutiveLosses: 3
  maxDailyLossPct: 5
  maxWeeklyLossPct: 10
  cooldownHours: 4
}
```

**Archivos a crear:**
- `lib/trading/circuit-breaker.ts`
- Modificar `scan-opportunities/route.ts` para verificar antes de operar

---

### Fase 2: Inteligencia (Prioridad Alta)

#### 2.1 Self-Evolution / Mirror Test
**Descripción:** Thomas analiza sus propios trades cada noche y aprende de errores.

**Flujo (3am Argentina):**
1. Revisar trades de las últimas 24h
2. Clasificar: WIN/LOSS y por qué
3. Identificar patrones de error
4. Ajustar parámetros (stop-loss, confidence threshold)
5. Guardar aprendizajes en `ai_learnings`

**Implementación:**
```typescript
// lib/ai/self-evolution.ts
async function mirrorTest() {
  const trades = await getTodayTrades()
  const analysis = await analyzeTradesWithAI(trades)
  await updateTradingParameters(analysis.recommendations)
  await saveLesson(analysis.insights)
}
```

**Archivos a crear:**
- `lib/ai/self-evolution.ts`
- `app/api/cron/mirror-test/route.ts`

---

#### 2.2 Backtesting
**Descripción:** Probar estrategias con datos históricos antes de usar dinero real.

**Flujo:**
1. Obtener datos históricos de IOL (6 meses)
2. Simular estrategia con datos pasados
3. Calcular métricas: Sharpe, Drawdown, Win Rate
4. Solo aprobar estrategias con Sharpe > 1.0

**Archivos a crear:**
- `lib/trading/backtester.ts`
- `app/backtesting/page.tsx` (UI opcional)

---

### Fase 3: Comunicación (Prioridad Media)

#### 3.1 Telegram Bot
**Descripción:** Notificaciones en el celular y comandos básicos.

**Funcionalidades:**
- 📈 Notificaciones de compra/venta
- 📊 Comando `/status` - estado del portfolio
- 🛑 Comando `/pause` - pausar trading
- 📋 Comando `/report` - reporte diario

**Implementación:**
```typescript
// lib/telegram/bot.ts
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN)

bot.onCommand('/status', async () => {
  const portfolio = await getPortfolioValue()
  return `💰 Portfolio: $${portfolio.total}\n📈 Hoy: ${portfolio.change}%`
})
```

**Archivos a crear:**
- `lib/telegram/bot.ts`
- `app/api/telegram/webhook/route.ts`

---

### Fase 4: Estrategias (Prioridad Media)

#### 4.1 Múltiples Estrategias
**Descripción:** No solo "comprar cuando la confianza es alta".

**Estrategias a implementar:**
1. **Momentum** - Comprar activos en tendencia alcista
2. **Mean Reversion** - Comprar cuando está sobrevendido (RSI < 30)
3. **Breakout** - Comprar cuando rompe resistencia
4. **DCA** - Comprar un monto fijo cada semana

**Archivos a crear:**
- `lib/trading/strategies/momentum.ts`
- `lib/trading/strategies/mean-reversion.ts`
- `lib/trading/strategies/breakout.ts`
- `lib/trading/strategies/dca.ts`

---

#### 4.2 Trust Ladder
**Descripción:** Thomas gana autonomía según su rendimiento.

**Niveles:**
| Nivel | Requisito | Autonomía |
|-------|-----------|-----------|
| 1 - Novato | Recién empezó | Solo sugiere, no ejecuta |
| 2 - Aprendiz | Win rate > 50% (10 trades) | Ejecuta hasta $500/trade |
| 3 - Trader | Win rate > 55% (50 trades) | Ejecuta hasta $2000/trade |
| 4 - Experto | Win rate > 60% (100 trades) | Ejecuta sin límite |

**Archivos a crear:**
- `lib/trading/trust-ladder.ts`
- Modificar `trading_config` para guardar nivel actual

---

## ⏱️ Cronograma Estimado

| Fase | Feature | Tiempo | Prioridad |
|------|---------|--------|-----------|
| 1.1 | Circuit Breaker | 1h | 🔴 Alta |
| 2.1 | Self-Evolution | 2h | 🔴 Alta |
| 2.2 | Backtesting | 3h | 🔴 Alta |
| 3.1 | Telegram Bot | 2h | 🟡 Media |
| 4.1 | Múltiples Estrategias | 4h | 🟡 Media |
| 4.2 | Trust Ladder | 1h | 🟡 Media |

**Total: ~13 horas**

---

## 📌 Próximos Pasos

1. [ ] Implementar Circuit Breaker (protección inmediata)
2. [ ] Implementar Self-Evolution (Thomas aprende solo)
3. [ ] Configurar Telegram Bot (notificaciones móviles)
4. [ ] Agregar estrategias adicionales
5. [ ] Implementar Trust Ladder
6. [ ] Agregar backtesting para validar estrategias
