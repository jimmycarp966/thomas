# 🤖 AI TRADING & WELLNESS ASSISTANT - PROMPT COMPLETO

> **IMPORTANTE**: Este es un proyecto completo de asistente de IA para trading, bienestar personal y chat conversacional. Lee todo el documento antes de comenzar a programar.

---

## 📋 TABLA DE CONTENIDOS

1. **PARTE 1** - Estructura y Setup (Este archivo)
2. **PARTE 2** - Backend y Server Actions
3. **PARTE 3** - Componentes UI y Páginas
4. **PARTE 4** - Sistema de IA y Memoria
5. **PARTE 5** - Deployment y Testing

---

# PARTE 1: ESTRUCTURA Y SETUP

## 🎯 DESCRIPCIÓN DEL PROYECTO

Crear una aplicación web completa (Next.js 15) que funcione como **asistente personal de IA** con:

### Características Principales:
1. **Trading Inteligente**
   - Análisis automático de mercados (crypto + acciones argentinas)
   - Sugerencias de trading con IA (Gemini 2.0)
   - Ejecución automática de trades (con aprobación)
   - Sistema de aprendizaje continuo

2. **Chat Conversacional**
   - Interfaz tipo ChatGPT
   - Contexto completo del usuario
   - Streaming de respuestas
   - Memoria de conversaciones

3. **Tracker de Bienestar**
   - Ayuno intermitente
   - Peso y métricas físicas
   - Ejercicio
   - Análisis de patrones

4. **Sistema de Aprendizaje**
   - La IA aprende de cada decisión
   - Memoria vectorial (RAG)
   - Reflexión automática
   - Mejora continua

---

## 🛠️ STACK TECNOLÓGICO COMPLETO

```json
{
  "frontend": {
    "framework": "Next.js 15 (App Router + Server Components)",
    "language": "TypeScript 5.3+",
    "ui": "React 19",
    "styling": "Tailwind CSS 3.4+",
    "components": "shadcn/ui",
    "state": "Zustand (mínimo, solo sesión/tema/notificaciones)",
    "forms": "React Hook Form + Zod",
    "tables": "TanStack Table v8",
    "charts": "Recharts"
  },
  "backend": {
    "database": "Supabase Postgres",
    "auth": "Supabase Auth",
    "storage": "Supabase Storage",
    "vectors": "Supabase Vector (pgvector)",
    "realtime": "Supabase Realtime",
    "edge_functions": "Supabase Edge Functions (Deno)"
  },
  "ai": {
    "llm": "Google Vertex AI - Gemini 2.0 Flash",
    "embeddings": "Vertex AI Text Embeddings",
    "cloud_functions": "Google Cloud Functions (Python 3.11)"
  },
  "trading": {
    "library": "ccxt (Python)",
    "exchanges": "Binance API, Yahoo Finance"
  },
  "deployment": {
    "frontend": "Vercel",
    "database": "Supabase Cloud",
    "ai": "Google Cloud (cuenta Pro del usuario)"
  }
}
```

---

## 📁 ESTRUCTURA COMPLETA DE CARPETAS

