> **MANDATORIO: Siempre responde en ESPAÑOL**

# Pattern Selection Guidelines

> Decision trees for choosing architectural patterns.

## Main Decision Tree

```
START: What's your MAIN concern?

â”Œâ”€ Data Access Complexity?
â”‚  â”œâ”€ HIGH (complex queries, testing needed)
â”‚  â”‚  â†’ Repository Pattern + Unit of Work
â”‚  â”‚  VALIDATE: Will data source change frequently?
â”‚  â”‚     â”œâ”€ YES â†’ Repository worth the indirection
â”‚  â”‚     â””â”€ NO  â†’ Consider simpler ORM direct access
â”‚  â””â”€ LOW (simple CRUD, single database)
â”‚     â†’ ORM directly (Prisma, Drizzle)
â”‚     Simpler = Better, Faster
â”‚
â”œâ”€ Business Rules Complexity?
â”‚  â”œâ”€ HIGH (domain logic, rules vary by context)
â”‚  â”‚  â†’ Domain-Driven Design
â”‚  â”‚  VALIDATE: Do you have domain experts on team?
â”‚  â”‚     â”œâ”€ YES â†’ Full DDD (Aggregates, Value Objects)
â”‚  â”‚     â””â”€ NO  â†’ Partial DDD (rich entities, clear boundaries)
â”‚  â””â”€ LOW (mostly CRUD, simple validation)
â”‚     â†’ Transaction Script pattern
â”‚     Simpler = Better, Faster
â”‚
â”œâ”€ Independent Scaling Needed?
â”‚  â”œâ”€ YES (different components scale differently)
â”‚  â”‚  â†’ Microservices WORTH the complexity
â”‚  â”‚  REQUIREMENTS (ALL must be true):
â”‚  â”‚    - Clear domain boundaries
â”‚  â”‚    - Team > 10 developers
â”‚  â”‚    - Different scaling needs per service
â”‚  â”‚  IF NOT ALL MET â†’ Modular Monolith instead
â”‚  â””â”€ NO (everything scales together)
â”‚     â†’ Modular Monolith
â”‚     Can extract services later when proven needed
â”‚
â””â”€ Real-time Requirements?
   â”œâ”€ HIGH (immediate updates, multi-user sync)
   â”‚  â†’ Event-Driven Architecture
   â”‚  â†’ Message Queue (RabbitMQ, Redis, Kafka)
   â”‚  VALIDATE: Can you handle eventual consistency?
   â”‚     â”œâ”€ YES â†’ Event-driven valid
   â”‚     â””â”€ NO  â†’ Synchronous with polling
   â””â”€ LOW (eventual consistency acceptable)
      â†’ Synchronous (REST/GraphQL)
      Simpler = Better, Faster
```

## The 3 Questions (Before ANY Pattern)

1. **Problem Solved**: What SPECIFIC problem does this pattern solve?
2. **Simpler Alternative**: Is there a simpler solution?
3. **Deferred Complexity**: Can we add this LATER when needed?

## Red Flags (Anti-patterns)

| Pattern | Anti-pattern | Simpler Alternative |
|---------|-------------|-------------------|
| Microservices | Premature splitting | Start monolith, extract later |
| Clean/Hexagonal | Over-abstraction | Concrete first, interfaces later |
| Event Sourcing | Over-engineering | Append-only audit log |
| CQRS | Unnecessary complexity | Single model |
| Repository | YAGNI for simple CRUD | ORM direct access |

