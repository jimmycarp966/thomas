> **MANDATORIO: Siempre responde en ESPAÑOL**

# Versioning Strategies

> Plan for API evolution from day one.

## Decision Factors

| Strategy | Implementation | Trade-offs |
|----------|---------------|------------|
| **URI** | /v1/users | Clear, easy caching |
| **Header** | Accept-Version: 1 | Cleaner URLs, harder discovery |
| **Query** | ?version=1 | Easy to add, messy |
| **None** | Evolve carefully | Best for internal, risky for public |

## Versioning Philosophy

```
Consider:
â”œâ”€â”€ Public API? â†’ Version in URI
â”œâ”€â”€ Internal only? â†’ May not need versioning
â”œâ”€â”€ GraphQL? â†’ Typically no versions (evolve schema)
â”œâ”€â”€ tRPC? â†’ Types enforce compatibility
```

