> **MANDATORIO: Siempre responde en ESPAÑOL**

# Context Discovery

> Before suggesting any architecture, gather context.

## Question Hierarchy (Ask User FIRST)

1. **Scale**
   - How many users? (10, 1K, 100K, 1M+)
   - Data volume? (MB, GB, TB)
   - Transaction rate? (per second/minute)

2. **Team**
   - Solo developer or team?
   - Team size and expertise?
   - Distributed or co-located?

3. **Timeline**
   - MVP/Prototype or long-term product?
   - Time to market pressure?

4. **Domain**
   - CRUD-heavy or business logic complex?
   - Real-time requirements?
   - Compliance/regulations?

5. **Constraints**
   - Budget limitations?
   - Legacy systems to integrate?
   - Technology stack preferences?

## Project Classification Matrix

```
                    MVP              SaaS           Enterprise
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Scale        â”‚ <1K           â”‚ 1K-100K      â”‚ 100K+        â”‚
â”‚ Team         â”‚ Solo          â”‚ 2-10         â”‚ 10+          â”‚
â”‚ Timeline     â”‚ Fast (weeks)  â”‚ Medium (months)â”‚ Long (years)â”‚
â”‚ Architecture â”‚ Simple        â”‚ Modular      â”‚ Distributed  â”‚
â”‚ Patterns     â”‚ Minimal       â”‚ Selective    â”‚ Comprehensiveâ”‚
â”‚ Example      â”‚ Next.js API   â”‚ NestJS       â”‚ Microservicesâ”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

