# PARTE 3: COMPONENTES UI Y PÁGINAS COMPLETAS

## 🎨 INTEGRACIÓN CON GOOGLE STITCH

### Leer el Design System

**Archivo: `lib/design/stitch-parser.ts`**

```typescript
import fs from 'fs'
import path from 'path'

interface DesignSystem {
  colors: Record<string, any>
  typography: Record<string, any>
  spacing: Record<string, any>
  borderRadius: Record<string, any>
  shadows: Record<string, any>
}

export function loadDesignSystem(): DesignSystem | null {
  try {
    const designPath = path.join(process.cwd(), 'diseño', 'design-system.json')
    const designSystem = JSON.parse(fs.readFileSync(designPath, 'utf-8'))
    return designSystem
  } catch (error) {
    console.warn('No se encontró design-system.json de Google Stitch')
    return null
  }
}

export function loadMockups() {
  try {
    const mockupsPath = path.join(process.cwd(), 'diseño', 'mockups')
    return fs.readdirSync(mockupsPath)
  } catch (error) {
    return []
  }
}
```

---

## 🧩 COMPONENTES COMPARTIDOS

### Header

**Archivo: `components/Header.tsx`**

```typescript
import { getCurrentUser, logout } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Bell, Settings, LogOut, User } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'

export async function Header() {
  const user = await getCurrentUser()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">AI</span>
          </div>
          <span className="font-bold text-xl hidden sm:inline-block">
            Trading Assistant
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.email}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.user_metadata?.full_name}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <form action={logout}>
                  <button type="submit" className="flex w-full items-center cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar sesión
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
```

### Sidebar

**Archivo: `components/Sidebar.tsx`**

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  TrendingUp, 
  MessageSquare, 
  Heart, 
  Settings 
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Trading',
    href: '/trading',
    icon: TrendingUp,
  },
  {
    name: 'Chat IA',
    href: '/chat',
    icon: MessageSquare,
  },
  {
    name: 'Bienestar',
    href: '/wellness',
    icon: Heart,
  },
  {
    name: 'Configuración',
    href: '/settings',
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:pt-16 border-r">
      <div className="flex-1 flex flex-col min-h-0 bg-background">
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-accent-foreground'
                  )}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
```

### Theme Toggle

**Archivo: `components/ThemeToggle.tsx`**

```typescript
'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

---

## 📄 PÁGINAS PRINCIPALES

### Layout Autenticado

**Archivo: `app/(auth)/layout.tsx`**

```typescript
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:pl-64">
          <div className="container py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
```

### 1. Dashboard Page

**Archivo: `app/(auth)/dashboard/page.tsx`**

```typescript
import { Suspense } from 'react'
import { PerformanceChart } from './components/PerformanceChart'
import { RecentTrades } from './components/RecentTrades'
import { PendingSuggestions } from './components/PendingSuggestions'
import { QuickStats } from './components/QuickStats'
import { Skeleton } from '@/components/ui/skeleton'

export default async function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido de vuelta, revisa tus métricas y sugerencias
        </p>
      </div>

      {/* Quick Stats */}
      <Suspense fallback={<Skeleton className="h-32 w-full" />}>
        <QuickStats />
      </Suspense>

      {/* Pending Suggestions */}
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <PendingSuggestions />
      </Suspense>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <PerformanceChart />
        </Suspense>

        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <RecentTrades />
        </Suspense>
      </div>
    </div>
  )
}
```

**Componente: `app/(auth)/dashboard/components/QuickStats.tsx`**

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getUserStats } from '@/actions/trading'
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react'

