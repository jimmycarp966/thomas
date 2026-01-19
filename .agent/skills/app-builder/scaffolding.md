> **MANDATORIO: Siempre responde en ESPAÑOL**

# Project Scaffolding

> Directory structure and core files for new projects.

---

## Next.js Full-Stack Structure (2025 Optimized)

```
project-name/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ app/                        # Routes only (thin layer)
â”‚   â”‚   â”œâ”€â”€ layout.tsx
â”‚   â”‚   â”œâ”€â”€ page.tsx
â”‚   â”‚   â”œâ”€â”€ globals.css
â”‚   â”‚   â”œâ”€â”€ (auth)/                 # Route group - auth pages
â”‚   â”‚   â”‚   â”œâ”€â”€ login/page.tsx
â”‚   â”‚   â”‚   â””â”€â”€ register/page.tsx
â”‚   â”‚   â”œâ”€â”€ (dashboard)/            # Route group - dashboard layout
â”‚   â”‚   â”‚   â”œâ”€â”€ layout.tsx
â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â””â”€â”€ api/
â”‚   â”‚       â””â”€â”€ [resource]/route.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ features/                   # Feature-based modules
â”‚   â”‚   â”œâ”€â”€ auth/
â”‚   â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â”œâ”€â”€ hooks/
â”‚   â”‚   â”‚   â”œâ”€â”€ actions.ts          # Server Actions
â”‚   â”‚   â”‚   â”œâ”€â”€ queries.ts          # Data fetching
â”‚   â”‚   â”‚   â””â”€â”€ types.ts
â”‚   â”‚   â”œâ”€â”€ products/
â”‚   â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â”œâ”€â”€ actions.ts
â”‚   â”‚   â”‚   â””â”€â”€ queries.ts
â”‚   â”‚   â””â”€â”€ cart/
â”‚   â”‚       â””â”€â”€ ...
â”‚   â”‚
â”‚   â”œâ”€â”€ shared/                     # Shared utilities
â”‚   â”‚   â”œâ”€â”€ components/ui/          # Reusable UI components
â”‚   â”‚   â”œâ”€â”€ lib/                    # Utils, helpers
â”‚   â”‚   â””â”€â”€ hooks/                  # Global hooks
â”‚   â”‚
â”‚   â””â”€â”€ server/                     # Server-only code
â”‚       â”œâ”€â”€ db/                     # Database client (Prisma)
â”‚       â”œâ”€â”€ auth/                   # Auth config
â”‚       â””â”€â”€ services/               # External API integrations
â”‚
â”œâ”€â”€ prisma/
â”‚   â”œâ”€â”€ schema.prisma
â”‚   â”œâ”€â”€ migrations/
â”‚   â””â”€â”€ seed.ts
â”‚
â”œâ”€â”€ public/
â”œâ”€â”€ .env.example
â”œâ”€â”€ .env.local
â”œâ”€â”€ package.json
â”œâ”€â”€ tailwind.config.ts
â”œâ”€â”€ tsconfig.json
â””â”€â”€ README.md
```

---

## Structure Principles

| Principle | Implementation |
|-----------|----------------|
| **Feature isolation** | Each feature in `features/` with its own components, hooks, actions |
| **Server/Client separation** | Server-only code in `server/`, prevents accidental client imports |
| **Thin routes** | `app/` only for routing, logic lives in `features/` |
| **Route groups** | `(groupName)/` for layout sharing without URL impact |
| **Shared code** | `shared/` for truly reusable UI and utilities |

---

## Core Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies |
| `tsconfig.json` | TypeScript + path aliases (`@/features/*`) |
| `tailwind.config.ts` | Tailwind config |
| `.env.example` | Environment template |
| `README.md` | Project documentation |
| `.gitignore` | Git ignore rules |
| `prisma/schema.prisma` | Database schema |

---

## Path Aliases (tsconfig.json)

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/features/*": ["./src/features/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/server/*": ["./src/server/*"]
    }
  }
}
```

---

## When to Use What

| Need | Location |
|------|----------|
| New page/route | `app/(group)/page.tsx` |
| Feature component | `features/[name]/components/` |
| Server action | `features/[name]/actions.ts` |
| Data fetching | `features/[name]/queries.ts` |
| Reusable button/input | `shared/components/ui/` |
| Database query | `server/db/` |
| External API call | `server/services/` |

