---
name: test
description: Ejecuta tests del proyecto, verifica coverage y genera reportes de pruebas.
---

# /test - Run Tests

Use este workflow para ejecutar tests del proyecto y verificar coverage.

## Proceso

### 1. Verificar Configuración de Tests
- Verificar que tests están configurados
- Verificar framework de testing (Jest, Vitest, Playwright)
- Verificar archivos de configuración

### 2. Ejecutar Tests
- Ejecutar unit tests
- Ejecutar integration tests
- Ejecutar E2E tests si existen
- Verificar que todos pasan

### 3. Verificar Coverage
- Generar reporte de coverage
- Verificar que coverage > 80%
- Identificar áreas sin coverage

### 4. Reporte de Resultados
- Mostrar resultados de tests
- Mostrar coverage por módulo
- Identificar tests fallidos
- Sugerir mejoras si coverage es bajo

## Formato de Salida

```markdown
## 🧪 Test Results

### Unit Tests
✅ Passed: X
❌ Failed: X
⏭️ Skipped: X

### Integration Tests
✅ Passed: X
❌ Failed: X
⏭️ Skipped: X

### E2E Tests
✅ Passed: X
❌ Failed: X
⏭️ Skipped: X

### Coverage
- Overall: XX%
- app/: XX%
- actions/: XX%
- lib/: XX%

### Tests Fallidos
[Detalle de tests fallidos con stack traces]

### Recomendaciones
[Mejoras sugeridas si coverage es bajo]
```

## Ejemplos de Uso

```
/test
/test --unit
/test --e2e
/test --coverage
```

## Comandos de Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage

# Watch mode
npm test -- --watch
```

## Principios Clave

- **Coverage > 80%** - objetivo mínimo
- **Tests obligatorios** - para todo código nuevo
- **AAA Pattern** - Arrange, Act, Assert
- **Tests de regresión** - para bug fixes

## Checklist

Antes de ejecutar tests:
- [ ] Dependencies instaladas
- [ ] Configuración de tests correcta
- [ ] Base de datos de testing configurada
- [ ] Variables de entorno de testing configuradas
