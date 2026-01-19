> **MANDATORIO: Siempre responde en ESPAÑOL**

# Authentication Patterns

> Choose auth pattern based on use case.

## Selection Guide

| Pattern | Best For |
|---------|----------|
| **JWT** | Stateless, microservices |
| **Session** | Traditional web, simple |
| **OAuth 2.0** | Third-party integration |
| **API Keys** | Server-to-server, public APIs |
| **Passkey** | Modern passwordless (2025+) |

## JWT Principles

```
Important:
â”œâ”€â”€ Always verify signature
â”œâ”€â”€ Check expiration
â”œâ”€â”€ Include minimal claims
â”œâ”€â”€ Use short expiry + refresh tokens
â””â”€â”€ Never store sensitive data in JWT
```

