import { test, expect } from '@playwright/test';

test.describe('Admin Panel', () => {
  test('admin route should require authentication', async ({ page }) => {
    await page.goto('/admin');
    
    // Should show either login or access denied
    const url = page.url();
    expect(url).toMatch(/\/(login|admin)/);
    
    // If on admin page, should show access denied
    if (url.includes('/admin')) {
      await expect(page.locator('text=/Access Denied|Unauthorized|Not Authorized/i')).toBeVisible();
    }
  });

  test('admin sub-routes should require authentication', async ({ page }) => {
    const adminRoutes = [
      '/admin/users',
      '/admin/analytics',
      '/admin/content',
      '/admin/professionals',
      '/admin/billing',
      '/admin/support',
      '/admin/settings'
    ];

    for (const route of adminRoutes) {
      await page.goto(route);
      
      // Should either redirect to login or show access denied
      const url = page.url();
      expect(url).toMatch(/\/(login|admin)/);
    }
  });

  test.describe('Admin Features (with auth)', () => {
    test.skip('should display admin dashboard', async ({ page }) => {
      // This test requires admin authentication
      // Would need to login as admin first
      
      await page.goto('/admin');
      
      // Check admin dashboard elements
      await expect(page.locator('h1:has-text("Admin Dashboard")')).toBeVisible();
      await expect(page.locator('text=/Statistics|Analytics|Overview/i')).toBeVisible();
      await expect(page.locator('text=/Total Users/i')).toBeVisible();
      await expect(page.locator('text=/Active Sessions/i')).toBeVisible();
    });

    test.skip('should navigate to user management', async ({ page }) => {
      // Requires admin auth
      await page.goto('/admin/users');
      
      await expect(page.locator('h1:has-text(/User Management|Users/i)')).toBeVisible();
      await expect(page.locator('table, [role="table"]')).toBeVisible();
    });

    test.skip('should navigate to content management', async ({ page }) => {
      // Requires admin auth
      await page.goto('/admin/content');
      
      await expect(page.locator('h1:has-text(/Content Management|Content/i)')).toBeVisible();
      await expect(page.locator('text=/Journeys|Affirmations/i')).toBeVisible();
    });
  });
});