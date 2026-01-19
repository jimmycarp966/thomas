# Plan de Implementación - AI Trading & Wellness Assistant

Construir una aplicación web completa de asistente personal de IA para trading inteligente, chat conversacional y tracking de bienestar con Next.js 15, Supabase y Google Vertex AI.

---

## 📋 Visión General

Este proyecto consiste en crear un asistente personal de IA con 4 módulos principales:
1. **Trading Inteligente** - Análisis automático de mercados con Gemini 2.0
2. **Chat Conversacional** - Interfaz tipo ChatGPT con contexto completo
3. **Tracker de Bienestar** - Ayuno intermitente, peso y métricas de salud
4. **Sistema de Aprendizaje** - Memoria vectorial y mejora continua

---

## 🎯 Stack Tecnológico

**Frontend:** Next.js 15, TypeScript 5.3+, React 19, Tailwind CSS, shadcn/ui
**Backend:** Supabase (Postgres, Auth, Storage, pgvector, Realtime, Edge Functions)
**AI:** Google Vertex AI (Gemini 2.0 Flash, Text Embeddings), Google Cloud Functions (Python)
**Trading:** ccxt (Python), Binance API, Yahoo Finance, IOL Argentina API
**Deployment:** Vercel, Supabase Cloud, Google Cloud

---

## 📁 Estructura del Proyecto

```
ai-trading-assistant/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rutas autenticadas
│   │   ├── dashboard/
│   │   ├── trading/
│   │   ├── chat/
│   │   ├── wellness/
│   │   └── settings/
│   ├── (public)/          # Login/Register
│   └── layout.tsx
├── components/            # UI components
│   ├── ui/               # shadcn/ui
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── ThemeToggle.tsx
├── lib/                   # Libraries
│   ├── supabase/         # Client, server, middleware
│   ├── ai/               # Gemini, embeddings, prompts, memory
│   └── trading/          # Exchanges, analysis
├── actions/              # Server Actions
│   ├── auth.ts
│   ├── trading.ts
│   ├── chat.ts
│   └── wellness.ts
├── supabase/
│   ├── migrations/       # SQL schemas
│   └── functions/        # Edge Functions
├── google-cloud/         # Python Cloud Functions
└── diseño/               # Google Stitch design assets
```

---

## 🚀 Plan de Implementación por Fases

### FASE 1: Setup Inicial y Estructura Base

**Objetivo:** Configurar el proyecto Next.js con todas las dependencias y estructura de carpetas.

**Tareas:**
1. Crear proyecto Next.js 15 con TypeScript y Tailwind CSS
2. Instalar dependencias:
   - `@supabase/supabase-js`, `@supabase/auth-helpers-nextjs`
   - `@google-cloud/vertexai`
   - `shadcn/ui` y componentes necesarios
   - `react-hook-form`, `zod`, `@tanstack/react-table`, `recharts`
   - `lucide-react`, `next-themes`, `zustand`
3. Configurar shadcn/ui
4. Crear estructura de carpetas completa
5. Configurar TypeScript y ESLint
6. Crear archivos de configuración (tailwind.config.ts, next.config.js)
7. Crear `.env.example` con todas las variables de entorno necesarias

**Archivos a crear:**
- `package.json` con todas las dependencias
- `tsconfig.json`
- `tailwind.config.ts`
- `next.config.js`
- `.env.example`
- Estructura de carpetas vacía

---

### FASE 2: Base de Datos Supabase

**Objetivo:** Configurar Supabase, crear el esquema de base de datos y configurar seguridad.

**Tareas:**
1. Crear proyecto Supabase
2. Crear migraciones SQL:
   - `001_initial_schema.sql` - Tablas: profiles, trading_config, trading_decisions, trades, trade_results, ai_learnings, chat_conversations, chat_messages, wellness_tracking, notifications
   - `002_vector_search.sql` - Índices vectoriales y funciones de búsqueda
   - `003_rls_policies.sql` - Row Level Security policies
3. Habilitar extensiones: `uuid-ossp`, `vector`
4. Configurar triggers para `updated_at`
5. Crear índices para optimizar consultas
6. Probar RLS policies

