> **MANDATORIO: Siempre responde en ESPAÑOL**

# Rate Limiting Principles

> Protect your API from abuse and overload.

## Why Rate Limit

```
Protect against:
â”œâ”€â”€ Brute force attacks
â”œâ”€â”€ Resource exhaustion
â”œâ”€â”€ Cost overruns (if pay-per-use)
â””â”€â”€ Unfair usage
```

## Strategy Selection

| Type | How | When |
|------|-----|------|
| **Token bucket** | Burst allowed, refills over time | Most APIs |
| **Sliding window** | Smooth distribution | Strict limits |
| **Fixed window** | Simple counters per window | Basic needs |

## Response Headers

```
Include in headers:
â”œâ”€â”€ X-RateLimit-Limit (max requests)
â”œâ”€â”€ X-RateLimit-Remaining (requests left)
â”œâ”€â”€ X-RateLimit-Reset (when limit resets)
â””â”€â”€ Return 429 when exceeded
```

