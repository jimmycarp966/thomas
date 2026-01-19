> **MANDATORIO: Siempre responde en ESPAÑOL**

# Indexing Principles

> When and how to create indexes effectively.

## When to Create Indexes

```
Index these:
â”œâ”€â”€ Columns in WHERE clauses
â”œâ”€â”€ Columns in JOIN conditions
â”œâ”€â”€ Columns in ORDER BY
â”œâ”€â”€ Foreign key columns
â””â”€â”€ Unique constraints

Don't over-index:
â”œâ”€â”€ Write-heavy tables (slower inserts)
â”œâ”€â”€ Low-cardinality columns
â”œâ”€â”€ Columns rarely queried
```

## Index Type Selection

| Type | Use For |
|------|---------|
| **B-tree** | General purpose, equality & range |
| **Hash** | Equality only, faster |
| **GIN** | JSONB, arrays, full-text |
| **GiST** | Geometric, range types |
| **HNSW/IVFFlat** | Vector similarity (pgvector) |

## Composite Index Principles

```
Order matters for composite indexes:
â”œâ”€â”€ Equality columns first
â”œâ”€â”€ Range columns last
â”œâ”€â”€ Most selective first
â””â”€â”€ Match query pattern
```

