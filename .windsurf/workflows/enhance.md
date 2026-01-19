---
name: enhance
description: Mejorar código existente. Aplica best practices, optimiza performance y mejora la arquitectura.
---

# /enhance - Enhance Code

Use este workflow para mejorar código existente.

## Proceso

### 1. Análisis del Código
- Leer el código existente
- Identificar áreas de mejora
- Verificar que sigue las reglas del proyecto

### 2. Identificar Mejoras
- Aplicar clean code principles
- Optimizar performance
- Mejorar arquitectura
- Agregar tests si faltan

### 3. Implementar Mejoras
- Hacer cambios mínimos y enfocados
- Mantener backward compatibility
- Agregar tests para cambios de lógica
- Actualizar documentación

### 4. Verificar
- Ejecutar tests existentes
- Verificar que no rompe nada
- Verificar performance
- Verificar type safety

## Formato de Salida

```markdown
## ✨ Enhancement: [Descripción]

### Análisis
[Análisis del código existente]

### Mejoras Identificadas
1. [Mejora 1]
2. [Mejora 2]
3. [Mejora 3]

### Cambios Realizados
[Descripción de los cambios]

### Verificación
[Resultados de las pruebas]
```

## Ejemplos de Uso

```
/enhance optimize performance de dashboard
/enhance refactor authentication module
/enhance add type safety to trading module
/enhance improve error handling
```

## Principios Clave

- **Cambios mínimos** - solución más pequeña posible
- **Backward compatible** - no romper APIs existentes
- **Tests obligatorios** - para cambios de lógica
- **Documentación actualizada** - explicar por qué se cambió

## Checklist

Antes de hacer mejoras:
- [ ] Entender el código existente
- [ ] Identificar áreas de mejora específicas
- [ ] Verificar que no rompe dependencias
- [ ] Agregar tests si hay cambios de lógica
- [ ] Actualizar documentación
