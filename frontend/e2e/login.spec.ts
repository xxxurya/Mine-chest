import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  const validUser = {
    username: 'testuser',
    password: 'testpass123',
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.locator('h2')).toContainText(/login/i);
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation error for empty fields', async ({ page }) => {
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Missing required fields')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // First register a user via API
    await page.request.post('http://localhost:3000/register', {
      data: {
        username: validUser.username,
        password: validUser.password,
        role: 'WORKER',
      },
    });

    // Now try to login
    await page.fill('input[name="username"]', validUser.username);
    await page.fill('input[name="password"]', validUser.password);
    await page.click('button[type="submit"]');

    // Should redirect to home/dashboard
    await expect(page).toHaveURL(/(\/|\/dashboard|\/mytasks)/, { timeout: 10000 });
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[name="username"]', 'nonexistent');
    await page.fill('input[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible({ timeout: 5000 });
  });

  test('should have link to register page', async ({ page }) => {
    const registerLink = page.locator('a[href="/register"]');
    await expect(registerLink).toBeVisible();
  });
});
