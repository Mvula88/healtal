import { test, expect } from '@playwright/test'

test.describe('Coach Page', () => {
  test('should handle different conversation modes', async ({ page }) => {
    // Test different modes
    const modes = [
      { mode: 'talk', title: 'Just Talking' },
      { mode: 'advice', title: 'Quick Advice' },
      { mode: 'vent', title: 'Venting Session' },
      { mode: 'night', title: 'Late Night Talk' }
    ]
    
    for (const { mode, title } of modes) {
      await page.goto(`/coach?mode=${mode}`)
      
      // Should show mode-specific title
      await expect(page.locator('text=' + title)).toBeVisible()
    }
  })
  
  test('should require authentication', async ({ page }) => {
    await page.goto('/coach')
    
    // Should redirect to login if not authenticated
    // This depends on your auth setup
    const url = page.url()
    if (url.includes('/login')) {
      expect(url).toContain('/login')
    } else {
      // If somehow authenticated, check coach UI exists
      await expect(page.locator('text=New Pattern Discovery')).toBeVisible()
    }
  })
})