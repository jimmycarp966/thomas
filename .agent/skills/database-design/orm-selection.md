> **MANDATORIO: Siempre responde en ESPAÑOL**

# ORM Selection (2025)

> Choose ORM based on deployment and DX needs.

## Decision Tree

```
What's the context?
â”‚
â”œâ”€â”€ Edge deployment / Bundle size matters
â”‚   â””â”€â”€ Drizzle (smallest, SQL-like)
â”‚
â”œâ”€â”€ Best DX / Schema-first
â”‚   â””â”€â”€ Prisma (migrations, studio)
â”‚
â”œâ”€â”€ Maximum control
â”‚   â””â”€â”€ Raw SQL with query builder
â”‚
â””â”€â”€ Python ecosystem
    â””â”€â”€ SQLAlchemy 2.0 (async support)
```

## Comparison

| ORM | Best For | Trade-offs |
|-----|----------|------------|
| **Drizzle** | Edge, TypeScript | Newer, less examples |
| **Prisma** | DX, schema management | Heavier, not edge-ready |
| **Kysely** | Type-safe SQL builder | Manual migrations |
| **Raw SQL** | Complex queries, control | Manual type safety |

