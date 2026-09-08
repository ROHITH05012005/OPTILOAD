import { test, expect } from '@playwright/test';

// Smoke test to verify the local development server UI is up and interactive
test('Localhost UI smoke test', async ({ page }) => {
  const baseUrl = 'http://localhost:3000';
  // Retry navigation in case the dev server is still starting
  const maxAttempts = 5;
  for (let attempt = 1; attempt <= maxAttempts; ++attempt) {
    try {
      await page.goto(baseUrl, { waitUntil: 'load', timeout: 30000 });
      break; // success
    } catch (e) {
      if (attempt === maxAttempts) throw e;
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  // Basic sanity checks: URL and that the page is visible
  await expect(page).toHaveURL(`${baseUrl}/`);

  // Wait for at least one button to be visible – adjust selector if needed
  const button = page.locator('button');
  await expect(button.first()).toBeVisible({ timeout: 10000 });

  // Verify the page title exists
  const title = await page.title();
  expect(title.length).toBeGreaterThan(0);

  // Click the first button to ensure click handling works
  await button.first().click();

  // Capture a screenshot for manual inspection
  await page.screenshot({ path: 'test-results/ui-smoke.png', fullPage: true });
});
