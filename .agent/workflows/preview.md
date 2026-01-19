> **MANDATORIO: Siempre responde en ESPAÑOL**

---
description: Gestión del servidor de previsualización (inicio, parada y comprobación de estado). Manejo del servidor de desarrollo local.
---

# /preview - Preview Management

$ARGUMENTS

---

## Task

Manage preview server: start, stop, status check.

### Commands

```
/preview           - Show current status
/preview start     - Start server
/preview stop      - Stop server
/preview restart   - Restart
/preview check     - Health check
```

---

## Usage Examples

### Start Server
```
/preview start

Response:
ðŸš€ Starting preview...
   Port: 3000
   Type: Next.js

âœ… Preview ready!
   URL: http://localhost:3000
```

### Status Check
```
/preview

Response:
=== Preview Status ===

ðŸŒ URL: http://localhost:3000
ðŸ“ Project: C:/projects/my-app
ðŸ·ï¸ Type: nextjs
ðŸ’š Health: OK
```

### Port Conflict
```
/preview start

Response:
âš ï¸ Port 3000 is in use.

Options:
1. Start on port 3001
2. Close app on 3000
3. Specify different port

Which one? (default: 1)
```

---

## Technical

Auto preview uses `auto_preview.py` script:

```bash
python ~/.claude/scripts/auto_preview.py start [path] [port]
python ~/.claude/scripts/auto_preview.py stop
python ~/.claude/scripts/auto_preview.py status
```