export async function QuickStats() {
  const stats = await getUserStats()

  const statCards = [
    {
      title: 'Portfolio Total',
      value: `$${stats.totalPortfolio.toFixed(2)}`,
      icon: DollarSign,
      change: stats.portfolioChange,
      changeType: parseFloat(stats.portfolioChange) >= 0 ? 'positive' : 'negative'
    },
    {
      title: 'P&L Hoy',
      value: `$${stats.todayPnL.toFixed(2)}`,
      icon: stats.todayPnL >= 0 ? TrendingUp : TrendingDown,
      change: stats.todayPnLPercentage,
      changeType: stats.todayPnL >= 0 ? 'positive' : 'negative'
    },
    {
      title: 'Trades Activos',
      value: stats.activeTrades.toString(),
      icon: Activity,
      change: null,
      changeType: null
    },
    {
      title: 'Win Rate',
      value: `${stats.winRate}%`,
      icon: TrendingUp,
      change: null,
      changeType: null
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {stat.change !== null && (
              <p className={`text-xs ${
                stat.changeType === 'positive' 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {parseFloat(stat.change) >= 0 ? '+' : ''}{stat.change}%
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

**Componente: `app/(auth)/dashboard/components/PendingSuggestions.tsx`**

```typescript
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getPendingSuggestions, approveSuggestion, rejectSuggestion } from '@/actions/trading'
import { TrendingUp, TrendingDown } from 'lucide-react'

export async function PendingSuggestions() {
  const suggestions = await getPendingSuggestions()

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sugerencias Pendientes</CardTitle>
          <CardDescription>
            No hay sugerencias nuevas. La IA analizará el mercado en la próxima hora.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sugerencias Pendientes</CardTitle>
        <CardDescription>
          La IA ha analizado el mercado y tiene {suggestions.length} sugerencia(s) para ti
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="border rounded-lg p-4 space-y-3"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {suggestion.decision_type === 'BUY' ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
                <h3 className="font-semibold text-lg">
                  {suggestion.decision_type} {suggestion.asset_symbol}
                </h3>
              </div>
              <Badge variant={
                suggestion.ai_analysis.confidence > 0.8 
                  ? 'default' 
                  : 'secondary'
              }>
                {(suggestion.ai_analysis.confidence * 100).toFixed(0)}% confianza
              </Badge>
            </div>

            {/* Analysis */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {suggestion.ai_analysis.reasoning}
              </p>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Precio sugerido:</span>
                  <span className="font-medium ml-2">
                    ${suggestion.suggested_price}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Monto:</span>
                  <span className="font-medium ml-2">
                    ${suggestion.suggested_amount}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Stop Loss:</span>
                  <span className="font-medium ml-2">
                    ${suggestion.stop_loss_price}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Take Profit:</span>
                  <span className="font-medium ml-2">
                    ${suggestion.take_profit_price}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <form action={approveSuggestion}>
                <input type="hidden" name="suggestionId" value={suggestion.id} />
                <Button type="submit" variant="default" size="sm">
                  ✓ Aprobar y Ejecutar
                </Button>
              </form>
              <form action={rejectSuggestion}>
                <input type="hidden" name="suggestionId" value={suggestion.id} />
                <Button type="submit" variant="outline" size="sm">
                  ✗ Rechazar
                </Button>
              </form>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
```

**Componente: `app/(auth)/dashboard/components/PerformanceChart.tsx`**

```typescript
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Este componente debería obtener datos reales, aquí un ejemplo con datos mock
const data = [
  { date: '1 Ene', value: 1000 },
  { date: '8 Ene', value: 1050 },
  { date: '15 Ene', value: 1120 },
  { date: '22 Ene', value: 1080 },
  { date: '29 Ene', value: 1150 },
]

export function PerformanceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rendimiento del Portfolio</CardTitle>
        <CardDescription>Últimos 30 días</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

**Componente: `app/(auth)/dashboard/components/RecentTrades.tsx`**

```typescript
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getActiveTrades } from '@/actions/trading'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export async function RecentTrades() {
  const trades = await getActiveTrades()
  const recentTrades = trades.slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trades Recientes</CardTitle>
        <CardDescription>Últimas 5 operaciones</CardDescription>
      </CardHeader>
      <CardContent>
        {recentTrades.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay trades recientes
          </p>
        ) : (
          <div className="space-y-4">
            {recentTrades.map((trade) => (
              <div key={trade.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={trade.trade_type === 'BUY' ? 'default' : 'secondary'}>
                      {trade.trade_type}
                    </Badge>
                    <span className="font-semibold">{trade.asset_symbol}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(trade.created_at), { 
                      addSuffix: true,
                      locale: es 
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${trade.total_amount.toFixed(2)}</p>
                  {trade.trade_results[0] && (
                    <p className={`text-sm ${
                      (trade.trade_results[0].pnl_amount || 0) >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {(trade.trade_results[0].pnl_amount || 0) >= 0 ? '+' : ''}
                      ${(trade.trade_results[0].pnl_amount || 0).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

### 2. Chat Page

**Archivo: `app/(auth)/chat/page.tsx`**

```typescript
'use client'

import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { sendChatMessage } from '@/actions/chat'
import { Send, Loader2 } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await sendChatMessage(input)
      
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <Card className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b p-4">
          <h1 className="text-2xl font-bold">Chat con IA</h1>
          <p className="text-sm text-muted-foreground">
            Pregúntame sobre trading, tu portfolio o bienestar
          </p>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-12">
                <p>Comienza una conversación...</p>
                <p className="text-sm mt-2">
                  Ejemplos: "¿Cómo va mi portfolio?" • "¿Debería comprar BTC?" • "Analiza mis últimos trades"
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs mt-2 opacity-70">
                    {message.timestamp.toLocaleTimeString('es-AR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-4">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}

            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <form onSubmit={handleSubmit} className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="resize-none"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Presiona Enter para enviar, Shift+Enter para nueva línea
          </p>
        </form>
      </Card>
    </div>
  )
}
```

### 3. Wellness Page

**Archivo: `app/(auth)/wellness/page.tsx`**

```typescript
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FastingTimer } from './components/FastingTimer'
import { WeightTracker } from './components/WeightTracker'
import { WellnessStats } from './components/WellnessStats'

export default function WellnessPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bienestar</h1>
        <p className="text-muted-foreground">
          Trackea tu ayuno, peso y métricas de salud
        </p>
      </div>

      <Tabs defaultValue="fasting" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="fasting">Ayuno</TabsTrigger>
          <TabsTrigger value="weight">Peso</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="fasting" className="space-y-4">
          <FastingTimer />
        </TabsContent>

        <TabsContent value="weight" className="space-y-4">
          <WeightTracker />
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <WellnessStats />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

**Componente: `app/(auth)/wellness/components/FastingTimer.tsx`**

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { startFasting, endFasting, getCurrentFasting } from '@/actions/wellness'
import { Play, Square } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function FastingTimer() {
  const [fastingData, setFastingData] = useState<any>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadFastingData()
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const loadFastingData = async () => {
    const data = await getCurrentFasting()
    setFastingData(data)
  }

  const calculateElapsedTime = () => {
    if (!fastingData?.fasting_start) return '00:00:00'
    
    const start = new Date(fastingData.fasting_start)
    const diff = currentTime.getTime() - start.getTime()
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const handleStartFasting = async () => {
    setIsLoading(true)
    await startFasting()
    await loadFastingData()
    router.refresh()
    setIsLoading(false)
  }

  const handleEndFasting = async () => {
    setIsLoading(true)
    await endFasting()
    await loadFastingData()
    router.refresh()
    setIsLoading(false)
  }

  const isFasting = fastingData?.fasting_start && !fastingData?.fasting_end

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timer de Ayuno Intermitente</CardTitle>
        <CardDescription>
          {isFasting 
            ? 'Ayuno en progreso...' 
            : 'Inicia tu ventana de ayuno'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timer Display */}
        <div className="text-center">
          <div className="text-6xl font-mono font-bold">
            {isFasting ? calculateElapsedTime() : '00:00:00'}
          </div>
          {isFasting && fastingData && (
            <p className="text-sm text-muted-foreground mt-2">
              Iniciado: {new Date(fastingData.fasting_start).toLocaleString('es-AR')}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          {!isFasting ? (
            <Button
              onClick={handleStartFasting}
              disabled={isLoading}
              size="lg"
            >
              <Play className="mr-2 h-5 w-5" />
              Iniciar Ayuno
            </Button>
          ) : (
            <Button
              onClick={handleEndFasting}
              disabled={isLoading}
              variant="destructive"
              size="lg"
            >
              <Square className="mr-2 h-5 w-5" />
              Finalizar Ayuno
            </Button>
          )}
        </div>

        {/* Stats */}
        {fastingData && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold">{fastingData.streak || 0}</p>
              <p className="text-xs text-muted-foreground">Racha (días)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{fastingData.avg_hours || 0}h</p>
              <p className="text-xs text-muted-foreground">Promedio</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{fastingData.total_fasts || 0}</p>
              <p className="text-xs text-muted-foreground">Total completados</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

---

**FIN DE PARTE 3**

> Continuar con **PARTE 4**: Sistema de IA, Memoria Vectorial y APIs