**Archivos a crear:**
- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_vector_search.sql`
- `supabase/migrations/003_rls_policies.sql`

---

### FASE 3: Configuración de Supabase Client

**Objetivo:** Crear clientes de Supabase para browser y server.

**Tareas:**
1. Crear cliente para browser (`lib/supabase/client.ts`)
2. Crear cliente para server (`lib/supabase/server.ts`)
3. Crear middleware para autenticación (`lib/supabase/middleware.ts`)
4. Crear tipos TypeScript (`lib/supabase/types.ts`)
5. Configurar variables de entorno

**Archivos a crear:**
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `lib/supabase/middleware.ts`
- `lib/supabase/types.ts`

---

### FASE 4: Autenticación

**Objetivo:** Implementar sistema de autenticación con Supabase Auth.

**Tareas:**
1. Crear Server Actions para auth (`actions/auth.ts`):
   - `signIn()`, `signUp()`, `signOut()`
   - `getCurrentUser()`
   - `updateProfile()`
2. Crear página de login (`app/(public)/login/page.tsx`)
3. Crear página de registro (`app/(public)/register/page.tsx`)
4. Configurar middleware para proteger rutas
5. Crear layout autenticado (`app/(auth)/layout.tsx`)

**Archivos a crear:**
- `actions/auth.ts`
- `app/(public)/login/page.tsx`
- `app/(public)/register/page.tsx`
- `app/(auth)/layout.tsx`

---

### FASE 5: Componentes UI Compartidos

**Objetivo:** Crear componentes reutilizables de la interfaz.

**Tareas:**
1. Instalar y configurar componentes shadcn/ui necesarios:
   - button, card, dialog, form, input, select, table, tabs, avatar, dropdown-menu, textarea, scroll-area, badge, alert
2. Crear Header (`components/Header.tsx`)
3. Crear Sidebar (`components/Sidebar.tsx`)
4. Crear ThemeToggle (`components/ThemeToggle.tsx`)
5. Crear LoadingSpinner (`components/LoadingSpinner.tsx`)
6. Crear parser de Google Stitch (`lib/design/stitch-parser.ts`)

**Archivos a crear:**
- `components/ui/*` (todos los componentes shadcn/ui)
- `components/Header.tsx`
- `components/Sidebar.tsx`
- `components/ThemeToggle.tsx`
- `components/LoadingSpinner.tsx`
- `lib/design/stitch-parser.ts`

---

### FASE 6: Dashboard

**Objetivo:** Crear página principal con resumen de todas las funcionalidades.

**Tareas:**
1. Crear página de dashboard (`app/(auth)/dashboard/page.tsx`)
2. Crear componentes de dashboard:
   - `PerformanceChart.tsx` - Gráfico de P&L
   - `RecentTrades.tsx` - Tabla de trades recientes
   - `PendingSuggestions.tsx` - Sugerencias pendientes
   - `QuickStats.tsx` - Estadísticas rápidas
3. Crear Server Actions para obtener datos del dashboard
4. Integrar con Supabase para obtener datos reales

**Archivos a crear:**
- `app/(auth)/dashboard/page.tsx`
- `app/(auth)/dashboard/components/PerformanceChart.tsx`
- `app/(auth)/dashboard/components/RecentTrades.tsx`
- `app/(auth)/dashboard/components/PendingSuggestions.tsx`
- `app/(auth)/dashboard/components/QuickStats.tsx`

---

### FASE 7: Sistema de IA - Gemini 2.0

**Objetivo:** Configurar Google Vertex AI y crear cliente de Gemini.

**Tareas:**
1. Configurar Google Cloud project y habilitar APIs
2. Crear service account y obtener credenciales
3. Crear cliente de Gemini (`lib/ai/gemini.ts`):
   - Clase `GeminiClient` con métodos:
     - `generate()` - Generación básica
     - `generateStreaming()` - Streaming
     - `generateEmbedding()` - Embeddings
4. Crear sistema de prompts (`lib/ai/prompts.ts`):
   - `trading_analysis()`
   - `chat_assistant()`
   - `trade_reflection()`
5. Configurar variables de entorno

**Archivos a crear:**
- `lib/ai/gemini.ts`
- `lib/ai/prompts.ts`

---

### FASE 8: Sistema de Memoria Vectorial

**Objetivo:** Implementar sistema de RAG con pgvector.

**Tareas:**
1. Crear sistema de memoria (`lib/ai/memory.ts`):
   - `saveDecisionWithEmbedding()`
   - `saveLearningWithEmbedding()`
   - `saveMessageWithEmbedding()`
   - `findSimilarDecisions()`
   - `findRelevantLearnings()`
   - `findRelevantMessages()`
2. Integrar con funciones SQL de búsqueda vectorial
3. Probar similitud y recuperación de contexto

**Archivos a crear:**
- `lib/ai/memory.ts`

---

### FASE 9: Trading - APIs de Mercado

**Objetivo:** Implementar clientes para Binance, Yahoo Finance e IOL Argentina.

**Tareas:**
1. Instalar `ccxt` para trading de crypto
2. Crear cliente de Binance (`lib/trading/binance.ts`):
   - `getPrice()`
   - `getOHLCV()`
   - `getTechnicalIndicators()` - RSI, SMA, volumen
   - `createMarketOrder()`
3. Crear cliente de Yahoo Finance (`lib/trading/yahoo-finance.ts`):
   - `getQuote()`
   - `getOHLCV()`
   - `getTechnicalIndicators()`
4. Crear cliente de IOL Argentina (`lib/trading/iol-argentina.ts`):
   - `getQuote()` - Precios de acciones argentinas (BYMA)
   - `getOHLCV()` - Datos históricos
   - `getTechnicalIndicators()` - RSI, SMA, volumen
   - `createMarketOrder()` - Ejecutar órdenes en IOL
   - `getBalance()` - Balance de cuenta
   - `getPortfolio()` - Portafolio actual
5. Crear sistema de análisis (`lib/trading/analysis.ts`):
   - `analyzeAsset()` - Análisis completo con IA
   - `evaluateTradeResult()` - Evaluación de resultados

**Archivos a crear:**
- `lib/trading/binance.ts`
- `lib/trading/yahoo-finance.ts`
- `lib/trading/iol-argentina.ts`
- `lib/trading/analysis.ts`

---

### FASE 10: Server Actions de Trading

**Objetivo:** Crear Server Actions para lógica de trading.

**Tareas:**
1. Crear `actions/trading.ts`:
   - `getTradingConfig()`
   - `updateTradingConfig()`
   - `analyzeAsset()` - Análisis manual
   - `approveDecision()`
   - `rejectDecision()`
   - `getActiveTrades()`
   - `getTradeHistory()`
   - `getUserStats()`
2. Integrar con Gemini y APIs de mercado
3. Implementar validaciones con Zod

**Archivos a crear:**
- `actions/trading.ts`

---

### FASE 11: Página de Trading

**Objetivo:** Crear interfaz completa para trading.

**Tareas:**
1. Crear página de trading (`app/(auth)/trading/page.tsx`)
2. Crear componentes:
   - `MarketAnalysis.tsx` - Análisis de mercado
   - `TradesTable.tsx` - Tabla de trades
   - `TradingChart.tsx` - Gráfico de precios
   - `DecisionCard.tsx` - Tarjeta de decisión
3. Implementar aprobación/rechazo de decisiones
4. Mostrar estadísticas de trading

**Archivos a crear:**
- `app/(auth)/trading/page.tsx`
- `app/(auth)/trading/components/MarketAnalysis.tsx`
- `app/(auth)/trading/components/TradesTable.tsx`
- `app/(auth)/trading/components/TradingChart.tsx`
- `app/(auth)/trading/components/DecisionCard.tsx`

---

### FASE 12: Chat con IA

**Objetivo:** Implementar chat conversacional con contexto completo.

**Tareas:**
1. Crear Server Actions (`actions/chat.ts`):
   - `sendMessage()` - Enviar mensaje y obtener respuesta
   - `getConversations()`
   - `getConversationMessages()`
   - `createConversation()`
   - `deleteConversation()`
2. Crear página de chat (`app/(auth)/chat/page.tsx`)
3. Crear componentes:
   - `ChatInterface.tsx` - Interfaz principal
   - `MessageList.tsx` - Lista de mensajes
   - `MessageInput.tsx` - Input de mensajes
   - `ConversationList.tsx` - Lista de conversaciones
4. Implementar streaming de respuestas
5. Integrar contexto del usuario (stats, trades, wellness)

**Archivos a crear:**
- `actions/chat.ts`
- `app/(auth)/chat/page.tsx`
- `app/(auth)/chat/components/ChatInterface.tsx`
- `app/(auth)/chat/components/MessageList.tsx`
- `app/(auth)/chat/components/MessageInput.tsx`
- `app/(auth)/chat/components/ConversationList.tsx`

---

### FASE 13: Tracker de Bienestar

**Objetivo:** Implementar tracking de ayuno, peso y métricas de salud.

**Tareas:**
1. Crear Server Actions (`actions/wellness.ts`):
   - `getCurrentWellness()`
   - `getCurrentFasting()`
   - `startFasting()`
   - `endFasting()`
   - `logWeight()`
   - `getWeightHistory()`
2. Crear página de wellness (`app/(auth)/wellness/page.tsx`)
3. Crear componentes:
   - `FastingTimer.tsx` - Timer de ayuno
   - `WeightTracker.tsx` - Tracker de peso
   - `WellnessStats.tsx` - Estadísticas de bienestar
   - `WellnessCharts.tsx` - Gráficos de progreso

**Archivos a crear:**
- `actions/wellness.ts`
- `app/(auth)/wellness/page.tsx`
- `app/(auth)/wellness/components/FastingTimer.tsx`
- `app/(auth)/wellness/components/WeightTracker.tsx`
- `app/(auth)/wellness/components/WellnessStats.tsx`
- `app/(auth)/wellness/components/WellnessCharts.tsx`

---

### FASE 14: Configuración de Trading

**Objetivo:** Crear página de configuración para ajustes de trading.

**Tareas:**
1. Crear Server Actions (`actions/settings.ts`):
   - `getSettings()`
   - `updateSettings()`
   - `updateExchangeConfig()`
   - `updateRiskProfile()`
2. Crear página de settings (`app/(auth)/settings/page.tsx`)
3. Crear componentes:
   - `ExchangeConfig.tsx` - Configuración de exchanges
   - `TradingPreferences.tsx` - Preferencias de trading
   - `RiskProfile.tsx` - Perfil de riesgo

**Archivos a crear:**
- `actions/settings.ts`
- `app/(auth)/settings/page.tsx`
- `app/(auth)/settings/components/ExchangeConfig.tsx`
- `app/(auth)/settings/components/TradingPreferences.tsx`
- `app/(auth)/settings/components/RiskProfile.tsx`

---

### FASE 15: Supabase Edge Functions

**Objetivo:** Crear Edge Functions para tareas automatizadas.

**Tareas:**
1. Crear Edge Function `analyze-market`:
   - Analizar mercados automáticamente cada hora
   - Obtener usuarios con trading activo
   - Llamar a Cloud Function de Python
   - Guardar decisiones en base de datos
   - Crear notificaciones
2. Crear Edge Function `evaluate-trades`:
   - Evaluar trades ejecutados hace 24 horas
   - Calcular P&L
   - Generar aprendizajes con IA
   - Actualizar resultados
   - Notificar usuarios
3. Configurar cron jobs en Supabase

**Archivos a crear:**
- `supabase/functions/analyze-market/index.ts`
- `supabase/functions/evaluate-trades/index.ts`

---

### FASE 16: Google Cloud Functions (Python)

**Objetivo:** Crear Cloud Functions para análisis y ejecución de trades.

**Tareas:**
1. Crear Cloud Function `analyze-asset`:
   - Obtener datos de mercado (Binance/Yahoo/IOL)
   - Calcular indicadores técnicos
   - Generar análisis con Gemini
   - Generar embedding
   - Retornar decisión
2. Crear Cloud Function `evaluate-trade`:
   - Obtener precio actual
   - Calcular P&L
   - Evaluar resultado con Gemini
   - Generar aprendizaje
   - Generar embedding
3. Crear Cloud Function `execute-trade`:
   - Ejecutar orden en Binance o IOL
   - Manejar errores
   - Retornar resultado
4. Deploy en Google Cloud

**Archivos a crear:**
- `google-cloud/analyze-asset/main.py`
- `google-cloud/analyze-asset/requirements.txt`
- `google-cloud/analyze-asset/deploy.sh`
- `google-cloud/evaluate-trade/main.py`
- `google-cloud/evaluate-trade/requirements.txt`
- `google-cloud/evaluate-trade/deploy.sh`
- `google-cloud/execute-trade/main.py`
- `google-cloud/execute-trade/requirements.txt`
- `google-cloud/execute-trade/deploy.sh`

---

### FASE 17: Sistema de Notificaciones

**Objetivo:** Implementar sistema de notificaciones en tiempo real.

**Tareas:**
1. Configurar Supabase Realtime
2. Crear componente de notificaciones
3. Mostrar notificaciones en Header
4. Implementar suscripción a cambios en tabla `notifications`
5. Marcar notificaciones como leídas

**Archivos a crear:**
- `components/Notifications.tsx`
- Actualizar `components/Header.tsx` para mostrar notificaciones

---

### FASE 18: TypeScript Types

**Objetivo:** Crear tipos TypeScript para toda la aplicación.

**Tareas:**
1. Crear tipos de trading (`types/trading.ts`)
2. Crear tipos de chat (`types/chat.ts`)
3. Crear tipos de wellness (`types/wellness.ts`)
4. Exportar todos los tipos

**Archivos a crear:**
- `types/trading.ts`
- `types/chat.ts`
- `types/wellness.ts`

---

### FASE 19: Testing y Debugging

**Objetivo:** Probar todas las funcionalidades del sistema.

**Tareas:**
1. Probar flujo de registro/login
2. Probar configuración de trading
3. Probar análisis manual de assets
4. Probar aprobación de decisiones
5. Probar ejecución de trades (testnet primero)
6. Probar chat con IA
7. Probar tracker de bienestar
8. Probar sistema de notificaciones
9. Probar Edge Functions
10. Probar Cloud Functions
11. Verificar que los aprendizajes se crean correctamente
12. Verificar búsqueda vectorial

---

### FASE 20: Deployment

**Objetivo:** Deploy completo del proyecto a producción.

**Tareas:**
1. **Vercel:**
   - Instalar Vercel CLI
   - Deploy de Next.js app
   - Configurar variables de entorno
2. **Supabase:**
   - Deploy de Edge Functions
   - Configurar secrets
   - Configurar cron jobs
3. **Google Cloud:**
   - Deploy de Cloud Functions
   - Configurar URLs
4. **Post-Deploy:**
   - Probar todas las funcionalidades en producción
   - Verificar integraciones
   - Monitorear logs

---

### FASE 21: Integración con Google Stitch

**Objetivo:** Integrar diseño de Google Stitch si está disponible.

**Tareas:**
1. Leer archivos de diseño en carpeta `/diseño`
2. Parsear `design-system.json`
3. Aplicar colores, tipografía y espaciado
4. Implementar componentes según mockups
5. Ajustar UI/UX según diseño

**Archivos a crear:**
- `lib/design/stitch-parser.ts` (ya creado en FASE 5)
- Actualizar componentes según diseño

---

### FASE 22: Documentación

**Objetivo:** Crear documentación completa del proyecto.

**Tareas:**
1. Crear `README.md` principal
2. Documentar instalación
3. Documentar configuración
4. Documentar API endpoints
5. Documentar variables de entorno
6. Crear guía de deployment

**Archivos a crear:**
- `README.md`
- `INSTALLATION.md`
- `DEPLOYMENT.md`
- `API.md`

---

## 📊 Cronograma Estimado

- **Fase 1-5:** 1 semana (Setup, DB, Auth, UI)
- **Fase 6-8:** 1 semana (Dashboard, IA, Memoria)
- **Fase 9-11:** 1.5 semanas (Trading APIs, Actions, UI)
- **Fase 12-14:** 1 semana (Chat, Wellness, Settings)
- **Fase 15-16:** 1.5 semanas (Edge Functions, Cloud Functions)
- **Fase 17-19:** 1 semana (Notificaciones, Types, Testing)
- **Fase 20-22:** 0.5 semana (Deployment, Stitch, Docs)

**Total estimado:** 7-8 semanas

---

## ⚠️ Consideraciones Importantes

1. **Seguridad:**
   - Nunca exponer API keys en el frontend
   - Usar Supabase RLS para proteger datos
   - Validar todas las entradas del usuario
   - Usar variables de entorno para secrets

2. **Trading:**
   - Comenzar siempre con testnet de Binance
   - Para IOL Argentina, usar cuenta demo inicialmente
   - Implementar límites de riesgo
   - Requerir aprobación manual para trades
   - Monitorear closely en producción
   - Considerar horarios de mercado argentinos (BYMA: 10:00-17:00 AR)
   - Manejar diferentes monedas (USD para crypto, ARS para acciones argentinas)

3. **AI:**
   - Implementar rate limiting para Gemini API
   - Cachear respuestas cuando sea posible
   - Monitorear costos de API
   - Implementar fallbacks

4. **Performance:**
   - Optimizar consultas a base de datos
   - Usar React Server Components cuando sea posible
   - Implementar paginación
   - Cachear datos frecuentes

5. **Testing:**
   - Probar exhaustivamente antes de deploy
   - Usar modo testnet para trading
   - Implementar logging completo
   - Monitorear errores en producción

---

## 🎯 Próximos Pasos Inmediatos

1. Revisar este plan con el usuario
2. Confirmar prioridad de fases
3. Verificar acceso a servicios (Supabase, Google Cloud, Binance)
4. Comenzar con FASE 1: Setup Inicial
