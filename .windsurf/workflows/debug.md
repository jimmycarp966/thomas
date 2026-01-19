---
name: debug
description: Depuración sistemática de problemas usando el skill systematic-debugging. Identifica la causa raíz antes de implementar soluciones.
---

# /debug - Systematic Debugging

Use este workflow para depurar problemas de manera sistemática.

## Proceso

### 1. Entender el Problema
- Reproducir el problema consistentemente
- Identificar síntomas exactos
- Revisar mensajes de error y stack traces
- Identificar el alcance (un componente, múltiples, toda la app)

### 2. Aislar el Problema
- Búsqueda binaria para localizar el problema
- Comentar código temporalmente
- Probar en aislamiento
- Verificar dependencias

### 3. Formular Hipótesis
- Crear hipótesis específica basada en evidencia
- Hacer predicción: "Si cambio X, entonces Y debería pasar"
- Implementar cambio mínimo para probar
- Verificar resultado

### 4. Corregir el Problema
- Abordar la causa raíz (no solo parchar síntomas)
- Hacer cambios mínimos
- Agregar test de regresión
- Documentar la corrección

### 5. Verificar y Probar
- Verificar que el problema está resuelto
- Probar casos extremos
- Ejecutar tests existentes
- Verificar que no introdujo problemas de rendimiento

## Formato de Salida

```markdown
## 🐛 Debug: [Problema]

### Contexto
[Descripción del problema]

### Análisis
[Investigación realizada]

### Causa Raíz
[Identificación de la causa raíz]

### Solución
[Descripción de la solución implementada]

### Verificación
[Resultados de las pruebas]
```

## Ejemplos de Uso

```
/debug login no funciona
/debug performance issue en dashboard
/debug state not updating en form
/debug database connection error
```

## Principios Clave

- **Primero medir, luego optimizar** - no adivines
- **Causa raíz** - no parches temporales
- **Cambios mínimos** - solución más pequeña posible
- **Tests de regresión** - prevenir que vuelva a pasar
