> **MANDATORIO: Siempre responde en ESPAÑOL**

# AGENTS.md - Libraries (lib/)

Este archivo define las reglas específicas para trabajar en el directorio `lib/` (librerías compartidas).

---

## 🎯 Contexto

El directorio `lib/` contiene todas las librerías compartidas y utilidades que se usan en toda la aplicación.

---

## 📁 Estructura

```
lib/
├── supabase/            # Clientes y utilidades de Supabase
│   ├── client.ts        # Cliente browser
│   ├── server.ts        # Cliente server
│   ├── middleware.ts    # Middleware de auth
│   └── types.ts         # Tipos TypeScript
├── ai/                  # Servicios de IA (Gemini)
│   ├── vertex-client.ts # Cliente Vertex AI
│   ├── prompts.ts       # Prompts del sistema
│   └── memory.ts        # Sistema de memoria vectorial
├── trading/             # APIs de trading
│   ├── binance.ts       # Cliente Binance
│   ├── yahoo-finance.ts # Cliente Yahoo Finance
│   ├── iol-argentina.ts # Cliente IOL Argentina
│   └── analysis.ts      # Análisis de mercado
└── design/              # Utilidades de diseño
    └── stitch-parser.ts # Parser de Google Stitch
```

---

## 🛠️ Reglas Específicas

### Supabase Client
- `client.ts`: Cliente para browser (usar en Client Components)
- `server.ts`: Cliente para server (usar en Server Components/Actions)
- `middleware.ts`: Middleware para autenticación
- `types.ts`: Tipos generados de Supabase

### AI Services (Gemini)
- Usar Google Vertex AI (Gemini 2.0)
- Implementar rate limiting
- Cachear respuestas cuando sea posible
- Usar embeddings para búsqueda semántica

### Trading APIs
- Binance: Crypto trading (ccxt)
- Yahoo Finance: Stocks y ETFs
- IOL Argentina: Mercado argentino (BYMA)
- Implementar error handling robusto

---

## 🔄 Flujo de Trabajo

### Para Crear Nueva Librería
1. Crear directorio en `lib/`
2. Crear archivo principal con exports
3. Definir tipos TypeScript
4. Implementar lógica con error handling
5. Agregar tests en `tests/lib/`
6. Documentar uso

### Para Modificar Librería Existente
1. Leer código existente
2. Identificar dependencias
3. Mantener backward compatibility
4. Agregar tests si hay cambios de lógica
5. Actualizar documentación

---

## 🚫 Prohibiciones

- ❌ NO exponer secrets o API keys
- ❌ NO usar `any` en TypeScript
- ❌ NO omitir error handling
- ❌ NO hacer commits sin tests
- ❌ NO mezclar cliente y server en mismo archivo

---

## ✅ Requisitos Obligatorios

- [ ] TypeScript estricto
- [ ] Error handling robusto
- [ ] Tests para lógica compleja
- [ ] Documentación de uso
- [ ] Separación de concerns (client vs server)

---

## 📖 Referencias

- Supabase JS: https://supabase.com/docs/reference/javascript
- Vertex AI: https://cloud.google.com/vertex-ai
- ccxt: https://docs.ccxt.com
