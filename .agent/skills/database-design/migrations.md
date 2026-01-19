> **MANDATORIO: Siempre responde en ESPAÑOL**

# Migration Principles

> Safe migration strategy for zero-downtime changes.

## Safe Migration Strategy

```
For zero-downtime changes:
â”‚
â”œâ”€â”€ Adding column
â”‚   â””â”€â”€ Add as nullable â†’ backfill â†’ add NOT NULL
â”‚
â”œâ”€â”€ Removing column
â”‚   â””â”€â”€ Stop using â†’ deploy â†’ remove column
â”‚
â”œâ”€â”€ Adding index
â”‚   â””â”€â”€ CREATE INDEX CONCURRENTLY (non-blocking)
â”‚
â””â”€â”€ Renaming column
    â””â”€â”€ Add new â†’ migrate data â†’ deploy â†’ drop old
```

## Migration Philosophy

- Never make breaking changes in one step
- Test migrations on data copy first
- Have rollback plan
- Run in transaction when possible

## Serverless Databases

### Neon (Serverless PostgreSQL)

| Feature | Benefit |
|---------|---------|
| Scale to zero | Cost savings |
| Instant branching | Dev/preview |
| Full PostgreSQL | Compatibility |
| Autoscaling | Traffic handling |

### Turso (Edge SQLite)

| Feature | Benefit |
|---------|---------|
| Edge locations | Ultra-low latency |
| SQLite compatible | Simple |
| Generous free tier | Cost |
| Global distribution | Performance |

