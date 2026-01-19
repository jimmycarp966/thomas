---
name: brainstorm
description: Lluvia de ideas estructurada para proyectos y funcionalidades. Explora múltiples opciones antes de la implementación.
---

# /brainstorm - Structured Idea Exploration

Use este workflow cuando necesites explorar opciones antes de comprometerte con una implementación.

## Proceso

### 1. Entender el Objetivo
- ¿Qué problema estamos resolviendo?
- ¿Quién es el usuario?
- ¿Qué restricciones existen?

### 2. Generar Opciones
- Proporcionar al menos 3 enfoques diferentes
- Cada uno con pros y contras
- Considerar soluciones no convencionales

### 3. Comparar y Recomendar
- Resumir las compensaciones (tradeoffs)
- Dar una recomendación con razonamiento

## Formato de Salida

```markdown
## 🧠 Brainstorm: [Tema]

### Contexto
[Declaración breve del problema]

---

### Opción A: [Nombre]
[Descripción]

✅ **Pros:**
- [beneficio 1]
- [beneficio 2]

❌ **Contras:**
- [desventaja 1]

📊 **Esfuerzo:** Bajo | Medio | Alto

---

### Opción B: [Nombre]
[Descripción]

✅ **Pros:**
- [beneficio 1]

❌ **Contras:**
- [desventaja 1]
- [desventaja 2]

📊 **Esfuerzo:** Bajo | Medio | Alto

---

### Opción C: [Nombre]
[Descripción]

✅ **Pros:**
- [beneficio 1]

❌ **Contras:**
- [desventaja 1]

📊 **Esfuerzo:** Bajo | Medio | Alto

---

## 💡 Recomendación

**Opción [X]** porque [razonamiento].

¿Qué dirección te gustaría explorar?
```

## Ejemplos de Uso

```
/brainstorm sistema de autenticación
/brainstorm gestión de estado para formulario complejo
/brainstorm esquema de base de datos para app social
/brainstorm estrategia de caché
```

## Principios Clave

- **Sin código** - esto es sobre ideas, no implementación
- **Visual cuando ayuda** - usa diagramas para arquitectura
- **Compensaciones honestas** - no ocultes complejidad
- **Dejar al usuario decidir** - presenta opciones, deja que decida
