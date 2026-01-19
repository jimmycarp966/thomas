# PARTE 2: BACKEND Y SERVER ACTIONS

## 📚 CONFIGURACIÓN DE SUPABASE (Continuación)

### Búsqueda Vectorial

**Archivo: `supabase/migrations/002_vector_search.sql`**

```sql
-- =====================================================
-- ÍNDICES VECTORIALES
-- =====================================================
CREATE INDEX idx_trading_decisions_embedding 
  ON trading_decisions 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX idx_trade_results_embedding 
  ON trade_results 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX idx_ai_learnings_embedding 
  ON ai_learnings 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX idx_chat_messages_embedding 
  ON chat_messages 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- =====================================================
-- FUNCIÓN: match_similar_decisions
-- =====================================================
CREATE OR REPLACE FUNCTION match_similar_decisions(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  p_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  asset_symbol text,
  decision_type text,
  ai_analysis jsonb,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    asset_symbol,
    decision_type,
    ai_analysis,
    1 - (embedding <=> query_embedding) as similarity
  FROM trading_decisions
  WHERE 
    (p_user_id IS NULL OR user_id = p_user_id)
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;

-- =====================================================
-- FUNCIÓN: match_relevant_learnings
-- =====================================================
CREATE OR REPLACE FUNCTION match_relevant_learnings(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  p_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  learning_type text,
  content jsonb,
  importance_score decimal,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    learning_type,
    content,
    importance_score,
    1 - (embedding <=> query_embedding) as similarity
  FROM ai_learnings
  WHERE 
    (p_user_id IS NULL OR user_id = p_user_id)
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY 
    importance_score DESC,
    embedding <=> query_embedding
  LIMIT match_count;
$$;
```

### Row Level Security (RLS)

**Archivo: `supabase/migrations/003_rls_policies.sql`**

```sql
-- =====================================================
-- HABILITAR RLS
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_learnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS: profiles
-- =====================================================
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- POLÍTICAS: trading_config
-- =====================================================
CREATE POLICY "Users can view own config" ON trading_config
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own config" ON trading_config
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own config" ON trading_config
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS: trading_decisions
-- =====================================================
CREATE POLICY "Users can view own decisions" ON trading_decisions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own decisions" ON trading_decisions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own decisions" ON trading_decisions
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS: trades
-- =====================================================
CREATE POLICY "Users can view own trades" ON trades
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades" ON trades
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades" ON trades
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS: trade_results
-- =====================================================
CREATE POLICY "Users can view own results" ON trade_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own results" ON trade_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own results" ON trade_results
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS: ai_learnings
-- =====================================================
CREATE POLICY "Users can view own learnings" ON ai_learnings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learnings" ON ai_learnings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own learnings" ON ai_learnings
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS: chat_conversations
-- =====================================================
CREATE POLICY "Users can view own conversations" ON chat_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" ON chat_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON chat_conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" ON chat_conversations
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS: chat_messages
-- =====================================================
CREATE POLICY "Users can view own messages" ON chat_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS: wellness_tracking
-- =====================================================
CREATE POLICY "Users can view own wellness" ON wellness_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wellness" ON wellness_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wellness" ON wellness_tracking
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS: notifications
-- =====================================================
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);
```

---

## 🔧 CONFIGURACIÓN DE CLIENTES SUPABASE

### Cliente Browser

**Archivo: `lib/supabase/client.ts`**

```typescript
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Cliente Server

**Archivo: `lib/supabase/server.ts`**

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Cookies can't be set during Server Components rendering
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Cookies can't be removed during Server Components rendering
          }
        },
      },
    }
  )
}
```

### Middleware de Autenticación

**Archivo: `lib/supabase/middleware.ts`**

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Proteger rutas autenticadas
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/register')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirigir usuarios autenticados fuera de login/register
  if (
    user &&
    (request.nextUrl.pathname.startsWith('/login') ||
      request.nextUrl.pathname.startsWith('/register'))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return response
}
```

**Archivo: `middleware.ts` (raíz del proyecto)**

```typescript
import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## ⚡ SERVER ACTIONS

