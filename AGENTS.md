> **MANDATORIO: Siempre responde en ESPAÑOL**

# AGENTS.md - Thomas Trading Assistant

Este archivo define las reglas y directrices para Cascade (Windsurf AI) cuando trabaja en el proyecto Thomas - AI Trading & Wellness Assistant.

---

## 🎯 Contexto del Proyecto

**Thomas** es un asistente personal de IA para trading inteligente, chat conversacional y tracking de bienestar con:
- Next.js 15, TypeScript, React 19, Tailwind CSS
- Supabase (Postgres, Auth, Storage, pgvector, Realtime)
- Google Vertex AI (Gemini 2.0)
- Trading APIs (Binance, Yahoo Finance, IOL Argentina)

---

## 🌐 Reglas Universales (TIER 0)

### Idioma
- **RESPUESTAS EN ESPAÑOL** - Siempre responde en español
- Código, variables y nombres de archivos en **INGLÉS**
- Comentarios en código en **INGLÉS**

### Clean Code
- Código conciso, directo y enfocado en soluciones
- Sin explicaciones verbosas
- Sin sobre-comentarios
- Sin sobre-ingeniería
- Documentación automática: cada cambio debe documentarse

### Testing Mandatorio
- Escribir tests para todos los cambios
- Testing Pyramid: Unit > Integration > E2E
- Patrón AAA: Arrange, Act, Assert

### Performance
- "Medir primero, optimizar después"
- Core Web Vitals para Web
- Optimización de queries para DB
- Límites de bundle

### Seguridad
- Nunca exponer API keys en frontend
- Usar Supabase RLS para proteger datos
- Validar todas las entradas del usuario
- Variables de entorno para secrets

---

## 🛠️ Routing por Tipo de Archivo

### Frontend (React/Next.js)
- Ubicación: `app/`, `components/`
- Framework: Next.js 15 App Router, React 19
- Estilos: Tailwind CSS, shadcn/ui
- Patrones: React hooks, Server Components

### Backend (Server Actions)
- Ubicación: `actions/`, `lib/`
- Framework: Next.js Server Actions
- Base de datos: Supabase
- API: REST/GraphQL

### Database
- Ubicación: `supabase/migrations/`
- ORM: Supabase client directo
- Extensiones: uuid-ossp, vector (pgvector)

### AI Services
- Ubicación: `lib/ai/`
- Provider: Google Vertex AI (Gemini 2.0)
- Funciones: Generación, embeddings, chat

### Trading APIs
- Ubicación: `lib/trading/`
- Exchanges: Binance, IOL Argentina, Yahoo Finance
- Librería: ccxt (Python en Cloud Functions)

---

## 🎨 Reglas de Diseño

### UI/UX
- **PROHIBIDO**: colores violeta/púrpura
- **PROHIBIDO**: layouts estándar o templates genéricos
- **REQUERIDO**: diseño único y distintivo
- **REQUERIDO**: modo oscuro por defecto
- **REQUERIDO**: responsive design

### Componentes
- Usar shadcn/ui como base
- Personalizar según diseño de Google Stitch (si disponible)
- Componentes funcionales con hooks
- TypeScript estricto

---

## 📁 Estructura de Archivos

```
ai-trading-assistant/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rutas autenticadas
│   │   ├── dashboard/
│   │   ├── trading/
│   │   ├── chat/
│   │   └── wellness/
│   ├── (public)/          # Login/Register
│   └── layout.tsx
├── components/            # UI components
│   └── ui/               # shadcn/ui
├── actions/              # Server Actions
├── lib/                   # Libraries
│   ├── supabase/         # Client, server, middleware
│   ├── ai/               # Gemini, embeddings, prompts
│   └── trading/          # Exchanges, analysis
├── supabase/             # Migrations, Edge Functions
└── google-cloud/         # Python Cloud Functions
```

---

## 🔄 Flujo de Trabajo

### Para Nuevas Funcionalidades
1. **Planificación**: Crear/actualizar plan en `.windsurf/plans/`
2. **Análisis**: Revisar dependencias y archivos afectados
3. **Implementación**: Seguir patrones existentes
4. **Testing**: Escribir tests (unit, integration, E2E)
5. **Documentación**: Actualizar README y docs relevantes

### Para Bug Fixes
1. **Diagnóstico**: Usar systematic debugging
2. **Root Cause**: Identificar causa raíz
3. **Fix**: Aplicar fix mínimo y enfocado
4. **Test**: Agregar test de regresión
5. **Verify**: Verificar que no rompe nada más

---

## 🚫 Prohibiciones

- ❌ NO modificar archivos fuera del dominio de trabajo
- ❌ NO exponer secrets o API keys
- ❌ NO usar colores violeta/púrpura en UI
- ❌ NO usar templates genéricos
- ❌ NO hacer commits sin tests
- ❌ NO ignorar errores de TypeScript
- ❌ NO hacer cambios destructivos sin backup

---

## ✅ Requisitos Obligatorios

- [ ] TypeScript estricto (sin `any`)
- [ ] Tests para todo código nuevo
- [ ] Documentación de cambios
- [ ] Validación de inputs (Zod)
- [ ] Manejo de errores
- [ ] Logs apropiados
- [ ] Performance checks
- [ ] Security review para auth/data

---

## 🤖 Contexto de IA

### Gemini 2.0 Integration
- Modelos: Flash (rápido), Pro (complejo)
- Funciones: generación, chat, embeddings
- Rate limiting implementado
- Caching de respuestas

### Memoria Vectorial (RAG)
- pgvector para embeddings
- Búsqueda semántica
- Contexto histórico de conversaciones
- Aprendizaje de decisiones de trading

---

## 📊 Métricas de Éxito

- **Performance**: Core Web Vitals < 2.5s
- **Coverage**: Tests > 80%
- **Type Safety**: 0 errores de TypeScript
- **Security**: 0 vulnerabilidades críticas
- **UX**: Lighthouse score > 90

---

## 📖 Referencias

- Documentación completa: `.windsurf/ARCHITECTURE.md`
- Reglas maestras: `.windsurf/rules/GEMINI.md`
- Plan de implementación: `.windsurf/plans/ai-trading-assistant-implementation.md`
- Supabase docs: https://supabase.com/docs
- Next.js docs: https://nextjs.org/docs
- Vertex AI docs: https://cloud.google.com/vertex-ai
