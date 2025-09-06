import { test, expect } from '@playwright/test'

test.describe('ChainWise AI Chat', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to chat page (assuming auth is handled in beforeEach or by setting up test user)
    await page.goto('/chat')
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle')
  })

  test.describe('Initial State', () => {
    test('should display ChainWise AI title', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('ChainWise AI')
    })

    test('should show persona selector on first visit', async ({ page }) => {
      await expect(page.locator('text=Choose Your AI Persona')).toBeVisible()
    })

    test('should display credit balance', async ({ page }) => {
      await expect(page.locator('text=Credits')).toBeVisible()
    })

    test('should show all three persona options', async ({ page }) => {
      await expect(page.locator('text=Crypto Buddy')).toBeVisible()
      await expect(page.locator('text=Crypto Professor')).toBeVisible()
      await expect(page.locator('text=Crypto Trader')).toBeVisible()
    })
  })

  test.describe('Persona Selection', () => {
    test('should allow selecting Crypto Buddy persona', async ({ page }) => {
      await page.click('button:has-text("Crypto Buddy")')
      
      // Wait for welcome message
      await expect(page.locator('text=Hey there!')).toBeVisible()
      
      // Check that persona is active
      await expect(page.locator('text=Connected to Crypto Buddy')).toBeVisible()
    })

    test('should allow selecting Crypto Professor persona', async ({ page }) => {
      await page.click('button:has-text("Crypto Professor")')
      
      // Wait for welcome message
      await expect(page.locator('text=Greetings')).toBeVisible()
      
      // Check that persona is active
      await expect(page.locator('text=Connected to Crypto Professor')).toBeVisible()
    })

    test('should show upgrade prompt for Crypto Trader on free tier', async ({ page }) => {
      // Assuming user is on free tier, trader should show upgrade message
      const traderCard = page.locator('button:has-text("Crypto Trader")')
      await expect(traderCard.locator('text=Available in Elite plan')).toBeVisible()
    })

    test('should switch personas mid-conversation', async ({ page }) => {
      // Start with Buddy
      await page.click('button:has-text("Crypto Buddy")')
      await expect(page.locator('text=Connected to Crypto Buddy')).toBeVisible()

      // Send a message
      await page.fill('textarea[placeholder*="Ask me anything"]', 'What is Bitcoin?')
      await page.click('button[title*="Send"]')
      
      // Wait for response
      await page.waitForSelector('text=Bitcoin', { timeout: 10000 })

      // Switch to Professor
      await page.click('button:has-text("Switch Persona")')
      await page.click('button:has-text("Crypto Professor")')
      
      // Verify switch
      await expect(page.locator('text=Connected to Crypto Professor')).toBeVisible()
    })
  })

  test.describe('Chat Functionality', () => {
    test.beforeEach(async ({ page }) => {
      // Select Buddy persona for chat tests
      await page.click('button:has-text("Crypto Buddy")')
      await expect(page.locator('text=Connected to Crypto Buddy')).toBeVisible()
    })

    test('should send and receive messages', async ({ page }) => {
      const testMessage = 'What is cryptocurrency?'
      
      // Type message
      await page.fill('textarea[placeholder*="Ask me anything"]', testMessage)
      
      // Send message
      await page.click('button:has-text("Send")')
      
      // Verify user message appears
      await expect(page.locator(`text=${testMessage}`)).toBeVisible()
      
      // Wait for AI response (with generous timeout)
      await page.waitForSelector('text=I', { timeout: 15000 })
      
      // Verify typing indicator appears and disappears
      await expect(page.locator('text=is thinking')).toBeVisible()
      await expect(page.locator('text=is thinking')).not.toBeVisible({ timeout: 15000 })
    })

    test('should handle empty messages', async ({ page }) => {
      // Try to send empty message
      const sendButton = page.locator('button:has-text("Send")')
      await expect(sendButton).toBeDisabled()
      
      // Type whitespace only
      await page.fill('textarea[placeholder*="Ask me anything"]', '   ')
      await expect(sendButton).toBeDisabled()
    })

    test('should display timestamps on messages', async ({ page }) => {
      await page.fill('textarea[placeholder*="Ask me anything"]', 'Test message')
      await page.click('button:has-text("Send")')
      
      // Look for timestamp format (HH:MM)
      await expect(page.locator('text=/\\d{1,2}:\\d{2}/')).toBeVisible()
    })

    test('should auto-resize textarea', async ({ page }) => {
      const textarea = page.locator('textarea[placeholder*="Ask me anything"]')
      
      // Get initial height
      const initialHeight = await textarea.evaluate(el => el.offsetHeight)
      
      // Fill with multiple lines
      await textarea.fill('Line 1\nLine 2\nLine 3\nLine 4')
      
      // Check height increased
      const newHeight = await textarea.evaluate(el => el.offsetHeight)
      expect(newHeight).toBeGreaterThan(initialHeight)
    })
  })

  test.describe('Credit System', () => {
    test('should display credit balance', async ({ page }) => {
      const creditDisplay = page.locator('text=Credits')
      await expect(creditDisplay).toBeVisible()
      
      // Should show numeric balance
      await expect(page.locator('text=/\\d+/')).toBeVisible()
    })

    test('should prevent sending when insufficient credits', async ({ page }) => {
      // This test assumes a scenario where credits are insufficient
      // In real implementation, you'd set up a test user with 0 credits
      
      await page.click('button:has-text("Crypto Buddy")')
      
      // If credits are insufficient, input should show warning
      await page.fill('textarea[placeholder*="Ask me anything"]', 'Test message')
      
      // Check for credit warning if applicable
      const warningExists = await page.locator('text=Need').isVisible()
      if (warningExists) {
        await expect(page.locator('button:has-text("Send")')).toBeDisabled()
      }
    })

    test('should show credit purchase options', async ({ page }) => {
      // Click on credit display
      await page.click('text=Credits')
      
      // Should show purchase options
      await expect(page.locator('text=Purchase Credits')).toBeVisible()
      await expect(page.locator('text=50 Credits')).toBeVisible()
      await expect(page.locator('text=200 Credits')).toBeVisible()
      await expect(page.locator('text=500 Credits')).toBeVisible()
    })
  })

  test.describe('Session Management', () => {
    test('should create new chat sessions', async ({ page }) => {
      // Start first session
      await page.click('button:has-text("Crypto Buddy")')
      
      // Open sidebar
      await page.click('button[title*="Menu"]')
      
      // Create new session
      await page.click('button:has-text("New Chat")')
      
      // Should show persona selector again
      await expect(page.locator('text=Choose Your AI Persona')).toBeVisible()
    })

    test('should display session history', async ({ page }) => {
      // Start a session and send a message
      await page.click('button:has-text("Crypto Buddy")')
      await page.fill('textarea[placeholder*="Ask me anything"]', 'Hello')
      await page.click('button:has-text("Send")')
      
      // Wait for response
      await page.waitForSelector('text=Hello', { timeout: 10000 })
      
      // Open sidebar
      await page.click('button[title*="Menu"]')
      
      // Should show session in history
      await expect(page.locator('text=Today')).toBeVisible()
      await expect(page.locator('text=New Chat')).toBeVisible()
    })

    test('should allow session switching', async ({ page }) => {
      // Create two sessions with different personas
      await page.click('button:has-text("Crypto Buddy")')
      await page.fill('textarea[placeholder*="Ask me anything"]', 'Buddy message')
      await page.click('button:has-text("Send")')
      
      // Create new session with Professor
      await page.click('button:has-text("Switch Persona")')
      await page.click('button:has-text("Crypto Professor")')
      
      // Open sidebar and verify sessions
      await page.click('button[title*="Menu"]')
      await expect(page.locator('text=Today')).toBeVisible()
    })

    test('should allow deleting sessions', async ({ page }) => {
      // Create a session
      await page.click('button:has-text("Crypto Buddy")')
      await page.fill('textarea[placeholder*="Ask me anything"]', 'Test message')
      await page.click('button:has-text("Send")')
      
      // Open sidebar
      await page.click('button[title*="Menu"]')
      
      // Hover over session to reveal delete button
      const sessionItem = page.locator('text=New Chat').first()
      await sessionItem.hover()
      
      // Click delete button
      await page.click('button[title="Delete"]')
      
      // Session should be removed
      await expect(page.locator('text=No chat sessions yet')).toBeVisible()
    })
  })

  test.describe('Command System', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('button:has-text("Crypto Buddy")')
    })

    test('should show commands palette', async ({ page }) => {
      // Click commands button
      await page.click('button[title="Show commands"]')
      
      // Should show command palette
      await expect(page.locator('text=Quick Commands')).toBeVisible()
      await expect(page.locator('text=/portfolio')).toBeVisible()
      await expect(page.locator('text=/price')).toBeVisible()
    })

    test('should insert commands', async ({ page }) => {
      const textarea = page.locator('textarea[placeholder*="Ask me anything"]')
      
      // Click commands button
      await page.click('button[title="Show commands"]')
      
      // Click a command
      await page.click('text=/portfolio')
      
      // Command should be inserted
      await expect(textarea).toHaveValue('/portfolio ')
    })

    test('should trigger commands with slash', async ({ page }) => {
      const textarea = page.locator('textarea[placeholder*="Ask me anything"]')
      
      // Type slash
      await textarea.fill('/')
      
      // Commands palette should appear
      await expect(page.locator('text=Quick Commands')).toBeVisible()
    })
  })

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      
      // Should still show main elements
      await expect(page.locator('text=ChainWise AI')).toBeVisible()
      await expect(page.locator('text=Choose Your AI Persona')).toBeVisible()
      
      // Sidebar should be hidden initially
      await expect(page.locator('text=Chat Sessions')).not.toBeVisible()
      
      // Menu button should be visible
      await expect(page.locator('button[title*="Menu"]')).toBeVisible()
    })

    test('should handle tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      
      // All elements should be properly sized
      await expect(page.locator('text=ChainWise AI')).toBeVisible()
      await page.click('button:has-text("Crypto Buddy")')
      
      // Input should be appropriately sized
      const textarea = page.locator('textarea[placeholder*="Ask me anything"]')
      await expect(textarea).toBeVisible()
    })
  })

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      await page.click('button:has-text("Crypto Buddy")')
      
      // Simulate network failure
      await page.route('**/api/chat', route => route.abort())
      
      // Try to send message
      await page.fill('textarea[placeholder*="Ask me anything"]', 'Test message')
      await page.click('button:has-text("Send")')
      
      // Should show error message
      await expect(page.locator('text=encountered an error')).toBeVisible({ timeout: 10000 })
    })

    test('should handle API errors', async ({ page }) => {
      await page.click('button:has-text("Crypto Buddy")')
      
      // Mock API error response
      await page.route('**/api/chat', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' })
        })
      })
      
      // Try to send message
      await page.fill('textarea[placeholder*="Ask me anything"]', 'Test message')
      await page.click('button:has-text("Send")')
      
      // Should show error
      await expect(page.locator('text=encountered an error')).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels', async ({ page }) => {
      await expect(page.locator('textarea[placeholder*="Ask me anything"]')).toHaveAttribute('aria-label', /.+/)
      await expect(page.locator('button:has-text("Send")')).toHaveAttribute('aria-label', /.+/)
    })

    test('should support keyboard navigation', async ({ page }) => {
      // Tab through interface elements
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      
      // Should be able to interact with focused element
      await page.keyboard.press('Enter')
    })

    test('should have proper color contrast', async ({ page }) => {
      // This would require actual color contrast checking
      // For now, just verify text is visible
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.locator('text=Choose Your AI Persona')).toBeVisible()
    })
  })
})