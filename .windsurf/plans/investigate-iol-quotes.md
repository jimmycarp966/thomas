# Plan de Investigación y Solución - Cotizaciones de IOL No Cargan

## 🎯 Problema

Las cotizaciones de IOL (Mercado Argentino) no se cargan en la aplicación web. La página muestra "Cargando cotizaciones..." indefinidamente en lugar de mostrar las cotizaciones de las acciones argentinas.

## 📊 Estado Actual

### ✅ Confirmado Funcional
- **Autenticación de IOL**: Funciona correctamente (200 OK)
  - Username: `adani.romano@gmail.com`
  - Password: `Pastelito673!!!`
  - Token recibido correctamente
  - Refresh token recibido
  - Expira en 1200 segundos (20 minutos)

### ❌ Problema Identificado
- **Cotizaciones de IOL**: No se cargan en la aplicación
- **Estado UI**: Muestra "Cargando cotizaciones..." indefinidamente
- **Cotizaciones de Binance**: Sí cargan correctamente (BTC, ETH, SOL)

## 🔍 Análisis Preliminar

### Flujo de Carga de Cotizaciones
1. `app/trading/page.tsx` → `loadQuotes()`
2. `loadQuotes()` → `getLiveQuotes()` (Server Action)
3. `getLiveQuotes()` → Verifica credenciales IOL
4. Si credenciales válidas → `iol.getPortfolio()`
5. Si portafolio vacío → `iol.getQuote()` para tickers populares
6. Retorna array de `QuoteData[]`

### Síntomas Observados
- La autenticación funciona cuando se prueba directamente
- La aplicación no detecta las credenciales correctamente
- El estado `loadingQuotes` nunca cambia a `false`

## 🎯 Dominios Involucrados

- **Backend/API** → backend-specialist (Server Actions, IOL API)
- **Frontend/UI** → frontend-specialist (Estado de carga, React hooks)
- **Database** → database-architect (Configuración de credenciales)
- **Debug** → debugger (Investigación del problema)

## 📋 Plan de Investigación

### FASE 1: Verificación de Credenciales en Base de Datos
**Objetivo**: Confirmar que las credenciales se guardaron correctamente en Supabase.

**Tareas**:
1. Ejecutar script SQL para verificar credenciales
2. Confirmar que `iol_username` y `iol_password` existen
3. Verificar que el registro de `trading_config` está vinculado al usuario correcto

**Agente**: `database-architect`

**Archivos**:
- `supabase/migrations/006_verify_iol_credentials.sql`
- `supabase/migrations/007_create_trading_config.sql`

---

### FASE 2: Debug de Server Action getLiveQuotes()
**Objetivo**: Identificar por qué `getLiveQuotes()` no completa o tarda mucho.

**Tareas**:
1. Agregar logs detallados en `actions/quotes.ts`
2. Verificar que las credenciales se leen correctamente de la base de datos
3. Verificar que el cliente IOL se crea correctamente
4. Verificar que `getPortfolio()` se ejecuta
5. Verificar manejo de errores y excepciones

**Agente**: `backend-specialist`

**Archivos**:
- `actions/quotes.ts`
- `lib/trading/iol-client.ts`

---

### FASE 3: Debug de Frontend - Estado de Carga
**Objetivo**: Identificar por qué `loadingQuotes` nunca cambia a `false`.

**Tareas**:
1. Verificar que `loadQuotes()` se ejecuta correctamente
2. Verificar que `setLoadingQuotes(false)` se llama en el bloque `finally`
3. Verificar que no hay errores silenciosos en el bloque `catch`
4. Agregar logs en el componente para rastrear el flujo
5. Verificar que el estado se actualiza correctamente

**Agente**: `frontend-specialist`

**Archivos**:
- `app/trading/page.tsx`

---

### FASE 4: Pruebas de Integración
**Objetivo**: Probar el flujo completo de carga de cotizaciones.

**Tareas**:
1. Crear script de prueba directo que simule el flujo de la aplicación
2. Probar autenticación → getPortfolio → getQuote
3. Probar fallback a tickers populares
4. Verificar que los datos se retornan correctamente
5. Probar que el estado se actualiza en el frontend

**Agente**: `test-engineer`

**Archivos**:
- `scripts/test-iol-quotes-flow.ts` (nuevo)

---

### FASE 5: Implementación de Solución
**Objetivo**: Implementar la solución basada en los hallazgos de las fases anteriores.

**Tareas**:
1. Corregir el problema identificado en la fase de investigación
2. Agregar manejo de errores robusto
3. Agregar timeouts para evitar bloqueos indefinidos
4. Implementar retry logic para requests fallidos
5. Agregar logs detallados para debugging futuro

**Agentes**:
- `backend-specialist` (Correcciones en Server Actions)
- `frontend-specialist` (Correcciones en UI)
- `test-engineer` (Validación de solución)

**Archivos**:
- `actions/quotes.ts`
- `app/trading/page.tsx`
- `lib/trading/iol-client.ts`

---

## 🎯 Criterios de Éxito

- [ ] Las cotizaciones de IOL se cargan correctamente en la aplicación
- [ ] El estado "Cargando cotizaciones..." desaparece después de cargar
- [ ] Se muestran las cotizaciones de acciones argentinas (GGAL, YPF, etc.)
- [ ] No hay errores en la consola del navegador
- [ ] No hay errores en el servidor
- [ ] El flujo funciona correctamente al recargar la página

## 📊 Cronograma Estimado

- **FASE 1**: 5 minutos (Verificación de credenciales)
- **FASE 2**: 15 minutos (Debug de Server Action)
- **FASE 3**: 10 minutos (Debug de Frontend)
- **FASE 4**: 10 minutos (Pruebas de integración)
- **FASE 5**: 20 minutos (Implementación de solución)

**Total estimado**: 60 minutos

## ⚠️ Consideraciones Importantes

1. **Timeouts**: Agregar timeouts para evitar bloqueos indefinidos
2. **Error Handling**: Manejar todos los errores posibles
3. **Logging**: Agregar logs detallados para debugging futuro
4. **User Experience**: Mostrar mensajes de error claros al usuario
5. **Retry Logic**: Implementar retry para requests fallidos
6. **Fallback**: Asegurar que el fallback a tickers populares funcione

## 🔧 Scripts de Verificación

```bash
# Verificar credenciales en base de datos
psql -f supabase/migrations/006_verify_iol_credentials.sql

# Prueba de autenticación directa
npx tsx scripts/test-iol-auth.ts

# Prueba de flujo completo
npx tsx scripts/test-iol-quotes-flow.ts
```

## 📝 Notas

- La autenticación funciona correctamente cuando se prueba directamente
- El problema está en cómo la aplicación lee las credenciales o maneja el flujo
- Es posible que haya un error silencioso en el Server Action
- Es posible que el estado de React no se actualice correctamente
- Es posible que haya un timeout o bloqueo en alguna parte del flujo
