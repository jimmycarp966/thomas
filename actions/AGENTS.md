> **MANDATORIO: Siempre responde en ESPAÑOL**

# AGENTS.md - Server Actions (actions/)

Este archivo define las reglas específicas para trabajar en el directorio `actions/` (Server Actions de Next.js).

---

## 🎯 Contexto

El directorio `actions/` contiene todos los Server Actions de Next.js que manejan la lógica del servidor y mutaciones de datos.

---

## 📁 Estructura

```
actions/
├── auth.ts              # Autenticación (login, register, logout)
├── trading.ts           # Trading y análisis de mercado
├── chat.ts              # Chat con IA y mensajes
├── wellness.ts          # Salud y rendimiento
├── anthropometry.ts     # Datos biométricos
└── settings.ts          # Configuración del usuario
```

---

## 🛠️ Reglas Específicas

### Server Actions Pattern
- Todos los archivos deben tener `'use server'` al inicio
- Usar `await createClient()` para obtener cliente Supabase
- Validar inputs con Zod antes de procesar
- Manejar errores con try-catch
- Retornar objetos con `{ success: boolean, data?: any, error?: string }`

### Supabase Client
```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
```

### Validación de Inputs
- Usar Zod schemas para validar todos los inputs
- Validar antes de consultar base de datos
- Retornar errores claros al usuario

### Seguridad
- **SIEMPRE** verificar autenticación del usuario
- Usar RLS policies de Supabase para protección de datos
- Nunca exponer secrets o API keys
- Sanitizar todos los inputs del usuario

---

## 🔄 Flujo de Trabajo

### Para Crear Nuevo Server Action
1. Crear archivo en `actions/` con `'use server'`
2. Importar `createClient` de `@/lib/supabase/server`
3. Definir Zod schema para validación
4. Implementar lógica con try-catch
5. Retornar resultado estandarizado
6. Agregar tests en `tests/actions/`
7. Actualizar tipos TypeScript si es necesario

### Para Modificar Server Action Existente
1. Leer código existente
2. Identificar validaciones existentes
3. Mantener consistencia con patrones de retorno
4. Agregar tests si hay cambios de lógica
5. Verificar que no rompe dependencias

---

## 🚫 Prohibiciones

- ❌ NO usar `console.log` con datos sensibles
- ❌ NO exponer secrets o API keys
- ❌ NO omitir validación de inputs
- ❌ NO ignorar errores de Supabase
- ❌ NO hacer commits sin tests
- ❌ NO usar `any` en TypeScript

---

## ✅ Requisitos Obligatorios

- [ ] `'use server'` al inicio del archivo
- [ ] Validación de inputs con Zod
- [ ] Verificación de autenticación
- [ ] Manejo de errores con try-catch
- [ ] Retorno estandarizado
- [ ] Tests para lógica compleja
- [ ] TypeScript estricto

---

## 📖 Referencias

- Next.js Server Actions: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- Supabase Auth: https://supabase.com/docs/guides/auth/server-side
- Zod: https://zod.dev
