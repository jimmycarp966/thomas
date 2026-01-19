---
name: orchestrate
description: Coordina múltiples agentes para tareas complejas. Úsalo para análisis multiperspectiva, revisiones exhaustivas o tareas que requieren diferentes dominios de experiencia.
---

# /orchestrate - Multi-Agent Orchestration

Use este workflow para coordinar múltiples agentes especializados para resolver problemas complejos.

## 🎯 Requisito Crítico

**ORQUESTRACIÓN = MÍNIMO 3 AGENTES DIFERENTES**

Si usas menos de 3 agentes, NO estás orquestando - solo estás delegando.

### Matriz de Selección de Agentes

| Tipo de Tarea | Agentes REQUERIDOS (mínimo) |
|---------------|----------------------------|
| **Web App** | frontend-specialist, backend-specialist, test-engineer |
| **API** | backend-specialist, security-auditor, test-engineer |
| **UI/Design** | frontend-specialist, seo-specialist, performance-optimizer |
| **Database** | database-architect, backend-specialist, security-auditor |
| **Full Stack** | project-planner, frontend-specialist, backend-specialist, devops-engineer |
| **Debug** | debugger, explorer-agent, test-engineer |
| **Security** | security-auditor, penetration-tester, devops-engineer |

---

## 🔄 Orquestación en 2 Fases

### FASE 1: Planificación (Secuencial)

| Paso | Agente | Acción |
|------|--------|--------|
| 1 | `project-planner` | Crear `.windsurf/plans/PLAN.md` |
| 2 | (opcional) `explorer-agent` | Descubrimiento del código si es necesario |

**NO usar otros agentes durante la planificación.**

### ⏸️ CHECKPOINT: Aprobación del Usuario

```
Después de completar PLAN.md, PREGUNTA:

"✅ Plan creado: .windsurf/plans/PLAN.md

¿Aprobar el plan? (Y/N)
- Y: Se inicia la implementación
- N: Corrijo el plan
```

**NO proceder a la FASE 2 sin aprobación explícita.**

### FASE 2: Implementación (Agentes paralelos después de aprobación)

| Grupo Paralelo | Agentes |
|----------------|---------|
| Fundación | `database-architect`, `security-auditor` |
| Core | `backend-specialist`, `frontend-specialist` |
| Pulido | `test-engineer`, `devops-engineer` |

---

## 🤖 Agentes Disponibles

| Agente | Dominio | Cuándo Usar |
|--------|---------|-------------|
| `project-planner` | Planificación | Desglose de tareas, PLAN.md |
| `explorer-agent` | Descubrimiento | Mapeo del código |
| `frontend-specialist` | UI/UX | React, Vue, CSS, HTML |
| `backend-specialist` | Servidor | API, Node.js, Python |
| `database-architect` | Datos | SQL, NoSQL, Schema |
| `security-auditor` | Seguridad | Vulnerabilidades, Auth |
| `penetration-tester` | Seguridad | Testing activo |
| `test-engineer` | Testing | Unit, E2E, Coverage |
| `devops-engineer` | Ops | CI/CD, Docker, Deploy |
| `mobile-developer` | Mobile | React Native, Flutter |
| `performance-optimizer` | Velocidad | Lighthouse, Profiling |
| `seo-specialist` | SEO | Meta, Schema, Rankings |
| `debugger` | Debug | Análisis de errores |
| `orchestrator` | Meta | Coordinación |

---

## 📋 Protocolo de Orquestación

### Paso 1: Analizar Dominios de la Tarea

Identificar TODOS los dominios que esta tarea toca:
```
□ Security     → security-auditor, penetration-tester
□ Backend/API  → backend-specialist
□ Frontend/UI  → frontend-specialist
□ Database     → database-architect
□ Testing      → test-engineer
□ DevOps       → devops-engineer
□ Mobile       → mobile-developer
□ Performance  → performance-optimizer
□ SEO          → seo-specialist
□ Planning     → project-planner
```

### Paso 2: Detección de Fase

| Si el Plan Existe | Acción |
|-------------------|--------|
| NO `PLAN.md` | → Ir a FASE 1 (solo planificación) |
| SÍ `PLAN.md` + usuario aprobó | → Ir a FASE 2 (implementación) |

### Paso 3: Ejecutar Según Fase

**FASE 1 (Planificación):**
```
Usar el agente project-planner para crear PLAN.md
→ DETENER después de crear el plan
→ PREGUNTAR al usuario por aprobación
```

**FASE 2 (Implementación - después de aprobación):**
```
Invocar agentes en PARALELO:
Usar el agente frontend-specialist para [tarea]
Usar el agente backend-specialist para [tarea]
Usar el agente test-engineer para [tarea]
```

### Paso 4: Verificación (OBLIGATORIO)

El ÚLTIMO agente debe ejecutar scripts de verificación apropiados:
```bash
# Verificar seguridad
# Verificar linting
# Verificar tests
```

### Paso 5: Sintetizar Resultados

Combinar todas las salidas de los agentes en un reporte unificado.

---

## 📊 Formato de Salida

```markdown
## 🎼 Reporte de Orquestación

### Tarea
[Resumen de la tarea original]

### Agentes Invocados (MÍNIMO 3)
| # | Agente | Área de Enfoque | Estado |
|---|--------|-----------------|--------|
| 1 | project-planner | Desglose de tareas | ✅ |
| 2 | frontend-specialist | Implementación UI | ✅ |
| 3 | test-engineer | Scripts de verificación | ✅ |

### Scripts de Verificación Ejecutados
- [x] security_scan → Pass/Fail
- [x] lint_runner → Pass/Fail

### Hallazgos Clave
1. **[Agente 1]**: Hallazgo
2. **[Agente 2]**: Hallazgo
3. **[Agente 3]**: Hallazgo

### Entregables
- [ ] PLAN.md creado
- [ ] Código implementado
- [ ] Tests pasando
- [ ] Scripts verificados

### Resumen
[Un párrafo de síntesis de todo el trabajo de los agentes]
```

---

## 🚪 Salida

Antes de completar la orquestación, verificar:

1. ✅ **Conteo de Agentes:** `agentes_invocados >= 3`
2. ✅ **Scripts Ejecutados:** Al menos `security_scan` se ejecutó
3. ✅ **Reporte Generado:** Reporte de orquestación con todos los agentes listados

**Si alguna verificación falla → NO marcar orquestación como completa. Invocar más agentes o ejecutar scripts.**

---

## Ejemplos de Uso

```
/orchestrate review and improve authentication system
/orchestrate build full-stack e-commerce application
/orchestrate audit security of entire codebase
/orchestrate optimize performance of dashboard
```

## Principios Clave

- **Mínimo 3 agentes** - orquestación verdadera
- **Contexto completo** - pasar toda la información a subagentes
- **Verificación obligatoria** - ejecutar scripts de seguridad y linting
- **Síntesis clara** - reporte unificado de todos los agentes
