> **MANDATORIO: Siempre responde en ESPAÑOL**

# Database Selection (2025)

> Choose database based on context, not default.

## Decision Tree

```
What are your requirements?
â”‚
â”œâ”€â”€ Full relational features needed
â”‚   â”œâ”€â”€ Self-hosted â†’ PostgreSQL
â”‚   â””â”€â”€ Serverless â†’ Neon, Supabase
â”‚
â”œâ”€â”€ Edge deployment / Ultra-low latency
â”‚   â””â”€â”€ Turso (edge SQLite)
â”‚
â”œâ”€â”€ AI / Vector search
â”‚   â””â”€â”€ PostgreSQL + pgvector
â”‚
â”œâ”€â”€ Simple / Embedded / Local
â”‚   â””â”€â”€ SQLite
â”‚
â””â”€â”€ Global distribution
    â””â”€â”€ PlanetScale, CockroachDB, Turso
```

## Comparison

| Database | Best For | Trade-offs |
|----------|----------|------------|
| **PostgreSQL** | Full features, complex queries | Needs hosting |
| **Neon** | Serverless PG, branching | PG complexity |
| **Turso** | Edge, low latency | SQLite limitations |
| **SQLite** | Simple, embedded, local | Single-writer |
| **PlanetScale** | MySQL, global scale | No foreign keys |

## Questions to Ask

1. What's the deployment environment?
2. How complex are the queries?
3. Is edge/serverless important?
4. Vector search needed?
5. Global distribution required?

