import { test, expect } from '@playwright/test'

test.describe('Thomas Settings Functionality', () => {
    test.beforeEach(async ({ page }) => {
        page.on('console', msg => console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`))
        await page.goto('/settings')
        // Esperar a que el spinner desaparezca y cargue el contenido
        await expect(page.locator('h2')).toBeVisible()
    })

    test('should load settings page correctly', async ({ page }) => {
        await expect(page.locator('h2')).toContainText('Configuración')
    })

    test('should verify if settings persist after reload', async ({ page }) => {
        // 1. Modificar valores
        const riskSelect = page.locator('select')
        await riskSelect.selectOption('conservative')

        const maxAmountInput = page.locator('input[type="number"]').nth(0)
        await maxAmountInput.fill('5000')

        const stopLossInput = page.locator('input[type="number"]').nth(1)
        await stopLossInput.fill('7.5')

        const takeProfitInput = page.locator('input[type="number"]').nth(2)
        await takeProfitInput.fill('12.5')

        // 2. Guardar
        await page.click('text=Guardar Configuración')

        // Esperar a que el botón vuelva a su estado original (terminó de guardar)
        await expect(page.locator('text=Guardar Configuración')).toBeVisible()
        await page.waitForTimeout(3000)

        // 3. Recargar página para verificar persistencia real
        await page.reload()
        await expect(page.locator('h2')).toBeVisible()

        // 4. Verificar valores (Este test fallará en la implementación actual)
        await expect(riskSelect).toHaveValue('conservative')
        await expect(maxAmountInput).toHaveValue('5000')
        await expect(stopLossInput).toHaveValue('7.5')
        await expect(takeProfitInput).toHaveValue('12.5')
    })
})
