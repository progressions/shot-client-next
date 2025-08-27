import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('homepage should load', async ({ page }) => {
    await page.goto('/');
    
    // Check for main elements
    await expect(page).toHaveTitle(/Chi War/);
    
    // Should redirect to login if not authenticated
    const url = page.url();
    expect(url).toContain('/login');
  });

  test('login page should have form elements', async ({ page }) => {
    await page.goto('/login');
    
    // Check for login form elements
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    
    // Check for registration link
    await expect(page.getByText(/create account/i)).toBeVisible();
  });

  test('register page should be accessible', async ({ page }) => {
    await page.goto('/register');
    
    // Check for registration form elements
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="passwordConfirmation"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
  });

  test('about page should load', async ({ page }) => {
    await page.goto('/about');
    
    // Check for about page content
    await expect(page).toHaveTitle(/About.*Chi War/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/About Chi War/);
  });

  test('navigation menu should be present', async ({ page }) => {
    await page.goto('/login');
    
    // Check for navigation elements
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
    
    // Check for logo/brand
    await expect(page.getByRole('link', { name: /chi war/i }).first()).toBeVisible();
  });
});