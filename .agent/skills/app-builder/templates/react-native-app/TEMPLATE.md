> **MANDATORIO: Siempre responde en ESPAÑOL**

---
name: react-native-app
description: React Native mobile app template principles. Expo, TypeScript, navigation.
---

# React Native App Template

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | React Native + Expo |
| Language | TypeScript |
| Navigation | Expo Router |
| State | Zustand + React Query |
| Styling | NativeWind |
| Testing | Jest + RNTL |

---

## Directory Structure

```
project-name/
â”œâ”€â”€ app/                 # Expo Router (file-based)
â”‚   â”œâ”€â”€ _layout.tsx      # Root layout
â”‚   â”œâ”€â”€ index.tsx        # Home
â”‚   â”œâ”€â”€ (tabs)/          # Tab navigation
â”‚   â””â”€â”€ [id].tsx         # Dynamic route
â”œâ”€â”€ components/
â”‚   â”œâ”€â”€ ui/              # Reusable
â”‚   â””â”€â”€ features/
â”œâ”€â”€ hooks/
â”œâ”€â”€ lib/
â”‚   â”œâ”€â”€ api.ts
â”‚   â””â”€â”€ storage.ts
â”œâ”€â”€ store/
â”œâ”€â”€ constants/
â””â”€â”€ app.json
```

---

## Navigation Patterns

| Pattern | Use |
|---------|-----|
| Stack | Page hierarchy |
| Tabs | Bottom navigation |
| Drawer | Side menu |
| Modal | Overlay screens |

---

## State Management

| Type | Tool |
|------|------|
| Local | Zustand |
| Server | React Query |
| Forms | React Hook Form |
| Storage | Expo SecureStore |

---

## Key Packages

| Package | Purpose |
|---------|---------|
| expo-router | File-based routing |
| zustand | Local state |
| @tanstack/react-query | Server state |
| nativewind | Tailwind styling |
| expo-secure-store | Secure storage |

---

## Setup Steps

1. `npx create-expo-app {{name}} -t expo-template-blank-typescript`
2. `npx expo install expo-router react-native-safe-area-context`
3. Install state: `npm install zustand @tanstack/react-query`
4. `npx expo start`

---

## Best Practices

- Expo Router for navigation
- Zustand for local, React Query for server state
- NativeWind for consistent styling
- Expo SecureStore for tokens
- Test on both iOS and Android

