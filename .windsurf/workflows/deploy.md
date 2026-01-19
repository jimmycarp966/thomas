---
name: deploy
description: Despliegue de aplicaciones web a Netlify u otros proveedores. Maneja configuración, build y deployment.
---

# /deploy - Deploy Application

Use este workflow para desplegar aplicaciones web a Netlify u otros proveedores.

## Proceso

### 1. Verificar Pre-requisitos
- [ ] El proyecto está listo para producción
- [ ] Variables de entorno configuradas
- [ ] Tests pasan
- [ ] Build funciona localmente

### 2. Configurar Deployment
- Leer configuración de deployment
- Verificar framework (Next.js, React, etc.)
- Configurar build settings
- Configurar variables de entorno

### 3. Ejecutar Deployment
- Ejecutar comando de build
- Verificar que no hay errores
- Deploy a proveedor (Netlify, Vercel, etc.)
- Obtener URL de deployment

### 4. Verificar Deployment
- Abrir URL en navegador
- Verificar que funciona correctamente
- Verificar que no hay errores en consola
- Verificar que las APIs funcionan

## Formato de Salida

```markdown
## 🚀 Deployment: [Nombre del Proyecto]

### Configuración
- Framework: [Next.js/React/etc]
- Build Command: [comando]
- Output Directory: [directorio]

### Proceso
[Detalles del proceso de build y deployment]

### Resultado
✅ Deployment exitoso
URL: [URL del deployment]

### Verificación
[Resultados de las pruebas de verificación]
```

## Ejemplos de Uso

```
/deploy
/deploy --provider netlify
/deploy --provider vercel
/deploy --preview
```

## Proveedores Soportados

- Netlify
- Vercel
- Cloudflare Pages
- AWS Amplify

## Checklist

Antes de deploy:
- [ ] Tests pasan
- [ ] Build funciona localmente
- [ ] Variables de entorno configuradas
- [ ] No hay console.error en código
- [ ] Performance es aceptable
- [ ] Security review completada
