> **MANDATORIO: Siempre responde en ESPAÑOL**

# Response Format Principles

> Consistency is key - choose a format and stick to it.

## Common Patterns

```
Choose one:
â”œâ”€â”€ Envelope pattern ({ success, data, error })
â”œâ”€â”€ Direct data (just return the resource)
â””â”€â”€ HAL/JSON:API (hypermedia)
```

## Error Response

```
Include:
â”œâ”€â”€ Error code (for programmatic handling)
â”œâ”€â”€ User message (for display)
â”œâ”€â”€ Details (for debugging, field-level errors)
â”œâ”€â”€ Request ID (for support)
â””â”€â”€ NOT internal details (security!)
```

## Pagination Types

| Type | Best For | Trade-offs |
|------|----------|------------|
| **Offset** | Simple, jumpable | Performance on large datasets |
| **Cursor** | Large datasets | Can't jump to page |
| **Keyset** | Performance critical | Requires sortable key |

### Selection Questions

1. How large is the dataset?
2. Do users need to jump to specific pages?
3. Is data frequently changing?

