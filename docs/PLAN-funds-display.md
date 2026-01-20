# Plan de Implementación: Visualización de Fondos y Liquidez (IOL)

## 1. Análisis Técnico
- [ ] **API IOL**: Investigar el endpoint para obtener el saldo en efectivo (ARS/USD). El endpoint `/EstadodeCuenta` suele ser el indicado en IOL.
- [ ] **Acciones de Servidor**: Actualizar `getDetailedPortfolio` en `actions/trading.ts` para que incluya un campo `liquidity` o `cash`.
- [ ] **Interfaz (UI)**: 
    - Modificar la tarjeta de "Valor del Portafolio" para mostrar el "Patrimonio Total".
    - Añadir un desglose de "Dinero Disponible" en el componente del Dashboard.

## 2. Implementación (Fase 2 - Paralelo)

### A. Backend Specialist
- Actualizar `lib/trading/iol-client.ts` con el método `getAccountState()`.
- Modificar `actions/trading.ts` -> `getDetailedPortfolio()` para integrar el saldo en efectivo.
- Asegurar que el `getDashboardStats()` sume el efectivo al valor total.

### B. Frontend Specialist
- Actualizar `app/dashboard/page.tsx`:
    - Cambiar label de "Valor del Portafolio" a "Patrimonio Total".
    - Añadir sección de "Saldos Disponibles" (ARS/USD/USDT).
    - Mejorar el gráfico de distribución para incluir el % de liquidez.

### C. Test Engineer
- Validar el mapeo correcto de los saldos desde la API.
- Ejecutar `lint_runner.py` para asegurar que los cambios en los tipos no rompan el build.

## 3. Verificación
- Comprobar en Vercel que los saldos se actualizan al sincronizar.
- Verificar que el cálculo de Patrimonio = Inversiones + Efectivo sea exacto.
