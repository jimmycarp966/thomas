> **MANDATORIO: Siempre responde en ESPAÑOL**

---
name: express-api
description: Express.js REST API template principles. TypeScript, Prisma, JWT.
---

# Express.js API Template

## Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js 20+ |
| Framework | Express.js |
| Language | TypeScript |
| Database | PostgreSQL + Prisma |
| Validation | Zod |
| Auth | JWT + bcrypt |

---

## Directory Structure

```
project-name/
â”œâ”€â”€ prisma/
â”‚   â””â”€â”€ schema.prisma
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ app.ts           # Express setup
â”‚   â”œâ”€â”€ config/          # Environment
â”‚   â”œâ”€â”€ routes/          # Route handlers
â”‚   â”œâ”€â”€ controllers/     # Business logic
â”‚   â”œâ”€â”€ services/        # Data access
â”‚   â”œâ”€â”€ middleware/
â”‚   â”‚   â”œâ”€â”€ auth.ts      # JWT verify
â”‚   â”‚   â”œâ”€â”€ error.ts     # Error handler
â”‚   â”‚   â””â”€â”€ validate.ts  # Zod validation
â”‚   â”œâ”€â”€ schemas/         # Zod schemas
â”‚   â””â”€â”€ utils/
â””â”€â”€ package.json
```

---

## Middleware Stack

| Order | Middleware |
|-------|------------|
| 1 | helmet (security) |
| 2 | cors |
| 3 | morgan (logging) |
| 4 | body parsing |
| 5 | routes |
| 6 | error handler |

---

## API Response Format

| Type | Structure |
|------|-----------|
| Success | `{ success: true, data: {...} }` |
| Error | `{ error: "message", details: [...] }` |

---

## Setup Steps

1. Create project directory
2. `npm init -y`
3. Install deps: `npm install express prisma zod bcrypt jsonwebtoken`
4. Configure Prisma
5. `npm run db:push`
6. `npm run dev`

---

## Best Practices

- Layer architecture (routes â†’ controllers â†’ services)
- Validate all inputs with Zod
- Centralized error handling
- Environment-based config
- Use Prisma for type-safe DB access

