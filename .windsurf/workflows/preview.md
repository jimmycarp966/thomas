---
name: preview
description: Previsualiza cambios en la aplicación. Inicia servidor de desarrollo y genera URL de preview.
---

# /preview - Preview Application

Use este workflow para previsualizar cambios en la aplicación.

## Proceso

### 1. Verificar Estado del Proyecto
- Verificar que el servidor no está corriendo
- Verificar que no hay errores de compilación
- Verificar que dependencies están instaladas

### 2. Iniciar Servidor de Desarrollo
- Identificar comando de start (npm run dev, etc.)
- Iniciar servidor en background
- Esperar que el servidor esté listo
- Obtener URL del servidor

### 3. Generar Preview
- Abrir URL en navegador
- Verificar que la app funciona correctamente
- Verificar que no hay errores en consola
- Verificar que las APIs funcionan

### 4. Presentar al Usuario
- Mostrar URL de preview
- Mostrar puerto del servidor
- Mostrar logs del servidor si hay errores

## Formato de Salida

```markdown
## 👁️ Preview

### Servidor Iniciado
- URL: http://localhost:3000
- Puerto: 3000
- Status: ✅ Running

### Verificación
[Resultados de las pruebas de verificación]

### Logs
[Logs relevantes del servidor si hay errores]

### Instrucciones
- Abre la URL en tu navegador
- Los cambios se reflejan automáticamente
- Presiona Ctrl+C para detener el servidor
```

## Ejemplos de Uso

```
/preview
/preview --port 3001
/preview --build
```

## Comandos de Preview

```bash
# Next.js
npm run dev

# React (Vite)
npm run dev

# React (Create React App)
npm start

# Otros
npm run preview
```

## Principios Clave

- **Servidor en background** - no bloquear terminal
- **Auto-reload** - cambios se reflejan automáticamente
- **Error handling** - mostrar errores claramente
- **Cleanup** - detener servidor cuando termine

## Checklist

Antes de iniciar preview:
- [ ] Dependencies instaladas
- [ ] No hay errores de compilación
- [ ] Puerto disponible
- [ ] Variables de entorno configuradas
