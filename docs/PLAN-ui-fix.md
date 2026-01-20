# Plan de Mejora UI/UX y Datos - Thomas Trading

## 1. Análisis de Problemas (UI Audit)
- [ ] **Iconos Rotos**: Los iconos `account_balance_wallet`, `payments`, `bolt` y `trophy` se muestran como texto plano. Probablemente falta la importación de Material Symbols o la fuente CSS en el layout principal.
- [ ] **Datos Vacíos**: El dashboard muestra $0.00. Necesitamos verificar si los server actions están fallando silenciosamente en Vercel o si simplemente el usuario no ha iniciado la carga de datos.
- [ ] **Responsive Check**: Verificar que el sidebar no se coma espacio en resoluciones menores.

## 2. Implementación (Phase 2 - Parallel)

### A. Frontend Specialist
- Corregir `app/layout.tsx` para incluir Google Fonts/Material Symbols si es necesario, o migrar esos iconos a `lucide-react` (que ya está instalado).
- Revisar `components/dashboard/SummaryCards.tsx` (o similar) para arreglar las props de los iconos.

### B. Backend Specialist
- Verificar logs de Vercel para confirmar que las llamadas a `/bCBA/Titulos/...` no están siendo bloqueadas por CORS o IP.
- Asegurar que el `auth-helper` de Supabase esté funcionando correctamente en el middleware.

### C. Test Engineer
- Ejecutar un script de prueba de conectividad desde un entorno similar al de producción.
- Validar visualmente con un screenshot post-fix.

## 3. Verificación Final
- Ejecutar `ux_audit.py`.
- Verificar carga de cotizaciones en tiempo real.
