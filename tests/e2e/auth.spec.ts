import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth.helper';
import { testUsers } from './fixtures/test-data';

test.describe('Authentication', () => {
  test('should load the landing page', async ({ page }) => {
    await page.goto('/');
    
    // Check for key landing page elements
    await expect(page).toHaveTitle(/InnerRoot|Healtal/i);
    // Use first() to handle multiple matching elements
    await expect(page.locator('text=/Get Started|Start Your Journey/i').first()).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=/Login|Sign In/i');
    
    await expect(page).toHaveURL('/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=/Sign Up|Get Started|Start Your Journey/i');
    
    await expect(page).toHaveURL(/\/(signup|get-started)/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    // Use first() to handle multiple password fields
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test('should show error for invalid login', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Wait for error message
    await expect(page.locator('text=/Invalid|Error|Failed/i')).toBeVisible({ timeout: 5000 });
  });

  test('should redirect to login when accessing protected route', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });

  test('should show password requirements on signup', async ({ page }) => {
    await page.goto('/signup');
    
    // Focus on password field
    await page.focus('input[type="password"]');
    
    // Check for password requirements text
    const passwordReqs = page.locator('text=/8 characters|uppercase|lowercase|number/i');
    
    // At least one requirement should be visible
    const count = await passwordReqs.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Protected Routes', () => {
  const protectedRoutes = [
    '/dashboard',
    '/coach',
    '/wellness',
    '/journeys',
    '/settings',
    '/tools',
    '/checkin'
  ];

  protectedRoutes.forEach(route => {
    test(`should redirect ${route} to login when not authenticated`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL('/login');
    });
  });
});

test.describe('Navigation', () => {
  test('should navigate between public pages', async ({ page }) => {
    // Test direct navigation to public pages
    await page.goto('/about');
    await expect(page).toHaveURL('/about');
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    await page.goto('/features');
    await expect(page).toHaveURL('/features');
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    await page.goto('/pricing');
    await expect(page).toHaveURL('/pricing');
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    await page.goto('/contact');
    await expect(page).toHaveURL('/contact');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('footer links should work', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Test Privacy Policy
    const privacyLink = page.locator('footer').locator('text=/Privacy/i');
    if (await privacyLink.isVisible()) {
      await privacyLink.click();
      await expect(page).toHaveURL('/privacy');
    }
  });
});