```
ai-trading-assistant/
├── 📂 app/                          # Next.js App Router
│   ├── 📂 (auth)/                   # Rutas autenticadas
│   │   ├── 📂 dashboard/
│   │   │   ├── page.tsx
│   │   │   └── components/
│   │   │       ├── PerformanceChart.tsx
│   │   │       ├── RecentTrades.tsx
│   │   │       ├── PendingSuggestions.tsx
│   │   │       └── QuickStats.tsx
│   │   ├── 📂 trading/
│   │   │   ├── page.tsx
│   │   │   └── components/
│   │   │       ├── MarketAnalysis.tsx
│   │   │       ├── TradesTable.tsx
│   │   │       └── TradingChart.tsx
│   │   ├── 📂 chat/
│   │   │   ├── page.tsx
│   │   │   └── components/
│   │   │       ├── ChatInterface.tsx
│   │   │       ├── MessageList.tsx
│   │   │       └── MessageInput.tsx
│   │   ├── 📂 wellness/
│   │   │   ├── page.tsx
│   │   │   └── components/
│   │   │       ├── FastingTimer.tsx
│   │   │       ├── WeightTracker.tsx
│   │   │       └── WellnessCharts.tsx
│   │   ├── 📂 settings/
│   │   │   ├── page.tsx
│   │   │   └── components/
│   │   │       ├── ExchangeConfig.tsx
│   │   │       ├── TradingPreferences.tsx
│   │   │       └── RiskProfile.tsx
│   │   └── layout.tsx
│   ├── 📂 (public)/
│   │   ├── 📂 login/
│   │   │   └── page.tsx
│   │   └── 📂 register/
│   │       └── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   └── providers.tsx
│
├── 📂 components/
│   ├── 📂 ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   └── ... (todos los necesarios)
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── LoadingSpinner.tsx
│
├── 📂 lib/
│   ├── 📂 supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   ├── middleware.ts
│   │   └── types.ts
│   ├── 📂 ai/
│   │   ├── gemini.ts
│   │   ├── embeddings.ts
│   │   ├── prompts.ts
│   │   └── memory.ts
│   ├── 📂 trading/
│   │   ├── exchanges.ts
│   │   └── analysis.ts
│   ├── utils.ts
│   └── validations.ts
│
├── 📂 actions/                      # Server Actions
│   ├── auth.ts
│   ├── trading.ts
│   ├── chat.ts
│   ├── wellness.ts
│   └── settings.ts
│
├── 📂 hooks/
│   ├── useAuth.ts
│   ├── useTrading.ts
│   └── useChat.ts
│
├── 📂 store/                        # Zustand
│   ├── authStore.ts
│   ├── themeStore.ts
│   └── notificationStore.ts
│
├── 📂 types/
│   ├── trading.ts
│   ├── chat.ts
│   └── wellness.ts
│
├── 📂 supabase/
│   ├── 📂 migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_vector_setup.sql
│   │   └── 003_rls_policies.sql
│   ├── 📂 functions/
│   │   ├── 📂 analyze-market/
│   │   │   └── index.ts
│   │   ├── 📂 evaluate-trades/
│   │   │   └── index.ts
│   │   └── 📂 ai-reflection/
│   │       └── index.ts
│   └── config.toml
│
├── 📂 google-cloud/
│   ├── 📂 execute-trade/
│   │   ├── main.py
│   │   ├── requirements.txt
│   │   └── deploy.sh
│   └── 📂 market-data/
│       ├── main.py
│       └── requirements.txt
│
├── 📂 diseño/                       # ⭐ CARPETA DE GOOGLE STITCH
│   ├── design-system.json
│   ├── navigation-flow.json
│   ├── 📂 mockups/
│   │   ├── dashboard.png
│   │   ├── trading.png
│   │   ├── chat.png
│   │   └── wellness.png
│   └── 📂 components/               # Código de Stitch (si existe)
│       └── ...
│
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🔧 SETUP INICIAL

### 1. Crear el proyecto Next.js

```bash
npx create-next-app@latest ai-trading-assistant --typescript --tailwind --app --use-npm
cd ai-trading-assistant
```

Configuración durante instalación:
- ✅ TypeScript
- ✅ ESLint
- ✅ Tailwind CSS
- ✅ `src/` directory: NO
- ✅ App Router: YES
- ✅ Import alias: `@/*`

### 2. Instalar dependencias principales

```bash
# UI Components
npm install @radix-ui/react-avatar @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slot @radix-ui/react-tabs @radix-ui/react-toast
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react

# Forms
npm install react-hook-form @hookform/resolvers zod

# Tables
npm install @tanstack/react-table

# Charts
npm install recharts

# State Management
npm install zustand

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# Google Cloud
npm install @google-cloud/aiplatform google-auth-library

# Date utilities
npm install date-fns

# Dev dependencies
npm install -D @types/node @types/react @types/react-dom
```

### 3. Instalar shadcn/ui

```bash
npx shadcn-ui@latest init
```

Configuración:
- Style: Default
- Base color: Slate
- CSS variables: Yes

Instalar componentes necesarios:
```bash
npx shadcn-ui@latest add button card dialog form input label select separator table tabs textarea toast badge scroll-area skeleton
```

### 4. Configurar variables de entorno

**Archivo: `.env.example`**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Cloud
VERTEX_AI_PROJECT=your-gcp-project-id
VERTEX_AI_LOCATION=us-central1
GCP_SERVICE_ACCOUNT_KEY=path/to/service-account.json

# Cloud Functions URLs
CLOUD_FUNCTION_MARKET_DATA_URL=https://...
CLOUD_FUNCTION_EXECUTE_TRADE_URL=https://...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Archivo: `.env.local`** (copiar de .env.example y completar)

### 5. Configurar Tailwind con diseño de Stitch

**Archivo: `tailwind.config.ts`**

```typescript
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
```

### 6. Configurar Next.js

**Archivo: `next.config.js`**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'your-supabase-project.supabase.co', // Para imágenes de Supabase Storage
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig
```

---

## 🗄️ CONFIGURACIÓN DE SUPABASE

### Paso 1: Crear proyecto en Supabase

1. Ir a [https://supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. Guardar las credenciales (URL y anon key)

### Paso 2: Ejecutar migraciones SQL

**Archivo: `supabase/migrations/001_initial_schema.sql`**

```sql
-- =====================================================
-- EXTENSIONES
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- =====================================================
-- TABLA: profiles
-- =====================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'America/Argentina/Buenos_Aires',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLA: trading_config
-- =====================================================
CREATE TABLE trading_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Exchange API keys (encriptadas)
  binance_api_key TEXT,
  binance_api_secret TEXT,
  
  -- Preferencias
  risk_profile TEXT CHECK (risk_profile IN ('conservative', 'moderate', 'aggressive')) DEFAULT 'moderate',
  max_trade_amount DECIMAL(10, 2) DEFAULT 100.00,
  allowed_assets JSONB DEFAULT '["BTC", "ETH", "SOL"]'::jsonb,
  auto_execute BOOLEAN DEFAULT false,
  stop_loss_percentage DECIMAL(5, 2) DEFAULT 5.00,
  take_profit_percentage DECIMAL(5, 2) DEFAULT 10.00,
  
  -- Horarios
  trading_hours_start TIME DEFAULT '09:00:00',
  trading_hours_end TIME DEFAULT '18:00:00',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- =====================================================
-- TABLA: trading_decisions
-- =====================================================
CREATE TABLE trading_decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  asset_symbol TEXT NOT NULL,
  asset_type TEXT CHECK (asset_type IN ('crypto', 'stock', 'cedear')) NOT NULL,
  decision_type TEXT CHECK (decision_type IN ('BUY', 'SELL', 'HOLD')) NOT NULL,
  
  ai_analysis JSONB NOT NULL,
  suggested_amount DECIMAL(10, 2),
  suggested_price DECIMAL(10, 4),
  stop_loss_price DECIMAL(10, 4),
  take_profit_price DECIMAL(10, 4),
  
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'executed', 'cancelled')) DEFAULT 'pending',
  user_feedback TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  decided_at TIMESTAMPTZ,
  
  embedding vector(768)
);

CREATE INDEX idx_trading_decisions_user ON trading_decisions(user_id);
CREATE INDEX idx_trading_decisions_status ON trading_decisions(status);

-- =====================================================
-- TABLA: trades
-- =====================================================
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  decision_id UUID REFERENCES trading_decisions(id) ON DELETE SET NULL,
  
  exchange TEXT NOT NULL,
  asset_symbol TEXT NOT NULL,
  trade_type TEXT CHECK (trade_type IN ('BUY', 'SELL')) NOT NULL,
  
  quantity DECIMAL(18, 8) NOT NULL,
  price DECIMAL(10, 4) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  fees DECIMAL(10, 4) DEFAULT 0,
  
  status TEXT CHECK (status IN ('pending', 'executed', 'failed', 'cancelled')) DEFAULT 'pending',
  exchange_order_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  executed_at TIMESTAMPTZ
);

CREATE INDEX idx_trades_user ON trades(user_id);
CREATE INDEX idx_trades_decision ON trades(decision_id);

-- =====================================================
-- TABLA: trade_results
-- =====================================================
CREATE TABLE trade_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trade_id UUID REFERENCES trades(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  entry_price DECIMAL(10, 4) NOT NULL,
  exit_price DECIMAL(10, 4),
  pnl_amount DECIMAL(10, 2),
  pnl_percentage DECIMAL(5, 2),
  
  status TEXT CHECK (status IN ('open', 'closed_profit', 'closed_loss', 'closed_breakeven')) DEFAULT 'open',
  
  ai_evaluation JSONB,
  
  opened_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  evaluated_at TIMESTAMPTZ,
  
  embedding vector(768),
  
  UNIQUE(trade_id)
);

CREATE INDEX idx_trade_results_user ON trade_results(user_id);

-- =====================================================
-- TABLA: ai_learnings
-- =====================================================
CREATE TABLE ai_learnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  learning_type TEXT CHECK (learning_type IN ('success_pattern', 'failure_pattern', 'market_insight', 'user_preference')) NOT NULL,
  content JSONB NOT NULL,
  importance_score DECIMAL(3, 2) DEFAULT 0.50,
  
  related_decisions UUID[] DEFAULT '{}',
  related_trades UUID[] DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_validated_at TIMESTAMPTZ,
  times_applied INTEGER DEFAULT 0,
  
  embedding vector(768)
);

CREATE INDEX idx_ai_learnings_user ON ai_learnings(user_id);
CREATE INDEX idx_ai_learnings_importance ON ai_learnings(importance_score DESC);

-- =====================================================
-- TABLA: chat_conversations
-- =====================================================
CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  title TEXT DEFAULT 'Nueva conversación',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_conversations_user ON chat_conversations(user_id);

-- =====================================================
-- TABLA: chat_messages
-- =====================================================
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
  content TEXT NOT NULL,
  ai_metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  embedding vector(768)
);

CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id);

-- =====================================================
-- TABLA: wellness_tracking
-- =====================================================
CREATE TABLE wellness_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  date DATE NOT NULL,
  
  fasting_start TIMESTAMPTZ,
  fasting_end TIMESTAMPTZ,
  fasting_hours DECIMAL(4, 2),
  fasting_completed BOOLEAN DEFAULT false,
  
  weight_kg DECIMAL(5, 2),
  
  exercise_completed BOOLEAN DEFAULT false,
  exercise_type TEXT,
  exercise_duration_minutes INTEGER,
  
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  mood_level INTEGER CHECK (mood_level BETWEEN 1 AND 10),
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 10),
  sleep_hours DECIMAL(3, 1),
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

CREATE INDEX idx_wellness_user_date ON wellness_tracking(user_id, date DESC);

-- =====================================================
-- TABLA: notifications
-- =====================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  type TEXT CHECK (type IN ('trade_suggestion', 'trade_executed', 'trade_result', 'wellness_reminder', 'system')) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read, created_at DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trading_config_updated_at
  BEFORE UPDATE ON trading_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wellness_tracking_updated_at
  BEFORE UPDATE ON wellness_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_conversations_updated_at
  BEFORE UPDATE ON chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## ✅ CHECKLIST DE SETUP INICIAL

- [ ] Proyecto Next.js creado
- [ ] Dependencias instaladas
- [ ] shadcn/ui configurado
- [ ] Variables de entorno configuradas
- [ ] Supabase proyecto creado
- [ ] Migraciones SQL ejecutadas
- [ ] Google Cloud proyecto configurado
- [ ] Carpeta `/diseño` creada (con archivos de Stitch)

---

**FIN DE PARTE 1**

> Continuar con **PARTE 2**: Backend y Server Actions
