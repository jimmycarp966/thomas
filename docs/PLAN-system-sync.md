# Plan de Sincronización Integral: Thomas Pro Max

Thomas ha evolucionado por módulos. Este plan asegura que la comunicación entre ellos sea bidireccional, coherente y en tiempo real.

## Objetivo
Verificar y conectar todos los puntos de datos entre el **Bio-Profile (Salud)**, el **Trading Agéntico** y el **Dashboard Principal**, asegurando que la IA (Thomas) actúe con contexto total.

## Fase 1: Auditoría de Conectividad (Explorer Agent)
- [ ] **Data Flow Map**: Mapear qué acciones de servidor (`actions/`) alimentan cada vista.
- [ ] **AI Context Check**: Verificar en `actions/ai.ts` que el `chatResponse` reciba datos reales y no hardcodeados de:
    - Valor de Portfolio real.
    - Wellness Score 2.0.
    - Medidas de Antropometría.
- [ ] **Cross-Module check**: ¿El Wellness Score afecta proporcionalmente el riesgo sugerido por la IA?

## Fase 2: Implementación de Vínculos Perdidos (Backend & Frontend Specialists)
- [ ] **Dashboard Unificado (`app/page.tsx`)**:
    - Asegurar que el resumen de Salud y Trading se actualice dinámicamente.
- [ ] **Sincronización de Trading**:
    - Al ejecutarse un trade automático, el valor del portfolio debe reflejar el cambio sin recarga manual (Realtime check).
- [ ] **XAI Enrichment**: Integrar el estado de salud del usuario en el razonamiento de Thomas (ej: "Hoy tu energía es baja, recomiendo una estrategia más conservadora").

## Fase 3: Verificación Pro Max (Test Engineer)
- [ ] **E2E Multimódulo**: Test de Playwright que:
    1. Actualice datos de Salud.
    2. Verifique que la IA mencione esos datos en el chat.
    3. Cambie configuración de trading y verifique impacto en el panel.
- [ ] **Security Audit**: Verificar que el acceso a datos biométricos y claves de API sea seguro.

## Asignación de Agentes
- `project-planner`: Coordinación y seguimiento.
- `explorer-agent`: Mapeo de dependencias y detección de hardcoding.
- `backend-specialist`: Refactorización de Server Actions y lógica cruzada.
- `frontend-specialist`: Integración de datos en Dashboard y Chat.
- `test-engineer`: Validación final E2E.

---
**Status**: [PLANNING]
**File**: `docs/PLAN-system-sync.md`
