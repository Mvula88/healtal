import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load and display main elements', async ({ page }) => {
    await page.goto('/')
    
    // Check main heading
    await expect(page.locator('h1')).toContainText('You deserve to be')
    
    // Check CTA buttons exist
    await expect(page.locator('text=Start Today')).toBeVisible()
    await expect(page.locator('text=How it works')).toBeVisible()
    
    // Check stats section exists
    await expect(page.locator('text=Active Users')).toBeVisible()
    await expect(page.locator('text=AI Support')).toBeVisible()
  })
  
  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Start Today')
    await expect(page).toHaveURL('/signup')
  })
  
  test('should display pricing plans', async ({ page }) => {
    await page.goto('/')
    
    // Check all three pricing tiers
    await expect(page.locator('text=Starter')).toBeVisible()
    await expect(page.locator('text=Growth')).toBeVisible()
    await expect(page.locator('text=Premium')).toBeVisible()
    
    // Check prices
    await expect(page.locator('text=$19')).toBeVisible()
    await expect(page.locator('text=$39')).toBeVisible()
    await expect(page.locator('text=$79')).toBeVisible()
  })
})

test.describe('Navigation', () => {
  test('should have working navigation links', async ({ page }) => {
    await page.goto('/')
    
    // Test navigation links
    const links = [
      { text: 'Features', url: '/features' },
      { text: 'Pricing', url: '/pricing' },
      { text: 'About', url: '/about' },
      { text: 'Resources', url: '/resources' }
    ]
    
    for (const link of links) {
      const element = page.locator(`a:has-text("${link.text}")`)
      if (await element.isVisible()) {
        await element.click()
        await expect(page).toHaveURL(link.url)
        await page.goBack()
      }
    }
  })
})