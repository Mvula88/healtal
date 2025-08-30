import { test, expect } from '@playwright/test';

test.describe('Public Pages', () => {
  test('landing page should load with all sections', async ({ page }) => {
    await page.goto('/');
    
    // Hero section - check for actual content
    await expect(page.locator('text=/Understand Your Deeper Patterns/i').first()).toBeVisible();
    
    // Features section - check for actual features
    await expect(page.locator('text=/Root Cause Analysis/i')).toBeVisible();
    await expect(page.locator('text=/Pattern Discovery/i')).toBeVisible();
    
    // CTA buttons
    await expect(page.locator('text=/Get Started|Start Your Journey/i').first()).toBeVisible();
  });

  test('about page should load', async ({ page }) => {
    await page.goto('/about');
    
    await expect(page.locator('h1, h2').filter({ hasText: /About/i }).first()).toBeVisible();
    await expect(page.locator('text=/mission|vision|story/i').first()).toBeVisible();
  });

  test('features page should display all features', async ({ page }) => {
    await page.goto('/features');
    
    await expect(page.locator('h1, h2').filter({ hasText: /Features/i }).first()).toBeVisible();
    
    // Check for feature cards
    const featureCards = page.locator('.card, [class*="card"]');
    const count = await featureCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('pricing page should show pricing tiers', async ({ page }) => {
    await page.goto('/pricing');
    
    await expect(page.locator('h1, h2').filter({ hasText: /Pricing/i }).first()).toBeVisible();
    
    // Check for pricing tiers
    await expect(page.locator('text=/Free|Explore|Transform/i').first()).toBeVisible();
    
    // Check for price display
    await expect(page.locator('text=/$\\d+|Free/').first()).toBeVisible();
  });

  test('contact page should have contact form', async ({ page }) => {
    await page.goto('/contact');
    
    // Check for page title - "Get in Touch" is the actual heading
    await expect(page.locator('h1').filter({ hasText: /Get in Touch/i }).first()).toBeVisible();
    
    // Check for form fields
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('textarea').first()).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('help page should load', async ({ page }) => {
    await page.goto('/help');
    
    await expect(page.locator('h1, h2').filter({ hasText: /Help|Support/i }).first()).toBeVisible();
    
    // Check for FAQ or help content
    const helpContent = page.locator('text=/FAQ|How|What|Why/i');
    const count = await helpContent.count();
    expect(count).toBeGreaterThan(0);
  });

  test('privacy page should load', async ({ page }) => {
    await page.goto('/privacy');
    
    await expect(page.locator('h1, h2').filter({ hasText: /Privacy/i }).first()).toBeVisible();
    await expect(page.locator('text=/data|information|collect/i').first()).toBeVisible();
  });

  test('resources page should display resources', async ({ page }) => {
    await page.goto('/resources');
    
    await expect(page.locator('h1, h2').filter({ hasText: /Resources/i }).first()).toBeVisible();
    
    // Check for resource items
    const resources = page.locator('.card, [class*="card"], article');
    const count = await resources.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Responsive Design', () => {
  test('should be mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check mobile menu button is visible
    const mobileMenuButton = page.locator('button[aria-label*="menu"], button:has(svg)').first();
    await expect(mobileMenuButton).toBeVisible();
    
    // Check that content is still accessible
    await expect(page.locator('text=/Transform|InnerRoot|Healtal/i').first()).toBeVisible();
  });

  test('should be tablet responsive', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    // Content should be visible
    await expect(page.locator('h1, h2').first()).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
  });
});