### 1. Actions de Autenticación

**Archivo: `actions/auth.ts`**

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

const registerSchema = loginSchema.extend({
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
})

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const validation = loginSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.errors[0].message }
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}

export async function register(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    fullName: formData.get('fullName') as string,
  }

  const validation = registerSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.errors[0].message }
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  })

  if (authError) {
    return { error: authError.message }
  }

  // Crear perfil
  if (authData.user) {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      email: data.email,
      full_name: data.fullName,
    })

    if (profileError) {
      return { error: 'Error creando perfil' }
    }

    // Crear configuración de trading por defecto
    await supabase.from('trading_config').insert({
      user_id: authData.user.id,
    })
  }

  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}
```

### 2. Actions de Trading

**Archivo: `actions/trading.ts`**

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from './auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export async function getUserStats() {
  const supabase = await createClient()
  const user = await getCurrentUser()
  if (!user) throw new Error('No autenticado')

  // Obtener trades del usuario
  const { data: trades } = await supabase
    .from('trades')
    .select('*, trade_results(*)')
    .eq('user_id', user.id)

  // Calcular estadísticas
  const totalPortfolio = trades?.reduce((sum, t) => {
    const result = t.trade_results[0]
    if (!result) return sum
    return sum + (result.pnl_amount || 0)
  }, 0) || 0

  const todayTrades = trades?.filter(t => {
    const today = new Date().toDateString()
    return new Date(t.created_at).toDateString() === today
  })

  const todayPnL = todayTrades?.reduce((sum, t) => {
    const result = t.trade_results[0]
    return sum + (result?.pnl_amount || 0)
  }, 0) || 0

  const closedTrades = trades?.filter(t => 
    t.trade_results[0]?.status?.startsWith('closed_')
  ) || []

  const winningTrades = closedTrades.filter(t => 
    t.trade_results[0]?.status === 'closed_profit'
  )

  const winRate = closedTrades.length > 0
    ? (winningTrades.length / closedTrades.length) * 100
    : 0

  const activeTrades = trades?.filter(t => 
    t.trade_results[0]?.status === 'open'
  ).length || 0

  return {
    totalPortfolio: totalPortfolio + 1000, // Agregar capital inicial
    portfolioChange: ((totalPortfolio / 1000) * 100).toFixed(2),
    todayPnL,
    todayPnLPercentage: todayPnL > 0 ? ((todayPnL / 1000) * 100).toFixed(2) : 0,
    activeTrades,
    winRate: winRate.toFixed(2),
  }
}

export async function getPendingSuggestions() {
  const supabase = await createClient()
  const user = await getCurrentUser()
  if (!user) return []

  const { data } = await supabase
    .from('trading_decisions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(10)

  return data || []
}

export async function approveSuggestion(formData: FormData) {
  const supabase = await createClient()
  const user = await getCurrentUser()
  if (!user) throw new Error('No autenticado')

  const suggestionId = formData.get('suggestionId') as string

  // Actualizar decisión
  await supabase
    .from('trading_decisions')
    .update({ 
      status: 'approved',
      decided_at: new Date().toISOString()
    })
    .eq('id', suggestionId)
    .eq('user_id', user.id)

  // Aquí llamarías a la Cloud Function para ejecutar el trade
  // await executeTradeViaCloudFunction(suggestionId)

  revalidatePath('/dashboard')
  revalidatePath('/trading')
}

export async function rejectSuggestion(formData: FormData) {
  const supabase = await createClient()
  const user = await getCurrentUser()
  if (!user) throw new Error('No autenticado')

  const suggestionId = formData.get('suggestionId') as string

  await supabase
    .from('trading_decisions')
    .update({ 
      status: 'rejected',
      decided_at: new Date().toISOString()
    })
    .eq('id', suggestionId)
    .eq('user_id', user.id)

  revalidatePath('/dashboard')
  revalidatePath('/trading')
}

export async function getActiveTrades() {
  const supabase = await createClient()
  const user = await getCurrentUser()
  if (!user) return []

  const { data } = await supabase
    .from('trades')
    .select(`
      *,
      trade_results(*),
      trading_decisions(*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return data || []
}

