> **MANDATORIO: Siempre responde en ESPAÑOL**

# Query Optimization

> N+1 problem, EXPLAIN ANALYZE, optimization priorities.

## N+1 Problem

```
What is N+1?
â”œâ”€â”€ 1 query to get parent records
â”œâ”€â”€ N queries to get related records
â””â”€â”€ Very slow!

Solutions:
â”œâ”€â”€ JOIN â†’ Single query with all data
â”œâ”€â”€ Eager loading â†’ ORM handles JOIN
â”œâ”€â”€ DataLoader â†’ Batch and cache (GraphQL)
â””â”€â”€ Subquery â†’ Fetch related in one query
```

## Query Analysis Mindset

```
Before optimizing:
â”œâ”€â”€ EXPLAIN ANALYZE the query
â”œâ”€â”€ Look for Seq Scan (full table scan)
â”œâ”€â”€ Check actual vs estimated rows
â””â”€â”€ Identify missing indexes
```

## Optimization Priorities

1. **Add missing indexes** (most common issue)
2. **Select only needed columns** (not SELECT *)
3. **Use proper JOINs** (avoid subqueries when possible)
4. **Limit early** (pagination at database level)
5. **Cache** (when appropriate)

