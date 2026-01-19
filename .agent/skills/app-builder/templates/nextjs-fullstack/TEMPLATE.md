> **MANDATORIO: Siempre responde en ESPAÑOL**

---
name: nextjs-fullstack
description: Next.js full-stack template principles. App Router, Prisma, Tailwind.
---

# Next.js Full-Stack Template

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL + Prisma |
| Styling | Tailwind CSS |
| Auth | Clerk (optional) |
| Validation | Zod |

---

## Directory Structure

```
project-name/
â”œâ”€â”€ prisma/
â”‚   â””â”€â”€ schema.prisma
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ app/
â”‚   â”‚   â”œâ”€â”€ layout.tsx
â”‚   â”‚   â”œâ”€â”€ page.tsx
â”‚   â”‚   â”œâ”€â”€ globals.css
â”‚   â”‚   â””â”€â”€ api/
â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â””â”€â”€ ui/
â”‚   â”œâ”€â”€ lib/
â”‚   â”‚   â”œâ”€â”€ db.ts        # Prisma client
â”‚   â”‚   â””â”€â”€ utils.ts
â”‚   â””â”€â”€ types/
â”œâ”€â”€ .env.example
â””â”€â”€ package.json
```

---

## Key Concepts

| Concept | Description |
|---------|-------------|
| Server Components | Default, fetch data |
| Server Actions | Form mutations |
| Route Handlers | API endpoints |
| Prisma | Type-safe ORM |

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| DATABASE_URL | Prisma connection |
| NEXT_PUBLIC_APP_URL | Public URL |

---

## Setup Steps

1. `npx create-next-app {{name}} --typescript --tailwind --app`
2. `npm install prisma @prisma/client zod`
3. `npx prisma init`
4. Configure schema
5. `npm run db:push`
6. `npm run dev`

---

## Best Practices

- Server Components by default
- Server Actions for mutations
- Prisma for type-safe DB
- Zod for validation
- Edge runtime where possible

