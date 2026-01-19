> **MANDATORIO: Siempre responde en ESPAÑOL**

# Schema Design Principles

> Normalization, primary keys, timestamps, relationships.

## Normalization Decision

```
When to normalize (separate tables):
â”œâ”€â”€ Data is repeated across rows
â”œâ”€â”€ Updates would need multiple changes
â”œâ”€â”€ Relationships are clear
â””â”€â”€ Query patterns benefit

When to denormalize (embed/duplicate):
â”œâ”€â”€ Read performance critical
â”œâ”€â”€ Data rarely changes
â”œâ”€â”€ Always fetched together
â””â”€â”€ Simpler queries needed
```

## Primary Key Selection

| Type | Use When |
|------|----------|
| **UUID** | Distributed systems, security |
| **ULID** | UUID + sortable by time |
| **Auto-increment** | Simple apps, single database |
| **Natural key** | Rarely (business meaning) |

## Timestamp Strategy

```
For every table:
â”œâ”€â”€ created_at â†’ When created
â”œâ”€â”€ updated_at â†’ Last modified
â””â”€â”€ deleted_at â†’ Soft delete (if needed)

Use TIMESTAMPTZ (with timezone) not TIMESTAMP
```

## Relationship Types

| Type | When | Implementation |
|------|------|----------------|
| **One-to-One** | Extension data | Separate table with FK |
| **One-to-Many** | Parent-children | FK on child table |
| **Many-to-Many** | Both sides have many | Junction table |

## Foreign Key ON DELETE

```
â”œâ”€â”€ CASCADE â†’ Delete children with parent
â”œâ”€â”€ SET NULL â†’ Children become orphans
â”œâ”€â”€ RESTRICT â†’ Prevent delete if children exist
â””â”€â”€ SET DEFAULT â†’ Children get default value
```

