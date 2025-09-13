import { test, expect } from '@playwright/test'

test.describe('ChainWise Authentication', () => {
  test('should redirect unauthenticated users to signin', async ({ page }) => {
    // Navigate to chat page
    await page.goto('/chat')
    
    // Should redirect to signin
    await expect(page).toHaveURL(/.*auth.*signin/)
    
    // Should have callback URL for chat
    expect(page.url()).toContain('callbackUrl=%2Fchat')
    
    // Take screenshot of signin page
    await page.screenshot({ path: 'test-results/signin-redirect.png' })
  })

  test('should load homepage without authentication', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle')
    
    // Should show ChainWise branding
    const content = await page.textContent('body')
    expect(content).toMatch(/ChainWise|Crypto|Portfolio|AI/i)
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/homepage.png' })
  })

  test('should show signin page elements', async ({ page }) => {
    // Navigate directly to signin
    await page.goto('/auth/signin')
    
    // Wait for load
    await page.waitForLoadState('networkidle')
    
    // Should show signin elements
    const content = await page.textContent('body')
    expect(content).toMatch(/sign|login|auth/i)
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/signin-page.png' })
  })
})