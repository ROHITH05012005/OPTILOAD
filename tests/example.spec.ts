import { test, expect } from '@playwright/test';

// Sample test to verify Playwright is configured correctly
test('example.com has correct title', async ({ page }) => {
  // Set page content directly to avoid external network
  await page.setContent('<!DOCTYPE html><html><head><title>Example Domain</title></head><body></body></html>');

  // Expect the page title to contain "Example Domain"
  await expect(page).toHaveTitle(/Example Domain/);
});
