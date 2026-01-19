> **MANDATORIO: Siempre responde en ESPAÑOL**

# AGENTS.md - Frontend (app/)

Este archivo define las reglas específicas para trabajar en el directorio `app/` (Next.js App Router).

---

## 🎯 Contexto

El directorio `app/` contiene toda la aplicación Next.js 15 usando App Router con React 19.

---

## 📁 Estructura

```
app/
├── (auth)/              # Rutas autenticadas
│   ├── dashboard/       # Dashboard principal
│   ├── trading/         # Trading y análisis
│   ├── chat/            # Chat con IA
│   ├── wellness/        # Salud y rendimiento
│   └── settings/        # Configuración
├── (public)/            # Rutas públicas
│   ├── login/           # Login
│   └── register/        # Registro
├── layout.tsx           # Layout raíz
└── page.tsx             # Home page
```

---

## 🛠️ Reglas Específicas

### Next.js App Router
- Usar **Server Components** por defecto
- Solo usar **Client Components** (`'use client'`) cuando sea necesario (interactividad)
- Usar **Server Actions** para mutaciones (no API routes)
- Usar **Route Handlers** solo para APIs externas

### React 19
- Aprovechar nuevas features de React 19
- Usar `use()` para async/await en componentes
- Usar `<Suspense>` para loading states
- Usar `<ErrorBoundary>` para error handling

### Tailwind CSS + shadcn/ui
- Usar componentes de `@/components/ui/` siempre que sea posible
- Personalizar con clases de Tailwind según sea necesario
- **PROHIBIDO**: colores violeta/púrpura
- **REQUERIDO**: modo oscuro por defecto

### TypeScript
- TypeScript estricto (sin `any`)
- Tipos bien definidos para props
- Usar Zod para validación de forms

---

## 🎨 Diseño

### UI/UX Guidelines
- Diseño único y distintivo (no templates genéricos)
- Responsive design (mobile-first)
- Dark mode por defecto
- Animaciones sutiles y performantes

### Component Patterns
- Componentes funcionales con hooks
- Props bien tipadas
- Separation of concerns (logic vs presentation)
- Reusabilidad cuando sea apropiado

---

## 🔄 Flujo de Trabajo

### Para Crear Nueva Página
1. Crear directorio en `app/` o `(auth)/`
2. Crear `page.tsx` (Server Component por defecto)
3. Crear componentes en `components/` si es necesario
4. Crear Server Actions en `actions/` para mutaciones
5. Agregar tests en `tests/` o `__tests__/`
6. Verificar responsive design

### Para Modificar Página Existente
1. Leer código existente
2. Identificar Server vs Client components
3. Mantener consistencia con patrones existentes
4. Agregar tests si hay cambios de lógica
5. Verificar que no rompe nada más

---

## 🚫 Prohibiciones

- ❌ NO crear API routes en `app/api/` (usar Server Actions en `actions/`)
- ❌ NO usar `useEffect` para data fetching (usar Server Components)
- ❌ NO usar colores violeta/púrpura
- ❌ NO usar templates genéricos
- ❌ NO ignorar errores de TypeScript
- ❌ NO hacer commits sin tests

---

## ✅ Requisitos Obligatorios

- [ ] TypeScript estricto
- [ ] Tests para componentes con lógica
- [ ] Responsive design
- [ ] Dark mode
- [ ] Performance checks (Core Web Vitals)
- [ ] Accessibility (WCAG AA)

---

## 📖 Referencias

- Next.js App Router: https://nextjs.org/docs/app
- React 19: https://react.dev/blog/2024/12/05/react-19
- Tailwind CSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com