export async function getTradingConfig() {
  const supabase = await createClient()
  const user = await getCurrentUser()
  if (!user) return null

  const { data } = await supabase
    .from('trading_config')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return data
}

const configSchema = z.object({
  risk_profile: z.enum(['conservative', 'moderate', 'aggressive']),
  max_trade_amount: z.number().positive(),
  auto_execute: z.boolean(),
  stop_loss_percentage: z.number().positive(),
  take_profit_percentage: z.number().positive(),
})

export async function updateTradingConfig(formData: FormData) {
  const supabase = await createClient()
  const user = await getCurrentUser()
  if (!user) throw new Error('No autenticado')

  const data = {
    risk_profile: formData.get('risk_profile') as string,
    max_trade_amount: parseFloat(formData.get('max_trade_amount') as string),
    auto_execute: formData.get('auto_execute') === 'true',
    stop_loss_percentage: parseFloat(formData.get('stop_loss_percentage') as string),
    take_profit_percentage: parseFloat(formData.get('take_profit_percentage') as string),
  }

  const validation = configSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.errors[0].message }
  }

  const { error } = await supabase
    .from('trading_config')
    .update(data)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/settings')
  return { success: true }
}
```

### 3. Actions de Chat

**Archivo: `actions/chat.ts`**

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from './auth'
import { gemini } from '@/lib/ai/gemini'
import { SYSTEM_PROMPTS } from '@/lib/ai/prompts'
import { getUserStats, getActiveTrades } from './trading'
import { getCurrentWellness } from './wellness'

export async function sendChatMessage(message: string) {
  const supabase = await createClient()
  const user = await getCurrentUser()
  if (!user) throw new Error('No autenticado')

  // Obtener o crear conversación activa
  let { data: conversations } = await supabase
    .from('chat_conversations')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(1)

  let conversationId: string

  if (!conversations || conversations.length === 0) {
    const { data: newConv } = await supabase
      .from('chat_conversations')
      .insert({ user_id: user.id })
      .select()
      .single()

    conversationId = newConv!.id
  } else {
    conversationId = conversations[0].id
  }

  // Guardar mensaje del usuario
  await supabase.from('chat_messages').insert({
    conversation_id: conversationId,
    user_id: user.id,
    role: 'user',
    content: message,
  })

  // Obtener contexto del usuario
  const stats = await getUserStats()
  const trades = await getActiveTrades()
  const wellness = await getCurrentWellness()

  // Obtener historial de mensajes
  const { data: messageHistory } = await supabase
    .from('chat_messages')
    .select('role, content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(20)

  // Construir prompt del sistema
  const systemPrompt = SYSTEM_PROMPTS.chat_assistant(
    stats,
    trades.slice(0, 5),
    wellness
  )

  // Llamar a Gemini
  const response = await gemini.generate({
    contents: [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      },
      ...(messageHistory?.map(m => ({
        role: m.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: m.content }]
      })) || []),
      {
        role: 'user',
        parts: [{ text: message }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    }
  })

  // Guardar respuesta del asistente
  await supabase.from('chat_messages').insert({
    conversation_id: conversationId,
    user_id: user.id,
    role: 'assistant',
    content: response,
    ai_metadata: {
      model: 'gemini-2.0-flash',
      context_used: ['stats', 'trades', 'wellness']
    }
  })

  return response
}

export async function getConversations() {
  const supabase = await createClient()
  const user = await getCurrentUser()
  if (!user) return []

  const { data } = await supabase
    .from('chat_conversations')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  return data || []
}

export async function getConversationMessages(conversationId: string) {
  const supabase = await createClient()
  const user = await getCurrentUser()
  if (!user) return []

  const { data } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  return data || []
}
```

