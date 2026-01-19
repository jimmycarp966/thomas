> **MANDATORIO: Siempre responde en ESPAÑOL**

# API Style Selection (2025)

> REST vs GraphQL vs tRPC - Hangi durumda hangisi?

## Decision Tree

```
Who are the API consumers?
â”‚
â”œâ”€â”€ Public API / Multiple platforms
â”‚   â””â”€â”€ REST + OpenAPI (widest compatibility)
â”‚
â”œâ”€â”€ Complex data needs / Multiple frontends
â”‚   â””â”€â”€ GraphQL (flexible queries)
â”‚
â”œâ”€â”€ TypeScript frontend + backend (monorepo)
â”‚   â””â”€â”€ tRPC (end-to-end type safety)
â”‚
â”œâ”€â”€ Real-time / Event-driven
â”‚   â””â”€â”€ WebSocket + AsyncAPI
â”‚
â””â”€â”€ Internal microservices
    â””â”€â”€ gRPC (performance) or REST (simplicity)
```

## Comparison

| Factor | REST | GraphQL | tRPC |
|--------|------|---------|------|
| **Best for** | Public APIs | Complex apps | TS monorepos |
| **Learning curve** | Low | Medium | Low (if TS) |
| **Over/under fetching** | Common | Solved | Solved |
| **Type safety** | Manual (OpenAPI) | Schema-based | Automatic |
| **Caching** | HTTP native | Complex | Client-based |

## Selection Questions

1. Who are the API consumers?
2. Is the frontend TypeScript?
3. How complex are the data relationships?
4. Is caching critical?
5. Public or internal API?

