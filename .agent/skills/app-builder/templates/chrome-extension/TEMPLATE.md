> **MANDATORIO: Siempre responde en ESPAÑOL**

---
name: chrome-extension
description: Chrome Extension template principles. Manifest V3, React, TypeScript.
---

# Chrome Extension Template

## Tech Stack

| Component | Technology |
|-----------|------------|
| Manifest | V3 |
| UI | React 18 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Bundler | Vite |
| Storage | Chrome Storage API |

---

## Directory Structure

```
project-name/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ popup/           # Extension popup
â”‚   â”œâ”€â”€ options/         # Options page
â”‚   â”œâ”€â”€ background/      # Service worker
â”‚   â”œâ”€â”€ content/         # Content scripts
â”‚   â”œâ”€â”€ components/
â”‚   â”œâ”€â”€ hooks/
â”‚   â””â”€â”€ lib/
â”‚       â”œâ”€â”€ storage.ts   # Chrome storage helpers
â”‚       â””â”€â”€ messaging.ts # Message passing
â”œâ”€â”€ public/
â”‚   â”œâ”€â”€ icons/
â”‚   â””â”€â”€ manifest.json
â””â”€â”€ package.json
```

---

## Manifest V3 Concepts

| Component | Purpose |
|-----------|---------|
| Service Worker | Background processing |
| Content Scripts | Page injection |
| Popup | User interface |
| Options Page | Settings |

---

## Permissions

| Permission | Use |
|------------|-----|
| storage | Save user data |
| activeTab | Current tab access |
| scripting | Inject scripts |
| host_permissions | Site access |

---

## Setup Steps

1. `npm create vite {{name}} -- --template react-ts`
2. Add Chrome types: `npm install -D @types/chrome`
3. Configure Vite for multi-entry
4. Create manifest.json
5. `npm run dev` (watch mode)
6. Load in Chrome: `chrome://extensions` â†’ Load unpacked

---

## Development Tips

| Task | Method |
|------|--------|
| Debug Popup | Right-click icon â†’ Inspect |
| Debug Background | Extensions page â†’ Service worker |
| Debug Content | DevTools console on page |
| Hot Reload | `npm run dev` with watch |

---

## Best Practices

- Use type-safe messaging
- Wrap Chrome APIs in promises
- Minimize permissions
- Handle offline gracefully

