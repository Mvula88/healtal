import { Page } from '@playwright/test';

export class AuthHelper {
  constructor(private page: Page) {}

  async login(email: string, password: string) {
    await this.page.goto('/login');
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await this.page.waitForURL('**/dashboard', { timeout: 10000 });
  }

  async signup(email: string, password: string, fullName: string) {
    await this.page.goto('/signup');
    await this.page.fill('input[placeholder*="Full name"]', fullName);
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    await this.page.fill('input[placeholder*="Confirm password"]', password);
    await this.page.click('button[type="submit"]');
    
    // Wait for navigation
    await this.page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 10000 });
  }

  async logout() {
    // Click on user menu/avatar
    await this.page.click('[data-testid="user-menu"], button:has-text("Logout"), button:has-text("Sign out")');
    await this.page.waitForURL('**/login', { timeout: 5000 });
  }

  async isLoggedIn(): Promise<boolean> {
    // Check if we're on a protected page
    const url = this.page.url();
    return url.includes('/dashboard') || url.includes('/coach') || url.includes('/wellness');
  }
}