### 4. Actions de Bienestar

**Archivo: `actions/wellness.ts`**

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from './auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export async function getCurrentWellness() {
  const supabase = await createClient()
  const user = await getCurrentUser()
  if (!user) return null

  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('wellness_tracking')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  return data
}

export async function getCurrentFasting() {
  const supabase = await createClient()
  const user = await getCurrentUser()
  if (!user) return null

  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('wellness_tracking')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  // Calcular estadísticas de ayuno
  const { data: recentFasts } = await supabase
    .from('wellness_tracking')
    .select('fasting_hours, fasting_completed')
    .eq('user_id', user.id)
    .eq('fasting_completed', true)
    .order('date', { ascending: false })
    .limit(30)

  const avgHours = recentFasts?.length
    ? recentFasts.reduce((sum, f) => sum + (f.fasting_hours || 0), 0) / recentFasts.length
    : 0

  // Calcular racha
  let streak = 0
  if (recentFasts) {
    for (const fast of recentFasts) {
      if (fast.fasting_completed) streak++
      else break
    }
  }

  return {
    ...data,
    streak,
    avg_hours: avgHours.toFixed(1),
    total_fasts: recentFasts?.length || 0,
    recent_fasts: recentFasts
  }
}

export async function startFasting() {
  const supabase = await createClient()
  const user = await getCurrentUser()
  if (!user) throw new Error('No autenticado')

  const today = new Date().toISOString().split('T')[0]

  await supabase
    .from('wellness_tracking')
    .upsert({
      user_id: user.id,
      date: today,
      fasting_start: new Date().toISOString(),
      fasting_completed: false,
    })

  revalidatePath('/wellness')
}

export async function endFasting() {
  const supabase = await createClient()
  const user = await getCurrentUser()
  if (!user) throw new Error('No autenticado')

  const today = new Date().toISOString().split('T')[0]

  const { data: currentFast } = await supabase
    .from('wellness_tracking')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  if (!currentFast || !currentFast.fasting_start) {
    throw new Error('No hay ayuno activo')
  }

  const fastingStart = new Date(currentFast.fasting_start)
  const fastingEnd = new Date()
  const fastingHours = (fastingEnd.getTime() - fastingStart.getTime()) / (1000 * 60 * 60)

  await supabase
    .from('wellness_tracking')
    .update({
      fasting_end: fastingEnd.toISOString(),
      fasting_hours: fastingHours,
      fasting_completed: true,
    })
    .eq('user_id', user.id)
    .eq('date', today)

  revalidatePath('/wellness')
}

const weightSchema = z.object({
  weight: z.number().positive('El peso debe ser positivo'),
})

export async function logWeight(formData: FormData) {
  const supabase = await createClient()
  const user = await getCurrentUser()
  if (!user) throw new Error('No autenticado')

  const weight = parseFloat(formData.get('weight') as string)
  
  const validation = weightSchema.safeParse({ weight })
  if (!validation.success) {
    return { error: validation.error.errors[0].message }
  }

  const today = new Date().toISOString().split('T')[0]

  await supabase
    .from('wellness_tracking')
    .upsert({
      user_id: user.id,
      date: today,
      weight_kg: weight,
    })

  revalidatePath('/wellness')
  return { success: true }
}

export async function getWeightHistory() {
  const supabase = await createClient()
  const user = await getCurrentUser()
  if (!user) return []

  const { data } = await supabase
    .from('wellness_tracking')
    .select('date, weight_kg')
    .eq('user_id', user.id)
    .not('weight_kg', 'is', null)
    .order('date', { ascending: true })
    .limit(90)

  return data || []
}
```

---

**FIN DE PARTE 2**

> Continuar con **PARTE 3**: Componentes UI y Páginas Completas
