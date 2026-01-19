> **MANDATORIO: Siempre responde en ESPAÑOL**

# AGENTS.md - Supabase (supabase/)

Este archivo define las reglas específicas para trabajar en el directorio `supabase/` (migraciones y Edge Functions).

---

## 🎯 Contexto

El directorio `supabase/` contiene todas las migraciones SQL y Edge Functions de Supabase.

---

## 📁 Estructura

```
supabase/
├── migrations/           # Migraciones SQL
│   ├── 001_initial_schema.sql
│   ├── 002_vector_search.sql
│   └── 003_rls_policies.sql
└── functions/            # Edge Functions
    ├── analyze-market/
    └── evaluate-trades/
```

---

## 🛠️ Reglas Específicas

### Migraciones SQL
- Usar naming convention: `XXX_descripcion.sql`
- Cada migración debe ser idempotente
- Incluir comentarios explicativos
- Usar extensiones: `uuid-ossp`, `vector`

### Row Level Security (RLS)
- **SIEMPRE** habilitar RLS en todas las tablas
- Crear policies restrictivas por defecto
- Usar `auth.uid()` para verificar usuario
- Testear policies antes de deploy

### Edge Functions
- Usar Deno runtime
- Implementar rate limiting
- Validar todos los inputs
- Manejar errores apropiadamente

---

## 🔄 Flujo de Trabajo

### Para Crear Nueva Migración
1. Crear archivo en `supabase/migrations/`
2. Usar naming convention `XXX_descripcion.sql`
3. Escribir SQL idempotente
4. Incluir comentarios explicativos
5. Testear localmente
6. Aplicar a Supabase

### Para Crear Nueva Edge Function
1. Crear directorio en `supabase/functions/`
2. Crear `index.ts` con código
3. Implementar rate limiting
4. Validar inputs
5. Testear localmente
6. Deploy a Supabase

---

## 🚫 Prohibiciones

- ❌ NO omitir RLS policies
- ❌ NO exponer secrets en código
- ❌ NO usar SQL inyectable
- ❌ NO hacer commits sin tests
- ❌ NO modificar migraciones ya aplicadas

---

## ✅ Requisitos Obligatorios

- [ ] RLS habilitado en todas las tablas
- [ ] Migraciones idempotentes
- [ ] Rate limiting en Edge Functions
- [ ] Validación de inputs
- [ ] Error handling robusto
- [ ] Tests para lógica compleja

---

## 📖 Referencias

- Supabase Migrations: https://supabase.com/docs/guides/database/migrations
- Supabase RLS: https://supabase.com/docs/guides/auth/row-level-security
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
