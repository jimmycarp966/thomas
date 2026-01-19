import { test, expect } from '@playwright/test'

test.describe('ZenTrade AI Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('homepage redirects to dashboard', async ({ page }) => {
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('dashboard loads correctly', async ({ page }) => {
    await expect(page.locator('h2')).toContainText('Resumen del Dashboard')
    await expect(page.locator('text=Valor del Portafolio')).toBeVisible()
  })

  test('sidebar navigation works', async ({ page }) => {
    await page.click('text=Trades')
    await expect(page).toHaveURL(/\/trading/)
    
    await page.click('text=Analítica')
    await expect(page).toHaveURL(/\/analytics/)
    
    await page.click('text=Chat IA')
    await expect(page).toHaveURL(/\/chat/)
    
    await page.click('text=Bienestar')
    await expect(page).toHaveURL(/\/wellness/)
    
    await page.click('text=Configuración')
    await expect(page).toHaveURL(/\/settings/)
  })

  test('chat page loads', async ({ page }) => {
    await page.goto('/chat')
    await expect(page.locator('h2')).toContainText('Asistente de Chat IA')
    await expect(page.locator('input[placeholder*="Escribe"]')).toBeVisible()
  })

  test('wellness page loads', async ({ page }) => {
    await page.goto('/wellness')
    await expect(page.locator('h2')).toContainText('Tracker de Bienestar')
    await expect(page.locator('text=Puntuación de Bienestar')).toBeVisible()
  })

  test('trading page loads', async ({ page }) => {
    await page.goto('/trading')
    await expect(page.locator('h2')).toContainText('Trading')
    await expect(page.locator('text=New Trade')).toBeVisible()
  })

  test('analytics page loads', async ({ page }) => {
    await page.goto('/analytics')
    await expect(page.locator('h2')).toContainText('Analítica')
  })

  test('settings page loads', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.locator('h2')).toContainText('Configuración')
  })
})

test.describe('Chat Functionality', () => {
  test('chat input works', async ({ page }) => {
    await page.goto('/chat')
    const input = page.locator('input[placeholder*="Escribe"]')
    await input.fill('Hola')
    await expect(input).toHaveValue('Hola')
  })
})

test.describe('Wellness Tracker', () => {
  test('wellness inputs work', async ({ page }) => {
    await page.goto('/wellness')
    
    const fastingInput = page.locator('input[type="number"]').first()
    await fastingInput.fill('12')
    await expect(fastingInput).toHaveValue('12')
  })
})
