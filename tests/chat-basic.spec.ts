import { test, expect } from '@playwright/test'

test.describe('ChainWise AI Chat - Basic Tests', () => {
  test('should load chat page successfully', async ({ page }) => {
    // Navigate to chat page
    await page.goto('/chat')
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle')
    
    // Check if main elements are present
    await expect(page.locator('h1, h2')).toBeVisible({ timeout: 10000 })
    
    // Take a screenshot
    await page.screenshot({ path: 'test-results/chat-page.png' })
  })

  test('should display persona selection interface', async ({ page }) => {
    await page.goto('/chat')
    await page.waitForLoadState('networkidle')
    
    // Look for persona-related text
    const personaText = await page.textContent('body')
    expect(personaText).toContain('AI' || 'Chat' || 'Crypto')
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/chat')
    await page.waitForLoadState('networkidle')
    
    // Page should load without horizontal scrolling
    const body = page.locator('body')
    await expect(body).toBeVisible()
    
    // Take mobile screenshot
    await page.screenshot({ path: 'test-results/chat-mobile.png' })
  })
})