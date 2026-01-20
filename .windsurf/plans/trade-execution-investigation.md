# Plan de Investigación: Trade Execution

## 🎯 Objetivo
Investigar por qué Thomas dice que ejecuta trades en el chat pero no hay registros en la base de datos, a pesar de estar desplegado en Vercel.

## 📊 Evidencia Actual

### Chat (09:27 - 09:28):
1. Usuario: "hola, quiero invertir $5000 que recomendas?"
2. Thomas: Recomienda PAMP ($4795.00)
3. Usuario: "Compra los 5000 por favor"
4. Thomas: "Daniel, ya realicé la compra de PAMP por $5000..."

### Base de Datos:
- ❌ `trades`: 0 registros
- ❌ `trading_decisions`: 0 registros
- ✅ `chat_messages`: 4 registros (conversación existe)

## 🔍 Hipótesis

### Hipótesis 1: Parser no detecta el comando
- El mensaje "Compra los 5000 por favor" no contiene el símbolo "PAMP"
- El parser necesita detectar el símbolo en el contexto de la conversación
- **Probabilidad: ALTA**

### Hipótesis 2: Error silencioso en ejecución
- La función `executeSingleTrade` falla pero no se registra el error
- Circuit Breaker o Trust Ladder están bloqueando la ejecución
- **Probabilidad: MEDIA**

### Hipótesis 3: Deploy no actualizado
- Vercel no ha desplegado la última versión con la funcionalidad
- El código local tiene la funcionalidad pero el deploy no
- **Probabilidad: BAJA (usuario confirmó que está activo)**

### Hipótesis 4: Problema con IOL API
- La API de IOL está fallando o rechazando las órdenes
- Error de autenticación o conexión
- **Probabilidad: MEDIA**

## 🧪 Plan de Investigación

### Paso 1: Verificar logs de Vercel
- Buscar logs de la función `sendChatMessage`
- Verificar si hay errores en la ejecución
- Confirmar que el código desplegado es el más reciente

### Paso 2: Verificar parser de intenciones
- Probar el parser con el mensaje "Compra los 5000 por favor"
- Verificar si detecta el símbolo en el contexto
- Verificar si `shouldExecuteTrade` devuelve true

### Paso 3: Verificar Circuit Breaker y Trust Ladder
- Verificar si Circuit Breaker está activado
- Verificar si Trust Ladder permite la ejecución
- Verificar si hay configuración de trading

### Paso 4: Verificar IOL API
- Probar la conexión con IOL
- Verificar credenciales
- Verificar si hay errores de autenticación

### Paso 5: Verificar base de datos
- Verificar si hay errores en las consultas
- Verificar si hay restricciones de RLS
- Verificar si hay errores de inserción

## 📋 Agentes a Invocar

### FASE 1: Planificación (Actual)
- ✅ project-planner: Crear este plan

### FASE 2: Investigación (Paralelo)
- **debugger**: Analizar el código y buscar errores
- **backend-specialist**: Verificar la lógica de ejecución en el backend
- **database-architect**: Verificar el esquema de la base de datos y las consultas

### FASE 3: Verificación
- **test-engineer**: Ejecutar tests de integración
- **devops-engineer**: Verificar logs de Vercel

## 🎯 Entregables

- [ ] Análisis del parser de intenciones
- [ ] Análisis de la lógica de ejecución
- [ ] Análisis del esquema de base de datos
- [ ] Logs de Vercel
- [ ] Tests de integración
- [ ] Reporte final con causa raíz

## 📌 Notas

- El usuario confirmó que el deploy está activo
- El código local tiene la funcionalidad implementada
- Thomas genera respuestas pero no ejecuta trades
- No hay errores visibles en el chat
