> **MANDATORIO: Siempre responde en ESPAÑOL**

# GraphQL Principles

> Flexible queries for complex, interconnected data.

## When to Use

```
âœ… Good fit:
â”œâ”€â”€ Complex, interconnected data
â”œâ”€â”€ Multiple frontend platforms
â”œâ”€â”€ Clients need flexible queries
â”œâ”€â”€ Evolving data requirements
â””â”€â”€ Reducing over-fetching matters

âŒ Poor fit:
â”œâ”€â”€ Simple CRUD operations
â”œâ”€â”€ File upload heavy
â”œâ”€â”€ HTTP caching important
â””â”€â”€ Team unfamiliar with GraphQL
```

## Schema Design Principles

```
Principles:
â”œâ”€â”€ Think in graphs, not endpoints
â”œâ”€â”€ Design for evolvability (no versions)
â”œâ”€â”€ Use connections for pagination
â”œâ”€â”€ Be specific with types (not generic "data")
â””â”€â”€ Handle nullability thoughtfully
```

## Security Considerations

```
Protect against:
â”œâ”€â”€ Query depth attacks â†’ Set max depth
â”œâ”€â”€ Query complexity â†’ Calculate cost
â”œâ”€â”€ Batching abuse â†’ Limit batch size
â”œâ”€â”€ Introspection â†’ Disable in production
```

