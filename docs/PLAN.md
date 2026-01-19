# PLAN.md: Actualización Bienestar General Pro Max

Este plan detalla la orquestación para actualizar el módulo de "Bienestar General" hacia una experiencia de alto rendimiento y precisión biológica.

## 🎯 Objetivos
1. **Visual Wow**: Transformar la UI básica en un dashboard premium de bio-rendimiento.
2. **Precisión Algorítmica**: Evolucionar el `wellness_score` para ser un indicador real de salud multidisciplinar.
3. **Integración Total**: Conectar los datos biométricos (antropometría) con las recomendaciones diarias.

## 👥 Agentes Involucrados
1. **Frontend Specialist**: Rediseño de la UI utilizando patrones de "Bio-Dashboard", gradientes y componentes interactivos avanzados.
2. **Backend Specialist**: Refactorización de Server Actions para integrar nuevas métricas y mejorar el cálculo del score.
3. **Test Engineer**: Validación del nuevo algoritmo de puntuación y flujos de datos.

## 🛠️ Cambios Propuestos

### Fase 1: Backend & Lógica (Backend Specialist)
- [ ] **Métricas de Actividad**: Añadir campos para minutos de ejercicio e intensidad (SEDENTARY, MODERATE, HIGH).
- [ ] **Score 2.0**: Modificar `calculateWellnessScore` para incluir:
    - **Waist-to-Hip Ratio**: Calculado automáticamente desde el Perfil Biométrico.
    - **Calidad de Sueño**: No solo horas, sino percepción de descanso.
    - **Factor de Actividad**: Impacto directo en el rendimiento metabólico.

### Fase 2: UI/UX Pro Max (Frontend Specialist)
- [ ] **Dashboard visual**: Reemplazar inputs básicos por selectores circulares o sliders customizados.
- [ ] **Indicador Circadiano**: Visualización del estado del bio-ritmo según la hora local y el ayuno.
- [ ] **Analytics Lite**: Pequeñas gráficas de tendencia para peso y score de bienestar.

### Fase 3: Validación (Test Engineer)
- [ ] **Unit Tests**: Pruebas sobre la función de cálculo de score con diversos escenarios de salud.
- [ ] **E2E Tests**: Verificar que el guardado de datos actualiza el estado global de Thomas inmediatamente.

---

## ✅ Onaylıyor musunuz? (Y/N)
- **Y**: Iniciamos la implementación con los agentes en paralelo.
- **N**: Ajusto el plan según tus comentarios.
