import { test, expect } from '@playwright/test';

test.describe('Register Flow', () => {
  const newUser = {
    username: `testuser_${Date.now()}`,
    password: 'testpass123',
    role: 'WORKER',
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('should display register form', async ({ page }) => {
    await expect(page.locator('h2')).toContainText(/register/i);
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('select[name="role"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation error for empty fields', async ({ page }) => {
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Missing required fields')).toBeVisible();
  });

  test('should show validation error for invalid role', async ({ page }) => {
    await page.fill('input[name="username"]', newUser.username);
    await page.fill('input[name="password"]', newUser.password);
    // Don't select a role, or select invalid one
    await page.selectOption('select[name="role"]', 'INVALID_ROLE');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Invalid role')).toBeVisible();
  });

  test('should register successfully with valid data', async ({ page }) => {
    await page.fill('input[name="username"]', newUser.username);
    await page.fill('input[name="password"]', newUser.password);
    await page.selectOption('select[name="role"]', newUser.role);
    await page.click('button[type="submit"]');

    // Should redirect to login or show success
    await expect(page).toHaveURL(/login/, { timeout: 10000 });
    await expect(page.locator('text=User created successfully')).toBeVisible();
  });

  test('should register successfully and login', async ({ page }) => {
    // Register
    await page.fill('input[name="username"]', newUser.username);
    await page.fill('input[name="password"]', newUser.password);
    await page.selectOption('select[name="role"]', newUser.role);
    await page.click('button[type="submit"]');

    // Should redirect to login
    await expect(page).toHaveURL(/login/);

    // Login with the new user
    await page.fill('input[name="username"]', newUser.username);
    await page.fill('input[name="password"]', newUser.password);
    await page.click('button[type="submit"]');

    // Should redirect to home/dashboard
    await expect(page).toHaveURL(/(\/|\/dashboard|\/mytasks)/, { timeout: 10000 });
  });

  test('should show error for duplicate username', async ({ page }) => {
    // First register a user
    await page.fill('input[name="username"]', newUser.username);
    await page.fill('input[name="password"]', newUser.password);
    await page.selectOption('select[name="role"]', newUser.role);
    await page.click('button[type="submit"]');

    // Wait for redirect to login
    await page.waitForURL(/login/);

    // Try to register again with same username
    await page.goto('/register');
    await page.fill('input[name="username"]', newUser.username);
    await page.fill('input[name="password"]', 'anotherpass123');
    await page.selectOption('select[name="role"]', newUser.role);
    await page.click('button[type="submit"]');

    // Should show error
    await expect(page.locator('text=Username already exists')).toBeVisible({ timeout: 5000 });
  });

  test('should have link to login page', async ({ page }) => {
    const loginLink = page.locator('a[href="/login"]');
    await expect(loginLink).toBeVisible();
  });
});
