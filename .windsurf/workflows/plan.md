---
name: plan
description: Crea un plan de proyecto detallado con desglose de tareas, asignación de agentes y roadmap. No escribe código, solo genera el plan.
---

# /plan - Project Planning

Use este workflow para crear planes de proyecto detallados.

## Proceso

### 1. Gate Socrático (Preguntas de Clarificación)
Si la solicitud es ambigua, hacer 2-3 preguntas clave:
- ¿Cuál es el alcance? (app completa / módulo específico / archivo único?)
- ¿Qué es más importante? (seguridad / velocidad / funcionalidades?)
- ¿Algún stack tecnológico preferido?
- ¿Restricciones de tiempo o presupuesto?

### 2. Análisis del Proyecto
- Identificar tipo de proyecto (WEB/MOBILE/BACKEND)
- Determinar stack tecnológico apropiado
- Identificar dependencias y requisitos

### 3. Desglose de Tareas
- Dividir el proyecto en fases
- Crear tareas específicas para cada fase
- Asignar agentes a cada tarea
- Definir criterios de aceptación

### 4. Roadmap
- Estimar tiempo para cada fase
- Identificar dependencias entre tareas
- Crear timeline visual

## Formato de Salida

```markdown
# Plan: [Nombre del Proyecto]

## 📋 Overview
[Descripción del proyecto]

## 🎯 Objetivos
- [Objetivo 1]
- [Objetivo 2]

## 🛠️ Stack Tecnológico
- Frontend: [frameworks/librerías]
- Backend: [frameworks/librerías]
- Database: [tipo de base de datos]
- Otros: [herramientas]

## 📅 Roadmap

### Fase 1: [Nombre]
- [ ] Tarea 1 - [Agente asignado]
- [ ] Tarea 2 - [Agente asignado]
Tiempo estimado: X días

### Fase 2: [Nombre]
- [ ] Tarea 1 - [Agente asignado]
- [ ] Tarea 2 - [Agente asignado]
Tiempo estimado: X días

## ✅ Criterios de Aceptación
- [Criterio 1]
- [Criterio 2]
```

## Ejemplos de Uso

```
/plan e-commerce site with cart
/plan mobile app for fitness tracking
/plan SaaS dashboard with analytics
/plan authentication system
```

## Principios Clave

- **Sin código** - solo planificación
- **Preguntas primero** - clarificar antes de planificar
- **Tareas específicas** - no vagas o ambiguas
- **Asignación de agentes** - quién hace qué

## Checklist

Antes de crear el plan:
- [ ] Entender completamente la solicitud
- [ ] Hacer preguntas de clarificación si es necesario
- [ ] Identificar el tipo de proyecto
- [ ] Determinar el stack tecnológico
- [ ] Desglosar en tareas específicas
