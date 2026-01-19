import { test, expect } from '@playwright/test'

test.describe('Centro de Control Integral', () => {
    test.beforeEach(async ({ page }) => {
        // Ir al dashboard primero
        await page.goto('http://localhost:3000/dashboard')
        await page.waitForLoadState('networkidle')
    })

    test('El header global muestra el icono de notificaciones', async ({ page }) => {
        // Verificar que el NotificationCenter existe en el header
        const notificationIcon = page.locator('button:has(span.material-symbols-outlined:text("notifications"))')
        await expect(notificationIcon).toBeVisible()
    })

    test('El dropdown de notificaciones se abre al hacer clic', async ({ page }) => {
        // Hacer clic en el icono de notificaciones
        const notificationButton = page.locator('button:has(span.material-symbols-outlined:text("notifications"))').first()
        await notificationButton.click()

        // Verificar que el dropdown se abre
        await expect(page.getByText('Notificaciones')).toBeVisible()
    })

    test('El sidebar contiene el enlace al Timeline', async ({ page }) => {
        // Verificar el enlace al Timeline en el sidebar
        const timelineLink = page.locator('a[href="/activity"]')
        await expect(timelineLink).toBeVisible()
        await expect(page.getByText('Timeline')).toBeVisible()
    })

    test('La página de Trading tiene el botón de sincronización IOL', async ({ page }) => {
        // Navegar a Trading
        await page.goto('http://localhost:3000/trading')
        await page.waitForLoadState('networkidle')

        // Verificar el botón de sincronización
        await expect(page.getByText('Sincronizar IOL')).toBeVisible()

        // Verificar que muestra la última sincronización
        await expect(page.getByText('Última sincronización:')).toBeVisible()
    })

    test('La página de Activity (Timeline) se carga correctamente', async ({ page }) => {
        // Navegar al Timeline
        await page.goto('http://localhost:3000/activity')
        await page.waitForLoadState('networkidle')

        // Verificar el título
        await expect(page.getByRole('heading', { name: 'Timeline de Thomas' })).toBeVisible()

        // Verificar los filtros
        await expect(page.getByText('Todo')).toBeVisible()
        await expect(page.getByText('Trades')).toBeVisible()
        await expect(page.getByText('Análisis')).toBeVisible()
        await expect(page.getByText('Aprendizajes')).toBeVisible()
        await expect(page.getByText('Alertas')).toBeVisible()
    })

    test('Los filtros del Timeline funcionan', async ({ page }) => {
        await page.goto('http://localhost:3000/activity')
        await page.waitForLoadState('networkidle')

        // Hacer clic en el filtro de Trades
        await page.getByRole('button', { name: /Trades/ }).click()

        // El botón de Trades debería tener estilo activo (bg-primary)
        const tradesButton = page.getByRole('button', { name: /Trades/ })
        await expect(tradesButton).toHaveClass(/bg-primary/)
    })

    test('El Dashboard muestra el inventario de IOL', async ({ page }) => {
        await page.goto('http://localhost:3000/dashboard')
        await page.waitForLoadState('networkidle')

        // Verificar la sección de inventario
        await expect(page.getByText('Inventario (IOL)')).toBeVisible()
        await expect(page.getByText('REAL TIME')).toBeVisible()
    })

    test('El Dashboard muestra el gráfico de composición del portafolio', async ({ page }) => {
        await page.goto('http://localhost:3000/dashboard')
        await page.waitForLoadState('networkidle')

        // Verificar la sección de Rendimiento que ahora tiene el gráfico
        await expect(page.getByText('Rendimiento')).toBeVisible()
        await expect(page.getByText('Ganancia Neta Últimos 30 Días')).toBeVisible()
    })

    test('Navegación completa entre secciones del Centro de Control', async ({ page }) => {
        // Dashboard -> Trading
        await page.goto('http://localhost:3000/dashboard')
        await page.waitForLoadState('networkidle')

        await page.click('a[href="/trading"]')
        await page.waitForLoadState('networkidle')
        await expect(page).toHaveURL(/\/trading/)

        // Trading -> Activity
        await page.click('a[href="/activity"]')
        await page.waitForLoadState('networkidle')
        await expect(page).toHaveURL(/\/activity/)

        // Activity -> Dashboard
        await page.click('a[href="/dashboard"]')
        await page.waitForLoadState('networkidle')
        await expect(page).toHaveURL(/\/dashboard/)
    })
})
