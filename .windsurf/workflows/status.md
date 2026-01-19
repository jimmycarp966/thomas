---
name: status
description: Comprueba el estado del proyecto, verifica dependencias, tests y readiness para deployment.
---

# /status - Project Status

Use este workflow para verificar el estado general del proyecto.

## Proceso

### 1. Verificar Estructura del Proyecto
- Verificar que la estructura de archivos es correcta
- Verificar que todos los directorios necesarios existen
- Verificar que archivos de configuración están presentes

### 2. Verificar Dependencies
- Verificar que package.json existe
- Verificar que dependencies están instaladas
- Verificar que no hay dependencias desactualizadas críticas
- Verificar que no hay vulnerabilidades de seguridad

### 3. Verificar Tests
- Verificar que tests existen
- Ejecutar tests y verificar que pasan
- Verificar coverage
- Identificar tests fallidos

### 4. Verificar Readiness para Deployment
- Verificar que build funciona
- Verificar que no hay errores de TypeScript
- Verificar que no hay console.error en código
- Verificar que variables de entorno están configuradas

## Formato de Salida

```markdown
## 📊 Project Status

### Estructura del Proyecto
✅ Directorios correctos
✅ Archivos de configuración presentes

### Dependencies
✅ package.json existe
✅ Dependencies instaladas
⚠️ X dependencias desactualizadas
❌ X vulnerabilidades encontradas

### Tests
✅ Tests existen
✅ X tests pasan
❌ X tests fallan
Coverage: XX%

### Build & TypeScript
✅ Build funciona
✅ Sin errores de TypeScript
⚠️ X warnings

### Deployment Readiness
✅ Listo para deployment
❌ No listo: [razón]

### Recomendaciones
- [Recomendación 1]
- [Recomendación 2]
```

## Ejemplos de Uso

```
/status
/status --detailed
/status --check-deps
```

## Comandos de Verificación

```bash
# Dependencies
npm list
npm outdated
npm audit

# Tests
npm test
npm run test:coverage

# Build
npm run build

# TypeScript
npx tsc --noEmit
```

## Principios Clave

- **Estado completo** - verificar todos los aspectos
- **Acción clara** - indicar qué hacer si hay problemas
- **Prioridades** - problemas críticos primero
- **Progreso** - mostrar qué está bien y qué no

## Checklist

Para verificar el estado:
- [ ] Estructura de archivos correcta
- [ ] Dependencies instaladas
- [ ] No hay vulnerabilidades críticas
- [ ] Tests pasan
- [ ] Build funciona
- [ ] Sin errores de TypeScript
- [ ] Variables de entorno configuradas
