> **MANDATORIO: Siempre responde en ESPAÑOL**

---
name: nuxt-app
description: Nuxt 3 full-stack template. Vue 3, Pinia, Tailwind, Prisma.
---

# Nuxt 3 Full-Stack Template

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Nuxt 3 |
| Language | TypeScript |
| UI | Vue 3 (Composition API) |
| State | Pinia |
| Database | PostgreSQL + Prisma |
| Styling | Tailwind CSS |
| Validation | Zod |

---

## Directory Structure

```
project-name/
â”œâ”€â”€ prisma/
â”‚   â””â”€â”€ schema.prisma
â”œâ”€â”€ server/
â”‚   â”œâ”€â”€ api/
â”‚   â”‚   â””â”€â”€ [resource]/
â”‚   â”‚       â””â”€â”€ index.ts
â”‚   â””â”€â”€ utils/
â”‚       â””â”€â”€ db.ts         # Prisma client
â”œâ”€â”€ composables/
â”‚   â””â”€â”€ useAuth.ts
â”œâ”€â”€ stores/
â”‚   â””â”€â”€ user.ts           # Pinia store
â”œâ”€â”€ components/
â”‚   â””â”€â”€ ui/
â”œâ”€â”€ pages/
â”‚   â”œâ”€â”€ index.vue
â”‚   â””â”€â”€ [...slug].vue
â”œâ”€â”€ layouts/
â”‚   â””â”€â”€ default.vue
â”œâ”€â”€ assets/
â”‚   â””â”€â”€ css/
â”‚       â””â”€â”€ main.css
â”œâ”€â”€ .env.example
â”œâ”€â”€ nuxt.config.ts
â””â”€â”€ package.json
```

---

## Key Concepts

| Concept | Description |
|---------|-------------|
| Auto-imports | Components, composables, utils |
| File-based routing | pages/ â†’ routes |
| Server Routes | server/api/ â†’ API endpoints |
| Composables | Reusable reactive logic |
| Pinia | State management |

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| DATABASE_URL | Prisma connection |
| NUXT_PUBLIC_APP_URL | Public URL |

---

## Setup Steps

1. `npx nuxi@latest init {{name}}`
2. `cd {{name}}`
3. `npm install @pinia/nuxt @prisma/client prisma zod`
4. `npm install -D @nuxtjs/tailwindcss`
5. Add modules to `nuxt.config.ts`:
   ```ts
   modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss']
   ```
6. `npx prisma init`
7. Configure schema
8. `npx prisma db push`
9. `npm run dev`

---

## Best Practices

- Use `<script setup>` for components
- Composables for reusable logic
- Pinia stores in `stores/` folder
- Server routes for API logic
- Auto-import for clean code
- TypeScript for type safety
- See `@[skills/vue-expert]` for Vue patterns

